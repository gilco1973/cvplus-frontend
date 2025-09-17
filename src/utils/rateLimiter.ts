/**
 * Rate Limiter Utilities
 * 
 * Provides rate limiting functionality to prevent excessive API calls
 * and manage request throttling.
 */

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
  resetOnSuccess?: boolean;
  enableLogging?: boolean;
}

interface RequestRecord {
  timestamp: number;
  success: boolean;
}

export class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();
  private readonly options: Required<RateLimiterOptions>;

  constructor(options: RateLimiterOptions) {
    this.options = {
      resetOnSuccess: true,
      enableLogging: false,
      ...options
    };

    // Cleanup old records periodically
    setInterval(() => this.cleanup(), this.options.windowMs);
  }

  /**
   * Check if a request is allowed for the given key
   */
  public isAllowed(key: string): boolean {
    const now = Date.now();
    const records = this.requests.get(key) || [];
    
    // Filter out expired records
    const validRecords = records.filter(
      record => now - record.timestamp < this.options.windowMs
    );

    // Update records
    this.requests.set(key, validRecords);

    // Check if under limit
    const allowed = validRecords.length < this.options.maxRequests;

    if (!allowed && this.options.enableLogging) {
      console.warn(`[RateLimiter] Rate limit exceeded for key: ${key}`);
    }

    return allowed;
  }

  /**
   * Record a request attempt
   */
  public recordRequest(key: string, success = true): void {
    const now = Date.now();
    const records = this.requests.get(key) || [];
    
    // Add new record
    records.push({ timestamp: now, success });
    
    // If reset on success and this was successful, clear failed attempts
    if (this.options.resetOnSuccess && success) {
      const successfulRecords = records.filter(record => record.success);
      this.requests.set(key, successfulRecords);
    } else {
      this.requests.set(key, records);
    }

    if (this.options.enableLogging) {
      console.warn(`[RateLimiter] Recorded ${success ? 'successful' : 'failed'} request for key: ${key}`);
    }
  }

  /**
   * Get remaining requests for a key
   */
  public getRemainingRequests(key: string): number {
    const now = Date.now();
    const records = this.requests.get(key) || [];
    
    const validRecords = records.filter(
      record => now - record.timestamp < this.options.windowMs
    );

    return Math.max(0, this.options.maxRequests - validRecords.length);
  }

  /**
   * Get time until next request is allowed
   */
  public getTimeUntilReset(key: string): number {
    const records = this.requests.get(key) || [];
    
    if (records.length === 0) {
      return 0;
    }

    const oldestRecord = records[0];
    const resetTime = oldestRecord.timestamp + this.options.windowMs;
    const now = Date.now();

    return Math.max(0, resetTime - now);
  }

  /**
   * Clear all records for a key
   */
  public clear(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }

  /**
   * Get statistics
   */
  public getStats(): {
    totalKeys: number;
    totalRequests: number;
    activeKeys: string[];
  } {
    const now = Date.now();
    let totalRequests = 0;
    const activeKeys: string[] = [];

    for (const [key, records] of this.requests.entries()) {
      const validRecords = records.filter(
        record => now - record.timestamp < this.options.windowMs
      );
      
      if (validRecords.length > 0) {
        activeKeys.push(key);
        totalRequests += validRecords.length;
      }
    }

    return {
      totalKeys: this.requests.size,
      totalRequests,
      activeKeys
    };
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, records] of this.requests.entries()) {
      const validRecords = records.filter(
        record => now - record.timestamp < this.options.windowMs
      );

      if (validRecords.length === 0) {
        this.requests.delete(key);
        cleanedCount++;
      } else if (validRecords.length !== records.length) {
        this.requests.set(key, validRecords);
      }
    }

    if (cleanedCount > 0 && this.options.enableLogging) {
      console.warn(`[RateLimiter] Cleaned up ${cleanedCount} expired rate limit keys`);
    }
  }
}

/**
 * Debounce function with rate limiting
 */
export function createDebouncedFunction<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
  rateLimiter?: RateLimiter,
  key?: string
): T {
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      // Check rate limiting if provided
      if (rateLimiter && key && !rateLimiter.isAllowed(key)) {
        console.warn(`[DebouncedFunction] Rate limit exceeded for key: ${key}`);
        return;
      }

      // Execute function
      try {
        const result = fn(...args);
        
        // Record successful request
        if (rateLimiter && key) {
          rateLimiter.recordRequest(key, true);
        }
        
        return result;
      } catch (error) {
        // Record failed request
        if (rateLimiter && key) {
          rateLimiter.recordRequest(key, false);
        }
        throw error;
      }
    }, delay);
  }) as T;
}

/**
 * Throttle function with rate limiting
 */
export function createThrottledFunction<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number,
  rateLimiter?: RateLimiter,
  key?: string
): T {
  let lastExecution = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecution;

    const execute = () => {
      // Check rate limiting if provided
      if (rateLimiter && key && !rateLimiter.isAllowed(key)) {
        console.warn(`[ThrottledFunction] Rate limit exceeded for key: ${key}`);
        return;
      }

      try {
        lastExecution = now;
        const result = fn(...args);
        
        // Record successful request
        if (rateLimiter && key) {
          rateLimiter.recordRequest(key, true);
        }
        
        return result;
      } catch (error) {
        // Record failed request
        if (rateLimiter && key) {
          rateLimiter.recordRequest(key, false);
        }
        throw error;
      }
    };

    if (timeSinceLastExecution >= delay) {
      execute();
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(execute, delay - timeSinceLastExecution);
    }
  }) as T;
}

// Default rate limiters for common use cases
export const firestoreRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests per minute
  windowMs: 60 * 1000,
  enableLogging: process.env.NODE_ENV === 'development'
});

export const subscriptionRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 subscription attempts per minute per job
  windowMs: 60 * 1000,
  resetOnSuccess: true,
  enableLogging: process.env.NODE_ENV === 'development'
});

export default RateLimiter;