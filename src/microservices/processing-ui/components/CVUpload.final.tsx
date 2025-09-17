/**
 * CV Upload Component (Final - Under 200 lines)
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
import { calculateEstimatedTime } from '../utils/upload-helpers';
import { useCVUploadLogic } from '../hooks/useCVUploadLogic';
import type { CVUploadProps, UploadState } from '../types/upload';

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

  // Use upload logic hook
  const { handleFileSelect } = useCVUploadLogic({
    state,
    setState,
    maxFileSize,
    allowedTypes,
    isPremium,
    onUploadError,
    onProcessingStart,
    onUploadComplete
  });

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
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
            <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Features Summary</h3>
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
                <p className="text-sm text-blue-700">Job-specific optimization enabled</p>
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your CV</h2>
        <p className="text-gray-600">
          {state.currentFile?.name || 'Your CV'} is being processed...
        </p>
        {state.jobId && (
          <p className="text-sm text-gray-500 mt-1">Job ID: {state.jobId}</p>
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