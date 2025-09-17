/**
 * Error Classification System for CVPlus Platform
 * 
 * Provides comprehensive error classification with recovery strategies,
 * user-friendly messaging, and intelligent retry mechanisms.
 */

export const ErrorType = {
  NETWORK: 'network',
  API_RATE_LIMIT: 'api_rate_limit',
  AUTHENTICATION: 'authentication',
  PROCESSING: 'processing',
  VALIDATION: 'validation',
  STORAGE: 'storage',
  TIMEOUT: 'timeout',
  QUOTA_EXCEEDED: 'quota_exceeded',
  UNKNOWN: 'unknown'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export const ErrorSeverity = {
  LOW: 'low',        // Minor issues that don't block progress
  MEDIUM: 'medium',  // Issues that require user attention
  HIGH: 'high',      // Critical issues that stop progress
  CRITICAL: 'critical' // System-level failures
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

export const RecoveryStrategy = {
  AUTO_RETRY: 'auto_retry',
  USER_RETRY: 'user_retry',
  FALLBACK_METHOD: 'fallback_method',
  CHECKPOINT_RESTORE: 'checkpoint_restore',
  MANUAL_INTERVENTION: 'manual_intervention',
  GRACEFUL_DEGRADATION: 'graceful_degradation'
} as const;

export type RecoveryStrategy = typeof RecoveryStrategy[keyof typeof RecoveryStrategy];

export interface ErrorContext {
  operation: string;
  jobId?: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  networkStatus?: 'online' | 'offline';
  retryCount?: number;
  lastCheckpoint?: string;
  additionalData?: Record<string, unknown>;
}

export interface ClassifiedError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  originalError: Error;
  message: string;
  userMessage: string;
  recoveryStrategy: RecoveryStrategy;
  context: ErrorContext;
  recoverable: boolean;
  retryable: boolean;
  maxRetries: number;
  retryDelay: number;
  actionableSteps: string[];
  supportTicketRequired: boolean;
  telemetryData: Record<string, unknown>;
}

export class ErrorClassifier {
  private static instance: ErrorClassifier;
  
  private constructor() {}
  
  public static getInstance(): ErrorClassifier {
    if (!ErrorClassifier.instance) {
      ErrorClassifier.instance = new ErrorClassifier();
    }
    return ErrorClassifier.instance;
  }

  /**
   * Classifies an error and provides recovery information
   */
  public classify(error: Error | any, context: Partial<ErrorContext>): ClassifiedError {
    const errorId = this.generateErrorId();
    const fullContext: ErrorContext = {
      operation: 'unknown',
      timestamp: new Date(),
      networkStatus: navigator.onLine ? 'online' : 'offline',
      userAgent: navigator.userAgent,
      ...context
    };

    const classification = this.analyzeError(error);
    const recoveryInfo = this.determineRecoveryStrategy(classification.type, error);

    return {
      id: errorId,
      type: classification.type,
      severity: classification.severity,
      originalError: error,
      message: this.extractErrorMessage(error),
      userMessage: this.generateUserMessage(classification.type, error),
      recoveryStrategy: recoveryInfo.strategy,
      context: fullContext,
      recoverable: recoveryInfo.recoverable,
      retryable: recoveryInfo.retryable,
      maxRetries: recoveryInfo.maxRetries,
      retryDelay: recoveryInfo.retryDelay,
      actionableSteps: this.generateActionableSteps(classification.type, error),
      supportTicketRequired: classification.severity === ErrorSeverity.CRITICAL,
      telemetryData: this.extractTelemetryData(error, fullContext)
    };
  }

  /**
   * Analyzes the error to determine type and severity
   */
  private analyzeError(error: unknown): { type: ErrorType; severity: ErrorSeverity } {
    const message = this.extractErrorMessage(error).toLowerCase();
    const errorObj = error as any;
    const code = errorObj?.code || errorObj?.status;

    // Network errors
    if (this.isNetworkError(error, message)) {
      return { type: ErrorType.NETWORK, severity: ErrorSeverity.MEDIUM };
    }

    // Authentication errors
    if (this.isAuthError(error, message, code)) {
      return { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.HIGH };
    }

    // Rate limiting
    if (this.isRateLimitError(error, message, code)) {
      return { type: ErrorType.API_RATE_LIMIT, severity: ErrorSeverity.MEDIUM };
    }

    // Timeout errors
    if (this.isTimeoutError(error, message)) {
      return { type: ErrorType.TIMEOUT, severity: ErrorSeverity.MEDIUM };
    }

    // Storage errors
    if (this.isStorageError(error, message)) {
      return { type: ErrorType.STORAGE, severity: ErrorSeverity.HIGH };
    }

    // Processing errors
    if (this.isProcessingError(error, message)) {
      return { type: ErrorType.PROCESSING, severity: ErrorSeverity.HIGH };
    }

    // Quota exceeded
    if (this.isQuotaError(error, message, code)) {
      return { type: ErrorType.QUOTA_EXCEEDED, severity: ErrorSeverity.HIGH };
    }

    // Validation errors
    if (this.isValidationError(error, message)) {
      return { type: ErrorType.VALIDATION, severity: ErrorSeverity.MEDIUM };
    }

    return { type: ErrorType.UNKNOWN, severity: ErrorSeverity.MEDIUM };
  }

  /**
   * Determines recovery strategy based on error type
   */
  private determineRecoveryStrategy(errorType: ErrorType, error: unknown): {
    strategy: RecoveryStrategy;
    recoverable: boolean;
    retryable: boolean;
    maxRetries: number;
    retryDelay: number;
  } {
    switch (errorType) {
      case ErrorType.NETWORK:
        return {
          strategy: RecoveryStrategy.AUTO_RETRY,
          recoverable: true,
          retryable: true,
          maxRetries: 3,
          retryDelay: 2000
        };

      case ErrorType.API_RATE_LIMIT:
        return {
          strategy: RecoveryStrategy.AUTO_RETRY,
          recoverable: true,
          retryable: true,
          maxRetries: 5,
          retryDelay: 30000 // 30 seconds for rate limits
        };

      case ErrorType.AUTHENTICATION:
        return {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          recoverable: true,
          retryable: false,
          maxRetries: 0,
          retryDelay: 0
        };

      case ErrorType.PROCESSING:
        return {
          strategy: RecoveryStrategy.CHECKPOINT_RESTORE,
          recoverable: true,
          retryable: true,
          maxRetries: 2,
          retryDelay: 5000
        };

      case ErrorType.TIMEOUT:
        return {
          strategy: RecoveryStrategy.AUTO_RETRY,
          recoverable: true,
          retryable: true,
          maxRetries: 2,
          retryDelay: 10000
        };

      case ErrorType.STORAGE:
        return {
          strategy: RecoveryStrategy.USER_RETRY,
          recoverable: true,
          retryable: true,
          maxRetries: 3,
          retryDelay: 3000
        };

      case ErrorType.QUOTA_EXCEEDED:
        return {
          strategy: RecoveryStrategy.GRACEFUL_DEGRADATION,
          recoverable: false,
          retryable: false,
          maxRetries: 0,
          retryDelay: 0
        };

      case ErrorType.VALIDATION:
        return {
          strategy: RecoveryStrategy.MANUAL_INTERVENTION,
          recoverable: true,
          retryable: false,
          maxRetries: 0,
          retryDelay: 0
        };

      default:
        return {
          strategy: RecoveryStrategy.USER_RETRY,
          recoverable: true,
          retryable: true,
          maxRetries: 1,
          retryDelay: 5000
        };
    }
  }

  /**
   * Error detection helpers
   */
  private isNetworkError(error: unknown, message: string): boolean {
    return !navigator.onLine ||
           message.includes('network') ||
           message.includes('fetch') ||
           message.includes('connection') ||
           (error as any)?.code === 'NETWORK_ERROR' ||
           (error as any)?.name === 'NetworkError';
  }

  private isAuthError(error: unknown, message: string, code: unknown): boolean {
    return message.includes('authentication') ||
           message.includes('unauthorized') ||
           message.includes('permission denied') ||
           code === 401 ||
           code === 403 ||
           (error as any)?.code === 'permission-denied' ||
           (error as any)?.code === 'unauthenticated';
  }

  private isRateLimitError(error: unknown, message: string, code: unknown): boolean {
    return message.includes('rate limit') ||
           message.includes('too many requests') ||
           message.includes('quota') ||
           code === 429 ||
           error.code === 'resource-exhausted';
  }

  private isTimeoutError(error: unknown, message: string): boolean {
    const err = error as any;
    return message.includes('timeout') ||
           message.includes('timed out') ||
           err?.name === 'TimeoutError' ||
           err?.code === 'TIMEOUT';
  }

  private isStorageError(error: unknown, message: string): boolean {
    const err = error as any;
    return message.includes('storage') ||
           message.includes('bucket') ||
           message.includes('file not found') ||
           err?.code?.includes('storage');
  }

  private isProcessingError(error: unknown, message: string): boolean {
    const err = error as any;
    return message.includes('processing') ||
           message.includes('parse') ||
           message.includes('transform') ||
           message.includes('anthropic') ||
           message.includes('ai');
  }

  private isQuotaError(error: unknown, message: string, code: unknown): boolean {
    return message.includes('quota exceeded') ||
           message.includes('billing') ||
           message.includes('limit exceeded') ||
           code === 402;
  }

  private isValidationError(error: unknown, message: string): boolean {
    const err = error as any;
    return message.includes('validation') ||
           message.includes('invalid') ||
           message.includes('missing required') ||
           err?.name === 'ValidationError';
  }

  /**
   * Helper methods
   */
  private extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    const err = error as any;
    return err?.message || err?.error?.message || 'An unknown error occurred';
  }

  private generateUserMessage(errorType: ErrorType, error: unknown): string {
    const baseMessages = {
      [ErrorType.NETWORK]: "Connection issue detected. Please check your internet connection and try again.",
      [ErrorType.API_RATE_LIMIT]: "Service is temporarily busy. We'll automatically retry in a moment.",
      [ErrorType.AUTHENTICATION]: "Please sign in again to continue with your CV processing.",
      [ErrorType.PROCESSING]: "There was an issue processing your CV. We'll restore from the last checkpoint.",
      [ErrorType.VALIDATION]: "Please check your input and try again.",
      [ErrorType.STORAGE]: "File access issue. Please try uploading again.",
      [ErrorType.TIMEOUT]: "The operation took too long. We'll try again with a shorter timeout.",
      [ErrorType.QUOTA_EXCEEDED]: "You've reached your usage limit. Please upgrade your plan or try again later.",
      [ErrorType.UNKNOWN]: "An unexpected error occurred. Our team has been notified."
    };

    return baseMessages[errorType] || baseMessages[ErrorType.UNKNOWN];
  }

  private generateActionableSteps(errorType: ErrorType, error: unknown): string[] {
    switch (errorType) {
      case ErrorType.NETWORK:
        return [
          "Check your internet connection",
          "Try refreshing the page",
          "Ensure you're not using a VPN that might block the service"
        ];

      case ErrorType.AUTHENTICATION:
        return [
          "Sign out and sign back in",
          "Clear your browser cache and cookies",
          "Check if your account is still active"
        ];

      case ErrorType.PROCESSING:
        return [
          "We'll automatically restore from your last checkpoint",
          "Ensure your CV file is not corrupted",
          "Try with a different file format if the issue persists"
        ];

      case ErrorType.STORAGE:
        return [
          "Check your file size (should be under 10MB)",
          "Ensure the file format is supported (PDF, DOC, DOCX, TXT)",
          "Try uploading again"
        ];

      case ErrorType.QUOTA_EXCEEDED:
        return [
          "Upgrade your plan for more processing credits",
          "Wait until your quota resets",
          "Contact support for assistance"
        ];

      default:
        return [
          "Try the operation again",
          "Contact support if the problem persists",
          "Include the error ID in your support request"
        ];
    }
  }

  private extractTelemetryData(error: unknown, context: ErrorContext): Record<string, unknown> {
    const err = error as any;
    return {
      errorName: err?.name,
      errorCode: err?.code,
      httpStatus: err?.status,
      operation: context.operation,
      timestamp: context.timestamp.toISOString(),
      userAgent: context.userAgent,
      networkStatus: context.networkStatus,
      retryCount: context.retryCount || 0,
      sessionId: context.sessionId,
      jobId: context.jobId,
      stackTrace: err?.stack ? err.stack.split('\n').slice(0, 10) : undefined
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}