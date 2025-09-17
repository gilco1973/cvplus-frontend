/**
 * PortalDeploymentStatus.tsx
 * 
 * Real-time HuggingFace deployment tracking component with comprehensive
 * status monitoring, progress visualization, and error recovery features.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  Server,
  Activity,
  TrendingUp,
  Download,
  Copy,
  Settings,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PortalDeploymentStatusProps } from '../../../types/portal-component-props';
import {
  DeploymentStatus,
  DeploymentPhase,
  DeploymentLogEntry,
  PortalError
} from '../../../types/portal-types';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFirebaseFunction } from '../../../hooks/useFeatureData';

/**
 * Progress percentage mapping for deployment phases
 */
const PHASE_PROGRESS: Record<DeploymentPhase, number> = {
  initializing: 5,
  validating: 15,
  preparing: 25,
  uploading: 40,
  building: 60,
  deploying: 80,
  testing: 90,
  completed: 100,
  failed: 0
};

/**
 * Phase display names and descriptions
 */
const PHASE_INFO: Record<DeploymentPhase, { name: string; description: string }> = {
  initializing: {
    name: 'Initializing',
    description: 'Setting up deployment environment'
  },
  validating: {
    name: 'Validating',
    description: 'Checking configuration and requirements'
  },
  preparing: {
    name: 'Preparing',
    description: 'Preparing files and assets for deployment'
  },
  uploading: {
    name: 'Uploading',
    description: 'Uploading files to HuggingFace Spaces'
  },
  building: {
    name: 'Building',
    description: 'Building the Space application'
  },
  deploying: {
    name: 'Deploying',
    description: 'Deploying to production environment'
  },
  testing: {
    name: 'Testing',
    description: 'Running health checks and validation'
  },
  completed: {
    name: 'Completed',
    description: 'Deployment successful and ready'
  },
  failed: {
    name: 'Failed',
    description: 'Deployment encountered an error'
  }
};

/**
 * PortalDeploymentStatus Component
 * 
 * Provides real-time tracking of HuggingFace Space deployments with:
 * - Visual progress indicators and phase tracking
 * - Deployment logs with filtering and search
 * - Error reporting with recovery suggestions
 * - Health monitoring and system status
 * - Auto-refresh with manual override
 */
export const PortalDeploymentStatus: React.FC<PortalDeploymentStatusProps> = ({
  status,
  displayConfig = {},
  deploymentHistory = [],
  actions = {},
  onStatusChange,
  onDeploymentComplete,
  onDeploymentError,
  onRefresh,
  onCancel,
  onRetry,
  styling = {},
  portalConfig,
  jobId,
  profileId,
  isEnabled = true,
  mode = 'private',
  className = '',
  onError
}) => {
  // Configuration with defaults
  const {
    showProgress = true,
    showLogs = true,
    showTimeEstimate = true,
    showUrl = true,
    compact = false,
    refreshInterval = 5
  } = displayConfig;

  const {
    allowRefresh = true,
    allowCancel = false,
    allowRetry = true,
    showHistory = true
  } = actions;

  // Local state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailedLogs, setShowDetailedLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warning' | 'info' | 'success'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Refs for auto-refresh
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { callFunction, loading: isCallLoading } = useFirebaseFunction();

  /**
   * Calculate estimated completion time
   */
  const getEstimatedCompletion = useCallback((): Date | null => {
    if (!status.startedAt || status.phase === 'completed' || status.phase === 'failed') {
      return null;
    }

    const elapsed = Date.now() - status.startedAt.getTime();
    const currentProgress = PHASE_PROGRESS[status.phase];
    
    if (currentProgress <= 0) return null;
    
    const estimatedTotal = (elapsed / currentProgress) * 100;
    const remaining = estimatedTotal - elapsed;
    
    return new Date(Date.now() + remaining);
  }, [status]);

  /**
   * Format time duration
   */
  const formatDuration = useCallback((ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  /**
   * Filter deployment logs based on current filter
   */
  const filteredLogs = useCallback(() => {
    if (logFilter === 'all') {
      return status.logs;
    }
    return status.logs.filter(log => log.level === logFilter);
  }, [status.logs, logFilter]);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || isCallLoading) return;

    try {
      setIsRefreshing(true);
      setLastRefresh(new Date());
      
      // Call Firebase Function to get updated deployment status
      const result = await callFunction('getDeploymentStatus', {
        jobId,
        profileId,
        deploymentId: status.currentOperation
      });
      
      if (result && result.success && result.status) {
        onStatusChange?.(result.status);
        
        // Check if deployment completed
        if (result.status.phase === 'completed') {
          onDeploymentComplete?.({
            success: true,
            operation: 'deploy',
            data: result.status,
            duration: Date.now() - status.startedAt.getTime(),
            timestamp: new Date()
          });
          toast.success('Deployment completed successfully!');
        } else if (result.status.phase === 'failed') {
          onDeploymentError?.(result.status.error || {
            code: 'DEPLOYMENT_FAILED',
            message: 'Deployment failed',
            phase: result.status.phase
          } as PortalError);
        }
      }
      
      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh deployment status:', error);
      const portalError: PortalError = {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Failed to refresh status',
        component: 'PortalDeploymentStatus',
        operation: 'refresh'
      };
      onError?.(portalError);
      toast.error('Failed to refresh deployment status');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, isCallLoading, callFunction, jobId, profileId, status, onStatusChange, onDeploymentComplete, onDeploymentError, onRefresh, onError]);

  /**
   * Handle deployment cancellation
   */
  const handleCancel = useCallback(async () => {
    if (!allowCancel || isCallLoading) return;

    try {
      await callFunction('cancelDeployment', {
        jobId,
        profileId,
        deploymentId: status.currentOperation
      });
      
      onCancel?.();
      toast.success('Deployment cancelled');
    } catch (error) {
      console.error('Failed to cancel deployment:', error);
      toast.error('Failed to cancel deployment');
    }
  }, [allowCancel, isCallLoading, callFunction, jobId, profileId, status.currentOperation, onCancel]);

  /**
   * Handle deployment retry
   */
  const handleRetry = useCallback(async () => {
    if (!allowRetry || isCallLoading) return;

    try {
      await callFunction('retryDeployment', {
        jobId,
        profileId,
        deploymentId: status.currentOperation
      });
      
      onRetry?.();
      toast.success('Deployment retry initiated');
    } catch (error) {
      console.error('Failed to retry deployment:', error);
      toast.error('Failed to retry deployment');
    }
  }, [allowRetry, isCallLoading, callFunction, jobId, profileId, status.currentOperation, onRetry]);

  /**
   * Copy deployment URL to clipboard
   */
  const copyUrl = useCallback(async () => {
    if (!status.url) return;
    
    try {
      await navigator.clipboard.writeText(status.url);
      toast.success('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  }, [status.url]);

  /**
   * Auto-refresh effect
   */
  useEffect(() => {
    if (autoRefresh && 
        refreshInterval > 0 && 
        status.phase !== 'completed' && 
        status.phase !== 'failed') {
      
      refreshIntervalRef.current = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, status.phase, handleRefresh]);

  /**
   * Cleanup effect
   */
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  if (!isEnabled) {
    return null;
  }

  const currentProgress = PHASE_PROGRESS[status.phase];
  const phaseInfo = PHASE_INFO[status.phase];
  const estimatedCompletion = getEstimatedCompletion();
  const elapsedTime = Date.now() - status.startedAt.getTime();

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Deployment Status"
        description="Real-time HuggingFace Space deployment tracking"
        isLoading={isRefreshing || isCallLoading}
        onRetry={handleRefresh}
      >
        <div className="space-y-6">
          {/* Main Status Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {status.phase === 'completed' ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : status.phase === 'failed' ? (
                  <XCircle className="w-8 h-8 text-red-500" />
                ) : (
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {phaseInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {phaseInfo.description}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {allowRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isCallLoading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              >
                {autoRefresh ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{currentProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={currentProgress} aria-valuemin={0} aria-valuemax={100}>
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    status.phase === 'failed' 
                      ? 'bg-red-500' 
                      : status.phase === 'completed'
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Time Information */}
          {showTimeEstimate && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Elapsed: {formatDuration(elapsedTime)}</span>
              </div>
              
              {estimatedCompletion && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>ETA: {formatDuration(estimatedCompletion.getTime() - Date.now())}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Activity className="w-4 h-4" />
                <span>Last refresh: {formatDuration(Date.now() - lastRefresh.getTime())} ago</span>
              </div>
            </div>
          )}

          {/* Deployment URL */}
          {showUrl && status.url && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">Deployment Ready</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyUrl}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={status.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded break-all">
                  {status.url}
                </code>
              </div>
            </div>
          )}

          {/* Error Display */}
          {status.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">Deployment Failed</h4>
                  <p className="text-sm text-red-700 mb-3">{status.error.message}</p>
                  
                  {allowRetry && (
                    <button
                      onClick={handleRetry}
                      disabled={isCallLoading}
                      className="inline-flex items-center space-x-2 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Retry Deployment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(allowCancel && status.phase !== 'completed' && status.phase !== 'failed') && (
            <div className="flex justify-center">
              <button
                onClick={handleCancel}
                disabled={isCallLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Deployment</span>
              </button>
            </div>
          )}

          {/* Deployment Logs */}
          {showLogs && status.logs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Deployment Logs</h4>
                <div className="flex items-center space-x-2">
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value as any)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All logs</option>
                    <option value="error">Errors</option>
                    <option value="warning">Warnings</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                  </select>
                  
                  <button
                    onClick={() => setShowDetailedLogs(!showDetailedLogs)}
                    className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                    title={showDetailedLogs ? 'Hide details' : 'Show details'}
                  >
                    {showDetailedLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="space-y-1 font-mono text-sm">
                  {filteredLogs().map((log, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-gray-500 text-xs mt-0.5 shrink-0">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`text-xs mt-0.5 shrink-0 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warning' ? 'text-yellow-400' :
                        log.level === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-gray-300 flex-1">
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Deployment History */}
          {showHistory && deploymentHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Deployments</h4>
              <div className="space-y-2">
                {deploymentHistory.slice(0, 5).map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {deployment.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : deployment.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {deployment.timestamp.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          Duration: {formatDuration(deployment.duration)}
                        </div>
                      </div>
                    </div>
                    
                    {deployment.url && (
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Open deployment"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

export default PortalDeploymentStatus;