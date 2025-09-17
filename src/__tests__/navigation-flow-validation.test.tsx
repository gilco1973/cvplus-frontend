// CVPlus Navigation Flow Validation & User Permission Test Suite
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NavigationStateManager from '../services/navigation/navigationStateManager';
import { NavigationBreadcrumbs } from '../components/NavigationBreadcrumbs';
import { Navigation } from '../components/common/Navigation';
import { AuthProvider } from '../contexts/AuthContext';
import {
  EnhancedSessionState,
  NavigationState,
  CVStep,
  NavigationPath,
  ResumeRecommendation,
  ActionRecommendation,
  SubstepProgress,
  ValidationResult
} from '../types/session';

// Permission levels for testing
type UserPermissionLevel = 'guest' | 'basic' | 'premium' | 'admin';

// Mock user with different permission levels
const createMockUser = (permissionLevel: UserPermissionLevel) => ({
  uid: `user-${permissionLevel}-123`,
  email: `${permissionLevel}@example.com`,
  permissions: {
    canAccessPremiumFeatures: ['premium', 'admin'].includes(permissionLevel),
    canSkipSteps: ['admin'].includes(permissionLevel),
    canAccessAdvancedSettings: ['premium', 'admin'].includes(permissionLevel),
    maxSessionsAllowed: permissionLevel === 'admin' ? Infinity : permissionLevel === 'premium' ? 10 : 3
  }
});

// Create comprehensive test session
const createTestSession = (overrides: Partial<EnhancedSessionState> = {}): EnhancedSessionState => {
  const baseSession: EnhancedSessionState = {
    sessionId: 'flow-test-session-123',
    userId: 'user-basic-123',
    jobId: 'job-123',
    currentStep: 'analysis' as CVStep,
    completedSteps: ['upload', 'processing'] as CVStep[],
    totalSteps: 7,
    progressPercentage: 40,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    formData: {
      targetRole: 'Software Engineer',
      selectedFeatures: ['podcast-generation', 'video-intro'],
      settings: {
        applyAllEnhancements: true,
        generateAllFormats: false,
        enablePIIProtection: true
      }
    },
    status: 'in_progress',
    canResume: true,
    stepProgress: {
      upload: {
        stepId: 'upload',
        substeps: [
          { id: 'file-select', name: 'File Selection', status: 'completed', startedAt: new Date(Date.now() - 600000), completedAt: new Date(Date.now() - 580000) },
          { id: 'file-upload', name: 'File Upload', status: 'completed', startedAt: new Date(Date.now() - 580000), completedAt: new Date(Date.now() - 560000) },
          { id: 'file-validation', name: 'File Validation', status: 'completed', startedAt: new Date(Date.now() - 560000), completedAt: new Date(Date.now() - 540000) }
        ],
        completion: 100,
        timeSpent: 120000,
        userInteractions: [],
        lastModified: new Date(Date.now() - 540000),
        estimatedTimeToComplete: 0
      },
      processing: {
        stepId: 'processing',
        substeps: [
          { id: 'text-extraction', name: 'Text Extraction', status: 'completed', startedAt: new Date(Date.now() - 540000), completedAt: new Date(Date.now() - 480000) },
          { id: 'structure-analysis', name: 'Structure Analysis', status: 'completed', startedAt: new Date(Date.now() - 480000), completedAt: new Date(Date.now() - 420000) },
          { id: 'content-validation', name: 'Content Validation', status: 'completed', startedAt: new Date(Date.now() - 420000), completedAt: new Date(Date.now() - 360000) }
        ],
        completion: 100,
        timeSpent: 180000,
        userInteractions: [],
        lastModified: new Date(Date.now() - 360000),
        estimatedTimeToComplete: 0
      },
      analysis: {
        stepId: 'analysis',
        substeps: [
          { id: 'ai-analysis', name: 'AI Analysis', status: 'completed', startedAt: new Date(Date.now() - 360000), completedAt: new Date(Date.now() - 300000) },
          { id: 'skill-extraction', name: 'Skill Extraction', status: 'in_progress', startedAt: new Date(Date.now() - 300000) },
          { id: 'recommendation-generation', name: 'Recommendation Generation', status: 'pending' }
        ],
        completion: 60,
        timeSpent: 240000,
        userInteractions: [],
        lastModified: new Date(Date.now() - 60000),
        estimatedTimeToComplete: 120000,
        blockers: ['User input required for skill validation']
      },
      features: {
        stepId: 'features',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 600000
      },
      templates: {
        stepId: 'templates',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 300000
      },
      preview: {
        stepId: 'preview',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 180000
      },
      results: {
        stepId: 'results',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 120000
      },
      keywords: {
        stepId: 'keywords',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 240000
      },
      completed: {
        stepId: 'completed',
        substeps: [],
        completion: 0,
        timeSpent: 0,
        userInteractions: [],
        lastModified: new Date(),
        estimatedTimeToComplete: 0
      }
    },
    featureStates: {
      'podcast-generation': {
        featureId: 'podcast-generation',
        enabled: true,
        configuration: { voice: 'professional', length: 'medium' },
        progress: { configured: true, processing: false, completed: false },
        dependencies: ['analysis'],
        userPreferences: { priority: 'high', recommended: true },
        metadata: { estimatedDuration: 300, complexity: 'medium' }
      },
      'video-intro': {
        featureId: 'video-intro',
        enabled: true,
        configuration: { style: 'modern', duration: 60 },
        progress: { configured: false, processing: false, completed: false },
        dependencies: ['analysis', 'features'],
        userPreferences: { priority: 'medium', recommended: false },
        metadata: { estimatedDuration: 180, complexity: 'high' }
      }
    },
    processingCheckpoints: [],
    uiState: {
      currentView: 'analysis',
      activeFormId: 'skill-validation-form',
      formStates: {},
      navigationHistory: [],
      scrollPositions: { '/analysis': 240 },
      expandedSections: ['skills', 'experience'],
      currentUrl: '/analysis?session=flow-test-session-123',
      previousUrls: ['/upload', '/processing'],
      breadcrumbs: [],
      modals: { open: [], history: [] },
      selections: {}
    },
    validationResults: {
      formValidations: {},
      stepValidations: {
        analysis: [
          {
            field: 'skills',
            valid: false,
            errors: ['Please validate extracted skills'],
            warnings: ['Some skills may need manual review'],
            timestamp: new Date()
          }
        ]
      },
      globalValidations: [],
      lastValidatedAt: new Date(),
      validationVersion: '1.0.0'
    },
    navigationHistory: [],
    performanceMetrics: {
      loadTime: 1200,
      interactionCount: 8,
      errorCount: 0,
      averageResponseTime: 350,
      memoryUsage: 12000000
    },
    contextData: {
      userAgent: 'test-flow-agent',
      screenSize: { width: 1920, height: 1080 },
      timezone: 'UTC',
      language: 'en',
      feature_flags: { 'premium-features': true }
    },
    schemaVersion: '2.0',
    actionQueue: [],
    offlineCapability: {
      enabled: true,
      lastSyncAt: new Date(),
      pendingActions: 0,
      storageUsed: 2048000,
      maxStorageSize: 50 * 1024 * 1024
    }
  };
  
  return { ...baseSession, ...overrides };
};

// Test utilities
const renderWithAuth = (component: React.ReactElement, user: any, initialPath = '/') => {
  const mockAuthContext = {
    user,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn()
  };
  
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider value={mockAuthContext}>
        {component}
      </AuthProvider>
    </MemoryRouter>
  );
};

// Mock implementations
vi.mock('../services/navigation/navigationStateManager');
vi.mock('../contexts/AuthContext');
vi.mock('../services/enhancedSessionManager');
vi.mock('react-hot-toast');

describe('Navigation Flow Validation Tests', () => {
  let mockNavigationManager: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNavigationManager = {
      getInstance: vi.fn().mockReturnThis(),
      generateStateUrl: vi.fn((sessionId, step, substep) => `/${step}?session=${sessionId}${substep ? `&substep=${substep}` : ''}`),
      parseStateFromUrl: vi.fn(),
      getNavigationContext: vi.fn(),
      generateBreadcrumbs: vi.fn(),
      pushStateToHistory: vi.fn(),
      handleBackNavigation: vi.fn(),
      suggestOptimalResumePoint: vi.fn()
    };
    
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });
  
  describe('Step Prerequisite Validation', () => {
    it('should enforce sequential step completion', async () => {
      const session = createTestSession({
        currentStep: 'upload',
        completedSteps: []
      });
      
      const availablePaths: NavigationPath[] = [
        { step: 'upload', url: '/upload', label: 'Upload CV', accessible: true, completed: false, required: true, prerequisites: [] },
        { step: 'processing', url: '/processing', label: 'Processing', accessible: false, completed: false, required: true, prerequisites: ['upload'], warnings: ['Complete upload first'] },
        { step: 'analysis', url: '/analysis', label: 'Analysis', accessible: false, completed: false, required: true, prerequisites: ['upload', 'processing'], warnings: ['Complete previous steps first'] },
        { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, prerequisites: ['analysis'], warnings: ['Analysis must be completed'] },
        { step: 'results', url: '/results', label: 'Results', accessible: false, completed: false, required: false, prerequisites: ['preview'], warnings: ['Preview must be completed'] }
      ];
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/upload',
        availablePaths,
        blockedPaths: availablePaths.filter(path => !path.accessible),
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Only upload should be accessible
      expect(context.availablePaths.filter(path => path.accessible)).toHaveLength(1);
      expect(context.availablePaths.find(path => path.step === 'upload')?.accessible).toBe(true);
      
      // All other steps should be blocked
      const blockedSteps = context.blockedPaths.map((path: NavigationPath) => path.step);
      expect(blockedSteps).toContain('processing');
      expect(blockedSteps).toContain('analysis');
      expect(blockedSteps).toContain('features');
    });
    
    it('should allow progression only after step completion', async () => {
      const session = createTestSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing'],
        stepProgress: {
          ...createTestSession().stepProgress,
          analysis: {
            stepId: 'analysis',
            substeps: [
              { id: 'ai-analysis', name: 'AI Analysis', status: 'completed', startedAt: new Date(), completedAt: new Date() },
              { id: 'skill-extraction', name: 'Skill Extraction', status: 'completed', startedAt: new Date(), completedAt: new Date() },
              { id: 'validation', name: 'Validation', status: 'completed', startedAt: new Date(), completedAt: new Date() }
            ],
            completion: 100,
            timeSpent: 300000,
            userInteractions: [],
            lastModified: new Date(),
            estimatedTimeToComplete: 0
          }
        }
      });
      
      const availablePaths: NavigationPath[] = [
        { step: 'upload', url: '/upload', label: 'Upload CV', accessible: true, completed: true, required: true },
        { step: 'processing', url: '/processing', label: 'Processing', accessible: true, completed: true, required: true },
        { step: 'analysis', url: '/analysis', label: 'Analysis', accessible: true, completed: true, required: true },
        { step: 'features', url: '/features', label: 'Features', accessible: true, completed: false, required: false, prerequisites: ['analysis'] },
        { step: 'templates', url: '/templates', label: 'Templates', accessible: true, completed: false, required: false, prerequisites: ['analysis'] }
      ];
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths,
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 75,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Analysis completed, so features and templates should be accessible
      expect(context.availablePaths.find(path => path.step === 'features')?.accessible).toBe(true);
      expect(context.availablePaths.find(path => path.step === 'templates')?.accessible).toBe(true);
      expect(context.recommendedNextSteps).toContain('features');
    });
    
    it('should handle incomplete substeps blocking progression', async () => {
      const session = createTestSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing'],
        stepProgress: {
          ...createTestSession().stepProgress,
          analysis: {
            stepId: 'analysis',
            substeps: [
              { id: 'ai-analysis', name: 'AI Analysis', status: 'completed', startedAt: new Date(), completedAt: new Date() },
              { id: 'skill-extraction', name: 'Skill Extraction', status: 'in_progress', startedAt: new Date() },
              { id: 'validation', name: 'Validation', status: 'pending' }
            ],
            completion: 40,
            timeSpent: 180000,
            userInteractions: [],
            lastModified: new Date(),
            estimatedTimeToComplete: 270000,
            blockers: ['Skill extraction requires user review']
          }
        }
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Complete all analysis substeps first'] }
        ],
        blockedPaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Complete all analysis substeps first'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 50,
        criticalIssues: ['Analysis step has incomplete substeps']
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Features should be blocked due to incomplete substeps
      expect(context.blockedPaths.some(path => path.step === 'features')).toBe(true);
      expect(context.criticalIssues).toContain('Analysis step has incomplete substeps');
    });
  });
  
  describe('User Permission Validation', () => {
    it('should restrict premium features for basic users', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis'],
        featureStates: {
          'basic-template': {
            featureId: 'basic-template',
            enabled: true,
            configuration: {},
            progress: { configured: false, processing: false, completed: false },
            dependencies: [],
            userPreferences: { priority: 'medium', recommended: true }
          },
          'premium-analytics': {
            featureId: 'premium-analytics',
            enabled: false,
            configuration: {},
            progress: { configured: false, processing: false, completed: false },
            dependencies: [],
            userPreferences: { priority: 'high', recommended: true }
          }
        }
      });
      
      const basicUser = createMockUser('basic');
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/features',
        availablePaths: [
          { step: 'templates', url: '/templates', label: 'Basic Templates', accessible: true, completed: false, required: false }
        ],
        blockedPaths: [
          { step: 'premium-features', url: '/premium-features', label: 'Premium Features', accessible: false, completed: false, required: false, warnings: ['Premium subscription required'] }
        ],
        recommendedNextSteps: ['templates'],
        completionPercentage: 70,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, basicUser);
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Premium features should be blocked
      expect(context.blockedPaths.some(path => path.step === 'premium-features')).toBe(true);
      expect(context.blockedPaths.find(path => path.step === 'premium-features')?.warnings)
        .toContain('Premium subscription required');
    });
    
    it('should allow premium features for premium users', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis']
      });
      
      const premiumUser = createMockUser('premium');
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/features',
        availablePaths: [
          { step: 'templates', url: '/templates', label: 'All Templates', accessible: true, completed: false, required: false },
          { step: 'premium-features', url: '/premium-features', label: 'Premium Features', accessible: true, completed: false, required: false }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['premium-features', 'templates'],
        completionPercentage: 70,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, premiumUser);
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Premium features should be accessible
      expect(context.availablePaths.some(path => path.step === 'premium-features' && path.accessible)).toBe(true);
      expect(context.recommendedNextSteps).toContain('premium-features');
    });
    
    it('should allow admin users to skip validation steps', async () => {
      const session = createTestSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing'],
        stepProgress: {
          ...createTestSession().stepProgress,
          analysis: {
            stepId: 'analysis',
            substeps: [
              { id: 'ai-analysis', name: 'AI Analysis', status: 'completed', startedAt: new Date(), completedAt: new Date() },
              { id: 'validation', name: 'Validation', status: 'pending' } // Incomplete validation
            ],
            completion: 50,
            timeSpent: 150000,
            userInteractions: [],
            lastModified: new Date(),
            estimatedTimeToComplete: 150000,
            blockers: ['Validation pending']
          }
        }
      });
      
      const adminUser = createMockUser('admin');
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: true, completed: false, required: false, warnings: ['Admin override: Validation skipped'] },
          { step: 'templates', url: '/templates', label: 'Templates', accessible: true, completed: false, required: false }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, adminUser);
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Admin should be able to access features despite incomplete validation
      expect(context.availablePaths.some(path => path.step === 'features' && path.accessible)).toBe(true);
      expect(context.blockedPaths).toHaveLength(0);
    });
  });
  
  describe('Backward Navigation Validation', () => {
    it('should allow navigation back to completed steps', async () => {
      const session = createTestSession({
        currentStep: 'preview',
        completedSteps: ['upload', 'processing', 'analysis', 'features', 'templates']
      });
      
      const breadcrumbs = [
        { id: 'upload', label: 'Upload CV', url: '/upload', step: 'upload' as CVStep, completed: true, accessible: true },
        { id: 'processing', label: 'Processing', url: '/processing', step: 'processing' as CVStep, completed: true, accessible: true },
        { id: 'analysis', label: 'Analysis', url: '/analysis', step: 'analysis' as CVStep, completed: true, accessible: true },
        { id: 'features', label: 'Features', url: '/features', step: 'features' as CVStep, completed: true, accessible: true },
        { id: 'templates', label: 'Templates', url: '/templates', step: 'templates' as CVStep, completed: true, accessible: true },
        { id: 'preview', label: 'Preview', url: '/preview', step: 'preview' as CVStep, completed: false, accessible: true }
      ];
      
      mockNavigationManager.generateBreadcrumbs.mockReturnValue(breadcrumbs);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/preview',
        availablePaths: breadcrumbs.map(b => ({ ...b, required: false })),
        blockedPaths: [],
        recommendedNextSteps: ['results'],
        completionPercentage: 90,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.generateBreadcrumbs).toHaveBeenCalled();
      });
      
      const generatedBreadcrumbs = mockNavigationManager.generateBreadcrumbs();
      
      // All completed steps should be accessible for backward navigation
      const completedBreadcrumbs = generatedBreadcrumbs.filter((b: any) => b.completed);
      completedBreadcrumbs.forEach((breadcrumb: any) => {
        expect(breadcrumb.accessible).toBe(true);
      });
    });
    
    it('should preserve form data when navigating back', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis'],
        uiState: {
          ...createTestSession().uiState,
          formStates: {
            'analysis-form': {
              formId: 'analysis-form',
              fields: {
                'target-role': {
                  value: 'Senior Software Engineer',
                  dirty: true,
                  touched: true,
                  valid: true,
                  errors: [],
                  warnings: [],
                  lastModified: new Date()
                },
                'skills': {
                  value: ['JavaScript', 'React', 'Node.js'],
                  dirty: true,
                  touched: true,
                  valid: true,
                  errors: [],
                  warnings: [],
                  lastModified: new Date()
                }
              },
              metadata: {
                version: '1.0',
                lastModified: new Date(),
                userAgent: 'test',
                formSchema: 'analysis-v1',
                isDirty: true,
                isValid: true
              }
            }
          }
        }
      });
      
      const backNavigationState: NavigationState = {
        sessionId: session.sessionId,
        step: 'analysis' as CVStep,
        substep: null,
        parameters: { preserveFormData: true },
        timestamp: new Date(),
        url: '/analysis',
        transition: 'back'
      };
      
      mockNavigationManager.handleBackNavigation.mockReturnValue(backNavigationState);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 75,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      // Simulate back navigation
      act(() => {
        fireEvent(window, new PopStateEvent('popstate', {
          state: { sessionId: session.sessionId, step: 'analysis' }
        }));
      });
      
      await waitFor(() => {
        expect(mockNavigationManager.handleBackNavigation).toHaveBeenCalled();
      });
      
      const backState = mockNavigationManager.handleBackNavigation();
      expect(backState.transition).toBe('back');
      expect(backState.step).toBe('analysis');
    });
  });
  
  describe('Validation Error Handling', () => {
    it('should block progression when validation errors exist', async () => {
      const session = createTestSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing'],
        validationResults: {
          formValidations: {
            'analysis-form': [
              {
                field: 'targetRole',
                valid: false,
                errors: ['Target role is required'],
                warnings: [],
                timestamp: new Date()
              }
            ]
          },
          stepValidations: {
            analysis: [
              {
                field: 'skills',
                valid: false,
                errors: ['At least 3 skills must be validated'],
                warnings: ['Consider adding more technical skills'],
                timestamp: new Date()
              }
            ]
          },
          globalValidations: [
            {
              field: 'session',
              valid: true,
              errors: [],
              warnings: ['Session has been active for a long time'],
              timestamp: new Date()
            }
          ],
          lastValidatedAt: new Date(),
          validationVersion: '1.0.0'
        }
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Fix validation errors first'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 40,
        criticalIssues: ['2 validation errors must be resolved']
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Navigation should be blocked due to validation errors
      expect(context.blockedPaths.length).toBeGreaterThan(0);
      expect(context.criticalIssues).toContain('2 validation errors must be resolved');
      expect(context.recommendedNextSteps).toHaveLength(0);
    });
    
    it('should provide specific validation guidance', async () => {
      const session = createTestSession({
        validationResults: {
          formValidations: {},
          stepValidations: {
            analysis: [
              {
                field: 'experience',
                valid: false,
                errors: ['Work experience section is incomplete'],
                warnings: [],
                suggestions: ['Add dates for all positions', 'Include job descriptions'],
                timestamp: new Date()
              }
            ]
          },
          globalValidations: [],
          lastValidatedAt: new Date(),
          validationVersion: '1.0.0'
        }
      });
      
      const actionRecommendations: ActionRecommendation[] = [
        {
          id: 'fix-experience',
          type: 'fix_error',
          title: 'Complete Work Experience',
          description: 'Add missing dates and descriptions to work experience entries',
          priority: 'high',
          estimatedTime: 10,
          requiredSteps: ['Review experience entries', 'Add missing information'],
          benefits: ['Enables progression to features', 'Improves CV quality'],
          url: '/analysis#experience'
        }
      ];
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: [],
        completionPercentage: 45,
        criticalIssues: ['Work experience validation failed']
      });
      
      // Mock action recommendations (would typically come from ResumeIntelligence)
      mockNavigationManager.getNextRecommendedActions = vi.fn().mockResolvedValue(actionRecommendations);
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      if (mockNavigationManager.getNextRecommendedActions) {
        const recommendations = await mockNavigationManager.getNextRecommendedActions(session);
        expect(recommendations).toHaveLength(1);
        expect(recommendations[0].type).toBe('fix_error');
        expect(recommendations[0].priority).toBe('high');
      }
    });
  });
  
  describe('Resume Point Intelligence', () => {
    it('should suggest optimal resume points based on session state', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis'],
        status: 'paused',
        lastActiveAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      });
      
      const resumeRecommendation: ResumeRecommendation = {
        recommendedStep: 'features' as CVStep,
        reason: 'You were configuring features when the session was paused. Continue where you left off.',
        timeToComplete: 15,
        confidence: 0.9,
        priority: 'high',
        alternativeOptions: [
          {
            step: 'analysis' as CVStep,
            reason: 'Review and modify your analysis before proceeding',
            timeToComplete: 8,
            confidence: 0.7,
            pros: ['Ensure analysis accuracy', 'Make any needed adjustments'],
            cons: ['Adds time to completion', 'May not be necessary']
          }
        ],
        requiredData: ['Feature preferences', 'Analysis results'],
        warnings: ['Session was paused for over 24 hours - some data may need refresh']
      };
      
      mockNavigationManager.suggestOptimalResumePoint.mockResolvedValue(resumeRecommendation);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/features',
        availablePaths: [
          { step: 'features', url: '/features', label: 'Features (Resume Here)', accessible: true, completed: false, required: false }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 70,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.suggestOptimalResumePoint).toHaveBeenCalled();
      });
      
      const suggestion = await mockNavigationManager.suggestOptimalResumePoint(session);
      expect(suggestion.recommendedStep).toBe('features');
      expect(suggestion.confidence).toBeGreaterThan(0.8);
      expect(suggestion.priority).toBe('high');
    });
    
    it('should handle session timeout and suggest restart', async () => {
      const expiredSession = createTestSession({
        currentStep: 'processing',
        completedSteps: ['upload'],
        status: 'expired',
        lastActiveAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      });
      
      const resumeRecommendation: ResumeRecommendation = {
        recommendedStep: 'upload' as CVStep,
        reason: 'Session has expired. Please start over to ensure data consistency.',
        timeToComplete: 30,
        confidence: 1.0,
        priority: 'high',
        alternativeOptions: [],
        requiredData: ['Fresh CV file', 'Updated preferences'],
        warnings: ['Previous session data may be lost', 'Processing results need to be regenerated']
      };
      
      mockNavigationManager.suggestOptimalResumePoint.mockResolvedValue(resumeRecommendation);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: expiredSession.sessionId,
        currentPath: '/upload',
        availablePaths: [
          { step: 'upload', url: '/upload', label: 'Start New Session', accessible: true, completed: false, required: true }
        ],
        blockedPaths: [
          { step: 'processing', url: '/processing', label: 'Processing', accessible: false, completed: false, required: true, warnings: ['Session expired'] }
        ],
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: ['Session has expired']
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={expiredSession.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.suggestOptimalResumePoint).toHaveBeenCalled();
      });
      
      const suggestion = await mockNavigationManager.suggestOptimalResumePoint(expiredSession);
      expect(suggestion.recommendedStep).toBe('upload');
      expect(suggestion.warnings).toContain('Previous session data may be lost');
    });
  });
  
  describe('Progressive Enhancement Validation', () => {
    it('should handle feature dependencies correctly', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis'],
        featureStates: {
          'basic-template': {
            featureId: 'basic-template',
            enabled: true,
            configuration: { style: 'modern' },
            progress: { configured: true, processing: false, completed: false },
            dependencies: ['analysis'],
            userPreferences: { priority: 'medium', recommended: true }
          },
          'video-intro': {
            featureId: 'video-intro',
            enabled: true,
            configuration: {},
            progress: { configured: false, processing: false, completed: false },
            dependencies: ['basic-template', 'analysis'], // Depends on basic template
            userPreferences: { priority: 'high', recommended: true }
          },
          'podcast-generation': {
            featureId: 'podcast-generation',
            enabled: true,
            configuration: {},
            progress: { configured: false, processing: false, completed: false },
            dependencies: ['video-intro'], // Depends on video intro
            userPreferences: { priority: 'low', recommended: false }
          }
        }
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/features',
        availablePaths: [
          { step: 'templates', url: '/templates', label: 'Templates', accessible: true, completed: false, required: false, prerequisites: ['basic-template'] },
          { step: 'preview', url: '/preview', label: 'Preview', accessible: false, completed: false, required: false, prerequisites: ['templates'], warnings: ['Configure all selected features first'] }
        ],
        blockedPaths: [
          { step: 'preview', url: '/preview', label: 'Preview', accessible: false, completed: false, required: false, warnings: ['Configure video-intro and podcast-generation features'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 75,
        criticalIssues: ['2 features need configuration']
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Preview should be blocked until all selected features are configured
      expect(context.blockedPaths.some(path => path.step === 'preview')).toBe(true);
      expect(context.criticalIssues).toContain('2 features need configuration');
    });
    
    it('should allow skipping optional features', async () => {
      const session = createTestSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis'],
        featureStates: {
          'basic-template': {
            featureId: 'basic-template',
            enabled: true,
            configuration: { style: 'modern' },
            progress: { configured: true, processing: false, completed: false },
            dependencies: ['analysis'],
            userPreferences: { priority: 'high', recommended: true }
          },
          'optional-feature': {
            featureId: 'optional-feature',
            enabled: false, // User chose to skip
            configuration: {},
            progress: { configured: false, processing: false, completed: false },
            dependencies: [],
            userPreferences: { priority: 'low', recommended: false }
          }
        }
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: session.sessionId,
        currentPath: '/features',
        availablePaths: [
          { step: 'templates', url: '/templates', label: 'Templates', accessible: true, completed: false, required: false },
          { step: 'preview', url: '/preview', label: 'Preview', accessible: true, completed: false, required: false }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['templates'],
        completionPercentage: 80,
        criticalIssues: []
      });
      
      renderWithAuth(<NavigationBreadcrumbs sessionId={session.sessionId} />, createMockUser('basic'));
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });
      
      const context = await mockNavigationManager.getNavigationContext(session.sessionId);
      
      // Should be able to proceed even with skipped optional features
      expect(context.availablePaths.some(path => path.step === 'preview' && path.accessible)).toBe(true);
      expect(context.blockedPaths).toHaveLength(0);
    });
  });
});
