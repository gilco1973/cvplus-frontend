/**
 * CV Upload Component (Minimal - Under 200 lines)
 *
 * Enhanced CV file upload component with drag-and-drop, feature selection,
 * file validation, and integration with CV processing pipeline.
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CVUploadIdle } from './CVUploadIdle';
import { CVUploadProcessing } from './CVUploadProcessing';
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

  // Render appropriate state
  if (state.status === 'idle') {
    return (
      <CVUploadIdle
        state={state}
        isPremium={isPremium}
        className={className}
        onFileSelect={handleFileSelect}
        onUpdateJobDescription={updateJobDescription}
        onToggleFeature={toggleFeature}
        onToggleFeatureSelection={toggleFeatureSelection}
      />
    );
  }

  return (
    <CVUploadProcessing
      state={state}
      showDetailedSteps={showDetailedSteps}
      className={className}
      onRetry={handleRetry}
      onReset={resetState}
      onCancel={state.status === 'processing' ? handleCancel : undefined}
    />
  );
};