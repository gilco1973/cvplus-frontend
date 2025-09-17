import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { functions } from '../../../../../lib/firebase';
import { LinkValidationResult, SocialPlatform } from '../types';
import { SOCIAL_PLATFORMS } from '../constants';

export const useSocialMediaValidation = () => {
  const [validationResults, setValidationResults] = useState<Record<string, LinkValidationResult>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  const validateSocialLinks = httpsCallable(functions, 'validateSocialMediaLinks');

  const validateLinks = useCallback(async (
    data: any, 
    jobId: string, 
    profileId: string, 
    onError?: (error: Error) => void
  ) => {
    if (!data || Object.keys(data).length === 0) return;

    try {
      setIsValidating(true);

      const result = await validateSocialLinks({
        jobId,
        profileId,
        links: data
      });

      const validationData = result.data as Record<string, LinkValidationResult>;
      setValidationResults(validationData);

      // Show validation summary
      const validCount = Object.values(validationData).filter(v => v.isValid && v.isReachable).length;
      const totalCount = Object.keys(validationData).length;
      
      if (validCount === totalCount) {
        toast.success(`All ${totalCount} links are valid and reachable`);
      } else {
        toast.warning(`${validCount}/${totalCount} links are valid and reachable`);
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Link validation failed');
      onError?.(error);
      toast.error('Failed to validate social media links');
    } finally {
      setIsValidating(false);
    }
  }, [validateSocialLinks]);

  const isValidUrl = useCallback((platform: SocialPlatform, url: string): boolean => {
    if (!url) return false;
    if (platform.validator) {
      return platform.validator(url);
    }
    return /^https?:\/\/.+/.test(url);
  }, []);

  const getLinkStatus = useCallback((platformKey: string, url: string) => {
    const validation = validationResults[platformKey];
    const platform = SOCIAL_PLATFORMS.find(p => p.key === platformKey);
    
    if (!platform || !url) return null;
    
    if (!validation) {
      if (!isValidUrl(platform, url)) {
        return {
          icon: 'AlertTriangle',
          color: 'text-yellow-500',
          tooltip: 'URL format may be invalid'
        };
      }
      return {
        icon: 'Clock',
        color: 'text-gray-500',
        tooltip: 'Not validated yet'
      };
    }
    
    if (validation.isValid && validation.isReachable) {
      return {
        icon: 'CheckCircle',
        color: 'text-green-500',
        tooltip: `Valid and reachable (${validation.responseTime}ms)`
      };
    }
    
    return {
      icon: 'AlertTriangle',
      color: 'text-red-500',
      tooltip: validation.error || 'Link appears to be broken'
    };
  }, [validationResults, isValidUrl]);

  return {
    validationResults,
    isValidating,
    validateLinks,
    getLinkStatus
  };
};
