import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleDetectionSection } from '../role-detection/RoleDetectionSection';
import { RoleDetectionPremiumGate } from '../../role-profiles/premium/RoleDetectionPremiumGate';
import { RecommendationsContainer } from '../recommendations/RecommendationsContainer';
import { UnifiedAnalysisProvider, useUnifiedAnalysis } from '../context/UnifiedAnalysisContext';
import type { Job } from '@cvplus/core/types';
import type { DetectedRole } from '../../../types/role-profiles';
import toast from 'react-hot-toast';

interface UnifiedAnalysisContainerProps {
  jobId: string;
  jobData: Job;
  onNavigateToFeatures?: (data: any) => void;
  className?: string;
}

const UnifiedAnalysisContent: React.FC<{
  jobData: Job;
  jobId: string;
  onNavigateToFeatures?: (data: any) => void;
  className?: string;
}> = ({ jobData, jobId, onNavigateToFeatures, className = '' }) => {
  const { 
    state, 
    dispatch,
    initializeAnalysis,
    completeAnalysis,
    selectRole,
    completeRoleSelection,
    proceedToNext,
    goBack,
    currentStepIndex,
    totalSteps,
    progressPercentage
  } = useUnifiedAnalysis();
  
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('[UnifiedAnalysisContainer] Initializing analysis with jobData:', {
      status: jobData?.status,
      hasParsedData: !!jobData?.parsedData,
      currentStep: state.currentStep
    });
    
    initializeAnalysis(jobData);
    
    // Analysis completion is handled by the actual CV analysis
    // which is triggered automatically when jobData is loaded
  }, [jobData, initializeAnalysis]);
  
  // FIXED: Simplified status monitoring without navigation loops
  useEffect(() => {
    console.log('[UnifiedAnalysisContainer] Current state:', {
      jobStatus: jobData?.status,
      currentStep: state.currentStep,
      hasParsedData: !!jobData?.parsedData,
      analysisComplete: state.analysisResults?.analysisComplete
    });
    
    // The initializeAnalysis method in context already handles step initialization
    // This effect is just for logging/monitoring, no navigation triggers
  }, [jobData?.status, state.currentStep, state.analysisResults?.analysisComplete]);
  
  const handleRoleSelected = (role: DetectedRole) => {
    selectRole(role);
    completeRoleSelection(); // NEW: Mark role selection as complete
    toast.success(`Role "${role.roleName}" selected successfully!`);
    
    // Proceed to recommendations step
    proceedToNext();
  };
  
  const handleManualSelection = () => {
    console.log('Manual role selection requested - proceeding without role');
    completeRoleSelection(); // NEW: Mark role selection as complete (even if skipped)
    proceedToNext();
  };
  
  const handleNavigateToFeatures = (data: any) => {
    if (onNavigateToFeatures) {
      onNavigateToFeatures(data);
    } else {
      navigate(`/customize/${jobId}`, {
        state: {
          jobData: data.jobData,
          roleContext: {
            selectedRole: data.selectedRole,
            selectedRecommendations: data.selectedRecommendations,
            roleAnalysis: data.roleAnalysis
          }
        }
      });
    }
  };
  
  return (
    <div className={`min-h-screen bg-neutral-900 ${className}`}>
      <div className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-100">CV Analysis</h1>
              <div className="text-sm text-gray-400">Step {currentStepIndex + 1} of {totalSteps}</div>
            </div>
            <div className="text-sm text-gray-300">{Math.round(progressPercentage)}% Complete</div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {state.currentStep === 'analysis' && (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-green-500/30">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-300 font-medium">Analyzing CV...</span>
            </div>
            <div className="text-2xl font-bold text-gray-100">Processing Your CV</div>
            <p className="text-gray-400">
              Please wait while we analyze your CV and prepare role detection.
            </p>
          </div>
        )}
        
        {state.currentStep === 'role-detection' && (
          <RoleDetectionPremiumGate onSkip={handleManualSelection}>
            <RoleDetectionSection
              jobData={jobData}
              onRoleSelected={handleRoleSelected}
              onManualSelection={handleManualSelection}
            />
          </RoleDetectionPremiumGate>
        )}
        
        {/* Step 3: Improvements - Pure Recommendations Display */}
        {state.currentStep === 'improvements' && (
          <RecommendationsContainer
            jobData={jobData}
            onContinue={(selectedRecommendations: string[]) => {
              // Navigate to features with the selected recommendations
              handleNavigateToFeatures({
                jobData,
                selectedRole: state.selectedRole,
                selectedRecommendations,
                roleAnalysis: state.roleAnalysis
              });
            }}
            onBack={() => {
              // Use the goBack helper method which handles step navigation logic
              goBack();
            }}
            className="w-full"
          />
        )}
        
        {/* Step 4: Actions - Placeholder for future implementation */}
        {state.currentStep === 'actions' && (
          <div className="text-center space-y-6">
            <div className="text-2xl font-bold text-gray-100">
              Ready to Transform Your CV
            </div>
            <p className="text-gray-400">
              All analysis complete. Choose your next action.
            </p>
            <button
              onClick={() => handleNavigateToFeatures({
                jobData,
                selectedRole: state.selectedRole,
                selectedRecommendations: state.selectedRecommendations,
                roleAnalysis: state.roleAnalysis
              })}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors"
            >
              Proceed to Feature Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const UnifiedAnalysisContainer: React.FC<UnifiedAnalysisContainerProps> = ({
  jobId,
  jobData,
  onNavigateToFeatures,
  className
}) => {
  return (
    <UnifiedAnalysisProvider
      initialJobData={jobData}
      onNavigateToFeatures={onNavigateToFeatures}
    >
      <UnifiedAnalysisContent
        jobData={jobData}
        jobId={jobId}
        onNavigateToFeatures={onNavigateToFeatures}
        className={className}
      />
    </UnifiedAnalysisProvider>
  );
};