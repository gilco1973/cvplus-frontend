// useEnhancedSession Hook - Advanced session hook with micro-state management
import { useState, useEffect, useCallback, useRef } from 'react';
import { EnhancedSessionManager } from '../services/enhancedSessionManager';
import type { 
  EnhancedSessionState,
  FeatureState,
  SubstepProgress,
  UserInteraction,
  CVStep,
  SessionFormData
} from '../types/session';

interface UseEnhancedSessionReturn {
  // Enhanced session state
  session: EnhancedSessionState | null;
  loading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (formData?: Partial<SessionFormData>) => Promise<string>;
  
  // Feature management
  enableFeature: (featureId: string, config?: Record<string, unknown>) => Promise<boolean>;
  disableFeature: (featureId: string) => Promise<boolean>;
  updateFeatureConfig: (featureId: string, config: Record<string, unknown>) => Promise<boolean>;
  getFeatureState: (featureId: string) => FeatureState | null;
  
  // Step progress management
  updateSubsteps: (step: CVStep, substepUpdates: Partial<SubstepProgress>[]) => Promise<boolean>;
  completeSubstep: (step: CVStep, substepId: string) => Promise<boolean>;
  startSubstep: (step: CVStep, substepId: string) => Promise<boolean>;
  
  // User interaction tracking
  trackInteraction: (interaction: Omit<UserInteraction, 'id' | 'timestamp'>) => Promise<boolean>;
  
  // Navigation and progress
  navigateToStep: (step: CVStep, formData?: Partial<SessionFormData>) => Promise<boolean>;
  getStepProgress: (step: CVStep) => number;
  getOverallProgress: () => number;
  
  // Feature intelligence
  getEnabledFeatures: () => FeatureState[];
  getRecommendedFeatures: () => FeatureState[];
  canEnableFeature: (featureId: string) => boolean;
  
  // Performance metrics
  getInteractionCount: () => number;
  getTimeInCurrentStep: () => number;
  getEstimatedTimeToComplete: () => number;
}

interface UseEnhancedSessionOptions {
  sessionId?: string;
  autoTrackInteractions?: boolean;
  enablePerformanceTracking?: boolean;
  onFeatureStateChange?: (featureId: string, state: FeatureState) => void;
  onStepProgressChange?: (step: CVStep, progress: number) => void;
}

export const useEnhancedSession = (options: UseEnhancedSessionOptions = {}): UseEnhancedSessionReturn => {
  const [session, setSession] = useState<EnhancedSessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const enhancedSessionManager = useRef(EnhancedSessionManager.getInstance());
  const currentSessionId = useRef<string | null>(options.sessionId || null);
  const stepTimers = useRef<Map<CVStep, number>>(new Map());

  // Initialize session
  useEffect(() => {
    if (options.sessionId) {
      loadSession(options.sessionId);
    }
  }, [options.sessionId]);

  // Auto-track interactions if enabled
  useEffect(() => {
    if (!options.autoTrackInteractions || !session) return;

    const handleClick = (event: MouseEvent) => {
      trackInteraction({
        type: 'click',
        element: (event.target as Element)?.tagName || 'unknown',
        data: {
          x: event.clientX,
          y: event.clientY,
          button: event.button
        }
      });
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      trackInteraction({
        type: 'input',
        element: target.name || target.id || 'unknown',
        data: {
          type: target.type,
          value: target.type === 'password' ? '[REDACTED]' : target.value?.slice(0, 100)
        }
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('input', handleInput);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('input', handleInput);
    };
  }, [options.autoTrackInteractions, session]);

  // Track time spent in steps
  useEffect(() => {
    if (!session || !options.enablePerformanceTracking) return;

    const currentStep = session.currentStep;
    stepTimers.current.set(currentStep, Date.now());

    return () => {
      const startTime = stepTimers.current.get(currentStep);
      if (startTime) {
        const timeSpent = Date.now() - startTime;
        // Could update session with time spent
      }
    };
  }, [session?.currentStep, options.enablePerformanceTracking]);

  // Load session
  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedSession = await enhancedSessionManager.current.getEnhancedSession(sessionId);
      setSession(loadedSession);
      currentSessionId.current = sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load enhanced session';
      setError(message);
      console.error('Error loading enhanced session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (formData?: Partial<SessionFormData>): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const newSession = await enhancedSessionManager.current.createEnhancedSession(formData);
      setSession(newSession);
      currentSessionId.current = newSession.sessionId;
      return newSession.sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create enhanced session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Feature management
  const enableFeature = useCallback(async (featureId: string, config?: Record<string, unknown>): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const success = await enhancedSessionManager.current.enableFeature(
        currentSessionId.current,
        featureId,
        config
      );
      
      if (success) {
        // Reload session to get updated state
        await loadSession(currentSessionId.current);
        
        // Trigger callback if provided
        if (options.onFeatureStateChange && session) {
          const featureState = session.featureStates[featureId];
          if (featureState) {
            options.onFeatureStateChange(featureId, featureState);
          }
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error enabling feature:', err);
      return false;
    }
  }, [session, options.onFeatureStateChange, loadSession]);

  const disableFeature = useCallback(async (featureId: string): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const success = await enhancedSessionManager.current.disableFeature(
        currentSessionId.current,
        featureId
      );
      
      if (success) {
        await loadSession(currentSessionId.current);
      }
      
      return success;
    } catch (err) {
      console.error('Error disabling feature:', err);
      return false;
    }
  }, [loadSession]);

  const updateFeatureConfig = useCallback(async (
    featureId: string, 
    config: Record<string, unknown>
  ): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const success = await enhancedSessionManager.current.updateFeatureState(
        currentSessionId.current,
        featureId,
        { configuration: config }
      );
      
      if (success) {
        await loadSession(currentSessionId.current);
      }
      
      return success;
    } catch (err) {
      console.error('Error updating feature config:', err);
      return false;
    }
  }, [loadSession]);

  const getFeatureState = useCallback((featureId: string): FeatureState | null => {
    return session?.featureStates[featureId] || null;
  }, [session]);

  // Step progress management
  const updateSubsteps = useCallback(async (
    step: CVStep, 
    substepUpdates: Partial<SubstepProgress>[]
  ): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const success = await enhancedSessionManager.current.updateStepProgress(
        currentSessionId.current,
        step,
        substepUpdates
      );
      
      if (success) {
        await loadSession(currentSessionId.current);
        
        // Trigger callback if provided
        if (options.onStepProgressChange) {
          const progress = getStepProgress(step);
          options.onStepProgressChange(step, progress);
        }
      }
      
      return success;
    } catch (err) {
      console.error('Error updating substeps:', err);
      return false;
    }
  }, [options.onStepProgressChange, loadSession]);

  const completeSubstep = useCallback(async (step: CVStep, substepId: string): Promise<boolean> => {
    return updateSubsteps(step, [{
      id: substepId,
      status: 'completed',
      completedAt: new Date()
    }]);
  }, [updateSubsteps]);

  const startSubstep = useCallback(async (step: CVStep, substepId: string): Promise<boolean> => {
    return updateSubsteps(step, [{
      id: substepId,
      status: 'in_progress',
      startedAt: new Date()
    }]);
  }, [updateSubsteps]);

  // User interaction tracking
  const trackInteraction = useCallback(async (
    interaction: Omit<UserInteraction, 'id' | 'timestamp'>
  ): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      return await enhancedSessionManager.current.addUserInteraction(
        currentSessionId.current,
        interaction
      );
    } catch (err) {
      console.error('Error tracking interaction:', err);
      return false;
    }
  }, []);

  // Navigation and progress
  const navigateToStep = useCallback(async (
    step: CVStep, 
    formData?: Partial<SessionFormData>
  ): Promise<boolean> => {
    if (!session) return false;

    // Track navigation interaction
    await trackInteraction({
      type: 'navigation',
      data: { fromStep: session.currentStep, toStep: step }
    });

    // Use base session manager for navigation
    const baseSessionManager = (enhancedSessionManager.current as any).baseSessionManager;
    const updated = await baseSessionManager.updateStep(session.sessionId, step, formData);
    
    if (updated && currentSessionId.current) {
      await loadSession(currentSessionId.current);
    }
    
    return !!updated;
  }, [session, trackInteraction, loadSession]);

  const getStepProgress = useCallback((step: CVStep): number => {
    return session?.stepProgress[step]?.completion || 0;
  }, [session]);

  const getOverallProgress = useCallback((): number => {
    if (!session) return 0;

    const steps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    const totalProgress = steps.reduce((sum, step) => sum + getStepProgress(step), 0);
    
    return totalProgress / steps.length;
  }, [session, getStepProgress]);

  // Feature intelligence
  const getEnabledFeatures = useCallback((): FeatureState[] => {
    if (!session) return [];
    return Object.values(session.featureStates).filter(feature => feature.enabled);
  }, [session]);

  const getRecommendedFeatures = useCallback((): FeatureState[] => {
    if (!session) return [];
    return Object.values(session.featureStates).filter(
      feature => feature.userPreferences?.recommended === true
    );
  }, [session]);

  const canEnableFeature = useCallback((featureId: string): boolean => {
    const featureState = getFeatureState(featureId);
    if (!featureState || !session) return false;

    // Check dependencies
    if (featureState.dependencies.length > 0) {
      return featureState.dependencies.every(depId => {
        const depFeature = session.featureStates[depId];
        return depFeature?.enabled && depFeature.progress.completed;
      });
    }

    return true;
  }, [session, getFeatureState]);

  // Performance metrics
  const getInteractionCount = useCallback((): number => {
    return session?.performanceMetrics.interactionCount || 0;
  }, [session]);

  const getTimeInCurrentStep = useCallback((): number => {
    if (!session) return 0;
    
    const stepProgress = session.stepProgress[session.currentStep];
    return stepProgress?.timeSpent || 0;
  }, [session]);

  const getEstimatedTimeToComplete = useCallback((): number => {
    if (!session) return 0;

    const steps: CVStep[] = ['upload', 'processing', 'analysis', 'features', 'templates', 'preview', 'results'];
    let estimatedTime = 0;

    for (const step of steps) {
      const stepProgress = session.stepProgress[step];
      if (stepProgress.completion < 100) {
        estimatedTime += stepProgress.estimatedTimeToComplete || 5; // Default 5 minutes per incomplete step
      }
    }

    return estimatedTime;
  }, [session]);

  return {
    // State
    session,
    loading,
    error,
    
    // Session operations
    createSession,
    
    // Feature management
    enableFeature,
    disableFeature,
    updateFeatureConfig,
    getFeatureState,
    
    // Step progress management
    updateSubsteps,
    completeSubstep,
    startSubstep,
    
    // User interaction tracking
    trackInteraction,
    
    // Navigation and progress
    navigateToStep,
    getStepProgress,
    getOverallProgress,
    
    // Feature intelligence
    getEnabledFeatures,
    getRecommendedFeatures,
    canEnableFeature,
    
    // Performance metrics
    getInteractionCount,
    getTimeInCurrentStep,
    getEstimatedTimeToComplete
  };
};

export default useEnhancedSession;