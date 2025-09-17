// Pricing configuration for CVPlus

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  highlighted?: boolean;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Basic CV templates',
      'Up to 3 CV downloads per month',
      'Basic ATS optimization',
      'Standard support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'All premium CV templates',
      'Unlimited CV downloads',
      'Advanced ATS optimization',
      'AI-powered recommendations',
      'Custom branding',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'lifetime',
    name: 'Lifetime Premium',
    price: 99.99,
    currency: 'USD',
    billingPeriod: 'lifetime',
    features: [
      'All Premium features',
      'Lifetime access',
      'Early access to new features',
      'Personal account manager',
      'Custom integrations',
      'White-label solutions'
    ],
    highlighted: true
  }
];

export function getTierConfig(tierId: string): PricingTier | undefined {
  return pricingTiers.find(tier => tier.id === tierId);
}

export function formatPrice(price: number, currency: string = 'USD', period?: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2
  });

  const formattedPrice = formatter.format(price);

  if (period) {
    return `${formattedPrice}/${period}`;
  }

  return formattedPrice;
}

export function getPricingComparison(currentTier: string, targetTier: string): {
  savings?: number;
  features: string[];
  upgrade: boolean;
} {
  const current = getTierConfig(currentTier);
  const target = getTierConfig(targetTier);

  if (!current || !target) {
    return { features: [], upgrade: false };
  }

  const upgrade = pricingTiers.indexOf(target) > pricingTiers.indexOf(current);
  const savings = upgrade ? 0 : (current.price - target.price);

  // Get additional features in target tier
  const additionalFeatures = target.features.filter(
    feature => !current.features.includes(feature)
  );

  return {
    savings: savings > 0 ? savings : undefined,
    features: additionalFeatures,
    upgrade
  };
}

export function getRecommendedTier(usage: {
  downloadsPerMonth: number;
  templatesUsed: number;
  aiOptimizations: number;
}): string {
  if (usage.downloadsPerMonth <= 3 && usage.templatesUsed <= 3 && usage.aiOptimizations === 0) {
    return 'free';
  }

  if (usage.downloadsPerMonth <= 50 && usage.templatesUsed <= 20) {
    return 'premium';
  }

  return 'lifetime';
}

export const featureMapping = {
  'basic-cv': 'free',
  'basic-templates': 'free',
  'standard-support': 'free',
  'advanced-cv': 'premium',
  'ai-optimization': 'premium',
  'custom-templates': 'premium',
  'unlimited-downloads': 'premium',
  'priority-support': 'premium',
  'custom-branding': 'premium',
  'all-features': 'lifetime',
  'early-access': 'lifetime',
  'account-manager': 'lifetime',
  'white-label': 'lifetime'
} as const;

export function getRequiredTierForFeature(feature: string): string {
  return featureMapping[feature as keyof typeof featureMapping] || 'premium';
}

export default {
  tiers: pricingTiers,
  getTierConfig,
  formatPrice,
  getPricingComparison,
  getRecommendedTier,
  getRequiredTierForFeature
};