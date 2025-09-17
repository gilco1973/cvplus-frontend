/**
 * Progress Stage Indicator Component
 * Displays overall progress stages with animations and visual feedback
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProgressStage, ProgressEnhancer } from '../../services/ProgressEnhancer';

interface ProgressStageIndicatorProps {
  currentProgress: number;
  currentStep: string;
  currentStage: string;
  estimatedTimeRemaining?: number;
  asyncMode?: boolean;
  className?: string;
}

export const ProgressStageIndicator: React.FC<ProgressStageIndicatorProps> = ({
  currentProgress,
  currentStep,
  currentStage,
  estimatedTimeRemaining,
  asyncMode = false,
  className = ''
}) => {
  // Get current stage enum value
  const stage = ProgressEnhancer.getCurrentStage(currentProgress);
  const stageConfig = ProgressEnhancer.getStageConfig(stage);
  const stageProgress = ProgressEnhancer.getStageProgress(currentProgress, stage);

  // Get all stages for indicator
  const allStages = [
    ProgressStage.INITIALIZE,
    ProgressStage.GENERATE,
    ProgressStage.ENHANCE,
    ProgressStage.COMPLETE
  ];

  // Format estimated time remaining
  const getEstimatedTimeDisplay = () => {
    if (!estimatedTimeRemaining) return null;
    return `~${ProgressEnhancer.formatDuration(estimatedTimeRemaining)} remaining`;
  };

  // Get stage indicator styling
  const getStageIndicatorStyling = (stageEnum: ProgressStage, index: number) => {
    const isCurrentStage = stageEnum === stage;
    const isCompletedStage = allStages.indexOf(stageEnum) < allStages.indexOf(stage);
    const isUpcomingStage = allStages.indexOf(stageEnum) > allStages.indexOf(stage);

    if (isCompletedStage) {
      return 'text-green-400 bg-green-500/20 border-green-500';
    } else if (isCurrentStage) {
      return 'text-cyan-400 bg-cyan-500/20 border-cyan-500 animate-pulse';
    } else if (isUpcomingStage) {
      return 'text-gray-500 bg-gray-800/50 border-gray-600';
    }
    
    return 'text-gray-500 bg-gray-800/50 border-gray-600';
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6 ${className}`}>
      {/* Main Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">{stageConfig.icon}</span>
          <div>
            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
              {stageConfig.name}
              {asyncMode && (
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    REAL-TIME
                  </span>
                </div>
              )}
            </h2>
            <p className="text-sm text-gray-400">{currentStep || stageConfig.description}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">
            {Math.round(currentProgress)}%
          </div>
          {getEstimatedTimeDisplay() && (
            <div className="text-xs text-gray-500">
              {getEstimatedTimeDisplay()}
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="space-y-3">
        {/* Main Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          
          {/* Stage markers */}
          {allStages.map((stageEnum, index) => {
            const config = ProgressEnhancer.getStageConfig(stageEnum);
            const [stageStart] = config.progressRange;
            
            return (
              <div
                key={stageEnum}
                className="absolute top-0 w-0.5 h-3 bg-gray-600"
                style={{ left: `${stageStart}%` }}
              />
            );
          })}
        </div>
        
        {/* Stage Progress Bar (for current stage) */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stageProgress}%` }}
          />
        </div>
      </div>
      
      {/* Stage Indicators */}
      <div className="flex justify-between mt-4">
        {allStages.map((stageEnum, index) => {
          const config = ProgressEnhancer.getStageConfig(stageEnum);
          const styling = getStageIndicatorStyling(stageEnum, index);
          
          return (
            <div key={stageEnum} className="flex flex-col items-center gap-1">
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium
                transition-all duration-300 ${styling}
              `}>
                <span>{config.icon}</span>
              </div>
              <span className={`
                text-xs font-medium transition-colors duration-300
                ${stageEnum === stage ? 'text-cyan-400' : 'text-gray-500'}
              `}>
                {config.name}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Additional Progress Info */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Stage: {stageConfig.name} ({stageProgress}%)</span>
          {asyncMode && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-purple-300">Live Updates Active</span>
            </div>
          )}
        </div>
        
        <div className="text-right">
          {currentProgress < 100 ? (
            <span>Processing...</span>
          ) : (
            <span className="text-green-400">Complete!</span>
          )}
        </div>
      </div>
    </div>
  );
};