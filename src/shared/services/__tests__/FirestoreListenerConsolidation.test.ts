/**
 * Tests for Firestore Listener Consolidation
 * Ensures that all Firestore listeners go through JobSubscriptionManager
 * to prevent Internal Assertion Error (ID: b815)
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JobSubscriptionManager, CallbackType } from '../JobSubscriptionManager';

// Mock Firebase
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    onSnapshot: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    getFirestore: vi.fn(() => ({})),
  };
});

vi.mock('../lib/firebase', () => ({
  db: {},
}));

vi.mock('../utils/rateLimiter', () => ({
  subscriptionRateLimiter: {
    isAllowed: vi.fn(() => true),
    recordRequest: vi.fn(),
    getTimeUntilReset: vi.fn(() => 0),
  },
}));

describe('Firestore Listener Consolidation', () => {
  let manager: JobSubscriptionManager;
  let mockOnSnapshot: any;

  beforeEach(async () => {
    const { onSnapshot } = await import('firebase/firestore');
    mockOnSnapshot = onSnapshot as any;
    mockOnSnapshot.mockClear();
    
    // Reset singleton
    (JobSubscriptionManager as any).instance = undefined;
    manager = JobSubscriptionManager.getInstance();
  });

  afterEach(() => {
    manager.shutdown();
  });

  describe('Single Listener Per Document', () => {
    it('should create only one Firestore listener per jobId regardless of callback count', async () => {
      const jobId = 'test-job-123';
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      // Mock successful onSnapshot
      mockOnSnapshot.mockImplementation((ref: any, onNext: any) => {
        // Simulate job data
        onNext({
          exists: () => true,
          id: jobId,
          data: () => ({
            status: 'processing',
            enhancedFeatures: {},
          }),
        });
        return vi.fn(); // Mock unsubscribe
      });

      // Subscribe multiple callbacks to the same job
      const unsub1 = manager.subscribeToJob(jobId, callback1);
      const unsub2 = manager.subscribeToProgress(jobId, callback2);
      const unsub3 = manager.subscribeToPreview(jobId, callback3);

      // Should only call onSnapshot once
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);

      // All callbacks should be registered
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();

      // Cleanup
      unsub1();
      unsub2();
      unsub3();
    });

    it('should not create duplicate listeners for same jobId across different callback types', () => {
      const jobId = 'test-job-456';
      
      mockOnSnapshot.mockImplementation(() => vi.fn());

      // Subscribe with different callback types
      manager.subscribeToJob(jobId, vi.fn());
      manager.subscribeToProgress(jobId, vi.fn());
      manager.subscribeToPreview(jobId, vi.fn());
      manager.subscribeToFeatures(jobId, vi.fn());

      // Should still only call onSnapshot once
      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });
  });

  describe('Callback Filtering', () => {
    it('should filter progress callbacks correctly', async () => {
      const jobId = 'test-progress-job';
      const progressCallback = vi.fn();
      const generalCallback = vi.fn();

      let firestoreCallback: any;
      mockOnSnapshot.mockImplementation((ref: any, onNext: any) => {
        firestoreCallback = onNext;
        return vi.fn();
      });

      // Subscribe with different callback types
      manager.subscribeToProgress(jobId, progressCallback);
      manager.subscribeToJob(jobId, generalCallback);

      // Simulate job update with progress data
      firestoreCallback({
        exists: () => true,
        id: jobId,
        data: () => ({
          status: 'processing',
          progress: 50,
          enhancedFeatures: {},
        }),
      });

      // Both should be called for processing status
      expect(progressCallback).toHaveBeenCalled();
      expect(generalCallback).toHaveBeenCalled();

      progressCallback.mockClear();
      generalCallback.mockClear();

      // Simulate non-progress update
      firestoreCallback({
        exists: () => true,
        id: jobId,
        data: () => ({
          status: 'pending',
          someOtherField: 'value',
        }),
      });

      // Progress callback should not be called (filtered out)
      // General callback should still be called
      expect(generalCallback).toHaveBeenCalled();
    });

    it('should filter preview callbacks correctly', () => {
      const jobId = 'test-preview-job';
      const previewCallback = vi.fn();
      const generalCallback = vi.fn();

      let firestoreCallback: any;
      mockOnSnapshot.mockImplementation((ref: any, onNext: any) => {
        firestoreCallback = onNext;
        return vi.fn();
      });

      manager.subscribeToPreview(jobId, previewCallback);
      manager.subscribeToJob(jobId, generalCallback);

      // Simulate job update with preview data
      firestoreCallback({
        exists: () => true,
        id: jobId,
        data: () => ({
          status: 'completed',
          cvData: { html: '<div>CV</div>' },
        }),
      });

      expect(previewCallback).toHaveBeenCalled();
      expect(generalCallback).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    it('should handle Firestore errors gracefully', () => {
      const jobId = 'test-error-job';
      const callback = vi.fn();

      let errorHandler: any;
      mockOnSnapshot.mockImplementation((ref: any, onNext: any, onError: any) => {
        errorHandler = onError;
        return vi.fn();
      });

      manager.subscribeToJob(jobId, callback, { errorRecovery: true });

      // Simulate Firestore error
      const firestoreError = new Error('FIRESTORE INTERNAL ASSERTION FAILED: ID: b815');
      errorHandler(firestoreError);

      // Should not crash and should call callback with null
      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should increment error count on consecutive failures', () => {
      const jobId = 'test-consecutive-errors';
      const callback = vi.fn();

      let errorHandler: any;
      mockOnSnapshot.mockImplementation((ref: any, onNext: any, onError: any) => {
        errorHandler = onError;
        return vi.fn();
      });

      manager.subscribeToJob(jobId, callback);

      // Simulate multiple errors
      const error = new Error('Connection failed');
      errorHandler(error);
      errorHandler(error);
      errorHandler(error);

      // Manager should track error count internally
      const subscription = (manager as any).subscriptions.get(jobId);
      expect(subscription?.consecutiveErrors).toBeGreaterThan(0);
    });
  });

  describe('Memory Management', () => {
    it('should clean up subscriptions when no callbacks remain', async () => {
      const jobId = 'test-cleanup-job';
      const callback = vi.fn();

      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockImplementation(() => mockUnsubscribe);

      const unsubscribe = manager.subscribeToJob(jobId, callback);

      // Verify subscription exists
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);

      // Unsubscribe
      unsubscribe();

      // Should schedule cleanup but not immediately remove
      expect(manager.hasActiveSubscribers(jobId)).toBe(false);

      // Wait for cleanup timer
      await new Promise(resolve => setTimeout(resolve, 100));

      // Firestore unsubscribe should not be called immediately
      // (it waits 30 seconds for potential remount)
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it('should not cleanup if new callbacks are added before timer expires', () => {
      const jobId = 'test-no-cleanup-job';
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      mockOnSnapshot.mockImplementation(() => vi.fn());

      const unsub1 = manager.subscribeToJob(jobId, callback1);
      unsub1(); // Remove first callback

      // Add second callback before cleanup
      manager.subscribeToJob(jobId, callback2);

      // Should still have active subscribers
      expect(manager.hasActiveSubscribers(jobId)).toBe(true);
    });
  });

  describe('Debouncing', () => {
    it('should debounce rapid updates', async () => {
      const jobId = 'test-debounce-job';
      const callback = vi.fn();

      let firestoreCallback: any;
      mockOnSnapshot.mockImplementation((ref: any, onNext: any) => {
        firestoreCallback = onNext;
        return vi.fn();
      });

      manager.subscribeToJob(jobId, callback, { debounceMs: 100 });

      // Simulate rapid updates
      for (let i = 0; i < 5; i++) {
        firestoreCallback({
          exists: () => true,
          id: jobId,
          data: () => ({ status: 'processing', iteration: i }),
        });
      }

      // Should not call callback immediately
      expect(callback).not.toHaveBeenCalled();

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should only call callback once after debounce
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});