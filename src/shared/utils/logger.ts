/**
 * T042: Enhanced frontend logger with comprehensive logging capabilities
 *
 * Browser-optimized logging system with performance monitoring, error tracking,
 * user context, automatic backend shipping, and integration with the CVPlus logging system.
 */

import {
  LogLevel as CoreLogLevel,
  LogDomain,
  PiiRedaction,
  type LogEntry
} from '@cvplus/logging';

// Keep backward compatibility with existing LogLevel enum
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface BrowserLoggerConfig {
  level: CoreLogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemoteShipping: boolean;
  maxStorageEntries: number;
  shipInterval: number; // milliseconds
  batchSize: number;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUserTracking: boolean;
  apiEndpoint?: string;
  apiKey?: string;
}

export interface UserContext {
  userId?: string;
  email?: string;
  role?: string;
  subscription?: string;
  sessionId?: string;
  deviceId?: string;
  userAgent?: string;
  timezone?: string;
  language?: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: Date;
}

const DEFAULT_CONFIG: BrowserLoggerConfig = {
  level: CoreLogLevel.INFO,
  enableConsole: true,
  enableStorage: true,
  enableRemoteShipping: true,
  maxStorageEntries: 1000,
  shipInterval: 30000, // 30 seconds
  batchSize: 50,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableUserTracking: true,
  apiEndpoint: '/api/v1/logs/batch'
};

class EnhancedLogger {
  private readonly config: BrowserLoggerConfig;
  private readonly serviceName: string;
  private readonly piiRedaction: PiiRedaction;
  private readonly logStorage: LogEntry[] = [];
  private readonly performanceMetrics: PerformanceMetric[] = [];
  private userContext: UserContext = {};
  private shipTimer?: number;
  private correlationId?: string;
  private isDevelopment: boolean;
  private legacyLogLevel: LogLevel;

  constructor(serviceName: string = '@cvplus/frontend', config: Partial<BrowserLoggerConfig> = {}) {
    this.serviceName = serviceName;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.piiRedaction = new PiiRedaction();
    this.isDevelopment = import.meta.env.DEV;
    this.legacyLogLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

    this.initializeLogger();
  }

  /**
   * Initialize the logger and set up event listeners
   */
  private initializeLogger(): void {
    // Set up periodic shipping
    if (this.config.enableRemoteShipping) {
      this.startPeriodicShipping();
    }

    // Set up error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Set up performance tracking
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    // Set up user context detection
    if (this.config.enableUserTracking) {
      this.detectUserContext();
    }

    // Set up beforeunload to ship remaining logs
    window.addEventListener('beforeunload', () => {
      this.shipLogs(true); // Force immediate shipping
    });

    // Set up visibility change to ship logs when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.shipLogs();
      }
    });
  }

  /**
   * Set correlation ID for request tracking
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Set user context
   */
  setUserContext(context: Partial<UserContext>): void {
    this.userContext = { ...this.userContext, ...context };
  }

  // Legacy API compatibility
  error(message: string, ...args: any[]) {
    if (this.legacyLogLevel >= LogLevel.ERROR) {
      console.error(`❌ [CVPlus] ${message}`, ...args);
    }
    this.logAdvanced(CoreLogLevel.ERROR, message, { args });
  }

  warn(message: string, ...args: any[]) {
    if (this.legacyLogLevel >= LogLevel.WARN) {
      console.warn(`⚠️ [CVPlus] ${message}`, ...args);
    }
    this.logAdvanced(CoreLogLevel.WARN, message, { args });
  }

  info(message: string, ...args: any[]) {
    if (this.legacyLogLevel >= LogLevel.INFO) {
      console.info(`ℹ️ [CVPlus] ${message}`, ...args);
    }
    this.logAdvanced(CoreLogLevel.INFO, message, { args });
  }

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment && this.legacyLogLevel >= LogLevel.DEBUG) {
      console.debug(`🔍 [CVPlus] ${message}`, ...args);
    }
    this.logAdvanced(CoreLogLevel.DEBUG, message, { args });
  }

  // Enhanced logging methods
  logError(message: string, error?: Error, context: Record<string, any> = {}): void {
    const errorContext = error ? {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    } : context;

    this.logAdvanced(CoreLogLevel.ERROR, message, errorContext);
  }

  logWarning(message: string, context: Record<string, any> = {}): void {
    this.logAdvanced(CoreLogLevel.WARN, message, context);
  }

  logInfo(message: string, context: Record<string, any> = {}): void {
    this.logAdvanced(CoreLogLevel.INFO, message, context);
  }

  logDebug(message: string, context: Record<string, any> = {}): void {
    this.logAdvanced(CoreLogLevel.DEBUG, message, context);
  }

  /**
   * Track performance metric
   */
  trackPerformance(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
    if (!this.config.enablePerformanceTracking) return;

    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      tags,
      timestamp: new Date()
    };

    this.performanceMetrics.push(metric);

    // Log as debug message
    this.logDebug('Performance metric recorded', {
      event: 'performance.metric',
      metric: {
        name,
        value,
        unit,
        tags
      }
    });

    // Keep only recent metrics in memory
    if (this.performanceMetrics.length > 500) {
      this.performanceMetrics.splice(0, 100);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string, referrer?: string): void {
    this.logInfo('Page view tracked', {
      event: 'navigation.page_view',
      path,
      title: title || document.title,
      referrer: referrer || document.referrer,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, category?: string, properties?: Record<string, any>): void {
    this.logInfo('User action tracked', {
      event: 'user.action',
      action,
      category,
      properties,
      timestamp: new Date().toISOString()
    });
  }

  // Component-specific loggers for better organization
  component(componentName: string) {
    return {
      error: (message: string, ...args: any[]) => {
        this.error(`[${componentName}] ${message}`, ...args);
      },
      warn: (message: string, ...args: any[]) => {
        this.warn(`[${componentName}] ${message}`, ...args);
      },
      info: (message: string, ...args: any[]) => {
        this.info(`[${componentName}] ${message}`, ...args);
      },
      debug: (message: string, ...args: any[]) => {
        this.debug(`[${componentName}] ${message}`, ...args);
      },
      // Enhanced methods
      logError: (message: string, error?: Error, context?: Record<string, any>) => {
        this.logError(`[${componentName}] ${message}`, error, { ...context, component: componentName });
      },
      logWarning: (message: string, context?: Record<string, any>) => {
        this.logWarning(`[${componentName}] ${message}`, { ...context, component: componentName });
      },
      logInfo: (message: string, context?: Record<string, any>) => {
        this.logInfo(`[${componentName}] ${message}`, { ...context, component: componentName });
      },
      logDebug: (message: string, context?: Record<string, any>) => {
        this.logDebug(`[${componentName}] ${message}`, { ...context, component: componentName });
      },
      trackAction: (action: string, properties?: Record<string, any>) => {
        this.trackAction(action, componentName, properties);
      }
    };
  }

  // Service-specific loggers
  service(serviceName: string) {
    return {
      error: (message: string, ...args: any[]) => {
        this.error(`[${serviceName}] ${message}`, ...args);
      },
      warn: (message: string, ...args: any[]) => {
        this.warn(`[${serviceName}] ${message}`, ...args);
      },
      info: (message: string, ...args: any[]) => {
        this.info(`[${serviceName}] ${message}`, ...args);
      },
      debug: (message: string, ...args: any[]) => {
        this.debug(`[${serviceName}] ${message}`, ...args);
      },
      // Enhanced methods
      logError: (message: string, error?: Error, context?: Record<string, any>) => {
        this.logError(`[${serviceName}] ${message}`, error, { ...context, service: serviceName });
      },
      logWarning: (message: string, context?: Record<string, any>) => {
        this.logWarning(`[${serviceName}] ${message}`, { ...context, service: serviceName });
      },
      logInfo: (message: string, context?: Record<string, any>) => {
        this.logInfo(`[${serviceName}] ${message}`, { ...context, service: serviceName });
      },
      logDebug: (message: string, context?: Record<string, any>) => {
        this.logDebug(`[${serviceName}] ${message}`, { ...context, service: serviceName });
      }
    };
  }

  // Test-specific logger
  test(testName: string) {
    return {
      start: (message: string) => this.isDevelopment && console.warn(`🧪 [TEST:${testName}] ${message}`),
      success: (message: string) => this.isDevelopment && console.warn(`✅ [TEST:${testName}] ${message}`),
      error: (message: string, ...args: any[]) => console.error(`❌ [TEST:${testName}] ${message}`, ...args),
      info: (message: string) => this.isDevelopment && console.warn(`📝 [TEST:${testName}] ${message}`)
    };
  }

  /**
   * Get logger statistics
   */
  getStats(): {
    totalLogs: number;
    logsByLevel: Record<CoreLogLevel, number>;
    storageSize: number;
    performanceMetrics: number;
    shippingEnabled: boolean;
  } {
    const logsByLevel = {} as Record<CoreLogLevel, number>;

    // Initialize counters
    Object.values(CoreLogLevel).forEach(level => {
      logsByLevel[level] = 0;
    });

    // Count logs by level
    this.logStorage.forEach(log => {
      logsByLevel[log.level]++;
    });

    return {
      totalLogs: this.logStorage.length,
      logsByLevel,
      storageSize: this.getStorageSize(),
      performanceMetrics: this.performanceMetrics.length,
      shippingEnabled: this.config.enableRemoteShipping
    };
  }

  /**
   * Clear stored logs and metrics
   */
  clear(): void {
    this.logStorage.length = 0;
    this.performanceMetrics.length = 0;

    if (this.config.enableStorage) {
      localStorage.removeItem(this.getStorageKey());
    }

    this.logDebug('Logger cleared', {
      event: 'logger.cleared',
      serviceName: this.serviceName
    });
  }

  /**
   * Force immediate log shipping
   */
  async flush(): Promise<void> {
    await this.shipLogs(true);
  }

  /**
   * Stop the logger and clean up
   */
  stop(): void {
    if (this.shipTimer) {
      clearInterval(this.shipTimer);
      this.shipTimer = undefined;
    }

    // Final flush
    this.shipLogs(true);
  }

  private logAdvanced(level: CoreLogLevel, message: string, context: Record<string, any>): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return;
    }

    // Create log entry
    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      domain: LogDomain.SYSTEM, // Default domain
      serviceName: this.serviceName,
      message: this.piiRedaction.redact(message),
      context: this.sanitizeContext({
        ...context,
        ...this.getBrowserContext(),
        correlationId: this.correlationId,
        userContext: this.userContext
      }),
      correlationId: this.correlationId,
      userId: this.userContext.userId
    };

    // Store the log
    this.storeLog(logEntry);
  }

  private shouldLog(level: CoreLogLevel): boolean {
    const levels = [CoreLogLevel.DEBUG, CoreLogLevel.INFO, CoreLogLevel.WARN, CoreLogLevel.ERROR, CoreLogLevel.FATAL];
    const configLevelIndex = levels.indexOf(this.config.level);
    const logLevelIndex = levels.indexOf(level);

    return logLevelIndex >= configLevelIndex;
  }

  private storeLog(logEntry: LogEntry): void {
    // Add to memory storage
    this.logStorage.push(logEntry);

    // Trim storage if needed
    if (this.logStorage.length > this.config.maxStorageEntries) {
      this.logStorage.splice(0, this.logStorage.length - this.config.maxStorageEntries);
    }

    // Store to localStorage if enabled
    if (this.config.enableStorage) {
      this.updateLocalStorage();
    }
  }

  private getBrowserContext(): Record<string, any> {
    return {
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      page: {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer,
        title: document.title
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      timestamp: Date.now()
    };
  }

  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    try {
      const serialized = JSON.stringify(context);
      const redacted = this.piiRedaction.redact(serialized);
      return JSON.parse(redacted);
    } catch (error) {
      // If sanitization fails, return safe version
      return { sanitizationError: true, originalKeys: Object.keys(context) };
    }
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('Unhandled JavaScript error', undefined, {
        event: 'error.javascript',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        stack: event.error?.stack
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled promise rejection', event.reason instanceof Error ? event.reason : undefined, {
        event: 'error.promise_rejection',
        reason: event.reason
      });
    });
  }

  private setupPerformanceTracking(): void {
    // Track navigation timing
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;

          this.trackPerformance('page_load', loadTime, 'ms', {
            type: 'navigation'
          });

          // Track detailed timing metrics
          this.trackPerformance('dns_lookup', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
          this.trackPerformance('tcp_connect', timing.connectEnd - timing.connectStart, 'ms');
          this.trackPerformance('dom_ready', timing.domContentLoadedEventEnd - timing.navigationStart, 'ms');
        }, 0);
      });
    }

    // Track resource timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.trackPerformance(`resource_${entry.name}`, entry.duration, 'ms', {
                type: 'resource',
                resourceType: (entry as PerformanceResourceTiming).initiatorType
              });
            }
          });
        });

        observer.observe({ entryTypes: ['resource'] });
      } catch (error) {
        // PerformanceObserver not supported
        this.logDebug('PerformanceObserver not supported', { error: error.message });
      }
    }
  }

  private detectUserContext(): void {
    // Detect timezone
    try {
      this.userContext.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      // Timezone detection failed
    }

    // Detect language
    this.userContext.language = navigator.language;

    // Generate device ID (stored in localStorage)
    let deviceId = localStorage.getItem('cvplus_device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('cvplus_device_id', deviceId);
    }
    this.userContext.deviceId = deviceId;

    // Set user agent
    this.userContext.userAgent = navigator.userAgent;
  }

  private startPeriodicShipping(): void {
    this.shipTimer = window.setInterval(() => {
      this.shipLogs();
    }, this.config.shipInterval);
  }

  private async shipLogs(immediate = false): Promise<void> {
    if (!this.config.enableRemoteShipping || this.logStorage.length === 0) {
      return;
    }

    const logsToShip = immediate
      ? [...this.logStorage]
      : this.logStorage.slice(0, this.config.batchSize);

    if (logsToShip.length === 0) {
      return;
    }

    try {
      const response = await fetch(this.config.apiEndpoint || '/api/v1/logs/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
          ...(this.correlationId && { 'X-Correlation-ID': this.correlationId })
        },
        body: JSON.stringify({
          logs: logsToShip,
          metadata: {
            serviceName: this.serviceName,
            userContext: this.userContext,
            performanceMetrics: this.performanceMetrics.slice(0, 10) // Send recent metrics
          }
        })
      });

      if (response.ok) {
        // Remove shipped logs
        this.logStorage.splice(0, logsToShip.length);

        // Update localStorage
        if (this.config.enableStorage) {
          this.updateLocalStorage();
        }

        this.logDebug('Logs shipped successfully', {
          event: 'logs.shipped',
          count: logsToShip.length
        });
      } else {
        this.logWarning('Failed to ship logs', {
          event: 'logs.shipping.failed',
          status: response.status,
          statusText: response.statusText
        });
      }

    } catch (error) {
      this.logWarning('Error shipping logs', {
        event: 'logs.shipping.error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private updateLocalStorage(): void {
    try {
      const storageData = {
        logs: this.logStorage.slice(-100), // Keep only recent logs in storage
        timestamp: Date.now()
      };
      localStorage.setItem(this.getStorageKey(), JSON.stringify(storageData));
    } catch (error) {
      // Storage failed, possibly due to quota
      this.logWarning('Failed to update localStorage', {
        event: 'storage.update.failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getStorageKey(): string {
    return `cvplus_logs_${this.serviceName}`;
  }

  private getStorageSize(): number {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      return data ? data.length : 0;
    } catch (error) {
      return 0;
    }
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Create enhanced logger instance with backward compatibility
export const logger = new EnhancedLogger();

/**
 * Create a logger instance
 */
export function createBrowserLogger(serviceName: string, config?: Partial<BrowserLoggerConfig>): EnhancedLogger {
  return new EnhancedLogger(serviceName, config);
}

/**
 * React hook for using the logger
 */
export function useLogger(serviceName?: string): EnhancedLogger {
  return serviceName ? createBrowserLogger(serviceName) : logger;
}

export default logger;