/**
 * Analysis Components Index
 * Barrel exports for all unified analysis architecture components
 */

// Context and State Management
export { UnifiedAnalysisProvider, useUnifiedAnalysis } from './context/UnifiedAnalysisContext';
export type {
  UnifiedAnalysisContextState,
  UnifiedAnalysisAction,
  UnifiedAnalysisContextInterface,
  AnalysisStep,
  RoleDetectionStatus,
  ErrorState,
  AnalysisResults,
  ImprovementCategory,
  Recommendation
} from './context/types';
export {
  unifiedAnalysisActions,
  unifiedAnalysisReducer,
  initialUnifiedAnalysisState
} from './context/actions';

// Hooks
export { useRoleDetection } from './hooks/useRoleDetection';
export type { UseRoleDetectionReturn } from './context/types';

// Role Detection Components
export { RoleDetectionSection } from './role-detection/RoleDetectionSection';
export { RoleDetectionProgress } from './role-detection/RoleDetectionProgress';
export { DetectedRoleCard } from './role-detection/DetectedRoleCard';
export { RoleSelectionModal } from './role-detection/RoleSelectionModal';

// Unified Components
export { UnifiedAnalysisContainer } from './unified/UnifiedAnalysisContainer';

// Component Props Types
export type {
  RoleDetectionSectionProps,
  RoleDetectionProgressProps,
  DetectedRoleCardProps,
  RoleSelectionModalProps
} from './context/types';