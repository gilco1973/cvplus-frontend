import React from 'react';
import { CheckCircle2, Clock, Target, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecommendationItem } from '../hooks/useRoleRecommendations';
import { RecommendationCard } from './RecommendationCard';

interface RoleRecommendationsListProps {
  recommendations: RecommendationItem[];
  onToggle: (recommendationId: string) => void;
  isApplying?: boolean;
  expandedSections?: Record<string, boolean>;
  onToggleSection?: (priority: string) => void;
}

export const RoleRecommendationsList: React.FC<RoleRecommendationsListProps> = ({
  recommendations,
  onToggle,
  isApplying = false,
  expandedSections = {},
  onToggleSection
}) => {
  // Group recommendations by priority
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.priority]) {
      acc[rec.priority] = [];
    }
    acc[rec.priority].push(rec);
    return acc;
  }, {} as Record<string, RecommendationItem[]>);

  const priorityOrder = ['high', 'medium', 'low'] as const;
  const priorityColors = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200', 
      icon: 'text-yellow-600',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600', 
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800'
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5" />;
      case 'medium':
        return <Clock className="w-5 h-5" />;
      case 'low':
        return <Target className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return priority;
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Target className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Role-specific recommendations will appear here once your CV is analyzed for the selected role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {priorityOrder.map(priority => {
        const priorityRecs = groupedRecommendations[priority] || [];
        if (priorityRecs.length === 0) return null;

        const colors = priorityColors[priority];
        const isExpanded = expandedSections[priority] ?? true;
        const selectedCount = priorityRecs.filter(rec => rec.selected).length;

        return (
          <div key={priority} className={`border rounded-lg ${colors.border} ${colors.bg}`}>
            {/* Priority Section Header */}
            <div 
              className={`p-4 border-b ${colors.border} cursor-pointer select-none`}
              onClick={() => onToggleSection?.(priority)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={colors.icon}>
                    {getPriorityIcon(priority)}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${colors.text}`}>
                      {getPriorityLabel(priority)}
                    </h3>
                    <p className={`text-sm ${colors.text} opacity-75`}>
                      {priorityRecs.length} recommendation{priorityRecs.length !== 1 ? 's' : ''} • {selectedCount} selected
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                    {priorityRecs.length}
                  </span>
                  {onToggleSection && (
                    <div className={colors.icon}>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            {isExpanded && (
              <div className="p-4 space-y-4">
                {priorityRecs.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                    onToggle={onToggle}
                    isDisabled={isApplying}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Selected Summary */}
      {recommendations.some(rec => rec.selected) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Selected Recommendations</h4>
          </div>
          <p className="text-blue-800 text-sm">
            {recommendations.filter(rec => rec.selected).length} recommendations selected for application
          </p>
        </div>
      )}
    </div>
  );
};