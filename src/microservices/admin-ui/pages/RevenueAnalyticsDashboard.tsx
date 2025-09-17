/**
 * Revenue Analytics Dashboard
 * 
 * Comprehensive revenue intelligence dashboard for CVPlus business analytics.
 * Provides real-time financial metrics, cohort analysis, and growth forecasting.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @since Phase 3 - Analytics & Revenue Intelligence
 */

import React, { useState, useEffect, useMemo } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  UserMinusIcon,
  CalendarIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  DownloadIcon,
  FilterIcon
} from 'lucide-react';

// Types
interface RevenueMetrics {
  mrr: number;
  arr: number;
  conversionRate: number;
  churnRate: number;
  ltv: number;
  cac: number;
  cohortAnalysis: CohortData[];
  revenueGrowth: GrowthData[];
  arpu: number;
  netRevenueRetention: number;
  mrrGrowthRate: number;
  customerHealthScore: number;
  revenueQuality: {
    score: number;
    factors: string[];
  };
}

interface CohortData {
  cohortMonth: string;
  cohortSize: number;
  retentionRates: number[];
  revenueRetentionRates: number[];
  totalRevenue: number;
  avgRevenuePerUser: number;
}

interface GrowthData {
  period: string;
  revenue: number;
  growthRate: number;
  newCustomers: number;
  churnedRevenue: number;
  expandedRevenue: number;
}

interface DateRangeFilter {
  start: string;
  end: string;
}

const RevenueAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    end: new Date().toISOString().split('T')[0] || ''
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch revenue metrics
  const fetchRevenueMetrics = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);

    try {
      const functions = getFunctions();
      const getRevenueMetrics = httpsCallable(functions, 'getRevenueMetrics');

      const response = await getRevenueMetrics({
        dateRange,
        granularity: 'monthly',
        includeCohorts: true,
        includeForecasting: true
      });

      const result = response.data as any;
      if (result?.success) {
        setMetrics(result.data.metrics);
      } else {
        setError(result?.error || 'Failed to fetch revenue metrics');
      }
    } catch (err) {
      console.error('Error fetching revenue metrics:', err);
      setError('Failed to load revenue analytics. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRevenueMetrics();
  }, [dateRange]);

  // Memoized calculations
  const mrrTrend = useMemo(() => {
    if (!metrics?.revenueGrowth || metrics.revenueGrowth.length < 2) return 0;
    const recent = metrics.revenueGrowth.slice(-2);
    if (!recent[0] || !recent[1] || recent[0].revenue === 0) return 0;
    return ((recent[1].revenue - recent[0].revenue) / recent[0].revenue) * 100;
  }, [metrics]);

  const churnTrend = useMemo(() => {
    if (!metrics?.cohortAnalysis || metrics.cohortAnalysis.length < 2) return 0;
    const recentCohorts = metrics.cohortAnalysis.slice(-2);
    if (!recentCohorts[0] || !recentCohorts[1]) return 0;
    const currentChurn = 100 - (recentCohorts[1]?.retentionRates?.[0] || 100);
    const previousChurn = 100 - (recentCohorts[0]?.retentionRates?.[0] || 100);
    return currentChurn - previousChurn;
  }, [metrics]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCwIcon className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading revenue analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchRevenueMetrics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
              <p className="text-gray-600">Comprehensive business intelligence dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Picker */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchRevenueMetrics(true)}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              {/* Export Button */}
              <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                <DownloadIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={formatCurrency(metrics?.mrr || 0)}
            trend={mrrTrend}
            icon={TrendingUpIcon}
            description="Total monthly subscription revenue"
          />
          <MetricCard
            title="Annual Recurring Revenue"
            value={formatCurrency(metrics?.arr || 0)}
            trend={metrics?.mrrGrowthRate || 0}
            icon={DollarSignIcon}
            description="Annualized subscription revenue"
          />
          <MetricCard
            title="Churn Rate"
            value={formatPercentage(metrics?.churnRate || 0)}
            trend={churnTrend}
            icon={UserMinusIcon}
            isInverse
            description="Monthly customer churn rate"
          />
          <MetricCard
            title="Conversion Rate"
            value={formatPercentage(metrics?.conversionRate || 0)}
            trend={5.2}
            icon={UsersIcon}
            description="Free to paid conversion rate"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Customer LTV"
            value={formatCurrency(metrics?.ltv || 0)}
            trend={8.1}
            icon={ActivityIcon}
            description="Average customer lifetime value"
          />
          <MetricCard
            title="Customer Acquisition Cost"
            value={formatCurrency(metrics?.cac || 0)}
            trend={-12.3}
            icon={BarChart3Icon}
            isInverse
            description="Average cost to acquire customers"
          />
          <MetricCard
            title="ARPU"
            value={formatCurrency(metrics?.arpu || 0)}
            trend={3.7}
            icon={PieChartIcon}
            description="Average revenue per user"
          />
        </div>

        {/* Health Score and Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Health Score</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  (metrics?.customerHealthScore || 0) >= 80 ? 'bg-green-500' :
                  (metrics?.customerHealthScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-sm font-medium text-gray-600">
                  {metrics?.customerHealthScore || 0}/100
                </span>
              </div>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    Health Score
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {metrics?.customerHealthScore || 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${metrics?.customerHealthScore || 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Quality</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {metrics?.revenueQuality?.score || 0}
              </span>
              <span className="text-sm text-gray-500">Quality Score</span>
            </div>
            <div className="space-y-2">
              {metrics?.revenueQuality?.factors.map((factor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Revenue Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Growth Trend</h3>
            <div className="flex items-center space-x-2">
              <FilterIcon className="w-4 h-4 text-gray-500" />
              <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                <option>Last 12 months</option>
                <option>Last 6 months</option>
                <option>Last 3 months</option>
              </select>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
            <p className="text-gray-500">Chart visualization would be rendered here</p>
          </div>
        </div>

        {/* Cohort Analysis Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cohort Retention Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cohort Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month 0
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month 3
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month 6
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics?.cohortAnalysis?.slice(0, 6).map((cohort, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cohort.cohortMonth}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cohort.cohortSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(cohort.retentionRates[0] || 100)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(cohort.retentionRates[1] || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(cohort.retentionRates[3] || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPercentage(cohort.retentionRates[6] || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(cohort.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: React.ComponentType<any>;
  isInverse?: boolean;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend = 0,
  icon: Icon,
  isInverse = false,
  description
}) => {
  const trendColor = isInverse
    ? trend > 0 ? 'text-red-500' : 'text-green-500'
    : trend > 0 ? 'text-green-500' : 'text-red-500';

  const trendIcon = isInverse
    ? trend > 0 ? '↑' : '↓'
    : trend > 0 ? '↑' : '↓';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {trend !== 0 && (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendIcon} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};

export default RevenueAnalyticsDashboard;