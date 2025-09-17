import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { URLInput } from '../components/URLInput';
import { SignInDialog } from '../components/SignInDialog';
import { UserMenu } from '../components/UserMenu';
import { Logo } from '../components/Logo';
import { ResumeSessionDialog } from '../components/session/ResumeSessionDialog';
import { useAuth } from '../contexts/AuthContext';
import { useHelp } from '../contexts/HelpContext';
import { HelpTooltip } from '../components/help/HelpTooltip';
import { HelpOverlay } from '../components/help/HelpOverlay';
import { InteractiveTour } from '../components/help/InteractiveTour';
import { useSessionResume } from '../hooks/useSessionResume';
import { useSession } from '../hooks/useSession';
import { uploadCV, createJob } from '../services/cvService';
import { FileText, Globe, Sparkles, Menu, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const { actions } = useHelp();
  
  // Original state
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'file' | 'url', data: unknown } | null>(null);
  const [userInstructions, setUserInstructions] = useState<string>('');

  // Session management state
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Session hooks
  const sessionResume = useSessionResume({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    excludeCompleted: true,
    maxSessions: 5,
    onSessionDetected: (sessions) => {
      // Show resume dialog if we have resumable sessions and user hasn't dismissed them
      const hasShownDialog = sessionStorage.getItem('cvplus_resume_dialog_shown');
      if (sessions.length > 0 && !hasShownDialog) {
        setShowResumeDialog(true);
        sessionStorage.setItem('cvplus_resume_dialog_shown', 'true');
      }
    },
    onResumeSuccess: (session, resumeUrl) => {
      toast.success(`Resuming from ${session.currentStep}...`);
      window.location.href = resumeUrl; // Full page navigation to ensure clean state
    },
    onResumeError: (error, sessionId) => {
      toast.error(`Failed to resume session: ${error}`);
      console.error('Resume error:', error, sessionId);
    }
  });

  const session = useSession({
    autoSave: true,
    autoSaveInterval: 30000 // 30 seconds
  });

  // Clear resume dialog flag when page loads and set help context
  useEffect(() => {
    sessionStorage.removeItem('cvplus_resume_dialog_shown');
    actions.setContext('home');
  }, [actions]);

  const handleFileUpload = async (file: File, quickCreate: boolean = false) => {
    try {
      setIsLoading(true);
      
      // Create session first
      const sessionId = await session.createSession({
        selectedFile: file,
        userInstructions,
        quickCreate,
        settings: quickCreate ? {
          applyAllEnhancements: true,
          generateAllFormats: true,
          enablePIIProtection: true,
          createPodcast: true,
          useRecommendedTemplate: true
        } : undefined
      });

      // Update session step
      await session.updateStep('processing');
      
      // Require authentication before file upload
      const currentUser = user;
      if (!currentUser) {
        setIsLoading(false);
        setShowSignInDialog(true);
        setPendingAction({ type: 'file', data: { file, quickCreate } });
        toast.error('Please sign in with Google to upload your CV.');
        return;
      }
      
      try {
          setPendingAction({ type: 'file', data: { file, quickCreate } });
          setShowSignInDialog(true);
          return;
        }
      }

      // Create job and upload file
      const jobId = await createJob(undefined, quickCreate, userInstructions);
      
      // Link session to job
      await session.updateSession({ jobId });
      
      await uploadCV(file, jobId);
      
      // Navigate to processing page with quick create flag
      console.log('Created session:', sessionId);
      navigate(`/process/${jobId}${quickCreate ? '?quickCreate=true' : ''}`);
    } catch (error: unknown) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload CV. Please try again.');
      
      // Update session with error
      if (session.session) {
        await session.updateSession({ 
          status: 'failed',
          lastError: error.message || 'Upload failed'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmit = async (url: string) => {
    try {
      setIsLoading(true);
      
      // Create session first
      const sessionId = await session.createSession({
        fileUrl: url,
        userInstructions,
        quickCreate: false
      });

      // Update session step
      await session.updateStep('processing');
      
      // Require authentication before URL processing
      const currentUser = user;
      if (!currentUser) {
        setIsLoading(false);
        setShowSignInDialog(true);
        setPendingAction({ type: 'url', data: url });
        toast.error('Please sign in with Google to process URLs.');
        return;
      }

      // Create job for URL
      const jobId = await createJob(url, false, userInstructions);
      
      // Link session to job
      await session.updateSession({ jobId });
      
      // Navigate to processing page
      console.log('Created session from URL:', sessionId);
      navigate(`/process/${jobId}`);
    } catch (error: unknown) {
      console.error('Error processing URL:', error);
      toast.error(error.message || 'Failed to process URL. Please try again.');
      
      // Update session with error
      if (session.session) {
        await session.updateSession({ 
          status: 'failed',
          lastError: error.message || 'URL processing failed'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCreate = () => {
    if (selectedFile) {
      handleFileUpload(selectedFile, true);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    handleFileUpload(file);
  };

  const handleSignInSuccess = () => {
    setShowSignInDialog(false);
    // Retry the pending action after successful sign-in
    if (pendingAction) {
      if (pendingAction.type === 'file') {
        handleFileUpload(pendingAction.data.file, pendingAction.data.quickCreate);
      }
      setPendingAction(null);
    }
  };

  const handleResumeSession = async (sessionId: string) => {
    setResumeLoading(true);
    try {
      await sessionResume.resumeSession(sessionId, {
        navigateToStep: true,
        restoreFormData: true,
        showConfirmationDialog: false,
        mergeWithCurrentState: false,
        clearOldSession: true,
        showProgressIndicator: true,
        animateTransitions: true
      });
      setShowResumeDialog(false);
    } catch (error) {
      console.error('Failed to resume session:', error);
    } finally {
      setResumeLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Remove from resume list
      await sessionResume.dismissSession(sessionId);
      toast.success('Session deleted');
    } catch {
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="small" variant="white" />
            
            {/* Resume indicator - show if there are resumable sessions */}
            {sessionResume.hasResumableSessions && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <button
                  onClick={() => setShowResumeDialog(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Resume Previous Work
                </button>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-700">
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-blue-400 font-medium">Home</a>
              <a href="/features" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">Features</a>
              <a href="/about" className="text-gray-300 hover:text-blue-400 font-medium transition-colors">About</a>
              {user ? (
                <UserMenu variant="white" />
              ) : (
                <button 
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                      toast.success('Signed in successfully!');
                    } catch {
                      toast.error('Failed to sign in');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium shadow-sm"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Quick Resume Banner */}
      {sessionResume.mostRecentSession && !showResumeDialog && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">
                Continue your CV from where you left off ({sessionResume.mostRecentSession.currentStep})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleResumeSession(sessionResume.mostRecentSession!.sessionId)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => sessionResume.dismissSession(sessionResume.mostRecentSession!.sessionId)}
                className="text-white/80 hover:text-white text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Rest of the component remains the same */}
      <main className="flex-1">
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-100 mb-6 leading-tight animate-fade-in-up">
              From Paper to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">Powerful</span>
            </h1>
            <p className="text-3xl md:text-4xl font-light text-gray-300 mb-8 animate-fade-in-up animation-delay-200">
              Your CV, Reinvented
            </p>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
              Transform your traditional CV into an interactive masterpiece with AI-powered features, stunning templates, and one-click magic
            </p>
            
            <div className="flex justify-center mb-12 animate-fade-in-up animation-delay-400">
              <button 
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 hover-glow"
              >
                Get Started Free
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mb-16 trust-indicators">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">AI-Powered</div>
                <div className="text-sm text-gray-400">CV Enhancement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">Professional</div>
                <div className="text-sm text-gray-400">Results</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">30 sec</div>
                <div className="text-sm text-gray-400">Average Time</div>
              </div>
            </div>

            {/* Upload Options */}
            <HelpOverlay helpId="home-welcome" trigger="auto" className="animate-fade-in-up animation-delay-600">
              <div id="upload-section" className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100 mb-6">Start Your Transformation</h2>
              <HelpTooltip helpId="home-upload-methods" trigger="hover" position="top">
                <div className="flex justify-center mb-8">
                  <div className="inline-flex items-center gap-6">
                    <label className="text-sm font-medium text-gray-300">Upload Method:</label>
                    <div className="inline-flex rounded-lg bg-gray-700 p-1">
                    <div
                      onClick={() => setUploadMode('file')}
                      className={`px-4 py-2 rounded-md cursor-pointer transition ${
                        uploadMode === 'file'
                          ? 'bg-gray-900 text-blue-400 shadow-sm font-medium'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FileText className="inline-block w-4 h-4 mr-2" />
                      File Upload
                    </div>
                    <div
                      onClick={() => setUploadMode('url')}
                      className={`px-4 py-2 rounded-md cursor-pointer transition ${
                        uploadMode === 'url'
                          ? 'bg-gray-900 text-blue-400 shadow-sm font-medium'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <Globe className="inline-block w-4 h-4 mr-2" />
                      URL Import
                    </div>
                    </div>
                  </div>
                </div>
              </HelpTooltip>

              {uploadMode === 'file' ? (
                <FileUpload 
                  onFileSelect={handleFileSelect} 
                  isLoading={isLoading}
                />
              ) : (
                <URLInput 
                  onSubmit={handleURLSubmit}
                  isLoading={isLoading}
                />
              )}

              {/* User Instructions Input */}
              <HelpTooltip helpId="home-instructions-field" trigger="focus" position="top">
                <div className="mt-6">
                  <label htmlFor="userInstructions" className="block text-left text-sm font-medium text-gray-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                <div className="relative">
                  <textarea
                    id="userInstructions"
                    value={userInstructions}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setUserInstructions(e.target.value);
                      }
                    }}
                    placeholder="E.g., 'Focus on my leadership experience', 'Highlight Python skills', 'Make it suitable for tech startups', 'Emphasize remote work experience'..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-gray-400"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {userInstructions.length}/500
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Provide specific instructions to customize how AI analyzes and enhances your CV
                </p>
              </div>
              </HelpTooltip>

              {/* Quick Create Button */}
              {selectedFile && (
                <HelpTooltip helpId="home-quick-create" trigger="hover" position="top">
                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        File selected: {selectedFile.name}
                      </span>
                      <button
                        onClick={handleQuickCreate}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Sparkles className="inline-block w-4 h-4 mr-2" />
                        Just Create My CV
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Automatically applies all enhancements and generates all formats
                    </p>
                  </div>
                </HelpTooltip>
              )}
            </div>
            </HelpOverlay>

          </div>
        </section>

        {/* Rest of the sections remain the same as original HomePage */}
        {/* ... (Features Section, How it Works Section, etc.) */}
        
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 CVPlus. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Dialogs */}
      <SignInDialog 
        isOpen={showSignInDialog}
        onClose={() => setShowSignInDialog(false)}
        onSuccess={handleSignInSuccess}
      />

      <ResumeSessionDialog
        isOpen={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        sessions={sessionResume.resumableSessions}
        onResume={handleResumeSession}
        onDelete={handleDeleteSession}
        loading={resumeLoading}
      />

      {/* Interactive Tour for First-Time Users */}
      <InteractiveTour tourId="first-time-user" autoStart={false} />
    </div>
  );
};