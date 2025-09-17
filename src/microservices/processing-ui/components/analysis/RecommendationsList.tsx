/**
 * Recommendations List Component
 * Displays prioritized recommendations with selection controls
 */

import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import type { RecommendationItem } from '../../types/analysis';

interface RecommendationsListProps {
  recommendations: RecommendationItem[];
  expandedPriorities: Record<string, boolean>;
  onToggleExpanded: (priorities: Record<string, boolean>) => void;
  onToggleRecommendation: (id: string) => void;
  className?: string;
}

/**
 * Recommendations list with priority grouping and selection
 * Allows users to select which improvements to apply
 */
export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  expandedPriorities,
  onToggleExpanded,
  onToggleRecommendation,
  className = ''
}) => {
  // Group recommendations by priority
  const groupedRecommendations = recommendations.reduce((groups, rec) => {
    if (!groups[rec.priority]) {
      groups[rec.priority] = [];
    }
    groups[rec.priority].push(rec);
    return groups;
  }, {} as Record<string, RecommendationItem[]>);

  const priorityOrder = ['high', 'medium', 'low'] as const;
  const priorityLabels = {
    high: 'High Priority',
    medium: 'Medium Priority', 
    low: 'Low Priority'
  };

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-blue-200 bg-blue-50'
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  };

  const togglePriorityExpansion = (priority: string) => {
    onToggleExpanded({
      ...expandedPriorities,
      [priority]: !expandedPriorities[priority]
    });
  };

  const getTotalImpact = (recs: RecommendationItem[]) => {
    return recs.reduce((sum, rec) => sum + rec.estimatedImprovement, 0);
  };

  const getSelectedCount = (recs: RecommendationItem[]) => {
    return recs.filter(rec => rec.selected).length;
  };

  if (recommendations.length === 0) {
    return (
      <div className={`recommendations-list ${className}`}>
        <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
          <p className="text-gray-500">No recommendations available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`recommendations-list ${className}`}>
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Improvement Recommendations
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select the improvements you'd like to apply to your CV
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {priorityOrder.map(priority => {
            const recs = groupedRecommendations[priority] || [];
            if (recs.length === 0) return null;

            const isExpanded = expandedPriorities[priority];
            const selectedCount = getSelectedCount(recs);
            const totalImpact = getTotalImpact(recs);

            return (
              <div key={priority} className="p-6">
                <button
                  onClick={() => togglePriorityExpansion(priority)}
                  className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-2 -m-2"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeColors[priority]}`}>
                      {priorityLabels[priority]}
                    </div>
                    <span className="text-sm text-gray-600">
                      {recs.length} item{recs.length !== 1 ? 's' : ''}
                    </span>
                    {selectedCount > 0 && (
                      <span className="text-sm text-blue-600">
                        {selectedCount} selected
                      </span>
                    )}
                    <span className="text-sm text-green-600">
                      +{totalImpact} points potential
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-3">
                    {recs.map(rec => (
                      <div
                        key={rec.id}
                        className={`border rounded-lg p-4 transition-all ${
                          rec.selected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => onToggleRecommendation(rec.id)}
                            className="flex-shrink-0 mt-0.5"
                          >
                            {rec.selected ? (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                            )}
                          </button>

                          <div className="flex-grow">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900">
                                {rec.title}
                              </h3>
                              <span className="text-sm text-green-600 font-medium ml-2">
                                +{rec.estimatedImprovement} pts
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {rec.description}
                            </p>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100">
                                {rec.category}
                              </span>
                              <span>Impact: {rec.impact}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};