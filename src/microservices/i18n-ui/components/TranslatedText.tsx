/**
 * @fileoverview TranslatedText Component for CVPlus i18n
 * Provides declarative text translation with fallback and interpolation support
 */

import React, { useMemo, useCallback } from 'react';
import type { TranslatedTextProps } from '../types';
import { useTranslation } from '../hooks/useTranslation';

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  i18nKey,
  options = {},
  component: Component = 'span',
  className = '',
  fallback,
  children,
  ...restProps
}) => {
  const { t, currentLanguage, isRTL } = useTranslation();

  // Memoize translation to avoid unnecessary re-renders
  const translatedText = useMemo(() => {
    try {
      return t(i18nKey, options);
    } catch (error) {
      console.warn(`Translation error for key "${i18nKey}":`, error);
      return options.defaultValue || i18nKey;
    }
  }, [i18nKey, options, t]);

  // Handle fallback rendering
  const renderContent = useCallback(() => {
    // If translation fails or returns the key, show fallback
    if (translatedText === i18nKey && fallback) {
      if (React.isValidElement(fallback)) {
        return fallback;
      }
      if (typeof fallback === 'string') {
        return fallback;
      }
      if (typeof fallback === 'function') {
        return (fallback as () => string)();
      }
    }

    // If children are provided, use them as interpolation content
    if (children) {
      // Handle React interpolation
      if (React.Children.count(children) > 0) {
        return interpolateReactChildren(translatedText, children);
      }
    }

    return translatedText;
  }, [translatedText, i18nKey, fallback, children]);

  // Apply RTL-aware classes
  const combinedClassName = useMemo(() => {
    const classes = [className];
    
    if (isRTL) {
      classes.push('rtl:text-right');
    }
    
    return classes.filter(Boolean).join(' ');
  }, [className, isRTL]);

  // Render with specified component
  return (
    <Component
      className={combinedClassName}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={currentLanguage}
      {...restProps}
    >
      {renderContent()}
    </Component>
  );
};

/**
 * Interpolate React children into translated text
 * Replaces placeholders like {{0}}, {{1}}, etc. with React elements
 */
function interpolateReactChildren(
  text: string,
  children: React.ReactNode
): React.ReactNode {
  const childArray = React.Children.toArray(children);
  
  // If no placeholders found, return text as-is
  if (!text.includes('{{')) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  // Regex to find placeholders like {{0}}, {{1}}, etc.
  const placeholderRegex = /\{\{(\d+)\}\}/g;
  
  while ((match = placeholderRegex.exec(text)) !== null) {
    // Add text before placeholder
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add corresponding child element
    const childIndex = parseInt(match[1] || '0');
    if (childIndex < childArray.length) {
      parts.push(childArray[childIndex]);
    } else {
      // Fallback to placeholder if child not found
      parts.push(match[0]);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length === 0 ? text : parts;
}

/**
 * Higher-order component for adding translation to any component
 */
export function withTranslation<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  i18nKey: string,
  options?: {
    propName?: keyof T;
    fallbackProp?: keyof T;
    namespace?: string;
  }
) {
  const WrappedComponent = React.forwardRef<any, T>((props, ref) => {
    const { t } = useTranslation(options?.namespace);
    const propName = options?.propName || 'children';
    const fallbackProp = options?.fallbackProp;
    
    const translatedText = useMemo(() => {
      try {
        return t(i18nKey);
      } catch (error) {
        console.warn(`Translation error for key "${i18nKey}":`, error);
        return fallbackProp ? (props as any)[fallbackProp] : i18nKey;
      }
    }, [i18nKey, t, props, fallbackProp]);

    const enhancedProps = {
      ...props,
      [propName]: translatedText,
    } as T;

    return <Component ref={ref} {...enhancedProps} />;
  });

  WrappedComponent.displayName = `withTranslation(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook-based component for conditional translation rendering
 */
export const ConditionalTranslation: React.FC<{
  condition: boolean;
  i18nKey: string;
  fallbackKey?: string;
  options?: any;
  component?: React.ElementType;
  className?: string;
}> = ({
  condition,
  i18nKey,
  fallbackKey,
  options = {},
  component: Component = 'span',
  className = '',
}) => {
  const { t } = useTranslation();
  
  const keyToUse = condition ? i18nKey : (fallbackKey || i18nKey);
  const translatedText = t(keyToUse, options);
  
  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};

/**
 * Pluralized translation component
 */
export const PluralTranslation: React.FC<{
  i18nKey: string;
  count: number;
  options?: any;
  component?: React.ElementType;
  className?: string;
}> = ({
  i18nKey,
  count,
  options = {},
  component: Component = 'span',
  className = '',
}) => {
  const { t } = useTranslation();
  
  const translatedText = t(i18nKey, { ...options, count });
  
  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};

/**
 * Gender-aware translation component
 */
export const GenderAwareTranslation: React.FC<{
  i18nKey: string;
  gender: 'masculine' | 'feminine' | 'neutral';
  options?: any;
  component?: React.ElementType;
  className?: string;
}> = ({
  i18nKey,
  gender,
  options = {},
  component: Component = 'span',
  className = '',
}) => {
  const { t } = useTranslation();
  
  const contextKey = `${i18nKey}_${gender}`;
  let translatedText = t(contextKey, options);
  
  // Fallback to neutral if gendered version not found
  if (translatedText === contextKey && gender !== 'neutral') {
    translatedText = t(`${i18nKey}_neutral`, options);
  }
  
  // Final fallback to base key
  if (translatedText === `${i18nKey}_neutral`) {
    translatedText = t(i18nKey, options);
  }
  
  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};

/**
 * Professional context translation component
 */
export const ProfessionalTranslation: React.FC<{
  i18nKey: string;
  industry?: string;
  role?: string;
  level?: 'entry' | 'mid' | 'senior' | 'executive';
  options?: any;
  component?: React.ElementType;
  className?: string;
}> = ({
  i18nKey,
  industry,
  role,
  level,
  options = {},
  component: Component = 'span',
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Try increasingly specific keys
  const contextKeys = [
    industry && role && level ? `${i18nKey}.${industry}.${role}.${level}` : null,
    industry && role ? `${i18nKey}.${industry}.${role}` : null,
    industry ? `${i18nKey}.${industry}` : null,
    role ? `${i18nKey}.role.${role}` : null,
    level ? `${i18nKey}.level.${level}` : null,
    i18nKey
  ].filter(Boolean) as string[];
  
  let translatedText = i18nKey;
  
  for (const key of contextKeys) {
    const candidate = t(key, options);
    if (candidate !== key) {
      translatedText = candidate;
      break;
    }
  }
  
  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};

export default TranslatedText;