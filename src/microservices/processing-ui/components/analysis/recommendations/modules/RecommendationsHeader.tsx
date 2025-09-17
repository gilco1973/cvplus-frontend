/**
 * RecommendationsHeader Component
 * 
 * Displays the header section for recommendations with status indicator,
 * title, and role-based messaging.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface RecommendationsHeaderProps {
  selectedRole?: {
    roleName: string;
    matchingFactors?: string[];
  } | null;
  totalRecommendations: number;
  className?: string;
}

export const RecommendationsHeader: React.FC<RecommendationsHeaderProps> = ({
  selectedRole,
  totalRecommendations,
  className = ''
}) => {
  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Status Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
        <CheckCircle className="w-4 h-4 text-purple-400" />
        <span className="text-purple-300 font-medium">
          {selectedRole ? 'Role-Based Recommendations' : 'Personalized Recommendations'}
        </span>
      </div>
      
      {/* Main Title */}
      <div className="text-2xl font-bold text-gray-100">
        {selectedRole ? 
          `Recommendations for ${selectedRole.roleName}` :
          'CV Improvement Recommendations'
        }
      </div>
      
      {/* Description */}
      <p className="text-gray-400">
        {selectedRole ? 
          `Tailored suggestions to optimize your CV for ${selectedRole.roleName} positions` :
          'Select the improvements that best match your career goals'
        }
      </p>
      
      {/* Recommendations Count */}
      {totalRecommendations > 0 && (
        <div className="text-sm text-gray-500">
          {totalRecommendations} recommendation{totalRecommendations !== 1 ? 's' : ''} available
        </div>
      )}
      
      {/* Role Context Info */}
      {selectedRole && selectedRole.matchingFactors && selectedRole.matchingFactors.length > 0 && (
        <div className="mt-2 text-xs text-gray-600">
          Based on {selectedRole.matchingFactors.length} matching factor{selectedRole.matchingFactors.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};