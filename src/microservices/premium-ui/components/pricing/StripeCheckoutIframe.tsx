import { useAuth } from '../../contexts/AuthContext';
import { Crown, Shield, ArrowLeft } from 'lucide-react';
import { useStripeCheckout } from '../../hooks/useStripeCheckout';
import { LoadingOverlay } from './LoadingOverlay';
import { ProcessingOverlay } from './ProcessingOverlay';
import { ErrorState } from './ErrorState';
import { AuthenticationRequired } from './AuthenticationRequired';

interface StripeCheckoutIframeProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const StripeCheckoutIframe = ({ onSuccess, onError, onCancel }: StripeCheckoutIframeProps) => {
  const { user } = useAuth();
  const {
    isLoading,
    isProcessing,
    hasError,
    isRetrying,
    iframeHeight,
    iframeRef,
    stripeCheckoutUrl,
    handleIframeLoad,
    handleIframeError,
    handleRetry
  } = useStripeCheckout({ onSuccess, onError });

  if (!user) {
    return <AuthenticationRequired onCancel={onCancel} />;
  }

  return (
    <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700 overflow-hidden">
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

      {/* Payment Form Container */}
      <div className="relative">
        <LoadingOverlay isVisible={isLoading} />
        <ProcessingOverlay isVisible={isProcessing} />
        <ErrorState 
          isVisible={hasError}
          isRetrying={isRetrying}
          onCancel={onCancel}
          onRetry={handleRetry}
        />

        {/* Stripe Iframe */}
        {!hasError && (
          <iframe
            ref={iframeRef}
            src={stripeCheckoutUrl}
            className="w-full border-0 bg-white"
            style={{ height: `${iframeHeight}px` }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Stripe Checkout"
            allow="payment"
            sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
          />
        )}
      </div>

      {/* Security Notice */}
      {!hasError && (
        <div className="px-8 py-4 bg-neutral-700 border-t border-neutral-600">
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-300">
            <Shield className="w-4 h-4 text-green-400" />
            <span>
              Secured by Stripe • Your payment information is encrypted and protected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};