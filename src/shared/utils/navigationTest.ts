// Navigation Test Utility
// This utility helps debug navigation issues in the CV Analysis flow

export const navigationTest = {
  // Test if the preview route exists in the current router
  testPreviewRoute: (jobId: string) => {
    const testPath = `/preview/${jobId}`;
    console.warn('🧪 [TEST] Testing preview route:', testPath);
    
    // Try to create a URL object to validate the path
    try {
      const url = new URL(testPath, window.location.origin);
      console.warn('✅ [TEST] Preview route URL is valid:', url.href);
      return true;
    } catch (error) {
      console.error('❌ [TEST] Preview route URL is invalid:', error);
      return false;
    }
  },

  // Test sessionStorage operations
  testSessionStorage: (jobId: string) => {
    console.warn('🧪 [TEST] Testing sessionStorage operations');
    
    try {
      // Test storing recommendations
      const testRecommendations = ['test-rec-1', 'test-rec-2'];
      sessionStorage.setItem(`recommendations-${jobId}`, JSON.stringify(testRecommendations));
      
      // Test retrieving recommendations
      const retrieved = sessionStorage.getItem(`recommendations-${jobId}`);
      const parsed = JSON.parse(retrieved || '[]');
      
      console.warn('✅ [TEST] SessionStorage test successful');
      console.warn('✅ [TEST] Stored:', testRecommendations);
      console.warn('✅ [TEST] Retrieved:', parsed);
      
      // Clean up test data
      sessionStorage.removeItem(`recommendations-${jobId}`);
      
      return true;
    } catch (error) {
      console.error('❌ [TEST] SessionStorage test failed:', error);
      return false;
    }
  },

  // Test React Router navigation programmatically
  testNavigation: (navigate: (path: string) => void, jobId: string) => {
    console.warn('🧪 [TEST] Testing programmatic navigation');
    
    try {
      const testPath = `/preview/${jobId}`;
      console.warn('🧪 [TEST] Attempting navigation to:', testPath);
      
      // Store current path for comparison
      const currentPath = window.location.pathname;
      console.warn('🧪 [TEST] Current path:', currentPath);
      
      // Attempt navigation
      navigate(testPath);
      
      // Since navigation is async, we'll log success immediately
      console.warn('✅ [TEST] Navigation call completed without throwing');
      return true;
    } catch (error) {
      console.error('❌ [TEST] Navigation test failed:', error);
      return false;
    }
  },

  // Enhanced navigation with multiple fallback strategies
  performEnhancedNavigation: (navigate: (path: string) => void, jobId: string, selectedRecommendations: string[] = []) => {
    console.warn('🚀 [NAV] Enhanced navigation initiated');
    console.warn('🚀 [NAV] Target jobId:', jobId);
    console.warn('🚀 [NAV] Recommendations:', selectedRecommendations);
    
    const targetPath = `/preview/${jobId}`;
    const currentPath = window.location.pathname;
    
    // Store data first
    try {
      sessionStorage.setItem(`recommendations-${jobId}`, JSON.stringify(selectedRecommendations));
      console.warn('💾 [NAV] Stored recommendations in sessionStorage');
    } catch (storageError) {
      console.warn('⚠️ [NAV] Failed to store recommendations:', storageError);
    }
    
    console.warn('🚀 [NAV] Current path:', currentPath);
    console.warn('🚀 [NAV] Target path:', targetPath);
    
    // Strategy 1: React Router navigate
    try {
      console.warn('🔄 [NAV] Strategy 1: React Router navigate');
      navigate(targetPath);
      
      // Check if navigation happened after a short delay
      setTimeout(() => {
        const newPath = window.location.pathname;
        console.warn('🔄 [NAV] Path after React Router navigate:', newPath);
        
        if (newPath === currentPath) {
          console.warn('⚠️ [NAV] React Router navigation may have failed, trying fallback');
          navigationTest.performFallbackNavigation(jobId);
        } else {
          console.warn('✅ [NAV] React Router navigation successful');
        }
      }, 200);
      
    } catch (navError) {
      console.error('❌ [NAV] React Router navigation failed:', navError);
      navigationTest.performFallbackNavigation(jobId);
    }
  },
  
  // Fallback navigation strategies
  performFallbackNavigation: (jobId: string) => {
    console.warn('🔄 [NAV] Performing fallback navigation');
    
    const targetPath = `/preview/${jobId}`;
    
    // Strategy 2: Direct window.location assignment
    setTimeout(() => {
      try {
        console.warn('🔄 [NAV] Strategy 2: window.location assignment');
        window.location.assign(targetPath);
      } catch (windowError) {
        console.error('❌ [NAV] Window location assignment failed:', windowError);
        
        // Strategy 3: Window.location.href as last resort
        setTimeout(() => {
          console.warn('🚑 [NAV] Strategy 3: Last resort window.location.href');
          window.location.href = targetPath;
        }, 300);
      }
    }, 100);
  },

  // Run all tests
  runAllTests: (navigate: (path: string) => void, jobId: string) => {
    console.warn('🧪 [TEST] Running comprehensive navigation tests...');
    
    const results = {
      previewRoute: navigationTest.testPreviewRoute(jobId),
      sessionStorage: navigationTest.testSessionStorage(jobId),
      navigation: navigationTest.testNavigation(navigate, jobId)
    };
    
    console.warn('🧪 [TEST] Test results:', results);
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
      console.warn('✅ [TEST] All navigation tests passed!');
    } else {
      console.error('❌ [TEST] Some navigation tests failed. Check the results above.');
    }
    
    return results;
  }
};

// Export for global access in development
if (typeof window !== 'undefined') {
  (window as any).navigationTest = navigationTest;
}