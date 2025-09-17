import React, { useState, useEffect } from 'react';
import { JobProgress, JobStatus } from '../../types/Job';
import { useWorkflowMonitoring } from '../hooks/useWorkflowMonitoring';

interface WorkflowMonitorProps {
  jobId: string;
  onStatusChange?: (status: JobStatus) => void;
  showDetails?: boolean;
}

/**
 * Workflow Monitor Component
 * 
 * Displays real-time job progress and workflow status monitoring.
 * This component provides a comprehensive view of workflow execution.
 */
export const WorkflowMonitor: React.FC<WorkflowMonitorProps> = ({
  jobId,
  onStatusChange,
  showDetails = true
}) => {
  const { 
    progress, 
    status, 
    features, 
    error, 
    isLoading 
  } = useWorkflowMonitoring(jobId);

  useEffect(() => {
    if (onStatusChange && status) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading workflow status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 font-medium">Workflow Error</div>
        </div>
        <div className="text-red-700 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Workflow Progress
        </h3>
        <p className="text-sm text-gray-500">Job ID: {jobId}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm text-gray-500">
            {progress?.completedFeatures || 0} of {progress?.totalFeatures || 0} features
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress?.progressPercentage || 0}%` 
            }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progress?.progressPercentage?.toFixed(1) || 0}% complete
        </div>
      </div>

      {/* Status */}
      <div className="px-6 py-3 bg-gray-50">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Status:
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === 'completed' ? 'bg-green-100 text-green-800' :
            status === 'processing' ? 'bg-blue-100 text-blue-800' :
            status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Detailed Features (if enabled) */}
      {showDetails && features && features.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Feature Status
          </h4>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{feature.name}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  feature.status === 'completed' ? 'bg-green-100 text-green-800' :
                  feature.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  feature.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {feature.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};