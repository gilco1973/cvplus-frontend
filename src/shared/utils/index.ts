/**
 * Shared Utils Index
 *
 * Export all shared utility functions that are used across multiple microservices.
 * These are common helpers for data manipulation, formatting, validation, etc.
 */

// CSS class name utilities (migrated from @cvplus/core)
export * from './classnames';

// Re-export utilities from core-ui via the main index to avoid module resolution issues
// Utilities are available through the main shared index