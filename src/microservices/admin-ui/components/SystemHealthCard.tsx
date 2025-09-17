import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * System Health Card Component
 * 
 * Displays real-time system health metrics including database status,
 * function performance, error rates, and overall system status.
 */

interface SystemHealthData {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  metrics: {
    database: {
      status: string;
      readLatency: number;
      collections: {
        users: number;
        jobs: number;
      };
    };
    functions: {
      totalExecutions: number;
      errors: number;
      avgDuration: number;
      errorRate: number;
      successRate: number;
    };
    performance: {
      avgResponseTime: number;
      p95ResponseTime: number;
      throughput: number;
    };
    resources: {
      storage: {
        used: string;
        total: string;
        percentage: number;
      };
      bandwidth: {
        used: string;
        limit: string;
        percentage: number;
      };
    };
  };
  alerts: any[];
  recommendations: any[];
}

interface SystemHealthCardProps {
  refreshTrigger: number;
}

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ refreshTrigger }) => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemHealth();
  }, [refreshTrigger]);

  const fetchSystemHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const getSystemHealth = httpsCallable(functions, 'getSystemHealth');

      const result = await getSystemHealth();
      const data = (result.data as any)?.data;

      if (data) {
        setHealthData(data);
      } else {
        throw new Error('No system health data received');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'unhealthy':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'unhealthy':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">❌</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Health
          </h3>
        </div>
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchSystemHealth}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(healthData?.status || 'unknown')}</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Health
          </h3>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          getStatusColor(healthData?.status || 'unknown')
        }`}>
          {healthData?.status?.toUpperCase() || 'UNKNOWN'}
        </div>
      </div>

      {healthData && (
        <div className="space-y-4">
          {/* Database Health */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Database</span>
              <span className={`text-xs px-2 py-1 rounded ${
                healthData.metrics.database.status === 'healthy' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {healthData.metrics.database.status}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {healthData.metrics.database.readLatency}ms
            </span>
          </div>

          {/* Functions Performance */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Functions</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {healthData.metrics.functions.successRate}% success
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {healthData.metrics.functions.avgDuration}ms avg
            </span>
          </div>

          {/* Response Time */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Response Time</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {healthData.metrics.performance.avgResponseTime}ms
            </span>
          </div>

          {/* Resource Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Storage</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {healthData.metrics.resources.storage.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${healthData.metrics.resources.storage.percentage}%` }}
              />
            </div>
          </div>

          {/* Alerts */}
          {healthData.alerts && healthData.alerts.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  {healthData.alerts.length} Active Alert{healthData.alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                Click to view detailed alert information
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthCard;