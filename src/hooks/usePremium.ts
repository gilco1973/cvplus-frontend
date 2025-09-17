/**
 * Premium Hooks for CVPlus
 * 
 * Provides React hooks for premium functionality, subscription management,
 * and feature gating that integrate with Firebase and existing CVPlus architecture.
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  PremiumFeature,
  PremiumSubscriptionStatus,
  FeatureAccessResult
} from '../types/premium';
import { 
  isPremiumFeature,
  canAccessFeature,
  subscriptionHelpers,
  analyticsHelpers
} from '../modules/premium';

/**
 * Enhanced premium hook that extends the existing AuthContext premium functionality
 */
export const usePremium = () => {
  const { premium } = useAuth();
  
  // Enhanced subscription status with module integration
  const subscriptionStatus: PremiumSubscriptionStatus = useMemo(() => ({
    isPremium: premium?.isPremium || false,
    tier: premium?.isLifetimePremium ? 'lifetime' : premium?.isPremium ? 'premium' : 'free',
    features: {
      // Map existing premium features to new structure
      externalDataSources: premium?.isPremium || false,
      advancedAnalytics: premium?.features?.advancedAnalytics || false,
      aiInsights: premium?.features?.aiChat || false,
      multimediaFeatures: premium?.isPremium || false,
      portfolioGallery: premium?.features?.webPortal || false,
      videoIntroduction: premium?.features?.webPortal || false,
      podcastGeneration: premium?.features?.podcast || false,
      certificateBadges: premium?.isPremium || false,
      realTimeSync: premium?.isPremium || false,
      customBranding: false, // Future feature
      prioritySupport: premium?.isPremium || false,
      exportOptions: premium?.isPremium || false,
      apiAccess: false // Future feature
    },
    metadata: {
      purchasedAt: premium?.purchasedAt,
      planId: premium?.subscriptionStatus
    }
  }), [premium]);
  
  // Feature access checker
  const checkFeatureAccess = useCallback((feature: PremiumFeature): FeatureAccessResult => {
    const isLoading = premium?.isLoadingPremium || false;
    
    // If not a premium feature, grant access
    if (!isPremiumFeature(feature)) {
      return {
        hasAccess: true,
        isPremium: subscriptionStatus.isPremium,
        isLoading,
        allFeatures: subscriptionStatus.features as Record<string, boolean>
      };
    }
    
    // Check access using subscription status
    const hasAccess = subscriptionHelpers.hasFeatureAccess(feature, subscriptionStatus);
    
    return {
      hasAccess,
      isPremium: subscriptionStatus.isPremium,
      isLoading,
      allFeatures: subscriptionStatus.features as Record<string, boolean>,
      denialReason: !hasAccess ? (subscriptionStatus.isPremium ? 'feature_not_included' : 'no_subscription') : undefined,
      upgradeRecommendation: !hasAccess ? subscriptionHelpers.getUpgradeRecommendation(feature, subscriptionStatus.tier) : undefined
    };
  }, [subscriptionStatus, premium?.isLoadingPremium]);
  
  // Simple feature access checker
  const hasFeature = useCallback((feature: PremiumFeature): boolean => {
    const access = checkFeatureAccess(feature);
    return access.hasAccess;
  }, [checkFeatureAccess]);
  
  // Track feature usage
  const trackFeatureUsage = useCallback((
    feature: PremiumFeature, 
    metadata?: Record<string, any>
  ) => {
    analyticsHelpers.trackFeatureUsage(feature, true);
  }, []);
  
  // Upgrade URL generator
  const getUpgradeUrl = useCallback((feature?: PremiumFeature) => {
    const baseUrl = '/pricing';
    return feature ? `${baseUrl}?feature=${feature}` : baseUrl;
  }, []);
  
  return {
    // Core subscription data
    subscription: subscriptionStatus,
    isPremium: subscriptionStatus.isPremium,
    tier: subscriptionStatus.tier,
    features: subscriptionStatus.features,
    
    // Loading and error states
    isLoading: premium?.isLoadingPremium || false,
    error: premium?.premiumError || null,
    
    // Feature access methods
    checkFeatureAccess,
    hasFeature,
    trackFeatureUsage,
    
    // Utility methods
    getUpgradeUrl,
    refreshStatus: premium?.refreshPremiumStatus || (() => Promise.resolve()),
    clearError: premium?.clearPremiumError || (() => {}),
    
    // Legacy compatibility
    legacy: premium
  };
};

/**
 * Subscription management hook
 */
export const useSubscription = () => {
  const { subscription, isPremium, tier, isLoading, error, refreshStatus, clearError } = usePremium();
  
  return {
    subscription,
    isPremium,
    tier,
    isLoading,
    error,
    refresh: refreshStatus,
    clearError
  };
};

/**
 * Feature gating hook with analytics integration
 */
export const useFeatureGate = (feature: PremiumFeature) => {
  const { hasFeature, checkFeatureAccess, trackFeatureUsage, getUpgradeUrl } = usePremium();
  
  // Track when feature gate is mounted
  useEffect(() => {
    if (!hasFeature(feature)) {
      analyticsHelpers.trackUpgradePrompt(feature, 'feature-gate-mounted');
    }
  }, [feature, hasFeature]);
  
  const featureAccess = checkFeatureAccess(feature);
  
  const showUpgradePrompt = useCallback((context?: string) => {
    analyticsHelpers.trackUpgradePrompt(feature, context);
  }, [feature]);
  
  const trackInteraction = useCallback((action: string, metadata?: Record<string, any>) => {
    analyticsHelpers.trackPremiumInteraction(action, feature, metadata);
  }, [feature]);
  
  const handleFeatureUse = useCallback((metadata?: Record<string, any>) => {
    if (hasFeature(feature)) {
      trackFeatureUsage(feature, metadata);
      return true;
    } else {
      showUpgradePrompt('feature-blocked');
      return false;
    }
  }, [feature, hasFeature, trackFeatureUsage, showUpgradePrompt]);
  
  return {
    hasAccess: hasFeature(feature),
    featureAccess,
    showUpgradePrompt,
    trackInteraction,
    handleFeatureUse,
    upgradeUrl: getUpgradeUrl(feature)
  };
};

/**
 * Hook for premium feature usage tracking and limits
 */
export const usePremiumUsage = () => {
  const { subscription, trackFeatureUsage } = usePremium();
  const [usageStats, setUsageStats] = useState<Record<PremiumFeature, { current: number; limit: number }>>({} as any);
  
  const trackUsage = useCallback(async (
    feature: PremiumFeature, 
    amount: number = 1,
    metadata?: Record<string, any>
  ) => {
    // Track the usage
    trackFeatureUsage(feature, { amount, ...metadata });
    
    // Update local usage stats (in a real app, this would sync with backend)
    setUsageStats(prev => ({
      ...prev,
      [feature]: {
        current: (prev[feature]?.current || 0) + amount,
        limit: prev[feature]?.limit || 100 // Default limit
      }
    }));
  }, [trackFeatureUsage]);
  
  const getUsagePercentage = useCallback((feature: PremiumFeature): number => {
    const stats = usageStats[feature];
    if (!stats) return 0;
    return subscriptionHelpers.calculateUsagePercentage(stats.current, stats.limit);
  }, [usageStats]);
  
  const isApproachingLimit = useCallback((feature: PremiumFeature, threshold: number = 80): boolean => {
    const stats = usageStats[feature];
    if (!stats) return false;
    return subscriptionHelpers.isApproachingLimit(stats.current, stats.limit, threshold);
  }, [usageStats]);
  
  return {
    usageStats,
    trackUsage,
    getUsagePercentage,
    isApproachingLimit,
    hasUsageLimit: (feature: PremiumFeature) => !!usageStats[feature]
  };
};

/**
 * Hook for premium analytics and conversion tracking
 */
export const usePremiumAnalytics = () => {
  const trackUpgradePrompt = useCallback((feature: PremiumFeature, context?: string) => {
    analyticsHelpers.trackUpgradePrompt(feature, context);
  }, []);
  
  const trackConversion = useCallback((feature: PremiumFeature, planType: string) => {
    analyticsHelpers.trackUpgradeConversion(feature, planType);
  }, []);
  
  const trackFeatureInteraction = useCallback((
    feature: PremiumFeature, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    analyticsHelpers.trackPremiumInteraction(action, feature, metadata);
  }, []);
  
  return {
    trackUpgradePrompt,
    trackConversion,
    trackFeatureInteraction
  };
};

// Export all premium hooks
export {
  useSubscription,
  useFeatureGate,
  usePremiumUsage,
  usePremiumAnalytics
};