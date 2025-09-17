import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Crown, Shield, ArrowLeft, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { AuthenticationRequired } from './AuthenticationRequired';
import { stripeService } from '../../services/stripeService';
import toast from 'react-hot-toast';
import { getTierConfig, formatPrice } from '../../config/pricing';

interface StripeCheckoutSDKProps {
  price?: number; // Add optional price prop
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const StripeCheckoutSDK = ({ price, onSuccess, onError, onCancel }: StripeCheckoutSDKProps) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get pricing configuration with fallback
  const premiumConfig = getTierConfig('PREMIUM');
  const displayPrice = price || premiumConfig.price.dollars;
  const formattedPrice = formatPrice(premiumConfig.price);

  const handleCheckout = async () => {
    if (!user) {
      onError('Please sign in to continue with payment');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      toast.loading('Creating secure checkout session...');

      // Create checkout session
      const sessionId = await stripeService.createCheckoutSession({
        userId: user.uid,
        userEmail: user.email || '',
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      });

      toast.dismiss();
      toast.success('Redirecting to secure checkout...');

      // Redirect to Stripe Checkout
      await stripeService.redirectToCheckout(sessionId);

    } catch (error) {
      toast.dismiss();
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout process';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return <AuthenticationRequired onCancel={onCancel} />;
  }

  return (
    <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Upgrade to Premium
              </h2>
              <p className="text-cyan-100">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="text-cyan-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="px-8 py-6 bg-neutral-700 border-b border-neutral-600">
        <div className="flex items-center gap-3">
          <img 
            src={user.photoURL || '/default-avatar.png'} 
            alt={user.displayName || 'User'} 
            className="w-12 h-12 rounded-full border-2 border-cyan-400"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          <div>
            <p className="font-semibold text-neutral-100">
              {user.displayName || user.email}
            </p>
            <p className="text-sm text-neutral-300 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Lifetime access linked to your account
            </p>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-8 py-4 bg-red-900/20 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Checkout Information */}
      <div className="px-8 py-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-neutral-100">
                Ready to Complete Your Purchase?
              </h3>
              <p className="text-neutral-300">
                Click below to proceed to Stripe's secure checkout page. You'll remain on our platform.
              </p>
            </div>

            <div className="bg-neutral-700 rounded-lg p-4 border border-neutral-600">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">CVPlus Premium</span>
                  <span className="font-semibold text-neutral-100">Lifetime Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-300">Price</span>
                  <span className="font-semibold text-neutral-100">{formattedPrice}</span>
                </div>
                <div className="border-t border-neutral-600 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-100">Total</span>
                    <span className="font-bold text-cyan-400 text-lg">{formattedPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Checkout Session...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Continue to Stripe Checkout
                  </>
                )}
              </button>

              <button
                onClick={onCancel}
                disabled={isProcessing}
                className="w-full text-neutral-400 hover:text-neutral-200 transition-colors py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="px-8 py-4 bg-neutral-700 border-t border-neutral-600">
        <div className="flex items-center justify-center gap-2 text-sm text-neutral-300">
          <Shield className="w-4 h-4 text-green-400" />
          <span>
            Secured by Stripe • Your payment information is encrypted and protected
          </span>
        </div>
      </div>

      {/* Important Notice */}
      <div className="px-8 py-4 bg-blue-900/20 border-t border-blue-600/30">
        <div className="text-center">
          <p className="text-sm text-blue-200">
            <strong>How it works:</strong> You'll be redirected to Stripe's secure checkout page. 
            After payment, you'll automatically return to CVPlus with your premium access activated.
          </p>
        </div>
      </div>
    </div>
  );
};