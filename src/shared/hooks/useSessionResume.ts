// useSessionResume Hook - Detects and manages resumable sessions
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SessionService from '../services/sessionService';
import type { SessionState, ResumeSessionOptions } from '../types/session';

interface UseSessionResumeReturn {
  // Available sessions
  resumableSessions: SessionState[];
  loading: boolean;
  error: string | null;
  
  // Resume operations
  resumeSession: (sessionId: string, options?: ResumeSessionOptions) => Promise<{
    session: SessionState;
    resumeUrl: string;
  } | null>;
  
  // Session management
  refreshSessions: () => Promise<void>;
  dismissSession: (sessionId: string) => Promise<void>;
  
  // Utility
  hasResumableSessions: boolean;
  mostRecentSession: SessionState | null;
}

interface UseSessionResumeOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  excludeCompleted?: boolean;
  maxSessions?: number;
  onSessionDetected?: (sessions: SessionState[]) => void;
  onResumeSuccess?: (session: SessionState, resumeUrl: string) => void;
  onResumeError?: (error: string, sessionId: string) => void;
}

export const useSessionResume = (options: UseSessionResumeOptions = {}): UseSessionResumeReturn => {
  const [resumableSessions, setResumableSessions] = useState<SessionState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const sessionService = new SessionService();

  // Load resumable sessions
  const loadResumableSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const sessions = await sessionService.findResumableSessions(user?.uid);
      
      // Filter options
      let filteredSessions = sessions;
      
      if (options.excludeCompleted) {
        filteredSessions = filteredSessions.filter(s => s.status !== 'completed');
      }
      
      if (options.maxSessions) {
        filteredSessions = filteredSessions.slice(0, options.maxSessions);
      }

      setResumableSessions(filteredSessions);
      
      // Trigger callback if sessions detected
      if (filteredSessions.length > 0 && options.onSessionDetected) {
        options.onSessionDetected(filteredSessions);
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load resumable sessions';
      setError(message);
      console.error('Error loading resumable sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, options.excludeCompleted, options.maxSessions, options.onSessionDetected, sessionService]);

  // Initial load
  useEffect(() => {
    loadResumableSessions();
  }, [loadResumableSessions]);

  // Auto-refresh setup
  useEffect(() => {
    if (!options.autoRefresh) return;

    const interval = setInterval(() => {
      loadResumableSessions();
    }, options.refreshInterval || 60000); // Default: 1 minute

    return () => clearInterval(interval);
  }, [options.autoRefresh, options.refreshInterval, loadResumableSessions]);

  // Resume session
  const resumeSession = useCallback(async (
    sessionId: string, 
    resumeOptions?: ResumeSessionOptions
  ): Promise<{ session: SessionState; resumeUrl: string } | null> => {
    try {
      setError(null);
      
      const result = await sessionService.resumeSessionWithOptions(sessionId, resumeOptions);
      
      // Remove resumed session from the list
      setResumableSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      
      // Trigger success callback
      if (options.onResumeSuccess) {
        options.onResumeSuccess(result.session, result.resumeUrl);
      }
      
      return result;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume session';
      setError(message);
      
      // Trigger error callback
      if (options.onResumeError) {
        options.onResumeError(message, sessionId);
      }
      
      console.error('Error resuming session:', err);
      return null;
    }
  }, [sessionService, options.onResumeSuccess, options.onResumeError]);

  // Refresh sessions manually
  const refreshSessions = useCallback(async () => {
    await loadResumableSessions();
  }, [loadResumableSessions]);

  // Dismiss a session (remove from list without deleting)
  const dismissSession = useCallback(async (sessionId: string) => {
    setResumableSessions(prev => prev.filter(s => s.sessionId !== sessionId));
  }, []);

  // Computed values
  const hasResumableSessions = resumableSessions.length > 0;
  const mostRecentSession = resumableSessions.length > 0 
    ? resumableSessions.reduce((most, current) => 
        current.lastActiveAt > most.lastActiveAt ? current : most
      )
    : null;

  return {
    resumableSessions,
    loading,
    error,
    resumeSession,
    refreshSessions,
    dismissSession,
    hasResumableSessions,
    mostRecentSession
  };
};

// Additional utility hook for specific resume scenarios
interface UseQuickResumeOptions {
  onResumeReady?: (sessionId: string, resumeUrl: string) => void;
  autoResumeThreshold?: number; // minutes since last activity
}

export const useQuickResume = (options: UseQuickResumeOptions = {}) => {
  const [quickResumeSession, setQuickResumeSession] = useState<{
    sessionId: string;
    resumeUrl: string;
  } | null>(null);

  const sessionResume = useSessionResume({
    maxSessions: 1,
    excludeCompleted: true,
    onSessionDetected: (sessions) => {
      if (sessions.length === 0) return;
      
      const session = sessions[0];
      const minutesAgo = (Date.now() - session.lastActiveAt.getTime()) / (1000 * 60);
      
      // Check if session is recent enough for quick resume
      const threshold = options.autoResumeThreshold || 60; // 1 hour default
      if (minutesAgo <= threshold) {
        const sessionService = new SessionService();
        const resumeUrl = sessionService['generateResumeUrl'](session); // Access private method - would need to make public
        
        setQuickResumeSession({
          sessionId: session.sessionId,
          resumeUrl
        });
        
        if (options.onResumeReady) {
          options.onResumeReady(session.sessionId, resumeUrl);
        }
      }
    }
  });

  const executeQuickResume = useCallback(async () => {
    if (!quickResumeSession) return null;
    
    const result = await sessionResume.resumeSession(quickResumeSession.sessionId, {
      navigateToStep: true,
      showConfirmationDialog: false,
      restoreFormData: true,
      mergeWithCurrentState: false,
      clearOldSession: true,
      showProgressIndicator: true,
      animateTransitions: true
    });
    
    setQuickResumeSession(null);
    return result;
  }, [quickResumeSession, sessionResume]);

  return {
    ...sessionResume,
    quickResumeSession,
    executeQuickResume,
    hasQuickResume: !!quickResumeSession
  };
};