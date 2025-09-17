/**
 * Analysis Overview Component
 * Main overview section showing ATS compatibility and top recommendations
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, TrendingUp, Target } from 'lucide-react';
import type { CVAnalysisResults } from '../../../../types/cv.types';
import type { AnalysisResult } from '../../../types/analysis';

interface AnalysisOverviewProps {
  analysisResults: CVAnalysisResults;
  analysisResult: AnalysisResult;
  onApplyRecommendation?: (recommendationId: string) => void;
  expanded: boolean;
  onToggle: () => void;
}

export const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({
  analysisResults,
  analysisResult,
  onApplyRecommendation,
  expanded,
  onToggle
}) => {
  // Computed values
  const atsData = useMemo(() => ({
    score: analysisResults.atsCompatibility.score,
    status: analysisResults.atsCompatibility.score >= 80 ? 'excellent' :
           analysisResults.atsCompatibility.score >= 60 ? 'good' :
           analysisResults.atsCompatibility.score >= 40 ? 'fair' : 'poor',
    factors: analysisResults.atsCompatibility.factors
  }), [analysisResults.atsCompatibility]);

  const topRecommendations = useMemo(() =>
    analysisResult.recommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 3),
    [analysisResult.recommendations]
  );

  const scoreColor = useMemo(() => {
    if (atsData.score >= 80) return 'text-green-600 bg-green-50';
    if (atsData.score >= 60) return 'text-blue-600 bg-blue-50';
    if (atsData.score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  }, [atsData.score]);

  return (
    <div className="analysis-overview bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Target className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Analysis Overview</h2>
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

      {expanded && (
        <div className="p-6 space-y-8">
          {/* ATS Compatibility Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">ATS Compatibility Score</h3>
              <div className={`inline-flex items-center px-6 py-3 rounded-xl ${scoreColor}`}>
                <div className="text-3xl font-bold mr-2">{atsData.score}</div>
                <div className="text-sm font-medium">/ 100</div>
              </div>
              <div className="flex items-center space-x-2">
                {atsData.status === 'excellent' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-sm text-gray-600 capitalize font-medium">
                  {atsData.status} compatibility
                </span>
              </div>
            </div>

            {/* ATS Factors */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Key Factors</h3>
              <div className="space-y-3">
                {atsData.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{factor.name}</div>
                      <div className="text-xs text-gray-500">{factor.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            factor.score >= 80 ? 'bg-green-500' :
                            factor.score >= 60 ? 'bg-blue-500' :
                            factor.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {factor.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analysisResults.overallScore}</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analysisResults.keywords.length}</div>
              <div className="text-sm text-gray-600">Keywords Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{analysisResult.summary.potentialScoreIncrease}</div>
              <div className="text-sm text-gray-600">Potential Increase</div>
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Top Priority Recommendations</h3>
              <span className="text-sm text-gray-500">
                {analysisResult.summary.highPriorityCount} high priority items
              </span>
            </div>

            <div className="space-y-3">
              {topRecommendations.map((recommendation) => (
                <div
                  key={recommendation.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-gray-900">{recommendation.title}</span>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          +{recommendation.estimatedImprovement} points
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                      <div className="text-xs text-gray-500">
                        Category: {recommendation.category} • Impact: {recommendation.impact}
                      </div>
                    </div>
                    {onApplyRecommendation && (
                      <button
                        onClick={() => onApplyRecommendation(recommendation.id)}
                        className="ml-4 px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {analysisResult.summary.highPriorityCount > 3 && (
              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all {analysisResult.summary.highPriorityCount} recommendations →
                </button>
              </div>
            )}
          </div>

          {/* Keywords Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Detected Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {analysisResults.keywords.slice(0, 12).map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {keyword}
                </span>
              ))}
              {analysisResults.keywords.length > 12 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  +{analysisResults.keywords.length - 12} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};