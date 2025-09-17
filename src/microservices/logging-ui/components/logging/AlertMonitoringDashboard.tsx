/**
 * T053: Alert monitoring dashboard component
 *
 * Comprehensive alert monitoring dashboard with real-time updates,
 * alert management, escalation tracking, and interactive visualizations.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  Users,
  Calendar,
  TrendingUp,
  Activity,
  Settings,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Zap
} from 'lucide-react';
import { logger } from '../../utils/logger';

// Alert types and interfaces
export enum AlertStatus {
  TRIGGERED = 'triggered',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  SUPPRESSED = 'suppressed'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AlertInstance {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggerTime: Date;
  resolvedTime?: Date;
  acknowledgedTime?: Date;
  acknowledgedBy?: string;
  escalationLevel: number;
  matchedLogs: string[];
  context: Record<string, any>;
  actions: AlertActionResult[];
  metadata: {
    environment: string;
    region: string;
    source: string;
    tags: string[];
  };
}

export interface AlertActionResult {
  id: string;
  actionType: string;
  status: 'pending' | 'completed' | 'failed' | 'skipped';
  executedAt?: Date;
  completedAt?: Date;
  attempts: number;
  lastError?: string;
  result?: any;
}

export interface AlertStats {
  total: number;
  byStatus: Record<AlertStatus, number>;
  bySeverity: Record<AlertSeverity, number>;
  byRule: Record<string, number>;
  escalationStats: {
    averageEscalationLevel: number;
    highestEscalationLevel: number;
    escalatedAlerts: number;
  };
  responseStats: {
    averageAcknowledgmentTime: number;
    averageResolutionTime: number;
    unacknowledgedCount: number;
    unresolvedCount: number;
  };
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface AlertFilter {
  status: AlertStatus[];
  severity: AlertSeverity[];
  ruleId: string[];
  ruleName: string;
  acknowledgedBy: string[];
  unacknowledged: boolean;
  escalationLevel: number[];
  timeRange: {
    start: Date | null;
    end: Date | null;
    preset?: string;
  };
  search: string;
  tags: string[];
  environment: string[];
}

export interface AlertDashboardConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  realTimeUpdates: boolean;
  showResolvedAlerts: boolean;
  compactMode: boolean;
  enableBulkActions: boolean;
  enableNotifications: boolean;
  pageSize: number;
  defaultTimeRange: string;
}

const DEFAULT_CONFIG: AlertDashboardConfig = {
  autoRefresh: true,
  refreshInterval: 30000,
  realTimeUpdates: true,
  showResolvedAlerts: false,
  compactMode: false,
  enableBulkActions: true,
  enableNotifications: true,
  pageSize: 25,
  defaultTimeRange: '24h'
};

const TIME_RANGE_PRESETS = [
  { label: 'Last hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' }
];

export const AlertMonitoringDashboard: React.FC<{
  config?: Partial<AlertDashboardConfig>;
  onAlertSelect?: (alert: AlertInstance) => void;
  onBulkAction?: (alertIds: string[], action: string) => void;
}> = ({
  config: userConfig = {},
  onAlertSelect,
  onBulkAction
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // State management
  const [alerts, setAlerts] = useState<AlertInstance[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<AlertFilter>({
    status: config.showResolvedAlerts ? [] : [AlertStatus.TRIGGERED, AlertStatus.ACKNOWLEDGED, AlertStatus.ESCALATED],
    severity: [],
    ruleId: [],
    ruleName: '',
    acknowledgedBy: [],
    unacknowledged: false,
    escalationLevel: [],
    timeRange: { start: null, end: null, preset: config.defaultTimeRange },
    search: '',
    tags: [],
    environment: []
  });

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [sortBy, setSortBy] = useState<'triggerTime' | 'severity' | 'status'>('triggerTime');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Refs
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  /**
   * Initialize dashboard
   */
  useEffect(() => {
    logger.logEvent('alert_dashboard.initialized', {
      config,
      defaultTimeRange: config.defaultTimeRange
    });

    loadAlerts();
    loadStats();

    if (config.autoRefresh) {
      startAutoRefresh();
    }

    if (config.realTimeUpdates) {
      connectWebSocket();
    }

    return () => {
      cleanup();
    };
  }, []);

  /**
   * Load alerts from API
   */
  const loadAlerts = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = buildAlertSearchParams(page);
      const response = await fetch(`/api/v1/alerts?${searchParams}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load alerts');
      }

      const alertData = result.data.alerts || [];
      const pagination = result.data.pagination || {};

      setAlerts(alertData);
      setTotalCount(pagination.total || 0);
      setCurrentPage(page);

      logger.logEvent('alert_dashboard.alerts_loaded', {
        count: alertData.length,
        total: pagination.total,
        page
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);

      logger.logError('alert_dashboard.load_alerts_failed', error, {
        page
      });
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, config.pageSize]);

  /**
   * Load statistics from API
   */
  const loadStats = useCallback(async () => {
    try {
      const timeRange = filters.timeRange.preset || '24h';
      const response = await fetch(`/api/v1/alerts/stats?timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }

    } catch (error) {
      logger.logError('alert_dashboard.load_stats_failed', error);
    }
  }, [filters.timeRange.preset]);

  /**
   * Build search parameters for alerts API
   */
  const buildAlertSearchParams = useCallback((page: number): string => {
    const params = new URLSearchParams();

    // Pagination
    params.set('page', page.toString());
    params.set('limit', config.pageSize.toString());

    // Sorting
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);

    // Filters
    if (filters.status.length > 0) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters.severity.length > 0) {
      filters.severity.forEach(severity => params.append('severity', severity));
    }
    if (filters.ruleId.length > 0) {
      filters.ruleId.forEach(ruleId => params.append('ruleId', ruleId));
    }
    if (filters.ruleName) {
      params.set('ruleName', filters.ruleName);
    }
    if (filters.acknowledgedBy.length > 0) {
      filters.acknowledgedBy.forEach(user => params.append('acknowledgedBy', user));
    }
    if (filters.unacknowledged) {
      params.set('unacknowledged', 'true');
    }
    if (filters.search) {
      params.set('search', filters.search);
    }

    // Time range
    if (filters.timeRange.preset && filters.timeRange.preset !== 'custom') {
      params.set('timeRange', filters.timeRange.preset);
    } else if (filters.timeRange.start && filters.timeRange.end) {
      params.set('triggerTimeStart', filters.timeRange.start.toISOString());
      params.set('triggerTimeEnd', filters.timeRange.end.toISOString());
    }

    // Include resolved alerts
    params.set('includeResolvedAlerts', config.showResolvedAlerts.toString());

    return params.toString();
  }, [filters, sortBy, sortOrder, config.pageSize, config.showResolvedAlerts]);

  /**
   * WebSocket connection for real-time updates
   */
  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/api/v1/alerts/stream`);

    ws.onopen = () => {
      logger.logEvent('alert_dashboard.websocket_connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      } catch (error) {
        logger.logError('alert_dashboard.websocket_message_error', error);
      }
    };

    ws.onclose = () => {
      logger.logEvent('alert_dashboard.websocket_disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (config.realTimeUpdates) {
          connectWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      logger.logError('alert_dashboard.websocket_error', error);
    };

    wsRef.current = ws;
  }, [config.realTimeUpdates]);

  /**
   * Handle WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'alert_update') {
      const updatedAlert = message.data;

      setAlerts(prev => {
        const index = prev.findIndex(alert => alert.id === updatedAlert.id);
        if (index >= 0) {
          const newAlerts = [...prev];
          newAlerts[index] = updatedAlert;
          return newAlerts;
        } else {
          return [updatedAlert, ...prev];
        }
      });

      // Show notification for new high-priority alerts
      if (config.enableNotifications &&
          updatedAlert.severity === AlertSeverity.CRITICAL &&
          updatedAlert.status === AlertStatus.TRIGGERED) {
        showNotification(updatedAlert);
      }

      // Refresh stats
      loadStats();
    }
  }, [config.enableNotifications, loadStats]);

  /**
   * Show browser notification
   */
  const showNotification = useCallback((alert: AlertInstance) => {
    if (Notification.permission === 'granted') {
      new Notification('Critical Alert', {
        body: `${alert.ruleName}: ${alert.context.message || 'Critical alert triggered'}`,
        icon: '/favicon.ico',
        tag: alert.id
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification(alert);
        }
      });
    }
  }, []);

  /**
   * Auto-refresh functionality
   */
  const startAutoRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    refreshTimerRef.current = setInterval(() => {
      loadAlerts(currentPage);
      loadStats();
    }, config.refreshInterval);
  }, [config.refreshInterval, currentPage, loadAlerts, loadStats]);

  /**
   * Alert actions
   */
  const acknowledgeAlert = useCallback(async (alertId: string, note?: string) => {
    try {
      const response = await fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      });

      if (!response.ok) {
        throw new Error(`Failed to acknowledge alert: ${response.statusText}`);
      }

      logger.logEvent('alert_dashboard.alert_acknowledged', {
        alertId,
        hasNote: !!note
      });

      // Refresh alerts
      loadAlerts(currentPage);

    } catch (error) {
      logger.logError('alert_dashboard.acknowledge_failed', error, { alertId });
      setError(`Failed to acknowledge alert: ${error.message}`);
    }
  }, [currentPage, loadAlerts]);

  const resolveAlert = useCallback(async (alertId: string, note?: string, resolution?: string) => {
    try {
      const response = await fetch(`/api/v1/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note, resolution })
      });

      if (!response.ok) {
        throw new Error(`Failed to resolve alert: ${response.statusText}`);
      }

      logger.logEvent('alert_dashboard.alert_resolved', {
        alertId,
        hasNote: !!note,
        resolution
      });

      // Refresh alerts
      loadAlerts(currentPage);

    } catch (error) {
      logger.logError('alert_dashboard.resolve_failed', error, { alertId });
      setError(`Failed to resolve alert: ${error.message}`);
    }
  }, [currentPage, loadAlerts]);

  const performBulkAction = useCallback(async (action: string, parameters?: any) => {
    if (selectedAlertIds.size === 0) return;

    try {
      const response = await fetch('/api/v1/alerts/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alertIds: Array.from(selectedAlertIds),
          action,
          parameters
        })
      });

      if (!response.ok) {
        throw new Error(`Bulk action failed: ${response.statusText}`);
      }

      const result = await response.json();

      logger.logEvent('alert_dashboard.bulk_action_performed', {
        action,
        alertCount: selectedAlertIds.size,
        successful: result.data?.successful?.length || 0,
        failed: result.data?.failed?.length || 0
      });

      // Clear selection and refresh
      setSelectedAlertIds(new Set());
      setBulkActionMode(false);
      loadAlerts(currentPage);

      if (onBulkAction) {
        onBulkAction(Array.from(selectedAlertIds), action);
      }

    } catch (error) {
      logger.logError('alert_dashboard.bulk_action_failed', error, {
        action,
        alertCount: selectedAlertIds.size
      });
      setError(`Bulk action failed: ${error.message}`);
    }
  }, [selectedAlertIds, currentPage, loadAlerts, onBulkAction]);

  /**
   * Helper functions
   */
  const getSeverityColor = (severity: AlertSeverity): string => {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'text-red-600 bg-red-100 border-red-200';
      case AlertSeverity.HIGH: return 'text-orange-600 bg-orange-100 border-orange-200';
      case AlertSeverity.MEDIUM: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case AlertSeverity.LOW: return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: AlertStatus): string => {
    switch (status) {
      case AlertStatus.TRIGGERED: return 'text-red-600 bg-red-50';
      case AlertStatus.ACKNOWLEDGED: return 'text-blue-600 bg-blue-50';
      case AlertStatus.RESOLVED: return 'text-green-600 bg-green-50';
      case AlertStatus.ESCALATED: return 'text-purple-600 bg-purple-50';
      case AlertStatus.SUPPRESSED: return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.TRIGGERED: return <AlertTriangle className="w-4 h-4" />;
      case AlertStatus.ACKNOWLEDGED: return <Eye className="w-4 h-4" />;
      case AlertStatus.RESOLVED: return <CheckCircle className="w-4 h-4" />;
      case AlertStatus.ESCALATED: return <ArrowUp className="w-4 h-4" />;
      case AlertStatus.SUPPRESSED: return <BellOff className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatDuration = (start: Date, end?: Date): string => {
    const endTime = end || new Date();
    const duration = endTime.getTime() - start.getTime();

    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString();
  };

  const cleanup = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Alert Monitor</h1>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
              {config.realTimeUpdates && (
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-1 text-blue-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading</span>
                </div>
              )}

              <div className="text-sm text-gray-500">
                {totalCount} total alerts
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              } hover:bg-gray-200`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {config.enableBulkActions && (
              <button
                onClick={() => setBulkActionMode(!bulkActionMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
                  bulkActionMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                } hover:bg-gray-200`}
              >
                <Settings className="w-4 h-4" />
                Bulk Actions
              </button>
            )}

            <button
              onClick={() => {
                loadAlerts(1);
                loadStats();
              }}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Statistics bar */}
      {stats && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="grid grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.byStatus[AlertStatus.TRIGGERED] || 0}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.byStatus[AlertStatus.ACKNOWLEDGED] || 0}
              </div>
              <div className="text-xs text-gray-600">Acknowledged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.byStatus[AlertStatus.RESOLVED] || 0}
              </div>
              <div className="text-xs text-gray-600">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.escalationStats.escalatedAlerts}
              </div>
              <div className="text-xs text-gray-600">Escalated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(stats.responseStats.averageAcknowledgmentTime / 60000)}m
              </div>
              <div className="text-xs text-gray-600">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Math.round(stats.responseStats.averageResolutionTime / 60000)}m
              </div>
              <div className="text-xs text-gray-600">Avg Resolution</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters panel */}
      {showFilters && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                multiple
                value={filters.status}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as AlertStatus);
                  setFilters(prev => ({ ...prev, status: selected }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {Object.values(AlertStatus).map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
              <select
                multiple
                value={filters.severity}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value as AlertSeverity);
                  setFilters(prev => ({ ...prev, severity: selected }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {Object.values(AlertSeverity).map(severity => (
                  <option key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Time range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange.preset || 'custom'}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  timeRange: { ...prev.timeRange, preset: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {TIME_RANGE_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search alerts..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(1);
                loadAlerts(1);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({
                status: config.showResolvedAlerts ? [] : [AlertStatus.TRIGGERED, AlertStatus.ACKNOWLEDGED, AlertStatus.ESCALATED],
                severity: [],
                ruleId: [],
                ruleName: '',
                acknowledgedBy: [],
                unacknowledged: false,
                escalationLevel: [],
                timeRange: { start: null, end: null, preset: config.defaultTimeRange },
                search: '',
                tags: [],
                environment: []
              })}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Bulk actions bar */}
      {bulkActionMode && selectedAlertIds.size > 0 && (
        <div className="flex-shrink-0 border-b border-gray-200 bg-blue-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {selectedAlertIds.size} alert{selectedAlertIds.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => performBulkAction('acknowledge')}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Acknowledge
              </button>
              <button
                onClick={() => performBulkAction('resolve')}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Resolve
              </button>
              <button
                onClick={() => {
                  setSelectedAlertIds(new Set());
                  setBulkActionMode(false);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No alerts found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedAlertIds.has(alert.id) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (bulkActionMode) {
                      const newSelection = new Set(selectedAlertIds);
                      if (newSelection.has(alert.id)) {
                        newSelection.delete(alert.id);
                      } else {
                        newSelection.add(alert.id);
                      }
                      setSelectedAlertIds(newSelection);
                    } else if (onAlertSelect) {
                      onAlertSelect(alert);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Alert header */}
                      <div className="flex items-center gap-3 mb-2">
                        {bulkActionMode && (
                          <input
                            type="checkbox"
                            checked={selectedAlertIds.has(alert.id)}
                            onChange={() => {}}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </span>

                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.triggerTime)}
                        </span>

                        {alert.escalationLevel > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <Zap className="w-3 h-3" />
                            L{alert.escalationLevel}
                          </span>
                        )}

                        <span className="text-xs text-gray-500">
                          Duration: {formatDuration(alert.triggerTime, alert.resolvedTime)}
                        </span>
                      </div>

                      {/* Alert title and description */}
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {alert.ruleName}
                      </h3>

                      <p className="text-sm text-gray-600 mb-2">
                        {alert.context.message || 'No additional details available'}
                      </p>

                      {/* Tags and metadata */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {alert.metadata.environment}
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                          {alert.metadata.source}
                        </span>
                        {alert.acknowledgedBy && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Acked by {alert.acknowledgedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!bulkActionMode && (
                      <div className="ml-4 flex items-center gap-2">
                        {alert.status === AlertStatus.TRIGGERED && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeAlert(alert.id);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Acknowledge"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {(alert.status === AlertStatus.TRIGGERED || alert.status === AlertStatus.ACKNOWLEDGED) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveAlert(alert.id);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Resolve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                          title="More actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer with pagination */}
      {totalCount > config.pageSize && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * config.pageSize) + 1} to {Math.min(currentPage * config.pageSize, totalCount)} of {totalCount} alerts
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAlerts(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {Math.ceil(totalCount / config.pageSize)}
              </span>

              <button
                onClick={() => loadAlerts(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / config.pageSize) || loading}
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

export default AlertMonitoringDashboard;