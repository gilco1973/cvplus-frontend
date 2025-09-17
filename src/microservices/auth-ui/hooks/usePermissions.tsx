/**
 * usePermissions Hook
 * 
 * Hook for managing user permissions and role-based access control.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import { useAuthContext } from '../context/AuthContext';
import type { RoleName, Permission } from '../types';

export interface UsePermissionsReturn {
  // State
  permissions: Permission[];
  role: RoleName;
  isLoading: boolean;

  // Permission checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: RoleName) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isPremium: boolean;

  // Permission actions
  requestPermission: (permission: string, reason?: string) => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
}

/**
 * Permissions management hook
 */
export function usePermissions(): UsePermissionsReturn {
  const { state, actions } = useAuthContext();

  const role = 'user' as RoleName; // TODO: Get role from user profile or auth state

  // Permission checking methods
  const hasPermission = (permission: string): boolean => {
    return actions.hasPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (targetRole: RoleName): boolean => {
    const roleHierarchy: Record<RoleName, number> = {
      'guest': 0,
      'user': 1,
      'premium': 2,
      'moderator': 3,
      'admin': 4,
      'super_admin': 5
    };

    return roleHierarchy[role] >= roleHierarchy[targetRole];
  };

  const isAdmin = hasRole('admin');
  const isModerator = hasRole('moderator');
  const isPremium = hasRole('premium') || Boolean(state.premiumFeatures?.webPortal?.enabled) || false;

  const requestPermission = async (permission: string, reason?: string): Promise<void> => {
    // This would typically make an API call to request permission
    // For now, this is a placeholder implementation
    console.log(`Permission requested: ${permission}`, reason ? `Reason: ${reason}` : '');
    
    // In a real implementation, this might:
    // 1. Create a permission request record
    // 2. Notify administrators
    // 3. Track the request status
    throw new Error('Permission request system not implemented');
  };

  const checkFeatureAccess = (feature: string): boolean => {
    // Check if user has premium features that grant access
    if (actions.hasPremiumFeature(feature)) {
      return true;
    }

    // Check if user has direct permission
    if (hasPermission(`feature.${feature}`)) {
      return true;
    }

    // Check role-based access
    const featureRoleRequirements: Record<string, RoleName> = {
      'cv-generation': 'user',
      'premium-templates': 'premium',
      'advanced-analytics': 'premium',
      'bulk-operations': 'premium',
      'api-access': 'premium',
      'admin-panel': 'admin',
      'user-management': 'admin',
      'system-settings': 'super_admin'
    };

    const requiredRole = featureRoleRequirements[feature];
    if (requiredRole) {
      return hasRole(requiredRole);
    }

    // Default to user access for unknown features
    return hasRole('user');
  };

  return {
    // State
    permissions: state.permissions,
    role,
    isLoading: state.isLoading,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isModerator,
    isPremium,

    // Permission actions
    requestPermission,
    checkFeatureAccess
  };
}