/**
 * Core Module Integration
 * 
 * Exports types, constants, and utilities from @cvplus/core
 * with fallback to local definitions for backward compatibility.
 */

import { MODULE_FLAGS } from './index';

// Dynamic imports to avoid build-time errors
export const loadCoreModule = async () => {
  if (MODULE_FLAGS.USE_CORE_TYPES) {
    try {
      // TODO: Uncomment when @cvplus/core package is ready
      // const coreModule = await import('@cvplus/core');
      console.info('[@cvplus/core] Package not available yet - using legacy types');
      return null;
    } catch (error) {
      console.warn('[@cvplus/core] Module not available, falling back to legacy types:', error);
      return null;
    }
  }
  return null;
};

// Helper functions for module access
export const getCoreConstant = async (constantName: string) => {
  const coreModule = await loadCoreModule();
  return coreModule?.[constantName];
};

export const getCoreUtility = async (utilityName: string) => {
  const coreModule = await loadCoreModule();
  return coreModule?.[utilityName];
};

// Type-only exports (these don't cause runtime errors)
export type CoreJobData = any; // Will be replaced with actual type when module is ready
export type CoreCVTemplate = any;
export type CoreProcessingStatus = any;
