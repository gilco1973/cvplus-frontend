/**
 * CV Upload Processing State Component
 *
 * Renders the processing status and completion states
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React from 'react';
import { ProcessingStatus } from './ProcessingStatus';
import { cn } from '../utils/autonomous-utils';
import type { UploadState } from '../types/upload';

interface CVUploadProcessingProps {
  state: UploadState;
  showDetailedSteps: boolean;
  className?: string;
  onRetry: () => void;
  onReset: () => void;
  onCancel?: () => void;
}

export const CVUploadProcessing: React.FC<CVUploadProcessingProps> = ({
  state,
  showDetailedSteps,
  className = '',
  onRetry,
  onReset,
  onCancel
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your CV</h2>
        <p className="text-gray-600">
          {state.currentFile?.name || 'Your CV'} is being processed...
        </p>
        {state.jobId && (
          <p className="text-sm text-gray-500 mt-1">Job ID: {state.jobId}</p>
        )}
      </div>

      <ProcessingStatus
        status={state.status}
        progress={state.progress}
        steps={showDetailedSteps ? state.steps : []}
        startTime={state.startTime}
        estimatedTime={state.estimatedTime ? state.estimatedTime * 1000 : 5000}
        error={state.error}
        onRetry={onRetry}
        onCancel={state.status === 'processing' ? onCancel : undefined}
        className="max-w-2xl mx-auto"
      />

      {state.status === 'completed' && (
        <div className="text-center space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-700 font-medium">
                CV processing completed successfully!
              </p>
            </div>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upload Another CV
          </button>
        </div>
      )}

      {state.status === 'failed' && (
        <div className="text-center">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-sm text-red-700 font-medium">
                {state.error || 'Processing failed'}
              </p>
            </div>
          </div>
          <div className="space-x-4">
            <button
              onClick={onRetry}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Start Over
            </button>
          </div>
        </div>
      )}
    </div>
  );
};