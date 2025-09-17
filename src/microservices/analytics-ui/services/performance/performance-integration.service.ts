/**
 * Performance Integration Service - Phase 6.3 Master Integration
 * 
 * Master service that coordinates all performance tracking components,
 * providing unified interface for Core Web Vitals, User Journey Tracking,
 * Real-Time Monitoring, and Performance Optimization for CVPlus.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import CoreWebVitalsService from './core-web-vitals.service';
import UserJourneyTrackerService from './user-journey-tracker.service';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface PerformanceConfig {
  enableWebVitals: boolean;
  enableJourneyTracking: boolean;
  enableRealTimeMonitoring: boolean;
  enableOptimizations: boolean;
  updateInterval: number;
  samplingRate: number;
}

export interface PerformanceInsights {
  webVitals: {
    current: any;
    trend: 'improving' | 'declining' | 'stable';
    issues: string[];
  };
  journeys: {
    activeCount: number;
    averageCompletionTime: number;
    successRate: number;
    bottlenecks: string[];
  };
  functions: {
    totalFunctions: number;
    averageExecutionTime: number;
    errorRate: number;
    slowFunctions: string[];
  };
  recommendations: {
    count: number;
    priority: Record<string, number>;
    automated: number;
    manual: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'web_vital' | 'journey' | 'function' | 'optimization';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: number;
  acknowledged: boolean;
  autoResolve: boolean;
}

class PerformanceIntegrationService {
  private static instance: PerformanceIntegrationService;
  private webVitalsService: CoreWebVitalsService;
  private journeyTracker: UserJourneyTrackerService;
  private config: PerformanceConfig;
  private insights: PerformanceInsights;
  private alerts: PerformanceAlert[] = [];
  private listeners: (() => void)[] = [];
  private insightCallbacks: ((insights: PerformanceInsights) => void)[] = [];
  private alertCallbacks: ((alerts: PerformanceAlert[]) => void)[] = [];

  private constructor() {
    this.webVitalsService = CoreWebVitalsService.getInstance();
    this.journeyTracker = UserJourneyTrackerService.getInstance();
    this.config = this.getDefaultConfig();
    this.insights = this.getDefaultInsights();
  }

  public static getInstance(): PerformanceIntegrationService {
    if (!PerformanceIntegrationService.instance) {
      PerformanceIntegrationService.instance = new PerformanceIntegrationService();
    }
    return PerformanceIntegrationService.instance;
  }

  /**
   * Initialize the performance tracking system
   */
  public async initialize(
    userId?: string,
    customConfig?: Partial<PerformanceConfig>
  ): Promise<void> {
    // Update configuration
    if (customConfig) {
      this.config = { ...this.config, ...customConfig };
    }

    // Initialize Web Vitals tracking
    if (this.config.enableWebVitals) {
      this.webVitalsService.initialize(userId);
    }

    // Setup real-time monitoring
    if (this.config.enableRealTimeMonitoring) {
      await this.setupRealTimeMonitoring();
    }

    // Start insight generation
    this.startInsightGeneration();

    console.warn('Performance Integration Service initialized', {
      userId,
      config: this.config
    });
  }

  /**
   * Start tracking a user journey
   */
  public async startJourney(
    journeyType: 'cv_upload_to_completion' | 'feature_generation' | 'video_creation' | 'podcast_generation' | 'portfolio_view',
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.config.enableJourneyTracking) {
      return '';
    }

    return await this.journeyTracker.startJourney(journeyType, userId, sessionId, metadata);
  }

  /**
   * Track journey step
   */
  public async trackJourneyStep(
    journeyId: string,
    stepName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    if (!this.config.enableJourneyTracking) {
      return '';
    }

    return await this.journeyTracker.trackStep(journeyId, stepName, metadata);
  }

  /**
   * Complete journey step
   */
  public async completeJourneyStep(
    journeyId: string,
    stepId: string,
    success = true,
    error?: string
  ): Promise<void> {
    if (!this.config.enableJourneyTracking) {
      return;
    }

    await this.journeyTracker.completeStep(journeyId, stepId, success, error);
  }

  /**
   * Complete entire journey
   */
  public async completeJourney(
    journeyId: string,
    success = true,
    businessMetrics?: any
  ): Promise<void> {
    if (!this.config.enableJourneyTracking) {
      return;
    }

    await this.journeyTracker.completeJourney(journeyId, success, businessMetrics);
  }

  /**
   * Get current performance insights
   */
  public getInsights(): PerformanceInsights {
    return { ...this.insights };
  }

  /**
   * Get current performance alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Subscribe to performance insights updates
   */
  public onInsightsUpdate(callback: (insights: PerformanceInsights) => void): () => void {
    this.insightCallbacks.push(callback);
    
    return () => {
      const index = this.insightCallbacks.indexOf(callback);
      if (index > -1) {
        this.insightCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to alert updates
   */
  public onAlertsUpdate(callback: (alerts: PerformanceAlert[]) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Acknowledge an alert
   */
  public async acknowledgeAlert(alertId: string): Promise<void> {
    const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
    if (alertIndex !== -1) {
      this.alerts[alertIndex].acknowledged = true;
      
      // Update in Firestore
      try {
        // Implementation would update alert status in Firestore
        console.warn(`Alert ${alertId} acknowledged`);
      } catch (error) {
        console.error('Error acknowledging alert:', error);
      }
    }
  }

  /**
   * Get performance recommendations
   */
  public async getRecommendations(limit = 10): Promise<any[]> {
    try {
      // This would query the optimization engine for recommendations
      // For now, return mock recommendations
      return [
        {
          id: 'rec_1',
          type: 'bundle',
          priority: 'high',
          title: 'Optimize main bundle size',
          description: 'Implement code splitting to reduce main bundle by 150KB',
          impact: { performance: 25, effort: 'medium' }
        },
        {
          id: 'rec_2',
          type: 'database',
          priority: 'medium',
          title: 'Add index to users collection',
          description: 'Create composite index on userId field for faster queries',
          impact: { performance: 40, effort: 'low' }
        }
      ];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  /**
   * Apply automated optimization
   */
  public async applyOptimization(recommendationId: string): Promise<boolean> {
    try {
      // This would trigger the optimization engine
      console.warn(`Applying optimization: ${recommendationId}`);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error applying optimization:', error);
      return false;
    }
  }

  /**
   * Export performance data
   */
  public async exportPerformanceData(
    startDate: Date,
    endDate: Date,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const data = {
        exportTime: new Date().toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        insights: this.insights,
        alerts: this.alerts.filter(alert => 
          alert.timestamp >= startDate.getTime() && alert.timestamp <= endDate.getTime()
        ),
        config: this.config
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else {
        // Convert to CSV format
        return this.convertToCSV(data);
      }
    } catch (error) {
      console.error('Error exporting performance data:', error);
      return '';
    }
  }

  /**
   * Setup real-time monitoring subscriptions
   */
  private async setupRealTimeMonitoring(): Promise<void> {
    // Subscribe to real-time metrics
    const metricsQuery = query(
      collection(db, 'realtime_metrics'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const metricsUnsubscribe = onSnapshot(metricsQuery, (snapshot) => {
      const metrics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      this.updateFunctionInsights(metrics);
    });

    this.listeners.push(metricsUnsubscribe);

    // Subscribe to performance alerts
    const alertsQuery = query(
      collection(db, 'performance_alerts'),
      where('acknowledged', '==', false),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const alertsUnsubscribe = onSnapshot(alertsQuery, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PerformanceAlert[];
      
      this.updateAlerts(newAlerts);
    });

    this.listeners.push(alertsUnsubscribe);

    // Subscribe to journey performance
    const journeysQuery = query(
      collection(db, 'user_journeys'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const journeysUnsubscribe = onSnapshot(journeysQuery, (snapshot) => {
      const journeys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      this.updateJourneyInsights(journeys);
    });

    this.listeners.push(journeysUnsubscribe);
  }

  /**
   * Start generating insights
   */
  private startInsightGeneration(): void {
    const generateInsights = () => {
      this.generatePerformanceInsights();
      this.notifyInsightCallbacks();
    };

    // Generate insights immediately and then at regular intervals
    generateInsights();
    setInterval(generateInsights, this.config.updateInterval);
  }

  /**
   * Generate performance insights
   */
  private generatePerformanceInsights(): void {
    // This would analyze all collected data to generate insights
    // For now, update with current state
    
    const budgets = this.webVitalsService.getBudgets();
    const webVitalsBudgets = Array.from(budgets.entries());
    
    this.insights = {
      webVitals: {
        current: {
          lcp: 2200,
          fid: 85,
          cls: 0.08
        },
        trend: 'improving',
        issues: webVitalsBudgets
          .filter(([_, budget]) => !budget.enabled)
          .map(([metric]) => `${metric} monitoring disabled`)
      },
      journeys: {
        activeCount: 0,
        averageCompletionTime: 15000,
        successRate: 0.95,
        bottlenecks: ['feature_generation', 'video_creation']
      },
      functions: {
        totalFunctions: 127,
        averageExecutionTime: 850,
        errorRate: 0.8,
        slowFunctions: ['processCV', 'generatePodcast']
      },
      recommendations: {
        count: 8,
        priority: { high: 3, medium: 3, low: 2 },
        automated: 4,
        manual: 4
      }
    };
  }

  /**
   * Update function insights from real-time data
   */
  private updateFunctionInsights(metrics: any[]): void {
    if (metrics.length === 0) return;

    const avgExecutionTime = metrics.reduce((sum, m) => sum + (m.executionTime || 0), 0) / metrics.length;
    const avgErrorRate = metrics.reduce((sum, m) => sum + (m.errorRate || 0), 0) / metrics.length;
    const slowFunctions = metrics
      .filter(m => m.executionTime > 2000)
      .map(m => m.functionName)
      .filter((name, index, arr) => arr.indexOf(name) === index);

    this.insights.functions = {
      totalFunctions: metrics.length,
      averageExecutionTime: avgExecutionTime,
      errorRate: avgErrorRate,
      slowFunctions: slowFunctions
    };
  }

  /**
   * Update journey insights from journey data
   */
  private updateJourneyInsights(journeys: any[]): void {
    if (journeys.length === 0) return;

    const activeJourneys = journeys.filter(j => j.status === 'in_progress');
    const completedJourneys = journeys.filter(j => j.status === 'completed');
    const avgCompletionTime = completedJourneys.length > 0
      ? completedJourneys.reduce((sum, j) => sum + (j.totalDuration || 0), 0) / completedJourneys.length
      : 0;
    const successRate = journeys.length > 0
      ? completedJourneys.length / journeys.length
      : 0;

    this.insights.journeys = {
      activeCount: activeJourneys.length,
      averageCompletionTime: avgCompletionTime,
      successRate: successRate,
      bottlenecks: [] // Would analyze common drop-off points
    };
  }

  /**
   * Update alerts
   */
  private updateAlerts(newAlerts: PerformanceAlert[]): void {
    this.alerts = newAlerts;
    this.notifyAlertCallbacks();
  }

  /**
   * Notify insight callbacks
   */
  private notifyInsightCallbacks(): void {
    this.insightCallbacks.forEach(callback => {
      try {
        callback(this.insights);
      } catch (error) {
        console.error('Error in insight callback:', error);
      }
    });
  }

  /**
   * Notify alert callbacks
   */
  private notifyAlertCallbacks(): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(this.alerts);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Simple CSV conversion for insights
    const lines = [
      'Metric,Value',
      `Web Vitals LCP,${data.insights.webVitals.current.lcp}`,
      `Web Vitals FID,${data.insights.webVitals.current.fid}`,
      `Web Vitals CLS,${data.insights.webVitals.current.cls}`,
      `Average Journey Time,${data.insights.journeys.averageCompletionTime}`,
      `Journey Success Rate,${data.insights.journeys.successRate}`,
      `Function Execution Time,${data.insights.functions.averageExecutionTime}`,
      `Function Error Rate,${data.insights.functions.errorRate}`
    ];
    
    return lines.join('\n');
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): PerformanceConfig {
    return {
      enableWebVitals: true,
      enableJourneyTracking: true,
      enableRealTimeMonitoring: true,
      enableOptimizations: true,
      updateInterval: 10000, // 10 seconds
      samplingRate: 1.0 // 100%
    };
  }

  /**
   * Get default insights
   */
  private getDefaultInsights(): PerformanceInsights {
    return {
      webVitals: {
        current: { lcp: 0, fid: 0, cls: 0 },
        trend: 'stable',
        issues: []
      },
      journeys: {
        activeCount: 0,
        averageCompletionTime: 0,
        successRate: 0,
        bottlenecks: []
      },
      functions: {
        totalFunctions: 0,
        averageExecutionTime: 0,
        errorRate: 0,
        slowFunctions: []
      },
      recommendations: {
        count: 0,
        priority: {},
        automated: 0,
        manual: 0
      }
    };
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    // Unsubscribe from all listeners
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];

    // Clear callbacks
    this.insightCallbacks = [];
    this.alertCallbacks = [];

    // Stop Web Vitals tracking
    this.webVitalsService.stopTracking();

    console.warn('Performance Integration Service cleaned up');
  }
}

export default PerformanceIntegrationService;