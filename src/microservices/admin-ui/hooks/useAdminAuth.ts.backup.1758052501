import { useState, useEffect } from 'react';
import { useAuth } from '@cvplus/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

/**
 * Admin Authentication Hook
 * 
 * Provides admin-specific authentication state and methods.
 * Checks if the current user has admin privileges and loads their admin profile.
 */

interface AdminProfile {
  id: string;
  userId: string;
  role: string;
  level: number;
  email: string;
  adminSince: Date;
  specializations: string[];
  isActive: boolean;
  lastActivity: Date;
}

interface AdminAuthState {
  isAdmin: boolean;
  adminProfile: AdminProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAdminAuth = () => {
  const { user } = useAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    adminProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const checkAdminStatus = async () => {
      if (!user) {
        if (isMounted) {
          setState({
            isAdmin: false,
            adminProfile: null,
            loading: false,
            error: null
          });
        }
        return;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        // Check if user has admin custom claims
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No authenticated user');
        }
        const token = await currentUser.getIdTokenResult();
        const adminClaims = token.claims.admin;

        if (!adminClaims) {
          // Not an admin user
          if (isMounted) {
            setState({
              isAdmin: false,
              adminProfile: null,
              loading: false,
              error: null
            });
          }
          return;
        }

        // User has admin claims, fetch admin profile
        const functions = getFunctions();
        const getAdminProfile = httpsCallable(functions, 'getAdminProfile');

        const result = await getAdminProfile();
        const profileData = (result.data as any)?.data;

        if (profileData && isMounted) {
          setState({
            isAdmin: true,
            adminProfile: {
              id: profileData.id,
              userId: profileData.userId,
              role: profileData.role,
              level: profileData.level,
              email: profileData.email,
              adminSince: profileData.adminSince?.toDate() || new Date(),
              specializations: profileData.specializations || [],
              isActive: profileData.isActive || false,
              lastActivity: profileData.lastActivity?.toDate() || new Date()
            },
            loading: false,
            error: null
          });
        } else if (isMounted) {
          // Has admin claims but no profile - initialize admin system
          setState({
            isAdmin: true,
            adminProfile: null,
            loading: false,
            error: 'Admin profile not found. Please initialize admin system.'
          });
        }

      } catch (error) {
        console.error('Error checking admin status:', error);
        
        if (isMounted) {
          // Fallback: Check legacy admin email list for backward compatibility
          const adminEmails = ['gil.klainert@gmail.com', 'admin@cvplus.ai'];
          const isLegacyAdmin = !!(user?.email && adminEmails.includes(user.email));

          setState({
            isAdmin: isLegacyAdmin,
            adminProfile: isLegacyAdmin ? {
              id: user.uid,
              userId: user.uid,
              role: 'legacy_admin',
              level: 5,
              email: user.email!,
              adminSince: new Date(),
              specializations: ['system_administration'],
              isActive: true,
              lastActivity: new Date()
            } : null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to check admin status'
          });
        }
      }
    };

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * Initialize admin system for current user
   */
  const initializeAdminSystem = async () => {
    if (!user) {
      throw new Error('No user authenticated');
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const functions = getFunctions();
      const initializeAdmin = httpsCallable(functions, 'initializeAdmin');

      const result = await initializeAdmin();
      const initData = (result.data as any)?.data;

      if (initData) {
        // Refresh admin status after initialization
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error('No authenticated user for refresh');
        const token = await currentUser.getIdTokenResult(true); // Force refresh
        const adminClaims = token.claims.admin;

        setState({
          isAdmin: true,
          adminProfile: {
            id: initData.uid,
            userId: initData.uid,
            role: initData.role,
            level: initData.level,
            email: initData.email,
            adminSince: new Date(),
            specializations: ['system_administration'],
            isActive: true,
            lastActivity: new Date()
          },
          loading: false,
          error: null
        });

        return true;
      }

      throw new Error('Failed to initialize admin system');

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize admin system'
      }));
      throw error;
    }
  };

  /**
   * Check if user has specific admin permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!state.isAdmin || !state.adminProfile) {
      return false;
    }

    // Legacy admin has all permissions
    if (state.adminProfile.role === 'legacy_admin') {
      return true;
    }

    // TODO: Implement permission checking based on adminProfile.role and level
    // For now, return true for all permissions
    return true;
  };

  /**
   * Check if user has minimum admin level
   */
  const hasMinLevel = (minLevel: number): boolean => {
    if (!state.isAdmin || !state.adminProfile) {
      return false;
    }

    return state.adminProfile.level >= minLevel;
  };

  return {
    ...state,
    initializeAdminSystem,
    hasPermission,
    hasMinLevel,
    refreshAdminStatus: () => {
      // Force re-check admin status
      setState(prev => ({ ...prev, loading: true }));
    }
  };
};

export default useAdminAuth;