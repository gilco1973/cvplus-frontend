/**
 * Integration Tests for Subscription System
 * 
 * Tests the complete subscription system integration to ensure
 * the fix for excessive Firestore calls is working correctly.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobEnhanced } from '../../hooks/useJobEnhanced';
import { JobSubscriptionManager } from '../JobSubscriptionManager';
import { subscriptionRateLimiter } from '../../utils/rateLimiter';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock('../../lib/firebase', () => ({
  db: {},
}));

// Mock services
jest.mock('../cvService', () => ({
  getJob: jest.fn()
}));

// Mock rate limiter
jest.mock('../../utils/rateLimiter', () => ({
  subscriptionRateLimiter: {
    isAllowed: jest.fn(() => true),
    recordRequest: jest.fn(),
    getTimeUntilReset: jest.fn(() => 0),
    getStats: jest.fn(() => ({
      totalKeys: 0,
      totalRequests: 0,
      activeKeys: []
    })),
    getRemainingRequests: jest.fn(() => 10)
  }
}));

describe('Subscription Integration Tests', () => {
  let manager: JobSubscriptionManager;
  let mockOnSnapshot: jest.Mock;
  let mockGetJob: jest.Mock;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    manager = JobSubscriptionManager.getInstance();
    mockUnsubscribe = jest.fn();
    // Mock imports are handled by jest.mock() at the top
    
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);
    mockGetJob.mockResolvedValue({ id: 'test-job', status: 'processing' });

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    manager.cleanup();
  });

  describe('Multiple Component Subscriptions', () => {
    it('should use single Firestore subscription for multiple components', async () => {
      const jobId = 'integration-test-1';

      // Simulate multiple components subscribing to the same job
      const { result: hook1 } = renderHook(() => useJobEnhanced(jobId));
      const { result: hook2 } = renderHook(() => useJobEnhanced(jobId));
      const { result: hook3 } = renderHook(() => useJobEnhanced(jobId));

      await waitFor(() => {
        expect(hook1.current.job).toBeDefined();
        expect(hook2.current.job).toBeDefined();
        expect(hook3.current.job).toBeDefined();
      });

      // Should only create one Firestore subscription
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

      // All hooks should have the same job data
      expect(hook1.current.job?.id).toBe(jobId);
      expect(hook2.current.job?.id).toBe(jobId);
      expect(hook3.current.job?.id).toBe(jobId);
    });

    it('should handle component unmounting without affecting other subscriptions', async () => {
      const jobId = 'integration-test-2';

      // Create multiple subscriptions
      const { result: hook1, unmount: unmount1 } = renderHook(() => useJobEnhanced(jobId));
      const { result: hook2 } = renderHook(() => useJobEnhanced(jobId));

      await waitFor(() => {
        expect(hook1.current.job).toBeDefined();
        expect(hook2.current.job).toBeDefined();
      });

      // Unmount first component
      unmount1();

      // Second hook should still work
      expect(hook2.current.job?.id).toBe(jobId);
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Should not have called Firestore unsubscribe yet
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
  });

  describe('Error Recovery Integration', () => {
    it('should handle Firestore errors with retry logic', async () => {
      const jobId = 'integration-test-3';

      const { result } = renderHook(() => 
        useJobEnhanced(jobId, { enableRetry: true, maxRetries: 2, retryDelay: 100 })
      );

      // Simulate Firestore error
      const errorCallback = mockOnSnapshot.mock.calls[0][2];
      const mockError = new Error('Network error');

      act(() => {
        errorCallback(mockError);
      });

      await waitFor(() => {
        expect(result.current.retryCount).toBeGreaterThan(0);
      });
    });

    it('should provide manual refresh capabilities', async () => {
      const jobId = 'integration-test-4';
      const updatedJob = { id: jobId, status: 'completed' };

      mockGetJob.mockResolvedValueOnce(updatedJob);

      const { result } = renderHook(() => useJobEnhanced(jobId));

      await waitFor(() => {
        expect(result.current.job).toBeDefined();
      });

      // Manual refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(mockGetJob).toHaveBeenCalledWith(jobId);
    });

    it('should use polling fallback when subscription fails', async () => {
      const jobId = 'integration-test-5';

      const { result } = renderHook(() => 
        useJobEnhanced(jobId, { 
          enableRetry: true, 
          maxRetries: 1, 
          pollWhenInactive: true,
          pollInterval: 100
        })
      );

      // Simulate subscription failures
      const errorCallback = mockOnSnapshot.mock.calls[0][2];
      const mockError = new Error('Persistent error');

      // Fail multiple times to exceed retry limit
      act(() => {
        errorCallback(mockError);
      });

      await waitFor(() => {
        expect(result.current.retryCount).toBe(1);
      });

      act(() => {
        errorCallback(mockError);
      });

      await waitFor(() => {
        expect(result.current.retryCount).toBe(2);
      }, { timeout: 200 });

      // Should start polling
      await waitFor(() => {
        expect(mockGetJob).toHaveBeenCalled();
      }, { timeout: 300 });
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should respect rate limits and prevent excessive subscriptions', () => {
      const jobId = 'integration-test-6';

      // Mock rate limiter to deny requests
      (subscriptionRateLimiter.isAllowed as jest.Mock).mockReturnValue(false);
      (subscriptionRateLimiter.getTimeUntilReset as jest.Mock).mockReturnValue(5000);

      const { result } = renderHook(() => useJobEnhanced(jobId));

      // Should not create Firestore subscription
      expect(mockOnSnapshot).not.toHaveBeenCalled();

      // Should still provide hook interface
      expect(result.current.job).toBeNull();
      expect(result.current.loading).toBe(true);
    });

    it('should track rate limit statistics', () => {
      const jobId = 'integration-test-7';

      // Create subscription
      manager.subscribeToJob(jobId, () => {});

      // Should record request attempt
      expect(subscriptionRateLimiter.recordRequest).toHaveBeenCalledWith(jobId, true);

      // Stats should include rate limiting info
      const stats = manager.getStats();
      expect(stats.rateLimitStats).toBeDefined();
    });
  });

  describe('Performance Optimizations', () => {
    it('should provide cached data immediately to new subscribers', () => {
      const jobId = 'integration-test-8';
      const mockJobData = { id: jobId, status: 'processing' };

      // First subscription
      const callback1 = jest.fn();
      manager.subscribeToJob(jobId, callback1);

      // Simulate job data being cached
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'processing' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      firestoreCallback(mockDoc);

      expect(callback1).toHaveBeenCalledWith(mockJobData);

      // Second subscription should get cached data immediately
      const callback2 = jest.fn();
      manager.subscribeToJob(jobId, callback2);

      expect(callback2).toHaveBeenCalledWith(mockJobData);
    });

    it('should debounce callback executions', async () => {
      const jobId = 'integration-test-9';
      const callback = jest.fn();

      manager.subscribeToJob(jobId, callback, { debounceMs: 50 });

      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'processing' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];

      // Rapid updates
      firestoreCallback(mockDoc);
      firestoreCallback(mockDoc);
      firestoreCallback(mockDoc);

      // Should debounce and only call once after delay
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
      }, { timeout: 100 });
    });
  });

  describe('Memory Management', () => {
    it('should clean up subscriptions properly', (done) => {
      const jobId = 'integration-test-10';
      const callback = jest.fn();

      const unsubscribe = manager.subscribeToJob(jobId, callback);
      
      // Verify subscription exists
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Unsubscribe
      unsubscribe();
      expect(manager.hasActiveSubscribers(jobId)).toBe(false);

      // Cleanup should happen after delay
      setTimeout(() => {
        const stats = manager.getStats();
        expect(stats.subscriptionsByJob[jobId]).toBeUndefined();
        done();
      }, 31000); // Wait for cleanup delay
    }, 35000);

    it('should handle manager cleanup without errors', () => {
      const jobId = 'integration-test-11';
      
      // Create multiple subscriptions
      manager.subscribeToJob(jobId + '1', () => {});
      manager.subscribeToJob(jobId + '2', () => {});
      manager.subscribeToJob(jobId + '3', () => {});

      // Should not throw during cleanup
      expect(() => manager.cleanup()).not.toThrow();

      // Should clean up all subscriptions
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(0);
    });
  });

  describe('Monitoring and Statistics', () => {
    it('should provide comprehensive statistics', () => {
      const jobId1 = 'stats-test-1';
      const jobId2 = 'stats-test-2';

      // Create various subscriptions
      const unsub1 = manager.subscribeToJob(jobId1, () => {});
      const unsub2 = manager.subscribeToJob(jobId1, () => {});
      const unsub3 = manager.subscribeToJob(jobId2, () => {});

      const stats = manager.getStats();

      expect(stats.totalSubscriptions).toBe(2); // 2 unique jobIds
      expect(stats.activeSubscriptions).toBe(2); // 2 active subscriptions
      expect(stats.totalCallbacks).toBe(3); // 3 total callbacks
      expect(stats.subscriptionsByJob[jobId1].callbackCount).toBe(2);
      expect(stats.subscriptionsByJob[jobId2].callbackCount).toBe(1);
      expect(stats.rateLimitStats).toBeDefined();

      // Cleanup
      unsub1();
      unsub2();
      unsub3();
    });

    it('should track subscription activity accurately', () => {
      const jobId = 'activity-test-1';

      // Initially no activity
      expect(manager.hasActiveSubscribers(jobId)).toBe(false);

      // Add subscriber
      const unsubscribe = manager.subscribeToJob(jobId, () => {});
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Remove subscriber
      unsubscribe();
      expect(manager.hasActiveSubscribers(jobId)).toBe(false);
    });
  });
});