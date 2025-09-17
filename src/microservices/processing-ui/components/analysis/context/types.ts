/**
 * Unified Analysis Context Types
 * TypeScript definitions for the unified analysis architecture
 */

import type { 
  DetectedRole, 
  RoleProfileAnalysis, 
  RoleBasedRecommendation 
} from '../../../types/role-profiles';
import type { Job } from '@cvplus/core/types';

// Analysis Steps
export type AnalysisStep = 'analysis' | 'role-detection' | 'improvements' | 'actions';

// Role Detection Status
export type RoleDetectionStatus = 'idle' | 'analyzing' | 'detecting' | 'completed' | 'error';

// Error State
export interface ErrorState {
  id: string;
  type: 'analysis' | 'role-detection' | 'improvements' | 'general';
  message: string;
  details?: any;
  timestamp: number;
}

// Analysis Results (basic structure)
export interface AnalysisResults {
  atsScore?: number;
  keyMetrics?: Record<string, any>;
  analysisComplete: boolean;
  processedAt?: string;
  analysisData?: any; // Job parsedData for analysis context
}

// Improvement Category
export interface ImprovementCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
}

// Recommendation (extended from role-profiles)
export interface Recommendation extends RoleBasedRecommendation {
  category: string;
  isSelected?: boolean;
}

// Main Context State
export interface UnifiedAnalysisContextState {
  // Core Data
  jobData: Job | null;
  analysisResults: AnalysisResults | null;
  
  // Role Detection State  
  detectedRoles: DetectedRole[];
  selectedRole: DetectedRole | null;
  roleDetectionStatus: RoleDetectionStatus;
  roleAnalysis: RoleProfileAnalysis | null;
  roleSelectionComplete: boolean; // NEW: Track if role selection is complete
  
  // Improvements State
  recommendations: Recommendation[];
  selectedRecommendations: string[];
  improvementCategories: ImprovementCategory[];
  activeCategory: string;
  recommendationsLoaded: boolean; // NEW: Track if recommendations are loaded
  
  // Progressive Flow State
  currentStep: AnalysisStep;
  autoTriggerEnabled: boolean;
  
  // UI State
  isLoading: boolean;
  errors: ErrorState[];
}

// Context Actions
export type UnifiedAnalysisAction =
  // Core Data Actions
  | { type: 'SET_JOB_DATA'; payload: Job }
  | { type: 'SET_ANALYSIS_RESULTS'; payload: AnalysisResults }
  
  // Role Detection Actions
  | { type: 'START_ROLE_DETECTION'; payload: { jobData: Job } }
  | { type: 'SET_DETECTED_ROLES'; payload: DetectedRole[] }
  | { type: 'SET_ROLE_ANALYSIS'; payload: RoleProfileAnalysis }
  | { type: 'SELECT_ROLE'; payload: DetectedRole }
  | { type: 'SET_ROLE_DETECTION_STATUS'; payload: RoleDetectionStatus }
  | { type: 'COMPLETE_ROLE_SELECTION' } // NEW: Mark role selection as complete
  
  // Improvements Actions
  | { type: 'SET_RECOMMENDATIONS'; payload: Recommendation[] }
  | { type: 'TOGGLE_RECOMMENDATION'; payload: string }
  | { type: 'SET_SELECTED_RECOMMENDATIONS'; payload: string[] }
  | { type: 'SET_IMPROVEMENT_CATEGORIES'; payload: ImprovementCategory[] }
  | { type: 'SET_ACTIVE_CATEGORY'; payload: string }
  | { type: 'SET_RECOMMENDATIONS_LOADED'; payload: boolean } // NEW: Track recommendations state
  
  // Flow Control Actions
  | { type: 'SET_CURRENT_STEP'; payload: AnalysisStep }
  | { type: 'SET_AUTO_TRIGGER'; payload: boolean }
  
  // UI Actions
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: ErrorState }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'RESET_STATE' };

// Context Interface
export interface UnifiedAnalysisContextInterface {
  state: UnifiedAnalysisContextState;
  dispatch: React.Dispatch<UnifiedAnalysisAction>;
  
  // Computed Properties
  canProceedToRoleDetection: boolean;
  canProceedToImprovements: boolean;
  canProceedToActions: boolean;
  hasSelectedRecommendations: boolean;
  
  // Helper Methods
  startRoleDetection: (jobData: Job) => void;
  selectRole: (role: DetectedRole) => void;
  toggleRecommendation: (id: string) => void;
  proceedToNext: () => void;
  goBack: () => void;
  clearErrors: () => void;
}

// Component Props Interfaces
export interface RoleDetectionSectionProps {
  jobData: Job;
  onRoleSelected: (role: DetectedRole) => void;
  onManualSelection: () => void;
  className?: string;
}

export interface RoleDetectionProgressProps {
  status: RoleDetectionStatus;
  progress: number;
  estimatedTime?: string;
  stage?: string;
}

export interface DetectedRoleCardProps {
  role: DetectedRole;
  isSelected: boolean;
  onSelect: (role: DetectedRole) => void;
  onCustomize: () => void;
  className?: string;
}

export interface RoleSelectionModalProps {
  isOpen: boolean;
  availableRoles: DetectedRole[];
  selectedRole?: DetectedRole;
  onRoleSelect: (role: DetectedRole) => void;
  onClose: () => void;
  onCreateCustom?: () => void;
}

// Hook Return Types
export interface UseRoleDetectionReturn {
  detectedRoles: DetectedRole[];
  selectedRole: DetectedRole | null;
  status: RoleDetectionStatus;
  analysis: RoleProfileAnalysis | null;
  startDetection: (jobData: Job) => Promise<void>;
  selectRole: (role: DetectedRole) => void;
  retry: () => void;
  provideFallbackRoles: () => void;
  isLoading: boolean;
  hasTimedOut: boolean;
  canRetry: boolean;
  retryCount: number;
  showFallbackOptions: boolean;
  progressMessage: string;
  cleanup: () => void;
  error: string | null;
}

export interface UseUnifiedAnalysisReturn extends UnifiedAnalysisContextInterface {
  // Additional computed properties
  progressPercentage: number;
  currentStepIndex: number;
  totalSteps: number;
  
  // Additional helper methods
  initializeAnalysis: (jobData: Job) => void;
  completeAnalysis: (results: AnalysisResults) => void;
  resetFlow: () => void;
}