import React, { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Target, Lightbulb, ArrowRight, Clock, Star } from 'lucide-react';
import type { RecommendationItem } from '../hooks/useRoleRecommendations';

interface RecommendationCardProps {
  recommendation: RecommendationItem;
  onToggle: (recommendationId: string) => void;
  isDisabled?: boolean;
  showExpanded?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onToggle,
  isDisabled = false,
  showExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  const handleToggle = () => {
    if (!isDisabled) {
      onToggle(recommendation.id);
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add':
        return <Target className="w-4 h-4" />;
      case 'modify':
        return <ArrowRight className="w-4 h-4" />;
      case 'enhance':
        return <Star className="w-4 h-4" />;
      case 'reformat':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className={`
        border rounded-lg transition-all duration-200 cursor-pointer
        ${recommendation.selected 
          ? 'border-blue-300 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={handleToggle}
    >
      <div className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3 mb-3">
          {/* Selection Checkbox */}
          <div 
            className={`
              w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 mt-0.5
              transition-all duration-200
              ${recommendation.selected
                ? 'bg-blue-600 border-blue-600' 
                : 'border-gray-300 hover:border-blue-400'
              }
            `}
          >
            {recommendation.selected && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-semibold text-gray-900 leading-tight">
                {recommendation.title}
              </h4>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Impact Badge */}
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium border
                  ${getImpactBadgeColor(recommendation.impact)}
                `}>
                  {recommendation.impact} impact
                </span>
                
                {/* Expand Toggle */}
                <button
                  onClick={handleExpandToggle}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  disabled={isDisabled}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Section and Action Row */}
            <div className="flex items-center gap-3 mb-2 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                {getActionIcon(recommendation.actionRequired)}
                <span className="font-medium">{recommendation.section}</span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-500">
                <ArrowRight className="w-3 h-3" />
                <span className="capitalize">{recommendation.actionRequired}</span>
              </div>

              <div className={`flex items-center gap-1 ${getPriorityColor(recommendation.priority)}`}>
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span className="text-xs font-medium uppercase">
                  {recommendation.priority}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {recommendation.description}
            </p>

            {/* Score Improvement */}
            {recommendation.estimatedScoreImprovement && (
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">
                  +{recommendation.estimatedScoreImprovement} points estimated
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && recommendation.suggestedContent && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h5 className="font-medium text-gray-900">Suggested Content</h5>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
              <div className="whitespace-pre-wrap">
                {recommendation.suggestedContent}
              </div>
            </div>
          </div>
        )}

        {/* Processing Time Indicator */}
        {recommendation.processingTime && (
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Est. {recommendation.processingTime} to apply</span>
          </div>
        )}
      </div>
    </div>
  );
};