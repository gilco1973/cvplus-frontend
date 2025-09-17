/**
 * Shared Libraries Index
 *
 * This module exports all shared components, hooks, utilities, and types
 * that are used across multiple microservices in the CVPlus frontend.
 */

// Cross-cutting UI components
export * from './components';

// Shared React hooks
export * from './hooks';

// Utility functions and helpers
export * from './utils';

// Shared TypeScript types and interfaces
export * from './types';

// Common services
export * from './services';

// React contexts for global state
export * from './contexts';

// React providers
export * from './providers';

// Re-export core-ui for shared access (EventBus, common types, etc.)
export { EventBus, EventTypes } from '../microservices/core-ui';
export type { MicroserviceEvent } from '../microservices/core-ui';