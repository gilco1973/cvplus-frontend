import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '@/core-ui/services/NotificationService';
import { validators } from '@/core-ui/utils/validators';
import type { SignInCredentials } from '../types/auth';

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  returnUrl?: string;
}

export default function SignInDialog({ isOpen, onClose, onSuccess, returnUrl }: SignInDialogProps) {
  const { signIn, error, clearError, user, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<SignInCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Auto-close dialog when user becomes authenticated
  useEffect(() => {
    if (isOpen && user) {
      NotificationService.success('Signed in successfully!', { microservice: 'auth-ui' });
      onSuccess?.();
      onClose();
    }
  }, [isOpen, user, onSuccess, onClose]);

  // Clear form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCredentials({ email: '', password: '', rememberMe: false });
      setValidationErrors({});
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!validators.isRequired(credentials.email)) {
      errors.email = 'Email is required';
    } else if (!validators.isValidEmail(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!validators.isRequired(credentials.password)) {
      errors.password = 'Password is required';
    } else if (!validators.hasMinLength(credentials.password, 8)) {
      errors.password = 'Password must be at least 8 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signIn(credentials);
      // Success is handled by useEffect above
    } catch (error) {
      NotificationService.error(
        error instanceof Error ? error.message : 'Failed to sign in. Please try again.',
        { microservice: 'auth-ui' }
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // TODO: Implement Google Sign-In with @cvplus/auth backend
      NotificationService.info('Google Sign-In coming soon!', { microservice: 'auth-ui' });
    } catch (error) {
      NotificationService.error('Google Sign-In failed. Please try again.', { microservice: 'auth-ui' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-100">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Benefits Section */}
        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Sign in to unlock all CVPlus features:
          </p>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
              Calendar integration for career milestones
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
              Meeting availability scheduling
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
              Save and access your CV history
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary-400 rounded-full" />
              Personalized recommendations
            </li>
          </ul>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-error-900/50 border border-error-700 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <p className="text-error-200 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-error-400 hover:text-error-200 ml-2 transition-colors"
                aria-label="Clear error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                validationErrors.email ? 'border-error-500' : 'border-gray-600'
              }`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="text-error-400 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10 ${
                  validationErrors.password ? 'border-error-500' : 'border-gray-600'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-error-400 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={credentials.rememberMe}
                onChange={(e) => setCredentials(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="rounded border-gray-600 text-primary-600 focus:ring-primary-500 bg-gray-700"
                disabled={isLoading}
              />
              <span className="ml-2 text-sm text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Social Sign In */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="mt-4 w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-400">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300">Privacy Policy</a>.
          </p>
          <p className="text-xs text-gray-500">
            Don't have an account?{' '}
            <button className="text-primary-400 hover:text-primary-300 font-medium">
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}