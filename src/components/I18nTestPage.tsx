import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

export const I18nTestPage: React.FC = () => {
  const { t, changeLanguage, currentLanguage, languages, isRTL } = useTranslation();

  return (
    <div className={`min-h-screen bg-gray-100 p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Language Selector */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {t('common.loading')} - i18n Test Page
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm text-gray-600">Current: {currentLanguage} | RTL: {isRTL ? 'Yes' : 'No'}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => changeLanguage(code)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentLanguage === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Navigation Translations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <strong>Home:</strong> {t('navigation.home')}
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Upload:</strong> {t('navigation.upload')}
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Analysis:</strong> {t('navigation.analysis')}
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <strong>Features:</strong> {t('navigation.features')}
            </div>
          </div>
        </div>

        {/* Hero Section Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Hero Section Translations</h2>
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
            <h3 className="text-xl font-bold mb-2">{t('hero.title')}</h3>
            <p className="text-lg mb-2">{t('hero.subtitle')}</p>
            <p className="text-sm mb-4">{t('hero.description')}</p>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-white text-blue-600 rounded font-semibold">
                {t('hero.cta.start')}
              </button>
              <button className="px-4 py-2 border border-white text-white rounded font-semibold">
                {t('hero.cta.learnMore')}
              </button>
            </div>
          </div>
        </div>

        {/* Forms Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Forms Translations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">{t('forms.contactForm.title')}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.contactForm.fields.name.label')}
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder={t('forms.contactForm.fields.name.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.contactForm.fields.email.label')}
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder={t('forms.contactForm.fields.email.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.contactForm.fields.message.label')}
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded text-sm h-20"
                    placeholder={t('forms.contactForm.fields.message.placeholder')}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('forms.contactForm.fields.message.counter', { current: 0, max: 1000 })}
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded font-semibold">
                  {t('forms.contactForm.buttons.send')}
                </button>
              </div>
            </div>

            {/* URL Input */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">URL Input</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('forms.urlInput.label')}
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder={t('forms.urlInput.placeholder')}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {t('forms.urlInput.help')}
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded font-semibold">
                  {t('forms.urlInput.button.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RTL Test Section */}
        {isRTL && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">RTL Layout Test</h2>
            <div className="p-4 border border-red-300 rounded-lg bg-red-50">
              <p className="text-red-800 mb-2">
                🔍 RTL Mode Active - Text should be right-aligned and layout should be mirrored
              </p>
              <div className="flex items-center gap-2 rtl:flex-row-reverse">
                <span className="px-2 py-1 bg-red-200 rounded text-sm">Start</span>
                <span className="flex-1 text-center">→ Direction Test ←</span>
                <span className="px-2 py-1 bg-red-200 rounded text-sm">End</span>
              </div>
            </div>
          </div>
        )}

        {/* Common Buttons Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Common Elements</h2>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 bg-gray-200 rounded text-sm">
              {t('common.save')}
            </button>
            <button className="px-3 py-2 bg-gray-200 rounded text-sm">
              {t('common.cancel')}
            </button>
            <button className="px-3 py-2 bg-gray-200 rounded text-sm">
              {t('common.submit')}
            </button>
            <button className="px-3 py-2 bg-gray-200 rounded text-sm">
              {t('common.retry')}
            </button>
            <button className="px-3 py-2 bg-gray-200 rounded text-sm">
              {t('common.loading')}
            </button>
          </div>
        </div>

        {/* Success/Error Messages Test */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status Messages</h2>
          <div className="space-y-2">
            <div className="p-3 bg-green-100 border border-green-300 rounded text-green-800">
              ✅ {t('forms.contactForm.status.success')}
            </div>
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800">
              ❌ {t('forms.contactForm.status.error')}
            </div>
            <div className="p-3 bg-blue-100 border border-blue-300 rounded text-blue-800">
              ℹ️ {t('forms.urlInput.help')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};