/**
 * CVPlus Admin Frontend Module
 * 
 * Frontend components, pages, and hooks for administrative interfaces.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

// ============================================================================
// COMPONENTS EXPORTS
// ============================================================================
export * from './components';

// ============================================================================
// PAGES EXPORTS
// ============================================================================
export * from './pages';

// ============================================================================
// HOOKS EXPORTS
// ============================================================================
export * from './hooks';

// ============================================================================
// FRONTEND MODULE INFORMATION
// ============================================================================
export const ADMIN_FRONTEND_MODULE = {
  name: '@cvplus/admin/frontend',
  version: '1.0.0',
  description: 'Frontend React components and pages for CVPlus admin operations',
  author: 'Gil Klainert'
} as const;

/**
 * Frontend module capabilities
  */
export const FRONTEND_CAPABILITIES = {
  dashboardComponents: 'Comprehensive admin dashboard components',
  userManagementUI: 'User management interface components',
  systemMonitoringUI: 'System monitoring visualization components',
  businessAnalyticsUI: 'Business analytics dashboard components',
  contentModerationUI: 'Content moderation interface components',
  securityAuditUI: 'Security audit and compliance components',
  realtimeUpdates: 'Real-time data update components',
  responsiveDesign: 'Mobile-responsive admin interfaces'
} as const;

/**
 * Frontend dependencies
  */
export const FRONTEND_DEPENDENCIES = {
  core: {
    react: '^18.0.0',
    'react-dom': '^18.0.0'
  },
  packages: {
    '@cvplus/core': '^1.0.0',
    '@cvplus/auth': '^1.0.0',
    '@cvplus/analytics': '^1.0.0'
  },
  ui: {
    'tailwindcss': '^3.0.0'
  }
} as const;