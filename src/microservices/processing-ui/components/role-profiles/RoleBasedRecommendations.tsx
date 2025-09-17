import React, { useState } from 'react';
import { Target, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import type { RoleProfile, DetectedRole, RoleBasedRecommendation } from '../../types/role-profiles';
import { useRoleRecommendations } from './hooks/useRoleRecommendations';
import { RoleRecommendationsList } from './components/RoleRecommendationsList';
import { RecommendationStats } from './components/RecommendationStats';

export interface RoleBasedRecommendationsProps {
  jobId: string;
  roleProfile?: RoleProfile | null;
  detectedRole?: DetectedRole | null;
  onRecommendationsUpdate?: (recommendations: RoleBasedRecommendation[]) => void;
  onContinueToPreview?: (selectedRecommendations: string[]) => void;
  className?: string;
}

export const RoleBasedRecommendations: React.FC<RoleBasedRecommendationsProps> = ({
  jobId,
  roleProfile,
  detectedRole,
  onRecommendationsUpdate,
  onContinueToPreview,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showStats, setShowStats] = useState(true);

  // Use the custom hook for recommendations logic
  const {
    recommendations,
    isLoading,
    error,
    isApplying,
    toggleRecommendation,
    selectAllByPriority,
    clearAllSelections,
    retryLoad,
    getSelectedIds,
    getStatistics
  } = useRoleRecommendations({
    jobId,
    roleProfile,
    detectedRole,
    onRecommendationsUpdate
  });

  const toggleSection = (priority: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const selectAll = (selected: boolean) => {
    if (selected) {
      selectAllByPriority('high');
      selectAllByPriority('medium');
      selectAllByPriority('low');
    } else {
      clearAllSelections();
    }
  };

  const handleContinueToPreview = () => {
    const selectedIds = getSelectedIds();
    onContinueToPreview?.(selectedIds);
  };

  // Get statistics
  const stats = getStatistics();

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-3/4 mb-6"></div>
          <div className="flex items-center gap-3 mt-4">
            <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-gray-300">Generating personalized recommendations...</span>
          </div>
          <div className="space-y-4 mt-6">
            {[32, 24, 28].map((h, i) => <div key={i} className={`h-${h} bg-gray-600 rounded`} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-900/20 border border-red-500/30 rounded-xl p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Failed to Load Recommendations</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={retryLoad}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.danger.default} ${designSystem.components.button.sizes.md}`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Role Context */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">
                Role-Enhanced Recommendations
              </h2>
              <p className="text-purple-300">
                Personalized for: <span className="font-semibold">
                  {roleProfile?.name || detectedRole?.roleName || 'Your Role'}
                </span>
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-300">{stats.total}</div>
            <div className="text-sm text-gray-400">Recommendations</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: TrendingUp, value: `+${stats.selectedImpact}`, label: 'ATS Points', color: 'green' },
            { value: stats.selected, label: 'Selected', color: 'blue' },
            { icon: Sparkles, value: `${stats.selectionPercentage}%`, label: 'Coverage', color: 'purple' }
          ].map((stat, idx) => (
            <div key={idx} className={`p-4 bg-${stat.color}-900/20 border border-${stat.color}-500/30 rounded-lg text-center`}>
              {stat.icon && <stat.icon className={`w-6 h-6 text-${stat.color}-400 mx-auto mb-2`} />}
              <div className={`text-lg font-bold text-${stat.color}-300`}>{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => selectAll(true)}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.sm}`}
          >
            Select All
          </button>
          <button
            onClick={() => selectAll(false)}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.ghost.default} ${designSystem.components.button.sizes.sm}`}
          >
            Clear All
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.ghost.default} ${designSystem.components.button.sizes.sm}`}
          >
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>
        
        <div className="text-sm text-gray-400">
          {stats.selected} of {stats.total} recommendations selected
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <RecommendationStats 
          recommendations={recommendations}
          isLoading={isLoading}
        />
      )}

      {/* Recommendations List */}
      <RoleRecommendationsList
        recommendations={recommendations}
        onToggle={toggleRecommendation}
        isApplying={isApplying}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
      />

      {/* Continue to Preview */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-100">
              Ready to enhance your CV?
            </p>
            <p className="text-sm text-gray-400">
              {stats.selected} recommendations selected 
              {stats.selectedImpact > 0 && `• +${stats.selectedImpact} ATS points potential`}
            </p>
          </div>
          
          <button
            onClick={handleContinueToPreview}
            disabled={stats.selected === 0 || isApplying}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.lg} flex items-center gap-3`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Apply & Preview</span>
            {stats.selected > 0 && (
              <span className="bg-blue-400 text-blue-900 px-2 py-1 rounded-full text-xs font-bold">
                {stats.selected}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleBasedRecommendations;