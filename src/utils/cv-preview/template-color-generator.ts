/**
 * Template Color Generator
 * Generates color-specific CSS styles for templates
 */

import type { CVTemplate } from '../../types/cv-templates';

export class TemplateColorGenerator {
  /**
   * Generate color styles for template
   */
  static async generate(template: CVTemplate): Promise<string> {
    const colorStyles = [
      this.generateColorVariables(template),
      this.generateThemeColors(template),
      this.generateSemanticColors(template),
      this.generateGradientStyles(template),
      this.generateDarkModeColors(template),
      this.generatePrintColors(template),
      this.generateAccessibilityColors(template)
    ];

    return colorStyles.join('\n\n');
  }

  /**
   * Generate color variables
   */
  private static generateColorVariables(template: CVTemplate): string {
    const { colorPalette } = template.styling;
    
    // Generate color variants
    const primaryVariants = this.generateColorVariants(colorPalette.primary);
    const secondaryVariants = this.generateColorVariants(colorPalette.secondary);
    const accentVariants = this.generateColorVariants(colorPalette.accent);
    
    return `
      /* Color Variables */
      .template-${template.id} {
        /* Primary Color Palette */
        --primary-50: ${primaryVariants.shade50};
        --primary-100: ${primaryVariants.shade100};
        --primary-200: ${primaryVariants.shade200};
        --primary-300: ${primaryVariants.shade300};
        --primary-400: ${primaryVariants.shade400};
        --primary-500: ${colorPalette.primary};
        --primary-600: ${primaryVariants.shade600};
        --primary-700: ${primaryVariants.shade700};
        --primary-800: ${primaryVariants.shade800};
        --primary-900: ${primaryVariants.shade900};
        
        /* Secondary Color Palette */
        --secondary-50: ${secondaryVariants.shade50};
        --secondary-100: ${secondaryVariants.shade100};
        --secondary-200: ${secondaryVariants.shade200};
        --secondary-300: ${secondaryVariants.shade300};
        --secondary-400: ${secondaryVariants.shade400};
        --secondary-500: ${colorPalette.secondary};
        --secondary-600: ${secondaryVariants.shade600};
        --secondary-700: ${secondaryVariants.shade700};
        --secondary-800: ${secondaryVariants.shade800};
        --secondary-900: ${secondaryVariants.shade900};
        
        /* Accent Color Palette */
        --accent-50: ${accentVariants.shade50};
        --accent-100: ${accentVariants.shade100};
        --accent-200: ${accentVariants.shade200};
        --accent-300: ${accentVariants.shade300};
        --accent-400: ${accentVariants.shade400};
        --accent-500: ${colorPalette.accent};
        --accent-600: ${accentVariants.shade600};
        --accent-700: ${accentVariants.shade700};
        --accent-800: ${accentVariants.shade800};
        --accent-900: ${accentVariants.shade900};
        
        /* Neutral Colors */
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
        
        /* Status Colors */
        --success-color: #10b981;
        --success-light: #d1fae5;
        --warning-color: #f59e0b;
        --warning-light: #fef3c7;
        --error-color: #ef4444;
        --error-light: #fee2e2;
        --info-color: #3b82f6;
        --info-light: #dbeafe;
        
        /* Background Colors */
        --bg-primary: ${colorPalette.background};
        --bg-secondary: ${colorPalette.surface};
        --bg-tertiary: var(--gray-50);
        --bg-overlay: rgba(0, 0, 0, 0.5);
        --bg-glass: rgba(255, 255, 255, 0.1);
        
        /* Border Colors */
        --border-primary: ${colorPalette.border};
        --border-secondary: var(--gray-200);
        --border-accent: var(--primary-300);
        --border-focus: var(--primary-500);
        
        /* Shadow Colors */
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        --shadow-primary: 0 4px 14px 0 rgba(${this.hexToRgb(colorPalette.primary)}, 0.3);
        --shadow-accent: 0 4px 14px 0 rgba(${this.hexToRgb(colorPalette.accent)}, 0.3);
      }
    `;
  }

  /**
   * Generate theme colors
   */
  private static generateThemeColors(template: CVTemplate): string {
    const { colorPalette } = template.styling;
    
    return `
      /* Theme Colors */
      .template-${template.id} .text-primary {
        color: var(--text-primary);
      }
      
      .template-${template.id} .text-secondary {
        color: var(--text-secondary);
      }
      
      .template-${template.id} .text-accent {
        color: var(--accent-color);
      }
      
      .template-${template.id} .text-white {
        color: white;
      }
      
      .template-${template.id} .text-black {
        color: black;
      }
      
      /* Background Colors */
      .template-${template.id} .bg-primary {
        background-color: var(--primary-color);
        color: white;
      }
      
      .template-${template.id} .bg-secondary {
        background-color: var(--secondary-color);
        color: white;
      }
      
      .template-${template.id} .bg-accent {
        background-color: var(--accent-color);
        color: white;
      }
      
      .template-${template.id} .bg-surface {
        background-color: var(--surface-color);
      }
      
      .template-${template.id} .bg-background {
        background-color: var(--background-color);
      }
      
      .template-${template.id} .bg-white {
        background-color: white;
      }
      
      .template-${template.id} .bg-transparent {
        background-color: transparent;
      }
      
      /* Border Colors */
      .template-${template.id} .border-primary {
        border-color: var(--primary-color);
      }
      
      .template-${template.id} .border-secondary {
        border-color: var(--secondary-color);
      }
      
      .template-${template.id} .border-accent {
        border-color: var(--accent-color);
      }
      
      .template-${template.id} .border-default {
        border-color: var(--border-color);
      }
      
      .template-${template.id} .border-transparent {
        border-color: transparent;
      }
    `;
  }

  /**
   * Generate semantic colors
   */
  private static generateSemanticColors(template: CVTemplate): string {
    return `
      /* Semantic Colors */
      .template-${template.id} .text-success {
        color: var(--success-color);
      }
      
      .template-${template.id} .text-warning {
        color: var(--warning-color);
      }
      
      .template-${template.id} .text-error {
        color: var(--error-color);
      }
      
      .template-${template.id} .text-info {
        color: var(--info-color);
      }
      
      .template-${template.id} .bg-success {
        background-color: var(--success-color);
        color: white;
      }
      
      .template-${template.id} .bg-success-light {
        background-color: var(--success-light);
        color: var(--success-color);
      }
      
      .template-${template.id} .bg-warning {
        background-color: var(--warning-color);
        color: white;
      }
      
      .template-${template.id} .bg-warning-light {
        background-color: var(--warning-light);
        color: var(--warning-color);
      }
      
      .template-${template.id} .bg-error {
        background-color: var(--error-color);
        color: white;
      }
      
      .template-${template.id} .bg-error-light {
        background-color: var(--error-light);
        color: var(--error-color);
      }
      
      .template-${template.id} .bg-info {
        background-color: var(--info-color);
        color: white;
      }
      
      .template-${template.id} .bg-info-light {
        background-color: var(--info-light);
        color: var(--info-color);
      }
      
      /* Status indicators */
      .template-${template.id} .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
      }
      
      .template-${template.id} .status-indicator.success {
        background-color: var(--success-color);
      }
      
      .template-${template.id} .status-indicator.warning {
        background-color: var(--warning-color);
      }
      
      .template-${template.id} .status-indicator.error {
        background-color: var(--error-color);
      }
      
      .template-${template.id} .status-indicator.info {
        background-color: var(--info-color);
      }
    `;
  }

  /**
   * Generate gradient styles
   */
  private static generateGradientStyles(template: CVTemplate): string {
    const { colorPalette } = template.styling;
    
    return `
      /* Gradient Styles */
      .template-${template.id} .gradient-primary {
        background: linear-gradient(135deg, var(--primary-color), var(--primary-600));
      }
      
      .template-${template.id} .gradient-secondary {
        background: linear-gradient(135deg, var(--secondary-color), var(--secondary-600));
      }
      
      .template-${template.id} .gradient-accent {
        background: linear-gradient(135deg, var(--accent-color), var(--accent-600));
      }
      
      .template-${template.id} .gradient-primary-secondary {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      }
      
      .template-${template.id} .gradient-primary-accent {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      }
      
      .template-${template.id} .gradient-secondary-accent {
        background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
      }
      
      .template-${template.id} .gradient-rainbow {
        background: linear-gradient(
          135deg,
          var(--primary-color) 0%,
          var(--accent-color) 50%,
          var(--secondary-color) 100%
        );
      }
      
      .template-${template.id} .gradient-subtle {
        background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
      }
      
      .template-${template.id} .gradient-overlay {
        background: linear-gradient(
          135deg,
          rgba(${this.hexToRgb(colorPalette.primary)}, 0.9),
          rgba(${this.hexToRgb(colorPalette.secondary)}, 0.9)
        );
      }
      
      /* Gradient text */
      .template-${template.id} .text-gradient {
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: inline-block;
      }
      
      /* Animated gradients */
      .template-${template.id} .gradient-animated {
        background: linear-gradient(
          45deg,
          var(--primary-color),
          var(--accent-color),
          var(--secondary-color),
          var(--primary-color)
        );
        background-size: 400% 400%;
        animation: gradientShift 8s ease infinite;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
  }

  /**
   * Generate dark mode colors
   */
  private static generateDarkModeColors(template: CVTemplate): string {
    const { colorPalette } = template.styling;
    
    return `
      /* Dark Mode Colors */
      @media (prefers-color-scheme: dark) {
        .template-${template.id} {
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --background-color: #111827;
          --surface-color: #1f2937;
          --border-color: #374151;
          
          /* Darker background variants */
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-tertiary: #334155;
          
          /* Adjusted neutral colors for dark mode */
          --gray-50: #1f2937;
          --gray-100: #374151;
          --gray-200: #4b5563;
          --gray-300: #6b7280;
          --gray-400: #9ca3af;
          --gray-500: #d1d5db;
          --gray-600: #e5e7eb;
          --gray-700: #f3f4f6;
          --gray-800: #f9fafb;
          --gray-900: #ffffff;
          
          /* Enhanced shadows for dark mode */
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6);
        }
        
        .template-${template.id} .bg-white {
          background-color: var(--surface-color);
          color: var(--text-primary);
        }
        
        .template-${template.id} .text-black {
          color: var(--text-primary);
        }
        
        .template-${template.id} img {
          opacity: 0.9;
          transition: opacity 0.3s ease;
        }
        
        .template-${template.id} img:hover {
          opacity: 1;
        }
      }
      
      /* Force dark mode */
      .template-${template.id}.dark-mode {
        --text-primary: #f9fafb;
        --text-secondary: #d1d5db;
        --background-color: #111827;
        --surface-color: #1f2937;
        --border-color: #374151;
        
        color: var(--text-primary);
        background-color: var(--background-color);
      }
      
      .template-${template.id}.dark-mode .bg-white {
        background-color: var(--surface-color);
        color: var(--text-primary);
      }
      
      .template-${template.id}.dark-mode .text-black {
        color: var(--text-primary);
      }
    `;
  }

  /**
   * Generate print colors
   */
  private static generatePrintColors(template: CVTemplate): string {
    return `
      /* Print Colors */
      @media print {
        .template-${template.id} {
          --text-primary: #000000;
          --text-secondary: #333333;
          --background-color: #ffffff;
          --surface-color: #ffffff;
          --border-color: #000000;
          --primary-color: #000000;
          --secondary-color: #666666;
          --accent-color: #333333;
          
          /* Remove all backgrounds for print */
          background: white !important;
          color: black !important;
        }
        
        .template-${template.id} * {
          background: transparent !important;
          color: black !important;
          box-shadow: none !important;
        }
        
        .template-${template.id} .gradient-primary,
        .template-${template.id} .gradient-secondary,
        .template-${template.id} .gradient-accent,
        .template-${template.id} .gradient-primary-secondary,
        .template-${template.id} .gradient-primary-accent,
        .template-${template.id} .gradient-secondary-accent,
        .template-${template.id} .gradient-rainbow,
        .template-${template.id} .gradient-animated {
          background: white !important;
          color: black !important;
        }
        
        .template-${template.id} .bg-primary,
        .template-${template.id} .bg-secondary,
        .template-${template.id} .bg-accent {
          background: white !important;
          color: black !important;
          border: 1px solid black !important;
        }
        
        /* Ensure borders are visible in print */
        .template-${template.id} .border-primary,
        .template-${template.id} .border-secondary,
        .template-${template.id} .border-accent {
          border-color: black !important;
        }
        
        /* Make text gradient visible in print */
        .template-${template.id} .text-gradient {
          -webkit-text-fill-color: black;
          background: none;
          color: black !important;
        }
      }
    `;
  }

  /**
   * Generate accessibility colors
   */
  private static generateAccessibilityColors(template: CVTemplate): string {
    return `
      /* Accessibility Colors */
      
      /* High contrast mode */
      @media (prefers-contrast: high) {
        .template-${template.id} {
          --text-primary: #000000;
          --text-secondary: #000000;
          --border-color: #000000;
          --primary-color: #0000ff;
          --secondary-color: #000000;
          --accent-color: #ff0000;
        }
        
        .template-${template.id} .text-secondary {
          color: var(--text-primary);
        }
        
        .template-${template.id} .border-default {
          border-color: var(--text-primary);
        }
        
        .template-${template.id} a {
          color: #0000ee;
          text-decoration: underline;
        }
        
        .template-${template.id} a:visited {
          color: #551a8b;
        }
        
        .template-${template.id} a:hover {
          color: #0000ee;
          background-color: #ffff00;
        }
      }
      
      /* Reduced transparency for accessibility */
      @media (prefers-reduced-transparency: reduce) {
        .template-${template.id} .bg-glass {
          background: var(--surface-color);
        }
        
        .template-${template.id} .bg-overlay {
          background: var(--surface-color);
        }
        
        .template-${template.id} .gradient-overlay {
          background: var(--primary-color);
        }
      }
      
      /* Focus styles for accessibility */
      .template-${template.id} :focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      
      .template-${template.id} :focus:not(:focus-visible) {
        outline: none;
      }
      
      .template-${template.id} :focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      
      /* Color contrast helpers */
      .template-${template.id} .contrast-aa {
        /* Ensures AA compliance */
        color: var(--text-primary);
        background-color: var(--background-color);
      }
      
      .template-${template.id} .contrast-aaa {
        /* Ensures AAA compliance */
        color: #000000;
        background-color: #ffffff;
      }
      
      /* Screen reader support */
      .template-${template.id} .sr-only {
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
      
      .template-${template.id} .sr-only-focusable:focus {
        position: static;
        width: auto;
        height: auto;
        padding: inherit;
        margin: inherit;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `;
  }

  /**
   * Generate color variants from a base color
   */
  private static generateColorVariants(baseColor: string): {
    shade50: string;
    shade100: string;
    shade200: string;
    shade300: string;
    shade400: string;
    shade600: string;
    shade700: string;
    shade800: string;
    shade900: string;
  } {
    // Simple color variant generation (in production, use a proper color library)
    const rgb = this.hexToRgb(baseColor);
    
    return {
      shade50: this.adjustBrightness(baseColor, 0.95),
      shade100: this.adjustBrightness(baseColor, 0.9),
      shade200: this.adjustBrightness(baseColor, 0.8),
      shade300: this.adjustBrightness(baseColor, 0.6),
      shade400: this.adjustBrightness(baseColor, 0.3),
      shade600: this.adjustBrightness(baseColor, -0.2),
      shade700: this.adjustBrightness(baseColor, -0.4),
      shade800: this.adjustBrightness(baseColor, -0.6),
      shade900: this.adjustBrightness(baseColor, -0.8)
    };
  }

  /**
   * Convert hex color to RGB values
   */
  private static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0, 0, 0';
    
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    
    return `${r}, ${g}, ${b}`;
  }

  /**
   * Adjust color brightness
   */
  private static adjustBrightness(hex: string, factor: number): string {
    const rgb = this.hexToRgb(hex).split(', ').map(Number);
    
    const adjusted = rgb.map(channel => {
      if (factor > 0) {
        // Lighten
        return Math.round(channel + (255 - channel) * factor);
      } else {
        // Darken
        return Math.round(channel * (1 + factor));
      }
    });
    
    const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${adjusted.map(toHex).join('')}`;
  }
}