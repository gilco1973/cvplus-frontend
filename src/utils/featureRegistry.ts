import React from 'react';
import { CVFeatureProps, ComponentRegistry } from '../types/cv-features';

// Import all implemented feature components
import { ContactForm } from '../components/features/ContactForm';

// AI-Powered Components - IMPLEMENTED
import { AIPodcastPlayer } from '@cvplus/multimedia/components/players/AIPodcastPlayer';
import { ATSOptimization } from '../components/features/AI-Powered/ATSOptimization';
import { SkillsAnalytics } from '../components/features/AI-Powered/SkillsAnalytics';
import { AIChatAssistant } from '../components/features/AI-Powered/AIChatAssistant';

// Interactive Components - IMPLEMENTED
import { DynamicQRCode } from '../components/features/Interactive/DynamicQRCode';
import { SocialMediaLinks } from '../components/features/Interactive/SocialMediaLinks';
import { CareerTimeline } from '../components/features/Interactive/CareerTimeline';
import { AvailabilityCalendar } from '../components/features/Interactive/AvailabilityCalendar';

// Visual Components - IMPLEMENTED
import { SkillsVisualization } from '../components/features/Visual/SkillsVisualization';
import { AchievementCards } from '../components/features/Visual/AchievementCards';

// Media Components - IMPLEMENTED
import { PortfolioGallery } from '@cvplus/multimedia/components/gallery/PortfolioGallery';

// Components to be implemented in future phases
// import { KeywordEnhancement } from '../components/features/AI-Powered/KeywordEnhancement';
// import { AchievementHighlighting } from '../components/features/AI-Powered/AchievementHighlighting';
// import { PrivacyMode } from '../components/features/AI-Powered/PrivacyMode';
// import { PublicProfile } from '../components/features/AI-Powered/PublicProfile';
import { VideoIntroduction } from '@cvplus/multimedia/components/generation/VideoIntroduction';
// import { PersonalityInsights } from '../components/features/AI-Powered/PersonalityInsights';
// import { LanguageProficiency } from '../components/features/Visual/LanguageProficiency';
// import { CertificationBadges } from '../components/features/Visual/CertificationBadges';
// import { TestimonialsCarousel } from '../components/features/Media/TestimonialsCarousel';

// Component Registry
export const FEATURE_COMPONENTS: ComponentRegistry = {
  // Existing components
  'ContactForm': ContactForm,
  'contact-form': ContactForm,
  'built-in-contact-form': ContactForm,

  // AI-Powered Components - IMPLEMENTED
  'AIPodcastPlayer': AIPodcastPlayer,
  'ai-career-podcast': AIPodcastPlayer,
  'ATSOptimization': ATSOptimization,
  'ats-optimization': ATSOptimization,
  'AIChatAssistant': AIChatAssistant,
  'ai-chat-assistant': AIChatAssistant,
  'SkillsAnalytics': SkillsAnalytics,
  'skills-analytics': SkillsAnalytics,
  
  // KeywordEnhancement, AchievementHighlighting, PrivacyMode, PublicProfile, 
  // PersonalityInsights - To be implemented in future phases
  // 'KeywordEnhancement': KeywordEnhancement,
  // 'keyword-enhancement': KeywordEnhancement,
  // 'AchievementHighlighting': AchievementHighlighting,
  // 'achievement-highlighting': AchievementHighlighting,
  // 'PrivacyMode': PrivacyMode,
  // 'privacy-mode': PrivacyMode,
  // 'PublicProfile': PublicProfile,
  // 'public-profile': PublicProfile,
  'VideoIntroduction': VideoIntroduction,
  'video-introduction': VideoIntroduction,
  // 'PersonalityInsights': PersonalityInsights,
  // 'personality-insights': PersonalityInsights,

  // Interactive Components - IMPLEMENTED
  'DynamicQRCode': DynamicQRCode,
  'qr-code': DynamicQRCode,
  'dynamic-qr-code': DynamicQRCode,
  'SocialMediaLinks': SocialMediaLinks,
  'social-media-links': SocialMediaLinks,
  'social-media-integration': SocialMediaLinks,
  'AvailabilityCalendar': AvailabilityCalendar,
  'availability-calendar': AvailabilityCalendar,
  'calendar': AvailabilityCalendar,
  'calendar-integration': AvailabilityCalendar,
  'CareerTimeline': CareerTimeline,
  'career-timeline': CareerTimeline,
  'interactive-timeline': CareerTimeline,

  // Visual Components - IMPLEMENTED
  'SkillsVisualization': SkillsVisualization,
  'skills-visualization': SkillsVisualization,
  'interactive-skills-charts': SkillsVisualization,
  'AchievementCards': AchievementCards,
  'achievement-cards': AchievementCards,
  'animated-achievement-cards': AchievementCards,
  
  // LanguageProficiency, CertificationBadges - To be implemented in future phases
  // 'LanguageProficiency': LanguageProficiency,
  // 'language-proficiency': LanguageProficiency,
  // 'language-proficiency-visuals': LanguageProficiency,
  // 'CertificationBadges': CertificationBadges,
  // 'certification-badges': CertificationBadges,
  // 'verified-certification-badges': CertificationBadges,

  // Media Components - IMPLEMENTED
  'PortfolioGallery': PortfolioGallery,
  'portfolio-gallery': PortfolioGallery,
  'interactive-portfolio-gallery': PortfolioGallery,
  // 'TestimonialsCarousel': TestimonialsCarousel,
  // 'testimonials-carousel': TestimonialsCarousel,
};

// Feature Registry Class
export class FeatureRegistry {
  private static instance: FeatureRegistry;
  private components: ComponentRegistry = { ...FEATURE_COMPONENTS };


  static getInstance(): FeatureRegistry {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    return FeatureRegistry.instance;
  }

  // Register a new component
  register(name: string, component: React.ComponentType<CVFeatureProps>): void {
    this.components[name] = component;
  }

  // Get a component by name
  get(name: string): React.ComponentType<CVFeatureProps> | undefined {
    return this.components[name];
  }

  // Check if a component is registered
  has(name: string): boolean {
    return name in this.components;
  }

  // Get all registered component names
  getNames(): string[] {
    return Object.keys(this.components);
  }

  // Get all components
  getAll(): ComponentRegistry {
    return { ...this.components };
  }

  // Unregister a component
  unregister(name: string): void {
    delete this.components[name];
  }
}

// Utility functions
export const getFeatureComponent = (name: string): React.ComponentType<CVFeatureProps> | undefined => {
  return FeatureRegistry.getInstance().get(name);
};

export const registerFeatureComponent = (name: string, component: React.ComponentType<CVFeatureProps>): void => {
  FeatureRegistry.getInstance().register(name, component);
};

export const isFeatureSupported = (name: string): boolean => {
  return FeatureRegistry.getInstance().has(name);
};

// Feature categories for organization
export const FEATURE_CATEGORIES = {
  'ai-powered': [
    'ai-career-podcast',
    'ats-optimization', 
    'keyword-enhancement',
    'achievement-highlighting',
    'privacy-mode',
    'ai-chat-assistant',
    'public-profile',
    'skills-analytics',
    'video-introduction',
    'personality-insights'
  ],
  'interactive': [
    'qr-code',
    'career-timeline',
    'contact-form',
    'availability-calendar',
    'social-media-links'
  ],
  'visual': [
    'skills-visualization',
    'achievement-cards',
    'language-proficiency',
    'certification-badges'
  ],
  'media': [
    'video-introduction',
    'portfolio-gallery',
    'testimonials-carousel'
  ]
};

export const getFeatureCategory = (featureName: string): string | undefined => {
  for (const [category, features] of Object.entries(FEATURE_CATEGORIES)) {
    if (features.includes(featureName)) {
      return category;
    }
  }
  return undefined;
};