import { useState, useEffect, useRef } from 'react';
import { JobSubscriptionManager } from '../services/JobSubscriptionManager';
import { FeatureConfig } from '../config/featureConfigs';
import { FeatureProgress } from '../components/final-results/FeatureProgressCard';
import type { Job } from '../services/cvService';

// Progress state type
export interface ProgressState {
  [featureId: string]: FeatureProgress;
}

// Progress tracking hook - now using centralized JobSubscriptionManager
export const useProgressTracking = (jobId: string, features: FeatureConfig[]) => {
  const [progressState, setProgressState] = useState<ProgressState>({});
  const [progressUnsubscribe, setProgressUnsubscribe] = useState<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (progressUnsubscribe) {
        progressUnsubscribe();
      }
    };
  }, [progressUnsubscribe]);

  const setupProgressTracking = (trackingFeatures: FeatureConfig[]) => {
    console.warn('📡 [DEBUG] Setting up progress tracking for job:', jobId);
    console.warn('📡 [DEBUG] Tracking features:', trackingFeatures.map(f => ({ id: f.id, name: f.name })));
    
    // Clean up existing subscription
    if (progressUnsubscribe) {
      progressUnsubscribe();
    }
    
    const jobSubscriptionManager = JobSubscriptionManager.getInstance();
    const unsubscribe = jobSubscriptionManager.subscribeToProgress(
      jobId,
      (job: Job | null) => {
        if (!job || !isMountedRef.current) {
          console.warn('📡 [DEBUG] No job data or component unmounted');
          return;
        }
        
        const enhancedFeatures = job.enhancedFeatures || {};
        console.warn('🗺️ [DEBUG] Enhanced features received:', enhancedFeatures);
        
        // Update progress state  
        const newProgressState: ProgressState = {};
        let updatedFeatures = 0;
        let completedFeatures = 0;
        let processingFeatures = 0;
        
        trackingFeatures.forEach(feature => {
          const featureData = enhancedFeatures[feature.id];
          
          if (featureData && typeof featureData === 'object' && !Array.isArray(featureData)) {
            updatedFeatures++;
            
            // Enhanced progress tracking with intermediate states
            const currentProgress = featureData.progress || 0;
            const currentStatus = featureData.status || 'pending';
            
            console.warn(`🔍 [DEBUG] Feature ${feature.id} progress:`, {
              status: currentStatus,
              progress: currentProgress,
              currentStep: featureData.currentStep
            });
            
            // Safe handling of featureData with better status mapping
            const safeFeatureData: FeatureProgress = {
              status: currentStatus,
              progress: currentProgress,
              currentStep: featureData.currentStep,
              error: featureData.error,
              htmlFragment: featureData.htmlFragment,
              processedAt: featureData.processedAt || featureData.completedAt
            };
            
            newProgressState[feature.id] = safeFeatureData;
            
            // Count feature states for summary
            if (safeFeatureData.status === 'completed') {
              completedFeatures++;
            } else if (safeFeatureData.status === 'processing') {
              processingFeatures++;
            }
            
            console.warn(`✅ [DEBUG] Feature ${feature.id} mapped to:`, {
              status: safeFeatureData.status,
              progress: safeFeatureData.progress
            });
          } else {
            // Initialize with pending state
            newProgressState[feature.id] = {
              status: 'pending',
              progress: 0
            };
            
            if (featureData) {
              console.warn(`⚠️ [DEBUG] Feature ${feature.id} has invalid data structure:`, typeof featureData, featureData);
            }
          }
        });
        
        console.warn(`📡 [DEBUG] Progress update: ${updatedFeatures}/${trackingFeatures.length} features have data`);
        console.warn(`📊 [DEBUG] Feature status summary: ${completedFeatures} completed, ${processingFeatures} processing`);
        console.warn(`📊 [DEBUG] New progress state:`, newProgressState);
        
        // Update progress state and trigger re-render
        setProgressState(prevState => {
          // Check if there are actual changes to prevent unnecessary re-renders
          const hasChanges = Object.keys(newProgressState).some(featureId => {
            const prev = prevState[featureId];
            const current = newProgressState[featureId];
            return !prev || 
                   prev.status !== current.status || 
                   prev.progress !== current.progress ||
                   prev.currentStep !== current.currentStep;
          });
          
          if (hasChanges) {
            console.warn(`🔄 [DEBUG] Progress state updated with changes`);
            return newProgressState;
          } else {
            console.warn(`⏭️ [DEBUG] No progress changes detected, keeping previous state`);
            return prevState;
          }
        });
      },
      {
        enableLogging: true,
        debounceMs: 100, // Shorter debounce for faster progress updates
        errorRecovery: true
      }
    );
    
    setProgressUnsubscribe(() => unsubscribe);
  };

  // Initialize progress state for features
  useEffect(() => {
    if (features.length > 0) {
      const initialProgress: ProgressState = {};
      features.forEach(feature => {
        initialProgress[feature.id] = {
          status: 'pending',
          progress: 0
        };
      });
      setProgressState(initialProgress);
      setupProgressTracking(features);
    }
  }, [jobId, features]);

  return {
    progressState,
    setupProgressTracking,
    progressUnsubscribe
  };
};