/**
 * T043: Log shipping service in frontend/src/services/LogShippingService.ts
 *
 * Robust log shipping service that handles batching, retry logic, offline support,
 * and reliable delivery of frontend logs to the backend logging system.
 */

import {
  LogLevel,
  LogDomain,
  type LogEntry
} from '@cvplus/logging';

export interface LogShippingConfig {
  batchSize: number;
  flushInterval: number; // milliseconds
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
  maxQueueSize: number;
  enableOfflineSupport: boolean;
  enableCompression: boolean;
  apiEndpoint: string;
  apiKey?: string;
  timeout: number; // milliseconds
}

export interface ShippingResult {
  success: boolean;
  shipped: number;
  failed: number;
  error?: string;
  duration: number;
  retries: number;
}

export interface ShippingMetadata {
  serviceName: string;
  userAgent: string;
  sessionId?: string;
  userId?: string;
  deviceId?: string;
  timestamp: number;
  batchId: string;
  sequenceNumber: number;
}

export interface QueuedBatch {
  id: string;
  logs: LogEntry[];
  metadata: ShippingMetadata;
  timestamp: number;
  retries: number;
  priority: number; // Higher priority ships first
}

const DEFAULT_CONFIG: LogShippingConfig = {
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
  maxQueueSize: 1000,
  enableOfflineSupport: true,
  enableCompression: false,
  apiEndpoint: '/api/v1/logs/batch',
  timeout: 10000 // 10 seconds
};

export class LogShippingService {
  private readonly config: LogShippingConfig;
  private readonly queue: QueuedBatch[] = [];
  private readonly failedQueue: QueuedBatch[] = [];
  private flushTimer?: number;
  private isShipping = false;
  private isOnline = navigator.onLine;
  private sequenceCounter = 0;
  private readonly storageKey = 'cvplus_log_shipping_queue';

  // Statistics
  private stats = {
    totalShipped: 0,
    totalFailed: 0,
    totalRetries: 0,
    averageShippingTime: 0,
    lastSuccessfulShip: null as Date | null,
    lastFailedShip: null as Date | null
  };

  constructor(config: Partial<LogShippingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initialize();
  }

  /**
   * Initialize the shipping service
   */
  private initialize(): void {
    // Load persisted queue from storage
    if (this.config.enableOfflineSupport) {
      this.loadQueueFromStorage();
    }

    // Set up periodic shipping
    this.startPeriodicShipping();

    // Monitor online/offline status
    window.addEventListener('online', this.handleOnlineStatusChange.bind(this));
    window.addEventListener('offline', this.handleOnlineStatusChange.bind(this));

    // Clean up on page unload
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));

    // Handle visibility change to immediately ship when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.queue.length > 0) {
        this.shipImmediately();
      }
    });
  }

  /**
   * Add logs to the shipping queue
   */
  addLogs(logs: LogEntry[], metadata: Partial<ShippingMetadata> = {}): void {
    if (logs.length === 0) return;

    // Create batch
    const batch: QueuedBatch = {
      id: this.generateBatchId(),
      logs: [...logs],
      metadata: {
        serviceName: metadata.serviceName || '@cvplus/frontend',
        userAgent: metadata.userAgent || navigator.userAgent,
        sessionId: metadata.sessionId,
        userId: metadata.userId,
        deviceId: metadata.deviceId || this.getDeviceId(),
        timestamp: Date.now(),
        batchId: this.generateBatchId(),
        sequenceNumber: this.sequenceCounter++
      },
      timestamp: Date.now(),
      retries: 0,
      priority: this.calculatePriority(logs)
    };

    // Add to queue
    this.queue.push(batch);

    // Sort by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Trim queue if too large
    if (this.queue.length > this.config.maxQueueSize) {
      const overflow = this.queue.splice(this.config.maxQueueSize);
      console.warn(`Log shipping queue overflow: ${overflow.length} batches dropped`);
    }

    // Persist to storage if offline support enabled
    if (this.config.enableOfflineSupport) {
      this.saveQueueToStorage();
    }

    // Check if we should ship immediately
    if (this.queue.length >= this.config.batchSize) {
      this.shipImmediately();
    }
  }

  /**
   * Ship logs immediately (bypass normal schedule)
   */
  async shipImmediately(): Promise<ShippingResult[]> {
    if (this.isShipping) {
      return [];
    }

    const results: ShippingResult[] = [];

    // Ship all queued batches
    while (this.queue.length > 0) {
      const result = await this.shipNextBatch();
      if (result) {
        results.push(result);
      }

      // If shipping failed and we're offline, stop trying
      if (!result?.success && !this.isOnline) {
        break;
      }
    }

    return results;
  }

  /**
   * Get shipping statistics
   */
  getStats(): typeof this.stats & {
    queueSize: number;
    failedQueueSize: number;
    isOnline: boolean;
    isShipping: boolean;
  } {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      failedQueueSize: this.failedQueue.length,
      isOnline: this.isOnline,
      isShipping: this.isShipping
    };
  }

  /**
   * Clear all queues and reset statistics
   */
  clear(): void {
    this.queue.length = 0;
    this.failedQueue.length = 0;
    this.sequenceCounter = 0;

    if (this.config.enableOfflineSupport) {
      localStorage.removeItem(this.storageKey);
    }

    // Reset statistics
    this.stats = {
      totalShipped: 0,
      totalFailed: 0,
      totalRetries: 0,
      averageShippingTime: 0,
      lastSuccessfulShip: null,
      lastFailedShip: null
    };
  }

  /**
   * Stop the shipping service
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    // Final flush attempt
    if (this.queue.length > 0) {
      this.shipImmediately();
    }
  }

  private startPeriodicShipping(): void {
    this.flushTimer = window.setInterval(() => {
      if (this.queue.length > 0 && this.isOnline && !this.isShipping) {
        this.shipNextBatch();
      }
    }, this.config.flushInterval);
  }

  private async shipNextBatch(): Promise<ShippingResult | null> {
    if (this.isShipping || this.queue.length === 0 || !this.isOnline) {
      return null;
    }

    this.isShipping = true;
    const startTime = Date.now();

    try {
      // Get the next batch to ship
      const batch = this.queue.shift();
      if (!batch) {
        return null;
      }

      const result = await this.shipBatch(batch);

      // Update statistics
      this.updateStats(result, Date.now() - startTime);

      if (result.success) {
        this.stats.lastSuccessfulShip = new Date();

        // Remove from storage if offline support enabled
        if (this.config.enableOfflineSupport) {
          this.saveQueueToStorage();
        }
      } else {
        this.stats.lastFailedShip = new Date();

        // Handle failed batch
        if (batch.retries < this.config.maxRetries) {
          batch.retries++;
          this.stats.totalRetries++;

          // Calculate retry delay with exponential backoff
          const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, batch.retries - 1);

          // Add back to queue with delay
          setTimeout(() => {
            this.queue.unshift(batch); // Add to front for priority
            if (this.config.enableOfflineSupport) {
              this.saveQueueToStorage();
            }
          }, delay);
        } else {
          // Max retries exceeded, move to failed queue
          this.failedQueue.push(batch);
          console.error('Log batch failed after max retries:', batch.id, result.error);
        }
      }

      return result;

    } catch (error) {
      const result: ShippingResult = {
        success: false,
        shipped: 0,
        failed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        retries: 0
      };

      this.updateStats(result, Date.now() - startTime);
      return result;

    } finally {
      this.isShipping = false;
    }
  }

  private async shipBatch(batch: QueuedBatch): Promise<ShippingResult> {
    const startTime = Date.now();

    try {
      const payload = {
        logs: batch.logs,
        metadata: batch.metadata
      };

      // Compress if enabled (simple JSON stringify for now)
      const body = this.config.enableCompression
        ? this.compress(JSON.stringify(payload))
        : JSON.stringify(payload);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Batch-ID': batch.id,
        'X-Sequence-Number': batch.metadata.sequenceNumber.toString()
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      if (this.config.enableCompression) {
        headers['Content-Encoding'] = 'gzip';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          success: true,
          shipped: batch.logs.length,
          failed: 0,
          duration: Date.now() - startTime,
          retries: batch.retries
        };
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');

        return {
          success: false,
          shipped: 0,
          failed: batch.logs.length,
          error: `HTTP ${response.status}: ${errorText}`,
          duration: Date.now() - startTime,
          retries: batch.retries
        };
      }

    } catch (error) {
      return {
        success: false,
        shipped: 0,
        failed: batch.logs.length,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        retries: batch.retries
      };
    }
  }

  private calculatePriority(logs: LogEntry[]): number {
    // Higher priority for error logs
    let priority = 0;

    logs.forEach(log => {
      switch (log.level) {
        case LogLevel.FATAL:
          priority += 10;
          break;
        case LogLevel.ERROR:
          priority += 5;
          break;
        case LogLevel.WARN:
          priority += 2;
          break;
        case LogLevel.INFO:
          priority += 1;
          break;
        default:
          priority += 0;
      }
    });

    return priority;
  }

  private updateStats(result: ShippingResult, duration: number): void {
    if (result.success) {
      this.stats.totalShipped += result.shipped;
    } else {
      this.stats.totalFailed += result.failed;
    }

    // Update average shipping time
    const totalRequests = this.stats.totalShipped + this.stats.totalFailed;
    if (totalRequests === 1) {
      this.stats.averageShippingTime = duration;
    } else {
      this.stats.averageShippingTime = (this.stats.averageShippingTime * (totalRequests - 1) + duration) / totalRequests;
    }
  }

  private handleOnlineStatusChange(): void {
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;

    if (!wasOnline && this.isOnline) {
      // Back online - try to ship queued logs
      console.log('Connection restored, attempting to ship queued logs');
      setTimeout(() => {
        this.shipImmediately();
      }, 1000); // Small delay to ensure connection is stable
    }
  }

  private handlePageUnload(): void {
    // Attempt to ship remaining logs using sendBeacon if available
    if (this.queue.length > 0 && navigator.sendBeacon && this.isOnline) {
      const batch = this.queue[0];
      if (batch) {
        const payload = JSON.stringify({
          logs: batch.logs,
          metadata: batch.metadata
        });

        navigator.sendBeacon(this.config.apiEndpoint, payload);
      }
    }
  }

  private saveQueueToStorage(): void {
    try {
      const data = {
        queue: this.queue,
        failedQueue: this.failedQueue,
        sequenceCounter: this.sequenceCounter,
        timestamp: Date.now()
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save log shipping queue to storage:', error);
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return;

      const parsed = JSON.parse(data);

      // Check if data is not too old (e.g., older than 24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - parsed.timestamp > maxAge) {
        localStorage.removeItem(this.storageKey);
        return;
      }

      this.queue.push(...parsed.queue || []);
      this.failedQueue.push(...parsed.failedQueue || []);
      this.sequenceCounter = parsed.sequenceCounter || 0;

      console.log(`Loaded ${this.queue.length} batches from storage`);

    } catch (error) {
      console.warn('Failed to load log shipping queue from storage:', error);
      localStorage.removeItem(this.storageKey);
    }
  }

  private compress(data: string): string {
    // Simple compression (in a real implementation, you'd use a proper compression library)
    // For now, just return the original data
    return data;
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('cvplus_device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('cvplus_device_id', deviceId);
    }
    return deviceId;
  }
}

/**
 * Global log shipping service instance
 */
export const globalLogShippingService = new LogShippingService();

/**
 * Factory function to create custom shipping service
 */
export function createLogShippingService(config?: Partial<LogShippingConfig>): LogShippingService {
  return new LogShippingService(config);
}

export default LogShippingService;