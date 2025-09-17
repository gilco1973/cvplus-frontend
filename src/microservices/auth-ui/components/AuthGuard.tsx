import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationService } from '@/core-ui/services/NotificationService';
import SignInDialog from './SignInDialog';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  showDialog?: boolean;
  redirectUrl?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

/**
 * AuthGuard Component - Auth UI Microservice
 *
 * Protects components and routes by ensuring user authentication.
 * Provides a seamless user experience with customizable fallbacks and dialogs.
 *
 * Features:
 * - Automatic authentication checking
 * - Customizable loading states
 * - Built-in sign-in dialog
 * - Error handling with user feedback
 * - Redirect URL support
 * - Microservice-aware notifications
 */
export default function AuthGuard({
  children,
  fallback,
  requireAuth = true,
  showDialog = true,
  redirectUrl,
  loadingComponent,
  errorComponent
}: AuthGuardProps) {
  const { user, isLoading, error, clearError } = useAuth();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  // Show custom loading component or default loader
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
          <p className="text-sm text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <div className="bg-error-900/50 border border-error-700 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-error-200">Authentication Error</h3>
            <div className="mt-2 text-sm text-error-300">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  clearError();
                  NotificationService.info('Authentication error cleared', { microservice: 'auth-ui' });
                }}
                className="text-sm bg-error-600 hover:bg-error-700 text-white px-3 py-1 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    // Show custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show sign-in dialog if enabled
    if (showDialog) {
      return (
        <>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              {/* Auth Required Card */}
              <div className="bg-warning-900/20 border border-warning-700 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-warning-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-warning-200 mb-2">
                  Authentication Required
                </h3>
                <p className="text-warning-300 text-sm mb-4">
                  Please sign in to access this feature and unlock your personalized CVPlus experience.
                </p>

                {/* Benefits list */}
                <div className="text-left mb-6">
                  <p className="text-xs text-gray-400 mb-2">You'll get access to:</p>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary-400 rounded-full" />
                      Save your CV progress
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary-400 rounded-full" />
                      Personalized recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-primary-400 rounded-full" />
                      Premium features
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSignInDialog(true);
                  NotificationService.info('Opening sign-in dialog', { microservice: 'auth-ui' });
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                Sign In to Continue
              </button>

              <p className="text-xs text-gray-500 mt-4">
                New to CVPlus?{' '}
                <button className="text-primary-400 hover:text-primary-300">
                  Create an account
                </button>
              </p>
            </div>
          </div>

          <SignInDialog
            isOpen={showSignInDialog}
            onClose={() => setShowSignInDialog(false)}
            onSuccess={() => {
              setShowSignInDialog(false);
              NotificationService.success('Welcome back!', { microservice: 'auth-ui' });
            }}
            returnUrl={redirectUrl}
          />
        </>
      );
    }

    // Default minimal fallback
    return (
      <div className="text-center py-12">
        <div className="max-w-sm mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-gray-200 mb-2">Authentication Required</h3>
            <p className="text-gray-400 text-sm">Please sign in to access this feature.</p>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated or auth is not required, render children
  return <>{children}</>;
}