import React, { Component, ReactNode } from 'react';
import { Zap, AlertCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  children: ReactNode;
  onFallbackToSync?: () => void;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  shouldFallbackToSync: boolean;
}

// Error boundary specific to async CV generation
class AsyncGenerationErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      shouldFallbackToSync: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Determine if we should fallback to sync mode
    const shouldFallbackToSync = error.message.includes('async') || 
                                error.message.includes('timeout') ||
                                error.message.includes('initiate');
    
    return {
      hasError: true,
      error,
      shouldFallbackToSync
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AsyncGenerationErrorBoundary] Async generation error:', error);
    console.error('[AsyncGenerationErrorBoundary] Error info:', errorInfo);

    // Show user-friendly toast notification
    if (this.state.shouldFallbackToSync) {
      toast.error('Fast Track mode unavailable. Switching to standard mode...');
      
      // Automatically fallback to sync mode
      setTimeout(() => {
        if (this.props.onFallbackToSync) {
          this.props.onFallbackToSync();
        }
      }, 2000);
    } else {
      toast.error('CV generation error. Please try again.');
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      shouldFallbackToSync: false
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleFallbackToSync = () => {
    this.setState({
      hasError: false,
      error: null,
      shouldFallbackToSync: false
    });
    
    if (this.props.onFallbackToSync) {
      this.props.onFallbackToSync();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <AsyncErrorFallbackUI 
          error={this.state.error}
          shouldFallbackToSync={this.state.shouldFallbackToSync}
          onRetry={this.handleRetry}
          onFallbackToSync={this.handleFallbackToSync}
        />
      );
    }

    return this.props.children;
  }
}

// Async generation error fallback UI
const AsyncErrorFallbackUI: React.FC<{
  error: Error | null;
  shouldFallbackToSync: boolean;
  onRetry: () => void;
  onFallbackToSync: () => void;
}> = ({ error, shouldFallbackToSync, onRetry, onFallbackToSync }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-red-500/30 p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        {shouldFallbackToSync ? (
          <Zap className="w-6 h-6 text-yellow-400" />
        ) : (
          <AlertCircle className="w-6 h-6 text-red-400" />
        )}
        <h3 className="text-lg font-semibold text-gray-100">
          {shouldFallbackToSync ? 'Fast Track Mode Unavailable' : 'Generation Error'}
        </h3>
      </div>
      
      <p className="text-gray-300 mb-4">
        {shouldFallbackToSync 
          ? 'There was an issue with Fast Track mode. We can switch to standard mode to complete your CV generation.'
          : 'We encountered an error during CV generation. You can try again or switch to standard mode.'
        }
      </p>
      
      {error && (
        <div className="bg-gray-700/50 rounded-md p-3 mb-4">
          <p className="text-xs text-gray-400 font-mono">{error.message}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {shouldFallbackToSync ? (
          <>
            <button
              onClick={onFallbackToSync}
              className="flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              Switch to Standard Mode
            </button>
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Fast Track
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={onFallbackToSync}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              Use Standard Mode
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const AsyncGenerationErrorBoundary: React.FC<Props> = (props) => {
  return <AsyncGenerationErrorBoundaryClass {...props} />;
};