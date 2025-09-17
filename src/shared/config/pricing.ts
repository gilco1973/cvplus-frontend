/**
 * Centralized Pricing Configuration System for CVPlus
 * 
 * This module provides a single source of truth for all pricing-related information
 * across the application. It includes type-safe interfaces, environment-based 
 * configuration, validation functions, and display formatting utilities.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @created 2025-08-20
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Supported subscription tiers
 */
export type SubscriptionTier = 'FREE' | 'PREMIUM';

/**
 * Supported currencies
 */
export type Currency = 'USD' | 'EUR' | 'GBP';

/**
 * Environment types for different pricing configurations
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Billing period types
 */
export type BillingPeriod = 'one-time' | 'monthly' | 'yearly' | 'forever';

/**
 * Feature availability configuration
 */
export interface FeatureConfig {
  /** Unique feature identifier */
  id: string;
  /** Human-readable feature name */
  name: string;
  /** Detailed feature description */
  description: string;
  /** Whether this is a premium-only feature */
  isPremium: boolean;
  /** Feature category for grouping */
  category: 'core' | 'ai' | 'export' | 'analytics' | 'customization' | 'support';
}

/**
 * Stripe price configuration for different environments
 */
export interface StripePriceConfig {
  /** Development environment price ID */
  development: string;
  /** Staging environment price ID */
  staging: string;
  /** Production environment price ID */
  production: string;
}

/**
 * Price configuration with multiple currency support
 */
export interface PriceConfig {
  /** Price in cents (to avoid floating point issues) */
  cents: number;
  /** Price in dollars (for display) */
  dollars: number;
  /** Currency code */
  currency: Currency;
  /** Stripe price IDs for different environments */
  stripeConfig: StripePriceConfig;
}

/**
 * Complete tier configuration
 */
export interface TierConfig {
  /** Tier identifier */
  tier: SubscriptionTier;
  /** Display name */
  name: string;
  /** Marketing subtitle */
  subtitle: string;
  /** Detailed description */
  description: string;
  /** Price configuration */
  price: PriceConfig;
  /** Billing information */
  billing: {
    period: BillingPeriod;
    displayText: string;
  };
  /** Available features for this tier */
  features: string[];
  /** Feature IDs that are included */
  includedFeatures: string[];
  /** UI configuration */
  ui: {
    buttonText: string;
    buttonVariant: 'primary' | 'outline' | 'disabled';
    badge?: string;
    popular: boolean;
    highlightColor: string;
  };
  /** Whether this tier is currently available */
  isActive: boolean;
}

/**
 * Complete pricing configuration
 */
export interface PricingConfig {
  /** All available tiers */
  tiers: Record<SubscriptionTier, TierConfig>;
  /** All available features */
  features: Record<string, FeatureConfig>;
  /** Default currency */
  defaultCurrency: Currency;
  /** Current environment */
  environment: Environment;
  /** Configuration metadata */
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
  };
}

// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

/**
 * Complete feature registry with all CVPlus features
 */
export const FEATURES: Record<string, FeatureConfig> = {
  // Core Features
  CV_ANALYSIS: {
    id: 'CV_ANALYSIS',
    name: 'AI CV Analysis & Enhancement',
    description: 'Advanced AI-powered analysis of your CV with improvement suggestions',
    isPremium: false,
    category: 'ai'
  },
  CV_TEMPLATES: {
    id: 'CV_TEMPLATES',
    name: 'Professional CV Templates',
    description: 'Access to professional, industry-specific CV templates',
    isPremium: false,
    category: 'core'
  },
  ATS_OPTIMIZATION: {
    id: 'ATS_OPTIMIZATION',
    name: 'ATS Optimization & Scoring',
    description: 'Optimize your CV for Applicant Tracking Systems with scoring',
    isPremium: false,
    category: 'ai'
  },
  SKILLS_VISUALIZATION: {
    id: 'SKILLS_VISUALIZATION',
    name: 'Skills Visualization Charts',
    description: 'Interactive charts and graphs to visualize your skills',
    isPremium: false,
    category: 'core'
  },
  INTERACTIVE_TIMELINE: {
    id: 'INTERACTIVE_TIMELINE',
    name: 'Interactive Career Timeline',
    description: 'Dynamic timeline showcasing your career progression',
    isPremium: false,
    category: 'core'
  },
  BASIC_QR_CODE: {
    id: 'BASIC_QR_CODE',
    name: 'Basic QR Code Generation',
    description: 'Generate QR codes linking to your CV or profile',
    isPremium: false,
    category: 'core'
  },
  PORTFOLIO_GALLERY: {
    id: 'PORTFOLIO_GALLERY',
    name: 'Portfolio Gallery',
    description: 'Showcase your work with an integrated portfolio gallery',
    isPremium: false,
    category: 'core'
  },
  MULTI_FORMAT_EXPORT: {
    id: 'MULTI_FORMAT_EXPORT',
    name: 'Multi-format Export (PDF, DOCX, HTML)',
    description: 'Export your CV in multiple formats for different use cases',
    isPremium: false,
    category: 'export'
  },
  BASIC_ANALYTICS: {
    id: 'BASIC_ANALYTICS',
    name: 'Basic Analytics & Tracking',
    description: 'Basic insights into your CV views and engagement',
    isPremium: false,
    category: 'analytics'
  },

  // Premium Features
  WEB_PORTAL: {
    id: 'WEB_PORTAL',
    name: 'Personal Web Portal (Custom URL)',
    description: 'Your own branded web portal with custom URL for professional networking',
    isPremium: true,
    category: 'customization'
  },
  AI_CHAT_ASSISTANT: {
    id: 'AI_CHAT_ASSISTANT',
    name: 'AI Chat Assistant (RAG-powered)',
    description: 'Intelligent AI assistant powered by Retrieval-Augmented Generation',
    isPremium: true,
    category: 'ai'
  },
  AI_PODCAST: {
    id: 'AI_PODCAST',
    name: 'AI Career Podcast Generation',
    description: 'Generate personalized career podcasts using AI technology',
    isPremium: true,
    category: 'ai'
  },
  ADVANCED_ANALYTICS: {
    id: 'ADVANCED_ANALYTICS',
    name: 'Advanced Analytics Dashboard',
    description: 'Comprehensive analytics with detailed insights and reporting',
    isPremium: true,
    category: 'analytics'
  },
  PRIORITY_SUPPORT: {
    id: 'PRIORITY_SUPPORT',
    name: 'Priority Customer Support',
    description: 'Get priority support with faster response times',
    isPremium: true,
    category: 'support'
  },
  REMOVE_BRANDING: {
    id: 'REMOVE_BRANDING',
    name: 'Remove CVPlus Branding',
    description: 'Remove CVPlus branding for a fully personalized experience',
    isPremium: true,
    category: 'customization'
  },
  VIDEO_INTRODUCTION: {
    id: 'VIDEO_INTRODUCTION',
    name: 'AI Video Introduction Generation',
    description: 'Generate professional video introductions using AI',
    isPremium: true,
    category: 'ai'
  },
  ADVANCED_QR_CODE: {
    id: 'ADVANCED_QR_CODE',
    name: 'Advanced QR Code Customization',
    description: 'Customizable QR codes with branding and analytics tracking',
    isPremium: true,
    category: 'customization'
  }
};

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

/**
 * Get current environment from environment variables
 */
const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.MODE;
  switch (env) {
    case 'development':
      return 'development';
    case 'staging':
      return 'staging';
    case 'production':
      return 'production';
    default:
      return 'development'; // Default fallback
  }
};

/**
 * Stripe Price IDs for different environments
 * TODO: Replace with actual Stripe price IDs for each environment
 */
const STRIPE_PRICE_IDS: StripePriceConfig = {
  development: import.meta.env.VITE_STRIPE_PRICE_ID_DEV || 'price_dev_placeholder',
  staging: import.meta.env.VITE_STRIPE_PRICE_ID_STAGING || 'price_staging_placeholder',
  production: import.meta.env.VITE_STRIPE_PRICE_ID_PROD || 'price_14AfZ9bna72qfXvfxX4F200'
};

// =============================================================================
// PRICING CONFIGURATION
// =============================================================================

/**
 * Main pricing configuration - Single source of truth
 */
export const PRICING_CONFIG: PricingConfig = {
  defaultCurrency: 'USD',
  environment: getCurrentEnvironment(),
  
  metadata: {
    version: '1.0.0',
    lastUpdated: '2025-08-20',
    author: 'Gil Klainert'
  },

  features: FEATURES,

  tiers: {
    FREE: {
      tier: 'FREE',
      name: 'Free',
      subtitle: 'Perfect for getting started',
      description: 'Everything you need to create a professional CV with AI enhancement',
      price: {
        cents: 0,
        dollars: 0,
        currency: 'USD',
        stripeConfig: {
          development: '', // No Stripe config for free tier
          staging: '',
          production: ''
        }
      },
      billing: {
        period: 'forever',
        displayText: 'Forever'
      },
      features: [
        'AI CV Analysis & Enhancement',
        'Professional CV Templates',
        'ATS Optimization & Scoring',
        'Skills Visualization Charts',
        'Interactive Career Timeline',
        'Basic QR Code Generation',
        'Portfolio Gallery',
        'Multi-format Export (PDF, DOCX, HTML)',
        'Basic Analytics & Tracking'
      ],
      includedFeatures: [
        'CV_ANALYSIS',
        'CV_TEMPLATES',
        'ATS_OPTIMIZATION',
        'SKILLS_VISUALIZATION',
        'INTERACTIVE_TIMELINE',
        'BASIC_QR_CODE',
        'PORTFOLIO_GALLERY',
        'MULTI_FORMAT_EXPORT',
        'BASIC_ANALYTICS'
      ],
      ui: {
        buttonText: 'Get Started Free',
        buttonVariant: 'outline',
        popular: false,
        highlightColor: '#6b7280' // gray-500
      },
      isActive: true
    },

    PREMIUM: {
      tier: 'PREMIUM',
      name: 'Premium',
      subtitle: 'Lifetime Access',
      description: 'Unlock all premium features with lifetime access - one-time payment',
      price: {
        cents: 4900, // $49.00 in cents
        dollars: 49,
        currency: 'USD',
        stripeConfig: STRIPE_PRICE_IDS
      },
      billing: {
        period: 'one-time',
        displayText: 'One-time payment'
      },
      features: [
        'Everything in Free Forever',
        'Personal Web Portal (Custom URL)',
        'AI Chat Assistant (RAG-powered)',
        'AI Career Podcast Generation',
        'AI Video Introduction Generation',
        'Advanced Analytics Dashboard',
        'Advanced QR Code Customization',
        'Priority Customer Support',
        'Remove CVPlus Branding'
      ],
      includedFeatures: [
        // Include all free features
        ...['CV_ANALYSIS', 'CV_TEMPLATES', 'ATS_OPTIMIZATION', 'SKILLS_VISUALIZATION', 
           'INTERACTIVE_TIMELINE', 'BASIC_QR_CODE', 'PORTFOLIO_GALLERY', 
           'MULTI_FORMAT_EXPORT', 'BASIC_ANALYTICS'],
        // Plus premium features
        'WEB_PORTAL',
        'AI_CHAT_ASSISTANT',
        'AI_PODCAST',
        'VIDEO_INTRODUCTION',
        'ADVANCED_ANALYTICS',
        'ADVANCED_QR_CODE',
        'PRIORITY_SUPPORT',
        'REMOVE_BRANDING'
      ],
      ui: {
        buttonText: 'Get Lifetime Access',
        buttonVariant: 'primary',
        badge: 'LIFETIME',
        popular: true,
        highlightColor: '#06b6d4' // cyan-500
      },
      isActive: true
    }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get tier configuration by tier type
 */
export const getTierConfig = (tier: SubscriptionTier): TierConfig => {
  return PRICING_CONFIG.tiers[tier];
};

/**
 * Get feature configuration by feature ID
 */
export const getFeatureConfig = (featureId: string): FeatureConfig | null => {
  return PRICING_CONFIG.features[featureId] || null;
};

/**
 * Get Stripe Price ID for current environment
 */
export const getStripePriceId = (tier: SubscriptionTier): string => {
  const config = getTierConfig(tier);
  const environment = PRICING_CONFIG.environment;
  return config.price.stripeConfig[environment];
};

/**
 * Check if a feature is available for a specific tier
 */
export const isFeatureAvailableForTier = (featureId: string, tier: SubscriptionTier): boolean => {
  const tierConfig = getTierConfig(tier);
  return tierConfig.includedFeatures.includes(featureId);
};

/**
 * Get all premium features
 */
export const getPremiumFeatures = (): FeatureConfig[] => {
  return Object.values(FEATURES).filter(feature => feature.isPremium);
};

/**
 * Get all free features
 */
export const getFreeFeatures = (): FeatureConfig[] => {
  return Object.values(FEATURES).filter(feature => !feature.isPremium);
};

/**
 * Format price for display
 */
export const formatPrice = (price: PriceConfig, showCurrency = true): string => {
  if (price.dollars === 0) {
    return 'Free';
  }
  
  const currencySymbol = price.currency === 'USD' ? '$' : 
                        price.currency === 'EUR' ? '€' : 
                        price.currency === 'GBP' ? '£' : '$';
  
  return showCurrency ? `${currencySymbol}${price.dollars}` : price.dollars.toString();
};

/**
 * Format price with cents for API calls
 */
export const formatPriceInCents = (tier: SubscriptionTier): number => {
  return getTierConfig(tier).price.cents;
};

/**
 * Validate pricing configuration
 */
export const validatePricingConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if all tiers have required fields
  Object.values(PRICING_CONFIG.tiers).forEach(tier => {
    if (!tier.name || tier.name.trim() === '') {
      errors.push(`Tier ${tier.tier} is missing name`);
    }
    
    if (tier.tier === 'PREMIUM' && tier.price.cents <= 0) {
      errors.push(`Premium tier must have a positive price`);
    }
    
    if (!tier.features || tier.features.length === 0) {
      errors.push(`Tier ${tier.tier} has no features defined`);
    }
    
    if (!tier.includedFeatures || tier.includedFeatures.length === 0) {
      errors.push(`Tier ${tier.tier} has no included features defined`);
    }
  });
  
  // Check if all feature IDs in tiers exist in FEATURES
  Object.values(PRICING_CONFIG.tiers).forEach(tier => {
    tier.includedFeatures.forEach(featureId => {
      if (!FEATURES[featureId]) {
        errors.push(`Feature ${featureId} in tier ${tier.tier} does not exist in FEATURES`);
      }
    });
  });
  
  // Check if Stripe price IDs are set for premium tier in production
  if (PRICING_CONFIG.environment === 'production') {
    const premiumConfig = getTierConfig('PREMIUM');
    if (!premiumConfig.price.stripeConfig.production || 
        premiumConfig.price.stripeConfig.production === 'price_1RucLUHjEeKlGm_prod_example') {
      errors.push('Production Stripe Price ID is not configured for Premium tier');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get pricing summary for logging/debugging
 */
export const getPricingSummary = () => {
  return {
    environment: PRICING_CONFIG.environment,
    defaultCurrency: PRICING_CONFIG.defaultCurrency,
    tiers: Object.keys(PRICING_CONFIG.tiers),
    totalFeatures: Object.keys(PRICING_CONFIG.features).length,
    premiumFeatures: getPremiumFeatures().length,
    freeFeatures: getFreeFeatures().length,
    validation: validatePricingConfig(),
    metadata: PRICING_CONFIG.metadata
  };
};

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard to check if a tier is premium
 */
export const isPremiumTier = (tier: SubscriptionTier): boolean => {
  return tier === 'PREMIUM';
};

/**
 * Type guard to check if a feature is premium
 */
export const isPremiumFeature = (featureId: string): boolean => {
  const feature = getFeatureConfig(featureId);
  return feature ? feature.isPremium : false;
};

// =============================================================================
// CONSTANTS FOR BACKWARD COMPATIBILITY
// =============================================================================

/**
 * Legacy constants for backward compatibility
 * @deprecated Use getTierConfig() instead
 */
export const LEGACY_PRICES = {
  FREE: getTierConfig('FREE').price.dollars,
  PREMIUM: getTierConfig('PREMIUM').price.dollars
} as const;

/**
 * Legacy feature lists for backward compatibility
 * @deprecated Use getTierConfig().features instead
 */
export const LEGACY_FEATURES = {
  FREE: getTierConfig('FREE').features,
  PREMIUM: getTierConfig('PREMIUM').features
} as const;

// =============================================================================
// EXPORTS
// =============================================================================

// Export main configuration as default
export default PRICING_CONFIG;