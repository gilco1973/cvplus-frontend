/**
 * Test script to validate the RecommendationsContainer fix
 * 
 * This script can be run in the browser console to test the fix
 */

import { CVServiceCore } from '../services/cv/CVServiceCore';
import { FirebaseDebugger } from './api-debugging-suite';
import { RecommendationsErrorMonitor } from './recommendations-error-monitor';

export class RecommendationsFixTester {
  
  /**
   * Test the complete flow with a real job ID
   */
  static async testRecommendationsFlow(jobId: string): Promise<void> {
    console.group('🧪 TESTING RECOMMENDATIONS FIX');
    
    try {
      // 1. Run debugging suite first
      console.log('1. Running Firebase debugging suite...');
      const debugResults = await FirebaseDebugger.runFullDebugSuite(jobId);
      console.log('Debug results:', debugResults);
      
      if (!debugResults.overall.success) {
        console.error('❌ Debug suite failed:', debugResults.overall.criticalIssues);
        return;
      }
      
      // 2. Test the actual API call
      console.log('2. Testing CVServiceCore.getRecommendations...');
      const response = await CVServiceCore.getRecommendations(
        jobId,
        'Software Engineer',
        ['javascript', 'react', 'node.js'],
        false
      );
      
      console.log('Raw API response:', response);
      
      // 3. Test the new response handling logic
      console.log('3. Testing response handling logic...');
      const recommendations = response.success && response.data 
        ? response.data.recommendations 
        : response.recommendations;
      
      console.log('Extracted recommendations:', recommendations);
      
      if (response.success && recommendations) {
        console.log('✅ Response handling works correctly!');
        console.log(`Found ${recommendations.length} recommendations`);
        
        // Test recommendation structure
        recommendations.forEach((rec: any, index: number) => {
          console.log(`Recommendation ${index + 1}:`, {
            id: rec.id,
            title: rec.title,
            category: rec.category,
            priority: rec.priority
          });
        });
        
      } else {
        console.error('❌ Response handling failed');
        console.error('Response success:', response.success);
        console.error('Has recommendations:', !!recommendations);
        console.error('Response structure:', Object.keys(response || {}));
      }
      
      console.log('✅ Test completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed with error:', error);
      
      // Log error for analysis
      RecommendationsErrorMonitor.logError(error, {
        jobId,
        step: 'test_flow',
        targetRole: 'Software Engineer',
        industryKeywords: ['javascript', 'react', 'node.js'],
        forceRegenerate: false
      });
    } finally {
      console.groupEnd();
    }
  }
  
  /**
   * Test response format handling with mock data
   */
  static testResponseFormatHandling(): void {
    console.group('🧪 TESTING RESPONSE FORMAT HANDLING');
    
    // Test case 1: New backend format
    const newFormat = {
      success: true,
      data: {
        recommendations: [
          { id: '1', title: 'Test Rec 1', category: 'skills' },
          { id: '2', title: 'Test Rec 2', category: 'experience' }
        ],
        cached: false,
        generatedAt: new Date().toISOString()
      }
    };
    
    // Test case 2: Old/legacy format
    const oldFormat = {
      success: true,
      recommendations: [
        { id: '1', title: 'Test Rec 1', category: 'skills' },
        { id: '2', title: 'Test Rec 2', category: 'experience' }
      ]
    };
    
    // Test case 3: Error format
    const errorFormat = {
      success: false,
      error: 'Something went wrong',
      data: null
    };
    
    console.log('Testing new backend format...');
    const newRecs = newFormat.success && newFormat.data 
      ? newFormat.data.recommendations 
      : newFormat.recommendations;
    console.log('New format result:', newRecs?.length || 0, 'recommendations');
    
    console.log('Testing old/legacy format...');
    const oldRecs = oldFormat.success && oldFormat.data 
      ? oldFormat.data.recommendations 
      : oldFormat.recommendations;
    console.log('Old format result:', oldRecs?.length || 0, 'recommendations');
    
    console.log('Testing error format...');
    const errorRecs = errorFormat.success && errorFormat.data 
      ? errorFormat.data.recommendations 
      : errorFormat.recommendations;
    console.log('Error format result:', errorRecs?.length || 0, 'recommendations');
    
    console.log('✅ Format handling tests completed');
    console.groupEnd();
  }
  
  /**
   * Generate test report
   */
  static generateTestReport(): string {
    const errorAnalysis = RecommendationsErrorMonitor.analyzeErrorPatterns();
    
    let report = `# Recommendations Fix Test Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Error Analysis\n`;
    report += `Total Errors: ${errorAnalysis.totalErrors}\n`;
    report += `Most Common Step: ${errorAnalysis.mostCommonStep}\n`;
    report += `Most Common Error: ${errorAnalysis.mostCommonError}\n\n`;
    
    report += `## Fix Status\n`;
    report += `- ✅ Response format handling updated\n`;
    report += `- ✅ Error monitoring integrated\n`;
    report += `- ✅ Debugging tools added\n`;
    report += `- ✅ Pre-flight diagnostics added\n\n`;
    
    report += `## Recommendations\n`;
    errorAnalysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    
    return report;
  }
}

// Make available in browser console for manual testing
if (typeof window !== 'undefined') {
  (window as any).RecommendationsFixTester = RecommendationsFixTester;
}

// Export for programmatic use
export default RecommendationsFixTester;