/**
 * Debug utilities for tracking getRecommendations calls
 */

interface CallInfo {
  timestamp: number;
  jobId: string;
  stackTrace: string;
  caller: string;
  blocked?: boolean;
  requestKey?: string;
}

class RecommendationsDebugger {
  private calls: CallInfo[] = [];
  private lastCallTime = 0;
  
  trackCall(jobId: string, caller = 'unknown', blocked = false, requestKey?: string): void {
    const now = Date.now();
    const stackTrace = new Error().stack || 'No stack trace available';
    
    this.calls.push({
      timestamp: now,
      jobId,
      stackTrace,
      caller,
      blocked,
      requestKey
    });
    
    // Enhanced logging for blocked vs actual requests
    if (blocked) {
      console.warn(`🚫 [RecommendationsDebugger] BLOCKED request for job ${jobId} from ${caller}`);
      console.warn(`🚫 [RecommendationsDebugger] Request key: ${requestKey}`);
    } else {
      console.warn(`✅ [RecommendationsDebugger] EXECUTING request for job ${jobId} from ${caller}`);
      console.warn(`✅ [RecommendationsDebugger] Request key: ${requestKey}`);
    }
    
    // Check for rapid successive calls (within 1 second)
    if (now - this.lastCallTime < 1000 && this.calls.length > 1) {
      const recentCalls = this.calls.filter(call => now - call.timestamp < 1000);
      const actualCalls = recentCalls.filter(call => !call.blocked);
      const blockedCalls = recentCalls.filter(call => call.blocked);
      
      console.warn(`🚨 MULTIPLE CALLS DETECTED! ${recentCalls.length} total calls within 1 second:`);
      console.warn(`   - ${actualCalls.length} actual requests`);
      console.warn(`   - ${blockedCalls.length} blocked requests`);
      
      recentCalls.forEach((call, index) => {
        const status = call.blocked ? '🚫 BLOCKED' : '✅ EXECUTED';
        console.warn(`  ${status} Call ${index + 1}:`, {
          caller: call.caller,
          jobId: call.jobId,
          timestamp: new Date(call.timestamp).toISOString(),
          timeDiff: index > 0 ? `+${call.timestamp - recentCalls[0].timestamp}ms` : 'initial',
          requestKey: call.requestKey
        });
      });
      
      // Show stack trace for actual calls only
      const actualCallsForTrace = recentCalls.filter(call => !call.blocked).slice(-2);
      if (actualCallsForTrace.length > 0) {
        console.group('🔍 Stack traces for actual (non-blocked) calls:');
        actualCallsForTrace.forEach((call, index) => {
          console.group(`Actual Call ${index + 1}:`);
          console.warn(call.stackTrace);
          console.groupEnd();
        });
        console.groupEnd();
      }
    }
    
    this.lastCallTime = now;
  }
  
  getCallHistory(jobId?: string): CallInfo[] {
    if (jobId) {
      return this.calls.filter(call => call.jobId === jobId);
    }
    return [...this.calls];
  }
  
  clearHistory(): void {
    this.calls = [];
    this.lastCallTime = 0;
  }
  
  getStats(jobId?: string): {
    totalCalls: number;
    actualCalls: number;
    blockedCalls: number;
    uniqueJobs: number;
    duplicateCalls: number;
    avgTimeBetweenCalls: number;
    blockingEffectiveness: number;
  } {
    const relevantCalls = jobId ? this.calls.filter(call => call.jobId === jobId) : this.calls;
    
    if (relevantCalls.length === 0) {
      return { 
        totalCalls: 0, 
        actualCalls: 0, 
        blockedCalls: 0, 
        uniqueJobs: 0, 
        duplicateCalls: 0, 
        avgTimeBetweenCalls: 0,
        blockingEffectiveness: 0
      };
    }
    
    const actualCalls = relevantCalls.filter(call => !call.blocked);
    const blockedCalls = relevantCalls.filter(call => call.blocked);
    const uniqueJobs = new Set(relevantCalls.map(call => call.jobId)).size;
    let duplicateCalls = 0;
    
    // Count duplicates (actual calls within 1 second of each other for same job)
    for (let i = 1; i < actualCalls.length; i++) {
      const current = actualCalls[i];
      const previous = actualCalls[i - 1];
      
      if (current.jobId === previous.jobId && 
          current.timestamp - previous.timestamp < 1000) {
        duplicateCalls++;
      }
    }
    
    const timeDiffs = [];
    for (let i = 1; i < actualCalls.length; i++) {
      timeDiffs.push(actualCalls[i].timestamp - actualCalls[i - 1].timestamp);
    }
    
    const avgTimeBetweenCalls = timeDiffs.length > 0 
      ? timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length 
      : 0;
    
    // Calculate blocking effectiveness (percentage of calls that were blocked)
    const blockingEffectiveness = relevantCalls.length > 0 
      ? (blockedCalls.length / relevantCalls.length) * 100 
      : 0;
    
    return {
      totalCalls: relevantCalls.length,
      actualCalls: actualCalls.length,
      blockedCalls: blockedCalls.length,
      uniqueJobs,
      duplicateCalls,
      avgTimeBetweenCalls,
      blockingEffectiveness
    };
  }
}

// Global instance
export const recommendationsDebugger = new RecommendationsDebugger();

// Make it available on window for debugging
if (typeof window !== 'undefined') {
  (window as any).recommendationsDebugger = recommendationsDebugger;
  
  // Add global method to access CVAnalyzer debug info
  (window as any).getRequestDebugInfo = () => {
    // Import CVAnalyzer dynamically to avoid circular dependency
    import('../services/cv/CVAnalyzer').then(({ CVAnalyzer }) => {
      const debugInfo = CVAnalyzer.getRequestDebugInfo();
      console.warn('🔍 Current Request Debug Info:', debugInfo);
      
      const stats = recommendationsDebugger.getStats();
      console.warn('📊 Call Statistics:', stats);
      
      return { debugInfo, stats };
    }).catch(console.error);
  };
  
  // Add global method to clear all tracking
  (window as any).clearAllRequestTracking = () => {
    recommendationsDebugger.clearHistory();
    import('../services/cv/CVAnalyzer').then(({ CVAnalyzer }) => {
      CVAnalyzer.clearRequestTracking();
      console.warn('🧹 All request tracking cleared');
    }).catch(console.error);
  };
}