/**
 * ATS Score Card Component
 * Displays ATS analysis results and score visualization
 */

import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import type { ATSAnalysis } from '../../types/analysis';

interface ATSScoreCardProps {
  analysis: ATSAnalysis;
  className?: string;
}

/**
 * ATS Score visualization component
 * Shows current score, predicted improvement, and issues
 */
export const ATSScoreCard: React.FC<ATSScoreCardProps> = ({
  analysis,
  className = ''
}) => {
  const { currentScore, predictedScore, issues, suggestions, passes } = analysis;
  
  const improvement = predictedScore - currentScore;
  const scoreColor = currentScore >= 80 ? 'text-green-600' : 
                    currentScore >= 60 ? 'text-yellow-600' : 'text-red-600';
  
  const scoreBgColor = currentScore >= 80 ? 'bg-green-50 border-green-200' : 
                      currentScore >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className={`ats-score-card bg-white rounded-lg border shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            ATS Compatibility Score
          </h2>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            passes ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {passes ? 'ATS Friendly' : 'Needs Improvement'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Score */}
          <div className={`text-center p-4 rounded-lg border-2 ${scoreBgColor}`}>
            <div className={`text-3xl font-bold ${scoreColor} mb-1`}>
              {currentScore}%
            </div>
            <div className="text-sm text-gray-600">Current Score</div>
          </div>

          {/* Predicted Score */}
          <div className="text-center p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {predictedScore}%
            </div>
            <div className="text-sm text-gray-600">After Improvements</div>
          </div>

          {/* Improvement */}
          <div className="text-center p-4 rounded-lg border-2 bg-green-50 border-green-200">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-3xl font-bold text-green-600">
                +{improvement}%
              </span>
            </div>
            <div className="text-sm text-gray-600">Potential Gain</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>ATS Compatibility</span>
            <span>{currentScore}% of 100%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                currentScore >= 80 ? 'bg-green-500' : 
                currentScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(currentScore, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Issues and Suggestions Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Issues */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
              <h3 className="font-medium text-gray-900">
                Issues Found ({issues.length})
              </h3>
            </div>
            <div className="space-y-2">
              {issues.slice(0, 3).map((issue, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    issue.severity === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <p className="text-sm text-gray-600">{issue.message}</p>
                </div>
              ))}
              {issues.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{issues.length - 3} more issues
                </p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <h3 className="font-medium text-gray-900">
                Improvements ({suggestions.length})
              </h3>
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">{suggestion.reason}</p>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{suggestions.length - 3} more suggestions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};