import React, { useState } from 'react';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

// Simplified language configuration for core-ui
const supportedLanguages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇵🇹' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ko: { name: '한국어', flag: '🇰🇷' },
  zh: { name: '中文', flag: '🇨🇳' }
};

type SupportedLanguage = keyof typeof supportedLanguages;

// Simplified useTranslation hook for core-ui
const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  const changeLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    // In a full implementation, this would update the app's locale
  };

  return {
    currentLanguage,
    changeLanguage
  };
};

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangConfig = supportedLanguages[currentLanguage];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
      >
        <GlobeAltIcon className="h-4 w-4" />
        {variant === 'compact' ? (
          <span>{currentLangConfig.flag}</span>
        ) : (
          <span className="flex items-center gap-1">
            {currentLangConfig.flag} {currentLangConfig.name}
          </span>
        )}
        <ChevronDownIcon className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
            {Object.entries(supportedLanguages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => {
                  changeLanguage(code as SupportedLanguage);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors ${
                  currentLanguage === code ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Compact variant
export function LanguageSelectorCompact(props: Omit<LanguageSelectorProps, 'variant'>) {
  return <LanguageSelector {...props} variant="compact" />;
}

export { type SupportedLanguage };
export default LanguageSelector;