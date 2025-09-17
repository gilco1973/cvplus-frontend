/**
 * Global Request Manager - Zero-Tolerance Duplicate Prevention
 * 
 * This singleton provides bulletproof protection against duplicate requests
 * by implementing a global, module-level request tracking system.
 */

export interface RequestResult<T> {
  data: T;
  wasFromCache: boolean;
  requestId: string;
  timestamp: number;
}

export interface RequestOptions {
  /** Force execution even if request is cached (default: false) */
  forceRegenerate?: boolean;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Additional context for logging */
  context?: string;
}

export class RequestManager {
  private static instance: RequestManager;
  
  // Core tracking maps
  private activeRequests = new Map<string, Promise<any>>();
  private completedRequests = new Map<string, { result: any; timestamp: number; requestId: string }>();
  private requestCounts = new Map<string, number>();
  private requestStartTimes = new Map<string, number>();
  
  // Configuration
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_TIMEOUT = 300000; // 5 minutes for CV analysis
  private readonly MAX_CACHE_SIZE = 1000; // Prevent memory leaks
  
  private constructor() {
    this.startCleanupInterval();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  /**
   * Execute a request only once per unique key
   * Provides zero-tolerance duplicate prevention
   */
  async executeOnce<T>(
    key: string,
    executor: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<RequestResult<T>> {
    const {
      forceRegenerate = false,
      timeout = this.DEFAULT_TIMEOUT,
      context = 'unknown'
    } = options;

    // Generate unique request ID for tracking
    const requestId = this.generateRequestId();
    const timestamp = Date.now();
    
    // Increment request count for debugging
    const currentCount = (this.requestCounts.get(key) || 0) + 1;
    this.requestCounts.set(key, currentCount);
    
    this.log(`Request #${currentCount} for key: ${key}`, {
      requestId,
      context,
      forceRegenerate,
      timestamp
    });

    // Check for completed request (unless force regenerate)
    if (!forceRegenerate && this.completedRequests.has(key)) {
      const cached = this.completedRequests.get(key)!;
      
      // Check if cache is still valid
      if (timestamp - cached.timestamp < this.CACHE_DURATION) {
        this.log(`Returning cached result for key: ${key}`, {
          originalRequestId: cached.requestId,
          currentRequestId: requestId,
          cacheAge: timestamp - cached.timestamp
        });
        
        return {
          data: cached.result as T, // Safe cast - cached result is from same operation
          wasFromCache: true,
          requestId: cached.requestId,
          timestamp: cached.timestamp
        };
      } else {
        // Cache expired, remove it
        this.completedRequests.delete(key);
        this.log(`Cache expired for key: ${key}, removing`, {
          cacheAge: timestamp - cached.timestamp
        });
      }
    }

    // Check for active request
    if (this.activeRequests.has(key)) {
      this.log(`BLOCKING duplicate request for key: ${key}`, {
        requestId,
        context,
        currentCount,
        blocked: true
      });
      
      // Return the existing promise
      const existingPromise = this.activeRequests.get(key)!;
      
      try {
        const result = await existingPromise;
        return {
          data: result as T, // Safe cast - result is from awaited promise of correct type
          wasFromCache: true,
          requestId: 'shared-request',
          timestamp: this.requestStartTimes.get(key) || timestamp
        };
      } catch (error) {
        // If existing request failed, remove it and allow retry
        this.activeRequests.delete(key);
        this.requestStartTimes.delete(key);
        throw error;
      }
    }

    // Start new request
    this.log(`Starting new request for key: ${key}`, {
      requestId,
      context,
      currentCount
    });

    // Record start time
    this.requestStartTimes.set(key, timestamp);

    // Create request promise with timeout
    const requestPromise = this.createTimeoutPromise(executor(), timeout, key);
    
    // Store active request IMMEDIATELY to block duplicates
    this.activeRequests.set(key, requestPromise);

    try {
      // Execute the request
      const result = await requestPromise;
      
      // Cache the result
      this.completedRequests.set(key, {
        result,
        timestamp,
        requestId
      });
      
      this.log(`Request completed successfully for key: ${key}`, {
        requestId,
        duration: Date.now() - timestamp,
        resultType: typeof result
      });

      // Cleanup cache size if needed
      this.cleanupCacheIfNeeded();

      return {
        data: result,
        wasFromCache: false,
        requestId,
        timestamp
      };

    } catch (error) {
      this.log(`Request failed for key: ${key}`, {
        requestId,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - timestamp
      });
      
      throw error;
    } finally {
      // Always cleanup active request
      this.activeRequests.delete(key);
      this.requestStartTimes.delete(key);
    }
  }

  /**
   * Create a promise with timeout handling
   */
  private createTimeoutPromise<T>(
    promise: Promise<T>,
    timeout: number,
    key: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timeout after ${timeout}ms for key: ${key}`));
        }, timeout);
      })
    ]);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Centralized logging with structured data
   */
  private log(message: string, data?: Record<string, unknown>): void {
    const logData = {
      timestamp: new Date().toISOString(),
      component: 'RequestManager',
      message,
      ...data
    };
    
    console.warn(`[RequestManager] ${message}`, logData);
  }

  /**
   * Start cleanup interval to prevent memory leaks
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
    }, this.CACHE_DURATION);
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.completedRequests.entries()) {
      if (now - cached.timestamp >= this.CACHE_DURATION) {
        this.completedRequests.delete(key);
        this.requestCounts.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Clean up cache if it exceeds maximum size
   */
  private cleanupCacheIfNeeded(): void {
    if (this.completedRequests.size <= this.MAX_CACHE_SIZE) {
      return;
    }

    // Remove oldest entries
    const entries = Array.from(this.completedRequests.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE + 100);
    
    for (const [key] of toRemove) {
      this.completedRequests.delete(key);
      this.requestCounts.delete(key);
    }
    
    this.log(`Cache size cleanup: removed ${toRemove.length} oldest entries`);
  }

  /**
   * Clear specific request from cache (useful for invalidation)
   */
  clearRequest(key: string): void {
    this.completedRequests.delete(key);
    this.requestCounts.delete(key);
    this.activeRequests.delete(key);
    this.requestStartTimes.delete(key);
    
    this.log(`Manually cleared request cache for key: ${key}`);
  }

  /**
   * Clear all caches (useful for testing or reset)
   */
  clearAll(): void {
    const counts = {
      completed: this.completedRequests.size,
      active: this.activeRequests.size,
      requestCounts: this.requestCounts.size
    };
    
    this.completedRequests.clear();
    this.requestCounts.clear();
    this.activeRequests.clear();
    this.requestStartTimes.clear();
    
    this.log('Cleared all request caches', counts);
  }

  /**
   * Get debug information about current state
   */
  getDebugInfo(): {
    activeRequests: string[];
    completedRequests: string[];
    requestCounts: Record<string, number>;
    cacheSize: number;
    memoryUsage: {
      active: number;
      completed: number;
      total: number;
    };
  } {
    return {
      activeRequests: Array.from(this.activeRequests.keys()),
      completedRequests: Array.from(this.completedRequests.keys()),
      requestCounts: Object.fromEntries(this.requestCounts),
      cacheSize: this.completedRequests.size,
      memoryUsage: {
        active: this.activeRequests.size,
        completed: this.completedRequests.size,
        total: this.activeRequests.size + this.completedRequests.size
      }
    };
  }

  /**
   * Check if a request is currently active
   */
  isRequestActive(key: string): boolean {
    return this.activeRequests.has(key);
  }

  /**
   * Check if a request result is cached
   */
  isRequestCached(key: string): boolean {
    const cached = this.completedRequests.get(key);
    if (!cached) return false;
    
    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_DURATION;
  }

  /**
   * Get cache age for a specific request
   */
  getCacheAge(key: string): number | null {
    const cached = this.completedRequests.get(key);
    if (!cached) return null;
    
    return Date.now() - cached.timestamp;
  }
}

// Export singleton instance for convenience
export const requestManager = RequestManager.getInstance();

// Global debug functions for testing and monitoring
if (typeof window !== 'undefined') {
  // @ts-ignore - Adding debug methods to window for testing
  window.requestManagerDebug = {
    getInfo: () => requestManager.getDebugInfo(),
    clearAll: () => requestManager.clearAll(),
    clearRequest: (key: string) => requestManager.clearRequest(key),
    isActive: (key: string) => requestManager.isRequestActive(key),
    isCached: (key: string) => requestManager.isRequestCached(key),
    getCacheAge: (key: string) => requestManager.getCacheAge(key)
  };
  
  console.warn('[RequestManager] Debug methods available at window.requestManagerDebug');
}