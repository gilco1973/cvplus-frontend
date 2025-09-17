/**
 * useRecommendationsDebug Hook
 * 
 * Debug logging hook for recommendations operations.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { logRecommendationError } from '../../../../utils/recommendations-error-monitor';

interface DebugContext {
  jobId: string;
  targetRole?: string;
  industryKeywords?: string[];
  [key: string]: any;
}

export function useRecommendationsDebug(enableDebug = false) {
  const logApiCall = useCallback((jobId: string, targetRole?: string, industryKeywords?: string[]) => {
    if (!enableDebug) return;
    
    console.log('[useRecommendationsContainer] API Parameters Validated:', {
      jobId,
      hasTargetRole: !!targetRole,
      industryKeywordsCount: industryKeywords?.length || 0,
      environment: process.env.NODE_ENV
    });

    if (!targetRole) {
      console.warn('[useRecommendationsContainer] No target role selected, using generic recommendations');
    }
    
    if (!industryKeywords || industryKeywords.length === 0) {
      console.warn('[useRecommendationsContainer] No industry keywords found, recommendations may be generic');
    }
  }, [enableDebug]);

  const logError = useCallback((error: any, context: DebugContext) => {
    if (enableDebug) {
      console.error('[useRecommendationsContainer] Error loading recommendations:', error);
    }
    
    logRecommendationError(error, {
      ...context,
      step: 'api_call',
      forceRegenerate: false
    });
  }, [enableDebug]);

  const logSuccess = useCallback((response: any, jobId: string) => {
    if (enableDebug) {
      console.log('[useRecommendationsContainer] Recommendations loaded:', response);
    }
  }, [enableDebug]);

  return {
    logApiCall,
    logError,
    logSuccess
  };
}