import { useState, useRef } from 'react';
import { generateCV, generateEnhancedPodcast, getJob } from '../services/cvService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import type { Job } from '../types/cv';
import toast from 'react-hot-toast';
import { getErrorMessage, logError } from '../utils/errorHandling';

interface CVGenerationConfig {
  template?: string;
  features?: Record<string, boolean>;
  asyncMode?: boolean;
  initResponse?: any;
}

export const useCVGeneration = (jobId: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTriggeredGeneration = useRef(false);
  const isMountedRef = useRef(true);

  const triggerCVGeneration = async (jobData: Job, generationConfig?: CVGenerationConfig) => {
    console.warn('🎯 [DEBUG] triggerCVGeneration started');
    
    if (!isMountedRef.current || hasTriggeredGeneration.current) {
      return;
    }
    
    try {
      hasTriggeredGeneration.current = true;
      setIsGenerating(true);
      setError(null);
      
      // Use stored config or defaults
      let selectedTemplate = 'modern';
      let selectedFeatures: string[] = [];
      let privacyModeEnabled = false;
      let podcastGeneration = false;
      
      let configToUse = generationConfig;
      if (!configToUse) {
        const storedConfig = sessionStorage.getItem(`generation-config-${jobData.id}`);
        if (storedConfig) {
          try {
            configToUse = JSON.parse(storedConfig);
          } catch (error) {
            console.error('❌ [DEBUG] Error parsing stored config:', error);
          }
        }
      }
      
      if (configToUse) {
        selectedTemplate = configToUse.template || 'modern';
        selectedFeatures = Object.keys(configToUse.features || {}).filter(key => configToUse.features[key]);
        privacyModeEnabled = configToUse.features?.privacyMode || false;
        podcastGeneration = configToUse.features?.generatePodcast || false;
      }

      // Generate CV with privacy mode handling
      if (privacyModeEnabled) {
        selectedFeatures.push('privacy-mode');
      }

      console.warn('🔥 [DEBUG] Calling generateCV service with features:', selectedFeatures);
      const result = await generateCV(jobData.id, selectedTemplate, selectedFeatures);
      
      // Generate podcast separately if selected
      if (podcastGeneration && isMountedRef.current) {
        try {
          await generateEnhancedPodcast(jobData.id, 'professional');
          toast.success('Podcast generation started!');
        } catch (podcastError) {
          console.error('Podcast generation failed:', podcastError);
          toast.error('Podcast generation failed, but CV was created successfully');
        }
      }
      
      if (isMountedRef.current) {
        toast.success('CV generated successfully! Adding enhanced features...');
      }
      
      return result;
    } catch (error: unknown) {
      logError('triggerCVGeneration', error);
      const errorMessage = getErrorMessage(error) || 'Failed to generate CV';
      if (isMountedRef.current) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const triggerQuickCreateWorkflow = async (jobData: Job) => {
    console.warn('🎯 [DEBUG] triggerQuickCreateWorkflow started - generating with ALL features');
    
    if (!isMountedRef.current) {
      return;
    }
    
    try {
      hasTriggeredGeneration.current = true;
      setIsGenerating(true);
      setError(null);
      
      // Define all available features for quick create
      const allFeatures = [
        'generate-podcast',
        'video-introduction',
        'skills-visualization',
        'interactive-timeline',
        'portfolio-gallery',
        'calendar-integration',
        'certification-badges',
        'language-proficiency'
      ];
      
      console.warn('🔥 [DEBUG] Quick Create: Calling generateCV with ALL features:', allFeatures);
      const result = await generateCV(jobData.id, 'modern', allFeatures);
      
      // Generate podcast for quick create
      if (isMountedRef.current) {
        try {
          console.warn('🎙️ Quick Create: Generating podcast');
          await generateEnhancedPodcast(jobData.id, 'professional');
          toast.success('Full CV with podcast generation completed!');
        } catch (podcastError) {
          console.error('Podcast generation failed:', podcastError);
          toast.success('CV generated successfully! Podcast generation in progress...');
        }
      }
      
      if (isMountedRef.current) {
        toast.success('Complete CV with all enhancements ready!');
      }
      
      return {
        result,
        features: allFeatures
      };
    } catch (error: unknown) {
      logError('triggerQuickCreateWorkflow', error);
      const errorMessage = getErrorMessage(error) || 'Failed to generate enhanced CV';
      if (isMountedRef.current) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const pollForCVCompletion = async (asyncMode = false) => {
    const maxAttempts = asyncMode ? 120 : 60; // 4 minutes async, 2 minutes sync
    const pollInterval = asyncMode ? 3000 : 2000; // 3s async, 2s sync
    let attempts = 0;
    
    return new Promise<Job | null>((resolve, reject) => {
      const poll = async () => {
        attempts++;
        try {
          const updatedJob = await getJob(jobId);
          if (updatedJob?.generatedCV?.html || updatedJob?.generatedCV?.htmlUrl) {
            console.warn('✅ [DEBUG] CV generation completed');
            resolve(updatedJob);
          } else if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            console.error('❌ [DEBUG] CV generation timeout');
            reject(new Error('CV generation timed out. Please try again.'));
          }
        } catch (pollError) {
          console.error('❌ [DEBUG] Error polling for CV completion:', pollError);
          if (attempts >= maxAttempts) {
            reject(new Error('Failed to check CV generation status. Please refresh the page.'));
          } else {
            setTimeout(poll, pollInterval);
          }
        }
      };
      
      poll();
    });
  };

  return {
    isGenerating,
    error,
    triggerCVGeneration,
    triggerQuickCreateWorkflow,
    pollForCVCompletion,
    hasTriggeredGeneration: hasTriggeredGeneration.current,
    setError,
    isMountedRef
  };
};