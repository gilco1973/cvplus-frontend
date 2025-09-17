// Permission management types for auth-ui microservice

export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}

export interface PermissionGateProps {
  permissions: string[] | PermissionCheck[];
  premiumTier?: PremiumTier;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  children: React.ReactNode;
}

export interface PermissionState {
  permissions: Permission[];
  roles: UserRole[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface RolePermissionMap {
  [roleName: string]: string[];
}

export interface PermissionContext {
  userId: string;
  organizationId?: string;
  teamId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

export interface PermissionValidationResult {
  granted: boolean;
  reason?: string;
  requiredTier?: PremiumTier;
  missingPermissions?: string[];
}

// Re-export from @cvplus/core for consistency
export type { Permission, UserRole, PremiumTier } from '@cvplus/core';