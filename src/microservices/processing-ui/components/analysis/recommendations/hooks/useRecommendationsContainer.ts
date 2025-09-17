/**
 * useRecommendationsContainer Hook
 * 
 * Extracts data loading and API integration logic from RecommendationsContainer.
 * Provides integration with package-based services while maintaining fallback compatibility.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useEffect, useState, useCallback } from 'react';
import { useUnifiedAnalysis } from '../../context/UnifiedAnalysisContext';
import type { Job } from '../../../../services/cvService';
import toast from 'react-hot-toast';
import { useRecommendationsService } from './useRecommendationsService';
import { useRecommendationsDebug } from './useRecommendationsDebug';

export interface UseRecommendationsContainerOptions {
  jobData: Job;
  autoLoad?: boolean;
  enableDebug?: boolean;
}

export interface RecommendationsContainerState {
  recommendations: any[];
  isLoading: boolean;
  error: string | null;
  isServiceHealthy: boolean;
  hasSelectedRecommendations: boolean;
}

export interface RecommendationsContainerActions {
  loadRecommendations: () => Promise<void>;
  retryLoad: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

/**
 * Main hook for recommendations container logic
 */
export function useRecommendationsContainer({
  jobData,
  autoLoad = true,
  enableDebug = false
}: UseRecommendationsContainerOptions) {
  const { 
    state: unifiedState, 
    dispatch: unifiedDispatch,
    hasSelectedRecommendations 
  } = useUnifiedAnalysis();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Use service abstraction and debugging hooks
  const { getRecommendations, isServiceHealthy } = useRecommendationsService();
  const { logApiCall, logError } = useRecommendationsDebug(enableDebug);

  const loadRecommendations = useCallback(async () => {
    if (unifiedState.recommendationsLoaded && unifiedState.recommendations.length > 0) {
      setRecommendations(unifiedState.recommendations);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extract parameters
      const targetRole = unifiedState.selectedRole?.roleName;
      const industryKeywords = unifiedState.selectedRole?.matchingFactors || [];
      
      logApiCall(jobData.id, targetRole, industryKeywords);
      
      const response = await getRecommendations({
        jobId: jobData.id,
        targetRole,
        industryKeywords,
        forceRegenerate: false
      });

      // Handle response
      const recommendationsData = response.success && response.data ? 
        response.data.recommendations : response.recommendations;
      
      if (response.success && recommendationsData) {
        const formattedRecs = recommendationsData.map((rec: any) => ({
          ...rec,
          isSelected: false,
          category: rec.category || 'general'
        }));
        
        setRecommendations(formattedRecs);
        unifiedDispatch({ type: 'SET_RECOMMENDATIONS', payload: formattedRecs });
        unifiedDispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: true });
        
        toast.success('Recommendations loaded successfully!');
      } else {
        const errorMessage = response.error || response.data?.error || 'Failed to load recommendations';
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load recommendations';
      
      logError(error, {
        jobId: jobData.id,
        targetRole: unifiedState.selectedRole?.roleName,
        industryKeywords: unifiedState.selectedRole?.matchingFactors || []
      });
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobData.id, unifiedState.selectedRole, unifiedState.recommendationsLoaded, 
      unifiedState.recommendations, unifiedDispatch, getRecommendations, logApiCall, logError]);

  const retryLoad = useCallback(async () => {
    setError(null);
    await loadRecommendations();
  }, [loadRecommendations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    unifiedDispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: false });
    unifiedDispatch({ type: 'SET_RECOMMENDATIONS', payload: [] });
    await loadRecommendations();
  }, [loadRecommendations, unifiedDispatch]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadRecommendations();
    }
  }, [autoLoad, loadRecommendations]);

  return {
    // State
    recommendations,
    isLoading,
    error,
    isServiceHealthy,
    hasSelectedRecommendations,
    // Actions
    loadRecommendations,
    retryLoad,
    clearError,
    refreshData,
    // Context data
    selectedRole: unifiedState.selectedRole
  };
}