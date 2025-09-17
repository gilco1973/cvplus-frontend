/**
 * @fileoverview RTL (Right-to-Left) Support Module for CVPlus i18n
 * Provides comprehensive RTL layout and text direction support
 */

import React from 'react';
import type { SupportedLanguage, RTLConfig, RTLLayoutOptions } from '../types';
import { RTL_LANGUAGES, LANGUAGE_CONFIG } from '../constants';

/**
 * RTL Support Service
 */
export class RTLService {
  private static instance: RTLService;
  private observers: Set<RTLObserver> = new Set();
  private currentDirection: 'ltr' | 'rtl' = 'ltr';

  private constructor() {}

  static getInstance(): RTLService {
    if (!RTLService.instance) {
      RTLService.instance = new RTLService();
    }
    return RTLService.instance;
  }

  /**
   * Check if language is RTL
   */
  isRTLLanguage(language: SupportedLanguage): boolean {
    return RTL_LANGUAGES.includes(language);
  }

  /**
   * Get text direction for language
   */
  getDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
    return LANGUAGE_CONFIG[language]?.dir || 'ltr';
  }

  /**
   * Apply RTL configuration for language
   */
  applyRTLConfig(language: SupportedLanguage): RTLConfig {
    const isRTL = this.isRTLLanguage(language);
    const direction = this.getDirection(language);
    
    const config: RTLConfig = {
      supported: isRTL,
      direction,
      cssProperties: this.generateRTLCSSProperties(direction),
      componentMappings: this.getComponentMappings(direction)
    };

    // Update DOM
    this.updateDocumentDirection(direction);
    
    // Notify observers
    this.notifyObservers(direction);
    
    return config;
  }

  /**
   * Generate CSS custom properties for RTL support
   */
  private generateRTLCSSProperties(direction: 'ltr' | 'rtl'): Record<string, string> {
    const isRTL = direction === 'rtl';
    
    return {
      '--direction': direction,
      '--text-align-start': isRTL ? 'right' : 'left',
      '--text-align-end': isRTL ? 'left' : 'right',
      '--margin-start': isRTL ? 'margin-right' : 'margin-left',
      '--margin-end': isRTL ? 'margin-left' : 'margin-right',
      '--padding-start': isRTL ? 'padding-right' : 'padding-left',
      '--padding-end': isRTL ? 'padding-left' : 'padding-right',
      '--border-start': isRTL ? 'border-right' : 'border-left',
      '--border-end': isRTL ? 'border-left' : 'border-right',
      '--left': isRTL ? 'right' : 'left',
      '--right': isRTL ? 'left' : 'right',
      '--transform-x': isRTL ? 'scaleX(-1)' : 'scaleX(1)',
      '--flex-direction': isRTL ? 'row-reverse' : 'row',
    };
  }

  /**
   * Get component mappings for RTL
   */
  private getComponentMappings(direction: 'ltr' | 'rtl'): Record<string, any> {
    const isRTL = direction === 'rtl';
    
    return {
      textAlign: isRTL ? 'right' : 'left',
      float: isRTL ? 'right' : 'left',
      clear: isRTL ? 'right' : 'left',
      marginLeft: isRTL ? 'marginRight' : 'marginLeft',
      marginRight: isRTL ? 'marginLeft' : 'marginRight',
      paddingLeft: isRTL ? 'paddingRight' : 'paddingLeft',
      paddingRight: isRTL ? 'paddingLeft' : 'paddingRight',
      borderLeft: isRTL ? 'borderRight' : 'borderLeft',
      borderRight: isRTL ? 'borderLeft' : 'borderRight',
      left: isRTL ? 'right' : 'left',
      right: isRTL ? 'left' : 'right',
    };
  }

  /**
   * Update document direction
   */
  private updateDocumentDirection(direction: 'ltr' | 'rtl'): void {
    // Always update current direction first
    this.currentDirection = direction;
    
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.classList.toggle('rtl', direction === 'rtl');
      document.documentElement.classList.toggle('ltr', direction === 'ltr');
      
      // Apply CSS custom properties
      const cssProps = this.generateRTLCSSProperties(direction);
      Object.entries(cssProps).forEach(([prop, value]) => {
        document.documentElement.style.setProperty(prop, value);
      });
    }
  }

  /**
   * Subscribe to direction changes
   */
  subscribe(observer: RTLObserver): () => void {
    this.observers.add(observer);
    
    // Immediately notify with current direction
    observer(this.currentDirection);
    
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Notify all observers of direction change
   */
  private notifyObservers(direction: 'ltr' | 'rtl'): void {
    this.observers.forEach(observer => observer(direction));
  }

  /**
   * Get current direction
   */
  getCurrentDirection(): 'ltr' | 'rtl' {
    return this.currentDirection;
  }

  /**
   * Transform CSS class names for RTL
   */
  transformCSSClasses(classes: string, options: RTLLayoutOptions = {}): string {
    if (this.currentDirection === 'ltr') return classes;
    
    const { mirrorLayout = true, adjustSpacing = true } = options;
    
    let transformedClasses = classes;
    
    if (mirrorLayout) {
      // Transform flex directions using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\bflex-row-reverse\b/g, '__TEMP_FLEX_ROW__')
        .replace(/\bflex-row\b/g, 'flex-row-reverse')
        .replace(/__TEMP_FLEX_ROW__/g, 'flex-row');
      
      // Transform text alignment using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\btext-right\b/g, '__TEMP_TEXT_LEFT__')
        .replace(/\btext-left\b/g, 'text-right')
        .replace(/__TEMP_TEXT_LEFT__/g, 'text-left');
      
      // Transform float using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\bfloat-right\b/g, '__TEMP_FLOAT_LEFT__')
        .replace(/\bfloat-left\b/g, 'float-right')
        .replace(/__TEMP_FLOAT_LEFT__/g, 'float-left');
    }
    
    if (adjustSpacing) {
      // Transform margin classes (Tailwind CSS) using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\bmr-(\d+)\b/g, '__TEMP_ML_$1__')
        .replace(/\bml-(\d+)\b/g, 'mr-$1')
        .replace(/__TEMP_ML_(\d+)__/g, 'ml-$1')
        .replace(/\bpr-(\d+)\b/g, '__TEMP_PL_$1__')
        .replace(/\bpl-(\d+)\b/g, 'pr-$1')
        .replace(/__TEMP_PL_(\d+)__/g, 'pl-$1');
      
      // Transform border classes using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\bborder-r\b/g, '__TEMP_BORDER_L__')
        .replace(/\bborder-l\b/g, 'border-r')
        .replace(/__TEMP_BORDER_L__/g, 'border-l')
        .replace(/\bborder-r-(\d+)\b/g, '__TEMP_BORDER_L_$1__')
        .replace(/\bborder-l-(\d+)\b/g, 'border-r-$1')
        .replace(/__TEMP_BORDER_L_(\d+)__/g, 'border-l-$1');
      
      // Transform position classes using temp placeholder to avoid conflicts
      transformedClasses = transformedClasses
        .replace(/\bright-(\d+)\b/g, '__TEMP_LEFT_$1__')
        .replace(/\bleft-(\d+)\b/g, 'right-$1')
        .replace(/__TEMP_LEFT_(\d+)__/g, 'left-$1');
    }
    
    return transformedClasses;
  }

  /**
   * Transform inline styles for RTL
   */
  transformInlineStyles(
    styles: React.CSSProperties,
    options: RTLLayoutOptions = {}
  ): React.CSSProperties {
    if (this.currentDirection === 'ltr') return styles;
    
    const { mirrorLayout = true, adjustSpacing = true } = options;
    const transformedStyles = { ...styles };
    
    if (mirrorLayout) {
      // Transform text alignment
      if (styles.textAlign === 'left') transformedStyles.textAlign = 'right';
      else if (styles.textAlign === 'right') transformedStyles.textAlign = 'left';
      
      // Transform flex direction
      if (styles.flexDirection === 'row') transformedStyles.flexDirection = 'row-reverse';
      else if (styles.flexDirection === 'row-reverse') transformedStyles.flexDirection = 'row';
      
      // Transform float
      if (styles.float === 'left') transformedStyles.float = 'right';
      else if (styles.float === 'right') transformedStyles.float = 'left';
    }
    
    if (adjustSpacing) {
      // Transform margins - swap left and right values
      const tempMarginLeft = styles.marginLeft;
      const tempMarginRight = styles.marginRight;
      
      if (tempMarginLeft !== undefined || tempMarginRight !== undefined) {
        // First remove the original properties
        delete transformedStyles.marginLeft;
        delete transformedStyles.marginRight;
        
        // Then set the swapped values
        if (tempMarginLeft !== undefined) {
          transformedStyles.marginRight = tempMarginLeft;
        }
        if (tempMarginRight !== undefined) {
          transformedStyles.marginLeft = tempMarginRight;
        }
      }
      
      // Transform padding - swap left and right values
      const tempPaddingLeft = styles.paddingLeft;
      const tempPaddingRight = styles.paddingRight;
      
      if (tempPaddingLeft !== undefined || tempPaddingRight !== undefined) {
        delete transformedStyles.paddingLeft;
        delete transformedStyles.paddingRight;
        
        if (tempPaddingLeft !== undefined) {
          transformedStyles.paddingRight = tempPaddingLeft;
        }
        if (tempPaddingRight !== undefined) {
          transformedStyles.paddingLeft = tempPaddingRight;
        }
      }
      
      // Transform borders - swap left and right values
      const tempBorderLeft = styles.borderLeft;
      const tempBorderRight = styles.borderRight;
      
      if (tempBorderLeft !== undefined || tempBorderRight !== undefined) {
        delete transformedStyles.borderLeft;
        delete transformedStyles.borderRight;
        
        if (tempBorderLeft !== undefined) {
          transformedStyles.borderRight = tempBorderLeft;
        }
        if (tempBorderRight !== undefined) {
          transformedStyles.borderLeft = tempBorderRight;
        }
      }
      
      // Transform positioning - swap left and right values
      const tempLeft = styles.left;
      const tempRight = styles.right;
      
      if (tempLeft !== undefined || tempRight !== undefined) {
        delete transformedStyles.left;
        delete transformedStyles.right;
        
        if (tempLeft !== undefined) {
          transformedStyles.right = tempLeft;
        }
        if (tempRight !== undefined) {
          transformedStyles.left = tempRight;
        }
      }
    }
    
    return transformedStyles;
  }

  /**
   * Create RTL-aware CSS class generator
   */
  createClassGenerator(baseClasses: string, rtlClasses?: string): (isRTL?: boolean) => string {
    return (isRTL = this.currentDirection === 'rtl') => {
      if (isRTL && rtlClasses) {
        return `${baseClasses} ${rtlClasses}`;
      }
      return isRTL ? this.transformCSSClasses(baseClasses) : baseClasses;
    };
  }

  /**
   * Generate RTL-aware Tailwind classes
   */
  generateTailwindRTLClasses(classes: Record<string, string>): string {
    return Object.entries(classes)
      .map(([direction, classNames]) => {
        if (direction === 'rtl') {
          return `rtl:${classNames}`;
        } else if (direction === 'ltr') {
          return `ltr:${classNames}`;
        }
        return classNames;
      })
      .join(' ');
  }
}

/**
 * RTL Observer type
 */
type RTLObserver = (direction: 'ltr' | 'rtl') => void;

/**
 * React Hook for RTL support
 */
export function useRTL() {
  const [direction, setDirection] = React.useState<'ltr' | 'rtl'>(
    RTLService.getInstance().getCurrentDirection()
  );

  React.useEffect(() => {
    const unsubscribe = RTLService.getInstance().subscribe(setDirection);
    return unsubscribe;
  }, []);

  return {
    direction,
    isRTL: direction === 'rtl',
    transformClasses: (classes: string, options?: RTLLayoutOptions) => 
      RTLService.getInstance().transformCSSClasses(classes, options),
    transformStyles: (styles: React.CSSProperties, options?: RTLLayoutOptions) =>
      RTLService.getInstance().transformInlineStyles(styles, options),
    createClassGenerator: (baseClasses: string, rtlClasses?: string) =>
      RTLService.getInstance().createClassGenerator(baseClasses, rtlClasses),
  };
}

/**
 * RTL-aware component wrapper
 */
export const RTLWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  options?: RTLLayoutOptions;
}> = ({ children, className = '', options = {} }) => {
  const { transformClasses } = useRTL();
  const transformedClassName = transformClasses(className, options);

  return (
    <div className={transformedClassName} dir="auto">
      {children}
    </div>
  );
};

/**
 * Export singleton instance
 */
export const rtlService = RTLService.getInstance();

export default RTLService;