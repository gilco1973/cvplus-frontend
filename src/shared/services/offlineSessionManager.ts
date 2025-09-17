// Offline Session Manager - Offline-first architecture with action queuing
import {
  EnhancedSessionState,
  QueuedAction,
  OfflineCapability,
  SyncStatus
} from '../types/session';
import { EnhancedSessionManager } from './enhancedSessionManager';

export class OfflineSessionManager {
  private static instance: OfflineSessionManager;
  private enhancedSessionManager: EnhancedSessionManager;
  private actionQueue: QueuedAction[] = [];
  private syncStatus: SyncStatus = 'online';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  
  // IndexedDB store for offline persistence
  private dbName = 'cvplus-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.setupOfflineCapabilities();
    this.initializeIndexedDB();
    this.setupServiceWorker();
  }

  public static getInstance(): OfflineSessionManager {
    if (!OfflineSessionManager.instance) {
      OfflineSessionManager.instance = new OfflineSessionManager();
    }
    return OfflineSessionManager.instance;
  }

  // =====================================================================================
  // OFFLINE CAPABILITY MANAGEMENT
  // =====================================================================================

  public async enableOfflineMode(sessionId: string): Promise<boolean> {
    try {
      // Cache current session state
      const session = await this.enhancedSessionManager.getEnhancedSession(sessionId);
      if (!session) return false;

      await this.cacheSessionOffline(session);
      
      // Update session with offline capability
      session.offlineCapability = {
        enabled: true,
        lastSyncAt: new Date(),
        pendingActions: this.actionQueue.length,
        storageUsed: await this.getOfflineStorageUsage(),
        maxStorageSize: 50 * 1024 * 1024 // 50MB
      };

      return true;
    } catch (error) {
      console.error('Error enabling offline mode:', error);
      return false;
    }
  }

  public async disableOfflineMode(sessionId: string): Promise<boolean> {
    try {
      // Sync any pending actions first
      await this.syncPendingActions();
      
      // Clear offline cache
      await this.clearOfflineCache(sessionId);
      
      return true;
    } catch (error) {
      console.error('Error disabling offline mode:', error);
      return false;
    }
  }

  public isOfflineCapable(): boolean {
    return 'serviceWorker' in navigator && 'indexedDB' in window;
  }

  public getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  // =====================================================================================
  // ACTION QUEUING SYSTEM
  // =====================================================================================

  public queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'>): string {
    const queuedAction: QueuedAction = {
      id: this.generateActionId(),
      sessionId: action.sessionId,
      type: action.type,
      payload: action.payload,
      priority: action.priority || 'normal',
      timestamp: new Date(),
      attempts: 0,
      maxAttempts: action.maxAttempts || 3,
      requiresNetwork: action.requiresNetwork ?? true,
      rollbackData: action.rollbackData
    };

    this.actionQueue.push(queuedAction);
    this.persistActionQueue();
    
    // Try to execute immediately if online
    if (this.syncStatus === 'online' && queuedAction.requiresNetwork) {
      this.executeQueuedAction(queuedAction);
    }

    return queuedAction.id;
  }

  public async syncPendingActions(): Promise<void> {
    if (this.syncStatus !== 'online') return;

    const pendingActions = this.actionQueue.filter(action => action.attempts < action.maxAttempts);
    
    for (const action of pendingActions) {
      try {
        await this.executeQueuedAction(action);
      } catch (error) {
        console.error('Failed to execute queued action:', error);
        action.attempts++;
        
        if (action.attempts >= action.maxAttempts) {
          await this.handleFailedAction(action);
        }
      }
    }

    // Remove successfully executed actions
    this.actionQueue = this.actionQueue.filter(action => action.attempts < action.maxAttempts);
    await this.persistActionQueue();
  }

  public getPendingActions(): QueuedAction[] {
    return [...this.actionQueue];
  }

  public clearActionQueue(): void {
    this.actionQueue = [];
    this.persistActionQueue();
  }

  // =====================================================================================
  // OFFLINE SESSION PERSISTENCE
  // =====================================================================================

  public async cacheSessionOffline(session: EnhancedSessionState): Promise<void> {
    if (!this.db) await this.initializeIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      
      const request = store.put({
        sessionId: session.sessionId,
        data: session,
        cachedAt: new Date(),
        version: session.schemaVersion
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async getOfflineSession(sessionId: string): Promise<EnhancedSessionState | null> {
    if (!this.db) await this.initializeIndexedDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      
      const request = store.get(sessionId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  public async clearOfflineCache(sessionId?: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sessions', 'actions'], 'readwrite');
      
      if (sessionId) {
        // Clear specific session
        const sessionsStore = transaction.objectStore('sessions');
        sessionsStore.delete(sessionId);
      } else {
        // Clear all offline data
        const sessionsStore = transaction.objectStore('sessions');
        const actionsStore = transaction.objectStore('actions');
        
        sessionsStore.clear();
        actionsStore.clear();
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // =====================================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================================

  private setupOfflineCapabilities(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.syncStatus = 'online';
      this.syncPendingActions();
      this.notifyConnectivityChange('online');
    });

    window.addEventListener('offline', () => {
      this.syncStatus = 'offline';
      this.notifyConnectivityChange('offline');
    });

    // Initial status
    this.syncStatus = navigator.onLine ? 'online' : 'offline';
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
          sessionsStore.createIndex('cachedAt', 'cachedAt');
        }

        // Actions queue store
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('sessionId', 'sessionId');
          actionsStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  private async setupServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorkerRegistration = registration;
      
      console.warn('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private async executeQueuedAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'session_update':
        await this.handleSessionUpdateAction(action);
        break;
      
      case 'form_save':
        await this.handleFormSaveAction(action);
        break;
      
      case 'feature_toggle':
        await this.handleFeatureToggleAction(action);
        break;
      
      default:
        console.warn('Unknown action type:', action.type);
    }

    // Remove successful action from queue
    this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
  }

  private async handleSessionUpdateAction(action: QueuedAction): Promise<void> {
    const { sessionId, updates } = action.payload;
    await this.enhancedSessionManager.updateSessionState(sessionId, updates);
  }

  private async handleFormSaveAction(action: QueuedAction): Promise<void> {
    const { sessionId, formId, formData } = action.payload;
    // Implementation would depend on form service integration
    console.warn('Executing form save action:', { sessionId, formId, formData });
  }

  private async handleFeatureToggleAction(action: QueuedAction): Promise<void> {
    const { sessionId, featureId, enabled } = action.payload;
    await this.enhancedSessionManager.updateFeatureState(sessionId, featureId, { enabled });
  }

  private async handleFailedAction(action: QueuedAction): Promise<void> {
    console.error('Action failed after maximum attempts:', action);
    
    // Attempt rollback if rollback data is available
    if (action.rollbackData) {
      try {
        await this.executeRollback(action);
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
  }

  private async executeRollback(action: QueuedAction): Promise<void> {
    if (!action.rollbackData) return;

    // Create rollback action
    const rollbackAction: QueuedAction = {
      id: this.generateActionId(),
      sessionId: action.sessionId,
      type: action.rollbackData.type,
      payload: action.rollbackData.payload,
      priority: 'high',
      timestamp: new Date(),
      attempts: 0,
      maxAttempts: 1,
      requiresNetwork: true
    };

    await this.executeQueuedAction(rollbackAction);
  }

  private async persistActionQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      
      // Clear existing actions and add current queue
      store.clear();
      
      for (const action of this.actionQueue) {
        store.add(action);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getOfflineStorageUsage(): Promise<number> {
    if ('navigator' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  }

  private notifyConnectivityChange(status: 'online' | 'offline'): void {
    window.dispatchEvent(new CustomEvent('connectivityChange', {
      detail: { status, pendingActions: this.actionQueue.length }
    }));
  }
}

export default OfflineSessionManager;