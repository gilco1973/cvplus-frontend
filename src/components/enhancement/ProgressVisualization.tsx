/**
 * Enhanced Progress Visualization Component
 * 
 * Provides comprehensive real-time visualization of CV enhancement progress
 * with advanced analytics, performance metrics, and user-friendly displays.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { FeatureProgress } from '../../hooks/useProgressiveEnhancement';
import { performanceMonitorService, PerformanceStats } from '../../services/enhancement/performance-monitor.service';
import { cssOptimizerService } from '../../services/enhancement/css-optimizer.service';
import { errorRecoveryService } from '../../services/enhancement/error-recovery.service';

interface ProgressVisualizationProps {
  features: FeatureProgress[];
  overallProgress: number;
  isComplete: boolean;
  isLoading: boolean;
  jobId: string;
  showAdvancedMetrics?: boolean;
  compactMode?: boolean;
}

interface ProgressMetrics {
  totalFeatures: number;
  completedFeatures: number;
  processingFeatures: number;
  failedFeatures: number;
  averageTime: number;
  estimatedCompletion: string;
  successRate: number;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  features,
  overallProgress,
  isComplete,
  isLoading,
  jobId,
  showAdvancedMetrics = false,
  compactMode = false
}) => {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [cssStats, setCssStats] = useState<{
    totalFeatures: number;
    totalOriginalSize: number;
    totalOptimizedSize: number;
    overallCompressionRatio: number;
    totalDuplicatesRemoved: number;
    averageCompressionRatio: number;
  } | null>(null);
  const [errorStats, setErrorStats] = useState<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    averageRecoveryTime: number;
    overallSuccessRate: number;
    mostCommonErrors: string[];
  } | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'timeline' | 'analytics'>('overview');

  // Calculate progress metrics
  const metrics = useMemo((): ProgressMetrics => {
    const totalFeatures = features.length;
    const completedFeatures = features.filter(f => f.status === 'completed').length;
    const processingFeatures = features.filter(f => f.status === 'processing').length;
    const failedFeatures = features.filter(f => f.status === 'failed').length;
    
    const completedTimes = features
      .filter(f => f.status === 'completed' && f.timestamp)
      .map(f => f.timestamp!);
    
    const averageTime = completedTimes.length > 0 
      ? completedTimes.reduce((sum, time) => sum + time, 0) / completedTimes.length 
      : 0;

    const remainingFeatures = totalFeatures - completedFeatures - failedFeatures;
    const estimatedCompletion = remainingFeatures > 0 && averageTime > 0
      ? new Date(Date.now() + (remainingFeatures * averageTime)).toLocaleTimeString()
      : 'N/A';

    const successRate = totalFeatures > 0 
      ? (completedFeatures / (completedFeatures + failedFeatures || 1)) * 100 
      : 0;

    return {
      totalFeatures,
      completedFeatures,
      processingFeatures,
      failedFeatures,
      averageTime,
      estimatedCompletion,
      successRate
    };
  }, [features]);

  // Load advanced metrics periodically
  useEffect(() => {
    if (!showAdvancedMetrics) return;

    const updateMetrics = () => {
      const perfStats = performanceMonitorService.generatePerformanceStats(jobId);
      setPerformanceStats(perfStats);

      const cssOptStats = cssOptimizerService.getOptimizationSummary();
      setCssStats(cssOptStats);

      const errStats = errorRecoveryService.getErrorStatistics();
      setErrorStats(errStats);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [jobId, showAdvancedMetrics]);

  const getStatusIcon = (status: FeatureProgress['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const getStatusColor = (status: FeatureProgress['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-3 mb-4 relative overflow-hidden">
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out relative"
        style={{ width: `${overallProgress}%` }}
      >
        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">
          {Math.round(overallProgress)}%
        </span>
      </div>
    </div>
  );

  const renderOverviewMode = () => (
    <div className="space-y-4">
      {/* Main Progress */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Enhancement Progress</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {isComplete && <span className="text-green-600 font-medium">✅ Complete!</span>}
            {isLoading && <span className="text-blue-600">🔄 Loading...</span>}
          </div>
        </div>
        {renderProgressBar()}
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.completedFeatures}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.processingFeatures}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{metrics.failedFeatures}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.successRate)}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h4 className="font-semibold text-gray-900 mb-3">Feature Status</h4>
        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedFeature === feature.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getStatusIcon(feature.status)}</span>
                  <span className="font-medium text-gray-900">{feature.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                  {feature.progress > 0 && feature.status === 'processing' && (
                    <span className="text-sm text-gray-600">{feature.progress}%</span>
                  )}
                </div>
              </div>
              
              {feature.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature.progress}%` }}
                  ></div>
                </div>
              )}
              
              {feature.error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  {feature.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTimelineMode = () => (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <h4 className="font-semibold text-gray-900 mb-4">Processing Timeline</h4>
      <div className="relative">
        {features.map((feature, index) => (
          <div key={feature.id} className="flex items-start space-x-4 mb-6">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                feature.status === 'completed' ? 'bg-green-500' :
                feature.status === 'processing' ? 'bg-blue-500' :
                feature.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
              }`}>
                {index + 1}
              </div>
              {index < features.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900">{feature.name}</h5>
                <span className={`text-sm ${getStatusColor(feature.status)}`}>
                  {feature.status}
                </span>
              </div>
              {feature.timestamp && (
                <p className="text-sm text-gray-600 mt-1">
                  Duration: {formatDuration(feature.timestamp)}
                </p>
              )}
              {feature.status === 'processing' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${feature.progress}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalyticsMode = () => (
    <div className="space-y-4">
      {/* Performance Analytics */}
      {performanceStats && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3">Performance Analytics</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {formatDuration(performanceStats.averageDuration)}
              </div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(performanceStats.successRate)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {performanceStats.performanceTrend}
              </div>
              <div className="text-sm text-gray-600">Trend</div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Optimization Stats */}
      {cssStats && cssStats.totalFeatures > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3">CSS Optimization</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round(cssStats.overallCompressionRatio * 100)}%
              </div>
              <div className="text-sm text-gray-600">Compression</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {cssStats.totalDuplicatesRemoved}
              </div>
              <div className="text-sm text-gray-600">Duplicates Removed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round((cssStats.totalOriginalSize - cssStats.totalOptimizedSize) / 1024)}KB
              </div>
              <div className="text-sm text-gray-600">Saved</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics */}
      {errorStats && errorStats.totalErrors > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-3">Error Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Errors:</span>
              <span className="font-medium">{errorStats.totalErrors}</span>
            </div>
            {Object.entries(errorStats.errorsByType).map(([type, count]) => (
              <div key={type} className="flex justify-between">
                <span className="text-gray-600 capitalize">{type}:</span>
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (compactMode) {
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">
            {metrics.completedFeatures}/{metrics.totalFeatures} Features
          </span>
          <span className="text-sm text-gray-600">{Math.round(overallProgress)}%</span>
        </div>
        {renderProgressBar()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Enhancement Progress</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['overview', 'timeline', 'analytics'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'overview' && renderOverviewMode()}
      {viewMode === 'timeline' && renderTimelineMode()}
      {viewMode === 'analytics' && showAdvancedMetrics && renderAnalyticsMode()}

      {/* Estimation Panel */}
      {!isComplete && metrics.estimatedCompletion !== 'N/A' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-blue-500 text-lg mr-2">⏰</span>
            <div>
              <p className="text-blue-800 font-medium">Estimated Completion</p>
              <p className="text-blue-600">{metrics.estimatedCompletion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressVisualization;