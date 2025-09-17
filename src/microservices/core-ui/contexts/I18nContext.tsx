// I18n context for managing localization state across microservices
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventBus, EventTypes } from '../services/EventBus';

// Import from existing i18n submodule (we'll use their implementation)
// Note: This will need to be connected to @cvplus/i18n when available

interface I18nConfig {
  language: string;
  region: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: string;
  currency: string;
}

interface I18nContextValue {
  config: I18nConfig;
  setLanguage: (language: string) => void;
  setRegion: (region: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  formatCurrency: (amount: number) => string;
}

const defaultConfig: I18nConfig = {
  language: 'en',
  region: 'US',
  direction: 'ltr',
  dateFormat: 'MM/dd/yyyy',
  numberFormat: 'en-US',
  currency: 'USD'
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  initialConfig?: Partial<I18nConfig>;
}

export function I18nProvider({ children, initialConfig }: I18nProviderProps) {
  const [config, setConfigState] = useState<I18nConfig>({
    ...defaultConfig,
    ...initialConfig
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('cvplus-i18n');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfigState(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.warn('Failed to parse saved i18n config:', error);
      }
    }
  }, []);

  // Apply language changes to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('lang', config.language);
    root.setAttribute('dir', config.direction);

    // Save to localStorage
    localStorage.setItem('cvplus-i18n', JSON.stringify(config));

    // Emit language change event for other microservices
    EventBus.emit({
      type: EventTypes.LANGUAGE_CHANGED,
      source: 'core-ui',
      target: 'all',
      payload: config
    });
  }, [config]);

  const setLanguage = (language: string) => {
    const direction = ['ar', 'he', 'fa', 'ur'].includes(language) ? 'rtl' : 'ltr';
    setConfigState(prev => ({ ...prev, language, direction }));
  };

  const setRegion = (region: string) => {
    setConfigState(prev => ({ ...prev, region }));
  };

  // Simple translation function (will be replaced with @cvplus/i18n)
  const t = (key: string, params?: Record<string, any>): string => {
    // TODO: Integrate with @cvplus/i18n submodule
    // For now, return the key as fallback
    let translation = key;

    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }

    return translation;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(`${config.language}-${config.region}`, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const formatNumber = (number: number): string => {
    return new Intl.NumberFormat(`${config.language}-${config.region}`).format(number);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(`${config.language}-${config.region}`, {
      style: 'currency',
      currency: config.currency
    }).format(amount);
  };

  const value: I18nContextValue = {
    config,
    setLanguage,
    setRegion,
    t,
    formatDate,
    formatNumber,
    formatCurrency
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}