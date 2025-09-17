/**
 * Role Detection Progress Component
 * Displays animated progress indicator during role detection process
 */

import React from 'react';
import { Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { RoleDetectionProgressProps } from '../context/types';

const getStageInfo = (status: string) => {
  switch (status) {
    case 'analyzing':
      return {
        icon: Target,
        title: 'Analyzing Your CV',
        description: 'Our AI is examining your experience, skills, and achievements',
        color: 'cyan'
      };
    case 'detecting':
      return {
        icon: Target,
        title: 'Detecting Your Role',
        description: 'Matching your profile against professional role patterns',
        color: 'blue'
      };
    case 'completed':
      return {
        icon: CheckCircle,
        title: 'Detection Complete',
        description: 'Successfully identified your professional role',
        color: 'green'
      };
    case 'error':
      return {
        icon: AlertCircle,
        title: 'Detection Failed',
        description: 'Unable to detect role. Please try again.',
        color: 'red'
      };
    default:
      return {
        icon: Target,
        title: 'Preparing Analysis',
        description: 'Getting ready to analyze your CV',
        color: 'gray'
      };
  }
};

export const RoleDetectionProgress: React.FC<RoleDetectionProgressProps> = ({
  status,
  progress,
  estimatedTime,
  stage
}) => {
  const stageInfo = getStageInfo(status);
  const Icon = stageInfo.icon;
  
  const isActive = status === 'analyzing' || status === 'detecting';
  const isComplete = status === 'completed';
  const isError = status === 'error';
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      {/* Progress Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isComplete ? 'bg-green-500/20 border-2 border-green-500' :
            isError ? 'bg-red-500/20 border-2 border-red-500' :
            isActive ? `bg-${stageInfo.color}-500/20 border-2 border-${stageInfo.color}-500 animate-pulse` :
            'bg-gray-600 border-2 border-gray-500'}
        `}>
          <Icon className={`
            w-6 h-6
            ${isComplete ? 'text-green-400' :
              isError ? 'text-red-400' :
              isActive ? `text-${stageInfo.color}-400` :
              'text-gray-400'}
          `} />
        </div>
        
        <div className="flex-1">
          <h3 className={`
            text-lg font-semibold
            ${isComplete ? 'text-green-400' :
              isError ? 'text-red-400' :
              isActive ? `text-${stageInfo.color}-400` :
              'text-gray-300'}
          `}>
            {stageInfo.title}
          </h3>
          <p className="text-gray-400 text-sm">
            {stage || stageInfo.description}
          </p>
        </div>
        
        {estimatedTime && isActive && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{estimatedTime}</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar */}
      {(isActive || isComplete) && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-gray-300 font-medium">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className={`
                h-full transition-all duration-500 ease-out rounded-full
                ${isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                  isError ? 'bg-red-500' :
                  `bg-gradient-to-r from-${stageInfo.color}-500 to-${stageInfo.color}-400`}
              `}
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              {isActive && (
                <div className={`
                  h-full w-full animate-pulse
                  bg-gradient-to-r from-white/20 to-transparent
                `} />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Status Messages */}
      {isActive && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Analysis in progress... Please wait while we detect your professional role.</span>
        </div>
      )}
      
      {isComplete && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span>Role detection completed successfully!</span>
        </div>
      )}
      
      {isError && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>Role detection failed. Please check your connection and try again.</span>
        </div>
      )}
    </div>
  );
};