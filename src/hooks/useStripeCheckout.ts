import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface StripeCheckoutHookProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface StripeMessage {
  type: string;
  error?: {
    message?: string;
  };
  height?: number;
}

export const useStripeCheckout = ({ onSuccess, onError }: StripeCheckoutHookProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(600);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const stripeCheckoutUrl = 'https://buy.stripe.com/14AfZ9bna72qfXvfxX4F200';

  // Handle iframe loading state
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Handle iframe loading errors
  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError('Failed to load payment form. Please try again.');
  };

  // Handle payment completion messages from Stripe
  const handleMessage = (event: MessageEvent) => {
    // Verify origin for security
    if (!event.origin.includes('stripe.com')) {
      return;
    }

    const data: StripeMessage = event.data;
    
    // Handle different Stripe events
    if (data.type === 'stripe_checkout_session_complete') {
      setIsProcessing(true);
      toast.success('Payment successful! Processing your upgrade...');
      
      // Delay to allow backend processing
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else if (data.type === 'stripe_checkout_session_error') {
      setIsProcessing(false);
      const errorMessage = data.error?.message || 'Payment failed. Please try again.';
      onError(errorMessage);
    } else if (data.type === 'stripe_iframe_height') {
      // Dynamically adjust iframe height
      if (data.height && typeof data.height === 'number') {
        setIframeHeight(Math.max(400, Math.min(800, data.height)));
      }
    }
  };

  // Retry loading the iframe
  const handleRetry = () => {
    setIsRetrying(true);
    setHasError(false);
    setIsLoading(true);
    
    // Force reload iframe by changing src
    if (iframeRef.current) {
      const timestamp = Date.now();
      iframeRef.current.src = `${stripeCheckoutUrl}?t=${timestamp}`;
    }
    
    setTimeout(() => setIsRetrying(false), 1000);
  };

  // Set up message listener for Stripe events
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
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
  };
};