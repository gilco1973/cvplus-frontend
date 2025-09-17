/**
 * RecommendationsError Component
 * 
 * Displays error states for recommendations with retry functionality
 * and user-friendly error messages.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface RecommendationsErrorProps {
  error: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  isRetrying?: boolean;
  showHomeButton?: boolean;
  className?: string;
}

export const RecommendationsError: React.FC<RecommendationsErrorProps> = ({
  error,
  onRetry,
  onGoHome,
  isRetrying = false,
  showHomeButton = false,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-4">
        {/* Error Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-full border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 font-medium">Error Loading Recommendations</span>
        </div>
        
        {/* Error Title */}
        <div className="text-2xl font-bold text-gray-100">Something Went Wrong</div>
        
        {/* Error Message */}
        <p className="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isRetrying
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </button>
          )}
          
          {showHomeButton && onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>
        
        {/* Additional Help Text */}
        <div className="text-sm text-gray-500 mt-6">
          <p>If this problem persists, please try refreshing the page or contact support.</p>
        </div>
      </div>
    </div>
  );
};