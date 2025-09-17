import { ReactNode } from 'react';
import { useFeatureAccess } from '../../hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';
import { Crown, Loader2 } from 'lucide-react';

type PremiumFeature = 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics';

interface FeatureGateProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
  className?: string;
}

export const FeatureGate = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradeMessage,
  className = ''
}: FeatureGateProps) => {
  const { hasAccess, isLoading, error } = useFeatureAccess(feature);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking access...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-700 text-sm">
          Unable to verify access: {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 underline hover:text-red-800 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  // Grant access if user has premium feature
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt by default
  if (showUpgradePrompt) {
    return (
      <div className={className}>
        <UpgradePrompt 
          feature={feature} 
          message={upgradeMessage}
        />
      </div>
    );
  }

  // Show nothing if no fallback and no upgrade prompt
  return null;
};

// Wrapper component for premium badges
interface PremiumBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumBadge = ({ className = '', size = 'md' }: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 bg-gradient-to-r from-purple-600 to-blue-600 
      text-white rounded-full font-semibold ${sizeClasses[size]} ${className}
    `}>
      <Crown className={iconSizes[size]} />
      PREMIUM
    </span>
  );
};

// Higher-order component for wrapping premium features
export const withPremiumAccess = (
  feature: PremiumFeature,
  upgradeMessage?: string
) => {
  return function PremiumWrapper<P extends object>(
    Component: React.ComponentType<P>
  ) {
    return function WrappedComponent(props: P) {
      return (
        <FeatureGate feature={feature} upgradeMessage={upgradeMessage}>
          <Component {...props} />
        </FeatureGate>
      );
    };
  };
};

// Helper component to conditionally show premium features
interface ConditionalPremiumProps {
  feature: PremiumFeature;
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConditionalPremium = ({
  feature,
  children,
  fallback = null
}: ConditionalPremiumProps) => {
  const { hasAccess, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};