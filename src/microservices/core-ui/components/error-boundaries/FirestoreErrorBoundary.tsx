import React, { Component, ReactNode } from 'react';

interface FirestoreErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  lastErrorTime: number;
  errorPattern?: string;
  isRecovering: boolean;
  connectionStatus: 'unknown' | 'online' | 'offline' | 'degraded';
}

interface FirestoreErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, context?: FirestoreErrorContext) => void;
  maxRetries?: number;
  retryDelay?: number;
  fallbackComponent?: ReactNode;
  resetOnPropsChange?: boolean;
  identifier?: string; // To identify which boundary triggered
  enableOfflineMode?: boolean; // Allow graceful degradation to offline mode
  criticalFeature?: boolean; // If true, error is more severe and needs different handling
  onRecovery?: (recoveryMethod: string) => void; // Called when recovery succeeds
}

interface FirestoreErrorContext {
  errorPattern: string;
  isKnownIssue: boolean;
  suggestedRecovery: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  relatedFeatures: string[];
}

/**
 * Error boundary specifically designed for Firestore-related errors
 * Handles Firebase assertion errors, listener failures, and network issues
 */
export class FirestoreErrorBoundary extends Component<
  FirestoreErrorBoundaryProps,
  FirestoreErrorBoundaryState
> {
  private retryTimer?: NodeJS.Timeout;
  private isMounted = false; // Track mount status
  
  constructor(props: FirestoreErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      lastErrorTime: 0,
      isRecovering: false,
      connectionStatus: 'unknown'
    };
  }

  componentDidMount() {
    this.isMounted = true;
    // Set up network status monitoring after component is mounted
    this.initializeNetworkMonitoring();
  }

  static getDerivedStateFromError(error: Error): Partial<FirestoreErrorBoundaryState> {
    const errorAnalysis = FirestoreErrorBoundary.analyzeFirestoreError(error);
    
    if (errorAnalysis.isFirestoreError) {
      console.error('[FirestoreErrorBoundary] Firestore error detected:', {
        error: error.message,
        pattern: errorAnalysis.pattern,
        severity: errorAnalysis.severity,
        isKnownIssue: errorAnalysis.isKnownIssue
      });
      
      return {
        hasError: true,
        error,
        errorPattern: errorAnalysis.pattern,
        lastErrorTime: Date.now()
      };
    }
    
    // Let other error boundaries handle non-Firestore errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorAnalysis = FirestoreErrorBoundary.analyzeFirestoreError(error);
    
    if (errorAnalysis.isFirestoreError) {
      const errorContext: FirestoreErrorContext = {
        errorPattern: errorAnalysis.pattern,
        isKnownIssue: errorAnalysis.isKnownIssue,
        suggestedRecovery: errorAnalysis.suggestedRecovery,
        severity: errorAnalysis.severity,
        relatedFeatures: errorAnalysis.relatedFeatures
      };

      console.error('[FirestoreErrorBoundary] Comprehensive error analysis:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        identifier: this.props.identifier,
        analysis: errorContext,
        retryAttempt: this.state.retryCount + 1
      });

      // Only call setState during error handling - component should be mounted
      this.setState({
        errorInfo,
        retryCount: this.state.retryCount + 1,
        errorPattern: errorAnalysis.pattern
      });

      // Call enhanced error handler with context
      this.props.onError?.(error, errorInfo, errorContext);

      // Schedule recovery attempt based on error severity
      this.scheduleIntelligentRecovery(errorContext);
    } else {
      // Re-throw non-Firestore errors
      throw error;
    }
  }

  componentDidUpdate(prevProps: FirestoreErrorBoundaryProps) {
    // Reset error state when props change (useful for route changes)
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    this.isMounted = false;
    
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
    
    // Clean up network monitoring
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  private static analyzeFirestoreError(error: Error): {
    isFirestoreError: boolean;
    pattern: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    isKnownIssue: boolean;
    suggestedRecovery: string[];
    relatedFeatures: string[];
  } {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    // Critical known issue: b815 assertion failure (duplicate listeners)
    if (message.includes('id: b815') || message.includes('internal assertion failed')) {
      return {
        isFirestoreError: true,
        pattern: 'CRITICAL_ASSERTION_B815',
        severity: 'critical',
        isKnownIssue: true,
        suggestedRecovery: ['listener-cleanup', 'component-remount', 'page-reload'],
        relatedFeatures: ['job-tracking', 'progress-monitoring', 'real-time-updates']
      };
    }
    
    // High severity: Multiple listener conflicts
    if (message.includes('snapshot') && message.includes('listener') || message.includes('watchchange')) {
      return {
        isFirestoreError: true,
        pattern: 'LISTENER_CONFLICT',
        severity: 'high',
        isKnownIssue: true,
        suggestedRecovery: ['listener-deduplication', 'component-remount'],
        relatedFeatures: ['real-time-updates', 'job-subscriptions']
      };
    }
    
    // Medium severity: General Firestore connection issues
    if (message.includes('firestore') || message.includes('firebase') || 
        stack.includes('firestore') || stack.includes('firebase') || 
        error.name === 'FirebaseError') {
      return {
        isFirestoreError: true,
        pattern: 'FIRESTORE_CONNECTION',
        severity: 'medium',
        isKnownIssue: false,
        suggestedRecovery: ['retry-with-backoff', 'offline-mode'],
        relatedFeatures: ['data-sync', 'authentication']
      };
    }
    
    // High severity: Target state or watch aggregator issues
    if (message.includes('targetstate') || message.includes('watchchangeaggregator') ||
        stack.includes('targetstate.ke') || message.includes('unexpected state')) {
      return {
        isFirestoreError: true,
        pattern: 'WATCH_AGGREGATOR_ERROR',
        severity: 'high',
        isKnownIssue: true,
        suggestedRecovery: ['component-remount', 'connection-reset'],
        relatedFeatures: ['real-time-updates', 'data-synchronization']
      };
    }
    
    // Medium severity: SDK version issues  
    if (message.includes('ve":-1') || message.includes('assertion failed')) {
      return {
        isFirestoreError: true,
        pattern: 'SDK_VERSION_ISSUE',
        severity: 'medium',
        isKnownIssue: true,
        suggestedRecovery: ['component-remount', 'retry-with-delay'],
        relatedFeatures: ['firebase-sdk', 'compatibility']
      };
    }
    
    // General Firestore-related terms
    if (message.includes('internal assertion failed') || message.includes('id: ca9')) {
      return {
        isFirestoreError: true,
        pattern: 'GENERAL_ASSERTION_FAILURE',
        severity: 'high',
        isKnownIssue: true,
        suggestedRecovery: ['component-remount', 'page-reload'],
        relatedFeatures: ['firebase-operations']
      };
    }
    
    return {
      isFirestoreError: false,
      pattern: 'UNKNOWN',
      severity: 'low',
      isKnownIssue: false,
      suggestedRecovery: [],
      relatedFeatures: []
    };
  }
  
  // Legacy method for backward compatibility
  private static isFirestoreError(error: Error): boolean {
    return FirestoreErrorBoundary.analyzeFirestoreError(error).isFirestoreError;
  }

  // Enhanced recovery method that considers error context
  private scheduleIntelligentRecovery = (context: FirestoreErrorContext) => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    
    if (this.state.retryCount < maxRetries && this.isMounted) {
      this.setState({ isRecovering: true });
      
      // Adjust retry strategy based on error pattern
      let delay = retryDelay;
      let recoveryMethod = 'standard-retry';
      
      switch (context.errorPattern) {
        case 'CRITICAL_ASSERTION_B815':
          delay = retryDelay * 3; // Longer delay for critical errors
          recoveryMethod = 'listener-cleanup';
          break;
        case 'LISTENER_CONFLICT':
          delay = retryDelay * 2; // Medium delay for listener issues
          recoveryMethod = 'listener-deduplication';
          break;
        case 'WATCH_AGGREGATOR_ERROR':
          delay = retryDelay * 2.5; // Slightly longer for complex errors
          recoveryMethod = 'connection-reset';
          break;
        default:
          delay = retryDelay * Math.pow(1.5, this.state.retryCount); // Exponential backoff
          recoveryMethod = 'standard-retry';
      }
      
      console.log(`[FirestoreErrorBoundary] Scheduling intelligent recovery:`, {
        attempt: this.state.retryCount,
        maxRetries,
        delay,
        method: recoveryMethod,
        pattern: context.errorPattern,
        severity: context.severity
      });
      
      this.retryTimer = setTimeout(() => {
        this.executeRecovery(recoveryMethod);
      }, delay);
    } else {
      console.error(`[FirestoreErrorBoundary] Max retries (${maxRetries}) exceeded for pattern: ${context.errorPattern}`);
      if (this.isMounted) {
        this.setState({ isRecovering: false });
      }
    }
  };
  
  private executeRecovery = (method: string) => {
    console.log(`[FirestoreErrorBoundary] Executing recovery method: ${method}`);
    
    switch (method) {
      case 'listener-cleanup':
        // Trigger cleanup before reset
        this.performListenerCleanup();
        break;
      case 'listener-deduplication':
        // Force component remount with cleanup
        this.performComponentRemount();
        break;
      case 'connection-reset':
        // Reset connection state
        this.performConnectionReset();
        break;
      default:
        // Standard recovery
        this.resetErrorBoundary();
    }
    
    // Notify parent of recovery attempt
    this.props.onRecovery?.(method);
  };
  
  private performListenerCleanup = () => {
    // This would integrate with your listener management system
    console.log('[FirestoreErrorBoundary] Performing listener cleanup before recovery');
    
    // Attempt to trigger cleanup in parent components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('firestore-cleanup-listeners'));
    }
    
    // Reset after cleanup delay
    setTimeout(() => {
      this.resetErrorBoundary();
    }, 500);
  };
  
  private performComponentRemount = () => {
    console.log('[FirestoreErrorBoundary] Performing component remount');
    
    // Force a more complete reset
    if (this.isMounted) {
      this.setState({ 
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
        lastErrorTime: 0,
        errorPattern: undefined,
        isRecovering: false 
      }, () => {
        // Force re-render by updating a key prop would be handled by parent
        this.resetErrorBoundary();
      });
    }
  };
  
  private performConnectionReset = () => {
    console.log('[FirestoreErrorBoundary] Performing connection reset');
    
    // Update connection status
    if (this.isMounted) {
      this.setState({ connectionStatus: 'degraded' });
    }
    
    // Attempt connection health check
    this.checkFirestoreConnection().then((isHealthy) => {
      if (this.isMounted) {
        this.setState({ 
          connectionStatus: isHealthy ? 'online' : 'offline'
        });
      }
      
      if (isHealthy) {
        this.resetErrorBoundary();
      }
    });
  };
  
  private checkFirestoreConnection = async (): Promise<boolean> => {
    try {
      // Simple connection test - this would integrate with your Firebase setup
      if (typeof window !== 'undefined' && (window as any).firebase) {
        // Basic connectivity test
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[FirestoreErrorBoundary] Connection check failed:', error);
      return false;
    }
  };
  
  private initializeNetworkMonitoring = () => {
    if (typeof window !== 'undefined' && this.isMounted) {
      // Monitor network status
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      
      // Set initial status - only call setState if component is mounted
      this.setState({
        connectionStatus: navigator.onLine ? 'online' : 'offline'
      });
    }
  };
  
  private handleOnline = () => {
    console.log('[FirestoreErrorBoundary] Network came online');
    
    // Only update state if component is still mounted
    if (this.isMounted) {
      this.setState({ connectionStatus: 'online' });
      
      // If we had an error, attempt automatic recovery
      if (this.state.hasError && this.props.enableOfflineMode) {
        console.log('[FirestoreErrorBoundary] Attempting automatic recovery on network restore');
        this.handleManualRetry();
      }
    }
  };
  
  private handleOffline = () => {
    console.log('[FirestoreErrorBoundary] Network went offline');
    
    // Only update state if component is still mounted
    if (this.isMounted) {
      this.setState({ connectionStatus: 'offline' });
    }
  };
  
  // Original method kept for backward compatibility  
  private scheduleRetry = () => {
    const { maxRetries = 3, retryDelay = 2000 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      const delay = retryDelay * Math.pow(2, this.state.retryCount - 1);
      
      console.log(`[FirestoreErrorBoundary] Scheduling legacy retry ${this.state.retryCount}/${maxRetries} in ${delay}ms`);
      
      this.retryTimer = setTimeout(() => {
        this.resetErrorBoundary();
      }, delay);
    } else {
      console.error(`[FirestoreErrorBoundary] Max retries (${maxRetries}) exceeded, giving up`);
    }
  };

  private resetErrorBoundary = () => {
    console.log('[FirestoreErrorBoundary] Resetting error boundary');
    
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
    
    if (this.isMounted) {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
        lastErrorTime: 0,
        errorPattern: undefined,
        isRecovering: false
      });
    }
  };

  private handleManualRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      const { fallbackComponent, maxRetries = 3, criticalFeature = false } = this.props;
      
      if (fallbackComponent) {
        return fallbackComponent;
      }

      // Determine UI style based on error severity
      const isKnownIssue = this.state.errorPattern && 
        ['CRITICAL_ASSERTION_B815', 'LISTENER_CONFLICT', 'WATCH_AGGREGATOR_ERROR'].includes(this.state.errorPattern);
      
      const severity = this.state.errorPattern === 'CRITICAL_ASSERTION_B815' ? 'critical' : 
                       criticalFeature ? 'high' : 'medium';
      
      const colorClasses = severity === 'critical' ? 
        'bg-red-100 border-red-300 text-red-800' :
        'bg-yellow-50 border-yellow-200 text-yellow-800';
      
      const iconColor = severity === 'critical' ? 'text-red-500' : 'text-yellow-500';

      return (
        <div className={`${colorClasses} border rounded-lg p-4 m-4 max-w-2xl mx-auto`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {severity === 'critical' ? (
                <svg className={`h-6 w-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className={`h-6 w-6 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-lg font-semibold ${severity === 'critical' ? 'text-red-900' : 'text-yellow-900'}`}>
                {severity === 'critical' 
                  ? 'Critical System Error Detected'
                  : 'Connection Issue Detected'
                }
              </h3>
              
              <div className={`mt-2 text-sm ${severity === 'critical' ? 'text-red-800' : 'text-yellow-800'}`}>
                {isKnownIssue && this.state.errorPattern === 'CRITICAL_ASSERTION_B815' ? (
                  <div>
                    <p className="font-medium">We've detected a known Firebase connectivity issue (ID: b815).</p>
                    <p className="mt-1">Our system is automatically applying specialized recovery procedures...</p>
                  </div>
                ) : isKnownIssue && this.state.errorPattern === 'LISTENER_CONFLICT' ? (
                  <div>
                    <p className="font-medium">Multiple data connections detected.</p>
                    <p className="mt-1">Optimizing connections for better performance...</p>
                  </div>
                ) : (
                  <div>
                    <p>We're experiencing a temporary issue with our data service.</p>
                    <p className="mt-1">
                      {this.state.isRecovering 
                        ? "Applying intelligent recovery procedures..." 
                        : this.state.retryCount < maxRetries 
                          ? "Automatic recovery in progress..."
                          : "Please try again or refresh the page."
                      }
                    </p>
                  </div>
                )}
                
                {/* Connection Status Indicator */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium">Network Status:</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      this.state.connectionStatus === 'online' ? 'bg-green-500' :
                      this.state.connectionStatus === 'offline' ? 'bg-red-500' :
                      this.state.connectionStatus === 'degraded' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-xs capitalize">{this.state.connectionStatus}</span>
                  </div>
                </div>
                
                {/* Recovery Progress */}
                {this.state.isRecovering && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      <span className="text-xs">Recovery attempt {this.state.retryCount}/{maxRetries}</span>
                    </div>
                  </div>
                )}
                
                {/* Technical Details */}
                {this.state.error && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-medium hover:underline">
                      Show Technical Details
                    </summary>
                    <div className="mt-2 p-3 bg-white bg-opacity-50 rounded border text-xs">
                      <div className="space-y-1">
                        <div><strong>Error Pattern:</strong> {this.state.errorPattern || 'Unknown'}</div>
                        <div><strong>Component:</strong> {this.props.identifier || 'Unspecified'}</div>
                        <div><strong>Message:</strong> {this.state.error.message}</div>
                      </div>
                    </div>
                  </details>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={this.handleManualRetry}
                  disabled={this.state.isRecovering}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    severity === 'critical' 
                      ? 'bg-red-200 text-red-900 hover:bg-red-300 disabled:bg-red-100 disabled:text-red-600'
                      : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300 disabled:bg-yellow-100 disabled:text-yellow-600'
                  } disabled:cursor-not-allowed`}
                >
                  {this.state.isRecovering ? 'Recovering...' : 'Try Again'}
                </button>
                
                {this.state.retryCount >= maxRetries && (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-900 hover:bg-gray-300 transition-colors"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
              
              {/* Offline Mode Option */}
              {this.props.enableOfflineMode && this.state.connectionStatus === 'offline' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm text-blue-800">
                    <strong>Offline Mode Available:</strong> Some features may work without an internet connection.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FirestoreErrorBoundary;