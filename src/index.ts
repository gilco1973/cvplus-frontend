// CVPlus Frontend Unified Module - Main Exports
// Single source of truth for all frontend web application code

// Core Application
export { default as App } from './App';

// Components
export * from './components';

// Hooks
export * from './hooks';

// Contexts & Providers
export * from './contexts';
export * from './providers';

// Types
export * from './types';

// Utilities
export * from './utils';

// Services (frontend-specific)
export * from './services';

// Re-export key Firebase and app utilities
export { initializeApp } from './config/firebase';
export { auth, db, storage, functions } from './config/firebase';

// Re-export commonly used types for external packages
export type {
  CV,
  Job,
  User,
  CVFeature,
  CVTemplate,
  CVGenerationRequest,
  CVAnalysisResult,
  RecommendationResult
} from './types';

// Version info
export const VERSION = '1.0.0';
export const MODULE_NAME = '@cvplus/frontend';