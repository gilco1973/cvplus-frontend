/**
 * useRecommendationSelection Hook
 * 
 * Extracts recommendation selection logic from RecommendationsContainer.
 * Provides selection state management with validation and bulk operations.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useState, useCallback, useMemo } from 'react';
import { useUnifiedAnalysis } from '../../context/UnifiedAnalysisContext';
import toast from 'react-hot-toast';

export interface RecommendationSelectionState {
  selectedCount: number;
  hasSelections: boolean;
  selectedIds: string[];
  allSelected: boolean;
  noneSelected: boolean;
}

export interface RecommendationSelectionActions {
  toggleRecommendation: (id: string) => void;
  selectAll: () => void;
  clearAll: () => void;
  getSelectedIds: () => string[];
  validateSelections: () => boolean;
}

/**
 * Hook for managing recommendation selection state
 */
export function useRecommendationSelection(recommendations: any[]) {
  const { dispatch } = useUnifiedAnalysis();
  
  // Toggle individual recommendation selection
  const toggleRecommendation = useCallback((id: string) => {
    // Update context state
    dispatch({ type: 'TOGGLE_RECOMMENDATION', payload: id });
  }, [dispatch]);

  // Select all recommendations
  const selectAll = useCallback(() => {
    if (recommendations.length === 0) {
      toast.warning('No recommendations available to select');
      return;
    }
    
    recommendations.forEach(rec => {
      if (!rec.isSelected) {
        dispatch({ type: 'TOGGLE_RECOMMENDATION', payload: rec.id });
      }
    });
    
    toast.success(`Selected all ${recommendations.length} recommendations`);
  }, [recommendations, dispatch]);

  // Clear all selections
  const clearAll = useCallback(() => {
    const selectedRecs = recommendations.filter(rec => rec.isSelected);
    
    if (selectedRecs.length === 0) {
      toast.warning('No recommendations selected to clear');
      return;
    }
    
    selectedRecs.forEach(rec => {
      dispatch({ type: 'TOGGLE_RECOMMENDATION', payload: rec.id });
    });
    
    toast.info('Cleared all selections');
  }, [recommendations, dispatch]);

  // Get selected recommendation IDs
  const getSelectedIds = useCallback(() => {
    return recommendations
      .filter(rec => rec.isSelected)
      .map(rec => rec.id);
  }, [recommendations]);

  // Validate selections for continuation
  const validateSelections = useCallback(() => {
    const selectedIds = getSelectedIds();
    
    if (selectedIds.length === 0) {
      toast.error('Please select at least one recommendation to continue');
      return false;
    }
    
    return true;
  }, [getSelectedIds]);

  // Computed state
  const state: RecommendationSelectionState = useMemo(() => {
    const selectedRecs = recommendations.filter(rec => rec.isSelected);
    const selectedCount = selectedRecs.length;
    
    return {
      selectedCount,
      hasSelections: selectedCount > 0,
      selectedIds: selectedRecs.map(rec => rec.id),
      allSelected: selectedCount === recommendations.length && recommendations.length > 0,
      noneSelected: selectedCount === 0
    };
  }, [recommendations]);

  // Actions object
  const actions: RecommendationSelectionActions = {
    toggleRecommendation,
    selectAll,
    clearAll,
    getSelectedIds,
    validateSelections
  };

  return {
    ...state,
    ...actions
  };
}