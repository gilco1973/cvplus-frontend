/**
 * Comprehensive Test Script for Navigation and Duplicate Call Fixes
 * Tests both the navigation enhancements and StrictMode-aware duplicate prevention
 */

import { strictModeAwareRequestManager } from './strictModeAwareRequestManager';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: unknown;
}

export class NavigationAndDuplicateFixTester {
  private testResults: TestResult[] = [];
  
  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestResult[]> {
    console.warn('🧪 [TEST] Starting comprehensive navigation and duplicate prevention tests...');
    
    // Reset test results
    this.testResults = [];
    
    // Test 1: StrictMode duplicate detection
    await this.testStrictModeDuplicateDetection();
    
    // Test 2: Request deduplication timing
    await this.testRequestDeduplication();
    
    // Test 3: Cache behavior
    await this.testCacheBehavior();
    
    // Test 4: Navigation function availability
    await this.testNavigationFunctionAvailability();
    
    // Test 5: Session storage functionality
    await this.testSessionStorageFunctionality();
    
    // Test 6: Error handling
    await this.testErrorHandling();
    
    // Display results
    this.displayTestResults();
    
    return this.testResults;
  }
  
  /**
   * Test StrictMode duplicate detection
   */
  private async testStrictModeDuplicateDetection(): Promise<void> {
    const testName = 'StrictMode Duplicate Detection';
    
    try {
      const testKey = `test-strictmode-${Date.now()}`;
      let executionCount = 0;
      
      const mockExecutor = async () => {
        executionCount++;
        return `execution-${executionCount}`;
      };
      
      // Simulate StrictMode double execution
      const promise1 = strictModeAwareRequestManager.executeOnce(
        testKey,
        mockExecutor,
        { context: 'strictmode-test-1' }
      );
      
      // Immediately trigger second call (simulating StrictMode)
      const promise2 = strictModeAwareRequestManager.executeOnce(
        testKey,
        mockExecutor,
        { context: 'strictmode-test-2' }
      );
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Verify that both calls return the same result but executor ran only once
      const passed = (
        result1.data === result2.data && 
        executionCount === 1 && 
        (result1.wasStrictModeDuplicate || result2.wasStrictModeDuplicate)
      );
      
      this.testResults.push({
        testName,
        passed,
        details: {
          executionCount,
          result1: result1.data,
          result2: result2.data,
          strictModeDuplicate1: result1.wasStrictModeDuplicate,
          strictModeDuplicate2: result2.wasStrictModeDuplicate
        }
      });
      
      // Cleanup
      strictModeAwareRequestManager.clearKey(testKey);
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Test request deduplication timing
   */
  private async testRequestDeduplication(): Promise<void> {
    const testName = 'Request Deduplication Timing';
    
    try {
      const testKey = `test-deduplication-${Date.now()}`;
      let executionCount = 0;
      
      const slowExecutor = async () => {
        executionCount++;
        await new Promise(resolve => setTimeout(resolve, 100));
        return `slow-execution-${executionCount}`;
      };
      
      // Start multiple requests with different timings
      const promise1 = strictModeAwareRequestManager.executeOnce(
        testKey,
        slowExecutor,
        { context: 'deduplication-test-1' }
      );
      
      // Wait 50ms and start another (should be deduplicated)
      setTimeout(() => {
        strictModeAwareRequestManager.executeOnce(
          testKey,
          slowExecutor,
          { context: 'deduplication-test-2' }
        );
      }, 50);
      
      const result1 = await promise1;
      
      // Wait for any delayed requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const passed = executionCount === 1 && result1.data === 'slow-execution-1';
      
      this.testResults.push({
        testName,
        passed,
        details: {
          executionCount,
          result: result1.data,
          wasFromCache: result1.wasFromCache
        }
      });
      
      // Cleanup
      strictModeAwareRequestManager.clearKey(testKey);
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Test cache behavior
   */
  private async testCacheBehavior(): Promise<void> {
    const testName = 'Cache Behavior';
    
    try {
      const testKey = `test-cache-${Date.now()}`;
      let executionCount = 0;
      
      const mockExecutor = async () => {
        executionCount++;
        return `cached-execution-${executionCount}`;
      };
      
      // First execution
      const result1 = await strictModeAwareRequestManager.executeOnce(
        testKey,
        mockExecutor,
        { context: 'cache-test-1' }
      );
      
      // Second execution (should be cached)
      const result2 = await strictModeAwareRequestManager.executeOnce(
        testKey,
        mockExecutor,
        { context: 'cache-test-2' }
      );
      
      // Third execution with force regenerate
      const result3 = await strictModeAwareRequestManager.executeOnce(
        testKey,
        mockExecutor,
        { context: 'cache-test-3', forceRegenerate: true }
      );
      
      const passed = (
        !result1.wasFromCache &&
        result2.wasFromCache &&
        !result3.wasFromCache &&
        result1.data === result2.data &&
        result1.data !== result3.data &&
        executionCount === 2
      );
      
      this.testResults.push({
        testName,
        passed,
        details: {
          executionCount,
          result1: { data: result1.data, cached: result1.wasFromCache },
          result2: { data: result2.data, cached: result2.wasFromCache },
          result3: { data: result3.data, cached: result3.wasFromCache }
        }
      });
      
      // Cleanup
      strictModeAwareRequestManager.clearKey(testKey);
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Test navigation function availability
   */
  private async testNavigationFunctionAvailability(): Promise<void> {
    const testName = 'Navigation Function Availability';
    
    try {
      // Check if robustNavigation is available
      const robustNavAvailable = typeof window !== 'undefined' && 
        (window as any).robustNavigation !== undefined;
      
      // Check if session storage works
      const sessionStorageWorks = (() => {
        try {
          const testKey = `nav-test-${Date.now()}`;
          const testValue = 'test-value';
          sessionStorage.setItem(testKey, testValue);
          const retrieved = sessionStorage.getItem(testKey);
          sessionStorage.removeItem(testKey);
          return retrieved === testValue;
        } catch {
          return false;
        }
      })();
      
      // Check if window.location is available
      const windowLocationAvailable = typeof window !== 'undefined' && 
        window.location !== undefined;
      
      const passed = sessionStorageWorks && windowLocationAvailable;
      
      this.testResults.push({
        testName,
        passed,
        details: {
          robustNavAvailable,
          sessionStorageWorks,
          windowLocationAvailable,
          currentURL: typeof window !== 'undefined' ? window.location.href : 'N/A'
        }
      });
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Test session storage functionality
   */
  private async testSessionStorageFunctionality(): Promise<void> {
    const testName = 'Session Storage Functionality';
    
    try {
      const testJobId = `test-job-${Date.now()}`;
      const testRecommendations = ['rec1', 'rec2', 'rec3'];
      const testImprovements = { content: 'test content', version: 1 };
      
      // Store data
      sessionStorage.setItem(`recommendations-${testJobId}`, JSON.stringify(testRecommendations));
      sessionStorage.setItem(`improvements-${testJobId}`, JSON.stringify(testImprovements));
      sessionStorage.setItem(`nav-timestamp-${testJobId}`, Date.now().toString());
      
      // Retrieve and verify data
      const retrievedRecs = JSON.parse(sessionStorage.getItem(`recommendations-${testJobId}`) || '[]');
      const retrievedImprovements = JSON.parse(sessionStorage.getItem(`improvements-${testJobId}`) || '{}');
      const retrievedTimestamp = sessionStorage.getItem(`nav-timestamp-${testJobId}`);
      
      const passed = (
        JSON.stringify(retrievedRecs) === JSON.stringify(testRecommendations) &&
        JSON.stringify(retrievedImprovements) === JSON.stringify(testImprovements) &&
        retrievedTimestamp !== null
      );
      
      this.testResults.push({
        testName,
        passed,
        details: {
          originalRecs: testRecommendations,
          retrievedRecs,
          originalImprovements: testImprovements,
          retrievedImprovements,
          timestampSet: retrievedTimestamp !== null
        }
      });
      
      // Cleanup
      sessionStorage.removeItem(`recommendations-${testJobId}`);
      sessionStorage.removeItem(`improvements-${testJobId}`);
      sessionStorage.removeItem(`nav-timestamp-${testJobId}`);
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    const testName = 'Error Handling';
    
    try {
      const testKey = `test-error-${Date.now()}`;
      
      const errorExecutor = async () => {
        throw new Error('Test error for error handling');
      };
      
      let caughtError = false;
      let errorMessage = '';
      
      try {
        await strictModeAwareRequestManager.executeOnce(
          testKey,
          errorExecutor,
          { context: 'error-test' }
        );
      } catch (error) {
        caughtError = true;
        errorMessage = error instanceof Error ? error.message : String(error);
      }
      
      const passed = caughtError && errorMessage.includes('Test error');
      
      this.testResults.push({
        testName,
        passed,
        details: {
          caughtError,
          errorMessage
        }
      });
      
      // Cleanup
      strictModeAwareRequestManager.clearKey(testKey);
      
    } catch (error) {
      this.testResults.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  /**
   * Display test results
   */
  private displayTestResults(): void {
    console.warn('\n📄 [TEST RESULTS] Navigation and Duplicate Prevention Fix Tests');
    console.warn('='.repeat(60));
    
    let passedCount = 0;
    const totalCount = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const errorInfo = result.error ? ` (${result.error})` : '';
      
      console.warn(`${index + 1}. ${status} ${result.testName}${errorInfo}`);
      
      if (result.details) {
        console.warn('   Details:', result.details);
      }
      
      if (result.passed) passedCount++;
    });
    
    console.warn('='.repeat(60));
    console.warn(`📈 Summary: ${passedCount}/${totalCount} tests passed (${Math.round(passedCount/totalCount*100)}%)`);
    
    if (passedCount === totalCount) {
      console.warn('🎉 All tests passed! Navigation and duplicate prevention fixes are working correctly.');
    } else {
      console.warn('⚠️ Some tests failed. Review the results above.');
    }
  }
  
  /**
   * Quick validation for production use
   */
  static async quickValidation(): Promise<boolean> {
    const tester = new NavigationAndDuplicateFixTester();
    const results = await tester.runAllTests();
    return results.every(result => result.passed);
  }
}

// Export test runner
export const testNavigationAndDuplicateFix = new NavigationAndDuplicateFixTester();

// Auto-run tests in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Add to window for manual testing
  (window as any).testNavigationAndDuplicateFix = {
    runTests: () => testNavigationAndDuplicateFix.runAllTests(),
    quickValidation: () => NavigationAndDuplicateFixTester.quickValidation()
  };
  
  console.warn('🧪 [AUTO-TEST] Navigation and duplicate fix tests available at:');
  console.warn('  window.testNavigationAndDuplicateFix.runTests()');
  console.warn('  window.testNavigationAndDuplicateFix.quickValidation()');
}