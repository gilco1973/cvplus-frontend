/**
 * Error Reporting and Context Preservation Service
 * 
 * Provides comprehensive error reporting, context preservation,
 * and telemetry collection for support and debugging.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { ClassifiedError, ErrorContext } from './ErrorClassification';
import { ProcessingCheckpoint } from './CheckpointManager';
import { RetryResult } from './RetryMechanism';

export interface ErrorReport {
  id: string;
  userId: string;
  error: ClassifiedError;
  context: ErrorReportContext;
  systemInfo: SystemInfo;
  recoveryAttempts: RecoveryAttempt[];
  userFeedback?: UserFeedback;
  status: 'reported' | 'acknowledged' | 'investigating' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorReportContext {
  sessionId?: string;
  jobId?: string;
  userAgent: string;
  url: string;
  timestamp: Date;
  userActions: UserAction[];
  checkpoints: ProcessingCheckpoint[];
  networkConditions: NetworkInfo;
  performance: PerformanceInfo;
}

export interface SystemInfo {
  browser: string;
  browserVersion: string;
  os: string;
  screenResolution: string;
  timezone: string;
  language: string;
  cookiesEnabled: boolean;
  localStorageEnabled: boolean;
  onlineStatus: boolean;
}

export interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface PerformanceInfo {
  loadTime: number;
  memoryUsage?: number;
  connectionType: string;
}

export interface UserAction {
  type: string;
  target: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export interface RecoveryAttempt {
  type: 'retry' | 'checkpoint_restore' | 'manual_intervention';
  timestamp: Date;
  result: 'success' | 'failure' | 'partial';
  details: Record<string, unknown>;
  retryResult?: RetryResult<any>;
}

export interface UserFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  description: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  additionalInfo?: string;
}

export class ErrorReportingService {
  private static instance: ErrorReportingService;
  private userActions: UserAction[] = [];
  private maxUserActions = 50;
  private isTrackingActions = true;

  private constructor() {
    this.setupActionTracking();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  /**
   * Reports an error with full context
   */
  public async reportError(
    error: ClassifiedError,
    context: {
      sessionId?: string;
      jobId?: string;
      checkpoints?: ProcessingCheckpoint[];
      recoveryAttempts?: RecoveryAttempt[];
      userFeedback?: UserFeedback;
    } = {}
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Cannot report error: user not authenticated');
      return '';
    }

    const reportId = this.generateReportId();
    const now = new Date();

    const report: ErrorReport = {
      id: reportId,
      userId: user.uid,
      error,
      context: {
        sessionId: context.sessionId,
        jobId: context.jobId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: now,
        userActions: this.getRecentUserActions(),
        checkpoints: context.checkpoints || [],
        networkConditions: this.getNetworkInfo(),
        performance: this.getPerformanceInfo()
      },
      systemInfo: this.getSystemInfo(),
      recoveryAttempts: context.recoveryAttempts || [],
      userFeedback: context.userFeedback,
      status: 'reported',
      createdAt: now,
      updatedAt: now
    };

    try {
      // Save to Firestore
      await this.saveReport(report);
      
      // Also save to localStorage as backup
      this.saveReportLocally(report);

      console.warn(`Error reported with ID: ${reportId}`);
      return reportId;

    } catch (reportingError: unknown) {
      console.error('Failed to report error:', reportingError);
      
      // Fallback to localStorage only
      this.saveReportLocally(report);
      return reportId;
    }
  }

  /**
   * Updates an existing error report
   */
  public async updateReport(
    reportId: string,
    updates: {
      recoveryAttempts?: RecoveryAttempt[];
      userFeedback?: UserFeedback;
      status?: ErrorReport['status'];
    }
  ): Promise<boolean> {
    try {
      const user = auth.currentUser;
      if (!user) return false;

      const docRef = doc(db, 'users', user.uid, 'errorReports', reportId);
      await setDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Failed to update error report:', error);
      return false;
    }
  }

  /**
   * Gets error reports for the current user
   */
  public async getUserReports(limitCount = 10): Promise<ErrorReport[]> {
    try {
      const user = auth.currentUser;
      if (!user) return [];

      const q = query(
        collection(db, 'users', user.uid, 'errorReports'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      } as ErrorReport));

    } catch (error) {
      console.error('Failed to get user reports:', error);
      return [];
    }
  }

  /**
   * Adds recovery attempt to tracking
   */
  public trackRecoveryAttempt(
    type: RecoveryAttempt['type'],
    result: RecoveryAttempt['result'],
    details: Record<string, unknown>,
    retryResult?: RetryResult<any>
  ): RecoveryAttempt {
    const attempt: RecoveryAttempt = {
      type,
      timestamp: new Date(),
      result,
      details,
      retryResult
    };

    // Store in session for later use in error reports
    const existingAttempts = JSON.parse(
      sessionStorage.getItem('cvplus_recovery_attempts') || '[]'
    );
    existingAttempts.push(attempt);
    
    // Keep only last 10 attempts
    if (existingAttempts.length > 10) {
      existingAttempts.splice(0, existingAttempts.length - 10);
    }
    
    sessionStorage.setItem('cvplus_recovery_attempts', JSON.stringify(existingAttempts));
    return attempt;
  }

  /**
   * Gets stored recovery attempts
   */
  public getRecoveryAttempts(): RecoveryAttempt[] {
    try {
      const attempts = sessionStorage.getItem('cvplus_recovery_attempts');
      return attempts ? JSON.parse(attempts) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Clears recovery attempts (call after successful completion)
   */
  public clearRecoveryAttempts(): void {
    sessionStorage.removeItem('cvplus_recovery_attempts');
  }

  /**
   * Action tracking methods
   */
  public startActionTracking(): void {
    this.isTrackingActions = true;
  }

  public stopActionTracking(): void {
    this.isTrackingActions = false;
  }

  public trackUserAction(
    type: string,
    target: string,
    details?: Record<string, unknown>
  ): void {
    if (!this.isTrackingActions) return;

    const action: UserAction = {
      type,
      target,
      timestamp: new Date(),
      details
    };

    this.userActions.push(action);

    // Keep only recent actions
    if (this.userActions.length > this.maxUserActions) {
      this.userActions.shift();
    }
  }

  /**
   * Context collection methods
   */
  private getSystemInfo(): SystemInfo {
    const ua = navigator.userAgent;
    
    return {
      browser: this.getBrowserName(ua),
      browserVersion: this.getBrowserVersion(ua),
      os: this.getOperatingSystem(ua),
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageEnabled: this.isLocalStorageEnabled(),
      onlineStatus: navigator.onLine
    };
  }

  private getNetworkInfo(): NetworkInfo {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    return {
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    };
  }

  private getPerformanceInfo(): PerformanceInfo {
    const loadTime = performance.now();
    const nav = navigator as any;
    const connection = nav.connection;
    const perf = performance as any;
    
    return {
      loadTime,
      memoryUsage: perf.memory?.usedJSHeapSize,
      connectionType: connection?.effectiveType || 'unknown'
    };
  }

  private getRecentUserActions(count = 20): UserAction[] {
    return this.userActions.slice(-count);
  }

  /**
   * Storage methods
   */
  private async saveReport(report: ErrorReport): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const docRef = doc(db, 'users', user.uid, 'errorReports', report.id);
    await setDoc(docRef, {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }

  private saveReportLocally(report: ErrorReport): void {
    try {
      const existing = JSON.parse(localStorage.getItem('cvplus_error_reports') || '[]');
      existing.push({
        ...report,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString()
      });
      
      // Keep only last 50 reports
      if (existing.length > 50) {
        existing.splice(0, existing.length - 50);
      }
      
      localStorage.setItem('cvplus_error_reports', JSON.stringify(existing));
    } catch (error) {
      console.error('Failed to save report locally:', error);
    }
  }

  /**
   * Setup methods
   */
  private setupActionTracking(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      if (!this.isTrackingActions) return;
      
      const target = event.target as HTMLElement;
      this.trackUserAction('click', this.getElementSelector(target), {
        text: target.textContent?.slice(0, 100),
        tagName: target.tagName
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      if (!this.isTrackingActions) return;
      
      const target = event.target as HTMLFormElement;
      this.trackUserAction('submit', this.getElementSelector(target), {
        action: target.action,
        method: target.method
      });
    });

    // Track navigation
    let lastUrl = location.href;
    new MutationObserver(() => {
      const url = location.href;
      if (url !== lastUrl) {
        this.trackUserAction('navigation', url, { previousUrl: lastUrl });
        lastUrl = url;
      }
    }).observe(document, { subtree: true, childList: true });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor errors
    window.addEventListener('error', (event) => {
      this.trackUserAction('error', 'window', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackUserAction('unhandled_rejection', 'window', {
        reason: event.reason?.toString()
      });
    });
  }

  /**
   * Utility methods
   */
  private generateReportId(): string {
    return `err_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private getBrowserName(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }

  private getOperatingSystem(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private isLocalStorageEnabled(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

export default ErrorReportingService;