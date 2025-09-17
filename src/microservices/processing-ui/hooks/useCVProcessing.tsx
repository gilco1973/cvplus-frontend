/**
 * CV Processing Hook
 * 
 * Custom React hook for managing CV processing operations including
 * upload, analysis, generation, and status tracking.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import { useState, useCallback, useRef } from 'react';
import { ProcessingStep } from '../components/ProcessingStatus';

export interface CVProcessingOptions {
  templateId?: string;
  features?: string[];
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface CVProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  jobId?: string;
  error?: string;
  result?: any;
  startTime?: Date;
  endTime?: Date;
  steps: ProcessingStep[];
  retryCount: number;
}

export interface CVProcessingActions {
  startProcessing: (file: File, options?: CVProcessingOptions) => Promise<void>;
  retry: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  updateProgress: (progress: number, stepName?: string) => void;
}

export interface UseCVProcessingReturn {
  state: CVProcessingState;
  actions: CVProcessingActions;
  isProcessing: boolean;
  canRetry: boolean;
  processingTime: number | null;
}

export function useCVProcessing(): UseCVProcessingReturn {
  const [state, setState] = useState<CVProcessingState>({
    status: 'idle',
    progress: 0,
    steps: [],
    retryCount: 0
  });

  const lastFileRef = useRef<File | null>(null);
  const lastOptionsRef = useRef<CVProcessingOptions | null>(null);
  const cancelTokenRef = useRef<boolean>(false);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      steps: [],
      retryCount: 0
    });
    lastFileRef.current = null;
    lastOptionsRef.current = null;
    cancelTokenRef.current = false;
  }, []);

  const cancel = useCallback(() => {
    cancelTokenRef.current = true;
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: 'Processing cancelled by user'
    }));
  }, []);

  const updateProgress = useCallback((progress: number, stepName?: string) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      steps: prev.steps.map(step => {
        if (stepName && step.name === stepName) {
          return { ...step, status: 'processing' as const };
        } else if (step.status === 'processing' && stepName && step.name !== stepName) {
          return { ...step, status: 'completed' as const };
        }
        return step;
      })
    }));
  }, []);

  const createProcessingSteps = useCallback((features: string[] = []): ProcessingStep[] => {
    const steps: ProcessingStep[] = [
      {
        id: 'upload',
        name: 'Upload File',
        description: 'Uploading CV file to secure storage',
        status: 'pending'
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

    if (features.includes('ats-optimization')) {
      steps.push({
        id: 'ats',
        name: 'ATS Optimization',
        description: 'Optimizing for Applicant Tracking Systems',
        status: 'pending'
      });
    }

    if (features.includes('skills-analysis')) {
      steps.push({
        id: 'skills',
        name: 'Skills Analysis',
        description: 'Analyzing and categorizing skills',
        status: 'pending'
      });
    }

    if (features.includes('language-enhancement')) {
      steps.push({
        id: 'language',
        name: 'Language Enhancement',
        description: 'Improving language and tone',
        status: 'pending'
      });
    }

    if (features.includes('skills-visualization')) {
      steps.push({
        id: 'visualization',
        name: 'Skills Visualization',
        description: 'Creating visual skill representations',
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
  }, []);

  const simulateStep = useCallback(async (stepName: string, duration: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (cancelTokenRef.current) {
          reject(new Error('Processing cancelled'));
        } else {
          setState(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
              step.name === stepName
                ? { ...step, status: 'completed' as const, duration }
                : step
            )
          }));
          resolve();
        }
      }, duration);

      // Allow cancellation
      if (cancelTokenRef.current) {
        clearTimeout(timeout);
        reject(new Error('Processing cancelled'));
      }
    });
  }, []);

  const startProcessing = useCallback(async (
    file: File,
    options: CVProcessingOptions = {}
  ): Promise<void> => {
    if (state.status === 'processing') {
      return;
    }

    // Store for retry functionality
    lastFileRef.current = file;
    lastOptionsRef.current = options;
    cancelTokenRef.current = false;

    const steps = createProcessingSteps(options.features);
    
    setState(prev => ({
      ...prev,
      status: 'uploading',
      progress: 0,
      startTime: new Date(),
      endTime: undefined,
      error: undefined,
      steps,
      retryCount: prev.retryCount
    }));

    try {
      // Step 1: Upload file
      setState(prev => ({ ...prev, status: 'processing' }));
      updateProgress(10, 'Upload File');
      await simulateStep('Upload File', 1000);

      if (cancelTokenRef.current) throw new Error('Processing cancelled');

      // Step 2: Parse content
      updateProgress(25, 'Parse Content');
      await simulateStep('Parse Content', 1500);

      if (cancelTokenRef.current) throw new Error('Processing cancelled');

      // Step 3: AI Analysis
      updateProgress(45, 'AI Analysis');
      await simulateStep('AI Analysis', 2000);

      if (cancelTokenRef.current) throw new Error('Processing cancelled');

      // Optional features
      let currentProgress = 60;
      const stepDurations = { ats: 1500, skills: 1000, language: 1800, visualization: 1200 };
      
      for (const feature of options.features || []) {
        const stepName = feature.includes('ats') ? 'ATS Optimization' :
                        feature.includes('skills') && !feature.includes('visualization') ? 'Skills Analysis' :
                        feature.includes('language') ? 'Language Enhancement' :
                        feature.includes('visualization') ? 'Skills Visualization' : null;

        if (stepName) {
          updateProgress(currentProgress, stepName);
          const duration = stepDurations[feature.split('-')[0] as keyof typeof stepDurations] || 1000;
          await simulateStep(stepName, duration);
          currentProgress += 15;

          if (cancelTokenRef.current) throw new Error('Processing cancelled');
        }
      }

      // Step: Finalize
      updateProgress(90, 'Finalize');
      await simulateStep('Finalize', 800);

      if (cancelTokenRef.current) throw new Error('Processing cancelled');

      // Generate job ID
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Complete processing
      setState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100,
        endTime: new Date(),
        jobId,
        result: {
          jobId,
          fileName: file.name,
          fileSize: file.size,
          templateId: options.templateId || 'modern',
          features: options.features || [],
          processingTime: Date.now() - (prev.startTime?.getTime() || Date.now())
        },
        steps: prev.steps.map(step => ({ ...step, status: 'completed' as const }))
      }));

    } catch (error: any) {
      if (cancelTokenRef.current && error.message === 'Processing cancelled') {
        return; // Don't update state if cancelled
      }

      const errorMessage = error.message || 'Processing failed';
      
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
        endTime: new Date(),
        steps: prev.steps.map(step =>
          step.status === 'processing'
            ? { ...step, status: 'failed' as const, error: errorMessage }
            : step
        )
      }));

      // Auto-retry if enabled
      if (options.autoRetry && state.retryCount < (options.maxRetries || 3)) {
        setTimeout(() => {
          setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
          startProcessing(file, options);
        }, 2000);
      }
    }
  }, [state.status, state.retryCount, createProcessingSteps, updateProgress, simulateStep]);

  const retry = useCallback(async (): Promise<void> => {
    if (lastFileRef.current && lastOptionsRef.current) {
      setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
      await startProcessing(lastFileRef.current!, lastOptionsRef.current!);
    }
  }, [startProcessing]);

  const isProcessing = state.status === 'uploading' || state.status === 'processing';
  const canRetry = state.status === 'failed' && lastFileRef.current !== null;
  const processingTime = state.startTime && state.endTime
    ? state.endTime.getTime() - state.startTime.getTime()
    : null;

  return {
    state,
    actions: {
      startProcessing,
      retry,
      cancel,
      reset,
      updateProgress
    },
    isProcessing,
    canRetry,
    processingTime
  };
}