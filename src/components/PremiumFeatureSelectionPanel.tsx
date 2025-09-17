import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CheckCircle, Circle, Crown, Lock, AlertTriangle, Sparkles, Zap, Star } from 'lucide-react';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import { FeatureCard } from './FeatureCard';
import { FeatureGate, PremiumBadge } from './pricing/FeatureGate';
import { UpgradePrompt } from './pricing/UpgradePrompt';
import { 
  isPremiumFeature, 
  getPremiumTypeForFeature, 
  canAccessFeature,
  validateFeatureSelection,
  filterAccessibleFeatures 
} from '../config/premiumFeatures';

interface FeatureOption {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'enhancement' | 'advanced';
  icon: string;
  defaultEnabled: boolean;
}

interface PremiumFeatureSelectionPanelProps {
  selectedFeatures: Record<string, boolean>;
  onFeatureToggle: (feature: string, enabled: boolean) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  compact?: boolean;
  enforceRestrictions?: boolean; // If true, automatically filter out restricted features
}

const FEATURE_OPTIONS: FeatureOption[] = [
  // Core Features (Free)
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

  // Enhancement Features (Mix of Free and Premium)
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

  // Advanced Features (Premium)
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
  },
  {
    id: 'generatePodcast',
    name: 'Career Podcast',
    description: 'AI-generated career story in podcast format',
    category: 'advanced',
    icon: '🎙️',
    defaultEnabled: false
  }
];

export const PremiumFeatureSelectionPanel: React.FC<PremiumFeatureSelectionPanelProps> = ({
  selectedFeatures,
  onFeatureToggle,
  onSelectAll,
  onSelectNone,
  compact = false,
  enforceRestrictions = true
}) => {
  const { isPremium, features: userPremiumFeatures, isLoading } = usePremiumStatus();
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  // Validate feature selection whenever it changes (memoized to prevent infinite loops)
  const validationErrors = useMemo(() => {
    const validation = validateFeatureSelection(selectedFeatures, userPremiumFeatures);
    return validation.warnings;
  }, [selectedFeatures, userPremiumFeatures]);

  const handleFeatureToggle = useCallback((featureId: string, enabled: boolean) => {
    const isPremium = isPremiumFeature(featureId);
    
    if (enabled && isPremium) {
      // Check if user has access to this premium feature
      if (!canAccessFeature(featureId, userPremiumFeatures)) {
        // Show upgrade modal instead of enabling the feature
        const premiumType = getPremiumTypeForFeature(featureId);
        setShowUpgradeModal(premiumType);
        return;
      }
    }

    // Allow the feature toggle
    onFeatureToggle(featureId, enabled);
  }, [onFeatureToggle, userPremiumFeatures]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectAll) return;

    if (enforceRestrictions) {
      // Only select accessible features
      const accessibleFeatures: Record<string, boolean> = {};
      FEATURE_OPTIONS.forEach(feature => {
        accessibleFeatures[feature.id] = canAccessFeature(feature.id, userPremiumFeatures);
      });
      // Apply accessible features
      Object.entries(accessibleFeatures).forEach(([featureId, canAccess]) => {
        if (canAccess) {
          onFeatureToggle(featureId, true);
        }
      });
    } else {
      onSelectAll();
    }
  }, [onSelectAll, onFeatureToggle, userPremiumFeatures, enforceRestrictions]);

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

  const renderFeatureItem = (feature: FeatureOption) => {
    const isSelected = selectedFeatures[feature.id];
    const isPremiumFeatureItem = isPremiumFeature(feature.id);
    const canAccess = canAccessFeature(feature.id, userPremiumFeatures);
    const premiumType = getPremiumTypeForFeature(feature.id);
    const isRestricted = isPremiumFeatureItem && !canAccess;

    if (compact) {
      return (
        <div key={feature.id} className="relative">
          <button
            onClick={() => handleFeatureToggle(feature.id, !isSelected)}
            disabled={isRestricted && enforceRestrictions}
            className={`flex items-center space-x-2 p-2 rounded-md text-sm transition-colors w-full ${
              isSelected && canAccess
                ? 'bg-blue-900/20 text-blue-300 border border-blue-500/30'
                : isRestricted
                ? 'bg-gray-800/50 text-gray-500 border border-gray-600 cursor-not-allowed'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
            }`}
          >
            <span className="text-xs flex-shrink-0">{feature.icon}</span>
            <span className="truncate">{feature.name}</span>
            {isPremiumFeatureItem && (
              <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
            {isRestricted && (
              <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />
            )}
          </button>
        </div>
      );
    }

    return (
      <div key={feature.id} className="relative">
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
            isSelected && canAccess
              ? 'border-blue-400 bg-blue-900/30'
              : isRestricted && enforceRestrictions
              ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed opacity-60'
              : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
          }`}
          onClick={() => !isRestricted && handleFeatureToggle(feature.id, !isSelected)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {isSelected && canAccess ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : isRestricted ? (
                <Lock className="w-5 h-5 text-gray-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-start space-x-2 mb-2">
                <span className="text-lg flex-shrink-0">{feature.icon}</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <h5 className={`font-medium leading-tight ${
                    isRestricted ? 'text-gray-500' : 'text-white'
                  }`}>
                    {feature.name}
                  </h5>
                  {isPremiumFeatureItem && (
                    <PremiumBadge size="sm" />
                  )}
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${
                isRestricted ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {feature.description}
              </p>
              {isRestricted && (
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUpgradeModal(premiumType);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 underline"
                  >
                    Upgrade to unlock this feature
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedCount = FEATURE_OPTIONS.filter(feature => selectedFeatures[feature.id]).length;
  const totalCount = FEATURE_OPTIONS.length;
  const accessibleCount = FEATURE_OPTIONS.filter(feature => 
    canAccessFeature(feature.id, userPremiumFeatures)
  ).length;

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Premium Status Banner */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-purple-300">
                {accessibleCount - FEATURE_OPTIONS.filter(f => !isPremiumFeature(f.id)).length} premium features available with upgrade
              </span>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && !enforceRestrictions && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="text-red-300 font-medium mb-1">Feature Access Issues:</div>
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-red-400 text-xs">{error}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedCount} of {totalCount} features selected
            {!isPremium && ` (${accessibleCount} accessible)`}
          </div>
          <div className="flex items-center space-x-2">
            {handleSelectAll && (
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {enforceRestrictions ? 'All Available' : 'All'}
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
          {FEATURE_OPTIONS.map(renderFeatureItem)}
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
            {!isPremium && ` (${accessibleCount} accessible with your plan)`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {handleSelectAll && (
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {enforceRestrictions ? 'Select All Available' : 'Select All'}
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

      {/* Premium Status Banner */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-purple-300 font-medium">Premium Features Available</div>
                <div className="text-purple-400 text-sm">
                  Unlock {FEATURE_OPTIONS.filter(f => isPremiumFeature(f.id)).length} advanced features with Premium access
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal('webPortal')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && !enforceRestrictions && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-red-300 font-medium mb-2">Feature Access Issues:</div>
              <div className="space-y-1">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-red-400 text-sm">{error}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Categories */}
      {(['core', 'enhancement', 'advanced'] as const).map((category) => {
        const categoryFeatures = getCategoryFeatures(category);
        
        return (
          <div key={category} className="space-y-3">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getCategoryColor(category)}`}>
              {category === 'core' && <Sparkles className="w-5 h-5" />}
              {category === 'enhancement' && <Zap className="w-5 h-5" />}
              {category === 'advanced' && <Star className="w-5 h-5" />}
              <h3 className="text-lg font-semibold">{getCategoryTitle(category)}</h3>
              <div className="ml-auto text-sm opacity-75">
                {categoryFeatures.filter(f => selectedFeatures[f.id]).length} of {categoryFeatures.length} selected
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryFeatures.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  feature={feature}
                  isSelected={selectedFeatures[feature.id]}
                  onToggle={handleFeatureToggle}
                  onUpgradePrompt={setShowUpgradeModal}
                  enforceRestrictions={enforceRestrictions}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          feature={showUpgradeModal as any}
          variant="modal"
          onClose={() => setShowUpgradeModal(null)}
        />
      )}
    </div>
  );
};