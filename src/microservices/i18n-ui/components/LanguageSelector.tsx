/**
 * @fileoverview Language Selector Component for CVPlus i18n
 * Provides multiple variants for language selection with accessibility support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { SupportedLanguage, LanguageSelectorProps } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGE_CONFIG } from '../constants';

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  showFlags = true,
  showNames = true,
  filterLanguages,
  onLanguageChange,
  className = '',
  disabled = false,
}) => {
  const { currentLanguage, changeLanguage, languages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Filter languages if specified
  const availableLanguages = filterLanguages 
    ? filterLanguages.filter(lang => languages[lang])
    : Object.keys(languages) as SupportedLanguage[];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (variant === 'dropdown') {
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(availableLanguages.findIndex(lang => lang === currentLanguage));
          } else if (focusedIndex >= 0) {
            const selectedLanguage = availableLanguages[focusedIndex];
            if (selectedLanguage) {
              handleLanguageSelect(selectedLanguage);
            }
          }
        }
        break;
        
      case 'Escape':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
        }
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        if (variant === 'dropdown') {
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex(prev => 
              prev < availableLanguages.length - 1 ? prev + 1 : 0
            );
          }
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (variant === 'dropdown' && isOpen) {
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : availableLanguages.length - 1
          );
        }
        break;
        
      case 'Home':
        if (variant === 'dropdown' && isOpen) {
          event.preventDefault();
          setFocusedIndex(0);
        }
        break;
        
      case 'End':
        if (variant === 'dropdown' && isOpen) {
          event.preventDefault();
          setFocusedIndex(availableLanguages.length - 1);
        }
        break;
    }
  }, [disabled, variant, isOpen, focusedIndex, availableLanguages, currentLanguage]);

  const handleLanguageSelect = useCallback(async (language: SupportedLanguage) => {
    if (disabled || language === currentLanguage) return;

    try {
      await changeLanguage(language);
      onLanguageChange?.(language);
      setIsOpen(false);
      setFocusedIndex(-1);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [disabled, currentLanguage, changeLanguage, onLanguageChange]);

  // Render language item
  const renderLanguageItem = useCallback((
    language: SupportedLanguage, 
    index: number, 
    isSelected: boolean,
    isFocused: boolean
  ) => {
    const config = languages[language];
    const itemClasses = [
      'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
      isSelected ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100',
      isFocused ? 'bg-gray-100' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ].join(' ');

    return (
      <div
        key={language}
        className={itemClasses}
        onClick={() => !disabled && handleLanguageSelect(language)}
        onMouseEnter={() => setFocusedIndex(index)}
        role="option"
        aria-selected={isSelected}
        tabIndex={-1}
      >
        {showFlags && config.flag && (
          <span className="text-lg" role="img" aria-label={`${config.name} flag`}>
            {config.flag}
          </span>
        )}
        {showNames && (
          <span className="flex-1">
            {config.nativeName || config.name}
          </span>
        )}
        {config.dir === 'rtl' && (
          <span className="text-xs text-gray-500 uppercase">RTL</span>
        )}
      </div>
    );
  }, [languages, showFlags, showNames, disabled, handleLanguageSelect]);

  // Dropdown variant
  if (variant === 'dropdown') {
    const currentConfig = languages[currentLanguage];
    
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          ref={buttonRef}
          type="button"
          className={[
            'flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm transition-colors',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            isOpen ? 'border-blue-500 ring-2 ring-blue-500' : ''
          ].join(' ')}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t('language.selector.aria.label', { replace: { current: currentConfig?.name || currentLanguage } })}
        >
          {showFlags && currentConfig?.flag && (
            <span className="text-lg" role="img" aria-hidden="true">
              {currentConfig.flag}
            </span>
          )}
          {showNames && (
            <span className="flex-1 text-left">
              {currentConfig?.nativeName || currentConfig?.name || currentLanguage}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-label={t('language.selector.options.aria.label')}
          >
            {availableLanguages.map((language, index) =>
              renderLanguageItem(
                language,
                index,
                language === currentLanguage,
                index === focusedIndex
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // List variant
  if (variant === 'list') {
    return (
      <div className={`space-y-1 ${className}`} role="radiogroup" aria-label={t('language.selector.list.aria.label')}>
        {availableLanguages.map((language, index) => {
          const config = languages[language];
          const isSelected = language === currentLanguage;
          
          return (
            <label
              key={language}
              className={[
                'flex items-center gap-3 px-3 py-2 text-sm border rounded-md cursor-pointer transition-colors',
                isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-900' 
                  : 'border-gray-300 hover:bg-gray-50',
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              ].join(' ')}
            >
              <input
                type="radio"
                name="language"
                value={language}
                checked={isSelected}
                onChange={() => handleLanguageSelect(language)}
                disabled={disabled}
                className="sr-only"
                aria-describedby={`lang-${language}-desc`}
              />
              {showFlags && config.flag && (
                <span className="text-lg" role="img" aria-label={`${config.name} flag`}>
                  {config.flag}
                </span>
              )}
              {showNames && (
                <span className="flex-1">
                  {config.nativeName || config.name}
                </span>
              )}
              {config.dir === 'rtl' && (
                <span className="text-xs text-gray-500 uppercase">RTL</span>
              )}
              <span
                id={`lang-${language}-desc`}
                className={`w-4 h-4 border-2 rounded-full flex items-center justify-center ${
                  isSelected ? 'border-blue-500' : 'border-gray-300'
                }`}
              >
                {isSelected && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  // Flags variant (horizontal)
  if (variant === 'flags') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`} role="radiogroup" aria-label={t('language.selector.flags.aria.label')}>
        {availableLanguages.map((language) => {
          const config = languages[language];
          const isSelected = language === currentLanguage;
          
          return (
            <button
              key={language}
              type="button"
              onClick={() => handleLanguageSelect(language)}
              disabled={disabled}
              className={[
                'flex items-center gap-1 px-2 py-1 text-sm border rounded transition-colors',
                isSelected 
                  ? 'border-blue-500 bg-blue-50 text-blue-900' 
                  : 'border-gray-300 hover:bg-gray-50',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              ].join(' ')}
              aria-label={`${config.name} ${isSelected ? t('language.selector.selected') : ''}`}
              aria-pressed={isSelected}
            >
              {config.flag && (
                <span className="text-lg" role="img" aria-hidden="true">
                  {config.flag}
                </span>
              )}
              {showNames && (
                <span className="text-xs">
                  {language.toUpperCase()}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact variant (minimal)
  if (variant === 'compact') {
    const currentConfig = languages[currentLanguage];
    
    return (
      <select
        value={currentLanguage}
        onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
        disabled={disabled}
        className={`text-sm border border-gray-300 rounded px-2 py-1 bg-white ${disabled ? 'opacity-50' : ''} ${className}`}
        aria-label={t('language.selector.compact.aria.label')}
      >
        {availableLanguages.map((language) => {
          const config = languages[language];
          return (
            <option key={language} value={language}>
              {showFlags && config.flag ? `${config.flag} ` : ''}
              {showNames ? (config.nativeName || config.name) : language.toUpperCase()}
            </option>
          );
        })}
      </select>
    );
  }

  return null;
};

export default LanguageSelector;