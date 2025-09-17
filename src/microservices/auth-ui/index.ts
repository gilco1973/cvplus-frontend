// Auth UI Microservice - Authentication and authorization user interfaces
// Integrates with @cvplus/auth backend module for authentication services

// Authentication Components
export { default as SignInDialog } from './components/SignInDialog';
export { default as SignUpDialog } from './components/SignUpDialog';
export { default as AuthGuard } from './components/AuthGuard';
export { default as PermissionGate } from './components/PermissionGate';
export { default as SessionManager } from './components/SessionManager';
export { default as MFADialog } from './components/MFADialog';
export { default as PasswordResetDialog } from './components/PasswordResetDialog';

// Authentication Context and Provider
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { SessionProvider, useSession } from './contexts/SessionContext';

// Authentication Hooks
export { usePermissions } from './hooks/usePermissions';
export { useAuthGuard } from './hooks/useAuthGuard';
export { useMFA } from './hooks/useMFA';
export { usePasswordStrength } from './hooks/usePasswordStrength';

// Authentication Services (integrate with @cvplus/auth backend)
export { AuthUIService } from './services/AuthUIService';
export { SessionUIService } from './services/SessionUIService';
export { PermissionUIService } from './services/PermissionUIService';

// Authentication Types
export type * from './types/auth';
export type * from './types/session';
export type * from './types/permissions';

// Authentication Constants
export * from './constants/authConstants';

// Re-export from @cvplus/auth backend module
export type { User, UserRole, Permission } from '@cvplus/auth';