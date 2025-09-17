import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  type User
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { isFirebaseError, getErrorMessage, logError } from '../utils/errorHandling';
import { getUserSubscription, GetUserSubscriptionResponse } from '../services/paymentService';

// Helper function to store Google OAuth tokens for calendar integration
const storeGoogleTokens = async (uid: string, accessToken: string) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      googleTokens: {
        accessToken,
        grantedAt: serverTimestamp(),
        scopes: ['calendar', 'calendar.events']
      },
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    logError('storeGoogleTokens', error);
    // Don't throw here - token storage failure shouldn't block authentication
  }
};

// Helper function to convert Firebase auth error codes to user-friendly messages
const getFriendlyAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Authentication was blocked. Please try again.';
    case 'auth/unknown-error':
      return 'An unknown authentication error occurred. Please try again.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};

// Export premium context type for other components
export interface PremiumContextType {
  isPremium: boolean;
  isLifetimePremium: boolean;
  subscription: GetUserSubscriptionResponse | null;
  features: {
    webPortal: boolean;
    aiChat: boolean;
    podcast: boolean;
    advancedAnalytics: boolean;
  };
  subscriptionStatus: 'free' | 'premium_lifetime';
  purchasedAt?: any;
  isLoadingPremium: boolean;
  premiumError: string | null;
  refreshPremiumStatus: () => Promise<void>;
  // Helper methods for premium status management
  hasFeature: (feature: keyof PremiumContextType['features']) => boolean;
  clearPremiumError: () => void;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  hasCalendarPermissions: boolean;
  requestCalendarPermissions: () => Promise<void>;
  // Premium status fields
  premium: PremiumContextType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Dedicated hook for premium status access
export const usePremium = () => {
  const { premium } = useAuth();
  return premium;
};

// Hook for specific feature access
export const useFeature = (featureName: keyof PremiumContextType['features']) => {
  const { premium } = useAuth();
  return {
    hasAccess: premium.features[featureName],
    isPremium: premium.isPremium,
    isLoading: premium.isLoadingPremium,
    error: premium.premiumError,
    refreshStatus: premium.refreshPremiumStatus
  };
};

// Hook for premium upgrade checks
export const usePremiumUpgrade = () => {
  const { premium, user } = useAuth();
  
  const needsUpgrade = !premium.isPremium && !!user;
  const isEligible = !!user && !premium.isPremium;
  
  return {
    needsUpgrade,
    isEligible,
    isPremium: premium.isPremium,
    isLoading: premium.isLoadingPremium,
    refreshStatus: premium.refreshPremiumStatus
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCalendarPermissions, setHasCalendarPermissions] = useState(false);
  
  // Premium status state
  const [subscription, setSubscription] = useState<GetUserSubscriptionResponse | null>(null);
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  
  // Premium status cache for session persistence
  const [premiumStatusCache, setPremiumStatusCache] = useState<{
    subscription: GetUserSubscriptionResponse | null;
    timestamp: number;
    userId: string;
  } | null>(null);
  
  // Cache duration: 5 minutes
  const PREMIUM_CACHE_DURATION = 5 * 60 * 1000;

  // Handle Google redirect result on app load
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔍 Checking for redirect result...');
        }
        
        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getRedirectResult timeout')), 5000)
        );
        
        const result = await Promise.race([
          getRedirectResult(auth),
          timeoutPromise
        ]);
        
        if (result && typeof result === 'object' && 'user' in result) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('✅ Google redirect sign-in successful:', {
              email: result.user.email,
              uid: result.user.uid,
              displayName: result.user.displayName
            });
          }
          
          // User just signed in via redirect
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('🔑 Processing Google access token...');
            }
            await storeGoogleTokens(result.user.uid, credential.accessToken);
            setHasCalendarPermissions(true);
            if (process.env.NODE_ENV === 'development') {
              console.warn('✅ Google calendar permissions granted');
            }
          }
          
          // Clear any previous errors
          setError(null);
          
          // Force a user state update (redundant but ensures consistency)
          setUser(result.user);
          if (process.env.NODE_ENV === 'development') {
            console.warn('👤 User state manually updated');
          }
          
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('ℹ️ No redirect result found - user likely navigated directly');
          }
        }
      } catch (error) {
        console.error('[handleRedirectResult] Error:', error);
        if (error instanceof Error && error.message === 'getRedirectResult timeout') {
          console.warn('⏰ getRedirectResult timed out - this is normal if no redirect occurred');
        } else if (isFirebaseError(error)) {
          setError(getFriendlyAuthErrorMessage(error.code));
        } else {
          setError('An error occurred during authentication. Please try again.');
        }
      }
    };

    // Small delay to ensure Firebase is fully initialized
    const timer = setTimeout(handleRedirectResult, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔄 Auth state changed:', user ? {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName
        } : 'User signed out');
      }
      
      setUser(user);
      setLoading(false); // Ensure loading is cleared when auth state resolves
      
      if (user) {
        // Check calendar permissions for authenticated users
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          const hasTokens = userData?.googleTokens?.accessToken;
          setHasCalendarPermissions(!!hasTokens);
        } catch (error) {
          logError('checkCalendarPermissions', error);
          setHasCalendarPermissions(false);
        }
        
        // Load premium status for authenticated user
        await fetchPremiumStatus(user.uid);
      } else {
        // Clear all user-related state when signing out
        setHasCalendarPermissions(false);
        setSubscription(null);
        setPremiumStatusCache(null);
        setPremiumError(null);
        
        // Clear premium cache from localStorage
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('cvplus_premium_')) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          logError('clearPremiumCache', error);
        }
      }
      
      setLoading(false);
      // Clear any previous errors when auth state changes successfully
      if (error) {
        setError(null);
      }
    }, (authError: unknown) => {
      // Handle auth state change errors gracefully
      logError('onAuthStateChanged', authError);
      setLoading(false);
      
      // Only set user-friendly errors for actual problems
      if (isFirebaseError(authError) && authError.code !== 'auth/user-not-found') {
        const friendlyMessage = getFriendlyAuthErrorMessage(authError.code);
        setError(friendlyMessage);
      }
    });

    return unsubscribe;
  }, [error]);

  const clearError = () => {
    setError(null);
  };
  
  const clearPremiumError = () => {
    setPremiumError(null);
  };
  
  // Load premium status from cache if valid
  const loadPremiumFromCache = useCallback((userId: string) => {
    try {
      const cached = localStorage.getItem(`cvplus_premium_${userId}`);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const isValid = Date.now() - parsedCache.timestamp < PREMIUM_CACHE_DURATION;
        
        if (isValid && parsedCache.userId === userId) {
          setPremiumStatusCache(parsedCache);
          setSubscription(parsedCache.subscription);
          return true;
        } else {
          // Remove expired cache
          localStorage.removeItem(`cvplus_premium_${userId}`);
        }
      }
    } catch (error) {
      logError('loadPremiumFromCache', error);
      localStorage.removeItem(`cvplus_premium_${userId}`);
    }
    return false;
  }, [PREMIUM_CACHE_DURATION]);
  
  // Save premium status to cache
  const savePremiumToCache = useCallback((userId: string, subscriptionData: GetUserSubscriptionResponse | null) => {
    try {
      const cacheData = {
        subscription: subscriptionData,
        timestamp: Date.now(),
        userId
      };
      localStorage.setItem(`cvplus_premium_${userId}`, JSON.stringify(cacheData));
      setPremiumStatusCache(cacheData);
    } catch (error) {
      logError('savePremiumToCache', error);
    }
  }, []);
  
  // Fetch premium status from backend
  const fetchPremiumStatus = useCallback(async (userId: string, skipCache = false) => {
    // Check cache first unless explicitly skipping
    if (!skipCache && loadPremiumFromCache(userId)) {
      return;
    }
    
    setIsLoadingPremium(true);
    setPremiumError(null);
    
    try {
      const subscriptionData = await getUserSubscription({ userId });
      setSubscription(subscriptionData);
      savePremiumToCache(userId, subscriptionData);
    } catch (error) {
      logError('fetchPremiumStatus', error);
      setPremiumError(error instanceof Error ? error.message : 'Failed to load premium status');
      setSubscription(null);
    } finally {
      setIsLoadingPremium(false);
    }
  }, [loadPremiumFromCache, savePremiumToCache]);
  
  // Refresh premium status (force reload from backend)
  const refreshPremiumStatus = useCallback(async () => {
    if (!user) return;
    await fetchPremiumStatus(user.uid, true);
  }, [user, fetchPremiumStatus]);
  
  // Set up periodic premium status sync for active users
  useEffect(() => {
    if (!user || !subscription) return;
    
    // Only sync for premium users to detect any changes
    if (subscription.lifetimeAccess) {
      const syncInterval = setInterval(() => {
        // Check if cache is expired and refresh if needed
        const cacheExpired = !premiumStatusCache || 
          Date.now() - premiumStatusCache.timestamp > PREMIUM_CACHE_DURATION;
        
        if (cacheExpired) {
          fetchPremiumStatus(user.uid, true);
        }
      }, PREMIUM_CACHE_DURATION);
      
      return () => clearInterval(syncInterval);
    }
  }, [user, subscription, premiumStatusCache, fetchPremiumStatus, PREMIUM_CACHE_DURATION]);
  
  // Listen for payment completion events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cvplus_payment_completed' && user) {
        // Payment completed in another tab, refresh premium status
        setTimeout(() => {
          refreshPremiumStatus();
          localStorage.removeItem('cvplus_payment_completed');
        }, 1000); // Small delay to ensure backend processing is complete
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, refreshPremiumStatus]);
  
  // Listen for visibility change to refresh status when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && subscription) {
        // Check if cache is stale when tab becomes visible
        const cacheAge = premiumStatusCache ? 
          Date.now() - premiumStatusCache.timestamp : Infinity;
        
        if (cacheAge > PREMIUM_CACHE_DURATION) {
          fetchPremiumStatus(user.uid, true);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, subscription, premiumStatusCache, fetchPremiumStatus, PREMIUM_CACHE_DURATION]);


  const signInWithGoogle = async () => {
    try {
      clearError();
      const provider = new GoogleAuthProvider();
      
      // Add calendar scopes for unified authentication
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      
      // Configure OAuth parameters
      provider.setCustomParameters({
        'prompt': 'consent', // Force consent screen for calendar permissions
        'access_type': 'offline' // Enable refresh tokens
      });
      
      await signInWithRedirect(auth, provider);
      return; // Redirect will handle the rest
      
      // Check if calendar permissions were granted
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        // Store the access token for calendar integration
        await storeGoogleTokens(result.user.uid, credential.accessToken);
        setHasCalendarPermissions(true);
      }
    } catch (error: unknown) {
      logError('signInWithGoogle', error);
      const errorCode = isFirebaseError(error) ? error.code : 'auth/unknown-error';
      const friendlyMessage = getFriendlyAuthErrorMessage(errorCode);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      clearError();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      logError('signIn', error);
      const errorCode = isFirebaseError(error) ? error.code : 'auth/unknown-error';
      const friendlyMessage = getFriendlyAuthErrorMessage(errorCode);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      clearError();
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      logError('signUp', error);
      const errorCode = isFirebaseError(error) ? error.code : 'auth/unknown-error';
      const friendlyMessage = getFriendlyAuthErrorMessage(errorCode);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  const signOut = async () => {
    try {
      clearError();
      clearPremiumError();
      
      // Clear premium state before signing out
      setSubscription(null);
      setPremiumStatusCache(null);
      
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      logError('signOut', error);
      const errorCode = isFirebaseError(error) ? error.code : 'auth/unknown-error';
      const friendlyMessage = getFriendlyAuthErrorMessage(errorCode);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Request calendar permissions separately if not granted during initial auth
  const requestCalendarPermissions = async () => {
    if (!user) {
      throw new Error('User must be authenticated first');
    }
    
    try {
      clearError();
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar');
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.setCustomParameters({
        'prompt': 'consent',
        'access_type': 'offline'
      });
      
      await signInWithRedirect(auth, provider);
      return; // Redirect will handle the rest
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (credential?.accessToken) {
        await storeGoogleTokens(user.uid, credential.accessToken);
        setHasCalendarPermissions(true);
      }
    } catch (error: unknown) {
      logError('requestCalendarPermissions', error);
      const errorCode = isFirebaseError(error) ? error.code : 'auth/unknown-error';
      const friendlyMessage = getFriendlyAuthErrorMessage(errorCode);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Create premium context object
  const premium: PremiumContextType = {
    isPremium: subscription?.lifetimeAccess === true,
    isLifetimePremium: subscription?.lifetimeAccess === true,
    subscription,
    features: {
      webPortal: subscription?.features?.webPortal === true,
      aiChat: subscription?.features?.aiChat === true,
      podcast: subscription?.features?.podcast === true,
      advancedAnalytics: subscription?.features?.advancedAnalytics === true
    },
    subscriptionStatus: subscription?.subscriptionStatus === 'premium_lifetime' ? 'premium_lifetime' : 'free',
    purchasedAt: subscription?.purchasedAt,
    isLoadingPremium,
    premiumError,
    refreshPremiumStatus
  };
  
  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signIn,
    signUp,
    signOut,
    clearError,
    hasCalendarPermissions,
    requestCalendarPermissions,
    premium
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};