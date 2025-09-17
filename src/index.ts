// CVPlus Frontend Unified Module - Main Exports
// Single source of truth for all frontend web application code

// Microservices Architecture Exports
export * from './microservices/auth-ui';
export * from './microservices/processing-ui';
export * from './microservices/multimedia-ui';
export * from './microservices/analytics-ui';
export * from './microservices/premium-ui';
export * from './microservices/public-profiles-ui';
export * from './microservices/admin-ui';
export * from './microservices/workflow-ui';
export * from './microservices/payments-ui';
export * from './microservices/shell-ui';
export * from './microservices/core-ui';
export * from './microservices/enhancements-ui';
export * from './microservices/logging-ui';
export * from './microservices/i18n-ui';
export * from './microservices/recommendations-ui';

// Microservice-specific namespaced exports
export * as AuthUI from './microservices/auth-ui';
export * as ProcessingUI from './microservices/processing-ui';
export * as MultimediaUI from './microservices/multimedia-ui';
export * as AnalyticsUI from './microservices/analytics-ui';
export * as PremiumUI from './microservices/premium-ui';
export * as PublicProfilesUI from './microservices/public-profiles-ui';
export * as AdminUI from './microservices/admin-ui';
export * as WorkflowUI from './microservices/workflow-ui';
export * as PaymentsUI from './microservices/payments-ui';
export * as ShellUI from './microservices/shell-ui';
export * as CoreUI from './microservices/core-ui';
export * as EnhancementsUI from './microservices/enhancements-ui';
export * as LoggingUI from './microservices/logging-ui';
export * as I18nUI from './microservices/i18n-ui';
export * as RecommendationsUI from './microservices/recommendations-ui';

// Shared Libraries Exports
export * from './shared';

// Legacy exports (will be deprecated after migration)
export { default as App } from './App';
export * from './components';
export * from './hooks';
export * from './contexts';
export * from './providers';
export * from './types';
export * from './utils';
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