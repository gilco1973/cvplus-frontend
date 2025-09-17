/**
 * CV Processor Component (Core Orchestrator - T067)
 *
 * Primary orchestrator for CV processing workflow coordination.
 * Manages the complete processing pipeline from upload to final CV generation.
 *
 * Features:
 * - Multi-stage processing pipeline orchestration
 * - Real-time progress tracking and status updates
 * - WebSocket integration for live updates
 * - Error handling and recovery mechanisms
 * - Processing queue management
 * - Feature-specific processing coordination
 * - Performance monitoring and metrics
 *
 * @author Gil Klainert
 * @version 1.0.0 - Initial T067 Implementation
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, X } from 'lucide-react';
import { ProcessingStatus } from './ProcessingStatus';
import { CVUpload } from './CVUpload';
import { GeneratedCVDisplay } from './GeneratedCVDisplay';
import { useCVProcessorLogic } from '../hooks/useCVProcessorLogic';
import { useWebSocketUpdates } from '../hooks/useWebSocketUpdates';
import { processCV, getCVStatus } from '../services/cv-processing.service';
import { cn } from '../utils/autonomous-utils';
import type {
  CVProcessorProps,
  ProcessingJob,
  ProcessingStage,
  ProcessingResult
} from './CVProcessor.types';

export type { CVProcessorProps } from './CVProcessor.types';

/**
 * Processing Stages Definition
 */
const PROCESSING_STAGES: ProcessingStage[] = [
  { id: 'upload', name: 'File Upload & Validation', estimatedDuration: 5 },
  { id: 'extraction', name: 'Content Extraction', estimatedDuration: 10 },
  { id: 'ai-analysis', name: 'AI Analysis & Insights', estimatedDuration: 25 },
  { id: 'ats-optimization', name: 'ATS Optimization', estimatedDuration: 15 },
  { id: 'skills-analysis', name: 'Skills Analysis', estimatedDuration: 10 },
  { id: 'personality-insights', name: 'Personality Insights', estimatedDuration: 15 },
  { id: 'content-enhancement', name: 'Content Enhancement', estimatedDuration: 10 },
  { id: 'multimedia-generation', name: 'Multimedia Generation', estimatedDuration: 20 },
  { id: 'final-assembly', name: 'Final Assembly', estimatedDuration: 8 },
  { id: 'quality-validation', name: 'Quality Validation', estimatedDuration: 2 }
];

export const CVProcessor: React.FC<CVProcessorProps> = ({
  jobId: initialJobId,
  onProcessingComplete,
  onProcessingError,
  onStageUpdate,
  enableWebSocket = true,
  pollInterval = 2000,
  maxRetries = 3,
  enableQueue = false,
  queueCapacity = 5,
  className = '',
  children
}) => {
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [processingQueue, setProcessingQueue] = useState<ProcessingJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalProcessed: 0,
    averageTime: 0,
    successRate: 0
  });

  const processingLogic = useCVProcessorLogic({
    stages: PROCESSING_STAGES,
    maxRetries,
    onStageUpdate
  });

  // WebSocket for real-time updates
  const webSocketData = useWebSocketUpdates({
    enabled: enableWebSocket,
    jobId: currentJob?.id || null,
    onStatusUpdate: handleWebSocketUpdate
  });

  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle WebSocket status updates
   */
  function handleWebSocketUpdate(update: any) {
    if (!currentJob) return;

    setCurrentJob(prev => prev ? {
      ...prev,
      status: update.status,
      progress: update.progress,
      currentStage: update.currentStage,
      stages: update.stages || prev.stages,
      updatedAt: new Date()
    } : null);

    if (onStageUpdate && update.currentStage) {
      onStageUpdate(update.currentStage, update.progress);
    }
  }

  /**
   * Start processing a new CV
   */
  const startProcessing = useCallback(async (
    file: File,
    options: {
      features: string[];
      jobDescription?: string;
      templateId?: string;
    }
  ): Promise<void> => {
    try {
      setError(null);

      // Create processing job
      const newJob: ProcessingJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'queued',
        progress: 0,
        stages: PROCESSING_STAGES.map(stage => ({
          ...stage,
          status: 'pending',
          progress: 0
        })),
        file,
        options,
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0
      };

      // Queue management
      if (enableQueue) {
        if (processingQueue.length >= queueCapacity) {
          throw new Error(`Queue capacity exceeded (${queueCapacity})`);
        }
        setProcessingQueue(prev => [...prev, newJob]);
      }

      // Set as current job if none active
      if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') {
        setCurrentJob(newJob);
        await executeProcessingJob(newJob);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      onProcessingError?.(errorMessage);
    }
  }, [currentJob, processingQueue.length, queueCapacity, enableQueue, onProcessingError]);

  /**
   * Execute processing job
   */
  const executeProcessingJob = useCallback(async (job: ProcessingJob): Promise<void> => {
    try {
      // Update job status
      setCurrentJob(prev => prev ? { ...prev, status: 'processing', updatedAt: new Date() } : null);

      // Start processing with backend
      const processingResult = await processCV({
        file: job.file,
        features: job.options.features,
        jobDescription: job.options.jobDescription,
        templateId: job.options.templateId
      });

      if (!processingResult.success) {
        throw new Error(processingResult.error || 'Processing failed');
      }

      // Start polling for status updates if WebSocket not enabled
      if (!enableWebSocket) {
        startStatusPolling(processingResult.jobId);
      }

      // Update job with backend job ID
      setCurrentJob(prev => prev ? {
        ...prev,
        backendJobId: processingResult.jobId,
        updatedAt: new Date()
      } : null);

    } catch (error) {
      await handleProcessingError(job, error as Error);
    }
  }, [enableWebSocket]);

  /**
   * Start status polling (fallback when WebSocket unavailable)
   */
  const startStatusPolling = useCallback((jobId: string) => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }

    pollingInterval.current = setInterval(async () => {
      try {
        const status = await getCVStatus(jobId);

        if (status.data) {
          handleStatusUpdate(status.data);

          // Stop polling if job completed
          if (status.data.status === 'completed' || status.data.status === 'failed') {
            stopStatusPolling();
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, pollInterval);
  }, [pollInterval]);

  /**
   * Stop status polling
   */
  const stopStatusPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  /**
   * Handle status updates from polling
   */
  const handleStatusUpdate = useCallback((statusData: any) => {
    if (!currentJob) return;

    const updatedJob: ProcessingJob = {
      ...currentJob,
      status: statusData.status,
      progress: statusData.progress || 0,
      currentStage: statusData.currentStage,
      stages: statusData.stages || currentJob.stages,
      result: statusData.result,
      error: statusData.error,
      updatedAt: new Date()
    };

    setCurrentJob(updatedJob);

    // Trigger callbacks
    if (onStageUpdate && statusData.currentStage) {
      onStageUpdate(statusData.currentStage, statusData.progress);
    }

    if (statusData.status === 'completed' && onProcessingComplete) {
      onProcessingComplete(updatedJob.result);
      updateMetrics(updatedJob);
    } else if (statusData.status === 'failed') {
      handleProcessingError(updatedJob, new Error(statusData.error));
    }
  }, [currentJob, onStageUpdate, onProcessingComplete]);

  /**
   * Handle processing errors with retry logic
   */
  const handleProcessingError = useCallback(async (job: ProcessingJob, error: Error) => {
    const canRetry = job.retryCount < maxRetries;

    if (canRetry) {
      // Exponential backoff retry
      const retryDelay = Math.pow(2, job.retryCount) * 1000;
      const timeout = setTimeout(async () => {
        const retryJob = { ...job, retryCount: job.retryCount + 1 };
        await executeProcessingJob(retryJob);
        retryTimeouts.current.delete(job.id);
      }, retryDelay);

      retryTimeouts.current.set(job.id, timeout);

      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'retrying',
        retryCount: job.retryCount + 1,
        error: error.message,
        updatedAt: new Date()
      } : null);
    } else {
      // Max retries reached
      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'failed',
        error: error.message,
        updatedAt: new Date()
      } : null);

      setError(error.message);
      onProcessingError?.(error.message);
    }
  }, [maxRetries, onProcessingError]);

  /**
   * Cancel current processing
   */
  const cancelProcessing = useCallback(() => {
    if (currentJob) {
      // Clear any pending retries
      if (retryTimeouts.current.has(currentJob.id)) {
        clearTimeout(retryTimeouts.current.get(currentJob.id)!);
        retryTimeouts.current.delete(currentJob.id);
      }

      stopStatusPolling();

      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'cancelled',
        updatedAt: new Date()
      } : null);
    }
  }, [currentJob, stopStatusPolling]);

  /**
   * Update performance metrics
   */
  const updateMetrics = useCallback((completedJob: ProcessingJob) => {
    const processingTime = completedJob.updatedAt.getTime() - completedJob.createdAt.getTime();

    setMetrics(prev => ({
      totalProcessed: prev.totalProcessed + 1,
      averageTime: (prev.averageTime * prev.totalProcessed + processingTime) / (prev.totalProcessed + 1),
      successRate: ((prev.successRate * prev.totalProcessed + 1) / (prev.totalProcessed + 1)) * 100
    }));
  }, []);

  /**
   * Process next job in queue
   */
  const processNextInQueue = useCallback(async () => {
    if (processingQueue.length > 0 && (!currentJob || ['completed', 'failed', 'cancelled'].includes(currentJob.status))) {
      const nextJob = processingQueue[0];
      setProcessingQueue(prev => prev.slice(1));
      setCurrentJob(nextJob);
      await executeProcessingJob(nextJob);
    }
  }, [processingQueue, currentJob, executeProcessingJob]);

  // Process queue when current job completes
  useEffect(() => {
    if (enableQueue && currentJob && ['completed', 'failed', 'cancelled'].includes(currentJob.status)) {
      const timeoutId = setTimeout(processNextInQueue, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [enableQueue, currentJob?.status, processNextInQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStatusPolling();
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, [stopStatusPolling]);

  return (
    <div className={cn('cv-processor', className)}>
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Processing Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Queue Status */}
      {enableQueue && processingQueue.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <Clock className="inline h-4 w-4 mr-1" />
            {processingQueue.length} job{processingQueue.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
      )}

      {/* Main Processing Interface */}
      {!currentJob || currentJob.status === 'idle' ? (
        <CVUpload
          onUploadComplete={(result) => {
            // CVUpload handles the file processing
            // CVProcessor orchestrates the workflow
          }}
          onProcessingStart={(file, options) => startProcessing(file, options)}
          className="mb-6"
        />
      ) : (
        <ProcessingStatus
          status={currentJob.status}
          progress={currentJob.progress}
          steps={currentJob.stages}
          currentStep={currentJob.currentStage}
          startTime={currentJob.createdAt}
          estimatedTime={PROCESSING_STAGES.reduce((sum, stage) => sum + stage.estimatedDuration, 0)}
          error={currentJob.error}
          onRetry={() => currentJob && executeProcessingJob(currentJob)}
          className="mb-6"
        />
      )}

      {/* Results Display */}
      {currentJob?.status === 'completed' && currentJob.result && (
        <GeneratedCVDisplay
          cvData={currentJob.result}
          onEdit={() => {/* TODO: Implement edit functionality */}}
          onDownload={() => {/* TODO: Implement download functionality */}}
          onShare={() => {/* TODO: Implement share functionality */}}
          className="mt-6"
        />
      )}

      {/* Processing Controls */}
      {currentJob && ['processing', 'retrying'].includes(currentJob.status) && (
        <div className="mt-4 flex justify-center space-x-3">
          <button
            onClick={cancelProcessing}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
          >
            Cancel Processing
          </button>
        </div>
      )}

      {/* Performance Metrics (Debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</h4>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Total Processed:</span> {metrics.totalProcessed}
            </div>
            <div>
              <span className="font-medium">Avg Time:</span> {(metrics.averageTime / 1000).toFixed(1)}s
            </div>
            <div>
              <span className="font-medium">Success Rate:</span> {metrics.successRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default CVProcessor;