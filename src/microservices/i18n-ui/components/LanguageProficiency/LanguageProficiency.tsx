/**
 * Enhanced Language Proficiency Component
 * Visual representation of language skills with proficiency levels
 * Features: Circular progress, bar charts, flag icons, animations
 */

import React, { useState, useEffect } from 'react';
import { Globe, Languages, Plus, CheckCircle, Loader2, TrendingUp, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  LanguageProficiency as LanguageProficiencyType,
  LanguageVisualization,
  VisualizationType,
  VisualizationOption
} from '../../types/language';
import { CircularProgress } from './CircularProgress';
import { BarChart } from './BarChart';
import { FlagGrid } from './FlagGrid';
import { LanguageInsights } from './LanguageInsights';
import { AddLanguageForm } from './AddLanguageForm';

interface LanguageProficiencyProps {
  visualization?: LanguageVisualization;
  languages?: LanguageProficiencyType[];
  isLoading?: boolean;
  onGenerateVisualization?: () => Promise<void>;
  onAddLanguage?: (language: Partial<LanguageProficiencyType>) => Promise<void>;
  onUpdateLanguage?: (id: string, updates: Partial<LanguageProficiencyType>) => Promise<void>;
  onDeleteLanguage?: (id: string) => Promise<void>;
  className?: string;
}

const VISUALIZATION_OPTIONS: VisualizationOption[] = [
  {
    type: 'circular',
    name: 'Circular Progress',
    icon: '⭕',
    description: 'Circular progress indicators showing proficiency levels'
  },
  {
    type: 'bar',
    name: 'Bar Chart',
    icon: '📊',
    description: 'Horizontal bar chart with color-coded levels'
  },
  {
    type: 'flags',
    name: 'Flag Grid',
    icon: '🏳️',
    description: 'Country flags with proficiency badges'
  },
  {
    type: 'radar',
    name: 'Radar Chart',
    icon: '🎯',
    description: 'Radar visualization for top languages'
  },
  {
    type: 'matrix',
    name: 'Skills Matrix',
    icon: '🔲',
    description: 'Matrix showing speaking, writing, reading, listening'
  }
];

const PROFICIENCY_LEVELS = {
  native: { label: 'Native', score: 100, color: '#10B981', bgColor: '#D1FAE5' },
  fluent: { label: 'Fluent', score: 90, color: '#3B82F6', bgColor: '#DBEAFE' },
  professional: { label: 'Professional Working', score: 70, color: '#8B5CF6', bgColor: '#E9D5FF' },
  limited: { label: 'Limited Working', score: 50, color: '#F59E0B', bgColor: '#FEF3C7' },
  elementary: { label: 'Elementary', score: 30, color: '#6B7280', bgColor: '#F3F4F6' }
};

export const LanguageProficiency: React.FC<LanguageProficiencyProps> = ({
  visualization,
  languages = [],
  isLoading = false,
  onGenerateVisualization,
  onAddLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<VisualizationType>('circular');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!onGenerateVisualization) return;
    
    setIsGenerating(true);
    try {
      await onGenerateVisualization();
      toast.success('Language visualization generated successfully!');
    } catch (error) {
      console.error('Failed to generate visualization:', error);
      toast.error('Failed to generate language visualization');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddLanguage = async (languageData: Partial<LanguageProficiencyType>) => {
    if (!onAddLanguage) return;
    
    try {
      await onAddLanguage(languageData);
      setShowAddForm(false);
      toast.success('Language added successfully!');
    } catch (error) {
      console.error('Failed to add language:', error);
      toast.error('Failed to add language');
    }
  };

  // Empty state
  if (!visualization && languages.length === 0 && !isLoading) {
    return (
      <div className={`animate-fade-in ${className}`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Languages className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Language Proficiency Visualization
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
            Generate a comprehensive visualization of your language skills with proficiency levels, 
            certifications, and personalized insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Languages...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  Generate Visualization
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" />
              Add Languages Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-fade-in ${className}`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8">
          <div className="flex items-center justify-center space-x-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Analyzing language proficiencies...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentVisualization = visualization?.visualizations.find(v => v.type === selectedView);
  const displayLanguages = languages.length > 0 ? languages : visualization?.proficiencies || [];

  return (
    <div className={`animate-fade-in space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Language Proficiency</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Languages className="w-4 h-4" />
                {displayLanguages.length} {displayLanguages.length === 1 ? 'language' : 'languages'}
              </span>
              {visualization && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {Math.round(visualization.metadata.confidence)}% confidence
                </span>
              )}
              {visualization?.metadata.lastUpdated && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {new Date(visualization.metadata.lastUpdated).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Language
          </button>
          
          {onGenerateVisualization && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      {displayLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {VISUALIZATION_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedView(option.type)}
              title={option.description}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                selectedView === option.type
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span>{option.icon}</span>
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content */}
      {displayLanguages.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Visualization Panel */}
          <div className="xl:col-span-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {VISUALIZATION_OPTIONS.find(o => o.type === selectedView)?.name}
              </h4>
              {visualization && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Confidence: {Math.round(visualization.metadata.confidence)}%
                </div>
              )}
            </div>

            <div className="min-h-[400px]">
              {selectedView === 'circular' && (
                <CircularProgress languages={displayLanguages} />
              )}
              
              {selectedView === 'bar' && (
                <BarChart languages={displayLanguages} />
              )}
              
              {selectedView === 'flags' && (
                <FlagGrid languages={displayLanguages} />
              )}
              
              {(selectedView === 'radar' || selectedView === 'matrix') && (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚧</div>
                    <p className="text-lg font-medium mb-2">{VISUALIZATION_OPTIONS.find(o => o.type === selectedView)?.name}</p>
                    <p className="text-sm">Coming soon in the next update</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {visualization?.insights && (
              <LanguageInsights insights={visualization.insights} />
            )}
            
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h4>
              <div className="space-y-3">
                {Object.entries(
                  displayLanguages.reduce((acc, lang) => {
                    const level = lang.proficiency;
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([level, count]) => {
                  const levelInfo = PROFICIENCY_LEVELS[level as keyof typeof PROFICIENCY_LEVELS];
                  return (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: levelInfo?.color || '#6B7280' }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {levelInfo?.label || level}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certifications Summary */}
            {displayLanguages.some(lang => lang.certifications?.length) && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Certifications
                </h4>
                <div className="space-y-2">
                  {displayLanguages
                    .filter(lang => lang.certifications?.length)
                    .map((lang, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {lang.flag} {lang.name}:
                        </span>
                        <div className="ml-6 mt-1 space-y-1">
                          {lang.certifications?.map((cert, certIndex) => (
                            <div key={certIndex} className="text-gray-600 dark:text-gray-400">
                              • {cert}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Language Form Modal */}
      {showAddForm && (
        <AddLanguageForm
          onSubmit={handleAddLanguage}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default LanguageProficiency;