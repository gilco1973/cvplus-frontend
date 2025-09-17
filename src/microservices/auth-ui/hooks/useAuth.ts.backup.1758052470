/**
 * useAuth Hook
 * 
 * Primary hook for accessing authentication state and actions
 * throughout the CVPlus application.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import { useAuthContext } from '../contexts/AuthContext';
import { AuthenticatedUser, UserProfile } from '../../types';
// PremiumFeatures removed - moved to @cvplus/premium module

export interface UseAuthReturn {
  // State
  user: AuthenticatedUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  // premiumFeatures removed - moved to @cvplus/premium module
  
  // Actions
  signIn: (email: string, password: string) => Promise<AuthenticatedUser>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthenticatedUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  
  // Permission utilities
  hasPermission: (permission: string) => boolean;
  
  // Premium utilities removed - moved to @cvplus/premium module
}

/**
 * Hook for accessing authentication state and actions
 * 
 * @returns Authentication state and actions
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, signOut } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please sign in</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome {user.displayName}</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const { state, actions } = useAuthContext();
  
  return {
    // State
    user: state.user,
    profile: state.profile,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    error: state.error,
    // premiumFeatures removed - handled by @cvplus/premium module
    
    // Actions
    signIn: actions.signIn,
    signUp: actions.signUp,
    signOut: actions.signOut,
    resetPassword: actions.resetPassword,
    updateProfile: actions.updateProfile,
    refreshSession: actions.refreshSession,
    clearError: actions.clearError,
    
    // Permission utilities
    hasPermission: actions.hasPermission,
    
    // Premium functionality removed - moved to @cvplus/premium module
  };
};