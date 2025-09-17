// Real-time Session Synchronization - Cross-tab sync and conflict resolution
import {
  EnhancedSessionState,
  StateChange,
  ConflictResolution,
  SyncStatus,
  UserPresence
} from '../types/session';
import { EnhancedSessionManager } from './enhancedSessionManager';

export class RealtimeSessionSync {
  private static instance: RealtimeSessionSync;
  private enhancedSessionManager: EnhancedSessionManager;
  
  // WebSocket connection for real-time sync
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval: NodeJS.Timeout | null = null;
  
  // Cross-tab communication
  private broadcastChannel: BroadcastChannel | null = null;
  
  // Sync state management
  private activeSessions = new Map<string, SyncStatus>();
  private pendingChanges = new Map<string, StateChange[]>();
  private conflictResolutions = new Map<string, ConflictResolution>();
  
  // Event listeners
  private stateChangeListeners = new Map<string, ((changes: StateChange[]) => void)[]>();
  private conflictListeners = new Map<string, ((conflicts: ConflictResolution[]) => void)[]>();
  private presenceListeners = new Map<string, ((presence: UserPresence[]) => void)[]>();
  
  // Optimistic updates
  private optimisticUpdates = new Map<string, { updateId: string; originalState: any; newState: any }>();
  
  private constructor() {
    this.enhancedSessionManager = EnhancedSessionManager.getInstance();
    this.setupCrossTabCommunication();
    this.setupStorageListener();
  }

  public static getInstance(): RealtimeSessionSync {
    if (!RealtimeSessionSync.instance) {
      RealtimeSessionSync.instance = new RealtimeSessionSync();
    }
    return RealtimeSessionSync.instance;
  }

  // =====================================================================================
  // CONNECTION MANAGEMENT
  // =====================================================================================

  public async connect(sessionId: string): Promise<boolean> {
    try {
      // Initialize sync status
      this.activeSessions.set(sessionId, {
        sessionId,
        status: 'syncing',
        pendingChanges: 0,
        conflicts: [],
        syncVersion: 0
      });

      // Setup WebSocket connection
      await this.connectWebSocket(sessionId);
      
      // Enable cross-tab sync
      this.enableCrossTabSync(sessionId);
      
      return true;
    } catch (error) {
      console.error('Error connecting real-time sync:', error);
      this.updateSyncStatus(sessionId, { status: 'error' });
      return false;
    }
  }

  public disconnect(sessionId: string): void {
    // Clean up session resources
    this.activeSessions.delete(sessionId);
    this.pendingChanges.delete(sessionId);
    this.stateChangeListeners.delete(sessionId);
    this.conflictListeners.delete(sessionId);
    this.presenceListeners.delete(sessionId);
    
    // Close WebSocket if no active sessions
    if (this.activeSessions.size === 0 && this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  private async connectWebSocket(sessionId: string): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    return new Promise((resolve, reject) => {
      // In production, this would be your actual WebSocket endpoint
      const wsUrl = this.getWebSocketUrl();
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.warn('WebSocket connected for session sync');
        this.reconnectAttempts = 0;
        
        // Join session room
        this.sendWebSocketMessage({
          type: 'join_session',
          sessionId,
          timestamp: new Date().toISOString()
        });
        
        resolve();
      };

      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.warn('WebSocket connection closed');
        this.websocket = null;
        this.attemptReconnect(sessionId);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }

  private attemptReconnect(sessionId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.updateSyncStatus(sessionId, { status: 'offline' });
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
    
    this.reconnectInterval = setTimeout(() => {
      console.warn(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connectWebSocket(sessionId).catch(() => {
        this.attemptReconnect(sessionId);
      });
    }, delay);
  }

  // =====================================================================================
  // CROSS-TAB SYNCHRONIZATION
  // =====================================================================================

  private setupCrossTabCommunication(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('cvplus_session_sync');
      this.broadcastChannel.onmessage = (event) => {
        this.handleCrossTabMessage(event.data);
      };
    }
  }

  private enableCrossTabSync(sessionId: string): void {
    // Listen for session state changes in other tabs
    this.subscribeToChanges(sessionId, (changes) => {
      this.broadcastToOtherTabs({
        type: 'session_state_changed',
        sessionId,
        changes,
        timestamp: new Date().toISOString(),
        tabId: this.getTabId()
      });
    });
  }

  private handleCrossTabMessage(message: any): void {
    if (message.tabId === this.getTabId()) {
      return; // Ignore messages from the same tab
    }

    switch (message.type) {
      case 'session_state_changed':
        this.handleCrossTabStateChange(message);
        break;
      case 'sync_conflict':
        this.handleCrossTabConflict(message);
        break;
      case 'user_presence_update':
        this.handleCrossTabPresence(message);
        break;
    }
  }

  private handleCrossTabStateChange(message: any): void {
    const { sessionId, changes } = message;
    
    // Check for conflicts with local changes
    const localChanges = this.pendingChanges.get(sessionId) || [];
    const conflicts = this.detectConflicts(localChanges, changes);
    
    if (conflicts.length > 0) {
      this.handleConflicts(sessionId, conflicts);
    } else {
      // Apply changes locally
      this.applyRemoteChanges(sessionId, changes);
    }
  }

  // =====================================================================================
  // STATE CHANGE MANAGEMENT
  // =====================================================================================

  public broadcastStateChange(sessionId: string, change: StateChange): void {
    // Add to pending changes
    const pending = this.pendingChanges.get(sessionId) || [];
    pending.push(change);
    this.pendingChanges.set(sessionId, pending);

    // Update sync status
    this.updateSyncStatus(sessionId, {
      status: 'syncing',
      pendingChanges: pending.length
    });

    // Broadcast via WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'state_change',
        sessionId,
        change,
        timestamp: new Date().toISOString()
      });
    }

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'session_state_changed',
        sessionId,
        changes: [change],
        timestamp: new Date().toISOString(),
        tabId: this.getTabId()
      });
    }

    // Notify listeners
    const listeners = this.stateChangeListeners.get(sessionId) || [];
    listeners.forEach(listener => listener([change]));
  }

  public subscribeToChanges(sessionId: string, callback: (changes: StateChange[]) => void): () => void {
    const listeners = this.stateChangeListeners.get(sessionId) || [];
    listeners.push(callback);
    this.stateChangeListeners.set(sessionId, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.stateChangeListeners.get(sessionId) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
        this.stateChangeListeners.set(sessionId, currentListeners);
      }
    };
  }

  // =====================================================================================
  // CONFLICT RESOLUTION
  // =====================================================================================

  public resolveConflicts(
    sessionId: string, 
    localState: EnhancedSessionState, 
    remoteState: EnhancedSessionState
  ): EnhancedSessionState {
    const conflicts: StateChange[] = [];
    const resolution: ConflictResolution = {
      conflictId: this.generateConflictId(),
      sessionId,
      conflicts,
      resolutionStrategy: 'merge', // Default strategy
      resolvedValue: localState,
      resolvedAt: new Date()
    };

    // Compare states and identify conflicts
    const conflictPaths = this.identifyConflictPaths(localState, remoteState);
    
    for (const path of conflictPaths) {
      const localValue = this.getValueByPath(localState, path);
      const remoteValue = this.getValueByPath(remoteState, path);
      
      if (!this.deepEqual(localValue, remoteValue)) {
        conflicts.push({
          id: this.generateChangeId(),
          sessionId,
          timestamp: new Date(),
          changeType: 'update',
          path,
          oldValue: localValue,
          newValue: remoteValue,
          source: 'remote'
        });
      }
    }

    // Apply resolution strategy
    resolution.resolvedValue = this.applyResolutionStrategy(
      localState,
      remoteState,
      conflicts,
      resolution.resolutionStrategy
    );

    // Store resolution
    this.conflictResolutions.set(resolution.conflictId, resolution);

    // Update sync status
    const syncStatus = this.activeSessions.get(sessionId);
    if (syncStatus) {
      syncStatus.conflicts.push(resolution);
      this.activeSessions.set(sessionId, syncStatus);
    }

    // Notify conflict listeners
    const listeners = this.conflictListeners.get(sessionId) || [];
    listeners.forEach(listener => listener([resolution]));

    return resolution.resolvedValue;
  }

  private applyResolutionStrategy(
    localState: EnhancedSessionState,
    remoteState: EnhancedSessionState,
    conflicts: StateChange[],
    strategy: 'local_wins' | 'remote_wins' | 'merge' | 'user_choice'
  ): EnhancedSessionState {
    switch (strategy) {
      case 'local_wins':
        return localState;
      
      case 'remote_wins':
        return remoteState;
      
      case 'merge':
        return this.mergeStates(localState, remoteState, conflicts);
      
      case 'user_choice':
        // In a real implementation, this would prompt the user
        // For now, fall back to merge
        return this.mergeStates(localState, remoteState, conflicts);
      
      default:
        return localState;
    }
  }

  private mergeStates(
    localState: EnhancedSessionState,
    remoteState: EnhancedSessionState,
    conflicts: StateChange[]
  ): EnhancedSessionState {
    const merged = { ...localState };

    // Merge non-conflicting changes from remote
    const conflictPaths = new Set(conflicts.map(c => c.path));
    
    // Merge form data
    if (remoteState.formData && localState.formData) {
      merged.formData = { ...localState.formData, ...remoteState.formData };
    }

    // Merge feature states (prefer most recent enabled states)
    if (remoteState.featureStates && localState.featureStates) {
      merged.featureStates = { ...localState.featureStates };
      
      for (const [featureId, remoteFeature] of Object.entries(remoteState.featureStates)) {
        const localFeature = merged.featureStates[featureId];
        
        if (!localFeature || remoteFeature.progress.lastProcessedAt > (localFeature.progress.lastProcessedAt || new Date(0))) {
          merged.featureStates[featureId] = remoteFeature;
        }
      }
    }

    // Merge step progress (prefer higher completion)
    if (remoteState.stepProgress && localState.stepProgress) {
      merged.stepProgress = { ...localState.stepProgress };
      
      for (const [step, remoteProgress] of Object.entries(remoteState.stepProgress)) {
        const localProgress = merged.stepProgress[step as keyof typeof merged.stepProgress];
        
        if (!localProgress || remoteProgress.completion > localProgress.completion) {
          merged.stepProgress[step as keyof typeof merged.stepProgress] = remoteProgress;
        }
      }
    }

    // Use more recent timestamp
    if (remoteState.lastActiveAt > localState.lastActiveAt) {
      merged.lastActiveAt = remoteState.lastActiveAt;
    }

    // Increment schema version
    merged.schemaVersion = this.incrementVersion(merged.schemaVersion);
    merged.migrationHistory = [...(merged.migrationHistory || []), `conflict-resolution-${new Date().toISOString()}`];

    return merged;
  }

  private detectConflicts(localChanges: StateChange[], remoteChanges: StateChange[]): StateChange[] {
    const conflicts: StateChange[] = [];
    
    for (const localChange of localChanges) {
      for (const remoteChange of remoteChanges) {
        if (localChange.path === remoteChange.path && 
            localChange.timestamp.getTime() !== remoteChange.timestamp.getTime() &&
            !this.deepEqual(localChange.newValue, remoteChange.newValue)) {
          conflicts.push(remoteChange);
        }
      }
    }
    
    return conflicts;
  }

  // =====================================================================================
  // OPTIMISTIC UPDATES
  // =====================================================================================

  public applyOptimisticUpdate(sessionId: string, update: Partial<EnhancedSessionState>): string {
    const updateId = this.generateUpdateId();
    
    // Store original state for rollback
    this.optimisticUpdates.set(updateId, {
      updateId,
      originalState: {}, // Would store current state snapshot
      newState: update
    });

    // Apply update immediately
    // In a real implementation, this would update the local session state
    console.warn('Applied optimistic update:', updateId, update);

    // Broadcast the change
    const change: StateChange = {
      id: this.generateChangeId(),
      sessionId,
      timestamp: new Date(),
      changeType: 'update',
      path: 'root',
      oldValue: {},
      newValue: update,
      source: 'local'
    };
    
    this.broadcastStateChange(sessionId, change);

    return updateId;
  }

  public rollbackUpdate(updateId: string): boolean {
    const update = this.optimisticUpdates.get(updateId);
    if (!update) return false;

    // Restore original state
    console.warn('Rolling back optimistic update:', updateId);

    // Remove from optimistic updates
    this.optimisticUpdates.delete(updateId);

    return true;
  }

  // =====================================================================================
  // USER PRESENCE TRACKING
  // =====================================================================================

  public trackUserPresence(sessionId: string): void {
    const presence: UserPresence = {
      userId: 'current_user', // Would get from auth
      sessionId,
      status: 'active',
      lastSeen: new Date(),
      device: navigator.userAgent,
      location: window.location.href
    };

    // Broadcast presence via WebSocket
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'user_presence',
        sessionId,
        presence,
        timestamp: new Date().toISOString()
      });
    }

    // Update presence periodically
    setInterval(() => {
      presence.lastSeen = new Date();
      presence.status = document.hidden ? 'idle' : 'active';
      
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        this.sendWebSocketMessage({
          type: 'user_presence',
          sessionId,
          presence,
          timestamp: new Date().toISOString()
        });
      }
    }, 30000); // Update every 30 seconds
  }

  public getUserPresence(sessionId: string): UserPresence[] {
    // In a real implementation, this would return presence data from the server
    return [];
  }

  // =====================================================================================
  // UTILITY METHODS
  // =====================================================================================

  private updateSyncStatus(sessionId: string, updates: Partial<SyncStatus>): void {
    const current = this.activeSessions.get(sessionId);
    if (current) {
      const updated = { ...current, ...updates, lastSyncAt: new Date() };
      this.activeSessions.set(sessionId, updated);
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'state_change':
        this.handleRemoteStateChange(message);
        break;
      case 'conflict_detected':
        this.handleRemoteConflict(message);
        break;
      case 'user_presence':
        this.handleRemotePresence(message);
        break;
    }
  }

  private handleRemoteStateChange(message: any): void {
    const { sessionId, change } = message;
    
    // Apply remote change if no conflicts
    const localChanges = this.pendingChanges.get(sessionId) || [];
    const conflicts = this.detectConflicts(localChanges, [change]);
    
    if (conflicts.length === 0) {
      this.applyRemoteChanges(sessionId, [change]);
    } else {
      this.handleConflicts(sessionId, conflicts);
    }
  }

  private applyRemoteChanges(sessionId: string, changes: StateChange[]): void {
    // Apply changes to local state
    console.warn('Applying remote changes:', sessionId, changes);
    
    // Update sync status
    this.updateSyncStatus(sessionId, { status: 'synced' });
    
    // Notify listeners
    const listeners = this.stateChangeListeners.get(sessionId) || [];
    listeners.forEach(listener => listener(changes));
  }

  private handleConflicts(sessionId: string, conflicts: StateChange[]): void {
    console.warn('Handling conflicts for session:', sessionId, conflicts);
    
    // Update sync status
    this.updateSyncStatus(sessionId, { status: 'conflicted' });
  }

  private sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  private setupStorageListener(): void {
    // Listen for localStorage changes for basic cross-tab sync fallback
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('cvplus_session_')) {
        const sessionId = event.key.replace('cvplus_session_', '');
        
        if (event.newValue && event.oldValue) {
          const oldState = JSON.parse(event.oldValue);
          const newState = JSON.parse(event.newValue);
          
          // Generate change event
          const change: StateChange = {
            id: this.generateChangeId(),
            sessionId,
            timestamp: new Date(),
            changeType: 'update',
            path: 'root',
            oldValue: oldState,
            newValue: newState,
            source: 'remote'
          };
          
          this.handleCrossTabStateChange({
            type: 'session_state_changed',
            sessionId,
            changes: [change],
            tabId: 'storage'
          });
        }
      }
    });
  }

  private getWebSocketUrl(): string {
    // In production, this would be your actual WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws/session-sync`;
  }

  private getTabId(): string {
    if (!window.sessionStorage.getItem('cvplus_tab_id')) {
      window.sessionStorage.setItem('cvplus_tab_id', Math.random().toString(36).substr(2, 9));
    }
    return window.sessionStorage.getItem('cvplus_tab_id')!;
  }

  private identifyConflictPaths(state1: any, state2: any, basePath = ''): string[] {
    const paths: string[] = [];
    const keys = new Set([...Object.keys(state1 || {}), ...Object.keys(state2 || {})]);
    
    for (const key of keys) {
      const path = basePath ? `${basePath}.${key}` : key;
      const value1 = state1?.[key];
      const value2 = state2?.[key];
      
      if (typeof value1 === 'object' && typeof value2 === 'object' && value1 && value2) {
        paths.push(...this.identifyConflictPaths(value1, value2, path));
      } else if (!this.deepEqual(value1, value2)) {
        paths.push(path);
      }
    }
    
    return paths;
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`;
  }

  // Placeholder methods for cross-tab conflict handling
  private handleCrossTabConflict(message: any): void {
    console.warn('Handling cross-tab conflict:', message);
  }

  private handleCrossTabPresence(message: any): void {
    console.warn('Handling cross-tab presence:', message);
  }

  private handleRemoteConflict(message: any): void {
    console.warn('Handling remote conflict:', message);
  }

  private handleRemotePresence(message: any): void {
    console.warn('Handling remote presence:', message);
  }

  private broadcastToOtherTabs(message: any): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
  }
}

export default RealtimeSessionSync;