// Session Management Components and Hooks Export
// This file provides easy access to all session-related functionality

// Core Components
export { ResumeSessionDialog } from './ResumeSessionDialog';
export { SaveProgressButton, CompactSaveButton } from './SaveProgressButton';
export { 
  SessionAwarePageWrapper, 
  SessionProgress, 
  useSessionAwarePage 
} from './SessionAwarePageWrapper';

// Hooks
export { useSession } from '../../hooks/useSession';
export { useSessionResume, useQuickResume } from '../../hooks/useSessionResume';

// Services
export { default as SessionManager } from '../../services/sessionManager';
export { default as SessionService } from '../../services/sessionService';

// Types
export type {
  SessionState,
  SessionFormData,
  CVStep,
  SessionStatus,
  SessionStorageConfig,
  ResumeSessionOptions,
  SessionMetrics,
  SessionSearchCriteria,
  SessionEvent,
  SessionError,
  SessionErrorCode
} from '../../types/session';

export type { Job, JobStatus, JobError, JobErrorCode } from '../../types/job';

// Example Components (for reference)
export {
  ProcessingPageWithSession,
  CVAnalysisPageWithSession,
  withSessionManagement
} from './SessionIntegrationExample';

// Utility functions
import { jobUtils } from '../../types/job';
export { jobUtils };

// Usage Examples and Documentation
export const USAGE_EXAMPLES = {
  // Basic session management for a page
  basicPageIntegration: `
import { SessionAwarePageWrapper } from '@/components/session';

const MyPage = () => (
  <SessionAwarePageWrapper
    step="analysis"
    jobId={jobId}
    formData={{ targetRole: 'Software Engineer' }}
    enableAutoSave={true}
    showSaveButton={true}
  >
    <div>Your page content here</div>
  </SessionAwarePageWrapper>
);`,

  // Using hooks for more control
  hooksIntegration: `
import { useSession, useSessionAwarePage } from '@/components/session';

const MyComponent = () => {
  const session = useSession({
    autoSave: true,
    autoSaveInterval: 30000
  });

  const sessionPage = useSessionAwarePage({
    step: 'templates',
    jobId: 'job-123',
    formData: { selectedTemplateId: 'template-1' }
  });

  return (
    <div>
      Progress: {sessionPage.progressPercentage}%
      <button onClick={() => sessionPage.saveNow()}>
        Save Now
      </button>
    </div>
  );
};`,

  // Resume session detection
  resumeIntegration: `
import { useSessionResume, ResumeSessionDialog } from '@/components/session';

const HomePage = () => {
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  
  const sessionResume = useSessionResume({
    onSessionDetected: (sessions) => {
      if (sessions.length > 0) {
        setShowResumeDialog(true);
      }
    },
    onResumeSuccess: (session, resumeUrl) => {
      window.location.href = resumeUrl;
    }
  });

  return (
    <div>
      <ResumeSessionDialog
        isOpen={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        sessions={sessionResume.resumableSessions}
        onResume={(sessionId) => sessionResume.resumeSession(sessionId)}
        onDelete={(sessionId) => sessionResume.dismissSession(sessionId)}
      />
    </div>
  );
};`,

  // Manual save button
  saveButtonIntegration: `
import { SaveProgressButton } from '@/components/session';

const MyForm = () => {
  const handleSave = async () => {
    // Your save logic here
    return true; // Return success status
  };

  return (
    <div>
      <SaveProgressButton
        onSave={handleSave}
        variant="primary"
        size="md"
        showAutoSaveStatus={true}
        autoSaveEnabled={true}
        lastSavedAt={new Date()}
      />
    </div>
  );
};`,

  // Progress tracking
  progressIntegration: `
import { SessionProgress } from '@/components/session';

const MyPage = () => (
  <SessionProgress
    currentStep="templates"
    completedSteps={['upload', 'processing', 'analysis']}
    progressPercentage={60}
    className="sticky top-0"
  />
);`
};

// Configuration recommendations
export const CONFIG_RECOMMENDATIONS = {
  // Recommended auto-save intervals by page type
  autoSaveIntervals: {
    upload: 10000,      // 10 seconds - frequent saves during file operations
    processing: 30000,   // 30 seconds - less frequent during automated processing
    analysis: 15000,     // 15 seconds - moderate during user interaction
    features: 20000,     // 20 seconds - save feature selections
    templates: 25000,    // 25 seconds - template selections less critical
    preview: 30000,      // 30 seconds - preview changes less frequent
    results: 60000,      // 1 minute - results are mostly read-only
    keywords: 15000      // 15 seconds - frequent during keyword editing
  },

  // Storage configuration
  storage: {
    localStorageRetentionDays: 30,
    firestoreRetentionDays: 90,
    compressData: true,
    compressionThreshold: 10240, // 10KB
    enableFirestoreSync: true,
    syncOnNetworkReconnect: true
  },

  // Resume behavior
  resume: {
    showConfirmationDialog: true,
    restoreFormData: true,
    navigateToStep: true,
    mergeWithCurrentState: false,
    clearOldSession: false
  }
};

// Integration checklist
export const INTEGRATION_CHECKLIST = [
  'Import session components and hooks',
  'Wrap pages with SessionAwarePageWrapper or use useSessionAwarePage hook',
  'Define appropriate CVStep for each page',
  'Configure auto-save intervals based on page complexity',
  'Add manual save buttons where needed',
  'Implement session resume detection on entry points (HomePage, etc.)',
  'Update Job interface to include session metadata',
  'Add progress indicators for better UX',
  'Handle error states and offline scenarios',
  'Test session persistence across browser tabs and refreshes',
  'Verify data synchronization between localStorage and Firestore',
  'Test resume functionality from various steps',
  'Validate form data preservation and restoration',
  'Ensure proper cleanup of expired sessions'
];

// Performance tips
export const PERFORMANCE_TIPS = [
  'Use auto-save intervals appropriate to user interaction frequency',
  'Implement debouncing for form field auto-saves',
  'Compress large session data before storage',
  'Clean up expired sessions regularly',
  'Use lazy loading for session restoration',
  'Minimize session data size by excluding unnecessary fields',
  'Implement proper error boundaries around session operations',
  'Use React.memo for session-aware components to prevent unnecessary re-renders',
  'Consider using Web Workers for heavy session data processing',
  'Monitor session storage usage and implement limits'
];