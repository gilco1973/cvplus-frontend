import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignInDialog } from './SignInDialog';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  showDialog?: boolean;
}

/**
 * AuthGuard Component
 * 
 * Automatically handles authentication state and shows sign-in dialog when needed.
 * Provides graceful user experience for unauthenticated users.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback, 
  requireAuth = true,
  showDialog = true 
}) => {
  const { user, loading, error } = useAuth();
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Authentication Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please sign in to access this feature.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowSignInDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>

          <SignInDialog
            isOpen={showSignInDialog}
            onClose={() => setShowSignInDialog(false)}
            onSuccess={() => setShowSignInDialog(false)}
          />
        </>
      );
    }

    // Default fallback
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600">Please sign in to access this feature.</p>
      </div>
    );
  }

  // Show auth error if present
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated or auth is not required, render children
  return <>{children}</>;
};

export default AuthGuard;