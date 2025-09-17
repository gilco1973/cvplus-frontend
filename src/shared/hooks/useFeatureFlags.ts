/**
 * Feature Flags Hook
 * 
 * Provides feature flag evaluation for gradual rollouts and A/B testing.
 * Used for admin component integration and other feature toggles.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { FEATURE_FLAGS } from '../config/featureFlags';
import { useAuth } from '../contexts/AuthContext';

interface UseFeatureFlagsReturn {
  isFeatureEnabled: (flagKey: string) => boolean;
  getFeatureConfig: (flagKey: string) => any;
  loading: boolean;
  error: string | null;
}

/**
 * Feature flags hook
 * 
 * Evaluates feature flags based on user context, rollout percentages,
 * and route-specific configurations.
 */
export const useFeatureFlags = (): UseFeatureFlagsReturn => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize feature flags (could load from remote config in future)
    const initializeFlags = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, flags are static. In the future, could load from Firebase Remote Config
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async loading
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature flags');
        setLoading(false);
      }
    };

    initializeFlags();
  }, []);

  /**
   * Check if a feature flag is enabled for the current user
   */
  const isFeatureEnabled = useCallback((flagKey: string): boolean => {
    try {
      // Handle specific admin flags
      if (flagKey === 'admin_analytics_dashboard_integration') {
        const adminFlags = FEATURE_FLAGS.adminIntegration;
        if (!adminFlags.enabled) return false;
        
        // Check user whitelist (admin users get early access)
        if (user && adminFlags.userWhitelist?.includes('admin')) {
          return true;
        }
        
        // Check route-specific rollout for admin-analytics
        const routeRollout = adminFlags.routeSpecific?.['admin-analytics'] || 0;
        return routeRollout > 0 && Math.random() * 100 < routeRollout;
      }

      if (flagKey === 'admin_performance_dashboard_integration') {
        const adminFlags = FEATURE_FLAGS.adminIntegration;
        if (!adminFlags.enabled) return false;
        
        // Performance dashboard is disabled for now (pending integration work)
        const routeRollout = adminFlags.routeSpecific?.['admin-monitoring'] || 0;
        return routeRollout > 0;
      }

      // Handle React SPA flags
      if (flagKey.startsWith('react_spa_')) {
        const spaFlags = FEATURE_FLAGS.reactSPA;
        if (!spaFlags.enabled) return false;
        
        const route = flagKey.replace('react_spa_', '');
        const routeRollout = spaFlags.routeSpecific?.[route] || spaFlags.rolloutPercentage;
        return Math.random() * 100 < routeRollout;
      }

      // Handle JSON API flags
      if (flagKey.startsWith('json_api_')) {
        const apiFlags = FEATURE_FLAGS.jsonAPIs;
        if (!apiFlags.enabled) return false;
        
        const route = flagKey.replace('json_api_', '');
        const routeRollout = apiFlags.routeSpecific?.[route] || apiFlags.rolloutPercentage;
        return Math.random() * 100 < routeRollout;
      }

      // Default: check if flag exists in config
      const flagPath = flagKey.split('_');
      let flagConfig: any = FEATURE_FLAGS;
      
      for (const segment of flagPath) {
        flagConfig = flagConfig?.[segment];
        if (!flagConfig) return false;
      }

      if (typeof flagConfig === 'object' && 'enabled' in flagConfig) {
        return flagConfig.enabled && Math.random() * 100 < flagConfig.rolloutPercentage;
      }

      return false;
    } catch (err) {
      console.warn(`Feature flag evaluation error for ${flagKey}:`, err);
      return false;
    }
  }, [user]);

  /**
   * Get feature configuration details
   */
  const getFeatureConfig = useCallback((flagKey: string) => {
    try {
      const flagPath = flagKey.split('_');
      let flagConfig: any = FEATURE_FLAGS;
      
      for (const segment of flagPath) {
        flagConfig = flagConfig?.[segment];
        if (!flagConfig) return null;
      }

      return flagConfig;
    } catch (err) {
      console.warn(`Feature flag config error for ${flagKey}:`, err);
      return null;
    }
  }, []);

  return {
    isFeatureEnabled,
    getFeatureConfig,
    loading,
    error
  };
};

/**
 * Default export
 */
export default useFeatureFlags;