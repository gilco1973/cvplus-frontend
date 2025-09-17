/**
 * Template Typography Generator
 * Generates typography-specific CSS styles for templates
 */

import type { CVTemplate } from '../../types/cv-templates';

export class TemplateTypographyGenerator {
  /**
   * Generate typography styles for template
   */
  static async generate(template: CVTemplate): Promise<string> {
    const typographyStyles = [
      this.generateHeadingStyles(template),
      this.generateBodyStyles(template),
      this.generateSpecialTextStyles(template),
      this.generateFontLoadingStyles(template),
      this.generateResponsiveTypography(template)
    ];

    return typographyStyles.join('\n\n');
  }

  /**
   * Generate heading styles
   */
  private static generateHeadingStyles(template: CVTemplate): string {
    const { typography, spacing } = template.styling;
    
    return `
      /* Heading Styles */
      .template-${template.id} h1,
      .template-${template.id} .h1 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h1?.fontSize || '2.5rem'};
        font-weight: ${typography.headings.h1?.fontWeight || '700'};
        line-height: ${typography.headings.h1?.lineHeight || '1.2'};
        color: var(--text-primary);
        margin-bottom: ${spacing.md};
        letter-spacing: ${typography.headings.h1?.letterSpacing || '0'};
      }
      
      .template-${template.id} h2,
      .template-${template.id} .h2 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h2?.fontSize || '2rem'};
        font-weight: ${typography.headings.h2?.fontWeight || '600'};
        line-height: ${typography.headings.h2?.lineHeight || '1.3'};
        color: var(--primary-color);
        margin-bottom: ${spacing.sm};
        letter-spacing: ${typography.headings.h2?.letterSpacing || '0'};
      }
      
      .template-${template.id} h3,
      .template-${template.id} .h3 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h3?.fontSize || '1.5rem'};
        font-weight: ${typography.headings.h3?.fontWeight || '600'};
        line-height: ${typography.headings.h3?.lineHeight || '1.4'};
        color: var(--text-primary);
        margin-bottom: ${spacing.sm};
        letter-spacing: ${typography.headings.h3?.letterSpacing || '0'};
      }
      
      .template-${template.id} h4,
      .template-${template.id} .h4 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h4?.fontSize || '1.25rem'};
        font-weight: ${typography.headings.h4?.fontWeight || '600'};
        line-height: ${typography.headings.h4?.lineHeight || '1.4'};
        color: var(--text-primary);
        margin-bottom: ${spacing.xs};
        letter-spacing: ${typography.headings.h4?.letterSpacing || '0'};
      }
      
      .template-${template.id} h5,
      .template-${template.id} .h5 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h5?.fontSize || '1.125rem'};
        font-weight: ${typography.headings.h5?.fontWeight || '600'};
        line-height: ${typography.headings.h5?.lineHeight || '1.4'};
        color: var(--text-primary);
        margin-bottom: ${spacing.xs};
        letter-spacing: ${typography.headings.h5?.letterSpacing || '0'};
      }
      
      .template-${template.id} h6,
      .template-${template.id} .h6 {
        font-family: ${typography.headings.fontFamily};
        font-size: ${typography.headings.h6?.fontSize || '1rem'};
        font-weight: ${typography.headings.h6?.fontWeight || '600'};
        line-height: ${typography.headings.h6?.lineHeight || '1.4'};
        color: var(--text-primary);
        margin-bottom: ${spacing.xs};
        letter-spacing: ${typography.headings.h6?.letterSpacing || '0'};
        text-transform: uppercase;
      }
    `;
  }

  /**
   * Generate body text styles
   */
  private static generateBodyStyles(template: CVTemplate): string {
    const { typography, spacing } = template.styling;
    
    return `
      /* Body Text Styles */
      .template-${template.id} p,
      .template-${template.id} .body-text {
        font-family: ${typography.body.fontFamily};
        font-size: ${typography.body.fontSize};
        font-weight: ${typography.body.fontWeight || '400'};
        line-height: ${typography.body.lineHeight};
        color: var(--text-primary);
        margin-bottom: ${spacing.sm};
        letter-spacing: ${typography.body.letterSpacing || '0'};
      }
      
      .template-${template.id} .lead {
        font-size: calc(${typography.body.fontSize} * 1.25);
        font-weight: 300;
        line-height: 1.6;
        color: var(--text-secondary);
        margin-bottom: ${spacing.md};
      }
      
      .template-${template.id} .small,
      .template-${template.id} small {
        font-size: calc(${typography.body.fontSize} * 0.875);
        color: var(--text-secondary);
        line-height: 1.4;
      }
      
      .template-${template.id} .caption {
        font-size: calc(${typography.body.fontSize} * 0.75);
        color: var(--text-secondary);
        line-height: 1.3;
        font-style: italic;
      }
      
      .template-${template.id} .subtitle {
        font-size: calc(${typography.body.fontSize} * 1.125);
        font-weight: 500;
        color: var(--primary-color);
        line-height: 1.4;
        margin-bottom: ${spacing.xs};
      }
      
      /* List Styles */
      .template-${template.id} ul,
      .template-${template.id} ol {
        font-family: ${typography.body.fontFamily};
        font-size: ${typography.body.fontSize};
        line-height: ${typography.body.lineHeight};
        color: var(--text-primary);
        margin-bottom: ${spacing.sm};
        padding-left: ${spacing.lg};
      }
      
      .template-${template.id} li {
        margin-bottom: ${spacing.xs};
      }
      
      .template-${template.id} li:last-child {
        margin-bottom: 0;
      }
      
      /* Blockquote Styles */
      .template-${template.id} blockquote {
        font-family: ${typography.body.fontFamily};
        font-size: calc(${typography.body.fontSize} * 1.125);
        font-style: italic;
        line-height: 1.6;
        color: var(--text-secondary);
        margin: ${spacing.md} 0;
        padding: ${spacing.md};
        border-left: 4px solid var(--primary-color);
        background: var(--surface-color);
        border-radius: 0 8px 8px 0;
      }
      
      .template-${template.id} blockquote cite {
        display: block;
        font-size: calc(${typography.body.fontSize} * 0.875);
        font-style: normal;
        color: var(--text-secondary);
        margin-top: ${spacing.xs};
      }
      
      .template-${template.id} blockquote cite::before {
        content: '— ';
      }
    `;
  }

  /**
   * Generate special text styles
   */
  private static generateSpecialTextStyles(template: CVTemplate): string {
    const { typography, spacing } = template.styling;
    
    return `
      /* Special Text Styles */
      .template-${template.id} .highlight {
        background: linear-gradient(120deg, transparent 0%, transparent 50%, var(--accent-color) 50%);
        background-size: 240% 100%;
        background-position: 100% 0;
        transition: background-position 0.3s ease;
        padding: 0 4px;
        font-weight: 600;
      }
      
      .template-${template.id} .highlight:hover {
        background-position: 0 0;
        color: white;
      }
      
      .template-${template.id} .accent-text {
        color: var(--accent-color);
        font-weight: 600;
      }
      
      .template-${template.id} .muted-text {
        color: var(--text-secondary);
        font-size: calc(${typography.body.fontSize} * 0.9);
      }
      
      .template-${template.id} .code {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: calc(${typography.body.fontSize} * 0.875);
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        padding: 2px 6px;
        border-radius: 4px;
        color: var(--primary-color);
      }
      
      .template-${template.id} .badge {
        display: inline-block;
        font-size: calc(${typography.body.fontSize} * 0.75);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 4px 8px;
        border-radius: 12px;
        background: var(--primary-color);
        color: white;
        line-height: 1;
      }
      
      .template-${template.id} .badge.badge-secondary {
        background: var(--secondary-color);
      }
      
      .template-${template.id} .badge.badge-accent {
        background: var(--accent-color);
      }
      
      .template-${template.id} .badge.badge-outline {
        background: transparent;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
      }
      
      /* Link Styles */
      .template-${template.id} a {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        position: relative;
        transition: color 0.3s ease;
      }
      
      .template-${template.id} a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--accent-color);
        transition: width 0.3s ease;
      }
      
      .template-${template.id} a:hover {
        color: var(--accent-color);
      }
      
      .template-${template.id} a:hover::after {
        width: 100%;
      }
      
      .template-${template.id} a.no-underline::after {
        display: none;
      }
      
      /* Email and Phone Links */
      .template-${template.id} a[href^="mailto:"] {
        color: var(--text-primary);
        font-weight: normal;
      }
      
      .template-${template.id} a[href^="tel:"] {
        color: var(--text-primary);
        font-weight: normal;
      }
      
      .template-${template.id} a[href^="mailto:"]:hover,
      .template-${template.id} a[href^="tel:"]:hover {
        color: var(--primary-color);
      }
    `;
  }

  /**
   * Generate font loading styles
   */
  private static generateFontLoadingStyles(template: CVTemplate): string {
    const { typography } = template.styling;
    
    return `
      /* Font Loading Optimization */
      .template-${template.id} {
        font-display: swap;
      }
      
      /* Fallback font stacks */
      .template-${template.id} .font-loading {
        font-family: system-ui, -apple-system, sans-serif;
      }
      
      /* Font loading states */
      .template-${template.id}.fonts-loading {
        visibility: hidden;
      }
      
      .template-${template.id}.fonts-loaded {
        visibility: visible;
        animation: fadeIn 0.3s ease-in-out;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      
      /* Critical font preloading */
      .template-${template.id} .critical-text {
        font-family: ${typography.headings.fontFamily}, system-ui, -apple-system, sans-serif;
      }
      
      /* Web font loading error fallback */
      .template-${template.id}.font-error h1,
      .template-${template.id}.font-error h2,
      .template-${template.id}.font-error h3,
      .template-${template.id}.font-error h4,
      .template-${template.id}.font-error h5,
      .template-${template.id}.font-error h6 {
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      }
      
      .template-${template.id}.font-error p,
      .template-${template.id}.font-error .body-text {
        font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      }
    `;
  }

  /**
   * Generate responsive typography
   */
  private static generateResponsiveTypography(template: CVTemplate): string {
    const { typography } = template.styling;
    
    return `
      /* Responsive Typography */
      
      /* Tablet styles */
      @media (max-width: 1024px) {
        .template-${template.id} h1,
        .template-${template.id} .h1 {
          font-size: calc(${typography.headings.h1?.fontSize || '2.5rem'} * 0.9);
        }
        
        .template-${template.id} h2,
        .template-${template.id} .h2 {
          font-size: calc(${typography.headings.h2?.fontSize || '2rem'} * 0.9);
        }
        
        .template-${template.id} h3,
        .template-${template.id} .h3 {
          font-size: calc(${typography.headings.h3?.fontSize || '1.5rem'} * 0.9);
        }
      }
      
      /* Mobile styles */
      @media (max-width: 768px) {
        .template-${template.id} h1,
        .template-${template.id} .h1 {
          font-size: calc(${typography.headings.h1?.fontSize || '2.5rem'} * 0.8);
          line-height: 1.3;
        }
        
        .template-${template.id} h2,
        .template-${template.id} .h2 {
          font-size: calc(${typography.headings.h2?.fontSize || '2rem'} * 0.8);
          line-height: 1.3;
        }
        
        .template-${template.id} h3,
        .template-${template.id} .h3 {
          font-size: calc(${typography.headings.h3?.fontSize || '1.5rem'} * 0.85);
          line-height: 1.4;
        }
        
        .template-${template.id} p,
        .template-${template.id} .body-text {
          font-size: calc(${typography.body.fontSize} * 0.95);
          line-height: 1.6;
        }
        
        .template-${template.id} .lead {
          font-size: calc(${typography.body.fontSize} * 1.1);
        }
      }
      
      /* Small mobile styles */
      @media (max-width: 480px) {
        .template-${template.id} h1,
        .template-${template.id} .h1 {
          font-size: calc(${typography.headings.h1?.fontSize || '2.5rem'} * 0.7);
          line-height: 1.2;
        }
        
        .template-${template.id} h2,
        .template-${template.id} .h2 {
          font-size: calc(${typography.headings.h2?.fontSize || '2rem'} * 0.75);
          line-height: 1.3;
        }
        
        .template-${template.id} h3,
        .template-${template.id} .h3 {
          font-size: calc(${typography.headings.h3?.fontSize || '1.5rem'} * 0.8);
        }
        
        .template-${template.id} p,
        .template-${template.id} .body-text {
          font-size: calc(${typography.body.fontSize} * 0.9);
          line-height: 1.7;
        }
        
        /* Improve readability on small screens */
        .template-${template.id} {
          text-rendering: optimizeSpeed;
        }
        
        .template-${template.id} .small,
        .template-${template.id} small {
          font-size: calc(${typography.body.fontSize} * 0.8);
        }
        
        .template-${template.id} .caption {
          font-size: calc(${typography.body.fontSize} * 0.7);
        }
      }
      
      /* High DPI displays */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        .template-${template.id} {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      }
      
      /* Print typography */
      @media print {
        .template-${template.id} {
          font-size: 12pt;
          line-height: 1.4;
        }
        
        .template-${template.id} h1 {
          font-size: 18pt;
          page-break-after: avoid;
        }
        
        .template-${template.id} h2 {
          font-size: 16pt;
          page-break-after: avoid;
        }
        
        .template-${template.id} h3 {
          font-size: 14pt;
          page-break-after: avoid;
        }
        
        .template-${template.id} h4,
        .template-${template.id} h5,
        .template-${template.id} h6 {
          font-size: 12pt;
          page-break-after: avoid;
        }
        
        .template-${template.id} p {
          orphans: 3;
          widows: 3;
        }
        
        .template-${template.id} blockquote {
          page-break-inside: avoid;
        }
      }
      
      /* Accessibility improvements */
      @media (prefers-reduced-motion: reduce) {
        .template-${template.id} .highlight {
          transition: none;
        }
        
        .template-${template.id} a::after {
          transition: none;
        }
        
        .template-${template.id}.fonts-loaded {
          animation: none;
        }
      }
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .template-${template.id} .muted-text {
          color: var(--text-primary);
        }
        
        .template-${template.id} .caption {
          color: var(--text-primary);
        }
      }
    `;
  }
}