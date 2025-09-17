/**
 * Bar Chart Component for Language Proficiency
 * Horizontal bar chart with animated progress bars
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, Award, Clock } from 'lucide-react';
import { LanguageProficiency } from '../../types/language';

interface BarChartProps {
  languages: LanguageProficiency[];
}

const PROFICIENCY_CONFIG = {
  native: { color: '#10B981', bgColor: '#D1FAE5', score: 100, label: 'Native' },
  fluent: { color: '#3B82F6', bgColor: '#DBEAFE', score: 90, label: 'Fluent' },
  professional: { color: '#8B5CF6', bgColor: '#E9D5FF', score: 70, label: 'Professional Working' },
  limited: { color: '#F59E0B', bgColor: '#FEF3C7', score: 50, label: 'Limited Working' },
  elementary: { color: '#6B7280', bgColor: '#F3F4F6', score: 30, label: 'Elementary' }
};

const BarItem: React.FC<{
  language: LanguageProficiency;
  index: number;
  maxScore: number;
}> = ({ language, index, maxScore }) => {
  const [width, setWidth] = useState(0);
  const config = PROFICIENCY_CONFIG[language.proficiency] || PROFICIENCY_CONFIG.elementary;
  const score = language.score || config.score;
  const percentage = (score / maxScore) * 100;

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, index * 100 + 300);

    return () => clearTimeout(timer);
  }, [percentage, index]);

  return (
    <div className="group hover:bg-gray-50 dark:hover:bg-gray-800 p-4 rounded-lg transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{language.flag || '🌍'}</span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {language.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: config.color }}
              >
                {config.label}
              </span>
              {language.verified && (
                <CheckCircle className="w-3 h-3 text-green-500" title="Verified" />
              )}
              {language.certifications && language.certifications.length > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-gray-500">{language.certifications.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: config.color }}>
            {score}%
          </div>
          {language.yearsOfExperience && language.yearsOfExperience > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {language.yearsOfExperience}y
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div 
          className="h-3 rounded-full transition-colors"
          style={{ backgroundColor: config.bgColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ 
              width: `${width}%`, 
              backgroundColor: config.color,
              boxShadow: `0 0 10px ${config.color}40`
            }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>
        
        {/* Progress markers */}
        <div className="absolute top-4 left-0 right-0 flex justify-between text-xs text-gray-400">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Additional Info */}
      {(language.certifications && language.certifications.length > 0) && (
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Certifications:</span> 
            {language.certifications.slice(0, 2).join(', ')}
            {language.certifications.length > 2 && ` +${language.certifications.length - 2} more`}
          </div>
        </div>
      )}
      
      {language.contexts && language.contexts.length > 0 && (
        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-wrap gap-1">
            {language.contexts.slice(0, 3).map((context, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded"
              >
                {context}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BarChart: React.FC<BarChartProps> = ({ languages }) => {
  if (!languages.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>No languages to display</p>
        </div>
      </div>
    );
  }

  const sortedLanguages = [...languages].sort((a, b) => {
    const scoreA = a.score || PROFICIENCY_CONFIG[a.proficiency]?.score || 0;
    const scoreB = b.score || PROFICIENCY_CONFIG[b.proficiency]?.score || 0;
    return scoreB - scoreA;
  });

  const maxScore = Math.max(...sortedLanguages.map(lang => 
    lang.score || PROFICIENCY_CONFIG[lang.proficiency]?.score || 0
  ));

  return (
    <div className="w-full space-y-1">
      {/* Chart */}
      <div className="space-y-1">
        {sortedLanguages.map((language, index) => (
          <BarItem
            key={`${language.name}-${index}`}
            language={language}
            index={index}
            maxScore={maxScore}
          />
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {languages.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Languages
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {languages.filter(l => l.proficiency === 'native' || l.proficiency === 'fluent').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Fluent+ Languages
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {languages.filter(l => l.certifications && l.certifications.length > 0).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Certified Languages
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Proficiency Scale
        </h5>
        <div className="space-y-2">
          {Object.entries(PROFICIENCY_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-2 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {config.label}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {config.score}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Add shimmer animation to Tailwind config
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}