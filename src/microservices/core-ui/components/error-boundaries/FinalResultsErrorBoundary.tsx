import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Error boundary for FinalResultsPage
class FinalResultsErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[FinalResultsErrorBoundary] Error caught:', error);
    console.error('[FinalResultsErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    // TODO: Integrate with error monitoring service (e.g., Sentry)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallbackUI 
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback UI component
const ErrorFallbackUI: React.FC<{
  error: Error | null;
  onRetry: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-300 mb-6">
            We encountered an error while loading your CV results. This might be a temporary issue.
          </p>
          
          {error && (
            <div className="bg-gray-700 rounded-md p-4 mb-6 text-left">
              <p className="text-sm text-gray-300 font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// HOC wrapper to provide navigation
export const FinalResultsErrorBoundary: React.FC<Props> = (props) => {
  return <FinalResultsErrorBoundaryClass {...props} />;
};