/**
 * Error Recovery Manager - Main orchestrator for the error recovery system
 * 
 * Coordinates error classification, checkpoint management, retry mechanisms,
 * and error reporting to provide seamless error recovery experience.
 */

import { ErrorClassifier, ClassifiedError, ErrorType } from './ErrorClassification';
import { CheckpointManager, CheckpointType, ProcessingCheckpoint } from './CheckpointManager';
import { RetryMechanism, RetryResult, RetryConfig } from './RetryMechanism';
import { ErrorReportingService, RecoveryAttempt } from './ErrorReportingService';

export interface ErrorRecoveryOptions {
  enableCheckpointRestore?: boolean;
  enableAutoRetry?: boolean;
  enableErrorReporting?: boolean;
  maxRetries?: number;
  customRetryConfig?: Partial<RetryConfig>;
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: ClassifiedError;
  recoveredFromCheckpoint?: boolean;
  retryAttempts?: number;
  reportId?: string;
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  
  private errorClassifier: ErrorClassifier;
  private checkpointManager: CheckpointManager;
  private retryMechanism: RetryMechanism;
  private errorReporting: ErrorReportingService;

  private constructor() {
    this.errorClassifier = ErrorClassifier.getInstance();
    this.checkpointManager = CheckpointManager.getInstance();
    this.retryMechanism = RetryMechanism.getInstance();
    this.errorReporting = ErrorReportingService.getInstance();
  }

  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Executes an operation with full error recovery capabilities
   */
  public async executeWithRecovery<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      jobId?: string;
      sessionId?: string;
      checkpointType?: CheckpointType;
      checkpointData?: Record<string, unknown>;
    },
    options: ErrorRecoveryOptions = {}
  ): Promise<RecoveryResult<T>> {
    const {
      enableCheckpointRestore = true,
      enableAutoRetry = true,
      enableErrorReporting = true,
      maxRetries = 3,
      customRetryConfig = {}
    } = options;

    try {
      // Create initial checkpoint if data provided
      if (context.jobId && context.checkpointType && context.checkpointData) {
        await this.createCheckpoint(
          context.jobId,
          context.checkpointType,
          context.checkpointData
        );
      }

      // Execute with retry mechanism if enabled
      if (enableAutoRetry) {
        const retryResult = await this.retryMechanism.executeWithRetry(
          operation,
          {
            operationName: context.operationName,
            jobId: context.jobId,
            sessionId: context.sessionId,
            checkpointType: context.checkpointType
          },
          {
            maxRetries,
            ...customRetryConfig
          }
        );

        if (retryResult.success) {
          // Success - clean up recovery attempts
          this.errorReporting.clearRecoveryAttempts();
          
          return {
            success: true,
            data: retryResult.data,
            recoveredFromCheckpoint: retryResult.recoveredFromCheckpoint,
            retryAttempts: retryResult.attempts.length
          };
        } else {
          // Failed with retries - handle error reporting
          const reportId = enableErrorReporting 
            ? await this.handleErrorReporting(retryResult.error!, context, retryResult)
            : undefined;

          return {
            success: false,
            error: retryResult.error,
            recoveredFromCheckpoint: retryResult.recoveredFromCheckpoint,
            retryAttempts: retryResult.attempts.length,
            reportId
          };
        }
      } else {
        // Execute without retry
        const result = await operation();
        return {
          success: true,
          data: result,
          retryAttempts: 0
        };
      }

    } catch (error: unknown) {
      // Classify the error
      const classifiedError = this.errorClassifier.classify(error, {
        operation: context.operationName,
        jobId: context.jobId,
        sessionId: context.sessionId
      });

      // Handle error reporting
      const reportId = enableErrorReporting 
        ? await this.handleErrorReporting(classifiedError, context)
        : undefined;

      return {
        success: false,
        error: classifiedError,
        retryAttempts: 0,
        reportId
      };
    }
  }

  /**
   * Creates a checkpoint for the current operation
   */
  public async createCheckpoint(
    jobId: string,
    type: CheckpointType,
    data: Record<string, unknown>,
    metadata?: {
      description?: string;
      estimatedTimeRemaining?: number;
    }
  ): Promise<ProcessingCheckpoint> {
    return this.checkpointManager.createCheckpoint(
      jobId,
      type,
      data,
      {
        description: metadata?.description || `Checkpoint at ${type}`,
        estimatedTimeRemaining: metadata?.estimatedTimeRemaining,
        canResumeFrom: true
      }
    );
  }

  /**
   * Restores from the latest checkpoint
   */
  public async restoreFromCheckpoint(jobId: string): Promise<{
    success: boolean;
    checkpoint?: ProcessingCheckpoint;
    data?: Record<string, unknown>;
    message: string;
  }> {
    const restoreResult = await this.checkpointManager.restoreFromLatestCheckpoint(jobId);
    
    if (restoreResult.success) {
      // Track recovery attempt
      this.errorReporting.trackRecoveryAttempt(
        'checkpoint_restore',
        'success',
        {
          checkpointId: restoreResult.checkpoint?.id,
          step: restoreResult.checkpoint?.metadata.step,
          progress: restoreResult.checkpoint?.metadata.progress
        }
      );
    }

    return {
      success: restoreResult.success,
      checkpoint: restoreResult.checkpoint || undefined,
      data: restoreResult.restoredData || undefined,
      message: restoreResult.message
    };
  }

  /**
   * Gets all checkpoints for a job
   */
  public async getJobCheckpoints(jobId: string): Promise<ProcessingCheckpoint[]> {
    return this.checkpointManager.getJobCheckpoints(jobId);
  }

  /**
   * Classifies an error without executing recovery
   */
  public classifyError(error: Error | any, context: {
    operation: string;
    jobId?: string;
    sessionId?: string;
  }): ClassifiedError {
    return this.errorClassifier.classify(error, context);
  }

  /**
   * Reports an error manually
   */
  public async reportError(
    error: ClassifiedError,
    context: {
      sessionId?: string;
      jobId?: string;
    } = {},
    userFeedback?: {
      rating: 1 | 2 | 3 | 4 | 5;
      description: string;
      reproductionSteps?: string;
    }
  ): Promise<string> {
    const checkpoints = context.jobId 
      ? await this.getJobCheckpoints(context.jobId)
      : [];

    const recoveryAttempts = this.errorReporting.getRecoveryAttempts();

    return this.errorReporting.reportError(error, {
      sessionId: context.sessionId,
      jobId: context.jobId,
      checkpoints,
      recoveryAttempts,
      userFeedback
    });
  }

  /**
   * Tracks a user action for context
   */
  public trackUserAction(type: string, target: string, details?: Record<string, unknown>): void {
    this.errorReporting.trackUserAction(type, target, details);
  }

  /**
   * Gets retry statistics for monitoring
   */
  public getRetryStats(): Record<string, {
    failures: number;
    lastFailureTime?: Date;
    circuitState: string;
  }> {
    return this.retryMechanism.getRetryStats();
  }

  /**
   * Cleans up expired checkpoints
   */
  public async cleanupExpiredCheckpoints(): Promise<number> {
    return this.checkpointManager.cleanupExpiredCheckpoints();
  }

  /**
   * Resets all circuit breakers (for testing or manual reset)
   */
  public resetCircuitBreakers(): void {
    this.retryMechanism.resetAllCircuitBreakers();
  }

  /**
   * Updates retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryMechanism.updateDefaultConfig(config);
  }

  /**
   * Starts or stops action tracking
   */
  public setActionTracking(enabled: boolean): void {
    if (enabled) {
      this.errorReporting.startActionTracking();
    } else {
      this.errorReporting.stopActionTracking();
    }
  }

  /**
   * Gets user error reports
   */
  public async getUserErrorReports(limit = 10) {
    return this.errorReporting.getUserReports(limit);
  }

  /**
   * Determines if an error is recoverable
   */
  public isRecoverable(error: ClassifiedError): boolean {
    return error.recoverable && (
      error.retryable || 
      error.type === ErrorType.PROCESSING || 
      error.type === ErrorType.NETWORK
    );
  }

  /**
   * Gets recommended recovery action for an error
   */
  public getRecoveryRecommendation(error: ClassifiedError): {
    action: 'retry' | 'restore' | 'report' | 'manual';
    message: string;
    automated: boolean;
  } {
    if (error.retryable && error.type === ErrorType.NETWORK) {
      return {
        action: 'retry',
        message: 'Retry automatically - network issues are usually temporary',
        automated: true
      };
    }

    if (error.type === ErrorType.PROCESSING) {
      return {
        action: 'restore',
        message: 'Restore from checkpoint and retry processing',
        automated: false
      };
    }

    if (error.type === ErrorType.AUTHENTICATION) {
      return {
        action: 'manual',
        message: 'Please sign in again to continue',
        automated: false
      };
    }

    if (error.type === ErrorType.QUOTA_EXCEEDED) {
      return {
        action: 'report',
        message: 'Usage limit reached - please upgrade or contact support',
        automated: false
      };
    }

    if (error.retryable) {
      return {
        action: 'retry',
        message: 'Retry the operation',
        automated: false
      };
    }

    return {
      action: 'report',
      message: 'Report this issue to our support team',
      automated: false
    };
  }

  /**
   * Private helper methods
   */
  private async handleErrorReporting(
    error: ClassifiedError,
    context: {
      operationName: string;
      jobId?: string;
      sessionId?: string;
    },
    retryResult?: RetryResult<any>
  ): Promise<string> {
    const checkpoints = context.jobId 
      ? await this.getJobCheckpoints(context.jobId)
      : [];

    const recoveryAttempts = this.errorReporting.getRecoveryAttempts();

    // Add retry result to recovery attempts if available
    if (retryResult) {
      this.errorReporting.trackRecoveryAttempt(
        'retry',
        retryResult.success ? 'success' : 'failure',
        {
          attempts: retryResult.attempts.length,
          totalTime: retryResult.totalExecutionTime,
          recoveredFromCheckpoint: retryResult.recoveredFromCheckpoint
        },
        retryResult
      );
    }

    return this.errorReporting.reportError(error, {
      sessionId: context.sessionId,
      jobId: context.jobId,
      checkpoints,
      recoveryAttempts: this.errorReporting.getRecoveryAttempts()
    });
  }
}

export default ErrorRecoveryManager;