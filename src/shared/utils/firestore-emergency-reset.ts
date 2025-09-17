/**
 * Emergency Firestore Connection Reset Utility
 * 
 * Handles critical Firebase SDK 12.0.0 assertion failures (b815/ca9)
 * by providing emergency reset and recovery mechanisms.
 * 
 * Author: Gil Klainert
 * Date: 2025-08-19
 */

import { db } from '../lib/firebase';
import { terminate, clearIndexedDbPersistence, enableNetwork, disableNetwork } from 'firebase/firestore';

export interface EmergencyResetOptions {
  clearCache?: boolean;
  reinitializeConnection?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ResetResult {
  success: boolean;
  error?: Error;
  steps: string[];
  recoveryTime: number;
}

/**
 * Emergency reset for Firestore assertion failures
 * Specifically targets b815/ca9 errors in Firebase SDK 12.0.0
 */
export const emergencyFirestoreReset = async (
  options: EmergencyResetOptions = {}
): Promise<ResetResult> => {
  const startTime = Date.now();
  const steps: string[] = [];
  
  const {
    clearCache = true,
    reinitializeConnection = true,
    maxRetries = 3,
    retryDelay = 2000
  } = options;
  
  try {
    console.warn('[EmergencyReset] Starting Firestore emergency reset due to assertion failures');
    steps.push('Emergency reset initiated');
    
    // Step 1: Disable network to stop all active operations
    try {
      await disableNetwork(db);
      steps.push('Network disabled - stopping active operations');
      console.warn('[EmergencyReset] Network disabled successfully');
    } catch (error) {
      console.warn('[EmergencyReset] Network disable failed:', error);
      steps.push('Network disable failed (non-critical)');
    }
    
    // Step 2: Wait for operations to settle
    await new Promise(resolve => setTimeout(resolve, 1000));
    steps.push('Waiting for operations to settle (1s)');
    
    // Step 3: Clear IndexedDB persistence if requested
    if (clearCache) {
      try {
        await terminate(db);
        steps.push('Firestore instance terminated');
        
        await clearIndexedDbPersistence(db);
        steps.push('IndexedDB cache cleared');
        console.warn('[EmergencyReset] Cache cleared successfully');
      } catch (error) {
        console.warn('[EmergencyReset] Cache clear failed:', error);
        steps.push('Cache clear failed (may not be critical)');
      }
    }
    
    // Step 4: Reinitialize connection if requested
    if (reinitializeConnection) {
      try {
        await enableNetwork(db);
        steps.push('Network re-enabled');
        console.warn('[EmergencyReset] Network re-enabled successfully');
        
        // Wait for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 2000));
        steps.push('Connection stabilization wait (2s)');
      } catch (error) {
        console.error('[EmergencyReset] Network re-enable failed:', error);
        steps.push('Network re-enable failed');
        throw error;
      }
    }
    
    const recoveryTime = Date.now() - startTime;
    console.warn(`[EmergencyReset] Reset completed successfully in ${recoveryTime}ms`);
    
    return {
      success: true,
      steps,
      recoveryTime
    };
    
  } catch (error) {
    const recoveryTime = Date.now() - startTime;
    console.error('[EmergencyReset] Emergency reset failed:', error);
    
    return {
      success: false,
      error: error as Error,
      steps,
      recoveryTime
    };
  }
};

/**
 * Check if the current error is a known Firebase SDK 12.0.0 assertion failure
 */
export const isFirestoreAssertionError = (error: Error): boolean => {
  const message = error.message?.toLowerCase() || '';
  const stack = error.stack?.toLowerCase() || '';
  
  return (
    message.includes('internal assertion failed') ||
    message.includes('id: b815') ||
    message.includes('id: ca9') ||
    message.includes('unexpected state') ||
    message.includes('targetstate') ||
    message.includes('watchchangeaggregator') ||
    stack.includes('targetstate.ke') ||
    stack.includes('watchchange') ||
    message.includes('ve":-1')
  );
};

/**
 * Monitor Firestore connection health and trigger reset if needed
 */
export class FirestoreHealthMonitor {
  private errorCount = 0;
  private lastResetTime = 0;
  private readonly maxErrors = 3;
  private readonly resetCooldown = 30000; // 30 seconds
  
  constructor(
    private onHealthChanged?: (healthy: boolean) => void
  ) {}
  
  reportError(error: Error): boolean {
    if (!isFirestoreAssertionError(error)) {
      return false;
    }
    
    this.errorCount++;
    console.warn(`[HealthMonitor] Firestore assertion error detected (${this.errorCount}/${this.maxErrors})`);
    
    // Trigger emergency reset if threshold exceeded and cooldown passed
    const now = Date.now();
    if (this.errorCount >= this.maxErrors && now - this.lastResetTime > this.resetCooldown) {
      console.error('[HealthMonitor] Error threshold exceeded, triggering emergency reset');
      this.triggerEmergencyReset();
      return true;
    }
    
    return false;
  }
  
  private async triggerEmergencyReset(): Promise<void> {
    this.lastResetTime = Date.now();
    this.onHealthChanged?.(false);
    
    try {
      const result = await emergencyFirestoreReset({
        clearCache: true,
        reinitializeConnection: true,
        maxRetries: 2
      });
      
      if (result.success) {
        console.warn('[HealthMonitor] Emergency reset successful, resetting error count');
        this.errorCount = 0;
        this.onHealthChanged?.(true);
      } else {
        console.error('[HealthMonitor] Emergency reset failed:', result.error);
      }
    } catch (error) {
      console.error('[HealthMonitor] Emergency reset exception:', error);
    }
  }
  
  reset(): void {
    this.errorCount = 0;
    this.lastResetTime = 0;
    this.onHealthChanged?.(true);
  }
  
  getStatus() {
    return {
      errorCount: this.errorCount,
      lastResetTime: this.lastResetTime,
      healthy: this.errorCount < this.maxErrors
    };
  }
}

// Global health monitor instance
export const firestoreHealthMonitor = new FirestoreHealthMonitor(
  (healthy) => {
    console.warn(`[HealthMonitor] Firestore health status: ${healthy ? 'HEALTHY' : 'UNHEALTHY'}`);
    
    // Optional: Show user notification
    if (!healthy) {
      console.warn('Firestore connection experiencing issues, attempting automatic recovery...');
    }
  }
);

/**
 * Hook for React components to monitor and handle Firestore assertion errors
 */
export const useFirestoreHealth = () => {
  const handleError = (error: Error) => {
    firestoreHealthMonitor.reportError(error);
  };
  
  const manualReset = async () => {
    return await emergencyFirestoreReset();
  };
  
  const getStatus = () => {
    return firestoreHealthMonitor.getStatus();
  };
  
  return {
    handleError,
    manualReset,
    getStatus
  };
};
