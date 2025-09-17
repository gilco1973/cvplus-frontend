import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { FeatureOptions, FeatureResult, LoadingState } from '../types/cv-features';

interface UseFeatureDataResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  update: (newData: Partial<T>) => void;
  state: LoadingState;
}

export const useFeatureData = <T = any>(options: FeatureOptions): UseFeatureDataResult<T> => {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(!options.initialData);
  const [error, setError] = useState<Error | null>(null);
  const [state, setState] = useState<LoadingState>(options.initialData ? 'success' : 'idle');

  const fetchData = useCallback(async () => {
    if (!options.jobId || !options.featureName) {
      setError(new Error('Missing required parameters: jobId and featureName'));
      setState('error');
      return;
    }

    try {
      setLoading(true);
      setState('loading');
      setError(null);

      // Call the appropriate Firebase Function based on feature name
      const functionName = getFunctionName(options.featureName);
      const callable = httpsCallable(functions, functionName);
      
      const result = await callable({
        jobId: options.jobId,
        ...options.params
      });

      const featureResult = result.data as FeatureResult;
      
      if (featureResult.success) {
        setData(featureResult.data);
        setState('success');
      } else {
        throw new Error(featureResult.error || 'Feature processing failed');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      setState('error');
      console.error(`Feature ${options.featureName} error:`, error);
    } finally {
      setLoading(false);
    }
  }, [options.jobId, options.featureName, options.params]);

  const update = useCallback((newData: Partial<T>) => {
    if (data) {
      setData({ ...data, ...newData });
    }
  }, [data]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!options.initialData && state === 'idle') {
      fetchData();
    }
  }, [fetchData, options.initialData, state]);

  return {
    data,
    loading,
    error,
    refresh,
    update,
    state
  };
};

// Map feature names to Firebase Function names
const getFunctionName = (featureName: string): string => {
  const functionMap: Record<string, string> = {
    'contact-form': 'submitContactForm',
    'qr-code': 'generateQRCode',
    'career-timeline': 'generateTimeline',
    'social-links': 'getSocialMediaLinks',
    'podcast': 'generatePodcast',
    'ai-podcast': 'generatePodcast',
    'ai-podcast-player': 'generatePodcast',
    'ats-optimization': 'getATSOptimization',
    'keyword-enhancement': 'getKeywordEnhancement',
    'achievement-highlighting': 'getAchievementHighlighting',
    'privacy-mode': 'getPrivacyMode',
    'ai-chat': 'getChatResponse',
    'public-profile': 'getPublicProfile',
    'skills-analytics': 'getSkillsAnalytics',
    'video-introduction': 'generateVideoIntroduction',
    'personality-insights': 'getPersonalityInsights',
    'skills-visualization': 'getSkillsVisualization',
    'achievement-cards': 'getAchievementCards',
    'language-proficiency': 'getLanguageProficiency',
    'certification-badges': 'getCertificationBadges',
    'portfolio-gallery': 'getPortfolioGallery',
    'testimonials-carousel': 'getTestimonials'
  };

  return functionMap[featureName] || featureName;
};

// Hook for Firebase Function calls without automatic data fetching
export const useFirebaseFunction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const callFunction = useCallback(async (functionName: string, data: any = {}) => {
    try {
      setLoading(true);
      setError(null);

      const callable = httpsCallable(functions, functionName);
      const result = await callable(data);
      
      return result.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Function call failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    callFunction,
    loading,
    error
  };
};