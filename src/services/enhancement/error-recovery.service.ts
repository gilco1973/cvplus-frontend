/**
 * Enhanced Error Recovery Service
 * 
 * Provides advanced error recovery mechanisms with exponential backoff,
 * intelligent retry strategies, and comprehensive error analysis for
 * the CV enhancement process.
 */

import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface RetryStrategy {
  type: 'exponential' | 'linear' | 'fibonacci' | 'custom';
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
}

export interface ErrorContext {
  featureId: string;
  featureName: string;
  jobId: string;
  userId: string;
  errorType: 'network' | 'validation' | 'processing' | 'timeout' | 'quota' | 'unknown';
  errorMessage: string;
  errorCode?: string;
  stackTrace?: string;
  timestamp: number;
  attemptNumber: number;
  previousAttempts: ErrorAttempt[];
  systemContext: {
    userAgent: string;
    connectionType?: string;
    memoryUsage?: number;
    timestamp: number;
  };
}

export interface ErrorAttempt {
  attemptNumber: number;
  timestamp: number;
  error: string;
  duration: number;
  recoveryAction: string;
}

export interface RecoveryResult {
  shouldRetry: boolean;
  delayMs: number;
  strategy: string;
  recoveryActions: string[];
  alternativeApproach?: string;
  estimatedSuccessProbability: number;
}

export interface ErrorPattern {
  errorType: string;
  frequency: number;
  averageRecoveryTime: number;
  successRate: number;
  commonCauses: string[];
  recommendedActions: string[];
}

export class ErrorRecoveryService {
  private errorHistory: Map<string, ErrorContext[]> = new Map();
  private retryAttempts: Map<string, ErrorAttempt[]> = new Map();
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private recoveryStrategies: Map<string, RetryStrategy> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default retry strategies
   */
  private initializeDefaultStrategies(): void {
    // Network errors - exponential backoff with jitter
    this.recoveryStrategies.set('network', {
      type: 'exponential',
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1
    });

    // Processing errors - linear backoff
    this.recoveryStrategies.set('processing', {
      type: 'linear',
      maxAttempts: 3,
      baseDelay: 2000,
      maxDelay: 10000,
      backoffMultiplier: 1,
      jitterFactor: 0.05
    });

    // Validation errors - fibonacci backoff
    this.recoveryStrategies.set('validation', {
      type: 'fibonacci',
      maxAttempts: 4,
      baseDelay: 1500,
      maxDelay: 15000,
      backoffMultiplier: 1.618,
      jitterFactor: 0.15
    });

    // Timeout errors - aggressive exponential
    this.recoveryStrategies.set('timeout', {
      type: 'exponential',
      maxAttempts: 4,
      baseDelay: 3000,
      maxDelay: 45000,
      backoffMultiplier: 3,
      jitterFactor: 0.2
    });

    // Quota errors - longer delays
    this.recoveryStrategies.set('quota', {
      type: 'exponential',
      maxAttempts: 6,
      baseDelay: 5000,
      maxDelay: 120000,
      backoffMultiplier: 2.5,
      jitterFactor: 0.3
    });
  }

  /**
   * Analyze error and determine recovery strategy
   */
  analyzeError(
    error: Error | string,
    featureId: string,
    featureName: string,
    jobId: string,
    userId: string,
    attemptNumber = 1
  ): ErrorContext {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorType = this.classifyError(errorMessage, error);
    
    const context: ErrorContext = {
      featureId,
      featureName,
      jobId,
      userId,
      errorType,
      errorMessage,
      errorCode: this.extractErrorCode(error),
      stackTrace: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      attemptNumber,
      previousAttempts: this.retryAttempts.get(featureId) || [],
      systemContext: this.captureSystemContext()
    };

    // Store error context
    this.storeErrorContext(context);
    
    return context;
  }

  /**
   * Determine if retry should be attempted and calculate delay
   */
  calculateRecovery(context: ErrorContext): RecoveryResult {
    const strategy = this.recoveryStrategies.get(context.errorType) || this.recoveryStrategies.get('network')!;
    
    // Check if we've exceeded max attempts
    if (context.attemptNumber >= strategy.maxAttempts) {
      return {
        shouldRetry: false,
        delayMs: 0,
        strategy: 'max_attempts_exceeded',
        recoveryActions: ['Log error and move to next feature'],
        estimatedSuccessProbability: 0
      };
    }

    // Calculate delay based on strategy
    const delayMs = this.calculateDelay(strategy, context.attemptNumber);
    
    // Determine recovery actions
    const recoveryActions = this.determineRecoveryActions(context);
    
    // Estimate success probability based on historical data
    const successProbability = this.estimateSuccessProbability(context);
    
    // Check for alternative approaches
    const alternativeApproach = this.suggestAlternativeApproach(context);

    return {
      shouldRetry: true,
      delayMs,
      strategy: `${strategy.type}_backoff`,
      recoveryActions,
      alternativeApproach,
      estimatedSuccessProbability: successProbability
    };
  }

  /**
   * Classify error type based on error message and properties
   */
  private classifyError(message: string, error: Error | string): ErrorContext['errorType'] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || 
        lowerMessage.includes('connection') || lowerMessage.includes('cors')) {
      return 'network';
    }
    
    if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
      return 'timeout';
    }
    
    if (lowerMessage.includes('quota') || lowerMessage.includes('rate limit') ||
        lowerMessage.includes('too many requests')) {
      return 'quota';
    }
    
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid') ||
        lowerMessage.includes('malformed')) {
      return 'validation';
    }
    
    if (lowerMessage.includes('processing') || lowerMessage.includes('generation') ||
        lowerMessage.includes('failed to generate')) {
      return 'processing';
    }
    
    return 'unknown';
  }

  /**
   * Extract error code from error object
   */
  private extractErrorCode(error: Error | string): string | undefined {
    if (typeof error === 'string') return undefined;
    
    // Check for common error code properties
    const errorObj = error as any;
    return errorObj.code || errorObj.status || errorObj.statusCode;
  }

  /**
   * Capture current system context
   */
  private captureSystemContext(): ErrorContext['systemContext'] {
    const context: ErrorContext['systemContext'] = {
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    // Network connection info
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      context.connectionType = connection?.effectiveType;
    }

    // Memory usage
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      context.memoryUsage = memInfo?.usedJSHeapSize;
    }

    return context;
  }

  /**
   * Calculate retry delay based on strategy
   */
  private calculateDelay(strategy: RetryStrategy, attemptNumber: number): number {
    let delay: number;

    switch (strategy.type) {
      case 'exponential':
        delay = strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attemptNumber - 1);
        break;
      case 'linear':
        delay = strategy.baseDelay * attemptNumber;
        break;
      case 'fibonacci':
        delay = strategy.baseDelay * this.fibonacci(attemptNumber);
        break;
      default:
        delay = strategy.baseDelay;
    }

    // Apply jitter to prevent thundering herd
    const jitter = delay * strategy.jitterFactor * (Math.random() - 0.5);
    delay += jitter;

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, strategy.maxDelay);
  }

  /**
   * Calculate fibonacci number
   */
  private fibonacci(n: number): number {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  /**
   * Determine recovery actions based on error context
   */
  private determineRecoveryActions(context: ErrorContext): string[] {
    const actions: string[] = [];

    switch (context.errorType) {
      case 'network':
        actions.push('Check network connectivity');
        actions.push('Verify Firebase Function endpoints');
        actions.push('Try alternative API endpoints');
        break;
      case 'timeout':
        actions.push('Increase timeout duration');
        actions.push('Split large requests into smaller chunks');
        actions.push('Use streaming response if available');
        break;
      case 'quota':
        actions.push('Implement request batching');
        actions.push('Add longer delays between requests');
        actions.push('Use alternative processing resources');
        break;
      case 'validation':
        actions.push('Sanitize input data');
        actions.push('Check data format requirements');
        actions.push('Apply data transformation rules');
        break;
      case 'processing':
        actions.push('Verify input parameters');
        actions.push('Check server resource availability');
        actions.push('Try simplified processing options');
        break;
      default:
        actions.push('Log detailed error information');
        actions.push('Perform general system health check');
    }

    // Add context-specific actions
    if (context.attemptNumber > 2) {
      actions.push('Consider fallback processing method');
    }

    if (context.previousAttempts.length > 0) {
      actions.push('Analyze previous failure patterns');
    }

    return actions;
  }

  /**
   * Estimate success probability based on historical data
   */
  private estimateSuccessProbability(context: ErrorContext): number {
    const pattern = this.errorPatterns.get(context.errorType);
    if (!pattern) return 0.5; // Default 50% if no historical data

    // Base probability from historical success rate
    let probability = pattern.successRate / 100;

    // Adjust based on attempt number (decreasing probability)
    probability *= Math.pow(0.8, context.attemptNumber - 1);

    // Adjust based on previous attempts for this specific feature
    if (context.previousAttempts.length > 0) {
      probability *= Math.pow(0.9, context.previousAttempts.length);
    }

    // Adjust based on system context
    if (context.systemContext.memoryUsage && context.systemContext.memoryUsage > 80) {
      probability *= 0.7; // Lower probability if memory is high
    }

    return Math.max(0.1, Math.min(0.9, probability));
  }

  /**
   * Suggest alternative approach if retries are failing
   */
  private suggestAlternativeApproach(context: ErrorContext): string | undefined {
    if (context.attemptNumber <= 2) return undefined;

    switch (context.errorType) {
      case 'processing':
        return 'Try generating feature with reduced complexity or fallback template';
      case 'network':
        return 'Switch to offline mode with cached templates';
      case 'timeout':
        return 'Use asynchronous processing with status polling';
      case 'quota':
        return 'Queue request for later processing when quota resets';
      case 'validation':
        return 'Use simplified feature variant that bypasses validation issues';
      default:
        return 'Skip this feature and continue with remaining enhancements';
    }
  }

  /**
   * Store error context for analysis
   */
  private storeErrorContext(context: ErrorContext): void {
    // Store in local history
    const featureErrors = this.errorHistory.get(context.featureId) || [];
    featureErrors.push(context);
    this.errorHistory.set(context.featureId, featureErrors);

    // Update error patterns
    this.updateErrorPatterns(context);

    // Store in Firestore for persistent analysis
    this.storeErrorInFirestore(context);
  }

  /**
   * Update error patterns for machine learning
   */
  private updateErrorPatterns(context: ErrorContext): void {
    const existing = this.errorPatterns.get(context.errorType);
    
    if (existing) {
      existing.frequency++;
      // Update other metrics as patterns develop
    } else {
      this.errorPatterns.set(context.errorType, {
        errorType: context.errorType,
        frequency: 1,
        averageRecoveryTime: 0,
        successRate: 50, // Initial estimate
        commonCauses: [context.errorMessage],
        recommendedActions: this.determineRecoveryActions(context)
      });
    }
  }

  /**
   * Store error in Firestore for analysis
   */
  private async storeErrorInFirestore(context: ErrorContext): Promise<void> {
    try {
      const errorCollection = collection(db, 'error_recovery');
      
      // Filter out undefined fields to prevent Firestore validation errors
      const sanitizedContext = Object.entries(context).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      await addDoc(errorCollection, {
        ...sanitizedContext,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Error storing error context in Firestore:', error);
    }
  }

  /**
   * Record retry attempt
   */
  recordRetryAttempt(
    featureId: string,
    attemptNumber: number,
    error: string,
    duration: number,
    recoveryAction: string
  ): void {
    const attempts = this.retryAttempts.get(featureId) || [];
    attempts.push({
      attemptNumber,
      timestamp: Date.now(),
      error,
      duration,
      recoveryAction
    });
    this.retryAttempts.set(featureId, attempts);
  }

  /**
   * Clear retry history for a feature
   */
  clearRetryHistory(featureId: string): void {
    this.retryAttempts.delete(featureId);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    averageRecoveryTime: number;
    overallSuccessRate: number;
    mostCommonErrors: string[];
  } {
    const allErrors = Array.from(this.errorHistory.values()).flat();
    const totalErrors = allErrors.length;
    
    const errorsByType: Record<string, number> = {};
    allErrors.forEach(error => {
      errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
    });

    const averageRecoveryTime = 0; // Would calculate from successful recoveries
    const overallSuccessRate = 0; // Would calculate from success/failure ratio
    
    const mostCommonErrors = Object.entries(errorsByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([error]) => error);

    return {
      totalErrors,
      errorsByType,
      averageRecoveryTime,
      overallSuccessRate,
      mostCommonErrors
    };
  }

  /**
   * Export error analysis report
   */
  exportErrorReport(): {
    summary: ReturnType<ErrorRecoveryService['getErrorStatistics']>;
    patterns: Array<{ type: string; pattern: ErrorPattern }>;
    recommendations: string[];
  } {
    const summary = this.getErrorStatistics();
    const patterns = Array.from(this.errorPatterns.entries()).map(([type, pattern]) => ({
      type,
      pattern
    }));

    const recommendations: string[] = [];
    
    // Generate recommendations based on patterns
    if (summary.errorsByType.network > summary.totalErrors * 0.3) {
      recommendations.push('High network error rate - consider implementing offline capabilities');
    }
    
    if (summary.errorsByType.timeout > summary.totalErrors * 0.2) {
      recommendations.push('Frequent timeout errors - optimize processing algorithms or increase timeout limits');
    }
    
    if (summary.errorsByType.quota > 0) {
      recommendations.push('Quota errors detected - implement request throttling and queuing');
    }

    return {
      summary,
      patterns,
      recommendations
    };
  }

  /**
   * Clear all error history
   */
  clearAllHistory(): void {
    this.errorHistory.clear();
    this.retryAttempts.clear();
    this.errorPatterns.clear();
    console.warn('🧹 Error recovery history cleared');
  }
}

export const errorRecoveryService = new ErrorRecoveryService();