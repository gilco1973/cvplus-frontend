/**
 * StrictMode-Aware Request Manager
 * Enhanced request manager specifically designed to handle React StrictMode's double-effect execution
 * while maintaining zero-tolerance duplicate prevention in production
 */

export class StrictModeAwareRequestManager {
  private static instance: StrictModeAwareRequestManager;
  
  // Core tracking
  private activeRequests = new Map<string, Promise<unknown>>();
  private requestTimestamps = new Map<string, number>();
  private requestResults = new Map<string, { result: unknown; timestamp: number }>();
  
  // StrictMode detection and handling
  private strictModeThreshold = 100; // ms - requests within this window are likely StrictMode duplicates
  private strictModeCallCounts = new Map<string, number>();
  private isStrictMode = process.env.NODE_ENV === 'development';
  
  // Configuration
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  
  private constructor() {
    this.startCleanupInterval();
    console.warn(`[StrictModeAwareRequestManager] Initialized - StrictMode: ${this.isStrictMode}`);
  }
  
  static getInstance(): StrictModeAwareRequestManager {
    if (!StrictModeAwareRequestManager.instance) {
      StrictModeAwareRequestManager.instance = new StrictModeAwareRequestManager();
    }
    return StrictModeAwareRequestManager.instance;
  }
  
  /**
   * Execute request with StrictMode-aware duplicate prevention
   */
  async executeOnce<T>(
    key: string,
    executor: () => Promise<T>,
    options: {
      timeout?: number;
      context?: string;
      forceRegenerate?: boolean;
    } = {}
  ): Promise<{ data: T; wasFromCache: boolean; wasStrictModeDuplicate: boolean }> {
    const {
      timeout = this.DEFAULT_TIMEOUT,
      context = 'unknown',
      forceRegenerate = false
    } = options;
    
    const now = Date.now();
    const callCount = (this.strictModeCallCounts.get(key) || 0) + 1;
    
    // Update call tracking
    this.strictModeCallCounts.set(key, callCount);
    
    console.warn(`[StrictModeAware] Request #${callCount} for key: ${key}`, {
      context,
      isStrictMode: this.isStrictMode,
      timestamp: now,
      forceRegenerate
    });
    
    // Check for cached result (unless force regenerate)
    if (!forceRegenerate && this.requestResults.has(key)) {
      const cached = this.requestResults.get(key)!;
      
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.warn(`[StrictModeAware] Returning cached result for ${key}`, {
          cacheAge: now - cached.timestamp,
          callCount
        });
        
        return {
          data: cached.result as T,
          wasFromCache: true,
          wasStrictModeDuplicate: false
        };
      } else {
        // Expired cache
        this.requestResults.delete(key);
      }
    }
    
    // StrictMode duplicate detection
    const lastRequestTime = this.requestTimestamps.get(key);
    const isLikelyStrictModeDuplicate = this.isStrictMode && 
      lastRequestTime && 
      (now - lastRequestTime) < this.strictModeThreshold;
    
    if (isLikelyStrictModeDuplicate) {
      console.warn(`[StrictModeAware] 🚨 STRICTMODE DUPLICATE DETECTED for ${key}`, {
        timeSinceLastRequest: now - lastRequestTime!,
        callCount,
        threshold: this.strictModeThreshold
      });
      
      // Check if there's an active request to wait for
      if (this.activeRequests.has(key)) {
        console.warn(`[StrictModeAware] Waiting for active request to complete...`);
        try {
          const result = await this.activeRequests.get(key)!;
          return {
            data: result as T,
            wasFromCache: true,
            wasStrictModeDuplicate: true
          };
        } catch {
          // If active request failed, clean up and continue
          this.activeRequests.delete(key);
          console.warn(`[StrictModeAware] Active request failed, proceeding with new request`);
        }
      } else {
        // No active request, but this is likely a duplicate
        // In StrictMode, we still proceed but log it
        console.warn(`[StrictModeAware] StrictMode duplicate but no active request, proceeding`);
      }
    }
    
    // Check for active request (non-StrictMode or non-duplicate case)
    if (this.activeRequests.has(key) && !isLikelyStrictModeDuplicate) {
      console.warn(`[StrictModeAware] Active request exists, waiting for completion`);
      try {
        const result = await this.activeRequests.get(key)!;
        return {
          data: result as T,
          wasFromCache: true,
          wasStrictModeDuplicate: false
        };
      } catch {
        // Clean up failed request and continue
        this.activeRequests.delete(key);
        this.requestTimestamps.delete(key);
      }
    }
    
    // Record request timestamp
    this.requestTimestamps.set(key, now);
    
    // Create new request
    console.warn(`[StrictModeAware] Starting new request for ${key}`);
    
    const requestPromise = this.createTimeoutPromise(executor(), timeout, key);
    this.activeRequests.set(key, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // Cache the result
      this.requestResults.set(key, { result, timestamp: now });
      
      console.warn(`[StrictModeAware] Request completed successfully for ${key}`, {
        duration: Date.now() - now,
        callCount
      });
      
      return {
        data: result as T,
        wasFromCache: false,
        wasStrictModeDuplicate: false
      };
      
    } catch (error) {
      console.error(`[StrictModeAware] Request failed for ${key}:`, error);
      throw error;
      
    } finally {
      // Cleanup
      this.activeRequests.delete(key);
      // Keep timestamp for StrictMode detection
    }
  }
  
  /**
   * Create promise with timeout
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
          reject(new Error(`Timeout after ${timeout}ms for key: ${key}`));
        }, timeout);
      })
    ]);
  }
  
  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCache();
      this.cleanupOldTimestamps();
    }, 60000); // Clean up every minute
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, cached] of this.requestResults.entries()) {
      if (now - cached.timestamp >= this.CACHE_DURATION) {
        this.requestResults.delete(key);
        this.strictModeCallCounts.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.warn(`[StrictModeAware] Cleaned up ${cleanedCount} expired cache entries`);
    }
  }
  
  /**
   * Clean up old timestamps (keep only recent ones for StrictMode detection)
   */
  private cleanupOldTimestamps(): void {
    const now = Date.now();
    const timestampRetention = 5000; // 5 seconds
    let cleanedCount = 0;
    
    for (const [key, timestamp] of this.requestTimestamps.entries()) {
      if (now - timestamp > timestampRetention) {
        this.requestTimestamps.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.warn(`[StrictModeAware] Cleaned up ${cleanedCount} old timestamps`);
    }
  }
  
  /**
   * Clear specific key from all caches
   */
  clearKey(key: string): void {
    this.activeRequests.delete(key);
    this.requestTimestamps.delete(key);
    this.requestResults.delete(key);
    this.strictModeCallCounts.delete(key);
    
    console.warn(`[StrictModeAware] Cleared all caches for key: ${key}`);
  }
  
  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      isStrictMode: this.isStrictMode,
      strictModeThreshold: this.strictModeThreshold,
      activeRequests: Array.from(this.activeRequests.keys()),
      cachedResults: Array.from(this.requestResults.keys()),
      callCounts: Object.fromEntries(this.strictModeCallCounts),
      timestamps: Object.fromEntries(
        Array.from(this.requestTimestamps.entries()).map(([key, timestamp]) => [
          key,
          { timestamp, age: Date.now() - timestamp }
        ])
      )
    };
  }
}

// Export singleton instance
export const strictModeAwareRequestManager = StrictModeAwareRequestManager.getInstance();

// Add global debug access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).strictModeAwareRequestManager = {
    getDebugInfo: () => strictModeAwareRequestManager.getDebugInfo(),
    clearKey: (key: string) => strictModeAwareRequestManager.clearKey(key)
  };
}