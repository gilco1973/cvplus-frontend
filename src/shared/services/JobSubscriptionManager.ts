/**
 * Centralized Job Subscription Manager with Memory Leak Prevention
 * 
 * Prevents excessive Firestore calls by managing a single subscription per jobId
 * and allowing multiple components to subscribe to the same job data.
 * 
 * Enhanced with comprehensive memory leak prevention:
 * - Proper interval cleanup on shutdown
 * - Resource disposal in all error scenarios
 * - Memory usage monitoring and reporting
 * - Graceful application shutdown handling
 */

import { onSnapshot, doc, Unsubscribe } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { subscriptionRateLimiter } from '../utils/rateLimiter';
import type { Job } from './cvService';

// Callback types for different use cases
export type JobCallback = (job: Job | null) => void;
export type ProgressCallback = (job: Job | null, progressData?: any) => void;
export type PreviewCallback = (job: Job | null, previewData?: any) => void;
export type FeatureCallback = (job: Job | null, features?: any[]) => void;

export enum CallbackType {
  GENERAL = 'general',
  PROGRESS = 'progress', 
  PREVIEW = 'preview',
  FEATURES = 'features'
}

interface CallbackRegistration {
  callback: JobCallback;
  type: CallbackType;
  filter?: (job: Job | null) => boolean;
}

interface JobSubscription {
  jobId: string;
  job: Job | null;
  unsubscribe: Unsubscribe;
  callbacks: Map<JobCallback, CallbackRegistration>;
  lastUpdate: number;
  errorCount: number;
  isActive: boolean;
  lastErrorTime?: number;
  consecutiveErrors: number;
  lastJobHash?: string; // Track job content to prevent duplicate logging
}

interface SubscriptionOptions {
  debounceMs?: number;
  maxRetries?: number;
  enableLogging?: boolean;
  callbackType?: CallbackType;
  filter?: (job: Job | null) => boolean;
  errorRecovery?: boolean;
}

interface MemoryStats {
  subscriptionsCount: number;
  callbacksCount: number;
  debounceTimersCount: number;
  pendingCallbacksCount: number;
  cleanupTimersCount: number;
  intervalCount: number;
  memoryUsageKB: number;
  lastCleanupTime: number;
}

interface CleanupTimer {
  timerId: NodeJS.Timeout;
  jobId: string;
  createdAt: number;
}

export class JobSubscriptionManager {
  private static instance: JobSubscriptionManager;
  private static shutdownHandlersSetup = false;
  private subscriptions = new Map<string, JobSubscription>();
  private pendingCallbacks = new Map<string, Map<JobCallback, CallbackRegistration>>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private cleanupTimers = new Map<string, CleanupTimer>();
  private intervals: NodeJS.Timeout[] = [];
  private isShuttingDown = false;
  private memoryMonitoringInterval?: NodeJS.Timeout;
  private lastMemoryCheck = 0;
  private readonly defaultOptions: Required<SubscriptionOptions> = {
    debounceMs: 100,
    maxRetries: 3,
    enableLogging: true,
    callbackType: CallbackType.GENERAL,
    filter: undefined,
    errorRecovery: true
  };

  private constructor() {
    this.setupIntervals();
    this.setupApplicationShutdownHandlers();
    this.startMemoryMonitoring();
  }

  /**
   * Setup intervals with proper cleanup tracking
   */
  private setupIntervals(): void {
    // Cleanup inactive subscriptions every 5 minutes
    const cleanupInterval = setInterval(() => {
      if (!this.isShuttingDown) {
        this.cleanupInactiveSubscriptions();
      }
    }, 5 * 60 * 1000);
    this.intervals.push(cleanupInterval);
    
    // Log subscription stats every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      const statsInterval = setInterval(() => {
        if (!this.isShuttingDown) {
          this.logSubscriptionStats();
        }
      }, 30 * 1000);
      this.intervals.push(statsInterval);
    }
  }

  /**
   * Setup application shutdown handlers for graceful cleanup
   */
  private setupApplicationShutdownHandlers(): void {
    // Only setup handlers once globally to prevent accumulation
    if (JobSubscriptionManager.shutdownHandlersSetup) {
      return;
    }
    
    // Handle browser tab close/refresh
    if (typeof window !== 'undefined') {
      const handleBeforeUnload = () => {
        if (JobSubscriptionManager.instance) {
          JobSubscriptionManager.instance.shutdown();
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleBeforeUnload);
      
      // Handle visibility change (tab switch, minimize)
      const handleVisibilityChange = () => {
        if (JobSubscriptionManager.instance && document.hidden && JobSubscriptionManager.instance.subscriptions.size === 0) {
          // If no active subscriptions and tab is hidden, consider cleanup
          JobSubscriptionManager.instance.cleanupInactiveSubscriptions();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    // Handle Node.js process termination (for SSR/testing)
    if (typeof process !== 'undefined') {
      const handleProcessExit = () => {
        if (JobSubscriptionManager.instance) {
          JobSubscriptionManager.instance.shutdown();
        }
      };
      
      process.on('exit', handleProcessExit);
      process.on('SIGINT', handleProcessExit);
      process.on('SIGTERM', handleProcessExit);
      process.on('uncaughtException', (error) => {
        console.error('[JobSubscriptionManager] Uncaught exception, shutting down:', error);
        if (JobSubscriptionManager.instance) {
          JobSubscriptionManager.instance.shutdown();
        }
      });
    }
    
    JobSubscriptionManager.shutdownHandlersSetup = true;
  }

  /**
   * Start memory usage monitoring
   */
  private startMemoryMonitoring(): void {
    if (process.env.NODE_ENV === 'development') {
      this.memoryMonitoringInterval = setInterval(() => {
        if (!this.isShuttingDown) {
          this.checkMemoryUsage();
        }
      }, 60000); // Check every minute in development
      
      if (this.memoryMonitoringInterval) {
        this.intervals.push(this.memoryMonitoringInterval);
      }
    }
  }

  public static getInstance(): JobSubscriptionManager {
    if (!JobSubscriptionManager.instance) {
      JobSubscriptionManager.instance = new JobSubscriptionManager();
    }
    return JobSubscriptionManager.instance;
  }

  /**
   * Subscribe to job updates with centralized management
   */
  public subscribeToJob(
    jobId: string, 
    callback: (job: Job | null) => void,
    options: SubscriptionOptions = {}
  ): () => void {
    const opts = { ...this.defaultOptions, ...options };
    
    // Check if shutting down - prevent new subscriptions
    if (this.isShuttingDown) {
      if (opts.enableLogging) {
        console.warn(`[JobSubscriptionManager] Ignoring subscription to ${jobId} - shutting down`);
      }
      // Return a no-op unsubscribe function
      return () => {};
    }
    
    // Check rate limiting
    if (!subscriptionRateLimiter.isAllowed(jobId)) {
      const timeUntilReset = subscriptionRateLimiter.getTimeUntilReset(jobId);
      console.warn(`[JobSubscriptionManager] Rate limit exceeded for job ${jobId}. Try again in ${timeUntilReset}ms`);
      
      // Return a no-op unsubscribe function
      return () => {};
    }
    
    if (opts.enableLogging) {
      console.warn(`[JobSubscriptionManager] Subscribing to job: ${jobId}`);
    }
    
    // Record subscription attempt
    subscriptionRateLimiter.recordRequest(jobId, true);

    // Get existing subscription or create new one
    let subscription = this.subscriptions.get(jobId);
    
    if (!subscription) {
      // Create new Firestore subscription
      subscription = this.createNewSubscription(jobId, opts);
      this.subscriptions.set(jobId, subscription);
    }

    // Add callback to subscription with registration info
    const registration: CallbackRegistration = {
      callback,
      type: opts.callbackType || CallbackType.GENERAL,
      filter: opts.filter
    };
    subscription.callbacks.set(callback, registration);

    // If job data already exists, call callback immediately
    if (subscription.job !== null) {
      this.debouncedCallback(jobId, callback, subscription.job, opts.debounceMs);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribeCallback(jobId, callback, opts.enableLogging);
    };
  }

  /**
   * Subscribe to job progress updates with progress-specific filtering
   */
  public subscribeToProgress(
    jobId: string,
    callback: ProgressCallback,
    options: Omit<SubscriptionOptions, 'callbackType'> = {}
  ): () => void {
    const progressFilter = (job: Job | null) => {
      if (!job) return true;
      // Only notify on status changes or progress updates
      return job.status === 'processing' || job.status === 'completed' || 
             job.progress !== undefined || job.features !== undefined;
    };

    return this.subscribeToJob(jobId, callback as JobCallback, {
      ...options,
      callbackType: CallbackType.PROGRESS,
      filter: progressFilter
    });
  }

  /**
   * Subscribe to job preview updates with preview-specific filtering
   */
  public subscribeToPreview(
    jobId: string,
    callback: PreviewCallback,
    options: Omit<SubscriptionOptions, 'callbackType'> = {}
  ): () => void {
    const previewFilter = (job: Job | null) => {
      if (!job) return true;
      // Only notify when preview-related data changes
      return job.status === 'completed' || job.cvData !== undefined ||
             job.previewData !== undefined;
    };

    return this.subscribeToJob(jobId, callback as JobCallback, {
      ...options,
      callbackType: CallbackType.PREVIEW,
      filter: previewFilter
    });
  }

  /**
   * Subscribe to feature-specific updates
   */
  public subscribeToFeatures(
    jobId: string,
    callback: FeatureCallback,
    featureNames?: string[],
    options: Omit<SubscriptionOptions, 'callbackType'> = {}
  ): () => void {
    const featureFilter = (job: Job | null) => {
      if (!job || !job.features) return false;
      
      // If specific features requested, only notify when those change
      if (featureNames && featureNames.length > 0) {
        return job.features.some(f => featureNames.includes(f.name || f.id));
      }
      
      // Otherwise notify on any feature change
      return job.features && job.features.length > 0;
    };

    return this.subscribeToJob(jobId, callback as JobCallback, {
      ...options,
      callbackType: CallbackType.FEATURES,
      filter: featureFilter
    });
  }

  /**
   * Get current job data if available (synchronous)
   */
  public getCurrentJob(jobId: string): Job | null {
    const subscription = this.subscriptions.get(jobId);
    return subscription?.job || null;
  }

  /**
   * Check if a job has active subscribers
   */
  public hasActiveSubscribers(jobId: string): boolean {
    const subscription = this.subscriptions.get(jobId);
    return subscription ? subscription.callbacks.size > 0 : false;
  }

  /**
   * Force refresh a job subscription (useful for error recovery)
   */
  public forceRefresh(jobId: string): void {
    const subscription = this.subscriptions.get(jobId);
    if (subscription) {
      console.warn(`[JobSubscriptionManager] Force refreshing job: ${jobId}`);
      subscription.errorCount = 0;
      // The onSnapshot listener will automatically fetch latest data
    }
  }

  /**
   * Get memory usage statistics
   */
  public getMemoryStats(): MemoryStats {
    const pendingCallbacksCount = Array.from(this.pendingCallbacks.values())
      .reduce((total, set) => total + set.size, 0);
    
    // Estimate memory usage (rough calculation)
    const memoryUsageKB = Math.round((
      (this.subscriptions.size * 1000) + // Rough estimate per subscription
      (this.debounceTimers.size * 100) + // Rough estimate per timer
      (this.cleanupTimers.size * 100) + // Rough estimate per cleanup timer
      (pendingCallbacksCount * 50) // Rough estimate per callback
    ) / 1024);
    
    return {
      subscriptionsCount: this.subscriptions.size,
      callbacksCount: Array.from(this.subscriptions.values())
        .reduce((total, sub) => total + sub.callbacks.size, 0),
      debounceTimersCount: this.debounceTimers.size,
      pendingCallbacksCount,
      cleanupTimersCount: this.cleanupTimers.size,
      intervalCount: this.intervals.length,
      memoryUsageKB,
      lastCleanupTime: this.lastMemoryCheck
    };
  }
  
  /**
   * Check memory usage and log warnings if necessary
   */
  private checkMemoryUsage(): void {
    this.lastMemoryCheck = Date.now();
    const stats = this.getMemoryStats();
    
    // Log memory stats in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[JobSubscriptionManager] Memory Stats:', stats);
    }
    
    // Warn about potential memory issues
    if (stats.subscriptionsCount > 100) {
      console.warn(`[JobSubscriptionManager] High subscription count: ${stats.subscriptionsCount}`);
    }
    
    if (stats.debounceTimersCount > 50) {
      console.warn(`[JobSubscriptionManager] High debounce timer count: ${stats.debounceTimersCount}`);
    }
    
    if (stats.cleanupTimersCount > 20) {
      console.warn(`[JobSubscriptionManager] High cleanup timer count: ${stats.cleanupTimersCount}`);
    }
    
    if (stats.memoryUsageKB > 10240) { // 10MB threshold
      console.warn(`[JobSubscriptionManager] High estimated memory usage: ${stats.memoryUsageKB}KB`);
      // Force cleanup of inactive subscriptions
      this.cleanupInactiveSubscriptions();
    }
  }

  /**
   * Get comprehensive subscription statistics (for debugging)
   */
  public getStats(): {
    totalSubscriptions: number;
    activeSubscriptions: number;
    totalCallbacks: number;
    subscriptionsByJob: Record<string, { callbackCount: number; isActive: boolean; errorCount: number }>;
    rateLimitStats: {
      totalKeys: number;
      totalRequests: number;
      activeKeys: string[];
    };
    memoryStats: MemoryStats;
    isShuttingDown: boolean;
  } {
    const stats = {
      totalSubscriptions: this.subscriptions.size,
      activeSubscriptions: 0,
      totalCallbacks: 0,
      subscriptionsByJob: {} as Record<string, { callbackCount: number; isActive: boolean; errorCount: number }>,
      rateLimitStats: subscriptionRateLimiter.getStats(),
      memoryStats: this.getMemoryStats(),
      isShuttingDown: this.isShuttingDown
    };

    for (const [jobId, subscription] of this.subscriptions) {
      const callbackCount = subscription.callbacks.size;
      const isActive = callbackCount > 0 && subscription.isActive;
      
      if (isActive) {
        stats.activeSubscriptions++;
      }
      
      stats.totalCallbacks += callbackCount;
      stats.subscriptionsByJob[jobId] = {
        callbackCount,
        isActive,
        errorCount: subscription.errorCount
      };
    }

    return stats;
  }

  /**
   * Comprehensive cleanup with memory leak prevention
   */
  public cleanup(): void {
    console.warn(`[JobSubscriptionManager] Starting comprehensive cleanup of ${this.subscriptions.size} subscriptions`);
    
    // Mark as shutting down to prevent new operations
    this.isShuttingDown = true;
    
    try {
      // Clear all Firestore subscriptions
      for (const subscription of this.subscriptions.values()) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('[JobSubscriptionManager] Error unsubscribing:', error);
        }
      }
      
      // Clear all debounce timers
      for (const [key, timer] of this.debounceTimers.entries()) {
        try {
          clearTimeout(timer);
        } catch (error) {
          console.error(`[JobSubscriptionManager] Error clearing debounce timer ${key}:`, error);
        }
      }
      
      // Clear all cleanup timers
      for (const [jobId, cleanupTimer] of this.cleanupTimers.entries()) {
        try {
          clearTimeout(cleanupTimer.timerId);
        } catch (error) {
          console.error(`[JobSubscriptionManager] Error clearing cleanup timer for job ${jobId}:`, error);
        }
      }
      
      // Clear all intervals
      for (const interval of this.intervals) {
        try {
          clearInterval(interval);
        } catch (error) {
          console.error('[JobSubscriptionManager] Error clearing interval:', error);
        }
      }
      
      // Clear memory monitoring interval specifically
      if (this.memoryMonitoringInterval) {
        try {
          clearInterval(this.memoryMonitoringInterval);
        } catch (error) {
          console.error('[JobSubscriptionManager] Error clearing memory monitoring interval:', error);
        }
      }
      
      // Clear all data structures
      this.subscriptions.clear();
      this.pendingCallbacks.clear();
      this.debounceTimers.clear();
      this.cleanupTimers.clear();
      this.intervals.length = 0;
      
      console.warn('[JobSubscriptionManager] Comprehensive cleanup completed successfully');
    } catch (error) {
      console.error('[JobSubscriptionManager] Error during cleanup:', error);
    }
  }

  /**
   * Graceful shutdown with comprehensive resource cleanup
   */
  public shutdown(): void {
    if (this.isShuttingDown) {
      return; // Already shutting down
    }
    
    console.warn('[JobSubscriptionManager] Initiating graceful shutdown');
    
    // Log final memory stats before shutdown
    const finalStats = this.getMemoryStats();
    console.warn('[JobSubscriptionManager] Final memory stats before shutdown:', finalStats);
    
    this.cleanup();
    
    // Reset singleton instance to allow clean recreation if needed
    JobSubscriptionManager.instance = null as any;
    JobSubscriptionManager.shutdownHandlersSetup = false;
  }

  private createNewSubscription(jobId: string, options: Required<SubscriptionOptions>): JobSubscription {
    if (options.enableLogging) {
      console.warn(`[JobSubscriptionManager] Creating new Firestore subscription for job: ${jobId}`);
    }

    const subscription: JobSubscription = {
      jobId,
      job: null,
      unsubscribe: () => {}, // Will be set below
      callbacks: new Map(),
      lastUpdate: Date.now(),
      errorCount: 0,
      consecutiveErrors: 0,
      isActive: true
    };

    // Create Firestore listener
    const unsubscribe = onSnapshot(
      doc(db, 'jobs', jobId),
      (docSnapshot) => {
        try {
          const jobData = docSnapshot.exists() 
            ? { id: docSnapshot.id, ...docSnapshot.data() } as Job
            : null;

          // Create a hash of relevant job data to detect actual changes
          const jobHash = jobData ? `${jobData.status}-${jobData.progress}-${jobData.features?.length || 0}-${jobData.updatedAt || jobData.createdAt}` : 'null';
          const hasActualChange = subscription.lastJobHash !== jobHash;
          
          // Update subscription data
          subscription.job = jobData;
          subscription.lastUpdate = Date.now();
          subscription.errorCount = 0; // Reset error count on success
          subscription.lastJobHash = jobHash;

          // Only log when there's an actual change in meaningful data
          if (options.enableLogging && docSnapshot.exists() && hasActualChange) {
            console.warn(`[JobSubscriptionManager] Job update for ${jobId}:`, docSnapshot.data()?.status);
          }

          // For progress tracking, we want more frequent updates during processing
          // Only skip if there's absolutely no meaningful change
          const isProgressUpdate = jobData && (
            jobData.status === 'processing' || 
            jobData.status === 'generating' ||
            Object.values(jobData.enhancedFeatures || {}).some((f: any) => 
              f.status === 'processing' || f.status === 'retrying'
            )
          );
          
          // For processing states, be more lenient with updates
          if (hasActualChange || isProgressUpdate) {
            // Notify all callbacks with debouncing and filtering
            for (const [callback, registration] of subscription.callbacks) {
              // Apply filter if specified
              if (registration.filter && !registration.filter(jobData)) {
                continue;
              }
              this.debouncedCallback(jobId, callback, jobData, options.debounceMs);
            }
          }
        } catch (error) {
          console.error(`[JobSubscriptionManager] Error processing job update for ${jobId}:`, error);
          subscription.errorCount++;
          
          // If too many errors, mark as inactive
          if (subscription.errorCount >= options.maxRetries) {
            console.warn(`[JobSubscriptionManager] Max errors reached for job ${jobId}, marking as inactive`);
            subscription.isActive = false;
          }
        }
      },
      (error) => {
        console.error(`[JobSubscriptionManager] Firestore error for job ${jobId}:`, error);
        subscription.errorCount++;
        
        if (subscription.errorCount >= options.maxRetries) {
          console.warn(`[JobSubscriptionManager] Max errors reached for job ${jobId}, marking as inactive`);
          subscription.isActive = false;
        }

        // Notify callbacks about the error (pass null)
        for (const [callback, registration] of subscription.callbacks) {
          try {
            callback(null);
          } catch (callbackError) {
            console.error(`[JobSubscriptionManager] Callback error for job ${jobId}:`, callbackError);
          }
        }
      }
    );

    subscription.unsubscribe = unsubscribe;
    return subscription;
  }

  private unsubscribeCallback(jobId: string, callback: (job: Job | null) => void, enableLogging?: boolean): void {
    const subscription = this.subscriptions.get(jobId);
    
    if (!subscription) {
      return;
    }

    // Remove callback
    subscription.callbacks.delete(callback);

    if (enableLogging) {
      console.warn(`[JobSubscriptionManager] Unsubscribed from job: ${jobId}, remaining callbacks: ${subscription.callbacks.size}`);
    }

    // If no more callbacks, cleanup the subscription after a delay
    if (subscription.callbacks.size === 0) {
      // Clear any existing cleanup timer for this job to prevent accumulation
      const existingCleanupTimer = this.cleanupTimers.get(jobId);
      if (existingCleanupTimer) {
        clearTimeout(existingCleanupTimer.timerId);
        this.cleanupTimers.delete(jobId);
      }
      
      // Wait 30 seconds before cleaning up in case component remounts quickly
      const timerId = setTimeout(() => {
        try {
          // Remove from cleanup timers map first
          this.cleanupTimers.delete(jobId);
          
          const currentSubscription = this.subscriptions.get(jobId);
          if (currentSubscription && currentSubscription.callbacks.size === 0) {
            if (enableLogging) {
              console.warn(`[JobSubscriptionManager] Cleaning up unused subscription for job: ${jobId}`);
            }
            
            // Clean up subscription
            try {
              currentSubscription.unsubscribe();
            } catch (error) {
              console.error(`[JobSubscriptionManager] Error unsubscribing from job ${jobId}:`, error);
            }
            
            this.subscriptions.delete(jobId);
            
            // Also clear any pending callbacks for this job
            this.pendingCallbacks.delete(jobId);
          }
        } catch (error) {
          console.error(`[JobSubscriptionManager] Error during delayed cleanup for job ${jobId}:`, error);
          // Ensure cleanup timer is removed even if cleanup fails
          this.cleanupTimers.delete(jobId);
        }
      }, 30000);
      
      // Track the cleanup timer for proper memory management
      this.cleanupTimers.set(jobId, {
        timerId,
        jobId,
        createdAt: Date.now()
      });
    }
  }

  private debouncedCallback(
    jobId: string,
    callback: (job: Job | null) => void,
    jobData: Job | null,
    debounceMs: number
  ): void {
    if (this.isShuttingDown) {
      return; // Don't create new timers during shutdown
    }
    
    // Use a more efficient key that doesn't rely on callback.toString()
    const callbackId = callback.name || `cb_${Math.random().toString(36).substr(2, 9)}`;
    const key = `${jobId}-${callbackId}`;
    
    // Clear existing timer to prevent accumulation
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      try {
        clearTimeout(existingTimer);
      } catch (error) {
        console.error(`[JobSubscriptionManager] Error clearing existing debounce timer for ${key}:`, error);
      }
    }

    // Set new timer with enhanced error handling
    const timer = setTimeout(() => {
      try {
        // Check if we're still not shutting down before executing
        if (!this.isShuttingDown) {
          callback(jobData);
        }
      } catch (error) {
        console.error(`[JobSubscriptionManager] Callback execution error for job ${jobId}:`, error);
      } finally {
        // Always clean up the timer reference, even on error
        try {
          this.debounceTimers.delete(key);
        } catch (deleteError) {
          console.error(`[JobSubscriptionManager] Error deleting debounce timer ${key}:`, deleteError);
        }
      }
    }, debounceMs);

    this.debounceTimers.set(key, timer);
  }

  private cleanupInactiveSubscriptions(): void {
    if (this.isShuttingDown) {
      return;
    }
    
    const now = Date.now();
    const inactivityThreshold = 10 * 60 * 1000; // 10 minutes
    let cleanedCount = 0;
    const jobsToClean: string[] = [];

    // First, identify jobs to clean
    for (const [jobId, subscription] of this.subscriptions) {
      const isInactive = (
        subscription.callbacks.size === 0 || 
        !subscription.isActive ||
        (now - subscription.lastUpdate) > inactivityThreshold
      );

      if (isInactive) {
        jobsToClean.push(jobId);
      }
    }
    
    // Then clean them up with proper error handling
    for (const jobId of jobsToClean) {
      try {
        const subscription = this.subscriptions.get(jobId);
        if (subscription) {
          console.warn(`[JobSubscriptionManager] Cleaning up inactive subscription for job: ${jobId}`);
          
          // Clean up Firestore subscription
          try {
            subscription.unsubscribe();
          } catch (error) {
            console.error(`[JobSubscriptionManager] Error unsubscribing from job ${jobId}:`, error);
          }
          
          // Remove from subscriptions
          this.subscriptions.delete(jobId);
          
          // Clean up any associated cleanup timers
          const cleanupTimer = this.cleanupTimers.get(jobId);
          if (cleanupTimer) {
            try {
              clearTimeout(cleanupTimer.timerId);
            } catch (error) {
              console.error(`[JobSubscriptionManager] Error clearing cleanup timer for job ${jobId}:`, error);
            }
            this.cleanupTimers.delete(jobId);
          }
          
          // Clean up any pending callbacks
          this.pendingCallbacks.delete(jobId);
          
          // Clean up any related debounce timers
          for (const [key, timer] of this.debounceTimers.entries()) {
            if (key.startsWith(jobId + '-')) {
              try {
                clearTimeout(timer);
                this.debounceTimers.delete(key);
              } catch (error) {
                console.error(`[JobSubscriptionManager] Error clearing debounce timer ${key}:`, error);
              }
            }
          }
          
          cleanedCount++;
        }
      } catch (error) {
        console.error(`[JobSubscriptionManager] Error cleaning up subscription for job ${jobId}:`, error);
      }
    }

    if (cleanedCount > 0) {
      console.warn(`[JobSubscriptionManager] Cleaned up ${cleanedCount} inactive subscriptions`);
      
      // Log memory stats after cleanup in development
      if (process.env.NODE_ENV === 'development') {
        const memStats = this.getMemoryStats();
        console.warn('[JobSubscriptionManager] Memory stats after cleanup:', memStats);
      }
    }
    
    // Also cleanup any orphaned cleanup timers (older than 5 minutes)
    this.cleanupOrphanedTimers();
  }
  
  /**
   * Clean up orphaned cleanup timers that may have been left behind
   */
  private cleanupOrphanedTimers(): void {
    const now = Date.now();
    const orphanThreshold = 5 * 60 * 1000; // 5 minutes
    const timersToRemove: string[] = [];
    
    for (const [jobId, cleanupTimer] of this.cleanupTimers.entries()) {
      if ((now - cleanupTimer.createdAt) > orphanThreshold) {
        timersToRemove.push(jobId);
      }
    }
    
    for (const jobId of timersToRemove) {
      const cleanupTimer = this.cleanupTimers.get(jobId);
      if (cleanupTimer) {
        try {
          clearTimeout(cleanupTimer.timerId);
        } catch (error) {
          console.error(`[JobSubscriptionManager] Error clearing orphaned timer for job ${jobId}:`, error);
        }
        this.cleanupTimers.delete(jobId);
      }
    }
    
    if (timersToRemove.length > 0) {
      console.warn(`[JobSubscriptionManager] Cleaned up ${timersToRemove.length} orphaned cleanup timers`);
    }
  }

  private logSubscriptionStats(): void {
    const stats = this.getStats();
    console.warn('[JobSubscriptionManager] Stats:', {
      total: stats.totalSubscriptions,
      active: stats.activeSubscriptions,
      callbacks: stats.totalCallbacks,
      memory: stats.memoryStats,
      shuttingDown: stats.isShuttingDown,
      details: stats.subscriptionsByJob
    });
  }
}

// Export singleton instance
export const jobSubscriptionManager = JobSubscriptionManager.getInstance();

// Export convenience function for compatibility
export const subscribeToJobCentralized = (
  jobId: string, 
  callback: (job: Job | null) => void,
  options?: SubscriptionOptions
): (() => void) => {
  return jobSubscriptionManager.subscribeToJob(jobId, callback, options);
};

export default JobSubscriptionManager;