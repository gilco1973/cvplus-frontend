import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Monitor, Star, Zap, Shield } from 'lucide-react';

interface VideoProvider {
  id: 'heygen' | 'runwayml' | 'did';
  name: string;
  description: string;
  capabilities: string[];
  reliability: number;
  estimatedTime: number;
  qualityRating: number;
  costTier: 'low' | 'medium' | 'high';
}

interface VideoGenerationStatus {
  provider: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTime?: number;
  qualityScore?: number;
  error?: string;
}

interface RealTimeStatusMonitorProps {
  status: VideoGenerationStatus;
  provider?: VideoProvider;
}

export const RealTimeStatusMonitor: React.FC<RealTimeStatusMonitorProps> = ({
  status,
  provider
}) => {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'queued': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing': return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'queued': return <Clock className="w-5 h-5 text-yellow-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'heygen': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'runwayml': return <Star className="w-5 h-5 text-purple-400" />;
      case 'did': return <Shield className="w-5 h-5 text-blue-400" />;
      default: return <Monitor className="w-5 h-5 text-gray-400" />;
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { name: 'CV Analysis', threshold: 20, icon: CheckCircle },
      { name: 'Script Generation', threshold: 40, icon: CheckCircle },
      { name: 'AI Avatar Creation', threshold: 70, icon: Loader2 },
      { name: 'Video Rendering', threshold: 90, icon: Clock },
      { name: 'Final Processing', threshold: 100, icon: Clock }
    ];

    return steps.map((step, index) => {
      const isCompleted = status.progress >= step.threshold;
      const isActive = status.progress >= (steps[index - 1]?.threshold || 0) && status.progress < step.threshold;
      const IconComponent = step.icon;

      return {
        ...step,
        isCompleted,
        isActive,
        IconComponent
      };
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {getStatusIcon(status.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Real-time Video Generation Monitor
            </h3>
            <p className={`text-sm ${getStatusColor(status.status)}`}>
              Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
            </p>
          </div>
        </div>
        
        {/* Provider Info */}
        {provider && (
          <div className="flex items-center gap-2 bg-gray-700/50 px-3 py-2 rounded-lg">
            {getProviderIcon(provider.id)}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-200">{provider.name}</div>
              <div className="text-xs text-gray-400">{provider.reliability}% reliability</div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Generation Progress</span>
          <span className="text-sm font-medium text-cyan-400">{status.progress}%</span>
        </div>
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 ease-out relative"
            style={{ width: `${status.progress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current Step */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-sm font-medium text-blue-400">Current Step</span>
        </div>
        <p className="text-gray-200">{status.currentStep}</p>
        {status.estimatedTime && (
          <p className="text-sm text-gray-400 mt-1">
            Estimated completion: {formatTime(status.estimatedTime)}
          </p>
        )}
      </div>

      {/* Progress Steps */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Processing Steps</h4>
        {getProgressSteps().map((step, index) => {
          const IconComponent = step.IconComponent;
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                step.isCompleted
                  ? 'bg-green-900/20 border border-green-700/30'
                  : step.isActive
                  ? 'bg-blue-900/20 border border-blue-700/30'
                  : 'bg-gray-900/50 border border-gray-700/30'
              }`}
            >
              {step.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : step.isActive ? (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-gray-500" />
              )}
              
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  step.isCompleted
                    ? 'text-green-400'
                    : step.isActive
                    ? 'text-blue-400'
                    : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                {step.threshold}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Quality Score */}
      {status.qualityScore && (
        <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Quality Score</span>
            </div>
            <div className="text-lg font-bold text-purple-400">
              {status.qualityScore.toFixed(1)}/10
            </div>
          </div>
          <div className="mt-2 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all duration-300"
              style={{ width: `${(status.qualityScore / 10) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {status.status === 'failed' && status.error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">Error Details</span>
          </div>
          <p className="text-sm text-gray-300">{status.error}</p>
        </div>
      )}

      {/* Real-time Metrics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-900/50 rounded-lg">
          <div className="text-lg font-bold text-cyan-400">{status.progress}%</div>
          <div className="text-xs text-gray-400">Complete</div>
        </div>
        
        {status.estimatedTime && (
          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg font-bold text-yellow-400">
              {formatTime(status.estimatedTime)}
            </div>
            <div className="text-xs text-gray-400">Est. Time</div>
          </div>
        )}
        
        {provider && (
          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg font-bold text-green-400">
              {provider.reliability}%
            </div>
            <div className="text-xs text-gray-400">Reliability</div>
          </div>
        )}
        
        {status.qualityScore && (
          <div className="text-center p-3 bg-gray-900/50 rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              {status.qualityScore.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Quality</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeStatusMonitor;