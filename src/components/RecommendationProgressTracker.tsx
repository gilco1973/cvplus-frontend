import React, { useState, useEffect } from 'react';
import { JobSubscriptionManager } from '../services/JobSubscriptionManager';
import type { Job } from '../services/cvService';

interface ProgressTrackerProps {
  jobId: string;
  isActive: boolean;
  onComplete?: (success: boolean, error?: string) => void;
  onTimeout?: () => void;
}

interface JobProgress {
  status: string;
  processingProgress?: string;
  processingStage?: number;
  totalStages?: number;
  processingStartTime?: string;
  error?: string;
  failureReason?: string;
  recommendationCount?: number;
  processingTime?: number;
}

const RecommendationProgressTracker: React.FC<ProgressTrackerProps> = ({
  jobId,
  isActive,
  onComplete,
  onTimeout
}) => {
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Progress messages for different stages
  const getProgressMessage = (stage?: number, totalStages?: number, customMessage?: string) => {
    if (customMessage) return customMessage;
    
    if (!stage || !totalStages) return 'Initializing analysis...';
    
    switch (stage) {
      case 1:
        return 'Analyzing CV structure and content...';
      case 2:
        return 'Generating AI-powered recommendations...';
      case 3:
        return 'Validating and optimizing suggestions...';
      default:
        return `Processing stage ${stage} of ${totalStages}...`;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (stage?: number, totalStages?: number) => {
    if (!stage || !totalStages) return 10;
    return Math.round((stage / totalStages) * 90) + 10; // 10% base + up to 90%
  };

  // Get progress color based on status and time
  const getProgressColor = (status: string, elapsed: number) => {
    if (status === 'failed') return 'bg-red-500';
    if (status === 'analyzed') return 'bg-green-500';
    if (elapsed > 120000) return 'bg-yellow-500'; // Yellow after 2 minutes
    return 'bg-blue-500';
  };

  // Format time duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Set up real-time listener for job progress
  useEffect(() => {
    if (!isActive || !jobId) {
      setProgress(null);
      setElapsedTime(0);
      setStartTime(null);
      return;
    }

    console.log(`[ProgressTracker] Starting monitoring for job ${jobId}`);
    setStartTime(new Date());

    const jobSubscriptionManager = JobSubscriptionManager.getInstance();
    const unsubscribe = jobSubscriptionManager.subscribeToProgress(
      jobId,
      (job: Job | null) => {
        if (job) {
          const data = job as any; // Cast to JobProgress interface
          setProgress(data);
          
          console.log(`[ProgressTracker] Status update:`, {
            status: data.status,
            progress: data.processingProgress,
            stage: data.processingStage,
            error: data.error
          });

          // Handle completion
          if (data.status === 'analyzed' && data.recommendationCount !== undefined) {
            console.log(`[ProgressTracker] Analysis completed with ${data.recommendationCount} recommendations`);
            onComplete?.(true);
          } else if (data.status === 'failed') {
            console.log(`[ProgressTracker] Analysis failed:`, data.error);
            onComplete?.(false, data.error);
          }
        } else {
          console.warn('[ProgressTracker] No job data received');
        }
      },
      {
        enableLogging: true,
        debounceMs: 500, // Longer debounce for recommendation progress
        errorRecovery: true
      }
    );

    return () => {
      console.log(`[ProgressTracker] Cleaning up listener for job ${jobId}`);
      unsubscribe();
    };
  }, [isActive, jobId, onComplete]);

  // Update elapsed time
  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.getTime();
      setElapsedTime(elapsed);

      // Check for timeout (5 minutes)
      if (elapsed > 300000) { // 5 minutes
        console.warn('[ProgressTracker] Request timeout detected');
        onTimeout?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, onTimeout]);

  if (!isActive || !progress) {
    return null;
  }

  const progressPercentage = getProgressPercentage(progress.processingStage, progress.totalStages);
  const progressColor = getProgressColor(progress.status, elapsedTime);
  const message = getProgressMessage(progress.processingStage, progress.totalStages, progress.processingProgress);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {progress.status === 'generating_recommendations' ? 'Analyzing Your CV' : 'Processing'}
        </h3>
        <div className="text-sm text-gray-500">
          {formatDuration(elapsedTime)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{message}</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="h-full bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stage Indicators */}
      {progress.totalStages && (
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: progress.totalStages }, (_, i) => i + 1).map((stage) => (
            <div key={stage} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  stage <= (progress.processingStage || 0)
                    ? 'bg-blue-500 text-white'
                    : stage === (progress.processingStage || 0) + 1
                    ? 'bg-blue-100 text-blue-500 animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {stage <= (progress.processingStage || 0) ? '✓' : stage}
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center max-w-20">
                {stage === 1 ? 'Analyze' : stage === 2 ? 'Generate' : 'Validate'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Messages */}
      <div className="space-y-2">
        {progress.status === 'generating_recommendations' && (
          <div className="flex items-center text-sm text-blue-600">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            Our AI is carefully analyzing your CV to provide personalized recommendations
          </div>
        )}

        {elapsedTime > 60000 && elapsedTime < 120000 && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⏱️ This is taking longer than usual. Your CV might be complex or detailed, which requires more thorough analysis.
          </div>
        )}

        {elapsedTime > 120000 && elapsedTime < 240000 && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            🔍 Deep analysis in progress. We're ensuring you get the highest quality recommendations possible.
          </div>
        )}

        {elapsedTime > 240000 && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            ⚠️ This is taking significantly longer than expected. The analysis should complete within the next minute.
          </div>
        )}

        {progress.status === 'failed' && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            <div className="font-semibold mb-1">Analysis Failed</div>
            <div>
              {progress.failureReason === 'timeout' 
                ? 'The analysis timed out. This usually happens with very large or complex CVs. Please try with a shorter CV or contact support.'
                : progress.error || 'An unexpected error occurred. Please try again.'
              }
            </div>
          </div>
        )}

        {progress.status === 'analyzed' && progress.recommendationCount !== undefined && (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
            ✅ Analysis complete! Generated {progress.recommendationCount} personalized recommendations 
            {progress.processingTime && ` in ${formatDuration(progress.processingTime)}`}
          </div>
        )}
      </div>

      {/* Tips while waiting */}
      {elapsedTime > 30000 && progress.status === 'generating_recommendations' && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <div className="font-semibold mb-2">💡 Did you know?</div>
          <div>
            Our AI analyzes hundreds of factors in your CV including keyword optimization, 
            ATS compatibility, and industry-specific improvements to give you the most 
            effective recommendations possible.
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationProgressTracker;