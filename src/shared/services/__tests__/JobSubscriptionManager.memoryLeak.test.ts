/**
 * Memory Leak Prevention Tests for JobSubscriptionManager
 * 
 * Comprehensive tests to verify that all memory leak vulnerabilities
 * have been properly addressed.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobSubscriptionManager } from '../JobSubscriptionManager';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  onSnapshot: vi.fn(),
  doc: vi.fn(),
}));

vi.mock('../../lib/firebase', () => ({
  db: {},
}));

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

describe('JobSubscriptionManager - Memory Leak Prevention', () => {
  let manager: JobSubscriptionManager;
  let mockOnSnapshot: any;
  let mockUnsubscribe: any;

  beforeEach(async () => {
    // Reset singleton instance
    (JobSubscriptionManager as any).instance = undefined;
    manager = JobSubscriptionManager.getInstance();
    
    // Setup mocks
    const { onSnapshot } = await import('firebase/firestore');
    mockOnSnapshot = onSnapshot as any;
    mockUnsubscribe = vi.fn();
    mockOnSnapshot.mockReturnValue(mockUnsubscribe);

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up manager
    if (manager && typeof manager.cleanup === 'function') {
      manager.cleanup();
    }
    
    // Reset singleton instance for clean tests
    (JobSubscriptionManager as any).instance = undefined;
    (JobSubscriptionManager as any).shutdownHandlersSetup = false;
  });

  describe('Memory Statistics Tracking', () => {
    it('should provide accurate memory statistics', () => {
      const jobId1 = 'test-memory-1';
      const jobId2 = 'test-memory-2';
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      // Create subscriptions
      manager.subscribeToJob(jobId1, callback1);
      manager.subscribeToJob(jobId2, callback2);
      
      const memStats = manager.getMemoryStats();
      
      expect(memStats.subscriptionsCount).toBe(2);
      expect(memStats.callbacksCount).toBe(2);
      expect(memStats.debounceTimersCount).toBeGreaterThanOrEqual(0);
      expect(memStats.cleanupTimersCount).toBeGreaterThanOrEqual(0);
      expect(memStats.intervalCount).toBeGreaterThan(0);
      expect(memStats.memoryUsageKB).toBeGreaterThanOrEqual(0);
      expect(memStats.lastCleanupTime).toBeDefined();
    });

    it('should include memory stats in regular statistics', () => {
      const stats = manager.getStats();
      
      expect(stats.memoryStats).toBeDefined();
      expect(stats.memoryStats.subscriptionsCount).toBeDefined();
      expect(stats.memoryStats.callbacksCount).toBeDefined();
      expect(stats.memoryStats.memoryUsageKB).toBeDefined();
      expect(stats.isShuttingDown).toBe(false);
    });
  });

  describe('Comprehensive Cleanup', () => {
    it('should cleanup all resources on shutdown', () => {
      const jobId = 'test-cleanup';
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
      expect(stats.memoryStats.debounceTimersCount).toBe(0);
      expect(stats.memoryStats.cleanupTimersCount).toBe(0);
    });

    it('should handle graceful shutdown properly', () => {
      const jobId = 'test-graceful-shutdown';
      const callback = vi.fn();
      
      manager.subscribeToJob(jobId, callback);
      
      // Verify manager is not shutting down initially
      const initialStats = manager.getStats();
      expect(initialStats.isShuttingDown).toBe(false);
      
      // Shutdown should mark as shutting down and cleanup everything
      manager.shutdown();
      
      // Verify all resources are cleaned up
      expect(mockUnsubscribe).toHaveBeenCalled();
      
      const afterShutdown = manager.getStats();
      expect(afterShutdown.totalSubscriptions).toBe(0);
    });
  });

  describe('Cleanup Timer Management', () => {
    it('should track cleanup timers properly', () => {
      const jobId = 'test-cleanup-timer';
      const callback = vi.fn();
      
      // Subscribe and then unsubscribe to create cleanup timer
      const unsubscribe = manager.subscribeToJob(jobId, callback);
      unsubscribe();
      
      // Should have created a cleanup timer
      const stats = manager.getStats();
      expect(stats.memoryStats.cleanupTimersCount).toBeGreaterThan(0);
    });

    it('should prevent accumulation of cleanup timers', () => {
      const jobId = 'test-accumulation';
      const callback = vi.fn();
      
      // Subscribe and unsubscribe multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const unsubscribe = manager.subscribeToJob(jobId, callback);
        unsubscribe();
      }
      
      // Should only have one cleanup timer (previous ones should be cleared)
      const stats = manager.getStats();
      expect(stats.memoryStats.cleanupTimersCount).toBe(1);
    });
  });

  describe('Debounce Timer Management', () => {
    it('should cleanup debounce timers on shutdown', () => {
      const jobId = 'test-debounce';
      const callback = vi.fn();
      
      // Subscribe to trigger debounce timer creation
      manager.subscribeToJob(jobId, callback);
      
      // Simulate job update to create debounce timer
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'processing' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      firestoreCallback(mockDoc);
      
      // Cleanup should clear all debounce timers
      manager.cleanup();
      
      const finalStats = manager.getStats();
      expect(finalStats.memoryStats.debounceTimersCount).toBe(0);
    });

    it('should handle debounce timer errors gracefully', () => {
      const jobId = 'test-error';
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      
      manager.subscribeToJob(jobId, errorCallback);
      
      // Simulate job update
      const mockDoc = {
        exists: () => true,
        id: jobId,
        data: () => ({ status: 'completed' })
      };
      const firestoreCallback = mockOnSnapshot.mock.calls[0][1];
      
      // Should not throw error even if callback fails
      expect(() => firestoreCallback(mockDoc)).not.toThrow();
    });
  });

  describe('Error Recovery', () => {
    it('should cleanup resources even when errors occur', () => {
      const jobId = 'test-error-cleanup';
      const callback = vi.fn();
      
      manager.subscribeToJob(jobId, callback);
      
      // Simulate Firestore error
      const errorCallback = mockOnSnapshot.mock.calls[0][2];
      const mockError = new Error('Firestore connection error');
      
      // Should not throw during error handling
      expect(() => errorCallback(mockError)).not.toThrow();
      
      // Cleanup should still work after errors
      expect(() => manager.cleanup()).not.toThrow();
      
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(0);
    });

    it('should handle cleanup errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock unsubscribe to throw error
      mockUnsubscribe.mockImplementation(() => {
        throw new Error('Unsubscribe error');
      });
      
      const jobId = 'test-cleanup-error';
      const callback = vi.fn();
      
      manager.subscribeToJob(jobId, callback);
      
      // Should not throw even if unsubscribe fails
      expect(() => manager.cleanup()).not.toThrow();
      
      // Should log the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error unsubscribing'),
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Singleton Management', () => {
    it('should reset singleton instance after shutdown', () => {
      const instance1 = JobSubscriptionManager.getInstance();
      
      // Shutdown resets the singleton
      instance1.shutdown();
      
      const instance2 = JobSubscriptionManager.getInstance();
      
      // Should be different instances
      expect(instance1).not.toBe(instance2);
      
      // New instance should be functional
      expect(instance2.getStats().isShuttingDown).toBe(false);
    });

    it('should prevent operations during shutdown', () => {
      const jobId = 'test-shutdown-prevention';
      const callback = vi.fn();
      
      // Start shutdown
      manager.shutdown();
      
      // Try to subscribe during shutdown
      const unsubscribe = manager.subscribeToJob(jobId, callback);
      
      // Should return no-op function
      expect(typeof unsubscribe).toBe('function');
      unsubscribe(); // Should not throw
      
      // No subscription should have been created
      const stats = manager.getStats();
      expect(stats.totalSubscriptions).toBe(0);
    });
  });

  describe('Memory Leak Regression Prevention', () => {
    it('should not accumulate resources over subscription cycles', () => {
      const initialMemory = manager.getMemoryStats();
      
      // Create and destroy many subscriptions
      for (let i = 0; i < 20; i++) {
        const unsubscribe = manager.subscribeToJob(`temp-job-${i}`, vi.fn());
        unsubscribe();
      }
      
      const afterCycles = manager.getMemoryStats();
      
      // Should not have accumulated excessive resources
      expect(afterCycles.cleanupTimersCount).toBeLessThan(25); // Some cleanup timers expected
      expect(afterCycles.debounceTimersCount).toBeLessThan(5); // Minimal debounce timers
    });

    it('should maintain stable memory profile', () => {
      const jobId = 'test-stable';
      const callback = vi.fn();
      
      // Baseline
      const baseline = manager.getMemoryStats();
      
      // Subscribe
      const unsubscribe = manager.subscribeToJob(jobId, callback);
      const withSubscription = manager.getMemoryStats();
      
      // Should have increased subscription count
      expect(withSubscription.subscriptionsCount).toBe(baseline.subscriptionsCount + 1);
      expect(withSubscription.callbacksCount).toBe(baseline.callbacksCount + 1);
      
      // Unsubscribe
      unsubscribe();
      const afterUnsubscribe = manager.getMemoryStats();
      
      // After unsubscribe, the subscription still exists but has no callbacks
      // The subscription will be cleaned up after a 30-second delay
      expect(afterUnsubscribe.subscriptionsCount).toBe(baseline.subscriptionsCount + 1); // Still exists
      expect(afterUnsubscribe.callbacksCount).toBe(baseline.callbacksCount); // No callbacks
      expect(afterUnsubscribe.cleanupTimersCount).toBeGreaterThan(baseline.cleanupTimersCount); // Cleanup timer created
    });
  });
});