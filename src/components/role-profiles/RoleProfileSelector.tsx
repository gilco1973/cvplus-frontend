import React from 'react';
import { Check, ChevronDown, Sparkles, Target, TrendingUp, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import { RoleDetectionCard } from './RoleDetectionCard';
import { RoleProfileDropdown } from './RoleProfileDropdown';
import { useRoleProfileSelector } from './hooks/useRoleProfileSelector';
import type { RoleProfile, RoleProfileAnalysis, DetectedRole } from '../../types/role-profiles';

export interface RoleProfileSelectorProps {
  jobId: string;
  onRoleSelected?: (roleProfile: RoleProfile | null, isDetected: boolean) => void;
  onAnalysisUpdate?: (analysis: RoleProfileAnalysis | null) => void;
  initialRole?: DetectedRole | null;
  isLoading?: boolean;
  className?: string;
}

export const RoleProfileSelector: React.FC<RoleProfileSelectorProps> = ({
  jobId,
  onRoleSelected,
  onAnalysisUpdate,
  initialRole,
  isLoading: externalLoading = false,
  className = ''
}) => {
  const {
    detectedRole,
    analysis,
    availableRoles,
    selectedRoleProfile,
    isDetecting,
    isApplying,
    error,
    showManualSelection,
    setShowManualSelection,
    handleApplyDetectedRole,
    handleManualRoleSelection,
    handleRetryDetection,
    hasDetectedRole,
    showError
  } = useRoleProfileSelector({
    jobId,
    initialRole,
    onRoleSelected,
    onAnalysisUpdate
  });

  const isLoading = externalLoading || isDetecting || isApplying;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-100">Role Profile Selection</h2>
              <p className="text-sm text-gray-400">
                AI-powered role detection for personalized CV enhancement
              </p>
            </div>
          </div>
          
          {hasDetectedRole && (
            <button
              onClick={handleRetryDetection}
              disabled={isDetecting}
              className={`${designSystem.components.button.base} ${designSystem.components.button.variants.ghost.default} ${designSystem.components.button.sizes.sm} flex items-center gap-2`}
              title="Re-detect role profile"
            >
              <RefreshCw className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Re-detect</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <div>
              <p className="text-gray-300 font-medium">
                {isDetecting ? 'Analyzing your CV for role detection...' :
                 isApplying ? 'Applying role profile...' :
                 'Processing...'}
              </p>
              <p className="text-sm text-gray-500">
                {isDetecting ? 'This may take a few moments' :
                 isApplying ? 'Generating role-specific recommendations' :
                 'Please wait'}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {showError && (
          <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-medium mb-1">Detection Error</p>
              <p className="text-sm text-red-200">{error}</p>
              <button
                onClick={handleRetryDetection}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.sm} mt-2`}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detection Results */}
      {hasDetectedRole && !isLoading && (
        <RoleDetectionCard
          detectedRole={detectedRole}
          roleProfile={selectedRoleProfile}
          analysis={analysis}
          onApply={handleApplyDetectedRole}
          onShowAlternatives={() => setShowManualSelection(true)}
          isApplying={isApplying}
          className="animate-fade-in-up"
        />
      )}

      {/* Manual Selection Option */}
      {!hasDetectedRole && !isLoading && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Manual Role Selection</h3>
              <p className="text-sm text-gray-400">
                Choose a role profile that best matches your career goals
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowManualSelection(!showManualSelection)}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.secondary.default} ${designSystem.components.button.sizes.md} w-full flex items-center justify-between`}
          >
            <span>Select Role Profile</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showManualSelection ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Role Profile Dropdown */}
      {showManualSelection && (
        <RoleProfileDropdown
          availableRoles={availableRoles}
          selectedRole={selectedRoleProfile}
          onRoleSelect={handleManualRoleSelection}
          onClose={() => setShowManualSelection(false)}
          className="animate-fade-in-up"
        />
      )}

      {/* Quick Stats */}
      {(hasDetectedRole || selectedRoleProfile) && !isLoading && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Enhancement Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-300">
                +{detectedRole?.enhancementPotential || 70}%
              </div>
              <div className="text-sm text-gray-400">Enhancement Potential</div>
            </div>
            
            <div className="text-center p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-300">
                {Math.round((detectedRole?.confidence || 0.8) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Match Confidence</div>
            </div>
            
            <div className="text-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-300">
                {analysis?.recommendationsCount || '8-12'}
              </div>
              <div className="text-sm text-gray-400">AI Recommendations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleProfileSelector;