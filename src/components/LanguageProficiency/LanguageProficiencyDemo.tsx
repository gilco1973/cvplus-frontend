/**
 * Language Proficiency Demo Component
 * Demonstrates the complete Language Proficiency feature integration
 */

import React, { useState } from 'react';
import { Globe, Settings, RefreshCw, Download } from 'lucide-react';
import { LanguageProficiency } from './LanguageProficiency';
import { useLanguageProficiency } from '../../hooks/useLanguageProficiency';
import toast from 'react-hot-toast';

interface LanguageProficiencyDemoProps {
  jobId?: string;
  className?: string;
}

// Demo data for preview mode
const DEMO_LANGUAGES = [
  {
    name: 'English',
    proficiency: 'native' as const,
    flag: '🇬🇧',
    score: 100,
    certifications: ['Cambridge CPE', 'IELTS 8.5'],
    yearsOfExperience: 25,
    contexts: ['Business', 'Academic', 'Technical'],
    verified: true,
    frameworks: {
      cefr: 'C2+',
      actfl: 'Distinguished'
    }
  },
  {
    name: 'Spanish',
    proficiency: 'fluent' as const,
    flag: '🇪🇸',
    score: 90,
    certifications: ['DELE C2'],
    yearsOfExperience: 8,
    contexts: ['Business', 'Social'],
    verified: true,
    frameworks: {
      cefr: 'C2',
      actfl: 'Superior'
    }
  },
  {
    name: 'French',
    proficiency: 'professional' as const,
    flag: '🇫🇷',
    score: 75,
    certifications: ['DALF C1'],
    yearsOfExperience: 5,
    contexts: ['Business', 'Academic'],
    verified: true,
    frameworks: {
      cefr: 'C1',
      actfl: 'Advanced High'
    }
  },
  {
    name: 'German',
    proficiency: 'limited' as const,
    flag: '🇩🇪',
    score: 55,
    yearsOfExperience: 3,
    contexts: ['Technical'],
    verified: false,
    frameworks: {
      cefr: 'B2',
      actfl: 'Intermediate High'
    }
  },
  {
    name: 'Japanese',
    proficiency: 'elementary' as const,
    flag: '🇯🇵',
    score: 35,
    yearsOfExperience: 2,
    contexts: ['Cultural'],
    verified: false,
    frameworks: {
      cefr: 'A2-B1',
      actfl: 'Intermediate Low'
    }
  }
];

const DEMO_VISUALIZATION = {
  proficiencies: DEMO_LANGUAGES,
  visualizations: [
    {
      type: 'circular' as const,
      data: {},
      config: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        showCertifications: true,
        showFlags: true,
        animateOnLoad: true,
        showFrameworks: true
      }
    }
  ],
  insights: {
    totalLanguages: 5,
    fluentLanguages: 2,
    businessReady: ['English', 'Spanish', 'French'],
    certifiedLanguages: ['English', 'Spanish', 'French'],
    recommendations: [
      'Improve German to professional level for career advancement',
      'Consider obtaining JLPT certification for Japanese',
      'Your multilingual profile is excellent for international opportunities'
    ]
  },
  metadata: {
    extractedFrom: ['Skills section', 'Certifications', 'Work experience'],
    confidence: 0.88,
    lastUpdated: new Date()
  }
};

export const LanguageProficiencyDemo: React.FC<LanguageProficiencyDemoProps> = ({
  jobId,
  className = ''
}) => {
  const [demoMode, setDemoMode] = useState(!jobId);
  const [showSettings, setShowSettings] = useState(false);

  // Use the real hook when jobId is provided
  const {
    visualization,
    languages,
    isLoading,
    isGenerating,
    error,
    generateVisualization,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    refresh
  } = useLanguageProficiency({
    jobId: demoMode ? undefined : jobId,
    autoGenerate: false,
    onError: (error) => {
      console.error('Language Proficiency Error:', error);
      toast.error(`Error: ${error.message}`);
    }
  });

  // Use demo data when in demo mode
  const displayVisualization = demoMode ? DEMO_VISUALIZATION : visualization;
  const displayLanguages = demoMode ? DEMO_LANGUAGES : languages;

  const handleToggleDemo = () => {
    setDemoMode(!demoMode);
    if (!demoMode && jobId) {
      // Switching to real mode, refresh data
      refresh();
    }
  };

  const handleExportData = () => {
    if (displayVisualization) {
      const dataToExport = {
        languages: displayLanguages,
        insights: displayVisualization.insights,
        metadata: displayVisualization.metadata,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `language-proficiency-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Language data exported successfully!');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Language Proficiency Feature
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {demoMode ? 'Demo Mode - Sample Data' : jobId ? `Job ID: ${jobId}` : 'No Job ID Provided'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Demo Mode */}
          <button
            onClick={handleToggleDemo}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              demoMode 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Globe className="w-4 h-4" />
            {demoMode ? 'Demo Mode' : 'Live Mode'}
          </button>

          {/* Refresh Data */}
          {!demoMode && (
            <button
              onClick={refresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}

          {/* Export Data */}
          {displayVisualization && (
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Feature Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Display Options</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>✓ Circular Progress Indicators</p>
                <p>✓ Horizontal Bar Charts</p>
                <p>✓ Flag Grid Visualization</p>
                <p>✓ Interactive Language Details</p>
                <p>✓ Certification Badges</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>✓ 5 Proficiency Levels (CEFR Compatible)</p>
                <p>✓ Certification Tracking</p>
                <p>✓ Experience Years</p>
                <p>✓ Usage Context Tags</p>
                <p>✓ AI-Powered Insights</p>
                <p>✓ Responsive Design</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !demoMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      )}

      {/* Main Component */}
      <LanguageProficiency
        visualization={displayVisualization}
        languages={displayLanguages}
        isLoading={!demoMode && isLoading}
        onGenerateVisualization={demoMode ? undefined : generateVisualization}
        onAddLanguage={demoMode ? 
          async (lang) => { toast.success('Demo: Language would be added'); } : 
          addLanguage
        }
        onUpdateLanguage={demoMode ? 
          async (id, updates) => { toast.success('Demo: Language would be updated'); } : 
          updateLanguage
        }
        onDeleteLanguage={demoMode ? 
          async (id) => { toast.success('Demo: Language would be deleted'); } : 
          deleteLanguage
        }
      />

      {/* Feature Information */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          🎆 Language Proficiency Feature Highlights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Visual Representations</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Animated circular progress</li>
              <li>• Color-coded bar charts</li>
              <li>• Country flag grid</li>
              <li>• Interactive radar charts</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Smart Features</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• AI-powered language detection</li>
              <li>• CEFR framework integration</li>
              <li>• Certification verification</li>
              <li>• Personalized recommendations</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">User Experience</h4>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Mobile-responsive design</li>
              <li>• Dark/light mode support</li>
              <li>• Smooth animations</li>
              <li>• Export functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageProficiencyDemo;