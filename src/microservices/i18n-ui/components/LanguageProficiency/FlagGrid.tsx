/**
 * Flag Grid Component for Language Proficiency
 * Displays country flags with proficiency badges and certifications
 */

import React, { useState } from 'react';
import { CheckCircle, Award, Info, Calendar } from 'lucide-react';
import { LanguageProficiency } from '../../types/language';

interface FlagGridProps {
  languages: LanguageProficiency[];
}

const PROFICIENCY_CONFIG = {
  native: { color: '#10B981', bgColor: '#D1FAE5', label: 'Native', badge: 'N' },
  fluent: { color: '#3B82F6', bgColor: '#DBEAFE', label: 'Fluent', badge: 'F' },
  professional: { color: '#8B5CF6', bgColor: '#E9D5FF', label: 'Professional', badge: 'P' },
  limited: { color: '#F59E0B', bgColor: '#FEF3C7', label: 'Limited', badge: 'L' },
  elementary: { color: '#6B7280', bgColor: '#F3F4F6', label: 'Elementary', badge: 'E' }
};

const CEFR_MAPPING = {
  native: 'C2+',
  fluent: 'C2',
  professional: 'C1',
  limited: 'B2',
  elementary: 'A2-B1'
};

const FlagCard: React.FC<{
  language: LanguageProficiency;
  index: number;
  onSelect: (language: LanguageProficiency) => void;
}> = ({ language, index, onSelect }) => {
  const config = PROFICIENCY_CONFIG[language.proficiency] || PROFICIENCY_CONFIG.elementary;
  const cefrLevel = language.frameworks?.cefr || CEFR_MAPPING[language.proficiency] || 'Unknown';

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => onSelect(language)}
    >
      {/* Flag and Main Info */}
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">{language.flag || '🌍'}</div>
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {language.name}
        </h4>
        
        {/* Proficiency Badge */}
        <div 
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-xs mb-2"
          style={{ backgroundColor: config.color }}
          title={`${config.label} (${cefrLevel})`}
        >
          {config.badge}
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {config.label}
        </div>
        
        {cefrLevel !== 'Unknown' && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            CEFR: {cefrLevel}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center items-center gap-2 mb-3">
        {language.verified && (
          <div className="flex items-center gap-1" title="Verified proficiency">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">Verified</span>
          </div>
        )}
        
        {language.certifications && language.certifications.length > 0 && (
          <div className="flex items-center gap-1" title={`${language.certifications.length} certification(s)`}>
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              {language.certifications.length}
            </span>
          </div>
        )}
      </div>

      {/* Experience */}
      {language.yearsOfExperience && language.yearsOfExperience > 0 && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Calendar className="w-3 h-3" />
          {language.yearsOfExperience} years
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div 
          className="h-2 rounded-full"
          style={{ backgroundColor: config.bgColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${(language.score || PROFICIENCY_CONFIG[language.proficiency]?.score || 50)}%`,
              backgroundColor: config.color
            }}
          />
        </div>
      </div>

      {/* Hover Info */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Info className="w-4 h-4 text-gray-400" />
      </div>

      {/* Quick Certifications Preview */}
      {language.certifications && language.certifications.length > 0 && (
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
            {language.certifications[0]}
            {language.certifications.length > 1 && (
              <span className="text-gray-400"> +{language.certifications.length - 1}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const LanguageDetailModal: React.FC<{
  language: LanguageProficiency;
  onClose: () => void;
}> = ({ language, onClose }) => {
  const config = PROFICIENCY_CONFIG[language.proficiency] || PROFICIENCY_CONFIG.elementary;
  const score = language.score || config.score || 50;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{language.flag || '🌍'}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language.name}
              </h3>
              <div 
                className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mt-1"
                style={{ backgroundColor: config.color }}
              >
                {config.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Proficiency Score</span>
            <span className="text-lg font-bold" style={{ color: config.color }}>
              {score}%
            </span>
          </div>
          <div 
            className="h-3 rounded-full"
            style={{ backgroundColor: config.bgColor }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${score}%`,
                backgroundColor: config.color
              }}
            />
          </div>
          
          {language.frameworks && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {language.frameworks.cefr && (
                <div>CEFR Level: <span className="font-medium">{language.frameworks.cefr}</span></div>
              )}
              {language.frameworks.actfl && (
                <div>ACTFL Level: <span className="font-medium">{language.frameworks.actfl}</span></div>
              )}
            </div>
          )}
        </div>

        {/* Experience */}
        {language.yearsOfExperience && language.yearsOfExperience > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Experience</h4>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {language.yearsOfExperience} years of active use
            </div>
          </div>
        )}

        {/* Contexts */}
        {language.contexts && language.contexts.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Context</h4>
            <div className="flex flex-wrap gap-2">
              {language.contexts.map((context, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full"
                >
                  {context}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {language.certifications && language.certifications.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Certifications
            </h4>
            <div className="space-y-2">
              {language.certifications.map((cert, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-green-800 dark:text-green-200 text-sm">
                    {cert}
                  </span>
                  {language.verified && (
                    <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {language.verified ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Verified Proficiency</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span className="text-sm">Self-assessed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const FlagGrid: React.FC<FlagGridProps> = ({ languages }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageProficiency | null>(null);

  if (!languages.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">🏳️</div>
          <p>No languages to display</p>
        </div>
      </div>
    );
  }

  // Sort languages by proficiency level
  const sortedLanguages = [...languages].sort((a, b) => {
    const scoreA = a.score || PROFICIENCY_CONFIG[a.proficiency]?.score || 0;
    const scoreB = b.score || PROFICIENCY_CONFIG[b.proficiency]?.score || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="w-full">
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedLanguages.map((language, index) => (
          <FlagCard
            key={`${language.name}-${index}`}
            language={language}
            index={index}
            onSelect={setSelectedLanguage}
          />
        ))}
      </div>
      
      {/* Summary Grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {languages.length}
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300">Total</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {languages.filter(l => l.proficiency === 'native' || l.proficiency === 'fluent').length}
          </div>
          <div className="text-sm text-green-800 dark:text-green-300">Fluent+</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {languages.filter(l => l.certifications && l.certifications.length > 0).length}
          </div>
          <div className="text-sm text-yellow-800 dark:text-yellow-300">Certified</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {languages.filter(l => l.verified).length}
          </div>
          <div className="text-sm text-purple-800 dark:text-purple-300">Verified</div>
        </div>
      </div>

      {/* Modal */}
      {selectedLanguage && (
        <LanguageDetailModal
          language={selectedLanguage}
          onClose={() => setSelectedLanguage(null)}
        />
      )}
    </div>
  );
};