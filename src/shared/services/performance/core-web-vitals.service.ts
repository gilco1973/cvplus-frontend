/**
 * Core Web Vitals Service - Phase 6.3.1
 * 
 * Enhanced Web Vitals tracking with performance budgets and real-time alerting.
 * Monitors LCP, FID, CLS across all critical user journeys with automated
 * performance regression detection and optimization recommendations.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  userAgent: string;
}

export interface PerformanceBudget {
  metric: string;
  threshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  enabled: boolean;
}

export interface PerformanceBudgetViolation {
  budgetId: string;
  metric: string;
  actualValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  url: string;
  timestamp: number;
  sessionId: string;
}

class CoreWebVitalsService {
  private static instance: CoreWebVitalsService;
  private sessionId: string;
  private userId?: string;
  private budgets: Map<string, PerformanceBudget> = new Map();
  private isTracking = false;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeDefaultBudgets();
  }

  public static getInstance(): CoreWebVitalsService {
    if (!CoreWebVitalsService.instance) {
      CoreWebVitalsService.instance = new CoreWebVitalsService();
    }
    return CoreWebVitalsService.instance;
  }

  /**
   * Initialize performance tracking with user context
   */
  public initialize(userId?: string): void {
    this.userId = userId;
    this.startTracking();
  }

  /**
   * Start Core Web Vitals tracking
   */
  private startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;

    // Track Largest Contentful Paint
    getLCP((metric) => {
      this.handleMetric({
        name: 'LCP',
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        userAgent: navigator.userAgent
      });
    });

    // Track First Input Delay
    getFID((metric) => {
      this.handleMetric({
        name: 'FID',
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        userAgent: navigator.userAgent
      });
    });

    // Track Cumulative Layout Shift
    getCLS((metric) => {
      this.handleMetric({
        name: 'CLS',
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        userAgent: navigator.userAgent
      });
    });

    // Track First Contentful Paint
    getFCP((metric) => {
      this.handleMetric({
        name: 'FCP',
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        userAgent: navigator.userAgent
      });
    });

    // Track Time to First Byte
    getTTFB((metric) => {
      this.handleMetric({
        name: 'TTFB',
        value: metric.value,
        delta: metric.delta,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        userId: this.userId,
        sessionId: this.sessionId,
        deviceType: this.getDeviceType(),
        connectionType: this.getConnectionType(),
        userAgent: navigator.userAgent
      });
    });
  }

  /**
   * Handle individual metric collection and budget checking
   */
  private async handleMetric(metric: WebVitalsMetric): Promise<void> {
    try {
      // Store metric in Firestore
      await this.storeMetric(metric);
      
      // Check performance budgets
      await this.checkPerformanceBudgets(metric);
      
      // Real-time processing for critical metrics
      if (metric.rating === 'poor') {
        await this.handlePoorPerformance(metric);
      }
    } catch (error) {
      console.error('Error handling Web Vitals metric:', error);
    }
  }

  /**
   * Store metric in Firestore for analysis
   */
  private async storeMetric(metric: WebVitalsMetric): Promise<void> {
    const metricsRef = collection(db, 'performance_metrics');
    await addDoc(metricsRef, {
      ...metric,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  }

  /**
   * Check performance budgets and trigger alerts
   */
  private async checkPerformanceBudgets(metric: WebVitalsMetric): Promise<void> {
    const budget = this.budgets.get(metric.name);
    if (!budget || !budget.enabled) return;

    let violation: PerformanceBudgetViolation | null = null;

    if (metric.value > budget.criticalThreshold) {
      violation = {
        budgetId: `${metric.name}_critical`,
        metric: metric.name,
        actualValue: metric.value,
        threshold: budget.criticalThreshold,
        severity: 'critical',
        url: metric.url,
        timestamp: metric.timestamp,
        sessionId: metric.sessionId
      };
    } else if (metric.value > budget.warningThreshold) {
      violation = {
        budgetId: `${metric.name}_warning`,
        metric: metric.name,
        actualValue: metric.value,
        threshold: budget.warningThreshold,
        severity: 'warning',
        url: metric.url,
        timestamp: metric.timestamp,
        sessionId: metric.sessionId
      };
    }

    if (violation) {
      await this.handleBudgetViolation(violation);
    }
  }

  /**
   * Handle performance budget violations
   */
  private async handleBudgetViolation(violation: PerformanceBudgetViolation): Promise<void> {
    // Store violation for analysis
    const violationsRef = collection(db, 'performance_budget_violations');
    await addDoc(violationsRef, {
      ...violation,
      timestamp: serverTimestamp(),
      resolved: false
    });

    // Trigger real-time alert for critical violations
    if (violation.severity === 'critical') {
      await this.triggerCriticalAlert(violation);
    }
  }

  /**
   * Handle poor performance metrics
   */
  private async handlePoorPerformance(metric: WebVitalsMetric): Promise<void> {
    const performanceIssue = {
      type: 'poor_web_vital',
      metric: metric.name,
      value: metric.value,
      url: metric.url,
      timestamp: metric.timestamp,
      sessionId: metric.sessionId,
      userId: metric.userId,
      deviceContext: {
        deviceType: metric.deviceType,
        connectionType: metric.connectionType,
        userAgent: metric.userAgent
      }
    };

    // Store for immediate analysis
    const issuesRef = collection(db, 'performance_issues');
    await addDoc(issuesRef, {
      ...performanceIssue,
      timestamp: serverTimestamp(),
      status: 'open'
    });
  }

  /**
   * Trigger critical performance alert
   */
  private async triggerCriticalAlert(violation: PerformanceBudgetViolation): Promise<void> {
    const alertData = {
      type: 'performance_budget_violation',
      severity: violation.severity,
      metric: violation.metric,
      actualValue: violation.actualValue,
      threshold: violation.threshold,
      url: violation.url,
      timestamp: violation.timestamp,
      sessionId: violation.sessionId,
      requiresImmediate: true
    };

    // Send to alert management system
    await addDoc(collection(db, 'performance_alerts'), {
      ...alertData,
      timestamp: serverTimestamp(),
      acknowledged: false
    });
  }

  /**
   * Initialize default performance budgets
   */
  private initializeDefaultBudgets(): void {
    this.budgets.set('LCP', {
      metric: 'LCP',
      threshold: 2500,
      warningThreshold: 2000,
      criticalThreshold: 4000,
      enabled: true
    });

    this.budgets.set('FID', {
      metric: 'FID',
      threshold: 100,
      warningThreshold: 80,
      criticalThreshold: 300,
      enabled: true
    });

    this.budgets.set('CLS', {
      metric: 'CLS',
      threshold: 0.1,
      warningThreshold: 0.08,
      criticalThreshold: 0.25,
      enabled: true
    });

    this.budgets.set('FCP', {
      metric: 'FCP',
      threshold: 1800,
      warningThreshold: 1500,
      criticalThreshold: 3000,
      enabled: true
    });

    this.budgets.set('TTFB', {
      metric: 'TTFB',
      threshold: 800,
      warningThreshold: 600,
      criticalThreshold: 1800,
      enabled: true
    });
  }

  /**
   * Get device type based on user agent and screen size
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get connection type from Network Information API
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update performance budget configuration
   */
  public updateBudget(metric: string, budget: PerformanceBudget): void {
    this.budgets.set(metric, budget);
  }

  /**
   * Get current performance budgets
   */
  public getBudgets(): Map<string, PerformanceBudget> {
    return new Map(this.budgets);
  }

  /**
   * Stop tracking (cleanup)
   */
  public stopTracking(): void {
    this.isTracking = false;
  }
}

export default CoreWebVitalsService;