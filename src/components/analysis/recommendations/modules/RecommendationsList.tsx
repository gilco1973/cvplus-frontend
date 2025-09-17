/**
 * RecommendationsList Component
 * 
 * Renders the list of recommendations using RecommendationCard components.
 * Handles empty states and provides bulk selection controls.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { RecommendationCard } from './RecommendationCard';
import { CheckSquare, Square, Search } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: any[];
  onToggleRecommendation: (id: string) => void;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll?: () => void;
  onClearAll?: () => void;
  className?: string;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onToggleRecommendation,
  selectedCount,
  allSelected,
  onSelectAll,
  onClearAll,
  className = ''
}) => {
  // Empty state
  if (recommendations.length === 0) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <div className="text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No Recommendations Found</h3>
          <p className="text-sm text-gray-500">No recommendations are available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Bulk Selection Controls */}
      {recommendations.length > 1 && (
        <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-300">
            {selectedCount} of {recommendations.length} recommendations selected
          </div>
          
          <div className="flex items-center gap-3">
            {onSelectAll && (
              <button
                onClick={onSelectAll}
                disabled={allSelected}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  allSelected
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Select All
              </button>
            )}
            
            {onClearAll && selectedCount > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <Square className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onToggle={onToggleRecommendation}
          />
        ))}
      </div>
      
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-purple-300">
            {selectedCount} recommendation{selectedCount !== 1 ? 's' : ''} selected
          </p>
          <p className="text-sm text-purple-400 mt-1">
            These improvements will be applied to your CV
          </p>
        </div>
      )}
      
      {/* Helper Text */}
      <div className="text-center text-sm text-gray-500">
        Click on recommendations to select them for implementation
      </div>
    </div>
  );
};