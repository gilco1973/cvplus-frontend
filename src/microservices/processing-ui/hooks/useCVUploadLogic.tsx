/**
 * CV Upload Logic Hook
 *
 * Custom hook containing the main upload and processing logic
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import { useCallback } from 'react';
import { DEFAULT_FEATURES } from '../constants/features';
import { uploadFileToStorage, simulateProcessingStep } from '../utils/upload-helpers';
import type { UploadState, ProcessingStep } from '../types/upload';

interface UseCVUploadLogicProps {
  state: UploadState;
  setState: React.Dispatch<React.SetStateAction<UploadState>>;
  maxFileSize: number;
  allowedTypes: string[];
  isPremium: boolean;
  onUploadError?: (error: string) => void;
  onProcessingStart?: (jobId: string, features: string[]) => void;
  onUploadComplete?: (result: any) => void;
}

export function useCVUploadLogic({
  state,
  setState,
  maxFileSize,
  allowedTypes,
  isPremium,
  onUploadError,
  onProcessingStart,
  onUploadComplete
}: UseCVUploadLogicProps) {

  // Initialize processing steps
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

  // Update progress
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
  }, [setState]);

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
  }, [maxFileSize, allowedTypes, isPremium, state.selectedFeatures, setState, onUploadError]);

  // Process all steps
  const processSteps = useCallback(async (startTime: Date, jobId: string) => {
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
  }, [updateProgress, state.selectedFeatures, state.jobDescription, state.currentFile, setState, onUploadComplete]);

  // Error handling
  const handleProcessingError = useCallback((error: any) => {
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
  }, [setState, onUploadError]);

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
  }, [validateFileUpload, initializeSteps, setState, updateProgress, maxFileSize, allowedTypes, onProcessingStart, state.selectedFeatures, processSteps, handleProcessingError]);

  return {
    handleFileSelect
  };
}