/**
 * @fileoverview I18n React Context utilities
 * Provides context creation and management utilities
 */

import React from 'react';
import type { SupportedLanguage, I18nHookReturn } from '../types';

/**
 * Create a typed i18n context for specific use cases
 */
export function createI18nContext<T = any>(defaultValue?: T) {
  const Context = React.createContext<T | undefined>(defaultValue);
  
  const Provider = Context.Provider;
  
  const useContext = (): T => {
    const context = React.useContext(Context);
    if (context === undefined) {
      throw new Error('useContext must be used within a Provider');
    }
    return context;
  };
  
  return {
    Context,
    Provider,
    useContext,
  };
}

/**
 * Professional context for CV/Resume related translations
 */
export interface ProfessionalI18nContext {
  industry?: string;
  role?: string;
  level?: 'entry' | 'mid' | 'senior' | 'executive';
  translateRole: (role: string) => string;
  translateSkill: (skill: string, category?: string) => string;
  translateSection: (section: string) => string;
  getIndustryTerms: () => Record<string, string>;
}

export const {
  Context: ProfessionalContext,
  Provider: ProfessionalProvider,
  useContext: useProfessionalContext,
} = createI18nContext<ProfessionalI18nContext>();

/**
 * Form context for form-related translations
 */
export interface FormI18nContext {
  translateLabel: (field: string) => string;
  translatePlaceholder: (field: string) => string;
  translateValidation: (field: string, type: string) => string;
  translateHelp: (field: string) => string;
  getFieldConfig: (field: string) => {
    label: string;
    placeholder: string;
    help?: string;
    validation: Record<string, string>;
  };
}

export const {
  Context: FormContext,
  Provider: FormProvider,
  useContext: useFormContext,
} = createI18nContext<FormI18nContext>();

/**
 * Theme context for i18n-aware styling
 */
export interface ThemeI18nContext {
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
  currentLanguage: SupportedLanguage;
  fonts: Record<SupportedLanguage, string>;
  spacing: Record<SupportedLanguage, Record<string, string>>;
  colors: Record<string, string>;
  getLocalizedStyle: (baseStyle: React.CSSProperties) => React.CSSProperties;
  getDirectionalClass: (baseClass: string) => string;
}

export const {
  Context: ThemeContext,
  Provider: ThemeProvider,
  useContext: useThemeContext,
} = createI18nContext<ThemeI18nContext>();

/**
 * Navigation context for menu and navigation translations
 */
export interface NavigationI18nContext {
  translateMenuItem: (item: string) => string;
  translateBreadcrumb: (crumb: string) => string;
  getNavigationTree: () => any;
  isActiveRoute: (route: string) => boolean;
}

export const {
  Context: NavigationContext,
  Provider: NavigationProvider,
  useContext: useNavigationContext,
} = createI18nContext<NavigationI18nContext>();

/**
 * Content context for CMS and dynamic content
 */
export interface ContentI18nContext {
  translateContent: (key: string, variables?: Record<string, any>) => string;
  translateMetadata: (key: string) => { title: string; description: string; keywords: string[] };
  getLocalizedContent: (contentId: string) => any;
  formatContentDate: (date: Date) => string;
}

export const {
  Context: ContentContext,
  Provider: ContentProvider,
  useContext: useContentContext,
} = createI18nContext<ContentI18nContext>();

/**
 * Email context for email template translations
 */
export interface EmailI18nContext {
  translateSubject: (template: string, variables?: Record<string, any>) => string;
  translateContent: (template: string, variables?: Record<string, any>) => string;
  translateGreeting: (formality: 'formal' | 'informal') => string;
  translateClosing: (formality: 'formal' | 'informal') => string;
  getEmailTemplate: (type: string) => any;
}

export const {
  Context: EmailContext,
  Provider: EmailProvider,
  useContext: useEmailContext,
} = createI18nContext<EmailI18nContext>();

/**
 * Analytics context for analytics and metrics translations
 */
export interface AnalyticsI18nContext {
  translateMetric: (metric: string) => string;
  translateDimension: (dimension: string) => string;
  translatePeriod: (period: string) => string;
  formatMetricValue: (value: number, metric: string) => string;
  getLocalizedChartConfig: (chartType: string) => any;
}

export const {
  Context: AnalyticsContext,
  Provider: AnalyticsProvider,
  useContext: useAnalyticsContext,
} = createI18nContext<AnalyticsI18nContext>();

/**
 * Error context for error handling and messages
 */
export interface ErrorI18nContext {
  translateError: (code: string, variables?: Record<string, any>) => string;
  translateWarning: (code: string, variables?: Record<string, any>) => string;
  translateInfo: (code: string, variables?: Record<string, any>) => string;
  getErrorSeverity: (code: string) => 'low' | 'medium' | 'high' | 'critical';
  getErrorSolution: (code: string) => string;
}

export const {
  Context: ErrorContext,
  Provider: ErrorProvider,
  useContext: useErrorContext,
} = createI18nContext<ErrorI18nContext>();

/**
 * Combine multiple contexts into a single provider
 */
export interface CombinedContextProviderProps {
  children: React.ReactNode;
  professional?: ProfessionalI18nContext;
  form?: FormI18nContext;
  theme?: ThemeI18nContext;
  navigation?: NavigationI18nContext;
  content?: ContentI18nContext;
  email?: EmailI18nContext;
  analytics?: AnalyticsI18nContext;
  error?: ErrorI18nContext;
}

export const CombinedContextProvider: React.FC<CombinedContextProviderProps> = ({
  children,
  professional,
  form,
  theme,
  navigation,
  content,
  email,
  analytics,
  error,
}) => {
  let wrappedChildren = children;

  if (professional) {
    wrappedChildren = (
      <ProfessionalProvider value={professional}>
        {wrappedChildren}
      </ProfessionalProvider>
    );
  }

  if (form) {
    wrappedChildren = (
      <FormProvider value={form}>
        {wrappedChildren}
      </FormProvider>
    );
  }

  if (theme) {
    wrappedChildren = (
      <ThemeProvider value={theme}>
        {wrappedChildren}
      </ThemeProvider>
    );
  }

  if (navigation) {
    wrappedChildren = (
      <NavigationProvider value={navigation}>
        {wrappedChildren}
      </NavigationProvider>
    );
  }

  if (content) {
    wrappedChildren = (
      <ContentProvider value={content}>
        {wrappedChildren}
      </ContentProvider>
    );
  }

  if (email) {
    wrappedChildren = (
      <EmailProvider value={email}>
        {wrappedChildren}
      </EmailProvider>
    );
  }

  if (analytics) {
    wrappedChildren = (
      <AnalyticsProvider value={analytics}>
        {wrappedChildren}
      </AnalyticsProvider>
    );
  }

  if (error) {
    wrappedChildren = (
      <ErrorProvider value={error}>
        {wrappedChildren}
      </ErrorProvider>
    );
  }

  return <>{wrappedChildren}</>;
};

/**
 * Hook to use all available contexts
 */
export function useAllContexts() {
  const professional = React.useContext(ProfessionalContext);
  const form = React.useContext(FormContext);
  const theme = React.useContext(ThemeContext);
  const navigation = React.useContext(NavigationContext);
  const content = React.useContext(ContentContext);
  const email = React.useContext(EmailContext);
  const analytics = React.useContext(AnalyticsContext);
  const error = React.useContext(ErrorContext);

  return {
    professional,
    form,
    theme,
    navigation,
    content,
    email,
    analytics,
    error,
  };
}

export default {
  createI18nContext,
  ProfessionalContext,
  ProfessionalProvider,
  useProfessionalContext,
  FormContext,
  FormProvider,
  useFormContext,
  ThemeContext,
  ThemeProvider,
  useThemeContext,
  NavigationContext,
  NavigationProvider,
  useNavigationContext,
  ContentContext,
  ContentProvider,
  useContentContext,
  EmailContext,
  EmailProvider,
  useEmailContext,
  AnalyticsContext,
  AnalyticsProvider,
  useAnalyticsContext,
  ErrorContext,
  ErrorProvider,
  useErrorContext,
  CombinedContextProvider,
  useAllContexts,
};