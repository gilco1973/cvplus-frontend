// @ts-ignore
/**
 * Custom React hooks for CV processing
 * 
 * This module exports all custom hooks related to CV processing:
 * - CV upload hooks
 * - CV processing hooks
 * - CV analysis hooks
 * - CV generation hooks
  */

// Export created hooks
export * from './useCVUpload';
export * from './useCVUploadLogic';
export * from './useCVProcessing';
export * from './useAchievementAnalysis';
export * from './useCVComparison';

// T067 CV Processor hooks
export * from './useCVProcessorLogic';
export * from './useWebSocketUpdates';

// Generated CV Display hooks (T065)
export * from './useCVGeneration';
export * from './useTemplates';

// Alias for backward compatibility
export { useAchievementAnalysis as useCVAnalysis } from './useAchievementAnalysis';

// Placeholder exports to prevent build errors
export const CV_PROCESSING_HOOKS_VERSION = '1.0.0';