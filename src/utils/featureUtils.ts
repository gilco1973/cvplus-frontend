/**
 * Feature Utilities
 * Handles conversion between camelCase (frontend) and kebab-case (backend) feature names
 */

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert array of camelCase feature names to kebab-case for backend
 */
export const convertFeaturesToKebabCase = (camelCaseFeatures: string[]): string[] => {
  return camelCaseFeatures.map(feature => camelToKebabCase(feature));
};

/**
 * Convert array of kebab-case feature names to camelCase for frontend
 */
export const convertFeaturesToCamelCase = (kebabCaseFeatures: string[]): string[] => {
  return kebabCaseFeatures.map(feature => kebabToCamelCase(feature));
};

/**
 * Feature mapping between camelCase (frontend) and kebab-case (backend)
 * This ensures consistency across the application
 */
export const FEATURE_MAPPING = {
  // Core Enhancement Features
  atsOptimization: 'ats-optimization',
  keywordEnhancement: 'keyword-enhancement', 
  achievementHighlighting: 'achievement-highlighting',
  skillsVisualization: 'skills-visualization',
  
  // Privacy Features
  privacyMode: 'privacy-mode',
  
  // QR Code Feature
  embedQRCode: 'embed-qr-code',
  
  // Interactive Features
  interactiveTimeline: 'interactive-timeline',
  skillsChart: 'skills-chart',
  
  // Multimedia Features
  generatePodcast: 'generate-podcast',
  videoIntroduction: 'video-introduction',
  portfolioGallery: 'portfolio-gallery',
  
  // Social Features
  testimonialsCarousel: 'testimonials-carousel',
  contactForm: 'contact-form',
  socialMediaLinks: 'social-media-links',
  availabilityCalendar: 'availability-calendar',
  
  // Professional Features
  languageProficiency: 'language-proficiency',
  certificationBadges: 'certification-badges',
  achievementsShowcase: 'achievements-showcase'
} as const;

/**
 * Convert camelCase features to kebab-case using explicit mapping
 * Falls back to automatic conversion if feature not in mapping
 */
export const convertSelectedFeaturesToBackend = (selectedFeatures: Record<string, boolean>): string[] => {
  const enabledFeatures = Object.keys(selectedFeatures).filter(key => selectedFeatures[key]);
  
  return enabledFeatures.map(feature => {
    // Use explicit mapping if available
    if (FEATURE_MAPPING[feature as keyof typeof FEATURE_MAPPING]) {
      return FEATURE_MAPPING[feature as keyof typeof FEATURE_MAPPING];
    }
    
    // Fall back to automatic conversion
    console.warn(`Feature "${feature}" not found in explicit mapping, using automatic conversion`);
    return camelToKebabCase(feature);
  });
};

/**
 * Convert kebab-case features from backend to camelCase for frontend
 */
export const convertBackendFeaturesToFrontend = (backendFeatures: string[]): Record<string, boolean> => {
  const reverseMapping = Object.fromEntries(
    Object.entries(FEATURE_MAPPING).map(([camel, kebab]) => [kebab, camel])
  );
  
  const result: Record<string, boolean> = {};
  
  backendFeatures.forEach(feature => {
    // Use explicit reverse mapping if available
    if (reverseMapping[feature]) {
      result[reverseMapping[feature]] = true;
    } else {
      // Fall back to automatic conversion
      console.warn(`Backend feature "${feature}" not found in explicit mapping, using automatic conversion`);
      result[kebabToCamelCase(feature)] = true;
    }
  });
  
  return result;
};