import { useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { functions, logAnalyticsEvent } from '../../../../../lib/firebase';

export const useSocialMediaTracking = () => {
  const trackSocialClick = httpsCallable(functions, 'trackSocialMediaClick');

  const handleLinkClick = useCallback(async (
    platform: string, 
    url: string, 
    jobId: string, 
    profileId: string, 
    openInNewTab: boolean
  ) => {
    try {
      // Track with Firebase Analytics
      logAnalyticsEvent('social_link_click', {
        platform,
        job_id: jobId,
        profile_id: profileId
      });

      // Track with custom function for detailed analytics
      await trackSocialClick({
        jobId,
        profileId,
        platform,
        url,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });

      // Open link
      if (openInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }

      toast.success(`Opening ${platform}`);
      
    } catch (err) {
      console.error('Failed to track social media click:', err);
      // Still open the link even if tracking fails
      if (openInNewTab) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    }
  }, [trackSocialClick]);

  return { handleLinkClick };
};
