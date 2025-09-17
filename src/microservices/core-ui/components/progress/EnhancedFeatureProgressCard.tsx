/**
 * Enhanced Feature Progress Card Component
 * Displays individual feature progress with retry functionality and enhanced visual feedback
 */

import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { EnhancedFeatureProgress } from '../../hooks/useEnhancedProgressTracking';
import { ProgressEnhancer } from '../../services/ProgressEnhancer';
import toast from 'react-hot-toast';

// Feature configuration interface
export interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Component props
interface EnhancedFeatureProgressCardProps {
  feature: FeatureConfig;
  progress: EnhancedFeatureProgress;
  onRetryFeature?: (featureId: string) => Promise<void>;
  asyncMode?: boolean;
  showRetryButton?: boolean;
  animationEnabled?: boolean;
  compactMode?: boolean;
}

export const EnhancedFeatureProgressCard: React.FC<EnhancedFeatureProgressCardProps> = ({
  feature,
  progress,
  onRetryFeature,
  asyncMode = false,
  showRetryButton = true,
  animationEnabled = true,
  compactMode = false
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // Get status icon with enhanced logic
  const getStatusIcon = () => {
    if (isRetrying) {
      return <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />;
    }
    
    switch (progress.status) {
      case 'completed':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {progress.htmlFragmentAvailable && (
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" title="Interactive content available" />
            )}
          </div>
        );
      case 'processing':
      case 'retrying':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-5 h-5 text-red-400" />
            {progress.error?.isRetryable && showRetryButton && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-4 h-4 text-yellow-400 hover:text-yellow-300 transition-colors"
                title="Retry feature"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get card styling based on status
  const getCardStyling = () => {
    const baseClasses = `rounded-lg border p-4 transition-all duration-300`;
    
    if (isRetrying) {
      return `${baseClasses} border-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-400/20`;
    }
    
    switch (progress.status) {
      case 'completed': {
        const completedClasses = 'border-green-500 bg-green-500/10';
        return `${baseClasses} ${completedClasses} ${
          progress.htmlFragmentAvailable ? 'ring-1 ring-cyan-400/20' : ''
        }`;
      }
      case 'processing':
      case 'retrying':
        return `${baseClasses} border-blue-500 bg-blue-500/10`;
      case 'failed':
        return `${baseClasses} border-red-500 bg-red-500/10`;
      default:
        return `${baseClasses} border-gray-600 bg-gray-800/50`;
    }
  };

  // Handle retry button click
  const handleRetry = async () => {
    if (!onRetryFeature || isRetrying || !progress.error?.isRetryable) return;
    
    setIsRetrying(true);
    try {
      await onRetryFeature(feature.id);
      toast.success(`Retrying ${feature.name}...`);
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error(`Failed to retry ${feature.name}`);
    } finally {
      setIsRetrying(false);
    }
  };

  // Get estimated time display
  const getEstimatedTimeDisplay = () => {
    if (progress.status === 'processing' && progress.estimatedTimeRemaining) {
      return ProgressEnhancer.formatDuration(progress.estimatedTimeRemaining);
    }
    return null;
  };

  // Get elapsed time for processing features
  const getElapsedTime = () => {
    if (progress.performance?.startTime && progress.status === 'processing') {
      const elapsed = Math.round((Date.now() - progress.performance.startTime) / 1000);
      return ProgressEnhancer.formatDuration(elapsed);
    }
    return null;
  };

  // Get feature complexity indicator
  const getComplexityIndicator = () => {
    const indicator = ProgressEnhancer.getComplexityIndicator(feature.id);
    const categoryColor = ProgressEnhancer.getCategoryColor(feature.id);
    
    return (
      <span 
        className="text-xs opacity-60" 
        style={{ color: categoryColor }}
        title={`Complexity: ${ProgressEnhancer.getFeatureInfo(feature.id).complexity}`}
      >
        {indicator}
      </span>
    );
  };

  // Compact mode rendering
  if (compactMode) {
    return (
      <div className={`${getCardStyling()} p-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{feature.icon}</span>
            <span className="text-sm font-medium text-gray-100">{feature.name}</span>
            {asyncMode && (
              <Sparkles className="w-3 h-3 text-purple-400" title="Fast Track Mode" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {progress.status === 'processing' && (
              <span className="text-xs text-blue-400">{progress.progress}%</span>
            )}
            {getStatusIcon()}
          </div>
        </div>
      </div>
    );
  }

  // Full mode rendering
  return (
    <div className={getCardStyling()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{feature.icon}</span>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-100">{feature.name}</h3>
            {getComplexityIndicator()}
          </div>
          {asyncMode && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                FAST TRACK
              </span>
            </div>
          )}
        </div>
        {getStatusIcon()}
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
      
      {/* Processing State */}
      {(progress.status === 'processing' || progress.status === 'retrying') && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                progress.status === 'retrying' 
                  ? 'bg-yellow-500' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${progress.progress || 0}%` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <div className="text-gray-400">
              {progress.currentStep && (
                <span>{progress.currentStep}</span>
              )}
            </div>
            <div className="text-gray-500 flex gap-2">
              {getElapsedTime() && <span>{getElapsedTime()}</span>}
              {getEstimatedTimeDisplay() && (
                <>
                  {getElapsedTime() && <span>•</span>}
                  <span>~{getEstimatedTimeDisplay()} remaining</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <span className={`text-xs font-medium ${
              progress.status === 'retrying' ? 'text-yellow-400' : 'text-blue-400'
            }`}>
              {progress.progress || 0}%
            </span>
          </div>
        </div>
      )}
      
      {/* Failed State */}
      {progress.status === 'failed' && (
        <div className="space-y-2">
          {progress.error?.message && (
            <p className="text-sm text-red-400">{progress.error.message}</p>
          )}
          
          {progress.error?.isRetryable && showRetryButton && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
              >
                {isRetrying ? 'Retrying...' : 'Retry Feature'}
              </button>
              <span className="text-xs text-gray-500">
                {progress.error.retryCount > 0 
                  ? `Retry attempt ${progress.error.retryCount}`
                  : 'This feature can be retried'
                }
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Completed State */}
      {progress.status === 'completed' && (
        <div className="space-y-2">
          <p className="text-sm text-green-400">
            {progress.processedAt ? 
              `Enhancement complete! (${new Date(progress.processedAt.seconds * 1000).toLocaleTimeString()})` : 
              'Enhancement complete!'
            }
          </p>
          
          {progress.htmlFragmentAvailable && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-cyan-300">
                Interactive content ready for display
              </span>
            </div>
          )}
          
          {progress.performance?.duration && (
            <div className="text-xs text-gray-500">
              Completed in {ProgressEnhancer.formatDuration(progress.performance.duration / 1000)}
            </div>
          )}
        </div>
      )}
      
      {/* Pending State */}
      {progress.status === 'pending' && (
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Queued for processing...</span>
          {asyncMode && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
              Fast Track Ready
            </span>
          )}
        </div>
      )}
    </div>
  );
};