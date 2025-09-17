import { useState, useCallback } from 'react';

// Simplified translation system for core-ui
// In a full implementation, this would connect to the i18n microservice

type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh';

// Basic translations for core UI components
const translations = {
  en: {
    navigation: {
      home: 'Home',
      about: 'About',
      features: 'Features',
      pricing: 'Pricing',
      contact: 'Contact',
      login: 'Login',
      signup: 'Sign Up',
      dashboard: 'Dashboard',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
  },
  es: {
    navigation: {
      home: 'Inicio',
      about: 'Acerca de',
      features: 'Características',
      pricing: 'Precios',
      contact: 'Contacto',
      login: 'Iniciar sesión',
      signup: 'Registrarse',
      dashboard: 'Panel',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
    },
  },
  // Add more languages as needed
} as const;

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  const changeLanguage = useCallback((language: SupportedLanguage) => {
    setCurrentLanguage(language);
    // In a full implementation, this would persist to localStorage and update global state
  }, []);

  const t = useCallback((key: string, defaultValue?: string) => {
    // Simple key path traversal (e.g., 'navigation.home')
    const keys = key.split('.');
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue || key;
      }
    }

    return typeof value === 'string' ? value : defaultValue || key;
  }, [currentLanguage]);

  const formatMessage = useCallback((messageId: string, values?: Record<string, any>) => {
    let message = t(messageId);

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    return message;
  }, [t]);

  return {
    currentLanguage,
    changeLanguage,
    t,
    formatMessage,
    locale: currentLanguage,
  };
}

export type { SupportedLanguage };
export default useTranslation;