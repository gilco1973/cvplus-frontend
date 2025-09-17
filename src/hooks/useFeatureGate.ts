/**
 * Feature Gate Hook for CVPlus Premium Integration
 * 
 * Provides comprehensive feature gating functionality that integrates
 * with existing premium components and the CVPlus architecture.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { PremiumFeature } from '../types/premium';
import { usePremium, usePremiumAnalytics } from './usePremium';
import { 
  featureGateHelpers,
  premiumModuleConfig,
  MODULE_FLAGS
} from '../modules/premium';
import { useAuth } from '../contexts/AuthContext';

export interface FeatureGateOptions {
  /** Show a preview of the feature when access is denied */
  showPreview?: boolean;
  /** Opacity of the preview (0-1) */
  previewOpacity?: number;
  /** Custom context for analytics */
  analyticsContext?: string;
  /** Whether to track when the gate is rendered */
  trackRendering?: boolean;
  /** Custom upgrade prompt configuration */
  customUpgradePrompt?: {
    title?: string;
    description?: string;
    benefits?: string[];
    ctaText?: string;
  };
}

export interface FeatureGateResult {
  /** Whether the user has access to the feature */
  hasAccess: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Function to track upgrade prompt display */
  showUpgradePrompt: (context?: string) => void;
  /** Function to track feature interaction */
  trackInteraction: (action: string, metadata?: Record<string, any>) => void;
  /** Function to handle feature usage (returns false if blocked) */
  handleFeatureUse: (metadata?: Record<string, any>) => boolean;
  /** Upgrade URL for this specific feature */
  upgradeUrl: string;
  /** Gate configuration for UI components */
  gateConfig: {
    feature: PremiumFeature;
    showPreview: boolean;
    previewOpacity: number;
    upgradePrompt: any;
    analyticsContext?: string;
  };
  /** Whether this is a premium feature */
  isPremiumFeature: boolean;
  /** Current user's premium status */
  isPremiumUser: boolean;
  /** Specific denial reason */
  denialReason?: 'no_subscription' | 'feature_not_included' | 'usage_limit_exceeded' | 'subscription_expired';
}

/**
 * Primary feature gate hook
 */
export const useFeatureGate = (
  feature: PremiumFeature,
  options: FeatureGateOptions = {}
): FeatureGateResult => {
  const { 
    hasFeature, 
    checkFeatureAccess, 
    isLoading, 
    error, 
    getUpgradeUrl,
    trackFeatureUsage 
  } = usePremium();
  
  const { trackUpgradePrompt, trackFeatureInteraction } = usePremiumAnalytics();
  const { user } = useAuth();
  
  const {
    showPreview = true,
    previewOpacity = 0.3,
    analyticsContext = 'feature-gate',
    trackRendering = true,
    customUpgradePrompt
  } = options;
  
  // Check if this is actually a premium feature
  const isPremiumFeature = useMemo(() => {
    return premiumModuleConfig.features?.[feature] || false;
  }, [feature]);
  
  // Get feature access details
  const featureAccess = checkFeatureAccess(feature);
  const hasAccess = hasFeature(feature);
  
  // Track when feature gate is rendered (if enabled)
  useEffect(() => {
    if (trackRendering && !hasAccess && isPremiumFeature && user) {
      trackUpgradePrompt(feature, `${analyticsContext}-rendered`);
    }
  }, [feature, hasAccess, isPremiumFeature, trackRendering, analyticsContext, user, trackUpgradePrompt]);
  
  // Show upgrade prompt handler
  const showUpgradePrompt = useCallback((context?: string) => {
    const fullContext = context ? `${analyticsContext}-${context}` : analyticsContext;
    trackUpgradePrompt(feature, fullContext);
  }, [feature, analyticsContext, trackUpgradePrompt]);
  
  // Track feature interaction
  const trackInteraction = useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeatureInteraction(feature, action, {
      context: analyticsContext,
      ...metadata
    });
  }, [feature, analyticsContext, trackFeatureInteraction]);
  
  // Handle feature usage (with automatic tracking and blocking)
  const handleFeatureUse = useCallback((metadata?: Record<string, any>) => {
    if (hasAccess) {
      // Track successful usage
      trackFeatureUsage(feature, {
        context: analyticsContext,
        success: true,
        ...metadata
      });
      trackInteraction('feature_used', { success: true, ...metadata });
      return true;
    } else {
      // Track blocked access
      trackInteraction('access_blocked', { 
        reason: featureAccess.denialReason,
        ...metadata 
      });
      showUpgradePrompt('feature-blocked');
      return false;
    }
  }, [hasAccess, feature, analyticsContext, trackFeatureUsage, trackInteraction, showUpgradePrompt, featureAccess.denialReason]);
  
  // Generate gate configuration
  const gateConfig = useMemo(() => {
    const basePrompt = featureGateHelpers.generateUpgradePrompt(feature);
    const upgradePrompt = customUpgradePrompt ? {
      ...basePrompt,
      ...customUpgradePrompt
    } : basePrompt;
    
    return {
      feature,
      showPreview,
      previewOpacity,
      upgradePrompt,
      analyticsContext
    };
  }, [feature, showPreview, previewOpacity, analyticsContext, customUpgradePrompt]);
  
  return {
    hasAccess,
    isLoading,
    error,
    showUpgradePrompt,
    trackInteraction,
    handleFeatureUse,
    upgradeUrl: getUpgradeUrl(feature),
    gateConfig,
    isPremiumFeature,
    isPremiumUser: featureAccess.isPremium,
    denialReason: featureAccess.denialReason
  };
};

/**
 * Simplified feature gate hook that returns just the access state
 */
export const useFeatureAccess = (feature: PremiumFeature): boolean => {
  const { hasAccess } = useFeatureGate(feature, { trackRendering: false });
  return hasAccess;
};

/**
 * Hook for multiple feature gates
 */
export const useMultipleFeatureGates = (
  features: PremiumFeature[],
  options: FeatureGateOptions = {}
): Record<PremiumFeature, FeatureGateResult> => {
  const results = useMemo(() => {
    const gateResults: Record<string, FeatureGateResult> = {};
    
    features.forEach(feature => {
      // We can't use hooks in a loop, so this is a simplified version
      // In practice, you'd need to call useFeatureGate for each feature individually
      gateResults[feature] = {
        hasAccess: false,
        isLoading: false,
        error: null,
        showUpgradePrompt: () => {},
        trackInteraction: () => {},
        handleFeatureUse: () => false,
        upgradeUrl: '/pricing',
        gateConfig: {
          feature,
          showPreview: true,
          previewOpacity: 0.3,
          upgradePrompt: featureGateHelpers.generateUpgradePrompt(feature)
        },
        isPremiumFeature: true,
        isPremiumUser: false
      };
    });
    
    return gateResults;
  }, [features]);
  
  return results as Record<PremiumFeature, FeatureGateResult>;
};

/**
 * Hook for feature gate with conditional rendering helper
 */
export const useConditionalFeatureGate = (
  feature: PremiumFeature,
  condition: boolean = true,
  options: FeatureGateOptions = {}
): FeatureGateResult & { shouldShow: boolean } => {
  const gateResult = useFeatureGate(feature, {
    ...options,
    trackRendering: options.trackRendering && condition
  });
  
  return {
    ...gateResult,
    shouldShow: condition && (gateResult.hasAccess || gateResult.isPremiumFeature)
  };
};

/**
 * Hook for feature gate with automatic fallback handling
 */
export const useFeatureGateWithFallback = <T>(
  feature: PremiumFeature,
  premiumValue: T,
  fallbackValue: T,
  options: FeatureGateOptions = {}
): {
  value: T;
  gate: FeatureGateResult;
  usingFallback: boolean;
} => {
  const gate = useFeatureGate(feature, options);
  
  return {
    value: gate.hasAccess ? premiumValue : fallbackValue,
    gate,
    usingFallback: !gate.hasAccess
  };
};

/**
 * Hook for legacy premium component integration
 */
export const useLegacyPremiumIntegration = (feature: PremiumFeature) => {
  const { legacy } = usePremium();
  const gate = useFeatureGate(feature, { trackRendering: false });
  
  // Map new feature structure to legacy premium context
  const legacyFeatureMap = {
    'portfolioGallery': 'webPortal',
    'videoIntroduction': 'webPortal',
    'advancedAnalytics': 'advancedAnalytics',
    'aiInsights': 'aiChat',
    'podcastGeneration': 'podcast'
  };
  
  const legacyFeatureName = legacyFeatureMap[feature as keyof typeof legacyFeatureMap];
  const legacyHasAccess = legacyFeatureName ? legacy?.features?.[legacyFeatureName as keyof typeof legacy.features] : false;
  
  return {
    // New module access
    hasAccess: gate.hasAccess,
    gate,
    
    // Legacy compatibility
    legacyHasAccess: legacyHasAccess || false,
    legacyFeatureName,
    
    // Combined access (for transition period)
    combinedAccess: gate.hasAccess || legacyHasAccess || false,
    
    // Module flag status
    usingNewModule: MODULE_FLAGS.USE_PREMIUM_MODULE,
    fallbackToLegacy: MODULE_FLAGS.FALLBACK_TO_LEGACY
  };
};

// Export all feature gate hooks
export {
  useFeatureAccess,
  useMultipleFeatureGates,
  useConditionalFeatureGate,
  useFeatureGateWithFallback,
  useLegacyPremiumIntegration
};