/**
 * Enhanced Processing Page with Comprehensive Error Recovery
 * 
 * Integrates the error recovery system with checkpoint management,
 * retry mechanisms, and user-friendly error dialogs.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { processCV, type Job } from '../services/cvService';
import { useJobEnhanced } from '../hooks/useJobEnhanced';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { ErrorRecoveryDialog } from '../components/error-recovery/ErrorRecoveryDialog';
import { CheckpointProgressIndicator } from '../components/error-recovery/CheckpointProgressIndicator';
import ErrorRecoveryManager from '../services/error-recovery/ErrorRecoveryManager';
import { CheckpointType, type ProcessingCheckpoint } from '../services/error-recovery/CheckpointManager';
import type { ClassifiedError } from '../services/error-recovery/ErrorClassification';

interface ProcessingStepEnhanced {
  id: string;
  label: string;
  description: string;
  checkpointType: CheckpointType;
  status: 'pending' | 'active' | 'completed' | 'error' | 'restored';
  progress?: number;
}

const PROCESSING_STEPS_ENHANCED: ProcessingStepEnhanced[] = [
  { 
    id: 'upload', 
    label: 'File Uploaded', 
    description: 'Your CV file has been securely uploaded',
    checkpointType: CheckpointType.FILE_UPLOADED,
    status: 'pending' 
  },
  { 
    id: 'analyze', 
    label: 'Analyzing Content', 
    description: 'AI is extracting and analyzing your CV content',
    checkpointType: CheckpointType.PARSING_COMPLETED,
    status: 'pending' 
  },
  { 
    id: 'enhance', 
    label: 'Generating Enhancements', 
    description: 'Creating recommendations and improvements',
    checkpointType: CheckpointType.ANALYSIS_COMPLETED,
    status: 'pending' 
  },
  { 
    id: 'features', 
    label: 'Applying AI Features', 
    description: 'Adding advanced features and optimizations',
    checkpointType: CheckpointType.IMPROVEMENTS_APPLIED,
    status: 'pending' 
  },
  { 
    id: 'media', 
    label: 'Creating Media Content', 
    description: 'Generating multimedia content and final CV',
    checkpointType: CheckpointType.GENERATION_COMPLETED,
    status: 'pending' 
  }
];

export const ProcessingPageEnhanced = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Enhanced job subscription with better error handling
  const {
    job,
    loading: jobLoading,
    error: jobError,
    subscriptionActive,
    retryCount,
    refresh: refreshJob,
    forceRefresh
  } = useJobEnhanced(jobId!, {
    enableRetry: true,
    maxRetries: 3,
    enableLogging: true,
    pollWhenInactive: true, // Fallback to polling for critical processing page
    pollInterval: 15000 // More frequent polling for processing updates
  });

  // State management
  const [steps, setSteps] = useState(PROCESSING_STEPS_ENHANCED);
  const [checkpoints, setCheckpoints] = useState<ProcessingCheckpoint[]>([]);
  const [error, setError] = useState<ClassifiedError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | undefined>();
  
  // Recovery manager
  const [recoveryManager] = useState(() => ErrorRecoveryManager.getInstance());

  // Load checkpoints on mount
  useEffect(() => {
    if (jobId) {
      loadCheckpoints();
      // Enable action tracking for this session
      recoveryManager.setActionTracking(true);
      recoveryManager.trackUserAction('page_load', 'processing_page', { jobId });
    }

    return () => {
      // Disable action tracking when leaving page
      recoveryManager.setActionTracking(false);
    };
  }, [jobId, recoveryManager]);

  // Handle job updates with error recovery
  useEffect(() => {
    if (!job) return;

    const handleJobUpdate = async () => {
      await updateStepsFromJob(job);

      // Handle processing failures
      if (job.status === 'failed' && job.error) {
        const classifiedError = recoveryManager.classifyError(
          new Error(job.error),
          { 
            operation: 'cv_processing', 
            jobId: job.id,
            sessionId: user?.uid 
          }
        );
        setError(classifiedError);
        setShowErrorDialog(true);
        return;
      }

      // Start processing if job is pending
      if (job.status === 'pending' && job.fileUrl) {
        await handleProcessingWithRecovery(job);
      }

      // Navigate to analysis when ready
      if (job.status === 'analyzed' || job.status === 'completed') {
        setTimeout(() => {
          navigate(`/analysis/${jobId}`);
        }, 1500);
      }
    };

    handleJobUpdate();
  }, [job, navigate, user, recoveryManager, jobId]);

  // Handle job subscription errors
  useEffect(() => {
    if (jobError) {
      const classifiedError = recoveryManager.classifyError(
        new Error(jobError),
        { operation: 'job_subscription', jobId: jobId! }
      );
      setError(classifiedError);
      setShowErrorDialog(true);
    }
  }, [jobError, recoveryManager, jobId]);

  /**
   * Loads checkpoints for the current job
   */
  const loadCheckpoints = async () => {
    if (!jobId) return;
    
    try {
      const jobCheckpoints = await recoveryManager.getJobCheckpoints(jobId);
      setCheckpoints(jobCheckpoints);
      
      // Update step statuses based on checkpoints
      const updatedSteps = steps.map(step => {
        const hasCheckpoint = jobCheckpoints.some(cp => cp.type === step.checkpointType);
        if (hasCheckpoint && step.status === 'pending') {
          return { ...step, status: 'restored' as const };
        }
        return step;
      });
      setSteps(updatedSteps);
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    }
  };

  /**
   * Updates processing steps based on job status
   */
  const updateStepsFromJob = async (updatedJob: Job) => {
    const newSteps = [...PROCESSING_STEPS_ENHANCED];
    
    // Update steps based on job status
    if (updatedJob.status !== 'pending') {
      newSteps[0].status = 'completed';
      
      // Create checkpoint for file uploaded
      if (jobId) {
        await createCheckpointSafely(
          jobId,
          CheckpointType.FILE_UPLOADED,
          { fileUrl: updatedJob.fileUrl, mimeType: updatedJob.mimeType }
        );
      }
    }
    
    if (['processing', 'analyzed', 'generating', 'completed'].includes(updatedJob.status)) {
      newSteps[1].status = updatedJob.status === 'processing' ? 'active' : 'completed';
      newSteps[1].progress = updatedJob.status === 'processing' ? 50 : 100;
      
      if (updatedJob.status !== 'processing' && jobId && updatedJob.parsedData) {
        await createCheckpointSafely(
          jobId,
          CheckpointType.PARSING_COMPLETED,
          { parsedData: updatedJob.parsedData }
        );
      }
    }
    
    if (['generating', 'completed'].includes(updatedJob.status)) {
      newSteps[2].status = updatedJob.status === 'generating' ? 'active' : 'completed';
      newSteps[2].progress = updatedJob.status === 'generating' ? 75 : 100;
    }
    
    if (updatedJob.status === 'completed') {
      newSteps[3].status = 'completed';
      newSteps[4].status = 'completed';
      
      if (jobId) {
        await createCheckpointSafely(
          jobId,
          CheckpointType.PROCESSING_COMPLETED,
          { generatedCV: updatedJob.generatedCV }
        );
      }
    }

    setSteps(newSteps);
    
    // Reload checkpoints to get latest updates
    await loadCheckpoints();
  };

  /**
   * Handles CV processing with error recovery
   */
  const handleProcessingWithRecovery = async (job: Job) => {
    if (!jobId || !job.fileUrl) return;

    const result = await recoveryManager.executeWithRecovery(
      async () => {
        return processCV(
          jobId,
          job.fileUrl!,
          job.mimeType || '',
          job.isUrl || false
        );
      },
      {
        operationName: 'cv_processing',
        jobId,
        sessionId: user?.uid,
        checkpointType: CheckpointType.PARSING_STARTED,
        checkpointData: {
          fileUrl: job.fileUrl,
          mimeType: job.mimeType,
          userInstructions: job.userInstructions
        }
      },
      {
        enableCheckpointRestore: true,
        enableAutoRetry: true,
        enableErrorReporting: true,
        maxRetries: 2
      }
    );

    if (!result.success && result.error) {
      setError(result.error);
      setShowErrorDialog(true);
    }
  };

  /**
   * Safely creates a checkpoint without throwing errors
   */
  const createCheckpointSafely = async (
    jobId: string,
    type: CheckpointType,
    data: Record<string, unknown>
  ) => {
    try {
      await recoveryManager.createCheckpoint(jobId, type, data);
    } catch (error) {
      console.warn(`Failed to create checkpoint ${type}:`, error);
    }
  };

  /**
   * Handles retry operation
   */
  const handleRetry = async () => {
    if (!job || !jobId) return;
    
    setIsRetrying(true);
    setShowErrorDialog(false);
    
    recoveryManager.trackUserAction('retry_clicked', 'error_dialog', { 
      errorType: error?.type,
      jobId 
    });

    // Reset error state
    setError(null);
    
    // Retry the processing
    await handleProcessingWithRecovery(job);
    
    setIsRetrying(false);
  };

  /**
   * Handles checkpoint restoration
   */
  const handleRestoreCheckpoint = async () => {
    if (!jobId) return;
    
    setIsRetrying(true);
    setShowErrorDialog(false);
    
    recoveryManager.trackUserAction('restore_checkpoint_clicked', 'error_dialog', { jobId });

    try {
      const restoreResult = await recoveryManager.restoreFromCheckpoint(jobId);
      
      if (restoreResult.success && restoreResult.checkpoint) {
        // Update UI to show restored state
        const updatedSteps = steps.map(step => {
          if (step.checkpointType === restoreResult.checkpoint!.type) {
            return { ...step, status: 'restored' as const };
          }
          return step;
        });
        setSteps(updatedSteps);
        
        // Continue processing from restored state
        if (job) {
          await handleProcessingWithRecovery(job);
        }
      }
    } catch (error) {
      console.error('Failed to restore from checkpoint:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Handles error reporting
   */
  const handleReportError = async (error: ClassifiedError) => {
    recoveryManager.trackUserAction('report_error_clicked', 'error_dialog', { 
      errorId: error.id,
      jobId 
    });

    try {
      const reportId = await recoveryManager.reportError(error, {
        sessionId: user?.uid,
        jobId
      });
      
      console.log(`Error reported with ID: ${reportId}`);
      // Could show a success message here
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  /**
   * Calculates estimated time remaining
   */
  const calculateEstimatedTime = (): number | undefined => {
    const currentStepIndex = steps.findIndex(s => s.status === 'active');
    if (currentStepIndex === -1) return undefined;
    
    const remainingSteps = steps.length - currentStepIndex - 1;
    const avgTimePerStep = 30; // seconds
    
    return remainingSteps * avgTimePerStep;
  };

  // Update estimated time
  useEffect(() => {
    setEstimatedTimeRemaining(calculateEstimatedTime());
  }, [steps]);

  const getCurrentStep = () => {
    return steps.find(s => s.status === 'active')?.id || 'upload';
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const activeStep = steps.find(s => s.status === 'active');
    const activeProgress = activeStep?.progress || 0;
    
    return ((completedSteps * 100) + activeProgress) / steps.length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <Header 
        currentPage="processing" 
        jobId={jobId}
        title="Processing CV"
        subtitle="Your CV is being analyzed and enhanced..."
        variant="dark"
      />

      {/* Processing Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Enhanced Progress Indicator */}
          <CheckpointProgressIndicator
            currentStep={getCurrentStep()}
            steps={steps}
            checkpoints={checkpoints}
            isRetrying={isRetrying}
            error={error?.userMessage || null}
            estimatedTimeRemaining={estimatedTimeRemaining}
            className="animate-fade-in-up"
          />

          {/* Processing Status */}
          {job?.status === 'completed' && (
            <div className="text-center animate-bounce-in">
              <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">All done! Redirecting to results...</p>
              </div>
            </div>
          )}

          {/* Retry Status */}
          {isRetrying && (
            <div className="text-center">
              <div className="bg-orange-900/20 border border-orange-800 rounded-lg p-4">
                <Loader2 className="w-6 h-6 text-orange-400 animate-spin mx-auto mb-2" />
                <p className="text-orange-400 font-medium">Attempting recovery...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Error Recovery Dialog */}
      {error && (
        <ErrorRecoveryDialog
          error={error}
          checkpoint={checkpoints.find(cp => 
            steps.some(step => step.checkpointType === cp.type && step.status !== 'pending')
          )}
          isOpen={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
          onRetry={handleRetry}
          onRestoreCheckpoint={handleRestoreCheckpoint}
          onReportError={handleReportError}
          isRetrying={isRetrying}
          showCheckpointInfo={true}
        />
      )}
    </div>
  );
};

// Export both versions for compatibility
export { ProcessingPageEnhanced as ProcessingPage };