import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from './useSubscription';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

interface UsageStats {
  currentMonthUploads: number;
  uniqueCVsThisMonth: number;
  remainingUploads: number;
  subscriptionStatus: 'free' | 'premium';
  lifetimeAccess: boolean;
  lastUpdated: Date;
}

interface PremiumStatus {
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  features: Record<string, boolean>;
  subscriptionStatus: string;
  purchasedAt?: any;
  usageStats: UsageStats | null;
  refreshStatus: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

/**
 * Simplified hook for checking premium status throughout the application
 * Provides real-time premium status monitoring with caching
 */
export const usePremiumStatus = (): PremiumStatus => {
  const { user } = useAuth();
  const { subscription, isLifetimePremium, isLoading, error, refreshSubscription } = useSubscription();
  const [cachedStatus, setCachedStatus] = useState<{
    isPremium: boolean;
    features: Record<string, boolean>;
    timestamp: number;
  } | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Cache premium status for 5 minutes to improve performance
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if cached data is still valid
  const isCacheValid = useCallback(() => {
    if (!cachedStatus) return false;
    return Date.now() - cachedStatus.timestamp < CACHE_DURATION;
  }, [cachedStatus]);

  // Update cache when subscription data changes
  useEffect(() => {
    if (subscription && user) {
      setCachedStatus({
        isPremium: isLifetimePremium,
        features: subscription.features || {},
        timestamp: Date.now()
      });
    } else if (!user) {
      // Clear cache when user logs out
      setCachedStatus(null);
    }
  }, [subscription, isLifetimePremium, user]);

  // Fetch user usage statistics
  const fetchUsageStats = useCallback(async () => {
    if (!user) return;
    
    try {
      setUsageLoading(true);
      const getUserUsageStats = httpsCallable(functions, 'getUserUsageStats');
      const result = await getUserUsageStats({ userId: user.uid });
      
      if (result.data) {
        setUsageStats({
          ...result.data as any,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      setUsageStats(null);
    } finally {
      setUsageLoading(false);
    }
  }, [user]);

  // Refresh premium status with cache invalidation
  const refreshStatus = useCallback(async () => {
    setCachedStatus(null); // Invalidate cache
    await Promise.all([refreshSubscription(), fetchUsageStats()]);
  }, [refreshSubscription, fetchUsageStats]);

  // Refresh usage statistics only
  const refreshUsage = useCallback(async () => {
    await fetchUsageStats();
  }, [fetchUsageStats]);

  // Initial fetch of usage stats when user logs in
  useEffect(() => {
    if (user && !usageStats) {
      fetchUsageStats();
    }
  }, [user, usageStats, fetchUsageStats]);

  // Real-time status monitoring for premium feature changes
  useEffect(() => {
    if (!user) return;

    // Set up periodic status refresh for premium users
    const interval = setInterval(() => {
      if (!isCacheValid() && user) {
        refreshSubscription();
        // Also refresh usage stats every cache cycle
        fetchUsageStats();
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [user, isCacheValid, refreshSubscription, fetchUsageStats]);

  // Return cached data if available and valid, otherwise return live data
  const shouldUseCached = isCacheValid() && cachedStatus && !isLoading;
  
  return {
    isPremium: shouldUseCached ? cachedStatus.isPremium : isLifetimePremium,
    isLoading: (isLoading && !shouldUseCached) || usageLoading,
    error,
    features: shouldUseCached ? cachedStatus.features : (subscription?.features || {}),
    subscriptionStatus: subscription?.subscriptionStatus || 'free',
    purchasedAt: subscription?.purchasedAt,
    usageStats,
    refreshStatus,
    refreshUsage
  };
};

/**
 * Hook for checking access to a specific premium feature with caching
 */
export const useFeatureAccess = (featureName: string) => {
  const { features, isPremium, isLoading } = usePremiumStatus();
  
  return {
    hasAccess: isPremium && features[featureName] === true,
    isPremium,
    isLoading,
    allFeatures: features
  };
};

/**
 * Hook for premium upgrade prompts throughout the application
 */
export const usePremiumPrompt = () => {
  const { isPremium, isLoading } = usePremiumStatus();
  const [promptDismissed, setPromptDismissed] = useState(false);

  // Show premium prompts for non-premium users
  const shouldShowPrompt = !isPremium && !isLoading && !promptDismissed;
  
  const dismissPrompt = useCallback(() => {
    setPromptDismissed(true);
    // Reset after 24 hours
    setTimeout(() => setPromptDismissed(false), 24 * 60 * 60 * 1000);
  }, []);

  return {
    shouldShowPrompt,
    dismissPrompt,
    isPremium,
    isLoading
  };
};

/**
 * Hook for premium status indicators in components
 */
export const usePremiumIndicator = () => {
  const { isPremium, isLoading, features } = usePremiumStatus();
  
  const getStatusText = useCallback(() => {
    if (isLoading) return 'Checking...';
    if (isPremium) return 'Premium';
    return 'Free';
  }, [isPremium, isLoading]);
  
  const getStatusColor = useCallback(() => {
    if (isLoading) return 'text-gray-500';
    if (isPremium) return 'text-yellow-600';
    return 'text-gray-600';
  }, [isPremium, isLoading]);
  
  const getFeatureCount = useCallback(() => {
    return Object.values(features).filter(hasAccess => hasAccess).length;
  }, [features]);

  return {
    isPremium,
    isLoading,
    statusText: getStatusText(),
    statusColor: getStatusColor(),
    featureCount: getFeatureCount(),
    features
  };
};

/**
 * Hook for usage tracking and limit management
 */
export const useUsageLimits = () => {
  const { usageStats, isPremium, isLoading, refreshUsage } = usePremiumStatus();
  
  const canUpload = useCallback(() => {
    if (!usageStats) return false;
    return usageStats.remainingUploads > 0;
  }, [usageStats]);
  
  const getRemainingUploads = useCallback(() => {
    if (!usageStats) return 0;
    return usageStats.remainingUploads;
  }, [usageStats]);
  
  const getUsagePercentage = useCallback(() => {
    if (!usageStats) return 0;
    const maxUploads = isPremium ? Infinity : 3; // Free plan: 3, Premium: unlimited
    if (maxUploads === Infinity) return 0;
    return Math.min(100, (usageStats.currentMonthUploads / maxUploads) * 100);
  }, [usageStats, isPremium]);
  
  const isApproachingLimit = useCallback(() => {
    if (!usageStats || isPremium) return false;
    return usageStats.remainingUploads <= 1;
  }, [usageStats, isPremium]);
  
  return {
    usageStats,
    canUpload: canUpload(),
    remainingUploads: getRemainingUploads(),
    usagePercentage: getUsagePercentage(),
    isApproachingLimit: isApproachingLimit(),
    isLoading,
    refreshUsage
  };
};

/**
 * Hook for policy violation alerts and warnings
 */
export const usePolicyStatus = () => {
  const { user } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchViolations = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const getUserViolations = httpsCallable(functions, 'getUserPolicyViolations');
      const result = await getUserViolations({ userId: user.uid });
      
      if (result.data) {
        setViolations(result.data as any[]);
      }
    } catch (error) {
      console.error('Error fetching policy violations:', error);
      setViolations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchViolations();
    }
  }, [user, fetchViolations]);
  
  const hasActiveViolations = violations.some(v => v.status === 'active');
  const hasWarnings = violations.some(v => v.severity === 'low' || v.severity === 'medium');
  
  return {
    violations,
    hasActiveViolations,
    hasWarnings,
    isLoading,
    refreshViolations: fetchViolations
  };
};