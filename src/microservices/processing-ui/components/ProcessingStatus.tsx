/**
 * Processing Status Component
 * 
 * Displays the current status of CV processing operations
 * with progress indicators and user-friendly messages.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import React from 'react';
import { AlertCircle, CheckCircle2, Clock, FileText, Loader2 } from 'lucide-react';
import { cn } from '../utils/autonomous-utils';

export interface ProcessingStep {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration?: number;
  error?: string;
}

export interface ProcessingStatusProps {
  /** Current processing status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  
  /** Overall progress percentage (0-100) */
  progress: number;
  
  /** List of processing steps */
  steps?: ProcessingStep[];
  
  /** Current step being processed */
  currentStep?: string;
  
  /** Processing start time */
  startTime?: Date;
  
  /** Estimated completion time */
  estimatedTime?: number;
  
  /** Error message if processing failed */
  error?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback for retry action */
  onRetry?: () => void;
  
  /** Callback for cancel action */
  onCancel?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  progress,
  steps = [],
  currentStep,
  startTime,
  estimatedTime,
  error,
  className = '',
  onRetry,
  onCancel
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return 'Preparing to process your CV...';
      case 'processing':
        return currentStep ? `${currentStep}...` : 'Processing your CV...';
      case 'completed':
        return 'CV processing completed successfully!';
      case 'failed':
        return error || 'CV processing failed. Please try again.';
      default:
        return 'Initializing...';
    }
  };

  const getElapsedTime = () => {
    if (!startTime) return null;
    const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEstimatedRemaining = () => {
    if (!estimatedTime || !startTime) return null;
    const elapsed = Date.now() - startTime.getTime();
    const remaining = Math.max(0, estimatedTime - elapsed);
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-lg p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <h3 className="text-lg font-semibold text-gray-900">
            CV Processing
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {getElapsedTime() && (
            <span>Elapsed: {getElapsedTime()}</span>
          )}
          {getEstimatedRemaining() && status === 'processing' && (
            <span>ETA: {getEstimatedRemaining()}</span>
          )}
        </div>
      </div>

      {/* Status Message */}
      <p className={cn(
        "text-sm mb-4",
        status === 'failed' ? "text-red-600" : "text-gray-600"
      )}>
        {getStatusMessage()}
      </p>

      {/* Progress Bar */}
      {status === 'processing' && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Processing Steps */}
      {steps.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700">Processing Steps</h4>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 p-2 rounded">
                {getStatusIcon(step.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{step.name}</p>
                  {step.description && (
                    <p className="text-xs text-gray-500">{step.description}</p>
                  )}
                  {step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
                {step.duration && step.status === 'completed' && (
                  <span className="text-xs text-gray-500">
                    {step.duration}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(status === 'failed' || status === 'processing') && (
        <div className="flex gap-3 pt-4 border-t">
          {status === 'failed' && onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Retry Processing
            </button>
          )}
          
          {onCancel && status === 'processing' && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Success Actions */}
      {status === 'completed' && (
        <div className="flex gap-3 pt-4 border-t">
          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium">
            View CV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            Download
          </button>
        </div>
      )}
    </div>
  );
};