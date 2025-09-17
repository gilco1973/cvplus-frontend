import React from 'react';
import { Crown, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePremiumPrompt } from '../../hooks/usePremiumStatus';
import { getTierConfig, formatPrice } from '../../config/pricing';

interface PremiumUpgradePromptProps {
  feature?: string;
  context?: string;
  className?: string;
  variant?: 'banner' | 'card' | 'inline';
  showCloseButton?: boolean;
}

export const PremiumUpgradePrompt: React.FC<PremiumUpgradePromptProps> = ({
  feature,
  context = 'this feature',
  className = '',
  variant = 'banner',
  showCloseButton = true
}) => {
  const navigate = useNavigate();
  const { shouldShowPrompt, dismissPrompt, isPremium } = usePremiumPrompt();
  const premiumConfig = getTierConfig('PREMIUM');
  const priceText = formatPrice(premiumConfig.price);

  // Don't show for premium users or when prompt is dismissed
  if (isPremium || !shouldShowPrompt) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/pricing');
    dismissPrompt();
  };

  const handleDismiss = () => {
    dismissPrompt();
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'banner':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4';
      case 'card':
        return 'bg-white border border-yellow-200 rounded-xl p-6 shadow-lg';
      case 'inline':
        return 'bg-yellow-50 border border-yellow-200 rounded-lg p-3';
      default:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4';
    }
  };

  return (
    <div className={`relative ${getVariantClasses()} ${className}`}>
      {showCloseButton && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 rounded-full transition-colors"
          aria-label="Dismiss upgrade prompt"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
            <Crown className="w-4 h-4 text-yellow-900" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-yellow-900">
              Unlock {feature || context} with Premium
            </h3>
            <Sparkles className="w-4 h-4 text-yellow-600" />
          </div>
          
          <p className="text-sm text-yellow-800 mb-3">
            Get lifetime access to all premium features for just {priceText}. 
            {feature && (
              <span className="font-medium">
                {` ${feature} `}
              </span>
            )}
            is included in our Premium package.
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpgrade}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
            >
              <Crown className="w-4 h-4" />
              Upgrade for {priceText}
            </button>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-yellow-700 hover:text-yellow-900 font-medium"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact inline premium prompt for feature-specific contexts
 */
export const InlinePremiumPrompt: React.FC<{ feature: string; className?: string }> = ({ 
  feature, 
  className = '' 
}) => {
  return (
    <PremiumUpgradePrompt
      feature={feature}
      variant="inline"
      className={className}
      showCloseButton={false}
    />
  );
};

/**
 * Card-style premium prompt for prominent placement
 */
export const PremiumPromptCard: React.FC<{ feature?: string; className?: string }> = ({ 
  feature, 
  className = '' 
}) => {
  return (
    <PremiumUpgradePrompt
      feature={feature}
      variant="card"
      className={className}
      showCloseButton={true}
    />
  );
};