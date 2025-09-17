// Navigation State Manager Test Suite
import NavigationStateManager from '../services/navigation/navigationStateManager';
import { RouteManager } from '../services/navigation/routeManager';
import { ResumeIntelligence } from '../services/navigation/resumeIntelligence';
import {
  EnhancedSessionState,
  NavigationState,
  NavigationContext,
  Breadcrumb,
  CVStep
} from '../types/session';

// Mock dependencies
jest.mock('../services/navigation/routeManager');
jest.mock('../services/navigation/resumeIntelligence');
jest.mock('../services/enhancedSessionManager');

const mockRouteManager = {
  generateStateUrl: jest.fn().mockReturnValue('/analysis?session=test&step=analysis'),
  parseStateFromUrl: jest.fn().mockReturnValue({
    sessionId: 'test-session',
    step: 'analysis' as CVStep,
    substep: null,
    timestamp: new Date(),
    parameters: {}
  }),
  getRouteDefinition: jest.fn().mockReturnValue({
    step: 'analysis',
    path: '/analysis',
    title: 'AI Analysis',
    icon: '🔍',
    description: 'Analyze your CV with AI',
    estimatedTime: 5
  }),
  getAllRoutes: jest.fn().mockReturnValue([
    { step: 'upload', path: '/upload', title: 'Upload CV', icon: '📄', estimatedTime: 2 },
    { step: 'analysis', path: '/analysis', title: 'AI Analysis', icon: '🔍', estimatedTime: 5 },
    { step: 'features', path: '/features', title: 'Features', icon: '✨', estimatedTime: 10 }
  ])
};

const mockResumeIntelligence = {
  suggestOptimalResumePoint: jest.fn().mockResolvedValue({
    recommendedStep: 'features',
    reason: 'Analysis is complete, continue to features',
    timeToComplete: 10,
    confidence: 0.8,
    priority: 'high',
    alternativeOptions: [],
    requiredData: [],
    warnings: []
  }),
  getNextRecommendedActions: jest.fn().mockResolvedValue([]),
  identifySkippableSteps: jest.fn().mockReturnValue(['keywords'])
};

const mockEnhancedSessionManager = {
  getInstance: jest.fn().mockReturnValue({
    getEnhancedSession: jest.fn()
  })
};

(RouteManager as jest.Mock).mockImplementation(() => mockRouteManager);
(ResumeIntelligence as jest.Mock).mockImplementation(() => mockResumeIntelligence);

// Mock window and history
const mockPushState = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(global, 'window', {
  value: {
    history: {
      pushState: mockPushState
    },
    location: {
      pathname: '/analysis',
      href: 'http://localhost:3000/analysis?session=test&step=analysis'
    },
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
    dispatchEvent: jest.fn()
  },
  writable: true
});

describe('NavigationStateManager', () => {
  let navigationManager: NavigationStateManager;
  let mockSession: EnhancedSessionState;

  beforeEach(() => {
    jest.clearAllMocks();
    
    navigationManager = NavigationStateManager.getInstance();

    mockSession = {
      sessionId: 'test-session-123',
      currentStep: 'analysis' as CVStep,
      completedSteps: ['upload', 'processing'] as CVStep[],
      createdAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-02'),
      stepProgress: {
        upload: { completion: 100, timeSpent: 300, substeps: [], startedAt: new Date(), estimatedTimeToComplete: 0 },
        processing: { completion: 100, timeSpent: 600, substeps: [], startedAt: new Date(), estimatedTimeToComplete: 0 },
        analysis: { completion: 75, timeSpent: 450, substeps: [], startedAt: new Date(), estimatedTimeToComplete: 150 },
        features: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 600 },
        templates: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 300 },
        preview: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 180 },
        results: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 120 },
        keywords: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 240 },
        completed: { completion: 0, timeSpent: 0, substeps: [], estimatedTimeToComplete: 0 }
      },
      featureStates: {
        'podcast-generation': {
          featureId: 'podcast-generation',
          enabled: true,
          configuration: {},
          progress: { completed: false, currentSubtask: null, percentComplete: 0 },
          dependencies: [],
          userPreferences: { priority: 'medium', recommended: false },
          metadata: { estimatedDuration: 300, complexity: 'medium' }
        }
      },
      processingCheckpoints: [],
      uiState: {
        currentView: 'analysis',
        activeFormId: null,
        formStates: {},
        navigationHistory: [],
        scrollPositions: {},
        expandedSections: []
      },
      validationResults: {
        globalValidations: [
          { field: 'email', valid: false, errors: ['Invalid email'], warnings: [], timestamp: new Date() }
        ],
        stepValidations: {}
      },
      performanceMetrics: {
        initialLoadTime: 1000,
        renderTime: 100,
        memoryUsage: 10000000,
        networkRequests: 5,
        cacheHitRate: 0.8,
        interactionCount: 10,
        errorCount: 0
      },
      contextData: {
        userAgent: 'test-agent',
        viewport: { width: 1920, height: 1080 },
        referrer: '',
        timezone: 'UTC',
        language: 'en',
        environment: 'test'
      },
      schemaVersion: '2.0',
      actionQueue: [],
      offlineCapability: {
        enabled: false,
        lastSyncAt: new Date(),
        pendingActions: 0,
        storageUsed: 0,
        maxStorageSize: 50 * 1024 * 1024
      }
    };

    // Setup enhanced session manager mock
    mockEnhancedSessionManager.getInstance().getEnhancedSession.mockResolvedValue(mockSession);
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NavigationStateManager.getInstance();
      const instance2 = NavigationStateManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('URL Management Delegation', () => {
    it('should delegate URL generation to RouteManager', () => {
      const url = navigationManager.generateStateUrl('test-session', 'analysis', 'substep', { param: 'value' });

      expect(mockRouteManager.generateStateUrl).toHaveBeenCalledWith(
        'test-session', 'analysis', 'substep', { param: 'value' }
      );
      expect(url).toBe('/analysis?session=test&step=analysis');
    });

    it('should delegate URL parsing to RouteManager', () => {
      const state = navigationManager.parseStateFromUrl('http://localhost:3000/analysis');

      expect(mockRouteManager.parseStateFromUrl).toHaveBeenCalledWith('http://localhost:3000/analysis');
      expect(state?.sessionId).toBe('test-session');
      expect(state?.step).toBe('analysis');
    });
  });

  describe('Resume Intelligence Delegation', () => {
    it('should delegate resume point suggestion to ResumeIntelligence', async () => {
      const suggestion = await navigationManager.suggestOptimalResumePoint(mockSession);

      expect(mockResumeIntelligence.suggestOptimalResumePoint).toHaveBeenCalledWith(mockSession);
      expect(suggestion.recommendedStep).toBe('features');
    });

    it('should delegate recommended actions to ResumeIntelligence', async () => {
      const actions = await navigationManager.getNextRecommendedActions(mockSession);

      expect(mockResumeIntelligence.getNextRecommendedActions).toHaveBeenCalledWith(mockSession);
      expect(actions).toEqual([]);
    });

    it('should delegate skippable steps identification to ResumeIntelligence', () => {
      const skippableSteps = navigationManager.identifySkippableSteps(mockSession);

      expect(mockResumeIntelligence.identifySkippableSteps).toHaveBeenCalledWith(mockSession);
      expect(skippableSteps).toEqual(['keywords']);
    });
  });

  describe('Navigation State Management', () => {
    it('should push navigation state to history', () => {
      const navigationState: NavigationState = {
        sessionId: 'test-session',
        step: 'features' as CVStep,
        substep: null,
        timestamp: new Date(),
        parameters: {}
      };

      navigationManager.pushStateToHistory(navigationState);

      expect(mockPushState).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'test-session',
          step: 'features'
        }),
        expect.any(String),
        '/analysis?session=test&step=analysis'
      );
    });

    it('should handle back navigation', () => {
      // First push some states
      const state1: NavigationState = {
        sessionId: 'test-session',
        step: 'upload' as CVStep,
        substep: null,
        timestamp: new Date(),
        parameters: {}
      };

      const state2: NavigationState = {
        sessionId: 'test-session',
        step: 'analysis' as CVStep,
        substep: null,
        timestamp: new Date(),
        parameters: {}
      };

      navigationManager.pushStateToHistory(state1);
      navigationManager.pushStateToHistory(state2);

      // Handle back navigation
      const backState = navigationManager.handleBackNavigation();

      expect(backState).toBeDefined();
      expect(backState?.transition).toBe('back');
    });

    it('should return null for back navigation when history is empty', () => {
      mockRouteManager.parseStateFromUrl.mockReturnValue(null);

      const backState = navigationManager.handleBackNavigation();

      expect(backState).toBeNull();
    });
  });

  describe('Navigation Context', () => {
    it('should generate navigation context', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      expect(context).toBeDefined();
      expect(context.sessionId).toBe('test-session');
      expect(context.currentPath).toBe('/analysis');
      expect(context.availablePaths).toBeDefined();
      expect(context.blockedPaths).toBeDefined();
      expect(context.recommendedNextSteps).toBeDefined();
      expect(context.completionPercentage).toBeDefined();
      expect(context.criticalIssues).toBeDefined();
    });

    it('should calculate completion percentage correctly', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      // With upload (100%) and processing (100%) complete, analysis (75%) in progress
      // Should be around 68% (2 * 100 + 0.75 * 75) / 7 * 80% + adjustments
      expect(context.completionPercentage).toBeGreaterThan(0);
      expect(context.completionPercentage).toBeLessThan(100);
    });

    it('should identify critical issues', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      expect(context.criticalIssues).toContain('1 validation errors need fixing');
    });

    it('should recommend next steps', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      expect(context.recommendedNextSteps).toContain('features');
    });
  });

  describe('Breadcrumbs Generation', () => {
    it('should generate breadcrumbs for current session', () => {
      const breadcrumbs = navigationManager.generateBreadcrumbs(mockSession);

      expect(breadcrumbs).toHaveLength(3); // upload, processing, analysis
      expect(breadcrumbs[0].step).toBe('upload');
      expect(breadcrumbs[0].completed).toBe(true);
      expect(breadcrumbs[0].accessible).toBe(true);
      
      expect(breadcrumbs[1].step).toBe('processing');
      expect(breadcrumbs[1].completed).toBe(true);
      
      expect(breadcrumbs[2].step).toBe('analysis');
      expect(breadcrumbs[2].completed).toBe(false);
    });

    it('should include route metadata in breadcrumbs', () => {
      const breadcrumbs = navigationManager.generateBreadcrumbs(mockSession);

      const analysisBreadcrumb = breadcrumbs.find(b => b.step === 'analysis');
      expect(analysisBreadcrumb?.metadata?.icon).toBe('🔍');
      expect(analysisBreadcrumb?.metadata?.description).toBe('Analyze your CV with AI');
    });

    it('should mark inaccessible steps correctly', () => {
      const breadcrumbs = navigationManager.generateBreadcrumbs(mockSession);

      // All current breadcrumbs should be accessible since they're completed or current
      breadcrumbs.forEach(breadcrumb => {
        expect(breadcrumb.accessible).toBe(true);
      });
    });
  });

  describe('Available Paths Management', () => {
    it('should identify available paths correctly', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      expect(context.availablePaths).toBeDefined();
      expect(context.availablePaths.length).toBeGreaterThan(0);

      const uploadPath = context.availablePaths.find(p => p.step === 'upload');
      expect(uploadPath?.accessible).toBe(true);
      expect(uploadPath?.completed).toBe(true);
    });

    it('should identify blocked paths correctly', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      const blockedPaths = context.blockedPaths;
      expect(Array.isArray(blockedPaths)).toBe(true);

      // Steps that haven't met prerequisites should be blocked
      const resultsPath = context.availablePaths.find(p => p.step === 'results');
      if (resultsPath && !resultsPath.accessible) {
        expect(blockedPaths.some(p => p.step === 'results')).toBe(true);
      }
    });

    it('should include estimated times for paths', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      const pathsWithTime = context.availablePaths.filter(p => p.estimatedTime);
      expect(pathsWithTime.length).toBeGreaterThan(0);

      const uploadPath = context.availablePaths.find(p => p.step === 'upload');
      expect(uploadPath?.estimatedTime).toBeDefined();
    });
  });

  describe('Browser History Integration', () => {
    it('should setup popstate listener', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    });

    it('should handle popstate events', () => {
      const popstateHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'popstate'
      )?.[1];

      expect(popstateHandler).toBeDefined();

      // Simulate popstate event
      const mockEvent = {
        state: { sessionId: 'test-session', step: 'features' }
      };

      popstateHandler?.(mockEvent);

      expect(mockRouteManager.parseStateFromUrl).toHaveBeenCalled();
    });

    it('should generate correct page titles', () => {
      const navigationState: NavigationState = {
        sessionId: 'test-session',
        step: 'analysis' as CVStep,
        substep: null,
        timestamp: new Date(),
        parameters: {}
      };

      navigationManager.pushStateToHistory(navigationState);

      expect(mockPushState).toHaveBeenCalledWith(
        expect.any(Object),
        'CVPlus - AI Analysis',
        expect.any(String)
      );
    });
  });

  describe('Step Accessibility Logic', () => {
    it('should check step prerequisites correctly', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      // Features should be accessible since analysis is in progress
      const featuresPath = context.availablePaths.find(p => p.step === 'features');
      expect(featuresPath?.accessible).toBe(true);

      // Results should not be accessible since preview isn't complete
      const resultsPath = context.availablePaths.find(p => p.step === 'results');
      expect(resultsPath?.accessible).toBe(false);
    });

    it('should identify required steps', async () => {
      const context = await navigationManager.getNavigationContext('test-session');

      const requiredSteps = context.availablePaths.filter(p => p.required);
      const requiredStepNames = requiredSteps.map(p => p.step);

      expect(requiredStepNames).toContain('upload');
      expect(requiredStepNames).toContain('processing');
      expect(requiredStepNames).toContain('analysis');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing session gracefully', async () => {
      mockEnhancedSessionManager.getInstance().getEnhancedSession.mockResolvedValue(null);

      await expect(navigationManager.getNavigationContext('nonexistent-session'))
        .rejects.toThrow('Session not found');
    });

    it('should handle route manager errors gracefully', () => {
      mockRouteManager.generateStateUrl.mockImplementation(() => {
        throw new Error('Route generation failed');
      });

      expect(() => {
        navigationManager.generateStateUrl('test-session', 'analysis');
      }).toThrow('Route generation failed');
    });

    it('should handle pushState errors gracefully', () => {
      mockPushState.mockImplementation(() => {
        throw new Error('History API not available');
      });

      const navigationState: NavigationState = {
        sessionId: 'test-session',
        step: 'analysis' as CVStep,
        substep: null,
        timestamp: new Date(),
        parameters: {}
      };

      expect(() => {
        navigationManager.pushStateToHistory(navigationState);
      }).not.toThrow();
    });
  });

  describe('Performance Optimization', () => {
    it('should handle large navigation history efficiently', () => {
      // Add many navigation states
      for (let i = 0; i < 100; i++) {
        const state: NavigationState = {
          sessionId: 'test-session',
          step: 'analysis' as CVStep,
          substep: `substep-${i}`,
          timestamp: new Date(),
          parameters: { iteration: i }
        };

        navigationManager.pushStateToHistory(state);
      }

      // Should still handle back navigation quickly
      const startTime = Date.now();
      const backState = navigationManager.handleBackNavigation();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // Less than 10ms
      expect(backState).toBeDefined();
    });
  });
});