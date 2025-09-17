import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../../../lib/firebase';
import { SocialLinkAnalytics } from '../types';

export const useSocialMediaAnalytics = () => {
  const [analytics, setAnalytics] = useState<Record<string, SocialLinkAnalytics>>({});
  
  const getSocialAnalytics = httpsCallable(functions, 'getSocialMediaAnalytics');

  const loadAnalytics = useCallback(async (jobId: string, profileId: string) => {
    try {
      const result = await getSocialAnalytics({ jobId, profileId });
      setAnalytics(result.data as Record<string, SocialLinkAnalytics>);
    } catch (err) {
      console.warn('Failed to load social media analytics:', err);
    }
  }, [getSocialAnalytics]);

  const updateAnalytics = useCallback((platform: string, increment: Partial<SocialLinkAnalytics>) => {
    setAnalytics(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        ...increment,
        clicks: (prev[platform]?.clicks || 0) + (increment.clicks || 0)
      }
    }));
  }, []);

  return {
    analytics,
    loadAnalytics,
    updateAnalytics
  };
};
