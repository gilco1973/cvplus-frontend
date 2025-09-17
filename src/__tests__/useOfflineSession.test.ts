// useOfflineSession Hook Test Suite
import { renderHook, act } from '@testing-library/react';
import { useOfflineSession, useOfflineIndicator } from '../hooks/useOfflineSession';
import OfflineSessionManager from '../services/offlineSessionManager';

// Mock OfflineSessionManager
jest.mock('../services/offlineSessionManager');

const mockOfflineSessionManager = {
  getInstance: jest.fn(),
  isOfflineCapable: jest.fn().mockReturnValue(true),
  getSyncStatus: jest.fn().mockReturnValue('online'),
  enableOfflineMode: jest.fn().mockResolvedValue(true),
  disableOfflineMode: jest.fn().mockResolvedValue(true),
  queueAction: jest.fn().mockReturnValue('action-id-123'),
  syncPendingActions: jest.fn().mockResolvedValue(),
  clearActionQueue: jest.fn(),
  getPendingActions: jest.fn().mockReturnValue([]),
  getOfflineSession: jest.fn().mockResolvedValue(null)
};

(OfflineSessionManager.getInstance as jest.Mock).mockReturnValue(mockOfflineSessionManager);

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
});

// Mock window event listeners
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockDispatchEvent = jest.fn();

Object.defineProperty(global.window, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
});

Object.defineProperty(global.window, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
});

Object.defineProperty(global.window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true
});

describe('useOfflineSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    
    // Reset mock implementations
    mockOfflineSessionManager.getSyncStatus.mockReturnValue('online');
    mockOfflineSessionManager.getPendingActions.mockReturnValue([]);
  });

  describe('Initialization', () => {
    it('should initialize with correct online status', () => {
      const { result } = renderHook(() => useOfflineSession());

      expect(result.current.isOffline).toBe(false);
      expect(result.current.syncStatus).toBe('online');
      expect(result.current.offlineCapable).toBe(true);
    });

    it('should initialize with offline status when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const { result } = renderHook(() => useOfflineSession());

      expect(result.current.isOffline).toBe(true);
      expect(result.current.syncStatus).toBe('offline');
    });

    it('should set up event listeners on mount', () => {
      renderHook(() => useOfflineSession());

      expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('connectivityChange', expect.any(Function));
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useOfflineSession());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('connectivityChange', expect.any(Function));
    });
  });

  describe('Connectivity State Management', () => {
    it('should update state when going online', async () => {
      const { result } = renderHook(() => useOfflineSession());

      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      
      // Get the online event handler
      const onlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'online'
      )?.[1];

      expect(onlineHandler).toBeDefined();

      // Simulate going online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
        onlineHandler?.();
      });

      expect(result.current.isOffline).toBe(false);
      expect(result.current.syncStatus).toBe('online');
    });

    it('should update state when going offline', async () => {
      const { result } = renderHook(() => useOfflineSession());

      // Get the offline event handler
      const offlineHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'offline'
      )?.[1];

      expect(offlineHandler).toBeDefined();

      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
        offlineHandler?.();
      });

      expect(result.current.isOffline).toBe(true);
      expect(result.current.syncStatus).toBe('offline');
    });

    it('should handle connectivity change events', () => {
      const { result } = renderHook(() => useOfflineSession());

      // Get the connectivity change handler
      const connectivityHandler = mockAddEventListener.mock.calls.find(
        call => call[0] === 'connectivityChange'
      )?.[1];

      expect(connectivityHandler).toBeDefined();

      // Simulate connectivity change event
      const mockEvent = {
        detail: { status: 'syncing', pendingActions: 2 }
      };

      act(() => {
        connectivityHandler?.(mockEvent as any);
      });

      expect(result.current.syncStatus).toBe('syncing');
    });
  });

  describe('Offline Mode Management', () => {
    it('should enable offline mode successfully', async () => {
      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        const success = await result.current.enableOffline('test-session');
        expect(success).toBe(true);
      });

      expect(mockOfflineSessionManager.enableOfflineMode).toHaveBeenCalledWith('test-session');
    });

    it('should disable offline mode successfully', async () => {
      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        const success = await result.current.disableOffline('test-session');
        expect(success).toBe(true);
      });

      expect(mockOfflineSessionManager.disableOfflineMode).toHaveBeenCalledWith('test-session');
    });

    it('should update pending actions after enabling offline mode', async () => {
      mockOfflineSessionManager.getPendingActions.mockReturnValue([
        { id: 'action-1', type: 'session_update' },
        { id: 'action-2', type: 'form_save' }
      ]);

      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        await result.current.enableOffline('test-session');
      });

      expect(result.current.pendingActions).toHaveLength(2);
    });
  });

  describe('Action Queue Management', () => {
    it('should queue actions and update pending actions', () => {
      const { result } = renderHook(() => useOfflineSession());

      const testAction = {
        sessionId: 'test-session',
        type: 'session_update' as const,
        payload: { currentStep: 'features' },
        priority: 'normal' as const
      };

      act(() => {
        const actionId = result.current.queueAction(testAction);
        expect(actionId).toBe('action-id-123');
      });

      expect(mockOfflineSessionManager.queueAction).toHaveBeenCalledWith(testAction);
    });

    it('should sync pending actions', async () => {
      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        await result.current.syncNow();
      });

      expect(mockOfflineSessionManager.syncPendingActions).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      mockOfflineSessionManager.syncPendingActions.mockRejectedValueOnce(
        new Error('Sync failed')
      );

      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        await result.current.syncNow();
      });

      // Should set status to error temporarily
      expect(result.current.syncStatus).toBe('error');

      // Should reset status after timeout
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 3100));
      });

      expect(result.current.syncStatus).toBe('online');
    });

    it('should clear action queue', () => {
      const { result } = renderHook(() => useOfflineSession());

      act(() => {
        result.current.clearQueue();
      });

      expect(mockOfflineSessionManager.clearActionQueue).toHaveBeenCalled();
    });
  });

  describe('Session Retrieval', () => {
    it('should get offline session', async () => {
      const mockSession = {
        sessionId: 'test-session',
        currentStep: 'analysis',
        completedSteps: ['upload']
      };

      mockOfflineSessionManager.getOfflineSession.mockResolvedValue(mockSession);

      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        const session = await result.current.getOfflineSession('test-session');
        expect(session).toEqual(mockSession);
      });

      expect(mockOfflineSessionManager.getOfflineSession).toHaveBeenCalledWith('test-session');
    });

    it('should handle missing offline session', async () => {
      mockOfflineSessionManager.getOfflineSession.mockResolvedValue(null);

      const { result } = renderHook(() => useOfflineSession());

      await act(async () => {
        const session = await result.current.getOfflineSession('nonexistent-session');
        expect(session).toBeNull();
      });
    });
  });

  describe('Pending Actions Updates', () => {
    it('should update pending actions periodically', async () => {
      jest.useFakeTimers();

      mockOfflineSessionManager.getPendingActions
        .mockReturnValueOnce([])
        .mockReturnValueOnce([{ id: 'action-1', type: 'session_update' }]);

      const { result } = renderHook(() => useOfflineSession());

      // Initially no pending actions
      expect(result.current.pendingActions).toHaveLength(0);

      // Fast forward the periodic update timer
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.pendingActions).toHaveLength(1);

      jest.useRealTimers();
    });
  });
});

describe('useOfflineIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOfflineSessionManager.getPendingActions.mockReturnValue([]);
    mockOfflineSessionManager.getSyncStatus.mockReturnValue('online');
  });

  describe('Status Messages', () => {
    it('should return correct status message when online with no pending actions', () => {
      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Online');
      expect(result.current.statusColor).toBe('green');
    });

    it('should return correct status message when online with pending actions', () => {
      mockOfflineSessionManager.getPendingActions.mockReturnValue([
        { id: 'action-1', type: 'session_update' },
        { id: 'action-2', type: 'form_save' }
      ]);

      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('2 actions pending');
      expect(result.current.statusColor).toBe('yellow');
    });

    it('should return correct status message when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('offline');

      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Offline');
      expect(result.current.statusColor).toBe('orange');
    });

    it('should return correct status message when offline with queued actions', () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('offline');
      mockOfflineSessionManager.getPendingActions.mockReturnValue([
        { id: 'action-1', type: 'session_update' }
      ]);

      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Offline - 1 actions queued');
      expect(result.current.statusColor).toBe('orange');
    });

    it('should return correct status message when syncing', () => {
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('syncing');

      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Syncing...');
      expect(result.current.statusColor).toBe('blue');
    });

    it('should return correct status message when sync error occurs', () => {
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('error');

      const { result } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Sync error');
      expect(result.current.statusColor).toBe('red');
    });
  });

  describe('Status Colors', () => {
    it('should return green for online with no pending actions', () => {
      const { result } = renderHook(() => useOfflineIndicator());
      expect(result.current.statusColor).toBe('green');
    });

    it('should return yellow for online with pending actions', () => {
      mockOfflineSessionManager.getPendingActions.mockReturnValue([
        { id: 'action-1', type: 'session_update' }
      ]);

      const { result } = renderHook(() => useOfflineIndicator());
      expect(result.current.statusColor).toBe('yellow');
    });

    it('should return orange for offline status', () => {
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('offline');

      const { result } = renderHook(() => useOfflineIndicator());
      expect(result.current.statusColor).toBe('orange');
    });

    it('should return blue for syncing status', () => {
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('syncing');

      const { result } = renderHook(() => useOfflineIndicator());
      expect(result.current.statusColor).toBe('blue');
    });

    it('should return red for error status', () => {
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('error');

      const { result } = renderHook(() => useOfflineIndicator());
      expect(result.current.statusColor).toBe('red');
    });
  });

  describe('Status Updates', () => {
    it('should update status when connectivity changes', () => {
      const { result, rerender } = renderHook(() => useOfflineIndicator());

      expect(result.current.statusMessage).toBe('Online');

      // Change to offline
      mockOfflineSessionManager.getSyncStatus.mockReturnValue('offline');
      rerender();

      expect(result.current.statusMessage).toBe('Offline');
    });

    it('should update pending actions count', () => {
      const { result, rerender } = renderHook(() => useOfflineIndicator());

      expect(result.current.pendingActionsCount).toBe(0);

      // Add pending actions
      mockOfflineSessionManager.getPendingActions.mockReturnValue([
        { id: 'action-1', type: 'session_update' },
        { id: 'action-2', type: 'form_save' }
      ]);
      rerender();

      expect(result.current.pendingActionsCount).toBe(2);
    });
  });
});