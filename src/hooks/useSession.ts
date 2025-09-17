// useSession Hook - Core React hook for session management
import { useState, useEffect, useCallback, useRef } from 'react';
import SessionManager from '../services/sessionManager';
import type { 
  SessionState, 
  SessionFormData, 
  CVStep, 
  SessionEvent
} from '../types/session';

// Define local type for session errors (unused but kept for future use)
// type SessionError = string;

interface UseSessionReturn {
  // Session state
  session: SessionState | null;
  loading: boolean;
  error: string | null;
  
  // Session operations
  createSession: (formData?: Partial<SessionFormData>) => Promise<string>;
  updateSession: (updates: Partial<SessionState>) => Promise<boolean>;
  deleteSession: () => Promise<boolean>;
  
  // Navigation operations  
  updateStep: (step: CVStep, formData?: Partial<SessionFormData>) => Promise<boolean>;
  pauseSession: () => Promise<boolean>;
  resumeSession: () => Promise<boolean>;
  
  // Form data operations
  updateFormData: (data: Partial<SessionFormData>) => Promise<boolean>;
  getFormData: <T = any>(key: keyof SessionFormData) => T | undefined;
  
  // Progress tracking
  progressPercentage: number;
  completedSteps: CVStep[];
  currentStep: CVStep | null;
  canResume: boolean;
  
  // Auto-save functionality
  enableAutoSave: (intervalMs?: number) => void;
  disableAutoSave: () => void;
  saveNow: () => Promise<boolean>;
}

interface UseSessionOptions {
  sessionId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // milliseconds
  onSessionEvent?: (event: SessionEvent) => void;
}

export const useSession = (options: UseSessionOptions = {}): UseSessionReturn => {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sessionManager = useRef(SessionManager.getInstance());
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentSessionId = useRef<string | null>(options.sessionId || null);

  // Initialize session
  useEffect(() => {
    if (options.sessionId) {
      loadSession(options.sessionId);
    }
  }, [options.sessionId]);

  // Set up event listener
  useEffect(() => {
    const handleSessionEvent = (event: SessionEvent) => {
      // Update local state based on events
      if (event.payload.sessionId === currentSessionId.current) {
        switch (event.type) {
          case 'SESSION_UPDATED':
            if (currentSessionId.current) {
              loadSession(currentSessionId.current);
            }
            break;
          case 'SESSION_FAILED':
            setError(event.payload.error || 'Session operation failed');
            break;
        }
      }
      
      // Call user-provided event handler
      options.onSessionEvent?.(event);
    };

    // Add event listener for session events
    sessionManager.current.addEventListener(handleSessionEvent);
    
    return () => {
      sessionManager.current.removeEventListener(handleSessionEvent);
    };
  }, [options.onSessionEvent]);

  // Auto-save setup
  useEffect(() => {
    if (options.autoSave && session) {
      enableAutoSave(options.autoSaveInterval);
    }
    
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [options.autoSave, session]);

  // Load session
  const loadSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const loadedSession = await sessionManager.current.getSession(sessionId);
      setSession(loadedSession);
      currentSessionId.current = sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load session';
      setError(message);
      console.error('Error loading session:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (formData?: Partial<SessionFormData>): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const newSession = await sessionManager.current.createSession(formData);
      setSession(newSession);
      currentSessionId.current = newSession.sessionId;
      return newSession.sessionId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session
  const updateSession = useCallback(async (updates: Partial<SessionState>): Promise<boolean> => {
    if (!currentSessionId.current) {
      setError('No active session');
      return false;
    }

    try {
      const updatedSession = await sessionManager.current.updateSession(
        currentSessionId.current, 
        updates
      );
      
      if (updatedSession) {
        setSession(updatedSession);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session';
      setError(message);
      return false;
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const deleted = await sessionManager.current.deleteSession(currentSessionId.current);
      if (deleted) {
        setSession(null);
        currentSessionId.current = null;
        setError(null);
      }
      return deleted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session';
      setError(message);
      return false;
    }
  }, []);

  // Update step
  const updateStep = useCallback(async (
    step: CVStep, 
    formData?: Partial<SessionFormData>
  ): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const updatedSession = await sessionManager.current.updateStep(
        currentSessionId.current,
        step,
        formData
      );
      
      if (updatedSession) {
        setSession(updatedSession);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update step';
      setError(message);
      return false;
    }
  }, []);

  // Pause session
  const pauseSession = useCallback(async (): Promise<boolean> => {
    if (!currentSessionId.current || !session) return false;

    try {
      const paused = await sessionManager.current.pauseSession(
        currentSessionId.current,
        session.currentStep
      );
      
      if (paused) {
        await loadSession(currentSessionId.current);
      }
      return paused;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pause session';
      setError(message);
      return false;
    }
  }, [session, loadSession]);

  // Resume session
  const resumeSession = useCallback(async (): Promise<boolean> => {
    if (!currentSessionId.current) return false;

    try {
      const resumedSession = await sessionManager.current.resumeSession(currentSessionId.current);
      if (resumedSession) {
        setSession(resumedSession);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume session';
      setError(message);
      return false;
    }
  }, []);

  // Update form data
  const updateFormData = useCallback(async (data: Partial<SessionFormData>): Promise<boolean> => {
    if (!session) return false;

    const mergedFormData = { ...session.formData, ...data };
    return updateSession({ formData: mergedFormData });
  }, [session, updateSession]);

  // Get form data
  const getFormData = useCallback(<T = any>(key: keyof SessionFormData): T | undefined => {
    if (!session?.formData) return undefined;
    return session.formData[key] as T;
  }, [session]);

  // Auto-save functionality
  const enableAutoSave = useCallback((intervalMs = 30000) => {
    // Clear existing interval
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    // Set up new interval
    autoSaveIntervalRef.current = setInterval(() => {
      if (session && currentSessionId.current) {
        sessionManager.current.updateSession(currentSessionId.current, {
          lastActiveAt: new Date()
        }).catch(err => {
          console.warn('Auto-save failed:', err);
        });
      }
    }, intervalMs);
  }, [session]);

  const disableAutoSave = useCallback(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = undefined;
    }
  }, []);

  const saveNow = useCallback(async (): Promise<boolean> => {
    if (!session || !currentSessionId.current) return false;

    try {
      const updated = await sessionManager.current.updateSession(
        currentSessionId.current,
        { lastActiveAt: new Date() }
      );
      return !!updated;
    } catch (err) {
      console.error('Manual save failed:', err);
      return false;
    }
  }, [session]);

  return {
    // State
    session,
    loading,
    error,
    
    // Operations
    createSession,
    updateSession,
    deleteSession,
    
    // Navigation
    updateStep,
    pauseSession,
    resumeSession,
    
    // Form data
    updateFormData,
    getFormData,
    
    // Progress
    progressPercentage: session?.progressPercentage || 0,
    completedSteps: session?.completedSteps || [],
    currentStep: session?.currentStep || null,
    canResume: session?.canResume || false,
    
    // Auto-save
    enableAutoSave,
    disableAutoSave,
    saveNow
  };
};