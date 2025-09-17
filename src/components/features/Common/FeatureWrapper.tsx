import React from 'react';
import { CVFeatureProps } from '../../../types/cv-features';

interface FeatureWrapperProps {
  children: React.ReactNode;
  className?: string;
  mode?: 'public' | 'private' | 'preview';
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  children,
  className = '',
  mode = 'private',
  title,
  description,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const baseClasses = 'cv-feature-wrapper relative rounded-lg border transition-all duration-200';
  
  const modeClasses = {
    public: 'bg-white border-gray-200 shadow-sm hover:shadow-md',
    private: 'bg-gray-50 border-gray-300 shadow-sm hover:shadow-md',
    preview: 'bg-blue-50 border-blue-200 shadow-sm hover:shadow-md border-dashed'
  };

  const combinedClasses = `${baseClasses} ${modeClasses[mode]} ${className}`;

  if (error) {
    return (
      <div className={`${combinedClasses} p-6`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${combinedClasses} p-6`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={combinedClasses}>
      {(title || description) && (
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {mode === 'preview' && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Preview
          </span>
        </div>
      )}
    </div>
  );
};