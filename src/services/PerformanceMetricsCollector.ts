/**
 * T046: Performance metrics collector with comprehensive monitoring
 *
 * Advanced performance monitoring system that tracks Core Web Vitals,
 * custom metrics, resource loading, API performance, and user experience
 * metrics in real-time with automated analysis and alerting.
 */

import { logger } from '../utils/logger';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: PerformanceCategory;
  type: MetricType;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export enum PerformanceCategory {
  WEB_VITALS = 'web_vitals',
  RESOURCE_LOADING = 'resource_loading',
  API_PERFORMANCE = 'api_performance',
  RENDERING = 'rendering',
  MEMORY = 'memory',
  NETWORK = 'network',
  USER_INTERACTION = 'user_interaction',
  CUSTOM = 'custom'
}

export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMING = 'timing',
  PERCENTAGE = 'percentage'
}

export interface WebVitalMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  inp: number | null; // Interaction to Next Paint
}

export interface ResourceMetrics {
  name: string;
  type: string;
  size: number;
  loadTime: number;
  transferSize: number;
  cached: boolean;
}

export interface APIPerformanceMetrics {
  url: string;
  method: string;
  statusCode: number;
  duration: number;
  responseSize: number;
  error?: string;
}

export interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  memoryPressure: 'low' | 'medium' | 'high';
}

export interface UserInteractionMetrics {
  type: 'click' | 'scroll' | 'input' | 'navigation';
  element?: string;
  duration?: number;
  timestamp: Date;
}

export interface PerformanceReport {
  id: string;
  timestamp: Date;
  webVitals: WebVitalMetrics;
  resources: ResourceMetrics[];
  apiCalls: APIPerformanceMetrics[];
  memory: MemoryMetrics | null;
  userInteractions: UserInteractionMetrics[];
  customMetrics: PerformanceMetric[];
  pageInfo: {
    url: string;
    title: string;
    referrer: string;
    loadTime: number;
  };
  deviceInfo: {
    userAgent: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    connectionType?: string;
    effectiveType?: string;
  };
  performanceScore: {
    overall: number;
    webVitals: number;
    loading: number;
    interactivity: number;
    reliability: number;
  };
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

export class PerformanceMetricsCollector {
  private readonly metrics: PerformanceMetric[] = [];
  private readonly webVitals: Partial<WebVitalMetrics> = {};
  private readonly resourceMetrics: ResourceMetrics[] = [];
  private readonly apiMetrics: APIPerformanceMetrics[] = [];
  private readonly userInteractions: UserInteractionMetrics[] = [];
  private readonly customMetrics: PerformanceMetric[] = [];

  private observer?: PerformanceObserver;
  private intersectionObserver?: IntersectionObserver;
  private mutationObserver?: MutationObserver;

  private readonly thresholds: PerformanceThreshold[] = [
    { metric: 'LCP', warning: 2500, critical: 4000, unit: 'ms' },
    { metric: 'FID', warning: 100, critical: 300, unit: 'ms' },
    { metric: 'CLS', warning: 0.1, critical: 0.25, unit: 'score' },
    { metric: 'FCP', warning: 1800, critical: 3000, unit: 'ms' },
    { metric: 'TTFB', warning: 800, critical: 1800, unit: 'ms' },
    { metric: 'INP', warning: 200, critical: 500, unit: 'ms' }
  ];

  private reportingInterval?: number;
  private isCollecting = false;

  constructor(
    private readonly config: {
      autoStart?: boolean;
      reportInterval?: number; // milliseconds
      maxMetrics?: number;
      enableWebVitals?: boolean;
      enableResourceTracking?: boolean;
      enableAPITracking?: boolean;
      enableUserInteractionTracking?: boolean;
      enableMemoryTracking?: boolean;
      sendReports?: boolean;
    } = {}
  ) {
    this.config = {
      autoStart: true,
      reportInterval: 30000, // 30 seconds
      maxMetrics: 1000,
      enableWebVitals: true,
      enableResourceTracking: true,
      enableAPITracking: true,
      enableUserInteractionTracking: true,
      enableMemoryTracking: true,
      sendReports: true,
      ...config
    };

    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isCollecting) return;

    this.isCollecting = true;

    logger.logEvent('performance.monitoring_started', {
      timestamp: new Date().toISOString(),
      config: this.config
    });

    // Initialize Web Vitals monitoring
    if (this.config.enableWebVitals) {
      this.initializeWebVitalsMonitoring();
    }

    // Initialize resource monitoring
    if (this.config.enableResourceTracking) {
      this.initializeResourceMonitoring();
    }

    // Initialize API monitoring
    if (this.config.enableAPITracking) {
      this.initializeAPIMonitoring();
    }

    // Initialize user interaction monitoring
    if (this.config.enableUserInteractionTracking) {
      this.initializeUserInteractionMonitoring();
    }

    // Initialize memory monitoring
    if (this.config.enableMemoryTracking) {
      this.initializeMemoryMonitoring();
    }

    // Start periodic reporting
    if (this.config.sendReports && this.config.reportInterval) {
      this.startPeriodicReporting();
    }

    // Set up page visibility change handler
    this.initializePageVisibilityHandling();
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isCollecting) return;

    this.isCollecting = false;

    // Generate final report
    if (this.config.sendReports) {
      this.generateAndSendReport();
    }

    // Clean up observers
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    // Clear reporting interval
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = undefined;
    }

    logger.logEvent('performance.monitoring_stopped', {
      timestamp: new Date().toISOString(),
      metricsCollected: this.metrics.length
    });
  }

  /**
   * Add a custom performance metric
   */
  addMetric(
    name: string,
    value: number,
    unit: string = 'ms',
    category: PerformanceCategory = PerformanceCategory.CUSTOM,
    type: MetricType = MetricType.TIMING,
    tags?: Record<string, string>,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      name,
      value,
      unit,
      timestamp: new Date(),
      category,
      type,
      tags,
      metadata
    };

    this.metrics.push(metric);
    this.customMetrics.push(metric);

    // Trim metrics if needed
    this.trimMetricsIfNeeded();

    // Check thresholds
    this.checkThresholds(metric);

    // Log metric
    logger.trackPerformance(name, value, unit);
  }

  /**
   * Track API call performance
   */
  trackAPICall(
    url: string,
    method: string,
    statusCode: number,
    duration: number,
    responseSize: number = 0,
    error?: string
  ): void {
    const apiMetric: APIPerformanceMetrics = {
      url,
      method,
      statusCode,
      duration,
      responseSize,
      error
    };

    this.apiMetrics.push(apiMetric);

    // Create performance metric
    this.addMetric(
      'api_call_duration',
      duration,
      'ms',
      PerformanceCategory.API_PERFORMANCE,
      MetricType.TIMING,
      { url, method, status: statusCode.toString() },
      { responseSize, error }
    );

    // Check for slow API calls
    if (duration > 5000) { // 5 seconds
      logger.logEvent('performance.slow_api_call', {
        url,
        method,
        duration,
        statusCode,
        responseSize,
        error
      });
    }
  }

  /**
   * Get current performance report
   */
  getReport(): PerformanceReport {
    const report: PerformanceReport = {
      id: this.generateReportId(),
      timestamp: new Date(),
      webVitals: { ...this.webVitals } as WebVitalMetrics,
      resources: [...this.resourceMetrics],
      apiCalls: [...this.apiMetrics],
      memory: this.getMemoryInfo(),
      userInteractions: [...this.userInteractions],
      customMetrics: [...this.customMetrics],
      pageInfo: this.getPageInfo(),
      deviceInfo: this.getDeviceInfo(),
      performanceScore: this.calculatePerformanceScore()
    };

    return report;
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitalsMonitoring(): void {
    if (!window.PerformanceObserver) return;

    try {
      // Monitor FCP and LCP
      const vitalsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'paint') {
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-contentful-paint') {
              this.webVitals.fcp = paintEntry.startTime;
              this.addMetric('FCP', paintEntry.startTime, 'ms', PerformanceCategory.WEB_VITALS, MetricType.TIMING);
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as any;
            this.webVitals.lcp = lcpEntry.startTime;
            this.addMetric('LCP', lcpEntry.startTime, 'ms', PerformanceCategory.WEB_VITALS, MetricType.TIMING);
          }
        });
      });

      vitalsObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observer = vitalsObserver;

      // Monitor CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
        });

        this.webVitals.cls = clsValue;
        this.addMetric('CLS', clsValue, 'score', PerformanceCategory.WEB_VITALS, MetricType.GAUGE);
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // Monitor FID and INP
      const interactionObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const interactionEntry = entry as any;

          if (entry.entryType === 'first-input') {
            this.webVitals.fid = interactionEntry.processingStart - interactionEntry.startTime;
            this.addMetric('FID', this.webVitals.fid, 'ms', PerformanceCategory.WEB_VITALS, MetricType.TIMING);
          }

          if (entry.entryType === 'event' && interactionEntry.interactionId) {
            const inp = interactionEntry.processingStart - interactionEntry.startTime;
            this.webVitals.inp = Math.max(this.webVitals.inp || 0, inp);
            this.addMetric('INP', inp, 'ms', PerformanceCategory.WEB_VITALS, MetricType.TIMING);
          }
        });
      });

      interactionObserver.observe({ entryTypes: ['first-input', 'event'] });

      // Monitor TTFB
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        this.webVitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        this.addMetric('TTFB', this.webVitals.ttfb, 'ms', PerformanceCategory.WEB_VITALS, MetricType.TIMING);
      }

    } catch (error) {
      logger.logError('Failed to initialize Web Vitals monitoring', error);
    }
  }

  /**
   * Initialize resource monitoring
   */
  private initializeResourceMonitoring(): void {
    if (!window.PerformanceObserver) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            const resource: ResourceMetrics = {
              name: resourceEntry.name,
              type: this.getResourceType(resourceEntry),
              size: resourceEntry.transferSize || 0,
              loadTime: resourceEntry.responseEnd - resourceEntry.startTime,
              transferSize: resourceEntry.transferSize || 0,
              cached: resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize > 0
            };

            this.resourceMetrics.push(resource);

            // Add performance metric
            this.addMetric(
              'resource_load_time',
              resource.loadTime,
              'ms',
              PerformanceCategory.RESOURCE_LOADING,
              MetricType.TIMING,
              { name: resource.name, type: resource.type },
              { size: resource.size, cached: resource.cached }
            );

            // Check for large resources
            if (resource.size > 1024 * 1024) { // > 1MB
              logger.logEvent('performance.large_resource', {
                name: resource.name,
                size: resource.size,
                loadTime: resource.loadTime,
                type: resource.type
              });
            }
          }
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

    } catch (error) {
      logger.logError('Failed to initialize resource monitoring', error);
    }
  }

  /**
   * Initialize API monitoring by intercepting fetch
   */
  private initializeAPIMonitoring(): void {
    const originalFetch = window.fetch;

    window.fetch = async (...args: any[]): Promise<Response> => {
      const startTime = performance.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        const responseSize = parseInt(response.headers.get('content-length') || '0');

        this.trackAPICall(url, method, response.status, duration, responseSize);

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        this.trackAPICall(url, method, 0, duration, 0, error instanceof Error ? error.message : 'Unknown error');
        throw error;
      }
    };
  }

  /**
   * Initialize user interaction monitoring
   */
  private initializeUserInteractionMonitoring(): void {
    const trackInteraction = (type: UserInteractionMetrics['type']) => (event: Event) => {
      const interaction: UserInteractionMetrics = {
        type,
        element: this.getElementSelector(event.target as Element),
        timestamp: new Date()
      };

      if (type === 'click' || type === 'input') {
        const startTime = performance.now();
        requestAnimationFrame(() => {
          interaction.duration = performance.now() - startTime;
        });
      }

      this.userInteractions.push(interaction);

      // Trim interactions if needed
      if (this.userInteractions.length > 100) {
        this.userInteractions.shift();
      }

      // Track interaction performance
      if (interaction.duration) {
        this.addMetric(
          `${type}_response_time`,
          interaction.duration,
          'ms',
          PerformanceCategory.USER_INTERACTION,
          MetricType.TIMING,
          { element: interaction.element || 'unknown' }
        );
      }
    };

    document.addEventListener('click', trackInteraction('click'));
    document.addEventListener('input', trackInteraction('input'));
    document.addEventListener('scroll', trackInteraction('scroll'), { passive: true });

    // Track navigation
    window.addEventListener('beforeunload', trackInteraction('navigation'));
  }

  /**
   * Initialize memory monitoring
   */
  private initializeMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    const collectMemoryMetrics = () => {
      const memory = (performance as any).memory;
      const memoryInfo = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        memoryPressure: this.calculateMemoryPressure(memory)
      };

      this.addMetric('memory_used', memoryInfo.usedJSHeapSize, 'bytes', PerformanceCategory.MEMORY, MetricType.GAUGE);
      this.addMetric('memory_total', memoryInfo.totalJSHeapSize, 'bytes', PerformanceCategory.MEMORY, MetricType.GAUGE);

      // Check for memory pressure
      if (memoryInfo.memoryPressure === 'high') {
        logger.logEvent('performance.high_memory_usage', {
          used: memoryInfo.usedJSHeapSize,
          total: memoryInfo.totalJSHeapSize,
          limit: memoryInfo.jsHeapSizeLimit,
          pressure: memoryInfo.memoryPressure
        });
      }
    };

    // Collect memory metrics every 10 seconds
    setInterval(collectMemoryMetrics, 10000);
    collectMemoryMetrics(); // Initial collection
  }

  /**
   * Initialize page visibility handling
   */
  private initializePageVisibilityHandling(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page became hidden, send final report
        if (this.config.sendReports) {
          this.generateAndSendReport();
        }
      }
    });
  }

  /**
   * Start periodic reporting
   */
  private startPeriodicReporting(): void {
    this.reportingInterval = window.setInterval(() => {
      this.generateAndSendReport();
    }, this.config.reportInterval);
  }

  /**
   * Generate and send performance report
   */
  private generateAndSendReport(): void {
    try {
      const report = this.getReport();

      // Send report via logger
      logger.logEvent('performance.report', {
        reportId: report.id,
        timestamp: report.timestamp.toISOString(),
        webVitals: report.webVitals,
        performanceScore: report.performanceScore,
        resourceCount: report.resources.length,
        apiCallCount: report.apiCalls.length,
        userInteractionCount: report.userInteractions.length,
        customMetricCount: report.customMetrics.length,
        pageInfo: report.pageInfo,
        deviceInfo: report.deviceInfo
      });

      // Log individual metrics for analysis
      this.customMetrics.forEach(metric => {
        logger.trackPerformance(metric.name, metric.value, metric.unit);
      });

      // Clear processed metrics
      this.customMetrics.length = 0;

    } catch (error) {
      logger.logError('Failed to generate performance report', error);
    }
  }

  /**
   * Helper methods
   */
  private generateMetricId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getResourceType(entry: PerformanceResourceTiming): string {
    if (entry.name.includes('.js')) return 'script';
    if (entry.name.includes('.css')) return 'stylesheet';
    if (entry.name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
    if (entry.name.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    if (entry.name.includes('/api/')) return 'api';
    return 'other';
  }

  private getElementSelector(element: Element | null): string {
    if (!element) return 'unknown';

    let selector = element.tagName.toLowerCase();
    if (element.id) selector += `#${element.id}`;
    if (element.className) selector += `.${element.className.split(' ').join('.')}`;

    return selector;
  }

  private calculateMemoryPressure(memory: any): 'low' | 'medium' | 'high' {
    const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    if (usagePercent > 80) return 'high';
    if (usagePercent > 60) return 'medium';
    return 'low';
  }

  private getMemoryInfo(): MemoryMetrics | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      memoryPressure: this.calculateMemoryPressure(memory)
    };
  }

  private getPageInfo() {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      loadTime: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.fetchStart : 0
    };
  }

  private getDeviceInfo() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      connectionType: connection?.type,
      effectiveType: connection?.effectiveType
    };
  }

  private calculatePerformanceScore() {
    const scores = {
      overall: 100,
      webVitals: 100,
      loading: 100,
      interactivity: 100,
      reliability: 100
    };

    // Calculate Web Vitals score
    let webVitalsScore = 100;
    if (this.webVitals.lcp && this.webVitals.lcp > 4000) webVitalsScore -= 30;
    else if (this.webVitals.lcp && this.webVitals.lcp > 2500) webVitalsScore -= 15;

    if (this.webVitals.fid && this.webVitals.fid > 300) webVitalsScore -= 30;
    else if (this.webVitals.fid && this.webVitals.fid > 100) webVitalsScore -= 15;

    if (this.webVitals.cls && this.webVitals.cls > 0.25) webVitalsScore -= 30;
    else if (this.webVitals.cls && this.webVitals.cls > 0.1) webVitalsScore -= 15;

    scores.webVitals = Math.max(0, webVitalsScore);

    // Calculate loading score based on resources
    const slowResources = this.resourceMetrics.filter(r => r.loadTime > 3000);
    scores.loading = Math.max(0, 100 - (slowResources.length * 10));

    // Calculate interactivity score based on user interactions
    const slowInteractions = this.userInteractions.filter(i => i.duration && i.duration > 100);
    scores.interactivity = Math.max(0, 100 - (slowInteractions.length * 5));

    // Calculate reliability score based on API errors
    const erroredAPIs = this.apiMetrics.filter(api => api.statusCode >= 400 || api.error);
    scores.reliability = Math.max(0, 100 - (erroredAPIs.length * 15));

    // Calculate overall score
    scores.overall = Math.round(
      (scores.webVitals + scores.loading + scores.interactivity + scores.reliability) / 4
    );

    return scores;
  }

  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.find(t => t.metric === metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.critical) {
      logger.logEvent('performance.threshold_critical', {
        metricName: metric.name,
        value: metric.value,
        threshold: threshold.critical,
        unit: threshold.unit
      });
    } else if (metric.value >= threshold.warning) {
      logger.logEvent('performance.threshold_warning', {
        metricName: metric.name,
        value: metric.value,
        threshold: threshold.warning,
        unit: threshold.unit
      });
    }
  }

  private trimMetricsIfNeeded(): void {
    if (this.metrics.length > (this.config.maxMetrics || 1000)) {
      const excess = this.metrics.length - (this.config.maxMetrics || 1000);
      this.metrics.splice(0, excess);
    }
  }
}

/**
 * Global performance metrics collector instance
 */
export const globalPerformanceCollector = new PerformanceMetricsCollector({
  autoStart: true,
  reportInterval: 30000,
  enableWebVitals: true,
  enableResourceTracking: true,
  enableAPITracking: true,
  enableUserInteractionTracking: true,
  enableMemoryTracking: true,
  sendReports: true
});

/**
 * Factory function to create performance collector with custom config
 */
export function createPerformanceCollector(config?: any): PerformanceMetricsCollector {
  return new PerformanceMetricsCollector(config);
}

export default PerformanceMetricsCollector;