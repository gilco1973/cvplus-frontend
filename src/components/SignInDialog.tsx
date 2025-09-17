import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/errorHandling';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, error, clearError, user } = useAuth();

  // Auto-close dialog when user becomes authenticated
  useEffect(() => {
    if (isOpen && user) {
      console.log('SignInDialog: User authenticated, auto-closing dialog and calling onSuccess');
      onSuccess();
    }
  }, [isOpen, user, onSuccess]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      console.log('SignInDialog: Starting Google sign in...');
      await signInWithGoogle();
      console.log('SignInDialog: Sign in successful, calling onSuccess...');
      toast.success('Signed in successfully!');
      onSuccess();
      console.log('SignInDialog: onSuccess called successfully');
    } catch (error: unknown) {
      console.error('SignInDialog: Sign in error:', error);
      // Error is already handled by AuthContext, just show the user-friendly message
      const errorMessage = getErrorMessage(error) || 'Failed to sign in. Please try again.';
      toast.error(errorMessage);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-100">Sign in to Continue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-300">
            Sign in with Google to unlock all CVPlus features including:
          </p>
          <ul className="text-sm text-gray-400 space-y-2 ml-4">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Calendar integration for career milestones
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Meeting availability scheduling
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Save and access your CV history
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Personalized recommendations
            </li>
          </ul>
        </div>

        {/* Display auth errors */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-red-200 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-200 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg px-4 py-3 flex items-center justify-center gap-3 transition text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>

        <div className="mt-4 text-center space-y-2">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-xs text-blue-400">
            We'll request calendar permissions to enable timeline features.
          </p>
        </div>
      </div>
    </div>
  );
};