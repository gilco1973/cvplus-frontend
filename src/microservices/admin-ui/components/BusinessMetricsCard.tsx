import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Business Metrics Card Component
 * 
 * Displays key business intelligence metrics including revenue, conversions,
 * user growth, and performance indicators.
 */

interface BusinessMetricsData {
  timeRange: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  metrics: {
    users: {
      total: number;
      new: number;
      active: number;
      premium: number;
      growthRate: number;
      conversionToPremium: number;
      retentionRate: number;
    };
    revenue: {
      total: number;
      subscription: number;
      oneTime: number;
      mrr: number;
      arr: number;
      arpu: number;
      transactionCount: number;
      averageTransactionValue: number;
    };
    usage: {
      totalJobs: number;
      completedJobs: number;
      successRate: number;
      templateUsage: Record<string, number>;
    };
    conversion: {
      signupToPremium: number;
      trialToPaid: number;
      newPremiumUsers: number;
    };
  };
  summary: {
    totalUsers: number;
    newUsers: number;
    totalRevenue: number;
    mrr: number;
    conversionRate: number;
    successRate: number;
    keyInsight: string;
  };
  insights: Array<{
    type: string;
    priority: string;
    message: string;
    recommendation: string;
  }>;
  generatedAt: string;
}

interface BusinessMetricsCardProps {
  refreshTrigger: number;
}

export const BusinessMetricsCard: React.FC<BusinessMetricsCardProps> = ({ refreshTrigger }) => {
  const [metricsData, setMetricsData] = useState<BusinessMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchBusinessMetrics();
  }, [refreshTrigger, timeRange]);

  const fetchBusinessMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const functions = getFunctions();
      const getBusinessMetrics = httpsCallable(functions, 'getBusinessMetrics');

      const result = await getBusinessMetrics({ timeRange });
      const data = (result.data as any)?.data;

      if (data) {
        setMetricsData(data);
      } else {
        throw new Error('No business metrics data received');
      }
    } catch (error) {
      console.error('Error fetching business metrics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch business metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toFixed(2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      default:
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">📈</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Business Metrics
          </h3>
        </div>
        <div className="text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
        <button
          onClick={fetchBusinessMetrics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📈</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Business Metrics
          </h3>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {metricsData && (
        <div className="space-y-6">
          {/* Key Revenue Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(metricsData.metrics.revenue.total)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Revenue</div>
            </div>

            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(metricsData.metrics.revenue.mrr)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">MRR</div>
            </div>

            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metricsData.metrics.conversion.signupToPremium.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Conversion Rate</div>
            </div>

            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(metricsData.metrics.revenue.arpu)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">ARPU</div>
            </div>
          </div>

          {/* Usage & Performance */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                CV Generation Success Rate
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {metricsData.metrics.usage.successRate.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Total CV Generations
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatNumber(metricsData.metrics.usage.totalJobs)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                New Premium Users
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatNumber(metricsData.metrics.conversion.newPremiumUsers)}
              </span>
            </div>
          </div>

          {/* Progress Bar for Success Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Platform Performance
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {metricsData.metrics.usage.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metricsData.metrics.usage.successRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Key Insight */}
          {metricsData.summary.keyInsight && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400">💡</span>
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Key Insight
                </span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {metricsData.summary.keyInsight}
              </div>
            </div>
          )}

          {/* Business Insights */}
          {metricsData.insights && metricsData.insights.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Business Insights
              </div>
              {metricsData.insights.slice(0, 2).map((insight, index) => (
                <div 
                  key={index} 
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        getPriorityColor(insight.priority)
                      }`}>
                        {insight.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white mb-1">
                    {insight.message}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    💡 {insight.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Last Updated */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Period: {new Date(metricsData.period.start).toLocaleDateString()} - {new Date(metricsData.period.end).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessMetricsCard;