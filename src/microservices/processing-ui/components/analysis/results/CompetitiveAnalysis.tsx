/**
 * Competitive Analysis Component
 * Shows how the CV compares to market standards and competitors
 */

import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp, Trophy, Award, Target, Users } from 'lucide-react';
import { CompetitiveMetrics, MarketPosition } from './competitive';
import type { CVAnalysisResults } from '../../../../types/cv.types';

interface CompetitiveAnalysisProps {
  analysisResults: CVAnalysisResults;
  expanded: boolean;
  onToggle: () => void;
}

interface CompetitorProfile {
  level: string;
  averageScore: number;
  keyStrengths: string[];
  commonWeaknesses: string[];
  salaryRange: string;
  marketShare: number;
}

interface MarketPosition {
  percentile: number;
  ranking: string;
  competitiveGaps: string[];
  uniqueStrengths: string[];
  marketValue: 'low' | 'medium' | 'high' | 'premium';
}

export const CompetitiveAnalysis: React.FC<CompetitiveAnalysisProps> = ({
  analysisResults,
  expanded,
  onToggle
}) => {
  // Market positioning data
  const competitorProfiles = useMemo<CompetitorProfile[]>(() => [
    {
      level: 'Entry Level',
      averageScore: 65,
      keyStrengths: ['Fresh perspective', 'Latest education', 'Eagerness to learn'],
      commonWeaknesses: ['Limited experience', 'Unproven track record'],
      salaryRange: '$50K - $70K',
      marketShare: 35
    },
    {
      level: 'Mid-Level',
      averageScore: 75,
      keyStrengths: ['Proven experience', 'Technical skills', 'Project delivery'],
      commonWeaknesses: ['Leadership gaps', 'Limited strategic thinking'],
      salaryRange: '$70K - $120K',
      marketShare: 40
    },
    {
      level: 'Senior Level',
      averageScore: 85,
      keyStrengths: ['Leadership experience', 'Strategic thinking', 'Mentoring'],
      commonWeaknesses: ['Technology currency', 'Adaptability'],
      salaryRange: '$120K - $180K',
      marketShare: 20
    },
    {
      level: 'Executive',
      averageScore: 90,
      keyStrengths: ['Vision & strategy', 'Business impact', 'Team building'],
      commonWeaknesses: ['Hands-on technical', 'Rapid execution'],
      salaryRange: '$180K+',
      marketShare: 5
    }
  ], []);

  const yourScore = analysisResults.overallScore;

  const marketPosition = useMemo<MarketPosition>(() => {
    const percentile = Math.min(95, Math.max(5, (yourScore - 40) / (95 - 40) * 90 + 5));

    let ranking: string;
    let marketValue: 'low' | 'medium' | 'high' | 'premium';

    if (percentile >= 90) {
      ranking = 'Top 10%';
      marketValue = 'premium';
    } else if (percentile >= 75) {
      ranking = 'Top 25%';
      marketValue = 'high';
    } else if (percentile >= 50) {
      ranking = 'Above Average';
      marketValue = 'medium';
    } else {
      ranking = 'Below Average';
      marketValue = 'low';
    }

    return {
      percentile,
      ranking,
      competitiveGaps: ['Industry certifications', 'Thought leadership presence', 'Open source contributions'],
      uniqueStrengths: ['Strong technical foundation', 'Leadership experience', 'Cross-functional collaboration'],
      marketValue
    };
  }, [yourScore]);

  const getMarketValueColor = (value: string) => {
    const colors = {
      premium: 'text-purple-600 bg-purple-50',
      high: 'text-green-600 bg-green-50',
      medium: 'text-blue-600 bg-blue-50',
      low: 'text-orange-600 bg-orange-50'
    };
    return colors[value as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="competitive-analysis bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Competitive Analysis</h2>
            <p className="text-sm text-gray-500">Market positioning and competitive advantages</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`text-center px-4 py-2 rounded-lg ${getMarketValueColor(marketPosition.marketValue)}`}>
            <div className="text-lg font-bold">{marketPosition.ranking}</div>
            <div className="text-sm capitalize">{marketPosition.marketValue} Value</div>
          </div>
          <button onClick={onToggle} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
            {expanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-6 space-y-8">
          {/* Market Position Overview */}
          <MarketPosition yourScore={yourScore} marketPosition={marketPosition} />

          {/* Competitor Comparison */}
          <CompetitiveMetrics yourScore={yourScore} competitorProfiles={competitorProfiles} />

          {/* Competitive Strengths vs Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Unique Strengths */}
            <div className="space-y-4">
              <h4 className="font-medium text-green-700 flex items-center space-x-2">
                <Award className="h-4 w-4" />
                <span>Your Competitive Advantages</span>
              </h4>
              <div className="space-y-2">
                {marketPosition.uniqueStrengths.map((strength, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">{strength}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      Differentiates you from {60 + index * 15}% of candidates
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Gaps */}
            <div className="space-y-4">
              <h4 className="font-medium text-orange-700 flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Areas to Strengthen</span>
              </h4>
              <div className="space-y-2">
                {marketPosition.competitiveGaps.map((gap, index) => (
                  <div key={index} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-700">{gap}</span>
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Common in top {25 - index * 5}% of candidates
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Intelligence */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Market Intelligence</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hiring Trends</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Remote work experience increasingly valued</li>
                  <li>• AI/ML skills showing 40% growth in demand</li>
                  <li>• Leadership with technical depth highly sought</li>
                  <li>• Cross-functional collaboration essential</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Competitive Positioning</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• You rank higher than 85% of similar profiles</li>
                  <li>• Strong technical + leadership combination rare</li>
                  <li>• Consider premium positioning in applications</li>
                  <li>• Salary negotiation potential: 15-25% above market</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Strategic Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Immediate Actions</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Emphasize leadership + technical combo</li>
                  <li>• Target senior-level positions</li>
                  <li>• Leverage competitive advantages</li>
                </ul>
              </div>
              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Medium-term Goals</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Build thought leadership presence</li>
                  <li>• Obtain relevant certifications</li>
                  <li>• Contribute to open source projects</li>
                </ul>
              </div>
              <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Long-term Strategy</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Position for executive roles</li>
                  <li>• Build industry network</li>
                  <li>• Develop speaking/mentoring profile</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};