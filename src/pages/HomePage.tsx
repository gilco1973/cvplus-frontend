import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { URLInput } from '../components/URLInput';
import { SignInDialog } from '../components/SignInDialog';
import { HeroSection } from '../components/HeroSection';
import { Section } from '../components/layout/Section';
import { useAuth } from '../contexts/AuthContext';
import { uploadCV, createJob, createDevelopmentJob } from '../services/cvService';
import { FileText, Globe, Sparkles, Code2, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage, logError } from '../utils/errorHandling';
import { isDevelopmentMode } from '../utils/developmentMode';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'file' | 'url' | 'development', data: unknown } | null>(null);
  const [userInstructions, setUserInstructions] = useState<string>('');

  const handleFileUpload = async (file: File, quickCreate = false) => {
    try {
      setIsLoading(true);
      
      // In development mode, automatically sign in anonymously if not authenticated
      let currentUser = user;
      if (!currentUser && isDevelopmentMode()) {
        console.log('🔧 Development mode: Auto-signing in anonymously for file upload...');
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          // Wait a moment for auth state to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          toast.success('🔧 Development mode: Auto-signed in for file upload');
        } catch (authError) {
          console.warn('Development mode auto sign-in failed:', authError);
          setIsLoading(false);
          setShowSignInDialog(true);
          setPendingAction({ type: 'file', data: { file, quickCreate } });
          toast.error('Please sign in to upload your CV.');
          return;
        }
      }

      // Require authentication before file upload (production mode)
      if (!currentUser) {
        setIsLoading(false);
        setShowSignInDialog(true);
        setPendingAction({ type: 'file', data: { file, quickCreate } });
        toast.error('Please sign in with Google to upload your CV and access all features.');
        return;
      }

      // Create job and upload file
      const jobId = await createJob(undefined, quickCreate, userInstructions);
      await uploadCV(file, jobId);
      
      // Navigate to processing page for CV analysis
      if (quickCreate) {
        navigate(`/process/${jobId}?quickCreate=true`);
      } else {
        navigate(`/process/${jobId}`);
      }
    } catch (error: unknown) {
      logError('uploadFile', error);
      toast.error(getErrorMessage(error) || 'Failed to upload CV. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmit = async (url: string) => {
    try {
      setIsLoading(true);
      
      // In development mode, automatically sign in anonymously if not authenticated
      let currentUser = user;
      if (!currentUser && isDevelopmentMode()) {
        console.log('🔧 Development mode: Auto-signing in anonymously for URL processing...');
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          // Wait a moment for auth state to propagate
          await new Promise(resolve => setTimeout(resolve, 500));
          toast.success('🔧 Development mode: Auto-signed in for URL processing');
        } catch (authError) {
          console.warn('Development mode auto sign-in failed:', authError);
          setIsLoading(false);
          setShowSignInDialog(true);
          setPendingAction({ type: 'url', data: url });
          toast.error('Please sign in to process URLs.');
          return;
        }
      }

      // Require authentication before URL processing (production mode)
      if (!currentUser) {
        setIsLoading(false);
        setShowSignInDialog(true);
        setPendingAction({ type: 'url', data: url });
        toast.error('Please sign in with Google to process URLs and access all features.');
        return;
      }

      // Create job for URL
      const jobId = await createJob(url, false, userInstructions);
      
      // Navigate to processing page for CV analysis
      navigate(`/process/${jobId}`);
    } catch (error: unknown) {
      logError('processURL', error);
      toast.error(getErrorMessage(error) || 'Failed to process URL. Please try again.');
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

  const handleDevelopmentSkip = async () => {
    try {
      setIsLoading(true);
      
      // In development mode, automatically sign in anonymously if not authenticated
      let currentUser = user;
      if (!currentUser && isDevelopmentMode()) {
        console.log('🔧 Development mode: Auto-signing in anonymously...');
        try {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          
          // Brief delay to let auth context update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          toast.success('🔧 Development mode: Auto-signed in for testing');
        } catch (authError) {
          console.warn('Development mode auto sign-in failed:', authError);
          // Fall back to showing sign-in dialog
          setIsLoading(false);
          setShowSignInDialog(true);
          setPendingAction({ type: 'development', data: {} });
          toast.error('Please sign in to access development features.');
          return;
        }
      } else if (!currentUser) {
        // Production mode - require proper authentication
        setIsLoading(false);
        setShowSignInDialog(true);
        setPendingAction({ type: 'development', data: {} });
        toast.error('Please sign in with Google to access development features.');
        return;
      }

      // Create development job that reuses last parsed CV
      const jobId = await createDevelopmentJob(userInstructions);
      
      // Navigate directly to analysis page since CV is already "parsed"
      navigate(`/analysis/${jobId}`);
      
      toast.success('🚀 Development mode: Skipped upload & auth, reused cached CV!');
    } catch (error: unknown) {
      logError('developmentSkip', error);
      toast.error(getErrorMessage(error) || 'Failed to create development job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSuccess = () => {
    console.log('HomePage: handleSignInSuccess called, closing dialog...');
    setShowSignInDialog(false);
    // Retry the pending action after successful sign-in
    if (pendingAction) {
      console.log('HomePage: Retrying pending action:', pendingAction.type);
      if (pendingAction.type === 'file') {
        const { file, quickCreate } = pendingAction.data as { file: File, quickCreate: boolean };
        handleFileUpload(file, quickCreate);
      } else if (pendingAction.type === 'url') {
        const url = pendingAction.data as string;
        handleURLSubmit(url);
      } else if (pendingAction.type === 'development') {
        handleDevelopmentSkip();
      }
      setPendingAction(null);
    } else {
      console.log('HomePage: No pending action to retry');
    }
  };

  return (
    <>

      {/* Hero Section */}
      <HeroSection 
        onScrollToUpload={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Upload Options Section */}
      <Section variant="content" background="neutral-800" spacing="lg">
          <div className="max-w-4xl mx-auto">
            <div id="upload-section" className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">Start Your Transformation</h2>
              
              {/* Display auth errors */}
              {error && (
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-400 hover:text-red-200 ml-4 p-1"
                      aria-label="Clear error"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
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

              {/* Quick Create Button */}
              {selectedFile && (
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
              )}

              {/* Development Mode Skip Button */}
              {isDevelopmentMode() && (
                <div className="mt-6 text-center">
                  <div className="border-t border-gray-600 pt-6">
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-600/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Code2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Development Mode</span>
                      </div>
                      <p className="text-xs text-green-200/80 text-center">
                        Skip authentication and CV upload - automatically use cached CV for instant development testing
                      </p>
                    </div>
                    <button
                      onClick={handleDevelopmentSkip}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-green-500/50"
                    >
                      <Zap className="inline-block w-4 h-4 mr-2" />
                      Quick Dev Test - Skip All Steps
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      Development only: Auto-sign in + reuse cached CV data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
      </Section>

      {/* Original Features Section */}
      <Section id="features" variant="features" background="neutral-800" spacing="xl">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-100 mb-4">
              Core Features
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              Professional CV generation with smart enhancements
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-animation">
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all hover-lift hover-glow">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-100">AI-Powered Analysis</h3>
                <p className="text-gray-400">Claude AI intelligently parses and enhances your CV content for maximum impact</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-100">Stunning Templates</h3>
                <p className="text-gray-400">Professional designs that make your experience shine through</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-100">Interactive Elements</h3>
                <p className="text-gray-400">QR codes, timelines, charts, and more to make your CV memorable</p>
              </div>
              
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4 w-16 h-16 mb-4 flex items-center justify-center">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-100">Multiple Formats</h3>
                <p className="text-gray-400">Export to PDF, DOCX, or share online with a single click</p>
              </div>
            </div>
          </div>
      </Section>

      {/* How it Works Section */}
      <Section variant="content" background="neutral-900" spacing="xl">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
              Transform your CV in three simple steps
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mb-6">
                  <img 
                    src="/images/upload-cv-illustration.svg" 
                    alt="Upload Your CV" 
                    className="w-full h-48 object-contain mx-auto"
                  />
                </div>
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-900 font-bold text-lg">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-100">Upload Your CV</h3>
                <p className="text-gray-400">
                  Simply upload your existing CV or paste a URL. We support PDF, DOCX, and online profiles.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="text-center">
                <div className="mb-6">
                  <img 
                    src="/images/ai-enhancement-illustration.svg" 
                    alt="AI Enhancement" 
                    className="w-full h-48 object-contain mx-auto"
                  />
                </div>
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-900 font-bold text-lg">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-100">AI Enhancement</h3>
                <p className="text-gray-400">
                  Our AI analyzes and enhances your content, optimizing for ATS and adding interactive features.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="text-center">
                <div className="mb-6">
                  <img 
                    src="/images/download-share-illustration.svg" 
                    alt="Download & Share" 
                    className="w-full h-48 object-contain mx-auto"
                  />
                </div>
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-900 font-bold text-lg">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-100">Download & Share</h3>
                <p className="text-gray-400">
                  Export your enhanced CV as PDF, DOCX, or share online with a unique link.
                </p>
              </div>
            </div>
          </div>
      </Section>
      
      {/* Sign In Dialog */}
      <SignInDialog 
        isOpen={showSignInDialog}
        onClose={() => setShowSignInDialog(false)}
        onSuccess={handleSignInSuccess}
      />
    </>
  );
};