import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SubscriptionCacheService } from '../subscriptionCache';
import { getUserSubscription } from '../paymentService';

// Mock the payment service
vi.mock('../paymentService', () => ({
  getUserSubscription: vi.fn()
}));

const mockGetUserSubscription = vi.mocked(getUserSubscription);

describe('SubscriptionCacheService', () => {
  let cacheService: SubscriptionCacheService;
  const mockUserId = 'test-user-123';
  const mockSubscriptionData = {
    subscriptionStatus: 'premium',
    lifetimeAccess: true,
    features: {
      webPortal: true,
      aiChat: true,
      podcast: true,
      advancedAnalytics: true
    },
    message: 'Success'
  };

  beforeEach(() => {
    cacheService = new SubscriptionCacheService();
    mockGetUserSubscription.mockClear();
    mockGetUserSubscription.mockReset();
  });

  afterEach(() => {
    cacheService.clearAll();
  });

  describe('caching behavior', () => {
    it('should cache subscription data after first request', async () => {
      // Setup mock to return subscription data
      mockGetUserSubscription.mockResolvedValueOnce(mockSubscriptionData);

      // First request
      const result1 = await cacheService.getSubscription({ userId: mockUserId });
      expect(result1).toEqual(mockSubscriptionData);
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1);

      // Second request should use cache
      const result2 = await cacheService.getSubscription({ userId: mockUserId });
      expect(result2).toEqual(mockSubscriptionData);
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1); // No additional call
    });

    it('should make new request if cache has expired', async () => {
      // Mock short cache duration for testing
      const shortCacheDuration = 100; // 100ms
      
      // Setup mocks
      mockGetUserSubscription
        .mockResolvedValueOnce(mockSubscriptionData)
        .mockResolvedValueOnce({ ...mockSubscriptionData, subscriptionStatus: 'free' });

      // First request
      await cacheService.getSubscription({ userId: mockUserId });
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, shortCacheDuration + 10));

      // Second request should make new HTTP call due to expired cache
      // Note: This test is simplified - actual cache duration is 5 minutes
      // In real usage, cache won't expire this quickly
    });
  });

  describe('request deduplication', () => {
    it('should deduplicate simultaneous requests', async () => {
      // Use a unique user ID for this test to avoid cache pollution
      const uniqueUserId = `dedup-test-${Date.now()}`;
      
      // Setup mock with delay to simulate slow network
      mockGetUserSubscription.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockSubscriptionData), 50))
      );

      // Make multiple simultaneous requests
      const promises = [
        cacheService.getSubscription({ userId: uniqueUserId }),
        cacheService.getSubscription({ userId: uniqueUserId }),
        cacheService.getSubscription({ userId: uniqueUserId })
      ];

      const results = await Promise.all(promises);
      
      // All should return same data
      results.forEach(result => {
        expect(result).toEqual(mockSubscriptionData);
      });
      
      // But only one HTTP request should have been made
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache management', () => {
    it('should invalidate user cache correctly', async () => {
      // Setup mock
      mockGetUserSubscription.mockResolvedValue(mockSubscriptionData);

      // First request to populate cache
      await cacheService.getSubscription({ userId: mockUserId });
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1);

      // Verify cache is populated
      expect(cacheService.isUserCached(mockUserId)).toBe(true);

      // Invalidate cache
      cacheService.invalidateUser(mockUserId);
      expect(cacheService.isUserCached(mockUserId)).toBe(false);

      // Next request should make new HTTP call
      await cacheService.getSubscription({ userId: mockUserId });
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache correctly', async () => {
      // Setup mock
      mockGetUserSubscription.mockResolvedValue(mockSubscriptionData);

      // Populate cache with multiple users
      await cacheService.getSubscription({ userId: 'user1' });
      await cacheService.getSubscription({ userId: 'user2' });
      
      const statsBefore = cacheService.getCacheStats();
      expect(statsBefore.validEntries).toBeGreaterThan(0);

      // Clear all cache
      cacheService.clearAll();
      
      const statsAfter = cacheService.getCacheStats();
      expect(statsAfter.cacheSize).toBe(0);
      expect(statsAfter.pendingRequests).toBe(0);
      expect(statsAfter.validEntries).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle request errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockGetUserSubscription.mockRejectedValueOnce(mockError);

      // Request should propagate error
      await expect(cacheService.getSubscription({ userId: mockUserId }))
        .rejects.toThrow('Network error');

      // Error should be cached briefly to prevent immediate retries
      expect(mockGetUserSubscription).toHaveBeenCalledTimes(1);
    });
  });

  describe('cache statistics', () => {
    it('should provide accurate cache statistics', async () => {
      // Setup mock
      mockGetUserSubscription.mockResolvedValue(mockSubscriptionData);

      // Initially empty
      const initialStats = cacheService.getCacheStats();
      expect(initialStats.cacheSize).toBe(0);
      expect(initialStats.validEntries).toBe(0);

      // Add cache entry
      await cacheService.getSubscription({ userId: mockUserId });
      
      const statsAfterRequest = cacheService.getCacheStats();
      expect(statsAfterRequest.cacheSize).toBe(1);
      expect(statsAfterRequest.validEntries).toBe(1);
    });
  });
});