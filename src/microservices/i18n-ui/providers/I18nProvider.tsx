/**
 * @fileoverview I18n Provider for React context management
 * Provides i18n context and state management for React applications
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { I18nextProvider } from 'react-i18next';
import { translationService } from '../services/translation.service';
import type { SupportedLanguage, TranslationServiceConfig } from '../types';

interface I18nContextValue {
  currentLanguage: SupportedLanguage;
  isLoading: boolean;
  error: Error | null;
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  preloadLanguage: (language: SupportedLanguage) => Promise<void>;
  clearCache: () => void;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: React.ReactNode;
  config?: Partial<TranslationServiceConfig>;
  fallback?: React.ReactNode;
  onLanguageChange?: (language: SupportedLanguage) => void;
  onError?: (error: Error) => void;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  config,
  fallback = <div>Loading translations...</div>,
  onLanguageChange,
  onError,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize translation service
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const service = translationService;
        if (config) {
          // Re-initialize with new config if provided
          await service.initialize();
        }

        if (mounted) {
          const lang = service.getCurrentLanguage();
          setCurrentLanguage(lang);
          setIsInitialized(true);
        }
      } catch (err) {
        const error = err as Error;
        console.error('Failed to initialize i18n:', error);
        
        if (mounted) {
          setError(error);
          onError?.(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [config, onError]);

  // Handle language changes
  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      setError(null);

      await translationService.changeLanguage(language);
      setCurrentLanguage(language);
      onLanguageChange?.(language);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to change language:', error);
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onLanguageChange, onError]);

  // Preload language
  const preloadLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      await translationService.preloadLanguage(language);
    } catch (err) {
      const error = err as Error;
      console.error('Failed to preload language:', error);
      onError?.(error);
    }
  }, [onError]);

  // Clear cache
  const clearCache = useCallback(() => {
    try {
      translationService.clearCache();
    } catch (err) {
      const error = err as Error;
      console.error('Failed to clear cache:', error);
      onError?.(error);
    }
  }, [onError]);

  // Calculate RTL state
  const isRTL = translationService.isRTL(currentLanguage);
  const direction = isRTL ? 'rtl' : 'ltr';

  // Context value
  const contextValue: I18nContextValue = {
    currentLanguage,
    isLoading,
    error,
    changeLanguage,
    preloadLanguage,
    clearCache,
    isRTL,
    direction,
  };

  // Show fallback while loading or on error
  if (!isInitialized || (isLoading && !currentLanguage)) {
    return <>{fallback}</>;
  }

  if (error && !currentLanguage) {
    return (
      <div role="alert" className="i18n-error">
        <h2>Translation Error</h2>
        <p>Failed to load translations: {error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>
      <I18nextProvider i18n={translationService.i18n}>
        <div dir={direction} lang={currentLanguage} className={`i18n-root ${direction}`}>
          {children}
        </div>
      </I18nextProvider>
    </I18nContext.Provider>
  );
};

/**
 * Hook to use the I18n context
 */
export function useI18nContext(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  
  return context;
}

/**
 * Hook to check if I18n is ready
 */
export function useI18nReady(): boolean {
  const context = useContext(I18nContext);
  return context !== undefined && !context.isLoading && !context.error;
}

/**
 * HOC to ensure component has I18n context
 */
export function withI18nProvider<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  providerProps?: Omit<I18nProviderProps, 'children'>
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <I18nProvider {...providerProps}>
        <Component {...(props as any)} ref={ref} />
      </I18nProvider>
    );
  });

  WrappedComponent.displayName = `withI18nProvider(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Error boundary for I18n errors
 */
interface I18nErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class I18nErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  I18nErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): I18nErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('I18n Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} />;
      }

      return (
        <div role="alert" className="i18n-error-boundary">
          <h2>Something went wrong with translations</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error.message}
            {this.state.error.stack}
          </details>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default I18nProvider;