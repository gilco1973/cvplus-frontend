/**
 * Loading State Component
 * Shows loading animation and message for analysis operations
 */

import React from 'react';
import { Loader2, FileText } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

/**
 * Loading state component for analysis operations
 * Shows animated spinner with contextual message
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`loading-state ${className}`}>
      <div className="min-h-[400px] bg-white rounded-lg border shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="relative inline-flex">
              <FileText className="w-12 h-12 text-gray-400" />
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin absolute -top-1 -right-1" />
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {message}
          </h3>
          
          <p className="text-sm text-gray-600 max-w-sm mx-auto">
            Please wait while we analyze your CV and prepare personalized recommendations.
          </p>
          
          <div className="mt-4">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};