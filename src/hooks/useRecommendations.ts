/**
 * Custom hook for managing recommendations state
 * Prevents duplicate calls and provides proper loading states
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getRecommendations } from '../services/cvService';
import { recommendationsDebugger } from '../utils/debugRecommendations';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  estimatedImprovement: number;
  selected: boolean;
}

// Raw recommendation from backend API
interface RawRecommendation {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  section?: string;
  impact?: string;
  estimatedScoreImprovement?: number;
  [key: string]: any; // For additional properties
}

interface UseRecommendationsOptions {
  targetRole?: string;
  industryKeywords?: string[];
  forceRegenerate?: boolean;
}

interface UseRecommendationsReturn {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  retry: () => void;
}

// Global cache to prevent duplicate calls across component instances
const recommendationsCache = new Map<string, {
  data: RecommendationItem[];
  timestamp: number;
  loading: Promise<RecommendationItem[]> | null;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRecommendations(
  jobId: string,
  options: UseRecommendationsOptions = {}
): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  const isMountedRef = useRef(true);
  const optionsRef = useRef(options);
  
  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  const loadRecommendations = useCallback(async (forceRefresh = false): Promise<RecommendationItem[]> => {
    const cacheKey = `${jobId}-${JSON.stringify(optionsRef.current)}`;
    const now = Date.now();
    
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = recommendationsCache.get(cacheKey);
      if (cached) {
        // Return cached data if it's recent
        if (now - cached.timestamp < CACHE_DURATION && cached.data.length > 0) {
          console.warn(`[useRecommendations] Using cached data for job ${jobId}`);
          return cached.data;
        }
        
        // Return existing loading promise if one is in progress
        if (cached.loading) {
          console.warn(`[useRecommendations] Joining existing load for job ${jobId}`);
          return cached.loading;
        }
      }
    }
    
    // Create new loading promise
    const loadingPromise = (async (): Promise<RecommendationItem[]> => {
      try {
        console.warn(`[useRecommendations] Loading recommendations for job ${jobId}`);
        recommendationsDebugger.trackCall(jobId, 'useRecommendations.loadRecommendations');
        
        const { targetRole, industryKeywords, forceRegenerate } = optionsRef.current;
        const result = await getRecommendations(jobId, targetRole, industryKeywords, forceRegenerate);
        
        // Transform backend data to frontend format
        let transformedRecommendations: RecommendationItem[] = [];
        
        if (result?.data?.recommendations) {
          transformedRecommendations = result.data.recommendations.map((rec: unknown) => {
            const recommendation = rec as RawRecommendation;
            return {
              id: recommendation.id,
              title: recommendation.title || 'CV Improvement',
              description: recommendation.description || 'Enhance your CV content',
              priority: mapPriorityFromBackend(recommendation),
              category: recommendation.category || recommendation.section || 'General',
              impact: recommendation.description || `${recommendation.impact || 'medium'} impact improvement`,
              estimatedImprovement: recommendation.estimatedScoreImprovement || 5,
              selected: mapPriorityFromBackend(recommendation) === 'high'
            };
          });
        } else if (result?.recommendations) {
          // Fallback format
          transformedRecommendations = result.recommendations.map((rec: unknown) => {
            const recommendation = rec as RawRecommendation;
            return {
              id: recommendation.id,
              title: recommendation.title || 'CV Improvement',
              description: recommendation.description || 'Enhance your CV content',
              priority: mapPriorityFromBackend(recommendation),
              category: recommendation.category || recommendation.section || 'General',
              impact: recommendation.description || `${recommendation.impact || 'medium'} impact improvement`,
              estimatedImprovement: recommendation.estimatedScoreImprovement || 5,
              selected: mapPriorityFromBackend(recommendation) === 'high'
            };
          });
        }
        
        // Update cache
        recommendationsCache.set(cacheKey, {
          data: transformedRecommendations,
          timestamp: now,
          loading: null
        });
        
        console.warn(`[useRecommendations] Loaded ${transformedRecommendations.length} recommendations for job ${jobId}`);
        return transformedRecommendations;
        
      } catch (err: unknown) {
        console.error(`[useRecommendations] Error loading recommendations for job ${jobId}:`, err);
        
        // Clear loading state from cache
        const cached = recommendationsCache.get(cacheKey);
        if (cached) {
          cached.loading = null;
        }
        
        throw err;
      }
    })();
    
    // Store loading promise in cache
    const cached = recommendationsCache.get(cacheKey) || { data: [], timestamp: 0, loading: null };
    cached.loading = loadingPromise;
    recommendationsCache.set(cacheKey, cached);
    
    return loadingPromise;
  }, [jobId]);
  
  const retry = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setError(null);
    loadRecommendations(true)
      .then(data => {
        if (isMountedRef.current) {
          setRecommendations(data);
          setHasLoaded(true);
          setError(null);
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load recommendations');
          setRecommendations([]);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
  }, [loadRecommendations]);
  
  // Load recommendations when jobId changes
  useEffect(() => {
    if (!jobId || !isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    loadRecommendations()
      .then(data => {
        if (isMountedRef.current) {
          setRecommendations(data);
          setHasLoaded(true);
          setError(null);
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load recommendations');
          setRecommendations([]);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
  }, [jobId, loadRecommendations]);
  
  return {
    recommendations,
    isLoading,
    error,
    hasLoaded,
    retry
  };
}

function mapPriorityFromBackend(rec: RawRecommendation): 'high' | 'medium' | 'low' {
  if (rec.impact === 'high' || rec.priority >= 8) {
    return 'high';
  } else if (rec.impact === 'medium' || rec.priority >= 5) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Clear cache when needed (e.g., user logout)
export const clearRecommendationsCache = () => {
  recommendationsCache.clear();
};