/**
 * Enhanced Firestore Listener Validator
 * 
 * Comprehensive runtime utility to detect, prevent, and resolve duplicate Firestore listeners
 * that could cause Internal Assertion Error (ID: b815) and other listener conflicts
 * 
 * Features:
 * - Real-time duplicate listener detection
 * - Emergency cleanup mechanisms  
 * - Integration with FirestoreErrorBoundary
 * - Memory leak prevention
 * - Advanced warning systems with actionable alerts
 */

import { JobSubscriptionManager } from '../services/JobSubscriptionManager';

interface ListenerInfo {
  jobId: string;
  callbackCount: number;
  callbackTypes: string[];
  created: number;
  lastUpdate: number;
  stackTrace?: string; // For debugging listener creation
  componentId?: string; // Component identifier for better tracking
}

interface ValidationIssue {
  type: 'DUPLICATE_LISTENERS' | 'MEMORY_LEAK' | 'ORPHANED_TIMERS' | 'STALE_SUBSCRIPTIONS' | 'PERFORMANCE_DEGRADATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  jobId?: string;
  details: Record<string, any>;
  suggestedActions: string[];
  timestamp: number;
}

interface ValidationReport {
  lastValidation: number;
  timeSinceLastValidation: number;
  activeListeners: ListenerInfo[];
  memoryStats: any;
  issues: ValidationIssue[];
  healthScore: number; // 0-100 overall health score
  recommendations: string[];
}

export class FirestoreListenerValidator {
  private static instance: FirestoreListenerValidator;
  private validationInterval?: NodeJS.Timeout;
  private lastValidation = 0;
  private issueHistory: ValidationIssue[] = [];
  private alertThresholds = {
    duplicateListeners: 2,
    memoryUsageKB: 1000,
    staleSubscriptionMinutes: 30,
    maxIssueHistory: 50
  };
  private emergencyCleanupInProgress = false;
  private validationCallbacks: Array<(report: ValidationReport) => void> = [];

  constructor() {
    // Register for emergency cleanup events from FirestoreErrorBoundary
    if (typeof window !== 'undefined') {
      window.addEventListener('firestore-cleanup-listeners', () => {
        this.handleEmergencyCleanup();
      });
    }
  }

  static getInstance(): FirestoreListenerValidator {
    if (!FirestoreListenerValidator.instance) {
      FirestoreListenerValidator.instance = new FirestoreListenerValidator();
    }
    return FirestoreListenerValidator.instance;
  }

  /**
   * Start monitoring for duplicate listeners
   */
  startMonitoring(intervalMs = 10000): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }

    console.warn('🔍 [FirestoreValidator] Starting listener monitoring...');
    
    this.validationInterval = setInterval(() => {
      this.validateListeners();
    }, intervalMs);

    // Run initial validation
    this.validateListeners();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = undefined;
    }
    console.warn('🔍 [FirestoreValidator] Stopped listener monitoring');
  }

  /**
   * Validate current listener state with comprehensive issue detection
   */
  validateListeners(): ValidationReport {
    const now = Date.now();
    this.lastValidation = now;

    const manager = JobSubscriptionManager.getInstance();
    const stats = manager.getMemoryStats();
    const activeListeners = this.getActiveListeners();

    // Comprehensive issue detection
    const issues = this.detectIssues(activeListeners, stats, now);
    
    // Calculate health score
    const healthScore = this.calculateHealthScore(issues, stats, activeListeners.length);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, stats);

    // Create validation report
    const report: ValidationReport = {
      lastValidation: this.lastValidation,
      timeSinceLastValidation: 0,
      activeListeners,
      memoryStats: stats,
      issues,
      healthScore,
      recommendations
    };

    // Store issues in history
    issues.forEach(issue => {
      this.issueHistory.push(issue);
    });

    // Maintain history size limit
    if (this.issueHistory.length > this.alertThresholds.maxIssueHistory) {
      this.issueHistory = this.issueHistory.slice(-this.alertThresholds.maxIssueHistory);
    }

    // Log comprehensive results
    this.logValidationResults(report);

    // Notify callbacks
    this.validationCallbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        console.error('[FirestoreValidator] Callback error:', error);
      }
    });

    // Handle critical issues automatically
    this.handleCriticalIssues(issues);

    return report;
  }

  /**
   * Comprehensive issue detection
   */
  private detectIssues(listeners: ListenerInfo[], stats: any, now: number): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    // Issue 1: Duplicate listeners (Critical - can cause b815)
    const jobCounts = new Map<string, number>();
    listeners.forEach(listener => {
      const count = jobCounts.get(listener.jobId) || 0;
      jobCounts.set(listener.jobId, count + 1);
    });

    jobCounts.forEach((count, jobId) => {
      if (count >= this.alertThresholds.duplicateListeners) {
        issues.push({
          type: 'DUPLICATE_LISTENERS',
          severity: count > 3 ? 'CRITICAL' : 'HIGH',
          message: `Multiple subscriptions detected for job ${jobId}: ${count} subscriptions`,
          jobId,
          details: { 
            subscriptionCount: count, 
            threshold: this.alertThresholds.duplicateListeners,
            riskLevel: count > 3 ? 'IMMEDIATE_B815_RISK' : 'POTENTIAL_CONFLICT'
          },
          suggestedActions: [
            'Call forceCleanup() to remove duplicates',
            'Check component mounting/unmounting logic',
            'Verify JobSubscriptionManager usage patterns'
          ],
          timestamp: now
        });
      }
    });

    // Issue 2: Memory leak detection (High severity)
    if (stats.memoryUsageKB > this.alertThresholds.memoryUsageKB) {
      issues.push({
        type: 'MEMORY_LEAK',
        severity: stats.memoryUsageKB > 2000 ? 'CRITICAL' : 'HIGH',
        message: `High memory usage detected: ${stats.memoryUsageKB}KB`,
        details: { 
          currentUsage: stats.memoryUsageKB, 
          threshold: this.alertThresholds.memoryUsageKB,
          subscriptionsCount: stats.subscriptionsCount,
          callbacksCount: stats.callbacksCount
        },
        suggestedActions: [
          'Check for memory leaks in subscription callbacks',
          'Verify proper cleanup on component unmount',
          'Consider reducing subscription frequency'
        ],
        timestamp: now
      });
    }

    // Issue 3: Orphaned timers (Medium severity)
    if (stats.cleanupTimersCount > stats.subscriptionsCount) {
      issues.push({
        type: 'ORPHANED_TIMERS',
        severity: 'MEDIUM',
        message: `Orphaned cleanup timers detected: ${stats.cleanupTimersCount} timers for ${stats.subscriptionsCount} subscriptions`,
        details: { 
          cleanupTimers: stats.cleanupTimersCount, 
          subscriptions: stats.subscriptionsCount,
          ratio: stats.cleanupTimersCount / Math.max(stats.subscriptionsCount, 1)
        },
        suggestedActions: [
          'Force cleanup to clear orphaned timers',
          'Check timer cleanup logic in JobSubscriptionManager'
        ],
        timestamp: now
      });
    }

    // Issue 4: Stale subscriptions (Medium severity)
    const staleThresholdMs = this.alertThresholds.staleSubscriptionMinutes * 60 * 1000;
    const staleListeners = listeners.filter(listener => 
      (now - listener.lastUpdate) > staleThresholdMs
    );

    if (staleListeners.length > 0) {
      issues.push({
        type: 'STALE_SUBSCRIPTIONS',
        severity: staleListeners.length > 5 ? 'HIGH' : 'MEDIUM',
        message: `Stale subscriptions detected: ${staleListeners.length} subscriptions haven't been updated recently`,
        details: { 
          staleCount: staleListeners.length,
          thresholdMinutes: this.alertThresholds.staleSubscriptionMinutes,
          staleJobIds: staleListeners.map(l => l.jobId)
        },
        suggestedActions: [
          'Review if these jobs are still active',
          'Consider cleanup of abandoned subscriptions'
        ],
        timestamp: now
      });
    }

    // Issue 5: Performance degradation (Variable severity)
    if (stats.debounceTimersCount > stats.subscriptionsCount * 3) {
      issues.push({
        type: 'PERFORMANCE_DEGRADATION',
        severity: stats.debounceTimersCount > stats.subscriptionsCount * 5 ? 'HIGH' : 'MEDIUM',
        message: `Excessive debounce timers: ${stats.debounceTimersCount} for ${stats.subscriptionsCount} subscriptions`,
        details: { 
          debounceTimers: stats.debounceTimersCount,
          subscriptions: stats.subscriptionsCount,
          ratio: stats.debounceTimersCount / Math.max(stats.subscriptionsCount, 1)
        },
        suggestedActions: [
          'Optimize debounce logic in subscription callbacks',
          'Consider reducing update frequency'
        ],
        timestamp: now
      });
    }

    return issues;
  }

  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(issues: ValidationIssue[], stats: any, listenerCount: number): number {
    let score = 100;

    // Deduct points based on issue severity
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'CRITICAL':
          score -= 30;
          break;
        case 'HIGH':
          score -= 20;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    });

    // Additional deductions for system health indicators
    if (stats.memoryUsageKB > 1500) score -= 10;
    if (listenerCount > 10) score -= 5;
    if (stats.cleanupTimersCount > stats.subscriptionsCount * 2) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(issues: ValidationIssue[], stats: any): string[] {
    const recommendations: string[] = [];

    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    const highIssues = issues.filter(i => i.severity === 'HIGH');

    if (criticalIssues.length > 0) {
      recommendations.push('🚨 IMMEDIATE ACTION: Critical issues detected - consider emergency cleanup');
    }

    if (issues.some(i => i.type === 'DUPLICATE_LISTENERS')) {
      recommendations.push('Check component lifecycle and ensure proper listener cleanup');
    }

    if (issues.some(i => i.type === 'MEMORY_LEAK')) {
      recommendations.push('Monitor memory usage trends and implement leak prevention measures');
    }

    if (highIssues.length > 2) {
      recommendations.push('Schedule maintenance window to address multiple high-priority issues');
    }

    if (stats.subscriptionsCount === 0) {
      recommendations.push('System appears healthy - consider reducing validation frequency');
    }

    return recommendations;
  }

  /**
   * Log comprehensive validation results
   */
  private logValidationResults(report: ValidationReport): void {
    const { issues, healthScore, activeListeners, memoryStats } = report;

    if (issues.length > 0) {
      console.warn(`🔍 [FirestoreValidator] Health Score: ${healthScore}/100 - Issues detected:`);
      
      issues.forEach(issue => {
        const severity = issue.severity === 'CRITICAL' ? '🚨' : 
                        issue.severity === 'HIGH' ? '⚠️' : 
                        issue.severity === 'MEDIUM' ? '⚡' : 'ℹ️';
        console.warn(`${severity} [${issue.type}] ${issue.message}`);
        
        if (issue.details && Object.keys(issue.details).length > 0) {
          console.warn('   Details:', issue.details);
        }
        
        if (issue.suggestedActions.length > 0) {
          console.warn('   Actions:', issue.suggestedActions.join(', '));
        }
      });
    } else {
      console.warn(`🔍 [FirestoreValidator] ✅ All listeners healthy (Score: ${healthScore}/100)`);
    }

    console.warn('🔍 [FirestoreValidator] System Stats:', {
      activeListeners: activeListeners.length,
      totalCallbacks: memoryStats.callbacksCount,
      memoryUsage: `${memoryStats.memoryUsageKB}KB`,
      debounceTimers: memoryStats.debounceTimersCount,
      cleanupTimers: memoryStats.cleanupTimersCount,
      healthScore: `${healthScore}/100`
    });
  }

  /**
   * Handle critical issues automatically
   */
  private handleCriticalIssues(issues: ValidationIssue[]): void {
    const criticalIssues = issues.filter(i => i.severity === 'CRITICAL');
    
    if (criticalIssues.length > 0 && !this.emergencyCleanupInProgress) {
      const duplicateListenerIssues = criticalIssues.filter(i => i.type === 'DUPLICATE_LISTENERS');
      
      if (duplicateListenerIssues.length > 0) {
        console.warn('🔍 [FirestoreValidator] 🚨 CRITICAL: Auto-triggering emergency cleanup due to duplicate listeners');
        this.handleEmergencyCleanup();
      }
    }
  }

  /**
   * Get information about currently active listeners
   */
  getActiveListeners(): ListenerInfo[] {
    const manager = JobSubscriptionManager.getInstance();
    const subscriptions = (manager as any).subscriptions as Map<string, any>;
    
    const listeners: ListenerInfo[] = [];
    
    subscriptions.forEach((subscription, jobId) => {
      const callbackTypes: string[] = [];
      let callbackCount = 0;

      if (subscription.callbacks) {
        subscription.callbacks.forEach((registration: any) => {
          callbackCount++;
          if (registration.type && !callbackTypes.includes(registration.type)) {
            callbackTypes.push(registration.type);
          }
        });
      }

      listeners.push({
        jobId,
        callbackCount,
        callbackTypes,
        created: subscription.lastUpdate || 0,
        lastUpdate: subscription.lastUpdate || 0,
      });
    });

    return listeners;
  }

  /**
   * Check if a specific job has multiple listeners (potential issue)
   */
  hasMultipleListeners(jobId: string): boolean {
    const listeners = this.getActiveListeners();
    return listeners.filter(l => l.jobId === jobId).length > 1;
  }

  /**
   * Enhanced emergency cleanup handler
   */
  private handleEmergencyCleanup(): void {
    if (this.emergencyCleanupInProgress) {
      console.warn('🔍 [FirestoreValidator] Emergency cleanup already in progress');
      return;
    }

    this.emergencyCleanupInProgress = true;
    console.warn('🔍 [FirestoreValidator] 🚨 EMERGENCY CLEANUP INITIATED');

    try {
      // Step 1: Stop validation to prevent interference
      this.stopMonitoring();

      // Step 2: Get pre-cleanup stats
      const preCleanupReport = this.generateCleanupReport('pre-cleanup');

      // Step 3: Force cleanup through JobSubscriptionManager
      const manager = JobSubscriptionManager.getInstance();
      manager.shutdown();

      // Step 4: Clear any remaining timers or intervals
      this.clearAllTimers();

      // Step 5: Wait a moment for cleanup to complete
      setTimeout(() => {
        // Step 6: Generate post-cleanup report
        const postCleanupReport = this.generateCleanupReport('post-cleanup');
        
        console.warn('🔍 [FirestoreValidator] 🚨 EMERGENCY CLEANUP COMPLETED');
        console.warn('🔍 [FirestoreValidator] Pre-cleanup:', preCleanupReport);
        console.warn('🔍 [FirestoreValidator] Post-cleanup:', postCleanupReport);

        // Step 7: Reset emergency flag
        this.emergencyCleanupInProgress = false;

        // Step 8: Optionally restart monitoring with reduced frequency
        setTimeout(() => {
          console.warn('🔍 [FirestoreValidator] Restarting monitoring after cleanup...');
          this.startMonitoring(30000); // 30 second interval after cleanup
        }, 5000);

      }, 1000);

    } catch (error) {
      console.error('🔍 [FirestoreValidator] Emergency cleanup failed:', error);
      this.emergencyCleanupInProgress = false;
    }
  }

  /**
   * Generate cleanup report
   */
  private generateCleanupReport(phase: 'pre-cleanup' | 'post-cleanup'): any {
    try {
      const manager = JobSubscriptionManager.getInstance();
      const stats = manager.getMemoryStats();
      const listeners = this.getActiveListeners();

      return {
        phase,
        timestamp: Date.now(),
        listenersCount: listeners.length,
        memoryUsageKB: stats.memoryUsageKB,
        subscriptionsCount: stats.subscriptionsCount,
        callbacksCount: stats.callbacksCount,
        cleanupTimersCount: stats.cleanupTimersCount,
        debounceTimersCount: stats.debounceTimersCount
      };
    } catch (error) {
      return { phase, error: error.message, timestamp: Date.now() };
    }
  }

  /**
   * Clear all timers and intervals
   */
  private clearAllTimers(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = undefined;
    }
  }

  /**
   * Register validation callback for external monitoring
   */
  registerValidationCallback(callback: (report: ValidationReport) => void): void {
    this.validationCallbacks.push(callback);
  }

  /**
   * Unregister validation callback
   */
  unregisterValidationCallback(callback: (report: ValidationReport) => void): void {
    const index = this.validationCallbacks.indexOf(callback);
    if (index > -1) {
      this.validationCallbacks.splice(index, 1);
    }
  }

  /**
   * Force cleanup of all listeners (emergency use) - Legacy method
   */
  forceCleanup(): void {
    console.warn('🔍 [FirestoreValidator] 🚨 LEGACY FORCE CLEANUP - Use handleEmergencyCleanup for enhanced cleanup');
    this.handleEmergencyCleanup();
  }

  /**
   * Get issue history for trend analysis
   */
  getIssueHistory(limit?: number): ValidationIssue[] {
    if (limit) {
      return this.issueHistory.slice(-limit);
    }
    return [...this.issueHistory];
  }

  /**
   * Clear issue history
   */
  clearIssueHistory(): void {
    this.issueHistory = [];
    console.warn('🔍 [FirestoreValidator] Issue history cleared');
  }

  /**
   * Update alert thresholds
   */
  updateThresholds(newThresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
    console.warn('🔍 [FirestoreValidator] Alert thresholds updated:', this.alertThresholds);
  }

  /**
   * Get current alert thresholds
   */
  getThresholds(): typeof this.alertThresholds {
    return { ...this.alertThresholds };
  }

  /**
   * Get enhanced validation report
   */
  getValidationReport(): ValidationReport {
    const now = Date.now();
    const activeListeners = this.getActiveListeners();
    const manager = JobSubscriptionManager.getInstance();
    const memoryStats = manager.getMemoryStats();

    // Comprehensive issue detection
    const issues = this.detectIssues(activeListeners, memoryStats, now);
    
    // Calculate health score
    const healthScore = this.calculateHealthScore(issues, memoryStats, activeListeners.length);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, memoryStats);

    return {
      lastValidation: this.lastValidation,
      timeSinceLastValidation: now - this.lastValidation,
      activeListeners,
      memoryStats,
      issues,
      healthScore,
      recommendations
    };
  }

  /**
   * Quick health check (simplified report for performance)
   */
  quickHealthCheck(): { 
    isHealthy: boolean; 
    score: number; 
    criticalIssues: number;
    summary: string;
  } {
    const report = this.getValidationReport();
    const criticalIssues = report.issues.filter(i => i.severity === 'CRITICAL').length;
    const isHealthy = report.healthScore >= 70 && criticalIssues === 0;
    
    let summary = '';
    if (criticalIssues > 0) {
      summary = `${criticalIssues} critical issues require immediate attention`;
    } else if (report.healthScore < 70) {
      summary = `System health degraded (${report.healthScore}/100)`;
    } else {
      summary = 'All systems healthy';
    }

    return {
      isHealthy,
      score: report.healthScore,
      criticalIssues,
      summary
    };
  }
}

// Global access for debugging
declare global {
  interface Window {
    firestoreValidator?: FirestoreListenerValidator;
    _firestoreDebug?: {
      validator: FirestoreListenerValidator;
      quickCheck: () => void;
      fullReport: () => ValidationReport;
      cleanup: () => void;
      issues: () => ValidationIssue[];
    };
  }
}

// Expose enhanced debugging interface in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const validator = FirestoreListenerValidator.getInstance();
  
  // Basic validator access
  window.firestoreValidator = validator;
  
  // Enhanced debugging interface
  window._firestoreDebug = {
    validator,
    quickCheck: () => {
      const result = validator.quickHealthCheck();
      console.warn('🔍 Quick Health Check:', result);
      return result;
    },
    fullReport: () => {
      const report = validator.getValidationReport();
      console.warn('🔍 Full Validation Report:', report);
      return report;
    },
    cleanup: () => {
      console.warn('🔍 Triggering emergency cleanup...');
      validator.forceCleanup();
    },
    issues: () => {
      const issues = validator.getIssueHistory(10);
      console.warn('🔍 Recent Issues:', issues);
      return issues;
    }
  };
  
  console.warn('🔍 [FirestoreValidator] Enhanced debugging available:');
  console.warn('  - window.firestoreValidator (full API)');
  console.warn('  - window._firestoreDebug.quickCheck() (health summary)');
  console.warn('  - window._firestoreDebug.fullReport() (detailed report)');
  console.warn('  - window._firestoreDebug.cleanup() (emergency cleanup)');
  console.warn('  - window._firestoreDebug.issues() (recent issues)');
}

// Export types for external use
export type { ValidationReport, ValidationIssue, ListenerInfo };

export default FirestoreListenerValidator;