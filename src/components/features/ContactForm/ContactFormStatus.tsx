import React from 'react';
import { CheckCircle, XCircle, Loader2, Send, RotateCcw } from 'lucide-react';

interface ContactFormStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string | null;
  onRetry?: () => void;
  onReset?: () => void;
  retryCount?: number;
  maxRetries?: number;
  buttonText?: string;
}

export const ContactFormStatus: React.FC<ContactFormStatusProps> = ({
  status,
  error,
  onRetry,
  onReset,
  retryCount = 0,
  maxRetries = 3,
  buttonText = 'Send Message'
}) => {
  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Message Sent!
          </>
        );
      case 'error':
        if (retryCount < maxRetries) {
          return (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </>
          );
        }
        return (
          <>
            <XCircle className="w-4 h-4 mr-2" />
            Failed
          </>
        );
      default:
        return (
          <>
            <Send className="w-4 h-4 mr-2" />
            {buttonText}
          </>
        );
    }
  };

  const getButtonClass = () => {
    const baseClass = 'w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (status) {
      case 'loading':
        return `${baseClass} bg-blue-600 text-white cursor-not-allowed opacity-75`;
      case 'success':
        return `${baseClass} bg-green-600 text-white cursor-default`;
      case 'error':
        if (retryCount < maxRetries) {
          return `${baseClass} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
        }
        return `${baseClass} bg-red-600 text-white cursor-not-allowed opacity-75`;
      default:
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    }
  };

  const handleClick = () => {
    if (status === 'error' && retryCount < maxRetries && onRetry) {
      onRetry();
    } else if (status === 'success' && onReset) {
      onReset();
    }
  };

  const isDisabled = status === 'loading' || (status === 'error' && retryCount >= maxRetries);
  const isClickable = (status === 'error' && retryCount < maxRetries) || status === 'success';

  return (
    <div className="space-y-3">
      <button
        type={isClickable ? 'button' : 'submit'}
        onClick={isClickable ? handleClick : undefined}
        disabled={isDisabled}
        className={getButtonClass()}
        aria-label={status === 'error' && retryCount < maxRetries ? 'Retry sending message' : buttonText}
      >
        {getButtonContent()}
      </button>

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800 font-medium">Message Failed to Send</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              {retryCount < maxRetries && (
                <p className="text-xs text-red-600 mt-2">
                  Attempt {retryCount + 1} of {maxRetries + 1}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-green-800 font-medium">Message Sent Successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Thank you for your message. I'll get back to you soon.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Message */}
      {status === 'loading' && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
            <p className="text-sm text-blue-800">Sending your message...</p>
          </div>
        </div>
      )}
    </div>
  );
};
