/**
 * CVPlus Admin Frontend Hooks
 * 
 * React hooks for administrative operations and state management.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

// ============================================================================
// HOOK EXPORTS
// ============================================================================

export { useAdminAuth } from './useAdminAuth';

// ============================================================================
// HOOK METADATA
// ============================================================================

/**
 * Available admin hooks
  */
export const ADMIN_HOOKS = {
  adminAuth: {
    name: 'useAdminAuth',
    description: 'Admin authentication and permission management',
    category: 'AUTHENTICATION',
    dependencies: ['react', '@cvplus/auth'],
    returnType: 'AdminAuthState'
  }
} as const;

/**
 * Hook categories
  */
export const HOOK_CATEGORIES = {
  AUTHENTICATION: 'Authentication Hooks',
  DATA_FETCHING: 'Data Fetching Hooks',
  STATE_MANAGEMENT: 'State Management Hooks',
  REAL_TIME: 'Real-time Data Hooks',
  PERMISSIONS: 'Permission Management Hooks',
  ANALYTICS: 'Analytics Hooks'
} as const;

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface AdminHookOptions {
  enabled?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export interface AdminAuthHookOptions extends AdminHookOptions {
  requirePermissions?: string[];
  redirectOnUnauthorized?: boolean;
}

// ============================================================================
// HOOK UTILITIES
// ============================================================================

/**
 * Hook utilities and helpers
  */
export const hookUtils = {
  /**
   * Default hook options
    */
  defaultOptions: {
    enabled: true,
    refreshInterval: 30000,
    onError: (error: Error) => console.error('Admin hook error:', error),
    onSuccess: (data: any) => console.debug('Admin hook success:', data)
  } as AdminHookOptions,

  /**
   * Create error handler for admin hooks
    */
  createErrorHandler: (hookName: string) => (error: Error) => {
    console.error(`[Admin Hook: ${hookName}]`, error);
    // Additional error handling logic can be added here
  },

  /**
   * Create success handler for admin hooks
    */
  createSuccessHandler: (hookName: string) => (data: any) => {
    console.debug(`[Admin Hook: ${hookName}] Success`, data);
    // Additional success handling logic can be added here
  }
};