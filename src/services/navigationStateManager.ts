// Navigation State Manager - Stateful URL management and intelligent navigation
import {
  NavigationState,
  NavigationContext,
  NavigationPath,
  Breadcrumb,
  ResumeRecommendation,
  ActionRecommendation,
  AlternativeResumeOption,
  CVStep,
  EnhancedSessionState
} from '../types/session';
import { EnhancedSessionManager } from './enhancedSessionManager';

export class NavigationStateManager {
  private static instance: NavigationStateManager;
  private enhancedSessionManager: EnhancedSessionManager;
  private navigationHistory = new Map<string, NavigationState[]>();
  private routeDefinitions = new Map<CVStep, RouteDefinition>();
  
  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.initializeRouteDefinitions();
    this.setupBrowserHistoryListener();
  }

  public static getInstance(): NavigationStateManager {
    if (!NavigationStateManager.instance) {
      NavigationStateManager.instance = new NavigationStateManager();
    }
    return NavigationStateManager.instance;
  }

  // =====================================================================================
  // STATEFUL URL MANAGEMENT
  // =====================================================================================

  public generateStateUrl(
    sessionId: string, 
    step: CVStep, 
    substep?: string,
    parameters?: Record<string, unknown>
  ): string {
    const baseUrl = window.location.origin;
    const routeDef = this.routeDefinitions.get(step);
    
    if (!routeDef) {
      return `${baseUrl}/session/${sessionId}`;
    }

    let path = routeDef.path.replace(':sessionId', sessionId);
    
    if (substep) {
      path += `/${substep}`;
    }

    // Add query parameters for state preservation
    const queryParams = new URLSearchParams();
    queryParams.set('sessionId', sessionId);
    queryParams.set('step', step);
    
    if (substep) {
      queryParams.set('substep', substep);
    }

    if (parameters) {
      queryParams.set('state', btoa(JSON.stringify(parameters)));
    }

    queryParams.set('timestamp', Date.now().toString());

    return `${baseUrl}${path}?${queryParams.toString()}`;
  }

  public parseStateFromUrl(url: string): NavigationState | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const sessionId = params.get('sessionId');
      const step = params.get('step') as CVStep;
      const substep = params.get('substep');
      const timestamp = params.get('timestamp');
      const stateParam = params.get('state');
      
      if (!sessionId || !step) {
        return null;
      }

      let parameters: Record<string, unknown> | undefined;
      if (stateParam) {
        try {
          parameters = JSON.parse(atob(stateParam));
        } catch (error) {
          console.warn('Error parsing state parameters from URL:', error);
        }
      }

      return {
        sessionId,
        step,
        substep,
        parameters,
        timestamp: timestamp ? new Date(parseInt(timestamp)) : new Date(),
        url,
        transition: 'push'
      };
    } catch (error) {
      console.error('Error parsing navigation state from URL:', error);
      return null;
    }
  }

  public pushStateToHistory(state: NavigationState): void {
    const history = this.navigationHistory.get(state.sessionId) || [];
    history.push(state);
    this.navigationHistory.set(state.sessionId, history);

    // Update browser history
    const url = this.generateStateUrl(state.sessionId, state.step, state.substep, state.parameters);
    
    try {
      window.history.pushState(
        {
          sessionId: state.sessionId,
          step: state.step,
          substep: state.substep,
          timestamp: state.timestamp.toISOString()
        },
        this.getPageTitle(state.step),
        url
      );
    } catch (error) {
      console.warn('Error pushing state to browser history:', error);
    }
  }

  public handleBackNavigation(): NavigationState | null {
    const currentState = this.getCurrentNavigationState();
    if (!currentState) return null;

    const history = this.navigationHistory.get(currentState.sessionId) || [];
    if (history.length < 2) return null;

    // Get previous state
    const previousState = history[history.length - 2];
    
    // Update current state with back transition
    const backState: NavigationState = {
      ...previousState,
      timestamp: new Date(),
      transition: 'back'
    };

    // Remove current state from history
    history.pop();
    this.navigationHistory.set(currentState.sessionId, history);

    return backState;
  }

  // =====================================================================================
  // INTELLIGENT NAVIGATION
  // =====================================================================================

  public async getNavigationContext(sessionId: string): Promise<NavigationContext> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentPath = window.location.pathname;
    const availablePaths = this.getAvailablePaths(session);
    const blockedPaths = this.getBlockedPaths(session);
    const recommendedNextSteps = this.getRecommendedNextSteps(session);
    const completionPercentage = this.calculateCompletionPercentage(session);
    const criticalIssues = this.identifyCriticalIssues(session);

    return {
      sessionId,
      currentPath,
      availablePaths,
      blockedPaths,
      recommendedNextSteps,
      completionPercentage,
      criticalIssues
    };
  }

  public generateBreadcrumbs(currentState: EnhancedSessionState): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const completedSteps = [...currentState.completedSteps, currentState.currentStep];

    for (const step of completedSteps) {
      const routeDef = this.routeDefinitions.get(step);
      if (!routeDef) continue;

      const url = this.generateStateUrl(currentState.sessionId, step);
      
      breadcrumbs.push({
        id: `breadcrumb_${step}`,
        label: routeDef.title,
        url,
        step,
        completed: currentState.completedSteps.includes(step),
        accessible: this.isStepAccessible(step, currentState),
        metadata: {
          icon: routeDef.icon,
          description: routeDef.description
        }
      });
    }

    return breadcrumbs;
  }

  // =====================================================================================
  // RESUME INTELLIGENCE
  // =====================================================================================

  public async suggestOptimalResumePoint(sessionId: string): Promise<ResumeRecommendation> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const analysis = this.analyzeSessionState(session);
    const recommendations = this.generateResumeRecommendations(analysis);

    // Select the best recommendation
    const optimal = recommendations.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    return optimal;
  }

  public async getNextRecommendedActions(sessionId: string): Promise<ActionRecommendation[]> {
    const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
    if (!session) {
      return [];
    }

    const actions: ActionRecommendation[] = [];

    // Analyze current step progress
    const currentStepProgress = session.stepProgress[session.currentStep];
    if (currentStepProgress) {
      const incompleteSubsteps = currentStepProgress.substeps.filter(s => s.status !== 'completed');
      
      for (const substep of incompleteSubsteps) {
        actions.push({
          id: `complete_${substep.id}`,
          type: 'complete_section',
          title: `Complete ${substep.name}`,
          description: `Finish the ${substep.name} section to progress further`,
          priority: substep.status === 'in_progress' ? 'high' : 'medium',
          estimatedTime: 5, // Default 5 minutes
          requiredSteps: [substep.id],
          benefits: ['Progress tracking', 'Session continuity'],
          url: this.generateStateUrl(sessionId, session.currentStep, substep.id)
        });
      }
    }

    // Analyze feature states
    const disabledFeatures = Object.values(session.featureStates).filter(f => !f.enabled);
    for (const feature of disabledFeatures.slice(0, 3)) { // Top 3 recommendations
      if (this.shouldRecommendFeature(feature, session)) {
        actions.push({
          id: `enable_${feature.featureId}`,
          type: 'enable_feature',
          title: `Enable ${feature.featureId}`,
          description: `Add ${feature.featureId} to enhance your CV`,
          priority: feature.userPreferences?.recommended ? 'high' : 'low',
          estimatedTime: feature.metadata?.estimatedDuration || 3,
          requiredSteps: feature.dependencies,
          benefits: this.getFeatureBenefits(feature.featureId),
          url: this.generateStateUrl(sessionId, 'features')
        });
      }
    }

    // Analyze validation issues
    const validationIssues = this.getValidationIssues(session);
    for (const issue of validationIssues) {
      actions.push({
        id: `fix_${issue.field}`,
        type: 'fix_error',
        title: `Fix ${issue.field}`,
        description: issue.errors.join(', '),
        priority: 'critical',
        estimatedTime: 2,
        requiredSteps: [issue.field],
        benefits: ['Validation compliance', 'Better results'],
        url: this.generateStateUrl(sessionId, session.currentStep)
      });
    }

    // Sort by priority and estimated value
    return actions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  public identifySkippableSteps(sessionState: EnhancedSessionState): CVStep[] {
    const skippableSteps: CVStep[] = [];

    // Analyze step dependencies and user preferences
    const stepAnalysis = {
      keywords: {
        skippable: sessionState.currentStep !== 'keywords' && 
                  sessionState.completedSteps.includes('analysis'),
        reason: 'Keywords can be optimized later'
      },
      features: {
        skippable: Object.values(sessionState.featureStates).some(f => f.enabled && f.progress.completed),
        reason: 'Basic features are already configured'
      }
    };

    for (const [step, analysis] of Object.entries(stepAnalysis)) {
      if (analysis.skippable) {
        skippableSteps.push(step as CVStep);
      }
    }

    return skippableSteps;
  }

  // =====================================================================================
  // HELPER METHODS
  // =====================================================================================

  private initializeRouteDefinitions(): void {
    const routes: RouteDefinition[] = [
      {
        step: 'upload',
        path: '/upload/:sessionId',
        title: 'Upload CV',
        description: 'Upload your CV file',
        icon: 'upload',
        requiredData: [],
        estimatedTime: 2
      },
      {
        step: 'processing',
        path: '/processing/:sessionId',
        title: 'Processing',
        description: 'AI is analyzing your CV',
        icon: 'processing',
        requiredData: ['fileData'],
        estimatedTime: 3
      },
      {
        step: 'analysis',
        path: '/analysis/:sessionId',
        title: 'Analysis Results',
        description: 'Review AI analysis',
        icon: 'analysis',
        requiredData: ['cvData', 'analysisResults'],
        estimatedTime: 5
      },
      {
        step: 'features',
        path: '/features/:sessionId',
        title: 'Select Features',
        description: 'Choose enhancement features',
        icon: 'features',
        requiredData: ['analysisResults'],
        estimatedTime: 4
      },
      {
        step: 'templates',
        path: '/templates/:sessionId',
        title: 'Choose Template',
        description: 'Select CV template',
        icon: 'template',
        requiredData: ['selectedFeatures'],
        estimatedTime: 3
      },
      {
        step: 'preview',
        path: '/preview/:sessionId',
        title: 'Preview CV',
        description: 'Review your enhanced CV',
        icon: 'preview',
        requiredData: ['templateSelection', 'featureConfiguration'],
        estimatedTime: 5
      },
      {
        step: 'results',
        path: '/results/:sessionId',
        title: 'Final Results',
        description: 'Download and share your CV',
        icon: 'results',
        requiredData: ['generatedCV'],
        estimatedTime: 2
      },
      {
        step: 'keywords',
        path: '/keywords/:sessionId',
        title: 'Keyword Optimization',
        description: 'Optimize keywords for ATS',
        icon: 'keywords',
        requiredData: ['analysisResults'],
        estimatedTime: 4
      },
      {
        step: 'completed',
        path: '/completed/:sessionId',
        title: 'Completed',
        description: 'CV enhancement completed',
        icon: 'completed',
        requiredData: ['finalResults'],
        estimatedTime: 1
      }
    ];

    routes.forEach(route => {
      this.routeDefinitions.set(route.step, route);
    });
  }

  private setupBrowserHistoryListener(): void {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.sessionId) {
        const navigationState = this.parseStateFromUrl(window.location.href);
        if (navigationState) {
          // Trigger navigation event
          this.handleNavigationStateChange(navigationState);
        }
      }
    });
  }

  private handleNavigationStateChange(state: NavigationState): void {
    // Update navigation history
    const history = this.navigationHistory.get(state.sessionId) || [];
    history.push(state);
    this.navigationHistory.set(state.sessionId, history);

    // Emit navigation event (could be used by components)
    window.dispatchEvent(new CustomEvent('navigationStateChange', {
      detail: state
    }));
  }

  private getCurrentNavigationState(): NavigationState | null {
    const currentUrl = window.location.href;
    return this.parseStateFromUrl(currentUrl);
  }

  private getPageTitle(step: CVStep): string {
    const routeDef = this.routeDefinitions.get(step);
    return routeDef ? `CVPlus - ${routeDef.title}` : 'CVPlus';
  }

  private getAvailablePaths(session: EnhancedSessionState): NavigationPath[] {
    const paths: NavigationPath[] = [];

    for (const [step, routeDef] of this.routeDefinitions) {
      const accessible = this.isStepAccessible(step, session);
      const completed = session.completedSteps.includes(step);
      const required = this.isStepRequired(step, session);
      
      paths.push({
        step,
        url: this.generateStateUrl(session.sessionId, step),
        label: routeDef.title,
        accessible,
        completed,
        required,
        estimatedTime: routeDef.estimatedTime,
        prerequisites: this.getStepPrerequisites(step),
        warnings: accessible ? [] : [`${routeDef.title} requires completion of previous steps`]
      });
    }

    return paths;
  }

  private getBlockedPaths(session: EnhancedSessionState): NavigationPath[] {
    const allPaths = this.getAvailablePaths(session);
    return allPaths.filter(path => !path.accessible);
  }

  private getRecommendedNextSteps(session: EnhancedSessionState): CVStep[] {
    const steps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    
    // Find first incomplete step
    for (const step of steps) {
      if (!session.completedSteps.includes(step)) {
        return [step];
      }
    }

    // If all main steps completed, recommend optional steps
    if (!session.completedSteps.includes('keywords')) {
      return ['keywords'];
    }

    return ['completed'];
  }

  private calculateCompletionPercentage(session: EnhancedSessionState): number {
    const mainSteps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const completedMainSteps = mainSteps.filter(step => session.completedSteps.includes(step));
    
    let baseCompletion = (completedMainSteps.length / mainSteps.length) * 80;
    
    // Add completion for current step progress
    const currentStepProgress = session.stepProgress[session.currentStep];
    if (currentStepProgress) {
      baseCompletion += (currentStepProgress.completion / 100) * (80 / mainSteps.length);
    }

    // Add bonus for optional steps
    if (session.completedSteps.includes('keywords')) {
      baseCompletion += 10;
    }

    // Add bonus for enabled features
    const enabledFeatures = Object.values(session.featureStates).filter(f => f.enabled);
    baseCompletion += Math.min(enabledFeatures.length * 2, 10);

    return Math.min(baseCompletion, 100);
  }

  private identifyCriticalIssues(session: EnhancedSessionState): string[] {
    const issues: string[] = [];

    // Check for validation errors
    const validationIssues = this.getValidationIssues(session);
    if (validationIssues.length > 0) {
      issues.push(`${validationIssues.length} validation errors need fixing`);
    }

    // Check for failed processing
    const failedCheckpoints = session.processingCheckpoints.filter(cp => cp.state === 'failed');
    if (failedCheckpoints.length > 0) {
      issues.push(`${failedCheckpoints.length} processing operations failed`);
    }

    // Check for missing required data
    const requiredData = this.routeDefinitions.get(session.currentStep)?.requiredData || [];
    const missingData = requiredData.filter(data => !this.hasRequiredData(session, data));
    if (missingData.length > 0) {
      issues.push(`Missing required data: ${missingData.join(', ')}`);
    }

    return issues;
  }

  private isStepAccessible(step: CVStep, session: EnhancedSessionState): boolean {
    const prerequisites = this.getStepPrerequisites(step);
    return prerequisites.every(prereq => session.completedSteps.includes(prereq));
  }

  private isStepRequired(step: CVStep, session: EnhancedSessionState): boolean {
    const requiredSteps: CVStep[] = ['upload', 'processing', 'analysis'];
    return requiredSteps.includes(step);
  }

  private getStepPrerequisites(step: CVStep): CVStep[] {
    const prerequisites: Record<CVStep, CVStep[]> = {
      upload: [],
      processing: ['upload'],
      analysis: ['upload', 'processing'],
      features: ['analysis'],
      templates: ['analysis'],
      preview: ['analysis', 'features', 'templates'],
      results: ['preview'],
      keywords: ['analysis'],
      completed: ['results']
    };

    return prerequisites[step] || [];
  }

  private analyzeSessionState(session: EnhancedSessionState): SessionAnalysis {
    return {
      completionRate: this.calculateCompletionPercentage(session) / 100,
      blockers: this.identifyCriticalIssues(session),
      strengths: this.identifySessionStrengths(session),
      timeSpent: this.calculateTotalTimeSpent(session),
      lastActivity: session.lastActiveAt
    };
  }

  private generateResumeRecommendations(analysis: SessionAnalysis): ResumeRecommendation[] {
    // This would contain sophisticated logic to analyze session state
    // and provide intelligent resume recommendations
    return [
      {
        recommendedStep: 'analysis',
        reason: 'Continue from where you left off',
        timeToComplete: 5,
        confidence: 0.9,
        priority: 'high',
        alternativeOptions: [],
        requiredData: ['cvData'],
        warnings: []
      }
    ];
  }

  private shouldRecommendFeature(feature: any, session: EnhancedSessionState): boolean {
    // Logic to determine if a feature should be recommended
    return !feature.enabled && 
           feature.dependencies.every((dep: string) => session.featureStates[dep]?.enabled);
  }

  private getFeatureBenefits(featureId: string): string[] {
    const benefits: Record<string, string[]> = {
      'podcast-generation': ['Unique audio CV format', 'Stand out to employers'],
      'video-introduction': ['Personal connection', 'Showcase personality'],
      'skills-visualization': ['Visual impact', 'Easy skill assessment']
    };
    
    return benefits[featureId] || ['Enhanced CV presentation'];
  }

  private getValidationIssues(session: EnhancedSessionState): any[] {
    return session.validationResults.globalValidations.filter(v => !v.valid);
  }

  private identifySessionStrengths(session: EnhancedSessionState): string[] {
    const strengths: string[] = [];
    
    const enabledFeatures = Object.values(session.featureStates).filter(f => f.enabled);
    if (enabledFeatures.length > 3) {
      strengths.push('Rich feature selection');
    }

    const completionRate = this.calculateCompletionPercentage(session);
    if (completionRate > 70) {
      strengths.push('High completion rate');
    }

    return strengths;
  }

  private calculateTotalTimeSpent(session: EnhancedSessionState): number {
    return Object.values(session.stepProgress).reduce((total, progress) => 
      total + progress.timeSpent, 0
    );
  }

  private hasRequiredData(session: EnhancedSessionState, dataKey: string): boolean {
    // Check if session has the required data
    switch (dataKey) {
      case 'fileData':
        return !!session.formData.selectedFile;
      case 'cvData':
        return session.completedSteps.includes('processing');
      case 'analysisResults':
        return session.completedSteps.includes('analysis');
      default:
        return true;
    }
  }
}

// Supporting interfaces
interface RouteDefinition {
  step: CVStep;
  path: string;
  title: string;
  description: string;
  icon: string;
  requiredData: string[];
  estimatedTime: number;
}

interface SessionAnalysis {
  completionRate: number;
  blockers: string[];
  strengths: string[];
  timeSpent: number;
  lastActivity: Date;
}

export default NavigationStateManager;