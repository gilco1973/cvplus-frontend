// Core UI Microservice - Shared components and utilities for all microservices
// This microservice provides the foundation for cross-cutting concerns

// Layout and Navigation
export { default as Layout } from './components/Layout';
export { default as Navigation } from './components/Navigation';
export { default as Sidebar } from './components/Sidebar';
export { default as Header } from './components/Header';
export { default as Footer } from './components/Footer';

// Common UI Components
export { default as Button } from './components/Button';
export { default as Input } from './components/Input';
export { default as Card } from './components/Card';
export { default as Modal } from './components/Modal';
export { default as LoadingSpinner } from './components/LoadingSpinner';
export { default as ErrorBoundary } from './components/ErrorBoundary';

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
export { EventBus } from './services/EventBus';
export { NotificationService } from './services/NotificationService';

// Use logging submodule instead of custom implementation
export { createLogger, logger } from '@cvplus/logging';