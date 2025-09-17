import React, { useState } from 'react';
import { Feature, FeatureStatus } from '../../types/Feature';
import { useFeatureManagement } from '../hooks/useFeatureManagement';

interface FeatureManagerProps {
  jobId: string;
  features: Feature[];
  onFeatureUpdate?: (featureId: string, status: FeatureStatus) => void;
  allowSkip?: boolean;
}

/**
 * Feature Manager Component
 * 
 * Provides interface for managing job features including completion,
 * skipping, and status updates within the workflow.
 */
export const FeatureManager: React.FC<FeatureManagerProps> = ({
  jobId,
  features,
  onFeatureUpdate,
  allowSkip = true
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState('');
  
  const { 
    completeFeature,
    skipFeature,
    updateFeatureStatus,
    isLoading 
  } = useFeatureManagement(jobId);

  const handleFeatureComplete = async (featureId: string) => {
    try {
      await completeFeature(featureId, {});
      onFeatureUpdate?.(featureId, 'completed');
    } catch (error) {
      console.error('Failed to complete feature:', error);
    }
  };

  const handleFeatureSkip = async (featureId: string, reason: string) => {
    try {
      await skipFeature(featureId, reason);
      onFeatureUpdate?.(featureId, 'skipped');
      setSelectedFeature(null);
      setSkipReason('');
    } catch (error) {
      console.error('Failed to skip feature:', error);
    }
  };

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'skipped':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Feature Management
        </h3>
        <p className="text-sm text-gray-500">
          Manage and track feature completion for this workflow
        </p>
      </div>

      {/* Features List */}
      <div className="divide-y divide-gray-200">
        {features.map((feature) => (
          <div key={feature.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-900">
                    {feature.name}
                  </h4>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                </div>
                {feature.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {feature.description}
                  </p>
                )}
                {feature.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{feature.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${feature.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="ml-4 flex space-x-2">
                {feature.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleFeatureComplete(feature.id)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Complete
                    </button>
                    {allowSkip && (
                      <button
                        onClick={() => setSelectedFeature(feature.id)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs font-medium rounded hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Skip
                      </button>
                    )}
                  </>
                )}
                {feature.status === 'processing' && (
                  <button
                    onClick={() => handleFeatureComplete(feature.id)}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skip Feature Modal */}
      {selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Skip Feature
              </h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for skipping this feature:
              </p>
              <textarea
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter reason for skipping..."
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedFeature(null);
                  setSkipReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFeatureSkip(selectedFeature, skipReason)}
                disabled={!skipReason.trim() || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                Skip Feature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};