/**
 * SignIn Dialog Component
 * 
 * Modal dialog for user authentication with sign in and sign up functionality.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';

export interface SignInDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  
  /** Callback when dialog should be closed */
  onClose: () => void;
  
  /** Initial mode (sign in or sign up) */
  initialMode?: 'signin' | 'signup';
  
  /** Callback when authentication is successful */
  onSuccess?: () => void;
  
  /** Custom title */
  title?: string;
  
  /** Whether to show the close button */
  showCloseButton?: boolean;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
};

export const SignInDialog: React.FC<SignInDialogProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess,
  title,
  showCloseButton = true
}) => {
  const { signIn, signUp, resetPassword, isLoading, error, clearError } = useAuth();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // Clear form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setFormErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.displayName) {
        errors.displayName = 'Display name is required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      clearError();

      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
      } else if (mode === 'signup') {
        await signUp(formData.email, formData.password, formData.displayName);
      } else if (mode === 'reset') {
        await resetPassword(formData.email);
        alert('Password reset email sent! Check your inbox.');
        setMode('signin');
        return;
      }

      // Success
      onSuccess?.();
      onClose();
    } catch (err) {
      // Error is handled by the auth hook
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearError();
      // TODO: Implement Google sign-in when available
      console.warn('Google sign-in not yet implemented');
      // await signInWithGoogle?.();
      // onSuccess?.();
      // onClose();
    } catch (err) {
      // Error is handled by the auth hook
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    clearError();
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (mode) {
      case 'signin': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTitle()}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Display Name (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.displayName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your display name"
                disabled={isLoading}
              />
              {formErrors.displayName && (
                <p className="mt-1 text-sm text-red-600">{formErrors.displayName}</p>
              )}
            </div>
          )}

          {/* Password (not for reset) */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
            </div>
          )}

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                {mode === 'signin' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending reset email...'}
              </>
            ) : (
              <>
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </>
            )}
          </button>

          {/* Google Sign In */}
          {mode !== 'reset' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
              </button>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-center text-sm text-gray-600">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => setMode('reset')}
                className="text-blue-600 hover:text-blue-700 mr-4"
                disabled={isLoading}
              >
                Forgot password?
              </button>
              <span>Don't have an account? </span>
              <button
                onClick={() => setMode('signup')}
                className="text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                Sign up
              </button>
            </>
          )}
          
          {mode === 'signup' && (
            <>
              <span>Already have an account? </span>
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                Sign in
              </button>
            </>
          )}
          
          {mode === 'reset' && (
            <>
              <span>Remember your password? </span>
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};