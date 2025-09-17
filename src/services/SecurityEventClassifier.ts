/**
 * T045: Security event classifier with threat detection and analysis
 *
 * Advanced security event classification system that analyzes user actions,
 * API calls, and system events to detect potential security threats,
 * anomalous behavior, and policy violations in real-time.
 */

import { logger } from '../utils/logger';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  category: SecurityCategory;
  description: string;
  sourceIp?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  payload?: Record<string, any>;
  headers?: Record<string, any>;
  metadata?: Record<string, any>;
}

export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  ACCOUNT_LOCKOUT = 'account_lockout',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILURE = 'mfa_failure',

  // Authorization Events
  ACCESS_DENIED = 'access_denied',
  PRIVILEGE_ESCALATION_ATTEMPT = 'privilege_escalation_attempt',
  RESOURCE_ACCESS = 'resource_access',
  PERMISSION_VIOLATION = 'permission_violation',

  // Input Validation Events
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  COMMAND_INJECTION_ATTEMPT = 'command_injection_attempt',
  PATH_TRAVERSAL_ATTEMPT = 'path_traversal_attempt',
  INPUT_VALIDATION_FAILURE = 'input_validation_failure',

  // Rate Limiting Events
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  DOS_ATTEMPT = 'dos_attempt',

  // Data Security Events
  PII_ACCESS = 'pii_access',
  DATA_EXPORT = 'data_export',
  BULK_DATA_ACCESS = 'bulk_data_access',
  UNAUTHORIZED_DATA_ACCESS = 'unauthorized_data_access',

  // System Events
  CONFIGURATION_CHANGE = 'configuration_change',
  SYSTEM_ERROR = 'system_error',
  AUDIT_LOG_ACCESS = 'audit_log_access',
  BACKUP_ACCESS = 'backup_access',

  // Application Events
  FILE_UPLOAD_VIOLATION = 'file_upload_violation',
  API_ABUSE = 'api_abuse',
  SESSION_ANOMALY = 'session_anomaly',
  GEOLOCATION_ANOMALY = 'geolocation_anomaly',
  USER_AGENT_ANOMALY = 'user_agent_anomaly'
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum SecurityCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  INPUT_VALIDATION = 'input_validation',
  RATE_LIMITING = 'rate_limiting',
  DATA_SECURITY = 'data_security',
  SYSTEM_SECURITY = 'system_security',
  APPLICATION_SECURITY = 'application_security'
}

export interface SecurityClassificationResult {
  event: SecurityEvent;
  threatLevel: number; // 0-100
  confidence: number; // 0-100
  indicators: SecurityIndicator[];
  recommendedActions: SecurityAction[];
  shouldAlert: boolean;
  shouldBlock: boolean;
}

export interface SecurityIndicator {
  type: string;
  value: any;
  weight: number;
  description: string;
}

export interface SecurityAction {
  action: 'log' | 'alert' | 'block' | 'investigate' | 'monitor';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  automated: boolean;
}

interface ThreatPattern {
  pattern: RegExp;
  type: SecurityEventType;
  severity: SecuritySeverity;
  category: SecurityCategory;
  description: string;
  indicators: string[];
}

interface UserBehaviorProfile {
  userId: string;
  typicalLocations: string[];
  typicalUserAgents: string[];
  averageSessionDuration: number;
  typicalAccessPatterns: string[];
  lastSeen: Date;
  riskScore: number;
}

export class SecurityEventClassifier {
  private readonly threatPatterns: ThreatPattern[];
  private readonly userProfiles = new Map<string, UserBehaviorProfile>();
  private readonly recentEvents = new Map<string, SecurityEvent[]>();
  private readonly rateLimitCounters = new Map<string, { count: number; resetTime: Date }>();

  constructor() {
    this.threatPatterns = this.initializeThreatPatterns();
    this.startCleanupInterval();
  }

  /**
   * Classify a request or event for security threats
   */
  async classifyRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    payload?: any,
    userId?: string,
    sessionId?: string,
    sourceIp?: string
  ): Promise<SecurityClassificationResult> {
    const event = await this.createSecurityEvent({
      url,
      method,
      headers,
      payload,
      userId,
      sessionId,
      sourceIp
    });

    return this.classifyEvent(event);
  }

  /**
   * Classify a security event
   */
  async classifyEvent(event: SecurityEvent): Promise<SecurityClassificationResult> {
    const startTime = performance.now();

    try {
      // Initialize classification result
      const result: SecurityClassificationResult = {
        event,
        threatLevel: 0,
        confidence: 0,
        indicators: [],
        recommendedActions: [],
        shouldAlert: false,
        shouldBlock: false
      };

      // Run classification algorithms
      await Promise.all([
        this.analyzePatterns(event, result),
        this.analyzeBehavior(event, result),
        this.analyzeRateLimit(event, result),
        this.analyzeGeolocation(event, result),
        this.analyzeInput(event, result),
        this.analyzeSession(event, result)
      ]);

      // Calculate final threat level and confidence
      this.calculateThreatMetrics(result);

      // Determine actions
      this.determineActions(result);

      // Log classification result
      logger.logEvent('security.classification_completed', {
        eventId: event.id,
        threatLevel: result.threatLevel,
        confidence: result.confidence,
        shouldAlert: result.shouldAlert,
        shouldBlock: result.shouldBlock,
        processingTime: performance.now() - startTime,
        indicatorCount: result.indicators.length,
        actionCount: result.recommendedActions.length
      });

      // Store event for behavior analysis
      this.storeEventForAnalysis(event);

      return result;

    } catch (error) {
      logger.logError('Security event classification failed', error, {
        eventId: event.id,
        processingTime: performance.now() - startTime
      });
      throw error;
    }
  }

  /**
   * Analyze threat patterns in the event
   */
  private async analyzePatterns(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    const searchString = `${event.url} ${JSON.stringify(event.payload)} ${JSON.stringify(event.headers)}`.toLowerCase();

    for (const pattern of this.threatPatterns) {
      if (pattern.pattern.test(searchString)) {
        result.indicators.push({
          type: 'pattern_match',
          value: pattern.type,
          weight: this.getSeverityWeight(pattern.severity),
          description: `Detected ${pattern.description}: ${pattern.pattern.source}`
        });

        // Update event classification if more severe
        if (this.getSeverityWeight(pattern.severity) > this.getSeverityWeight(event.severity)) {
          event.type = pattern.type;
          event.severity = pattern.severity;
          event.category = pattern.category;
        }
      }
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private async analyzeBehavior(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    if (!event.userId) return;

    let profile = this.userProfiles.get(event.userId);
    if (!profile) {
      profile = {
        userId: event.userId,
        typicalLocations: [],
        typicalUserAgents: [],
        averageSessionDuration: 0,
        typicalAccessPatterns: [],
        lastSeen: new Date(),
        riskScore: 0
      };
      this.userProfiles.set(event.userId, profile);
    }

    // Check for behavioral anomalies
    const anomalies = this.detectBehaviorAnomalies(event, profile);
    result.indicators.push(...anomalies);

    // Update profile
    this.updateUserProfile(event, profile);
  }

  /**
   * Analyze rate limiting violations
   */
  private async analyzeRateLimit(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    const key = `${event.sourceIp || 'unknown'}_${event.userId || 'anonymous'}`;
    const current = this.rateLimitCounters.get(key) || { count: 0, resetTime: new Date(Date.now() + 60000) };

    // Reset counter if time window expired
    if (new Date() > current.resetTime) {
      current.count = 0;
      current.resetTime = new Date(Date.now() + 60000);
    }

    current.count++;
    this.rateLimitCounters.set(key, current);

    // Check thresholds
    if (current.count > 100) { // 100 requests per minute
      result.indicators.push({
        type: 'rate_limit_violation',
        value: current.count,
        weight: 80,
        description: `Excessive request rate: ${current.count} requests in current window`
      });

      event.type = SecurityEventType.RATE_LIMIT_EXCEEDED;
      event.severity = SecuritySeverity.HIGH;
    } else if (current.count > 50) {
      result.indicators.push({
        type: 'rate_limit_warning',
        value: current.count,
        weight: 40,
        description: `High request rate: ${current.count} requests in current window`
      });
    }
  }

  /**
   * Analyze geolocation anomalies
   */
  private async analyzeGeolocation(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    // In a real implementation, this would use IP geolocation services
    // For now, we'll simulate basic IP analysis
    if (event.sourceIp) {
      // Check for suspicious IP patterns
      if (this.isTorExitNode(event.sourceIp) || this.isVpnProvider(event.sourceIp)) {
        result.indicators.push({
          type: 'suspicious_ip',
          value: event.sourceIp,
          weight: 30,
          description: 'Request from suspicious IP address (VPN/Tor)'
        });
      }

      // Check for rapid geolocation changes (simplified)
      if (event.userId) {
        const recentEvents = this.getRecentUserEvents(event.userId, 24 * 60 * 60 * 1000); // 24 hours
        if (recentEvents.length > 0) {
          // Simplified: just check if IP changed rapidly
          const lastEvent = recentEvents[recentEvents.length - 1];
          const timeDiff = event.timestamp.getTime() - lastEvent.timestamp.getTime();
          if (timeDiff < 60 * 60 * 1000 && lastEvent.sourceIp !== event.sourceIp) { // 1 hour
            result.indicators.push({
              type: 'rapid_location_change',
              value: { from: lastEvent.sourceIp, to: event.sourceIp, timeMinutes: timeDiff / (60 * 1000) },
              weight: 50,
              description: 'Rapid geolocation change detected'
            });
          }
        }
      }
    }
  }

  /**
   * Analyze input validation issues
   */
  private async analyzeInput(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    if (!event.payload) return;

    const payloadString = JSON.stringify(event.payload).toLowerCase();
    const inputChecks = [
      {
        pattern: /<script|javascript:|onload=|onerror=/gi,
        type: SecurityEventType.XSS_ATTEMPT,
        description: 'XSS attempt detected in input'
      },
      {
        pattern: /union.*select|drop.*table|insert.*into|delete.*from/gi,
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        description: 'SQL injection attempt detected'
      },
      {
        pattern: /\.\.\//gi,
        type: SecurityEventType.PATH_TRAVERSAL_ATTEMPT,
        description: 'Path traversal attempt detected'
      },
      {
        pattern: /cmd\s*=|exec\s*\(|system\s*\(|eval\s*\(/gi,
        type: SecurityEventType.COMMAND_INJECTION_ATTEMPT,
        description: 'Command injection attempt detected'
      }
    ];

    for (const check of inputChecks) {
      if (check.pattern.test(payloadString)) {
        result.indicators.push({
          type: 'malicious_input',
          value: check.type,
          weight: 90,
          description: check.description
        });

        event.type = check.type;
        event.severity = SecuritySeverity.HIGH;
        event.category = SecurityCategory.INPUT_VALIDATION;
      }
    }
  }

  /**
   * Analyze session anomalies
   */
  private async analyzeSession(
    event: SecurityEvent,
    result: SecurityClassificationResult
  ): Promise<void> {
    if (!event.sessionId || !event.userId) return;

    // Check for session hijacking indicators
    const recentEvents = this.getRecentUserEvents(event.userId, 60 * 60 * 1000); // 1 hour
    const sessionEvents = recentEvents.filter(e => e.sessionId === event.sessionId);

    if (sessionEvents.length > 0) {
      // Check for inconsistent user agents
      const userAgents = new Set(sessionEvents.map(e => e.userAgent).filter(Boolean));
      if (userAgents.size > 1) {
        result.indicators.push({
          type: 'user_agent_change',
          value: Array.from(userAgents),
          weight: 60,
          description: 'User agent changed within session'
        });
      }

      // Check for suspicious session duration
      const sessionStart = Math.min(...sessionEvents.map(e => e.timestamp.getTime()));
      const sessionDuration = event.timestamp.getTime() - sessionStart;
      if (sessionDuration > 12 * 60 * 60 * 1000) { // 12 hours
        result.indicators.push({
          type: 'long_session',
          value: sessionDuration / (60 * 60 * 1000), // hours
          weight: 20,
          description: 'Unusually long session duration'
        });
      }
    }
  }

  /**
   * Create a security event from request data
   */
  private async createSecurityEvent(data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    payload?: any;
    userId?: string;
    sessionId?: string;
    sourceIp?: string;
  }): Promise<SecurityEvent> {
    return {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
      timestamp: new Date(),
      type: SecurityEventType.RESOURCE_ACCESS,
      severity: SecuritySeverity.LOW,
      category: SecurityCategory.APPLICATION_SECURITY,
      description: `${data.method} ${data.url}`,
      sourceIp: data.sourceIp,
      userId: data.userId,
      sessionId: data.sessionId,
      userAgent: data.headers['user-agent'],
      url: data.url,
      method: data.method,
      payload: data.payload,
      headers: data.headers
    };
  }

  /**
   * Initialize threat detection patterns
   */
  private initializeThreatPatterns(): ThreatPattern[] {
    return [
      // XSS Patterns
      {
        pattern: /<script[^>]*>|javascript:|onload\s*=|onerror\s*=|onclick\s*=/gi,
        type: SecurityEventType.XSS_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        category: SecurityCategory.INPUT_VALIDATION,
        description: 'Cross-Site Scripting (XSS) attempt',
        indicators: ['script_tags', 'javascript_protocol', 'event_handlers']
      },

      // SQL Injection Patterns
      {
        pattern: /union\s+select|drop\s+table|insert\s+into|delete\s+from|exec\s*\(|sp_|xp_/gi,
        type: SecurityEventType.SQL_INJECTION_ATTEMPT,
        severity: SecuritySeverity.HIGH,
        category: SecurityCategory.INPUT_VALIDATION,
        description: 'SQL Injection attempt',
        indicators: ['sql_keywords', 'database_commands']
      },

      // Path Traversal Patterns
      {
        pattern: /\.\.[\/\\]|\.\.%2f|\.\.%5c/gi,
        type: SecurityEventType.PATH_TRAVERSAL_ATTEMPT,
        severity: SecuritySeverity.MEDIUM,
        category: SecurityCategory.INPUT_VALIDATION,
        description: 'Path traversal attempt',
        indicators: ['directory_traversal', 'encoded_paths']
      },

      // Command Injection Patterns
      {
        pattern: /;\s*(rm|del|format|shutdown)|cmd\s*=|exec\s*\(|system\s*\(|eval\s*\(/gi,
        type: SecurityEventType.COMMAND_INJECTION_ATTEMPT,
        severity: SecuritySeverity.CRITICAL,
        category: SecurityCategory.INPUT_VALIDATION,
        description: 'Command injection attempt',
        indicators: ['system_commands', 'command_execution']
      }
    ];
  }

  /**
   * Helper methods
   */
  private getSeverityWeight(severity: SecuritySeverity): number {
    switch (severity) {
      case SecuritySeverity.LOW: return 25;
      case SecuritySeverity.MEDIUM: return 50;
      case SecuritySeverity.HIGH: return 75;
      case SecuritySeverity.CRITICAL: return 100;
      default: return 0;
    }
  }

  private detectBehaviorAnomalies(event: SecurityEvent, profile: UserBehaviorProfile): SecurityIndicator[] {
    const indicators: SecurityIndicator[] = [];

    // Check user agent consistency
    if (event.userAgent && profile.typicalUserAgents.length > 0) {
      if (!profile.typicalUserAgents.includes(event.userAgent)) {
        indicators.push({
          type: 'user_agent_anomaly',
          value: event.userAgent,
          weight: 30,
          description: 'New or unusual user agent detected'
        });
      }
    }

    // Check time since last seen
    const timeSinceLastSeen = event.timestamp.getTime() - profile.lastSeen.getTime();
    if (timeSinceLastSeen > 30 * 24 * 60 * 60 * 1000) { // 30 days
      indicators.push({
        type: 'long_absence',
        value: timeSinceLastSeen / (24 * 60 * 60 * 1000), // days
        weight: 15,
        description: 'User returning after long absence'
      });
    }

    return indicators;
  }

  private updateUserProfile(event: SecurityEvent, profile: UserBehaviorProfile): void {
    // Update user agent list
    if (event.userAgent && !profile.typicalUserAgents.includes(event.userAgent)) {
      profile.typicalUserAgents.push(event.userAgent);
      // Keep only last 5 user agents
      if (profile.typicalUserAgents.length > 5) {
        profile.typicalUserAgents.shift();
      }
    }

    // Update last seen
    profile.lastSeen = event.timestamp;
  }

  private getRecentUserEvents(userId: string, timeWindowMs: number): SecurityEvent[] {
    const events = this.recentEvents.get(userId) || [];
    const cutoff = new Date(Date.now() - timeWindowMs);
    return events.filter(event => event.timestamp > cutoff);
  }

  private storeEventForAnalysis(event: SecurityEvent): void {
    if (!event.userId) return;

    const events = this.recentEvents.get(event.userId) || [];
    events.push(event);

    // Keep only last 100 events per user
    if (events.length > 100) {
      events.shift();
    }

    this.recentEvents.set(event.userId, events);
  }

  private calculateThreatMetrics(result: SecurityClassificationResult): void {
    if (result.indicators.length === 0) {
      result.threatLevel = 0;
      result.confidence = 100;
      return;
    }

    // Calculate weighted threat level
    const totalWeight = result.indicators.reduce((sum, indicator) => sum + indicator.weight, 0);
    result.threatLevel = Math.min(100, totalWeight);

    // Calculate confidence based on number and weight of indicators
    const highWeightIndicators = result.indicators.filter(i => i.weight >= 50);
    if (highWeightIndicators.length > 0) {
      result.confidence = Math.min(100, 60 + (highWeightIndicators.length * 20));
    } else {
      result.confidence = Math.min(100, 30 + (result.indicators.length * 10));
    }
  }

  private determineActions(result: SecurityClassificationResult): void {
    // Determine if we should alert
    result.shouldAlert = result.threatLevel >= 50 || result.indicators.some(i => i.weight >= 80);

    // Determine if we should block
    result.shouldBlock = result.threatLevel >= 80 || result.indicators.some(i => i.weight >= 90);

    // Add recommended actions
    if (result.shouldBlock) {
      result.recommendedActions.push({
        action: 'block',
        priority: 'urgent',
        description: 'Block request due to high threat level',
        automated: true
      });
    }

    if (result.shouldAlert) {
      result.recommendedActions.push({
        action: 'alert',
        priority: result.threatLevel >= 80 ? 'high' : 'medium',
        description: 'Send security alert to monitoring team',
        automated: true
      });
    }

    result.recommendedActions.push({
      action: 'log',
      priority: 'low',
      description: 'Log security event for analysis',
      automated: true
    });

    if (result.threatLevel >= 30) {
      result.recommendedActions.push({
        action: 'monitor',
        priority: 'medium',
        description: 'Monitor user for additional suspicious activity',
        automated: true
      });
    }
  }

  // Simplified implementations for demo purposes
  private isTorExitNode(ip: string): boolean {
    // In real implementation, check against Tor exit node list
    return ip.startsWith('192.168.') || ip.startsWith('10.0.') || ip.startsWith('172.');
  }

  private isVpnProvider(ip: string): boolean {
    // In real implementation, check against known VPN provider IP ranges
    return false;
  }

  private startCleanupInterval(): void {
    // Clean up old data every hour
    setInterval(() => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours

      // Clean up recent events
      for (const [userId, events] of this.recentEvents.entries()) {
        const filteredEvents = events.filter(event => event.timestamp > cutoff);
        if (filteredEvents.length === 0) {
          this.recentEvents.delete(userId);
        } else {
          this.recentEvents.set(userId, filteredEvents);
        }
      }

      // Clean up rate limit counters
      for (const [key, counter] of this.rateLimitCounters.entries()) {
        if (new Date() > counter.resetTime) {
          this.rateLimitCounters.delete(key);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}

/**
 * Global security event classifier instance
 */
export const globalSecurityClassifier = new SecurityEventClassifier();

/**
 * Factory function to create security classifier with custom config
 */
export function createSecurityClassifier(): SecurityEventClassifier {
  return new SecurityEventClassifier();
}

export default SecurityEventClassifier;