/**
 * Enhanced useJob Hook
 * 
 * Provides better error handling, performance monitoring, and debugging capabilities
 * while using the centralized subscription manager.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getJob, type Job } from '../services/cvService';
import { jobSubscriptionManager } from '../services/JobSubscriptionManager';
import { logger } from '../utils/logger';

interface UseJobEnhancedOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
  pollWhenInactive?: boolean;
  pollInterval?: number;
}

interface UseJobEnhancedResult {
  job: Job | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  subscriptionActive: boolean;
  retryCount: number;
  refresh: () => Promise<void>;
  forceRefresh: () => void;
}

export const useJobEnhanced = (
  jobId: string,
  options: UseJobEnhancedOptions = {}
): UseJobEnhancedResult => {
  const {
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 2000,
    enableLogging = process.env.NODE_ENV === 'development',
    pollWhenInactive = false,
    pollInterval = 30000
  } = options;

  // State
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Refs
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Callback to handle job updates
  const handleJobUpdate = useCallback((updatedJob: Job | null) => {
    if (!mountedRef.current) return;

    if (enableLogging) {
      logger.debug(`Job update for ${jobId}: ${updatedJob?.status}`);
    }

    setJob(updatedJob);
    setLastUpdate(new Date());
    setError(null);
    setRetryCount(0); // Reset retry count on successful update
    
    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [jobId, enableLogging]);

  // Function to handle subscription errors
  const handleSubscriptionError = useCallback(() => {
    if (!mountedRef.current || !enableRetry) return;

    const currentRetryCount = retryCount + 1;
    setRetryCount(currentRetryCount);

    if (currentRetryCount <= maxRetries) {
      if (enableLogging) {
        logger.debug(`Retrying subscription for ${jobId} (attempt ${currentRetryCount}/${maxRetries})`);
      }

      retryTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setupSubscription();
        }
      }, retryDelay * currentRetryCount); // Exponential backoff
    } else {
      setError(`Failed to subscribe to job after ${maxRetries} attempts`);
      setSubscriptionActive(false);
      
      // Start polling as fallback if enabled
      if (pollWhenInactive) {
        startPolling();
      }
    }
  }, [retryCount, maxRetries, retryDelay, enableLogging, jobId, enableRetry, pollWhenInactive]);

  // Setup subscription
  const setupSubscription = useCallback(() => {
    if (!jobId || unsubscribeRef.current) return;

    try {
      setSubscriptionActive(true);
      setError(null);

      unsubscribeRef.current = jobSubscriptionManager.subscribeToJob(
        jobId,
        (updatedJob) => {
          if (updatedJob) {
            handleJobUpdate(updatedJob);
          } else {
            // Job not found or error occurred
            if (enableLogging) {
              console.warn(`[useJobEnhanced] Job ${jobId} not found or subscription error`);
            }
            handleSubscriptionError();
          }
        },
        {
          enableLogging,
          debounceMs: 100,
          maxRetries: 3
        }
      );

      if (enableLogging) {
        logger.debug(`Subscription established for job: ${jobId}`);
      }
    } catch (err) {
      console.error(`[useJobEnhanced] Failed to setup subscription for ${jobId}:`, err);
      handleSubscriptionError();
    }
  }, [jobId, handleJobUpdate, handleSubscriptionError, enableLogging]);

  // Polling fallback for when subscription fails
  const startPolling = useCallback(() => {
    if (!pollWhenInactive || pollTimeoutRef.current) return;

    if (enableLogging) {
      logger.debug(`Starting polling fallback for job: ${jobId}`);
    }

    const poll = async () => {
      if (!mountedRef.current) return;

      try {
        const jobData = await getJob(jobId);
        handleJobUpdate(jobData);
      } catch (err) {
        console.error(`[useJobEnhanced] Polling error for job ${jobId}:`, err);
      }

      if (mountedRef.current) {
        pollTimeoutRef.current = setTimeout(poll, pollInterval);
      }
    };

    poll();
  }, [jobId, pollInterval, handleJobUpdate, enableLogging, pollWhenInactive]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!jobId) return;

    try {
      setError(null);
      const jobData = await getJob(jobId);
      handleJobUpdate(jobData);
    } catch (err: unknown) {
      setError(err.message || 'Failed to refresh job');
      console.error('Error refreshing job:', err);
    }
  }, [jobId, handleJobUpdate]);

  // Force refresh through subscription manager
  const forceRefresh = useCallback(() => {
    if (!jobId) return;
    jobSubscriptionManager.forceRefresh(jobId);
  }, [jobId]);

  // Main effect to load job and setup subscription
  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      setError('Job ID is required');
      return;
    }

    const loadJob = async () => {
      try {
        setLoading(true);
        setError(null);
        setRetryCount(0);

        if (enableLogging) {
          logger.debug(`Loading job: ${jobId}`);
        }
        
        // Try to get cached job first
        const cachedJob = jobSubscriptionManager.getCurrentJob(jobId);
        if (cachedJob) {
          setJob(cachedJob);
          setLastUpdate(new Date());
          if (enableLogging) {
            logger.debug(`Using cached job data for: ${jobId}`);
          }
        }

        // Get initial job data if not cached
        if (!cachedJob) {
          const initialJob = await getJob(jobId);
          if (initialJob) {
            handleJobUpdate(initialJob);
          } else {
            setError('Job not found');
            setLoading(false);
            return;
          }
        }
        
        // Setup subscription for real-time updates
        setupSubscription();
        
      } catch (err: unknown) {
        setError(err.message || 'Failed to load job');
        console.error('Error loading job:', err);
        
        if (enableRetry) {
          handleSubscriptionError();
        }
      } finally {
        setLoading(false);
      }
    };

    loadJob();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
        pollTimeoutRef.current = null;
      }
      
      setSubscriptionActive(false);
    };
  }, [jobId, setupSubscription, handleJobUpdate, handleSubscriptionError, enableLogging, enableRetry]);

  return {
    job,
    loading,
    error,
    lastUpdate,
    subscriptionActive,
    retryCount,
    refresh,
    forceRefresh
  };
};

export default useJobEnhanced;