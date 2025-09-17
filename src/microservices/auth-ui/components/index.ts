/**
 * Auth Module Components
 * 
 * Exports all authentication-related React components.
 * 
 * @author Gil Klainert
 * @version 1.0.0 - CVPlus Auth Module
  */

export { AuthGuard } from './AuthGuard';
export { PermissionGate, AdminOnly, ModeratorOnly, FeatureGate } from './PermissionGate';
// PremiumOnly component removed - moved to @cvplus/premium module
export { SignInDialog } from './SignInDialog';

// export { UserMenu } from './UserMenu';
// export { UserProfile } from './UserProfile';
// export { PremiumBadge } from './PremiumBadge';