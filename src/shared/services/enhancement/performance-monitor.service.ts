/**
 * Performance Monitoring Service
 * 
 * Tracks and analyzes performance metrics for the CV enhancement process,
 * providing insights into feature generation times, success rates, and
 * system optimization opportunities.
 */

import { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface PerformanceMetrics {
  featureId: string;
  featureName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'started' | 'completed' | 'failed';
  error?: string;
  memoryUsage?: number;
  htmlSize?: number;
  retryCount?: number;
  userId: string;
  jobId: string;
  timestamp: number;
}

export interface PerformanceStats {
  averageDuration: number;
  successRate: number;
  totalFeatures: number;
  completedFeatures: number;
  failedFeatures: number;
  averageHtmlSize: number;
  averageRetryCount: number;
  performanceTrend: 'improving' | 'declining' | 'stable';
  bottleneckFeatures: string[];
}

export interface SystemPerformance {
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
  browserPerformance?: {
    renderTime: number;
    domInteractive: number;
    domComplete: number;
  };
}

export interface PerformanceReport {
  jobId: string;
  userId: string;
  totalDuration: number;
  overallSuccessRate: number;
  features: PerformanceMetrics[];
  systemMetrics: SystemPerformance;
  recommendations: string[];
  generatedAt: number;
}

export class PerformanceMonitorService {
  private activeMetrics: Map<string, PerformanceMetrics> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private systemMonitorInterval?: NodeJS.Timeout;

  /**
   * Start monitoring a feature's performance
   */
  startFeatureMonitoring(
    featureId: string,
    featureName: string,
    userId: string,
    jobId: string
  ): void {
    const metrics: PerformanceMetrics = {
      featureId,
      featureName,
      startTime: performance.now(),
      status: 'started',
      userId,
      jobId,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.activeMetrics.set(featureId, metrics);
    this.recordMemoryUsage(metrics);
    
    console.warn(`📊 Started monitoring: ${featureName}`);
  }

  /**
   * Complete monitoring for a feature
   */
  completeFeatureMonitoring(
    featureId: string,
    htmlFragment?: string,
    error?: string
  ): PerformanceMetrics | null {
    const metrics = this.activeMetrics.get(featureId);
    if (!metrics) {
      console.warn(`⚠️ No active monitoring found for feature: ${featureId}`);
      return null;
    }

    const endTime = performance.now();
    const completedMetrics: PerformanceMetrics = {
      ...metrics,
      endTime,
      duration: endTime - metrics.startTime,
      status: error ? 'failed' : 'completed',
      error,
      htmlSize: htmlFragment ? new Blob([htmlFragment]).size : undefined
    };

    this.recordMemoryUsage(completedMetrics);
    this.activeMetrics.delete(featureId);
    this.performanceHistory.push(completedMetrics);

    // Store in Firestore
    this.storePerformanceMetric(completedMetrics);

    console.warn(`📈 Completed monitoring: ${metrics.featureName} (${completedMetrics.duration?.toFixed(2)}ms)`);
    return completedMetrics;
  }

  /**
   * Record a retry attempt for a feature
   */
  recordRetryAttempt(featureId: string): void {
    const metrics = this.activeMetrics.get(featureId);
    if (metrics) {
      metrics.retryCount = (metrics.retryCount || 0) + 1;
      console.warn(`🔄 Retry recorded for ${metrics.featureName}: ${metrics.retryCount}`);
    }
  }

  /**
   * Record memory usage
   */
  private recordMemoryUsage(metrics: PerformanceMetrics): void {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = memInfo.usedJSHeapSize;
    }
  }

  /**
   * Store performance metrics in Firestore
   */
  private async storePerformanceMetric(metrics: PerformanceMetrics): Promise<void> {
    try {
      const metricsCollection = collection(db, 'performance_metrics');
      // Filter out undefined values for Firestore compatibility
      const cleanMetrics = Object.fromEntries(
        Object.entries(metrics).filter(([_, value]) => value !== undefined)
      );
      await addDoc(metricsCollection, {
        ...cleanMetrics,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error storing performance metrics:', error);
    }
  }

  /**
   * Generate performance statistics
   */
  generatePerformanceStats(jobId?: string): PerformanceStats {
    let relevantMetrics = this.performanceHistory;
    
    if (jobId) {
      relevantMetrics = this.performanceHistory.filter(m => m.jobId === jobId);
    }

    const completedMetrics = relevantMetrics.filter(m => m.status === 'completed');
    const failedMetrics = relevantMetrics.filter(m => m.status === 'failed');

    const averageDuration = completedMetrics.length > 0 
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length
      : 0;

    const successRate = relevantMetrics.length > 0 
      ? (completedMetrics.length / relevantMetrics.length) * 100
      : 0;

    const averageHtmlSize = completedMetrics
      .filter(m => m.htmlSize)
      .reduce((sum, m, _, arr) => sum + (m.htmlSize || 0) / arr.length, 0);

    const averageRetryCount = relevantMetrics.length > 0
      ? relevantMetrics.reduce((sum, m) => sum + (m.retryCount || 0), 0) / relevantMetrics.length
      : 0;

    // Identify bottleneck features (slowest average duration)
    const featureStats = this.groupMetricsByFeature(relevantMetrics);
    const bottleneckFeatures = Object.entries(featureStats)
      .sort(([,a], [,b]) => b.averageDuration - a.averageDuration)
      .slice(0, 3)
      .map(([featureId]) => featureId);

    const performanceTrend = this.calculatePerformanceTrend(relevantMetrics);

    return {
      averageDuration,
      successRate,
      totalFeatures: relevantMetrics.length,
      completedFeatures: completedMetrics.length,
      failedFeatures: failedMetrics.length,
      averageHtmlSize,
      averageRetryCount,
      performanceTrend,
      bottleneckFeatures
    };
  }

  /**
   * Group metrics by feature for analysis
   */
  private groupMetricsByFeature(metrics: PerformanceMetrics[]): Record<string, { averageDuration: number; successRate: number }> {
    const grouped: Record<string, PerformanceMetrics[]> = {};
    
    metrics.forEach(metric => {
      if (!grouped[metric.featureId]) {
        grouped[metric.featureId] = [];
      }
      grouped[metric.featureId].push(metric);
    });

    const result: Record<string, { averageDuration: number; successRate: number }> = {};
    
    Object.entries(grouped).forEach(([featureId, featureMetrics]) => {
      const completed = featureMetrics.filter(m => m.status === 'completed');
      const averageDuration = completed.length > 0
        ? completed.reduce((sum, m) => sum + (m.duration || 0), 0) / completed.length
        : 0;
      const successRate = (completed.length / featureMetrics.length) * 100;
      
      result[featureId] = { averageDuration, successRate };
    });

    return result;
  }

  /**
   * Calculate performance trend
   */
  private calculatePerformanceTrend(metrics: PerformanceMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 6) return 'stable'; // Need enough data points

    const sortedMetrics = metrics
      .filter(m => m.status === 'completed' && m.duration)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (sortedMetrics.length < 6) return 'stable';

    const half = Math.floor(sortedMetrics.length / 2);
    const firstHalf = sortedMetrics.slice(0, half);
    const secondHalf = sortedMetrics.slice(half);

    const firstHalfAvg = firstHalf.reduce((sum, m) => sum + (m.duration || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, m) => sum + (m.duration || 0), 0) / secondHalf.length;

    const improvement = (firstHalfAvg - secondHalfAvg) / firstHalfAvg;

    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }

  /**
   * Start system performance monitoring
   */
  startSystemMonitoring(): void {
    if (this.systemMonitorInterval) {
      clearInterval(this.systemMonitorInterval);
    }

    this.systemMonitorInterval = setInterval(() => {
      this.recordSystemMetrics();
    }, 5000); // Every 5 seconds

    console.warn('🖥️ Started system performance monitoring');
  }

  /**
   * Stop system performance monitoring
   */
  stopSystemMonitoring(): void {
    if (this.systemMonitorInterval) {
      clearInterval(this.systemMonitorInterval);
      this.systemMonitorInterval = undefined;
    }

    console.warn('🛑 Stopped system performance monitoring');
  }

  /**
   * Record current system metrics
   */
  private recordSystemMetrics(): SystemPerformance {
    const metrics: SystemPerformance = {};

    // Browser performance metrics
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      metrics.browserPerformance = {
        renderTime: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart
      };
    }

    // Memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memoryUsage = (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize) * 100;
    }

    // Network latency estimation
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.networkLatency = connection.rtt || 0;
    }

    return metrics;
  }

  /**
   * Generate comprehensive performance report
   */
  async generatePerformanceReport(jobId: string, userId: string): Promise<PerformanceReport> {
    const jobMetrics = this.performanceHistory.filter(m => m.jobId === jobId);
    const stats = this.generatePerformanceStats(jobId);
    const systemMetrics = this.recordSystemMetrics();

    const totalDuration = jobMetrics.length > 0
      ? Math.max(...jobMetrics.map(m => m.endTime || m.startTime)) - Math.min(...jobMetrics.map(m => m.startTime))
      : 0;

    const recommendations = this.generateRecommendations(stats, systemMetrics);

    const report: PerformanceReport = {
      jobId,
      userId,
      totalDuration,
      overallSuccessRate: stats.successRate,
      features: jobMetrics,
      systemMetrics,
      recommendations,
      generatedAt: Date.now()
    };

    // Store report in Firestore
    try {
      const reportRef = doc(db, 'performance_reports', `${jobId}_${Date.now()}`);
      // Filter out undefined values for Firestore compatibility
      const cleanReport = this.removeUndefinedValues(report);
      await setDoc(reportRef, {
        ...cleanReport,
        generatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error storing performance report:', error);
    }

    return report;
  }

  /**
   * Remove undefined values from objects for Firestore compatibility
   */
  private removeUndefinedValues(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefinedValues(item));
    }
    
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, this.removeUndefinedValues(value)])
    );
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(stats: PerformanceStats, systemMetrics: SystemPerformance): string[] {
    const recommendations: string[] = [];

    // Success rate recommendations
    if (stats.successRate < 90) {
      recommendations.push('Consider implementing additional error recovery mechanisms to improve success rate');
    }

    // Performance recommendations
    if (stats.averageDuration > 30000) { // 30 seconds
      recommendations.push('Feature generation times are high - consider optimizing processing algorithms');
    }

    // Memory recommendations
    if (systemMetrics.memoryUsage && systemMetrics.memoryUsage > 80) {
      recommendations.push('High memory usage detected - consider implementing memory optimization');
    }

    // Retry recommendations
    if (stats.averageRetryCount > 1) {
      recommendations.push('High retry rate indicates network or processing issues - investigate failure causes');
    }

    // HTML size recommendations
    if (stats.averageHtmlSize > 100000) { // 100KB
      recommendations.push('Large HTML fragments detected - consider implementing CSS optimization');
    }

    // Trend recommendations
    if (stats.performanceTrend === 'declining') {
      recommendations.push('Performance is declining over time - review recent changes and optimize critical paths');
    }

    // Bottleneck recommendations
    if (stats.bottleneckFeatures.length > 0) {
      recommendations.push(`Optimize slow features: ${stats.bottleneckFeatures.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Get historical performance data
   */
  async getHistoricalPerformance(userId: string, days = 30): Promise<PerformanceMetrics[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(db, 'performance_metrics'),
        where('userId', '==', userId),
        where('timestamp', '>=', cutoffDate.getTime()),
        orderBy('timestamp', 'desc'),
        limit(1000)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as PerformanceMetrics);
    } catch (error) {
      console.error('❌ Error fetching historical performance:', error);
      return [];
    }
  }

  /**
   * Clear local performance history
   */
  clearHistory(): void {
    this.performanceHistory = [];
    this.activeMetrics.clear();
    console.warn('🧹 Performance history cleared');
  }

  /**
   * Get current active monitoring sessions
   */
  getActiveMonitoring(): PerformanceMetrics[] {
    return Array.from(this.activeMetrics.values());
  }

  /**
   * Check if a feature is being monitored
   */
  isFeatureMonitored(featureId: string): boolean {
    return this.activeMetrics.has(featureId);
  }
}

export const performanceMonitorService = new PerformanceMonitorService();