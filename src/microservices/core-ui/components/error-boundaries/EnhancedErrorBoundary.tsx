/**
 * T044: Generic enhanced error boundary with comprehensive logging
 *
 * Universal error boundary that can be used throughout the application
 * to catch errors, provide detailed logging, and offer appropriate
 * recovery options based on error type and context.
 */

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, Bug, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { logger } from '../../utils/logger';

export interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  userId?: string;
  sessionId?: string;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRetry?: boolean;
  enableReporting?: boolean;
  maxRetries?: number;
  showStackTrace?: boolean;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorId: string;
  componentName: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReportError: () => void;
  onGoHome: () => void;
  enableRetry: boolean;
  enableReporting: boolean;
  showStackTrace: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
  errorTimestamp: Date;
  retryCount: number;
  errorReported: boolean;
}

interface DetailedErrorContext {
  componentName: string;
  errorBoundary: string;
  userId?: string;
  sessionId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  retryCount: number;
  browserInfo: {
    language: string;
    platform: string;
    cookieEnabled: boolean;
    onlineStatus: boolean;
    viewport: {
      width: number;
      height: number;
    };
  };
  pageInfo: {
    title: string;
    referrer: string;
    hash: string;
    search: string;
  };
}

export class EnhancedErrorBoundary extends Component<ErrorBoundaryProps, State> {
  private errorId: string;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.errorId = this.generateErrorId();
    this.state = {
      hasError: false,
      error: null,
      errorId: this.errorId,
      errorTimestamp: new Date(),
      retryCount: 0,
      errorReported: false
    };
  }

  static defaultProps: Partial<ErrorBoundaryProps> = {
    componentName: 'UnknownComponent',
    enableRetry: true,
    enableReporting: true,
    maxRetries: 3,
    showStackTrace: false
  };

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  private getDetailedErrorContext(): DetailedErrorContext {
    return {
      componentName: this.props.componentName || 'UnknownComponent',
      errorBoundary: 'EnhancedErrorBoundary',
      userId: this.props.userId,
      sessionId: this.props.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      pageInfo: {
        title: document.title,
        referrer: document.referrer,
        hash: window.location.hash,
        search: window.location.search
      }
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorTimestamp: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorContext = this.getDetailedErrorContext();
    const errorClassification = this.classifyError(error);

    // Log comprehensive error details
    logger.logError('React Error Boundary caught error', error, {
      event: 'error.boundary.generic',
      errorId: this.state.errorId,
      errorBoundary: 'EnhancedErrorBoundary',
      componentName: this.props.componentName || 'UnknownComponent',
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary
      },
      context: errorContext,
      errorClassification,
      technicalDetails: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
        props: this.sanitizeProps(this.props)
      },
      performanceInfo: {
        memoryUsage: this.getMemoryUsage(),
        timing: this.getPerformanceTiming(),
        loadTime: Date.now() - performance.timeOrigin
      }
    });

    // Track error metrics
    logger.trackPerformance('error_boundary_processing_time', performance.now());

    // Log business impact
    logger.logEvent('error.business_impact', {
      errorId: this.state.errorId,
      impactLevel: errorClassification.userImpact,
      featureAffected: this.props.componentName,
      recoverable: this.props.enableRetry,
      businessFunction: this.getBusinessFunction()
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.logError('Error in custom error handler', handlerError, {
          originalErrorId: this.state.errorId,
          handlerError: true
        });
      }
    }

    // Show user notification based on error severity
    this.showUserNotification(error, errorClassification);
  }

  private classifyError(error: Error) {
    const classification = {
      type: 'general_error',
      category: 'runtime',
      severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      userImpact: 'medium' as 'low' | 'medium' | 'high' | 'blocking',
      recoverable: true,
      requiresImmedateAttention: false
    };

    // Classify by error type
    if (error.name === 'ChunkLoadError') {
      classification.type = 'chunk_load_error';
      classification.category = 'build';
      classification.severity = 'high';
      classification.userImpact = 'high';
      classification.recoverable = true;
    } else if (error.name === 'TypeError') {
      classification.type = 'type_error';
      classification.category = 'runtime';
      classification.severity = 'high';
      classification.userImpact = 'high';
      classification.recoverable = false;
    } else if (error.name === 'ReferenceError') {
      classification.type = 'reference_error';
      classification.category = 'runtime';
      classification.severity = 'critical';
      classification.userImpact = 'blocking';
      classification.recoverable = false;
      classification.requiresImmedateAttention = true;
    } else if (error.message.includes('Network')) {
      classification.type = 'network_error';
      classification.category = 'network';
      classification.severity = 'high';
      classification.userImpact = 'high';
      classification.recoverable = true;
    } else if (error.message.includes('timeout')) {
      classification.type = 'timeout_error';
      classification.category = 'performance';
      classification.severity = 'medium';
      classification.userImpact = 'medium';
      classification.recoverable = true;
    }

    return classification;
  }

  private getBusinessFunction(): string {
    const componentName = this.props.componentName || '';
    if (componentName.includes('CV') || componentName.includes('Generation')) return 'cv_processing';
    if (componentName.includes('Auth') || componentName.includes('Login')) return 'authentication';
    if (componentName.includes('Payment') || componentName.includes('Premium')) return 'billing';
    if (componentName.includes('Profile') || componentName.includes('Portfolio')) return 'profile_management';
    if (componentName.includes('Analytics') || componentName.includes('Dashboard')) return 'analytics';
    return 'general';
  }

  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  private getPerformanceTiming() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart
      };
    }
    return null;
  }

  private sanitizeProps(props: ErrorBoundaryProps) {
    // Remove sensitive data and functions from props for logging
    const { children, onError, ...safePprops } = props;
    return {
      ...safePprops,
      hasChildren: !!children,
      hasErrorHandler: !!onError
    };
  }

  private showUserNotification(error: Error, classification: any) {
    let message = 'Something went wrong. Please try again.';
    let duration = 4000;

    if (classification.type === 'chunk_load_error') {
      message = 'Loading error. The page will refresh automatically.';
      duration = 3000;
      // Auto-refresh for chunk load errors
      setTimeout(() => window.location.reload(), 3000);
    } else if (classification.severity === 'critical') {
      message = 'Critical error detected. Please refresh the page.';
      duration = 8000;
    } else if (classification.type === 'network_error') {
      message = 'Network error. Please check your connection and try again.';
      duration = 6000;
    }

    toast.error(message, {
      duration,
      id: this.state.errorId
    });

    // Log notification
    logger.logEvent('error.user_notification', {
      errorId: this.state.errorId,
      notificationType: 'error_notification',
      message,
      duration,
      errorType: classification.type
    });
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    const newErrorId = this.generateErrorId();

    // Log retry attempt
    logger.logEvent('error.boundary.retry_attempt', {
      originalErrorId: this.state.errorId,
      newErrorId,
      retryCount: newRetryCount,
      errorBoundary: 'EnhancedErrorBoundary',
      componentName: this.props.componentName
    });

    this.setState({
      hasError: false,
      error: null,
      errorId: newErrorId,
      errorTimestamp: new Date(),
      retryCount: newRetryCount,
      errorReported: false
    });

    // Track retry success/failure
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

  handleReportError = () => {
    if (this.state.errorReported) return;

    logger.logEvent('error.boundary.user_report', {
      errorId: this.state.errorId,
      componentName: this.props.componentName,
      userInitiated: true
    });

    this.setState({ errorReported: true });

    toast.success('Error reported. Thank you for helping us improve!', {
      duration: 3000
    });

    // In a real app, this would send the error report to support
    // For now, we just log it with high priority
    logger.logError('User-reported error', this.state.error, {
      event: 'error.user_reported',
      errorId: this.state.errorId,
      priority: 'high',
      userReport: true
    });
  };

  handleGoHome = () => {
    logger.logEvent('error.boundary.navigate_home', {
      errorId: this.state.errorId,
      componentName: this.props.componentName
    });

    window.location.href = '/';
  };

  componentDidMount() {
    logger.logEvent('error.boundary.mounted', {
      errorBoundary: 'EnhancedErrorBoundary',
      componentName: this.props.componentName
    });
  }

  componentWillUnmount() {
    logger.logEvent('error.boundary.unmounted', {
      errorBoundary: 'EnhancedErrorBoundary',
      componentName: this.props.componentName,
      hadError: this.state.hasError,
      retryCount: this.state.retryCount,
      errorReported: this.state.errorReported
    });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallbackComponent || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorId={this.state.errorId}
          componentName={this.props.componentName || 'UnknownComponent'}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          onRetry={this.handleRetry}
          onReportError={this.handleReportError}
          onGoHome={this.handleGoHome}
          enableRetry={this.props.enableRetry || true}
          enableReporting={this.props.enableReporting || true}
          showStackTrace={this.props.showStackTrace || false}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback UI
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorId,
  componentName,
  retryCount,
  maxRetries,
  onRetry,
  onReportError,
  onGoHome,
  enableRetry,
  enableReporting,
  showStackTrace
}) => {
  const canRetry = enableRetry && retryCount < maxRetries;

  React.useEffect(() => {
    logger.logEvent('error.boundary.fallback_ui_rendered', {
      errorId,
      componentName,
      retryCount,
      maxRetries,
      canRetry
    });
  }, [errorId, componentName, retryCount, maxRetries, canRetry]);

  return (
    <div className="min-h-[400px] bg-gray-800 rounded-lg border border-red-500/30 p-8 m-4">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-100 mb-2">Something went wrong</h2>
        <p className="text-gray-300 mb-6">
          We encountered an error in the {componentName} component.
          {retryCount > 0 && ` This is attempt ${retryCount + 1}.`}
        </p>

        {error && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-mono text-red-300">{error.message}</p>
              <span className="text-xs text-gray-500 ml-2">
                ID: {errorId.substring(errorId.length - 8)}
              </span>
            </div>

            {showStackTrace && error.stack && (
              <details className="mt-3">
                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                  Technical Details
                </summary>
                <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {canRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
          )}

          <button
            onClick={onGoHome}
            className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Go Home
          </button>

          {enableReporting && (
            <button
              onClick={onReportError}
              className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <Bug className="w-4 h-4" />
              Report Issue
            </button>
          )}
        </div>

        {!canRetry && retryCount >= maxRetries && (
          <div className="mt-6 p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <p className="text-orange-200 text-sm">
              <Mail className="w-4 h-4 inline mr-1" />
              Maximum retry attempts reached. If this problem persists, please contact support
              with error ID: {errorId.substring(errorId.length - 8)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};