// Navigation State Manager - Main orchestrator for navigation intelligence
import {
  NavigationState,
  NavigationContext,
  NavigationPath,
  Breadcrumb,
  CVStep,
  EnhancedSessionState
} from '../../types/session';
import { EnhancedSessionManager } from '../enhancedSessionManager';

// Simple inline RouteManager for navigation state management
class RouteManager {
  private routes = new Map<CVStep, RouteDefinition>();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const routeDefinitions: RouteDefinition[] = [
      { step: 'upload', path: '/upload', title: 'Upload CV', icon: '📄', description: 'Upload your CV file', estimatedTime: 2 },
      { step: 'processing', path: '/processing', title: 'Processing', icon: '⚙️', description: 'AI processing your CV', estimatedTime: 3 },
      { step: 'analysis', path: '/analysis', title: 'AI Analysis', icon: '🔍', description: 'Analyzing CV content', estimatedTime: 4 },
      { step: 'features', path: '/features', title: 'Features', icon: '✨', description: 'Select features', estimatedTime: 5 },
      { step: 'templates', path: '/templates', title: 'Templates', icon: '🎨', description: 'Choose templates', estimatedTime: 3 },
      { step: 'preview', path: '/preview', title: 'Preview', icon: '👁️', description: 'Preview results', estimatedTime: 2 },
      { step: 'results', path: '/results', title: 'Results', icon: '🎯', description: 'Final results', estimatedTime: 1 },
      { step: 'keywords', path: '/keywords', title: 'Keywords', icon: '🔤', description: 'Keyword optimization', estimatedTime: 3 },
      { step: 'completed', path: '/completed', title: 'Completed', icon: '✅', description: 'Process completed', estimatedTime: 0 }
    ];

    routeDefinitions.forEach(route => {
      this.routes.set(route.step, route);
    });
  }

  public generateStateUrl(sessionId: string, step: CVStep, substep?: string, parameters?: Record<string, any>): string {
    const route = this.routes.get(step);
    if (!route) return '/';

    const url = new URL(route.path, window.location.origin);
    url.searchParams.set('session', sessionId);
    url.searchParams.set('step', step);
    
    if (substep) {
      url.searchParams.set('substep', substep);
    }
    
    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
    }

    return url.pathname + url.search;
  }

  public parseStateFromUrl(url: string): NavigationState | null {
    try {
      const urlObj = new URL(url);
      const sessionId = urlObj.searchParams.get('session');
      const step = urlObj.searchParams.get('step') as CVStep;
      const substep = urlObj.searchParams.get('substep');

      if (!sessionId || !step) {
        return null;
      }

      const parameters: Record<string, any> = {};
      urlObj.searchParams.forEach((value, key) => {
        if (!['session', 'step', 'substep'].includes(key)) {
          parameters[key] = value;
        }
      });

      return {
        sessionId,
        step,
        substep,
        parameters,
        timestamp: new Date(),
        url,
        transition: 'push'
      };
    } catch {
      return null;
    }
  }

  public getRouteDefinition(step: CVStep): RouteDefinition | undefined {
    return this.routes.get(step);
  }

  public getAllRoutes(): RouteDefinition[] {
    return Array.from(this.routes.values());
  }
}

// Simple inline ResumeIntelligence for navigation recommendations
class ResumeIntelligence {
  public async suggestOptimalResumePoint(session: EnhancedSessionState): Promise<ResumeRecommendation> {
    const steps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    
    // Find the first incomplete step
    let recommendedStep: CVStep = 'upload';
    for (const step of steps) {
      if (!session.completedSteps.includes(step)) {
        recommendedStep = step;
        break;
      }
    }

    // If all main steps are complete, check keywords
    if (session.completedSteps.includes('results') && !session.completedSteps.includes('keywords')) {
      recommendedStep = 'keywords';
    } else if (session.completedSteps.includes('keywords')) {
      recommendedStep = 'completed';
    }

    return {
      recommendedStep,
      reason: `Continue from ${recommendedStep}`,
      timeToComplete: this.estimateTimeToComplete(session, recommendedStep),
      confidence: 0.9,
      priority: 'high',
      alternativeOptions: [],
      requiredData: [],
      warnings: []
    };
  }

  public getNextRecommendedActions(session: EnhancedSessionState): string[] {
    const actions: string[] = [];
    const currentStepProgress = session.stepProgress[session.currentStep];

    if (currentStepProgress && currentStepProgress.completion < 100) {
      actions.push(`Complete ${session.currentStep} step`);
    }

    const validationIssues = session.validationResults.globalValidations.filter(v => !v.valid);
    if (validationIssues.length > 0) {
      actions.push('Fix validation errors');
    }

    return actions;
  }

  public identifySkippableSteps(session: EnhancedSessionState): CVStep[] {
    // Most steps are not skippable, but some optional features could be
    const skippable: CVStep[] = [];
    
    if (session.completedSteps.includes('analysis')) {
      // Keywords step is optional
      if (!session.completedSteps.includes('keywords')) {
        skippable.push('keywords');
      }
    }

    return skippable;
  }

  private estimateTimeToComplete(session: EnhancedSessionState, step: CVStep): number {
    const estimates: Record<CVStep, number> = {
      upload: 2,
      processing: 3,
      analysis: 4,
      features: 5,
      templates: 3,
      preview: 2,
      results: 1,
      keywords: 3,
      completed: 0
    };

    return estimates[step] || 5;
  }
}

// Type definitions
interface RouteDefinition {
  step: CVStep;
  path: string;
  title: string;
  icon: string;
  description: string;
  estimatedTime: number;
}

interface ResumeRecommendation {
  recommendedStep: CVStep;
  reason: string;
  timeToComplete: number;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  alternativeOptions: Array<{
    step: CVStep;
    reason: string;
    timeToComplete: number;
    confidence: number;
    pros?: string[];
    cons?: string[];
  }>;
  requiredData: string[];
  warnings: string[];
}

export class NavigationStateManager {
  private static instance: NavigationStateManager;
  private enhancedSessionManager: EnhancedSessionManager;
  private routeManager: RouteManager;
  private resumeIntelligence: ResumeIntelligence;
  private navigationHistory = new Map<string, NavigationState[]>();
  
  // Robustness features
  private networkRetryQueue = new Map<string, Promise<any>>();
  private pendingNavigations = new Set<string>();
  private eventListeners = new Map<string, EventListener>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_BASE_DELAY = 1000;
  private readonly DEBOUNCE_DELAY = 300;
  
  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.routeManager = new RouteManager();
    this.resumeIntelligence = new ResumeIntelligence();
    this.setupBrowserHistoryListener();
    this.setupNetworkListener();
    this.setupStoragePersistence();
    this.setupUnloadCleanup();
  }

  public static getInstance(): NavigationStateManager {
    if (!NavigationStateManager.instance) {
      NavigationStateManager.instance = new NavigationStateManager();
    }
    return NavigationStateManager.instance;
  }

  // Delegate URL management to RouteManager
  public generateStateUrl = this.routeManager.generateStateUrl.bind(this.routeManager);
  public parseStateFromUrl = this.routeManager.parseStateFromUrl.bind(this.routeManager);

  // Delegate resume intelligence
  public suggestOptimalResumePoint = this.resumeIntelligence.suggestOptimalResumePoint.bind(this.resumeIntelligence);
  public getNextRecommendedActions = this.resumeIntelligence.getNextRecommendedActions.bind(this.resumeIntelligence);
  public identifySkippableSteps = this.resumeIntelligence.identifySkippableSteps.bind(this.resumeIntelligence);

  public pushStateToHistory(state: NavigationState): void {
    const history = this.navigationHistory.get(state.sessionId) || [];
    history.push(state);
    this.navigationHistory.set(state.sessionId, history);

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

    const previousState = history[history.length - 2];
    
    const backState: NavigationState = {
      ...previousState,
      timestamp: new Date(),
      transition: 'back'
    };

    history.pop();
    this.navigationHistory.set(currentState.sessionId, history);

    return backState;
  }

  public async getNavigationContext(sessionId: string): Promise<NavigationContext> {
    return this.executeWithNetworkRecovery(`getNavigationContext-${sessionId}`, async () => {
      // Check for cached data first during network issues
      if (!navigator.onLine) {
        const cachedContext = this.getCachedNavigationContext(sessionId);
        if (cachedContext) {
          return cachedContext;
        }
      }

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

      const context = {
        sessionId,
        currentPath,
        availablePaths,
        blockedPaths,
        recommendedNextSteps,
        completionPercentage,
        criticalIssues
      };

      // Cache the context for offline use
      this.cacheNavigationContext(sessionId, context);
      
      return context;
    });
  }

  public generateBreadcrumbs(currentState: EnhancedSessionState): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const completedSteps = [...currentState.completedSteps, currentState.currentStep];

    for (const step of completedSteps) {
      const routeDef = this.routeManager.getRouteDefinition(step);
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

  private setupBrowserHistoryListener(): void {
    window.addEventListener('popstate', (event) => {
      if (event.state && event.state.sessionId) {
        const navigationState = this.parseStateFromUrl(window.location.href);
        if (navigationState) {
          this.handleNavigationStateChange(navigationState);
        }
      }
    });
  }

  private handleNavigationStateChange(state: NavigationState): void {
    const history = this.navigationHistory.get(state.sessionId) || [];
    history.push(state);
    this.navigationHistory.set(state.sessionId, history);

    window.dispatchEvent(new CustomEvent('navigationStateChange', {
      detail: state
    }));
  }

  private getCurrentNavigationState(): NavigationState | null {
    const currentUrl = window.location.href;
    return this.parseStateFromUrl(currentUrl);
  }

  private getPageTitle(step: CVStep): string {
    const routeDef = this.routeManager.getRouteDefinition(step);
    return routeDef ? `CVPlus - ${routeDef.title}` : 'CVPlus';
  }

  private getAvailablePaths(session: EnhancedSessionState): NavigationPath[] {
    const paths: NavigationPath[] = [];
    const routes = this.routeManager.getAllRoutes();

    for (const routeDef of routes) {
      const accessible = this.isStepAccessible(routeDef.step, session);
      const completed = session.completedSteps.includes(routeDef.step);
      const required = this.isStepRequired(routeDef.step);
      
      paths.push({
        step: routeDef.step,
        url: this.generateStateUrl(session.sessionId, routeDef.step),
        label: routeDef.title,
        accessible,
        completed,
        required,
        estimatedTime: routeDef.estimatedTime,
        prerequisites: this.getStepPrerequisites(routeDef.step),
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
    
    for (const step of steps) {
      if (!session.completedSteps.includes(step)) {
        return [step];
      }
    }

    if (!session.completedSteps.includes('keywords')) {
      return ['keywords'];
    }

    return ['completed'];
  }

  private calculateCompletionPercentage(session: EnhancedSessionState): number {
    const mainSteps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const completedMainSteps = mainSteps.filter(step => session.completedSteps.includes(step));
    
    let baseCompletion = (completedMainSteps.length / mainSteps.length) * 80;
    
    const currentStepProgress = session.stepProgress[session.currentStep];
    if (currentStepProgress) {
      baseCompletion += (currentStepProgress.completion / 100) * (80 / mainSteps.length);
    }

    if (session.completedSteps.includes('keywords')) baseCompletion += 10;
    
    const enabledFeatures = Object.values(session.featureStates).filter(f => f.enabled);
    baseCompletion += Math.min(enabledFeatures.length * 2, 10);

    return Math.min(baseCompletion, 100);
  }

  private identifyCriticalIssues(session: EnhancedSessionState): string[] {
    const issues: string[] = [];

    const validationIssues = session.validationResults.globalValidations.filter(v => !v.valid);
    if (validationIssues.length > 0) {
      issues.push(`${validationIssues.length} validation errors need fixing`);
    }

    const failedCheckpoints = session.processingCheckpoints.filter(cp => cp.state === 'failed');
    if (failedCheckpoints.length > 0) {
      issues.push(`${failedCheckpoints.length} processing operations failed`);
    }

    return issues;
  }

  private isStepAccessible(step: CVStep, session: EnhancedSessionState): boolean {
    const prerequisites = this.getStepPrerequisites(step);
    return prerequisites.every(prereq => session.completedSteps.includes(prereq));
  }

  private isStepRequired(step: CVStep): boolean {
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

  // Network Recovery and Retry Logic
  private async executeWithNetworkRecovery<T>(operationId: string, operation: () => Promise<T>): Promise<T> {
    // Check if operation is already in progress
    if (this.networkRetryQueue.has(operationId)) {
      return this.networkRetryQueue.get(operationId)!;
    }

    const retryPromise = this.retryWithExponentialBackoff(operation);
    this.networkRetryQueue.set(operationId, retryPromise);

    try {
      const result = await retryPromise;
      this.networkRetryQueue.delete(operationId);
      return result;
    } catch (error) {
      this.networkRetryQueue.delete(operationId);
      throw error;
    }
  }

  private async retryWithExponentialBackoff<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt < this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry non-network errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        if (attempt < this.MAX_RETRY_ATTEMPTS - 1) {
          const delay = this.RETRY_BASE_DELAY * Math.pow(2, attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError!;
  }

  private isNonRetryableError(error: any): boolean {
    // Don't retry validation errors, session not found, etc.
    if (error?.message?.includes('Session not found') ||
        error?.message?.includes('validation') ||
        error?.message?.includes('corrupted')) {
      return true;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Debouncing for Rapid Navigation
  public navigateWithDebounce(sessionId: string, step: CVStep, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const debounceKey = `navigate-${sessionId}-${step}`;
      
      // Clear existing timer
      if (this.debounceTimers.has(debounceKey)) {
        clearTimeout(this.debounceTimers.get(debounceKey)!);
      }

      // Set new timer
      const timer = setTimeout(async () => {
        try {
          // Check if already navigating to prevent race conditions
          if (this.pendingNavigations.has(debounceKey)) {
            return;
          }

          this.pendingNavigations.add(debounceKey);
          
          // Perform navigation
          window.location.href = url;
          
          this.debounceTimers.delete(debounceKey);
          this.pendingNavigations.delete(debounceKey);
          resolve();
        } catch (error) {
          this.pendingNavigations.delete(debounceKey);
          reject(error);
        }
      }, this.DEBOUNCE_DELAY);

      this.debounceTimers.set(debounceKey, timer);
    });
  }

  // Browser Storage Persistence
  private setupStoragePersistence(): void {
    // Restore navigation state on page load
    this.restoreNavigationStateFromStorage();

    // Save navigation state before page unload
    window.addEventListener('beforeunload', () => {
      this.saveNavigationStateToStorage();
    });
  }

  private saveNavigationStateToStorage(): void {
    try {
      const currentState = this.getCurrentNavigationState();
      if (currentState) {
        const persistentData = {
          navigationState: currentState,
          timestamp: Date.now(),
          version: '2.0'
        };
        localStorage.setItem('cvplus_navigation_state', JSON.stringify(persistentData));
        sessionStorage.setItem('cvplus_session_backup', JSON.stringify(persistentData));
      }
    } catch (error) {
      console.warn('Failed to save navigation state to storage:', error);
    }
  }

  private restoreNavigationStateFromStorage(): NavigationState | null {
    try {
      // Try sessionStorage first (more recent)
      let persistentData = sessionStorage.getItem('cvplus_session_backup');
      if (!persistentData) {
        // Fallback to localStorage
        persistentData = localStorage.getItem('cvplus_navigation_state');
      }

      if (persistentData) {
        const data = JSON.parse(persistentData);
        
        // Check data validity and age (don't restore data older than 24 hours)
        if (data.timestamp && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
          return data.navigationState;
        }
      }
    } catch (error) {
      console.warn('Failed to restore navigation state from storage:', error);
      // Clear corrupted data
      localStorage.removeItem('cvplus_navigation_state');
      sessionStorage.removeItem('cvplus_session_backup');
    }
    return null;
  }

  // Network Status Monitoring
  private setupNetworkListener(): void {
    const onlineHandler = () => {
      console.warn('🌐 Network connection restored');
      // Retry queued operations
      this.retryQueuedOperations();
    };

    const offlineHandler = () => {
      console.warn('🌐 Network connection lost - switching to cached mode');
    };

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    this.eventListeners.set('online', onlineHandler);
    this.eventListeners.set('offline', offlineHandler);
  }

  private retryQueuedOperations(): void {
    // Retry any operations that were queued during network outage
    for (const [operationId, promise] of this.networkRetryQueue.entries()) {
      // Operations will retry automatically when called again
      console.warn(`Retrying queued operation: ${operationId}`);
    }
  }

  // Caching for Offline Support
  private cacheNavigationContext(sessionId: string, context: NavigationContext): void {
    try {
      const cacheData = {
        context,
        timestamp: Date.now(),
        sessionId
      };
      localStorage.setItem(`cvplus_nav_cache_${sessionId}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache navigation context:', error);
    }
  }

  private getCachedNavigationContext(sessionId: string): NavigationContext | null {
    try {
      const cacheData = localStorage.getItem(`cvplus_nav_cache_${sessionId}`);
      if (cacheData) {
        const data = JSON.parse(cacheData);
        // Return cached data if it's less than 1 hour old
        if (Date.now() - data.timestamp < 60 * 60 * 1000) {
          return data.context;
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve cached navigation context:', error);
    }
    return null;
  }

  // Cleanup and Memory Leak Prevention
  private setupUnloadCleanup(): void {
    const cleanup = () => {
      this.cleanup();
    };

    window.addEventListener('beforeunload', cleanup);
    this.eventListeners.set('beforeunload', cleanup);
  }

  public cleanup(): void {
    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    // Clear network retry queue
    this.networkRetryQueue.clear();

    // Clear pending navigations
    this.pendingNavigations.clear();

    // Remove event listeners
    for (const [eventName, listener] of this.eventListeners.entries()) {
      window.removeEventListener(eventName, listener as EventListener);
    }
    this.eventListeners.clear();

    // Clear old navigation history to prevent memory leaks
    for (const [sessionId, history] of this.navigationHistory.entries()) {
      // Keep only the last 50 entries per session
      if (history.length > 50) {
        this.navigationHistory.set(sessionId, history.slice(-50));
      }
    }

    console.warn('🧹 NavigationStateManager cleanup completed');
  }
}

export default NavigationStateManager;