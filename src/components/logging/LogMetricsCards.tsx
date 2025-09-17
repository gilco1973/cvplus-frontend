/**
 * T052: Log Metrics Cards component in frontend/src/components/logging/LogMetricsCards.tsx
 *
 * Key metrics overview cards displaying essential logging statistics
 * including log counts, error rates, performance metrics, and system health.
 */

import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  Server,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { LogLevel } from '@cvplus/logging';

interface LogMetrics {
  totalLogs: number;
  errorRate: number;
  logsByLevel: Record<LogLevel, number>;
  logsByDomain: Record<string, number>;
  avgResponseTime?: number;
  p95ResponseTime?: number;
  throughput?: number;
  activeUsers?: number;
  activeComponents?: number;
}

interface StreamStats {
  activeSubscriptions: number;
  totalEvents: number;
  bufferSize: number;
  uptime: number;
}

interface LogMetricsCardsProps {
  metrics?: LogMetrics;
  streamStats?: StreamStats;
  isLoading: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray' | 'purple';
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
  isLoading = false
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              {isLoading ? (
                <div className="animate-pulse bg-gray-200 rounded h-8 w-20 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {trend && trendValue && TrendIcon && (
          <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingCard: React.FC<{ title: string; icon: React.ComponentType<{ className?: string }> }> = ({ title, icon: Icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20 mt-1" />
      </div>
    </div>
  </div>
);

export const LogMetricsCards: React.FC<LogMetricsCardsProps> = ({
  metrics,
  streamStats,
  isLoading,
  className = ''
}) => {
  // Calculate derived metrics
  const totalErrors = metrics ? (metrics.logsByLevel[LogLevel.ERROR] || 0) + (metrics.logsByLevel[LogLevel.FATAL] || 0) : 0;
  const totalWarnings = metrics?.logsByLevel[LogLevel.WARN] || 0;
  const totalInfo = metrics?.logsByLevel[LogLevel.INFO] || 0;

  const errorPercentage = metrics?.totalLogs ? ((totalErrors / metrics.totalLogs) * 100).toFixed(1) : '0';
  const warningPercentage = metrics?.totalLogs ? ((totalWarnings / metrics.totalLogs) * 100).toFixed(1) : '0';

  // Format response time
  const formatResponseTime = (time?: number): string => {
    if (!time) return 'N/A';
    return time < 1000 ? `${time.toFixed(0)}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  // Format throughput
  const formatThroughput = (throughput?: number): string => {
    if (!throughput) return 'N/A';
    return `${throughput.toFixed(1)}/s`;
  };

  // Format uptime
  const formatUptime = (uptime?: number): string => {
    if (!uptime) return 'N/A';
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (isLoading || !metrics) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        <LoadingCard title="Total Logs" icon={Activity} />
        <LoadingCard title="Error Rate" icon={AlertTriangle} />
        <LoadingCard title="Response Time" icon={Clock} />
        <LoadingCard title="Active Components" icon={Server} />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Logs */}
      <MetricCard
        title="Total Logs"
        value={metrics.totalLogs}
        subtitle="All log entries"
        icon={Activity}
        color="blue"
        trend="up"
        trendValue={streamStats ? `+${streamStats.totalEvents}` : undefined}
      />

      {/* Error Rate */}
      <MetricCard
        title="Error Rate"
        value={`${errorPercentage}%`}
        subtitle={`${totalErrors} errors`}
        icon={AlertTriangle}
        color={parseFloat(errorPercentage) > 5 ? 'red' : parseFloat(errorPercentage) > 1 ? 'yellow' : 'green'}
        trend={parseFloat(errorPercentage) > 5 ? 'up' : 'down'}
        trendValue={`${totalWarnings} warnings`}
      />

      {/* Response Time */}
      <MetricCard
        title="Avg Response Time"
        value={formatResponseTime(metrics.avgResponseTime)}
        subtitle={`P95: ${formatResponseTime(metrics.p95ResponseTime)}`}
        icon={Clock}
        color={!metrics.avgResponseTime ? 'gray' : metrics.avgResponseTime > 1000 ? 'red' : metrics.avgResponseTime > 500 ? 'yellow' : 'green'}
        trend={!metrics.avgResponseTime ? undefined : metrics.avgResponseTime > 500 ? 'up' : 'down'}
      />

      {/* Throughput */}
      <MetricCard
        title="Throughput"
        value={formatThroughput(metrics.throughput)}
        subtitle="Logs per second"
        icon={Zap}
        color="purple"
        trend="up"
      />

      {/* Active Users */}
      <MetricCard
        title="Active Users"
        value={metrics.activeUsers || 'N/A'}
        subtitle="Unique users"
        icon={Users}
        color="green"
      />

      {/* Active Components */}
      <MetricCard
        title="Components"
        value={metrics.activeComponents || Object.keys(metrics.logsByDomain).length}
        subtitle="Logging components"
        icon={Server}
        color="gray"
      />

      {/* Stream Status */}
      <MetricCard
        title="Live Connections"
        value={streamStats?.activeSubscriptions || 0}
        subtitle={`Buffer: ${streamStats?.bufferSize || 0}`}
        icon={Activity}
        color={streamStats?.activeSubscriptions ? 'green' : 'gray'}
      />

      {/* System Uptime */}
      <MetricCard
        title="System Uptime"
        value={formatUptime(streamStats?.uptime)}
        subtitle="Streaming service"
        icon={CheckCircle}
        color="blue"
        trend="up"
      />
    </div>
  );
};

export default LogMetricsCards;