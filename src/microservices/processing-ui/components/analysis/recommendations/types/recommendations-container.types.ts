/**
 * RecommendationsContainer Type Definitions
 * 
 * Shared types for the modular recommendations container components.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category?: string;
  impact?: 'low' | 'medium' | 'high';
  priority?: number;
  isSelected: boolean;
}

export interface SelectedRole {
  roleName: string;
  matchingFactors?: string[];
}

export interface RecommendationsContainerState {
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  selectedRole?: SelectedRole | null;
}

export interface RecommendationSelectionState {
  selectedCount: number;
  hasSelections: boolean;
  selectedIds: string[];
  allSelected: boolean;
  noneSelected: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface ErrorState {
  error: string | null;
  isRetryable?: boolean;
  retryCount?: number;
}

// Component prop interfaces
export interface ComponentBaseProps {
  className?: string;
}