/**
 * T052: useLogMetrics hook in frontend/src/hooks/useLogMetrics.ts
 *
 * Custom React hook for fetching and managing log metrics data
 * with automatic refresh, caching, and error handling capabilities.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LogLevel, LogDomain } from '@cvplus/logging';

export interface LogMetricsParams {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  levels?: LogLevel[];
  domains?: LogDomain[];
  components?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
}

export interface LogMetrics {
  totalLogs: number;
  errorRate: number;
  logsByLevel: Record<LogLevel, number>;
  logsByDomain: Record<LogDomain, number>;
  logsByComponent: Record<string, number>;
  timeSeriesData: Array<{
    timestamp: string;
    count: number;
    errorCount: number;
  }>;
  performance?: {
    avgResponseTime?: number;
    p95ResponseTime?: number;
    throughput?: number;
  };
  security?: {
    threatsDetected: number;
    severityDistribution: Record<string, number>;
    topThreats: Array<{ type: string; count: number }>;
  };
  activeUsers?: number;
  activeComponents?: number;
}

interface UseLogMetricsReturn {
  metrics: LogMetrics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

export const useLogMetrics = (params: LogMetricsParams): UseLogMetricsReturn => {
  const [metrics, setMetrics] = useState<LogMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshTimerRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const cacheRef = useRef<Map<string, { data: LogMetrics; timestamp: number }>>(new Map());

  // Generate cache key from parameters
  const getCacheKey = useCallback((params: LogMetricsParams): string => {
    return JSON.stringify({
      timeRange: params.timeRange,
      levels: params.levels?.sort(),
      domains: params.domains?.sort(),
      components: params.components?.sort()
    });
  }, []);

  // Build query parameters
  const buildQueryParams = useCallback((params: LogMetricsParams): URLSearchParams => {
    const searchParams = new URLSearchParams();

    // Time range
    switch (params.timeRange) {
      case '1h':
        searchParams.set('lastHours', '1');
        break;
      case '6h':
        searchParams.set('lastHours', '6');
        break;
      case '24h':
        searchParams.set('lastHours', '24');
        break;
      case '7d':
        searchParams.set('lastDays', '7');
        break;
      case '30d':
        searchParams.set('lastDays', '30');
        break;
    }

    // Filters
    if (params.levels?.length) {
      params.levels.forEach(level => searchParams.append('level', level));
    }
    if (params.domains?.length) {
      params.domains.forEach(domain => searchParams.append('domain', domain));
    }
    if (params.components?.length) {
      params.components.forEach(component => searchParams.append('component', component));
    }

    // Request aggregation
    searchParams.set('aggregate', 'true');

    return searchParams;
  }, []);

  // Fetch metrics data
  const fetchMetrics = useCallback(async (params: LogMetricsParams, useCache = true): Promise<void> => {
    const cacheKey = getCacheKey(params);
    const cacheEntry = cacheRef.current.get(cacheKey);

    // Check cache (valid for 30 seconds)
    if (useCache && cacheEntry && Date.now() - cacheEntry.timestamp < 30000) {
      setMetrics(cacheEntry.data);
      setError(null);
      setIsLoading(false);
      setLastUpdated(new Date(cacheEntry.timestamp));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = buildQueryParams(params);
      const url = `${API_BASE_URL}/logs/aggregation?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.REACT_APP_API_KEY || '',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API response to match our metrics interface
      const transformedMetrics: LogMetrics = {
        totalLogs: data.metrics.totalLogs || 0,
        errorRate: data.metrics.errorRate || 0,
        logsByLevel: data.metrics.logsByLevel || {},
        logsByDomain: data.metrics.logsByDomain || {},
        logsByComponent: data.metrics.logsByComponent || {},
        timeSeriesData: data.metrics.timeSeriesData || [],
        performance: data.performance,
        security: data.security,
        activeUsers: data.metrics.activeUsers,
        activeComponents: Object.keys(data.metrics.logsByComponent || {}).length
      };

      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: transformedMetrics,
        timestamp: Date.now()
      });

      // Keep cache size reasonable
      if (cacheRef.current.size > 10) {
        const oldestKey = Array.from(cacheRef.current.keys())[0];
        cacheRef.current.delete(oldestKey);
      }

      setMetrics(transformedMetrics);
      setLastUpdated(new Date());

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('Error fetching log metrics:', error);
      setError(error.message || 'Failed to fetch metrics');
    } finally {
      setIsLoading(false);
    }
  }, [getCacheKey, buildQueryParams]);

  // Manual refresh function
  const refresh = useCallback(async (): Promise<void> => {
    return fetchMetrics(params, false); // Skip cache on manual refresh
  }, [params, fetchMetrics]);

  // Set up auto-refresh
  useEffect(() => {
    // Clear existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    // Initial fetch
    fetchMetrics(params, true);

    // Set up auto-refresh if enabled
    if (params.autoRefresh && params.refreshInterval && params.refreshInterval > 0) {
      refreshTimerRef.current = setInterval(() => {
        fetchMetrics(params, true);
      }, params.refreshInterval * 1000);
    }

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [params, fetchMetrics]);

  // Handle parameter changes
  useEffect(() => {
    fetchMetrics(params, true);
  }, [
    params.timeRange,
    JSON.stringify(params.levels),
    JSON.stringify(params.domains),
    JSON.stringify(params.components),
    fetchMetrics
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refresh,
    lastUpdated
  };
};

export default useLogMetrics;