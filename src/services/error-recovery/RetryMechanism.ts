/**
 * Intelligent Retry Mechanism for CVPlus Platform
 * 
 * Provides smart retry logic with exponential backoff, circuit breaker patterns,
 * and error-specific retry strategies.
 */

import { ErrorClassifier, ErrorType, type ClassifiedError } from './ErrorClassification';
import { CheckpointManager, CheckpointType } from './CheckpointManager';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerResetTime: number;
}

export interface RetryAttempt {
  attemptNumber: number;
  error: ClassifiedError;
  delay: number;
  timestamp: Date;
  success: boolean;
  executionTime?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: ClassifiedError;
  attempts: RetryAttempt[];
  totalExecutionTime: number;
  recoveredFromCheckpoint: boolean;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: Date;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export class RetryMechanism {
  private static instance: RetryMechanism;
  private errorClassifier: ErrorClassifier;
  private checkpointManager: CheckpointManager;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    circuitBreakerThreshold: 5,
    circuitBreakerResetTime: 60000 // 1 minute
  };

  private constructor() {
    this.errorClassifier = ErrorClassifier.getInstance();
    this.checkpointManager = CheckpointManager.getInstance();
  }

  public static getInstance(): RetryMechanism {
    if (!RetryMechanism.instance) {
      RetryMechanism.instance = new RetryMechanism();
    }
    return RetryMechanism.instance;
  }

  /**
   * Executes a function with intelligent retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationContext: {
      operationName: string;
      jobId?: string;
      sessionId?: string;
      checkpointType?: CheckpointType;
    },
    config: Partial<RetryConfig> = {}
  ): Promise<RetryResult<T>> {
    const finalConfig: RetryConfig = { ...this.defaultConfig, ...config };
    const attempts: RetryAttempt[] = [];
    const startTime = Date.now();
    let recoveredFromCheckpoint = false;

    // Check circuit breaker
    if (this.isCircuitOpen(operationContext.operationName)) {
      const error = this.errorClassifier.classify(
        new Error('Circuit breaker is open'),
        { operation: operationContext.operationName, ...operationContext }
      );
      
      return {
        success: false,
        error,
        attempts: [],
        totalExecutionTime: Date.now() - startTime,
        recoveredFromCheckpoint: false
      };
    }

    for (let attemptNumber = 1; attemptNumber <= finalConfig.maxRetries + 1; attemptNumber++) {
      const attemptStart = Date.now();

      try {
        // Try to recover from checkpoint on first retry (not first attempt)
        if (attemptNumber === 2 && operationContext.jobId && operationContext.checkpointType) {
          const restoreResult = await this.tryCheckpointRestore(operationContext.jobId, operationContext.checkpointType);
          if (restoreResult.success) {
            recoveredFromCheckpoint = true;
            console.warn(`Recovered from checkpoint: ${restoreResult.message}`);
          }
        }

        const result = await operation();
        
        // Success - record attempt and reset circuit breaker
        const attempt: RetryAttempt = {
          attemptNumber,
          error: {} as ClassifiedError,
          delay: 0,
          timestamp: new Date(),
          success: true,
          executionTime: Date.now() - attemptStart
        };
        attempts.push(attempt);
        
        this.resetCircuitBreaker(operationContext.operationName);

        return {
          success: true,
          data: result,
          attempts,
          totalExecutionTime: Date.now() - startTime,
          recoveredFromCheckpoint
        };

      } catch (error: unknown) {
        const classifiedError = this.errorClassifier.classify(error, {
          operation: operationContext.operationName,
          retryCount: attemptNumber - 1,
          ...operationContext
        });

        const attempt: RetryAttempt = {
          attemptNumber,
          error: classifiedError,
          delay: 0,
          timestamp: new Date(),
          success: false,
          executionTime: Date.now() - attemptStart
        };

        // Check if error is retryable and we haven't exceeded max retries
        if (!classifiedError.retryable || attemptNumber > finalConfig.maxRetries) {
          attempts.push(attempt);
          this.recordCircuitBreakerFailure(operationContext.operationName);
          
          return {
            success: false,
            error: classifiedError,
            attempts,
            totalExecutionTime: Date.now() - startTime,
            recoveredFromCheckpoint
          };
        }

        // Calculate delay for next attempt
        const delay = this.calculateDelay(
          attemptNumber - 1,
          classifiedError,
          finalConfig
        );
        
        attempt.delay = delay;
        attempts.push(attempt);

        console.warn(
          `Attempt ${attemptNumber} failed for ${operationContext.operationName}. ` +
          `Retrying in ${delay}ms. Error: ${classifiedError.message}`
        );

        // Wait before next attempt
        await this.sleep(delay);
      }
    }

    // This should never be reached, but just in case
    const lastError = attempts[attempts.length - 1]?.error;
    return {
      success: false,
      error: lastError,
      attempts,
      totalExecutionTime: Date.now() - startTime,
      recoveredFromCheckpoint
    };
  }

  /**
   * Executes multiple operations with retry logic in parallel
   */
  public async executeMultipleWithRetry<T>(
    operations: Array<{
      operation: () => Promise<T>;
      context: {
        operationName: string;
        jobId?: string;
        sessionId?: string;
        checkpointType?: CheckpointType;
      };
      config?: Partial<RetryConfig>;
    }>
  ): Promise<Array<RetryResult<T>>> {
    const promises = operations.map(({ operation, context, config }) =>
      this.executeWithRetry(operation, context, config)
    );

    return Promise.all(promises);
  }

  /**
   * Calculates delay with exponential backoff and jitter
   */
  private calculateDelay(
    attemptNumber: number,
    error: ClassifiedError,
    config: RetryConfig
  ): number {
    // Use error-specific delay if available
    const baseDelay = error.retryDelay || config.initialDelay;

    // Apply exponential backoff
    let delay = Math.min(
      baseDelay * Math.pow(config.backoffFactor, attemptNumber),
      config.maxDelay
    );

    // Add jitter to prevent thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    // Special cases for specific error types
    switch (error.type) {
      case ErrorType.API_RATE_LIMIT:
        // Longer delays for rate limits
        delay = Math.max(delay, 30000); // At least 30 seconds
        break;
      case ErrorType.NETWORK:
        // Shorter delays for network errors
        delay = Math.min(delay, 10000); // Max 10 seconds
        break;
      case ErrorType.TIMEOUT:
        // Progressive delays for timeouts
        delay = Math.min(delay * 1.5, config.maxDelay);
        break;
    }

    return Math.round(delay);
  }

  /**
   * Attempts to restore from checkpoint
   */
  private async tryCheckpointRestore(
    jobId: string,
    checkpointType: CheckpointType
  ): Promise<{ success: boolean; message: string }> {
    try {
      const checkpoint = await this.checkpointManager.getCheckpointByType(jobId, checkpointType);
      
      if (checkpoint && checkpoint.metadata.canResumeFrom) {
        const restoreResult = await this.checkpointManager.restoreFromLatestCheckpoint(jobId);
        return {
          success: restoreResult.success,
          message: restoreResult.message
        };
      }

      return {
        success: false,
        message: 'No suitable checkpoint found'
      };
    } catch (error: unknown) {
      console.error('Error during checkpoint restore:', error);
      return {
        success: false,
        message: `Checkpoint restore failed: ${(error as any)?.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Circuit breaker implementation
   */
  private isCircuitOpen(operationName: string): boolean {
    const state = this.circuitBreakers.get(operationName);
    if (!state) return false;

    if (state.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - state.lastFailureTime.getTime();
      if (timeSinceLastFailure > this.defaultConfig.circuitBreakerResetTime) {
        // Move to half-open state
        state.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }

    return false;
  }

  private recordCircuitBreakerFailure(operationName: string): void {
    let state = this.circuitBreakers.get(operationName);
    
    if (!state) {
      state = {
        failures: 0,
        lastFailureTime: new Date(),
        state: 'CLOSED'
      };
      this.circuitBreakers.set(operationName, state);
    }

    state.failures++;
    state.lastFailureTime = new Date();

    if (state.failures >= this.defaultConfig.circuitBreakerThreshold) {
      state.state = 'OPEN';
      console.warn(`Circuit breaker opened for operation: ${operationName}`);
    }
  }

  private resetCircuitBreaker(operationName: string): void {
    const state = this.circuitBreakers.get(operationName);
    if (state) {
      state.failures = 0;
      state.state = 'CLOSED';
    }
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics for monitoring
   */
  public getRetryStats(): Record<string, {
    failures: number;
    lastFailureTime?: Date;
    circuitState: string;
  }> {
    const stats: Record<string, {
      failures: number;
      lastFailureTime?: Date;
      circuitState: string;
    }> = {};
    
    this.circuitBreakers.forEach((state, operationName) => {
      stats[operationName] = {
        failures: state.failures,
        lastFailureTime: state.lastFailureTime,
        circuitState: state.state
      };
    });

    return stats;
  }

  /**
   * Reset all circuit breakers (for testing or manual reset)
   */
  public resetAllCircuitBreakers(): void {
    this.circuitBreakers.clear();
    console.warn('All circuit breakers reset');
  }

  /**
   * Update default configuration
   */
  public updateDefaultConfig(config: Partial<RetryConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }
}

/**
 * Decorator for automatic retry functionality
 */
export function withRetry<T extends any[], R>(
  config: Partial<RetryConfig> = {},
  operationName?: string
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const retryMechanism = RetryMechanism.getInstance();

    descriptor.value = async function (...args: T): Promise<R> {
      const context = {
        operationName: operationName || `${(target as any).constructor.name}.${propertyKey}`,
        // Extract context from arguments if available
        jobId: args.find((arg: any) => arg?.jobId)?.jobId,
        sessionId: args.find((arg: any) => arg?.sessionId)?.sessionId
      };

      const result = await retryMechanism.executeWithRetry(
        () => originalMethod.apply(this, args),
        context,
        config
      );

      if (result.success) {
        return result.data as R;
      } else {
        throw result.error?.originalError || new Error('Retry failed');
      }
    };

    return descriptor;
  };
}

export default RetryMechanism;