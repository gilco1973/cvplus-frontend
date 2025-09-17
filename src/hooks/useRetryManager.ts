/**
 * Retry Manager Hook
 * Manages retry functionality for failed CV generation features
 */

import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import toast from 'react-hot-toast';

// Retry configuration interface
export interface RetryConfig {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential';
  retryableErrors: string[];
  autoRetryEnabled: boolean;
  retryDelay: number;
}

// Retry attempt tracking
export interface RetryAttempt {
  timestamp: Date;
  featureId: string;
  attempt: number;
  success: boolean;
  error?: string;
}

// Default retry configurations
const RETRY_CONFIGS: Record<string, RetryConfig> = {
  'network-error': {
    maxRetries: 3,
    backoffStrategy: 'exponential',
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT', 'INTERNAL_ERROR'],
    autoRetryEnabled: true,
    retryDelay: 2000
  },
  'processing-error': {
    maxRetries: 1,
    backoffStrategy: 'linear',
    retryableErrors: ['PROCESSING_FAILED', 'TEMPORARY_ERROR'],
    autoRetryEnabled: false,
    retryDelay: 5000
  },
  'service-error': {
    maxRetries: 2,
    backoffStrategy: 'exponential',
    retryableErrors: ['SERVICE_UNAVAILABLE', 'QUOTA_EXCEEDED'],
    autoRetryEnabled: true,
    retryDelay: 3000
  }
};

interface UseRetryManagerProps {
  jobId: string | undefined;
  onRetryStart?: (featureId: string) => void;
  onRetrySuccess?: (featureId: string) => void;
  onRetryFailure?: (featureId: string, error: string) => void;
}

export const useRetryManager = ({
  jobId,
  onRetryStart,
  onRetrySuccess,
  onRetryFailure
}: UseRetryManagerProps) => {
  // State for tracking retry attempts
  const [retryHistory, setRetryHistory] = useState<Map<string, RetryAttempt[]>>(new Map());
  const [activeRetries, setActiveRetries] = useState<Set<string>>(new Set());

  // Get retry configuration for error type
  const getRetryConfig = useCallback((error: string): RetryConfig => {
    const errorType = error.toLowerCase();
    
    if (errorType.includes('network') || errorType.includes('timeout')) {
      return RETRY_CONFIGS['network-error'];
    } else if (errorType.includes('processing') || errorType.includes('temporary')) {
      return RETRY_CONFIGS['processing-error'];
    } else if (errorType.includes('service') || errorType.includes('quota')) {
      return RETRY_CONFIGS['service-error'];
    }
    
    // Default conservative configuration
    return {
      maxRetries: 1,
      backoffStrategy: 'linear',
      retryableErrors: [],
      autoRetryEnabled: false,
      retryDelay: 5000
    };
  }, []);

  // Calculate backoff delay based on retry count and strategy
  const calculateBackoffDelay = useCallback((
    retryCount: number, 
    strategy: 'linear' | 'exponential',
    baseDelay: number
  ): number => {
    if (strategy === 'exponential') {
      return baseDelay * Math.pow(2, retryCount);
    } else {
      return baseDelay * (retryCount + 1);
    }
  }, []);

  // Check if feature should be auto-retried
  const shouldAutoRetry = useCallback((featureId: string, error: string): boolean => {
    const config = getRetryConfig(error);
    const attempts = retryHistory.get(featureId) || [];
    
    return config.autoRetryEnabled && 
           attempts.length < config.maxRetries &&
           config.retryableErrors.some(retryableError => 
             error.toLowerCase().includes(retryableError.toLowerCase())
           );
  }, [retryHistory, getRetryConfig]);

  // Check if manual retry is available
  const canManualRetry = useCallback((featureId: string, error: string): boolean => {
    const config = getRetryConfig(error);
    const attempts = retryHistory.get(featureId) || [];
    
    return attempts.length < config.maxRetries &&
           config.retryableErrors.some(retryableError => 
             error.toLowerCase().includes(retryableError.toLowerCase())
           );
  }, [retryHistory, getRetryConfig]);

  // Get retry count for a feature
  const getRetryCount = useCallback((featureId: string): number => {
    const attempts = retryHistory.get(featureId) || [];
    return attempts.length;
  }, [retryHistory]);

  // Add retry attempt to history
  const addRetryAttempt = useCallback((featureId: string, success: boolean, error?: string) => {
    setRetryHistory(prev => {
      const newHistory = new Map(prev);
      const attempts = newHistory.get(featureId) || [];
      const newAttempt: RetryAttempt = {
        timestamp: new Date(),
        featureId,
        attempt: attempts.length + 1,
        success,
        error
      };
      
      newHistory.set(featureId, [...attempts, newAttempt]);
      return newHistory;
    });
  }, []);

  // Retry a specific feature
  const retryFeature = useCallback(async (featureId: string): Promise<boolean> => {
    if (!jobId || activeRetries.has(featureId)) {
      console.warn(`Cannot retry ${featureId}: ${!jobId ? 'No jobId' : 'Already retrying'}`);
      return false;
    }

    try {
      console.warn(`🔄 [RETRY] Attempting to retry feature: ${featureId}`);
      
      // Mark as active retry
      setActiveRetries(prev => new Set(prev).add(featureId));
      
      if (onRetryStart) {
        onRetryStart(featureId);
      }
      
      // Call the retry feature function (if it exists)
      // For now, we'll call the main generateCV function with just this feature
      const retryFeatureFunction = httpsCallable(functions, 'generateCV');
      
      await retryFeatureFunction({
        jobId,
        templateId: 'modern', // Default template
        features: [featureId]
      });
      
      console.warn(`✅ [RETRY] Feature ${featureId} retry initiated successfully`);
      
      // Add successful retry attempt
      addRetryAttempt(featureId, true);
      
      if (onRetrySuccess) {
        onRetrySuccess(featureId);
      }
      
      toast.success(`Retrying ${featureId.replace(/-/g, ' ')}...`);
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ [RETRY] Failed to retry feature ${featureId}:`, errorMessage);
      
      // Add failed retry attempt
      addRetryAttempt(featureId, false, errorMessage);
      
      if (onRetryFailure) {
        onRetryFailure(featureId, errorMessage);
      }
      
      toast.error(`Failed to retry ${featureId.replace(/-/g, ' ')}: ${errorMessage}`);
      return false;
      
    } finally {
      // Remove from active retries
      setActiveRetries(prev => {
        const newSet = new Set(prev);
        newSet.delete(featureId);
        return newSet;
      });
    }
  }, [jobId, activeRetries, addRetryAttempt, onRetryStart, onRetrySuccess, onRetryFailure]);

  // Auto-retry a feature after delay
  const autoRetryFeature = useCallback(async (featureId: string, error: string): Promise<void> => {
    if (!shouldAutoRetry(featureId, error)) {
      return;
    }

    const config = getRetryConfig(error);
    const retryCount = getRetryCount(featureId);
    const delay = calculateBackoffDelay(retryCount, config.backoffStrategy, config.retryDelay);

    console.warn(`⏳ [AUTO-RETRY] Scheduling auto-retry for ${featureId} in ${delay}ms`);
    
    setTimeout(async () => {
      const success = await retryFeature(featureId);
      if (success) {
        console.warn(`✅ [AUTO-RETRY] Auto-retry successful for ${featureId}`);
      } else {
        console.warn(`❌ [AUTO-RETRY] Auto-retry failed for ${featureId}`);
      }
    }, delay);
  }, [shouldAutoRetry, getRetryConfig, getRetryCount, calculateBackoffDelay, retryFeature]);

  // Get retry status for a feature
  const getRetryStatus = useCallback((featureId: string, error?: string) => {
    const isRetrying = activeRetries.has(featureId);
    const retryCount = getRetryCount(featureId);
    const canRetry = error ? canManualRetry(featureId, error) : false;
    const willAutoRetry = error ? shouldAutoRetry(featureId, error) : false;
    const attempts = retryHistory.get(featureId) || [];
    
    return {
      isRetrying,
      retryCount,
      canRetry,
      willAutoRetry,
      attempts,
      maxRetries: error ? getRetryConfig(error).maxRetries : 0
    };
  }, [activeRetries, getRetryCount, canManualRetry, shouldAutoRetry, retryHistory, getRetryConfig]);

  return {
    retryFeature,
    autoRetryFeature,
    getRetryStatus,
    canManualRetry,
    shouldAutoRetry,
    getRetryCount,
    retryHistory,
    activeRetries: Array.from(activeRetries)
  };
};