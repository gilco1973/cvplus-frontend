// Enhanced Session Manager - Advanced session state management with micro-state tracking
import { 
  EnhancedSessionState,
  FeatureState,
  ConditionalRule,
  StepProgressState,
  SubstepProgress,
  UserInteraction,
  ProcessingCheckpoint,
  UIStateSnapshot,
  ValidationStateSnapshot,
  NavigationState,
  CVStep,
  SessionFormData
} from '../types/session';
import SessionManager from './sessionManager';
import { auth } from '../lib/firebase';

export class EnhancedSessionManager {
  private static instance: EnhancedSessionManager;
  private baseSessionManager: SessionManager;
  private featureRegistry = new Map<string, FeatureDefinition>();
  private conditionalEvaluator: ConditionalEvaluator;
  
  private constructor() {
    this.baseSessionManager = SessionManager.getInstance();
    this.conditionalEvaluator = new ConditionalEvaluator();
    this.initializeDefaultFeatures();
  }

  public static getInstance(): EnhancedSessionManager {
    if (!EnhancedSessionManager.instance) {
      EnhancedSessionManager.instance = new EnhancedSessionManager();
    }
    return EnhancedSessionManager.instance;
  }

  // =====================================================================================
  // ENHANCED SESSION CREATION AND MANAGEMENT
  // =====================================================================================

  public async createEnhancedSession(formData: Partial<SessionFormData> = {}): Promise<EnhancedSessionState> {
    // Create base session first
    const baseSession = await this.baseSessionManager.createSession(formData);
    
    // Initialize enhanced state
    const enhancedSession: EnhancedSessionState = {
      ...baseSession,
      stepProgress: this.initializeStepProgress(),
      featureStates: this.initializeFeatureStates(),
      processingCheckpoints: [],
      uiState: this.initializeUIState(),
      validationResults: this.initializeValidationState(),
      navigationHistory: [{
        sessionId: baseSession.sessionId,
        step: baseSession.currentStep,
        timestamp: new Date(),
        url: window.location.href,
        transition: 'push'
      }],
      performanceMetrics: {
        loadTime: performance.now(),
        interactionCount: 0,
        errorCount: 0,
        averageResponseTime: 0
      },
      contextData: this.captureContextData(),
      schemaVersion: '1.0.0',
      migrationHistory: []
    };

    return enhancedSession;
  }

  public async getEnhancedSession(sessionId: string): Promise<EnhancedSessionState | null> {
    const baseSession = await this.baseSessionManager.getSession(sessionId);
    if (!baseSession) return null;

    // Check if it's already an enhanced session
    if ('stepProgress' in baseSession) {
      return baseSession as EnhancedSessionState;
    }

    // Migrate base session to enhanced session
    return this.migrateToEnhancedSession(baseSession);
  }

  // =====================================================================================
  // FEATURE STATE MANAGEMENT
  // =====================================================================================

  public async updateFeatureState(
    sessionId: string,
    featureId: string,
    updates: Partial<FeatureState>
  ): Promise<boolean> {
    const session = await this.getEnhancedSession(sessionId);
    if (!session) return false;

    const currentFeatureState = session.featureStates[featureId] || this.createDefaultFeatureState(featureId);
    const updatedFeatureState = { ...currentFeatureState, ...updates };

    // Apply conditional logic
    const conditionalChanges = await this.evaluateConditionalRules(
      updatedFeatureState,
      session
    );

    // Update the session
    const updatedSession = {
      ...session,
      featureStates: {
        ...session.featureStates,
        [featureId]: updatedFeatureState,
        ...conditionalChanges
      },
      lastActiveAt: new Date()
    };

    return this.saveEnhancedSession(updatedSession);
  }

  public async enableFeature(
    sessionId: string, 
    featureId: string, 
    configuration?: Record<string, unknown>
  ): Promise<boolean> {
    return this.updateFeatureState(sessionId, featureId, {
      enabled: true,
      configuration: configuration || {},
      progress: {
        configured: !!configuration,
        processing: false,
        completed: false
      }
    });
  }

  public async disableFeature(sessionId: string, featureId: string): Promise<boolean> {
    return this.updateFeatureState(sessionId, featureId, {
      enabled: false,
      progress: {
        configured: false,
        processing: false,
        completed: false
      }
    });
  }

  public async evaluateConditionalRules(
    featureState: FeatureState,
    session: EnhancedSessionState
  ): Promise<Record<string, Partial<FeatureState>>> {
    const changes: Record<string, Partial<FeatureState>> = {};

    if (!featureState.conditionalLogic) return changes;

    for (const rule of featureState.conditionalLogic) {
      const targetFeature = session.featureStates[rule.target];
      if (!targetFeature) continue;

      const conditionResult = this.conditionalEvaluator.evaluate(rule.condition, {
        feature: featureState,
        session,
        targetFeature
      });

      if (conditionResult) {
        changes[rule.target] = this.applyConditionalAction(rule, targetFeature);
      }
    }

    return changes;
  }

  private applyConditionalAction(rule: ConditionalRule, targetFeature: FeatureState): Partial<FeatureState> {
    switch (rule.action) {
      case 'enable':
        return { enabled: true };
      case 'disable':
        return { enabled: false };
      case 'require':
        return { enabled: true, dependencies: [...(targetFeature.dependencies || []), rule.target] };
      case 'recommend':
        return { 
          userPreferences: { 
            ...targetFeature.userPreferences, 
            recommended: true, 
            recommendedBy: rule.id 
          } 
        };
      case 'hide':
        return { 
          userPreferences: { 
            ...targetFeature.userPreferences, 
            visible: false 
          } 
        };
      case 'show':
        return { 
          userPreferences: { 
            ...targetFeature.userPreferences, 
            visible: true 
          } 
        };
      default:
        return {};
    }
  }

  // =====================================================================================
  // STEP PROGRESS MANAGEMENT
  // =====================================================================================

  public async updateStepProgress(
    sessionId: string,
    step: CVStep,
    substepUpdates: Partial<SubstepProgress>[]
  ): Promise<boolean> {
    const session = await this.getEnhancedSession(sessionId);
    if (!session) return false;

    const currentStepProgress = session.stepProgress[step] || this.createDefaultStepProgress(step);
    
    // Update substeps
    const updatedSubsteps = currentStepProgress.substeps.map(substep => {
      const update = substepUpdates.find(u => u.id === substep.id);
      return update ? { ...substep, ...update } : substep;
    });

    // Calculate new completion percentage
    const completedSubsteps = updatedSubsteps.filter(s => s.status === 'completed').length;
    const completion = (completedSubsteps / updatedSubsteps.length) * 100;

    const updatedStepProgress: StepProgressState = {
      ...currentStepProgress,
      substeps: updatedSubsteps,
      completion,
      lastModified: new Date(),
      timeSpent: currentStepProgress.timeSpent + this.calculateTimeSpent(currentStepProgress.lastModified)
    };

    const updatedSession = {
      ...session,
      stepProgress: {
        ...session.stepProgress,
        [step]: updatedStepProgress
      }
    };

    return this.saveEnhancedSession(updatedSession);
  }

  public async addUserInteraction(
    sessionId: string,
    interaction: Omit<UserInteraction, 'id' | 'timestamp'>
  ): Promise<boolean> {
    const session = await this.getEnhancedSession(sessionId);
    if (!session) return false;

    const userInteraction: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...interaction
    };

    const currentStep = session.currentStep;
    const stepProgress = session.stepProgress[currentStep] || this.createDefaultStepProgress(currentStep);

    const updatedStepProgress = {
      ...stepProgress,
      userInteractions: [...stepProgress.userInteractions, userInteraction],
      lastModified: new Date()
    };

    // Update performance metrics
    const updatedPerformanceMetrics = {
      ...session.performanceMetrics,
      interactionCount: session.performanceMetrics.interactionCount + 1
    };

    const updatedSession = {
      ...session,
      stepProgress: {
        ...session.stepProgress,
        [currentStep]: updatedStepProgress
      },
      performanceMetrics: updatedPerformanceMetrics
    };

    return this.saveEnhancedSession(updatedSession);
  }

  // =====================================================================================
  // INITIALIZATION HELPERS
  // =====================================================================================

  private initializeStepProgress(): Record<CVStep, StepProgressState> {
    const steps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results', 'keywords', 'completed'];
    const stepProgress: Record<CVStep, StepProgressState> = {} as Record<CVStep, StepProgressState>;

    steps.forEach(step => {
      stepProgress[step] = this.createDefaultStepProgress(step);
    });

    return stepProgress;
  }

  private createDefaultStepProgress(step: CVStep): StepProgressState {
    return {
      stepId: step,
      substeps: this.getDefaultSubstepsForStep(step),
      completion: 0,
      timeSpent: 0,
      userInteractions: [],
      lastModified: new Date()
    };
  }

  private getDefaultSubstepsForStep(step: CVStep): SubstepProgress[] {
    const substepDefinitions = {
      upload: [
        { id: 'file-select', name: 'Select CV File' },
        { id: 'file-validate', name: 'Validate File Format' },
        { id: 'file-upload', name: 'Upload File' }
      ],
      processing: [
        { id: 'text-extract', name: 'Extract Text' },
        { id: 'ai-analysis', name: 'AI Analysis' },
        { id: 'structure-parse', name: 'Parse Structure' }
      ],
      analysis: [
        { id: 'content-analyze', name: 'Analyze Content' },
        { id: 'improvements-identify', name: 'Identify Improvements' },
        { id: 'keywords-extract', name: 'Extract Keywords' }
      ],
      features: [
        { id: 'features-select', name: 'Select Features' },
        { id: 'features-configure', name: 'Configure Features' },
        { id: 'features-validate', name: 'Validate Configuration' }
      ],
      templates: [
        { id: 'template-select', name: 'Select Template' },
        { id: 'template-customize', name: 'Customize Template' },
        { id: 'template-preview', name: 'Preview Template' }
      ],
      preview: [
        { id: 'cv-generate', name: 'Generate CV' },
        { id: 'cv-review', name: 'Review Generated CV' },
        { id: 'cv-approve', name: 'Approve CV' }
      ],
      results: [
        { id: 'results-display', name: 'Display Results' },
        { id: 'results-download', name: 'Download Results' },
        { id: 'results-share', name: 'Share Results' }
      ],
      keywords: [
        { id: 'keywords-review', name: 'Review Keywords' },
        { id: 'keywords-optimize', name: 'Optimize Keywords' },
        { id: 'keywords-apply', name: 'Apply Keywords' }
      ],
      completed: [
        { id: 'completion-confirm', name: 'Confirm Completion' }
      ]
    };

    return (substepDefinitions[step] || []).map(def => ({
      id: def.id,
      name: def.name,
      status: 'pending' as const,
      startedAt: undefined,
      completedAt: undefined
    }));
  }

  private initializeFeatureStates(): Record<string, FeatureState> {
    const features: Record<string, FeatureState> = {};
    
    for (const [featureId, definition] of this.featureRegistry) {
      features[featureId] = this.createDefaultFeatureState(featureId, definition);
    }

    return features;
  }

  private createDefaultFeatureState(featureId: string, definition?: FeatureDefinition): FeatureState {
    const def = definition || this.featureRegistry.get(featureId);
    
    return {
      featureId,
      enabled: def?.defaultEnabled || false,
      configuration: {},
      progress: {
        configured: false,
        processing: false,
        completed: false
      },
      dependencies: def?.dependencies || [],
      conditionalLogic: def?.conditionalLogic || [],
      userPreferences: {},
      metadata: {
        estimatedDuration: def?.estimatedDuration,
        complexity: def?.complexity || 'medium',
        category: def?.category
      }
    };
  }

  private initializeUIState(): UIStateSnapshot {
    return {
      formStates: {},
      currentUrl: window.location.href,
      previousUrls: [],
      breadcrumbs: [],
      modals: {
        open: [],
        history: []
      },
      scrollPositions: {},
      selections: {}
    };
  }

  private initializeValidationState(): ValidationStateSnapshot {
    return {
      formValidations: {},
      stepValidations: {} as Record<CVStep, any[]>,
      globalValidations: [],
      lastValidatedAt: new Date(),
      validationVersion: '1.0.0'
    };
  }

  private captureContextData() {
    return {
      userAgent: navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  private initializeDefaultFeatures(): void {
    // Define available features
    const features: FeatureDefinition[] = [
      {
        id: 'podcast-generation',
        name: 'Podcast Generation',
        defaultEnabled: false,
        dependencies: ['cv-analysis'],
        estimatedDuration: 5,
        complexity: 'high',
        category: 'multimedia',
        conditionalLogic: [{
          id: 'podcast-requires-analysis',
          condition: 'session.completedSteps.includes("analysis")',
          action: 'enable',
          target: 'podcast-generation',
          priority: 1
        }]
      },
      {
        id: 'video-introduction',
        name: 'Video Introduction',
        defaultEnabled: false,
        dependencies: ['cv-analysis'],
        estimatedDuration: 3,
        complexity: 'medium',
        category: 'multimedia'
      },
      {
        id: 'portfolio-gallery',
        name: 'Portfolio Gallery',
        defaultEnabled: true,
        dependencies: [],
        estimatedDuration: 2,
        complexity: 'low',
        category: 'visual'
      },
      {
        id: 'skills-visualization',
        name: 'Skills Visualization',
        defaultEnabled: true,
        dependencies: ['cv-analysis'],
        estimatedDuration: 1,
        complexity: 'low',
        category: 'visual'
      },
      {
        id: 'certification-badges',
        name: 'Certification Badges',
        defaultEnabled: false,
        dependencies: ['cv-analysis'],
        estimatedDuration: 2,
        complexity: 'medium',
        category: 'credentials'
      }
    ];

    features.forEach(feature => {
      this.featureRegistry.set(feature.id, feature);
    });
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  private calculateTimeSpent(lastModified: Date): number {
    return Date.now() - lastModified.getTime();
  }

  private async migrateToEnhancedSession(baseSession: any): Promise<EnhancedSessionState> {
    return {
      ...baseSession,
      stepProgress: this.initializeStepProgress(),
      featureStates: this.initializeFeatureStates(),
      processingCheckpoints: [],
      uiState: this.initializeUIState(),
      validationResults: this.initializeValidationState(),
      navigationHistory: [{
        sessionId: baseSession.sessionId,
        step: baseSession.currentStep,
        timestamp: new Date(),
        url: window.location.href,
        transition: 'push'
      }],
      performanceMetrics: {
        loadTime: 0,
        interactionCount: 0,
        errorCount: 0,
        averageResponseTime: 0
      },
      contextData: this.captureContextData(),
      schemaVersion: '1.0.0',
      migrationHistory: ['base-to-enhanced-v1.0.0']
    };
  }

  private async saveEnhancedSession(session: EnhancedSessionState): Promise<boolean> {
    try {
      await this.baseSessionManager.updateSession(session.sessionId, session);
      return true;
    } catch (error) {
      console.error('Error saving enhanced session:', error);
      return false;
    }
  }
}

// =====================================================================================
// SUPPORTING CLASSES AND INTERFACES
// =====================================================================================

interface FeatureDefinition {
  id: string;
  name: string;
  defaultEnabled: boolean;
  dependencies: string[];
  estimatedDuration: number;
  complexity: 'low' | 'medium' | 'high';
  category: string;
  conditionalLogic?: ConditionalRule[];
}

class ConditionalEvaluator {
  evaluate(condition: string, context: Record<string, unknown>): boolean {
    try {
      // Create a safe evaluation context
      const safeContext = this.createSafeContext(context);
      
      // Use Function constructor for safe evaluation
      const func = new Function(...Object.keys(safeContext), `return ${condition}`);
      return func(...Object.values(safeContext));
    } catch (error) {
      console.warn('Error evaluating conditional rule:', condition, error);
      return false;
    }
  }

  private createSafeContext(context: Record<string, unknown>): Record<string, unknown> {
    // Only allow safe properties and methods
    const safeContext: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(context)) {
      if (this.isSafeValue(value)) {
        safeContext[key] = value;
      }
    }

    return safeContext;
  }

  private isSafeValue(value: unknown): boolean {
    // Allow primitives, plain objects, and arrays
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
    if (Array.isArray(value)) return true;
    if (typeof value === 'object' && value.constructor === Object) return true;
    
    return false;
  }
}

export default EnhancedSessionManager;