/**
 * Component Renderer Utility
 * Handles rendering React components from CV generation system placeholders
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { logger } from './logger';
import { ContactForm } from '../components/features/ContactForm';
import { SocialMediaLinks } from '../components/features/SocialMediaLinks';
import { DynamicQRCode } from '../components/features/Interactive/DynamicQRCode';
import { SkillsVisualization } from '../components/features/Visual/SkillsVisualization';
import { CalendarIntegration } from '../components/features/CalendarIntegration';
import { InteractiveTimeline } from '../components/features/InteractiveTimeline';
import { AchievementCards } from '../components/features/Visual/AchievementCards';
// Import multimedia components from the multimedia module
import { AIPodcastPlayer } from '@cvplus/multimedia/components/players/AIPodcastPlayer';
import { VideoIntroduction } from '@cvplus/multimedia/components/generation/VideoIntroduction';
import { PortfolioGallery } from '@cvplus/multimedia/components/gallery/PortfolioGallery';
import { TestimonialsCarousel } from '../components/features/TestimonialsCarousel';
import { CertificationBadges } from '../components/features/CertificationBadges';
import { PersonalityInsights } from '../components/features/PersonalityInsights';
import { CVFeatureProps, ComponentRegistry } from '../types/cv-features';
import { MediaService } from '../services/features/MediaService';

// Component registry for available components - properly typed
const COMPONENT_REGISTRY: ComponentRegistry = {
  ContactForm: ContactForm,
  SocialMediaLinks: SocialMediaLinks,
  DynamicQRCode: DynamicQRCode,
  SkillsVisualization: SkillsVisualization,
  CalendarIntegration: CalendarIntegration,
  InteractiveTimeline: InteractiveTimeline,
  AchievementCards: AchievementCards,
  AIPodcastPlayer: AIPodcastPlayer,
  VideoIntroduction: VideoIntroduction,
  PortfolioGallery: PortfolioGallery,
  TestimonialsCarousel: TestimonialsCarousel,
  CertificationBadges: CertificationBadges,
  PersonalityInsights: PersonalityInsights
} as const;

type ComponentName = keyof typeof COMPONENT_REGISTRY;

/**
 * Render a React component into a DOM element
 * @param componentName - Name of the component to render
 * @param props - Props to pass to the component
 * @param container - DOM element to render into
 */
export function renderReactComponent(
  componentName: ComponentName,
  props: any,
  container: Element
): void {
  const log = logger.component('ComponentRenderer');
  log.debug(`Attempting to render component: ${componentName}`);
  
  const Component = COMPONENT_REGISTRY[componentName];
  
  if (!Component) {
    log.error(`Component "${componentName}" not found in registry`, Object.keys(COMPONENT_REGISTRY));
    return;
  }
  
  try {
    container.innerHTML = '';
    const element = React.createElement(Component, props);
    const root = createRoot(container);
    root.render(element);
    log.debug(`Successfully rendered ${componentName} component`);
  } catch (error) {
    log.error(`Failed to render ${componentName} component:`, error);
    
    // Show error message in container
    container.innerHTML = `
      <div class="component-error">
        <p>Failed to load ${componentName} component</p>
        <p class="error-details">${error instanceof Error ? error.message : 'Unknown error'}</p>
        <details>
          <summary>Error Details</summary>
          <pre>${error instanceof Error ? error.stack : 'No stack trace available'}</pre>
        </details>
      </div>
    `;
  }
}

/**
 * Initialize all React component placeholders on the page
 */
export function initializeReactComponents(): void {
  const log = logger.component('ComponentRenderer');
  log.debug('Starting React component initialization');
  
  const placeholders = document.querySelectorAll('.react-component-placeholder');
  log.debug(`Found ${placeholders.length} React component placeholders`);
  
  if (placeholders.length === 0) {
    log.debug('No React component placeholders found');
    return;
  }
  
  placeholders.forEach((placeholder, index) => {
    const log = logger.component('ComponentRenderer');
    log.debug(`Processing placeholder ${index + 1}/${placeholders.length}`);
    
    const componentName = placeholder.getAttribute('data-component') as ComponentName;
    const propsJson = placeholder.getAttribute('data-props');
    
    if (!componentName) {
      log.warn(`Placeholder ${index + 1} missing data-component attribute`);
      return;
    }
    
    let props = {};
    if (propsJson) {
      try {
        props = JSON.parse(propsJson);
      } catch (error) {
        console.error(`Failed to parse props for ${componentName}:`, error);
        return;
      }
    }
    
    // Add debug logging for ContactForm specifically
    if (componentName === 'ContactForm') {
      log.debug('Initializing ContactForm component');
      
      // Ensure the component doesn't start in an infinite loading state
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging for CalendarIntegration specifically
    if (componentName === 'CalendarIntegration') {
      log.debug('Initializing CalendarIntegration component');
      
      // Ensure the calendar component has proper event handlers
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging for InteractiveTimeline specifically
    if (componentName === 'InteractiveTimeline') {
      log.debug('Initializing InteractiveTimeline component');
      
      // Ensure the timeline component has proper configuration
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging for AchievementCards specifically
    if (componentName === 'AchievementCards') {
      console.warn('🏆 Initializing AchievementCards component with props:', props);
      
      // Ensure the achievements component has proper configuration
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging for AIPodcastPlayer specifically
    if (componentName === 'AIPodcastPlayer') {
      console.warn('🎙️ Initializing AIPodcastPlayer component with props:', props);
      
      // Ensure the podcast component has proper configuration
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging for DynamicQRCode specifically
    if (componentName === 'DynamicQRCode') {
      console.warn('📱 Initializing DynamicQRCode component with props:', props);
      console.warn('📱 QRCode Component from registry:', COMPONENT_REGISTRY[componentName]);
      
      // Ensure the QR code component has proper configuration
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    // Add debug logging and props for VideoIntroduction specifically
    if (componentName === 'VideoIntroduction') {
      console.warn('🎥 Initializing VideoIntroduction component with props:', props);
      
      // Ensure VideoIntroduction has required functions
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
        onGenerateVideo: async (options: any) => {
          try {
            const result = await MediaService.generateVideoIntroduction(
              props.jobId,
              options?.duration || 'medium',
              options?.style || 'professional'
            );
            return {
              videoUrl: result.videoUrl || '',
              thumbnailUrl: result.thumbnailUrl || '',
              duration: result.duration || 0,
              script: result.script || '',
              subtitles: result.subtitles || '',
              provider: result.provider || 'heygen',
              qualityScore: result.qualityScore || 0
            };
          } catch (error) {
            console.error('Video generation error:', error);
            throw error;
          }
        },
        onRegenerateVideo: async (customScript?: string, options?: any) => {
          try {
            const result = await MediaService.regenerateVideoIntroduction(
              props.jobId,
              customScript,
              options
            );
            return {
              videoUrl: result.videoUrl || '',
              thumbnailUrl: result.thumbnailUrl || '',
              duration: result.duration || 0
            };
          } catch (error) {
            console.error('Video regeneration error:', error);
            throw error;
          }
        },
        onGetStatus: async (jobId: string) => {
          try {
            const result = await MediaService.getMediaStatus(jobId);
            return {
              provider: result.provider || 'heygen',
              status: result.status || 'queued',
              progress: result.progress || 0,
              currentStep: result.currentStep || 'Initializing',
              estimatedTime: result.estimatedTime,
              qualityScore: result.qualityScore,
              error: result.error
            };
          } catch (error) {
            console.error('Status check error:', error);
            return {
              provider: 'heygen',
              status: 'failed' as const,
              progress: 0,
              currentStep: 'Error',
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        }
      };
    }
    
    // Add debug logging for other key components
    if (['PortfolioGallery', 'TestimonialsCarousel', 'CertificationBadges', 'PersonalityInsights'].includes(componentName)) {
      console.warn(`🎯 Initializing ${componentName} component with props:`, props);
      
      // Ensure all components have proper configuration
      props = {
        ...props,
        isEnabled: props.isEnabled !== false, // Default to true
      };
    }
    
    renderReactComponent(componentName, props, placeholder);
  });
}

/**
 * Make component renderer available globally for CV generation system
 */
if (typeof window !== 'undefined') {
  (window as any).renderReactComponent = renderReactComponent;
  (window as any).initializeReactComponents = initializeReactComponents;
  
  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReactComponents);
  } else {
    // If document is already loaded, initialize immediately
    setTimeout(initializeReactComponents, 0);
  }
}

export default {
  renderReactComponent,
  initializeReactComponents,
  COMPONENT_REGISTRY
};