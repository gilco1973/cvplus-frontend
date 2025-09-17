import { XCircle, RefreshCw, Loader2 } from 'lucide-react';

interface ErrorStateProps {
  isVisible: boolean;
  isRetrying: boolean;
  onCancel: () => void;
  onRetry: () => void;
}

export const ErrorState = ({ isVisible, isRetrying, onCancel, onRetry }: ErrorStateProps) => {
  if (!isVisible) return null;

  return (
    <div className="p-8 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-neutral-100 mb-2">
        Unable to Load Payment Form
      </h3>
      <p className="text-neutral-300 mb-6">
        There was an issue loading the secure checkout. Please try again.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-neutral-600 text-neutral-300 rounded-lg font-semibold hover:bg-neutral-700 transition-all duration-200"
        >
          Go Back
        </button>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-500 hover:to-blue-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </>
          )}
        </button>
      </div>
    </div>
  );
};