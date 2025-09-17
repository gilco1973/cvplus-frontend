// SessionAwarePage - Wrapper component for enhanced session management
import React, { useEffect, useState, ReactNode } from 'react';
import {
  EnhancedSessionState,
  CVStep,
  NavigationContext
} from '../types/session';
import { useEnhancedSession } from '../hooks/useEnhancedSession';
import { useOfflineSession } from '../hooks/useOfflineSession';
import NavigationStateManager from '../services/navigation/navigationStateManager';
import SessionStatusIndicator from './SessionStatusIndicator';
import SessionResumePrompt from './SessionResumePrompt';
import NavigationBreadcrumbs from './NavigationBreadcrumbs';

export interface SessionAwarePageProps {
  children: ReactNode;
  sessionId: string;
  currentStep: CVStep;
  requiresSession?: boolean;
  enableOfflineMode?: boolean;
  showNavigationBreadcrumbs?: boolean;
  showStatusIndicator?: boolean;
  showResumePrompt?: boolean;
  onSessionError?: (error: Error) => void;
  onStepChange?: (step: CVStep, context: NavigationContext) => void;
}

export const SessionAwarePage: React.FC<SessionAwarePageProps> = ({
  children,
  sessionId,
  currentStep,
  requiresSession = true,
  enableOfflineMode = true,
  showNavigationBreadcrumbs = true,
  showStatusIndicator = true,
  showResumePrompt = true,
  onSessionError,
  onStepChange
}) => {
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const {
    session,
    isLoading: sessionLoading,
    error: sessionError,
    updateStepProgress,
    resumeSession,
    hasUnsavedChanges
  } = useEnhancedSession(sessionId);

  const {
    isOffline,
    syncStatus,
    enableOffline,
    queueAction
  } = useOfflineSession();

  const navigationManager = NavigationStateManager.getInstance();

  // Initialize session awareness
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Enable offline mode if requested and supported
        if (enableOfflineMode && !isOffline) {
          await enableOffline(sessionId);
        }

        // Get navigation context
        const context = await navigationManager.getNavigationContext(sessionId);
        setNavigationContext(context);

        // Update current step if different
        if (session && session.currentStep !== currentStep) {
          await updateStepProgress(currentStep, { status: 'in_progress' });
        }

        // Notify parent of step change
        if (onStepChange && context) {
          onStepChange(currentStep, context);
        }

        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Session initialization failed');
        setError(error);
        onSessionError?.(error);
        setIsLoading(false);
      }
    };

    if (sessionId && !sessionLoading) {
      initialize();
    }
  }, [sessionId, currentStep, sessionLoading]);

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      setError(sessionError);
      onSessionError?.(sessionError);
    }
  }, [sessionError, onSessionError]);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.sessionId === sessionId) {
        // Handle back/forward navigation
        const navigationState = navigationManager.parseStateFromUrl(window.location.href);
        if (navigationState && navigationState.step !== currentStep) {
          updateStepProgress(navigationState.step, { status: 'in_progress' });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sessionId, currentStep]);

  // Handle page visibility changes for session management
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasUnsavedChanges) {
        // Auto-save when page becomes visible again
        queueAction({
          sessionId,
          type: 'session_update',
          payload: { lastActiveAt: new Date() },
          priority: 'normal'
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionId, hasUnsavedChanges, queueAction]);

  // Loading state
  if (isLoading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Error</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Session required but not found
  if (requiresSession && !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">🔄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">
            The session could not be loaded. This might be due to an expired session or network issues.
          </p>
          <div className="space-x-2">
            <button
              onClick={() => resumeSession()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Try Resume
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-aware-page">
      {/* Status Indicator */}
      {showStatusIndicator && (
        <SessionStatusIndicator
          session={session}
          isOffline={isOffline}
          syncStatus={syncStatus}
        />
      )}

      {/* Navigation Breadcrumbs */}
      {showNavigationBreadcrumbs && session && navigationContext && (
        <NavigationBreadcrumbs
          session={session}
          navigationContext={navigationContext}
          currentStep={currentStep}
        />
      )}

      {/* Resume Prompt */}
      {showResumePrompt && session && (
        <SessionResumePrompt
          session={session}
          onResume={resumeSession}
        />
      )}

      {/* Main Content */}
      <main className="session-aware-content">
        {children}
      </main>

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 bg-orange-500 text-white px-3 py-2 rounded-md shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Working Offline</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionAwarePage;