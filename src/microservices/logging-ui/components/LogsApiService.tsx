/**
 * API service for logs operations
 * Handles all API calls and data management for the logs viewer
 */

import { useCallback } from 'react';
import { LogFilter, LogViewerConfig } from './types';
import { logger } from '../../backend/index';
import type { LogEntry } from '../../backend/models/LogEntry';

export const useLogsApiService = (config: LogViewerConfig) => {
  /**
   * Build search parameters for API request
   */
  const buildSearchParams = useCallback((filters: LogFilter, page: number): string => {
    const params = new URLSearchParams();

    // Pagination
    params.set('page', page.toString());
    params.set('limit', config.pageSize.toString());

    // Time range
    if (filters.timeRange.preset && filters.timeRange.preset !== 'custom') {
      params.set('timeRange', filters.timeRange.preset);
    } else if (filters.timeRange.start && filters.timeRange.end) {
      params.set('startTime', filters.timeRange.start.toISOString());
      params.set('endTime', filters.timeRange.end.toISOString());
    }

    // Filters
    if (filters.levels.length > 0) {
      filters.levels.forEach(level => params.append('level', level));
    }
    if (filters.domains.length > 0) {
      filters.domains.forEach(domain => params.append('domain', domain));
    }
    if (filters.services.length > 0) {
      filters.services.forEach(service => params.append('serviceName', service));
    }
    if (filters.users.length > 0) {
      filters.users.forEach(user => params.append('userId', user));
    }

    // Search
    if (filters.search.query) {
      params.set('query', filters.search.query);
    }

    // Advanced filters
    if (filters.advanced.correlationId) {
      params.set('correlationId', filters.advanced.correlationId);
    }
    if (filters.advanced.hasErrors) {
      params.set('hasErrors', 'true');
    }
    if (filters.advanced.hasContext) {
      params.set('hasContext', 'true');
    }

    params.set('includeStats', 'true');

    return params.toString();
  }, [config.pageSize]);

  /**
   * Load logs from API
   */
  const loadLogs = useCallback(async (filters: LogFilter, page: number = 1, append: boolean = false) => {
    try {
      const searchParams = buildSearchParams(filters, page);
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

      logger.info('logs_viewer.logs_loaded', {
        count: newLogs.length,
        total: pagination.total,
        page,
        append
      });

      return {
        logs: newLogs,
        pagination,
        stats
      };

    } catch (error) {
      logger.error('logs_viewer.load_failed', { page, append }, error instanceof Error ? error : undefined);
      throw error;
    }
  }, [buildSearchParams]);

  return {
    loadLogs,
    buildSearchParams
  };
};