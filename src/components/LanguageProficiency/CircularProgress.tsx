/**
 * Circular Progress Component for Language Proficiency
 * Shows proficiency levels as animated circular progress indicators
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, Award } from 'lucide-react';
import { LanguageProficiency } from '../../types/language';

interface CircularProgressProps {
  languages: LanguageProficiency[];
}

const PROFICIENCY_COLORS = {
  native: '#10B981',
  fluent: '#3B82F6', 
  professional: '#8B5CF6',
  limited: '#F59E0B',
  elementary: '#6B7280'
};

const PROFICIENCY_SCORES = {
  native: 100,
  fluent: 90,
  professional: 70,
  limited: 50,
  elementary: 30
};

const CircularProgressIndicator: React.FC<{
  language: LanguageProficiency;
  index: number;
}> = ({ language, index }) => {
  const [progress, setProgress] = useState(0);
  const score = language.score || PROFICIENCY_SCORES[language.proficiency] || 50;
  const color = PROFICIENCY_COLORS[language.proficiency] || '#6B7280';
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(score);
    }, index * 200 + 500); // Stagger animations

    return () => clearTimeout(timer);
  }, [score, index]);

  return (
    <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {/* Flag and Progress Circle */}
      <div className="relative">
        <svg 
          width="110" 
          height="110" 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="6"
            fill="transparent"
            className="dark:stroke-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl mb-1">{language.flag || '🌍'}</div>
          <div className="text-lg font-bold" style={{ color }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* Language Info */}
      <div className="text-center min-h-[60px]">
        <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
          {language.name}
        </h4>
        
        <div 
          className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white mb-2"
          style={{ backgroundColor: color }}
        >
          {language.proficiency.charAt(0).toUpperCase() + language.proficiency.slice(1)}
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-2">
          {language.verified && (
            <CheckCircle className="w-4 h-4 text-green-500" title="Verified" />
          )}
          {language.certifications && language.certifications.length > 0 && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {language.certifications.length}
              </span>
            </div>
          )}
        </div>

        {/* Experience */}
        {language.yearsOfExperience && language.yearsOfExperience > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language.yearsOfExperience}+ years
          </div>
        )}
      </div>
    </div>
  );
};

export const CircularProgress: React.FC<CircularProgressProps> = ({ languages }) => {
  if (!languages.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <p>No languages to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {languages.map((language, index) => (
          <CircularProgressIndicator
            key={`${language.name}-${index}`}
            language={language}
            index={index}
          />
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Proficiency Levels
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {Object.entries(PROFICIENCY_COLORS).map(([level, color]) => (
            <div key={level} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-400 capitalize">
                {level === 'limited' ? 'Limited Working' : 
                 level === 'professional' ? 'Professional Working' :
                 level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};