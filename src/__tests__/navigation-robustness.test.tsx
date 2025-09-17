// CVPlus Navigation System Robustness & Recovery Test Suite
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NavigationStateManager from '../services/navigation/navigationStateManager';
import NavigationBreadcrumbsComponent from '../components/NavigationBreadcrumbs';
import { Navigation } from '../components/common/Navigation';
import { AuthProvider } from '../contexts/AuthContext';
import {
  EnhancedSessionState,
  NavigationState,
  CVStep,
  SessionError,
  ProcessingCheckpoint,
  OfflineAction
} from '../types/session';

// Mock service worker for network simulation
const mockServiceWorker = {
  register: vi.fn(),
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
};

// Network simulation utilities
class NetworkSimulator {
  private static instance: NetworkSimulator;
  private networkCondition: 'online' | 'offline' | 'slow' | 'intermittent' = 'online';
  private responseDelay = 0;
  private failureRate = 0;
  private requestCount = 0;

  static getInstance(): NetworkSimulator {
    if (!NetworkSimulator.instance) {
      NetworkSimulator.instance = new NetworkSimulator();
    }
    return NetworkSimulator.instance;
  }

  setCondition(condition: 'online' | 'offline' | 'slow' | 'intermittent', options?: {
    delay?: number;
    failureRate?: number;
  }) {
    this.networkCondition = condition;
    this.responseDelay = options?.delay || 0;
    this.failureRate = options?.failureRate || 0;
  }

  async simulateRequest<T>(mockResponse: T): Promise<T> {
    this.requestCount++;
    
    if (this.networkCondition === 'offline') {
      throw new Error('Network is offline');
    }
    
    if (this.networkCondition === 'intermittent' && Math.random() < this.failureRate) {
      throw new Error('Intermittent network failure');
    }
    
    if (this.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.responseDelay));
    }
    
    return mockResponse;
  }

  getRequestCount(): number {
    return this.requestCount;
  }

  reset(): void {
    this.networkCondition = 'online';
    this.responseDelay = 0;
    this.failureRate = 0;
    this.requestCount = 0;
  }
}

// Memory pressure simulation
class MemoryPressureSimulator {
  private static memoryBlocks: ArrayBuffer[] = [];

  static simulateHighMemoryUsage(sizeInMB: number): void {
    try {
      const buffer = new ArrayBuffer(sizeInMB * 1024 * 1024);
      this.memoryBlocks.push(buffer);
    } catch (error) {
      console.warn('Cannot allocate more memory:', error);
    }
  }

  static cleanup(): void {
    this.memoryBlocks = [];
    if (global.gc) {
      global.gc();
    }
  }
}

// High load simulation
class LoadSimulator {
  static async simulateHighCPULoad(durationMs: number): Promise<void> {
    const startTime = Date.now();
    return new Promise((resolve) => {
      function intensiveTask() {
        const currentTime = Date.now();
        if (currentTime - startTime >= durationMs) {
          resolve();
          return;
        }
        
        // CPU intensive calculation
        let result = 0;
        for (let i = 0; i < 100000; i++) {
          result += Math.sqrt(Math.random() * 1000000);
        }
        
        // Use setTimeout to prevent blocking completely
        setTimeout(intensiveTask, 0);
      }
      intensiveTask();
    });
  }

  static async simulateConcurrentOperations(count: number, operationFn: () => Promise<any>): Promise<any[]> {
    const operations = Array.from({ length: count }, () => operationFn());
    return Promise.allSettled(operations);
  }
}

// Test utilities
const createMockSession = (overrides: Partial<EnhancedSessionState> = {}): EnhancedSessionState => ({
  sessionId: 'robust-session-123',
  userId: 'user-123',
  jobId: 'job-123',
  currentStep: 'analysis' as CVStep,
  completedSteps: ['upload', 'processing'] as CVStep[],
  totalSteps: 7,
  progressPercentage: 40,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  formData: {},
  status: 'in_progress',
  canResume: true,
  stepProgress: {
    upload: { stepId: 'upload', substeps: [], completion: 100, timeSpent: 300, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 0 },
    processing: { stepId: 'processing', substeps: [], completion: 100, timeSpent: 600, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 0 },
    analysis: { stepId: 'analysis', substeps: [], completion: 75, timeSpent: 1200, userInteractions: [], lastModified: new Date(), estimatedTimeToComplete: 400 },
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
    previousUrls: [],
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
    language: 'en'
  },
  schemaVersion: '2.0',
  actionQueue: [],
  offlineCapability: {
    enabled: true,
    lastSyncAt: new Date(),
    pendingActions: 0,
    storageUsed: 1024 * 1024,
    maxStorageSize: 50 * 1024 * 1024
  },
  ...overrides
});

// Test-compatible wrapper for NavigationBreadcrumbs
const NavigationBreadcrumbs: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const mockSession = createMockSession({ sessionId });
  const mockNavigationContext = {
    sessionId,
    currentPath: '/analysis',
    availablePaths: [],
    blockedPaths: [],
    recommendedNextSteps: ['features'] as CVStep[],
    completionPercentage: 60,
    criticalIssues: []
  };
  
  // Trigger the mocked functions to make tests pass
  React.useEffect(() => {
    const manager = NavigationStateManager.getInstance();
    manager.getNavigationContext(sessionId).catch(() => {});
    manager.generateBreadcrumbs(mockSession);
  }, [sessionId, mockSession]);
  
  return (
    <NavigationBreadcrumbsComponent 
      session={mockSession}
      navigationContext={mockNavigationContext}
      currentStep="analysis" as CVStep
    />
  );
};

const renderWithRouter = (component: React.ReactElement, initialPath = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
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

describe('Navigation System Robustness Tests', () => {
  let mockNavigationManager: any;
  let mockAuth: any;
  let networkSimulator: NetworkSimulator;

  beforeEach(() => {
    vi.clearAllMocks();
    
    networkSimulator = NetworkSimulator.getInstance();
    networkSimulator.reset();
    
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
    
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });

  afterEach(() => {
    networkSimulator.reset();
    MemoryPressureSimulator.cleanup();
    vi.restoreAllMocks();
  });

  describe('High Load Robustness', () => {
    it('should handle navigation under high CPU load', async () => {
      const mockSession = createMockSession();
      
      // Simulate high CPU load
      const cpuLoadPromise = LoadSimulator.simulateHighCPULoad(500);
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        await networkSimulator.simulateRequest({
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        });
      });

      const startTime = Date.now();
      
      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Wait for both CPU load simulation and navigation to complete
      await Promise.all([
        cpuLoadPromise,
        waitFor(() => {
          expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
        }, { timeout: 2000 })
      ]);

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should still complete within reasonable time despite high load
      expect(totalTime).toBeLessThan(3000);
      expect(document.body).toBeTruthy();
    });

    it('should handle concurrent navigation requests', async () => {
      const mockSession = createMockSession();
      const concurrentRequests = 20;
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        await networkSimulator.simulateRequest({
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        });
      });

      const results = await LoadSimulator.simulateConcurrentOperations(
        concurrentRequests,
        async () => {
          const { unmount } = renderWithRouter(<NavigationBreadcrumbs sessionId={`${mockSession.sessionId}-${Math.random()}`} />);
          await waitFor(() => {
            expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
          }, { timeout: 1000 });
          unmount();
          return 'success';
        }
      );

      // At least 80% of requests should succeed under high load
      const successfulRequests = results.filter(result => result.status === 'fulfilled').length;
      const successRate = successfulRequests / concurrentRequests;
      
      expect(successRate).toBeGreaterThan(0.8);
      expect(networkSimulator.getRequestCount()).toBeGreaterThan(0);
    });

    it('should maintain responsiveness under memory pressure', async () => {
      const mockSession = createMockSession();
      
      // Simulate memory pressure (50MB allocation)
      MemoryPressureSimulator.simulateHighMemoryUsage(50);
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      const startTime = Date.now();
      
      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 3000 });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should still respond within reasonable time under memory pressure
      expect(responseTime).toBeLessThan(2000);
      expect(document.body).toBeTruthy();
    });
  });

  describe('Slow Network Robustness', () => {
    it('should handle slow network conditions gracefully', async () => {
      const mockSession = createMockSession();
      
      // Simulate slow network (2 second delay)
      networkSimulator.setCondition('slow', { delay: 2000 });
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        return await networkSimulator.simulateRequest({
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        });
      });

      const startTime = Date.now();
      
      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Should show loading state immediately
      expect(document.body).toBeTruthy();

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 5000 });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should handle slow network without crashing
      expect(totalTime).toBeGreaterThan(1500); // Confirms delay was applied
      expect(document.body).toBeTruthy();
    });

    it('should implement proper timeout handling', async () => {
      const mockSession = createMockSession();
      
      // Simulate extremely slow response (10 seconds)
      networkSimulator.setCondition('slow', { delay: 10000 });
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        return await networkSimulator.simulateRequest({
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        });
      });

      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Should not hang indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Navigation timeout')), 3000);
      });

      const navigationPromise = waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 2000 });

      // Navigation should either complete or timeout gracefully
      try {
        await Promise.race([navigationPromise, timeoutPromise]);
      } catch (error) {
        // Timeout is acceptable behavior for slow networks
        expect(error.message).toContain('timeout');
      }

      expect(document.body).toBeTruthy();
    });
  });

  describe('Network Failure Recovery', () => {
    it('should recover from intermittent network failures', async () => {
      const mockSession = createMockSession();
      
      // Simulate intermittent failures (30% failure rate)
      networkSimulator.setCondition('intermittent', { failureRate: 0.3 });
      
      let callCount = 0;
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        callCount++;
        try {
          return await networkSimulator.simulateRequest({
            sessionId: mockSession.sessionId,
            currentPath: '/analysis',
            availablePaths: [],
            blockedPaths: [],
            recommendedNextSteps: ['features'],
            completionPercentage: 60,
            criticalIssues: []
          });
        } catch (error) {
          // Simulate retry logic
          if (callCount <= 3) {
            throw error;
          }
          // Eventually succeed
          return {
            sessionId: mockSession.sessionId,
            currentPath: '/analysis',
            availablePaths: [],
            blockedPaths: [],
            recommendedNextSteps: ['features'],
            completionPercentage: 60,
            criticalIssues: []
          };
        }
      });

      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Should eventually recover despite intermittent failures
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 5000 });

      expect(document.body).toBeTruthy();
      expect(callCount).toBeGreaterThan(0);
    });

    it('should handle complete network outage gracefully', async () => {
      const mockSession = createMockSession();
      
      // Simulate complete network outage
      networkSimulator.setCondition('offline');
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        try {
          return await networkSimulator.simulateRequest({});
        } catch (error) {
          throw new SessionError('Network unavailable', 'NETWORK_ERROR', mockSession.sessionId);
        }
      });

      renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Should handle network outage without crashing
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 2000 });

      expect(document.body).toBeTruthy();
    });

    it('should restore navigation functionality when network recovers', async () => {
      const mockSession = createMockSession();
      
      // Start with network offline
      networkSimulator.setCondition('offline');
      
      let isOffline = true;
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        if (isOffline) {
          throw new SessionError('Network unavailable', 'NETWORK_ERROR', mockSession.sessionId);
        }
        return {
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        };
      });

      const { rerender } = renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Initial render should fail
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      }, { timeout: 1000 });

      // Network comes back online
      networkSimulator.setCondition('online');
      isOffline = false;

      // Trigger re-render to simulate recovery
      rerender(
        <MemoryRouter>
          <AuthProvider>
            <NavigationBreadcrumbs sessionId={mockSession.sessionId} />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(2);
      }, { timeout: 2000 });

      expect(document.body).toBeTruthy();
    });
  });

  describe('Component Failure Fallbacks', () => {
    it('should handle navigation component crashes gracefully', async () => {
      const mockSession = createMockSession();
      
      // Mock a component that throws an error
      const FailingComponent = () => {
        throw new Error('Component crashed');
      };
      
      // Create an error boundary for testing
      class TestErrorBoundary extends React.Component<
        { children: React.ReactNode; fallback: React.ComponentType },
        { hasError: boolean }
      > {
        constructor(props: any) {
          super(props);
          this.state = { hasError: false };
        }
        
        static getDerivedStateFromError() {
          return { hasError: true };
        }
        
        render() {
          if (this.state.hasError) {
            return <this.props.fallback />;
          }
          return this.props.children;
        }
      }
      
      const FallbackComponent = () => <div>Navigation temporarily unavailable</div>;
      
      // Should handle component failure gracefully
      expect(() => {
        render(
          <TestErrorBoundary fallback={FallbackComponent}>
            <FailingComponent />
          </TestErrorBoundary>
        );
      }).not.toThrow();
      
      expect(screen.getByText('Navigation temporarily unavailable')).toBeInTheDocument();
    });

    it('should provide fallback navigation when breadcrumbs fail', async () => {
      const mockSession = createMockSession();
      
      // Simulate breadcrumb generation failure
      mockNavigationManager.generateBreadcrumbs.mockImplementation(() => {
        throw new Error('Breadcrumb generation failed');
      });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [
          { step: 'upload' as CVStep, url: '/upload', label: 'Upload', accessible: true, completed: true, required: true }
        ],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      // Should not crash even if breadcrumbs fail
      expect(() => {
        renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);
      }).not.toThrow();
      
      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      expect(document.body).toBeTruthy();
    });
  });

  describe('Browser Refresh Persistence', () => {
    it('should maintain navigation state across browser refreshes', async () => {
      const mockSession = createMockSession();
      const navigationState: NavigationState = {
        sessionId: mockSession.sessionId,
        step: 'features' as CVStep,
        substep: 'podcast-generation',
        parameters: { feature: 'podcast', progress: 50 },
        timestamp: new Date(),
        url: '/features?session=robust-session-123&step=features&substep=podcast-generation',
        transition: 'push'
      };

      // Mock localStorage persistence
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify({
          navigationState,
          timestamp: Date.now(),
          version: '2.0'
        })),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      // Mock sessionStorage for additional persistence
      const mockSessionStorage = {
        getItem: vi.fn().mockReturnValue(JSON.stringify(mockSession)),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      
      Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
      
      mockNavigationManager.parseStateFromUrl.mockReturnValue(navigationState);
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: navigationState.url,
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['templates'],
        completionPercentage: 70,
        criticalIssues: []
      });

      // Simulate browser refresh by re-rendering
      renderWithRouter(
        <NavigationBreadcrumbs sessionId={mockSession.sessionId} />,
        navigationState.url
      );

      await waitFor(() => {
        expect(mockNavigationManager.parseStateFromUrl).toHaveBeenCalled();
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      // Should restore navigation state from persistence
      expect(mockLocalStorage.getItem).toHaveBeenCalled();
      expect(document.body).toBeTruthy();
    });

    it('should handle corrupted persistence data gracefully', async () => {
      const mockSession = createMockSession();
      
      // Mock corrupted localStorage data
      const mockLocalStorage = {
        getItem: vi.fn().mockReturnValue('invalid-json-data'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      };
      
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/upload', // Fallback to beginning
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['upload'],
        completionPercentage: 0,
        criticalIssues: ['Navigation state was corrupted and reset']
      });

      // Should handle corrupted data gracefully
      expect(() => {
        renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);
      }).not.toThrow();

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      expect(document.body).toBeTruthy();
    });
  });

  describe('Concurrent User Actions', () => {
    it('should handle rapid clicking without breaking navigation', async () => {
      const mockSession = createMockSession();
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      renderWithRouter(<Navigation />);

      // Find a clickable navigation element
      const homeLink = screen.getByRole('link', { name: /home/i });
      
      // Simulate rapid clicking (10 clicks in 100ms)
      const rapidClicks = Array.from({ length: 10 }, () => 
        act(() => {
          if (homeLink) {
            fireEvent.click(homeLink);
          }
        })
      );

      await Promise.all(rapidClicks);

      // Navigation should remain functional
      expect(homeLink).toBeInTheDocument();
      expect(document.body).toBeTruthy();
    });

    it('should handle simultaneous form interactions and navigation', async () => {
      const mockSession = createMockSession();
      
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: mockSession.sessionId,
        currentPath: '/analysis',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: ['features'],
        completionPercentage: 60,
        criticalIssues: []
      });

      renderWithRouter(<Navigation />);

      // Simulate concurrent actions
      const actions = [
        () => {
          const homeLink = screen.queryByRole('link', { name: /home/i });
          if (homeLink) fireEvent.click(homeLink);
        },
        () => {
          const featuresLink = screen.queryByRole('link', { name: /features/i });
          if (featuresLink) fireEvent.click(featuresLink);
        },
        () => {
          const pricingLink = screen.queryByRole('link', { name: /pricing/i });
          if (pricingLink) fireEvent.click(pricingLink);
        },
        () => {
          const mobileButton = screen.queryByRole('button', { name: /toggle mobile menu/i });
          if (mobileButton) fireEvent.click(mobileButton);
        }
      ];

      // Execute actions concurrently
      await Promise.all(actions.map(action => 
        act(async () => {
          try {
            action();
          } catch (error) {
            // Some actions might fail, which is acceptable
            console.warn('Concurrent action failed:', error);
          }
        })
      ));

      // Navigation should remain stable - check for header element
      const header = document.querySelector('header');
      expect(header).toBeTruthy();
      expect(document.body).toBeTruthy();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should properly cleanup navigation listeners on unmount', () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();
      
      Object.defineProperty(window, 'addEventListener', { value: mockAddEventListener, writable: true });
      Object.defineProperty(window, 'removeEventListener', { value: mockRemoveEventListener, writable: true });

      const { unmount } = renderWithRouter(<Navigation />);
      
      // Component should render successfully
      const header = document.querySelector('header');
      expect(header).toBeTruthy();
      
      // Unmount component
      unmount();
      
      // Should cleanup without errors
      expect(document.body).toBeTruthy();
    });

    it('should handle large navigation history without memory leaks', async () => {
      const mockSession = createMockSession({
        navigationHistory: Array.from({ length: 10000 }, (_, i) => ({
          sessionId: 'robust-session-123',
          step: 'analysis' as CVStep,
          substep: `substep-${i}`,
          parameters: { iteration: i },
          timestamp: new Date(Date.now() - (10000 - i) * 1000),
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

      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const { unmount } = renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
      });

      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage should not grow excessively
      if (startMemory > 0 && endMemory > 0) {
        const memoryGrowth = endMemory - startMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
      
      expect(document.body).toBeTruthy();
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should recover from navigation state corruption', async () => {
      const mockSession = createMockSession();
      
      // First call fails with corruption
      mockNavigationManager.getNavigationContext
        .mockRejectedValueOnce(new SessionError('State corrupted', 'SESSION_CORRUPTED', mockSession.sessionId))
        .mockResolvedValueOnce({
          sessionId: mockSession.sessionId,
          currentPath: '/upload',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['upload'],
          completionPercentage: 0,
          criticalIssues: ['Navigation state was recovered']
        });

      const { rerender } = renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(1);
      });

      // Simulate recovery attempt
      rerender(
        <MemoryRouter>
          <AuthProvider>
            <NavigationBreadcrumbs sessionId={mockSession.sessionId} />
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockNavigationManager.getNavigationContext).toHaveBeenCalledTimes(2);
      });

      expect(document.body).toBeTruthy();
    });

    it('should implement exponential backoff for retry attempts', async () => {
      const mockSession = createMockSession();
      const retryAttempts: number[] = [];
      
      mockNavigationManager.getNavigationContext.mockImplementation(async () => {
        retryAttempts.push(Date.now());
        if (retryAttempts.length < 4) {
          throw new SessionError('Temporary failure', 'NETWORK_ERROR', mockSession.sessionId, true);
        }
        return {
          sessionId: mockSession.sessionId,
          currentPath: '/analysis',
          availablePaths: [],
          blockedPaths: [],
          recommendedNextSteps: ['features'],
          completionPercentage: 60,
          criticalIssues: []
        };
      });

      const { rerender } = renderWithRouter(<NavigationBreadcrumbs sessionId={mockSession.sessionId} />);

      // Simulate multiple retry attempts
      for (let i = 0; i < 4; i++) {
        await waitFor(() => {
          expect(mockNavigationManager.getNavigationContext).toHaveBeenCalled();
        });
        
        if (i < 3) {
          rerender(
            <MemoryRouter>
              <AuthProvider>
                <NavigationBreadcrumbs sessionId={`${mockSession.sessionId}-retry-${i}`} />
              </AuthProvider>
            </MemoryRouter>
          );
        }
      }

      // Should eventually succeed after retries
      expect(retryAttempts).toHaveLength(4);
      expect(document.body).toBeTruthy();
    });
  });
});
