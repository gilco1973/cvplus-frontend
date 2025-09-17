/**
 * Premium Module Integration
 * 
 * Provides comprehensive premium feature management, subscription handling,
 * and feature gating integration following CVPlus Firebase-centric architecture.
 */

import { MODULE_FLAGS } from './index';
import type { 
  PremiumFeature,
  PremiumSubscriptionStatus,
  FeatureAccessResult,
  PremiumError,
  PremiumFeatureUsage
} from '../types/premium';

// Re-export existing premium functionality for backward compatibility
export {
  isPremiumFeature,
  getPremiumTypeForFeature,
  getFeaturesForPremiumType,
  canAccessFeature,
  validateFeatureSelection,
  filterAccessibleFeatures,
  PREMIUM_FEATURE_MAPPINGS,
  FREE_FEATURES
} from '../config/premiumFeatures';

export {
  type PremiumFeature,
  type PremiumSubscriptionStatus,
  type FeatureAccessResult,
  type PremiumError,
  type PremiumFeatureUsage,
  type FeaturePremiumGateConfig,
  type BasePremiumGateProps,
  type UpgradePromptConfig,
  PREMIUM_GATE_PRESETS
} from '../types/premium';

// Re-export existing premium contexts and hooks
export {
  type PremiumContextType,
  type AuthContextType
} from '../contexts/AuthContext';

export {
  useAuth,
  usePremium,
  useFeature,
  usePremiumUpgrade
} from '../contexts/AuthContext';

// Premium service interfaces
export interface PremiumServiceConfig {
  stripePublicKey?: string;
  webhookEndpoint?: string;
  priceIds?: {
    monthly: string;
    yearly: string;
    lifetime: string;
  };
  features?: {
    [key: string]: boolean;
  };
  analytics?: {
    enabled: boolean;
    trackingId?: string;
  };
}

export interface SubscriptionManagementService {
  getCurrentSubscription(): Promise<PremiumSubscriptionStatus>;
  upgradeSubscription(planId: string): Promise<{ success: boolean; error?: string }>;
  cancelSubscription(): Promise<{ success: boolean; error?: string }>;
  reactivateSubscription(): Promise<{ success: boolean; error?: string }>;
  updatePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }>;
  getUsageStatistics(): Promise<Record<PremiumFeature, PremiumFeatureUsage>>;
}

export interface FeatureGatingService {
  checkFeatureAccess(feature: PremiumFeature): Promise<FeatureAccessResult>;
  trackFeatureUsage(feature: PremiumFeature, metadata?: Record<string, any>): Promise<void>;
  getFeatureLimits(feature: PremiumFeature): Promise<{ current: number; limit: number; resetDate?: Date }>;
  isFeatureEnabled(feature: PremiumFeature, context?: Record<string, any>): boolean;
}

export interface PremiumAnalyticsService {
  trackUpgradePrompt(feature: PremiumFeature, context?: Record<string, any>): void;
  trackFeatureInteraction(feature: PremiumFeature, action: string, context?: Record<string, any>): void;
  trackConversion(from: string, to: string, metadata?: Record<string, any>): void;
  trackChurn(reason?: string, metadata?: Record<string, any>): void;
}

// Premium module loader
export const loadPremiumModule = async () => {
  if (MODULE_FLAGS.USE_PREMIUM_MODULE) {
    try {
      // Dynamic import for future @cvplus/premium package
      console.info('[@cvplus/premium] Using integrated premium module');
      return {
        // Future: Actual package exports will go here
        // const premiumModule = await import('@cvplus/premium');
        // return premiumModule;
        
        // Current: Return integrated services
        version: '1.0.0',
        integration: 'firebase-native'
      };
    } catch (error) {
      console.warn('[@cvplus/premium] Premium module load error, using fallback:', error);
      if (MODULE_FLAGS.FALLBACK_TO_LEGACY) {
        return null; // Fallback to existing implementation
      }
      throw error;
    }
  }
  return null;
};

// Premium feature access helper
export const getPremiumFeature = async (featureName: string) => {
  const premiumModule = await loadPremiumModule();
  return premiumModule?.[featureName];
};

// Enhanced subscription management helpers
export const subscriptionHelpers = {
  /**
   * Check if user has access to a specific premium feature
   */
  hasFeatureAccess: (
    feature: PremiumFeature, 
    subscriptionStatus: PremiumSubscriptionStatus
  ): boolean => {
    if (!subscriptionStatus.isPremium) return false;
    return subscriptionStatus.features[feature] || false;
  },

  /**
   * Get upgrade recommendation for a specific feature
   */
  getUpgradeRecommendation: (
    feature: PremiumFeature,
    currentTier: string
  ) => {
    const recommendations = {
      'externalDataSources': {
        requiredTier: 'premium',
        benefits: ['LinkedIn sync', 'GitHub integration', 'Professional certifications'],
        estimatedCost: 29
      },
      'advancedAnalytics': {
        requiredTier: 'premium',
        benefits: ['Performance insights', 'Skill analysis', 'Industry benchmarking'],
        estimatedCost: 29
      },
      'multimediaFeatures': {
        requiredTier: 'premium',
        benefits: ['Video introductions', 'Portfolio galleries', 'Interactive content'],
        estimatedCost: 29
      },
      'aiInsights': {
        requiredTier: 'premium',
        benefits: ['AI-powered suggestions', 'Career optimization', 'Content analysis'],
        estimatedCost: 29
      }
    };

    return recommendations[feature] || null;
  },

  /**
   * Calculate feature usage percentage
   */
  calculateUsagePercentage: (
    current: number,
    limit: number
  ): number => {
    if (limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  },

  /**
   * Check if user is approaching usage limits
   */
  isApproachingLimit: (
    current: number,
    limit: number,
    threshold: number = 80
  ): boolean => {
    const percentage = subscriptionHelpers.calculateUsagePercentage(current, limit);
    return percentage >= threshold;
  }
};

// Feature gating utilities
export const featureGateHelpers = {
  /**
   * Create feature gate configuration for a specific feature
   */
  createGateConfig: (
    feature: PremiumFeature,
    overrides?: Partial<any>
  ) => {
    const baseConfig = {
      feature,
      showPreview: true,
      previewOpacity: 0.3,
      variant: 'default' as const
    };

    return { ...baseConfig, ...overrides };
  },

  /**
   * Generate upgrade prompt messaging for a feature
   */
  generateUpgradePrompt: (feature: PremiumFeature) => {
    const prompts = {
      'externalDataSources': {
        title: 'Supercharge Your CV with External Data',
        description: 'Connect LinkedIn, GitHub, and other platforms to automatically enhance your CV',
        benefits: ['Automatic data sync', 'Real-time updates', 'Professional integrations']
      },
      'advancedAnalytics': {
        title: 'Unlock Advanced Analytics',
        description: 'Get detailed insights and performance metrics for your CV',
        benefits: ['Performance tracking', 'Skill analysis', 'Optimization tips']
      },
      'multimediaFeatures': {
        title: 'Stand Out with Multimedia',
        description: 'Create video introductions and interactive portfolios',
        benefits: ['Video content', 'Portfolio galleries', 'Interactive features']
      },
      'aiInsights': {
        title: 'Get AI-Powered Insights',
        description: 'Receive personalized recommendations from advanced AI analysis',
        benefits: ['Smart suggestions', 'Career optimization', 'Content improvement']
      }
    };

    return prompts[feature] || {
      title: 'Unlock Premium Features',
      description: 'Upgrade to access this premium feature',
      benefits: ['Enhanced functionality', 'Advanced capabilities', 'Priority support']
    };
  }
};

// Premium analytics integration
export const analyticsHelpers = {
  /**
   * Track premium feature interaction
   */
  trackPremiumInteraction: (
    action: string,
    feature?: PremiumFeature,
    metadata?: Record<string, any>
  ) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: 'premium',
        event_label: feature,
        ...metadata
      });
    }
  },

  /**
   * Track upgrade prompt display
   */
  trackUpgradePrompt: (feature: PremiumFeature, context?: string) => {
    analyticsHelpers.trackPremiumInteraction('upgrade_prompt_shown', feature, {
      context,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Track upgrade conversion
   */
  trackUpgradeConversion: (feature: PremiumFeature, planType: string) => {
    analyticsHelpers.trackPremiumInteraction('upgrade_converted', feature, {
      plan_type: planType,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Track feature usage
   */
  trackFeatureUsage: (feature: PremiumFeature, success: boolean = true) => {
    analyticsHelpers.trackPremiumInteraction('feature_used', feature, {
      success,
      timestamp: new Date().toISOString()
    });
  }
};

// Error handling for premium features
export const premiumErrorHandlers = {
  /**
   * Handle subscription check failures
   */
  handleSubscriptionError: (error: any): PremiumError => {
    return {
      type: 'subscription_check_failed',
      message: 'Unable to verify subscription status. Please try again.',
      retryable: true,
      details: { originalError: error.message }
    };
  },

  /**
   * Handle feature access denials
   */
  handleAccessDenied: (feature: PremiumFeature): PremiumError => {
    return {
      type: 'feature_access_denied',
      message: `Access to ${feature} requires a premium subscription.`,
      feature,
      retryable: false,
      details: { requiredTier: 'premium' }
    };
  },

  /**
   * Handle usage limit exceeded
   */
  handleUsageLimitExceeded: (feature: PremiumFeature, limit: number): PremiumError => {
    return {
      type: 'usage_limit_exceeded',
      message: `Monthly usage limit of ${limit} exceeded for ${feature}.`,
      feature,
      retryable: false,
      details: { limit, resetPeriod: 'monthly' }
    };
  }
};

// Migration helpers for gradual module adoption
export const premiumMigrationHelpers = {
  isLegacyPremium: () => !MODULE_FLAGS.USE_PREMIUM_MODULE,
  canUseNewPremium: () => MODULE_FLAGS.USE_PREMIUM_MODULE && !MODULE_FLAGS.FALLBACK_TO_LEGACY,
  shouldFallback: (error: Error) => {
    console.warn('Premium module error, falling back to legacy:', error);
    return MODULE_FLAGS.FALLBACK_TO_LEGACY;
  }
};

// Export default premium module configuration
export const premiumModuleConfig: PremiumServiceConfig = {
  features: {
    externalDataSources: true,
    advancedAnalytics: true,
    aiInsights: true,
    multimediaFeatures: true,
    portfolioGallery: true,
    videoIntroduction: true,
    podcastGeneration: true,
    certificateBadges: true,
    realTimeSync: true,
    customBranding: false, // Future feature
    prioritySupport: true,
    exportOptions: true,
    apiAccess: false // Future feature
  },
  analytics: {
    enabled: true
  }
};