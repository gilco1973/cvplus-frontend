/**
 * Template CSS Generator with Enhanced Caching
 * Main entry point for template CSS generation with performance optimizations
 */

import type { CVTemplate } from '../../types/cv-templates';
import { enhancedCacheManager } from './enhanced-cache-manager';
import { performanceMetrics, PerformanceTracker } from '../performance/performance-metrics';
import { TemplateBaseStylesGenerator } from './template-base-styles';
import { TemplateLayoutGenerator } from './template-layout-generator';
import { TemplateTypographyGenerator } from './template-typography-generator';
import { TemplateColorGenerator } from './template-color-generator';
import { TemplateComponentGenerator } from './template-component-generator';

/**
 * High-performance CSS generator with LRU caching and performance monitoring
 */
export class TemplateCSSGenerator {
  private static instance: TemplateCSSGenerator;
  
  /**
   * Get singleton instance
   */
  static getInstance(): TemplateCSSGenerator {
    if (!this.instance) {
      this.instance = new TemplateCSSGenerator();
    }
    return this.instance;
  }

  /**
   * Generate complete CSS styles for a template with caching
   */
  async generateTemplateCSS(template: CVTemplate): Promise<string> {
    const tracker = performanceMetrics.startTemplateGeneration(template.id);
    
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(template);
      
      // Try to get from cache first
      const cached = enhancedCacheManager.getCSS(cacheKey);
      if (cached) {
        tracker.markCacheHit();
        tracker.complete();
        return cached;
      }
      
      console.warn(`🎨 [TEMPLATE CSS] Generating CSS for ${template.name}`);
      
      // Generate CSS components
      const cssComponents = await this.generateCSSComponents(template);
      
      // Combine all CSS
      const css = this.combineCSS(template, cssComponents);
      
      // Cache the result
      enhancedCacheManager.setCSS(cacheKey, css);
      
      tracker.complete(css.length);
      return css;
      
    } catch (error) {
      tracker.recordError();
      tracker.complete();
      console.error(`Failed to generate CSS for template ${template.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate CSS components in parallel for better performance
   */
  private async generateCSSComponents(template: CVTemplate): Promise<{
    rootVariables: string;
    baseStyles: string;
    layoutStyles: string;
    typographyStyles: string;
    colorStyles: string;
    componentStyles: string;
    responsiveStyles: string;
    animationStyles: string;
    accessibilityStyles: string;
    printStyles: string;
  }> {
    // Generate CSS components in parallel where possible
    const [
      rootVariables,
      baseStyles,
      layoutStyles,
      typographyStyles,
      colorStyles,
      componentStyles,
      responsiveStyles,
      animationStyles,
      accessibilityStyles,
      printStyles
    ] = await Promise.all([
      this.generateRootVariables(template),
      TemplateBaseStylesGenerator.generate(template),
      TemplateLayoutGenerator.generate(template),
      TemplateTypographyGenerator.generate(template),
      TemplateColorGenerator.generate(template),
      TemplateComponentGenerator.generate(template),
      this.generateResponsiveStyles(template),
      this.generateAnimationStyles(template),
      this.generateAccessibilityStyles(template),
      this.generatePrintStyles(template)
    ]);

    return {
      rootVariables,
      baseStyles,
      layoutStyles,
      typographyStyles,
      colorStyles,
      componentStyles,
      responsiveStyles,
      animationStyles,
      accessibilityStyles,
      printStyles
    };
  }

  /**
   * Combine CSS components into final stylesheet
   */
  private combineCSS(template: CVTemplate, components: any): string {
    return `
      /* Template: ${template.name} (${template.category}) */
      /* Generated: ${new Date().toISOString()} */
      
      ${components.rootVariables}
      ${components.baseStyles}
      ${components.layoutStyles}
      ${components.typographyStyles}
      ${components.colorStyles}
      ${components.componentStyles}
      ${components.responsiveStyles}
      ${components.animationStyles}
      ${components.accessibilityStyles}
      ${components.printStyles}
    `.trim();
  }

  /**
   * Generate cache key for template
   */
  private generateCacheKey(template: CVTemplate): string {
    const keyData = {
      id: template.id,
      version: template.metadata.version,
      updated: template.metadata.updated,
      // Include relevant configuration that affects CSS
      colorPalette: template.styling.colorPalette.primary,
      typography: template.styling.typography.headings.fontFamily
    };
    
    return `css-${template.id}-${btoa(JSON.stringify(keyData)).slice(0, 16)}`;
  }

  /**
   * Generate CSS root variables
   */
  private async generateRootVariables(template: CVTemplate): Promise<string> {
    const { colorPalette, typography, spacing } = template.styling;
    
    return `
      :root {
        /* Color Palette */
        --primary-color: ${colorPalette.primary};
        --secondary-color: ${colorPalette.secondary};
        --accent-color: ${colorPalette.accent};
        --background-color: ${colorPalette.background};
        --surface-color: ${colorPalette.surface};
        --text-primary: ${colorPalette.text.primary};
        --text-secondary: ${colorPalette.text.secondary};
        --border-color: ${colorPalette.border};
        
        /* Typography */
        --font-primary: ${typography.headings.fontFamily};
        --font-secondary: ${typography.body.fontFamily};
        --font-size-base: ${typography.body.fontSize};
        --line-height-base: ${typography.body.lineHeight};
        
        /* Spacing */
        --spacing-xs: ${spacing.xs};
        --spacing-sm: ${spacing.sm};
        --spacing-md: ${spacing.md};
        --spacing-lg: ${spacing.lg};
        --spacing-xl: ${spacing.xl};
        
        /* Template-specific variables */
        --template-id: "${template.id}";
        --template-category: "${template.category}";
      }
    `;
  }

  /**
   * Generate responsive styles
   */
  private async generateResponsiveStyles(template: CVTemplate): Promise<string> {
    return `
      /* Responsive Styles */
      @media (max-width: 768px) {
        .template-${template.id} {
          padding: var(--spacing-sm);
        }
        
        .template-${template.id} .cv-section {
          margin-bottom: var(--spacing-md);
        }
        
        .template-${template.id} .cv-header h1 {
          font-size: 1.5rem;
        }
      }
      
      @media (max-width: 480px) {
        .template-${template.id} {
          padding: var(--spacing-xs);
        }
        
        .template-${template.id} .cv-section {
          margin-bottom: var(--spacing-sm);
        }
      }
      
      @media print {
        .template-${template.id} {
          background: white;
          color: black;
        }
      }
    `;
  }

  /**
   * Generate animation styles
   */
  private async generateAnimationStyles(template: CVTemplate): Promise<string> {
    if (!template.styling.animations?.enabled) {
      return '';
    }

    return `
      /* Animation Styles */
      .template-${template.id} {
        --animation-duration: ${template.styling.animations.duration || '0.3s'};
        --animation-easing: ${template.styling.animations.easing || 'ease-in-out'};
      }
      
      .template-${template.id} .cv-section {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp var(--animation-duration) var(--animation-easing) forwards;
      }
      
      .template-${template.id} .cv-section:nth-child(1) { animation-delay: 0.1s; }
      .template-${template.id} .cv-section:nth-child(2) { animation-delay: 0.2s; }
      .template-${template.id} .cv-section:nth-child(3) { animation-delay: 0.3s; }
      .template-${template.id} .cv-section:nth-child(4) { animation-delay: 0.4s; }
      
      @keyframes fadeInUp {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      /* Hover animations */
      .template-${template.id} .cv-experience-item,
      .template-${template.id} .cv-education-item {
        transition: transform var(--animation-duration) var(--animation-easing);
      }
      
      .template-${template.id} .cv-experience-item:hover,
      .template-${template.id} .cv-education-item:hover {
        transform: translateX(8px);
      }
    `;
  }

  /**
   * Generate accessibility styles
   */
  private async generateAccessibilityStyles(template: CVTemplate): Promise<string> {
    return `
      /* Accessibility Styles */
      .template-${template.id} {
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          --border-color: currentColor;
          --text-secondary: currentColor;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Focus styles */
        :focus {
          outline: 2px solid var(--primary-color);
          outline-offset: 2px;
        }
        
        /* Screen reader support */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      }
    `;
  }

  /**
   * Generate print styles
   */
  private async generatePrintStyles(template: CVTemplate): Promise<string> {
    return `
      /* Print Styles */
      @media print {
        .template-${template.id} {
          background: white !important;
          color: black !important;
          font-size: 12pt;
          line-height: 1.4;
          margin: 0;
          padding: 0.5in;
          page-break-inside: avoid;
        }
        
        .template-${template.id} .cv-section {
          page-break-inside: avoid;
          margin-bottom: 0.25in;
        }
        
        .template-${template.id} .cv-header {
          border-bottom: 2pt solid black;
          padding-bottom: 0.125in;
          margin-bottom: 0.25in;
        }
        
        .template-${template.id} h1 {
          font-size: 18pt;
          margin: 0;
        }
        
        .template-${template.id} h2 {
          font-size: 14pt;
          margin: 0.125in 0;
        }
        
        .template-${template.id} h3 {
          font-size: 12pt;
          margin: 0.0625in 0;
        }
        
        /* Hide interactive elements */
        .template-${template.id} button,
        .template-${template.id} .interactive {
          display: none !important;
        }
        
        /* Ensure links are visible */
        .template-${template.id} a {
          color: black !important;
          text-decoration: underline !important;
        }
        
        /* Page breaks */
        .template-${template.id} .page-break {
          page-break-before: always;
        }
        
        .template-${template.id} .no-break {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Generate inline styles for template preview
   */
  async generateTemplateStyles(template: CVTemplate): Promise<string> {
    const css = await this.generateTemplateCSS(template);
    return `<style>${css}</style>`;
  }

  /**
   * Invalidate cache for template
   */
  invalidateTemplate(templateId: string): void {
    enhancedCacheManager.invalidate(`css-${templateId}-`, 'css');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return enhancedCacheManager.getStats();
  }

  /**
   * Clear all cached CSS
   */
  clearCache(): void {
    enhancedCacheManager.invalidate('css-', 'css');
  }
}

/**
 * Global CSS generator instance
 */
export const templateCSSGenerator = TemplateCSSGenerator.getInstance();

/**
 * Legacy compatibility function
 */
export async function generateTemplateCSS(template: CVTemplate): Promise<string> {
  return templateCSSGenerator.generateTemplateCSS(template);
}

/**
 * Legacy compatibility function for inline styles
 */
export async function generateTemplateStyles(template: CVTemplate): Promise<string> {
  return templateCSSGenerator.generateTemplateStyles(template);
}