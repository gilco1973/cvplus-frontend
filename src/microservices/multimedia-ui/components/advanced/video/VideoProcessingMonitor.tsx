/**
 * Video Processing Monitor Component
 * 
 * Real-time monitoring dashboard for video generation processes across
 * multiple providers. Features live status updates, performance metrics,
 * queue management, and error recovery interfaces.
 * 
 * Features:
 * - Real-time WebSocket connections for live updates
 * - Multi-provider processing visualization
 * - Queue management and priority handling
 * - Error recovery and retry mechanisms
 * - Performance analytics and bottleneck detection
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Loader,
  Monitor,
  Play,
  Pause,
  RefreshCw,
  Settings,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

// Enhanced interfaces for monitoring
interface ProcessingJob {
  id: string;
  userId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
  provider: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: number;
  currentStage: string;
  startTime: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  resourceUsage: {
    cpu: number;
    memory: number;
    bandwidth: number;
  };
  qualityMetrics?: {
    videoQuality: number;
    audioQuality: number;
    lipSyncAccuracy: number;
    overallScore: number;
  };
  cost: {
    estimated: number;
    actual?: number;
    breakdown: Record<string, number>;
  };
}

interface ProviderStatus {
  providerId: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  activeJobs: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  avgProcessingTime: number;
  successRate: number;
  currentLoad: number;
  maxCapacity: number;
  lastUpdate: Date;
  healthMetrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

interface SystemMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  systemLoad: number;
  totalCost: number;
  providersOnline: number;
  totalProviders: number;
}

interface VideoProcessingMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  showSystemMetrics?: boolean;
  showProviderDetails?: boolean;
  showJobDetails?: boolean;
  filterByUserId?: string;
  className?: string;
}

export const VideoProcessingMonitor: React.FC<VideoProcessingMonitorProps> = ({
  autoRefresh = true,
  refreshInterval = 5000,
  showSystemMetrics = true,
  showProviderDetails = true,
  showJobDetails = true,
  filterByUserId,
  className = ""
}) => {
  // State management
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // WebSocket and refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection for real-time monitoring
  useEffect(() => {
    if (autoRefresh && !isPaused) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, isPaused]);

  const connectWebSocket = useCallback(() => {
    try {
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3000/ws/video-monitoring'
        : `wss://${window.location.host}/ws/video-monitoring`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Video monitoring WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Subscribe to monitoring updates
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            action: 'subscribe',
            filters: filterByUserId ? { userId: filterByUserId } : {}
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'jobs_update':
              setJobs(data.jobs);
              break;
            case 'providers_update':
              setProviders(data.providers);
              break;
            case 'system_metrics':
              setSystemMetrics(data.metrics);
              break;
            case 'job_status_change':
              updateJobStatus(data.jobId, data.status, data.details);
              break;
            case 'provider_status_change':
              updateProviderStatus(data.providerId, data.status);
              break;
            case 'error':
              setError(data.message);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = () => {
        console.log('Video monitoring WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds if not paused
        if (!isPaused) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Attempting to reconnect...');
      };
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      setError('Failed to establish monitoring connection');
    }
  }, [filterByUserId, isPaused]);

  // Update individual job status
  const updateJobStatus = (jobId: string, status: string, details: any) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: status as any, ...details }
          : job
      )
    );
  };

  // Update provider status
  const updateProviderStatus = (providerId: string, status: string) => {
    setProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.providerId === providerId
          ? { ...provider, status: status as any, lastUpdate: new Date() }
          : provider
      )
    );
  };

  // Manual refresh data
  const handleRefresh = async () => {
    try {
      const [jobsResponse, providersResponse, metricsResponse] = await Promise.all([
        fetch('/api/video-monitoring/jobs' + (filterByUserId ? `?userId=${filterByUserId}` : '')),
        fetch('/api/video-monitoring/providers'),
        fetch('/api/video-monitoring/metrics')
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);
      }

      if (providersResponse.ok) {
        const providersData = await providersResponse.json();
        setProviders(providersData);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSystemMetrics(metricsData);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to refresh monitoring data:', err);
      setError('Failed to refresh data');
    }
  };

  // Retry failed job
  const handleRetryJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/video-monitoring/jobs/${jobId}/retry`, {
        method: 'POST'
      });

      if (response.ok) {
        handleRefresh();
      } else {
        setError('Failed to retry job');
      }
    } catch (err) {
      console.error('Failed to retry job:', err);
      setError('Failed to retry job');
    }
  };

  // Cancel job
  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/video-monitoring/jobs/${jobId}/cancel`, {
        method: 'POST'
      });

      if (response.ok) {
        handleRefresh();
      } else {
        setError('Failed to cancel job');
      }
    } catch (err) {
      console.error('Failed to cancel job:', err);
      setError('Failed to cancel job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderSystemMetrics = () => {
    if (!showSystemMetrics || !systemMetrics) return null;

    return (
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total Jobs</div>
            <Activity className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {systemMetrics.totalJobs.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Active</div>
            <Loader className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {systemMetrics.activeJobs}
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Completed</div>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {systemMetrics.completedJobs.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Failed</div>
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {systemMetrics.failedJobs}
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Avg Time</div>
            <Clock className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(systemMetrics.averageProcessingTime / 60)}min
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Total Cost</div>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ${systemMetrics.totalCost.toFixed(2)}
          </div>
        </div>
      </div>
    );
  };

  const renderProviderStatus = () => {
    if (!showProviderDetails || !providers.length) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(provider => (
            <div key={provider.providerId} className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getProviderStatusColor(provider.status)} mr-2`} />
                  <span className="font-medium text-gray-900">{provider.name}</span>
                </div>
                <span className="text-xs text-gray-500 capitalize">{provider.status}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Jobs:</span>
                  <span className="font-medium">{provider.activeJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Queued:</span>
                  <span className="font-medium">{provider.queuedJobs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">{provider.successRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Time:</span>
                  <span className="font-medium">{Math.round(provider.avgProcessingTime / 60)}min</span>
                </div>
                
                {/* Load indicator */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Load</span>
                    <span>{provider.currentLoad}/{provider.maxCapacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        provider.currentLoad / provider.maxCapacity > 0.8 
                          ? 'bg-red-500' 
                          : provider.currentLoad / provider.maxCapacity > 0.6 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${(provider.currentLoad / provider.maxCapacity) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderJobsList = () => {
    if (!showJobDetails || !jobs.length) return null;

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processing Jobs</h3>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1 text-sm rounded ${
                isPaused ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-1 text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr 
                    key={job.id}
                    className={`hover:bg-gray-50 ${selectedJobId === job.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(job.status)}
                        <span className="ml-2 text-sm capitalize">{job.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job.provider}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {job.currentStage}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${(job.cost.actual || job.cost.estimated).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {job.status === 'failed' && job.retryCount < job.maxRetries && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryJob(job.id);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {['queued', 'processing'].includes(job.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelJob(job.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Video Processing Monitor
          </h2>
          <p className="text-gray-600">
            Real-time monitoring of video generation processes across all providers
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {renderSystemMetrics()}
        {renderProviderStatus()}
        {renderJobsList()}
      </div>
    </div>
  );
};

export default VideoProcessingMonitor;