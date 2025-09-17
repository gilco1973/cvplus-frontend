/**
 * TypeScript type definitions for Premium feature system
 * Supports the PremiumGate component and related premium functionality
 */

/**
 * Premium feature identifiers - IMPORTED FROM MASTER DEFINITION
 * These correspond to the feature flags in the subscription system
 * @deprecated Import from @cvplus/premium/types instead
 */
export type { PremiumFeature } from '@cvplus/premium/types/premium-features';

/**
 * Analytics event types for premium gate interactions
 */
export type PremiumGateAnalyticsEvent = 
  | 'upgrade_prompt_shown'
  | 'upgrade_prompt_clicked'
  | 'feature_access_denied'
  | 'preview_interacted'
  | 'fallback_rendered';

/**
 * Analytics event data structure
 */
export interface PremiumGateAnalyticsData {
  feature: PremiumFeature | string;
  title?: string;
  component?: string;
  context?: string;
  jobId?: string;
  userId?: string;
  timestamp?: number;
  error?: string;
  errorType?: string;
  [key: string]: any;
}

/**
 * Configuration for feature-specific premium gates
 */
export interface FeaturePremiumGateConfig {
  /** The premium feature identifier */
  feature: PremiumFeature;
  /** Display title for upgrade prompts */
  title: string;
  /** Descriptive text explaining the feature */
  description: string;
  /** Whether to show a preview of the feature */
  showPreview?: boolean;
  /** Preview opacity (0-1) */
  previewOpacity?: number;
  /** Additional configuration options */
  config?: {
    /** Custom upgrade prompt messaging */
    upgradePrompt?: {
      headline?: string;
      benefits?: string[];
      ctaText?: string;
    };
    /** Preview configuration */
    preview?: {
      /** Whether preview is interactive */
      interactive?: boolean;
      /** Custom overlay content */
      overlayContent?: string;
      /** Preview limitations to display */
      limitations?: string[];
    };
    /** Analytics configuration */
    analytics?: {
      /** Custom event tracking */
      customEvents?: string[];
      /** Additional context data */
      context?: Record<string, any>;
    };
  };
}

/**
 * Premium gate display variants
 */
export type PremiumGateVariant = 'default' | 'compact' | 'inline' | 'modal' | 'banner';

/**
 * Premium subscription status
 */
export interface PremiumSubscriptionStatus {
  /** Whether user has any premium access */
  isPremium: boolean;
  /** Current subscription tier */
  tier: 'free' | 'premium' | 'lifetime';
  /** Individual feature access flags */
  features: Record<PremiumFeature, boolean>;
  /** Subscription metadata */
  metadata?: {
    purchasedAt?: Date;
    expiresAt?: Date;
    autoRenew?: boolean;
    planId?: string;
  };
  /** Usage statistics */
  usage?: {
    currentMonthUploads: number;
    remainingUploads: number;
    totalFeatureUsage: Record<PremiumFeature, number>;
  };
}

/**
 * Premium feature access check result
 */
export interface FeatureAccessResult {
  /** Whether user has access to the specific feature */
  hasAccess: boolean;
  /** Overall premium status */
  isPremium: boolean;
  /** Loading state */
  isLoading: boolean;
  /** All available features */
  allFeatures: Record<string, boolean>;
  /** Reason for access denial (if applicable) */
  denialReason?: 'no_subscription' | 'feature_not_included' | 'usage_limit_exceeded' | 'subscription_expired';
  /** Upgrade recommendations */
  upgradeRecommendation?: {
    requiredTier: 'premium' | 'lifetime';
    estimatedCost?: number;
    benefits?: string[];
  };
}

/**
 * Premium gate component props base interface
 */
export interface BasePremiumGateProps {
  /** The premium content to gate */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom fallback component for non-premium users */
  fallback?: React.ReactNode;
  /** Analytics event handler */
  onAnalyticsEvent?: (event: PremiumGateAnalyticsEvent, data?: PremiumGateAnalyticsData) => void;
  /** Callback when user tries to access locked feature */
  onAccessDenied?: () => void;
  /** Display variant */
  variant?: PremiumGateVariant;
}

/**
 * Feature-specific premium gate props
 */
export interface FeaturePremiumGateProps extends BasePremiumGateProps {
  /** Feature configuration */
  featureConfig?: Partial<FeaturePremiumGateConfig>;
}

/**
 * Premium upgrade prompt configuration
 */
export interface UpgradePromptConfig {
  /** Prompt title */
  title: string;
  /** Prompt description */
  description: string;
  /** Benefits list */
  benefits?: string[];
  /** Call-to-action text */
  ctaText?: string;
  /** Pricing information */
  pricing?: {
    amount: number;
    currency: string;
    period?: 'monthly' | 'yearly' | 'lifetime';
  };
  /** Visual elements */
  visual?: {
    icon?: React.ComponentType;
    illustration?: string;
    gradient?: string;
  };
}

/**
 * Premium feature usage statistics
 */
export interface PremiumFeatureUsage {
  feature: PremiumFeature;
  usageCount: number;
  lastUsed?: Date;
  limitations?: {
    maxUsage?: number;
    resetPeriod?: 'daily' | 'weekly' | 'monthly';
    currentPeriodUsage: number;
  };
}

/**
 * Premium gate context for provider pattern
 */
export interface PremiumGateContext {
  /** Global premium status */
  subscriptionStatus: PremiumSubscriptionStatus;
  /** Check access to specific feature */
  checkFeatureAccess: (feature: PremiumFeature) => FeatureAccessResult;
  /** Track analytics event */
  trackAnalyticsEvent: (event: PremiumGateAnalyticsEvent, data?: PremiumGateAnalyticsData) => void;
  /** Refresh premium status */
  refreshStatus: () => Promise<void>;
  /** Feature usage statistics */
  getFeatureUsage: (feature: PremiumFeature) => PremiumFeatureUsage | null;
}

/**
 * Error types for premium system
 */
export type PremiumSystemError = 
  | 'subscription_check_failed'
  | 'feature_access_denied'
  | 'usage_limit_exceeded'
  | 'subscription_expired'
  | 'payment_failed'
  | 'network_error'
  | 'unknown_error';

/**
 * Premium system error with details
 */
export interface PremiumError {
  type: PremiumSystemError;
  message: string;
  feature?: PremiumFeature;
  retryable: boolean;
  details?: Record<string, any>;
}

/**
 * Premium gate configuration presets
 */
export const PREMIUM_GATE_PRESETS: Record<string, FeaturePremiumGateConfig> = {
  EXTERNAL_DATA_SOURCES: {
    feature: 'externalDataSources',
    title: 'External Data Sources',
    description: 'Import and sync data from LinkedIn, GitHub, and other professional platforms to enhance your CV automatically.',
    showPreview: true,
    previewOpacity: 0.3,
    config: {
      upgradePrompt: {
        headline: 'Supercharge Your CV with External Data',
        benefits: [
          'Automatic LinkedIn profile sync',
          'GitHub repository integration',
          'Professional certification imports',
          'Real-time data updates'
        ],
        ctaText: 'Unlock External Data Sources'
      },
      preview: {
        interactive: false,
        overlayContent: 'Connect your professional profiles to automatically enhance your CV',
        limitations: [
          'Manual data entry required',
          'No automatic updates',
          'Limited integration options'
        ]
      }
    }
  },
  
  ADVANCED_ANALYTICS: {
    feature: 'advancedAnalytics',
    title: 'Advanced Analytics',
    description: 'Get detailed insights about your CV performance, skill analysis, and improvement recommendations.',
    showPreview: true,
    previewOpacity: 0.2,
    config: {
      upgradePrompt: {
        headline: 'Unlock Powerful CV Analytics',
        benefits: [
          'Detailed performance metrics',
          'Skill gap analysis',
          'Industry benchmarking',
          'Optimization recommendations'
        ]
      }
    }
  },
  
  AI_INSIGHTS: {
    feature: 'aiInsights',
    title: 'AI-Powered Insights',
    description: 'Receive personalized recommendations and AI-driven suggestions to optimize your professional profile.',
    showPreview: false,
    config: {
      upgradePrompt: {
        headline: 'Get AI-Powered Career Insights',
        benefits: [
          'Personalized improvement suggestions',
          'Industry-specific recommendations',
          'Career path optimization',
          'Content quality analysis'
        ]
      }
    }
  },
  
  MULTIMEDIA_FEATURES: {
    feature: 'multimediaFeatures',
    title: 'Multimedia Features',
    description: 'Create video introductions, portfolio galleries, and interactive content to stand out from the crowd.',
    showPreview: true,
    previewOpacity: 0.4,
    config: {
      upgradePrompt: {
        headline: 'Stand Out with Multimedia Content',
        benefits: [
          'Video introduction creation',
          'Interactive portfolio galleries',
          'Audio presentation generation',
          'Rich media integrations'
        ]
      }
    }
  }
};

export default {
  PREMIUM_GATE_PRESETS
};