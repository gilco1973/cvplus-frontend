/**
 * Premium Subscription Hook
 * 
 * React hook for managing premium subscription status and features.
 * Integrates with the CVPlus premium service and provides real-time
 * subscription status updates.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { useFirebaseFunction } from './useFeatureData';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  available: boolean;
  usageLimit?: number;
  usageCount?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PremiumFeature[];
}

interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  expiresAt?: Date;
  cancelAtPeriodEnd?: boolean;
  trialEndsAt?: Date;
  paymentMethod?: string;
}

interface UsageLimits {
  portalGenerations: {
    limit: number;
    used: number;
    remaining: number;
  };
  ragChatMessages: {
    limit: number;
    used: number;
    remaining: number;
  };
  aiFeatures: {
    limit: number;
    used: number;
    remaining: number;
  };
}

interface PremiumState {
  subscription: SubscriptionStatus | null;
  usage: UsageLimits | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export const usePremiumSubscription = () => {
  const [user, userLoading] = useAuthState(auth);
  const { callFunction, loading: functionLoading } = useFirebaseFunction();
  
  const [premiumState, setPremiumState] = useState<PremiumState>({
    subscription: null,
    usage: null,
    loading: true,
    error: null
  });

  // ========================================================================
  // SUBSCRIPTION STATUS FETCHING
  // ========================================================================

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setPremiumState({
        subscription: {
          isActive: false,
          plan: null
        },
        usage: {
          portalGenerations: { limit: 0, used: 0, remaining: 0 },
          ragChatMessages: { limit: 10, used: 0, remaining: 10 }, // Free tier gets limited chat
          aiFeatures: { limit: 0, used: 0, remaining: 0 }
        },
        loading: false,
        error: null
      });
      return;
    }

    try {
      setPremiumState(prev => ({ ...prev, loading: true, error: null }));

      // Call premium subscription service
      const result = await callFunction('getPremiumStatus', {
        userId: user.uid
      });

      if (result.success) {
        setPremiumState({
          subscription: {
            isActive: result.data.isActive || false,
            plan: result.data.plan || null,
            expiresAt: result.data.expiresAt ? new Date(result.data.expiresAt) : undefined,
            cancelAtPeriodEnd: result.data.cancelAtPeriodEnd || false,
            trialEndsAt: result.data.trialEndsAt ? new Date(result.data.trialEndsAt) : undefined,
            paymentMethod: result.data.paymentMethod
          },
          usage: result.data.usage || {
            portalGenerations: { limit: 0, used: 0, remaining: 0 },
            ragChatMessages: { limit: 10, used: 0, remaining: 10 },
            aiFeatures: { limit: 0, used: 0, remaining: 0 }
          },
          loading: false,
          error: null
        });
      } else {
        throw new Error(result.error || 'Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Premium subscription fetch error:', error);
      
      // Fallback to basic free tier
      setPremiumState({
        subscription: {
          isActive: false,
          plan: {
            id: 'free',
            name: 'Free',
            tier: 'free',
            price: 0,
            currency: 'USD',
            interval: 'month',
            features: [
              {
                id: 'basic-cv-processing',
                name: 'Basic CV Processing',
                description: 'Standard CV analysis and optimization',
                available: true
              },
              {
                id: 'portal-generation',
                name: 'AI Portal Generation',
                description: 'Generate AI-powered professional portals',
                available: false
              },
              {
                id: 'rag-chat',
                name: 'Advanced AI Chat',
                description: 'Unlimited RAG-powered conversations',
                available: false
              }
            ]
          }
        },
        usage: {
          portalGenerations: { limit: 0, used: 0, remaining: 0 },
          ragChatMessages: { limit: 10, used: 0, remaining: 10 },
          aiFeatures: { limit: 2, used: 0, remaining: 2 }
        },
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [user, callFunction]);

  // ========================================================================
  // FEATURE CHECKING
  // ========================================================================

  const hasFeature = useCallback((featureId: string): boolean => {
    if (!premiumState.subscription?.plan) return false;
    
    const feature = premiumState.subscription.plan.features.find(f => f.id === featureId);
    return feature?.available || false;
  }, [premiumState.subscription]);

  const canUseFeature = useCallback((featureType: keyof UsageLimits): boolean => {
    if (!premiumState.usage) return false;
    
    const usage = premiumState.usage[featureType];
    return usage.remaining > 0;
  }, [premiumState.usage]);

  const getFeatureUsage = useCallback((featureType: keyof UsageLimits) => {
    return premiumState.usage?.[featureType] || { limit: 0, used: 0, remaining: 0 };
  }, [premiumState.usage]);

  // ========================================================================
  // SUBSCRIPTION ACTIONS
  // ========================================================================

  const upgradeSubscription = useCallback(async (planId: string) => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const result = await callFunction('upgradeSubscription', {
        userId: user.uid,
        planId
      });
      
      if (result.success) {
        // Refresh subscription status
        await fetchSubscriptionStatus();
        return result.data;
      } else {
        throw new Error(result.error || 'Upgrade failed');
      }
    } catch (error) {
      console.error('Subscription upgrade error:', error);
      throw error;
    }
  }, [user, callFunction, fetchSubscriptionStatus]);

  const cancelSubscription = useCallback(async () => {
    if (!user) throw new Error('User must be authenticated');
    
    try {
      const result = await callFunction('cancelSubscription', {
        userId: user.uid
      });
      
      if (result.success) {
        // Refresh subscription status
        await fetchSubscriptionStatus();
        return result.data;
      } else {
        throw new Error(result.error || 'Cancellation failed');
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw error;
    }
  }, [user, callFunction, fetchSubscriptionStatus]);

  const trackFeatureUsage = useCallback(async (featureType: keyof UsageLimits, amount: number = 1) => {
    if (!user) return;
    
    try {
      await callFunction('trackFeatureUsage', {
        userId: user.uid,
        featureType,
        amount
      });
      
      // Update local usage count
      setPremiumState(prev => {
        if (!prev.usage) return prev;
        
        return {
          ...prev,
          usage: {
            ...prev.usage,
            [featureType]: {
              ...prev.usage[featureType],
              used: prev.usage[featureType].used + amount,
              remaining: Math.max(0, prev.usage[featureType].remaining - amount)
            }
          }
        };
      });
    } catch (error) {
      console.error('Feature usage tracking error:', error);
    }
  }, [user, callFunction]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  useEffect(() => {
    if (!userLoading) {
      fetchSubscriptionStatus();
    }
  }, [user, userLoading, fetchSubscriptionStatus]);

  // ========================================================================
  // COMPUTED VALUES
  // ========================================================================

  const isPremium = premiumState.subscription?.isActive || false;
  const plan = premiumState.subscription?.plan;
  const isLoading = userLoading || premiumState.loading || functionLoading;
  
  const subscriptionSummary = {
    isPremium,
    planName: plan?.name || 'Free',
    tier: plan?.tier || 'free',
    isActive: premiumState.subscription?.isActive || false,
    expiresAt: premiumState.subscription?.expiresAt,
    trialEndsAt: premiumState.subscription?.trialEndsAt,
    cancelAtPeriodEnd: premiumState.subscription?.cancelAtPeriodEnd || false
  };

  // ========================================================================
  // RETURN VALUES
  // ========================================================================

  return {
    // Status
    isPremium,
    isLoading,
    error: premiumState.error,
    
    // Subscription details
    subscription: premiumState.subscription,
    plan,
    subscriptionSummary,
    usage: premiumState.usage,
    
    // Feature checking
    hasFeature,
    canUseFeature,
    getFeatureUsage,
    
    // Actions
    upgradeSubscription,
    cancelSubscription,
    trackFeatureUsage,
    refreshStatus: fetchSubscriptionStatus,
    
    // Convenience flags
    canGeneratePortals: hasFeature('portal-generation') && canUseFeature('portalGenerations'),
    canUseRagChat: hasFeature('rag-chat') || canUseFeature('ragChatMessages'),
    canUseAiFeatures: hasFeature('ai-features') && canUseFeature('aiFeatures')
  };
};

export default usePremiumSubscription;