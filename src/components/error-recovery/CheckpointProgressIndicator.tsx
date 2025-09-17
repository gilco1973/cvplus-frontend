/**
 * Checkpoint Progress Indicator Component
 * 
 * Shows processing progress with checkpoint indicators,
 * recovery status, and estimated time remaining.
 */

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Save, 
  Clock, 
  RefreshCw,
  AlertCircle,
  Zap
} from 'lucide-react';
import { CheckpointType, type ProcessingCheckpoint } from '../../services/error-recovery/CheckpointManager';

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  checkpointType: CheckpointType;
  status: 'pending' | 'active' | 'completed' | 'error' | 'restored';
  progress?: number;
}

interface CheckpointProgressIndicatorProps {
  currentStep: string;
  steps: ProcessingStep[];
  checkpoints: ProcessingCheckpoint[];
  isRetrying?: boolean;
  error?: string | null;
  estimatedTimeRemaining?: number;
  className?: string;
}

export const CheckpointProgressIndicator: React.FC<CheckpointProgressIndicatorProps> = ({
  currentStep,
  steps,
  checkpoints,
  isRetrying = false,
  error = null,
  estimatedTimeRemaining,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Calculate overall progress
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const overallProgress = ((completedSteps + (currentStepIndex >= 0 ? 0.5 : 0)) / totalSteps) * 100;

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  const getStepIcon = (step: ProcessingStep) => {
    const hasCheckpoint = checkpoints.some(cp => cp.type === step.checkpointType);
    
    switch (step.status) {
      case 'completed':
        return (
          <div className="relative">
            <CheckCircle className="w-6 h-6 text-green-500" />
            {hasCheckpoint && (
              <Save className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
        );
      case 'active':
        return (
          <div className="relative">
            {isRetrying ? (
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
            )}
            {hasCheckpoint && (
              <Save className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
        );
      case 'error':
        return (
          <div className="relative">
            <AlertCircle className="w-6 h-6 text-red-500" />
            {hasCheckpoint && (
              <Save className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
        );
      case 'restored':
        return (
          <div className="relative">
            <div className="w-6 h-6 border-2 border-green-500 rounded-full border-t-transparent animate-spin" />
            <Zap className="w-3 h-3 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
          </div>
        );
      default:
        return (
          <div className="relative">
            <Circle className="w-6 h-6 text-gray-400" />
            {hasCheckpoint && (
              <Save className="w-3 h-3 text-blue-500 absolute -top-1 -right-1 bg-white rounded-full" />
            )}
          </div>
        );
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700';
      case 'active':
        return isRetrying ? 'text-orange-700' : 'text-blue-700';
      case 'error':
        return 'text-red-700';
      case 'restored':
        return 'text-green-700';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectorColor = (index: number) => {
    if (index >= steps.length - 1) return 'bg-gray-200';
    
    const currentStep = steps[index];
    
    if (currentStep.status === 'completed') {
      return 'bg-green-500';
    }
    
    if (currentStep.status === 'active' && currentStep.progress && currentStep.progress > 50) {
      return 'bg-blue-500';
    }
    
    return 'bg-gray-200';
  };

  const formatTimeRemaining = (seconds?: number): string => {
    if (!seconds) return 'Calculating...';
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s remaining`;
    } else if (seconds < 3600) {
      const minutes = Math.round(seconds / 60);
      return `${minutes}m remaining`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.round((seconds % 3600) / 60);
      return `${hours}h ${minutes}m remaining`;
    }
  };

  const getCheckpointInfo = (step: ProcessingStep) => {
    const checkpoint = checkpoints.find(cp => cp.type === step.checkpointType);
    if (!checkpoint) return null;

    return {
      savedAt: checkpoint.createdAt,
      canRestore: checkpoint.metadata.canResumeFrom,
      progress: checkpoint.metadata.progress
    };
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Processing Progress</h3>
          {estimatedTimeRemaining && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(estimatedTimeRemaining)}</span>
            </div>
          )}
        </div>
        
        {/* Overall progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              error ? 'bg-red-500' : isRetrying ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${animatedProgress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{Math.round(animatedProgress)}% Complete</span>
          <span>{completedSteps} of {totalSteps} steps</span>
        </div>
      </div>

      {/* Error message */}
      {error && !isRetrying && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Processing Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Retry indicator */}
      {isRetrying && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 text-orange-500 animate-spin flex-shrink-0" />
            <div>
              <p className="text-orange-800 font-medium">Attempting Recovery</p>
              <p className="text-orange-700 text-sm">
                Restoring from the last checkpoint and retrying...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const checkpointInfo = getCheckpointInfo(step);
          
          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-3 top-8 w-0.5 h-8 ${getConnectorColor(index)} transition-colors duration-500`}
                />
              )}
              
              {/* Step content */}
              <div className="flex items-start space-x-4">
                {/* Step icon */}
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                
                {/* Step details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${getStepColor(step)} transition-colors duration-300`}>
                      {step.label}
                    </h4>
                    
                    {/* Checkpoint indicator */}
                    {checkpointInfo && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Save className="w-3 h-3" />
                        <span>Saved</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Step description */}
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                  
                  {/* Step progress bar (if active) */}
                  {step.status === 'active' && step.progress !== undefined && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isRetrying ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {/* Checkpoint details */}
                  {checkpointInfo && (
                    <div className="mt-2 text-xs text-gray-500">
                      <span>
                        Checkpoint saved at {checkpointInfo.savedAt.toLocaleTimeString()}
                        {checkpointInfo.canRestore && ' • Can restore from here'}
                      </span>
                    </div>
                  )}
                  
                  {/* Restored indicator */}
                  {step.status === 'restored' && (
                    <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                      <Zap className="w-3 h-3" />
                      <span>Restored from checkpoint</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkpoint legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Save className="w-3 h-3 text-blue-500" />
            <span>Progress Saved</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-green-500" />
            <span>Restored</span>
          </div>
          <div className="flex items-center space-x-1">
            <RefreshCw className="w-3 h-3 text-orange-500" />
            <span>Retrying</span>
          </div>
        </div>
      </div>
    </div>
  );
};