/**
 * Standard Error Handling Utilities for TypeScript Type Safety
 * Provides consistent error handling patterns across the CVPlus codebase
 */

import { logger } from '@cvplus/logging';

export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toErrorWithMessage(maybeError: unknown): { message: string } {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

/**
 * Firebase specific error type guard
 */
export function isFirebaseError(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Network/Fetch error type guard
 */
export function isFetchError(error: unknown): error is { status: number; statusText: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  );
}

/**
 * Validation error type guard for form errors
 */
export function isValidationError(error: unknown): error is { field: string; message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).field === 'string' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Safe error logging that handles unknown error types
 * Enhanced with CVPlus logging system integration
 */
export function logError(context: string, error: unknown, additionalData?: Record<string, unknown>): void {
  const errorMessage = getErrorMessage(error);

  // Enhanced logging with @cvplus/logging system
  if (isError(error)) {
    logger.logError(`ErrorHandler: Standard error in ${context}`, error, {
      event: 'error_handler.standard_error',
      context,
      errorType: 'Error',
      ...additionalData
    });
  } else if (isFirebaseError(error)) {
    logger.logError(`ErrorHandler: Firebase error in ${context}`, new Error(error.message), {
      event: 'error_handler.firebase_error',
      context,
      errorType: 'FirebaseError',
      firebaseErrorCode: error.code,
      ...additionalData
    });
  } else {
    logger.logError(`ErrorHandler: Unknown error type in ${context}`, new Error(errorMessage), {
      event: 'error_handler.unknown_error',
      context,
      errorType: 'Unknown',
      originalError: typeof error,
      ...additionalData
    });
  }

  // Fallback console logging for development
  if (process.env.NODE_ENV === 'development') {
    const logData = {
      context,
      error: errorMessage,
      timestamp: new Date().toISOString(),
      ...additionalData
    };

    if (isError(error)) {
      console.error(`[${context}] Error:`, error.message, error.stack, logData);
    } else if (isFirebaseError(error)) {
      console.error(`[${context}] Firebase Error [${error.code}]:`, error.message, logData);
    } else {
      console.error(`[${context}] Unknown Error:`, errorMessage, logData);
    }
  }
}

/**
 * Standardized error handling for async operations
 * Enhanced with comprehensive logging and performance tracking
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T,
  userId?: string
): Promise<{ data?: T; error?: string; success: boolean }> {
  const startTime = Date.now();

  logger.logDebug(`AsyncHandler: Starting operation in ${context}`, {
    event: 'async_handler.operation_started',
    context,
    hasFallback: !!fallback,
    userId,
    util: 'handleAsyncOperation'
  });

  try {
    const data = await operation();
    const duration = Date.now() - startTime;

    logger.logInfo(`AsyncHandler: Operation completed successfully in ${context}`, {
      event: 'async_handler.operation_success',
      context,
      duration,
      hasData: !!data,
      dataType: typeof data,
      userId,
      util: 'handleAsyncOperation'
    });

    return { data, success: true };

  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = getErrorMessage(error);

    // Log the error with enhanced context
    logger.logError(`AsyncHandler: Operation failed in ${context}`, error instanceof Error ? error : new Error(errorMessage), {
      event: 'async_handler.operation_failed',
      context,
      duration,
      errorMessage,
      hasFallback: !!fallback,
      userId,
      util: 'handleAsyncOperation'
    });

    // Also use the enhanced logError function
    logError(context, error, {
      operationType: 'async_operation',
      duration,
      hasFallback: !!fallback,
      userId
    });

    return {
      error: errorMessage,
      success: false,
      data: fallback
    };
  }
}

/**
 * Enhanced type guard functions with logging
 */

export function isErrorWithLogging(error: unknown, context?: string): error is Error {
  const result = isError(error);

  if (context && !result) {
    logger.logWarning(`TypeGuard: Non-Error type passed to isError in ${context}`, {
      event: 'type_guard.invalid_error_type',
      context,
      actualType: typeof error,
      util: 'isErrorWithLogging'
    });
  }

  return result;
}

export function isFirebaseErrorWithLogging(error: unknown, context?: string): error is { code: string; message: string } {
  const result = isFirebaseError(error);

  if (context) {
    if (result) {
      logger.logDebug(`TypeGuard: Firebase error detected in ${context}`, {
        event: 'type_guard.firebase_error_detected',
        context,
        firebaseErrorCode: (error as { code: string }).code,
        util: 'isFirebaseErrorWithLogging'
      });
    } else {
      logger.logDebug(`TypeGuard: Non-Firebase error in ${context}`, {
        event: 'type_guard.non_firebase_error',
        context,
        actualType: typeof error,
        util: 'isFirebaseErrorWithLogging'
      });
    }
  }

  return result;
}

/**
 * Critical error reporting for system-level failures
 */
export function reportCriticalError(
  context: string,
  error: unknown,
  additionalData?: Record<string, unknown>
): void {
  const errorMessage = getErrorMessage(error);

  logger.logCritical(`CriticalErrorHandler: System-level failure in ${context}`,
    error instanceof Error ? error : new Error(errorMessage), {
    event: 'critical_error.system_failure',
    context,
    criticalFailure: true,
    requiresImmediateAttention: true,
    ...additionalData
  });

  // Additional critical error handling could include:
  // - Sending alerts to monitoring systems
  // - Creating incidents in issue tracking
  // - Notifying on-call engineers
}

/**
 * Performance monitoring for operations with error handling
 */
export async function monitoredOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  context: string,
  performanceThresholds?: {
    warning: number;
    error: number;
  }
): Promise<T> {
  const startTime = Date.now();
  const thresholds = performanceThresholds || { warning: 1000, error: 5000 };

  logger.logDebug(`PerformanceMonitor: Starting monitored operation ${operationName}`, {
    event: 'performance_monitor.operation_started',
    operationName,
    context,
    util: 'monitoredOperation'
  });

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    // Log performance warnings based on thresholds
    if (duration > thresholds.error) {
      logger.logError(`PerformanceMonitor: Operation ${operationName} exceeded error threshold`,
        new Error('Performance threshold exceeded'), {
        event: 'performance_monitor.error_threshold_exceeded',
        operationName,
        context,
        duration,
        errorThreshold: thresholds.error,
        performanceIssue: true,
        util: 'monitoredOperation'
      });
    } else if (duration > thresholds.warning) {
      logger.logWarning(`PerformanceMonitor: Operation ${operationName} exceeded warning threshold`, {
        event: 'performance_monitor.warning_threshold_exceeded',
        operationName,
        context,
        duration,
        warningThreshold: thresholds.warning,
        performanceIssue: true,
        util: 'monitoredOperation'
      });
    } else {
      logger.logInfo(`PerformanceMonitor: Operation ${operationName} completed within thresholds`, {
        event: 'performance_monitor.operation_completed',
        operationName,
        context,
        duration,
        util: 'monitoredOperation'
      });
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.logError(`PerformanceMonitor: Operation ${operationName} failed`,
      error instanceof Error ? error : new Error(getErrorMessage(error)), {
      event: 'performance_monitor.operation_failed',
      operationName,
      context,
      duration,
      util: 'monitoredOperation'
    });

    throw error;
  }
}