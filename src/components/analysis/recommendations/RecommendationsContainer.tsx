/**
 * RecommendationsContainer - Refactored Modular Version
 * 
 * Main container component that orchestrates recommendation loading,
 * display, and selection using modular sub-components.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized for 200-line compliance
 */

import React from 'react';
import type { Job } from '../../../services/cvService';
import { useRecommendationsContainer } from './hooks/useRecommendationsContainer';
import { useRecommendationSelection } from './hooks/useRecommendationSelection';
import { RecommendationsHeader } from './modules/RecommendationsHeader';
import { RecommendationsLoader } from './modules/RecommendationsLoader';
import { RecommendationsError } from './modules/RecommendationsError';
import { RecommendationsList } from './modules/RecommendationsList';
import { RecommendationsActions } from './modules/RecommendationsActions';

interface RecommendationsContainerProps {
  jobData: Job;
  onContinue: (selectedRecommendations: string[]) => void;
  onBack: () => void;
  className?: string;
}

export const RecommendationsContainer: React.FC<RecommendationsContainerProps> = ({
  jobData,
  onContinue,
  onBack,
  className = ''
}) => {
  // Custom hooks for data loading and selection management
  const containerHook = useRecommendationsContainer({
    jobData,
    autoLoad: true,
    enableDebug: process.env.NODE_ENV === 'development'
  });
  
  const selectionHook = useRecommendationSelection(containerHook.recommendations);

  // Handle continue action with validation
  const handleContinue = () => {
    if (!selectionHook.validateSelections()) {
      return;
    }
    
    const selectedIds = selectionHook.getSelectedIds();
    console.log('[RecommendationsContainer] Continuing with selected recommendations:', selectedIds);
    onContinue(selectedIds);
  };

  // Loading state
  if (containerHook.isLoading) {
    return (
      <RecommendationsLoader
        selectedRole={containerHook.selectedRole}
        className={className}
      />
    );
  }

  // Error state
  if (containerHook.error) {
    return (
      <RecommendationsError
        error={containerHook.error}
        onRetry={containerHook.retryLoad}
        className={className}
      />
    );
  }

  // Main content
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <RecommendationsHeader
        selectedRole={containerHook.selectedRole}
        totalRecommendations={containerHook.recommendations.length}
      />

      {/* Recommendations List */}
      <RecommendationsList
        recommendations={containerHook.recommendations}
        onToggleRecommendation={selectionHook.toggleRecommendation}
        selectedCount={selectionHook.selectedCount}
        allSelected={selectionHook.allSelected}
        onSelectAll={selectionHook.selectAll}
        onClearAll={selectionHook.clearAll}
      />

      {/* Action Controls */}
      <RecommendationsActions
        selectedCount={selectionHook.selectedCount}
        totalCount={containerHook.recommendations.length}
        onBack={onBack}
        onContinue={handleContinue}
      />
    </div>
  );
};