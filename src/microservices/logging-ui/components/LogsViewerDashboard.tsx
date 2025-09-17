/**
 * T052: Main logs viewer dashboard component
 *
 * Orchestrates the complete log viewing experience by coordinating specialized components
 * for filtering, streaming, display, and export functionality.
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { LogsViewerHeader } from './LogsViewerHeader';
import { LogsFilterBar } from './LogsFilterBar';
import { LogsStatisticsBar } from './LogsStatisticsBar';
import { LogsDisplayPanel } from './LogsDisplayPanel';
import { LogsPagination } from './LogsPagination';
import { StreamingManager } from './StreamingManager';
import { ExportManager } from './ExportManager';
import { useLogsApiService } from './LogsApiService';
import { useLogsViewerState } from './useLogsViewerState';
import { logger } from '../../backend/index';
import { LogViewerConfig, DEFAULT_CONFIG } from './types';
import type { LogEntry } from '../../backend/models/LogEntry';

export interface LogsViewerDashboardProps {
  config?: Partial<LogViewerConfig>;
  onLogSelect?: (log: LogEntry) => void;
  onExport?: (logs: LogEntry[]) => void;
}

export const LogsViewerDashboard: React.FC<LogsViewerDashboardProps> = ({
  config: userConfig = {},
  onLogSelect,
  onExport
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const { loadLogs: loadLogsApi, buildSearchParams } = useLogsApiService(config);
  const {
    state,
    resetFilters,
    setLoading,
    setError,
    setLogsData,
    setFilters,
    setSelectedLogIds,
    setExpandedLogIds,
    setExportInProgress,
    updateStreamingStats
  } = useLogsViewerState(config);

  // Refs for child components
  const streamingManagerRef = useRef<any>(null);
  const exportManagerRef = useRef<any>(null);

  /**
   * Initialize the dashboard
   */
  useEffect(() => {
    logger.info('logs_viewer.dashboard.initialized', {
      config,
      defaultTimeRange: config.defaultTimeRange
    });

    loadLogs();

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Load logs using API service
   */
  const loadLogs = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoading(true);

    try {
      const result = await loadLogsApi(state.filters, page, append);

      setLogsData({
        logs: result.logs,
        totalCount: result.pagination.total || 0,
        currentPage: page,
        stats: result.stats,
        append
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    }
  }, [state.filters, loadLogsApi, setLoading, setLogsData, setError]);

  /**
   * Apply filters and reload data
   */
  const applyFilters = useCallback(() => {
    setLogsData({ ...state, currentPage: 1 } as any);
    loadLogs(1, false);

    if (state.streaming && streamingManagerRef.current) {
      streamingManagerRef.current.updateFilters(state.filters);
    }
  }, [state.filters, state.streaming, loadLogs, setLogsData]);

  /**
   * Handle streaming updates
   */
  const handleStreamingUpdate = useCallback((updates: any) => {
    if (updates.logs) {
      setLogsData({
        logs: updates.logs,
        totalCount: updates.totalCount || state.totalCount,
        currentPage: state.currentPage,
        append: true
      });
    }
    if (updates.streamingStats) {
      updateStreamingStats(updates.streamingStats);
    }
    if (updates.error) {
      setError(updates.error);
    }
  }, [setLogsData, updateStreamingStats, setError, state.totalCount, state.currentPage]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    if (streamingManagerRef.current) {
      streamingManagerRef.current.cleanup();
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      <LogsViewerHeader
        state={state}
        config={config}
        onRefresh={() => loadLogs(1, false)}
        onStreamToggle={(streaming) => {
          if (streaming && streamingManagerRef.current) {
            streamingManagerRef.current.start();
          } else if (streamingManagerRef.current) {
            streamingManagerRef.current.stop();
          }
        }}
        onExport={(format) => exportManagerRef.current?.export(format)}
        onError={setError}
      />

      {config.enableFiltering && (
        <LogsFilterBar
          filters={state.filters}
          config={config}
          onFiltersChange={setFilters}
          onApplyFilters={applyFilters}
          onResetFilters={resetFilters}
        />
      )}

      {state.stats && (
        <LogsStatisticsBar
          stats={state.stats}
          streamingStats={state.streamingStats}
          streaming={state.streaming}
        />
      )}

      <LogsDisplayPanel
        logs={state.filteredLogs}
        selectedLogIds={state.selectedLogIds}
        expandedLogIds={state.expandedLogIds}
        config={config}
        onLogSelect={onLogSelect}
        onSelectionChange={setSelectedLogIds}
        onExpansionChange={setExpandedLogIds}
      />

      {state.totalCount > config.pageSize && (
        <LogsPagination
          currentPage={state.currentPage}
          totalCount={state.totalCount}
          pageSize={config.pageSize}
          loading={state.loading}
          onPageChange={(page) => loadLogs(page)}
        />
      )}

      <StreamingManager
        ref={streamingManagerRef}
        filters={state.filters}
        maxVisibleLogs={config.maxVisibleLogs}
        onUpdate={handleStreamingUpdate}
      />

      <ExportManager
        ref={exportManagerRef}
        buildSearchParams={(page) => buildSearchParams(state.filters, page)}
        totalCount={state.totalCount}
        filteredLogs={state.filteredLogs}
        onExport={onExport}
        onProgress={setExportInProgress}
        onError={setError}
      />
    </div>
  );
};

export default LogsViewerDashboard;