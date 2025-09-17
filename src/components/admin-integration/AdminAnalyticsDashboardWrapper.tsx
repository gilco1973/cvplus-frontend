/**
 * Admin Analytics Dashboard Integration Wrapper
 * 
 * Integration layer for the migrated AnalyticsDashboard component from @cvplus/admin.
 * Provides backward compatibility and feature flag controlled rollout.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { Loader2, AlertTriangle } from 'lucide-react';

// Legacy component import
import { AnalyticsDashboard as LegacyAnalyticsDashboard } from '../AnalyticsDashboard';

interface AdminAnalyticsDashboardWrapperProps {
  className?: string;
}

/**
 * Admin Analytics Dashboard Wrapper Component
 * 
 * Provides feature flag controlled integration of the migrated admin analytics dashboard.
 * Falls back to legacy component when the admin submodule version is disabled.
 */
export const AdminAnalyticsDashboardWrapper: React.FC<AdminAnalyticsDashboardWrapperProps> = ({
  className = ''
}) => {
  const { isFeatureEnabled, loading: flagsLoading } = useFeatureFlags();
  const [integrationReady, setIntegrationReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Feature flag for admin submodule integration
  const useAdminSubmodule = isFeatureEnabled('admin_analytics_dashboard_integration');

  // Check if admin submodule integration is ready
  useEffect(() => {
    if (useAdminSubmodule) {
      // Check if @cvplus/admin is available and ready
      import('@cvplus/admin')
        .then((adminModule) => {
          if (adminModule.AnalyticsDashboard) {
            setIntegrationReady(true);
            setLoadError(null);
          } else {
            setLoadError('Admin module AnalyticsDashboard not found');
            setIntegrationReady(false);
          }
        })
        .catch((error) => {
          console.warn('Admin submodule not ready, falling back to legacy:', error);
          setLoadError(`Admin submodule load error: ${error.message}`);
          setIntegrationReady(false);
        });
    }
  }, [useAdminSubmodule]);

  // Loading state while feature flags load
  if (flagsLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
      </div>
    );
  }

  // Admin submodule version with fallback
  if (useAdminSubmodule) {
    if (loadError && !integrationReady) {
      // Show error and fallback to legacy
      console.warn('Admin Analytics Dashboard integration failed, using legacy version:', loadError);
      return (
        <div className={className}>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Using legacy admin dashboard (admin submodule integration pending)
              </span>
            </div>
          </div>
          <LegacyAnalyticsDashboard className={className} />
        </div>
      );
    }

    if (integrationReady) {
      // Lazy load the admin submodule version
      const AdminAnalyticsDashboard = React.lazy(async () => {
        const adminModule = await import('@cvplus/admin');
        return { default: adminModule.AnalyticsDashboard };
      });

      return (
        <React.Suspense
          fallback={
            <div className={`flex items-center justify-center p-8 ${className}`}>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading admin analytics dashboard...</span>
            </div>
          }
        >
          <AdminAnalyticsDashboard className={className} />
        </React.Suspense>
      );
    }

    // Loading state for admin submodule
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Initializing admin dashboard integration...</span>
      </div>
    );
  }

  // Legacy version (default)
  return <LegacyAnalyticsDashboard className={className} />;
};

/**
 * Default export for backward compatibility
 */
export default AdminAnalyticsDashboardWrapper;