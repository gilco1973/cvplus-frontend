import React, { useState, useEffect } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface Language {
  name: string;
  nativeName: string;
  code: string;
  proficiency: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
  certifications: string[];
  experienceYears: number;
  useContext: string[];
  isNative: boolean;
  isVerified: boolean;
}

interface CEFRLevel {
  level: string;
  description: string;
  color: string;
  percentage: number;
  canDo: string[];
}

interface LanguageProficiencyProps extends CVFeatureProps {
  displayStyle?: 'cards' | 'progress' | 'badges' | 'detailed';
  showCertifications?: boolean;
  showExperience?: boolean;
  groupByProficiency?: boolean;
}

const CEFR_LEVELS: Record<string, CEFRLevel> = {
  'A1': {
    level: 'A1 - Beginner',
    description: 'Basic understanding and simple expressions',
    color: '#EF4444',
    percentage: 20,
    canDo: [
      'Understand familiar everyday expressions',
      'Introduce yourself and others',
      'Ask and answer questions about personal details'
    ]
  },
  'A2': {
    level: 'A2 - Elementary',
    description: 'Basic communication in simple tasks',
    color: '#F97316',
    percentage: 35,
    canDo: [
      'Communicate in routine tasks',
      'Describe background and immediate environment',
      'Express immediate needs'
    ]
  },
  'B1': {
    level: 'B1 - Intermediate',
    description: 'Clear standard input on familiar matters',
    color: '#EAB308',
    percentage: 50,
    canDo: [
      'Deal with travel situations',
      'Describe experiences and events',
      'Give brief explanations for opinions'
    ]
  },
  'B2': {
    level: 'B2 - Upper Intermediate',
    description: 'Complex text and spontaneous interaction',
    color: '#22C55E',
    percentage: 70,
    canDo: [
      'Interact fluently with native speakers',
      'Produce detailed text on various subjects',
      'Explain viewpoints with advantages/disadvantages'
    ]
  },
  'C1': {
    level: 'C1 - Advanced',
    description: 'Wide range of demanding texts',
    color: '#3B82F6',
    percentage: 85,
    canDo: [
      'Express ideas fluently and spontaneously',
      'Use language effectively for academic purposes',
      'Produce well-structured, detailed text'
    ]
  },
  'C2': {
    level: 'C2 - Proficient',
    description: 'Understanding virtually everything',
    color: '#8B5CF6',
    percentage: 95,
    canDo: [
      'Understand virtually everything heard or read',
      'Express themselves spontaneously and precisely',
      'Differentiate finer shades of meaning'
    ]
  },
  'Native': {
    level: 'Native Speaker',
    description: 'Native or bilingual proficiency',
    color: '#1F2937',
    percentage: 100,
    canDo: [
      'Complete native-level fluency',
      'Cultural and linguistic intuition',
      'All complex communication scenarios'
    ]
  }
};

export const LanguageProficiency: React.FC<LanguageProficiencyProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  displayStyle = 'cards',
  showCertifications = true,
  showExperience = true,
  groupByProficiency = false
}) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showCEFRGuide, setShowCEFRGuide] = useState(false);

  const {
    data: languageData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getLanguageProficiency',
    { jobId, profileId },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (languageData) {
      setLanguages(languageData.languages || []);
      onUpdate?.(languageData);
    }
  }, [languageData, onUpdate]);

  const getFlagEmoji = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getProficiencyBadge = (proficiency: string) => {
    const cefrLevel = CEFR_LEVELS[proficiency];
    if (!cefrLevel) return null;

    return (
      <div
        className="px-3 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: cefrLevel.color }}
      >
        {proficiency}
      </div>
    );
  };

  const getProgressBar = (proficiency: string) => {
    const cefrLevel = CEFR_LEVELS[proficiency];
    if (!cefrLevel) return null;

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="animate-fade-in">
          %` }}
          }
          className="h-2 rounded-full"
          style={{ backgroundColor: cefrLevel.color }}
        />
      </div>
    );
  };

  const groupedLanguages = groupByProficiency
    ? languages.reduce((acc, lang) => {
        const level = lang.proficiency;
        if (!acc[level]) acc[level] = [];
        acc[level].push(lang);
        return acc;
      }, {} as Record<string, Language[]>)
    : {};

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Language Proficiency">
        <LoadingSpinner message="Analyzing language skills..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Language Proficiency">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  if (!languages.length) {
    return (
      <FeatureWrapper className={className} title="Language Proficiency">
        <div className="text-gray-500 text-center p-8">
          <p>No language information available</p>
        </div>
      </FeatureWrapper>
    );
  }

  return (
    <FeatureWrapper className={className} title="Language Proficiency">
      <div className="space-y-6">
        {/* Header with CEFR Guide */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Languages ({languages.length})
          </h3>
          <button
            onClick={() => setShowCEFRGuide(!showCEFRGuide)}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {showCEFRGuide ? 'Hide' : 'Show'} CEFR Guide
          </button>
        </div>

        {/* CEFR Guide */}
        <div>
          {showCEFRGuide && (
            <div className="animate-fade-in">
              }
              }
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-3">
                Common European Framework of Reference (CEFR)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(CEFR_LEVELS).map(([level, info]) => (
                  <div key={level} className="flex items-start gap-3">
                    <div
                      className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: info.color }}
                    />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {info.level}
                      </div>
                      <div className="text-xs text-gray-600">
                        {info.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Language Display */}
        {displayStyle === 'cards' && !groupByProficiency && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languages.map((language, index) => (
              <div className="animate-fade-in"
                key={language.code}>
                className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLanguage(language)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {getFlagEmoji(language.code)}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {language.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {language.nativeName}
                    </p>
                  </div>
                  {language.isNative && (
                    <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Native
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Proficiency</span>
                      {getProficiencyBadge(language.proficiency)}
                    </div>
                    {getProgressBar(language.proficiency)}
                  </div>

                  {showExperience && language.experienceYears > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Experience:</span> {language.experienceYears} years
                    </div>
                  )}

                  {showCertifications && language.certifications.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Certifications:</div>
                      <div className="flex flex-wrap gap-1">
                        {language.certifications.slice(0, 2).map((cert, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {cert}
                          </span>
                        ))}
                        {language.certifications.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{language.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {language.isVerified && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayStyle === 'progress' && (
          <div className="space-y-4">
            {languages.map((language, index) => (
              <div className="animate-fade-in"
                key={language.code}>
                className="bg-white p-4 rounded-lg border"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {getFlagEmoji(language.code)}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {language.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {language.nativeName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getProficiencyBadge(language.proficiency)}
                    {language.isVerified && (
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                {getProgressBar(language.proficiency)}
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>{CEFR_LEVELS[language.proficiency]?.description}</span>
                  <span>{CEFR_LEVELS[language.proficiency]?.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayStyle === 'badges' && (
          <div className="flex flex-wrap gap-3">
            {languages.map((language, index) => (
              <div className="animate-fade-in"
                key={language.code}>
                className="flex items-center gap-2 bg-white p-3 rounded-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedLanguage(language)}
              >
                <span className="text-lg">
                  {getFlagEmoji(language.code)}
                </span>
                <span className="font-medium text-gray-900">
                  {language.name}
                </span>
                {getProficiencyBadge(language.proficiency)}
                {language.isVerified && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}

        {groupByProficiency && (
          <div className="space-y-6">
            {Object.entries(groupedLanguages)
              .sort(([a], [b]) => {
                const orderA = Object.keys(CEFR_LEVELS).indexOf(a);
                const orderB = Object.keys(CEFR_LEVELS).indexOf(b);
                return orderB - orderA; // Reverse order (highest first)
              })
              .map(([level, languageGroup]) => (
                <div key={level}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: CEFR_LEVELS[level]?.color }}
                    />
                    <h4 className="text-lg font-medium text-gray-900">
                      {CEFR_LEVELS[level]?.level}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({languageGroup.length} {languageGroup.length === 1 ? 'language' : 'languages'})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {languageGroup.map((language) => (
                      <div
                        key={language.code}
                        className="flex items-center gap-3 bg-white p-3 rounded-lg border"
                      >
                        <span className="text-lg">
                          {getFlagEmoji(language.code)}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {language.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {language.nativeName}
                          </div>
                        </div>
                        {language.isVerified && (
                          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Language Detail Modal */}
        <div>
          {selectedLanguage && (
            <div className="animate-fade-in">
              }
              }
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedLanguage(null)}
            >
              <div className="animate-fade-in">
                }
                }
                className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {getFlagEmoji(selectedLanguage.code)}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedLanguage.name}
                      </h3>
                      <p className="text-gray-600">
                        {selectedLanguage.nativeName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Proficiency Level</h4>
                    <div className="flex items-center gap-3">
                      {getProficiencyBadge(selectedLanguage.proficiency)}
                      <span className="text-gray-600">
                        {CEFR_LEVELS[selectedLanguage.proficiency]?.description}
                      </span>
                    </div>
                    {getProgressBar(selectedLanguage.proficiency)}
                  </div>

                  {selectedLanguage.useContext.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Usage Context</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedLanguage.useContext.map((context, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {context}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLanguage.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                      <div className="space-y-2">
                        {selectedLanguage.certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-green-50 text-green-800 text-sm rounded border border-green-200"
                          >
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {CEFR_LEVELS[selectedLanguage.proficiency] && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">What I Can Do</h4>
                      <ul className="space-y-1">
                        {CEFR_LEVELS[selectedLanguage.proficiency].canDo.map((ability, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 mt-1">•</span>
                            {ability}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedLanguage.experienceYears > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                      <p className="text-gray-600">
                        {selectedLanguage.experienceYears} years of active use
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </FeatureWrapper>
  );
};

export default LanguageProficiency;