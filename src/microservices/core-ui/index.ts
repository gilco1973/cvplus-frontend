// Core UI Microservice - Shared components and utilities for all microservices
// This microservice provides the foundation for cross-cutting concerns

// Layout and Navigation
export { default as GlobalLayout } from './components/layout/GlobalLayout';
export { default as Navigation } from './components/common/Navigation';
export { default as MobileNavigation } from './components/layout/MobileNavigation';
export { default as Footer } from './components/layout/Footer';
export { default as PageContainer } from './components/layout/PageContainer';
export { default as Section } from './components/layout/Section';
export { default as WorkflowLayout } from './components/layout/WorkflowLayout';

// Common UI Components
export { default as Button } from './components/common/Button';
export { default as Input } from './components/common/Input';
export { default as Card } from './components/common/Card';
export { default as ErrorBoundary } from './components/common/ErrorBoundary';
export { default as CVPreviewLayout } from './components/common/CVPreviewLayout';
export { default as CVPreviewSkeleton } from './components/common/CVPreviewSkeleton';
export { default as PremiumStatusBadge } from './components/common/PremiumStatusBadge';
export { default as PremiumUpgradePrompt } from './components/common/PremiumUpgradePrompt';

// Theme and Styling
export { ThemeProvider, useTheme } from './contexts/ThemeContext';
export { I18nProvider, useI18n } from './contexts/I18nContext';

// Common Hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { useDebounce } from './hooks/useDebounce';
export { useAsync } from './hooks/useAsync';
export { useNavigation } from './hooks/useNavigation';

// Utilities
export * as formatters from './utils/formatters';
export * as validators from './utils/validators';
export * as constants from './utils/constants';

// Types
export type * from './types/common';
export type * from './types/theme';
export type * from './types/navigation';

// Services
export { EventBus, EventTypes } from './services/EventBus';
export { NotificationService } from './services/NotificationService';

// Note: Logging functionality available through backend services
// Frontend logging uses console and browser-specific logging mechanisms