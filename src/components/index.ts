// CVPlus Frontend Components - Unified Exports
// All React components from the consolidated frontend module

// Core Application Components
export { default as App } from '../App';

// Layout Components
export { default as GlobalLayout } from './layout/GlobalLayout';
export { default as PageContainer } from './layout/PageContainer';
export { default as Section } from './layout/Section';
export { default as Footer } from './layout/Footer';
export { default as WorkflowLayout } from './layout/WorkflowLayout';
export { default as MobileNavigation } from './layout/MobileNavigation';

// Navigation Components
export { default as NavigationBreadcrumbs } from './NavigationBreadcrumbs';
export { default as MobileBottomNav } from './MobileBottomNav';
export { default as MobilePageWrapper } from './MobilePageWrapper';
export { default as UserMenu } from './UserMenu';

// CV Display & Generation Components
export { default as GeneratedCVDisplay } from './GeneratedCVDisplay';
export { default as GeneratedCVDisplayLazy } from './GeneratedCVDisplayLazy';
export { default as CVPreview } from './CVPreview';
export { default as CVAnalysisResults } from './CVAnalysisResults';

// Upload & Processing Components
export { default as ProfilePictureUpload } from './ProfilePictureUpload';
export { default as JobDescriptionParser } from './JobDescriptionParser';

// Feature Components
export { default as KeywordManager } from './KeywordManager';
export { default as SignInDialog } from './SignInDialog';
export { default as SessionAwarePage } from './SessionAwarePage';

// Analysis Components
export * from './analysis';

// Enhancement Components
export * from './enhancement';

// Progress Components
export * from './progress';

// Final Results Components
export * from './final-results';

// Admin Integration Components
export * from './admin-integration';

// Feature-specific Components (organized by domain)
export * from './features';

// UI Components
export * from './ui';

// Form Components
export * from './forms';

// Charts & Visualization Components
export * from './charts';

// Layout & Structure Components
export * from './layout';

// All other component exports will be added as we consolidate from packages