import React from 'react';
import { BarChart3, Target, CheckCircle2, Clock, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import type { RecommendationItem } from '../hooks/useRoleRecommendations';

interface RecommendationStatsProps {
  recommendations: RecommendationItem[];
  isLoading?: boolean;
  lastUpdated?: Date;
}

interface Statistics {
  total: number;
  selected: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  selectedByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  selectionPercentage: number;
  estimatedTotalImpact: number;
  selectedImpact: number;
}

export const RecommendationStats: React.FC<RecommendationStatsProps> = ({
  recommendations,
  isLoading = false,
  lastUpdated
}) => {
  // Calculate statistics
  const stats: Statistics = React.useMemo(() => {
    const total = recommendations.length;
    const selected = recommendations.filter(rec => rec.selected).length;
    
    const byPriority = {
      high: recommendations.filter(rec => rec.priority === 'high').length,
      medium: recommendations.filter(rec => rec.priority === 'medium').length,
      low: recommendations.filter(rec => rec.priority === 'low').length
    };
    
    const selectedByPriority = {
      high: recommendations.filter(rec => rec.priority === 'high' && rec.selected).length,
      medium: recommendations.filter(rec => rec.priority === 'medium' && rec.selected).length,
      low: recommendations.filter(rec => rec.priority === 'low' && rec.selected).length
    };

    const estimatedTotalImpact = recommendations.reduce(
      (sum, rec) => sum + (rec.estimatedScoreImprovement || 0), 
      0
    );

    const selectedImpact = recommendations
      .filter(rec => rec.selected)
      .reduce((sum, rec) => sum + (rec.estimatedScoreImprovement || 0), 0);

    return {
      total,
      selected,
      byPriority,
      selectedByPriority,
      selectionPercentage: total > 0 ? Math.round((selected / total) * 100) : 0,
      estimatedTotalImpact,
      selectedImpact
    };
  }, [recommendations]);

  const priorityConfig = {
    high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: AlertTriangle, color: 'text-red-600' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock, color: 'text-yellow-600' },
    low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle2, color: 'text-green-600' }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Statistics will appear when recommendations are available</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Recommendations Overview</h3>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
          <div className="text-sm text-blue-700">Total</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{stats.selected}</div>
          <div className="text-sm text-green-700">Selected</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">{stats.selectionPercentage}%</div>
          <div className="text-sm text-purple-700">Coverage</div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span className="text-2xl font-bold text-amber-900">+{stats.selectedImpact}</span>
          </div>
          <div className="text-sm text-amber-700">Est. Points</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Priority Breakdown
        </h4>
        
        <div className="space-y-3">
          {(['high', 'medium', 'low'] as const).map(priority => {
            const total = stats.byPriority[priority];
            const selected = stats.selectedByPriority[priority];
            const percentage = total > 0 ? (selected / total) * 100 : 0;
            const config = priorityConfig[priority];
            const IconComponent = config.icon;

            if (total === 0) return null;

            return (
              <div key={priority} className={`border rounded-lg p-3 ${config.border} ${config.bg}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                    <span className={`font-medium capitalize ${config.text}`}>
                      {priority} Priority
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${config.text}`}>
                    {selected}/{total} selected
                  </div>
                </div>
                
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      priority === 'high' ? 'bg-red-500' :
                      priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className={`text-xs ${config.text} mt-1`}>
                  {Math.round(percentage)}% completed
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impact Summary */}
      {stats.estimatedTotalImpact > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-900">Impact Potential</h4>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              Selected: <span className="font-semibold text-blue-600">+{stats.selectedImpact} points</span>
            </span>
            <span className="text-gray-500">
              Total Available: +{stats.estimatedTotalImpact} points
            </span>
          </div>
          
          <div className="mt-2">
            <div className="w-full bg-white rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.estimatedTotalImpact > 0 ? (stats.selectedImpact / stats.estimatedTotalImpact) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};