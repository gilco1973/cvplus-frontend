/**
 * Recommendations Module Integration
 * 
 * Integrates @cvplus/recommendations module with frontend.
 * Provides hooks and services for AI-powered recommendations.
 */

import React from 'react';
import { MODULE_FLAGS } from './index';

// Dynamic import for recommendations module
export const loadRecommendationsModule = async () => {
  if (MODULE_FLAGS.USE_RECOMMENDATIONS_MODULE) {
    try {
      // TODO: Uncomment when @cvplus/recommendations package is ready
      // const recommendationsModule = await import('@cvplus/recommendations');
      console.info('[@cvplus/recommendations] Package not available yet - using legacy recommendations');
      return null;
    } catch (error) {
      console.warn('[@cvplus/recommendations] Module not available:', error);
      return null;
    }
  }
  return null;
};

// Helper hook that dynamically loads the recommendations module
export const useDynamicRecommendations = () => {
  const [recommendationsModule, setRecommendationsModule] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadModule = async () => {
      try {
        const module = await loadRecommendationsModule();
        setRecommendationsModule(module);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRecommendationsModule(null);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, []);

  return {
    useRecommendations: recommendationsModule?.useRecommendations,
    module: recommendationsModule,
    loading,
    error,
    isAvailable: !!recommendationsModule
  };
};

// Helper function to check if new recommendations module is available
export const isRecommendationsModuleAvailable = (): boolean => {
  // TODO: Uncomment when package is available
  // try {
  //   require('@cvplus/recommendations');
  //   return true;
  // } catch {
  //   return false;
  // }
  return false; // Package not available yet
};

// Migration helper for recommendations
export const recommendationsMigrationHelper = {
  useModule: () => MODULE_FLAGS.USE_RECOMMENDATIONS_MODULE && isRecommendationsModuleAvailable(),
  useLegacy: () => !MODULE_FLAGS.USE_RECOMMENDATIONS_MODULE || MODULE_FLAGS.FALLBACK_TO_LEGACY
};
