import i18n, { SupportedLanguage } from '../i18n/config';

/**
 * Translation Service for Dynamic Content
 * Handles translation of dynamic content from backend, AI-generated text,
 * and user-generated content
 */
export class TranslationService {
  private static instance: TranslationService;
  private translationCache: Map<string, Map<string, string>> = new Map();
  
  private constructor() {}
  
  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }
  
  /**
   * Translate dynamic content based on predefined keys
   */
  translateDynamic(key: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    // Check cache first
    const cacheKey = `${targetLang}.${key}`;
    if (this.translationCache.has(targetLang)) {
      const langCache = this.translationCache.get(targetLang);
      if (langCache?.has(key)) {
        return langCache.get(key) || key;
      }
    }
    
    // Try to get from i18n
    const translation = i18n.t(key, { lng: targetLang });
    if (translation !== key) {
      this.cacheTranslation(targetLang, key, translation);
      return translation;
    }
    
    // Fallback to key
    return key;
  }
  
  /**
   * Translate CV sections and fields
   */
  translateCVSection(section: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const cvSectionKeys: Record<string, string> = {
      'personalInfo': 'cv.sections.personalInfo',
      'summary': 'cv.sections.summary',
      'experience': 'cv.sections.experience',
      'education': 'cv.sections.education',
      'skills': 'cv.sections.skills',
      'certifications': 'cv.sections.certifications',
      'languages': 'cv.sections.languages',
      'projects': 'cv.sections.projects',
      'publications': 'cv.sections.publications',
      'awards': 'cv.sections.awards',
      'references': 'cv.sections.references'
    };
    
    const key = cvSectionKeys[section] || section;
    return this.translateDynamic(key, targetLang);
  }
  
  /**
   * Translate role titles
   */
  translateRole(role: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    // Common role translations
    const roleKey = `roles.${role.toLowerCase().replace(/\s+/g, '_')}`;
    const translation = this.translateDynamic(roleKey, targetLang);
    
    // If no specific translation found, return original
    return translation !== roleKey ? translation : role;
  }
  
  /**
   * Translate skill categories
   */
  translateSkillCategory(category: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const categoryKeys: Record<string, string> = {
      'technical': 'skills.categories.technical',
      'soft': 'skills.categories.soft',
      'languages': 'skills.categories.languages',
      'tools': 'skills.categories.tools',
      'frameworks': 'skills.categories.frameworks',
      'databases': 'skills.categories.databases',
      'cloud': 'skills.categories.cloud',
      'methodologies': 'skills.categories.methodologies'
    };
    
    const key = categoryKeys[category.toLowerCase()] || category;
    return this.translateDynamic(key, targetLang);
  }
  
  /**
   * Translate feature names
   */
  translateFeature(feature: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const featureKey = `features.items.${feature.toLowerCase().replace(/\s+/g, '_')}`;
    const translation = this.translateDynamic(featureKey, targetLang);
    
    return translation !== featureKey ? translation : feature;
  }
  
  /**
   * Translate error messages
   */
  translateError(errorCode: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const errorKey = `errors.${errorCode}`;
    const translation = this.translateDynamic(errorKey, targetLang);
    
    // Fallback to generic error message
    if (translation === errorKey) {
      return i18n.t('errors.generic', { lng: targetLang });
    }
    
    return translation;
  }
  
  /**
   * Translate success messages
   */
  translateSuccess(successCode: string, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const successKey = `success.${successCode}`;
    return this.translateDynamic(successKey, targetLang);
  }
  
  /**
   * Format dates according to locale
   */
  formatDate(date: Date | string, format?: 'short' | 'medium' | 'long', language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const formats: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' }
    };
    
    const options = formats[format || 'medium'];
    
    // Get locale from language config
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ar: 'ar-SA',
      pt: 'pt-BR',
      ja: 'ja-JP'
    };
    
    return new Intl.DateTimeFormat(localeMap[targetLang], options).format(dateObj);
  }
  
  /**
   * Format numbers according to locale
   */
  formatNumber(num: number, options?: Intl.NumberFormatOptions, language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ar: 'ar-SA',
      pt: 'pt-BR',
      ja: 'ja-JP'
    };
    
    return new Intl.NumberFormat(localeMap[targetLang], options).format(num);
  }
  
  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency = 'USD', language?: SupportedLanguage): string {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    const localeMap: Record<SupportedLanguage, string> = {
      en: 'en-US',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ar: 'ar-SA',
      pt: 'pt-BR',
      ja: 'ja-JP'
    };
    
    return new Intl.NumberFormat(localeMap[targetLang], {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  /**
   * Get RTL direction for language
   */
  getDirection(language?: SupportedLanguage): 'ltr' | 'rtl' {
    const targetLang = language || i18n.language as SupportedLanguage;
    
    // Only Arabic is RTL in our supported languages
    return targetLang === 'ar' ? 'rtl' : 'ltr';
  }
  
  /**
   * Cache translation for performance
   */
  private cacheTranslation(language: SupportedLanguage, key: string, value: string): void {
    if (!this.translationCache.has(language)) {
      this.translationCache.set(language, new Map());
    }
    
    const langCache = this.translationCache.get(language);
    langCache?.set(key, value);
  }
  
  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }
  
  /**
   * Preload translations for a language
   */
  async preloadLanguage(language: SupportedLanguage): Promise<void> {
    try {
      await i18n.loadLanguages(language);
    } catch (error) {
      console.error(`Failed to preload language ${language}:`, error);
    }
  }
  
  /**
   * Get available languages
   */
  getAvailableLanguages(): SupportedLanguage[] {
    return ['en', 'es', 'fr', 'de', 'zh', 'ar', 'pt', 'ja'];
  }
  
  /**
   * Get current language
   */
  getCurrentLanguage(): SupportedLanguage {
    return i18n.language as SupportedLanguage;
  }
  
  /**
   * Change language
   */
  async changeLanguage(language: SupportedLanguage): Promise<void> {
    await i18n.changeLanguage(language);
    
    // Update HTML attributes
    document.documentElement.lang = language;
    document.documentElement.dir = this.getDirection(language);
    
    // Clear cache for fresh translations
    this.clearCache();
  }
}

// Export singleton instance
export const translationService = TranslationService.getInstance();