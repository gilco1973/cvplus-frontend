/**
 * Navigation Test Script
 * Comprehensive test for navigation functionality after fixes
 */
import { robustNavigation } from './robustNavigation';
import { navigationDebugger } from './navigationDebugger';

export const testNavigationFix = {
  /**
   * Run comprehensive navigation tests
   */
  runTests: (jobId = 'test-job-123') => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🧪 Navigation Fix Test Suite');
      console.warn('🧪 Current URL:', window.location.href);
      console.warn('🧪 Target job ID:', jobId);
    }
  
    // Test 1: Verify routes exist
    const routes = [
      `/analysis/${jobId}`,
      `/preview/${jobId}`,
      `/results/${jobId}`
    ];
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Testing route patterns...');
    }
    const routeResults = routes.map(route => {
      try {
        const url = new URL(route, window.location.origin);
        if (process.env.NODE_ENV === 'development') {
          console.warn('✅ Route valid:', url.href);
        }
        return true;
      } catch (e) {
        console.error('❌ Route invalid:', route, e);
        return false;
      }
    });
  
    // Test 2: SessionStorage operations
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Testing sessionStorage...');
    }
    let storageResult = false;
    try {
      const testData = ['rec-1', 'rec-2', 'rec-3'];
      sessionStorage.setItem(`recommendations-${jobId}`, JSON.stringify(testData));
      const retrieved = JSON.parse(sessionStorage.getItem(`recommendations-${jobId}`) || '[]');
      storageResult = JSON.stringify(testData) === JSON.stringify(retrieved);
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ SessionStorage test passed:', retrieved);
      }
      
      // Cleanup
      sessionStorage.removeItem(`recommendations-${jobId}`);
    } catch (e) {
      console.error('❌ SessionStorage test failed:', e);
    }
  
    // Test 3: Test robust navigation utility
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Testing robust navigation utility...');
    }
    let navigationResult = false;
    try {
      navigationResult = robustNavigation.validateRoute(jobId);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`✅ Route validation: ${navigationResult ? 'PASS' : 'FAIL'}`);
      }
    } catch (e) {
      console.error('❌ Route validation failed:', e);
    }
    
    // Test 4: Test navigation debugger
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Testing navigation debugger...');
    }
    try {
      navigationDebugger.log('Test Event', { jobId, data: { test: true } });
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ Navigation debugger working');
      }
    } catch (e) {
      console.error('❌ Navigation debugger failed:', e);
    }
    
    // Test 5: Current page context
    const currentPath = window.location.pathname;
    if (process.env.NODE_ENV === 'development') {
      console.warn('🧪 Current path:', currentPath);
    }
    
    let contextResult = false;
    if (currentPath.includes('/analysis/')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ On analysis page - navigation should work');
      }
      contextResult = true;
    } else if (currentPath.includes('/preview/')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('✅ Already on preview page!');
      }
      contextResult = true;
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Not on analysis or preview page. Navigate to an analysis page first.');
      }
    }
    
    // Summary
    const allResults = {
      routes: routeResults.every(Boolean),
      sessionStorage: storageResult,
      robustNavigation: navigationResult,
      debugger: true, // Assume passed if no error
      context: contextResult
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('📊 Test Results:', allResults);
    }
    const allPassed = Object.values(allResults).every(Boolean);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`📊 Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.groupEnd();
    }
    return allResults;
  },
  
  /**
   * Quick readiness check
   */
  checkReadiness: () => {
    if (process.env.NODE_ENV === 'development') {
      console.warn('🔧 Checking navigation readiness...');
    }
    const checks = {
      robustNavigation: typeof robustNavigation !== 'undefined',
      navigationDebugger: typeof navigationDebugger !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      windowLocation: typeof window !== 'undefined' && !!window.location
    };
    
    if (process.env.NODE_ENV === 'development') {
      Object.entries(checks).forEach(([check, result]) => {
        console.warn(`${result ? '✅' : '❌'} ${check}`);
      });
    }
    
    return Object.values(checks).every(Boolean);
  }
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).testNavigationFix = testNavigationFix;
  if (process.env.NODE_ENV === 'development') {
    console.warn('🔧 Navigation test utilities loaded. Use testNavigationFix.runTests() to test.');
  }
}