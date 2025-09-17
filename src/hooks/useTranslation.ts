import { useTranslation as useI18nTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { supportedLanguages, type SupportedLanguage } from '../i18n/config';

export interface UseTranslationReturn {
  t: (key: string, options?: any) => string;
  i18n: any;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatPercentage: (value: number, decimals?: number) => string;
  currentLanguage: SupportedLanguage;
  languages: typeof supportedLanguages;
  isRTL: boolean;
  locale: string;
}

export function useTranslation(namespace?: string): UseTranslationReturn {
  const { t, i18n } = useI18nTranslation(namespace);
  
  const currentLanguage = i18n.language as SupportedLanguage;
  const currentLangConfig = supportedLanguages[currentLanguage] || supportedLanguages.en;
  const isRTL = currentLangConfig.dir === 'rtl';
  const locale = currentLangConfig.locale;
  
  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    try {
      await i18n.changeLanguage(lang);
      
      // Update HTML dir attribute for RTL languages
      const langConfig = supportedLanguages[lang];
      document.documentElement.dir = langConfig.dir;
      
      // Add or remove RTL class for Tailwind
      if (langConfig.dir === 'rtl') {
        document.documentElement.classList.add('rtl');
      } else {
        document.documentElement.classList.remove('rtl');
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Store preference
      localStorage.setItem('cvplus-language', lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [i18n]);
  
  const formatDate = useCallback((
    date: Date | string,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Default options if not provided
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    try {
      return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateObj.toLocaleDateString();
    }
  }, [locale]);
  
  const formatNumber = useCallback((
    num: number,
    options?: Intl.NumberFormatOptions
  ) => {
    try {
      return new Intl.NumberFormat(locale, options).format(num);
    } catch (error) {
      console.error('Number formatting error:', error);
      return num.toString();
    }
  }, [locale]);
  
  const formatCurrency = useCallback((
    amount: number,
    currency = 'USD'
  ) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `${currency} ${amount}`;
    }
  }, [locale]);
  
  const formatPercentage = useCallback((
    value: number,
    decimals = 0
  ) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value / 100);
    } catch (error) {
      console.error('Percentage formatting error:', error);
      return `${value}%`;
    }
  }, [locale]);
  
  return useMemo(() => ({
    t,
    i18n,
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercentage,
    currentLanguage,
    languages: supportedLanguages,
    isRTL,
    locale,
  }), [
    t,
    i18n,
    changeLanguage,
    formatDate,
    formatNumber,
    formatCurrency,
    formatPercentage,
    currentLanguage,
    isRTL,
    locale,
  ]);
}