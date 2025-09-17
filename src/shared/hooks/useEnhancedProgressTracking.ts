/**
 * Enhanced Progress Tracking Hook
 * Manages real-time progress tracking with enhanced features for async CV generation
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { JobSubscriptionManager } from '../services/JobSubscriptionManager';
import type { Job } from '../types/cv';
import toast from 'react-hot-toast';

// Enhanced progress tracking interfaces
export interface EnhancedFeatureProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  progress: number; // 0-100
  currentStep?: string;
  error?: {
    message: string;
    isRetryable: boolean;
    retryCount: number;
    lastRetryAt?: Date;
  };
  htmlFragment?: string;
  htmlFragmentAvailable: boolean;
  processedAt?: any;
  estimatedTimeRemaining?: number;
  performance?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

export interface ProgressState {
  [featureId: string]: EnhancedFeatureProgress;
}

export interface JobProgress {
  currentProgress: number;
  currentStep: string;
  currentStage: string;
  lastUpdated?: any;
}

interface UseEnhancedProgressTrackingProps {
  jobId: string | undefined;
  trackingFeatures: Array<{ id: string; name: string }>;
  autoRetryEnabled?: boolean;
  onFeatureComplete?: (featureId: string, progress: EnhancedFeatureProgress) => void;
  onAllFeaturesComplete?: () => void;
}

export const useEnhancedProgressTracking = ({
  jobId,
  trackingFeatures,
  autoRetryEnabled = false,
  onFeatureComplete,
  onAllFeaturesComplete
}: UseEnhancedProgressTrackingProps) => {
  // Core state
  const [progressState, setProgressState] = useState<ProgressState>({});
  const [jobProgress, setJobProgress] = useState<JobProgress>({
    currentProgress: 0,
    currentStep: 'Initializing...',
    currentStage: 'initialization'
  });
  const [isProcessingFeatures, setIsProcessingFeatures] = useState(false);
  
  // Refs for cleanup and memory management
  const progressUnsubscribe = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const lastUpdateTime = useRef<number>(Date.now());

  // Progress statistics calculation
  const progressStats = useCallback(() => {
    const features = Object.values(progressState);
    const total = features.length;
    const completed = features.filter(f => f.status === 'completed').length;
    const failed = features.filter(f => f.status === 'failed').length;
    const processing = features.filter(f => f.status === 'processing').length;
    const retrying = features.filter(f => f.status === 'retrying').length;
    
    return {
      total,
      completed,
      failed,
      processing,
      retrying,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [progressState]);

  // Enhanced progress tracking setup
  const setupProgressTracking = useCallback((trackingJobId: string) => {
    if (!trackingJobId || !trackingFeatures.length) return;

    console.warn('🔄 [ENHANCED] Setting up progress tracking for job:', trackingJobId);
    console.warn('📊 [ENHANCED] Tracking features:', trackingFeatures.map(f => f.name));
    
    const jobSubscriptionManager = JobSubscriptionManager.getInstance();
    const unsubscribe = jobSubscriptionManager.subscribeToProgress(
      trackingJobId,
      (job: Job | null) => {
        if (!job || !isMountedRef.current) {
          console.warn('📊 [ENHANCED] No job data or component unmounted');
          return;
        }
        
        const data = job;
      const now = Date.now();
      
      // Reduced throttling for progress tracking - allow more frequent updates
      if (now - lastUpdateTime.current < 100) {
        return;
      }
      lastUpdateTime.current = now;
      
      console.warn('📊 [ENHANCED] Real-time update received:', {
        status: data.status,
        currentProgress: data.currentProgress,
        currentStage: data.currentStage,
        enhancedFeaturesCount: Object.keys(data.enhancedFeatures || {}).length
      });
      
      const enhancedFeatures = data.enhancedFeatures || {};
      
      // Update progress state with enhanced tracking
      const newProgressState: ProgressState = {};
      let completedCount = 0;
      let failedCount = 0;
      let processingCount = 0;
      
      trackingFeatures.forEach(feature => {
        const featureData = enhancedFeatures[feature.id];
        
        if (featureData) {
          const enhancedProgress: EnhancedFeatureProgress = {
            status: featureData.status || 'pending',
            progress: featureData.progress || 0,
            currentStep: featureData.currentStep,
            htmlFragment: featureData.htmlFragment,
            htmlFragmentAvailable: !!featureData.htmlFragment,
            processedAt: featureData.processedAt,
            estimatedTimeRemaining: featureData.estimatedTimeRemaining,
            error: featureData.error ? {
              message: featureData.error,
              isRetryable: featureData.isRetryable || false,
              retryCount: featureData.retryCount || 0,
              lastRetryAt: featureData.lastRetryAt
            } : undefined,
            performance: featureData.startedAt ? {
              startTime: featureData.startedAt.seconds * 1000,
              endTime: featureData.completedAt?.seconds * 1000,
              duration: featureData.completedAt && featureData.startedAt ? 
                (featureData.completedAt.seconds - featureData.startedAt.seconds) * 1000 : undefined
            } : undefined
          };
          
          newProgressState[feature.id] = enhancedProgress;
          
          // Count by status
          if (enhancedProgress.status === 'completed') {
            completedCount++;
            // Trigger completion callback
            if (onFeatureComplete) {
              onFeatureComplete(feature.id, enhancedProgress);
            }
          } else if (enhancedProgress.status === 'failed') {
            failedCount++;
          } else if (enhancedProgress.status === 'processing') {
            processingCount++;
          }
          
          console.warn(`📊 [ENHANCED] Feature ${feature.id}:`, {
            status: enhancedProgress.status,
            progress: enhancedProgress.progress,
            hasHtml: enhancedProgress.htmlFragmentAvailable,
            error: enhancedProgress.error?.message
          });
        } else {
          newProgressState[feature.id] = {
            status: 'pending',
            progress: 0,
            htmlFragmentAvailable: false
          };
        }
      });
      
      setProgressState(newProgressState);
      
      // Update overall job progress
      if (data.currentProgress !== undefined) {
        setJobProgress({
          currentProgress: data.currentProgress,
          currentStep: data.currentStep || 'Processing...',
          currentStage: data.currentStage || 'processing',
          lastUpdated: data.lastProgressUpdate
        });
      }
      
      // Check completion status
      const allCompleted = completedCount === trackingFeatures.length && processingCount === 0;
      setIsProcessingFeatures(!allCompleted);
      
      if (allCompleted) {
        console.warn('🎉 [ENHANCED] All features completed!');
        if (onAllFeaturesComplete) {
          onAllFeaturesComplete();
        }
        
        if (failedCount === 0) {
          toast.success(`All ${completedCount} features completed successfully!`);
        } else {
          toast.warning(`${completedCount} features completed, ${failedCount} failed.`);
        }
      }
      
      console.warn(`📊 [ENHANCED] Progress summary: ${completedCount}/${trackingFeatures.length} completed, ${failedCount} failed, ${processingCount} processing`);
      },
      {
        enableLogging: true,
        debounceMs: 100, // Faster updates for progress tracking
        errorRecovery: true
      }
    );
    
    progressUnsubscribe.current = unsubscribe;
  }, [trackingFeatures, onFeatureComplete, onAllFeaturesComplete]);

  // Initialize progress tracking
  useEffect(() => {
    if (jobId) {
      setupProgressTracking(jobId);
    }
    
    return () => {
      if (progressUnsubscribe.current) {
        progressUnsubscribe.current();
        progressUnsubscribe.current = null;
      }
    };
  }, [jobId, setupProgressTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (progressUnsubscribe.current) {
        progressUnsubscribe.current();
      }
    };
  }, []);

  return {
    progressState,
    jobProgress,
    isProcessingFeatures,
    progressStats: progressStats(),
    setupProgressTracking
  };
};