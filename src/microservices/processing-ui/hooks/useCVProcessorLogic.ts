// @ts-ignore
/**
 * CV Processor Logic Hook (T067)
 *
 * Custom React hook that encapsulates the core business logic
 * for CV processing workflow management, stage orchestration,
 * and error handling with recovery mechanisms.
 *
 * @author Gil Klainert
 * @version 1.0.0 - Initial T067 Implementation
  */

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  ProcessingJob,
  ProcessingStage,
  ProcessingJobStatus,
  ErrorRecoveryConfig,
  StageExecutionContext
} from '../components/CVProcessor.types';

interface UseCVProcessorLogicProps {
  /** Processing stages configuration  */
  stages: ProcessingStage[];

  /** Maximum retry attempts  */
  maxRetries: number;

  /** Stage update callback  */
  onStageUpdate?: (stageId: string, progress: number) => void;

  /** Error recovery configuration  */
  errorRecovery?: ErrorRecoveryConfig;

  /** Custom stage handlers  */
  stageHandlers?: Record<string, (context: StageExecutionContext) => Promise<any>>;
}

interface ProcessingState {
  /** Current processing status  */
  status: ProcessingJobStatus;

  /** Overall progress (0-100)  */
  progress: number;

  /** Currently active stage  */
  currentStage?: string;

  /** Processing stages  */
  stages: ProcessingStage[];

  /** Error information  */
  error?: string;

  /** Retry count  */
  retryCount: number;

  /** Stage execution results  */
  stageResults: Record<string, any>;

  /** Processing start time  */
  startTime?: Date;

  /** Estimated completion time  */
  estimatedCompletion?: Date;
}

export const useCVProcessorLogic = ({
  stages,
  maxRetries,
  onStageUpdate,
  errorRecovery = {
    maxRetries,
    retryDelay: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    recoverableErrors: [
      'network_error',
      'timeout',
      'rate_limit',
      'temporary_failure'
    ],
    fallbackStrategies: {}
  },
  stageHandlers = {}
}: UseCVProcessorLogicProps) => {

  const [state, setState] = useState<ProcessingState>({
    status: 'idle',
    progress: 0,
    stages: stages.map(stage => ({ ...stage, status: 'pending', progress: 0 })),
    retryCount: 0,
    stageResults: {}
  });

  const cancellationTokenRef = useRef<{ isCancelled: boolean; cancel: () => void }>({
    isCancelled: false,
    cancel: () => {}
  });

  const stageTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Initialize processing
    */
  const initializeProcessing = useCallback((job: ProcessingJob) => {
    const startTime = new Date();
    const totalDuration = stages.reduce((sum, stage) => sum + stage.estimatedDuration, 0);
    const estimatedCompletion = new Date(startTime.getTime() + totalDuration * 1000);

    // Reset cancellation token
    cancellationTokenRef.current = {
      isCancelled: false,
      cancel: () => {
        cancellationTokenRef.current.isCancelled = true;
      }
    };

    setState({
      status: 'processing',
      progress: 0,
      stages: stages.map(stage => ({ ...stage, status: 'pending', progress: 0 })),
      retryCount: 0,
      stageResults: {},
      startTime,
      estimatedCompletion,
      error: undefined
    });

    return cancellationTokenRef.current;
  }, [stages]);

  /**
   * Execute processing stage
    */
  const executeStage = useCallback(async (
    stageId: string,
    job: ProcessingJob,
    context: Partial<StageExecutionContext> = {}
  ): Promise<any> => {
    const stage = state.stages.find(s => s.id === stageId);
    if (!stage) {
      throw new Error(`Stage ${stageId} not found`);
    }

    // Check for cancellation
    if (cancellationTokenRef.current.isCancelled) {
      throw new Error('Processing cancelled');
    }

    // Update stage status to processing
    setState(prev => ({
      ...prev,
      currentStage: stageId,
      stages: prev.stages.map(s =>
        s.id === stageId
          ? { ...s, status: 'processing', progress: 0 }
          : s
      )
    }));

    onStageUpdate?.(stageId, 0);

    try {
      const stageStartTime = Date.now();

      // Create execution context
      const executionContext: StageExecutionContext = {
        job,
        stageConfig: stage.metadata || {},
        previousResults: state.stageResults,
        environment: {
          sessionId: job.id,
          requestId: `${job.id}_${stageId}_${Date.now()}`,
          timestamp: new Date(),
          ...context.environment
        },
        cancellationToken: cancellationTokenRef.current,
        ...context
      };

      // Execute custom stage handler or default processing
      const handler = stageHandlers[stageId];
      const result = handler
        ? await handler(executionContext)
        : await defaultStageHandler(stageId, executionContext);

      const executionTime = Date.now() - stageStartTime;

      // Update stage as completed
      setState(prev => ({
        ...prev,
        stages: prev.stages.map(s =>
          s.id === stageId
            ? {
                ...s,
                status: 'completed',
                progress: 100,
                actualDuration: executionTime / 1000
              }
            : s
        ),
        stageResults: {
          ...prev.stageResults,
          [stageId]: result
        }
      }));

      onStageUpdate?.(stageId, 100);

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Update stage as failed
      setState(prev => ({
        ...prev,
        stages: prev.stages.map(s =>
          s.id === stageId
            ? { ...s, status: 'failed', error: errorMessage }
            : s
        ),
        error: errorMessage
      }));

      throw error;
    }
  }, [state.stages, state.stageResults, onStageUpdate, stageHandlers]);

  /**
   * Default stage handler (fallback)
    */
  const defaultStageHandler = async (
    stageId: string,
    context: StageExecutionContext
  ): Promise<any> => {
    // Simulate stage processing with progress updates
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      if (context.cancellationToken.isCancelled) {
        throw new Error('Processing cancelled');
      }

      const progress = ((i + 1) / steps) * 100;

      setState(prev => ({
        ...prev,
        stages: prev.stages.map(s =>
          s.id === stageId
            ? { ...s, progress }
            : s
        )
      }));

      onStageUpdate?.(stageId, progress);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { stageId, completed: true, timestamp: new Date() };
  };

  /**
   * Execute all stages in sequence
    */
  const executeAllStages = useCallback(async (job: ProcessingJob): Promise<void> => {
    const cancellationToken = initializeProcessing(job);

    try {
      let completedStages = 0;
      const totalStages = state.stages.length;

      for (const stage of stages) {
        if (cancellationToken.isCancelled) {
          setState(prev => ({ ...prev, status: 'cancelled' }));
          return;
        }

        await executeStage(stage.id, job);
        completedStages++;

        // Update overall progress
        const overallProgress = (completedStages / totalStages) * 100;
        setState(prev => ({ ...prev, progress: overallProgress }));
      }

      // All stages completed successfully
      setState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        currentStage: undefined
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if error is recoverable
      const isRecoverable = isRecoverableError(errorMessage);

      if (isRecoverable && state.retryCount < maxRetries) {
        await handleRecoverableError(job, errorMessage);
      } else {
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: errorMessage
        }));
      }
    }
  }, [stages, state.stages, state.retryCount, maxRetries, initializeProcessing, executeStage]);

  /**
   * Check if error is recoverable
    */
  const isRecoverableError = useCallback((error: string): boolean => {
    return errorRecovery.recoverableErrors.some(pattern =>
      error.toLowerCase().includes(pattern.toLowerCase())
    );
  }, [errorRecovery.recoverableErrors]);

  /**
   * Handle recoverable errors with retry logic
    */
  const handleRecoverableError = useCallback(async (
    job: ProcessingJob,
    error: string
  ): Promise<void> => {
    const retryCount = state.retryCount + 1;

    setState(prev => ({
      ...prev,
      status: 'retrying',
      retryCount,
      error: `Retry ${retryCount}/${maxRetries}: ${error}`
    }));

    // Calculate retry delay
    let delay = errorRecovery.baseDelay;

    if (errorRecovery.retryDelay === 'exponential') {
      delay = Math.min(
        errorRecovery.baseDelay * Math.pow(2, retryCount - 1),
        errorRecovery.maxDelay
      );
    } else if (errorRecovery.retryDelay === 'linear') {
      delay = Math.min(
        errorRecovery.baseDelay * retryCount,
        errorRecovery.maxDelay
      );
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    // Retry processing
    await executeAllStages(job);
  }, [state.retryCount, maxRetries, errorRecovery, executeAllStages]);

  /**
   * Cancel processing
    */
  const cancelProcessing = useCallback(() => {
    cancellationTokenRef.current.cancel();

    // Clear any pending timeouts
    stageTimeouts.current.forEach(timeout => clearTimeout(timeout));
    stageTimeouts.current.clear();

    setState(prev => ({
      ...prev,
      status: 'cancelled',
      currentStage: undefined
    }));
  }, []);

  /**
   * Reset processing state
    */
  const resetProcessing = useCallback(() => {
    cancelProcessing();

    setState({
      status: 'idle',
      progress: 0,
      stages: stages.map(stage => ({ ...stage, status: 'pending', progress: 0 })),
      retryCount: 0,
      stageResults: {},
      error: undefined,
      startTime: undefined,
      estimatedCompletion: undefined
    });
  }, [stages, cancelProcessing]);

  /**
   * Get stage by ID
    */
  const getStage = useCallback((stageId: string) => {
    return state.stages.find(stage => stage.id === stageId);
  }, [state.stages]);

  /**
   * Get stage results
    */
  const getStageResults = useCallback((stageId?: string) => {
    if (stageId) {
      return state.stageResults[stageId];
    }
    return state.stageResults;
  }, [state.stageResults]);

  /**
   * Calculate progress statistics
    */
  const getProgressStats = useCallback(() => {
    const completed = state.stages.filter(s => s.status === 'completed').length;
    const failed = state.stages.filter(s => s.status === 'failed').length;
    const processing = state.stages.filter(s => s.status === 'processing').length;
    const pending = state.stages.filter(s => s.status === 'pending').length;

    return {
      completed,
      failed,
      processing,
      pending,
      total: state.stages.length,
      completionRate: (completed / state.stages.length) * 100
    };
  }, [state.stages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stageTimeouts.current.forEach(timeout => clearTimeout(timeout));
      stageTimeouts.current.clear();
    };
  }, []);

  return {
    // State
    ...state,

    // Actions
    executeAllStages,
    executeStage,
    cancelProcessing,
    resetProcessing,

    // Getters
    getStage,
    getStageResults,
    getProgressStats,

    // Utilities
    isRecoverableError,
    cancellationToken: cancellationTokenRef.current
  };
};