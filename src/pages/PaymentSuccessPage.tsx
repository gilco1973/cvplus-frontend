import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { CheckCircle, Crown, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentSuccessPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isLifetimePremium, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get session_id from URL params (Stripe provides this)
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    const verifyPayment = async () => {
      if (canceled) {
        toast.error(t('paymentSuccess.error.paymentCanceled'));
        navigate('/pricing');
        return;
      }

      if (!user) {
        toast.error(t('paymentSuccess.error.authRequired'));
        navigate('/pricing');
        return;
      }

      if (success === 'true' || sessionId) {
        try {
          // Wait a bit for Stripe webhook to process
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Refresh subscription status
          await refreshSubscription();
          
          setIsVerifying(false);
          setVerificationComplete(true);
          
          if (isLifetimePremium) {
            toast.success(t('paymentSuccess.success.welcomePremium'));
          } else {
            // If premium status not updated yet, check again in a few seconds
            setTimeout(async () => {
              await refreshSubscription();
              if (isLifetimePremium) {
                toast.success(t('paymentSuccess.success.premiumActivated'));
              }
            }, 3000);
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setError(t('paymentSuccess.error.verificationFailed'));
          setIsVerifying(false);
        }
      } else {
        setError(t('paymentSuccess.error.invalidParameters'));
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [user, sessionId, success, canceled, navigate, refreshSubscription, isLifetimePremium]);

  const handleContinue = () => {
    // Redirect to main app or user dashboard
    navigate('/');
  };

  const handleContactSupport = () => {
    // Redirect to support/contact page
    navigate('/faq');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-4">{t('paymentSuccess.authRequired.title')}</h1>
          <p className="text-gray-300 mb-6">{t('paymentSuccess.authRequired.description')}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t('paymentSuccess.authRequired.goToPricing')}
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-4">{t('paymentSuccess.error.title')}</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleContactSupport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {t('paymentSuccess.actions.contactSupport')}
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full text-gray-400 hover:text-gray-200 transition-colors py-2"
            >
              {t('paymentSuccess.actions.backToPricing')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-4">{t('paymentSuccess.verification.title')}</h1>
          <p className="text-gray-300 mb-4">
            {t('paymentSuccess.verification.description')}
          </p>
          <p className="text-sm text-gray-400">
            {t('paymentSuccess.verification.pleaseWait')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="relative">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <Crown className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-100 mb-4">
          {t('paymentSuccess.success.title')}
        </h1>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-300">
            {t('paymentSuccess.success.description')}
          </p>
          
          {isLifetimePremium ? (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-200 text-sm">
                ✅ {t('paymentSuccess.success.statusConfirmed')}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                ⏳ {t('paymentSuccess.success.statusPending')}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100">
            {t('paymentSuccess.success.whatsNext')}
          </h3>
          
          <div className="text-left space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{t('paymentSuccess.benefits.webPortal')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{t('paymentSuccess.benefits.aiPodcasts')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{t('paymentSuccess.benefits.analytics')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span>{t('paymentSuccess.benefits.removeBranding')}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={handleContinue}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>{t('paymentSuccess.actions.startUsing')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-xs text-gray-400">
            {t('paymentSuccess.support.questionsPrefix')}{' '}
            <button
              onClick={handleContactSupport}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {t('paymentSuccess.support.supportPage')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};