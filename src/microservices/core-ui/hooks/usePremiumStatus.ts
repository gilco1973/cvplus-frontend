import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface PremiumIndicator {
  isPremium: boolean;
  isLoading: boolean;
  statusText: string;
  statusColor: 'green' | 'yellow' | 'gray' | 'blue';
  featureCount: number;
  tier: 'free' | 'premium' | 'lifetime';
}

export function usePremiumIndicator(): PremiumIndicator {
  const { user } = useAuth();
  const [premiumData, setPremiumData] = useState<PremiumIndicator>({
    isPremium: false,
    isLoading: true,
    statusText: 'Loading...',
    statusColor: 'gray',
    featureCount: 0,
    tier: 'free'
  });

  const fetchPremiumStatus = useCallback(async () => {
    if (!user) {
      setPremiumData({
        isPremium: false,
        isLoading: false,
        statusText: 'Not signed in',
        statusColor: 'gray',
        featureCount: 0,
        tier: 'free'
      });
      return;
    }

    try {
      setPremiumData(prev => ({ ...prev, isLoading: true }));

      // This would normally call the actual premium service
      // For now, simulate a check based on user properties
      const mockPremiumCheck = await new Promise<{
        isPremium: boolean;
        tier: 'free' | 'premium' | 'lifetime';
        featureCount: number;
      }>(resolve => {
        setTimeout(() => {
          // Mock logic - in real implementation this would check subscription
          const isPremium = user.email?.includes('premium') || false;
          const isLifetime = user.email?.includes('lifetime') || false;

          resolve({
            isPremium: isPremium || isLifetime,
            tier: isLifetime ? 'lifetime' : (isPremium ? 'premium' : 'free'),
            featureCount: isPremium ? (isLifetime ? 100 : 50) : 5
          });
        }, 500);
      });

      const statusText = mockPremiumCheck.tier === 'lifetime'
        ? 'Lifetime Premium'
        : mockPremiumCheck.tier === 'premium'
        ? 'Premium Active'
        : 'Free Plan';

      const statusColor = mockPremiumCheck.tier === 'lifetime'
        ? 'yellow' as const
        : mockPremiumCheck.tier === 'premium'
        ? 'blue' as const
        : 'gray' as const;

      setPremiumData({
        isPremium: mockPremiumCheck.isPremium,
        isLoading: false,
        statusText,
        statusColor,
        featureCount: mockPremiumCheck.featureCount,
        tier: mockPremiumCheck.tier
      });

    } catch (error) {
      console.error('Error fetching premium status:', error);
      setPremiumData({
        isPremium: false,
        isLoading: false,
        statusText: 'Error loading status',
        statusColor: 'gray',
        featureCount: 0,
        tier: 'free'
      });
    }
  }, [user]);

  useEffect(() => {
    fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  return premiumData;
}

export function usePremiumAccess(feature?: string) {
  const { isPremium, isLoading, tier } = usePremiumIndicator();

  const hasAccess = useCallback((requiredTier: 'free' | 'premium' | 'lifetime' = 'premium') => {
    if (isLoading) return false;

    switch (requiredTier) {
      case 'free':
        return true;
      case 'premium':
        return tier === 'premium' || tier === 'lifetime';
      case 'lifetime':
        return tier === 'lifetime';
      default:
        return false;
    }
  }, [tier, isLoading]);

  const checkFeatureAccess = useCallback((featureName: string) => {
    // Mock feature access logic
    const freeFeatures = ['basic-cv', 'basic-templates'];
    const premiumFeatures = ['advanced-cv', 'ai-optimization', 'custom-templates'];
    const lifetimeFeatures = ['all-features', 'priority-support'];

    if (freeFeatures.includes(featureName)) return true;
    if (premiumFeatures.includes(featureName)) return tier === 'premium' || tier === 'lifetime';
    if (lifetimeFeatures.includes(featureName)) return tier === 'lifetime';

    return false;
  }, [tier]);

  return {
    isPremium,
    isLoading,
    tier,
    hasAccess,
    checkFeatureAccess,
    canAccessFeature: feature ? checkFeatureAccess(feature) : true
  };
}

export function usePremiumPrompt(feature?: string) {
  const { isPremium, isLoading, tier } = usePremiumIndicator();
  const [isDismissed, setIsDismissed] = useState(false);

  const shouldShow = useCallback(() => {
    if (isLoading || isDismissed || isPremium) return false;

    // Show prompt for non-premium users trying to access premium features
    if (feature) {
      const requiredTier = getRequiredTierForFeature(feature);
      return requiredTier !== 'free' && tier === 'free';
    }

    return tier === 'free';
  }, [isLoading, isDismissed, isPremium, feature, tier]);

  const dismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const reset = useCallback(() => {
    setIsDismissed(false);
  }, []);

  return {
    shouldShow: shouldShow(),
    dismiss,
    reset,
    isPremium,
    tier,
    isLoading
  };
}

// Helper function to determine required tier for feature
function getRequiredTierForFeature(feature: string): 'free' | 'premium' | 'lifetime' {
  const featureMapping = {
    'basic-cv': 'free',
    'basic-templates': 'free',
    'advanced-cv': 'premium',
    'ai-optimization': 'premium',
    'custom-templates': 'premium',
    'unlimited-downloads': 'premium',
    'all-features': 'lifetime',
    'early-access': 'lifetime'
  } as const;

  return featureMapping[feature as keyof typeof featureMapping] || 'premium';
}

export default usePremiumIndicator;