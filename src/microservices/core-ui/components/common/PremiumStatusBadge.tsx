import React from 'react';
import { Crown, Sparkles, Loader2 } from 'lucide-react';
import { usePremiumIndicator } from '../../hooks/usePremiumStatus';

interface PremiumStatusBadgeProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
  showFeatureCount?: boolean;
}

export const PremiumStatusBadge: React.FC<PremiumStatusBadgeProps> = ({
  variant = 'default',
  className = '',
  showFeatureCount = false
}) => {
  const { isPremium, isLoading, statusText, statusColor, featureCount } = usePremiumIndicator();

  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
        {variant !== 'icon-only' && (
          <span className="text-xs text-gray-500">Checking...</span>
        )}
      </div>
    );
  }

  if (variant === 'icon-only') {
    return isPremium ? (
      <div className={`inline-flex items-center justify-center w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full ${className}`}>
        <Crown className="w-3 h-3 text-yellow-900" />
      </div>
    ) : null;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        {isPremium ? (
          <>
            <Crown className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-800">Premium</span>
          </>
        ) : (
          <span className="text-xs text-gray-600">Free</span>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
      isPremium 
        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-300'
        : 'bg-gray-100 border border-gray-200'
    } ${className}`}>
      <div className="flex items-center gap-1">
        {isPremium ? (
          <>
            <Crown className="w-4 h-4 text-yellow-700" />
            <Sparkles className="w-3 h-3 text-yellow-600" />
          </>
        ) : (
          <div className="w-4 h-4 bg-gray-400 rounded-full" />
        )}
        <span className={`text-sm font-medium ${
          isPremium ? 'text-yellow-800' : 'text-gray-700'
        }`}>
          {statusText}
        </span>
      </div>
      
      {showFeatureCount && isPremium && (
        <span className="text-xs text-yellow-700 bg-yellow-300 px-2 py-0.5 rounded-full">
          {featureCount} features
        </span>
      )}
    </div>
  );
};