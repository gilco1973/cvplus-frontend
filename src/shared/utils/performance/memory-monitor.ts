/**
 * Memory monitoring and leak detection system
 * Provides real-time memory usage tracking and alerts
 */

export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usedPercent: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MemoryAlert {
  type: 'warning' | 'critical' | 'leak_detected';
  message: string;
  timestamp: number;
  memoryUsage: number;
  threshold: number;
}

export interface MemoryMonitorConfig {
  sampleInterval: number;      // ms between samples
  alertThreshold: number;      // % memory usage for alerts
  leakThreshold: number;       // MB growth for leak detection
  maxSnapshots: number;        // Max history to keep
  enableAlerts: boolean;
}

export class MemoryMonitor {
  private config: MemoryMonitorConfig;
  private snapshots: MemorySnapshot[] = [];
  private alertCallbacks: ((alert: MemoryAlert) => void)[] = [];
  private intervalId: number | null = null;
  private isMonitoring = false;
  
  private readonly defaultConfig: MemoryMonitorConfig = {
    sampleInterval: 5000,      // 5 seconds
    alertThreshold: 85,        // 85% memory usage
    leakThreshold: 50,         // 50MB growth
    maxSnapshots: 720,         // 1 hour of 5-second samples
    enableAlerts: true
  };

  constructor(config?: Partial<MemoryMonitorConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Start memory monitoring
   */
  start(): void {
    if (this.isMonitoring) {
      console.warn('Memory monitor is already running');
      return;
    }

    if (!this.isMemoryAPIAvailable()) {
      console.warn('Memory API not available - monitoring disabled');
      return;
    }

    this.isMonitoring = true;
    this.takeSnapshot(); // Take initial snapshot
    
    this.intervalId = window.setInterval(() => {
      this.takeSnapshot();
      this.analyzeMemoryTrends();
    }, this.config.sampleInterval);

    console.warn('Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isMonitoring = false;
    console.warn('Memory monitoring stopped');
  }

  /**
   * Get current memory snapshot
   */
  getCurrentSnapshot(): MemorySnapshot | null {
    if (!this.isMemoryAPIAvailable()) return null;
    
    const memory = (performance as any).memory;
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      trend: this.calculateTrend()
    };
    
    return snapshot;
  }

  /**
   * Get memory usage history
   */
  getHistory(): MemorySnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Get memory statistics
   */
  getStatistics(): {
    current: MemorySnapshot | null;
    peak: MemorySnapshot | null;
    average: number;
    trend: string;
    growthRate: number; // MB per minute
    isLeaking: boolean;
  } {
    if (this.snapshots.length === 0) {
      return {
        current: this.getCurrentSnapshot(),
        peak: null,
        average: 0,
        trend: 'unknown',
        growthRate: 0,
        isLeaking: false
      };
    }

    const current = this.snapshots[this.snapshots.length - 1];
    const peak = this.snapshots.reduce((max, snapshot) => 
      snapshot.usedJSHeapSize > max.usedJSHeapSize ? snapshot : max
    );
    
    const average = this.snapshots.reduce((sum, snapshot) => 
      sum + snapshot.usedJSHeapSize, 0
    ) / this.snapshots.length;

    const growthRate = this.calculateGrowthRate();
    const isLeaking = this.detectMemoryLeak();

    return {
      current,
      peak,
      average: average / (1024 * 1024), // Convert to MB
      trend: current.trend,
      growthRate,
      isLeaking
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGC(): boolean {
    if ((window as any).gc) {
      (window as any).gc();
      
      // Take snapshot after GC to measure impact
      setTimeout(() => this.takeSnapshot(), 100);
      
      return true;
    }
    
    console.warn('Garbage collection not available');
    return false;
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: MemoryAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  removeAlert(callback: (alert: MemoryAlert) => void): void {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Clear monitoring history
   */
  clearHistory(): void {
    this.snapshots = [];
  }

  /**
   * Export monitoring data for analysis
   */
  exportData(): string {
    const data = {
      config: this.config,
      snapshots: this.snapshots,
      statistics: this.getStatistics(),
      exportTime: Date.now()
    };
    
    return JSON.stringify(data, null, 2);
  }

  private takeSnapshot(): void {
    const snapshot = this.getCurrentSnapshot();
    if (!snapshot) return;

    this.snapshots.push(snapshot);
    
    // Limit snapshot history
    while (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    // Check for alerts
    if (this.config.enableAlerts) {
      this.checkForAlerts(snapshot);
    }
  }

  private calculateTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.snapshots.length < 3) return 'stable';
    
    const recent = this.snapshots.slice(-3);
    const first = recent[0].usedJSHeapSize;
    const last = recent[recent.length - 1].usedJSHeapSize;
    
    const change = ((last - first) / first) * 100;
    
    if (change > 2) return 'increasing';
    if (change < -2) return 'decreasing';
    return 'stable';
  }

  private calculateGrowthRate(): number {
    if (this.snapshots.length < 2) return 0;
    
    const timeSpan = 10; // Look at last 10 snapshots (50 seconds)
    const recent = this.snapshots.slice(-Math.min(timeSpan, this.snapshots.length));
    
    if (recent.length < 2) return 0;
    
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const timeDiff = (last.timestamp - first.timestamp) / (1000 * 60); // minutes
    const memoryDiff = (last.usedJSHeapSize - first.usedJSHeapSize) / (1024 * 1024); // MB
    
    return timeDiff > 0 ? memoryDiff / timeDiff : 0;
  }

  private detectMemoryLeak(): boolean {
    if (this.snapshots.length < 20) return false; // Need enough data
    
    const recent = this.snapshots.slice(-20);
    const growthCount = recent.reduce((count, snapshot, index) => {
      if (index === 0) return count;
      return recent[index - 1].usedJSHeapSize < snapshot.usedJSHeapSize ? count + 1 : count;
    }, 0);
    
    // If memory grows in 80% of recent samples, consider it a leak
    const growthRatio = growthCount / (recent.length - 1);
    const continuousGrowth = growthRatio > 0.8;
    
    // Also check absolute growth
    const totalGrowth = (recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize) / (1024 * 1024);
    const significantGrowth = totalGrowth > this.config.leakThreshold;
    
    return continuousGrowth && significantGrowth;
  }

  private checkForAlerts(snapshot: MemorySnapshot): void {
    // High memory usage alert
    if (snapshot.usedPercent > this.config.alertThreshold) {
      const alert: MemoryAlert = {
        type: snapshot.usedPercent > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${snapshot.usedPercent.toFixed(1)}%`,
        timestamp: snapshot.timestamp,
        memoryUsage: snapshot.usedJSHeapSize / (1024 * 1024),
        threshold: this.config.alertThreshold
      };
      
      this.emitAlert(alert);
    }

    // Memory leak detection
    if (this.detectMemoryLeak()) {
      const alert: MemoryAlert = {
        type: 'leak_detected',
        message: 'Potential memory leak detected',
        timestamp: snapshot.timestamp,
        memoryUsage: snapshot.usedJSHeapSize / (1024 * 1024),
        threshold: this.config.leakThreshold
      };
      
      this.emitAlert(alert);
    }
  }

  private emitAlert(alert: MemoryAlert): void {
    console.warn(`Memory Alert [${alert.type}]: ${alert.message}`);
    
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in memory alert callback:', error);
      }
    });
  }

  private isMemoryAPIAvailable(): boolean {
    return typeof performance !== 'undefined' && 
           (performance as any).memory !== undefined;
  }
}

/**
 * Global memory monitor instance
 */
export const memoryMonitor = new MemoryMonitor();

/**
 * Initialize memory monitoring with default settings
 */
export function initializeMemoryMonitoring(): void {
  // Set up alerts
  memoryMonitor.onAlert((alert) => {
    // Log to console
    console.warn(`Memory Alert: ${alert.message}`, alert);
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'memory_alert', {
        alert_type: alert.type,
        memory_usage: alert.memoryUsage,
        threshold: alert.threshold
      });
    }
  });

  // Start monitoring
  memoryMonitor.start();
  
  // Set up cleanup on page unload
  window.addEventListener('beforeunload', () => {
    memoryMonitor.stop();
  });
  
  console.warn('Memory monitoring initialized');
}

/**
 * Memory pressure relief utility
 */
export function relieveMemoryPressure(): Promise<void> {
  return new Promise((resolve) => {
    // Force garbage collection if available
    memoryMonitor.forceGC();
    
    // Clear caches if available
    if ('caches' in window) {
      caches.keys().then(names => {
        return Promise.all(
          names.map(name => caches.delete(name))
        );
      }).catch(console.warn);
    }
    
    // Allow time for cleanup
    setTimeout(resolve, 100);
  });
}