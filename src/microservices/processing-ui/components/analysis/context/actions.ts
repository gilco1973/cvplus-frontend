/**
 * Unified Analysis Context Actions
 * Action creators and reducer for unified analysis state management
 */

import type {
  UnifiedAnalysisContextState,
  UnifiedAnalysisAction,
  AnalysisStep,
  RoleDetectionStatus,
  ErrorState
} from './types';

/**
 * Input validation helpers
 */
const validateString = (value: unknown, fieldName: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid ${fieldName}: must be a non-empty string`);
  }
  return value;
};

const validateObject = (value: unknown, fieldName: string): any => {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid ${fieldName}: must be an object`);
  }
  return value;
};

const validateArray = (value: unknown, fieldName: string): any[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${fieldName}: must be an array`);
  }
  return value;
};

// Initial State
export const initialUnifiedAnalysisState: UnifiedAnalysisContextState = {
  // Core Data
  jobData: null,
  analysisResults: null,
  
  // Role Detection State
  detectedRoles: [],
  selectedRole: null,
  roleDetectionStatus: 'idle',
  roleAnalysis: null,
  roleSelectionComplete: false, // NEW: Track role selection completion
  
  // Improvements State
  recommendations: [],
  selectedRecommendations: [],
  improvementCategories: [],
  activeCategory: '',
  recommendationsLoaded: false, // NEW: Track recommendations loading state
  
  // Progressive Flow State
  currentStep: 'analysis',
  autoTriggerEnabled: true,
  
  // UI State
  isLoading: false,
  errors: []
};

// Action Creators with Input Validation
export const unifiedAnalysisActions = {
  setJobData: (jobData: any) => ({ 
    type: 'SET_JOB_DATA' as const, 
    payload: validateObject(jobData, 'jobData') 
  }),
  setAnalysisResults: (results: any) => ({ 
    type: 'SET_ANALYSIS_RESULTS' as const, 
    payload: validateObject(results, 'analysisResults') 
  }),
  startRoleDetection: (jobData: any) => ({ 
    type: 'START_ROLE_DETECTION' as const, 
    payload: { jobData: validateObject(jobData, 'jobData') } 
  }),
  setDetectedRoles: (roles: any[]) => ({ 
    type: 'SET_DETECTED_ROLES' as const, 
    payload: validateArray(roles, 'detectedRoles') 
  }),
  setRoleAnalysis: (analysis: any) => ({ 
    type: 'SET_ROLE_ANALYSIS' as const, 
    payload: analysis ? validateObject(analysis, 'roleAnalysis') : null 
  }),
  selectRole: (role: any) => ({ 
    type: 'SELECT_ROLE' as const, 
    payload: validateObject(role, 'role') 
  }),
  setRoleDetectionStatus: (status: RoleDetectionStatus) => ({ 
    type: 'SET_ROLE_DETECTION_STATUS' as const, 
    payload: validateString(status, 'roleDetectionStatus') as RoleDetectionStatus 
  }),
  completeRoleSelection: () => ({ type: 'COMPLETE_ROLE_SELECTION' as const }),
  setRecommendations: (recommendations: any[]) => ({ 
    type: 'SET_RECOMMENDATIONS' as const, 
    payload: validateArray(recommendations, 'recommendations') 
  }),
  setRecommendationsLoaded: (loaded: boolean) => ({ type: 'SET_RECOMMENDATIONS_LOADED' as const, payload: loaded }),
  toggleRecommendation: (id: string) => ({ type: 'TOGGLE_RECOMMENDATION' as const, payload: id }),
  setSelectedRecommendations: (ids: string[]) => ({ type: 'SET_SELECTED_RECOMMENDATIONS' as const, payload: ids }),
  setImprovementCategories: (categories: any[]) => ({ type: 'SET_IMPROVEMENT_CATEGORIES' as const, payload: categories }),
  setActiveCategory: (category: string) => ({ type: 'SET_ACTIVE_CATEGORY' as const, payload: category }),
  setCurrentStep: (step: AnalysisStep) => ({ type: 'SET_CURRENT_STEP' as const, payload: step }),
  setAutoTrigger: (enabled: boolean) => ({ type: 'SET_AUTO_TRIGGER' as const, payload: enabled }),
  setLoading: (isLoading: boolean) => ({ type: 'SET_LOADING' as const, payload: isLoading }),
  addError: (error: ErrorState) => ({ type: 'ADD_ERROR' as const, payload: error }),
  removeError: (id: string) => ({ type: 'REMOVE_ERROR' as const, payload: id }),
  clearErrors: () => ({ type: 'CLEAR_ERRORS' as const }),
  resetState: () => ({ type: 'RESET_STATE' as const })
};

// Utility Functions
const createError = (type: ErrorState['type'], message: string, details?: any): ErrorState => ({
  id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  message,
  details,
  timestamp: Date.now()
});

// Reducer
export function unifiedAnalysisReducer(
  state: UnifiedAnalysisContextState, 
  action: UnifiedAnalysisAction
): UnifiedAnalysisContextState {
  switch (action.type) {
    case 'SET_JOB_DATA':
      return { ...state, jobData: action.payload };
      
    case 'SET_ANALYSIS_RESULTS':
      return { 
        ...state, 
        analysisResults: action.payload,
        currentStep: state.autoTriggerEnabled ? 'role-detection' : state.currentStep
      };
    
    case 'START_ROLE_DETECTION':
      return { 
        ...state, 
        roleDetectionStatus: 'analyzing',
        currentStep: 'role-detection',
        isLoading: true
      };
      
    case 'SET_DETECTED_ROLES':
      return { 
        ...state, 
        detectedRoles: action.payload,
        roleDetectionStatus: action.payload.length > 0 ? 'completed' : 'error'
      };
      
    case 'SET_ROLE_ANALYSIS':
      return { ...state, roleAnalysis: action.payload };
      
    case 'SELECT_ROLE':
      return { 
        ...state, 
        selectedRole: action.payload,
        currentStep: state.autoTriggerEnabled ? 'improvements' : state.currentStep
      };
      
    case 'SET_ROLE_DETECTION_STATUS':
      return { 
        ...state, 
        roleDetectionStatus: action.payload,
        isLoading: action.payload === 'analyzing' || action.payload === 'detecting'
      };
    
    case 'COMPLETE_ROLE_SELECTION':
      return { 
        ...state, 
        roleSelectionComplete: true,
        currentStep: state.autoTriggerEnabled ? 'improvements' : state.currentStep
      };
    
    // Improvements Actions
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload, recommendationsLoaded: true };
      
    case 'SET_RECOMMENDATIONS_LOADED':
      return { ...state, recommendationsLoaded: action.payload };
      
    case 'TOGGLE_RECOMMENDATION': {
      const isSelected = state.selectedRecommendations.includes(action.payload);
      return {
        ...state,
        selectedRecommendations: isSelected
          ? state.selectedRecommendations.filter(id => id !== action.payload)
          : [...state.selectedRecommendations, action.payload]
      };
    }
      
    case 'SET_SELECTED_RECOMMENDATIONS':
      return { ...state, selectedRecommendations: action.payload };
      
    case 'SET_IMPROVEMENT_CATEGORIES':
      return { 
        ...state, 
        improvementCategories: action.payload,
        activeCategory: action.payload.length > 0 ? action.payload[0].id : ''
      };
      
    case 'SET_ACTIVE_CATEGORY':
      return { ...state, activeCategory: action.payload };
    
    // Flow Control Actions
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'SET_AUTO_TRIGGER':
      return { ...state, autoTriggerEnabled: action.payload };
    
    // UI Actions
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'ADD_ERROR':
      return { 
        ...state, 
        errors: [...state.errors, action.payload],
        isLoading: false
      };
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };
      
    case 'CLEAR_ERRORS':
      return { ...state, errors: [] };
      
    case 'RESET_STATE':
      return initialUnifiedAnalysisState;
      
    default:
      return state;
  }
}

// Helper Functions for Actions
export const createRoleDetectionError = (message: string, details?: any): ErrorState => 
  createError('role-detection', message, details);

export const createImprovementsError = (message: string, details?: any): ErrorState =>
  createError('improvements', message, details);

export const createAnalysisError = (message: string, details?: any): ErrorState =>
  createError('analysis', message, details);

export const createGeneralError = (message: string, details?: any): ErrorState =>
  createError('general', message, details);