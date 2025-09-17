import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import { createPaymentIntent, confirmPayment } from '../../services/paymentService';
import { Crown, Lock, CreditCard, Shield, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentFormContent = ({ onSuccess, onError, onCancel }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Create payment intent on backend
      const { clientSecret, paymentIntentId } = await createPaymentIntent({
        userId: user.uid,
        email: user.email!,
        googleId: user.providerData[0]?.uid || user.uid,
        amount: 500 // $5.00 in cents
      });

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: user.email,
            name: user.displayName || user.email?.split('@')[0]
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Confirm payment and upgrade user on backend
        await confirmPayment({
          paymentIntentId: result.paymentIntent.id,
          userId: user.uid,
          googleId: user.providerData[0]?.uid || user.uid
        });

        onSuccess();
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Crown className="w-8 h-8 text-white" />
          <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
        </div>
        <p className="text-purple-100 text-center">
          Get lifetime access to all premium features
        </p>
      </div>

      {/* Account Info */}
      <div className="px-8 py-6 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <img 
            src={user?.photoURL || '/default-avatar.png'} 
            alt={user?.displayName || 'User'} 
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-semibold text-gray-900">
              {user?.displayName || user?.email}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Linked to Google Account
            </p>
          </div>
        </div>
      </div>

      {/* Premium Features Summary */}
      <div className="px-8 py-6">
        <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
        <div className="grid gap-3">
          {[
            'Personal Web Portal with Custom URL',
            'AI Chat Assistant (RAG-powered)',
            'AI Career Podcast Generation',
            'Advanced Analytics Dashboard',
            'Priority Customer Support'
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="px-8 pb-8">
        {/* Price Display */}
        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-900 mb-1">$5.00</div>
            <div className="text-purple-700 font-semibold">LIFETIME ACCESS</div>
            <div className="text-sm text-purple-600 mt-2">
              One-time payment • No recurring charges • Cancel anytime
            </div>
          </div>
        </div>

        {/* Card Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Payment Method
          </label>
          <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
            <CardElement 
              options={cardElementOptions}
              onChange={(event) => {
                setCardComplete(event.complete);
                setPaymentError(event.error ? event.error.message : null);
              }}
            />
          </div>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{paymentError}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-xs text-gray-600 flex items-center gap-2">
            <Lock className="w-3 h-3" />
            Your payment is secured by Stripe. We never store your card information.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!stripe || !cardComplete || isLoading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5" />
                Pay $5 - Get Lifetime Access
              </>
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mt-4">
          By completing your purchase, you agree to our{' '}
          <a href="/terms" className="underline hover:text-gray-700">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
          30-day money-back guarantee.
        </p>
      </form>
    </div>
  );
};

export const StripePaymentForm = (props: StripePaymentFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};