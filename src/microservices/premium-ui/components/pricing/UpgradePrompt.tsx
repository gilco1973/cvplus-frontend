import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight, X } from 'lucide-react';
import { formatFeatureName } from '../../services/paymentService';
import { getTierConfig, formatPrice } from '../../config/pricing';

type PremiumFeature = 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics';

interface UpgradePromptProps {
  feature: PremiumFeature;
  message?: string;
  variant?: 'card' | 'modal' | 'inline';
  onClose?: () => void;
  className?: string;
}

const featureDescriptions: Record<PremiumFeature, string> = {
  webPortal: 'Get your own professional website with custom URL, automatically deployed and ready to share',
  aiChat: 'Interactive AI assistant that knows your professional background and can answer questions about your experience',
  podcast: 'AI-generated career podcast highlighting your achievements, perfect for sharing or networking',
  advancedAnalytics: 'Detailed insights into CV views, downloads, and engagement metrics to track your success'
};

const featureEmojis: Record<PremiumFeature, string> = {
  webPortal: '🌐',
  aiChat: '💬', 
  podcast: '🎙️',
  advancedAnalytics: '📊'
};

export const UpgradePrompt = ({
  feature,
  message,
  variant = 'card',
  onClose,
  className = ''
}: UpgradePromptProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const premiumConfig = getTierConfig('PREMIUM');
  const priceText = formatPrice(premiumConfig.price);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const defaultMessage = `Unlock ${formatFeatureName(feature)} with Premium`;

  if (variant === 'modal') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="text-center">
              <div className="text-4xl mb-2">{featureEmojis[feature]}</div>
              <h3 className="text-xl font-bold text-white">
                {formatFeatureName(feature)}
              </h3>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message || featureDescriptions[feature]}
            </p>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900 mb-1">{priceText} Lifetime</div>
                <div className="text-sm text-purple-700">One-time payment • All premium features</div>
              </div>
            </div>

            <button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5" />
              Get Lifetime Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg ${className}`}>
        <div className="flex-shrink-0">
          <Crown className="w-5 h-5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-purple-800 font-medium">
            {message || defaultMessage}
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          className="flex-shrink-0 text-purple-600 hover:text-purple-800 font-semibold text-sm flex items-center gap-1"
        >
          Upgrade <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Default card variant
  return (
    <div 
      className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center transition-all duration-300 ${
        isHovered ? 'border-purple-400 shadow-lg scale-[1.02]' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Feature Icon */}
      <div className="text-6xl mb-4">{featureEmojis[feature]}</div>

      {/* Feature Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {formatFeatureName(feature)}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed max-w-sm mx-auto">
        {message || featureDescriptions[feature]}
      </p>

      {/* Premium Badge */}
      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-purple-200 mb-6">
        <Crown className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-800">PREMIUM FEATURE</span>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-purple-200">
        <div className="text-3xl font-bold text-gray-900 mb-1">{priceText}</div>
        <div className="text-purple-700 font-semibold">Lifetime Access</div>
        <div className="text-sm text-gray-500 mt-1">One-time payment • All premium features</div>
      </div>

      {/* Upgrade Button */}
      <button
        onClick={handleUpgrade}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        Get Lifetime Access
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* Benefits */}
      <div className="mt-6 text-sm text-gray-500">
        ✨ Instant activation • 💳 Secure payment • 🔒 Lifetime guarantee
      </div>
    </div>
  );
};