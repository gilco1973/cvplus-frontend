// SessionManager Service - Core session management with dual storage
import { 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
// Unsubscribe type removed as it was unused
import { db, auth } from '../lib/firebase';
import {
  type SessionState,
  type SessionStorageConfig,
  type SessionEvent,
  type CVStep,
  type SessionFormData,
  SessionError
} from '../types/session';

class SessionManager {
  private static instance: SessionManager;
  private config: SessionStorageConfig;
  private eventListeners: ((event: SessionEvent) => void)[] = [];
  
  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupStorageListeners();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // Configuration management
  private getDefaultConfig(): SessionStorageConfig {
    return {
      enableLocalStorage: true,
      enableFirestoreSync: true,
      localStorageRetentionDays: 30,
      firestoreRetentionDays: 90,
      autoSyncInterval: 30000, // 30 seconds
      syncOnNetworkReconnect: true,
      compressData: true,
      compressionThreshold: 10240 // 10KB
    };
  }

  public updateConfig(newConfig: Partial<SessionStorageConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Session CRUD operations
  public async createSession(formData: Partial<SessionFormData> = {}): Promise<SessionState> {
    const sessionId = this.generateSessionId();
    const now = new Date();
    
    const session: SessionState = {
      sessionId,
      userId: auth.currentUser?.uid,
      currentStep: 'upload',
      completedSteps: [],
      progressPercentage: 0,
      lastActiveAt: now,
      createdAt: now,
      formData: formData as SessionFormData,
      status: 'draft',
      canResume: true,
      isLocalOnly: !this.config.enableFirestoreSync || !auth.currentUser,
      isSynced: false
    };

    await this.saveSession(session);
    this.emitEvent({ type: 'SESSION_CREATED', payload: { sessionId } });
    
    return session;
  }

  public async getSession(sessionId: string): Promise<SessionState | null> {
    try {
      // Try Firestore first if user is authenticated
      if (auth.currentUser && this.config.enableFirestoreSync) {
        const firestoreSession = await this.getFromFirestore(sessionId);
        if (firestoreSession) {
          return firestoreSession;
        }
      }

      // Fall back to localStorage
      return this.getFromLocalStorage(sessionId);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  public async updateSession(
    sessionId: string, 
    updates: Partial<SessionState>
  ): Promise<SessionState | null> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      throw new SessionError('Session not found', 'SESSION_NOT_FOUND', sessionId);
    }

    const updatedSession: SessionState = {
      ...existingSession,
      ...updates,
      lastActiveAt: new Date(),
      isSynced: false // Mark as needing sync
    };

    await this.saveSession(updatedSession);
    
    this.emitEvent({ 
      type: 'SESSION_UPDATED', 
      payload: { sessionId, changes: updates } 
    });

    return updatedSession;
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      // Delete from both storage locations
      await Promise.all([
        this.deleteFromLocalStorage(sessionId),
        this.deleteFromFirestore(sessionId)
      ]);
      return true;
    } catch (error) {
      console.error('Error deleting session:', error);
      return false;
    }
  }

  // Navigation and step management
  public async updateStep(
    sessionId: string, 
    newStep: CVStep, 
    formData?: Partial<SessionFormData>
  ): Promise<SessionState | null> {
    const updates: Partial<SessionState> = {
      currentStep: newStep,
      formData: formData ? { ...formData } as SessionFormData : undefined,
      progressPercentage: this.calculateProgress(newStep)
    };

    // Add to completed steps if not already there
    const session = await this.getSession(sessionId);
    if (session && !session.completedSteps.includes(newStep)) {
      updates.completedSteps = [...session.completedSteps, newStep];
    }

    return this.updateSession(sessionId, updates);
  }

  public async pauseSession(sessionId: string, atStep: CVStep): Promise<boolean> {
    const updated = await this.updateSession(sessionId, {
      status: 'paused',
      currentStep: atStep
    });

    if (updated) {
      this.emitEvent({ 
        type: 'SESSION_PAUSED', 
        payload: { sessionId, atStep } 
      });
    }

    return !!updated;
  }

  public async resumeSession(sessionId: string): Promise<SessionState | null> {
    const session = await this.getSession(sessionId);
    if (!session || !session.canResume) {
      throw new SessionError('Session cannot be resumed', 'SESSION_EXPIRED', sessionId);
    }

    const updated = await this.updateSession(sessionId, {
      status: 'in_progress',
      lastActiveAt: new Date()
    });

    if (updated) {
      this.emitEvent({ 
        type: 'SESSION_RESUMED', 
        payload: { sessionId, fromStep: updated.currentStep } 
      });
    }

    return updated;
  }

  // Storage implementation methods
  private async saveSession(session: SessionState): Promise<void> {
    const promises: Promise<void>[] = [];

    // Save to localStorage if enabled
    if (this.config.enableLocalStorage) {
      promises.push(this.saveToLocalStorage(session));
    }

    // Save to Firestore if enabled and user is authenticated
    if (this.config.enableFirestoreSync && auth.currentUser) {
      promises.push(this.saveToFirestore(session));
    }

    await Promise.all(promises);
  }

  private async saveToLocalStorage(session: SessionState): Promise<void> {
    try {
      const key = `cvplus_session_${session.sessionId}`;
      const data = this.serializeSession(session);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new SessionError('Failed to save to local storage', 'STORAGE_UNAVAILABLE');
    }
  }

  private async saveToFirestore(session: SessionState): Promise<void> {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'sessions', session.sessionId);
      const firestoreData = {
        ...session,
        lastActiveAt: serverTimestamp(),
        createdAt: session.createdAt ? session.createdAt : serverTimestamp(),
        lastSyncAt: serverTimestamp()
      };

      await setDoc(docRef, firestoreData);
      
      // Update session to mark as synced
      session.isSynced = true;
      session.lastSyncAt = new Date();
      
      this.emitEvent({ 
        type: 'SESSION_SYNCED', 
        payload: { sessionId: session.sessionId, syncedAt: new Date() } 
      });
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw new SessionError('Failed to sync to cloud', 'SYNC_FAILED', session.sessionId, true);
    }
  }

  private getFromLocalStorage(sessionId: string): SessionState | null {
    try {
      const key = `cvplus_session_${sessionId}`;
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      return this.deserializeSession(data);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  private async getFromFirestore(sessionId: string): Promise<SessionState | null> {
    if (!auth.currentUser) return null;

    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'sessions', sessionId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          sessionId,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
          lastSyncAt: data.lastSyncAt?.toDate()
        } as SessionState;
      }
      
      return null;
    } catch (error) {
      console.error('Error reading from Firestore:', error);
      return null;
    }
  }

  private async deleteFromLocalStorage(sessionId: string): Promise<void> {
    const key = `cvplus_session_${sessionId}`;
    localStorage.removeItem(key);
  }

  private async deleteFromFirestore(sessionId: string): Promise<void> {
    if (!auth.currentUser) return;
    
    try {
      const docRef = doc(db, 'users', auth.currentUser.uid, 'sessions', sessionId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting from Firestore:', error);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateProgress(step: CVStep): number {
    const stepOrder: CVStep[] = [
      'upload', 'processing', 'analysis', 'features', 
      'templates', 'preview', 'results', 'completed'
    ];
    const currentIndex = stepOrder.indexOf(step);
    return currentIndex >= 0 ? (currentIndex / (stepOrder.length - 1)) * 100 : 0;
  }

  private serializeSession(session: SessionState): string {
    const serializable = {
      ...session,
      createdAt: session.createdAt.toISOString(),
      lastActiveAt: session.lastActiveAt.toISOString(),
      lastSyncAt: session.lastSyncAt?.toISOString()
    };
    
    return JSON.stringify(serializable);
  }

  private deserializeSession(data: string): SessionState {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      lastActiveAt: new Date(parsed.lastActiveAt),
      lastSyncAt: parsed.lastSyncAt ? new Date(parsed.lastSyncAt) : undefined
    };
  }

  // Event system
  public addEventListener(listener: (event: SessionEvent) => void): void {
    this.eventListeners.push(listener);
  }

  public removeEventListener(listener: (event: SessionEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitEvent(event: SessionEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in session event listener:', error);
      }
    });
  }

  private setupStorageListeners(): void {
    // Listen for storage events to sync across tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key?.startsWith('cvplus_session_')) {
          const sessionId = event.key.replace('cvplus_session_', '');
          // Handle storage changes from other tabs
          this.emitEvent({ 
            type: 'SESSION_UPDATED', 
            payload: { sessionId, changes: {} } 
          });
        }
      });
    }
  }
}

export default SessionManager;