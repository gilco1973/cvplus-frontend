/**
 * Multimedia Analytics Dashboard Component
 * 
 * Comprehensive analytics dashboard for multimedia content performance,
 * user engagement tracking, cost analysis, and business intelligence
 * across all multimedia features and providers.
 * 
 * Features:
 * - Real-time engagement metrics and user behavior analytics
 * - Cost analysis and ROI tracking for multimedia features
 * - Provider performance comparison and optimization insights
 * - Content performance analytics and recommendations
 * - Revenue tracking for premium multimedia features
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  BarChart3,
  DollarSign,
  Download,
  Eye,
  Filter,
  LineChart,
  Play,
  Share2,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
  Volume2
} from 'lucide-react';

// Analytics data interfaces
interface EngagementMetrics {
  views: number;
  uniqueViews: number;
  totalWatchTime: number;
  averageWatchTime: number;
  completionRate: number;
  shareCount: number;
  downloadCount: number;
  likeCount: number;
  engagementRate: number;
}

interface ContentAnalytics {
  contentId: string;
  contentType: 'video' | 'audio' | 'podcast' | 'image' | 'gallery';
  title: string;
  createdAt: Date;
  engagement: EngagementMetrics;
  performance: {
    qualityScore: number;
    loadTime: number;
    errorRate: number;
    conversionRate: number;
  };
  cost: {
    generation: number;
    storage: number;
    delivery: number;
    total: number;
  };
  revenue: {
    direct: number;
    attributed: number;
    lifetime: number;
  };
}

interface ProviderPerformanceData {
  providerId: string;
  providerName: string;
  totalJobs: number;
  successRate: number;
  averageQuality: number;
  averageSpeed: number;
  totalCost: number;
  userSatisfaction: number;
  trend: 'up' | 'down' | 'stable';
  metrics: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

interface UserBehaviorData {
  userId?: string;
  sessionId: string;
  actions: Array<{
    timestamp: Date;
    action: 'view' | 'play' | 'pause' | 'seek' | 'share' | 'download' | 'like';
    contentId: string;
    duration?: number;
    position?: number;
  }>;
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  };
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
}

interface RevenueData {
  period: string;
  subscription: number;
  payPerUse: number;
  premium: number;
  total: number;
  costs: number;
  profit: number;
  roi: number;
}

interface MultimediaAnalyticsDashboardProps {
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y';
  contentFilter?: string[];
  userFilter?: string;
  showRealTime?: boolean;
  showRevenue?: boolean;
  showCosts?: boolean;
  exportEnabled?: boolean;
  className?: string;
}

export const MultimediaAnalyticsDashboard: React.FC<MultimediaAnalyticsDashboardProps> = ({
  timeRange = '30d',
  contentFilter = [],
  userFilter,
  showRealTime = true,
  showRevenue = true,
  showCosts = true,
  exportEnabled = true,
  className = ""
}) => {
  // State management
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalytics[]>([]);
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformanceData[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'performance' | 'cost' | 'revenue'>('engagement');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState(showRealTime);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
    
    if (realTimeUpdates) {
      const interval = setInterval(loadAnalyticsData, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [selectedTimeRange, contentFilter, userFilter, realTimeUpdates]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [contentRes, providerRes, behaviorRes, revenueRes] = await Promise.all([
        fetch(`/api/analytics/content?timeRange=${selectedTimeRange}&filter=${contentFilter.join(',')}`),
        fetch(`/api/analytics/providers?timeRange=${selectedTimeRange}`),
        fetch(`/api/analytics/behavior?timeRange=${selectedTimeRange}&user=${userFilter || ''}`),
        showRevenue ? fetch(`/api/analytics/revenue?timeRange=${selectedTimeRange}`) : Promise.resolve(null)
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContentAnalytics(contentData);
      }

      if (providerRes.ok) {
        const providerData = await providerRes.json();
        setProviderPerformance(providerData);
      }

      if (behaviorRes.ok) {
        const behaviorData = await behaviorRes.json();
        setUserBehavior(behaviorData);
      }

      if (revenueRes && revenueRes.ok) {
        const revData = await revenueRes.json();
        setRevenueData(revData);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (!contentAnalytics.length) return null;

    const totalViews = contentAnalytics.reduce((sum, content) => sum + content.engagement.views, 0);
    const totalWatchTime = contentAnalytics.reduce((sum, content) => sum + content.engagement.totalWatchTime, 0);
    const totalCost = contentAnalytics.reduce((sum, content) => sum + content.cost.total, 0);
    const totalRevenue = contentAnalytics.reduce((sum, content) => sum + content.revenue.total, 0);
    const averageQuality = contentAnalytics.reduce((sum, content) => sum + content.performance.qualityScore, 0) / contentAnalytics.length;
    const averageEngagement = contentAnalytics.reduce((sum, content) => sum + content.engagement.engagementRate, 0) / contentAnalytics.length;

    return {
      totalViews,
      totalWatchTime,
      totalCost,
      totalRevenue,
      profit: totalRevenue - totalCost,
      roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0,
      averageQuality,
      averageEngagement,
      contentCount: contentAnalytics.length
    };
  }, [contentAnalytics]);

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?timeRange=${selectedTimeRange}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentFilter,
          userFilter,
          metrics: [selectedMetric]
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `multimedia-analytics-${selectedTimeRange}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  const renderKPICards = () => {
    if (!aggregateMetrics) return null;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Total Views</div>
            <Eye className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {aggregateMetrics.totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Watch Time</div>
            <Play className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(aggregateMetrics.totalWatchTime / 3600).toLocaleString()}h
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Engagement</div>
            <Activity className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {aggregateMetrics.averageEngagement.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Avg Quality</div>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {aggregateMetrics.averageQuality.toFixed(1)}/10
          </div>
        </div>

        {showCosts && (
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Total Cost</div>
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${aggregateMetrics.totalCost.toFixed(2)}
            </div>
          </div>
        )}

        {showRevenue && (
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">ROI</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {aggregateMetrics.roi > 0 ? '+' : ''}{aggregateMetrics.roi.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContentPerformanceTable = () => (
    <div className="bg-white rounded-lg border overflow-hidden mb-8">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Content Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              {showRevenue && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contentAnalytics.slice(0, 10).map(content => (
              <tr key={content.contentId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded flex items-center justify-center">
                      {content.contentType === 'video' ? <Video className="h-4 w-4" /> :
                       content.contentType === 'audio' ? <Volume2 className="h-4 w-4" /> :
                       <Eye className="h-4 w-4" />}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {content.title.length > 30 ? content.title.substring(0, 30) + '...' : content.title}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">{content.contentType}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {content.engagement.views.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${
                          content.engagement.engagementRate > 50 ? 'bg-green-500' :
                          content.engagement.engagementRate > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(content.engagement.engagementRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {content.engagement.engagementRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {content.performance.qualityScore.toFixed(1)}/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${content.cost.total.toFixed(2)}
                </td>
                {showRevenue && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    ${content.revenue.total.toFixed(2)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProviderComparison = () => (
    <div className="bg-white rounded-lg border p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Performance</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providerPerformance.map(provider => (
          <div key={provider.providerId} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">{provider.providerName}</h4>
              <div className="flex items-center">
                {provider.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : provider.trend === 'down' ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <Activity className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium">{provider.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Quality:</span>
                <span className="font-medium">{provider.averageQuality.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Jobs:</span>
                <span className="font-medium">{provider.totalJobs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-medium">${provider.totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Satisfaction:</span>
                <span className="font-medium">{provider.userSatisfaction.toFixed(1)}/10</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Growth:</span>
                <span className={`font-medium ${
                  provider.metrics.growth > 0 ? 'text-green-600' : 
                  provider.metrics.growth < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {provider.metrics.growth > 0 ? '+' : ''}{provider.metrics.growth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading && !contentAnalytics.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gray-50 min-h-screen ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Multimedia Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive analytics for multimedia content performance and business intelligence
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              
              {exportEnabled && (
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              )}
              
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  realTimeUpdates 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <Activity className="h-4 w-4 mr-2" />
                Real-time
              </button>
            </div>
          </div>

          {/* Metric Selector */}
          <div className="flex space-x-2">
            {['engagement', 'performance', 'cost', 'revenue'].map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric as any)}
                className={`px-4 py-2 text-sm rounded-lg capitalize ${
                  selectedMetric === metric
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {renderKPICards()}
        {renderContentPerformanceTable()}
        {renderProviderComparison()}
      </div>
    </div>
  );
};

export default MultimediaAnalyticsDashboard;