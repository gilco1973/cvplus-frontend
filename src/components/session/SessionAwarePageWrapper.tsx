// SessionAwarePageWrapper - Higher-order component for adding session management to pages
import React, { useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import { SaveProgressButton, CompactSaveButton } from './SaveProgressButton';
import type { CVStep, SessionFormData } from '../../types/session';

interface SessionAwarePageWrapperProps {
  children: React.ReactNode;
  step: CVStep;
  jobId?: string;
  sessionId?: string;
  formData?: Partial<SessionFormData>;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
  showSaveButton?: boolean;
  saveButtonVariant?: 'primary' | 'secondary' | 'minimal' | 'compact';
  onSessionUpdate?: (session: unknown) => void;
  onStepChange?: (newStep: CVStep) => void;
  className?: string;
}

export const SessionAwarePageWrapper: React.FC<SessionAwarePageWrapperProps> = ({
  children,
  step,
  jobId,
  sessionId,
  formData,
  enableAutoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  showSaveButton = true,
  saveButtonVariant = 'compact',
  onSessionUpdate,
  onStepChange,
  className = ''
}) => {
  const session = useSession({
    sessionId,
    autoSave: enableAutoSave,
    autoSaveInterval,
    onSessionEvent: (event) => {
      if (event.type === 'SESSION_UPDATED' && onSessionUpdate) {
        // Reload session data
        if (event.payload.sessionId === session.session?.sessionId) {
          onSessionUpdate(event.payload.changes);
        }
      }
    }
  });

  // Update session when step or form data changes
  useEffect(() => {
    if (session.session && (formData || step !== session.session.currentStep)) {
      session.updateStep(step, formData);
    }
  }, [step, formData, session]);

  // Update session with job ID when available
  useEffect(() => {
    if (session.session && jobId && session.session.jobId !== jobId) {
      session.updateSession({ jobId });
    }
  }, [jobId, session]);

  // Handle manual save
  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!session.session) return false;
    
    try {
      const success = await session.saveNow();
      if (success && onStepChange) {
        onStepChange(step);
      }
      return success;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  }, [session, step, onStepChange]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session.session) {
        // Use synchronous save for unload events
        session.saveNow();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session]);

  return (
    <div className={className}>
      {/* Save Button Header */}
      {showSaveButton && session.session && (
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Step: {step} • Progress: {Math.round(session.progressPercentage)}%
              </div>
              {session.session.jobId && (
                <div className="text-xs text-gray-500">
                  Job: {session.session.jobId.slice(-8)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {saveButtonVariant === 'compact' ? (
                <CompactSaveButton
                  onSave={handleSave}
                  disabled={session.loading}
                  lastSavedAt={session.session.lastActiveAt}
                />
              ) : (
                <SaveProgressButton
                  onSave={handleSave}
                  disabled={session.loading}
                  variant={saveButtonVariant}
                  size="sm"
                  autoSaveEnabled={enableAutoSave}
                  lastSavedAt={session.session.lastActiveAt}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* Session Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && session.session && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded-lg max-w-sm">
          <div className="font-mono space-y-1">
            <div>Session: {session.session.sessionId.slice(-8)}</div>
            <div>Step: {session.session.currentStep}</div>
            <div>Progress: {Math.round(session.progressPercentage)}%</div>
            <div>Auto-save: {enableAutoSave ? 'ON' : 'OFF'}</div>
            <div>Synced: {session.session.isSynced ? 'YES' : 'NO'}</div>
            {session.error && (
              <div className="text-red-400">Error: {session.error}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Hook version for more flexible integration
export const useSessionAwarePage = (options: {
  step: CVStep;
  jobId?: string;
  sessionId?: string;
  formData?: Partial<SessionFormData>;
  enableAutoSave?: boolean;
  autoSaveInterval?: number;
}) => {
  const session = useSession({
    sessionId: options.sessionId,
    autoSave: options.enableAutoSave ?? true,
    autoSaveInterval: options.autoSaveInterval ?? 30000
  });

  // Update session when step or form data changes
  useEffect(() => {
    if (session.session && (options.formData || options.step !== session.session.currentStep)) {
      session.updateStep(options.step, options.formData);
    }
  }, [options.step, options.formData, session]);

  // Update session with job ID when available
  useEffect(() => {
    if (session.session && options.jobId && session.session.jobId !== options.jobId) {
      session.updateSession({ jobId: options.jobId });
    }
  }, [options.jobId, session]);

  const saveNow = useCallback(async (): Promise<boolean> => {
    return await session.saveNow();
  }, [session]);

  return {
    session: session.session,
    loading: session.loading,
    error: session.error,
    progressPercentage: session.progressPercentage,
    saveNow,
    updateFormData: session.updateFormData,
    canResume: session.canResume
  };
};

// Progress indicator component
interface SessionProgressProps {
  currentStep: CVStep;
  completedSteps: CVStep[];
  progressPercentage: number;
  className?: string;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  currentStep,
  completedSteps,
  progressPercentage,
  className = ''
}) => {
  const allSteps: CVStep[] = [
    'upload', 'processing', 'analysis', 'features', 
    'templates', 'preview', 'results', 'completed'
  ];

  const stepNames: Record<CVStep, string> = {
    upload: 'Upload',
    processing: 'Processing',
    analysis: 'Analysis',
    features: 'Features',
    templates: 'Templates',
    preview: 'Preview',
    results: 'Results',
    keywords: 'Keywords',
    completed: 'Complete'
  };

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {allSteps.slice(0, -1).map((step, index) => {
            const isCompleted = completedSteps.includes(step);
            const isCurrent = currentStep === step;
            const isAccessible = isCompleted || isCurrent || 
              (index > 0 && completedSteps.includes(allSteps[index - 1]));

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      isCompleted 
                        ? 'bg-green-600 text-white' 
                        : isCurrent 
                        ? 'bg-blue-600 text-white'
                        : isAccessible
                        ? 'bg-gray-300 text-gray-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div 
                    className={`text-xs mt-1 text-center ${
                      isCurrent ? 'text-blue-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {stepNames[step]}
                  </div>
                </div>
                {index < allSteps.length - 2 && (
                  <div 
                    className={`flex-1 h-0.5 mx-2 ${
                      completedSteps.includes(allSteps[index + 1]) || 
                      (currentStep === allSteps[index + 1] && isCompleted)
                        ? 'bg-green-600' 
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};