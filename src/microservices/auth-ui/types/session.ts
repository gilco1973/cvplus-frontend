// Session management types for auth-ui microservice

export interface SessionData {
  sessionId: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  issuedAt: Date;
  expiresAt: Date;
  lastActivity: Date;
  isActive: boolean;
  isCurrent: boolean;
}

export interface SessionState {
  currentSession: SessionData | null;
  activeSessions: SessionData[];
  isLoading: boolean;
  error: string | null;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  isTrusted: boolean;
  lastSeen: Date;
}

export interface SessionConfig {
  maxConcurrentSessions: number;
  sessionTimeout: number; // in minutes
  rememberMeDuration: number; // in days
  requireMFAForSensitive: boolean;
}

export interface SessionActivity {
  timestamp: Date;
  action: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
}