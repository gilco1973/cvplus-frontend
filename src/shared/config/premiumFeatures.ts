/**
 * Premium Feature Configuration
 * Defines which features require premium access and their mapping to premium feature types
 */

// Premium feature type matching useSubscription.ts
type PremiumFeature = 'webPortal' | 'aiChat' | 'podcast' | 'advancedAnalytics' | 'roleDetection';

export interface PremiumFeatureMapping {
  featureId: string;
  premiumType: PremiumFeature;
  category: 'core' | 'enhancement' | 'advanced';
  requiredForGeneration?: boolean; // If true, feature is required during CV generation
  requiredForPortal?: boolean;    // If true, feature is required for web portal
}

/**
 * Maps CV features to their premium requirements
 * Features not listed here are available to all users
 */
export const PREMIUM_FEATURE_MAPPINGS: PremiumFeatureMapping[] = [
  // Advanced Features - require Premium access
  {
    featureId: 'skillsVisualization',
    premiumType: 'advancedAnalytics',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'personalityInsights',
    premiumType: 'aiChat',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: false
  },
  {
    featureId: 'careerTimeline',
    premiumType: 'advancedAnalytics',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'portfolioGallery',
    premiumType: 'webPortal',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  
  // Enhancement Features that require premium
  {
    featureId: 'certificationBadges',
    premiumType: 'webPortal',
    category: 'enhancement',
    requiredForGeneration: false,
    requiredForPortal: false
  },
  
  // Role Detection Features - Premium Only
  {
    featureId: 'roleDetection',
    premiumType: 'roleDetection',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: false
  },
  {
    featureId: 'roleBasedRecommendations', 
    premiumType: 'roleDetection',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'roleProfileApplication',
    premiumType: 'roleDetection',
    category: 'advanced', 
    requiredForGeneration: false,
    requiredForPortal: false
  },

  // Multimedia Features
  {
    featureId: 'generatePodcast',
    premiumType: 'podcast',
    category: 'advanced',
    requiredForGeneration: true,
    requiredForPortal: false
  },
  {
    featureId: 'videoIntroduction',
    premiumType: 'webPortal',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'interactiveTimeline',
    premiumType: 'webPortal',
    category: 'advanced',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'availabilityCalendar',
    premiumType: 'webPortal',
    category: 'enhancement',
    requiredForGeneration: false,
    requiredForPortal: true
  },
  {
    featureId: 'testimonialsCarousel',
    premiumType: 'webPortal',
    category: 'enhancement',
    requiredForGeneration: false,
    requiredForPortal: true
  }
];

/**
 * Free features - available to all users
 */
export const FREE_FEATURES = [
  'atsOptimized',
  'keywordOptimization', 
  'achievementsShowcase',
  'embedQRCode',
  'languageProficiency',
  'socialMediaLinks',
  'contactForm',
  'privacyMode'
];

/**
 * Check if a feature requires premium access
 */
export const isPremiumFeature = (featureId: string): boolean => {
  return PREMIUM_FEATURE_MAPPINGS.some(mapping => mapping.featureId === featureId);
};

/**
 * Get the premium type required for a feature
 */
export const getPremiumTypeForFeature = (featureId: string): PremiumFeature | null => {
  const mapping = PREMIUM_FEATURE_MAPPINGS.find(mapping => mapping.featureId === featureId);
  return mapping?.premiumType || null;
};

/**
 * Get all features that require a specific premium type
 */
export const getFeaturesForPremiumType = (premiumType: PremiumFeature): string[] => {
  return PREMIUM_FEATURE_MAPPINGS
    .filter(mapping => mapping.premiumType === premiumType)
    .map(mapping => mapping.featureId);
};

/**
 * Check if user can access a feature based on their premium status
 */
export const canAccessFeature = (
  featureId: string,
  userPremiumFeatures: Record<string, boolean>
): boolean => {
  // If it's not a premium feature, allow access
  if (!isPremiumFeature(featureId)) {
    return true;
  }

  // Get the required premium type
  const requiredPremiumType = getPremiumTypeForFeature(featureId);
  if (!requiredPremiumType) {
    return true; // Fallback to allow access if no premium type found
  }

  // Check if user has access to the required premium feature
  return userPremiumFeatures[requiredPremiumType] === true;
};

/**
 * Get premium features that are required for CV generation
 */
export const getGenerationRequiredFeatures = (): string[] => {
  return PREMIUM_FEATURE_MAPPINGS
    .filter(mapping => mapping.requiredForGeneration)
    .map(mapping => mapping.featureId);
};

/**
 * Get premium features that are required for web portal
 */
export const getPortalRequiredFeatures = (): string[] => {
  return PREMIUM_FEATURE_MAPPINGS
    .filter(mapping => mapping.requiredForPortal)
    .map(mapping => mapping.featureId);
};

/**
 * Validate feature selection against user's premium access
 */
export const validateFeatureSelection = (
  selectedFeatures: Record<string, boolean>,
  userPremiumFeatures: Record<string, boolean>
): {
  isValid: boolean;
  restrictedFeatures: string[];
  warnings: string[];
} => {
  const restrictedFeatures: string[] = [];
  const warnings: string[] = [];

  // Check each selected feature
  Object.entries(selectedFeatures).forEach(([featureId, isSelected]) => {
    if (isSelected && !canAccessFeature(featureId, userPremiumFeatures)) {
      restrictedFeatures.push(featureId);
      
      const premiumType = getPremiumTypeForFeature(featureId);
      warnings.push(
        `${featureId} requires ${premiumType} access. Please upgrade to use this feature.`
      );
    }
  });

  return {
    isValid: restrictedFeatures.length === 0,
    restrictedFeatures,
    warnings
  };
};

/**
 * Filter feature selection to only include accessible features
 */
export const filterAccessibleFeatures = (
  selectedFeatures: Record<string, boolean>,
  userPremiumFeatures: Record<string, boolean>
): Record<string, boolean> => {
  const filteredFeatures: Record<string, boolean> = {};

  Object.entries(selectedFeatures).forEach(([featureId, isSelected]) => {
    if (isSelected && canAccessFeature(featureId, userPremiumFeatures)) {
      filteredFeatures[featureId] = true;
    } else if (!isSelected) {
      filteredFeatures[featureId] = false;
    }
    // Skip restricted features by not including them
  });

  return filteredFeatures;
};