import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  checkFeatureAccess, 
  GetUserSubscriptionResponse,
  CheckFeatureAccessResponse 
} from '../services/paymentService';
import { subscriptionCache } from '../services/subscriptionCache';

type PremiumFeature = 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics';

interface UseSubscriptionReturn {
  subscription: GetUserSubscriptionResponse | null;
  isLoading: boolean;
  error: string | null;
  isLifetimePremium: boolean;
  hasFeature: (feature: PremiumFeature) => boolean;
  refreshSubscription: () => Promise<void>;
}

/**
 * Hook to manage user subscription state
 */
export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<GetUserSubscriptionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const subscriptionData = await subscriptionCache.getSubscription({
        userId: user.uid
      });
      
      setSubscription(subscriptionData);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription data when user changes
  useEffect(() => {
    fetchSubscription();
  }, [user?.uid]);

  const isLifetimePremium = subscription?.lifetimeAccess === true;

  const hasFeature = (feature: PremiumFeature): boolean => {
    return subscription?.features?.[feature] === true;
  };

  const refreshSubscription = async () => {
    // Invalidate cache before refreshing to force fresh data
    if (user) {
      subscriptionCache.invalidateUser(user.uid);
    }
    await fetchSubscription();
  };

  return {
    subscription,
    isLoading,
    error,
    isLifetimePremium,
    hasFeature,
    refreshSubscription
  };
};

interface UseFeatureAccessReturn {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  checkAccess: () => Promise<void>;
}

/**
 * Hook to check access to a specific premium feature
 */
export const useFeatureAccess = (feature: PremiumFeature): UseFeatureAccessReturn => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = async () => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accessData = await checkFeatureAccess({
        userId: user.uid,
        googleId: user.providerData[0]?.uid || user.uid,
        feature
      });
      
      setHasAccess(accessData.hasAccess);
    } catch (err) {
      console.error(`Error checking access to ${feature}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to check feature access');
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check access when user or feature changes
  useEffect(() => {
    checkAccess();
  }, [user?.uid, feature]);

  return {
    hasAccess,
    isLoading,
    error,
    checkAccess
  };
};

/**
 * Hook to manage premium upgrade state
 */
export const usePremiumUpgrade = () => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { refreshSubscription } = useSubscription();

  const handleUpgradeSuccess = async () => {
    setIsUpgrading(false);
    // Refresh subscription data after successful upgrade
    await refreshSubscription();
  };

  const handleUpgradeError = (error: string) => {
    setIsUpgrading(false);
    console.error('Upgrade error:', error);
  };

  const startUpgrade = () => {
    setIsUpgrading(true);
  };

  return {
    isUpgrading,
    startUpgrade,
    handleUpgradeSuccess,
    handleUpgradeError
  };
};