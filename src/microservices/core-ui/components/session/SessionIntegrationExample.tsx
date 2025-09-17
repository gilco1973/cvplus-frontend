// Example of how to integrate session management with existing pages
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SessionAwarePageWrapper, SessionProgress, useSessionAwarePage } from './SessionAwarePageWrapper';
import { useSession } from '../../hooks/useSession';
import type { Job } from '../../types/job';
import type { CVStep, SessionFormData } from '../../types/session';

// Example 1: Using SessionAwarePageWrapper (Higher-Order Component approach)
export const ProcessingPageWithSession: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job] = useState<Job | null>(null);
  const [processingStep] = useState<string>('uploading');
  
  // Suppress unused variable warnings
  void job;
  void processingStep;

  // Form data that should be preserved
  const formData: Partial<SessionFormData> = {
    targetRole: 'Software Engineer',
    userInstructions: 'Focus on backend development',
    // ... other form fields
  };

  const handleSessionUpdate = (changes: unknown) => {
    console.log('Session updated:', changes);
    // Handle session updates if needed
  };

  const handleStepChange = (newStep: CVStep) => {
    console.log('Step changed to:', newStep);
    // Handle step transitions
  };

  return (
    <SessionAwarePageWrapper
      step="processing"
      jobId={jobId}
      formData={formData}
      enableAutoSave={true}
      autoSaveInterval={30000}
      showSaveButton={true}
      saveButtonVariant="compact"
      onSessionUpdate={handleSessionUpdate}
      onStepChange={handleStepChange}
      className="min-h-screen bg-gray-50"
    >
      {/* Session Progress Indicator */}
      <SessionProgress
        currentStep="processing"
        completedSteps={['upload']}
        progressPercentage={25}
        className="sticky top-16"
      />

      {/* Your existing page content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Processing Your CV
          </h1>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Analyzing Your CV with AI
              </h2>
              <p className="text-gray-600">
                This usually takes 30-60 seconds. Your progress is being saved automatically.
              </p>
            </div>

            {/* Processing steps with auto-save integration */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Processing Steps:</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                  <span className="text-gray-700">File uploaded and validated</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-gray-700">Extracting content and structure</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">3</div>
                  <span className="text-gray-500">AI analysis and enhancement recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">4</div>
                  <span className="text-gray-500">Preparing personalized suggestions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SessionAwarePageWrapper>
  );
};

// Example 2: Using useSessionAwarePage hook (more flexible approach)
export const CVAnalysisPageWithSession: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [analysisData] = useState<any>(null);
  
  // Suppress unused variable warnings
  void analysisData;
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Use session hook directly for more control
  const sessionPage = useSessionAwarePage({
    step: 'analysis',
    jobId,
    formData: {
      targetRole: selectedRole,
      industryKeywords: keywords,
      // ... other form data
    },
    enableAutoSave: true,
    autoSaveInterval: 15000 // Save every 15 seconds during analysis
  });

  // Handle form changes and trigger auto-save
  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    
    // Update session with new form data
    await sessionPage.updateFormData({
      targetRole: newRole
    });
  };

  const handleKeywordChange = async (newKeywords: string[]) => {
    setKeywords(newKeywords);
    
    // Update session with new form data
    await sessionPage.updateFormData({
      industryKeywords: newKeywords
    });
  };

  // Manual save functionality
  const handleSave = async () => {
    const success = await sessionPage.saveNow();
    if (success) {
      // Show success message
      console.log('Progress saved successfully');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom header with session info */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CV Analysis</h1>
              <p className="text-gray-600">Step 3 of 7 • {Math.round(sessionPage.progressPercentage)}% complete</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {sessionPage.session && (
                <div className="text-sm text-gray-500">
                  Last saved: {sessionPage.session.lastActiveAt.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={sessionPage.loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {sessionPage.loading ? 'Saving...' : 'Save Progress'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content with session-aware forms */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                AI Analysis Results
              </h2>
              {/* Analysis content */}
            </div>
          </div>

          {/* Configuration Panel with session integration */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Target Role
              </h3>
              <input
                type="text"
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                Changes are saved automatically
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Keywords
              </h3>
              {/* Keyword selection component */}
              <div className="space-y-2">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
                    <span className="text-blue-800">{keyword}</span>
                    <button
                      onClick={() => handleKeywordChange(keywords.filter((_, i) => i !== index))}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Session status indicator */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Session Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${sessionPage.session?.isSynced ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-gray-700">
                    {sessionPage.session?.isSynced ? 'Synced' : 'Saving...'}
                  </span>
                </div>
              </div>
              {sessionPage.error && (
                <div className="text-red-600 text-xs mt-2">
                  Error: {sessionPage.error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 3: Simple session integration for existing components
export const withSessionManagement = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  step: CVStep,
  options?: {
    enableAutoSave?: boolean;
    autoSaveInterval?: number;
    showProgressBar?: boolean;
  }
) => {
  const SessionEnhancedComponent: React.FC<P & { jobId?: string; sessionId?: string }> = (props) => {
    const { jobId, sessionId, ...componentProps } = props;
    
    const session = useSession({
      sessionId,
      autoSave: options?.enableAutoSave ?? true,
      autoSaveInterval: options?.autoSaveInterval ?? 30000
    });

    // Update session step
    useEffect(() => {
      if (session.session) {
        session.updateStep(step);
      }
    }, [step, session]);

    return (
      <div>
        {options?.showProgressBar && session.session && (
          <SessionProgress
            currentStep={session.session.currentStep}
            completedSteps={session.session.completedSteps}
            progressPercentage={session.progressPercentage}
          />
        )}
        <WrappedComponent {...(componentProps as P)} />
      </div>
    );
  };

  return SessionEnhancedComponent;
};

// Usage of HOC
// Commented out to avoid unused variable warning
/*
const EnhancedTemplatesPage = withSessionManagement(
  // Your existing TemplatesPage component
  ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  'templates',
  {
    enableAutoSave: true,
    showProgressBar: true,
    autoSaveInterval: 20000
  }
);
*/