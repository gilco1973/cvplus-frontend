/**
 * CVPlus Admin Frontend Pages
 * 
 * React pages for administrative dashboard interfaces.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

// ============================================================================
// PAGE EXPORTS
// ============================================================================

export { AdminDashboard } from './AdminDashboard';
export { default as RevenueAnalyticsDashboard } from './RevenueAnalyticsDashboard';

// ============================================================================
// PAGE METADATA
// ============================================================================

/**
 * Available admin pages
 */
export const ADMIN_PAGES = {
  dashboard: {
    name: 'AdminDashboard',
    path: '/admin/dashboard',
    description: 'Main administrative dashboard with overview metrics',
    category: 'OVERVIEW',
    permissions: ['canAccessDashboard'],
    dependencies: ['react', '@cvplus/admin', '@cvplus/auth']
  },
  revenueAnalytics: {
    name: 'RevenueAnalyticsDashboard',
    path: '/admin/revenue',
    description: 'Revenue analytics and business metrics dashboard',
    category: 'ANALYTICS',
    permissions: ['canViewAnalytics', 'canViewFinancials'],
    dependencies: ['react', '@cvplus/admin', '@cvplus/analytics']
  }
} as const;

/**
 * Page categories
 */
export const PAGE_CATEGORIES = {
  OVERVIEW: 'Overview Pages',
  ANALYTICS: 'Analytics Pages',
  USER_MANAGEMENT: 'User Management Pages',
  MONITORING: 'System Monitoring Pages',
  MODERATION: 'Content Moderation Pages',
  SECURITY: 'Security Pages',
  SETTINGS: 'Settings Pages'
} as const;

/**
 * Page routing configuration
 */
export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
  userManagement: '/admin/users',
  contentModeration: '/admin/moderation',
  systemMonitoring: '/admin/system',
  businessAnalytics: '/admin/analytics',
  revenueAnalytics: '/admin/revenue',
  securityAudit: '/admin/security',
  supportTickets: '/admin/support',
  settings: '/admin/settings'
} as const;

// ============================================================================
// PAGE PROPS TYPES
// ============================================================================

export interface AdminPageProps {
  className?: string;
  'data-testid'?: string;
}

export interface DashboardPageProps extends AdminPageProps {
  refreshInterval?: number;
  autoRefresh?: boolean;
}

// ============================================================================
// PAGE UTILITIES
// ============================================================================

/**
 * Page utilities and helpers
 */
export const pageUtils = {
  /**
   * Generate page title for admin pages
   */
  generatePageTitle: (pageName: string): string => {
    return `CVPlus Admin - ${pageName}`;
  },

  /**
   * Check if user has permission to access page
   */
  hasPagePermission: (userPermissions: string[], requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  },

  /**
   * Generate breadcrumb for admin pages
   */
  generateBreadcrumb: (currentPage: string): Array<{ label: string; path: string }> => {
    const breadcrumb = [
      { label: 'Admin', path: '/admin' }
    ];

    const pageConfig = Object.values(ADMIN_PAGES).find(
      page => page.name === currentPage
    );

    if (pageConfig) {
      breadcrumb.push({
        label: pageConfig.description,
        path: pageConfig.path
      });
    }

    return breadcrumb;
  }
};