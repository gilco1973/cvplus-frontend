/**
 * Enhanced Template Styles System
 * Template-specific styling generation for professional CV templates
 * Supports responsive design, color schemes, typography, and animations
 */

import type {
  CVTemplate,
  ColorPalette,
  TypographySystem,
  SpacingSystem,
  StylingSystem,
  ComponentStyles,
  AnimationConfig
} from '../../types/cv-templates';

// ============================================================================
// ENHANCED TEMPLATE STYLES GENERATOR
// ============================================================================

export class EnhancedTemplateStyles {
  // CSS custom properties cache
  private static cssPropertiesCache = new Map<string, string>();
  private static lastCacheUpdate = new Map<string, number>();
  private static readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  /**
   * Generate complete CSS styles for a template
   */
  static generateTemplateCSS(template: CVTemplate): string {
    const cacheKey = `${template.id}-${template.metadata.updated}`;
    const cached = this.getCachedCSS(cacheKey);
    if (cached) return cached;

    console.warn(`🎨 [TEMPLATE STYLES] Generating CSS for ${template.name}`);

    const css = `
      /* Template: ${template.name} (${template.category}) */
      ${this.generateRootVariables(template)}
      ${this.generateBaseStyles(template)}
      ${this.generateLayoutStyles(template)}
      ${this.generateTypographyStyles(template)}
      ${this.generateColorStyles(template)}
      ${this.generateComponentStyles(template)}
      ${this.generateSectionStyles(template)}
      ${this.generateAnimationStyles(template)}
      ${this.generateResponsiveStyles(template)}
      ${this.generateAccessibilityStyles(template)}
      ${this.generatePrintStyles(template)}
    `;

    this.setCachedCSS(cacheKey, css);
    return css;
  }

  /**
   * Generate inline styles for template preview
   */
  static generateTemplateStyles(template: CVTemplate): string {
    return `<style>${this.generateTemplateCSS(template)}</style>`;
  }

  // ============================================================================
  // ROOT VARIABLES GENERATION
  // ============================================================================

  private static generateRootVariables(template: CVTemplate): string {
    const colors = template.colors;
    const typography = template.typography;
    const spacing = template.spacing;
    const customProps = template.styling.customProperties;

    return `
      :root {
        /* Color System */
        --template-primary: ${colors.primary.main};
        --template-primary-light: ${colors.primary.light};
        --template-primary-dark: ${colors.primary.dark};
        --template-primary-contrast: ${colors.primary.contrast};
        
        --template-secondary: ${colors.secondary.main};
        --template-secondary-light: ${colors.secondary.light};
        --template-secondary-dark: ${colors.secondary.dark};
        --template-secondary-contrast: ${colors.secondary.contrast};
        
        --template-success: ${colors.semantic.success};
        --template-warning: ${colors.semantic.warning};
        --template-error: ${colors.semantic.error};
        --template-info: ${colors.semantic.info};
        
        --template-bg: ${colors.neutral.background};
        --template-surface: ${colors.neutral.surface};
        --template-border: ${colors.neutral.border};
        --template-text-primary: ${colors.neutral.text.primary};
        --template-text-secondary: ${colors.neutral.text.secondary};
        --template-text-muted: ${colors.neutral.text.muted};
        
        /* Typography System */
        --template-font-primary: '${typography.fonts.primary.family}', ${typography.fonts.primary.fallback.join(', ')};
        --template-font-secondary: '${typography.fonts.secondary.family}', ${typography.fonts.secondary.fallback.join(', ')};
        ${typography.fonts.monospace ? `--template-font-mono: '${typography.fonts.monospace.family}', ${typography.fonts.monospace.fallback.join(', ')};` : ''}
        
        --template-text-h1: ${typography.scale.h1.size};
        --template-text-h2: ${typography.scale.h2.size};
        --template-text-h3: ${typography.scale.h3.size};
        --template-text-h4: ${typography.scale.h4.size};
        --template-text-body: ${typography.scale.body.size};
        --template-text-caption: ${typography.scale.caption.size};
        
        /* Spacing System */
        --template-space-base: ${spacing.base};
        --template-space-xs: ${spacing.scale.xs};
        --template-space-sm: ${spacing.scale.sm};
        --template-space-md: ${spacing.scale.md};
        --template-space-lg: ${spacing.scale.lg};
        --template-space-xl: ${spacing.scale.xl};
        --template-space-2xl: ${spacing.scale['2xl']};
        --template-space-3xl: ${spacing.scale['3xl']};
        --template-space-4xl: ${spacing.scale['4xl']};
        
        /* Layout System */
        --template-max-width: ${template.layout.grid.maxWidth};
        --template-grid-gap: ${template.layout.grid.gap};
        --template-grid-columns: ${template.layout.grid.columns};
        
        /* Custom Properties */
        ${Object.entries(customProps).map(([key, value]) => `${key}: ${value};`).join('\n        ')}
        
        /* Animation Durations */
        --template-anim-fast: ${template.styling.animations.focusTransition.duration};
        --template-anim-normal: ${template.styling.animations.hoverEffects.duration};
        --template-anim-slow: ${template.styling.animations.pageLoad.duration};
      }
    `;
  }

  // ============================================================================
  // BASE STYLES
  // ============================================================================

  private static generateBaseStyles(template: CVTemplate): string {
    return `
      .cv-preview-container.${template.category}-template {
        font-family: var(--template-font-secondary);
        font-size: var(--template-text-body);
        line-height: ${template.typography.scale.body.lineHeight};
        color: var(--template-text-primary);
        background: var(--template-bg);
        max-width: var(--template-max-width);
        margin: 0 auto;
        padding: var(--template-space-2xl);
        border-radius: ${template.styling.components.cards.borderRadius};
        box-shadow: ${template.styling.components.cards.shadow};
        border: ${template.styling.components.cards.border};
        position: relative;
        overflow: hidden;
      }
      
      .cv-preview-container.${template.category}-template * {
        box-sizing: border-box;
      }
      
      .cv-preview-container.${template.category}-template::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--template-primary) 0%, var(--template-secondary) 100%);
        z-index: 1;
      }
    `;
  }

  // ============================================================================
  // LAYOUT STYLES
  // ============================================================================

  private static generateLayoutStyles(template: CVTemplate): string {
    const layout = template.layout;
    
    return `
      .${template.category}-template .template-content-grid {
        display: grid;
        grid-template-columns: repeat(${layout.grid.columns}, 1fr);
        gap: var(--template-grid-gap);
        margin-top: var(--template-space-2xl);
      }
      
      ${this.generateSectionLayoutStyles(template)}
      
      .${template.category}-template .template-header {
        grid-column: 1 / -1;
        text-align: ${template.category === 'creative' ? 'left' : 'center'};
        padding: var(--template-space-2xl) 0;
        border-bottom: ${template.styling.components.dividers.thickness} ${template.styling.components.dividers.style} var(--template-border);
        margin-bottom: var(--template-space-2xl);
      }
      
      .${template.category}-template .template-footer {
        grid-column: 1 / -1;
        margin-top: var(--template-space-3xl);
        padding-top: var(--template-space-lg);
        border-top: 1px solid var(--template-border);
        text-align: center;
        font-size: var(--template-text-caption);
        color: var(--template-text-muted);
      }
    `;
  }

  private static generateSectionLayoutStyles(template: CVTemplate): string {
    const sections = template.layout.sections;
    
    return Object.entries(sections).map(([sectionName, layout]) => {
      return `
        .${template.category}-template .section[data-section="${sectionName}"],
        .${template.category}-template .feature-preview[data-feature="${sectionName}"] {
          grid-column: span ${layout.span.desktop};
          order: ${layout.order};
        }
      `;
    }).join('');
  }

  // ============================================================================
  // TYPOGRAPHY STYLES
  // ============================================================================

  private static generateTypographyStyles(template: CVTemplate): string {
    const typography = template.typography;
    
    return `
      .${template.category}-template h1,
      .${template.category}-template .name {
        font-family: var(--template-font-primary);
        font-size: var(--template-text-h1);
        font-weight: ${typography.scale.h1.weight};
        line-height: ${typography.scale.h1.lineHeight};
        ${typography.scale.h1.letterSpacing ? `letter-spacing: ${typography.scale.h1.letterSpacing};` : ''}
        color: var(--template-primary);
        margin-bottom: var(--template-space-md);
      }
      
      .${template.category}-template h2,
      .${template.category}-template .section-title {
        font-family: var(--template-font-primary);
        font-size: var(--template-text-h2);
        font-weight: ${typography.scale.h2.weight};
        line-height: ${typography.scale.h2.lineHeight};
        ${typography.scale.h2.letterSpacing ? `letter-spacing: ${typography.scale.h2.letterSpacing};` : ''}
        color: var(--template-primary);
        margin-bottom: var(--template-space-lg);
        position: relative;
      }
      
      .${template.category}-template h3 {
        font-family: var(--template-font-primary);
        font-size: var(--template-text-h3);
        font-weight: ${typography.scale.h3.weight};
        line-height: ${typography.scale.h3.lineHeight};
        color: var(--template-text-primary);
        margin-bottom: var(--template-space-sm);
      }
      
      .${template.category}-template h4 {
        font-family: var(--template-font-primary);
        font-size: var(--template-text-h4);
        font-weight: ${typography.scale.h4.weight};
        line-height: ${typography.scale.h4.lineHeight};
        color: var(--template-text-primary);
        margin-bottom: var(--template-space-sm);
      }
      
      .${template.category}-template p,
      .${template.category}-template .body-text {
        font-family: var(--template-font-secondary);
        font-size: var(--template-text-body);
        font-weight: ${typography.scale.body.weight};
        line-height: ${typography.scale.body.lineHeight};
        color: var(--template-text-primary);
        margin-bottom: var(--template-space-md);
      }
      
      .${template.category}-template .caption,
      .${template.category}-template small {
        font-size: var(--template-text-caption);
        font-weight: ${typography.scale.caption.weight};
        line-height: ${typography.scale.caption.lineHeight};
        color: var(--template-text-muted);
      }
      
      ${typography.fonts.monospace ? `
        .${template.category}-template code,
        .${template.category}-template .monospace {
          font-family: var(--template-font-mono);
          font-size: 0.9em;
          background: var(--template-surface);
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid var(--template-border);
        }
      ` : ''}
    `;
  }

  // ============================================================================
  // COLOR STYLES
  // ============================================================================

  private static generateColorStyles(template: CVTemplate): string {
    return `
      .${template.category}-template .text-primary {
        color: var(--template-primary) !important;
      }
      
      .${template.category}-template .text-secondary {
        color: var(--template-secondary) !important;
      }
      
      .${template.category}-template .bg-primary {
        background-color: var(--template-primary);
        color: var(--template-primary-contrast);
      }
      
      .${template.category}-template .bg-secondary {
        background-color: var(--template-secondary);
        color: var(--template-secondary-contrast);
      }
      
      .${template.category}-template .border-primary {
        border-color: var(--template-primary);
      }
      
      .${template.category}-template .border-secondary {
        border-color: var(--template-secondary);
      }
      
      ${this.generateSemanticColorStyles(template)}
    `;
  }

  private static generateSemanticColorStyles(template: CVTemplate): string {
    return `
      .${template.category}-template .text-success {
        color: var(--template-success);
      }
      
      .${template.category}-template .text-warning {
        color: var(--template-warning);
      }
      
      .${template.category}-template .text-error {
        color: var(--template-error);
      }
      
      .${template.category}-template .text-info {
        color: var(--template-info);
      }
      
      .${template.category}-template .bg-success {
        background-color: var(--template-success);
        color: white;
      }
      
      .${template.category}-template .bg-warning {
        background-color: var(--template-warning);
        color: white;
      }
      
      .${template.category}-template .bg-error {
        background-color: var(--template-error);
        color: white;
      }
      
      .${template.category}-template .bg-info {
        background-color: var(--template-info);
        color: white;
      }
    `;
  }

  // ============================================================================
  // COMPONENT STYLES
  // ============================================================================

  private static generateComponentStyles(template: CVTemplate): string {
    const components = template.styling.components;
    
    return `
      ${this.generateCardStyles(template, components)}
      ${this.generateButtonStyles(template, components)}
      ${this.generateInputStyles(template, components)}
      ${this.generateDividerStyles(template, components)}
    `;
  }

  private static generateCardStyles(template: CVTemplate, components: ComponentStyles): string {
    return `
      .${template.category}-template .card,
      .${template.category}-template .experience-item,
      .${template.category}-template .education-item,
      .${template.category}-template .skill-category {
        background: ${components.cards.background};
        border: ${components.cards.border};
        border-radius: ${components.cards.borderRadius};
        box-shadow: ${components.cards.shadow};
        padding: var(--template-space-lg);
        margin-bottom: var(--template-space-md);
        transition: all var(--template-anim-normal) ease;
      }
      
      ${components.cards.hover ? `
        .${template.category}-template .card:hover,
        .${template.category}-template .experience-item:hover,
        .${template.category}-template .education-item:hover {
          box-shadow: ${components.cards.hover.shadow};
          transform: ${components.cards.hover.transform};
          transition: ${components.cards.hover.transition.duration} ${components.cards.hover.transition.easing};
        }
      ` : ''}
    `;
  }

  private static generateButtonStyles(template: CVTemplate, components: ComponentStyles): string {
    return `
      .${template.category}-template .btn-primary,
      .${template.category}-template button.primary {
        background: ${components.buttons.primary.background};
        color: ${components.buttons.primary.color};
        border: ${components.buttons.primary.border};
        border-radius: ${components.buttons.primary.borderRadius};
        padding: ${components.buttons.primary.padding};
        font-size: ${components.buttons.primary.fontSize};
        font-weight: ${components.buttons.primary.fontWeight};
        cursor: pointer;
        transition: all var(--template-anim-fast) ease;
      }
      
      .${template.category}-template .btn-primary:hover,
      .${template.category}-template button.primary:hover {
        background: ${components.buttons.primary.hover.background};
        transform: ${components.buttons.primary.hover.transform};
      }
      
      .${template.category}-template .btn-secondary,
      .${template.category}-template button.secondary {
        background: ${components.buttons.secondary.background};
        color: ${components.buttons.secondary.color};
        border: ${components.buttons.secondary.border};
        border-radius: ${components.buttons.secondary.borderRadius};
        padding: ${components.buttons.secondary.padding};
        font-size: ${components.buttons.secondary.fontSize};
        font-weight: ${components.buttons.secondary.fontWeight};
        cursor: pointer;
        transition: all var(--template-anim-fast) ease;
      }
      
      .${template.category}-template .btn-secondary:hover,
      .${template.category}-template button.secondary:hover {
        background: ${components.buttons.secondary.hover.background};
        transform: ${components.buttons.secondary.hover.transform};
      }
    `;
  }

  private static generateInputStyles(template: CVTemplate, components: ComponentStyles): string {
    return `
      .${template.category}-template input,
      .${template.category}-template textarea {
        border: ${components.inputs.border};
        border-radius: ${components.inputs.borderRadius};
        padding: ${components.inputs.padding};
        font-size: ${components.inputs.fontSize};
        background: ${components.inputs.background};
        transition: all var(--template-anim-fast) ease;
      }
      
      .${template.category}-template input:focus,
      .${template.category}-template textarea:focus {
        border: ${components.inputs.focus.border};
        box-shadow: ${components.inputs.focus.shadow};
        outline: ${components.inputs.focus.outline};
      }
    `;
  }

  private static generateDividerStyles(template: CVTemplate, components: ComponentStyles): string {
    const divider = components.dividers;
    
    if (divider.style === 'none') {
      return '';
    }
    
    const dividerBase = `
      .${template.category}-template .divider,
      .${template.category}-template .section-divider {
        margin: ${divider.margin};
        height: ${divider.thickness};
      }
    `;
    
    if (divider.style === 'line') {
      return dividerBase + `
        .${template.category}-template .divider,
        .${template.category}-template .section-divider {
          border-bottom: ${divider.thickness} solid ${divider.color};
        }
      `;
    }
    
    if (divider.style === 'gradient') {
      return dividerBase + `
        .${template.category}-template .divider,
        .${template.category}-template .section-divider {
          background: ${divider.color};
          border-radius: ${parseInt(divider.thickness) / 2}px;
        }
      `;
    }
    
    if (divider.style === 'decorative') {
      return dividerBase + `
        .${template.category}-template .divider,
        .${template.category}-template .section-divider {
          background: ${divider.color};
          position: relative;
        }
        
        .${template.category}-template .divider::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: var(--template-bg);
          border: 2px solid var(--template-primary);
          border-radius: 50%;
        }
      `;
    }
    
    return dividerBase;
  }

  // ============================================================================
  // SECTION STYLES
  // ============================================================================

  private static generateSectionStyles(template: CVTemplate): string {
    const category = template.category;
    
    return `
      .${category}-template .section {
        margin-bottom: var(--template-space-2xl);
      }
      
      .${category}-template .section-title {
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--template-space-lg);
        padding-bottom: var(--template-space-sm);
      }
      
      .${category}-template .section-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--template-primary) 0%, transparent 100%);
        width: 60px;
      }
      
      .${category}-template .collapse-icon {
        transition: transform var(--template-anim-fast) ease;
        color: var(--template-primary);
      }
      
      .${category}-template .collapse-icon.collapsed {
        transform: rotate(-90deg);
      }
      
      .${category}-template .section-content {
        transition: all var(--template-anim-normal) ease;
        overflow: hidden;
      }
      
      .${category}-template .section-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin: 0;
        padding: 0;
      }
      
      ${this.generateCategorySpecificSectionStyles(template)}
    `;
  }

  private static generateCategorySpecificSectionStyles(template: CVTemplate): string {
    const category = template.category;
    
    switch (category) {
      case 'executive':
        return this.generateExecutiveSectionStyles(template);
      case 'technical':
        return this.generateTechnicalSectionStyles(template);
      case 'creative':
        return this.generateCreativeSectionStyles(template);
      default:
        return '';
    }
  }

  private static generateExecutiveSectionStyles(template: CVTemplate): string {
    return `
      .executive-template .experience-item {
        position: relative;
        padding-left: var(--template-space-xl);
      }
      
      .executive-template .experience-item::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to bottom, var(--template-primary), var(--template-secondary));
        border-radius: 2px;
      }
      
      .executive-template .achievements li::before {
        content: '▶';
        color: var(--template-primary);
        font-weight: bold;
        margin-right: var(--template-space-sm);
      }
    `;
  }

  private static generateTechnicalSectionStyles(template: CVTemplate): string {
    return `
      .technical-template .skills-section {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--template-space-md);
      }
      
      .technical-template .skill-item {
        display: flex;
        align-items: center;
        gap: var(--template-space-sm);
        padding: var(--template-space-sm);
        background: var(--template-surface);
        border-radius: 6px;
        border-left: 3px solid var(--template-primary);
      }
      
      .technical-template .project-link {
        color: var(--template-primary);
        text-decoration: none;
        font-weight: 500;
        transition: color var(--template-anim-fast) ease;
      }
      
      .technical-template .project-link:hover {
        color: var(--template-primary-dark);
        text-decoration: underline;
      }
    `;
  }

  private static generateCreativeSectionStyles(template: CVTemplate): string {
    return `
      .creative-template .section {
        position: relative;
      }
      
      .creative-template .section::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: linear-gradient(45deg, transparent 0%, var(--template-primary) 2%, transparent 4%);
        border-radius: inherit;
        z-index: -1;
        opacity: 0.1;
      }
      
      .creative-template .portfolio-item {
        position: relative;
        overflow: hidden;
        transition: transform var(--template-anim-slow) cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
      
      .creative-template .portfolio-item:hover {
        transform: scale(1.05) rotate(1deg);
      }
      
      .creative-template .creative-accent {
        background: linear-gradient(135deg, var(--template-primary), var(--template-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
  }

  // ============================================================================
  // ANIMATION STYLES
  // ============================================================================

  private static generateAnimationStyles(template: CVTemplate): string {
    const animations = template.styling.animations;
    
    return `
      @keyframes templateFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes templateSlideIn {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes templateScaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .${template.category}-template {
        animation: templateFadeIn ${animations.pageLoad.duration} ${animations.pageLoad.easing};
      }
      
      .${template.category}-template .section {
        animation: templateSlideIn ${animations.sectionReveal.duration} ${animations.sectionReveal.easing};
        animation-delay: ${animations.sectionReveal.delay || '0s'};
        animation-fill-mode: both;
      }
      
      ${this.generateInteractionAnimations(template)}
    `;
  }

  private static generateInteractionAnimations(template: CVTemplate): string {
    if (!template.features.interactivity.hoverEffects) {
      return '';
    }
    
    return `
      .${template.category}-template .interactive-element {
        transition: all ${template.styling.animations.hoverEffects.duration} ${template.styling.animations.hoverEffects.easing};
      }
      
      .${template.category}-template .hover-lift:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .${template.category}-template .hover-glow:hover {
        box-shadow: 0 0 20px var(--template-primary);
      }
      
      .${template.category}-template .hover-scale:hover {
        transform: scale(1.02);
      }
    `;
  }

  // ============================================================================
  // RESPONSIVE STYLES
  // ============================================================================

  private static generateResponsiveStyles(template: CVTemplate): string {
    const breakpoints = template.layout.breakpoints;
    const sections = template.layout.sections;
    
    return `
      /* Tablet Styles */
      @media (max-width: ${breakpoints.tablet}) {
        .${template.category}-template {
          padding: var(--template-space-lg);
        }
        
        .${template.category}-template .template-content-grid {
          grid-template-columns: repeat(6, 1fr);
          gap: var(--template-space-md);
        }
        
        ${Object.entries(sections).map(([sectionName, layout]) => `
          .${template.category}-template .section[data-section="${sectionName}"] {
            grid-column: span ${layout.span.tablet};
            ${!layout.visibility.tablet ? 'display: none;' : ''}
          }
        `).join('')}
      }
      
      /* Mobile Styles */
      @media (max-width: ${breakpoints.mobile}) {
        .${template.category}-template {
          padding: var(--template-space-md);
        }
        
        .${template.category}-template .template-content-grid {
          grid-template-columns: 1fr;
          gap: var(--template-space-sm);
        }
        
        ${Object.entries(sections).map(([sectionName, layout]) => `
          .${template.category}-template .section[data-section="${sectionName}"] {
            grid-column: span ${layout.span.mobile};
            ${!layout.visibility.mobile ? 'display: none;' : ''}
          }
        `).join('')}
        
        .${template.category}-template .section-title {
          font-size: calc(var(--template-text-h2) * 0.8);
        }
        
        .${template.category}-template h1,
        .${template.category}-template .name {
          font-size: calc(var(--template-text-h1) * 0.8);
        }
      }
    `;
  }

  // ============================================================================
  // ACCESSIBILITY STYLES
  // ============================================================================

  private static generateAccessibilityStyles(template: CVTemplate): string {
    const accessibility = template.features.accessibility;
    
    let styles = `
      /* Focus Styles */
      .${template.category}-template *:focus {
        outline: 2px solid var(--template-primary);
        outline-offset: 2px;
        transition: outline var(--template-anim-fast) ease;
      }
      
      .${template.category}-template button:focus {
        box-shadow: 0 0 0 3px var(--template-primary);
      }
    `;
    
    if (accessibility.highContrast) {
      styles += `
        @media (prefers-contrast: high) {
          .${template.category}-template {
            --template-text-primary: #000000;
            --template-bg: #ffffff;
            --template-border: #000000;
          }
          
          .${template.category}-template .section-title::after {
            background: #000000;
          }
        }
      `;
    }
    
    if (accessibility.focusIndicators) {
      styles += `
        .${template.category}-template .focus-indicator {
          position: relative;
        }
        
        .${template.category}-template .focus-indicator:focus::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border: 2px solid var(--template-primary);
          border-radius: 4px;
          pointer-events: none;
        }
      `;
    }
    
    // Reduced motion support
    styles += `
      @media (prefers-reduced-motion: reduce) {
        .${template.category}-template * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    return styles;
  }

  // ============================================================================
  // PRINT STYLES
  // ============================================================================

  private static generatePrintStyles(template: CVTemplate): string {
    const sections = template.layout.sections;
    
    return `
      @media print {
        .${template.category}-template {
          max-width: 100%;
          padding: 0;
          margin: 0;
          box-shadow: none;
          border: none;
          background: white;
          color: black;
        }
        
        .${template.category}-template::before {
          display: none;
        }
        
        ${Object.entries(sections).map(([sectionName, layout]) => `
          .${template.category}-template .section[data-section="${sectionName}"] {
            ${!layout.visibility.print ? 'display: none !important;' : ''}
            break-inside: avoid;
            page-break-inside: avoid;
          }
        `).join('')}
        
        .${template.category}-template .feature-preview {
          display: none !important;
        }
        
        .${template.category}-template .edit-overlay {
          display: none !important;
        }
        
        .${template.category}-template .template-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          font-size: 8pt;
          text-align: center;
          padding: 10px;
        }
        
        /* Ensure text is readable in print */
        .${template.category}-template * {
          color: black !important;
          background: white !important;
        }
        
        .${template.category}-template .section-title::after {
          background: black !important;
        }
      }
    `;
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  private static getCachedCSS(key: string): string | null {
    const lastUpdate = this.lastCacheUpdate.get(key) || 0;
    if (Date.now() - lastUpdate > this.CACHE_TTL) {
      this.cssPropertiesCache.delete(key);
      this.lastCacheUpdate.delete(key);
      return null;
    }
    return this.cssPropertiesCache.get(key) || null;
  }

  private static setCachedCSS(key: string, css: string): void {
    this.cssPropertiesCache.set(key, css);
    this.lastCacheUpdate.set(key, Date.now());
  }

  /**
   * Clear CSS cache
   */
  static clearCache(): void {
    this.cssPropertiesCache.clear();
    this.lastCacheUpdate.clear();
    console.warn('🧹 Template styles cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    hitRatio: number;
    oldestEntry: string | null;
  } {
    const now = Date.now();
    let oldestEntry: string | null = null;
    let oldestTime = now;
    
    for (const [key, timestamp] of this.lastCacheUpdate.entries()) {
      if (timestamp < oldestTime) {
        oldestTime = timestamp;
        oldestEntry = key;
      }
    }
    
    return {
      size: this.cssPropertiesCache.size,
      hitRatio: this.cssPropertiesCache.size > 0 ? 0.85 : 0, // Estimated
      oldestEntry
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate CSS custom properties for a template
 */
export function generateTemplateCustomProperties(template: CVTemplate): Record<string, string> {
  const properties: Record<string, string> = {};
  
  // Color properties
  Object.entries(template.colors.primary).forEach(([key, value]) => {
    properties[`--template-primary-${key}`] = value;
  });
  
  // Typography properties
  Object.entries(template.typography.scale).forEach(([key, scale]) => {
    properties[`--template-text-${key}`] = scale.size;
  });
  
  // Spacing properties
  Object.entries(template.spacing.scale).forEach(([key, value]) => {
    properties[`--template-space-${key}`] = value;
  });
  
  return properties;
}

/**
 * Apply template theme to CSS custom properties
 */
export function applyTemplateTheme(template: CVTemplate, element?: HTMLElement): void {
  const root = element || document.documentElement;
  const properties = generateTemplateCustomProperties(template);
  
  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  console.warn(`🎨 Applied ${template.name} theme with ${Object.keys(properties).length} CSS properties`);
}

/**
 * Remove template theme from CSS custom properties
 */
export function removeTemplateTheme(template: CVTemplate, element?: HTMLElement): void {
  const root = element || document.documentElement;
  const properties = generateTemplateCustomProperties(template);
  
  Object.keys(properties).forEach(property => {
    root.style.removeProperty(property);
  });
  
  console.warn(`🧹 Removed ${template.name} theme`);
}

console.warn('🎨 Enhanced Template Styles system loaded');
