/**
 * Test script to verify the duplicate request blocking system
 * This can be used in browser console to test the blocking effectiveness
 */

import { CVAnalyzer } from '../services/cv/CVAnalyzer';
import { recommendationsDebugger } from './debugRecommendations';

export async function testDuplicateBlocking(jobId = 'test-job-123') {
  console.warn('🧪 Starting duplicate request blocking test...');
  console.warn('📝 This test will make multiple simultaneous calls to getRecommendations');
  
  // Clear any existing tracking
  CVAnalyzer.clearRequestTracking();
  recommendationsDebugger.clearHistory();
  
  // Create multiple simultaneous requests
  const promises = [];
  const numRequests = 5;
  
  console.warn(`🚀 Making ${numRequests} simultaneous requests...`);
  
  for (let i = 0; i < numRequests; i++) {
    const promise = CVAnalyzer.getRecommendations(jobId, 'Software Engineer', ['JavaScript', 'React'])
      .then(result => ({
        requestIndex: i,
        success: true,
        result: result ? 'Got data' : 'No data',
        timestamp: Date.now()
      }))
      .catch(error => ({
        requestIndex: i,
        success: false,
        error: error.message,
        timestamp: Date.now()
      }));
    
    promises.push(promise);
  }
  
  // Wait for all requests to complete
  console.warn('⏳ Waiting for all requests to complete...');
  const results = await Promise.all(promises);
  
  // Get statistics
  const stats = recommendationsDebugger.getStats(jobId);
  const debugInfo = CVAnalyzer.getRequestDebugInfo();
  
  console.warn('📊 Test Results:');
  console.warn('================');
  console.warn(`Total calls made: ${stats.totalCalls}`);
  console.warn(`Actual Firebase requests: ${stats.actualCalls}`);
  console.warn(`Blocked requests: ${stats.blockedCalls}`);
  console.warn(`Blocking effectiveness: ${stats.blockingEffectiveness.toFixed(1)}%`);
  console.warn(`Expected result: Only 1 actual request, ${numRequests - 1} blocked`);
  
  console.warn('\n🔍 Detailed Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    if (result.success && 'result' in result) {
      console.warn(`${status} Request ${index + 1}: ${result.result}`);
    } else if (!result.success && 'error' in result) {
      console.warn(`${status} Request ${index + 1}: ${result.error}`);
    }
  });
  
  console.warn('\n🛠️ Debug Info:');
  console.warn('Active requests:', debugInfo.activeRequests);
  console.warn('Cached promises:', debugInfo.cachedPromises);
  console.warn('Request counts:', debugInfo.requestCounts);
  
  console.warn('\n📈 Statistics:');
  console.warn(stats);
  
  // Verify the blocking worked
  const success = stats.actualCalls === 1 && stats.blockedCalls === numRequests - 1;
  
  if (success) {
    console.warn('\n🎉 SUCCESS! Duplicate request blocking is working correctly!');
    console.warn(`   ✅ Only ${stats.actualCalls} actual Firebase request made`);
    console.warn(`   ✅ ${stats.blockedCalls} duplicate requests were blocked`);
  } else {
    console.warn('\n❌ FAILURE! Duplicate request blocking is not working as expected!');
    console.warn(`   Expected: 1 actual request, ${numRequests - 1} blocked`);
    console.warn(`   Got: ${stats.actualCalls} actual requests, ${stats.blockedCalls} blocked`);
  }
  
  return {
    success,
    stats,
    results,
    debugInfo
  };
}

// Make test function available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testDuplicateBlocking = testDuplicateBlocking;
  
  // Console messages disabled to reduce noise
  // Uncomment to show test function availability
  /*
  console.warn('🧪 Test function available: window.testDuplicateBlocking()');
  console.warn('📝 Usage: testDuplicateBlocking("your-job-id")');
  */
}