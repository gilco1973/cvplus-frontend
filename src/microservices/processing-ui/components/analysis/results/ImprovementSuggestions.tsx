/**
 * Improvement Suggestions Component
 * Displays actionable recommendations for CV enhancement
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle, Clock, Star } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';

interface ImprovementSuggestionsProps {
  analysisResults: CVAnalysisResults;
  onApplyRecommendation?: (recommendationId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

type SuggestionCategory = 'content' | 'format' | 'keywords' | 'structure' | 'ats';

interface EnhancedSuggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  effort: 'low' | 'medium' | 'high';
  timeToComplete: string;
  applied: boolean;
}

export const ImprovementSuggestions: React.FC<ImprovementSuggestionsProps> = ({
  analysisResults,
  onApplyRecommendation,
  expanded,
  onToggle
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<SuggestionCategory>>(
    new Set(['content', 'format', 'keywords', 'structure', 'ats'])
  );
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Enhanced suggestions based on analysis results
  const suggestions = useMemo<EnhancedSuggestion[]>(() =>
    analysisResults.suggestions.map((suggestion, index) => ({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.description,
      category: ['content', 'format', 'keywords', 'structure', 'ats'][index % 5] as SuggestionCategory,
      priority: suggestion.type === 'critical' ? 'high' :
               suggestion.type === 'warning' ? 'medium' : 'low',
      impact: Math.floor(suggestion.priority * 10),
      effort: suggestion.priority >= 8 ? 'high' :
              suggestion.priority >= 5 ? 'medium' : 'low',
      timeToComplete: suggestion.priority >= 8 ? '2-4 hours' :
                     suggestion.priority >= 5 ? '30-60 min' : '5-15 min',
      applied: appliedSuggestions.has(suggestion.id)
    })),
    [analysisResults.suggestions, appliedSuggestions]
  );

  const filteredSuggestions = useMemo(() =>
    suggestions.filter(s => selectedCategories.has(s.category)),
    [suggestions, selectedCategories]
  );

  const prioritizedSuggestions = useMemo(() => {
    const high = filteredSuggestions.filter(s => s.priority === 'high');
    const medium = filteredSuggestions.filter(s => s.priority === 'medium');
    const low = filteredSuggestions.filter(s => s.priority === 'low');
    return { high, medium, low };
  }, [filteredSuggestions]);

  const categories: Array<{ key: SuggestionCategory; label: string; icon: React.ReactNode; color: string }> = [
    { key: 'content', label: 'Content', icon: '📝', color: 'blue' },
    { key: 'format', label: 'Format', icon: '🎨', color: 'purple' },
    { key: 'keywords', label: 'Keywords', icon: '🔍', color: 'green' },
    { key: 'structure', label: 'Structure', icon: '🏗️', color: 'orange' },
    { key: 'ats', label: 'ATS', icon: '🤖', color: 'red' }
  ];

  const toggleCategory = (category: SuggestionCategory) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setAppliedSuggestions(prev => new Set(prev).add(suggestionId));
    onApplyRecommendation?.(suggestionId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="improvement-suggestions bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Lightbulb className="h-6 w-6 text-yellow-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Improvement Suggestions</h2>
            <p className="text-sm text-gray-500">
              {filteredSuggestions.length} actionable recommendations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-600">
              {prioritizedSuggestions.high.length}
            </div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-8">
          {/* Category Filters */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(({ key, label, icon, color }) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                    selectedCategories.has(key)
                      ? `bg-${color}-100 border-${color}-300 text-${color}-700`
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{icon}</span>
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs bg-white rounded-full px-2 py-1">
                    {suggestions.filter(s => s.category === key).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* High Priority Suggestions */}
          {prioritizedSuggestions.high.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-red-700">
                🚨 High Priority Actions
              </h3>
              <div className="space-y-3">
                {prioritizedSuggestions.high.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      suggestion.applied
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {suggestion.applied ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Star className="h-5 w-5 text-red-600" />
                          )}
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            +{suggestion.impact} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{suggestion.timeToComplete}</span>
                          </span>
                          <span className={`font-medium ${getEffortColor(suggestion.effort)}`}>
                            {suggestion.effort.toUpperCase()} effort
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {categories.find(c => c.key === suggestion.category)?.label}
                          </span>
                        </div>
                      </div>
                      {!suggestion.applied && onApplyRecommendation && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority Suggestions */}
          {prioritizedSuggestions.medium.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-orange-700">
                ⚠️ Medium Priority Improvements
              </h3>
              <div className="space-y-3">
                {prioritizedSuggestions.medium.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-4 rounded-lg border ${
                      suggestion.applied
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {suggestion.applied ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Lightbulb className="h-5 w-5 text-orange-600" />
                          )}
                          <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            +{suggestion.impact} points
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{suggestion.timeToComplete}</span>
                          </span>
                          <span className={`font-medium ${getEffortColor(suggestion.effort)}`}>
                            {suggestion.effort.toUpperCase()} effort
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {categories.find(c => c.key === suggestion.category)?.label}
                          </span>
                        </div>
                      </div>
                      {!suggestion.applied && onApplyRecommendation && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="ml-4 px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Priority Suggestions */}
          {prioritizedSuggestions.low.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-blue-700">
                💡 Nice-to-Have Enhancements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prioritizedSuggestions.low.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className={`p-3 rounded-lg border ${
                      suggestion.applied
                        ? 'bg-green-50 border-green-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {suggestion.applied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                      )}
                      <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {suggestion.timeToComplete} • {suggestion.effort} effort
                      </span>
                      {!suggestion.applied && onApplyRecommendation && (
                        <button
                          onClick={() => handleApplySuggestion(suggestion.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {appliedSuggestions.size}
                </div>
                <div className="text-sm text-gray-600">Applied</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredSuggestions.length - appliedSuggestions.size}
                </div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  +{filteredSuggestions
                    .filter(s => appliedSuggestions.has(s.id))
                    .reduce((sum, s) => sum + s.impact, 0)}
                </div>
                <div className="text-sm text-gray-600">Points Gained</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((appliedSuggestions.size / filteredSuggestions.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};