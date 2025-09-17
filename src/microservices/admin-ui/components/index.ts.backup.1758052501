/**
 * CVPlus Admin Frontend Components
 * 
 * React components for administrative dashboard interfaces.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================

export { AdminLayout } from './AdminLayout';
export { BusinessMetricsCard } from './BusinessMetricsCard';
export { UserStatsCard } from './UserStatsCard';
export { SystemHealthCard } from './SystemHealthCard';

// Migrated admin components
export { AnalyticsDashboard } from './AnalyticsDashboard';
// Note: PerformanceDashboard temporarily disabled pending integration work
// export { default as PerformanceDashboard } from './performance/PerformanceDashboard';

// ============================================================================
// COMPONENT METADATA
// ============================================================================

/**
 * Available admin components
 */
export const ADMIN_COMPONENTS = {
  layout: {
    name: 'AdminLayout',
    description: 'Main layout component for admin pages',
    category: 'LAYOUT',
    dependencies: ['react', '@cvplus/auth']
  },
  businessMetrics: {
    name: 'BusinessMetricsCard',
    description: 'Business metrics display card',
    category: 'ANALYTICS',
    dependencies: ['react', '@cvplus/analytics']
  },
  userStats: {
    name: 'UserStatsCard',
    description: 'User statistics display card',
    category: 'USER_MANAGEMENT',
    dependencies: ['react', '@cvplus/core']
  },
  systemHealth: {
    name: 'SystemHealthCard',
    description: 'System health monitoring card',
    category: 'MONITORING',
    dependencies: ['react', '@cvplus/core']
  }
} as const;

/**
 * Component categories
 */
export const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout Components',
  ANALYTICS: 'Analytics Components',
  USER_MANAGEMENT: 'User Management Components',
  MONITORING: 'System Monitoring Components',
  MODERATION: 'Content Moderation Components',
  SECURITY: 'Security Components'
} as const;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface AdminComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface CardComponentProps extends AdminComponentProps {
  loading?: boolean;
  error?: string | null;
  refreshData?: () => void;
}

// ============================================================================
// COMPONENT UTILITIES
// ============================================================================

/**
 * Common component utilities and helpers
 */
export const componentUtils = {
  /**
   * Generate data-testid for admin components
   */
  generateTestId: (component: string, element?: string): string => {
    return element ? `admin-${component}-${element}` : `admin-${component}`;
  },

  /**
   * Common loading states
   */
  loadingStates: {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  } as const,

  /**
   * Common error handling
   */
  handleComponentError: (error: Error, componentName: string): void => {
    console.error(`[Admin Component: ${componentName}]`, error);
    // Additional error handling logic can be added here
  }
};