/**
 * CV Upload Idle State Component
 *
 * Renders the file upload interface and feature selection
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React from 'react';
import { FileUpload } from './FileUpload';
import { FeatureSelection } from './FeatureSelection';
import { JobDescriptionInput } from './JobDescriptionInput';
import { cn } from '../utils/autonomous-utils';
import { DEFAULT_FEATURES } from '../constants/features';
import type { UploadState } from '../types/upload';

interface CVUploadIdleProps {
  state: UploadState;
  isPremium: boolean;
  className?: string;
  onFileSelect: (file: File) => void;
  onUpdateJobDescription: (description: string) => void;
  onToggleFeature: (featureId: string) => void;
  onToggleFeatureSelection: () => void;
}

export const CVUploadIdle: React.FC<CVUploadIdleProps> = ({
  state,
  isPremium,
  className = '',
  onFileSelect,
  onUpdateJobDescription,
  onToggleFeature,
  onToggleFeatureSelection
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
        <p className="text-gray-600">
          Upload your CV to get started with AI-powered analysis and enhancement
        </p>
      </div>

      <FileUpload
        onFileSelect={onFileSelect}
        isLoading={state.status === 'uploading'}
      />

      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        </div>
      )}

      <JobDescriptionInput
        value={state.jobDescription || ''}
        onChange={onUpdateJobDescription}
      />

      <FeatureSelection
        selectedFeatures={state.selectedFeatures}
        onToggleFeature={onToggleFeature}
        isExpanded={state.showFeatureSelection}
        onToggleExpanded={onToggleFeatureSelection}
        isPremium={isPremium}
        estimatedTime={state.estimatedTime}
      />

      {state.selectedFeatures.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Selected Features Summary</h3>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {state.selectedFeatures.map(featureId => {
                const feature = DEFAULT_FEATURES.find(f => f.id === featureId);
                return feature ? (
                  <span
                    key={featureId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {feature.name}
                  </span>
                ) : null;
              })}
            </div>
            {state.estimatedTime && state.estimatedTime > 0 && (
              <p className="text-sm text-blue-700">
                Estimated processing time: {Math.ceil(state.estimatedTime / 60)} minute{state.estimatedTime > 60 ? 's' : ''}
              </p>
            )}
            {state.jobDescription?.trim() && (
              <p className="text-sm text-blue-700">Job-specific optimization enabled</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};