/**
 * Navigation Debugger
 * Provides detailed logging and debugging for navigation issues
 */

import type { NavigateFunction } from 'react-router-dom';

export interface NavigationDebugInfo {
  timestamp: string;
  action: string;
  fromPath: string;
  toPath?: string;
  jobId?: string;
  success?: boolean;
  error?: string;
  data?: unknown;
}

class NavigationDebugger {
  private logs: NavigationDebugInfo[] = [];
  private maxLogs = 50;

  log(action: string, data: Partial<NavigationDebugInfo> = {}): void {
    const debugInfo: NavigationDebugInfo = {
      timestamp: new Date().toISOString(),
      action,
      fromPath: window.location.pathname,
      ...data
    };

    this.logs.push(debugInfo);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.warn(`🔍 [NAV-DEBUG] ${action}:`, debugInfo);
  }

  getLogs(): NavigationDebugInfo[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    console.warn('🗑️ [NAV-DEBUG] Logs cleared');
  }

  printReport(): void {
    console.group('📊 [NAV-DEBUG] Navigation Report');
    console.warn(`Total navigation events: ${this.logs.length}`);
    
    const successful = this.logs.filter(log => log.success === true).length;
    const failed = this.logs.filter(log => log.success === false).length;
    const pending = this.logs.filter(log => log.success === undefined).length;
    
    console.warn(`✅ Successful: ${successful}`);
    console.warn(`❌ Failed: ${failed}`);
    console.warn(`⏳ Pending: ${pending}`);
    
    console.warn('\n📝 Recent events:');
    this.logs.slice(-10).forEach((log, index) => {
      const status = log.success === true ? '✅' : log.success === false ? '❌' : '⏳';
      console.warn(`${status} ${log.timestamp} - ${log.action}`, {
        from: log.fromPath,
        to: log.toPath,
        jobId: log.jobId,
        error: log.error
      });
    });
    
    console.groupEnd();
  }

  testNavigation(navigate: NavigateFunction, jobId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const testId = Math.random().toString(36).substring(7);
      this.log('Navigation Test Started', { jobId, data: { testId } });
      
      const targetPath = `/preview/${jobId}`;
      const originalPath = window.location.pathname;
      
      try {
        navigate(targetPath);
        
        setTimeout(() => {
          const currentPath = window.location.pathname;
          const success = currentPath === targetPath;
          
          this.log('Navigation Test Completed', {
            jobId,
            toPath: targetPath,
            success,
            data: {
              testId,
              originalPath,
              currentPath,
              targetPath
            }
          });
          
          resolve(success);
        }, 200);
        
      } catch (error) {
        this.log('Navigation Test Failed', {
          jobId,
          toPath: targetPath,
          success: false,
          error: (error as Error).message,
          data: { testId }
        });
        
        resolve(false);
      }
    });
  }

  trackApplyRecommendations(jobId: string, recommendationIds: string[]): void {
    this.log('Apply Recommendations Started', {
      jobId,
      data: {
        recommendationIds,
        count: recommendationIds.length
      }
    });
  }

  trackApplyRecommendationsResult(jobId: string, success: boolean, error?: string): void {
    this.log('Apply Recommendations Completed', {
      jobId,
      success,
      error,
      data: {
        sessionStorageSet: !!sessionStorage.getItem(`recommendations-${jobId}`)
      }
    });
  }

  trackNavigationAttempt(method: string, jobId: string, targetPath: string): void {
    this.log(`Navigation Attempt: ${method}`, {
      jobId,
      toPath: targetPath,
      data: { method }
    });
  }

  trackNavigationResult(method: string, jobId: string, success: boolean, error?: string): void {
    this.log(`Navigation Result: ${method}`, {
      jobId,
      success,
      error,
      data: {
        method,
        currentPath: window.location.pathname
      }
    });
  }
}

export const navigationDebugger = new NavigationDebugger();

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).navigationDebugger = navigationDebugger;
}