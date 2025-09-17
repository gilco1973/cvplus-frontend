/**
 * T044: Enhanced error boundary with comprehensive logging integration
 *
 * Advanced error boundary that captures detailed error information,
 * sends structured logs to the backend, and provides rich error context
 * for debugging and monitoring purposes.
 */

import React, { Component, ReactNode } from 'react';
import { Zap, AlertCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  onFallbackToSync?: () => void;
  onRetry?: () => void;
  componentName?: string;
  userId?: string;
  sessionId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  shouldFallbackToSync: boolean;
  errorId: string;
  errorTimestamp: Date;
  retryCount: number;
}

interface ErrorContext {
  componentName: string;
  errorBoundary: string;
  userId?: string;
  sessionId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  retryCount: number;
  shouldFallbackToSync: boolean;
}

// Enhanced error boundary with comprehensive logging
class EnhancedAsyncGenerationErrorBoundaryClass extends Component<Props, State> {
  private errorId: string;

  constructor(props: Props) {
    super(props);
    this.errorId = this.generateErrorId();
    this.state = {
      hasError: false,
      error: null,
      shouldFallbackToSync: false,
      errorId: this.errorId,
      errorTimestamp: new Date(),
      retryCount: 0
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getErrorContext(): ErrorContext {
    return {
      componentName: this.props.componentName || 'AsyncGenerationComponent',
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      userId: this.props.userId,
      sessionId: this.props.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      shouldFallbackToSync: this.state.shouldFallbackToSync
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Determine if we should fallback to sync mode based on error patterns
    const shouldFallbackToSync =
      error.message.includes('async') ||
      error.message.includes('timeout') ||
      error.message.includes('initiate') ||
      error.message.includes('fast track') ||
      error.message.includes('concurrent') ||
      error.name === 'TimeoutError';

    return {
      hasError: true,
      error,
      shouldFallbackToSync,
      errorTimestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorContext = this.getErrorContext();

    // Log detailed error information
    logger.logError('React Error Boundary caught error in async generation', error, {
      event: 'error.boundary.async_generation',
      errorId: this.state.errorId,
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      componentName: this.props.componentName || 'AsyncGenerationComponent',
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary
      },
      context: errorContext,
      errorClassification: {
        type: this.classifyError(error),
        severity: this.getErrorSeverity(error),
        recoverable: this.state.shouldFallbackToSync,
        userImpact: this.getUserImpact(error)
      },
      technicalDetails: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      }
    });

    // Track performance impact
    logger.trackPerformance('error_boundary_catch_time', performance.now());

    // Log user impact metrics
    logger.logEvent('error.boundary.user_impact', {
      errorId: this.state.errorId,
      impactLevel: this.getUserImpact(error),
      fallbackAvailable: this.state.shouldFallbackToSync,
      userExperience: this.state.shouldFallbackToSync ? 'degraded_with_fallback' : 'broken'
    });

    // Show appropriate user notification
    this.showUserNotification(error);

    // Automatically trigger fallback if recommended
    if (this.state.shouldFallbackToSync) {
      setTimeout(() => {
        this.handleFallbackToSync();
      }, 2000);
    }
  }

  private classifyError(error: Error): string {
    if (error.name === 'TypeError') return 'type_error';
    if (error.name === 'ReferenceError') return 'reference_error';
    if (error.name === 'SyntaxError') return 'syntax_error';
    if (error.name === 'TimeoutError') return 'timeout_error';
    if (error.message.includes('network')) return 'network_error';
    if (error.message.includes('async')) return 'async_operation_error';
    if (error.message.includes('permission')) return 'permission_error';
    return 'general_error';
  }

  private getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'critical';
    if (error.message.includes('timeout') || error.message.includes('network')) return 'high';
    if (error.message.includes('async') || error.message.includes('fallback')) return 'medium';
    return 'low';
  }

  private getUserImpact(error: Error): 'low' | 'medium' | 'high' | 'blocking' {
    if (this.state.shouldFallbackToSync) return 'medium'; // User can still proceed with fallback
    if (error.name === 'TypeError' || error.name === 'ReferenceError') return 'blocking';
    if (error.message.includes('timeout')) return 'high';
    return 'medium';
  }

  private showUserNotification(error: Error) {
    if (this.state.shouldFallbackToSync) {
      toast.error('Fast Track mode unavailable. Switching to standard mode...', {
        duration: 4000,
        id: this.state.errorId
      });

      // Log user notification
      logger.logEvent('error.user_notification', {
        errorId: this.state.errorId,
        notificationType: 'fallback_notification',
        message: 'Fast Track mode unavailable. Switching to standard mode...'
      });
    } else {
      toast.error('CV generation error. Please try again.', {
        duration: 5000,
        id: this.state.errorId
      });

      // Log user notification
      logger.logEvent('error.user_notification', {
        errorId: this.state.errorId,
        notificationType: 'error_notification',
        message: 'CV generation error. Please try again.'
      });
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    const newErrorId = this.generateErrorId();

    // Log retry attempt
    logger.logEvent('error.boundary.retry_attempt', {
      originalErrorId: this.state.errorId,
      newErrorId,
      retryCount: newRetryCount,
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      componentName: this.props.componentName || 'AsyncGenerationComponent'
    });

    this.setState({
      hasError: false,
      error: null,
      shouldFallbackToSync: false,
      errorId: newErrorId,
      errorTimestamp: new Date(),
      retryCount: newRetryCount
    });

    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Track retry success/failure after a delay
    setTimeout(() => {
      if (!this.state.hasError) {
        logger.logEvent('error.boundary.retry_success', {
          errorId: newErrorId,
          retryCount: newRetryCount,
          recoveryTime: Date.now() - this.state.errorTimestamp.getTime()
        });
      }
    }, 1000);
  };

  handleFallbackToSync = () => {
    // Log fallback action
    logger.logEvent('error.boundary.fallback_to_sync', {
      errorId: this.state.errorId,
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      fallbackTrigger: 'user_action',
      originalError: this.state.error?.message
    });

    this.setState({
      hasError: false,
      error: null,
      shouldFallbackToSync: false,
      errorId: this.generateErrorId(),
      errorTimestamp: new Date()
    });

    if (this.props.onFallbackToSync) {
      this.props.onFallbackToSync();
    }

    // Track fallback success
    setTimeout(() => {
      logger.logEvent('error.boundary.fallback_success', {
        errorId: this.state.errorId,
        recoveryMethod: 'sync_fallback',
        recoveryTime: Date.now() - this.state.errorTimestamp.getTime()
      });
    }, 1000);
  };

  // Track component lifecycle for monitoring
  componentDidMount() {
    logger.logEvent('error.boundary.mounted', {
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      componentName: this.props.componentName || 'AsyncGenerationComponent'
    });
  }

  componentWillUnmount() {
    logger.logEvent('error.boundary.unmounted', {
      errorBoundary: 'EnhancedAsyncGenerationErrorBoundary',
      hadError: this.state.hasError,
      retryCount: this.state.retryCount
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <EnhancedAsyncErrorFallbackUI
          error={this.state.error}
          errorId={this.state.errorId}
          shouldFallbackToSync={this.state.shouldFallbackToSync}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onFallbackToSync={this.handleFallbackToSync}
          componentName={this.props.componentName}
        />
      );
    }

    return this.props.children;
  }
}

// Enhanced error fallback UI with additional context
const EnhancedAsyncErrorFallbackUI: React.FC<{
  error: Error | null;
  errorId: string;
  shouldFallbackToSync: boolean;
  retryCount: number;
  onRetry: () => void;
  onFallbackToSync: () => void;
  componentName?: string;
}> = ({ error, errorId, shouldFallbackToSync, retryCount, onRetry, onFallbackToSync, componentName }) => {

  // Log UI render
  React.useEffect(() => {
    logger.logEvent('error.boundary.fallback_ui_rendered', {
      errorId,
      shouldFallbackToSync,
      retryCount,
      componentName: componentName || 'AsyncGenerationComponent'
    });
  }, [errorId, shouldFallbackToSync, retryCount, componentName]);

  const handleRetryClick = () => {
    logger.logEvent('error.boundary.fallback_ui_action', {
      errorId,
      action: 'retry_clicked',
      retryCount: retryCount + 1
    });
    onRetry();
  };

  const handleFallbackClick = () => {
    logger.logEvent('error.boundary.fallback_ui_action', {
      errorId,
      action: 'fallback_clicked',
      retryCount
    });
    onFallbackToSync();
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-red-500/30 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        {shouldFallbackToSync ? (
          <Zap className="w-6 h-6 text-yellow-400" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-400" />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {shouldFallbackToSync ? 'Fast Track Mode Unavailable' : 'Generation Error'}
          </h3>
          {retryCount > 0 && (
            <p className="text-sm text-gray-400">Attempt {retryCount + 1}</p>
          )}
        </div>
      </div>

      <p className="text-gray-300 mb-4">
        {shouldFallbackToSync
          ? 'There was an issue with Fast Track mode. We can switch to standard mode to complete your CV generation.'
          : 'We encountered an error during CV generation. You can try again or switch to standard mode.'
        }
      </p>

      {error && (
        <div className="bg-gray-700/50 rounded-md p-3 mb-4">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-400 font-mono">{error.message}</p>
            <span className="text-xs text-gray-500 ml-2">ID: {errorId.substring(-8)}</span>
          </div>
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">Stack Trace</summary>
              <pre className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{error.stack}</pre>
            </details>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {shouldFallbackToSync ? (
          <>
            <button
              onClick={handleFallbackClick}
              className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              Switch to Standard Mode
            </button>
            <button
              onClick={handleRetryClick}
              disabled={retryCount >= 3}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                retryCount >= 3
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Retry Fast Track {retryCount >= 3 ? '(Max Reached)' : ''}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleRetryClick}
              disabled={retryCount >= 3}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                retryCount >= 3
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again {retryCount >= 3 ? '(Max Reached)' : ''}
            </button>
            <button
              onClick={handleFallbackClick}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              Use Standard Mode
            </button>
          </>
        )}
      </div>

      {retryCount > 0 && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
          <p className="text-sm text-blue-200">
            💡 If you continue experiencing issues, try refreshing the page or contact support with error ID: {errorId.substring(-8)}
          </p>
        </div>
      )}
    </div>
  );
};

export const EnhancedAsyncGenerationErrorBoundary: React.FC<Props> = (props) => {
  return <EnhancedAsyncGenerationErrorBoundaryClass {...props} />;
};

// For backward compatibility, also export with original name
export const AsyncGenerationErrorBoundary = EnhancedAsyncGenerationErrorBoundary;