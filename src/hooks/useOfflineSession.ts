// useOfflineSession - React hook for offline-aware session management
import { useState, useEffect, useCallback } from 'react';
import {
  EnhancedSessionState,
  QueuedAction,
  SyncStatus
} from '../types/session';
import OfflineSessionManager from '../services/offlineSessionManager';

export interface OfflineSessionHook {
  isOffline: boolean;
  syncStatus: SyncStatus;
  pendingActions: QueuedAction[];
  offlineCapable: boolean;
  enableOffline: (sessionId: string) => Promise<boolean>;
  disableOffline: (sessionId: string) => Promise<boolean>;
  queueAction: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'>) => string;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  getOfflineSession: (sessionId: string) => Promise<EnhancedSessionState | null>;
}

export function useOfflineSession(): OfflineSessionHook {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    navigator.onLine ? 'online' : 'offline'
  );
  const [pendingActions, setPendingActions] = useState<QueuedAction[]>([]);
  const [offlineManager] = useState(() => OfflineSessionManager.getInstance());

  // Initialize offline capabilities and listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setSyncStatus('online');
    };

    const handleOffline = () => {
      setIsOffline(true);
      setSyncStatus('offline');
    };

    const handleConnectivityChange = (event: CustomEvent) => {
      const { status, pendingActions: actionCount } = event.detail;
      setSyncStatus(status);
      updatePendingActions();
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connectivityChange', handleConnectivityChange as EventListener);

    // Initial state
    updatePendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connectivityChange', handleConnectivityChange as EventListener);
    };
  }, [offlineManager]);

  // Update pending actions periodically
  useEffect(() => {
    const interval = setInterval(updatePendingActions, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const updatePendingActions = useCallback(() => {
    const actions = offlineManager.getPendingActions();
    setPendingActions([...actions]);
  }, [offlineManager]);

  const enableOffline = useCallback(async (sessionId: string): Promise<boolean> => {
    const success = await offlineManager.enableOfflineMode(sessionId);
    if (success) {
      updatePendingActions();
    }
    return success;
  }, [offlineManager]);

  const disableOffline = useCallback(async (sessionId: string): Promise<boolean> => {
    const success = await offlineManager.disableOfflineMode(sessionId);
    if (success) {
      updatePendingActions();
    }
    return success;
  }, [offlineManager]);

  const queueAction = useCallback((action: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'>): string => {
    const actionId = offlineManager.queueAction(action);
    updatePendingActions();
    return actionId;
  }, [offlineManager]);

  const syncNow = useCallback(async (): Promise<void> => {
    setSyncStatus('syncing');
    try {
      await offlineManager.syncPendingActions();
      updatePendingActions();
      setSyncStatus(navigator.onLine ? 'online' : 'offline');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => {
        setSyncStatus(navigator.onLine ? 'online' : 'offline');
      }, 3000);
    }
  }, [offlineManager]);

  const clearQueue = useCallback(() => {
    offlineManager.clearActionQueue();
    updatePendingActions();
  }, [offlineManager]);

  const getOfflineSession = useCallback(async (sessionId: string): Promise<EnhancedSessionState | null> => {
    return offlineManager.getOfflineSession(sessionId);
  }, [offlineManager]);

  return {
    isOffline,
    syncStatus,
    pendingActions,
    offlineCapable: offlineManager.isOfflineCapable(),
    enableOffline,
    disableOffline,
    queueAction,
    syncNow,
    clearQueue,
    getOfflineSession
  };
}

// Additional hook for offline status indicator
export function useOfflineIndicator() {
  const { isOffline, syncStatus, pendingActions } = useOfflineSession();

  const getStatusMessage = useCallback(() => {
    switch (syncStatus) {
      case 'offline':
        return pendingActions.length > 0 
          ? `Offline - ${pendingActions.length} actions queued`
          : 'Offline';
      
      case 'syncing':
        return 'Syncing...';
      
      case 'error':
        return 'Sync error';
      
      case 'online':
      default:
        return pendingActions.length > 0 
          ? `${pendingActions.length} actions pending`
          : 'Online';
    }
  }, [syncStatus, pendingActions.length]);

  const getStatusColor = useCallback(() => {
    switch (syncStatus) {
      case 'offline':
        return 'orange';
      case 'syncing':
        return 'blue';
      case 'error':
        return 'red';
      case 'online':
      default:
        return pendingActions.length > 0 ? 'yellow' : 'green';
    }
  }, [syncStatus, pendingActions.length]);

  return {
    isOffline,
    syncStatus,
    pendingActionsCount: pendingActions.length,
    statusMessage: getStatusMessage(),
    statusColor: getStatusColor()
  };
}

export default useOfflineSession;