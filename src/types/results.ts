/**
 * Types for Results Page Components
 */

export interface SelectedFeatures {
  atsOptimization: boolean;
  keywordEnhancement: boolean;
  achievementHighlighting: boolean;
  achievementhighlighting: boolean; // Alternative spelling used in codebase
  skillsVisualization: boolean;
  generatePodcast: boolean;
  privacyMode: boolean;
  embedQRCode: boolean;
  interactiveTimeline: boolean;
  skillsChart: boolean;
  videoIntroduction: boolean;
  portfolioGallery: boolean;
  testimonialsCarousel: boolean;
  contactForm: boolean;
  socialMediaLinks: boolean;
  availabilityCalendar: boolean;
  languageProficiency: boolean;
  certificationBadges: boolean;
  achievementsShowcase: boolean;
}

export interface SelectedFormats {
  pdf: boolean;
  docx: boolean;
  html: boolean;
}

export interface FeatureAvailability {
  [key: string]: {
    available: boolean;
    reason?: string | null;
  };
}

export interface ResultsPageProps {
  jobId?: string;
}

export interface FeatureCheckboxProps {
  feature: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  featureAvailability: FeatureAvailability;
  className?: string;
}