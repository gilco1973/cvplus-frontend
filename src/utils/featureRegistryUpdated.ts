import React from 'react';
import { CVFeatureProps, ComponentRegistry } from '../types/cv-features';

// Import all implemented feature components
import { ContactForm } from '../components/features/ContactForm';

// AI-Powered Components - IMPLEMENTED
import { AIPodcastPlayer } from '../components/features/AI-Powered/AIPodcastPlayer';
import { ATSOptimization } from '../components/features/AI-Powered/ATSOptimization';
import { SkillsAnalytics } from '../components/features/AI-Powered/SkillsAnalytics';
import { AIChatAssistant } from '../components/features/AI-Powered/AIChatAssistant';

// Interactive Components - IMPLEMENTED
import { DynamicQRCode } from '../components/features/Interactive/DynamicQRCode';
import { SocialMediaLinks } from '../components/features/Interactive/SocialMediaLinks';
import { CareerTimeline } from '../components/features/Interactive/CareerTimeline';

// Visual Components - IMPLEMENTED
import { SkillsVisualization } from '../components/features/Visual/SkillsVisualization';
import { AchievementCards } from '../components/features/Visual/AchievementCards';

// Media Components - IMPLEMENTED
import { PortfolioGallery } from '../components/features/Media/PortfolioGallery';

// Component Registry - All Implemented Components
export const FEATURE_COMPONENTS: ComponentRegistry = {
  // Core Interactive Components
  'ContactForm': ContactForm,
  'contact-form': ContactForm,
  'built-in-contact-form': ContactForm,
  
  'DynamicQRCode': DynamicQRCode,
  'qr-code': DynamicQRCode,
  'dynamic-qr-code': DynamicQRCode,
  
  'SocialMediaLinks': SocialMediaLinks,
  'social-media-links': SocialMediaLinks,
  'social-media-integration': SocialMediaLinks,
  
  'CareerTimeline': CareerTimeline,
  'career-timeline': CareerTimeline,
  'interactive-timeline': CareerTimeline,

  // AI-Powered Components - IMPLEMENTED
  'AIPodcastPlayer': AIPodcastPlayer,
  'ai-career-podcast': AIPodcastPlayer,
  'podcast': AIPodcastPlayer,
  
  'ATSOptimization': ATSOptimization,
  'ats-optimization': ATSOptimization,
  
  'SkillsAnalytics': SkillsAnalytics,
  'skills-analytics': SkillsAnalytics,
  
  'AIChatAssistant': AIChatAssistant,
  'ai-chat-assistant': AIChatAssistant,
  'chat': AIChatAssistant,

  // Visual Components - IMPLEMENTED
  'SkillsVisualization': SkillsVisualization,
  'skills-visualization': SkillsVisualization,
  'interactive-skills-charts': SkillsVisualization,
  
  'AchievementCards': AchievementCards,
  'achievement-cards': AchievementCards,
  'animated-achievement-cards': AchievementCards,

  // Media Components - IMPLEMENTED
  'PortfolioGallery': PortfolioGallery,
  'portfolio-gallery': PortfolioGallery,
  'interactive-portfolio-gallery': PortfolioGallery,
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

// Updated feature categories for organization
export const FEATURE_CATEGORIES = {
  'ai-powered': [
    'ai-career-podcast',
    'ats-optimization', 
    'skills-analytics',
    'ai-chat-assistant',
    'podcast'
  ],
  'interactive': [
    'qr-code',
    'career-timeline',
    'contact-form',
    'social-media-links'
  ],
  'visual': [
    'skills-visualization',
    'achievement-cards'
  ],
  'media': [
    'portfolio-gallery'
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

// Export implementation statistics
export const IMPLEMENTATION_STATS = {
  totalFeatures: Object.keys(FEATURE_COMPONENTS).length,
  implementedComponents: 10, // ContactForm, DynamicQRCode, SocialMediaLinks, CareerTimeline, AIPodcastPlayer, ATSOptimization, SkillsAnalytics, AIChatAssistant, SkillsVisualization, AchievementCards, PortfolioGallery
  aiPoweredComponents: 4,
  interactiveComponents: 4, 
  visualComponents: 2,
  mediaComponents: 1,
  completionPercentage: Math.round((11 / 22) * 100) // 11 components out of planned 22
};