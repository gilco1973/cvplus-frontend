/**
 * Auth Module Integration
 * 
 * Gradual migration from existing AuthContext to @cvplus/auth module.
 * Uses feature flags to enable smooth transition between legacy and new system.
 */

import { MODULE_FLAGS } from './index';

// Conditional imports based on feature flags
let authExports: any = {};

try {
  if (MODULE_FLAGS.USE_AUTH_MODULE && !MODULE_FLAGS.FALLBACK_TO_LEGACY) {
    // Use new @cvplus/auth module
    const cvplusAuth = require('@cvplus/auth');
    authExports = {
      useAuth: cvplusAuth.useAuth,
      usePremium: cvplusAuth.usePremium,
      useFeature: cvplusAuth.useFeature,
      usePremiumUpgrade: cvplusAuth.usePremiumUpgrade,
      AuthProvider: cvplusAuth.AuthProvider,
      AuthContextType: cvplusAuth.AuthContextType,
      PremiumContextType: cvplusAuth.PremiumContextType
    };
    console.log('✅ Using @cvplus/auth module');
  } else {
    // Fallback to legacy system
    const legacyAuth = require('../contexts/AuthContext');
    authExports = {
      useAuth: legacyAuth.useAuth,
      usePremium: legacyAuth.usePremium,
      useFeature: legacyAuth.useFeature,
      usePremiumUpgrade: legacyAuth.usePremiumUpgrade,
      AuthProvider: legacyAuth.AuthProvider,
      AuthContextType: legacyAuth.AuthContextType,
      PremiumContextType: legacyAuth.PremiumContextType
    };
    console.log('⚠️  Using legacy auth system');
  }
} catch (error) {
  console.error('Auth module loading error:', error);
  // Force fallback to legacy system
  const legacyAuth = require('../contexts/AuthContext');
  authExports = {
    useAuth: legacyAuth.useAuth,
    usePremium: legacyAuth.usePremium,
    useFeature: legacyAuth.useFeature,
    usePremiumUpgrade: legacyAuth.usePremiumUpgrade,
    AuthProvider: legacyAuth.AuthProvider,
    AuthContextType: legacyAuth.AuthContextType,
    PremiumContextType: legacyAuth.PremiumContextType
  };
  console.warn('🔄 Fallback to legacy auth system due to error');
}

// Export the selected auth system
export const {
  useAuth,
  usePremium,
  useFeature,
  usePremiumUpgrade,
  AuthProvider,
  AuthContextType,
  PremiumContextType
} = authExports;

// Migration helper functions
export const authMigrationHelpers = {
  isLegacyAuth: () => !MODULE_FLAGS.USE_AUTH_MODULE || MODULE_FLAGS.FALLBACK_TO_LEGACY,
  canUseNewAuth: () => MODULE_FLAGS.USE_AUTH_MODULE && !MODULE_FLAGS.FALLBACK_TO_LEGACY,
  shouldFallback: (error: Error) => {
    console.warn('Auth module error, falling back to legacy:', error);
    return MODULE_FLAGS.FALLBACK_TO_LEGACY;
  },
  getCurrentAuthSystem: () => {
    if (MODULE_FLAGS.USE_AUTH_MODULE && !MODULE_FLAGS.FALLBACK_TO_LEGACY) {
      return '@cvplus/auth';
    }
    return 'legacy';
  }
};
