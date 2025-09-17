import { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchFilters, FAQItem, FAQCategory } from '../components/pages/FAQ/types';
import { faqService, SearchResult } from '../services/faqService';

/**
 * Advanced FAQ search hook with debouncing, caching, and analytics
 * Provides optimized search functionality with performance tracking
 */

// Hook configuration interface
export interface FAQSearchConfig {
  debounceMs: number;
  enableAnalytics: boolean;
  enableSuggestions: boolean;
  maxSuggestions: number;
}

// Search state interface
export interface FAQSearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  selectedCategory: string;
  selectedTags: string[];
  suggestions: string[];
  searchHistory: string[];
  totalResults: number;
  searchTime: number;
}

// Search analytics interface
export interface SearchAnalytics {
  searchCount: number;
  averageSearchTime: number;
  popularQueries: string[];
  noResultsQueries: string[];
  categoryUsage: Record<string, number>;
}

// Default configuration
const DEFAULT_CONFIG: FAQSearchConfig = {
  debounceMs: 300,
  enableAnalytics: true,
  enableSuggestions: true,
  maxSuggestions: 5
};

/**
 * Custom hook for FAQ search functionality
 */
export function useFAQSearch(config: Partial<FAQSearchConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Core search state
  const [state, setState] = useState<FAQSearchState>({
    results: [],
    loading: false,
    error: null,
    query: '',
    selectedCategory: 'all',
    selectedTags: [],
    suggestions: [],
    searchHistory: [],
    totalResults: 0,
    searchTime: 0
  });

  // Analytics state
  const [analytics, setAnalytics] = useState<SearchAnalytics>({
    searchCount: 0,
    averageSearchTime: 0,
    popularQueries: [],
    noResultsQueries: [],
    categoryUsage: {}
  });

  // Debounced search effect
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(state.query);
    }, mergedConfig.debounceMs);

    return () => clearTimeout(timer);
  }, [state.query, mergedConfig.debounceMs]);

  // Build search filters
  const searchFilters = useMemo((): SearchFilters => ({
    query: debouncedQuery,
    category: state.selectedCategory,
    tags: state.selectedTags
  }), [debouncedQuery, state.selectedCategory, state.selectedTags]);

  // Perform search when filters change
  useEffect(() => {
    if (!debouncedQuery && state.selectedCategory === 'all' && state.selectedTags.length === 0) {
      // No active filters - show popular FAQs
      setState(prev => ({
        ...prev,
        results: faqService.getPopularFAQs().map(item => ({
          item,
          score: 0.8 as any,
          matches: { question: [], answer: [], tags: [] },
          relevanceReason: 'Popular question'
        })),
        loading: false,
        totalResults: 0,
        searchTime: 0
      }));
      return;
    }

    const performSearch = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const startTime = performance.now();
        const results = faqService.searchFAQs(searchFilters);
        const endTime = performance.now();
        const searchTime = endTime - startTime;

        setState(prev => ({
          ...prev,
          results,
          loading: false,
          totalResults: results.length,
          searchTime: Math.round(searchTime)
        }));

        // Update analytics if enabled
        if (mergedConfig.enableAnalytics && debouncedQuery) {
          updateAnalytics(debouncedQuery, results.length, searchTime);
        }

      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Search failed'
        }));
      }
    };

    performSearch();
  }, [searchFilters, mergedConfig.enableAnalytics]);

  // Update search suggestions when query changes
  useEffect(() => {
    if (mergedConfig.enableSuggestions && state.query.length > 2) {
      const suggestions = faqService.getSearchSuggestions(state.query, mergedConfig.maxSuggestions);
      setState(prev => ({ ...prev, suggestions }));
    } else {
      setState(prev => ({ ...prev, suggestions: [] }));
    }
  }, [state.query, mergedConfig.enableSuggestions, mergedConfig.maxSuggestions]);

  // Analytics update function
  const updateAnalytics = useCallback((query: string, resultCount: number, searchTime: number) => {
    setAnalytics(prev => {
      const newSearchCount = prev.searchCount + 1;
      const newAverageTime = (prev.averageSearchTime * prev.searchCount + searchTime) / newSearchCount;
      
      // Update popular queries
      const popularQueries = [...prev.popularQueries];
      const existingIndex = popularQueries.indexOf(query);
      if (existingIndex > -1) {
        popularQueries.splice(existingIndex, 1);
      }
      popularQueries.unshift(query);
      const trimmedPopular = popularQueries.slice(0, 10);

      // Track no results queries
      const noResultsQueries = resultCount === 0 
        ? [...prev.noResultsQueries, query].slice(0, 10)
        : prev.noResultsQueries;

      // Update category usage
      const categoryUsage = { ...prev.categoryUsage };
      if (state.selectedCategory !== 'all') {
        categoryUsage[state.selectedCategory] = (categoryUsage[state.selectedCategory] || 0) + 1;
      }

      return {
        searchCount: newSearchCount,
        averageSearchTime: newAverageTime,
        popularQueries: trimmedPopular,
        noResultsQueries,
        categoryUsage
      };
    });
  }, [state.selectedCategory]);

  // Search handlers
  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    
    // Add to search history if meaningful query
    if (query.length > 2) {
      setState(prev => {
        const history = prev.searchHistory.filter(item => item !== query);
        history.unshift(query);
        return {
          ...prev,
          searchHistory: history.slice(0, 10) // Keep last 10 searches
        };
      });
    }
  }, []);

  const setCategory = useCallback((category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }));
  }, []);

  const setTags = useCallback((tags: string[]) => {
    setState(prev => ({ ...prev, selectedTags: tags }));
  }, []);

  const addTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag) 
        ? prev.selectedTags
        : [...prev.selectedTags, tag]
    }));
  }, []);

  const removeTag = useCallback((tag: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag)
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      selectedCategory: 'all',
      selectedTags: [],
      suggestions: []
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchHistory: []
    }));
  }, []);

  // Suggestion handlers
  const applySuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setState(prev => ({ ...prev, suggestions: [] }));
  }, [setQuery]);

  // Utility functions
  const hasActiveFilters = useMemo(() => {
    return state.query.length > 0 || 
           state.selectedCategory !== 'all' || 
           state.selectedTags.length > 0;
  }, [state.query, state.selectedCategory, state.selectedTags]);

  const getFAQById = useCallback((id: string): FAQItem | null => {
    return faqService.getFAQById(id);
  }, []);

  const getCategories = useCallback((): FAQCategory[] => {
    return faqService.getCategories();
  }, []);

  const getPopularFAQs = useCallback((limit?: number): FAQItem[] => {
    return faqService.getPopularFAQs(limit);
  }, []);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    lastSearchTime: state.searchTime,
    averageSearchTime: analytics.averageSearchTime,
    totalSearches: analytics.searchCount,
    cacheHitRate: 0, // This would need implementation in the service
    averageResultsPerSearch: analytics.searchCount > 0 
      ? state.totalResults / analytics.searchCount 
      : 0
  }), [state.searchTime, state.totalResults, analytics]);

  // Return hook interface
  return {
    // Core search state
    ...state,
    
    // Search handlers
    setQuery,
    setCategory,
    setTags,
    addTag,
    removeTag,
    clearFilters,
    clearHistory,
    
    // Suggestion handlers
    applySuggestion,
    
    // Utility functions
    hasActiveFilters,
    getFAQById,
    getCategories,
    getPopularFAQs,
    
    // Analytics and performance
    analytics,
    performanceMetrics,
    
    // Configuration
    config: mergedConfig
  };
}

/**
 * Simple search hook for basic use cases
 */
export function useSimpleFAQSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  
  const searchFilters = useMemo((): SearchFilters => ({
    query,
    category,
    tags: []
  }), [query, category]);
  
  const results = useMemo(() => {
    if (!query && category === 'all') {
      return faqService.getPopularFAQs().map(item => ({
        item,
        score: 0.8 as any,
        matches: { question: [], answer: [], tags: [] },
        relevanceReason: 'Popular question'
      }));
    }
    return faqService.searchFAQs(searchFilters);
  }, [searchFilters]);
  
  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    loading: false,
    error: null
  };
}

/**
 * Hook for FAQ analytics dashboard
 */
export function useFAQAnalytics() {
  const [analytics, setAnalytics] = useState({
    statistics: faqService.getStatistics(),
    lastUpdated: Date.now()
  });
  
  const refreshAnalytics = useCallback(() => {
    setAnalytics({
      statistics: faqService.getStatistics(),
      lastUpdated: Date.now()
    });
  }, []);
  
  useEffect(() => {
    // Refresh analytics every 5 minutes
    const interval = setInterval(refreshAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshAnalytics]);
  
  return {
    ...analytics.statistics,
    lastUpdated: analytics.lastUpdated,
    refresh: refreshAnalytics
  };
}

// Export types
export type { FAQSearchConfig, FAQSearchState, SearchAnalytics };