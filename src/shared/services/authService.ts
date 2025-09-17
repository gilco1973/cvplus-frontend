import { auth } from '../lib/firebase';
import { User, getIdToken, onAuthStateChanged } from 'firebase/auth';
import { logger } from './logger';

export interface AuthStatus {
  authenticated: boolean;
  user: User | null;
  token: string | null;
  error?: string;
  tokenAge?: number;
}

export class AuthService {
  private static tokenCache: { token: string; expiry: number } | null = null;
  private static readonly TOKEN_CACHE_BUFFER = 5 * 60 * 1000; // 5 minutes buffer

  /**
   * Get fresh ID token for authenticated requests
   */
  static async getAuthToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      logger.warn('No authenticated user found');
      return null;
    }

    try {
      // Check cache first unless forcing refresh
      if (!forceRefresh && this.tokenCache) {
        const now = Date.now();
        if (now < this.tokenCache.expiry - this.TOKEN_CACHE_BUFFER) {
          logger.debug('Using cached auth token');
          return this.tokenCache.token;
        }
      }

      const token = await getIdToken(user, forceRefresh);
      
      // Parse token to get expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        
        this.tokenCache = { token, expiry };
        
        logger.info('ID token retrieved successfully', {
          uid: user.uid,
          forceRefresh,
          expiry: new Date(expiry).toISOString(),
          tokenLength: token.length
        });
      } catch (parseError) {
        // Token parsing failed, but token might still be valid
        logger.warn('Failed to parse token expiry', parseError);
        this.tokenCache = { 
          token, 
          expiry: Date.now() + (60 * 60 * 1000) // Assume 1 hour expiry
        };
      }
      
      return token;
    } catch (error) {
      logger.error('Failed to get ID token:', error);
      this.tokenCache = null;
      return null;
    }
  }

  /**
   * Clear cached token (useful when auth errors occur)
   */
  static clearTokenCache(): void {
    this.tokenCache = null;
    logger.debug('Auth token cache cleared');
  }

  /**
   * Verify user authentication status with comprehensive checks
   */
  static async verifyAuth(): Promise<AuthStatus> {
    try {
      const user = auth.currentUser;
      if (!user) {
        logger.debug('No current user found');
        return { authenticated: false, user: null, token: null };
      }

      // Check if user email is verified (required for premium features)
      if (!user.emailVerified) {
        logger.warn('User email not verified', { uid: user.uid, email: user.email });
        return {
          authenticated: false,
          user: null,
          token: null,
          error: 'Email verification required'
        };
      }

      // Get fresh token
      const token = await this.getAuthToken(false);
      
      if (!token) {
        logger.error('Failed to retrieve authentication token', { uid: user.uid });
        return { 
          authenticated: false, 
          user: null, 
          token: null,
          error: 'Failed to retrieve authentication token'
        };
      }

      // Parse token to get age and other info
      let tokenAge: number | undefined;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        tokenAge = currentTime - payload.iat;
        
        // Warn if token is very old
        if (tokenAge > 3600) { // 1 hour
          logger.warn('Using old authentication token', {
            uid: user.uid,
            tokenAgeHours: Math.floor(tokenAge / 3600)
          });
        }
      } catch (parseError) {
        logger.warn('Failed to parse token for age calculation', parseError);
      }

      logger.info('Authentication verified successfully', {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        tokenAge,
        provider: user.providerData[0]?.providerId
      });

      return { 
        authenticated: true, 
        user, 
        token,
        tokenAge
      };
    } catch (error) {
      logger.error('Authentication verification failed:', error);
      this.clearTokenCache();
      return { 
        authenticated: false, 
        user: null, 
        token: null,
        error: error instanceof Error ? error.message : 'Unknown authentication error'
      };
    }
  }

  /**
   * Wait for authentication state to be resolved
   */
  static async waitForAuth(timeoutMs = 10000): Promise<AuthStatus> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve({
          authenticated: false,
          user: null,
          token: null,
          error: 'Authentication timeout'
        });
      }, timeoutMs);

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        clearTimeout(timeout);
        unsubscribe();
        
        if (user) {
          const authStatus = await this.verifyAuth();
          resolve(authStatus);
        } else {
          resolve({
            authenticated: false,
            user: null,
            token: null
          });
        }
      }, (error) => {
        clearTimeout(timeout);
        unsubscribe();
        logger.error('Auth state change error:', error);
        resolve({
          authenticated: false,
          user: null,
          token: null,
          error: error.message
        });
      });
    });
  }

  /**
   * Refresh authentication token
   */
  static async refreshAuth(): Promise<AuthStatus> {
    logger.info('Refreshing authentication token');
    this.clearTokenCache();
    return this.verifyAuth();
  }

  /**
   * Test authentication with a Cloud Function call
   */
  static async testAuthWithFunction(): Promise<{
    success: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      const authStatus = await this.verifyAuth();
      
      if (!authStatus.authenticated || !authStatus.token) {
        return {
          success: false,
          error: 'Not authenticated',
          details: authStatus
        };
      }

      // Test with a simple function call
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../lib/firebase');
      
      const testFunction = httpsCallable(functions, 'testAuth');
      const result = await testFunction({
        test: 'auth-verification',
        timestamp: Date.now()
      });

      logger.info('Auth test function call successful', result.data);

      return {
        success: true,
        details: {
          authStatus,
          functionResult: result.data
        }
      };

    } catch (error) {
      logger.error('Auth test function call failed:', error);
      
      // If it's a Firebase error, extract useful info
      if (error && typeof error === 'object' && 'code' in error) {
        return {
          success: false,
          error: `Firebase Error: ${error.code} - ${error.message}`,
          details: error
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
  }

  /**
   * Monitor authentication state changes
   */
  static monitorAuthState(callback: (authStatus: AuthStatus) => void): () => void {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const authStatus = await this.verifyAuth();
        callback(authStatus);
      } else {
        callback({
          authenticated: false,
          user: null,
          token: null
        });
      }
    }, (error) => {
      logger.error('Auth state monitoring error:', error);
      callback({
        authenticated: false,
        user: null,
        token: null,
        error: error.message
      });
    });
  }

  /**
   * Get user's subscription data (requires authentication)
   */
  static async getUserSubscription(): Promise<any> {
    const authStatus = await this.verifyAuth();
    
    if (!authStatus.authenticated) {
      throw new Error('Authentication required');
    }

    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../lib/firebase');
      
      const getUserSubscriptionFunction = httpsCallable(functions, 'getUserSubscription');
      const result = await getUserSubscriptionFunction({
        userId: authStatus.user!.uid
      });

      return result.data;
    } catch (error) {
      logger.error('Failed to get user subscription:', error);
      throw error;
    }
  }
}