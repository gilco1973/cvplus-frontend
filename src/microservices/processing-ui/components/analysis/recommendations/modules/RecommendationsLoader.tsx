/**
 * RecommendationsLoader Component
 * 
 * Displays loading state for recommendations with animated spinner
 * and role-aware progress messaging.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface RecommendationsLoaderProps {
  selectedRole?: {
    roleName: string;
  } | null;
  loadingMessage?: string;
  className?: string;
}

export const RecommendationsLoader: React.FC<RecommendationsLoaderProps> = ({
  selectedRole,
  loadingMessage,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-4">
        {/* Loading Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          <span className="text-blue-300 font-medium">
            {loadingMessage || 'Loading Recommendations...'}
          </span>
        </div>
        
        {/* Main Loading Title */}
        <div className="text-2xl font-bold text-gray-100">
          {selectedRole ? 
            `Analyzing ${selectedRole.roleName} Requirements` : 
            'Analyzing Your CV'
          }
        </div>
        
        {/* Loading Description */}
        <p className="text-gray-400">
          {selectedRole ? 
            'Generating role-specific recommendations tailored to your career goals' :
            'Creating personalized recommendations to enhance your CV'
          }
        </p>
        
        {/* Additional Loading Context */}
        <div className="text-sm text-gray-500 space-y-1">
          <div>Please wait while we process your information...</div>
          {selectedRole && (
            <div>Tailoring recommendations for {selectedRole.roleName} positions</div>
          )}
        </div>
      </div>
    </div>
  );
};