import { getUserSubscription, GetUserSubscriptionRequest, GetUserSubscriptionResponse } from './paymentService';

interface CacheEntry {
  data: GetUserSubscriptionResponse;
  timestamp: number;
  error?: string;
}

interface PendingRequest {
  promise: Promise<GetUserSubscriptionResponse>;
  timestamp: number;
}

/**
 * Frontend subscription cache service to prevent duplicate HTTP requests
 * Implements request deduplication and time-based caching (5 minutes)
 */
class SubscriptionCacheService {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly PENDING_TIMEOUT = 30 * 1000; // 30 seconds

  /**
   * Generate cache key from user ID
   */
  private getCacheKey(userId: string): string {
    return `subscription_${userId}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  /**
   * Check if pending request has timed out
   */
  private isPendingRequestValid(pending: PendingRequest): boolean {
    return Date.now() - pending.timestamp < this.PENDING_TIMEOUT;
  }

  /**
   * Clean expired cache entries
   */
  private cleanExpiredEntries(): void {
    const now = Date.now();
    
    // Clean expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
    
    // Clean expired pending requests
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp >= this.PENDING_TIMEOUT) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Get subscription with caching and request deduplication
   */
  async getSubscription(request: GetUserSubscriptionRequest): Promise<GetUserSubscriptionResponse> {
    const cacheKey = this.getCacheKey(request.userId);
    
    // Clean expired entries first
    this.cleanExpiredEntries();
    
    // Return cached data if valid
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry && this.isCacheValid(cachedEntry)) {
      return cachedEntry.data;
    }
    
    // Return pending request if exists and valid
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest && this.isPendingRequestValid(pendingRequest)) {
      return pendingRequest.promise;
    }
    
    // Create new request with deduplication
    const requestPromise = this.executeRequest(request);
    
    // Store pending request
    this.pendingRequests.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now()
    });
    
    try {
      const result = await requestPromise;
      
      // Cache successful result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      // Cache error for short duration to prevent immediate retries
      this.cache.set(cacheKey, {
        data: {} as GetUserSubscriptionResponse,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    } finally {
      // Remove pending request
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest(request: GetUserSubscriptionRequest): Promise<GetUserSubscriptionResponse> {
    return getUserSubscription(request);
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateUser(userId: string): void {
    const cacheKey = this.getCacheKey(userId);
    this.cache.delete(cacheKey);
    this.pendingRequests.delete(cacheKey);
  }

  /**
   * Clear all cached data
   */
  clearAll(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    cacheSize: number;
    pendingRequests: number;
    validEntries: number;
  } {
    this.cleanExpiredEntries();
    
    const validEntries = Array.from(this.cache.values())
      .filter(entry => this.isCacheValid(entry) && !entry.error).length;
    
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      validEntries
    };
  }

  /**
   * Check if user subscription is cached
   */
  isUserCached(userId: string): boolean {
    const cacheKey = this.getCacheKey(userId);
    const cachedEntry = this.cache.get(cacheKey);
    return cachedEntry ? this.isCacheValid(cachedEntry) && !cachedEntry.error : false;
  }
}

// Export singleton instance
export const subscriptionCache = new SubscriptionCacheService();

// Export for testing
export { SubscriptionCacheService };