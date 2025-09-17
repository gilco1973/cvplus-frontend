// Authentication context for managing auth state across the application
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventBus, EventTypes } from '@/core-ui/services/EventBus';
import { createLogger } from '@cvplus/logging';
import type { AuthState, SignInCredentials, SignUpData, AuthError } from '../types/auth';
import type { User } from '@cvplus/core';

// Initialize logger for auth-ui microservice
const logger = createLogger('auth-ui');

interface AuthContextValue extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  permissions: [],
  premiumTier: 'free'
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listen for auth events from backend services
  useEffect(() => {
    const unsubscribe = EventBus.on('auth-state-changed', (event) => {
      const { user, isAuthenticated } = event.payload;
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated,
        isLoading: false
      }));
    });

    return unsubscribe;
  }, []);

  const initializeAuth = async () => {
    try {
      logger.debug('Initializing authentication state');

      // TODO: Integrate with @cvplus/auth backend service
      // For now, check localStorage for existing session
      const savedUser = localStorage.getItem('cvplus-user');
      const savedToken = localStorage.getItem('cvplus-token');

      if (savedUser && savedToken) {
        try {
          const user = JSON.parse(savedUser);
          // TODO: Validate token with backend
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false
          }));

          // Emit authentication event
          EventBus.emit({
            type: EventTypes.USER_LOGGED_IN,
            source: 'auth-ui',
            target: 'all',
            payload: { user }
          });
        } catch (error) {
          logger.error('Failed to parse saved user data', error);
          // Clear invalid data
          localStorage.removeItem('cvplus-user');
          localStorage.removeItem('cvplus-token');
        }
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      logger.error('Failed to initialize authentication', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize authentication'
      }));
    }
  };

  const signIn = async (credentials: SignInCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      logger.info('Attempting sign in', { email: credentials.email });

      // TODO: Integrate with @cvplus/auth backend service
      // Mock implementation for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with actual backend call
      const mockUser: User = {
        id: 'user_123',
        email: credentials.email,
        displayName: 'Test User',
        roles: [],
        premiumTier: 'free',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to localStorage (TODO: use secure token storage)
      localStorage.setItem('cvplus-user', JSON.stringify(mockUser));
      localStorage.setItem('cvplus-token', 'mock_token_123');

      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false
      }));

      // Emit login event
      EventBus.emit({
        type: EventTypes.USER_LOGGED_IN,
        source: 'auth-ui',
        target: 'all',
        payload: { user: mockUser }
      });

      logger.info('Sign in successful', { userId: mockUser.id });
    } catch (error) {
      const authError = error as AuthError;
      logger.error('Sign in failed', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message || 'Sign in failed'
      }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      logger.info('Attempting sign up', { email: data.email });

      // TODO: Integrate with @cvplus/auth backend service
      await new Promise(resolve => setTimeout(resolve, 1000));

      logger.info('Sign up successful', { email: data.email });

      // After successful signup, sign in the user
      await signIn({ email: data.email, password: data.password });
    } catch (error) {
      const authError = error as AuthError;
      logger.error('Sign up failed', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: authError.message || 'Sign up failed'
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      logger.info('Signing out user');

      // TODO: Integrate with @cvplus/auth backend service
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear local storage
      localStorage.removeItem('cvplus-user');
      localStorage.removeItem('cvplus-token');

      setState(initialState);

      // Emit logout event
      EventBus.emit({
        type: EventTypes.USER_LOGGED_OUT,
        source: 'auth-ui',
        target: 'all',
        payload: {}
      });

      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out failed', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshToken = async () => {
    try {
      // TODO: Integrate with @cvplus/auth backend service
      logger.debug('Refreshing authentication token');
    } catch (error) {
      logger.error('Token refresh failed', error);
      await signOut();
    }
  };

  const resetPassword = async (email: string) => {
    try {
      logger.info('Sending password reset email', { email });
      // TODO: Integrate with @cvplus/auth backend service
      await new Promise(resolve => setTimeout(resolve, 1000));
      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Password reset failed', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      logger.info('Updating user profile');

      // TODO: Integrate with @cvplus/auth backend service
      const updatedUser = { ...state.user!, ...updates };

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false
      }));

      logger.info('Profile updated successfully');
    } catch (error) {
      logger.error('Profile update failed', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    refreshToken,
    resetPassword,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}