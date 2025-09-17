// Offline Session Manager Test Suite
import OfflineSessionManager from '../services/offlineSessionManager';
import {
  EnhancedSessionState,
  QueuedAction,
  SyncStatus
} from '../types/session';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

const mockIDBDatabase = {
  createObjectStore: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
  objectStoreNames: { contains: jest.fn() }
};

const mockIDBTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null
};

const mockIDBObjectStore = {
  get: jest.fn(),
  put: jest.fn(),
  add: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn()
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null
};

// Mock ServiceWorker
const mockServiceWorker = {
  register: jest.fn().mockResolvedValue({
    installing: null,
    waiting: null,
    active: { postMessage: jest.fn() },
    addEventListener: jest.fn()
  })
};

// Mock navigator
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
    onLine: true
  },
  writable: true
});

// Mock IndexedDB globally
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

// Mock window events
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  },
  writable: true
});

describe('OfflineSessionManager', () => {
  let offlineManager: OfflineSessionManager;
  let mockSession: EnhancedSessionState;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup IndexedDB mocks
    mockIndexedDB.open.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = mockIDBDatabase;
        if (request.onsuccess) request.onsuccess();
      }, 0);
      return request;
    });

    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
    mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
    mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);

    mockIDBObjectStore.get.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = null;
        if (request.onsuccess) request.onsuccess();
      }, 0);
      return request;
    });

    offlineManager = OfflineSessionManager.getInstance();

    mockSession = {
      sessionId: 'offline-test-session',
      currentStep: 'analysis',
      completedSteps: ['upload', 'processing'],
      createdAt: new Date('2024-01-01'),
      lastActiveAt: new Date('2024-01-02'),
      stepProgress: {},
      featureStates: {},
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
        globalValidations: [],
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
    } as EnhancedSessionState;
  });

  describe('Initialization', () => {
    it('should initialize with offline capabilities detection', () => {
      expect(offlineManager.isOfflineCapable()).toBe(true);
      expect(offlineManager.getSyncStatus()).toBe('online');
    });

    it('should setup service worker if supported', async () => {
      // The service worker setup happens in constructor
      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should initialize IndexedDB', () => {
      expect(mockIndexedDB.open).toHaveBeenCalledWith('cvplus-offline', 1);
    });
  });

  describe('Offline Mode Management', () => {
    beforeEach(() => {
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });
    });

    it('should enable offline mode successfully', async () => {
      const success = await offlineManager.enableOfflineMode('test-session');
      expect(success).toBe(true);
    });

    it('should cache session data when enabling offline mode', async () => {
      jest.spyOn(offlineManager, 'cacheSessionOffline').mockResolvedValue();
      
      await offlineManager.enableOfflineMode('test-session');
      expect(offlineManager.cacheSessionOffline).toHaveBeenCalled();
    });

    it('should disable offline mode and sync pending actions', async () => {
      jest.spyOn(offlineManager, 'syncPendingActions').mockResolvedValue();
      jest.spyOn(offlineManager, 'clearOfflineCache').mockResolvedValue();

      const success = await offlineManager.disableOfflineMode('test-session');
      
      expect(success).toBe(true);
      expect(offlineManager.syncPendingActions).toHaveBeenCalled();
      expect(offlineManager.clearOfflineCache).toHaveBeenCalledWith('test-session');
    });
  });

  describe('Action Queue Management', () => {
    it('should queue actions with proper metadata', () => {
      const action = {
        sessionId: 'test-session',
        type: 'session_update',
        payload: { currentStep: 'features' },
        priority: 'normal'
      } as const;

      const actionId = offlineManager.queueAction(action);

      expect(actionId).toBeDefined();
      expect(typeof actionId).toBe('string');

      const queuedActions = offlineManager.getPendingActions();
      expect(queuedActions).toHaveLength(1);
      expect(queuedActions[0].id).toBe(actionId);
      expect(queuedActions[0].attempts).toBe(0);
    });

    it('should prioritize actions correctly', () => {
      const lowPriorityAction = {
        sessionId: 'test-session',
        type: 'session_update',
        payload: { data: 'low' },
        priority: 'low'
      } as const;

      const highPriorityAction = {
        sessionId: 'test-session',
        type: 'session_update',
        payload: { data: 'high' },
        priority: 'high'
      } as const;

      offlineManager.queueAction(lowPriorityAction);
      offlineManager.queueAction(highPriorityAction);

      const queuedActions = offlineManager.getPendingActions();
      expect(queuedActions).toHaveLength(2);
    });

    it('should clear action queue', () => {
      offlineManager.queueAction({
        sessionId: 'test-session',
        type: 'session_update',
        payload: {},
        priority: 'normal'
      });

      expect(offlineManager.getPendingActions()).toHaveLength(1);

      offlineManager.clearActionQueue();
      expect(offlineManager.getPendingActions()).toHaveLength(0);
    });

    it('should handle action execution failures with retry logic', async () => {
      const failingAction: QueuedAction = {
        id: 'failing-action',
        sessionId: 'test-session',
        type: 'session_update',
        payload: {},
        priority: 'normal',
        timestamp: new Date(),
        attempts: 0,
        maxAttempts: 3,
        requiresNetwork: true
      };

      offlineManager.queueAction(failingAction);

      // Mock a failure
      jest.spyOn(offlineManager as any, 'executeQueuedAction')
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue(undefined);

      await offlineManager.syncPendingActions();

      // Action should have been retried
      const actions = offlineManager.getPendingActions();
      const retriedAction = actions.find(a => a.id === failingAction.id);
      expect(retriedAction?.attempts).toBeGreaterThan(0);
    });
  });

  describe('Session Caching', () => {
    beforeEach(() => {
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = {
            sessionId: mockSession.sessionId,
            data: mockSession,
            cachedAt: new Date(),
            version: mockSession.schemaVersion
          };
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });
    });

    it('should cache session offline', async () => {
      await offlineManager.cacheSessionOffline(mockSession);
      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should retrieve offline session', async () => {
      const cachedSession = await offlineManager.getOfflineSession('offline-test-session');
      
      expect(cachedSession).toBeDefined();
      expect(cachedSession?.sessionId).toBe('offline-test-session');
    });

    it('should handle missing offline session', async () => {
      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = null;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const cachedSession = await offlineManager.getOfflineSession('nonexistent-session');
      expect(cachedSession).toBeNull();
    });

    it('should clear offline cache', async () => {
      mockIDBObjectStore.clear.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await offlineManager.clearOfflineCache();
      expect(mockIDBObjectStore.clear).toHaveBeenCalled();
    });
  });

  describe('Connectivity Management', () => {
    it('should detect online/offline status changes', () => {
      const onlineHandler = jest.fn();
      const offlineHandler = jest.fn();

      // Mock event listeners
      (global.window.addEventListener as jest.Mock).mockImplementation((event, handler) => {
        if (event === 'online') onlineHandler.mockImplementation(handler);
        if (event === 'offline') offlineHandler.mockImplementation(handler);
      });

      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      offlineHandler();

      expect(offlineManager.getSyncStatus()).toBe('offline');

      // Simulate coming back online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
      onlineHandler();

      expect(offlineManager.getSyncStatus()).toBe('online');
    });

    it('should trigger sync when coming back online', async () => {
      jest.spyOn(offlineManager, 'syncPendingActions').mockResolvedValue();

      // Queue an action while offline
      offlineManager.queueAction({
        sessionId: 'test-session',
        type: 'session_update',
        payload: {},
        priority: 'normal'
      });

      // Simulate coming back online
      const onlineEvent = new Event('online');
      global.window.dispatchEvent(onlineEvent);

      // Should trigger sync
      expect(offlineManager.syncPendingActions).toHaveBeenCalled();
    });

    it('should notify connectivity changes', () => {
      const mockDispatchEvent = jest.spyOn(global.window, 'dispatchEvent');

      // Simulate offline notification
      (offlineManager as any).notifyConnectivityChange('offline');

      expect(mockDispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'connectivityChange',
          detail: { status: 'offline', pendingActions: expect.any(Number) }
        })
      );
    });
  });

  describe('Storage Usage Management', () => {
    beforeEach(() => {
      // Mock navigator.storage.estimate
      Object.defineProperty(navigator, 'storage', {
        value: {
          estimate: jest.fn().mockResolvedValue({
            usage: 1024 * 1024 * 10, // 10MB
            quota: 1024 * 1024 * 100  // 100MB
          })
        },
        writable: true
      });
    });

    it('should track offline storage usage', async () => {
      const usage = await (offlineManager as any).getOfflineStorageUsage();
      expect(usage).toBe(1024 * 1024 * 10); // 10MB
    });

    it('should respect storage limits', async () => {
      const largeSession = {
        ...mockSession,
        performanceMetrics: {
          ...mockSession.performanceMetrics,
          memoryUsage: 100 * 1024 * 1024 // 100MB
        }
      };

      // Should handle large sessions appropriately
      await expect(offlineManager.cacheSessionOffline(largeSession))
        .resolves.not.toThrow();
    });
  });

  describe('Action Execution', () => {
    it('should execute different action types', async () => {
      const sessionUpdateAction: QueuedAction = {
        id: 'session-update',
        sessionId: 'test-session',
        type: 'session_update',
        payload: { sessionId: 'test-session', updates: { currentStep: 'features' } },
        priority: 'normal',
        timestamp: new Date(),
        attempts: 0,
        maxAttempts: 3,
        requiresNetwork: true
      };

      const formSaveAction: QueuedAction = {
        id: 'form-save',
        sessionId: 'test-session',
        type: 'form_save',
        payload: { sessionId: 'test-session', formId: 'test-form', formData: {} },
        priority: 'normal',
        timestamp: new Date(),
        attempts: 0,
        maxAttempts: 3,
        requiresNetwork: true
      };

      // Test execution without throwing
      await expect((offlineManager as any).executeQueuedAction(sessionUpdateAction))
        .resolves.not.toThrow();

      await expect((offlineManager as any).executeQueuedAction(formSaveAction))
        .resolves.not.toThrow();
    });

    it('should handle rollback on failed actions', async () => {
      const actionWithRollback: QueuedAction = {
        id: 'rollback-action',
        sessionId: 'test-session',
        type: 'session_update',
        payload: { updates: { currentStep: 'invalid' } },
        priority: 'normal',
        timestamp: new Date(),
        attempts: 3, // Max attempts reached
        maxAttempts: 3,
        requiresNetwork: true,
        rollbackData: {
          type: 'session_update',
          payload: { updates: { currentStep: 'analysis' } }
        }
      };

      jest.spyOn(offlineManager as any, 'executeRollback').mockResolvedValue();
      
      await (offlineManager as any).handleFailedAction(actionWithRollback);

      expect((offlineManager as any).executeRollback).toHaveBeenCalledWith(actionWithRollback);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle IndexedDB errors gracefully', async () => {
      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('IndexedDB error');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      await expect(offlineManager.getOfflineSession('error-session'))
        .rejects.toThrow('IndexedDB error');
    });

    it('should handle service worker registration failures', () => {
      mockServiceWorker.register.mockRejectedValue(new Error('Service Worker failed'));

      // Should not throw during initialization
      expect(() => OfflineSessionManager.getInstance()).not.toThrow();
    });

    it('should handle corrupted action queue', () => {
      // Add invalid action to queue
      (offlineManager as any).actionQueue = [{ invalid: 'action' }];

      expect(() => offlineManager.getPendingActions()).not.toThrow();
      expect(offlineManager.getPendingActions()).toEqual([{ invalid: 'action' }]);
    });
  });
});