import React from 'react';
import { CheckCircle, Circle, Crown, Lock, HelpCircle } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { isPremiumFeature, canAccessFeature, getPremiumTypeForFeature } from '../config/premiumFeatures';

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'enhancement' | 'advanced';
  icon: string;
  defaultEnabled: boolean;
}

interface FeatureCardProps {
  feature: FeatureOption;
  isSelected: boolean;
  onToggle: (featureId: string, enabled: boolean) => void;
  onUpgradePrompt?: (premiumType: string) => void;
  enforceRestrictions?: boolean;
  isRoleOptimized?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  isSelected,
  onToggle,
  onUpgradePrompt,
  enforceRestrictions = true,
  isRoleOptimized = false
}) => {
  const { isPremium: _isPremium, features: userPremiumFeatures } = usePremiumStatus();
  const isPremiumFeatureItem = isPremiumFeature(feature.id);
  const canAccess = canAccessFeature(feature.id, userPremiumFeatures);
  const premiumType = getPremiumTypeForFeature(feature.id);
  const isRestricted = isPremiumFeatureItem && !canAccess;

  const handleToggle = () => {
    if (isRestricted && enforceRestrictions) {
      // Show upgrade prompt instead of toggling
      if (onUpgradePrompt) {
        onUpgradePrompt(premiumType);
      }
      return;
    }
    onToggle(feature.id, !isSelected);
  };

  const getCategoryColor = () => {
    switch (feature.category) {
      case 'core':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      case 'enhancement':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'advanced':
        return 'text-purple-400 bg-purple-900/20 border-purple-500/30';
      default:
        return 'text-gray-400 bg-gray-700/20 border-gray-500/30';
    }
  };

  return (
    <div
      className={`group relative p-4 lg:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected && canAccess
          ? 'border-cyan-400 bg-cyan-900/20 shadow-lg shadow-cyan-500/10'
          : isRestricted && enforceRestrictions
          ? 'border-gray-600 bg-gray-800/20 hover:border-yellow-400/50'
          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500 hover:bg-gray-700/50'
      }`}
      onClick={handleToggle}
    >
      {/* Category Badge */}
      <div className="absolute top-3 right-3">
        <div className={`text-xs px-2 py-1 rounded-md border ${getCategoryColor()}`}>
          {feature.category}
        </div>
      </div>

      {/* Role-Optimized Badge */}
      {isRoleOptimized && (
        <div className="absolute top-3 left-3">
          <div className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs px-2 py-1 rounded-md font-medium">
            Recommended
          </div>
        </div>
      )}

      {/* Premium Badge */}
      {isPremiumFeatureItem && (
        <div className="absolute top-12 right-3">
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md font-medium ${
            canAccess
              ? 'bg-yellow-500/20 border border-yellow-400/30 text-yellow-300'
              : 'bg-gray-600/20 border border-gray-500/30 text-gray-400'
          }`}>
            <Crown className="w-3 h-3" />
            Premium
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex items-start space-x-3 lg:space-x-4 mt-6 lg:mt-8">
        {/* Selection Indicator */}
        <div className="flex-shrink-0 mt-0.5 lg:mt-1">
          {isSelected && canAccess ? (
            <CheckCircle className="w-6 h-6 text-cyan-400" />
          ) : isRestricted ? (
            <Lock className="w-6 h-6 text-gray-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 group-hover:text-gray-300" />
          )}
        </div>

        {/* Feature Info */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
            <span className="text-xl lg:text-2xl flex-shrink-0">{feature.icon}</span>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className={`font-semibold text-base lg:text-lg leading-tight ${
                isSelected && canAccess
                  ? 'text-cyan-100'
                  : isRestricted
                  ? 'text-gray-400'
                  : 'text-gray-100 group-hover:text-white'
              }`}>
                {feature.name}
              </h3>
            </div>
          </div>
          
          <p className={`text-xs lg:text-sm leading-relaxed mb-2 lg:mb-3 ${
            isSelected && canAccess
              ? 'text-cyan-200'
            : isRestricted
              ? 'text-gray-500'
              : 'text-gray-400 group-hover:text-gray-300'
          }`}>
            {feature.description}
          </p>

          {/* Premium Lock Actions */}
          {isRestricted && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onUpgradePrompt) {
                    onUpgradePrompt(premiumType);
                  }
                }}
                className="text-sm text-yellow-400 hover:text-yellow-300 underline transition-colors"
              >
                Upgrade to unlock this feature
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Show feature info/demo
                }}
                className="text-gray-500 hover:text-gray-400 transition-colors"
                title="Learn more about this feature"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Feature Benefits (for premium features) */}
          {isPremiumFeatureItem && canAccess && (
            <div className="mt-2 text-xs text-yellow-300 bg-yellow-500/10 px-2 py-1 rounded-md">
              ✨ Premium feature unlocked
            </div>
          )}
        </div>
      </div>
    </div>
  );
};