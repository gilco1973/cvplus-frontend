/**
 * CVPlus Frontend Module Integration Layer
 * 
 * This file provides a gradual migration path from the monolithic frontend
 * to the modular architecture, maintaining backward compatibility while
 * enabling new features to use the modular packages.
 */

// Core module integration
export * from './core';

// Auth module integration (gradual migration)
export * from './auth';

// Recommendations module integration
export * from './recommendations';

// Premium module integration
export * from './premium';

// Feature flags for gradual rollout
export const MODULE_FLAGS = {
  USE_CORE_TYPES: false, // Disabled until packages are built
  USE_AUTH_MODULE: true, // ENABLED: Auth module migration in progress
  USE_RECOMMENDATIONS_MODULE: false, // Disabled until package is built
  USE_PREMIUM_MODULE: true, // Enable premium module integration
  FALLBACK_TO_LEGACY: true // Keep fallback enabled during migration
} as const;

export type ModuleFlags = typeof MODULE_FLAGS;
