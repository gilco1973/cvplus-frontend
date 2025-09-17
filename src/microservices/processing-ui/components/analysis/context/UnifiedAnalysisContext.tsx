/**
 * Unified Analysis Context
 * React context for managing unified analysis state across components
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import type {
  UnifiedAnalysisContextInterface,
  UnifiedAnalysisContextState,
  UnifiedAnalysisAction,
  AnalysisStep,
  AnalysisResults
} from './types';
import {
  unifiedAnalysisReducer,
  initialUnifiedAnalysisState,
  unifiedAnalysisActions
} from './actions';
import type { Job } from '@cvplus/core/types';
import type { DetectedRole } from '../../../types/role-profiles';

// Create Context
const UnifiedAnalysisContext = createContext<UnifiedAnalysisContextInterface | undefined>(undefined);

// Context Provider Props
interface UnifiedAnalysisProviderProps {
  children: React.ReactNode;
  initialJobData?: Job | null;
  onNavigateToFeatures?: (data: any) => void;
}

// Context Provider Component
export const UnifiedAnalysisProvider: React.FC<UnifiedAnalysisProviderProps> = ({
  children,
  initialJobData = null,
  onNavigateToFeatures
}) => {
  const [state, dispatch] = useReducer(unifiedAnalysisReducer, {
    ...initialUnifiedAnalysisState,
    jobData: initialJobData
  });

  // Computed Properties
  const canProceedToRoleDetection = useMemo(() => {
    return state.analysisResults?.analysisComplete === true;
  }, [state.analysisResults]);

  const canProceedToImprovements = useMemo(() => {
    return state.selectedRole !== null;
  }, [state.selectedRole]);

  const canProceedToActions = useMemo(() => {
    return state.selectedRecommendations.length > 0;
  }, [state.selectedRecommendations]);

  const hasSelectedRecommendations = useMemo(() => {
    return state.selectedRecommendations.length > 0;
  }, [state.selectedRecommendations]);

  // Helper Methods
  const startRoleDetection = useCallback((jobData: Job) => {
    console.log('[UnifiedAnalysisContext] startRoleDetection called - dispatching action');
    dispatch(unifiedAnalysisActions.startRoleDetection(jobData));
  }, []);

  const selectRole = useCallback((role: DetectedRole) => {
    dispatch(unifiedAnalysisActions.selectRole(role));
  }, []);

  const toggleRecommendation = useCallback((id: string) => {
    dispatch(unifiedAnalysisActions.toggleRecommendation(id));
  }, []);

  const proceedToNext = useCallback(() => {
    const steps: AnalysisStep[] = ['analysis', 'role-detection', 'improvements', 'actions'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      dispatch(unifiedAnalysisActions.setCurrentStep(nextStep));
      
      if (state.currentStep === 'analysis' && nextStep === 'role-detection' && state.jobData) {
        startRoleDetection(state.jobData);
      }
    } else if (currentIndex === steps.length - 1 && onNavigateToFeatures) {
      onNavigateToFeatures({
        jobData: state.jobData,
        selectedRole: state.selectedRole,
        selectedRecommendations: state.selectedRecommendations,
        roleAnalysis: state.roleAnalysis
      });
    }
  }, [state, onNavigateToFeatures, startRoleDetection]);

  const goBack = useCallback(() => {
    const steps: AnalysisStep[] = ['analysis', 'role-detection', 'improvements', 'actions'];
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      dispatch(unifiedAnalysisActions.setCurrentStep(steps[currentIndex - 1]));
    }
  }, [state.currentStep]);

  const clearErrors = useCallback(() => {
    dispatch(unifiedAnalysisActions.clearErrors());
  }, []);

  const progressPercentage = useMemo(() => {
    const steps: AnalysisStep[] = ['analysis', 'role-detection', 'improvements', 'actions'];
    return ((steps.indexOf(state.currentStep) + 1) / steps.length) * 100;
  }, [state.currentStep]);

  const currentStepIndex = useMemo(() => {
    return ['analysis', 'role-detection', 'improvements', 'actions'].indexOf(state.currentStep);
  }, [state.currentStep]);

  const totalSteps = 4;

  // Additional helper methods
  const initializeAnalysis = useCallback((jobData: Job) => {
    dispatch(unifiedAnalysisActions.setJobData(jobData));
    
    // Smart step initialization based on job data state
    // If job has been analyzed and processed, skip to improvements step
    const validStatuses = ['analyzed', 'parsed', 'completed', 'generating'];
    const hasValidStatus = jobData?.status && validStatuses.includes(jobData.status);
    const hasParsedData = jobData?.parsedData;
    
    if (hasValidStatus && hasParsedData) {
      // Job is already processed, go directly to improvements to show recommendations
      console.log('[UnifiedAnalysisContext] Job already processed, initializing to improvements step');
      dispatch(unifiedAnalysisActions.setCurrentStep('improvements'));
      // Set comprehensive analysis results to prevent container useEffect from triggering
      dispatch(unifiedAnalysisActions.setAnalysisResults({
        analysisComplete: true,
        processedAt: new Date().toISOString(),
        analysisData: jobData.parsedData,
        // Include any other analysis metadata if available
        ...(jobData.parsedData && {
          atsScore: jobData.parsedData.atsScore,
          keyMetrics: jobData.parsedData.keyMetrics
        })
      }));
    } else {
      // Job needs processing, start with analysis step
      console.log('[UnifiedAnalysisContext] Job needs processing, initializing to analysis step');
      dispatch(unifiedAnalysisActions.setCurrentStep('analysis'));
    }
  }, []);

  const completeAnalysis = useCallback((results: AnalysisResults) => {
    console.log('[UnifiedAnalysisContext] completeAnalysis called with:', results);
    console.log('[UnifiedAnalysisContext] autoTriggerEnabled:', state.autoTriggerEnabled);
    console.log('[UnifiedAnalysisContext] jobData available:', !!state.jobData);
    console.log('[UnifiedAnalysisContext] Current analysisResults:', state.analysisResults);
    
    dispatch(unifiedAnalysisActions.setAnalysisResults(results));
    dispatch(unifiedAnalysisActions.setCurrentStep('role-detection'));
    
    // Note: The actual role detection will be triggered by RoleDetectionSection
    // when it detects that canProceedToRoleDetection becomes true
    console.log('[UnifiedAnalysisContext] Analysis complete, transitioning to role-detection step');
    console.log('[UnifiedAnalysisContext] RoleDetectionSection will auto-trigger when canProceedToRoleDetection becomes true');
  }, [state.autoTriggerEnabled, state.jobData, state.analysisResults]);

  const resetFlow = useCallback(() => {
    dispatch(unifiedAnalysisActions.resetState());
  }, []);

  // NEW: Helper methods for revised flow
  const completeRoleSelection = useCallback(() => {
    console.log('[UnifiedAnalysisContext] completeRoleSelection called');
    dispatch(unifiedAnalysisActions.completeRoleSelection());
  }, []);

  const canProceedToRecommendations = useMemo(() => {
    // For free users: Can proceed after analysis is complete (skip role selection)
    // For premium users: Can proceed after role selection is complete
    return state.analysisResults?.analysisComplete === true && 
           (state.roleSelectionComplete || !state.selectedRole);
  }, [state.analysisResults, state.roleSelectionComplete, state.selectedRole]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    canProceedToRoleDetection,
    canProceedToImprovements,
    canProceedToActions,
    canProceedToRecommendations, // NEW: Add new computed property
    hasSelectedRecommendations,
    startRoleDetection,
    selectRole,
    toggleRecommendation,
    proceedToNext,
    goBack,
    clearErrors,
    progressPercentage,
    currentStepIndex,
    totalSteps,
    initializeAnalysis,
    completeAnalysis,
    completeRoleSelection, // NEW: Add new helper method
    resetFlow
  }), [
    state,
    canProceedToRoleDetection,
    canProceedToImprovements,
    canProceedToActions,
    canProceedToRecommendations, // NEW
    hasSelectedRecommendations,
    startRoleDetection,
    selectRole,
    toggleRecommendation,
    proceedToNext,
    goBack,
    clearErrors,
    progressPercentage,
    currentStepIndex,
    initializeAnalysis,
    completeAnalysis,
    completeRoleSelection, // NEW
    resetFlow
  ]);

  return (
    <UnifiedAnalysisContext.Provider value={contextValue}>
      {children}
    </UnifiedAnalysisContext.Provider>
  );
};

// Custom Hook
export const useUnifiedAnalysis = () => {
  const context = useContext(UnifiedAnalysisContext);
  
  if (!context) {
    throw new Error('useUnifiedAnalysis must be used within a UnifiedAnalysisProvider');
  }
  
  return context;
};

// Export Context for Testing
export { UnifiedAnalysisContext };