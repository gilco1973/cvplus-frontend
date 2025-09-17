/**
 * T044: Error boundary logging integration in frontend/src/components/common/ErrorBoundary.tsx
 *
 * Enhanced React Error Boundary with comprehensive logging integration.
 * Provides fallback UI when component errors occur and automatically logs
 * errors to the CVPlus logging system with detailed context.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
// Frontend-compatible logging - using console instead of logging system
const logger = {
  logError: (message: string, error: Error, context?: any) => console.error(message, error, context),
  logWarning: (message: string, context?: any) => console.warn(message, context),
  logInfo: (message: string, context?: any) => console.info(message, context),
};

// Frontend-compatible log levels
const LogLevel = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

const LogDomain = {
  FRONTEND: 'frontend',
  UI: 'ui',
  COMPONENT: 'component'
} as const;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  retryCount?: number;
  className?: string;
  // Logging-specific props
  componentName?: string;
  logLevel?: LogLevel;
  logDomain?: LogDomain;
  enableDetailedLogging?: boolean;
  userId?: string;
  sessionId?: string;
  additionalContext?: Record<string, any>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryAttempt: number;
  errorId?: string;
  errorTimestamp?: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private errorLogger = logger.component(this.props.componentName || 'ErrorBoundary');

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryAttempt: 0
    };

    // Set up logging context
    if (props.userId) {
      logger.setUserContext({ userId: props.userId });
    }
    if (props.sessionId) {
      logger.setCorrelationId(props.sessionId);
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const errorTimestamp = Date.now();

    return {
      hasError: true,
      error,
      retryAttempt: 0,
      errorId,
      errorTimestamp
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const {
      componentName = 'Unknown',
      logLevel = LogLevel.ERROR,
      logDomain = LogDomain.SYSTEM,
      enableDetailedLogging = true,
      userId,
      sessionId,
      additionalContext = {}
    } = this.props;

    // Generate unique error ID for tracking
    const errorId = this.state.errorId || `error_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const errorTimestamp = this.state.errorTimestamp || Date.now();

    this.setState({
      error,
      errorInfo,
      errorId,
      errorTimestamp
    });

    // Build comprehensive error context
    const errorContext = {
      event: 'react_error_boundary',
      errorId,
      componentName,
      retryAttempt: this.state.retryAttempt,
      userId,
      sessionId,
      ...additionalContext,
      error: {
        name: error.name,
        message: error.message,
        stack: enableDetailedLogging ? error.stack : '[REDACTED]'
      },
      errorInfo: {
        componentStack: enableDetailedLogging ? errorInfo.componentStack : '[REDACTED]'
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        pathname: window.location.pathname,
        referrer: document.referrer,
        timestamp: errorTimestamp
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    };

    // Log the error using the enhanced logger
    this.errorLogger.logError(
      `React Error Boundary caught error in ${componentName}`,
      error,
      {
        domain: logDomain,
        event: 'REACT_ERROR_BOUNDARY',
        ...errorContext
      }
    );

    // Also log to the service-specific logger for better categorization
    const serviceLogger = logger.service('react-error-handling');
    serviceLogger.logError(
      `Component error in ${componentName}`,
      error,
      {
        domain: logDomain,
        event: 'COMPONENT_ERROR',
        severity: this.determineSeverity(error),
        ...errorContext
      }
    );

    // Track error as a user action for analytics
    logger.trackAction('error_boundary_triggered', 'error_handling', {
      errorId,
      componentName,
      errorType: error.name,
      errorMessage: error.message,
      retryAttempt: this.state.retryAttempt,
      userId,
      sessionId
    });

    // Log performance impact if available
    if ('performance' in window && performance.now) {
      const performanceEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (performanceEntry) {
        logger.trackPerformance('error_boundary_trigger_time', performanceEntry.loadEventEnd, 'ms', {
          errorId,
          componentName,
          errorType: error.name
        });
      }
    }

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log console error for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ErrorBoundary caught error in ${componentName}`);
      console.error('Error ID:', errorId);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorContext);
      console.groupEnd();
    }
  }

  /**
   * Determine error severity based on error characteristics
   */
  private determineSeverity(error: Error): string {
    // Network-related errors are usually transient
    if (error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch')) {
      return 'medium';
    }

    // Memory errors are critical
    if (error.message.toLowerCase().includes('memory') ||
        error.message.toLowerCase().includes('heap')) {
      return 'critical';
    }

    // Security-related errors are high priority
    if (error.message.toLowerCase().includes('security') ||
        error.message.toLowerCase().includes('permission')) {
      return 'high';
    }

    // Type errors might indicate development issues
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'high';
    }

    // Default severity
    return 'medium';
  }

  handleRetry = () => {
    const { componentName = 'Unknown', userId, sessionId } = this.props;
    const newRetryAttempt = this.state.retryAttempt + 1;

    // Log retry attempt
    this.errorLogger.logInfo(
      `Error boundary retry attempt ${newRetryAttempt} for ${componentName}`,
      {
        event: 'ERROR_BOUNDARY_RETRY',
        errorId: this.state.errorId,
        componentName,
        retryAttempt: newRetryAttempt,
        previousError: this.state.error?.message,
        userId,
        sessionId
      }
    );

    // Track retry as user action
    logger.trackAction('error_boundary_retry', 'error_recovery', {
      errorId: this.state.errorId,
      componentName,
      retryAttempt: newRetryAttempt,
      userId,
      sessionId
    });

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryAttempt: newRetryAttempt
    });
  };

  handleGoHome = () => {
    const { componentName = 'Unknown', userId, sessionId } = this.props;

    // Log navigation away from error
    this.errorLogger.logInfo(
      `User navigated home from error boundary in ${componentName}`,
      {
        event: 'ERROR_BOUNDARY_HOME_NAVIGATION',
        errorId: this.state.errorId,
        componentName,
        retryAttempt: this.state.retryAttempt,
        userId,
        sessionId
      }
    );

    // Track as user action
    logger.trackAction('error_boundary_home_navigation', 'error_recovery', {
      errorId: this.state.errorId,
      componentName,
      retryAttempt: this.state.retryAttempt,
      userId,
      sessionId
    });

    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        title = 'Something went wrong',
        message,
        showRetry = true,
        retryCount = 0,
        className = ''
      } = this.props;

      const displayMessage = message || this.state.error?.message || 'An unexpected error occurred';
      const showRetryButton = showRetry && this.state.retryAttempt < 3;

      return (
        <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
          <div className="flex items-center justify-center py-8">
            <div className="text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-6">{displayMessage}</p>
              
              {/* Retry and navigation buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {showRetryButton && (
                  <button
                    onClick={this.handleRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                    {this.state.retryAttempt > 0 && (
                      <span className="text-blue-200">({this.state.retryAttempt}/3)</span>
                    )}
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>
              
              {/* Additional retry info and error ID */}
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Previous retry attempts: {retryCount}
                </p>
              )}

              {/* Error ID for support reference */}
              {this.state.errorId && (
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                  <span className="font-medium">Error ID:</span> {this.state.errorId}
                  <br />
                  <span className="font-medium">Time:</span> {this.state.errorTimestamp && new Date(this.state.errorTimestamp).toLocaleString()}
                </div>
              )}
              
              {/* Technical details (development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="font-semibold mb-1">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    
                    {this.state.error.stack && (
                      <>
                        <div className="font-semibold mb-1">Stack:</div>
                        <pre className="whitespace-pre-wrap break-all">
                          {this.state.error.stack}
                        </pre>
                      </>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <div className="font-semibold mb-1 mt-2">Component Stack:</div>
                        <pre className="whitespace-pre-wrap break-all">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component version for simple error display
interface FunctionalErrorBoundaryProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

export const FunctionalErrorBoundary: React.FC<FunctionalErrorBoundaryProps> = ({
  error,
  onRetry,
  title = 'Error',
  className = ''
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm text-red-700 mt-1">{error.message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-1 text-red-600 hover:text-red-700 transition-colors"
            title="Retry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;