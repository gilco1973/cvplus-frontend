/**
 * Competitive Metrics Component
 * Displays market positioning and competitor comparison data
 */

import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface CompetitorProfile {
  level: string;
  averageScore: number;
  keyStrengths: string[];
  commonWeaknesses: string[];
  salaryRange: string;
  marketShare: number;
}

interface CompetitiveMetricsProps {
  yourScore: number;
  competitorProfiles: CompetitorProfile[];
}

export const CompetitiveMetrics: React.FC<CompetitiveMetricsProps> = ({
  yourScore,
  competitorProfiles
}) => {
  const competitorComparison = useMemo(() => {
    return competitorProfiles.map(profile => ({
      ...profile,
      comparison: yourScore - profile.averageScore,
      competitive: yourScore >= profile.averageScore
    }));
  }, [yourScore, competitorProfiles]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Competitive Landscape</h3>
      <div className="space-y-4">
        {competitorComparison.map((competitor) => (
          <div key={competitor.level} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{competitor.level}</span>
                <span className="text-sm text-gray-500">
                  {competitor.marketShare}% of market
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Avg: {competitor.averageScore}
                </span>
                <span className={`text-sm font-medium ${
                  competitor.competitive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {competitor.comparison > 0 ? '+' : ''}{competitor.comparison}
                </span>
                {competitor.competitive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
                )}
              </div>
            </div>

            {/* Score Comparison Bar */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs text-gray-500 w-16">Market</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-gray-400 rounded-full"
                    style={{ width: `${competitor.averageScore}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">{competitor.averageScore}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-600 w-16">You</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      competitor.competitive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(yourScore, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-900 font-medium w-8">{yourScore}</span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-700 mb-1">Salary Range</div>
                <div className="text-gray-600">{competitor.salaryRange}</div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-1">Key Strengths</div>
                <div className="text-gray-600">
                  {competitor.keyStrengths.slice(0, 2).join(', ')}
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-1">Common Gaps</div>
                <div className="text-gray-600">
                  {competitor.commonWeaknesses.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};