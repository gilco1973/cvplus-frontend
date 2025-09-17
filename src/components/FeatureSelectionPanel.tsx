import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'enhancement' | 'advanced';
  icon: string;
  defaultEnabled: boolean;
}

interface FeatureSelectionPanelProps {
  selectedFeatures: Record<string, boolean>;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  compact?: boolean;
}

const FEATURE_OPTIONS: FeatureOption[] = [
  // Core Features
  {
    id: 'atsOptimized',
    name: 'ATS Optimized',
    description: 'Ensures your CV passes Applicant Tracking Systems',
    category: 'core',
    icon: '🎯',
    defaultEnabled: true
  },
  {
    id: 'keywordOptimization',
    name: 'Keyword Optimization',
    description: 'Enhances keywords for better job matching',
    category: 'core',
    icon: '🔍',
    defaultEnabled: true
  },
  {
    id: 'achievementsShowcase',
    name: 'Achievements Showcase',
    description: 'Highlights your key accomplishments',
    category: 'core',
    icon: '⭐',
    defaultEnabled: true
  },

  // Enhancement Features
  {
    id: 'embedQRCode',
    name: 'QR Code',
    description: 'Links to your online professional profile',
    category: 'enhancement',
    icon: '📱',
    defaultEnabled: true
  },
  {
    id: 'languageProficiency',
    name: 'Language Proficiency',
    description: 'Displays your language skills with visual indicators',
    category: 'enhancement',
    icon: '🌐',
    defaultEnabled: false
  },
  {
    id: 'certificationBadges',
    name: 'Certification Badges',
    description: 'Showcases your professional certifications',
    category: 'enhancement',
    icon: '🏆',
    defaultEnabled: false
  },
  {
    id: 'socialMediaLinks',
    name: 'Professional Links',
    description: 'Includes LinkedIn, GitHub, and other professional links',
    category: 'enhancement',
    icon: '🔗',
    defaultEnabled: false
  },

  // Advanced Features
  {
    id: 'skillsVisualization',
    name: 'Skills Visualization',
    description: 'Visual representation of your skill levels',
    category: 'advanced',
    icon: '📊',
    defaultEnabled: false
  },
  {
    id: 'personalityInsights',
    name: 'Personality Insights',
    description: 'AI-generated personality and working style summary',
    category: 'advanced',
    icon: '🧠',
    defaultEnabled: false
  },
  {
    id: 'careerTimeline',
    name: 'Career Timeline',
    description: 'Visual timeline of your career progression',
    category: 'advanced',
    icon: '📈',
    defaultEnabled: false
  },
  {
    id: 'portfolioGallery',
    name: 'Portfolio Gallery',
    description: 'Showcase your work samples and projects',
    category: 'advanced',
    icon: '🎨',
    defaultEnabled: false
  }
];

export const FeatureSelectionPanel: React.FC<FeatureSelectionPanelProps> = ({
  selectedFeatures,
  onFeatureToggle,
  onSelectAll,
  onSelectNone,
  compact = false
}) => {
  const getCategoryFeatures = (category: 'core' | 'enhancement' | 'advanced') => {
    return FEATURE_OPTIONS.filter(feature => feature.category === category);
  };

  const getCategoryColor = (category: 'core' | 'enhancement' | 'advanced') => {
    switch (category) {
      case 'core':
        return 'text-blue-300 bg-blue-900/20 border-blue-500/30';
      case 'enhancement':
        return 'text-green-300 bg-green-900/20 border-green-500/30';
      case 'advanced':
        return 'text-purple-300 bg-purple-900/20 border-purple-500/30';
      default:
        return 'text-gray-300 bg-gray-700/50 border-gray-500/30';
    }
  };

  const getCategoryTitle = (category: 'core' | 'enhancement' | 'advanced') => {
    switch (category) {
      case 'core':
        return '🎯 Essential Features';
      case 'enhancement':
        return '✨ Visual Enhancements';
      case 'advanced':
        return '🚀 Advanced Features';
      default:
        return category;
    }
  };

  const selectedCount = FEATURE_OPTIONS.filter(feature => selectedFeatures[feature.id]).length;
  const totalCount = FEATURE_OPTIONS.length;

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedCount} of {totalCount} features selected
          </div>
          <div className="flex items-center space-x-2">
            {onSelectAll && (
              <button
                onClick={onSelectAll}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                All
              </button>
            )}
            {onSelectNone && (
              <button
                onClick={onSelectNone}
                className="px-3 py-1 text-xs bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors"
              >
                None
              </button>
            )}
          </div>
        </div>

        {/* Compact Feature List */}
        <div className="grid grid-cols-2 gap-2">
          {FEATURE_OPTIONS.map((feature) => (
            <button
              key={feature.id}
              onClick={() => onFeatureToggle(feature.id, !selectedFeatures[feature.id])}
              className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-colors ${
                selectedFeatures[feature.id]
                  ? 'bg-blue-900/20 text-blue-300 border border-blue-500/30'
                  : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
              }`}
            >
              <span className="text-xs flex-shrink-0">{feature.icon}</span>
              <span className="truncate">{feature.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">CV Features</h3>
          <p className="text-sm text-gray-400">
            Select features to include in your CV. {selectedCount} of {totalCount} selected.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {onSelectAll && (
            <button
              onClick={onSelectAll}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Select All
            </button>
          )}
          {onSelectNone && (
            <button
              onClick={onSelectNone}
              className="px-4 py-2 text-sm bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Feature Categories */}
      {(['core', 'enhancement', 'advanced'] as const).map((category) => {
        const categoryFeatures = getCategoryFeatures(category);
        
        return (
          <div key={category} className="space-y-3">
            <div className={`px-3 py-2 rounded-lg border ${getCategoryColor(category)}`}>
              <h4 className="font-medium">{getCategoryTitle(category)}</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {categoryFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedFeatures[feature.id]
                      ? 'border-blue-400 bg-blue-900/30'
                      : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                  }`}
                  onClick={() => onFeatureToggle(feature.id, !selectedFeatures[feature.id])}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {selectedFeatures[feature.id] ? (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start space-x-2 mb-2">
                        <span className="text-lg flex-shrink-0">{feature.icon}</span>
                        <h5 className="font-medium text-white leading-tight">{feature.name}</h5>
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};