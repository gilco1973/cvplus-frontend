/**
 * Feature Flags for React SPA Migration
 * Controls gradual rollout from HTML generation to pure React SPA
 */

interface FeatureFlagConfig {
  enabled: boolean;
  rolloutPercentage: number;
  userWhitelist?: string[];
  routeSpecific?: Record<string, number>;
}

interface FeatureFlags {
  reactSPA: FeatureFlagConfig;
  jsonAPIs: FeatureFlagConfig;
  componentRenderer: FeatureFlagConfig;
  adminIntegration: FeatureFlagConfig;
}

export const FEATURE_FLAGS: FeatureFlags = {
  // React SPA Architecture Migration
  reactSPA: {
    enabled: true,
    rolloutPercentage: 100, // 100% rollout - ready for production
    userWhitelist: [], // VIP users get early access
    routeSpecific: {
      'cv-preview': 100,    // CVPreviewPageNew is complete and tested
      'cv-analysis': 50,    // Gradual rollout for testing
      'processing': 25,     // Conservative rollout
      'results': 25   // Conservative rollout
    }
  },

  // JSON API Usage (replaces HTML generation)
  jsonAPIs: {
    enabled: true,
    rolloutPercentage: 100, // JSON APIs are ready and tested
    routeSpecific: {
      'cv-data': 100,
      'cv-preview': 100,
      'enhanced-features': 100
    }
  },

  // Component Renderer System (legacy - being phased out)
  componentRenderer: {
    enabled: false, // Disabled - using pure React components now
    rolloutPercentage: 0, // 0% - legacy system being removed
  },

  // Admin Components Integration (gradual rollout from @cvplus/admin)
  adminIntegration: {
    enabled: true, // Enable admin submodule integration
    rolloutPercentage: 25, // Conservative rollout for testing
    userWhitelist: ['admin'], // Admin users get early access
    routeSpecific: {
      'admin-analytics': 25,    // Admin analytics dashboard
      'admin-monitoring': 0,    // Performance dashboard (pending integration work)
    }
  }
};

/**
 * Simple hash function for consistent user bucketing
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Check if user should use React SPA for a specific route
 */
export const useReactSPA = (userId: string, route: string): boolean => {
  const config = FEATURE_FLAGS.reactSPA;
  
  if (!config.enabled) return false;
  
  // Check if user is in whitelist
  if (config.userWhitelist?.includes(userId)) return true;
  
  // Check route-specific rollout percentage
  const routePercentage = config.routeSpecific?.[route] ?? config.rolloutPercentage;
  
  // Consistent bucketing based on user ID
  const userHash = hashCode(userId) % 100;
  return userHash < routePercentage;
};

/**
 * Check if user should use JSON APIs instead of HTML generation
 */
export const useJSONAPIs = (userId: string, apiType: string): boolean => {
  const config = FEATURE_FLAGS.jsonAPIs;
  
  if (!config.enabled) return false;
  
  const apiPercentage = config.routeSpecific?.[apiType] ?? config.rolloutPercentage;
  const userHash = hashCode(`${userId}-${apiType}`) % 100;
  return userHash < apiPercentage;
};

/**
 * Check if component renderer system should be used (legacy)
 */
export const useComponentRenderer = (userId: string): boolean => {
  const config = FEATURE_FLAGS.componentRenderer;
  
  if (!config.enabled) return false;
  
  const userHash = hashCode(`${userId}-renderer`) % 100;
  return userHash < config.rolloutPercentage;
};

/**
 * Get feature flag status for debugging
 */
export const useFeatureFlagStatus = (userId: string) => {
  return {
    reactSPA: {
      'cv-preview': useReactSPA(userId, 'cv-preview'),
      'cv-analysis': useReactSPA(userId, 'cv-analysis'),
      'processing': useReactSPA(userId, 'processing'),
      'results': useReactSPA(userId, 'results'),
    },
    jsonAPIs: {
      'cv-data': useJSONAPIs(userId, 'cv-data'),
      'cv-preview': useJSONAPIs(userId, 'cv-preview'),
      'enhanced-features': useJSONAPIs(userId, 'enhanced-features'),
    },
    componentRenderer: useComponentRenderer(userId)
  };
};

/**
 * Hook for using feature flags in React components
 */
import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';

export const useFeatureFlags = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'anonymous';

  return useMemo(() => ({
    reactSPA: {
      cvPreview: useReactSPA(userId, 'cv-preview'),
      cvAnalysis: useReactSPA(userId, 'cv-analysis'),
      processing: useReactSPA(userId, 'processing'),
      results: useReactSPA(userId, 'results'),
    },
    jsonAPIs: {
      cvData: useJSONAPIs(userId, 'cv-data'),
      cvPreview: useJSONAPIs(userId, 'cv-preview'),
      enhancedFeatures: useJSONAPIs(userId, 'enhanced-features'),
    },
    componentRenderer: useComponentRenderer(userId),
    
    // Debugging info
    userId,
    debugInfo: useFeatureFlagStatus(userId)
  }), [userId]);
};

/**
 * Development helper to log feature flag status
 */
export const logFeatureFlagStatus = (userId: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('🚩 Feature Flag Status:', {
      userId: userId,
      flags: useFeatureFlagStatus(userId)
    });
  }
};