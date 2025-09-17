/**
 * RecommendationCard Component
 * 
 * Displays individual recommendation with selection checkbox,
 * impact badges, and category information.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: {
    id: string;
    title: string;
    description: string;
    category?: string;
    impact?: 'low' | 'medium' | 'high';
    priority?: number;
    isSelected: boolean;
  };
  onToggle: (id: string) => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onToggle,
  className = ''
}) => {
  const handleClick = () => {
    onToggle(recommendation.id);
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-500/20 text-green-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div
      className={`p-6 rounded-lg border transition-all duration-200 cursor-pointer ${
        recommendation.isSelected
          ? 'border-purple-500 bg-purple-500/10'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
      } ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
          recommendation.isSelected
            ? 'border-purple-500 bg-purple-500'
            : 'border-gray-600'
        }`}>
          {recommendation.isSelected && (
            <CheckCircle className="w-3 h-3 text-white" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header with badges */}
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-100 pr-4">
              {recommendation.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {recommendation.impact && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  getImpactColor(recommendation.impact)
                }`}>
                  {recommendation.impact} impact
                </span>
              )}
              {recommendation.priority && (
                <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                  Priority {recommendation.priority}
                </span>
              )}
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-300 leading-relaxed">
            {recommendation.description}
          </p>
          
          {/* Category */}
          {recommendation.category && (
            <div className="text-sm text-gray-400">
              Category: <span className="text-gray-300">{recommendation.category}</span>
            </div>
          )}
          
          {/* Selection Indicator */}
          {recommendation.isSelected && (
            <div className="text-sm text-purple-300 font-medium">
              ✓ Selected for implementation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};