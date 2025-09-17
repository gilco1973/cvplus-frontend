/**
 * useRecommendationsService Hook
 * 
 * Service abstraction hook that handles package vs legacy service selection.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { CVServiceCore } from '../../../../services/cv/CVServiceCore';
import { debugRecommendationsCall } from '../../../../utils/api-debugging-suite';
import { monitorRecommendationResponse } from '../../../../utils/recommendations-error-monitor';

// Package integration attempt
let usePackageRecommendations: any = null;
try {
  const recommendationsModule = require('@cvplus/recommendations');
  usePackageRecommendations = recommendationsModule.useRecommendations;
} catch {
  console.log('[useRecommendationsService] Using legacy service');
}

interface GetRecommendationsParams {
  jobId: string;
  targetRole?: string;
  industryKeywords?: string[];
  forceRegenerate: boolean;
}

export function useRecommendationsService() {
  // Package hook integration when available
  const packageHook = usePackageRecommendations ? usePackageRecommendations() : null;
  const usePackageService = packageHook && packageHook.isServiceHealthy;

  const getRecommendations = useCallback(async (params: GetRecommendationsParams) => {
    if (usePackageService && packageHook) {
      // Use new package service
      await packageHook.loadRecommendations(params);
      
      if (packageHook.error) {
        throw new Error(packageHook.error.message);
      }
      
      return {
        success: !packageHook.error,
        data: {
          recommendations: packageHook.recommendations
        }
      };
    } else {
      // Use legacy service with debugging
      const debugResult = await debugRecommendationsCall(params.jobId);
      if (!debugResult.success) {
        throw new Error(`API diagnostic failed: ${debugResult.error}`);
      }
      
      const response = await CVServiceCore.getRecommendations(
        params.jobId,
        params.targetRole,
        params.industryKeywords,
        params.forceRegenerate
      );
      
      monitorRecommendationResponse(response, params.jobId);
      return response;
    }
  }, [packageHook, usePackageService]);

  return {
    getRecommendations,
    isServiceHealthy: packageHook ? packageHook.isServiceHealthy : true,
    usingPackageService: usePackageService
  };
}