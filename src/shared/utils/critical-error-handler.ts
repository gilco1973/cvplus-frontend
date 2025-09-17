/**
 * Critical Error Handler - Prevents system crashes from Firestore assertion errors
 * Addresses: INTERNAL ASSERTION FAILED (ID: b815/ca9) patterns
 */

export interface CriticalError {
  type: 'FIRESTORE_ASSERTION' | 'MEMORY_LEAK' | 'NETWORK_FAILURE' | 'AUTH_FAILURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export class CriticalErrorHandler {
  private static instance: CriticalErrorHandler;
  private errorQueue: CriticalError[] = [];
  private readonly maxQueueSize = 100;

  public static getInstance(): CriticalErrorHandler {
    if (!CriticalErrorHandler.instance) {
      CriticalErrorHandler.instance = new CriticalErrorHandler();
    }
    return CriticalErrorHandler.instance;
  }

  /**
   * Handle Firestore assertion errors that cause system crashes
   */
  public handleFirestoreAssertion(error: Error, context?: Record<string, any>): boolean {
    const message = error.message.toLowerCase();
    
    // Detect known assertion patterns
    const isAssertion = message.includes('internal assertion failed') ||
                       message.includes('id: b815') ||
                       message.includes('id: ca9') ||
                       message.includes('assertion failed');

    if (isAssertion) {
      this.logCriticalError({
        type: 'FIRESTORE_ASSERTION',
        severity: 'CRITICAL',
        message: error.message,
        stack: error.stack,
        context
      });

      // Attempt recovery
      this.attemptFirestoreRecovery();
      return true; // Error handled
    }
    
    return false; // Not a Firestore assertion error
  }

  /**
   * Handle memory-related issues that could cause leaks
   */
  public handleMemoryIssue(error: Error, context?: Record<string, any>): void {
    this.logCriticalError({
      type: 'MEMORY_LEAK',
      severity: 'HIGH',
      message: error.message,
      stack: error.stack,
      context
    });

    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      try {
        (window as any).gc();
      } catch (gcError) {
        console.warn('Failed to trigger garbage collection:', gcError);
      }
    }
  }

  /**
   * Handle authentication failures that could cause cascading errors
   */
  public handleAuthFailure(error: Error, context?: Record<string, any>): void {
    this.logCriticalError({
      type: 'AUTH_FAILURE',
      severity: 'HIGH',
      message: error.message,
      stack: error.stack,
      context
    });
  }

  private logCriticalError(error: CriticalError): void {
    // Add to queue
    this.errorQueue.push({
      ...error,
      context: {
        ...error.context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log to console for debugging
    console.error('🚨 CRITICAL ERROR:', {
      type: error.type,
      severity: error.severity,
      message: error.message,
      context: error.context
    });

    // Send to monitoring service (if available)
    this.sendToMonitoring(error);
  }

  private async attemptFirestoreRecovery(): Promise<void> {
    try {
      // Clear any pending Firestore operations
      if (typeof window !== 'undefined' && (window as any).firestoreListeners) {
        const listeners = (window as any).firestoreListeners;
        Object.values(listeners).forEach((unsubscribe: any) => {
          if (typeof unsubscribe === 'function') {
            try {
              unsubscribe();
            } catch (cleanupError) {
              console.warn('Failed to cleanup listener:', cleanupError);
            }
          }
        });
        (window as any).firestoreListeners = {};
      }

      // Wait for next tick to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (recoveryError) {
      console.error('Firestore recovery failed:', recoveryError);
    }
  }

  private sendToMonitoring(error: CriticalError): void {
    // In a real implementation, send to your monitoring service
    // For now, we'll use localStorage as a fallback
    try {
      const errors = JSON.parse(localStorage.getItem('criticalErrors') || '[]');
      errors.push(error);
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.splice(0, errors.length - 50);
      }
      
      localStorage.setItem('criticalErrors', JSON.stringify(errors));
    } catch (storageError) {
      console.warn('Failed to store error for monitoring:', storageError);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const stats = {
      total: this.errorQueue.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>
    };

    this.errorQueue.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

/**
 * Global error handler setup
 */
export function setupCriticalErrorHandling(): void {
  const handler = CriticalErrorHandler.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    if (!handler.handleFirestoreAssertion(error)) {
      // Handle other critical errors
      handler.logCriticalError({
        type: 'NETWORK_FAILURE',
        severity: 'MEDIUM',
        message: error.message,
        context: { source: 'unhandledrejection' }
      });
    }
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    
    if (!handler.handleFirestoreAssertion(error)) {
      handler.logCriticalError({
        type: 'NETWORK_FAILURE',
        severity: 'MEDIUM',
        message: error.message,
        context: { 
          source: 'error',
          filename: event.filename,
          line: event.lineno,
          col: event.colno
        }
      });
    }
  });

  console.warn('🛡️ Critical error handling initialized');
}

export default CriticalErrorHandler;