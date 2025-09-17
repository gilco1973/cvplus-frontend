/**
 * Shared types for the LogsViewer dashboard components
  */

import { LogLevel, LogDomain } from '../../backend/types/index';
import type { LogEntry } from '../../backend/models/LogEntry';

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

export interface LogStats {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsByDomain: Record<LogDomain, number>;
  logsByService: Record<string, number>;
  errorRate: number;
  averageResponseTime: number;
  timeRange: { start: Date; end: Date };
}

export interface StreamingStats {
  connected: boolean;
  messagesReceived: number;
  bytesReceived: number;
  connectionTime: Date | null;
  lastMessage: Date | null;
  subscriptionId: string | null;
}

export const DEFAULT_CONFIG: LogViewerConfig = {
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

export const TIME_RANGE_PRESETS = [
  { label: 'Last 15 minutes', value: '15m' },
  { label: 'Last hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' }
];