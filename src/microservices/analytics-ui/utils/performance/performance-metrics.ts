/**
 * Performance metrics collection and monitoring system
 * Tracks template generation performance and user experience metrics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface TemplatePerformanceMetrics {
  templateId: string;
  generationTime: number;      // ms
  renderTime: number;          // ms
  cacheHit: boolean;
  memoryUsage: number;         // MB
  cpuTime: number;             // ms
  timestamp: number;
  userAgent: string;
  templateSize: number;        // bytes
  errorCount: number;
}

export interface WebVitalsMetrics {
  CLS: number | null;    // Cumulative Layout Shift
  FID: number | null;    // First Input Delay
  FCP: number | null;    // First Contentful Paint
  LCP: number | null;    // Largest Contentful Paint
  TTFB: number | null;   // Time to First Byte
  timestamp: number;
}

export interface PerformanceBudget {
  templateGeneration: number;  // Max generation time in ms
  renderTime: number;          // Max render time in ms
  memoryUsage: number;         // Max memory usage in MB
  bundleSize: number;          // Max bundle size in KB
  cacheHitRate: number;        // Min cache hit rate (0-1)
}

export class PerformanceMetrics {
  private templateMetrics: TemplatePerformanceMetrics[] = [];
  private webVitals: WebVitalsMetrics = {
    CLS: null,
    FID: null,
    FCP: null,
    LCP: null,
    TTFB: null,
    timestamp: Date.now()
  };
  
  private budget: PerformanceBudget = {
    templateGeneration: 2000,   // 2 seconds
    renderTime: 500,            // 500ms
    memoryUsage: 50,            // 50MB
    bundleSize: 100,            // 100KB
    cacheHitRate: 0.9           // 90%
  };
  
  private observers: PerformanceObserver[] = [];
  private metricsCallbacks: ((metrics: any) => void)[] = [];

  constructor() {
    this.initializeWebVitals();
    this.initializePerformanceObservers();
  }

  /**
   * Start tracking template generation performance
   */
  startTemplateGeneration(templateId: string): PerformanceTracker {
    return new PerformanceTracker(templateId, this);
  }

  /**
   * Record template performance metrics
   */
  recordTemplateMetrics(metrics: TemplatePerformanceMetrics): void {
    this.templateMetrics.push(metrics);
    
    // Limit history size
    if (this.templateMetrics.length > 1000) {
      this.templateMetrics = this.templateMetrics.slice(-500);
    }
    
    // Check against performance budget
    this.checkPerformanceBudget(metrics);
    
    // Emit to callbacks
    this.emitMetrics('template', metrics);
  }

  /**
   * Get template performance statistics
   */
  getTemplateStats(): {
    averageGeneration: number;
    averageRender: number;
    cacheHitRate: number;
    errorRate: number;
    totalTemplates: number;
    memoryUsage: {
      average: number;
      peak: number;
    };
    budgetCompliance: {
      generation: boolean;
      render: boolean;
      memory: boolean;
      cacheHit: boolean;
    };
  } {
    if (this.templateMetrics.length === 0) {
      return {
        averageGeneration: 0,
        averageRender: 0,
        cacheHitRate: 0,
        errorRate: 0,
        totalTemplates: 0,
        memoryUsage: { average: 0, peak: 0 },
        budgetCompliance: {
          generation: true,
          render: true,
          memory: true,
          cacheHit: true
        }
      };
    }

    const metrics = this.templateMetrics;
    const totalCount = metrics.length;
    
    const averageGeneration = metrics.reduce((sum, m) => sum + m.generationTime, 0) / totalCount;
    const averageRender = metrics.reduce((sum, m) => sum + m.renderTime, 0) / totalCount;
    const cacheHits = metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = cacheHits / totalCount;
    const errors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const errorRate = errors / totalCount;
    
    const memoryUsages = metrics.map(m => m.memoryUsage);
    const averageMemory = memoryUsages.reduce((sum, m) => sum + m, 0) / totalCount;
    const peakMemory = Math.max(...memoryUsages);
    
    return {
      averageGeneration,
      averageRender,
      cacheHitRate,
      errorRate,
      totalTemplates: totalCount,
      memoryUsage: {
        average: averageMemory,
        peak: peakMemory
      },
      budgetCompliance: {
        generation: averageGeneration <= this.budget.templateGeneration,
        render: averageRender <= this.budget.renderTime,
        memory: peakMemory <= this.budget.memoryUsage,
        cacheHit: cacheHitRate >= this.budget.cacheHitRate
      }
    };
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals };
  }

  /**
   * Get performance budget
   */
  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  /**
   * Update performance budget
   */
  setBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
  }

  /**
   * Subscribe to metrics updates
   */
  onMetrics(callback: (type: string, metrics: any) => void): void {
    this.metricsCallbacks.push(callback);
  }

  /**
   * Export performance data
   */
  exportData(): string {
    const data = {
      templateMetrics: this.templateMetrics,
      webVitals: this.webVitals,
      statistics: this.getTemplateStats(),
      budget: this.budget,
      exportTime: Date.now(),
      userAgent: navigator.userAgent
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.templateMetrics = [];
    this.webVitals = {
      CLS: null,
      FID: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      timestamp: Date.now()
    };
  }

  private initializeWebVitals(): void {
    // Collect Web Vitals metrics
    getCLS((metric) => {
      this.webVitals.CLS = metric.value;
      this.emitMetrics('webvitals', { type: 'CLS', value: metric.value });
    });

    getFID((metric) => {
      this.webVitals.FID = metric.value;
      this.emitMetrics('webvitals', { type: 'FID', value: metric.value });
    });

    getFCP((metric) => {
      this.webVitals.FCP = metric.value;
      this.emitMetrics('webvitals', { type: 'FCP', value: metric.value });
    });

    getLCP((metric) => {
      this.webVitals.LCP = metric.value;
      this.emitMetrics('webvitals', { type: 'LCP', value: metric.value });
    });

    getTTFB((metric) => {
      this.webVitals.TTFB = metric.value;
      this.emitMetrics('webvitals', { type: 'TTFB', value: metric.value });
    });
  }

  private initializePerformanceObservers(): void {
    if ('PerformanceObserver' in window) {
      // Navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.emitMetrics('navigation', entry);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('template') || entry.name.includes('css')) {
            this.emitMetrics('resource', entry);
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Measure timing
      const measureObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.emitMetrics('measure', entry);
        }
      });
      measureObserver.observe({ entryTypes: ['measure'] });
      this.observers.push(measureObserver);
    }
  }

  private checkPerformanceBudget(metrics: TemplatePerformanceMetrics): void {
    const violations: string[] = [];
    
    if (metrics.generationTime > this.budget.templateGeneration) {
      violations.push(`Generation time: ${metrics.generationTime}ms > ${this.budget.templateGeneration}ms`);
    }
    
    if (metrics.renderTime > this.budget.renderTime) {
      violations.push(`Render time: ${metrics.renderTime}ms > ${this.budget.renderTime}ms`);
    }
    
    if (metrics.memoryUsage > this.budget.memoryUsage) {
      violations.push(`Memory usage: ${metrics.memoryUsage}MB > ${this.budget.memoryUsage}MB`);
    }
    
    if (violations.length > 0) {
      console.warn(`Performance budget violations for template ${metrics.templateId}:`, violations);
      this.emitMetrics('budget_violation', { templateId: metrics.templateId, violations });
    }
  }

  private emitMetrics(type: string, metrics: any): void {
    this.metricsCallbacks.forEach(callback => {
      try {
        callback(type, metrics);
      } catch (error) {
        console.error('Error in metrics callback:', error);
      }
    });
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metricsCallbacks = [];
  }
}

/**
 * Performance tracker for individual template operations
 */
export class PerformanceTracker {
  private templateId: string;
  private metrics: PerformanceMetrics;
  private startTime: number;
  private renderStartTime: number | null = null;
  private memoryStart: number;
  private errorCount = 0;
  private cacheHit = false;

  constructor(templateId: string, metrics: PerformanceMetrics) {
    this.templateId = templateId;
    this.metrics = metrics;
    this.startTime = performance.now();
    this.memoryStart = this.getCurrentMemory();
    
    // Mark the start of template generation
    performance.mark(`template-generation-start-${templateId}`);
  }

  /**
   * Mark cache hit
   */
  markCacheHit(): void {
    this.cacheHit = true;
  }

  /**
   * Mark start of rendering
   */
  markRenderStart(): void {
    this.renderStartTime = performance.now();
    performance.mark(`template-render-start-${this.templateId}`);
  }

  /**
   * Record an error
   */
  recordError(): void {
    this.errorCount++;
  }

  /**
   * Complete tracking and record metrics
   */
  complete(templateSize = 0): void {
    const endTime = performance.now();
    const generationTime = endTime - this.startTime;
    const renderTime = this.renderStartTime ? endTime - this.renderStartTime : 0;
    const memoryEnd = this.getCurrentMemory();
    const memoryUsage = Math.max(0, memoryEnd - this.memoryStart);
    
    // Mark completion
    performance.mark(`template-generation-end-${this.templateId}`);
    performance.measure(
      `template-generation-${this.templateId}`,
      `template-generation-start-${this.templateId}`,
      `template-generation-end-${this.templateId}`
    );
    
    if (this.renderStartTime) {
      performance.mark(`template-render-end-${this.templateId}`);
      performance.measure(
        `template-render-${this.templateId}`,
        `template-render-start-${this.templateId}`,
        `template-render-end-${this.templateId}`
      );
    }

    // Record metrics
    const templateMetrics: TemplatePerformanceMetrics = {
      templateId: this.templateId,
      generationTime,
      renderTime,
      cacheHit: this.cacheHit,
      memoryUsage,
      cpuTime: generationTime, // Approximation
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      templateSize,
      errorCount: this.errorCount
    };

    this.metrics.recordTemplateMetrics(templateMetrics);
  }

  private getCurrentMemory(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / (1024 * 1024); // MB
    }
    return 0;
  }
}

/**
 * Global performance metrics instance
 */
export const performanceMetrics = new PerformanceMetrics();

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  // Set up metrics callbacks
  performanceMetrics.onMetrics((type, metrics) => {
    // Log important metrics
    if (type === 'template') {
      console.warn(`Template ${metrics.templateId} generated in ${metrics.generationTime}ms`);
    }
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_type: type,
        template_id: metrics.templateId || 'unknown',
        generation_time: metrics.generationTime,
        cache_hit: metrics.cacheHit
      });
    }
  });
  
  console.warn('Performance monitoring initialized');
}

/**
 * Utility to measure async operations
 */
export async function measureAsync<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  performance.mark(`${name}-start`);
  
  try {
    const result = await operation();
    const end = performance.now();
    const duration = end - start;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    console.warn(`${name} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = end - start;
    
    console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}