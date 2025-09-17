// Feature Configuration Types
export interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Feature Configuration - Maps camelCase feature names to kebab-case configs
export const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  // Core Enhancement Features
  'atsOptimization': {
    id: 'ats-optimization',
    name: 'ATS Optimization',
    icon: '🎯',
    description: 'Applicant Tracking System optimization'
  },
  'keywordEnhancement': {
    id: 'keyword-enhancement',
    name: 'Keyword Enhancement',
    icon: '🔑',
    description: 'Strategic keyword optimization'
  },
  'achievementHighlighting': {
    id: 'achievement-highlighting',
    name: 'Achievement Highlighting',
    icon: '⭐',
    description: 'Professional achievement emphasis'
  },
  
  // Interactive Features
  'skillsVisualization': {
    id: 'skills-visualization',
    name: 'Skills Visualization',
    icon: '📊',
    description: 'Interactive charts and skill assessments'
  },
  'skillsChart': {
    id: 'skills-chart',
    name: 'Skills Chart',
    icon: '📈',
    description: 'Visual skills proficiency chart'
  },
  'interactiveTimeline': {
    id: 'interactive-timeline',
    name: 'Interactive Timeline',
    icon: '⏰',
    description: 'Professional journey visualization'
  },
  
  // Multimedia Features
  'generatePodcast': {
    id: 'generate-podcast',
    name: 'Career Podcast',
    icon: '🎙️',
    description: 'AI-generated career story'
  },
  'videoIntroduction': {
    id: 'video-introduction',
    name: 'Video Introduction',
    icon: '🎥',
    description: 'Personal video introduction'
  },
  'portfolioGallery': {
    id: 'portfolio-gallery',
    name: 'Portfolio Gallery',
    icon: '🖼️',
    description: 'Project showcase gallery'
  },
  
  // Professional Features
  'certificationBadges': {
    id: 'certification-badges',
    name: 'Certification Badges',
    icon: '🏆',
    description: 'Professional certification displays'
  },
  'languageProficiency': {
    id: 'language-proficiency',
    name: 'Language Proficiency',
    icon: '🌍',
    description: 'Language skills assessment'
  },
  'achievementsShowcase': {
    id: 'achievements-showcase',
    name: 'Achievements Showcase',
    icon: '🎯',
    description: 'Top achievements highlighting'
  },
  
  // Contact & Integration Features
  'contactForm': {
    id: 'contact-form',
    name: 'Contact Form',
    icon: '📧',
    description: 'Interactive contact functionality'
  },
  'socialMediaLinks': {
    id: 'social-media-links',
    name: 'Social Media Links',
    icon: '🔗',
    description: 'Professional social media integration'
  },
  'availabilityCalendar': {
    id: 'availability-calendar',
    name: 'Availability Calendar',
    icon: '📅',
    description: 'Scheduling and availability integration'
  },
  'testimonialsCarousel': {
    id: 'testimonials-carousel',
    name: 'Testimonials Carousel',
    icon: '💬',
    description: 'Professional testimonials showcase'
  },
  
  // Technical Features
  'embedQRCode': {
    id: 'embed-qr-code',
    name: 'QR Code Integration',
    icon: '📱',
    description: 'Quick access QR code'
  },
  'privacyMode': {
    id: 'privacy-mode',
    name: 'Privacy Protection',
    icon: '🔒',
    description: 'Personal information protection'
  }
};

// Helper function to get feature config by camelCase name
export const getFeatureConfig = (featureName: string): FeatureConfig | undefined => {
  return FEATURE_CONFIGS[featureName];
};

// Helper function to get all feature configs as array
export const getAllFeatureConfigs = (): FeatureConfig[] => {
  return Object.values(FEATURE_CONFIGS);
};