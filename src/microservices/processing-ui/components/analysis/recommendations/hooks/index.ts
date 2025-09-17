/**
 * Recommendations Hooks Index
 * 
 * Exports all custom hooks for recommendations functionality.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

export { useRecommendationsContainer } from './useRecommendationsContainer';
export { useRecommendationSelection } from './useRecommendationSelection';
export type {
  UseRecommendationsContainerOptions,
  RecommendationsContainerState,
  RecommendationsContainerActions
} from './useRecommendationsContainer';
export type {
  RecommendationSelectionState,
  RecommendationSelectionActions
} from './useRecommendationSelection';