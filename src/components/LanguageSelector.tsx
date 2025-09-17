import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';
import { supportedLanguages, type SupportedLanguage } from '../i18n/config';

export function LanguageSelector() {
  const { currentLanguage, changeLanguage } = useTranslation();
  
  // Get current language config with fallback to English
  const currentLangConfig = supportedLanguages[currentLanguage] || supportedLanguages.en;
  
  return (
    <div className="relative">
      <Listbox value={currentLanguage} onChange={changeLanguage}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white/10 backdrop-blur-sm border border-gray-700 hover:border-cyan-400/50 transition-colors py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/20 sm:text-sm">
            <span className="flex items-center gap-2">
              <LanguageIcon className="h-4 w-4 text-gray-400" />
              <span className="block truncate text-gray-200">
                {currentLangConfig.flag} {currentLangConfig.name}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-1 max-h-60 w-full min-w-[200px] overflow-auto rounded-md bg-gray-800 border border-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {Object.entries(supportedLanguages).map(([code, lang]) => (
                <Listbox.Option
                  key={code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 transition-colors ${
                      active ? 'bg-cyan-900/50 text-cyan-100' : 'text-gray-200'
                    }`
                  }
                  value={code}
                >
                  {({ selected }) => (
                    <>
                      <span className={`flex items-center gap-2 ${selected ? 'font-medium' : 'font-normal'}`}>
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

// Compact version for mobile
export function LanguageSelectorCompact() {
  const { currentLanguage, changeLanguage } = useTranslation();
  
  // Get current language config with fallback to English
  const currentLangConfig = supportedLanguages[currentLanguage] || supportedLanguages.en;
  
  return (
    <div className="relative">
      <Listbox value={currentLanguage} onChange={changeLanguage}>
        <div className="relative">
          <Listbox.Button className="relative cursor-pointer rounded-lg bg-white/10 backdrop-blur-sm border border-gray-700 hover:border-cyan-400/50 transition-colors p-2 shadow-md focus:outline-none focus-visible:border-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-400/20">
            <span className="flex items-center gap-1">
              <span className="text-lg">{currentLangConfig.flag}</span>
              <ChevronUpDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-0 mt-1 max-h-60 w-48 overflow-auto rounded-md bg-gray-800 border border-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
              {Object.entries(supportedLanguages).map(([code, lang]) => (
                <Listbox.Option
                  key={code}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-4 transition-colors ${
                      active ? 'bg-cyan-900/50 text-cyan-100' : 'text-gray-200'
                    }`
                  }
                  value={code}
                >
                  {({ selected }) => (
                    <span className={`flex items-center gap-2 ${selected ? 'font-medium' : 'font-normal'}`}>
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                      {selected && (
                        <CheckIcon className="h-4 w-4 text-cyan-400 ml-auto" />
                      )}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}