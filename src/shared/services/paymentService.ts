import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase-optimized';
import { logError } from '../utils/errorHandling';

// Types for payment service
export interface CreatePaymentIntentRequest {
  userId: string;
  email: string;
  googleId: string;
  amount?: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  customerId: string;
  amount: number;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  userId: string;
  googleId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  subscriptionStatus: string;
  lifetimeAccess: boolean;
  features: {
    webPortal: boolean;
    aiChat: boolean;
    podcast: boolean;
    advancedAnalytics: boolean;
  };
  purchasedAt: any;
  message: string;
}

export interface CheckFeatureAccessRequest {
  userId: string;
  googleId: string;
  feature: 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics';
}

export interface CheckFeatureAccessResponse {
  hasAccess: boolean;
  subscriptionStatus: string;
  lifetimeAccess: boolean;
  features?: Record<string, boolean>;
  purchasedAt?: any;
  googleAccountVerified?: any;
  message: string;
}

export interface GetUserSubscriptionRequest {
  userId: string;
}

export interface GetUserSubscriptionResponse {
  subscriptionStatus: string;
  lifetimeAccess: boolean;
  features: {
    webPortal: boolean;
    aiChat: boolean;
    podcast: boolean;
    advancedAnalytics: boolean;
  };
  purchasedAt?: any;
  paymentAmount?: number;
  currency?: string;
  googleAccountVerified?: any;
  stripeCustomerId?: string;
  message: string;
}

// Firebase Functions references
const createPaymentIntentFn = httpsCallable<CreatePaymentIntentRequest, CreatePaymentIntentResponse>(
  functions, 
  'createPaymentIntent'
);

const confirmPaymentFn = httpsCallable<ConfirmPaymentRequest, ConfirmPaymentResponse>(
  functions, 
  'confirmPayment'
);

const checkFeatureAccessFn = httpsCallable<CheckFeatureAccessRequest, CheckFeatureAccessResponse>(
  functions, 
  'checkFeatureAccess'
);

const getUserSubscriptionFn = httpsCallable<GetUserSubscriptionRequest, GetUserSubscriptionResponse>(
  functions, 
  'getUserSubscription'
);

/**
 * Create a payment intent for lifetime premium access
 */
export const createPaymentIntent = async (
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> => {
  try {
    const result = await createPaymentIntentFn(request);
    return result.data;
  } catch (error) {
    logError('createPaymentIntent', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create payment intent'
    );
  }
};

/**
 * Confirm payment and grant lifetime premium access
 */
export const confirmPayment = async (
  request: ConfirmPaymentRequest
): Promise<ConfirmPaymentResponse> => {
  try {
    const result = await confirmPaymentFn(request);
    return result.data;
  } catch (error) {
    logError('confirmPayment', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to confirm payment'
    );
  }
};

/**
 * Check if user has access to a specific premium feature
 */
export const checkFeatureAccess = async (
  request: CheckFeatureAccessRequest
): Promise<CheckFeatureAccessResponse> => {
  try {
    const result = await checkFeatureAccessFn(request);
    return result.data;
  } catch (error) {
    logError('checkFeatureAccess', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to check feature access'
    );
  }
};

/**
 * Get user's subscription status and features
 */
export const getUserSubscription = async (
  request: GetUserSubscriptionRequest
): Promise<GetUserSubscriptionResponse> => {
  try {
    const result = await getUserSubscriptionFn(request);
    return result.data;
  } catch (error) {
    logError('getUserSubscription', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to get user subscription'
    );
  }
};

/**
 * Helper function to check if user has any premium features
 */
export const hasAnyPremiumFeature = (features: Record<string, boolean>): boolean => {
  return Object.values(features).some(hasFeature => hasFeature === true);
};

/**
 * Helper function to get premium features list
 */
export const getPremiumFeaturesList = (features: Record<string, boolean>): string[] => {
  return Object.entries(features)
    .filter(([_, hasFeature]) => hasFeature === true)
    .map(([feature]) => feature);
};

/**
 * Helper function to format feature names for display
 */
export const formatFeatureName = (feature: string): string => {
  const featureMap: Record<string, string> = {
    webPortal: 'Personal Web Portal',
    aiChat: 'AI Chat Assistant',
    podcast: 'AI Career Podcast',
    advancedAnalytics: 'Advanced Analytics'
  };
  
  return featureMap[feature] || feature;
};