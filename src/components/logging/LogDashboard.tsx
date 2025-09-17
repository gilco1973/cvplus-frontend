/**
 * T052: Log Dashboard main component in frontend/src/components/logging/LogDashboard.tsx
 *
 * Main logging dashboard providing overview metrics, real-time monitoring,
 * and navigation to detailed logging features. Serves as the central hub
 * for all logging-related functionality in CVPlus.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Search,
  Download,
  Filter,
  RefreshCw,
  Clock,
  Users,
  Server,
  Zap
} from 'lucide-react';
import { LogLevel, LogDomain } from '@cvplus/logging';
import { useLogMetrics } from '../../hooks/useLogMetrics';
import { useLogStream } from '../../hooks/useLogStream';
import { LogMetricsCards } from './LogMetricsCards';
import { LogLevelChart } from './LogLevelChart';
import { LogTimelineChart } from './LogTimelineChart';
import { RecentLogsTable } from './RecentLogsTable';
import { SecurityAlertsPanel } from './SecurityAlertsPanel';
import { PerformanceMetricsPanel } from './PerformanceMetricsPanel';
import { LogSearchPanel } from './LogSearchPanel';

interface LogDashboardProps {
  className?: string;
  defaultTimeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  autoRefresh?: boolean;
  refreshInterval?: number; // seconds
}

type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

interface DashboardFilters {
  timeRange: TimeRange;
  levels: LogLevel[];
  domains: LogDomain[];
  components: string[];
  search: string;
  showErrorsOnly: boolean;
  showSecurityOnly: boolean;
}

const DEFAULT_FILTERS: DashboardFilters = {
  timeRange: '24h',
  levels: [],
  domains: [],
  components: [],
  search: '',
  showErrorsOnly: false,
  showSecurityOnly: false
};

export const LogDashboard: React.FC<LogDashboardProps> = ({
  className = '',
  defaultTimeRange = '24h',
  autoRefresh = true,
  refreshInterval = 30
}) => {
  // State management
  const [filters, setFilters] = useState<DashboardFilters>({
    ...DEFAULT_FILTERS,
    timeRange: defaultTimeRange
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'security' | 'search'>('overview');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Custom hooks
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics
  } = useLogMetrics({
    timeRange: filters.timeRange,
    levels: filters.levels,
    domains: filters.domains,
    components: filters.components,
    autoRefresh,
    refreshInterval
  });

  const {
    isConnected: streamConnected,
    logs: recentLogs,
    stats: streamStats,
    connect: connectStream,
    disconnect: disconnectStream
  } = useLogStream({
    level: filters.levels,
    domain: filters.domains,
    component: filters.components,
    onlyErrors: filters.showErrorsOnly,
    includePattern: filters.search || undefined
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshMetrics();
        setLastRefresh(new Date());
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  // Stream connection effect
  useEffect(() => {
    if (autoRefresh) {
      connectStream();
    }

    return () => {
      disconnectStream();
    };
  }, [autoRefresh, connectStream, disconnectStream]);

  // Filter update handlers
  const updateFilters = (updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Manual refresh handler
  const handleManualRefresh = () => {
    refreshMetrics();
    setLastRefresh(new Date());
  };

  // Computed values
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.levels.length > 0) count++;
    if (filters.domains.length > 0) count++;
    if (filters.components.length > 0) count++;
    if (filters.search) count++;
    if (filters.showErrorsOnly) count++;
    if (filters.showSecurityOnly) count++;
    return count;
  }, [filters]);

  const timeRangeOptions: { value: TimeRange; label: string }[] = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'performance' as const, label: 'Performance', icon: Zap },
    { id: 'security' as const, label: 'Security', icon: AlertTriangle },
    { id: 'search' as const, label: 'Search', icon: Search }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Dashboard Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Logging Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              System monitoring and log analysis for CVPlus
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Real-time status */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${streamConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-gray-600">
                {streamConnected ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Last refresh time */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {lastRefresh.toLocaleTimeString()}
            </div>

            {/* Manual refresh button */}
            <button
              onClick={handleManualRefresh}
              disabled={metricsLoading}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={filters.timeRange}
              onChange={(e) => updateFilters({ timeRange: e.target.value as TimeRange })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateFilters({ showErrorsOnly: !filters.showErrorsOnly })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.showErrorsOnly
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Errors Only
            </button>

            <button
              onClick={() => updateFilters({ showSecurityOnly: !filters.showSecurityOnly })}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.showSecurityOnly
                  ? 'bg-orange-100 text-orange-800 border border-orange-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              Security Only
            </button>
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFiltersCount > 0
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Error State */}
        {metricsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-medium">Error Loading Dashboard Data</h3>
            </div>
            <p className="text-red-700 mt-1">{metricsError}</p>
            <button
              onClick={handleManualRefresh}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Advanced Search Panel */}
        {isSearchOpen && (
          <div className="mb-6">
            <LogSearchPanel
              filters={filters}
              onFiltersChange={updateFilters}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>
        )}

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics Cards */}
            <LogMetricsCards
              metrics={metrics}
              isLoading={metricsLoading}
              streamStats={streamStats}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LogLevelChart
                data={metrics?.logsByLevel}
                isLoading={metricsLoading}
                title="Logs by Level"
              />

              <LogTimelineChart
                data={metrics?.timeSeriesData}
                isLoading={metricsLoading}
                title="Log Volume Over Time"
                timeRange={filters.timeRange}
              />
            </div>

            {/* Recent Logs Table */}
            <RecentLogsTable
              logs={recentLogs}
              isLoading={metricsLoading}
              filters={filters}
              onFiltersChange={updateFilters}
            />
          </div>
        )}

        {selectedTab === 'performance' && (
          <PerformanceMetricsPanel
            metrics={metrics?.performance}
            isLoading={metricsLoading}
            timeRange={filters.timeRange}
          />
        )}

        {selectedTab === 'security' && (
          <SecurityAlertsPanel
            securityMetrics={metrics?.security}
            isLoading={metricsLoading}
            timeRange={filters.timeRange}
            onFiltersChange={updateFilters}
          />
        )}

        {selectedTab === 'search' && (
          <LogSearchPanel
            filters={filters}
            onFiltersChange={updateFilters}
            expanded={true}
          />
        )}
      </div>

      {/* Export Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {metrics?.totalLogs ? (
              `Showing data for ${metrics.totalLogs.toLocaleString()} logs over ${filters.timeRange}`
            ) : (
              'Loading dashboard data...'
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export dashboard data');
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={!metrics}
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogDashboard;