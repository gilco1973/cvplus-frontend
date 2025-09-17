import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'enhancement' | 'advanced';
  icon: string;
  defaultEnabled: boolean;
  premium?: boolean;
}

interface MobileFeatureSelectionProps {
  selectedFeatures: Record<string, boolean>;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  variant?: 'default' | 'dark';
  features?: FeatureOption[];
}

const DEFAULT_FEATURES: FeatureOption[] = [
  // Core Features
  {
    id: 'atsOptimized',
    name: 'ATS Optimized',
    description: 'Ensures your CV passes Applicant Tracking Systems with proper formatting and keywords',
    category: 'core',
    icon: '🎯',
    defaultEnabled: true
  },
  {
    id: 'keywordOptimization',
    name: 'Keyword Optimization',
    description: 'Enhances keywords for better job matching and searchability',
    category: 'core',
    icon: '🔍',
    defaultEnabled: true
  },
  {
    id: 'achievementsShowcase',
    name: 'Achievements Showcase',
    description: 'Highlights your key accomplishments with impact metrics',
    category: 'core',
    icon: '⭐',
    defaultEnabled: true
  },

  // Enhancement Features
  {
    id: 'embedQRCode',
    name: 'QR Code',
    description: 'Links to your online professional profile for easy access',
    category: 'enhancement',
    icon: '📱',
    defaultEnabled: true
  },
  {
    id: 'languageProficiency',
    name: 'Language Proficiency',
    description: 'Displays your language skills with visual proficiency indicators',
    category: 'enhancement',
    icon: '🌐',
    defaultEnabled: false
  },
  {
    id: 'certificationBadges',
    name: 'Certification Badges',
    description: 'Showcases your professional certifications with verified badges',
    category: 'enhancement',
    icon: '🏆',
    defaultEnabled: false
  },
  {
    id: 'socialMediaLinks',
    name: 'Professional Links',
    description: 'Includes LinkedIn, GitHub, and other professional social profiles',
    category: 'enhancement',
    icon: '🔗',
    defaultEnabled: false
  },

  // Advanced Features
  {
    id: 'skillsVisualization',
    name: 'Skills Visualization',
    description: 'Interactive visual representation of your skill levels and expertise',
    category: 'advanced',
    icon: '📊',
    defaultEnabled: false,
    premium: true
  },
  {
    id: 'personalityInsights',
    name: 'Personality Insights',
    description: 'AI-generated personality and working style summary based on your profile',
    category: 'advanced',
    icon: '🧠',
    defaultEnabled: false,
    premium: true
  },
  {
    id: 'careerTimeline',
    name: 'Career Timeline',
    description: 'Interactive visual timeline showing your career progression and growth',
    category: 'advanced',
    icon: '📈',
    defaultEnabled: false,
    premium: true
  },
  {
    id: 'portfolioGallery',
    name: 'Portfolio Gallery',
    description: 'Showcase your work samples, projects, and visual portfolio pieces',
    category: 'advanced',
    icon: '🎨',
    defaultEnabled: false,
    premium: true
  }
];

export const MobileFeatureSelection: React.FC<MobileFeatureSelectionProps> = ({
  selectedFeatures,
  onFeatureToggle,
  onSelectAll,
  onSelectNone,
  variant = 'default',
  features = DEFAULT_FEATURES
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['core']) // Core features expanded by default
  );
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const getCategoryFeatures = (category: 'core' | 'enhancement' | 'advanced') => {
    return features.filter(feature => feature.category === category);
  };

  const getCategoryColor = (category: 'core' | 'enhancement' | 'advanced') => {
    const colors = {
      core: variant === 'dark' 
        ? 'bg-blue-900/30 border-blue-500/40 text-blue-300' 
        : 'bg-blue-50 border-blue-200 text-blue-700',
      enhancement: variant === 'dark' 
        ? 'bg-green-900/30 border-green-500/40 text-green-300' 
        : 'bg-green-50 border-green-200 text-green-700',
      advanced: variant === 'dark' 
        ? 'bg-purple-900/30 border-purple-500/40 text-purple-300' 
        : 'bg-purple-50 border-purple-200 text-purple-700'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: 'core' | 'enhancement' | 'advanced') => {
    const icons = {
      core: '🎯',
      enhancement: '✨',
      advanced: '🚀'
    };
    return icons[category];
  };

  const getCategoryTitle = (category: 'core' | 'enhancement' | 'advanced') => {
    const titles = {
      core: 'Essential Features',
      enhancement: 'Visual Enhancements',
      advanced: 'Advanced Features'
    };
    return titles[category];
  };

  const toggleCategory = (category: 'core' | 'enhancement' | 'advanced') => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const selectedCount = features.filter(feature => selectedFeatures[feature.id]).length;
  const totalCount = features.length;

  const getBackgroundClasses = () => {
    return variant === 'dark' 
      ? 'bg-gray-800 text-white' 
      : 'bg-white text-gray-900';
  };

  const getFeatureCardClasses = (isSelected: boolean, isPremium = false) => {
    if (isSelected) {
      return variant === 'dark'
        ? 'bg-blue-900/40 border-blue-400/60 shadow-lg shadow-blue-500/20'
        : 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-200/50';
    }
    
    const baseClasses = variant === 'dark'
      ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70 active:bg-gray-700'
      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 active:bg-gray-200';
      
    const premiumClasses = isPremium 
      ? (variant === 'dark' 
        ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-gray-700/50' 
        : 'border-purple-200 bg-gradient-to-br from-purple-50 to-gray-50')
      : '';
      
    return `${baseClasses} ${premiumClasses}`;
  };

  const categories = ['core', 'enhancement', 'advanced'] as const;
  const visibleCategories = showAllFeatures ? categories : ['core', 'enhancement'] as const;

  return (
    <div className={`space-y-6 p-4 ${getBackgroundClasses()}`}>
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">CV Features</h3>
          <p className="text-sm opacity-80 mt-1">
            Customize your CV with advanced features. {selectedCount} of {totalCount} selected.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {onSelectAll && (
              <button
                onClick={onSelectAll}
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-lg transition-all
                  min-h-[44px] text-sm font-medium
                  ${variant === 'dark' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                  }
                `}
              >
                <Plus className="w-4 h-4" />
                <span>Select All</span>
              </button>
            )}
            {onSelectNone && (
              <button
                onClick={onSelectNone}
                className={`
                  flex items-center space-x-1 px-4 py-2 rounded-lg transition-all
                  min-h-[44px] text-sm font-medium border
                  ${variant === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 active:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }
                `}
              >
                <Minus className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
          
          {!showAllFeatures && (
            <button
              onClick={() => setShowAllFeatures(true)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                min-h-[44px]
                ${variant === 'dark' 
                  ? 'text-purple-300 hover:bg-purple-900/20' 
                  : 'text-purple-600 hover:bg-purple-50'
                }
              `}
            >
              Show Advanced
            </button>
          )}
        </div>
      </div>

      {/* Feature Categories */}
      {visibleCategories.map((category: 'core' | 'enhancement' | 'advanced') => {
        const categoryFeatures = getCategoryFeatures(category);
        const isExpanded = expandedCategories.has(category);
        
        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                ${getCategoryColor(category)}
                min-h-[56px] flex items-center justify-between
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getCategoryIcon(category)}</span>
                <div className="text-left">
                  <h4 className="font-semibold">{getCategoryTitle(category)}</h4>
                  <p className="text-xs opacity-80">
                    {categoryFeatures.filter(f => selectedFeatures[f.id]).length} of {categoryFeatures.length} selected
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            
            {/* Category Features */}
            {isExpanded && (
              <div className="space-y-3 pl-2">
                {categoryFeatures.map((feature) => {
                  const isSelected = selectedFeatures[feature.id];
                  
                  return (
                    <button
                      key={feature.id}
                      onClick={() => onFeatureToggle(feature.id, !isSelected)}
                      className={`
                        w-full p-4 rounded-lg border transition-all
                        ${getFeatureCardClasses(isSelected, feature.premium)}
                        min-h-[80px] text-left
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {isSelected ? (
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          ) : (
                            <Circle className={`w-6 h-6 ${
                              variant === 'dark' ? 'text-gray-400' : 'text-gray-400'
                            }`} />
                          )}
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <span className="text-xl flex-shrink-0">{feature.icon}</span>
                              <h5 className="font-semibold text-base leading-tight truncate">
                                {feature.name}
                              </h5>
                              {feature.premium && (
                                <span className={`
                                  px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
                                  ${variant === 'dark' 
                                    ? 'bg-purple-900/50 text-purple-300' 
                                    : 'bg-purple-100 text-purple-700'
                                  }
                                `}>
                                  Pro
                                </span>
                              )}
                            </div>
                          </div>
                          <p className={`text-sm leading-relaxed ${
                            variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {showAllFeatures && (
        <button
          onClick={() => setShowAllFeatures(false)}
          className={`
            w-full px-4 py-3 rounded-lg border text-center transition-all
            min-h-[44px] text-sm font-medium
            ${variant === 'dark' 
              ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }
          `}
        >
          Show Less
        </button>
      )}
    </div>
  );
};