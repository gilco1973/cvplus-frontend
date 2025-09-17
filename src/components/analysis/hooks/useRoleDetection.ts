/**
 * Role Detection Hook
 * Custom hook for managing role detection functionality
 */

import { useState, useCallback, useRef } from 'react';
import { useUnifiedAnalysis } from '../context/UnifiedAnalysisContext';
import { unifiedAnalysisActions, createRoleDetectionError } from '../context/actions';
import { roleProfileService } from '../../../services/roleProfileService';
import type { 
  UseRoleDetectionReturn,
  RoleDetectionStatus 
} from '../context/types';
import type { Job } from '../../../services/cvService';
import type { 
  DetectedRole, 
  RoleProfileAnalysis 
} from '../../../types/role-profiles';

export const useRoleDetection = (): UseRoleDetectionReturn => {
  const { state, dispatch } = useUnifiedAnalysis();
  const [localError, setLocalError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    detectedRoles, 
    selectedRole, 
    roleDetectionStatus,
    roleAnalysis 
  } = state;
  
  const startDetection = useCallback(async (jobData: Job) => {
    console.warn('[useRoleDetection] startDetection called with jobData:', {
      id: jobData?.id,
      status: jobData?.status,
      hasParsedData: !!jobData?.parsedData
    });
    
    if (!jobData.id) {
      const errorMessage = 'Job ID is required for role detection';
      console.error('[useRoleDetection] Error: No job ID provided');
      setLocalError(errorMessage);
      dispatch(unifiedAnalysisActions.setRoleDetectionStatus('error'));
      return;
    }

    try {
      console.warn('[useRoleDetection] Starting role detection for job:', jobData.id);
      setLocalError(null);
      dispatch(unifiedAnalysisActions.setRoleDetectionStatus('analyzing'));
      
      // Progressive timeout handling with better UX
      const setupProgressiveTimeouts = () => {
        // Show "still processing" message after 15 seconds
        setTimeout(() => {
          setProgressMessage('AI is still analyzing your CV... This may take a moment for complex profiles.');
        }, 15000);
        
        // Show fallback options after 45 seconds
        setTimeout(() => {
          setProgressMessage('Analysis is taking longer than usual. Fallback options will be provided soon.');
        }, 45000);
      };
      
      setupProgressiveTimeouts();
      
      // Create timeout promise with 60-second limit and exponential backoff for retries
      const baseTimeout = retryCount === 0 ? 60000 : Math.min(60000 * Math.pow(1.5, retryCount - 1), 120000);
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          console.warn(`[useRoleDetection] Role detection timeout reached after ${baseTimeout / 1000} seconds`);
          reject(new Error(`Role detection timed out after ${Math.round(baseTimeout / 1000)} seconds. AI processing took longer than expected.`));
        }, baseTimeout);
      });
      
      // Race the API call against the timeout
      console.warn('[useRoleDetection] About to call roleProfileService.detectRole with jobId:', jobData.id);
      console.warn(`[useRoleDetection] Timeout set to ${Math.round(baseTimeout / 1000)} seconds (retry attempt: ${retryCount})`);
      
      const detectionResponse = await Promise.race([
        roleProfileService.detectRole(jobData.id),
        timeoutPromise
      ]);
      
      // Clear timeouts on successful response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.warn('[useRoleDetection] Received response from detectRole:', detectionResponse);
      setProgressMessage('');
      
      if (!detectionResponse.success || !detectionResponse.data) {
        throw new Error('Role detection failed - no data received');
      }

      const { detectedRole, analysis } = detectionResponse.data;
      
      // Convert single detected role to array format for UI
      const detectedRoles: DetectedRole[] = [];
      if (detectedRole) {
        detectedRoles.push(detectedRole);
      }
      if (analysis?.alternativeRoles) {
        detectedRoles.push(...analysis.alternativeRoles);
      }
      
      dispatch(unifiedAnalysisActions.setDetectedRoles(detectedRoles));
      dispatch(unifiedAnalysisActions.setRoleAnalysis(analysis));
      dispatch(unifiedAnalysisActions.setRoleDetectionStatus('completed'));
      
      // Auto-select primary role if confidence is high
      if (detectedRole && detectedRole.confidence > 0.8) {
        dispatch(unifiedAnalysisActions.selectRole(detectedRole));
      }
      
      // Reset retry count on success
      setRetryCount(0);
      
    } catch (error: any) {
      console.error('[useRoleDetection] Role detection failed:', error);
      
      // Clear any active timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      let errorMessage = 'Unable to detect role. Please select manually.';
      let isTimeout = false;
      let shouldProvideFallbacks = false;
      
      // Enhanced error handling with specific messages
      if (error.message && error.message.includes('timed out')) {
        isTimeout = true;
        shouldProvideFallbacks = true;
        
        if (retryCount === 0) {
          errorMessage = `AI analysis took longer than expected (${Math.round(baseTimeout / 1000)}s). Don't worry - fallback options are available below, or you can retry with extended timeout.`;
        } else {
          errorMessage = `Analysis timeout after ${retryCount + 1} attempts. Using fallback role options to help you proceed.`;
        }
      } else if (error.message && error.message.includes('network')) {
        errorMessage = 'Network connection issue. Please check your internet and retry.';
      } else if (error.message && error.message.includes('auth')) {
        errorMessage = 'Authentication issue. Please refresh the page and try again.';
      } else {
        errorMessage = `Analysis failed: ${error.message || 'Unknown error'}. Using fallback options.`;
        shouldProvideFallbacks = true;
      }
      
      setLocalError(errorMessage);
      setProgressMessage('');
      dispatch(unifiedAnalysisActions.setRoleDetectionStatus('error'));
      dispatch(unifiedAnalysisActions.addError(
        createRoleDetectionError(errorMessage, { 
          ...error, 
          isTimeout, 
          retryCount, 
          shouldProvideFallbacks 
        })
      ));
      
      // Auto-provide fallback roles on timeout
      if (shouldProvideFallbacks) {
        console.warn('[useRoleDetection] Auto-providing fallback roles due to timeout/error');
        setTimeout(() => {
          provideFallbackRoles();
        }, 1000); // Small delay to let user see the error message first
      }
    }
  }, [dispatch]);
  
  const selectRole = useCallback((role: DetectedRole) => {
    dispatch(unifiedAnalysisActions.selectRole(role));
    setLocalError(null);
  }, [dispatch]);
  
  const retry = useCallback(() => {
    if (state.jobData) {
      setRetryCount(prev => prev + 1);
      setLocalError(null);
      setProgressMessage('');
      console.warn(`[useRoleDetection] Retrying detection (attempt ${retryCount + 2})`);
      startDetection(state.jobData);
    }
  }, [state.jobData, startDetection, retryCount]);
  
  const provideFallbackRoles = useCallback(() => {
    console.warn('[useRoleDetection] Providing fallback roles');
    
    // Enhanced fallback roles with better descriptions and guidance
    const fallbackRoles: DetectedRole[] = [
      {
        roleId: 'general-professional',
        roleName: 'General Professional',
        confidence: 0.7,
        matchedSkills: [],
        recommendations: [
          'Versatile profile suitable for multiple industries',
          'Good starting point if your role doesn\'t fit other categories',
          'Provides balanced optimization for various positions'
        ],
        category: 'general'
      },
      {
        roleId: 'software-developer',
        roleName: 'Software Developer',
        confidence: 0.6,
        matchedSkills: [],
        recommendations: [
          'Ideal for programming, development, and engineering roles',
          'Optimizes technical skills and project experience',
          'Best for: Frontend, Backend, Full-stack, DevOps positions'
        ],
        category: 'technology'
      },
      {
        roleId: 'business-analyst',
        roleName: 'Business Analyst',
        confidence: 0.6,
        matchedSkills: [],
        recommendations: [
          'Perfect for analytical and process improvement roles',
          'Emphasizes data analysis and business process skills',
          'Best for: BA, Data Analyst, Process Analyst positions'
        ],
        category: 'business'
      },
      {
        roleId: 'project-manager',
        roleName: 'Project Manager',
        confidence: 0.6,
        matchedSkills: [],
        recommendations: [
          'Highlights leadership and coordination experience',
          'Emphasizes team management and delivery skills',
          'Best for: PM, Scrum Master, Team Lead positions'
        ],
        category: 'management'
      },
      {
        roleId: 'marketing-specialist',
        roleName: 'Marketing Specialist',
        confidence: 0.5,
        matchedSkills: [],
        recommendations: [
          'Optimizes creative and communication skills',
          'Focuses on campaign and brand management experience',
          'Best for: Marketing, Communications, Brand roles'
        ],
        category: 'marketing'
      },
      {
        roleId: 'sales-representative',
        roleName: 'Sales Professional',
        confidence: 0.5,
        matchedSkills: [],
        recommendations: [
          'Emphasizes relationship building and revenue generation',
          'Highlights negotiation and client management skills',
          'Best for: Sales, BD, Account Management positions'
        ],
        category: 'sales'
      },
      {
        roleId: 'consultant',
        roleName: 'Consultant',
        confidence: 0.5,
        matchedSkills: [],
        recommendations: [
          'Great for advisory and strategic roles',
          'Emphasizes problem-solving and client interaction',
          'Best for: Consulting, Advisory, Strategic roles'
        ],
        category: 'consulting'
      },
      {
        roleId: 'operations-manager',
        roleName: 'Operations Manager',
        confidence: 0.5,
        matchedSkills: [],
        recommendations: [
          'Focuses on process optimization and efficiency',
          'Highlights operational excellence and team coordination',
          'Best for: Operations, Process Management roles'
        ],
        category: 'operations'
      }
    ];
    
    dispatch(unifiedAnalysisActions.setDetectedRoles(fallbackRoles));
    dispatch(unifiedAnalysisActions.setRoleDetectionStatus('completed'));
    
    // Provide helpful guidance message
    const guidanceMessage = retryCount > 0 
      ? `After ${retryCount + 1} attempts, we've provided these role options. Each role has specific optimization strategies - choose the one that best matches your career focus.`
      : 'AI analysis took longer than expected, but don\'t worry! We\'ve provided these carefully selected role options. Choose the one that best matches your professional background for optimal CV optimization.';
    
    setLocalError(guidanceMessage);
  }, [dispatch, retryCount]);
  
  const isLoading = roleDetectionStatus === 'analyzing' || roleDetectionStatus === 'detecting';
  const hasTimedOut = localError?.includes('timed out') || localError?.includes('taking longer than expected');
  const canRetry = hasTimedOut && retryCount < 2; // Allow up to 3 attempts total
  const showFallbackOptions = (roleDetectionStatus === 'error' && detectedRoles.length > 0) || hasTimedOut;
  
  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
      progressTimeoutRef.current = null;
    }
  }, []);
  
  return {
    detectedRoles,
    selectedRole,
    status: roleDetectionStatus,
    analysis: roleAnalysis,
    startDetection,
    selectRole,
    retry,
    provideFallbackRoles,
    isLoading,
    hasTimedOut,
    canRetry,
    retryCount,
    showFallbackOptions,
    progressMessage,
    cleanup,
    error: localError
  };
};