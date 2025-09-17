/**
 * useAuth Hook
 * 
 * Main authentication hook that provides a simplified interface
 * to the AuthContext functionality.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import { useAuthContext } from '../context/AuthContext';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

export interface UseAuthReturn {
  // State
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, displayName?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // Computed properties
  displayName: string;
  avatar: string | null;
  isEmailVerified: boolean;
}

/**
 * Main authentication hook
 */
export function useAuth(): UseAuthReturn {
  const { state, actions } = useAuthContext();

  // Computed properties
  const displayName = state.profile?.displayName || state.user?.displayName || 'User';
  const avatar = state.profile?.photoURL || state.user?.photoURL || null;
  const isEmailVerified = state.user?.emailVerified || false;

  return {
    // State
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    isInitialized: state.isInitialized,

    // Actions
    signIn: actions.signIn,
    signUp: actions.signUp,
    signOut: actions.signOut,
    resetPassword: actions.resetPassword,
    updateProfile: actions.updateProfile,
    refreshSession: actions.refreshSession,
    clearError: actions.clearError,

    // Computed properties
    displayName,
    avatar,
    isEmailVerified
  };
}