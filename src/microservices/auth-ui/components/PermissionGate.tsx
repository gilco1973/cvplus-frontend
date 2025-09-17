/**
 * PermissionGate Component - Auth UI Microservice
 *
 * Conditionally renders content based on user permissions, roles, and premium features.
 * Integrates with CVPlus microservices architecture for flexible authorization control.
 *
 * @author Gil Klainert
 * @version 2.0.0 - Microservices Architecture
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { NotificationService } from '@/core-ui/services/NotificationService';
import { createLogger } from '@cvplus/logging';
import type { PermissionGateProps, PermissionValidationResult } from '../types/permissions';
import type { PremiumTier } from '../types/auth';

// Initialize logger for auth-ui microservice
const logger = createLogger('auth-ui');

export default function PermissionGate({
  children,
  fallback = null,
  permissions = [],
  premiumTier,
  requireAll = true,
  loading,
  hideWhenUnauthorized = false,
  inverse = false
}: PermissionGateProps) {
  const {
    hasPermissions,
    hasAllPermissions,
    hasAnyPermission,
    userPermissions,
    isLoading: permissionsLoading
  } = usePermissions();

  // Show loading state if permissions are still loading
  if (permissionsLoading) {
    if (loading) {
      return <>{loading}</>;
    }

    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Validate permissions
  const validatePermissions = (): PermissionValidationResult => {
    try {
      // Handle permission string array format
      if (Array.isArray(permissions) && permissions.length > 0 && typeof permissions[0] === 'string') {
        const permissionStrings = permissions as string[];

        const hasRequiredPermissions = requireAll
          ? hasAllPermissions(permissionStrings)
          : hasAnyPermission(permissionStrings);

        if (!hasRequiredPermissions) {
          logger.debug('Permission check failed', {
            required: permissionStrings,
            userPermissions: userPermissions.map(p => p.name),
            requireAll
          });

          return {
            granted: false,
            reason: `Missing required permissions: ${permissionStrings.join(', ')}`,
            missingPermissions: permissionStrings.filter(p =>
              !userPermissions.some(up => up.name === p)
            )
          };
        }
      }

      // Handle PermissionCheck object array format
      if (Array.isArray(permissions) && permissions.length > 0 && typeof permissions[0] === 'object') {
        // TODO: Implement complex permission checking with context
        logger.debug('Complex permission checking not yet implemented');
      }

      // Check premium tier requirement
      if (premiumTier) {
        // TODO: Integrate with @cvplus/premium microservice
        logger.debug('Premium tier checking', { requiredTier: premiumTier });

        // For now, return a placeholder result
        return {
          granted: false,
          reason: 'Premium feature access validation pending',
          requiredTier: premiumTier
        };
      }

      return { granted: true };
    } catch (error) {
      logger.error('Permission validation error', error);
      return {
        granted: false,
        reason: 'Permission validation failed'
      };
    }
  };

  const validationResult = validatePermissions();
  const isAuthorized = validationResult.granted;
  const shouldRender = inverse ? !isAuthorized : isAuthorized;

  // Log permission checks for debugging
  if (!isAuthorized && permissions.length > 0) {
    logger.debug('Permission gate blocked access', {
      permissions,
      premiumTier,
      requireAll,
      reason: validationResult.reason,
      missingPermissions: validationResult.missingPermissions
    });
  }

  if (shouldRender) {
    return <>{children}</>;
  }

  // Handle unauthorized access
  if (hideWhenUnauthorized) {
    return null;
  }

  // Show fallback or default unauthorized message
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default unauthorized fallback
  return (
    <div className="bg-warning-900/20 border border-warning-700 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-warning-200">
            {validationResult.requiredTier ? 'Premium Feature' : 'Insufficient Permissions'}
          </h3>
          <div className="mt-2 text-sm text-warning-300">
            <p>
              {validationResult.reason || 'You do not have the required permissions to access this feature.'}
            </p>
            {validationResult.missingPermissions && validationResult.missingPermissions.length > 0 && (
              <p className="mt-1 text-xs text-warning-400">
                Missing: {validationResult.missingPermissions.join(', ')}
              </p>
            )}
          </div>
          {validationResult.requiredTier && (
            <div className="mt-3">
              <button
                onClick={() => {
                  NotificationService.info(`Upgrade to ${validationResult.requiredTier} to access this feature`, {
                    microservice: 'auth-ui'
                  });
                }}
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition-colors"
              >
                Upgrade to {validationResult.requiredTier}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Convenience components for common use cases

export function AdminOnly({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permissions={['admin:system']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ModeratorOnly({
  children,
  fallback
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate permissions={['admin:users']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function PremiumOnly({
  tier,
  children,
  fallback
}: {
  tier: PremiumTier;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGate premiumTier={tier} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function FeatureGate({
  permission,
  feature,
  children,
  fallback
}: {
  permission?: string;
  feature?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  // Use permission-based access if provided, otherwise feature-based
  const gateProps = permission
    ? { permissions: [permission] }
    : { premiumTier: 'basic' as PremiumTier }; // TODO: Map features to tiers

  return (
    <PermissionGate {...gateProps} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

// Export PermissionGate as both default and named export for flexibility
export { PermissionGate };