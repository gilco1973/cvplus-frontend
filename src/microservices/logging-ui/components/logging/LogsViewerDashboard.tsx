/**
 * T052: Comprehensive logs viewer dashboard component
 *
 * Advanced log viewing dashboard with real-time streaming, filtering,
 * search capabilities, export functionality, and interactive visualizations.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Filter,
  Download,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  Database,
  AlertCircle,
  TrendingUp,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { logger } from '../../utils/logger';

// Types for the logs viewer
export interface LogViewerConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  realTimeStreaming: boolean;
  pageSize: number;
  maxVisibleLogs: number;
  enableVirtualization: boolean;
  defaultTimeRange: string;
  enableExport: boolean;
  enableFiltering: boolean;
  enableSearch: boolean;
  compactMode: boolean;
}

export interface LogFilter {
  levels: LogLevel[];
  domains: LogDomain[];
  services: string[];
  users: string[];
  timeRange: {
    start: Date | null;
    end: Date | null;
    preset?: string;
  };
  search: {
    query: string;
    regex: boolean;
    caseSensitive: boolean;
  };
  advanced: {
    correlationId: string;
    hasErrors: boolean;
    hasContext: boolean;
    minDuration: number | null;
    maxDuration: number | null;
  };
}

export interface LogsViewerState {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  loading: boolean;
  streaming: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  selectedLogIds: Set<string>;
  expandedLogIds: Set<string>;
  filters: LogFilter;
  stats: LogStats | null;
  exportInProgress: boolean;
  streamingStats: StreamingStats;
}

interface LogStats {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsByDomain: Record<LogDomain, number>;
  logsByService: Record<string, number>;
  errorRate: number;
  averageResponseTime: number;
  timeRange: { start: Date; end: Date };
}

interface StreamingStats {
  connected: boolean;
  messagesReceived: number;
  bytesReceived: number;
  connectionTime: Date | null;
  lastMessage: Date | null;
  subscriptionId: string | null;
}

import { LogLevel, LogDomain, type LogEntry } from '@cvplus/logging';

const DEFAULT_CONFIG: LogViewerConfig = {
  autoRefresh: false,
  refreshInterval: 30000,
  realTimeStreaming: false,
  pageSize: 50,
  maxVisibleLogs: 1000,
  enableVirtualization: true,
  defaultTimeRange: '1h',
  enableExport: true,
  enableFiltering: true,
  enableSearch: true,
  compactMode: false
};

const TIME_RANGE_PRESETS = [
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' }
];

export const LogsViewerDashboard: React.FC<{
  config?: Partial<LogViewerConfig>;
  onLogSelect?: (log: LogEntry) => void;
  onExport?: (logs: LogEntry[]) => void;
}> = ({
  config: userConfig = {},
  onLogSelect,
  onExport
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // State management
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

  // Refs for performance
  const wsRef = useRef<WebSocket | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const virtualListRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize the dashboard
   */
  useEffect(() => {
    logger.logEvent('logs_viewer.dashboard.initialized', {
      config,
      defaultTimeRange: config.defaultTimeRange
    });

    // Load initial data
    loadLogs();

    // Set up auto-refresh if enabled
    if (config.autoRefresh) {
      startAutoRefresh();
    }

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Load logs from API
   */
  const loadLogs = useCallback(async (page: number = 1, append: boolean = false) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchParams = buildSearchParams(page);
      const response = await fetch(`/api/v1/logs/batch?${searchParams}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load logs');
      }

      const newLogs = result.data.logs || [];
      const pagination = result.data.pagination || {};
      const stats = result.data.stats || null;

      setState(prev => ({
        ...prev,
        logs: append ? [...prev.logs, ...newLogs] : newLogs,
        totalCount: pagination.total || 0,
        currentPage: page,
        loading: false,
        stats,
        filteredLogs: append ? [...prev.filteredLogs, ...newLogs] : newLogs
      }));

      logger.logEvent('logs_viewer.logs_loaded', {
        count: newLogs.length,
        total: pagination.total,
        page,
        append
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      logger.logError('logs_viewer.load_failed', error, {
        page,
        append
      });
    }
  }, [state.filters]);

  /**
   * Build search parameters for API request
   */
  const buildSearchParams = useCallback((page: number): string => {
    const params = new URLSearchParams();

    // Pagination
    params.set('page', page.toString());
    params.set('limit', config.pageSize.toString());

    // Time range
    if (state.filters.timeRange.preset && state.filters.timeRange.preset !== 'custom') {
      params.set('timeRange', state.filters.timeRange.preset);
    } else if (state.filters.timeRange.start && state.filters.timeRange.end) {
      params.set('startTime', state.filters.timeRange.start.toISOString());
      params.set('endTime', state.filters.timeRange.end.toISOString());
    }

    // Filters
    if (state.filters.levels.length > 0) {
      state.filters.levels.forEach(level => params.append('level', level));
    }
    if (state.filters.domains.length > 0) {
      state.filters.domains.forEach(domain => params.append('domain', domain));
    }
    if (state.filters.services.length > 0) {
      state.filters.services.forEach(service => params.append('serviceName', service));
    }
    if (state.filters.users.length > 0) {
      state.filters.users.forEach(user => params.append('userId', user));
    }

    // Search
    if (state.filters.search.query) {
      params.set('query', state.filters.search.query);
    }

    // Advanced filters
    if (state.filters.advanced.correlationId) {
      params.set('correlationId', state.filters.advanced.correlationId);
    }
    if (state.filters.advanced.hasErrors) {
      params.set('hasErrors', 'true');
    }
    if (state.filters.advanced.hasContext) {
      params.set('hasContext', 'true');
    }

    // Include stats
    params.set('includeStats', 'true');

    return params.toString();
  }, [state.filters, config.pageSize]);

  /**
   * Start real-time streaming
   */
  const startStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/logs/stream`);

    ws.onopen = () => {
      logger.logEvent('logs_viewer.stream_connected');

      setState(prev => ({
        ...prev,
        streaming: true,
        streamingStats: {
          ...prev.streamingStats,
          connected: true,
          connectionTime: new Date()
        }
      }));

      // Subscribe to log stream with current filters
      const subscribeMessage = {
        action: 'subscribe',
        filters: convertFiltersForStream(state.filters),
        options: {
          includeContext: true,
          format: 'json'
        }
      };

      ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleStreamMessage(message);
      } catch (error) {
        logger.logError('logs_viewer.stream_message_parse_error', error);
      }
    };

    ws.onclose = (event) => {
      logger.logEvent('logs_viewer.stream_disconnected', {
        code: event.code,
        reason: event.reason
      });

      setState(prev => ({
        ...prev,
        streaming: false,
        streamingStats: {
          ...prev.streamingStats,
          connected: false
        }
      }));
    };

    ws.onerror = (error) => {
      logger.logError('logs_viewer.stream_error', error);
      setState(prev => ({
        ...prev,
        error: 'WebSocket connection error'
      }));
    };

    wsRef.current = ws;
  }, [state.filters]);

  /**
   * Handle streaming messages
   */
  const handleStreamMessage = useCallback((message: any) => {
    if (message.type === 'log' && message.data?.logs) {
      const newLogs = message.data.logs;

      setState(prev => {
        const updatedLogs = [...newLogs, ...prev.logs].slice(0, config.maxVisibleLogs);

        return {
          ...prev,
          logs: updatedLogs,
          filteredLogs: updatedLogs,
          streamingStats: {
            ...prev.streamingStats,
            messagesReceived: prev.streamingStats.messagesReceived + 1,
            bytesReceived: prev.streamingStats.bytesReceived + JSON.stringify(newLogs).length,
            lastMessage: new Date()
          }
        };
      });

      logger.trackPerformance('logs_viewer.stream_message_processed', performance.now());
    }
  }, [config.maxVisibleLogs]);

  /**
   * Stop streaming
   */
  const stopStreaming = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      streaming: false,
      streamingStats: {
        ...prev.streamingStats,
        connected: false
      }
    }));

    logger.logEvent('logs_viewer.stream_stopped');
  }, []);

  /**
   * Auto-refresh functionality
   */
  const startAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    refreshTimerRef.current = setInterval(() => {
      if (!state.streaming) {
        loadLogs(1, false);
      }
    }, config.refreshInterval);

    logger.logEvent('logs_viewer.auto_refresh_started', {
      interval: config.refreshInterval
    });
  }, [config.refreshInterval, state.streaming, loadLogs]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Export functionality
   */
  const exportLogs = useCallback(async (format: 'json' | 'csv' | 'txt' = 'json') => {
    setState(prev => ({ ...prev, exportInProgress: true }));

    try {
      const searchParams = buildSearchParams(1);
      const response = await fetch('/api/v1/logs/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: Object.fromEntries(new URLSearchParams(searchParams)),
          format,
          async: state.totalCount > 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      if (state.totalCount > 1000) {
        const result = await response.json();
        logger.logEvent('logs_viewer.export_job_created', {
          jobId: result.data.jobId,
          format
        });
        alert(`Export job created: ${result.data.jobId}. You'll be notified when complete.`);
      } else {
        // Direct download for small exports
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cvplus-logs-${new Date().toISOString().slice(0, 19)}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        logger.logEvent('logs_viewer.export_completed', {
          format,
          size: blob.size
        });
      }

      if (onExport) {
        onExport(state.filteredLogs);
      }

    } catch (error) {
      logger.logError('logs_viewer.export_failed', error, { format });
      setState(prev => ({ ...prev, error: `Export failed: ${error.message}` }));
    } finally {
      setState(prev => ({ ...prev, exportInProgress: false }));
    }
  }, [state.totalCount, state.filteredLogs, buildSearchParams, onExport]);

  /**
   * Filter and search functionality
   */
  const applyFilters = useCallback(() => {
    setState(prev => ({ ...prev, currentPage: 1 }));
    loadLogs(1, false);

    if (state.streaming) {
      // Update streaming subscription with new filters
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const updateMessage = {
          action: 'subscribe',
          filters: convertFiltersForStream(state.filters)
        };
        wsRef.current.send(JSON.stringify(updateMessage));
      }
    }
  }, [state.filters, state.streaming, loadLogs]);

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

  /**
   * Log selection and interaction
   */
  const toggleLogSelection = useCallback((logId: string) => {
    setState(prev => {
      const newSelection = new Set(prev.selectedLogIds);
      if (newSelection.has(logId)) {
        newSelection.delete(logId);
      } else {
        newSelection.add(logId);
      }
      return { ...prev, selectedLogIds: newSelection };
    });
  }, []);

  const toggleLogExpansion = useCallback((logId: string) => {
    setState(prev => {
      const newExpansion = new Set(prev.expandedLogIds);
      if (newExpansion.has(logId)) {
        newExpansion.delete(logId);
      } else {
        newExpansion.add(logId);
      }
      return { ...prev, expandedLogIds: newExpansion };
    });

    const log = state.logs.find(l => l.id === logId);
    if (log && onLogSelect) {
      onLogSelect(log);
    }
  }, [state.logs, onLogSelect]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
  }, []);

  /**
   * Helper functions
   */
  const convertFiltersForStream = (filters: LogFilter) => {
    return {
      level: filters.levels,
      domain: filters.domains,
      serviceName: filters.services,
      userId: filters.users,
      keywords: filters.search.query ? [filters.search.query] : undefined,
      correlationId: filters.advanced.correlationId || undefined
    };
  };

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.FATAL: return 'text-red-500 bg-red-50 border-red-200';
      case LogLevel.ERROR: return 'text-red-600 bg-red-50 border-red-200';
      case LogLevel.WARN: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case LogLevel.INFO: return 'text-blue-600 bg-blue-50 border-blue-200';
      case LogLevel.DEBUG: return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Log Viewer</h1>

            {/* Status indicators */}
            <div className="flex items-center gap-2">
              {state.streaming && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              )}

              {state.loading && (
                <div className="flex items-center gap-1 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading</span>
                </div>
              )}

              <div className="text-sm text-gray-500">
                {state.totalCount.toLocaleString()} total logs
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => state.streaming ? stopStreaming() : startStreaming()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                state.streaming
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {state.streaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {state.streaming ? 'Stop Stream' : 'Start Stream'}
            </button>

            <button
              onClick={() => loadLogs(1, false)}
              disabled={state.loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {config.enableExport && (
              <div className="relative">
                <button
                  onClick={() => exportLogs('json')}
                  disabled={state.exportInProgress}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {state.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm text-red-700">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Filter bar */}
      {config.enableFiltering && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Search */}
            {config.enableSearch && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={state.filters.search.query}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filters: {
                        ...prev.filters,
                        search: { ...prev.filters.search, query: e.target.value }
                      }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Time range selector */}
            <select
              value={state.filters.timeRange.preset || 'custom'}
              onChange={(e) => setState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  timeRange: { ...prev.filters.timeRange, preset: e.target.value }
                }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {TIME_RANGE_PRESETS.map(preset => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>

            {/* Level filter */}
            <select
              multiple
              value={state.filters.levels}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value as LogLevel);
                setState(prev => ({
                  ...prev,
                  filters: { ...prev.filters, levels: selected }
                }));
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(LogLevel).map(level => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>

            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Statistics bar */}
      {state.stats && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-blue-50 px-6 py-3">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                Error Rate: {state.stats.errorRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                Avg Response: {state.stats.averageResponseTime.toFixed(0)}ms
              </span>
            </div>

            {state.streaming && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  {state.streamingStats.messagesReceived} messages received
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logs list */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={virtualListRef}
          className="h-full overflow-y-auto"
        >
          {state.filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No logs found</p>
                <p className="text-sm">Try adjusting your filters or time range</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {state.filteredLogs.map((log, index) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                    state.selectedLogIds.has(log.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }`}
                  onClick={() => toggleLogSelection(log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Log header */}
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLogLevelColor(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>

                        <span className="text-xs text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </span>

                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {log.serviceName}
                        </span>

                        {log.correlationId && (
                          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                            {log.correlationId.substring(0, 8)}...
                          </span>
                        )}
                      </div>

                      {/* Log message */}
                      <p className={`text-sm text-gray-900 ${config.compactMode ? 'truncate' : ''}`}>
                        {log.message}
                      </p>

                      {/* Expanded content */}
                      {state.expandedLogIds.has(log.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          {log.context && (
                            <div className="mb-3">
                              <h4 className="text-xs font-medium text-gray-700 mb-2">Context</h4>
                              <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
                                {JSON.stringify(log.context, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Domain:</span> {log.domain}
                            </div>
                            <div>
                              <span className="font-medium">User ID:</span> {log.userId || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Log ID:</span> {log.id}
                            </div>
                            <div>
                              <span className="font-medium">Correlation ID:</span> {log.correlationId || 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expand button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLogExpansion(log.id);
                      }}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {state.expandedLogIds.has(log.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with pagination */}
      {state.totalCount > config.pageSize && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((state.currentPage - 1) * config.pageSize) + 1} to {Math.min(state.currentPage * config.pageSize, state.totalCount)} of {state.totalCount} logs
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadLogs(state.currentPage - 1)}
                disabled={state.currentPage <= 1 || state.loading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm">
                Page {state.currentPage} of {Math.ceil(state.totalCount / config.pageSize)}
              </span>

              <button
                onClick={() => loadLogs(state.currentPage + 1)}
                disabled={state.currentPage >= Math.ceil(state.totalCount / config.pageSize) || state.loading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsViewerDashboard;