import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Crown, Shield, ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { AuthenticationRequired } from './AuthenticationRequired';
import toast from 'react-hot-toast';

interface StripeCheckoutRedirectProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const StripeCheckoutRedirect = ({ onSuccess, onError, onCancel }: StripeCheckoutRedirectProps) => {
  const { user } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Stripe Checkout URL - this should redirect directly to Stripe
  const stripeCheckoutUrl = 'https://buy.stripe.com/14AfZ9bna72qfXvfxX4F200';

  // Handle direct redirect to Stripe Checkout
  const handleRedirectToStripe = () => {
    if (!user) {
      onError('Please sign in to continue with payment');
      return;
    }

    setIsRedirecting(true);
    toast.success('Redirecting to secure Stripe checkout...');

    // Add user email to Stripe checkout if possible
    const checkoutUrlWithEmail = `${stripeCheckoutUrl}?prefilled_email=${encodeURIComponent(user.email || '')}`;
    
    // Redirect to Stripe Checkout in the same window
    window.location.href = checkoutUrlWithEmail;
  };

  // Auto countdown for redirect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto redirect after countdown
      handleRedirectToStripe();
    }
  }, [countdown]);

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
            disabled={isRedirecting}
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

      {/* Checkout Information */}
      <div className="px-8 py-8 text-center">
        <div className="max-w-md mx-auto">
          {isRedirecting ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-100">
                Redirecting to Stripe Checkout...
              </h3>
              <p className="text-neutral-300">
                You'll be redirected to Stripe's secure payment page in a moment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-neutral-100">
                  Ready to Complete Your Purchase?
                </h3>
                <p className="text-neutral-300">
                  You'll be redirected to Stripe's secure checkout page to complete your payment.
                  Auto-redirecting in {countdown} seconds...
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
                    <span className="font-semibold text-neutral-100">$49.00</span>
                  </div>
                  <div className="border-t border-neutral-600 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-100">Total</span>
                      <span className="font-bold text-cyan-400 text-lg">$49.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleRedirectToStripe}
                  disabled={isRedirecting}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Continue to Stripe Checkout
                </button>

                <button
                  onClick={onCancel}
                  disabled={isRedirecting}
                  className="w-full text-neutral-400 hover:text-neutral-200 transition-colors py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
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
      <div className="px-8 py-4 bg-yellow-900/20 border-t border-yellow-600/30">
        <div className="text-center">
          <p className="text-sm text-yellow-200">
            <strong>Important:</strong> After completing payment on Stripe, please return to this page. 
            Your premium access will be activated automatically.
          </p>
        </div>
      </div>
    </div>
  );
};