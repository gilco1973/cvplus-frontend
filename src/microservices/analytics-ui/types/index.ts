/**
 * CVPlus Analytics UI Types
 *
 * TypeScript type definitions for analytics frontend components
 *
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
 */

// Dashboard Metrics
export interface DashboardMetrics {
  profileViews: number;
  uniqueVisitors: number;
  engagementRate: number;
  downloadCount: number;
  conversionRate: number;
  avgTimeOnProfile: number;
}

// Analytics Data
export interface AnalyticsData {
  metrics: DashboardMetrics;
  timeSeriesData: Array<{
    date: string;
    views: number;
    visitors: number;
    engagement: number;
  }>;
  demographicData: {
    geographic: Record<string, number>;
    devices: Record<string, number>;
    referrers: Record<string, number>;
  };
}

// Component Props
export interface AnalyticsDashboardProps {
  profileId?: string;
  dateRange?: '7d' | '30d' | '90d' | '1y';
  showExportOptions?: boolean;
  onMetricsUpdate?: (metrics: DashboardMetrics) => void;
  className?: string;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

// Real-time Metrics
export interface RealTimeMetrics {
  currentVisitors: number;
  currentSessions: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
}

// Geographic Insights
export interface GeographicData {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
  averageSessionDuration: number;
}

// Traffic Sources
export interface TrafficSource {
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  bounceRate: number;
  conversionRate: number;
}

// Content Performance
export interface ContentPerformance {
  pageTitle: string;
  pagePath: string;
  pageViews: number;
  uniquePageViews: number;
  averageTimeOnPage: number;
  exitRate: number;
}

// Reports
export interface ReportConfig {
  type: 'summary' | 'detailed' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  format: 'pdf' | 'csv' | 'json';
  scheduled?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

// Hook Return Types
export interface AnalyticsHookReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export interface RealTimeMetricsHookReturn {
  metrics: RealTimeMetrics | null;
  connected: boolean;
  error: Error | null;
  reconnect: () => void;
}

export interface ChartDataHookReturn {
  chartData: ChartData | null;
  loading: boolean;
  error: Error | null;
  updateData: (newData: any) => void;
}