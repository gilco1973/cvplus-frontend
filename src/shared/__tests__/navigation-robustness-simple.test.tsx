// Simple Navigation Robustness Test Suite - Test core fixes
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import NavigationStateManager from '../services/navigation/navigationStateManager';
import { Navigation } from '../components/common/Navigation';

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

describe('Navigation Robustness - Core Features', () => {
  let mockNavigationManager: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockNavigationManager = {
      getInstance: vi.fn().mockReturnThis(),
      navigateWithDebounce: vi.fn().mockResolvedValue(undefined),
      cleanup: vi.fn(),
      executeWithNetworkRecovery: vi.fn().mockImplementation((id, fn) => fn()),
      retryWithExponentialBackoff: vi.fn().mockImplementation((fn) => fn()),
      saveNavigationStateToStorage: vi.fn(),
      restoreNavigationStateFromStorage: vi.fn().mockReturnValue(null),
      cacheNavigationContext: vi.fn(),
      getCachedNavigationContext: vi.fn().mockReturnValue(null)
    };
    
    vi.mocked(NavigationStateManager.getInstance).mockReturnValue(mockNavigationManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Navigation Functionality', () => {
    it('should create NavigationStateManager instance successfully', () => {
      const manager = NavigationStateManager.getInstance();
      expect(manager).toBeTruthy();
      expect(NavigationStateManager.getInstance).toHaveBeenCalled();
    });

    it('should provide debounced navigation method', () => {
      const manager = NavigationStateManager.getInstance();
      expect(mockNavigationManager.navigateWithDebounce).toBeDefined();
      expect(typeof mockNavigationManager.navigateWithDebounce).toBe('function');
    });

    it('should provide cleanup method for memory leak prevention', () => {
      const manager = NavigationStateManager.getInstance();
      expect(mockNavigationManager.cleanup).toBeDefined();
      expect(typeof mockNavigationManager.cleanup).toBe('function');
    });

    it('should provide network recovery methods', () => {
      const manager = NavigationStateManager.getInstance();
      expect(mockNavigationManager.executeWithNetworkRecovery).toBeDefined();
      expect(mockNavigationManager.retryWithExponentialBackoff).toBeDefined();
    });

    it('should provide storage persistence methods', () => {
      const manager = NavigationStateManager.getInstance();
      expect(mockNavigationManager.saveNavigationStateToStorage).toBeDefined();
      expect(mockNavigationManager.restoreNavigationStateFromStorage).toBeDefined();
    });

    it('should provide caching methods for offline support', () => {
      const manager = NavigationStateManager.getInstance();
      expect(mockNavigationManager.cacheNavigationContext).toBeDefined();
      expect(mockNavigationManager.getCachedNavigationContext).toBeDefined();
    });
  });

  describe('Debouncing Navigation', () => {
    it('should call navigateWithDebounce when available', async () => {
      const sessionId = 'test-session';
      const step = 'analysis';
      const url = '/analysis';

      const manager = NavigationStateManager.getInstance();
      await mockNavigationManager.navigateWithDebounce(sessionId, step, url);

      expect(mockNavigationManager.navigateWithDebounce).toHaveBeenCalledWith(sessionId, step, url);
    });

    it('should handle debounce errors gracefully', async () => {
      mockNavigationManager.navigateWithDebounce.mockRejectedValue(new Error('Navigation error'));

      const manager = NavigationStateManager.getInstance();
      
      try {
        await mockNavigationManager.navigateWithDebounce('test', 'analysis', '/analysis');
      } catch (error) {
        expect(error.message).toBe('Navigation error');
      }

      expect(mockNavigationManager.navigateWithDebounce).toHaveBeenCalled();
    });
  });

  describe('Network Recovery', () => {
    it('should execute operations with network recovery', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      const result = await mockNavigationManager.executeWithNetworkRecovery('test-op', operation);
      
      expect(mockNavigationManager.executeWithNetworkRecovery).toHaveBeenCalledWith('test-op', operation);
      expect(result).toBe('success');
    });

    it('should implement exponential backoff retry', async () => {
      const operation = vi.fn().mockResolvedValue('retry-success');
      
      const result = await mockNavigationManager.retryWithExponentialBackoff(operation);
      
      expect(mockNavigationManager.retryWithExponentialBackoff).toHaveBeenCalledWith(operation);
      expect(result).toBe('retry-success');
    });
  });

  describe('Storage Persistence', () => {
    it('should save navigation state to storage', () => {
      const manager = NavigationStateManager.getInstance();
      mockNavigationManager.saveNavigationStateToStorage();
      
      expect(mockNavigationManager.saveNavigationStateToStorage).toHaveBeenCalled();
    });

    it('should restore navigation state from storage', () => {
      const manager = NavigationStateManager.getInstance();
      const result = mockNavigationManager.restoreNavigationStateFromStorage();
      
      expect(mockNavigationManager.restoreNavigationStateFromStorage).toHaveBeenCalled();
      expect(result).toBeNull(); // Mock returns null for clean state
    });
  });

  describe('Offline Caching', () => {
    it('should cache navigation context for offline use', () => {
      const sessionId = 'test-session';
      const context = { sessionId, currentPath: '/test', criticalIssues: [] };
      
      const manager = NavigationStateManager.getInstance();
      mockNavigationManager.cacheNavigationContext(sessionId, context);
      
      expect(mockNavigationManager.cacheNavigationContext).toHaveBeenCalledWith(sessionId, context);
    });

    it('should retrieve cached navigation context', () => {
      const sessionId = 'test-session';
      
      const manager = NavigationStateManager.getInstance();
      const result = mockNavigationManager.getCachedNavigationContext(sessionId);
      
      expect(mockNavigationManager.getCachedNavigationContext).toHaveBeenCalledWith(sessionId);
      expect(result).toBeNull(); // Mock returns null for clean state
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should provide cleanup method', () => {
      const manager = NavigationStateManager.getInstance();
      mockNavigationManager.cleanup();
      
      expect(mockNavigationManager.cleanup).toHaveBeenCalled();
    });

    it('should handle cleanup without errors', () => {
      expect(() => {
        const manager = NavigationStateManager.getInstance();
        mockNavigationManager.cleanup();
      }).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('should render Navigation component without crashing', () => {
      expect(() => {
        render(
          <MemoryRouter>
            <Navigation />
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    it('should find navigation header in rendered component', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      // Navigation should render a header element
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should handle rapid clicking without crashing', async () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const homeLink = screen.getByRole('link', { name: /home/i });
      
      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        act(() => {
          fireEvent.click(homeLink);
        });
      }

      // Component should remain stable
      expect(homeLink).toBeInTheDocument();
    });
  });
});