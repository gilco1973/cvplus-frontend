/**
 * T054: System Monitoring Panel in frontend/src/components/logging/SystemMonitoringPanel.tsx
 *
 * Real-time system monitoring dashboard showing health metrics, performance indicators,
 * resource usage, and system alerts for comprehensive infrastructure monitoring.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Server,
  Database,
  Zap,
  HardDrive,
  Cpu,
  Memory,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useLogMetrics } from '../../hooks/useLogMetrics';

interface SystemMetrics {
  cpu: {
    usage: number; // percentage
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number; // MB
    total: number; // MB
    available: number; // MB
    usage: number; // percentage
  };
  disk: {
    used: number; // GB
    total: number; // GB
    available: number; // GB
    usage: number; // percentage
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    connections: number;
  };
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'warning' | 'critical' | 'offline';
      uptime: number; // seconds
      responseTime: number; // ms
      errorRate: number; // percentage
      throughput: number; // requests per second
      lastCheck: string;
    };
  };
  database: {
    connections: {
      active: number;
      idle: number;
      total: number;
    };
    queries: {
      total: number;
      slow: number;
      failed: number;
      avgDuration: number; // ms
    };
    size: number; // GB
  };
  alerts: SystemAlert[];
}

interface SystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  source: string;
  value?: number;
  threshold?: number;
}

interface MetricCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  unit?: string;
  percentage?: number;
  status: 'healthy' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon: Icon,
  value,
  unit,
  percentage,
  status,
  trend,
  subtitle
}) => {
  const statusColors = {
    healthy: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Activity
  };

  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {TrendIcon && <TrendIcon className="w-4 h-4" />}
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-sm ml-1 opacity-75">{unit}</span>}
      </div>

      {percentage !== undefined && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                status === 'healthy' ? 'bg-green-500' :
                status === 'warning' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="text-xs mt-1 opacity-75">
            {percentage.toFixed(1)}%
          </div>
        </div>
      )}

      {subtitle && (
        <p className="text-xs opacity-75">{subtitle}</p>
      )}
    </div>
  );
};

interface AlertItemProps {
  alert: SystemAlert;
  onAcknowledge: (alertId: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge }) => {
  const severityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    high: 'bg-orange-50 border-orange-200 text-orange-800',
    critical: 'bg-red-50 border-red-200 text-red-800'
  };

  const severityIcons = {
    low: CheckCircle,
    medium: AlertTriangle,
    high: AlertTriangle,
    critical: AlertTriangle
  };

  const SeverityIcon = severityIcons[alert.severity];

  return (
    <div className={`rounded-lg border p-3 ${severityColors[alert.severity]} ${alert.acknowledged ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{alert.title}</h4>
            <p className="text-xs mt-1 opacity-80">{alert.message}</p>
            <div className="flex items-center gap-3 text-xs mt-2 opacity-70">
              <span>{alert.source}</span>
              <span>•</span>
              <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
              {alert.value !== undefined && alert.threshold !== undefined && (
                <>
                  <span>•</span>
                  <span>{alert.value} / {alert.threshold}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {!alert.acknowledged && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded hover:bg-opacity-75 transition-colors"
          >
            Ack
          </button>
        )}
      </div>
    </div>
  );
};

interface SystemMonitoringPanelProps {
  className?: string;
  refreshInterval?: number; // seconds
}

export const SystemMonitoringPanel: React.FC<SystemMonitoringPanelProps> = ({
  className = '',
  refreshInterval = 30
}) => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Use log metrics for additional context
  const { metrics: logMetrics } = useLogMetrics({
    timeRange: '1h',
    autoRefresh: true,
    refreshInterval
  });

  // Fetch system metrics
  const fetchSystemMetrics = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch('/api/v1/system/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system metrics');
      }

      const data = await response.json();
      setSystemMetrics(data.metrics);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    fetchSystemMetrics();

    const interval = setInterval(fetchSystemMetrics, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchSystemMetrics, refreshInterval]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await fetch(`/api/v1/system/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'X-API-Key': process.env.REACT_APP_API_KEY || ''
        }
      });

      // Update local state
      if (systemMetrics) {
        const updatedAlerts = systemMetrics.alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        );
        setSystemMetrics({ ...systemMetrics, alerts: updatedAlerts });
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  }, [systemMetrics]);

  // Calculate system health status
  const getSystemHealthStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!systemMetrics) return 'warning';

    const criticalAlerts = systemMetrics.alerts.filter(
      alert => !alert.acknowledged && alert.severity === 'critical'
    ).length;

    const highAlerts = systemMetrics.alerts.filter(
      alert => !alert.acknowledged && (alert.severity === 'high' || alert.severity === 'critical')
    ).length;

    if (criticalAlerts > 0 || systemMetrics.cpu.usage > 90 || systemMetrics.memory.usage > 90) {
      return 'critical';
    }

    if (highAlerts > 0 || systemMetrics.cpu.usage > 70 || systemMetrics.memory.usage > 80) {
      return 'warning';
    }

    return 'healthy';
  };

  if (isLoading && !systemMetrics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !systemMetrics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitoring Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSystemMetrics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!systemMetrics) return null;

  const systemHealth = getSystemHealthStatus();
  const unacknowledgedAlerts = systemMetrics.alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.severity === 'critical');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Status Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              systemHealth === 'healthy' ? 'bg-green-100 text-green-600' :
              systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Monitor</h2>
              <p className="text-gray-600">
                {systemHealth === 'healthy' ? 'All systems operational' :
                 systemHealth === 'warning' ? 'Some issues detected' :
                 'Critical issues require attention'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm text-gray-500">
              <div>Last updated:</div>
              <div>{lastRefresh.toLocaleTimeString()}</div>
            </div>
            <button
              onClick={fetchSystemMetrics}
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              title="Refresh metrics"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">
                {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {criticalAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} className="text-sm text-red-700">
                  {alert.title}: {alert.message}
                </div>
              ))}
              {criticalAlerts.length > 3 && (
                <div className="text-sm text-red-600 font-medium">
                  +{criticalAlerts.length - 3} more critical alerts
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          icon={Cpu}
          value={systemMetrics.cpu.usage.toFixed(1)}
          unit="%"
          percentage={systemMetrics.cpu.usage}
          status={systemMetrics.cpu.usage > 80 ? 'critical' : systemMetrics.cpu.usage > 60 ? 'warning' : 'healthy'}
          subtitle={`${systemMetrics.cpu.cores} cores`}
        />

        <MetricCard
          title="Memory"
          icon={Memory}
          value={(systemMetrics.memory.used / 1024).toFixed(1)}
          unit="GB"
          percentage={systemMetrics.memory.usage}
          status={systemMetrics.memory.usage > 85 ? 'critical' : systemMetrics.memory.usage > 70 ? 'warning' : 'healthy'}
          subtitle={`${(systemMetrics.memory.total / 1024).toFixed(1)}GB total`}
        />

        <MetricCard
          title="Disk Space"
          icon={HardDrive}
          value={systemMetrics.disk.used.toFixed(1)}
          unit="GB"
          percentage={systemMetrics.disk.usage}
          status={systemMetrics.disk.usage > 85 ? 'critical' : systemMetrics.disk.usage > 70 ? 'warning' : 'healthy'}
          subtitle={`${systemMetrics.disk.total.toFixed(1)}GB total`}
        />

        <MetricCard
          title="Network"
          icon={Network}
          value={systemMetrics.network.connections}
          unit="conn"
          status={systemMetrics.network.connections > 1000 ? 'warning' : 'healthy'}
          subtitle={`${(systemMetrics.network.bytesIn / 1024 / 1024).toFixed(1)}MB in`}
        />

        <MetricCard
          title="DB Connections"
          icon={Database}
          value={systemMetrics.database.connections.active}
          status={
            systemMetrics.database.connections.active > systemMetrics.database.connections.total * 0.8 ? 'warning' : 'healthy'
          }
          subtitle={`${systemMetrics.database.connections.total} total`}
        />

        <MetricCard
          title="Response Time"
          icon={Clock}
          value={logMetrics?.performance?.avgResponseTime?.toFixed(0) || 'N/A'}
          unit="ms"
          status={
            !logMetrics?.performance?.avgResponseTime ? 'warning' :
            logMetrics.performance.avgResponseTime > 1000 ? 'critical' :
            logMetrics.performance.avgResponseTime > 500 ? 'warning' : 'healthy'
          }
          subtitle={`P95: ${logMetrics?.performance?.p95ResponseTime?.toFixed(0) || 'N/A'}ms`}
        />

        <MetricCard
          title="Throughput"
          icon={Zap}
          value={logMetrics?.performance?.throughput?.toFixed(1) || 'N/A'}
          unit="/s"
          status="healthy"
          subtitle="Requests per second"
        />

        <MetricCard
          title="Error Rate"
          icon={AlertTriangle}
          value={logMetrics?.errorRate?.toFixed(2) || 'N/A'}
          unit="%"
          status={
            !logMetrics?.errorRate ? 'warning' :
            logMetrics.errorRate > 5 ? 'critical' :
            logMetrics.errorRate > 1 ? 'warning' : 'healthy'
          }
          subtitle="Last hour"
        />
      </div>

      {/* Services Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Services Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(systemMetrics.services).map(([serviceName, service]) => (
            <div
              key={serviceName}
              className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                service.status === 'healthy' ? 'border-green-200 bg-green-50' :
                service.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                service.status === 'critical' ? 'border-red-200 bg-red-50' :
                'border-gray-200 bg-gray-50'
              } ${selectedService === serviceName ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedService(selectedService === serviceName ? null : serviceName)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{serviceName}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'healthy' ? 'bg-green-500' :
                  service.status === 'warning' ? 'bg-yellow-500' :
                  service.status === 'critical' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span>{Math.floor(service.uptime / 3600)}h {Math.floor((service.uptime % 3600) / 60)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Response:</span>
                  <span>{service.responseTime.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span>{service.errorRate.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {unacknowledgedAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Alerts ({unacknowledgedAlerts.length})
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {unacknowledgedAlerts
              .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map(alert => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={acknowledgeAlert}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMonitoringPanel;