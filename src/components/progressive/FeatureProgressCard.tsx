/**
 * Feature Progress Card Component
 * Displays individual feature enhancement progress with visual indicators
 */

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { FeatureProgress } from '../../hooks/useProgressiveEnhancement';

interface FeatureProgressCardProps {
  feature: FeatureProgress;
  onRetry?: (featureId: string) => void;
  className?: string;
}

export const FeatureProgressCard: React.FC<FeatureProgressCardProps> = ({
  feature,
  onRetry,
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (feature.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (feature.status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'processing':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'pending':
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600';
    }
  };

  const getStatusText = () => {
    switch (feature.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  const getProgressBarColor = () => {
    switch (feature.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'processing':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className={`
      rounded-lg border-2 p-4 transition-all duration-200 
      ${getStatusColor()}
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {feature.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getStatusText()}
              {feature.timestamp && (
                <span className="ml-2 text-xs">
                  {formatTimestamp(feature.timestamp)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Retry button for failed features */}
        {feature.status === 'failed' && onRetry && (
          <button
            onClick={() => onRetry(feature.id)}
            className="
              flex items-center gap-2 px-3 py-1.5 text-sm
              bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50
              text-red-700 dark:text-red-300
              rounded-md transition-colors
            "
            title="Retry this feature"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(feature.progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(feature.progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {feature.status === 'failed' && feature.error && (
        <div className="flex items-start gap-2 p-3 bg-red-100 dark:bg-red-900/30 rounded-md">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Error
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              {feature.error}
            </p>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {feature.status === 'completed' && (
        <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-md">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <p className="text-sm text-green-800 dark:text-green-300">
            Feature successfully added to your CV
          </p>
        </div>
      )}

      {/* Processing Indicator */}
      {feature.status === 'processing' && (
        <div className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Generating enhancement...
          </p>
        </div>
      )}
    </div>
  );
};

export default FeatureProgressCard;