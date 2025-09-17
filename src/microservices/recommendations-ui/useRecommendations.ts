/**
 * @cvplus/recommendations - useRecommendations Hook
 * 
 * React hook for recommendations management with caching and error handling.
 * Provides a clean interface for components to interact with recommendations.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

import { useState, useCallback, useEffect, useRef } from 'react';
import { recommendationsService } from '../../services/recommendations.service';
import type {
  UseRecommendationsState,
  UseRecommendationsActions,
  GetRecommendationsParams,
  ApplyImprovementsParams,
  PreviewImprovementParams,
  CustomizePlaceholdersParams,
  Recommendation,
  RecommendationError,
  PerformanceMetrics,
  CacheStats,
  CVAnalysisResult,
  CareerInsight,
  LearningPath
} from '../../types';

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useRecommendations() {
  // State management
  const [state, setState] = useState<UseRecommendationsState>({
    recommendations: [],
    isLoading: false,
    error: null,
    performance: {
      requestDuration: 0,
      cacheHitRate: 0,
      errorRate: 0,
      timeoutRate: 0,
      throughput: 0,
      aiApiLatency: 0,
      queueDepth: 0,
      memoryUsage: 0,
      timestamp: new Date()
    },
    cacheStats: {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      evictions: 0,
      memoryUsage: 0,
      averageAge: 0
    },
    loadingProgress: 0
  });

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update performance metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const performance = recommendationsService.getPerformanceMetrics();
      const cacheStats = recommendationsService.getCacheStats();
      
      setState(prev => ({
        ...prev,
        performance,
        cacheStats
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const loadRecommendations = useCallback(async (params: GetRecommendationsParams) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      loadingProgress: 0
    }));

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        loadingProgress: Math.min(prev.loadingProgress + 10, 90)
      }));
    }, 2000);

    try {
      console.log('[useRecommendations] Loading recommendations:', params);

      const response = await recommendationsService.getRecommendations(params);

      if (!response.success || !response.data) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to load recommendations');
      }

      // Update recommendations with selection state
      const recommendations = response.data.recommendations.map(rec => ({
        ...rec,
        isSelected: false
      }));

      setState(prev => ({ 
        ...prev, 
        recommendations,
        isLoading: false,
        loadingProgress: 100,
        performance: recommendationsService.getPerformanceMetrics(),
        cacheStats: recommendationsService.getCacheStats()
      }));

      console.log(`[useRecommendations] Loaded ${recommendations.length} recommendations`);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[useRecommendations] Request aborted');
        return;
      }

      const recommendationError: RecommendationError = error instanceof Error ? 
        error as RecommendationError : 
        {
          name: 'RecommendationError',
          message: 'Unknown error occurred',
          type: 'unknown' as any,
          retryable: false,
          context: {},
          timestamp: new Date()
        } as RecommendationError;

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: recommendationError,
        loadingProgress: 0
      }));

      console.error('[useRecommendations] Error loading recommendations:', error);

    } finally {
      clearInterval(progressInterval);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, []);

  const applyRecommendations = useCallback(async (params: ApplyImprovementsParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[useRecommendations] Applying recommendations:', params);

      const response = await recommendationsService.applyImprovements(params);

      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to apply recommendations');
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        performance: recommendationsService.getPerformanceMetrics(),
        cacheStats: recommendationsService.getCacheStats()
      }));

      console.log('[useRecommendations] Recommendations applied successfully');
      return response;

    } catch (error) {
      const recommendationError: RecommendationError = error instanceof Error ? 
        error as RecommendationError : 
        {
          name: 'RecommendationError',
          message: 'Unknown error occurred',
          type: 'unknown' as any,
          retryable: false,
          context: {},
          timestamp: new Date()
        } as RecommendationError;

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: recommendationError
      }));

      console.error('[useRecommendations] Error applying recommendations:', error);
      throw error;
    }
  }, []);

  const previewRecommendation = useCallback(async (params: PreviewImprovementParams) => {
    try {
      console.log('[useRecommendations] Previewing recommendation:', params);

      const response = await recommendationsService.previewImprovement(params);

      if (!response.success) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error?.message || 'Failed to preview recommendation');
      }

      setState(prev => ({ 
        ...prev,
        performance: recommendationsService.getPerformanceMetrics(),
        cacheStats: recommendationsService.getCacheStats()
      }));

      console.log('[useRecommendations] Preview generated successfully');
      return response;

    } catch (error) {
      console.error('[useRecommendations] Error previewing recommendation:', error);
      throw error;
    }
  }, []);

  const retryFailedRequest = useCallback(async () => {
    if (!state.error?.retryable) {
      console.warn('[useRecommendations] Current error is not retryable');
      return;
    }

    // Clear error and retry the last operation
    setState(prev => ({ ...prev, error: null }));
    
    // This would need to store the last operation parameters
    // For now, we'll just clear the error
    console.log('[useRecommendations] Retrying failed request...');
  }, [state.error]);

  const refreshCache = useCallback(async () => {
    try {
      await recommendationsService.refreshCache();
      
      setState(prev => ({ 
        ...prev,
        cacheStats: recommendationsService.getCacheStats()
      }));
      
      console.log('[useRecommendations] Cache refreshed');
    } catch (error) {
      console.error('[useRecommendations] Error refreshing cache:', error);
    }
  }, []);

  const clearCache = useCallback(async () => {
    await refreshCache(); // Same implementation for now
  }, [refreshCache]);

  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const toggleRecommendation = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(rec =>
        rec.id === id ? { ...rec, isSelected: !rec.isSelected } : rec
      )
    }));
  }, []);

  const getSelectedRecommendations = useCallback(() => {
    return state.recommendations.filter(rec => rec.isSelected);
  }, [state.recommendations]);

  const getSelectedRecommendationIds = useCallback(() => {
    return getSelectedRecommendations().map(rec => rec.id);
  }, [getSelectedRecommendations]);

  const selectAllRecommendations = useCallback(() => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(rec => ({ ...rec, isSelected: true }))
    }));
  }, []);

  const deselectAllRecommendations = useCallback(() => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(rec => ({ ...rec, isSelected: false }))
    }));
  }, []);

  // ============================================================================
  // RETURN OBJECT
  // ============================================================================

  const actions: UseRecommendationsActions = {
    loadRecommendations,
    applyRecommendations,
    previewRecommendation,
    retryFailedRequest,
    refreshCache,
    clearCache,
    resetError
  };

  return {
    // Core state
    ...state,
    
    // Actions
    ...actions,
    
    // Helper functions
    toggleRecommendation,
    getSelectedRecommendations,
    getSelectedRecommendationIds,
    selectAllRecommendations,
    deselectAllRecommendations,
    
    // Service health
    isServiceHealthy: recommendationsService.isHealthy(),
    
    // Computed values
    hasRecommendations: state.recommendations.length > 0,
    selectedCount: state.recommendations.filter(r => r.isSelected).length,
    totalCount: state.recommendations.length,
    
    // Performance indicators
    isCacheHealthy: state.cacheStats.hitRate > 0.3, // 30% minimum
    isPerformanceGood: state.performance.timeoutRate < 5 && state.performance.errorRate < 5
  };
}

// Enhanced AI-powered features
interface EnhancedUseRecommendationsReturn extends ReturnType<typeof useRecommendations> {
  // AI analysis features
  analysisResult: CVAnalysisResult | null;
  overallScore: number;
  hasAnalysisResult: boolean;
  
  // Career development features
  careerInsights: CareerInsight[];
  learningPaths: LearningPath[];
  hasCareerInsights: boolean;
  hasLearningPaths: boolean;
  
  // Enhanced selection management
  selectedRecommendations: string[];
  selectedCount: number;
  totalImpactScore: number;
  hasHighImpactRecommendations: boolean;
  canApplyRecommendations: boolean;
  
  // Enhanced loading states
  isAnalyzing: boolean;
  isPreviewing: boolean;
  isApplyingImprovements: boolean;
  
  // Additional actions
  customizePlaceholders: (params: CustomizePlaceholdersParams) => Promise<any>;
  loadCareerInsights: (jobId: string, industry?: string) => Promise<void>;
  loadLearningPaths: (jobId: string, targetRole?: string, focusAreas?: string[]) => Promise<void>;
  selectRecommendation: (id: string) => void;
  deselectRecommendation: (id: string) => void;
  checkAIServiceHealth: () => Promise<any>;
}

export type UseRecommendationsReturn = EnhancedUseRecommendationsReturn;

/**
 * Enhanced useRecommendations hook with full AI capabilities
 * @deprecated Use useRecommendations instead
  */
export { useRecommendations as useAIRecommendations };