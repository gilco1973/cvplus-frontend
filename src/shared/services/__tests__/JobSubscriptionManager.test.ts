/**
 * Tests for JobSubscriptionManager
 * 
 * Tests the centralized subscription management system to ensure
 * proper functionality and prevent excessive Firestore calls.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobSubscriptionManager } from '../JobSubscriptionManager';
import { subscriptionRateLimiter } from '../../utils/rateLimiter';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn(),
  doc: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock rate limiter
vi.mock('../../utils/rateLimiter', () => ({
  subscriptionRateLimiter: {
    isAllowed: vi.fn(() => true),
    recordRequest: vi.fn(),
    getTimeUntilReset: vi.fn(() => 0),
    getStats: vi.fn(() => ({
      totalKeys: 0,
      totalRequests: 0,
      activeKeys: []
    }))
  }
}));

describe('JobSubscriptionManager', () => {
  let manager: JobSubscriptionManager;
  let mockOnSnapshot: any;
  let mockUnsubscribe: any;

  beforeEach(async () => {
    // Reset singleton instance
    (JobSubscriptionManager as any).instance = undefined;
    (JobSubscriptionManager as any).shutdownHandlersSetup = false;
    
    manager = JobSubscriptionManager.getInstance();
    mockUnsubscribe = vi.fn();
    
    const { onSnapshot } = await import('firebase/firestore');
    mockOnSnapshot = onSnapshot as any;
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    manager.cleanup();
    (JobSubscriptionManager as any).instance = undefined;
    (JobSubscriptionManager as any).shutdownHandlersSetup = false;
  });

  describe('Subscription Management', () => {
    it('should create only one Firestore subscription per jobId', () => {
      const jobId = 'test-job-1';
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Subscribe twice to the same job
      manager.subscribeToJob(jobId, callback1);
      manager.subscribeToJob(jobId, callback2);

      // Should only call onSnapshot once
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });

    it('should call all callbacks when job updates', () => {
      const jobId = 'test-job-2';
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Setup subscriptions
      manager.subscribeToJob(jobId, callback1);
      manager.subscribeToJob(jobId, callback2);

      // Simulate Firestore update
      const mockJobData = { id: jobId, status: 'completed' };
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'completed' })
      };

      // Get the callback passed to onSnapshot and call it
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      firestoreCallback(mockDoc);

      // Both callbacks should be called
      expect(callback1).toHaveBeenCalledWith(mockJobData);
      expect(callback2).toHaveBeenCalledWith(mockJobData);
    });

    it('should handle subscription cleanup properly', () => {
      const jobId = 'test-job-3';
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Subscribe
      const unsubscribe1 = manager.subscribeToJob(jobId, callback1);
      const unsubscribe2 = manager.subscribeToJob(jobId, callback2);

      // Unsubscribe one callback
      unsubscribe1();

      // Should still have active subscription
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Unsubscribe second callback
      unsubscribe2();

      // Should schedule cleanup but subscription should still exist initially
      expect(manager.hasActiveSubscribers(jobId)).toBe(false);
    });

    it('should rate limit subscription attempts', () => {
      const jobId = 'test-job-4';
      const callback = vi.fn();

      // Mock rate limiter to deny requests
      (subscriptionRateLimiter.isAllowed as any).mockReturnValue(false);
      (subscriptionRateLimiter.getTimeUntilReset as any).mockReturnValue(5000);

      // Attempt to subscribe
      const unsubscribe = manager.subscribeToJob(jobId, callback);

      // Should not create Firestore subscription
      expect(mockOnSnapshot).not.toHaveBeenCalled();

      // Should return a no-op unsubscribe function
      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // Should not throw
    });
  });

  describe('Caching and Performance', () => {
    it('should provide cached job data immediately', () => {
      const jobId = 'test-job-5';
      const mockJobData = { id: jobId, status: 'processing' };
      
      // First subscription - simulate job data being set
      const callback1 = vi.fn();
      manager.subscribeToJob(jobId, callback1);

      // Simulate Firestore callback setting job data
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'processing' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      firestoreCallback(mockDoc);

      // Second subscription should get cached data immediately
      const callback2 = vi.fn();
      manager.subscribeToJob(jobId, callback2);

      // callback2 should be called immediately with cached data
      expect(callback2).toHaveBeenCalledWith(mockJobData);
    });

    it('should return current job data synchronously', () => {
      const jobId = 'test-job-6';
      
      // Initially should return null
      expect(manager.getCurrentJob(jobId)).toBeNull();

      // Subscribe and simulate data
      manager.subscribeToJob(jobId, vi.fn());
      
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'completed' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      firestoreCallback(mockDoc);

      // Should return cached data
      const cachedJob = manager.getCurrentJob(jobId);
      expect(cachedJob).toEqual({ id: jobId, status: 'completed' });
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', () => {
      const jobId = 'test-job-7';
      const callback = vi.fn();

      manager.subscribeToJob(jobId, callback);

      // Simulate Firestore error
      const errorCallback = mockOnSnapshot.mock.calls[0][2];
      const mockError = new Error('Firestore error');
      errorCallback(mockError);

      // Callback should be called with null
      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should track error counts', () => {
      const jobId = 'test-job-8';
      const callback = vi.fn();

      manager.subscribeToJob(jobId, callback);

      // Simulate multiple errors
      const errorCallback = mockOnSnapshot.mock.calls[0][2];
      const mockError = new Error('Firestore error');
      
      errorCallback(mockError);
      errorCallback(mockError);
      errorCallback(mockError);

      // Check stats include error count
      const stats = manager.getStats();
      expect(stats.subscriptionsByJob[jobId]?.errorCount).toBeGreaterThan(0);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should provide accurate statistics', () => {
      const jobId1 = 'test-job-9';
      const jobId2 = 'test-job-10';
      
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      // Create subscriptions
      manager.subscribeToJob(jobId1, callback1);
      manager.subscribeToJob(jobId1, callback2);
      manager.subscribeToJob(jobId2, callback3);

      const stats = manager.getStats();

      expect(stats.totalSubscriptions).toBe(2);
      expect(stats.activeSubscriptions).toBe(2);
      expect(stats.totalCallbacks).toBe(3);
      expect(stats.subscriptionsByJob[jobId1].callbackCount).toBe(2);
      expect(stats.subscriptionsByJob[jobId2].callbackCount).toBe(1);
    });

    it('should include rate limit statistics', () => {
      const stats = manager.getStats();
      
      expect(stats.rateLimitStats).toBeDefined();
      expect(stats.rateLimitStats.totalKeys).toBeDefined();
      expect(stats.rateLimitStats.totalRequests).toBeDefined();
      expect(stats.rateLimitStats.activeKeys).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup unused subscriptions', (done) => {
      const jobId = 'test-job-11';
      const callback = vi.fn();

      const unsubscribe = manager.subscribeToJob(jobId, callback);
      unsubscribe();

      // Subscriptions are cleaned up after a delay
      setTimeout(() => {
        const stats = manager.getStats();
        expect(stats.subscriptionsByJob[jobId]).toBeUndefined();
        done();
      }, 31000); // Wait for cleanup timeout
    }, 35000);

    it('should cleanup on manager cleanup', () => {
      const jobId = 'test-job-12';
      const callback = vi.fn();

      manager.subscribeToJob(jobId, callback);
      
      // Verify subscription exists
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Cleanup
      manager.cleanup();

      // Verify cleanup
      expect(mockUnsubscribe).toHaveBeenCalled();
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(0);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = JobSubscriptionManager.getInstance();
      const instance2 = JobSubscriptionManager.getInstance();

      expect(instance1).toBe(instance2);
    });
  });
});