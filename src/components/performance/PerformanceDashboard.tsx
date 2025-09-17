/**
 * Performance Dashboard Component - Phase 6.3.4
 * 
 * Real-time performance monitoring dashboard with sub-second updates,
 * interactive visualizations, and actionable insights for CVPlus.
 * Displays Core Web Vitals, function performance, and user journey metrics.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CoreWebVitalsService from '../../services/performance/core-web-vitals.service';
import UserJourneyTrackerService from '../../services/performance/user-journey-tracker.service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface DashboardMetrics {
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  functionPerformance: {
    totalFunctions: number;
    averageExecutionTime: number;
    errorRate: number;
    throughput: number;
  };
  userJourneys: {
    activeJourneys: number;
    averageCompletionTime: number;
    successRate: number;
    dropOffRate: number;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    resolved: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: number;
  functionName?: string;
  metric?: string;
  acknowledged: boolean;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    webVitals: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 },
    functionPerformance: { totalFunctions: 0, averageExecutionTime: 0, errorRate: 0, throughput: 0 },
    userJourneys: { activeJourneys: 0, averageCompletionTime: 0, successRate: 0, dropOffRate: 0 },
    alerts: { critical: 0, high: 0, medium: 0, resolved: 0 }
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Initialize services
  const webVitalsService = CoreWebVitalsService.getInstance();
  const journeyTracker = UserJourneyTrackerService.getInstance();

  /**
   * Setup real-time data subscriptions
   */
  useEffect(() => {
    if (!isLive) return;

    const unsubscribers: (() => void)[] = [];

    // Subscribe to real-time metrics
    const metricsQuery = query(
      collection(db, 'realtime_metrics'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const metricsUnsubscribe = onSnapshot(metricsQuery, (snapshot) => {
      const newData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRealtimeData(newData);
      updateMetrics(newData);
      setLastUpdate(Date.now());
    });

    unsubscribers.push(metricsUnsubscribe);

    // Subscribe to performance alerts
    const alertsQuery = query(
      collection(db, 'performance_alerts'),
      where('acknowledged', '==', false),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const alertsUnsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PerformanceAlert[];
      
      setAlerts(newAlerts);
      updateAlertMetrics(newAlerts);
    });

    unsubscribers.push(alertsUnsubscribe);

    // Cleanup subscriptions
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [isLive]);

  /**
   * Update aggregated metrics from real-time data
   */
  const updateMetrics = useCallback((data: any[]) => {
    if (data.length === 0) return;

    // Calculate aggregated metrics
    const functionMetrics = data.filter(item => item.functionName);
    const webVitalsMetrics = data.filter(item => item.name);

    const avgExecutionTime = functionMetrics.reduce((sum, item) => sum + (item.executionTime || 0), 0) / functionMetrics.length || 0;
    const totalErrors = functionMetrics.reduce((sum, item) => sum + (item.errorRate || 0), 0);
    const totalRequests = functionMetrics.reduce((sum, item) => sum + (item.requestsPerSecond || 0), 0);

    // Update Web Vitals from recent data
    const latestWebVitals = webVitalsMetrics.reduce((acc, item) => {
      if (item.name === 'LCP') acc.lcp = item.value;
      if (item.name === 'FID') acc.fid = item.value;
      if (item.name === 'CLS') acc.cls = item.value;
      if (item.name === 'FCP') acc.fcp = item.value;
      if (item.name === 'TTFB') acc.ttfb = item.value;
      return acc;
    }, { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0 });

    setMetrics(prev => ({
      ...prev,
      webVitals: latestWebVitals,
      functionPerformance: {
        totalFunctions: functionMetrics.length,
        averageExecutionTime: avgExecutionTime,
        errorRate: functionMetrics.length > 0 ? totalErrors / functionMetrics.length : 0,
        throughput: totalRequests
      }
    }));
  }, []);

  /**
   * Update alert metrics
   */
  const updateAlertMetrics = useCallback((alertData: PerformanceAlert[]) => {
    const alertCounts = alertData.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setMetrics(prev => ({
      ...prev,
      alerts: {
        critical: alertCounts.critical || 0,
        high: alertCounts.high || 0,
        medium: alertCounts.medium || 0,
        resolved: alertCounts.resolved || 0
      }
    }));
  }, []);

  /**
   * Handle alert acknowledgment
   */
  const acknowledgeAlert = async (alertId: string) => {
    // Implementation would update Firestore
    console.log(`Acknowledging alert: ${alertId}`);
  };

  /**
   * Toggle live monitoring
   */
  const toggleLiveMonitoring = () => {
    setIsLive(!isLive);
  };

  /**
   * Get performance status color
   */
  const getStatusColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  /**
   * Format duration for display
   */
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Chart configurations
  const webVitalsChartData = {
    labels: ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'],
    datasets: [
      {
        label: 'Current Values',
        data: [
          metrics.webVitals.lcp,
          metrics.webVitals.fid,
          metrics.webVitals.cls * 1000, // Scale CLS for visibility
          metrics.webVitals.fcp,
          metrics.webVitals.ttfb
        ],
        backgroundColor: [
          metrics.webVitals.lcp <= 2500 ? '#10B981' : metrics.webVitals.lcp <= 4000 ? '#F59E0B' : '#EF4444',
          metrics.webVitals.fid <= 100 ? '#10B981' : metrics.webVitals.fid <= 300 ? '#F59E0B' : '#EF4444',
          (metrics.webVitals.cls * 1000) <= 100 ? '#10B981' : (metrics.webVitals.cls * 1000) <= 250 ? '#F59E0B' : '#EF4444',
          metrics.webVitals.fcp <= 1800 ? '#10B981' : metrics.webVitals.fcp <= 3000 ? '#F59E0B' : '#EF4444',
          metrics.webVitals.ttfb <= 800 ? '#10B981' : metrics.webVitals.ttfb <= 1800 ? '#F59E0B' : '#EF4444'
        ],
        borderWidth: 1
      }
    ]
  };

  const performanceTrendData = {
    labels: realtimeData.slice(-20).map((_, index) => `${index * 30}s`),
    datasets: [
      {
        label: 'Average Execution Time',
        data: realtimeData.slice(-20).map(item => item.executionTime || 0),
        borderColor: '#3B82F6',
        backgroundColor: '#3B82F6',
        fill: false,
        tension: 0.1
      },
      {
        label: 'Error Rate (%)',
        data: realtimeData.slice(-20).map(item => item.errorRate || 0),
        borderColor: '#EF4444',
        backgroundColor: '#EF4444',
        fill: false,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
            <button
              onClick={toggleLiveMonitoring}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                isLive 
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {isLive ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">LCP (Largest Contentful Paint)</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.webVitals.lcp, { good: 2500, poor: 4000 })}`}>
                {formatDuration(metrics.webVitals.lcp)}
              </p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FID (First Input Delay)</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.webVitals.fid, { good: 100, poor: 300 })}`}>
                {formatDuration(metrics.webVitals.fid)}
              </p>
            </div>
            <div className="text-3xl">👆</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CLS (Cumulative Layout Shift)</p>
              <p className={`text-2xl font-bold ${getStatusColor(metrics.webVitals.cls, { good: 0.1, poor: 0.25 })}`}>
                {metrics.webVitals.cls.toFixed(3)}
              </p>
            </div>
            <div className="text-3xl">📐</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Functions</p>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.functionPerformance.totalFunctions}
              </p>
            </div>
            <div className="text-3xl">🔧</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
          <div className="h-64">
            <Bar data={webVitalsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="h-64">
            <Line data={performanceTrendData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Function Performance Table */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Function Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Function Name</th>
                <th className="px-6 py-3">Avg Execution Time</th>
                <th className="px-6 py-3">Error Rate</th>
                <th className="px-6 py-3">Requests/sec</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {realtimeData.slice(0, 10).map((item, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.functionName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    {formatDuration(item.executionTime || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`${getStatusColor(item.errorRate || 0, { good: 1, poor: 5 })}`}>
                      {((item.errorRate || 0)).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {(item.requestsPerSecond || 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      (item.errorRate || 0) < 1 
                        ? 'bg-green-100 text-green-800'
                        : (item.errorRate || 0) < 5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(item.errorRate || 0) < 1 ? 'Healthy' : (item.errorRate || 0) < 5 ? 'Warning' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Active Performance Alerts</h3>
            <div className="flex space-x-4 text-sm">
              <span className="text-red-600 font-medium">Critical: {metrics.alerts.critical}</span>
              <span className="text-yellow-600 font-medium">High: {metrics.alerts.high}</span>
              <span className="text-blue-600 font-medium">Medium: {metrics.alerts.medium}</span>
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {alerts.slice(0, 10).map((alert) => (
            <div key={alert.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{alert.type}</span>
                    {alert.functionName && (
                      <span className="text-sm text-gray-500">({alert.functionName})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;