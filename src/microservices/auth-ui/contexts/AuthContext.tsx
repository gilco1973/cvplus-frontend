/**
 * Auth Context
 * 
 * React context for managing authentication state and providing
 * auth-related functionality throughout the application.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '@cvplus/auth/services/auth.service';
import { UserProfile, Permission, AuthenticatedUser } from '@cvplus/auth/types';
// PremiumFeatures removed - moved to @cvplus/premium module

// ============================================================================
// TYPES
// ============================================================================

export interface AuthContextState {
  user: AuthenticatedUser | null;
  firebaseUser?: User | null; // For backward compatibility
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: Permission[];
  // premiumFeatures removed - moved to @cvplus/premium module
  error: string | null;
  isInitialized: boolean;
}

export interface AuthContextActions {
  signIn: (email: string, password: string) => Promise<AuthenticatedUser>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthenticatedUser>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  // hasPremiumFeature removed - moved to @cvplus/premium module
  clearError: () => void;
}

export interface AuthContextValue {
  state: AuthContextState;
  actions: AuthContextActions;
}

// ============================================================================
// REDUCER
// ============================================================================

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthenticatedUser | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_PERMISSIONS'; payload: Permission[] }
  // SET_PREMIUM_FEATURES action removed - moved to @cvplus/premium module
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthContextState = {
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  permissions: [],
  // premiumFeatures removed - moved to @cvplus/premium module
  error: null,
  isInitialized: false
};

function authReducer(state: AuthContextState, action: AuthAction): AuthContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        isLoading: false 
      };
    
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload };
    
    // SET_PREMIUM_FEATURES case removed - moved to @cvplus/premium module
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

export interface AuthProviderProps {
  children: ReactNode;
  autoRefresh?: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  autoRefresh = true 
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const setError = (error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error;
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const loadUserProfile = async () => {
    try {
      // Load user profile
      const profile = await AuthService.getInstance().getUserProfile();
      dispatch({ type: 'SET_PROFILE', payload: profile });

      // Permissions are automatically loaded by AuthService

      // Premium features are automatically loaded by AuthService

    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      setError(`Failed to load user profile: ${error.message}`);
    }
  };

  // ============================================================================
  // AUTH ACTIONS
  // ============================================================================

  const signIn = async (email: string, password: string): Promise<AuthenticatedUser> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();

      const user = await AuthService.getInstance().signIn({ email, password, provider: 'email' });
      dispatch({ type: 'SET_USER', payload: user });

      // Load additional user data
      await loadUserProfile();

      // Session is automatically created by AuthService

      return user;
    } catch (error: any) {
      setError(error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthenticatedUser> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      clearError();

      const user = await AuthService.getInstance().signUp({ 
        email, 
        password, 
        provider: 'email',
        additionalData: { displayName } 
      });
      dispatch({ type: 'SET_USER', payload: user });

      // User profile is created automatically by the signUp method
      // and will be loaded by loadUserProfile()
      
      await loadUserProfile();

      // Default permissions are automatically set by AuthService

      // Session is automatically created by AuthService

      return user;
    } catch (error: any) {
      setError(error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // End session
      // Session cleanup is handled by AuthService

      await AuthService.getInstance().signOut();
      
      // Clear state
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_PROFILE', payload: null });
      dispatch({ type: 'SET_PERMISSIONS', payload: [] });
      // Premium features dispatch removed - moved to @cvplus/premium module
      
    } catch (error: any) {
      setError(error);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      clearError();
      await AuthService.getInstance().resetPassword(email);
    } catch (error: any) {
      setError(error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      if (!state.user) throw new Error('No authenticated user');
      
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedProfile = await AuthService.getInstance().updateProfile(data);
      dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
      
    } catch (error: any) {
      setError(error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshSession = async (): Promise<void> => {
    try {
      if (!state.user) return;
      
      await loadUserProfile();
      await AuthService.getInstance().refreshSession();
      
    } catch (error: any) {
      console.error('Failed to refresh session:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return state.permissions.some(p => p.name === permission);
  };

  // hasPremiumFeature method removed - moved to @cvplus/premium module

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Listen for auth state changes
        const authService = AuthService.getInstance();
        
        authService.addEventListener('onAuthStateChanged', async (user) => {
          dispatch({ type: 'SET_USER', payload: user });
          
          if (user) {
            await loadUserProfile();
          } else {
            dispatch({ type: 'SET_PROFILE', payload: null });
            dispatch({ type: 'SET_PERMISSIONS', payload: [] });
            // Premium features dispatch removed - moved to @cvplus/premium module
          }
          
          dispatch({ type: 'SET_INITIALIZED', payload: true });
          dispatch({ type: 'SET_LOADING', payload: false });
        });

        return () => {
          authService.removeEventListener('onAuthStateChanged');
        };
      } catch (error: any) {
        setError(error);
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        return () => {}; // Return empty cleanup function
      }
    };

    const unsubscribe = initializeAuth();
    
    return () => {
      unsubscribe?.then(unsub => unsub?.());
    };
  }, []);

  // Auto-refresh session
  useEffect(() => {
    if (!autoRefresh || !state.user) return;

    const interval = setInterval(() => {
      refreshSession();
    }, 15 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval);
  }, [state.user, autoRefresh]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextValue = {
    state: {
      ...state,
      // Provide Firebase User for backward compatibility
      firebaseUser: state.user?.firebaseUser || null
    },
    actions: {
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateProfile,
      refreshSession,
      hasPermission,
      // hasPremiumFeature removed - moved to @cvplus/premium module
      clearError
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};