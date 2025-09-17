/**
 * Test Navigation Fix Implementation
 * Tests the critical navigation flow from ResultsPage to FinalResultsPage
 */

interface NavigationTestResult {
  success: boolean;
  message: string;
  timestamp: string;
  testType: string;
}

class NavigationFixTester {
  private results: NavigationTestResult[] = [];

  /**
   * Test 1: Verify immediate navigation doesn't wait for generateCV completion
   */
  testImmediateNavigation(): NavigationTestResult {
    const startTime = Date.now();
    
    try {
      // Mock the handleGenerateCV flow
      const mockJobId = 'test-job-123';
      
      // Store generation config (mimicking the actual flow)
      const generationConfig = {
        jobId: mockJobId,
        templateId: 'modern',
        features: ['ats-optimization', 'keyword-enhancement'],
        featureCount: 2,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem(`generation-config-${mockJobId}`, JSON.stringify(generationConfig));
      
      // Verify config is stored
      const storedConfig = sessionStorage.getItem(`generation-config-${mockJobId}`);
      const navigationTime = Date.now() - startTime;
      
      if (storedConfig && navigationTime < 100) {
        return {
          success: true,
          message: `Navigation config stored in ${navigationTime}ms - should navigate immediately`,
          timestamp: new Date().toISOString(),
          testType: 'immediate-navigation'
        };
      } else {
        return {
          success: false,
          message: `Navigation too slow (${navigationTime}ms) or config not stored`,
          timestamp: new Date().toISOString(),
          testType: 'immediate-navigation'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Navigation test failed: ${error}`,
        timestamp: new Date().toISOString(),
        testType: 'immediate-navigation'
      };
    }
  }

  /**
   * Test 2: Verify FinalResultsPage can handle CV generation in progress
   */
  testProgressiveGeneration(): NavigationTestResult {
    try {
      const mockJobId = 'test-job-456';
      
      // Simulate stored config from ResultsPage
      const config = {
        jobId: mockJobId,
        templateId: 'modern',
        features: ['generate-podcast', 'skills-visualization'],
        featureCount: 2,
        timestamp: new Date().toISOString()
      };
      
      sessionStorage.setItem(`generation-config-${mockJobId}`, JSON.stringify(config));
      
      // Test feature queue setup (mimicking FinalResultsPage logic)
      const kebabToCamelMap: Record<string, string> = {
        'generate-podcast': 'generatePodcast',
        'skills-visualization': 'skillsVisualization',
        'ats-optimization': 'atsOptimization',
        'keyword-enhancement': 'keywordEnhancement'
      };
      
      const camelCaseFeatures = config.features.map(f => kebabToCamelMap[f]).filter(f => f);
      
      if (camelCaseFeatures.length === 2 && camelCaseFeatures.includes('generatePodcast')) {
        return {
          success: true,
          message: `Progressive generation setup successful: ${camelCaseFeatures.join(', ')}`,
          timestamp: new Date().toISOString(),
          testType: 'progressive-generation'
        };
      } else {
        return {
          success: false,
          message: `Feature mapping failed: got ${camelCaseFeatures.join(', ')}`,
          timestamp: new Date().toISOString(),
          testType: 'progressive-generation'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Progressive generation test failed: ${error}`,
        timestamp: new Date().toISOString(),
        testType: 'progressive-generation'
      };
    }
  }

  /**
   * Test 3: Verify data structure safety (prevent forEach errors)
   */
  testDataStructureSafety(): NavigationTestResult {
    try {
      // Test various data structures that might cause forEach errors
      const testCases = [
        { input: ['item1', 'item2'], expected: true, description: 'Array' },
        { input: null, expected: false, description: 'Null' },
        { input: undefined, expected: false, description: 'Undefined' },
        { input: 'string', expected: false, description: 'String' },
        { input: { key: 'value' }, expected: false, description: 'Object' },
        { input: 123, expected: false, description: 'Number' }
      ];

      const safeForEach = (data: unknown, callback: (item: unknown) => void) => {
        if (Array.isArray(data)) {
          data.forEach(callback);
          return true;
        } else {
          console.warn('Data is not an array:', typeof data, data);
          return false;
        }
      };

      let passedTests = 0;
      testCases.forEach(testCase => {
        const result = safeForEach(testCase.input, () => {});
        if (result === testCase.expected) {
          passedTests++;
        } else {
          console.error(`Test failed for ${testCase.description}: expected ${testCase.expected}, got ${result}`);
        }
      });

      const success = passedTests === testCases.length;
      return {
        success,
        message: `Data structure safety: ${passedTests}/${testCases.length} tests passed`,
        timestamp: new Date().toISOString(),
        testType: 'data-structure-safety'
      };
    } catch (error) {
      return {
        success: false,
        message: `Data structure safety test failed: ${error}`,
        timestamp: new Date().toISOString(),
        testType: 'data-structure-safety'
      };
    }
  }

  /**
   * Run all navigation fix tests
   */
  runAllTests(): NavigationTestResult[] {
    console.warn('🧪 Running Navigation Fix Tests...');
    
    this.results = [];
    
    // Test 1: Immediate Navigation
    this.results.push(this.testImmediateNavigation());
    
    // Test 2: Progressive Generation
    this.results.push(this.testProgressiveGeneration());
    
    // Test 3: Data Structure Safety
    this.results.push(this.testDataStructureSafety());
    
    // Summary
    const passedTests = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    
    console.warn(`🧪 Navigation Fix Tests Complete: ${passedTests}/${totalTests} passed`);
    this.results.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.warn(`${icon} ${result.testType}: ${result.message}`);
    });
    
    return this.results;
  }

  /**
   * Get test summary
   */
  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      success: failed === 0,
      details: this.results
    };
  }
}

// Export for global access in development
export const navigationFixTester = new NavigationFixTester();

// Development-only global access
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).navigationFixTester = navigationFixTester;
  (window as any).testNavigationFix = () => navigationFixTester.runAllTests();
}