/**
 * Feature Wrapper Component
 * Wrapper for feature components with loading, error states
 */

import React, { ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface FeatureWrapperProps {
  className?: string;
  mode?: 'private' | 'public';
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  children: ReactNode;
}

export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  className = '',
  mode = 'private',
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  children
}) => {
  const wrapperClasses = `feature-wrapper ${mode} ${className}`;

  if (isLoading) {
    return (
      <div className={wrapperClasses}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return (
      <div className={wrapperClasses}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600 mb-4">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};