/**
 * usePermissions Hook
 * 
 * Hook for checking user permissions and feature access
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
  */

import { useAuthContext } from '../context/AuthContext';
import { Permission, RoleName } from '../types';

// Re-export RoleName for convenience
export type { RoleName };

export interface UsePermissionsReturn {
  permissions: Permission[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: RoleName) => boolean;
  checkFeatureAccess: (feature: string) => boolean;
  canAccess: (resource: string, action?: string) => boolean;
}

/**
 * Hook for checking user permissions and feature access
 * 
 * @returns Permission checking utilities
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { hasRole, hasPermission } = usePermissions();
 *   
 *   if (!hasRole('admin')) {
 *     return <div>Access denied</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       {hasPermission('users.manage') && (
 *         <UserManagementSection />
 *       )}
 *     </div>
 *   );
 * }
 * ```
  */
export const usePermissions = (): UsePermissionsReturn => {
  const { state, actions } = useAuthContext();
  const { permissions, user, profile } = state;
  
  const hasPermission = (permission: string): boolean => {
    return actions.hasPermission(permission);
  };
  
  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };
  
  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };
  
  const hasRole = (role: RoleName): boolean => {
    // Note: UserProfile doesn't currently have a role property
    // This is a placeholder implementation that assumes user role from permissions or premium status
    if (!user) return false;
    
    // Define role hierarchy
    const roleHierarchy: Record<RoleName, number> = {
      'guest': 0,
      'user': 10,
      'premium': 20,
      'moderator': 30,
      'admin': 40,
      'super_admin': 50
    };
    
    // Determine user role from available data
    // This is a simplified implementation - in practice, role should come from user claims or profile
    let userRole: RoleName = 'user';
    // Premium role determination removed - moved to @cvplus/premium module
    if (permissions.some(p => p.name.includes('admin'))) userRole = 'admin';
    
    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[role] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };
  
  const checkFeatureAccess = (feature: string): boolean => {
    // Premium feature access removed - moved to @cvplus/premium module
    return false;
  };
  
  const canAccess = (resource: string, action: string = 'read'): boolean => {
    const permissionKey = `${resource}.${action}`;
    return hasPermission(permissionKey);
  };
  
  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    checkFeatureAccess,
    canAccess
  };
};