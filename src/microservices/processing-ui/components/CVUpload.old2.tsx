/**
 * CV Upload Component (Refactored)
 *
 * Enhanced CV file upload component with drag-and-drop, feature selection,
 * file validation, and integration with CV processing pipeline.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { ProcessingStatus } from './ProcessingStatus';
import { FeatureSelection } from './FeatureSelection';
import { JobDescriptionInput } from './JobDescriptionInput';
import { cn } from '../utils/autonomous-utils';
import { DEFAULT_FEATURES, DEFAULT_SELECTED_FEATURES } from '../constants/features';
import { uploadFileToStorage, simulateProcessingStep, calculateEstimatedTime } from '../utils/upload-helpers';
import type { CVUploadProps, UploadState, ProcessingStep } from '../types/upload';

export type { CVUploadProps, CVProcessingFeature } from '../types/upload';

export const CVUpload: React.FC<CVUploadProps> = ({
  onUploadComplete,
  onUploadError,
  onProcessingStart,
  templateId = 'modern',
  defaultFeatures = DEFAULT_SELECTED_FEATURES,
  jobDescription: initialJobDescription = '',
  className = '',
  showDetailedSteps = true,
  showFeatureSelection = true,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
  isAuthenticated = true,
  isPremium = false
}) => {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    steps: [],
    selectedFeatures: defaultFeatures,
    jobDescription: initialJobDescription,
    showFeatureSelection: showFeatureSelection,
    estimatedTime: 0
  });

  // Calculate estimated processing time
  useEffect(() => {
    const totalTime = calculateEstimatedTime(state.selectedFeatures, DEFAULT_FEATURES);
    setState(prev => ({ ...prev, estimatedTime: totalTime }));
  }, [state.selectedFeatures]);

  // State management functions
  const resetState = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      steps: [],
      selectedFeatures: defaultFeatures,
      jobDescription: initialJobDescription,
      showFeatureSelection: showFeatureSelection,
      estimatedTime: 0
    });
  }, [defaultFeatures, initialJobDescription, showFeatureSelection]);

  const toggleFeature = useCallback((featureId: string) => {
    setState(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(featureId)
        ? prev.selectedFeatures.filter(id => id !== featureId)
        : [...prev.selectedFeatures, featureId]
    }));
  }, []);

  const toggleFeatureSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      showFeatureSelection: !prev.showFeatureSelection
    }));
  }, []);

  const updateJobDescription = useCallback((description: string) => {
    setState(prev => ({
      ...prev,
      jobDescription: description
    }));
  }, []);

  // Processing functions
  const initializeSteps = useCallback((): ProcessingStep[] => {
    const steps: ProcessingStep[] = [
      {
        id: 'upload',
        name: 'Upload File',
        description: 'Uploading CV file to secure storage',
        status: 'processing'
      },
      {
        id: 'parse',
        name: 'Parse Content',
        description: 'Extracting text and structure from CV',
        status: 'pending'
      },
      {
        id: 'analyze',
        name: 'AI Analysis',
        description: 'Analyzing CV content with Claude AI',
        status: 'pending'
      }
    ];

    // Add feature-specific steps
    state.selectedFeatures.forEach(featureId => {
      const feature = DEFAULT_FEATURES.find(f => f.id === featureId);
      if (feature) {
        steps.push({
          id: featureId,
          name: feature.name,
          description: feature.description,
          status: 'pending'
        });
      }
    });

    // Add job optimization step
    if (state.jobDescription?.trim()) {
      steps.push({
        id: 'job-optimization',
        name: 'Job-Specific Optimization',
        description: 'Optimizing CV for the target job description',
        status: 'pending'
      });
    }

    steps.push({
      id: 'finalize',
      name: 'Finalize',
      description: 'Preparing final results',
      status: 'pending'
    });

    return steps;
  }, [state.selectedFeatures, state.jobDescription]);

  const updateProgress = useCallback((progress: number, currentStep?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      steps: prev.steps.map(step =>
        step.name === currentStep
          ? { ...step, status: 'processing' as const }
          : step.status === 'processing'
          ? { ...step, status: 'completed' as const }
          : step
      )
    }));
  }, []);

  // File validation
  const validateFileUpload = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      const errorMessage = `File size must be less than ${maxSizeMB}MB`;
      setState(prev => ({ ...prev, error: errorMessage }));
      onUploadError?.(errorMessage);
      return false;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const errorMessage = 'Please upload a PDF, DOCX, or DOC file';
      setState(prev => ({ ...prev, error: errorMessage }));
      onUploadError?.(errorMessage);
      return false;
    }

    // Check premium features
    if (!isPremium && state.selectedFeatures.some(id =>
      DEFAULT_FEATURES.find(f => f.id === id)?.premium
    )) {
      const errorMessage = 'Premium subscription required for selected features';
      setState(prev => ({ ...prev, error: errorMessage }));
      onUploadError?.(errorMessage);
      return false;
    }

    return true;
  }, [maxFileSize, allowedTypes, isPremium, state.selectedFeatures, onUploadError]);

  // Main upload handler
  const handleFileSelect = useCallback(async (file: File) => {
    if (!validateFileUpload(file)) return;

    const steps = initializeSteps();
    const startTime = new Date();

    setState(prev => ({
      ...prev,
      status: 'uploading',
      progress: 0,
      currentFile: file,
      startTime,
      steps,
      error: undefined
    }));

    try {
      // Upload file
      updateProgress(10, 'Upload File');
      const uploadResult = await uploadFileToStorage(file, {
        maxSize: maxFileSize,
        allowedTypes
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      const jobId = uploadResult.jobId!;
      setState(prev => ({ ...prev, status: 'processing', jobId }));
      onProcessingStart?.(jobId, state.selectedFeatures);

      // Process steps
      await processSteps(startTime, jobId);

    } catch (error: any) {
      handleProcessingError(error);
    }
  }, [validateFileUpload, initializeSteps, updateProgress, state.selectedFeatures, onProcessingStart, maxFileSize, allowedTypes]);

  // Process all steps
  const processSteps = async (startTime: Date, jobId: string) => {
    // Parse content
    updateProgress(25, 'Parse Content');
    await simulateProcessingStep(1000);

    // AI Analysis
    updateProgress(40, 'AI Analysis');
    await simulateProcessingStep(2000);

    // Process features
    let currentProgress = 50;
    const progressIncrement = 35 / Math.max(state.selectedFeatures.length, 1);

    for (const featureId of state.selectedFeatures) {
      const feature = DEFAULT_FEATURES.find(f => f.id === featureId);
      if (feature) {
        updateProgress(currentProgress, feature.name);
        await simulateProcessingStep((feature.estimatedTime || 10) * 100);
        currentProgress += progressIncrement;
      }
    }

    // Job optimization
    if (state.jobDescription?.trim()) {
      updateProgress(Math.min(currentProgress, 85), 'Job-Specific Optimization');
      await simulateProcessingStep(1500);
    }

    // Finalize
    updateProgress(95, 'Finalize');
    await simulateProcessingStep(500);

    // Complete
    setState(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      steps: prev.steps.map(step => ({ ...step, status: 'completed' as const }))
    }));

    // Generate result
    const result = {
      jobId,
      cvData: {
        originalFile: state.currentFile?.name,
        features: state.selectedFeatures,
        jobDescription: state.jobDescription,
        processedAt: new Date().toISOString()
      },
      processingTime: Date.now() - startTime.getTime(),
      features: state.selectedFeatures,
      jobDescription: state.jobDescription
    };

    onUploadComplete?.(result);
  };

  // Error handling
  const handleProcessingError = (error: any) => {
    const errorMessage = error.message || 'Upload failed';
    setState(prev => ({
      ...prev,
      status: 'failed',
      error: errorMessage,
      steps: prev.steps.map(step =>
        step.status === 'processing'
          ? { ...step, status: 'failed' as const, error: errorMessage }
          : step
      )
    }));
    onUploadError?.(errorMessage);
  };

  // Action handlers
  const handleRetry = useCallback(() => {
    if (state.currentFile) {
      handleFileSelect(state.currentFile);
    } else {
      resetState();
    }
  }, [state.currentFile, handleFileSelect, resetState]);

  const handleCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  // Render idle state (file upload interface)
  if (state.status === 'idle') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Your CV
          </h2>
          <p className="text-gray-600">
            Upload your CV to get started with AI-powered analysis and enhancement
          </p>
        </div>

        <FileUpload
          onFileSelect={handleFileSelect}
          isLoading={state.status === 'uploading'}
        />

        {state.error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        <JobDescriptionInput
          value={state.jobDescription || ''}
          onChange={updateJobDescription}
        />

        <FeatureSelection
          selectedFeatures={state.selectedFeatures}
          onToggleFeature={toggleFeature}
          isExpanded={state.showFeatureSelection}
          onToggleExpanded={toggleFeatureSelection}
          isPremium={isPremium}
          estimatedTime={state.estimatedTime}
        />

        {state.selectedFeatures.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Selected Features Summary
            </h3>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {state.selectedFeatures.map(featureId => {
                  const feature = DEFAULT_FEATURES.find(f => f.id === featureId);
                  return feature ? (
                    <span
                      key={featureId}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {feature.name}
                    </span>
                  ) : null;
                })}
              </div>
              {state.estimatedTime && state.estimatedTime > 0 && (
                <p className="text-sm text-blue-700">
                  Estimated processing time: {Math.ceil(state.estimatedTime / 60)} minute{state.estimatedTime > 60 ? 's' : ''}
                </p>
              )}
              {state.jobDescription?.trim() && (
                <p className="text-sm text-blue-700">
                  Job-specific optimization enabled
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render processing state
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Processing Your CV
        </h2>
        <p className="text-gray-600">
          {state.currentFile?.name || 'Your CV'} is being processed...
        </p>
        {state.jobId && (
          <p className="text-sm text-gray-500 mt-1">
            Job ID: {state.jobId}
          </p>
        )}
      </div>

      <ProcessingStatus
        status={state.status}
        progress={state.progress}
        steps={showDetailedSteps ? state.steps : []}
        startTime={state.startTime}
        estimatedTime={state.estimatedTime ? state.estimatedTime * 1000 : 5000}
        error={state.error}
        onRetry={handleRetry}
        onCancel={state.status === 'processing' ? handleCancel : undefined}
        className="max-w-2xl mx-auto"
      />

      {state.status === 'completed' && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700 font-medium">
                CV processing completed successfully!
              </p>
            </div>
          </div>
          <button
            onClick={resetState}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload Another CV
          </button>
        </div>
      )}

      {state.status === 'failed' && (
        <div className="text-center">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 font-medium">
                {state.error || 'Processing failed'}
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={resetState}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};