/**
 * Custom hook for logs viewer state management
 * Handles all state logic for the logs viewer dashboard
 */

import { useState, useCallback } from 'react';
import { LogsViewerState, LogViewerConfig } from './types';

export const useLogsViewerState = (config: LogViewerConfig) => {
  const [state, setState] = useState<LogsViewerState>({
    logs: [],
    filteredLogs: [],
    loading: false,
    streaming: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    selectedLogIds: new Set(),
    expandedLogIds: new Set(),
    filters: {
      levels: [],
      domains: [],
      services: [],
      users: [],
      timeRange: { start: null, end: null, preset: config.defaultTimeRange },
      search: { query: '', regex: false, caseSensitive: false },
      advanced: {
        correlationId: '',
        hasErrors: false,
        hasContext: false,
        minDuration: null,
        maxDuration: null
      }
    },
    stats: null,
    exportInProgress: false,
    streamingStats: {
      connected: false,
      messagesReceived: 0,
      bytesReceived: 0,
      connectionTime: null,
      lastMessage: null,
      subscriptionId: null
    }
  });

  const updateState = useCallback((updates: Partial<LogsViewerState> | ((prev: LogsViewerState) => LogsViewerState)) => {
    if (typeof updates === 'function') {
      setState(updates);
    } else {
      setState(prev => ({ ...prev, ...updates }));
    }
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {
        levels: [],
        domains: [],
        services: [],
        users: [],
        timeRange: { start: null, end: null, preset: config.defaultTimeRange },
        search: { query: '', regex: false, caseSensitive: false },
        advanced: {
          correlationId: '',
          hasErrors: false,
          hasContext: false,
          minDuration: null,
          maxDuration: null
        }
      }
    }));
  }, [config.defaultTimeRange]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading, error: loading ? null : prev.error }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const setLogsData = useCallback((logsData: {
    logs: any[];
    totalCount: number;
    currentPage: number;
    stats?: any;
    append?: boolean;
  }) => {
    setState(prev => ({
      ...prev,
      logs: logsData.append ? [...prev.logs, ...logsData.logs] : logsData.logs,
      filteredLogs: logsData.append ? [...prev.filteredLogs, ...logsData.logs] : logsData.logs,
      totalCount: logsData.totalCount,
      currentPage: logsData.currentPage,
      stats: logsData.stats || prev.stats,
      loading: false
    }));
  }, []);

  const setFilters = useCallback((filters: LogsViewerState['filters']) => {
    setState(prev => ({ ...prev, filters }));
  }, []);

  const setSelectedLogIds = useCallback((selectedLogIds: Set<string>) => {
    setState(prev => ({ ...prev, selectedLogIds }));
  }, []);

  const setExpandedLogIds = useCallback((expandedLogIds: Set<string>) => {
    setState(prev => ({ ...prev, expandedLogIds }));
  }, []);

  const setExportInProgress = useCallback((exportInProgress: boolean) => {
    setState(prev => ({ ...prev, exportInProgress }));
  }, []);

  const updateStreamingStats = useCallback((streamingData: any) => {
    setState(prev => ({ ...prev, ...streamingData }));
  }, []);

  return {
    state,
    updateState,
    resetFilters,
    setLoading,
    setError,
    setLogsData,
    setFilters,
    setSelectedLogIds,
    setExpandedLogIds,
    setExportInProgress,
    updateStreamingStats
  };
};