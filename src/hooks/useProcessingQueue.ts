// useProcessingQueue Hook - Managing processing jobs and checkpoints
import { useState, useEffect, useCallback, useRef } from 'react';
import { ProcessingCheckpointManager } from '../services/processingCheckpointManager';
import type { 
  ProcessingCheckpoint,
  ProcessingJob,
  ProcessingQueue,
  CVStep
} from '../types/session';

interface UseProcessingQueueReturn {
  // Queue state
  queue: ProcessingQueue | null;
  checkpoints: ProcessingCheckpoint[];
  loading: boolean;
  error: string | null;
  
  // Queue operations
  initializeQueue: () => Promise<boolean>;
  addJob: (job: Omit<ProcessingJob, 'id' | 'queuedAt'>) => Promise<string | null>;
  pauseQueue: () => Promise<boolean>;
  resumeQueue: () => Promise<boolean>;
  
  // Checkpoint operations
  createCheckpoint: (
    stepId: CVStep,
    functionName: string,
    parameters: Record<string, unknown>,
    featureId?: string
  ) => Promise<ProcessingCheckpoint | null>;
  resumeFromCheckpoint: (checkpointId: string) => Promise<{ success: boolean; result?: unknown; error?: string }>;
  getResumableCheckpoints: () => Promise<ProcessingCheckpoint[]>;
  clearCompletedCheckpoints: () => Promise<number>;
  
  // Queue monitoring
  getQueueStats: () => {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    queuedJobs: number;
    successRate: number;
    averageJobDuration: number;
    isProcessing: boolean;
    isPaused: boolean;
  };
  
  // Checkpoint monitoring
  getActiveCheckpoints: () => ProcessingCheckpoint[];
  getFailedCheckpoints: () => ProcessingCheckpoint[];
  getCompletedCheckpoints: () => ProcessingCheckpoint[];
}

interface UseProcessingQueueOptions {
  sessionId: string;
  autoInitialize?: boolean;
  onJobCompleted?: (jobId: string, result: unknown) => void;
  onJobFailed?: (jobId: string, error: string) => void;
  onCheckpointCreated?: (checkpoint: ProcessingCheckpoint) => void;
  onCheckpointCompleted?: (checkpointId: string, result: unknown) => void;
  onCheckpointFailed?: (checkpointId: string, error: string) => void;
}

export const useProcessingQueue = (options: UseProcessingQueueOptions): UseProcessingQueueReturn => {
  const [queue, setQueue] = useState<ProcessingQueue | null>(null);
  const [checkpoints, setCheckpoints] = useState<ProcessingCheckpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkpointManager = useRef(ProcessingCheckpointManager.getInstance());
  const pollingInterval = useRef<NodeJS.Timeout>();

  // Initialize queue on mount if autoInitialize is enabled
  useEffect(() => {
    if (options.autoInitialize) {
      initializeQueue();
    }

    // Start polling for updates
    startPolling();

    return () => {
      stopPolling();
    };
  }, [options.sessionId, options.autoInitialize]);

  // Polling for queue updates
  const startPolling = useCallback(() => {
    stopPolling(); // Clear any existing interval
    
    pollingInterval.current = setInterval(async () => {
      if (!queue) return;

      try {
        // Refresh checkpoints
        const resumableCheckpoints = await checkpointManager.current.getResumableCheckpoints(options.sessionId);
        setCheckpoints(resumableCheckpoints);
        
        // Update queue status if needed
        // In a real implementation, you might want to fetch updated queue state
        
      } catch (err) {
        console.warn('Error polling queue updates:', err);
      }
    }, 2000); // Poll every 2 seconds
  }, [queue, options.sessionId]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = undefined;
    }
  }, []);

  // Initialize processing queue
  const initializeQueue = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const newQueue = await checkpointManager.current.createProcessingQueue(options.sessionId);
      setQueue(newQueue);

      // Load existing checkpoints
      const existingCheckpoints = await checkpointManager.current.getResumableCheckpoints(options.sessionId);
      setCheckpoints(existingCheckpoints);

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize processing queue';
      setError(message);
      console.error('Error initializing queue:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [options.sessionId]);

  // Add job to queue
  const addJob = useCallback(async (job: Omit<ProcessingJob, 'id' | 'queuedAt'>): Promise<string | null> => {
    if (!queue) {
      setError('Queue not initialized');
      return null;
    }

    try {
      const jobId = await checkpointManager.current.addJobToQueue(options.sessionId, job);
      
      // Refresh queue state
      // In a real implementation, you'd update the local queue state
      
      return jobId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add job to queue';
      setError(message);
      console.error('Error adding job:', err);
      return null;
    }
  }, [queue, options.sessionId]);

  // Pause queue
  const pauseQueue = useCallback(async (): Promise<boolean> => {
    if (!queue) return false;

    try {
      const success = await checkpointManager.current.pauseQueue(options.sessionId);
      
      if (success && queue) {
        setQueue({ ...queue, paused: true });
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause queue';
      setError(message);
      return false;
    }
  }, [queue, options.sessionId]);

  // Resume queue
  const resumeQueue = useCallback(async (): Promise<boolean> => {
    if (!queue) return false;

    try {
      const success = await checkpointManager.current.resumeQueue(options.sessionId);
      
      if (success && queue) {
        setQueue({ ...queue, paused: false });
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume queue';
      setError(message);
      return false;
    }
  }, [queue, options.sessionId]);

  // Create checkpoint
  const createCheckpoint = useCallback(async (
    stepId: CVStep,
    functionName: string,
    parameters: Record<string, unknown>,
    featureId?: string
  ): Promise<ProcessingCheckpoint | null> => {
    try {
      const checkpoint = await checkpointManager.current.createCheckpoint(
        options.sessionId,
        stepId,
        functionName,
        parameters,
        featureId
      );

      // Add to local checkpoints
      setCheckpoints(prev => [...prev, checkpoint]);

      // Trigger callback
      if (options.onCheckpointCreated) {
        options.onCheckpointCreated(checkpoint);
      }

      return checkpoint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create checkpoint';
      setError(message);
      console.error('Error creating checkpoint:', err);
      return null;
    }
  }, [options.sessionId, options.onCheckpointCreated]);

  // Resume from checkpoint
  const resumeFromCheckpoint = useCallback(async (
    checkpointId: string
  ): Promise<{ success: boolean; result?: unknown; error?: string }> => {
    try {
      const result = await checkpointManager.current.resumeFromCheckpoint(options.sessionId, checkpointId);
      
      if (result.success) {
        // Update checkpoint state
        setCheckpoints(prev => prev.map(cp => 
          cp.id === checkpointId 
            ? { ...cp, state: 'completed' as const }
            : cp
        ));

        // Trigger callback
        if (options.onCheckpointCompleted) {
          options.onCheckpointCompleted(checkpointId, result.result);
        }
      } else {
        // Update checkpoint state to failed
        setCheckpoints(prev => prev.map(cp => 
          cp.id === checkpointId 
            ? { ...cp, state: 'failed' as const }
            : cp
        ));

        // Trigger callback
        if (options.onCheckpointFailed) {
          options.onCheckpointFailed(checkpointId, result.error || 'Unknown error');
        }
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume from checkpoint';
      return { success: false, error: message };
    }
  }, [options.sessionId, options.onCheckpointCompleted, options.onCheckpointFailed]);

  // Get resumable checkpoints
  const getResumableCheckpoints = useCallback(async (): Promise<ProcessingCheckpoint[]> => {
    try {
      const resumableCheckpoints = await checkpointManager.current.getResumableCheckpoints(options.sessionId);
      setCheckpoints(resumableCheckpoints);
      return resumableCheckpoints;
    } catch (err) {
      console.error('Error getting resumable checkpoints:', err);
      return [];
    }
  }, [options.sessionId]);

  // Clear completed checkpoints
  const clearCompletedCheckpoints = useCallback(async (): Promise<number> => {
    try {
      const clearedCount = await checkpointManager.current.clearCompletedCheckpoints(options.sessionId);
      
      // Remove completed checkpoints from local state
      setCheckpoints(prev => prev.filter(cp => cp.state !== 'completed'));
      
      return clearedCount;
    } catch (err) {
      console.error('Error clearing completed checkpoints:', err);
      return 0;
    }
  }, [options.sessionId]);

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    if (!queue) {
      return {
        totalJobs: 0,
        completedJobs: 0,
        failedJobs: 0,
        queuedJobs: 0,
        successRate: 0,
        averageJobDuration: 0,
        isProcessing: false,
        isPaused: false
      };
    }

    return {
      totalJobs: queue.totalJobs,
      completedJobs: queue.completedJobs,
      failedJobs: queue.failedJobs,
      queuedJobs: queue.queuedJobs,
      successRate: queue.successRate,
      averageJobDuration: queue.averageJobDuration,
      isProcessing: queue.processing,
      isPaused: queue.paused
    };
  }, [queue]);

  // Get checkpoints by state
  const getActiveCheckpoints = useCallback((): ProcessingCheckpoint[] => {
    return checkpoints.filter(cp => cp.state === 'processing');
  }, [checkpoints]);

  const getFailedCheckpoints = useCallback((): ProcessingCheckpoint[] => {
    return checkpoints.filter(cp => cp.state === 'failed');
  }, [checkpoints]);

  const getCompletedCheckpoints = useCallback((): ProcessingCheckpoint[] => {
    return checkpoints.filter(cp => cp.state === 'completed');
  }, [checkpoints]);

  return {
    // State
    queue,
    checkpoints,
    loading,
    error,
    
    // Queue operations
    initializeQueue,
    addJob,
    pauseQueue,
    resumeQueue,
    
    // Checkpoint operations
    createCheckpoint,
    resumeFromCheckpoint,
    getResumableCheckpoints,
    clearCompletedCheckpoints,
    
    // Monitoring
    getQueueStats,
    getActiveCheckpoints,
    getFailedCheckpoints,
    getCompletedCheckpoints
  };
};

// Utility hook for simpler checkpoint management
export const useCheckpointResume = (sessionId: string) => {
  const [resumableCheckpoints, setResumableCheckpoints] = useState<ProcessingCheckpoint[]>([]);
  const [isResuming, setIsResuming] = useState(false);
  
  const checkpointManager = useRef(ProcessingCheckpointManager.getInstance());

  useEffect(() => {
    loadResumableCheckpoints();
  }, [sessionId]);

  const loadResumableCheckpoints = useCallback(async () => {
    try {
      const checkpoints = await checkpointManager.current.getResumableCheckpoints(sessionId);
      setResumableCheckpoints(checkpoints);
    } catch (err) {
      console.error('Error loading resumable checkpoints:', err);
    }
  }, [sessionId]);

  const resumeCheckpoint = useCallback(async (checkpointId: string) => {
    setIsResuming(true);
    try {
      const result = await checkpointManager.current.resumeFromCheckpoint(sessionId, checkpointId);
      if (result.success) {
        // Remove from resumable checkpoints
        setResumableCheckpoints(prev => prev.filter(cp => cp.id !== checkpointId));
      }
      return result;
    } finally {
      setIsResuming(false);
    }
  }, [sessionId]);

  const hasResumableCheckpoints = resumableCheckpoints.length > 0;
  const criticalCheckpoints = resumableCheckpoints.filter(cp => 
    cp.priority >= 8 && cp.state === 'failed'
  );

  return {
    resumableCheckpoints,
    criticalCheckpoints,
    hasResumableCheckpoints,
    isResuming,
    resumeCheckpoint,
    refreshCheckpoints: loadResumableCheckpoints
  };
};

export default useProcessingQueue;