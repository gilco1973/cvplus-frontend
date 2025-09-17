/**
 * PermissionGate Component
 * 
 * Conditionally renders content based on user permissions.
 * More flexible than AuthGuard for inline permission checks.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
// usePremium removed - premium checks moved to @cvplus/premium module
import type { RoleName } from '../types';

export interface PermissionGateProps {
  /** Content to render when user has required permissions */
  children: ReactNode;
  
  /** Content to render when user lacks permissions (optional) */
  fallback?: ReactNode;
  
  /** Required permissions (user must have ALL) */
  permissions?: string[];
  
  /** Any permissions (user must have ANY) */
  anyPermissions?: string[];
  
  /** Required role */
  role?: RoleName;
  
  /** Required premium features */
  features?: string[];
  
  /** Custom condition function */
  condition?: () => boolean;
  
  /** Whether to render nothing when unauthorized (vs showing fallback) */
  hideWhenUnauthorized?: boolean;
  
  /** Whether to invert the logic (render when NOT authorized) */
  inverse?: boolean;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  permissions = [],
  anyPermissions = [],
  role,
  features = [],
  condition,
  hideWhenUnauthorized = false,
  inverse = false
}) => {
  const { 
    hasAnyPermission, 
    hasAllPermissions, 
    hasRole 
  } = usePermissions();
  
  // Premium feature checking removed - handled by @cvplus/premium module
  
  // Helper function to check if user has all required features
  const hasAllFeatures = (features: string[]): boolean => {
    // Feature checking delegated to @cvplus/premium module
    return false; // Default to false - external modules should handle feature checks
  };

  // Check all conditions
  const checkConditions = (): boolean => {
    // Check required permissions (ALL must be satisfied)
    if (permissions.length > 0 && !hasAllPermissions(permissions)) {
      return false;
    }

    // Check any permissions (ANY must be satisfied)
    if (anyPermissions.length > 0 && !hasAnyPermission(anyPermissions)) {
      return false;
    }

    // Check required role
    if (role && !hasRole(role)) {
      return false;
    }

    // Check required features
    if (features.length > 0 && !hasAllFeatures(features)) {
      return false;
    }

    // Check custom condition
    if (condition && !condition()) {
      return false;
    }

    return true;
  };

  const isAuthorized = checkConditions();
  const shouldRender = inverse ? !isAuthorized : isAuthorized;

  if (shouldRender) {
    return <>{children}</>;
  }

  if (hideWhenUnauthorized) {
    return null;
  }

  return <>{fallback}</>;
};

// Convenience components for common use cases
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGate role="admin" fallback={fallback}>
    {children}
  </PermissionGate>
);

export const ModeratorOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => (
  <PermissionGate role="moderator" fallback={fallback}>
    {children}
  </PermissionGate>
);

// PremiumOnly component removed - moved to @cvplus/premium module

export const FeatureGate: React.FC<{ 
  feature: string; 
  children: ReactNode; 
  fallback?: ReactNode;
}> = ({ feature, children, fallback }) => (
  <PermissionGate features={[feature]} fallback={fallback}>
    {children}
  </PermissionGate>
);