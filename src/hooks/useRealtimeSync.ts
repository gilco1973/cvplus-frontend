// useRealtimeSync Hook - Real-time session synchronization with conflict resolution
import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeSessionSync } from '../services/realtimeSessionSync';
import type {
  EnhancedSessionState,
  StateChange,
  ConflictResolution,
  SyncStatus,
  UserPresence
} from '../types/session';

interface UseRealtimeSyncReturn {
  // Sync state
  syncStatus: SyncStatus | null;
  isConnected: boolean;
  isOnline: boolean;
  lastSyncAt: Date | null;
  
  // Conflict management
  conflicts: ConflictResolution[];
  hasConflicts: boolean;
  pendingChanges: number;
  
  // Presence
  userPresence: UserPresence[];
  activeUsers: number;
  
  // Sync operations
  connect: () => Promise<boolean>;
  disconnect: () => void;
  broadcastChange: (change: StateChange) => void;
  resolveConflicts: (
    localState: EnhancedSessionState,
    remoteState: EnhancedSessionState
  ) => EnhancedSessionState;
  
  // Optimistic updates
  applyOptimisticUpdate: (update: Partial<EnhancedSessionState>) => string;
  rollbackUpdate: (updateId: string) => boolean;
  
  // Presence management
  updatePresence: (status: 'active' | 'idle' | 'away') => void;
}

interface UseRealtimeSyncOptions {
  sessionId: string;
  autoConnect?: boolean;
  enablePresenceTracking?: boolean;
  conflictResolutionStrategy?: 'local_wins' | 'remote_wins' | 'merge' | 'user_choice';
  onStateChange?: (changes: StateChange[]) => void;
  onConflictsDetected?: (conflicts: ConflictResolution[]) => void;
  onConnectionStatusChange?: (connected: boolean) => void;
  onPresenceUpdate?: (presence: UserPresence[]) => void;
}

export const useRealtimeSync = (options: UseRealtimeSyncOptions): UseRealtimeSyncReturn => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [userPresence, setUserPresence] = useState<UserPresence[]>([]);
  
  const realtimeSync = useRef(RealtimeSessionSync.getInstance());
  const unsubscribeCallbacks = useRef<(() => void)[]>([]);
  
  // Auto-connect on mount
  useEffect(() => {
    if (options.autoConnect) {
      connect();
    }

    // Setup network status monitoring
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Setup presence tracking if enabled
    if (options.enablePresenceTracking) {
      realtimeSync.current.trackUserPresence(options.sessionId);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      disconnect();
    };
  }, [options.sessionId, options.autoConnect]);

  // Monitor network status changes
  useEffect(() => {
    if (isOnline && isConnected) {
      // Reconnect if we came back online
      connect();
    } else if (!isOnline) {
      // Update sync status when offline
      setSyncStatus(prev => prev ? { ...prev, status: 'offline' } : null);
    }
  }, [isOnline]);

  // Connect to real-time sync
  const connect = useCallback(async (): Promise<boolean> => {
    try {
      const success = await realtimeSync.current.connect(options.sessionId);
      
      if (success) {
        setIsConnected(true);
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize sync status
        setSyncStatus({
          sessionId: options.sessionId,
          status: 'synced',
          pendingChanges: 0,
          conflicts: [],
          syncVersion: 1,
          lastSyncAt: new Date()
        });
        
        // Trigger callback
        if (options.onConnectionStatusChange) {
          options.onConnectionStatusChange(true);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Error connecting to real-time sync:', error);
      setIsConnected(false);
      setSyncStatus(prev => prev ? { ...prev, status: 'error' } : null);
      return false;
    }
  }, [options.sessionId, options.onConnectionStatusChange]);

  // Disconnect from real-time sync
  const disconnect = useCallback(() => {
    // Clean up event listeners
    unsubscribeCallbacks.current.forEach(unsubscribe => unsubscribe());
    unsubscribeCallbacks.current = [];
    
    // Disconnect from sync service
    realtimeSync.current.disconnect(options.sessionId);
    
    setIsConnected(false);
    setSyncStatus(null);
    setConflicts([]);
    setUserPresence([]);
    
    // Trigger callback
    if (options.onConnectionStatusChange) {
      options.onConnectionStatusChange(false);
    }
  }, [options.sessionId, options.onConnectionStatusChange]);

  // Set up event listeners
  const setupEventListeners = useCallback(() => {
    // State change listener
    const unsubscribeStateChange = realtimeSync.current.subscribeToChanges(
      options.sessionId,
      (changes) => {
        // Update sync status
        setSyncStatus(prev => prev ? {
          ...prev,
          lastSyncAt: new Date(),
          status: 'synced',
          pendingChanges: Math.max(0, prev.pendingChanges - changes.length)
        } : null);
        
        // Trigger callback
        if (options.onStateChange) {
          options.onStateChange(changes);
        }
      }
    );
    
    unsubscribeCallbacks.current.push(unsubscribeStateChange);
  }, [options.sessionId, options.onStateChange]);

  // Broadcast state change
  const broadcastChange = useCallback((change: StateChange) => {
    realtimeSync.current.broadcastStateChange(options.sessionId, change);
    
    // Update local sync status
    setSyncStatus(prev => prev ? {
      ...prev,
      status: 'syncing',
      pendingChanges: prev.pendingChanges + 1,
      syncVersion: prev.syncVersion + 1
    } : null);
  }, [options.sessionId]);

  // Resolve conflicts
  const resolveConflicts = useCallback((
    localState: EnhancedSessionState,
    remoteState: EnhancedSessionState
  ): EnhancedSessionState => {
    const resolvedState = realtimeSync.current.resolveConflicts(
      options.sessionId,
      localState,
      remoteState
    );
    
    // Update conflicts state
    setSyncStatus(prev => {
      if (!prev) return null;
      
      const newConflicts = prev.conflicts.filter(c => c.sessionId === options.sessionId);
      setConflicts(newConflicts);
      
      // Trigger callback
      if (options.onConflictsDetected && newConflicts.length > 0) {
        options.onConflictsDetected(newConflicts);
      }
      
      return {
        ...prev,
        status: newConflicts.length > 0 ? 'conflicted' : 'synced',
        conflicts: newConflicts
      };
    });
    
    return resolvedState;
  }, [options.sessionId, options.onConflictsDetected]);

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((
    update: Partial<EnhancedSessionState>
  ): string => {
    const updateId = realtimeSync.current.applyOptimisticUpdate(options.sessionId, update);
    
    // Update sync status to show pending change
    setSyncStatus(prev => prev ? {
      ...prev,
      status: 'syncing',
      pendingChanges: prev.pendingChanges + 1
    } : null);
    
    return updateId;
  }, [options.sessionId]);

  // Rollback optimistic update
  const rollbackUpdate = useCallback((updateId: string): boolean => {
    const success = realtimeSync.current.rollbackUpdate(updateId);
    
    if (success) {
      // Update sync status
      setSyncStatus(prev => prev ? {
        ...prev,
        pendingChanges: Math.max(0, prev.pendingChanges - 1),
        status: prev.pendingChanges <= 1 ? 'synced' : 'syncing'
      } : null);
    }
    
    return success;
  }, []);

  // Update user presence
  const updatePresence = useCallback((status: 'active' | 'idle' | 'away') => {
    if (!options.enablePresenceTracking) return;
    
    // Update presence via the sync service
    // This would typically update the user's status and broadcast it
    console.warn('Updating presence status:', status);
  }, [options.enablePresenceTracking]);

  // Computed values
  const hasConflicts = conflicts.length > 0;
  const pendingChanges = syncStatus?.pendingChanges || 0;
  const lastSyncAt = syncStatus?.lastSyncAt || null;
  const activeUsers = userPresence.filter(p => p.status === 'active').length;

  return {
    // State
    syncStatus,
    isConnected,
    isOnline,
    lastSyncAt,
    conflicts,
    hasConflicts,
    pendingChanges,
    userPresence,
    activeUsers,
    
    // Operations
    connect,
    disconnect,
    broadcastChange,
    resolveConflicts,
    applyOptimisticUpdate,
    rollbackUpdate,
    updatePresence
  };
};

// Utility hook for conflict resolution UI
export const useConflictResolution = (sessionId: string) => {
  const [activeConflicts, setActiveConflicts] = useState<ConflictResolution[]>([]);
  const [resolutionInProgress, setResolutionInProgress] = useState(false);
  
  const { conflicts, resolveConflicts } = useRealtimeSync({ sessionId });
  
  useEffect(() => {
    setActiveConflicts(conflicts);
  }, [conflicts]);

  const resolveConflict = useCallback(async (
    conflictId: string,
    strategy: 'local_wins' | 'remote_wins' | 'merge',
    localState: EnhancedSessionState,
    remoteState: EnhancedSessionState
  ) => {
    setResolutionInProgress(true);
    
    try {
      const resolvedState = resolveConflicts(localState, remoteState);
      
      // Remove resolved conflict
      setActiveConflicts(prev => prev.filter(c => c.conflictId !== conflictId));
      
      return resolvedState;
    } finally {
      setResolutionInProgress(false);
    }
  }, [resolveConflicts]);

  const dismissConflict = useCallback((conflictId: string) => {
    setActiveConflicts(prev => prev.filter(c => c.conflictId !== conflictId));
  }, []);

  return {
    activeConflicts,
    resolutionInProgress,
    resolveConflict,
    dismissConflict,
    hasUnresolvedConflicts: activeConflicts.length > 0
  };
};

// Network status hook for offline/online detection
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updateConnectionType = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionType);
      updateConnectionType();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      
      if (connection) {
        connection.removeEventListener('change', updateConnectionType);
      }
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g'
  };
};

export default useRealtimeSync;