// CVPlus i18n integration - Phase 3 implementation
import { initializeI18n, SUPPORTED_LANGUAGES, LANGUAGE_CONFIG } from '@cvplus/i18n';
import { translationService } from '@cvplus/i18n';

// Re-export types and constants from the CVPlus i18n module
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export const supportedLanguages = LANGUAGE_CONFIG;

// Initialize CVPlus i18n system
const initCVPlusI18n = async () => {
  try {
    await initializeI18n({
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      enableProfessionalTerms: true,
      enableCaching: true,
      enableRTL: true,
      enableDevTools: process.env.NODE_ENV === 'development',
      namespaces: ['common', 'cv', 'features', 'premium', 'errors', 'forms'],
      preloadLanguages: ['en'],
      detectionOptions: {
        order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie'],
        storageKey: 'cvplus-language',
      },
      backendOptions: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
    });
    
    console.log('CVPlus i18n system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize CVPlus i18n system:', error);
    // Fallback to basic i18next configuration if CVPlus i18n fails
    await initBasicI18n();
  }
};

// Fallback basic i18n configuration
const initBasicI18n = async () => {
  const i18next = await import('i18next');
  const { initReactI18next } = await import('react-i18next');
  const LanguageDetector = await import('i18next-browser-languagedetector');
  const Backend = await import('i18next-http-backend');

  await i18next.default
    .use(Backend.default)
    .use(LanguageDetector.default)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      
      interpolation: {
        escapeValue: false,
      },
      
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      
      ns: ['common', 'cv', 'features', 'premium', 'errors', 'forms'],
      defaultNS: 'common',
      
      detection: {
        order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie'],
        lookupLocalStorage: 'cvplus-language',
        lookupCookie: 'cvplus-language',
      },
      
      react: {
        useSuspense: true,
      },
      
      preload: ['en'],
      keySeparator: '.',
      nsSeparator: ':',
    });
};

// Initialize the i18n system
initCVPlusI18n();

// Export translation service for direct use
export { translationService };
export default translationService;