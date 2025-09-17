/**
 * useSession Hook
 * 
 * Hook for managing user sessions and session-related functionality.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { SessionService } from '../services/session.service';
import { AuthSession } from '../types';

// Define missing types locally until they're available
interface SessionInfo {
  id: string;
  userId: string;
  startTime: string;
  expiresAt?: string;
  isActive: boolean;
}

interface ActivityLog {
  id: string;
  userId: string;
  activity: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface UseSessionReturn {
  // State
  sessionInfo: SessionInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Session management
  refreshSession: () => Promise<void>;
  endSession: () => Promise<void>;
  extendSession: (duration?: number) => Promise<void>;
  
  // Session info
  sessionDuration: number | null;
  isSessionActive: boolean;
  sessionExpiresAt: Date | null;
  timeUntilExpiry: number | null;
  
  // Activity tracking
  activityLog: ActivityLog[];
  lastActivity: Date | null;
  recordActivity: (activity: string, metadata?: Record<string, any>) => Promise<void>;
  
  // Session health
  isSessionHealthy: boolean;
  sessionWarnings: string[];
}

/**
 * Session management hook
 */
export function useSession(): UseSessionReturn {
  const { state, actions } = useAuthContext();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // Clear error helper
  const clearError = () => setError(null);

  // Load session info
  const loadSessionInfo = async () => {
    if (!state.user) {
      setSessionInfo(null);
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      // Use available SessionService methods
      const sessionService = new SessionService({});
      const currentSession = sessionService.getCurrentSession();
      
      // Convert AuthSession to SessionInfo for compatibility
      const sessionInfo: SessionInfo | null = currentSession ? {
        id: currentSession.sessionId,
        userId: currentSession.uid,
        startTime: new Date(currentSession.startTime).toISOString(),
        expiresAt: new Date(currentSession.expiresAt).toISOString(),
        isActive: currentSession.expiresAt > Date.now()
      } : null;
      
      setSessionInfo(sessionInfo);
      
      // Activity loading not available in current SessionService
      // TODO: Implement when getRecentActivity method is available
      setActivityLog([]);
      
    } catch (err: any) {
      setError(err.message || 'Failed to load session info');
    } finally {
      setIsLoading(false);
    }
  };

  // Session management methods
  const refreshSession = async (): Promise<void> => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    try {
      clearError();
      const sessionService = new SessionService({});
      await sessionService.refreshSession();
      await actions.refreshSession(); // Refresh auth context
      await loadSessionInfo(); // Reload session info
    } catch (err: any) {
      setError(err.message || 'Failed to refresh session');
      throw err;
    }
  };

  const endSession = async (): Promise<void> => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    try {
      clearError();
      const sessionService = new SessionService({});
      await sessionService.endSession();
      setSessionInfo(null);
      setActivityLog([]);
    } catch (err: any) {
      setError(err.message || 'Failed to end session');
      throw err;
    }
  };

  const extendSession = async (duration: number = 3600): Promise<void> => {
    if (!state.user) {
      throw new Error('No authenticated user');
    }

    try {
      clearError();
      // Note: extendSession method not available in current SessionService
      // TODO: Implement when method is available
      console.warn('extendSession not implemented');
      await loadSessionInfo();
    } catch (err: any) {
      setError(err.message || 'Failed to extend session');
      throw err;
    }
  };

  const recordActivity = async (activity: string, metadata?: Record<string, any>): Promise<void> => {
    if (!state.user) {
      return; // Silent fail for activity recording
    }

    try {
      // Note: recordActivity method not available in current SessionService
      // TODO: Implement when method is available
      
      // Add to local activity log
      const newActivity: ActivityLog = {
        id: Date.now().toString(),
        userId: state.user.uid,
        activity,
        metadata,
        timestamp: new Date()
      };
      
      setActivityLog(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
    } catch (err: any) {
      console.warn('Failed to record activity:', err.message);
    }
  };

  // Computed properties
  const sessionDuration = sessionInfo ? 
    Date.now() - new Date(sessionInfo.startTime).getTime() : null;

  const isSessionActive = sessionInfo?.isActive || false;

  const sessionExpiresAt = sessionInfo?.expiresAt ? 
    new Date(sessionInfo.expiresAt) : null;

  const timeUntilExpiry = sessionExpiresAt ? 
    Math.max(0, sessionExpiresAt.getTime() - Date.now()) : null;

  const lastActivity = activityLog.length > 0 ? activityLog[0].timestamp : null;

  // Session health checks
  const isSessionHealthy = (() => {
    if (!sessionInfo || !isSessionActive) return false;
    
    // Check if session is expired
    if (sessionExpiresAt && sessionExpiresAt.getTime() < Date.now()) {
      return false;
    }
    
    // Check if there's been recent activity (within last hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (lastActivity && lastActivity.getTime() < oneHourAgo) {
      return false;
    }
    
    return true;
  })();

  const sessionWarnings: string[] = (() => {
    const warnings: string[] = [];
    
    if (!isSessionActive) {
      warnings.push('Session is not active');
    }
    
    if (timeUntilExpiry && timeUntilExpiry < 15 * 60 * 1000) { // 15 minutes
      warnings.push('Session expires soon');
    }
    
    if (lastActivity) {
      const timeSinceActivity = Date.now() - lastActivity.getTime();
      if (timeSinceActivity > 30 * 60 * 1000) { // 30 minutes
        warnings.push('No recent activity detected');
      }
    }
    
    return warnings;
  })();

  // Effects
  useEffect(() => {
    if (state.user) {
      loadSessionInfo();
    } else {
      setSessionInfo(null);
      setActivityLog([]);
    }
  }, [state.user]);

  // Auto-refresh session info periodically
  useEffect(() => {
    if (!state.user) return;

    const interval = setInterval(() => {
      loadSessionInfo();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [state.user]);

  // Record page view activity
  useEffect(() => {
    if (state.user) {
      recordActivity('page_view', { 
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    }
  }, [state.user, window.location.href]);

  return {
    // State
    sessionInfo,
    isLoading,
    error,

    // Session management
    refreshSession,
    endSession,
    extendSession,

    // Session info
    sessionDuration,
    isSessionActive,
    sessionExpiresAt,
    timeUntilExpiry,

    // Activity tracking
    activityLog,
    lastActivity,
    recordActivity,

    // Session health
    isSessionHealthy,
    sessionWarnings
  };
}