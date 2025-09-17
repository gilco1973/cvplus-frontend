import { loadStripe } from '@stripe/stripe-js';
import { getStripePriceId } from '../config/pricing';

// Use the Stripe publishable key from environment or the configured one
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_live_51RucLU08HjEeKlGmjf4zZ6bRegaBYMqyE6NlqIPoQihR3vHjtE2GVR2qJrsAkm4Mzx8t4qcwaXqYUQX2qwfknRT200g8qqtArd'
);

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  priceId?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const createCheckoutSession = async (params: CheckoutSessionParams) => {
  try {
    // Get Firebase Auth token for authenticated calls
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const { auth, firebaseApp } = await import('../lib/firebase');
    
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    // Get environment-specific price ID, but don't pass placeholder IDs to backend
    const priceId = params.priceId || getStripePriceId('PREMIUM');
    
    // Only pass real price IDs to backend, let backend handle fallback for placeholders
    const shouldUsePriceId = priceId && !priceId.includes('placeholder');

    const functions = getFunctions(firebaseApp);
    const createCheckoutSessionFunction = httpsCallable(functions, 'createCheckoutSession');
    
    const result = await createCheckoutSessionFunction({
      userId: params.userId,
      userEmail: params.userEmail,
      ...(shouldUsePriceId ? { priceId: priceId } : {}), // Only include priceId if it's real
      successUrl: params.successUrl || `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/pricing?canceled=true`,
    });

    const data = result.data as { sessionId: string; url: string; customerId: string };
    return data.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (sessionId: string) => {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    // Redirect to checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw new Error(error.message || 'Checkout redirect failed');
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

export const stripeService = {
  createCheckoutSession,
  redirectToCheckout,
};