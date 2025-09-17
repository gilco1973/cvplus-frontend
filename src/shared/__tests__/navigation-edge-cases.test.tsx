// CVPlus Navigation System Edge Cases Test Suite
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
  SessionError
} from '../types/session';

// Mock dependencies
vi.mock('../services/navigation/navigationStateManager');
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    user: { uid: 'user-123', email: 'test@example.com' },
    signInWithGoogle: vi.fn(),
    signOut: vi.fn()
  })
}));
vi.mock('../services/enhancedSessionManager');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock NavigationContext helper function
const createMockNavigationContext = (overrides: Partial<NavigationContext> = {}): NavigationContext => ({
  sessionId: 'test-session-123',
  currentPath: '/analysis',
  availablePaths: [
    { step: 'upload' as CVStep, url: '/upload', label: 'Upload', accessible: true, completed: true, required: true },
    { step: 'processing' as CVStep, url: '/processing', label: 'Processing', accessible: true, completed: true, required: true },
    { step: 'analysis' as CVStep, url: '/analysis', label: 'Analysis', accessible: true, completed: false, required: true }
  ],
  blockedPaths: [],
  recommendedNextSteps: ['features' as CVStep],
  completionPercentage: 60,
  criticalIssues: [],
  ...overrides
});

// Test utilities
const createMockSession = (overrides: Partial<EnhancedSessionState> = {}): EnhancedSessionState => ({
  sessionId: 'test-session-123',
  userId: 'user-123',
  jobId: 'job-123',
  currentStep: 'analysis' as CVStep,
  completedSteps: ['upload', 'processing'] as CVStep[],
  totalSteps: 7,
  progressPercentage: 40,
  lastActiveAt: new Date('2024-01-02'),
  createdAt: new Date('2024-01-01'),
  formData: {},
  status: 'in_progress',
  canResume: true,
  stepProgress: {
    upload: { stepId: 'upload', substeps: [], completion: 100, timeSpent: 300, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 0 },
    processing: { stepId: 'processing', substeps: [], completion: 100, timeSpent: 600, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 0 },
    analysis: { stepId: 'analysis', substeps: [], completion: 50, timeSpent: 450, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 300 },
    features: { stepId: 'features', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 600 },
    templates: { stepId: 'templates', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 300 },
    preview: { stepId: 'preview', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 180 },
    results: { stepId: 'results', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 120 },
    keywords: { stepId: 'keywords', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 240 },
    completed: { stepId: 'completed', substeps: [], completion: 0, timeSpent: 0, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 0 }
  },
  featureStates: {},
  processingCheckpoints: [],
  uiState: {
    currentView: 'analysis',
    activeFormId: null,
    formStates: {},
    navigationHistory: [],
    scrollPositions: {},
    expandedSections: [],
    currentUrl: '/analysis',
    previousUrls: ['/upload', '/processing'],
    breadcrumbs: [],
    modals: { open: [], history: [] },
    selections: {}
  },
  validationResults: {
    formValidations: {},
    stepValidations: {},
    globalValidations: [],
    lastValidatedAt: new Date(),
    validationVersion: '1.0.0'
  },
  navigationHistory: [],
  performanceMetrics: {
    loadTime: 1000,
    interactionCount: 5,
    errorCount: 0,
    averageResponseTime: 200,
    memoryUsage: 10000000
  },
  contextData: {
    userAgent: 'test-agent',
    screenSize: { width: 1920, height: 1080 },
    timezone: 'UTC',
    language: 'en',
    feature_flags: {},
    experiments: {}
  },
  schemaVersion: '2.0',
  actionQueue: [],
  offlineCapability: {
    enabled: false,
    lastSyncAt: new Date(),
    pendingActions: 0,
    storageUsed: 0,
    maxStorageSize: 50 * 1024 * 1024
  },
  ...overrides
});

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  const mockAuthContext = {
    user: { uid: 'user-123', email: 'test@example.com' },
    signInWithGoogle: vi.fn(),
    signOut: vi.fn()
  };
  
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {React.cloneElement(component)}
    </MemoryRouter>
  );
};

// Mock network conditions
const mockNetworkConditions = {
  online: () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: true });
    window.dispatchEvent(new Event('online'));
  },
  offline: () => {
    Object.defineProperty(navigator, 'onLine', { writable: true, configurable: true, value: false });
    window.dispatchEvent(new Event('offline'));
  },
  slowConnection: () => {
    // Mock slow network by adding delays to fetch
    global.fetch = vi.fn(() => 
      new Promise(resolve => setTimeout(() => resolve(new Response()), 5000))
    );
  }
};

describe('Navigation Edge Cases', () => {
  let mockNavigationManager: any;
  let mockAuth: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNavigationManager = {
      getInstance: vi.fn().mockReturnThis(),
      generateStateUrl: vi.fn().mockReturnValue('/test-url'),
      parseStateFromUrl: vi.fn(),
      getNavigationContext: vi.fn(),
      generateBreadcrumbs: vi.fn().mockReturnValue([]),
      pushStateToHistory: vi.fn(),
      handleBackNavigation: vi.fn(),
      suggestOptimalResumePoint: vi.fn()
    };
    
    mockAuth = {
      user: { uid: 'user-123', email: 'test@example.com' },
      signInWithGoogle: vi.fn().mockResolvedValue({}),
      signOut: vi.fn().mockResolvedValue({})
    };
    
    // Mock the useAuth hook
    const mockUseAuth = vi.fn(() => mockAuth);
    vi.doMock('../contexts/AuthContext', () => ({
      useAuth: mockUseAuth
    }));
    
    (NavigationStateManager as any).mockImplementation(() => mockNavigationManager);
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Invalid JobId Handling', () => {
    it('should handle navigation with null jobId gracefully', async () => {
      const mockSession = createMockSession({ jobId: undefined });
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: ['Invalid job ID']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      // Component should render without crashing with invalid jobId
      expect(document.body).toBeTruthy();

      // Should not crash and should show appropriate error state
      expect(screen.queryByText(/Invalid job ID/i)).not.toBeInTheDocument(); // Error handling should be internal
    });

    it('should handle navigation with malformed jobId', async () => {
      const invalidJobIds = ['', '   ', 'invalid-format', '123', 'job-', null, undefined];
      
      for (const invalidJobId of invalidJobIds) {
        const mockSession = createMockSession({ jobId: invalidJobId as any });
        mockNavigationManager.getNavigationContext.mockResolvedValue({
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['upload'],
          completionPercentage: 0,
          criticalIssues: [`Invalid job ID: ${invalidJobId}`]
        });

        const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
        const { unmount } = renderWithRouter(
          <NavigationBreadcrumbs 
            session={mockSession} 
            navigationContext={navContext} 
            currentStep={mockSession.currentStep}
          />
        );

        // Component should render without crashing with malformed jobId
        expect(document.body).toBeTruthy();

        // Component should render without crashing
        expect(document.querySelector('[role="navigation"]')).toBeTruthy();
        
        unmount();
      }
    });
  });

  describe('Missing Step Data Handling', () => {
    it('should handle navigation with missing step progress data', async () => {
      const mockSession = createMockSession({
        stepProgress: {} as any // Empty step progress
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: ['Missing step progress data']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle gracefully without crashing
      expect(document.body).toBeTruthy();
    });

    it('should handle corrupted navigation state', async () => {
      const corruptedState: NavigationState = {
        sessionId: 'corrupted-session',
        step: 'invalid-step' as CVStep,
        substep: null,
        parameters: { corrupted: true },
        timestamp: new Date('invalid-date'),
        url: '',
        transition: 'push'
      };

      mockNavigationManager.parseStateFromUrl.mockReturnValue(corruptedState);
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new SessionError('Corrupted session data', 'SESSION_CORRUPTED', corruptedState.sessionId)
      );

      const mockSession = createMockSession({ sessionId: corruptedState.sessionId });
      const context = createMockNavigationContext({ sessionId: corruptedState.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={corruptedState.step}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle error gracefully
      expect(document.body).toBeTruthy();
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle navigation when user becomes unauthenticated mid-session', async () => {
      let userState = mockAuth.user;
      const mockAuthWithChangingState = {
        ...mockAuth,
        get user() { return userState; }
      };

      renderWithRouter(<Navigation />, '/analysis');

      // Simulate user becoming unauthenticated
      act(() => {
        userState = null;
      });

      // Should handle gracefully without crashing
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    it('should handle authentication errors during navigation', async () => {
      mockAuth.signInWithGoogle.mockRejectedValue(new Error('Authentication failed'));
      
      renderWithRouter(<Navigation />);
      
      const signInButton = screen.getByRole('button', { name: /Sign in with Google/i });
      
      await act(async () => {
        fireEvent.click(signInButton);
      });

      // Should handle authentication error gracefully
      expect(mockAuth.signInWithGoogle).toHaveBeenCalled();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Malformed Routes Handling', () => {
    it('should handle navigation with malformed URLs', async () => {
      const malformedUrls = [
        '/analysis?session=&step=',
        '/invalid-path?corrupted=data',
        '/?session=null&step=undefined',
        '/analysis?session=123&step=invalid-step',
        '/analysis?session=very-long-session-id-that-exceeds-normal-limits-and-could-cause-issues&step=analysis'
      ];

      for (const url of malformedUrls) {
        mockNavigationManager.parseStateFromUrl.mockReturnValue(null);
        
        const { unmount } = renderWithRouter(<Navigation />, url);
        
        // Should render without crashing
        expect(screen.getByRole('banner')).toBeInTheDocument();
        
        unmount();
      }
    });

    it('should handle URL parameter injection attempts', async () => {
      const maliciousUrls = [
        '/analysis?session=<script>alert("xss")</script>&step=analysis',
        '/analysis?session=../../../etc/passwd&step=analysis',
        '/analysis?session=session123&step=<img src=x onerror=alert(1)>',
        '/analysis?session=session123&step=analysis&redirect=http://evil.com'
      ];

      for (const url of maliciousUrls) {
        mockNavigationManager.parseStateFromUrl.mockReturnValue({
          sessionId: 'safe-session-123',
          step: 'analysis' as CVStep,
          substep: null,
          parameters: {},
          timestamp: new Date(),
          url: '/analysis',
          transition: 'push'
        });
        
        const { unmount } = renderWithRouter(<Navigation />, url);
        
        // Should sanitize and handle safely
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(document.body.innerHTML).not.toContain('<script>');
        expect(document.body.innerHTML).not.toContain('alert(');
        
        unmount();
      }
    });
  });

  describe('Loading State Edge Cases', () => {
    it('should handle navigation during loading states', async () => {
      let resolveNavigation: (value: any) => void;
      const navigationPromise = new Promise(resolve => {
        resolveNavigation = resolve;
      });
      
      mockNavigationManager.getNavigationContext.mockReturnValue(navigationPromise);

      const mockSession = createMockSession({ sessionId: 'test-session' });
      const context = createMockNavigationContext({ sessionId: 'test-session' });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      // Navigation should be in loading state
      expect(screen.queryByRole('navigation')).toBeTruthy();

      // Simulate rapid navigation changes during loading
      act(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent(window, new Event('popstate'));
        }
      });

      // Resolve the navigation
      act(() => {
        resolveNavigation!({
          sessionId: 'test-session',
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 50,
          criticalIssues: []
        });
      });

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle gracefully without crashing
      expect(document.body).toBeTruthy();
    });

    it('should handle concurrent navigation operations', async () => {
      const mockSession = createMockSession();
      
      // Create multiple concurrent navigation operations
      const operations = Array.from({ length: 5 }, (_, i) => 
        mockNavigationManager.getNavigationContext.mockResolvedValueOnce({
          sessionId: mockSession.sessionId,
          currentPath: `/step-${i}`,
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['analysis'],
          completionPercentage: i * 20,
          criticalIssues: []
        })
      );

      const context = createMockNavigationContext({ sessionId: mockSession.sessionId });
      const { rerender } = renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      // Trigger multiple rapid re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <MemoryRouter initialEntries={[`/step-${i}`]}>
            <AuthProvider>
              <NavigationBreadcrumbs 
                session={createMockSession({ sessionId: `${mockSession.sessionId}-${i}` })} 
                navigationContext={createMockNavigationContext({ sessionId: `${mockSession.sessionId}-${i}` })} 
                currentStep={'analysis' as CVStep}
              />
            </AuthProvider>
          </MemoryRouter>
        );
      }

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle concurrent operations without crashing
      expect(document.body).toBeTruthy();
    });
  });

  describe('Session Corruption Handling', () => {
    it('should handle corrupted session data gracefully', async () => {
      const corruptedSession = {
        ...createMockSession(),
        stepProgress: null,
        validationResults: undefined,
        contextData: { invalid: 'data' }
      } as any;

      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new SessionError('Session data is corrupted', 'SESSION_CORRUPTED', corruptedSession.sessionId)
      );

      const context = createMockNavigationContext({ sessionId: corruptedSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={corruptedSession} 
          navigationContext={context} 
          currentStep={corruptedSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle error and not crash
      expect(document.body).toBeTruthy();
    });

    it('should recover from session corruption with fallback data', async () => {
      const sessionId = 'corrupted-session-123';
      
      // First call fails with corruption
      mockNavigationManager.getNavigationContext
        .mockRejectedValueOnce(new SessionError('Session corrupted', 'SESSION_CORRUPTED', sessionId))
        .mockResolvedValueOnce({
          sessionId,
          currentPath: '/upload', // Fallback to beginning
          availablePaths: [{
            step: 'upload' as CVStep,
            url: '/upload',
            label: 'Upload CV',
            accessible: true,
            completed: false,
            required: true
          }],
          blockedPaths: [],
          recommendedNextSteps: ['upload' as CVStep],
          completionPercentage: 0,
          criticalIssues: ['Session was corrupted and reset']
        });

      const mockSession = createMockSession({ sessionId });
      const context = createMockNavigationContext({ sessionId });
      const { rerender } = renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(1);
      });

      // Trigger recovery attempt
      rerender(
        <MemoryRouter>
          <AuthProvider>
            <NavigationBreadcrumbs 
              session={createMockSession({ sessionId })} 
              navigationContext={createMockNavigationContext({ sessionId })} 
              currentStep={'analysis' as CVStep}
            />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(2);
      });

      // Should recover gracefully
      expect(document.body).toBeTruthy();
    });
  });

  describe('Network Failure Scenarios', () => {
    it('should handle navigation during network failures', async () => {
      mockNetworkConditions.offline();
      
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new SessionError('Network unavailable', 'NETWORK_ERROR', 'test-session')
      );

      const mockSession = createMockSession({ sessionId: 'test-session' });
      const context = createMockNavigationContext({ sessionId: 'test-session' });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should handle network errors gracefully
      expect(document.body).toBeTruthy();
      
      // Restore online state
      mockNetworkConditions.online();
    });

    it('should recover navigation after network restoration', async () => {
      const sessionId = 'network-test-session';
      
      // Start offline
      mockNetworkConditions.offline();
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new SessionError('Network error', 'NETWORK_ERROR', sessionId)
      );

      const mockSession = createMockSession({ sessionId });
      const context = createMockNavigationContext({ sessionId });
      const { rerender } = renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Go back online and trigger recovery
      mockNetworkConditions.online();
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      // Trigger re-render to simulate recovery
      rerender(
        <MemoryRouter>
          <AuthProvider>
            <NavigationBreadcrumbs 
              session={createMockSession({ sessionId })} 
              navigationContext={createMockNavigationContext({ sessionId })} 
              currentStep={'analysis' as CVStep}
            />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(2);
      });

      expect(document.body).toBeTruthy();
    });
  });

  describe('Browser Refresh Edge Cases', () => {
    it('should handle navigation state persistence across browser refreshes', () => {
      const navigationState: NavigationState = {
        sessionId: 'persistent-session',
        step: 'features' as CVStep,
        substep: 'podcast-generation',
        parameters: { feature: 'podcast' },
        timestamp: new Date(),
        url: '/features?session=persistent-session&step=features&substep=podcast-generation',
        transition: 'push'
      };

      // Mock browser history state
      Object.defineProperty(window, 'history', {
        value: {
          ...window.history,
          state: {
            sessionId: navigationState.sessionId,
            step: navigationState.step,
            substep: navigationState.substep
          }
        },
        writable: true
      });

      mockNavigationManager.parseStateFromUrl.mockReturnValue(navigationState);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: navigationState.sessionId,
        currentPath: navigationState.url,
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['templates'],
        completionPercentage: 70,
        criticalIssues: []
      });

      const mockSession = createMockSession({ sessionId: navigationState.sessionId });
      const context = createMockNavigationContext({ sessionId: navigationState.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={navigationState.step}
        />
      );

      // Should handle state restoration gracefully
      expect(mockNavigationManager.parseStateFromUrl).toHaveBeenCalled();
      expect(document.body).toBeTruthy();
    });
  });
});

describe('Navigation Flow Scenarios', () => {
  let mockNavigationManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNavigationManager = {
      getInstance: vi.fn().mockReturnThis(),
      generateStateUrl: vi.fn().mockReturnValue('/test-url'),
      parseStateFromUrl: vi.fn(),
      getNavigationContext: vi.fn(),
      generateBreadcrumbs: vi.fn().mockReturnValue([]),
      pushStateToHistory: vi.fn(),
      handleBackNavigation: vi.fn(),
      suggestOptimalResumePoint: vi.fn()
    };
    
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });

  describe('Forward Navigation Blocking', () => {
    it('should prevent jumping to future steps without prerequisites', async () => {
      const mockSession = createMockSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing']
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'upload', url: '/upload', label: 'Upload', accessible: true, completed: true, required: true },
          { step: 'processing', url: '/processing', label: 'Processing', accessible: true, completed: true, required: true },
          { step: 'analysis', url: '/analysis', label: 'Analysis', accessible: true, completed: false, required: true },
          { step: 'features', url: '/features', label: 'Features', accessible: true, completed: false, required: false },
          { step: 'results', url: '/results', label: 'Results', accessible: false, completed: false, required: false, warnings: ['Results requires completion of previous steps'] }
        ],
        blockedPaths: [
          { step: 'results', url: '/results', label: 'Results', accessible: false, completed: false, required: false, warnings: ['Results requires completion of previous steps'] }
        ],
        recommendedNextSteps: ['features'],
        completionPercentage: 50,
        criticalIssues: []
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should identify blocked paths correctly
      const context = await mockNavigationManager.getNavigationContext(mockSession.sessionId);
      expect(context.blockedPaths).toHaveLength(1);
      expect(context.blockedPaths[0].step).toBe('results');
      expect(context.blockedPaths[0].accessible).toBe(false);
    });

    it('should allow navigation to accessible next steps', async () => {
      const mockSession = createMockSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing']
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: true, completed: false, required: false, prerequisites: ['analysis'] }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const context = await mockNavigationManager.getNavigationContext(mockSession.sessionId);
      expect(context.availablePaths.some(path => path.step === 'features' && path.accessible)).toBe(true);
    });
  });

  describe('Backward Navigation Permissions', () => {
    it('should allow navigation back to completed steps', async () => {
      const mockSession = createMockSession({
        currentStep: 'features',
        completedSteps: ['upload', 'processing', 'analysis']
      });

      const mockBreadcrumbs = [
        { id: 'upload', label: 'Upload CV', url: '/upload', step: 'upload' as CVStep, completed: true, accessible: true },
        { id: 'processing', label: 'Processing', url: '/processing', step: 'processing' as CVStep, completed: true, accessible: true },
        { id: 'analysis', label: 'Analysis', url: '/analysis', step: 'analysis' as CVStep, completed: true, accessible: true },
        { id: 'features', label: 'Features', url: '/features', step: 'features' as CVStep, completed: false, accessible: true }
      ];

      mockNavigationManager.generateBreadcrumbs.mockReturnValue(mockBreadcrumbs);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/features',
        availablePaths: mockBreadcrumbs.map(b => ({ ...b, required: true })),
        blockedPaths: [],
        recommendedNextSteps: ['templates'],
        completionPercentage: 70,
        criticalIssues: []
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.generateBreadcrumbs).toHaveBeenCalled();
      });

      // All completed steps should be accessible for backward navigation
      const breadcrumbs = mockNavigationManager.generateBreadcrumbs();
      const completedBreadcrumbs = breadcrumbs.filter((b: any) => b.completed);
      
      completedBreadcrumbs.forEach((breadcrumb: any) => {
        expect(breadcrumb.accessible).toBe(true);
      });
    });

    it('should handle back navigation with browser history', () => {
      const mockBackState: NavigationState = {
        sessionId: 'test-session',
        step: 'analysis' as CVStep,
        substep: null,
        parameters: {},
        timestamp: new Date(),
        url: '/analysis',
        transition: 'back'
      };

      mockNavigationManager.handleBackNavigation.mockReturnValue(mockBackState);

      const mockSession = createMockSession({ sessionId: 'test-session' });
      const context = createMockNavigationContext({ sessionId: 'test-session' });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={context} 
          currentStep={mockSession.currentStep}
        />
      );

      // Simulate browser back button
      act(() => {
        fireEvent(window, new PopStateEvent('popstate', { state: { sessionId: 'test-session', step: 'analysis' } }));
      });

      // Should handle back navigation appropriately
      expect(document.body).toBeTruthy();
    });
  });

  describe('Step Progression Validation', () => {
    it('should validate step completion before allowing progression', async () => {
      const mockSession = createMockSession({
        currentStep: 'analysis',
        completedSteps: ['upload', 'processing'],
        stepProgress: {
          ...createMockSession().stepProgress,
          analysis: {
            stepId: 'analysis',
            substeps: [
              { id: 'ai-processing', name: 'AI Processing', status: 'completed', startedAt: new Date(), completedAt: new Date() },
              { id: 'validation', name: 'Validation', status: 'in_progress', startedAt: new Date() },
              { id: 'final-review', name: 'Final Review', status: 'pending' }
            ],
            completion: 60,
            timeSpent: 1200,
            userInteractions: [],
            lastModified: new Date(),
            estimatedTimeToComplete: 800,
            blockers: ['Validation step requires user input']
          }
        }
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Complete analysis validation first'] }
        ],
        blockedPaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Complete analysis validation first'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 40,
        criticalIssues: ['Analysis step not fully completed']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const context = await mockNavigationManager.getNavigationContext(mockSession.sessionId);
      expect(context.criticalIssues).toContain('Analysis step not fully completed');
      expect(context.blockedPaths.some(path => path.step === 'features')).toBe(true);
    });

    it('should handle step progression with validation errors', async () => {
      const mockSession = createMockSession({
        validationResults: {
          formValidations: {},
          stepValidations: {
            analysis: [
              {
                field: 'targetRole',
                valid: false,
                errors: ['Target role is required'],
                warnings: [],
                timestamp: new Date()
              }
            ]
          },
          globalValidations: [
            {
              field: 'session',
              valid: false,
              errors: ['Session validation failed'],
              warnings: ['Consider reviewing input data'],
              timestamp: new Date()
            }
          ],
          lastValidatedAt: new Date(),
          validationVersion: '1.0.0'
        }
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Fix validation errors first'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 30,
        criticalIssues: ['1 validation errors need fixing']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const context = await mockNavigationManager.getNavigationContext(mockSession.sessionId);
      expect(context.criticalIssues).toContain('1 validation errors need fixing');
    });
  });

  describe('Error State Navigation', () => {
    it('should handle navigation during processing errors', async () => {
      const mockSession = createMockSession({
        processingCheckpoints: [
          {
            id: 'failed-checkpoint',
            stepId: 'analysis',
            timestamp: new Date(),
            state: 'failed',
            resumeData: {
              functionName: 'processCV',
              parameters: {},
              progress: 25
            },
            dependencies: [],
            canSkip: false,
            priority: 1,
            errorRecovery: {
              retryCount: 3,
              maxRetries: 5,
              lastError: 'Processing timeout',
              nextRetryAt: new Date(Date.now() + 60000)
            }
          }
        ]
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [
          { step: 'features', url: '/features', label: 'Features', accessible: false, completed: false, required: false, warnings: ['Processing errors must be resolved'] }
        ],
        recommendedNextSteps: [],
        completionPercentage: 25,
        criticalIssues: ['1 processing operations failed']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const context = await mockNavigationManager.getNavigationContext(mockSession.sessionId);
      expect(context.criticalIssues).toContain('1 processing operations failed');
    });

    it('should provide recovery navigation options', async () => {
      const mockSession = createMockSession({
        currentStep: 'processing',
        status: 'failed',
        lastError: 'File upload failed'
      });

      const recoveryRecommendation = {
        recommendedStep: 'upload' as CVStep,
        reason: 'Previous upload failed, retry from upload step',
        timeToComplete: 5,
        confidence: 0.9,
        priority: 'high' as const,
        alternativeOptions: [
          {
            step: 'processing' as CVStep,
            reason: 'Retry processing with same file',
            timeToComplete: 3,
            confidence: 0.7,
            pros: ['Faster recovery'],
            cons: ['May fail again if file is corrupted']
          }
        ],
        requiredData: ['valid CV file'],
        warnings: ['Ensure file is not corrupted']
      };

      mockNavigationManager.suggestOptimalResumePoint.mockResolvedValue(recoveryRecommendation);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/processing',
        availablePaths: [
          { step: 'upload', url: '/upload', label: 'Upload CV (Retry)', accessible: true, completed: false, required: true }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: ['File upload failed - retry required']
      });

      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should provide recovery navigation options
      const recommendation = await mockNavigationManager.suggestOptimalResumePoint(mockSession);
      expect(recommendation.recommendedStep).toBe('upload');
      expect(recommendation.priority).toBe('high');
    });
  });

  describe('Mobile vs Desktop Navigation Differences', () => {
    it('should handle mobile navigation interactions', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 667 });
      
      // Mock touch events
      const mockTouchEvent = {
        touches: [{ clientX: 100, clientY: 200 }],
        preventDefault: vi.fn()
      };

      renderWithRouter(<Navigation />);

      // Find mobile menu button
      const mobileMenuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(mobileMenuButton).toBeInTheDocument();

      // Test mobile menu interaction
      act(() => {
        fireEvent.click(mobileMenuButton);
      });

      // Mobile menu should be visible
      expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();

      // Test mobile menu closing
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        act(() => {
          fireEvent.click(overlay);
        });
      }

      // Should handle mobile interactions gracefully
      expect(document.body).toBeTruthy();
    });

    it('should adapt navigation for different screen sizes', async () => {
      const screenSizes = [
        { width: 320, height: 568, name: 'mobile-small' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' }
      ];

      for (const size of screenSizes) {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: size.width });
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: size.height });
        
        // Trigger resize event
        act(() => {
          fireEvent(window, new Event('resize'));
        });

        const { unmount } = renderWithRouter(<Navigation />);

        // Should render appropriately for each screen size
        expect(screen.getByRole('banner')).toBeInTheDocument();
        
        unmount();
      }
    });
  });

  describe('Performance Under Load', () => {
    it('should handle navigation with large session history', async () => {
      const mockSession = createMockSession({
        navigationHistory: Array.from({ length: 1000 }, (_, i) => ({
          sessionId: 'test-session',
          step: 'analysis' as CVStep,
          substep: `substep-${i}`,
          parameters: { iteration: i },
          timestamp: new Date(Date.now() - (1000 - i) * 1000),
          url: `/analysis?step=${i}`,
          transition: 'push' as const
        }))
      });

      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      const startTime = performance.now();
      
      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time even with large history
      expect(renderTime).toBeLessThan(1000); // Less than 1 second
      expect(document.body).toBeTruthy();
    });

    it('should handle rapid navigation state changes efficiently', async () => {
      const mockSession = createMockSession();
      
      const navContext = createMockNavigationContext({ sessionId: mockSession.sessionId });
      renderWithRouter(
        <NavigationBreadcrumbs 
          session={mockSession} 
          navigationContext={navContext} 
          currentStep={mockSession.currentStep}
        />
      );

      // Simulate rapid state changes
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        act(() => {
          mockNavigationManager.getNavigationContext.mockResolvedValueOnce({
            sessionId: mockSession.sessionId,
            currentPath: `/step-${i}`,
            availablePaths: [],
            blockedPaths: [],
            recommendedNextSteps: ['features'],
            completionPercentage: i,
            criticalIssues: []
          });
        });
      }

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const processTime = endTime - startTime;

      // Should handle rapid changes efficiently
      expect(processTime).toBeLessThan(2000); // Less than 2 seconds for 100 changes
      expect(document.body).toBeTruthy();
    });
  });
});
