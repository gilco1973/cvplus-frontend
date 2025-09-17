/**
 * Market Position Component
 * Shows overall market positioning and percentile ranking
 */

import React, { useMemo } from 'react';

interface MarketPosition {
  percentile: number;
  ranking: string;
  competitiveGaps: string[];
  uniqueStrengths: string[];
  marketValue: 'low' | 'medium' | 'high' | 'premium';
}

interface MarketPositionProps {
  yourScore: number;
  marketPosition: MarketPosition;
}

export const MarketPosition: React.FC<MarketPositionProps> = ({
  yourScore,
  marketPosition
}) => {
  const getMarketValueColor = (value: string) => {
    const colors = {
      premium: 'text-purple-600 bg-purple-50',
      high: 'text-green-600 bg-green-50',
      medium: 'text-blue-600 bg-blue-50',
      low: 'text-orange-600 bg-orange-50'
    };
    return colors[value as keyof typeof colors] || colors.medium;
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-purple-600';
    if (percentile >= 75) return 'text-green-600';
    if (percentile >= 50) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Market Position</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getPercentileColor(marketPosition.percentile)}`}>
            {Math.round(marketPosition.percentile)}th
          </div>
          <div className="text-sm text-gray-600">Percentile</div>
          <div className="text-xs text-gray-500 mt-1">
            Better than {Math.round(marketPosition.percentile)}% of candidates
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{yourScore}</div>
          <div className="text-sm text-gray-600">Your Score</div>
          <div className="text-xs text-gray-500 mt-1">
            Market average: 75
          </div>
        </div>
        <div className="text-center">
          <div className={`text-xl font-bold px-3 py-1 rounded-lg ${getMarketValueColor(marketPosition.marketValue)}`}>
            {marketPosition.marketValue.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Market Value</div>
          <div className="text-xs text-gray-500 mt-1">
            Based on skills and experience
          </div>
        </div>
      </div>
    </div>
  );
};