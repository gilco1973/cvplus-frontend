// Authentication types for auth-ui microservice
import type { User, Permission } from '@cvplus/core';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];
  premiumTier: PremiumTier;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MFASetupData {
  method: MFAMethod;
  phoneNumber?: string;
  backupCodes?: string[];
}

export interface MFAVerificationData {
  code: string;
  method: MFAMethod;
  trustDevice?: boolean;
}

export type MFAMethod = 'totp' | 'sms' | 'backup_code';

export type PremiumTier = 'free' | 'basic' | 'professional' | 'enterprise';

export interface AuthDialogState {
  isOpen: boolean;
  mode: 'signin' | 'signup' | 'reset' | 'mfa';
  returnUrl?: string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface SocialAuthProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}