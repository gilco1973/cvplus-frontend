/**
 * Error Recovery Hook
 * 
 * Provides a convenient React hook for integrating error recovery
 * capabilities into any component with automatic state management.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import ErrorRecoveryManager, { RecoveryResult, ErrorRecoveryOptions } from '../services/error-recovery/ErrorRecoveryManager';
import { CheckpointType, ProcessingCheckpoint } from '../services/error-recovery/CheckpointManager';
import { ClassifiedError } from '../services/error-recovery/ErrorClassification';

export interface UseErrorRecoveryOptions extends ErrorRecoveryOptions {
  jobId?: string;
  sessionId?: string;
  autoRetryOnMount?: boolean;
  trackActions?: boolean;
}

export interface ErrorRecoveryState {
  isRecovering: boolean;
  lastError: ClassifiedError | null;
  checkpoints: ProcessingCheckpoint[];
  recoveryAttempts: number;
  lastRecoveryResult: RecoveryResult<any> | null;
}

export interface ErrorRecoveryActions {
  executeWithRecovery: <T>(
    operation: () => Promise<T>,
    operationName: string,
    checkpointType?: CheckpointType
  ) => Promise<T>;
  createCheckpoint: (
    type: CheckpointType,
    data: Record<string, unknown>,
    description?: string
  ) => Promise<void>;
  restoreFromCheckpoint: () => Promise<boolean>;
  classifyError: (error: Error | any, operation: string) => ClassifiedError;
  reportError: (
    error: ClassifiedError,
    userFeedback?: {
      rating: 1 | 2 | 3 | 4 | 5;
      description: string;
      reproductionSteps?: string;
    }
  ) => Promise<string>;
  clearError: () => void;
  trackAction: (type: string, target: string, details?: Record<string, unknown>) => void;
  loadCheckpoints: () => Promise<void>;
}

export function useErrorRecovery(
  options: UseErrorRecoveryOptions = {}
): [ErrorRecoveryState, ErrorRecoveryActions] {
  const {
    jobId,
    sessionId,
    autoRetryOnMount = false,
    trackActions = true,
    ...recoveryOptions
  } = options;

  // State
  const [state, setState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    lastError: null,
    checkpoints: [],
    recoveryAttempts: 0,
    lastRecoveryResult: null
  });

  // Refs
  const recoveryManager = useRef(ErrorRecoveryManager.getInstance());
  const mountedRef = useRef(true);

  // Load checkpoints on mount or when jobId changes
  useEffect(() => {
    if (jobId) {
      loadCheckpoints();
    }

    // Enable action tracking if requested
    if (trackActions) {
      recoveryManager.current.setActionTracking(true);
    }

    return () => {
      mountedRef.current = false;
      if (trackActions) {
        recoveryManager.current.setActionTracking(false);
      }
    };
  }, [jobId, trackActions]);

  /**
   * Loads checkpoints for the current job
   */
  const loadCheckpoints = useCallback(async () => {
    if (!jobId || !mountedRef.current) return;

    try {
      const checkpoints = await recoveryManager.current.getJobCheckpoints(jobId);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, checkpoints }));
      }
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    }
  }, [jobId]);

  /**
   * Executes an operation with error recovery
   */
  const executeWithRecovery = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    checkpointType?: CheckpointType
  ): Promise<T> => {
    if (!mountedRef.current) throw new Error('Component unmounted');

    setState(prev => ({ 
      ...prev, 
      isRecovering: true, 
      lastError: null,
      recoveryAttempts: prev.recoveryAttempts + 1
    }));

    try {
      const result = await recoveryManager.current.executeWithRecovery(
        operation,
        {
          operationName,
          jobId,
          sessionId,
          checkpointType
        },
        recoveryOptions
      );

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          isRecovering: false,
          lastRecoveryResult: result,
          lastError: result.error || null
        }));

        // Reload checkpoints after successful operation
        if (result.success && jobId) {
          await loadCheckpoints();
        }
      }

      if (result.success) {
        return result.data as T;
      } else {
        throw result.error?.originalError || new Error('Operation failed');
      }

    } catch (error: unknown) {
      if (mountedRef.current) {
        const classifiedError = recoveryManager.current.classifyError(error, {
          operation: operationName,
          jobId,
          sessionId
        });

        setState(prev => ({
          ...prev,
          isRecovering: false,
          lastError: classifiedError
        }));
      }

      throw error;
    }
  }, [jobId, sessionId, recoveryOptions, loadCheckpoints]);

  /**
   * Creates a checkpoint
   */
  const createCheckpoint = useCallback(async (
    type: CheckpointType,
    data: Record<string, unknown>,
    description?: string
  ) => {
    if (!jobId) throw new Error('Job ID is required for checkpoint creation');

    await recoveryManager.current.createCheckpoint(
      jobId,
      type,
      data,
      { description }
    );

    // Reload checkpoints
    await loadCheckpoints();
  }, [jobId, loadCheckpoints]);

  /**
   * Restores from the latest checkpoint
   */
  const restoreFromCheckpoint = useCallback(async (): Promise<boolean> => {
    if (!jobId) return false;

    setState(prev => ({ ...prev, isRecovering: true }));

    try {
      const result = await recoveryManager.current.restoreFromCheckpoint(jobId);
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isRecovering: false }));
        
        // Reload checkpoints after restore
        await loadCheckpoints();
      }

      return result.success;
    } catch (error) {
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isRecovering: false }));
      }
      console.error('Failed to restore from checkpoint:', error);
      return false;
    }
  }, [jobId, loadCheckpoints]);

  /**
   * Classifies an error
   */
  const classifyError = useCallback((error: Error | any, operation: string): ClassifiedError => {
    return recoveryManager.current.classifyError(error, {
      operation,
      jobId,
      sessionId
    });
  }, [jobId, sessionId]);

  /**
   * Reports an error
   */
  const reportError = useCallback(async (
    error: ClassifiedError,
    userFeedback?: {
      rating: 1 | 2 | 3 | 4 | 5;
      description: string;
      reproductionSteps?: string;
    }
  ): Promise<string> => {
    return recoveryManager.current.reportError(
      error,
      { jobId, sessionId },
      userFeedback
    );
  }, [jobId, sessionId]);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null }));
  }, []);

  /**
   * Tracks a user action
   */
  const trackAction = useCallback((
    type: string, 
    target: string, 
    details?: Record<string, unknown>
  ) => {
    if (trackActions) {
      recoveryManager.current.trackUserAction(type, target, {
        jobId,
        sessionId,
        ...details
      });
    }
  }, [trackActions, jobId, sessionId]);

  // Actions object
  const actions: ErrorRecoveryActions = {
    executeWithRecovery,
    createCheckpoint,
    restoreFromCheckpoint,
    classifyError,
    reportError,
    clearError,
    trackAction,
    loadCheckpoints
  };

  return [state, actions];
}

/**
 * Simplified hook for basic error handling without checkpoints
 */
export function useSimpleErrorRecovery() {
  const [state, setState] = useState<{
    isRetrying: boolean;
    lastError: ClassifiedError | null;
  }>({
    isRetrying: false,
    lastError: null
  });

  const recoveryManager = useRef(ErrorRecoveryManager.getInstance());

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries = 3
  ): Promise<T> => {
    setState(prev => ({ ...prev, isRetrying: true, lastError: null }));

    try {
      const result = await recoveryManager.current.executeWithRecovery(
        operation,
        { operationName },
        {
          enableCheckpointRestore: false,
          enableAutoRetry: true,
          enableErrorReporting: false,
          maxRetries
        }
      );

      setState(prev => ({ 
        ...prev, 
        isRetrying: false,
        lastError: result.error || null
      }));

      if (result.success) {
        return result.data as T;
      } else {
        throw result.error?.originalError || new Error('Operation failed');
      }

    } catch (error: unknown) {
      const classifiedError = recoveryManager.current.classifyError(error, {
        operation: operationName
      });

      setState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: classifiedError
      }));

      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, lastError: null }));
  }, []);

  return {
    ...state,
    executeWithRetry,
    clearError
  };
}

export default useErrorRecovery;