/**
 * Premium Module Provider
 * 
 * Provides premium subscription management, feature gating, and analytics
 * integration for the CVPlus premium features following Firebase-centric architecture.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  PremiumFeature,
  PremiumSubscriptionStatus,
  FeatureAccessResult,
  PremiumError,
  PremiumFeatureUsage,
  type BasePremiumGateProps
} from '../types/premium';
import { 
  isPremiumFeature,
  canAccessFeature,
  subscriptionHelpers,
  featureGateHelpers,
  analyticsHelpers,
  premiumErrorHandlers,
  premiumModuleConfig
} from '../modules/premium';
import { logError, getErrorMessage } from '../utils/errorHandling';

interface PremiumModuleContextType {
  // Subscription status
  subscriptionStatus: PremiumSubscriptionStatus;
  isLoadingSubscription: boolean;
  subscriptionError: PremiumError | null;
  
  // Feature access
  checkFeatureAccess: (feature: PremiumFeature) => FeatureAccessResult;
  hasFeature: (feature: PremiumFeature) => boolean;
  getFeatureUsage: (feature: PremiumFeature) => PremiumFeatureUsage | null;
  
  // Subscription management
  refreshSubscriptionStatus: () => Promise<void>;
  trackFeatureUsage: (feature: PremiumFeature, metadata?: Record<string, any>) => Promise<void>;
  
  // Analytics
  trackUpgradePrompt: (feature: PremiumFeature, context?: string) => void;
  trackFeatureInteraction: (feature: PremiumFeature, action: string, metadata?: Record<string, any>) => void;
  
  // Error handling
  clearError: () => void;
  
  // Upgrade helpers
  getUpgradeUrl: (feature?: PremiumFeature) => string;
  generateUpgradePrompt: (feature: PremiumFeature) => any;
}

const PremiumModuleContext = createContext<PremiumModuleContextType | undefined>(undefined);

export const usePremiumModule = () => {
  const context = useContext(PremiumModuleContext);
  if (!context) {
    throw new Error('usePremiumModule must be used within PremiumModuleProvider');
  }
  return context;
};

// Hook for feature gating with premium integration
export const useFeatureGate = (feature: PremiumFeature) => {
  const { checkFeatureAccess, hasFeature, trackUpgradePrompt, trackFeatureInteraction } = usePremiumModule();
  
  const featureAccess = checkFeatureAccess(feature);
  
  const showUpgradePrompt = useCallback((context?: string) => {
    trackUpgradePrompt(feature, context);
  }, [feature, trackUpgradePrompt]);
  
  const trackInteraction = useCallback((action: string, metadata?: Record<string, any>) => {
    trackFeatureInteraction(feature, action, metadata);
  }, [feature, trackFeatureInteraction]);
  
  return {
    hasAccess: hasFeature(feature),
    featureAccess,
    showUpgradePrompt,
    trackInteraction,
    gateConfig: featureGateHelpers.createGateConfig(feature)
  };
};

// Hook for subscription management
export const useSubscriptionManagement = () => {
  const { 
    subscriptionStatus, 
    isLoadingSubscription, 
    subscriptionError, 
    refreshSubscriptionStatus,
    clearError 
  } = usePremiumModule();
  
  return {
    subscription: subscriptionStatus,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refresh: refreshSubscriptionStatus,
    clearError,
    isPremium: subscriptionStatus.isPremium,
    tier: subscriptionStatus.tier,
    features: subscriptionStatus.features
  };
};

interface PremiumProviderProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType;
}

export const PremiumModuleProvider: React.FC<PremiumProviderProps> = ({ 
  children, 
  fallbackComponent: FallbackComponent 
}) => {
  const { user, premium } = useAuth();
  
  // Local state for premium module
  const [subscriptionStatus, setSubscriptionStatus] = useState<PremiumSubscriptionStatus>({
    isPremium: false,
    tier: 'free',
    features: {
      externalDataSources: false,
      advancedAnalytics: false,
      aiInsights: false,
      multimediaFeatures: false,
      portfolioGallery: false,
      videoIntroduction: false,
      podcastGeneration: false,
      certificateBadges: false,
      realTimeSync: false,
      customBranding: false,
      prioritySupport: false,
      exportOptions: false,
      apiAccess: false
    }
  });
  
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<PremiumError | null>(null);
  const [featureUsageCache, setFeatureUsageCache] = useState<Map<PremiumFeature, PremiumFeatureUsage>>(new Map());
  
  // Sync with existing AuthContext premium data
  useEffect(() => {
    if (premium && !premium.isLoadingPremium) {
      setSubscriptionStatus(prevStatus => ({
        ...prevStatus,
        isPremium: premium.isPremium,
        tier: premium.isLifetimePremium ? 'lifetime' : premium.isPremium ? 'premium' : 'free',
        features: {
          ...prevStatus.features,
          // Map existing premium features
          portfolioGallery: premium.features.webPortal,
          advancedAnalytics: premium.features.advancedAnalytics,
          aiInsights: premium.features.aiChat,
          podcastGeneration: premium.features.podcast,
          videoIntroduction: premium.features.webPortal,
          realTimeSync: premium.isPremium,
          prioritySupport: premium.isPremium,
          exportOptions: premium.isPremium
        },
        metadata: {
          purchasedAt: premium.purchasedAt,
          planId: premium.subscriptionStatus
        }
      }));
      setIsLoadingSubscription(false);
      setSubscriptionError(null);
    } else if (premium?.premiumError) {
      setSubscriptionError(premiumErrorHandlers.handleSubscriptionError(new Error(premium.premiumError)));
    }
  }, [premium]);
  
  // Feature access checker with SECURE error state handling
  const checkFeatureAccess = useCallback((feature: PremiumFeature): FeatureAccessResult => {
    // SECURITY: Always deny access during error states unless explicitly verified premium
    if (subscriptionError && !subscriptionStatus.isPremium) {
      return {
        hasAccess: false,
        isPremium: false,
        isLoading: false,
        allFeatures: {},
        denialReason: 'subscription_check_failed'
      };
    }
    
    // SECURITY: Validate feature existence using master types
    if (!isPremiumFeature(feature)) {
      // Only allow access to non-premium features if no subscription errors
      return {
        hasAccess: !subscriptionError,
        isPremium: subscriptionStatus.isPremium,
        isLoading: isLoadingSubscription,
        allFeatures: subscriptionStatus.features as Record<string, boolean>
      };
    }
    
    // SECURITY: During loading states, deny access to premium features as secure default
    if (isLoadingSubscription) {
      return {
        hasAccess: false,
        isPremium: false,
        isLoading: true,
        allFeatures: {},
        denialReason: 'subscription_check_failed'
      };
    }
    
    const hasAccess = subscriptionHelpers.hasFeatureAccess(feature, subscriptionStatus);
    
    return {
      hasAccess: hasAccess && !subscriptionError, // Deny if any subscription errors
      isPremium: subscriptionStatus.isPremium,
      isLoading: isLoadingSubscription,
      allFeatures: subscriptionStatus.features as Record<string, boolean>,
      denialReason: !hasAccess ? (subscriptionStatus.isPremium ? 'feature_not_included' : 'no_subscription') : 
                   subscriptionError ? 'subscription_check_failed' : undefined,
      upgradeRecommendation: !hasAccess ? subscriptionHelpers.getUpgradeRecommendation(feature, subscriptionStatus.tier) : undefined
    };
  }, [subscriptionStatus, isLoadingSubscription, subscriptionError]);
  
  // Simple feature access checker
  const hasFeature = useCallback((feature: PremiumFeature): boolean => {
    const access = checkFeatureAccess(feature);
    return access.hasAccess;
  }, [checkFeatureAccess]);
  
  // Feature usage tracking
  const trackFeatureUsage = useCallback(async (
    feature: PremiumFeature, 
    metadata?: Record<string, any>
  ) => {
    try {
      if (!user) return;
      
      // Track in Firebase (future implementation)
      // For now, just track in analytics
      analyticsHelpers.trackFeatureUsage(feature, true);
      
      // Update local usage cache
      const currentUsage = featureUsageCache.get(feature) || {
        feature,
        usageCount: 0,
        lastUsed: new Date()
      };
      
      const updatedUsage: PremiumFeatureUsage = {
        ...currentUsage,
        usageCount: currentUsage.usageCount + 1,
        lastUsed: new Date()
      };
      
      setFeatureUsageCache(prev => new Map(prev.set(feature, updatedUsage)));
      
    } catch (error) {
      logError('trackFeatureUsage', error);
    }
  }, [user, featureUsageCache]);
  
  // Get feature usage statistics
  const getFeatureUsage = useCallback((feature: PremiumFeature): PremiumFeatureUsage | null => {
    return featureUsageCache.get(feature) || null;
  }, [featureUsageCache]);
  
  // Refresh subscription status
  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      setIsLoadingSubscription(true);
      setSubscriptionError(null);
      
      // Trigger refresh in AuthContext
      if (premium?.refreshPremiumStatus) {
        await premium.refreshPremiumStatus();
      }
    } catch (error) {
      setSubscriptionError(premiumErrorHandlers.handleSubscriptionError(error));
      logError('refreshSubscriptionStatus', error);
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [premium]);
  
  // Analytics helpers
  const trackUpgradePrompt = useCallback((feature: PremiumFeature, context?: string) => {
    analyticsHelpers.trackUpgradePrompt(feature, context);
  }, []);
  
  const trackFeatureInteraction = useCallback((
    feature: PremiumFeature, 
    action: string, 
    metadata?: Record<string, any>
  ) => {
    analyticsHelpers.trackPremiumInteraction(action, feature, metadata);
  }, []);
  
  // Error management
  const clearError = useCallback(() => {
    setSubscriptionError(null);
    if (premium?.clearPremiumError) {
      premium.clearPremiumError();
    }
  }, [premium]);
  
  // Upgrade URL generator
  const getUpgradeUrl = useCallback((feature?: PremiumFeature): string => {
    const baseUrl = '/pricing';
    return feature ? `${baseUrl}?feature=${feature}` : baseUrl;
  }, []);
  
  // Generate upgrade prompt configuration
  const generateUpgradePrompt = useCallback((feature: PremiumFeature) => {
    return featureGateHelpers.generateUpgradePrompt(feature);
  }, []);
  
  const contextValue: PremiumModuleContextType = {
    subscriptionStatus,
    isLoadingSubscription,
    subscriptionError,
    checkFeatureAccess,
    hasFeature,
    getFeatureUsage,
    refreshSubscriptionStatus,
    trackFeatureUsage,
    trackUpgradePrompt,
    trackFeatureInteraction,
    clearError,
    getUpgradeUrl,
    generateUpgradePrompt
  };
  
  // SECURE Error boundary fallback - maintains access control during errors
  if (subscriptionError && !isLoadingSubscription) {
    // SECURITY: Create secure context that denies all premium access during errors
    const secureErrorContext: PremiumModuleContextType = {
      subscriptionStatus: {
        isPremium: false,
        tier: 'free',
        features: Object.keys(subscriptionStatus.features).reduce((acc, key) => {
          acc[key as PremiumFeature] = false; // Deny all features during errors
          return acc;
        }, {} as Record<PremiumFeature, boolean>)
      },
      isLoadingSubscription: false,
      subscriptionError,
      checkFeatureAccess: () => ({
        hasAccess: false,
        isPremium: false,
        isLoading: false,
        allFeatures: {},
        denialReason: 'subscription_check_failed'
      }),
      hasFeature: () => false, // Deny all features during errors
      getFeatureUsage: () => null,
      refreshSubscriptionStatus,
      trackFeatureUsage: async () => {}, // No-op during errors
      trackUpgradePrompt: () => {},
      trackFeatureInteraction: () => {},
      clearError,
      getUpgradeUrl,
      generateUpgradePrompt
    };
    
    if (FallbackComponent) {
      return (
        <PremiumModuleContext.Provider value={secureErrorContext}>
          <FallbackComponent />
        </PremiumModuleContext.Provider>
      );
    }
    
    return (
      <PremiumModuleContext.Provider value={secureErrorContext}>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Premium Features Temporarily Unavailable</h3>
          <p className="text-red-600 text-sm mt-1">
            Premium features are temporarily unavailable for security reasons. Basic functionality continues to work normally.
          </p>
          <p className="text-red-500 text-xs mt-1">
            Error: {subscriptionError.message || 'Subscription verification failed'}
          </p>
          <button 
            onClick={refreshSubscriptionStatus}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry Verification
          </button>
        </div>
      </PremiumModuleContext.Provider>
    );
  }
  
  return (
    <PremiumModuleContext.Provider value={contextValue}>
      {children}
    </PremiumModuleContext.Provider>
  );
};

// Higher-order component for premium feature wrapping
export const withPremiumGate = <P extends BasePremiumGateProps>(
  Component: React.ComponentType<P>,
  feature: PremiumFeature,
  gateConfig?: any
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { hasFeature, generateUpgradePrompt, trackUpgradePrompt } = usePremiumModule();
    
    if (!hasFeature(feature)) {
      const upgradePrompt = generateUpgradePrompt(feature);
      
      return (
        <div className="relative">
          {gateConfig?.showPreview && (
            <div style={{ opacity: gateConfig.previewOpacity || 0.3 }}>
              <Component {...props} />
            </div>
          )}
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center p-6">
              <h3 className="text-lg font-semibold mb-2">{upgradePrompt.title}</h3>
              <p className="text-gray-600 mb-4">{upgradePrompt.description}</p>
              <button
                onClick={() => trackUpgradePrompt(feature, 'hoc-gate')}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `withPremiumGate(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Note: Premium hooks are exported individually above