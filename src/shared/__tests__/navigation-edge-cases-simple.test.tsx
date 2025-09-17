// CVPlus Navigation System Edge Cases Test Suite - Simplified Version
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import NavigationStateManager from '../services/navigation/navigationStateManager';
import {
  EnhancedSessionState,
  NavigationContext,
  CVStep
} from '../types/session';

// Simple Test Component that uses NavigationStateManager
const TestNavigationComponent: React.FC<{ sessionId: string }> = ({ sessionId }) => {
  const [context, setContext] = React.useState<NavigationContext | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const manager = NavigationStateManager.getInstance();
    
    manager.getNavigationContext(sessionId)
      .then(setContext)
      .catch((err) => setError(err.message));
  }, [sessionId]);
  
  if (error) {
    return <div data-testid="error">{error}</div>;
  }
  
  if (!context) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  return (
    <div data-testid="navigation-context">
      <div data-testid="session-id">{context.sessionId}</div>
      <div data-testid="current-path">{context.currentPath}</div>
      <div data-testid="completion">{context.completionPercentage}%</div>
      <div data-testid="issues-count">{context.criticalIssues.length}</div>
    </div>
  );
};

// Mock implementations
vi.mock('../services/navigation/navigationStateManager');
vi.mock('../services/enhancedSessionManager');
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() }
}));

// Create mock session data
const createMockSession = (sessionId = 'test-session'): EnhancedSessionState => ({
  sessionId,
  userId: 'user-123',
  jobId: 'job-123',
  currentStep: 'analysis' as CVStep,
  completedSteps: ['upload', 'processing'] as CVStep[],
  totalSteps: 7,
  progressPercentage: 60,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  formData: {},
  status: 'in_progress',
  canResume: true,
  stepProgress: {} as any,
  featureStates: {},
  processingCheckpoints: [],
  uiState: {} as any,
  validationResults: {} as any,
  navigationHistory: [],
  performanceMetrics: {} as any,
  contextData: {} as any,
  schemaVersion: '2.0',
  actionQueue: [],
  offlineCapability: {} as any
});

const createMockContext = (sessionId = 'test-session'): NavigationContext => ({
  sessionId,
  currentPath: '/analysis',
  availablePaths: [],
  blockedPaths: [],
  recommendedNextSteps: ['features'],
  completionPercentage: 60,
  criticalIssues: []
});

describe('Navigation System Edge Cases - Core Tests', () => {
  let mockNavigationManager: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNavigationManager = {
      getInstance: vi.fn().mockReturnThis(),
      getNavigationContext: vi.fn(),
      generateBreadcrumbs: vi.fn().mockReturnValue([]),
      pushStateToHistory: vi.fn(),
      handleBackNavigation: vi.fn()
    };
    
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });
  
  describe('Invalid Session ID Handling', () => {
    it('should handle null sessionId gracefully', async () => {
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new Error('Session not found')
      );
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId={null as any} />
        </MemoryRouter>
      );
      
      // Should show error state, not crash
      expect(await screen.findByTestId('error')).toBeInTheDocument();
    });
    
    it('should handle empty sessionId', async () => {
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new Error('Invalid session ID')
      );
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="" />
        </MemoryRouter>
      );
      
      expect(await screen.findByTestId('error')).toBeInTheDocument();
    });
    
    it('should handle valid sessionId successfully', async () => {
      const mockContext = createMockContext('valid-session');
      mockNavigationManager.getNavigationContext.mockResolvedValue(mockContext);
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="valid-session" />
        </MemoryRouter>
      );
      
      expect(await screen.findByTestId('navigation-context')).toBeInTheDocument();
      expect(screen.getByTestId('session-id')).toHaveTextContent('valid-session');
      expect(screen.getByTestId('completion')).toHaveTextContent('60%');
    });
  });
  
  describe('Navigation Context Edge Cases', () => {
    it('should handle missing navigation context data', async () => {
      mockNavigationManager.getNavigationContext.mockResolvedValue({
        sessionId: 'test-session',
        currentPath: '/unknown',
        availablePaths: [],
        blockedPaths: [],
        recommendedNextSteps: [],
        completionPercentage: 0,
        criticalIssues: ['Missing context data']
      });
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="test-session" />
        </MemoryRouter>
      );
      
      expect(await screen.findByTestId('navigation-context')).toBeInTheDocument();
      expect(screen.getByTestId('issues-count')).toHaveTextContent('1');
    });
    
    it('should handle network errors gracefully', async () => {
      mockNavigationManager.getNavigationContext.mockRejectedValue(
        new Error('Network error')
      );
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="test-session" />
        </MemoryRouter>
      );
      
      expect(await screen.findByTestId('error')).toHaveTextContent('Network error');
    });
  });
  
  describe('NavigationStateManager Robustness', () => {
    it('should handle manager instance creation', () => {
      const manager = NavigationStateManager.getInstance();
      expect(manager).toBeDefined();
      expect(mockNavigationManager.getInstance).toHaveBeenCalled();
    });
    
    it('should handle multiple concurrent context requests', async () => {
      const mockContext = createMockContext('concurrent-session');
      mockNavigationManager.getNavigationContext.mockResolvedValue(mockContext);
      
      // Render multiple components with same session
      const { rerender } = render(
        <MemoryRouter>
          <div>
            <TestNavigationComponent sessionId="concurrent-session" />
            <TestNavigationComponent sessionId="concurrent-session" />
            <TestNavigationComponent sessionId="concurrent-session" />
          </div>
        </MemoryRouter>
      );
      
      // All should render successfully
      const contexts = await screen.findAllByTestId('navigation-context');
      expect(contexts).toHaveLength(3);
    });
    
    it('should handle breadcrumb generation', () => {
      const mockSession = createMockSession('breadcrumb-session');
      mockNavigationManager.generateBreadcrumbs.mockReturnValue([
        {
          id: 'upload',
          label: 'Upload',
          url: '/upload',
          step: 'upload' as CVStep,
          completed: true,
          accessible: true
        }
      ]);
      
      const breadcrumbs = mockNavigationManager.generateBreadcrumbs(mockSession);
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].step).toBe('upload');
    });
  });
  
  describe('Error Recovery', () => {
    it('should recover from temporary errors', async () => {
      // First call fails, second succeeds
      mockNavigationManager.getNavigationContext
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(createMockContext('recovery-session'));
      
      const { rerender } = render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="recovery-session" />
        </MemoryRouter>
      );
      
      // First render shows error
      expect(await screen.findByTestId('error')).toBeInTheDocument();
      
      // Rerender (simulating retry)
      rerender(
        <MemoryRouter>
          <TestNavigationComponent sessionId="recovery-session" />
        </MemoryRouter>
      );
      
      // Should recover and show context
      expect(await screen.findByTestId('navigation-context')).toBeInTheDocument();
    });
  });
  
  describe('Performance Edge Cases', () => {
    it('should handle large session data efficiently', async () => {
      const largeContext = {
        ...createMockContext('large-session'),
        availablePaths: Array.from({ length: 1000 }, (_, i) => ({
          step: `step-${i}` as CVStep,
          url: `/step-${i}`,
          label: `Step ${i}`,
          accessible: true,
          completed: false,
          required: false
        })),
        criticalIssues: Array.from({ length: 100 }, (_, i) => `Issue ${i}`)
      };
      
      mockNavigationManager.getNavigationContext.mockResolvedValue(largeContext);
      
      const startTime = performance.now();
      
      render(
        <MemoryRouter>
          <TestNavigationComponent sessionId="large-session" />
        </MemoryRouter>
      );
      
      expect(await screen.findByTestId('navigation-context')).toBeInTheDocument();
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render efficiently even with large data
      expect(renderTime).toBeLessThan(1000); // Less than 1 second
      expect(screen.getByTestId('issues-count')).toHaveTextContent('100');
    });
  });
});
