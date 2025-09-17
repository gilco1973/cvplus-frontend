/**
 * Lazy Component Renderer - Bundle Size Optimized
 * 
 * This module provides dynamic loading of React feature components to dramatically
 * reduce initial bundle size. Components are loaded only when needed.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { logger } from './logger';
import type { CVFeatureProps } from '../types/cv-features';

// Type definitions for lazy-loaded components
type LazyComponent = React.ComponentType<any>;
type ComponentLoader = () => Promise<{ default: LazyComponent }>;

// Lazy component registry - components loaded on demand
const LAZY_COMPONENT_LOADERS: Record<string, ComponentLoader> = {
  // Core interactive components
  ContactForm: () => import('../components/features/ContactForm').then(m => ({ default: m.ContactForm })),
  SocialMediaLinks: () => import('../components/features/SocialMediaLinks').then(m => ({ default: m.SocialMediaLinks })),
  DynamicQRCode: () => import('../components/features/Interactive/DynamicQRCode').then(m => ({ default: m.DynamicQRCode })),
  
  // Visual components
  SkillsVisualization: () => import('../components/features/Visual/SkillsVisualization').then(m => ({ default: m.SkillsVisualization })),
  AchievementCards: () => import('../components/features/Visual/AchievementCards').then(m => ({ default: m.AchievementCards })),
  CertificationBadges: () => import('../components/features/CertificationBadges').then(m => ({ default: m.CertificationBadges })),
  
  // Calendar and timeline
  CalendarIntegration: () => import('../components/features/CalendarIntegration').then(m => ({ default: m.CalendarIntegration })),
  InteractiveTimeline: () => import('../components/features/InteractiveTimeline').then(m => ({ default: m.InteractiveTimeline })),
  
  // Media components - heaviest, most benefit from lazy loading
  AIPodcastPlayer: () => import('@cvplus/multimedia/components/players/AIPodcastPlayer').then(m => ({ default: m.default })),
  VideoIntroduction: () => import('@cvplus/multimedia/components/generation/VideoIntroduction').then(m => ({ default: m.default })),
  PortfolioGallery: () => import('@cvplus/multimedia/components/gallery/PortfolioGallery').then(m => ({ default: m.default })),
  TestimonialsCarousel: () => import('../components/features/TestimonialsCarousel').then(m => ({ default: m.TestimonialsCarousel })),
  
  // Personality insights
  PersonalityInsights: () => import('../components/features/PersonalityInsights').then(m => ({ default: m.PersonalityInsights })),
};

// Component cache to avoid re-loading
const componentCache = new Map<string, LazyComponent>();
const loadingPromises = new Map<string, Promise<LazyComponent>>();

/**
 * Load a component dynamically
 */
async function loadComponent(componentName: string): Promise<LazyComponent> {
  // Return cached component if available
  if (componentCache.has(componentName)) {
    return componentCache.get(componentName)!;
  }

  // Return existing loading promise if component is already being loaded
  if (loadingPromises.has(componentName)) {
    return loadingPromises.get(componentName)!;
  }

  // Check if component loader exists
  const loader = LAZY_COMPONENT_LOADERS[componentName];
  if (!loader) {
    throw new Error(`Unknown component: ${componentName}`);
  }

  // Start loading and cache the promise
  const loadingPromise = loader().then(module => {
    const component = module.default;
    componentCache.set(componentName, component);
    loadingPromises.delete(componentName);
    return component;
  }).catch(error => {
    loadingPromises.delete(componentName);
    logger.error(`Failed to load component ${componentName}:`, error);
    throw error;
  });

  loadingPromises.set(componentName, loadingPromise);
  return loadingPromise;
}

/**
 * Render a React component into a DOM element with lazy loading
 */
export async function renderLazyReactComponent(
  componentName: string,
  props: CVFeatureProps,
  container: Element
): Promise<void> {
  try {
    logger.info(`🔄 Loading component: ${componentName}`);
    
    // Show loading indicator
    container.innerHTML = `
      <div class="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div class="flex flex-col items-center space-y-2">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p class="text-sm text-gray-600">Loading ${componentName}...</p>
        </div>
      </div>
    `;

    // Load component dynamically
    const Component = await loadComponent(componentName);
    
    // Create React root and render
    const root = createRoot(container);
    root.render(React.createElement(Component, props));
    
    logger.info(`✅ Successfully loaded and rendered: ${componentName}`);
    
  } catch (error) {
    logger.error(`❌ Failed to render component ${componentName}:`, error);
    
    // Show error state
    container.innerHTML = `
      <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Component Loading Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>Failed to load ${componentName}. Please try refreshing the page.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * Initialize React components in the DOM with lazy loading
 */
export function initializeLazyReactComponents(): void {
  const elements = document.querySelectorAll('[data-react-component]');
  
  logger.info(`🚀 Initializing ${elements.length} lazy React components`);
  
  elements.forEach(async (element) => {
    const componentName = element.getAttribute('data-react-component');
    const propsJson = element.getAttribute('data-react-props');
    
    if (!componentName) {
      logger.warn('Element has data-react-component attribute but no component name');
      return;
    }
    
    let props: CVFeatureProps = {};
    if (propsJson) {
      try {
        props = JSON.parse(propsJson);
      } catch (error) {
        logger.error('Failed to parse component props:', error);
        return;
      }
    }
    
    // Render component lazily
    await renderLazyReactComponent(componentName, props, element);
  });
  
  logger.info('✅ Lazy React components initialization completed');
}

/**
 * Preload critical components for better UX
 */
export async function preloadCriticalComponents(): Promise<void> {
  const criticalComponents = ['ContactForm', 'SocialMediaLinks', 'DynamicQRCode'];
  
  logger.info('🔄 Preloading critical components...');
  
  await Promise.allSettled(
    criticalComponents.map(componentName => loadComponent(componentName))
  );
  
  logger.info('✅ Critical components preloaded');
}

/**
 * Get component loading stats
 */
export function getComponentStats() {
  return {
    cachedComponents: Array.from(componentCache.keys()),
    loadingComponents: Array.from(loadingPromises.keys()),
    totalAvailable: Object.keys(LAZY_COMPONENT_LOADERS).length
  };
}