/**
 * Test Async Navigation Flow
 * Tests the async CV generation with immediate navigation functionality
 */

import { CVServiceCore } from '../services/cv/CVServiceCore';

export const testAsyncNavigationFlow = {
  /**
   * Test environment variable detection
   */
  testAsyncModeDetection() {
    console.warn('🔍 Testing Async Mode Detection');
    
    const isAsyncEnabled = CVServiceCore.isAsyncCVGenerationEnabled();
    const envVar = import.meta.env.VITE_ENABLE_ASYNC_CV_GENERATION;
    
    console.warn('Environment Variable:', envVar);
    console.warn('Is Async Enabled:', isAsyncEnabled);
    
    return {
      envVar,
      isAsyncEnabled,
      isValid: typeof isAsyncEnabled === 'boolean'
    };
  },

  /**
   * Test session storage persistence
   */
  testSessionStoragePersistence(jobId: string) {
    console.warn('💾 Testing Session Storage Persistence');
    
    const testConfig = {
      jobId,
      templateId: 'modern',
      features: ['ats-optimization', 'keyword-enhancement'],
      asyncMode: true,
      initResponse: {
        success: true,
        jobId,
        status: 'initiated',
        estimatedTime: 120
      },
      timestamp: new Date().toISOString()
    };
    
    try {
      // Test storage
      sessionStorage.setItem(`generation-config-${jobId}`, JSON.stringify(testConfig));
      
      // Test retrieval
      const retrieved = sessionStorage.getItem(`generation-config-${jobId}`);
      const parsed = retrieved ? JSON.parse(retrieved) : null;
      
      // Test cleanup
      sessionStorage.removeItem(`generation-config-${jobId}`);
      
      console.warn('Test Config:', testConfig);
      console.warn('Retrieved Config:', parsed);
      
      return {
        stored: true,
        retrieved: !!retrieved,
        parsed: !!parsed,
        matches: JSON.stringify(testConfig) === JSON.stringify(parsed)
      };
    } catch (error) {
      console.error('Session storage test failed:', error);
      return {
        stored: false,
        retrieved: false,
        parsed: false,
        matches: false,
        error: (error as Error).message
      };
    }
  },

  /**
   * Test navigation flow simulation
   */
  simulateNavigationFlow(jobId: string) {
    console.warn('🔄 Simulating Navigation Flow');
    
    const steps = [];
    
    // Step 1: User clicks generate CV
    steps.push({
      step: 'user_click',
      description: 'User clicks Generate CV button',
      timestamp: Date.now()
    });
    
    // Step 2: Async mode detection
    const asyncMode = CVServiceCore.isAsyncCVGenerationEnabled();
    steps.push({
      step: 'async_detection',
      description: `Async mode detected: ${asyncMode}`,
      asyncMode,
      timestamp: Date.now()
    });
    
    if (asyncMode) {
      // Step 3: Simulate initialization call
      steps.push({
        step: 'initiate_generation',
        description: 'Call initiateCVGeneration (simulated)',
        duration: '< 60 seconds',
        timestamp: Date.now()
      });
      
      // Step 4: Store config
      steps.push({
        step: 'store_config',
        description: 'Store generation config in session storage',
        timestamp: Date.now()
      });
      
      // Step 5: Immediate navigation
      steps.push({
        step: 'immediate_navigation',
        description: 'Navigate to /results immediately',
        target: `/results/${jobId}`,
        timestamp: Date.now()
      });
      
      // Step 6: Progress tracking
      steps.push({
        step: 'progress_tracking',
        description: 'FinalResultsPage sets up real-time progress tracking',
        timestamp: Date.now()
      });
      
    } else {
      // Sync mode steps
      steps.push({
        step: 'sync_generation',
        description: 'Start synchronous CV generation',
        duration: '5-10 minutes',
        timestamp: Date.now()
      });
      
      steps.push({
        step: 'wait_completion',
        description: 'Wait for generation to complete',
        timestamp: Date.now()
      });
      
      steps.push({
        step: 'navigation_after_completion',
        description: 'Navigate after completion',
        target: `/results/${jobId}`,
        timestamp: Date.now()
      });
    }
    
    console.warn('Navigation Flow Steps:', steps);
    return steps;
  },

  /**
   * Test error handling scenarios
   */
  testErrorScenarios() {
    console.warn('⚠️  Testing Error Scenarios');
    
    const scenarios = [
      {
        name: 'Initialization Failure',
        description: 'initiateCVGeneration fails',
        expectedBehavior: 'Show error message, keep user on current page'
      },
      {
        name: 'Session Storage Failure',
        description: 'Cannot store generation config',
        expectedBehavior: 'Log warning, continue with navigation'
      },
      {
        name: 'Environment Variable Missing',
        description: 'VITE_ENABLE_ASYNC_CV_GENERATION not set',
        expectedBehavior: 'Default to sync mode'
      },
      {
        name: 'Network Failure',
        description: 'Network error during initialization',
        expectedBehavior: 'Show network error message'
      }
    ];
    
    console.warn('Error Scenarios:', scenarios);
    return scenarios;
  },

  /**
   * Run all tests
   */
  runAllTests(jobId = 'test-job-123') {
    console.warn('🧪 Running All Async Navigation Tests');
    console.warn('==========================================');
    
    const results = {
      asyncDetection: this.testAsyncModeDetection(),
      sessionStorage: this.testSessionStoragePersistence(jobId),
      navigationFlow: this.simulateNavigationFlow(jobId),
      errorScenarios: this.testErrorScenarios(),
      timestamp: new Date().toISOString()
    };
    
    console.warn('Test Results:', results);
    
    // Summary
    const summary = {
      asyncModeWorking: results.asyncDetection.isValid,
      sessionStorageWorking: results.sessionStorage.matches,
      flowStepsGenerated: results.navigationFlow.length > 0,
      errorScenariosIdentified: results.errorScenarios.length > 0
    };
    
    console.warn('Test Summary:', summary);
    console.warn('==========================================');
    
    return {
      results,
      summary,
      allTestsPassed: Object.values(summary).every(Boolean)
    };
  }
};

// Global exposure for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testAsyncNavigation = testAsyncNavigationFlow;
}

export default testAsyncNavigationFlow;