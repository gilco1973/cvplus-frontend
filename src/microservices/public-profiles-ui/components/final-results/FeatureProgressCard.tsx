import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Clock, RotateCcw, X } from 'lucide-react';

// Types
interface FeatureProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  progress: number;
  currentStep?: string;
  error?: string;
  htmlFragment?: string;
  processedAt?: unknown;
}

interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface FeatureProgressCardProps {
  feature: FeatureConfig;
  progress: FeatureProgress;
  onRetry?: () => void;
  onSkip?: () => void;
}

// Feature Progress Card Component
export const FeatureProgressCard: React.FC<FeatureProgressCardProps> = ({ 
  feature, 
  progress, 
  onRetry,
  onSkip 
}) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'skipped':
        return <X className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return `Processing (${progress.progress}%)`;
      case 'failed':
        return 'Failed';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'processing':
        return 'border-blue-500 bg-blue-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      case 'skipped':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition-all duration-300 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{feature.icon}</span>
          <div>
            <h3 className="font-medium text-gray-100">{feature.name}</h3>
            <p className="text-xs text-gray-400">{getStatusText()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {progress.status === 'processing' && onSkip && (
            <button
              onClick={onSkip}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
              title="Skip this feature"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
            </button>
          )}
          {progress.status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
              title="Retry this feature"
            >
              <RotateCcw className="w-4 h-4 text-gray-400 hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
      
      {/* Always show progress bar for processing, retrying, and recently completed features */}
      {(progress.status === 'processing' || progress.status === 'retrying' || 
        (progress.status === 'completed' && (progress.progress || 0) > 0)) && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{progress.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                progress.status === 'completed' ? 'bg-green-500' : 
                progress.status === 'retrying' ? 'bg-yellow-500' :
                progress.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.max(progress.progress || 0, progress.status === 'processing' ? 5 : 0)}%` }}
            />
          </div>
          {progress.currentStep && (
            <p className="text-xs text-gray-400">{progress.currentStep}</p>
          )}
        </div>
      )}
      
      {progress.status === 'failed' && (
        <div className="space-y-2">
          {progress.error && (
            <p className="text-sm text-red-400">{progress.error}</p>
          )}
          {/* Show progress bar for failed features to indicate how far they got */}
          {(progress.progress || 0) > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Progress before failure</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="h-1 rounded-full bg-red-500 transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {progress.status === 'completed' && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <p className="text-sm text-green-400">
            {progress.processedAt ? 
              `Enhancement complete! (${new Date(progress.processedAt.seconds * 1000).toLocaleTimeString()})` : 
              'Enhancement complete!'
            }
          </p>
        </div>
      )}
      
      {progress.status === 'skipped' && (
        <p className="text-sm text-yellow-400">Feature skipped by user</p>
      )}
    </div>
  );
};

// Export types for use in other components
export type { FeatureProgress, FeatureConfig, FeatureProgressCardProps };