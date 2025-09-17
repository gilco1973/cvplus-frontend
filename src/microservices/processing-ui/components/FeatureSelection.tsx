/**
 * Feature Selection Component
 *
 * Collapsible interface for selecting CV processing features
 *
 * @author Gil Klainert
 * @version 3.0.0 - Enhanced T063 Implementation
 */

import React from 'react';
import {
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../utils/autonomous-utils';
import { DEFAULT_FEATURES } from '../constants/features';
import type { CVProcessingFeature } from '../types/upload';

interface FeatureSelectionProps {
  selectedFeatures: string[];
  onToggleFeature: (featureId: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isPremium: boolean;
  estimatedTime?: number;
  className?: string;
}

export const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  selectedFeatures,
  onToggleFeature,
  isExpanded,
  onToggleExpanded,
  isPremium,
  estimatedTime,
  className = ''
}) => {
  if (!DEFAULT_FEATURES || DEFAULT_FEATURES.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <button
        onClick={onToggleExpanded}
        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-gray-600" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Processing Options</h3>
            <p className="text-sm text-gray-600">
              {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
              {estimatedTime ? ` • ~${Math.ceil(estimatedTime / 60)}m processing time` : ''}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="grid gap-3">
            {DEFAULT_FEATURES.map(feature => {
              const IconComponent = feature.icon;
              const isSelected = selectedFeatures.includes(feature.id);
              const isDisabled = feature.premium && !isPremium;

              return (
                <div
                  key={feature.id}
                  className={cn(
                    "relative flex items-start p-3 rounded-lg border transition-all cursor-pointer",
                    isSelected && !isDisabled && "bg-blue-50 border-blue-200",
                    isDisabled && "opacity-60 cursor-not-allowed bg-gray-50",
                    !isSelected && !isDisabled && "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={() => !isDisabled && onToggleFeature(feature.id)}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => !isDisabled && onToggleFeature(feature.id)}
                      disabled={isDisabled}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {feature.name}
                      </span>
                      {feature.premium && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          Premium
                        </span>
                      )}
                      {feature.estimatedTime && (
                        <span className="text-xs text-gray-500">
                          ~{feature.estimatedTime}s
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};