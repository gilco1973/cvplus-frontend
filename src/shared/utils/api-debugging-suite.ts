/**
 * Comprehensive Firebase Debugging Suite for RecommendationsContainer API Failure
 * 
 * This suite systematically tests all potential failure points in the getRecommendations flow
 */

import { auth, functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';

interface DebuggingResults {
  timestamp: string;
  environment: string;
  authentication: {
    isAuthenticated: boolean;
    userId?: string;
    tokenValid?: boolean;
    error?: string;
  };
  firebase: {
    functionsInitialized: boolean;
    functionsRegion: string;
    error?: string;
  };
  callableFunction: {
    available: boolean;
    testCall?: any;
    error?: string;
  };
  httpFallback: {
    available: boolean;
    testCall?: any;
    error?: string;
  };
  backend: {
    functionExists: boolean;
    responseFormat?: any;
    error?: string;
  };
  overall: {
    success: boolean;
    recommendation: string;
    criticalIssues: string[];
  };
}

export class FirebaseDebugger {
  
  /**
   * Run comprehensive debugging suite
   */
  static async runFullDebugSuite(jobId: string): Promise<DebuggingResults> {
    const results: DebuggingResults = {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.DEV ? 'development' : 'production',
      authentication: { isAuthenticated: false },
      firebase: { functionsInitialized: false, functionsRegion: '' },
      callableFunction: { available: false },
      httpFallback: { available: false },
      backend: { functionExists: false },
      overall: { success: false, recommendation: '', criticalIssues: [] }
    };

    console.group('🔍 Firebase Debugging Suite Started');
    
    // 1. Test Authentication
    await this.testAuthentication(results);
    
    // 2. Test Firebase Functions Setup  
    await this.testFirebaseFunctions(results);
    
    // 3. Test Callable Function
    if (results.authentication.isAuthenticated) {
      await this.testCallableFunction(results, jobId);
    }
    
    // 4. Test HTTP Fallback
    if (results.authentication.isAuthenticated) {
      await this.testHttpFallback(results, jobId);
    }
    
    // 5. Test Backend Function directly
    await this.testBackendFunction(results);
    
    // 6. Generate recommendations
    this.generateRecommendations(results);
    
    console.groupEnd();
    
    return results;
  }

  /**
   * Test user authentication status
   */
  private static async testAuthentication(results: DebuggingResults): Promise<void> {
    console.group('🔐 Testing Authentication');
    
    try {
      const user = auth.currentUser;
      
      if (!user) {
        results.authentication = {
          isAuthenticated: false,
          error: 'No current user - user needs to sign in'
        };
        console.error('❌ No authenticated user found');
        return;
      }

      // Test token validity
      try {
        const token = await user.getIdToken();
        results.authentication = {
          isAuthenticated: true,
          userId: user.uid,
          tokenValid: true
        };
        console.log('✅ User authenticated successfully', {
          userId: user.uid,
          email: user.email
        });
      } catch (tokenError) {
        results.authentication = {
          isAuthenticated: true,
          userId: user.uid,
          tokenValid: false,
          error: `Token error: ${tokenError instanceof Error ? tokenError.message : 'Unknown'}`
        };
        console.error('❌ Token validation failed:', tokenError);
      }

    } catch (error) {
      results.authentication = {
        isAuthenticated: false,
        error: `Auth error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      console.error('❌ Authentication test failed:', error);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test Firebase Functions initialization
   */
  private static async testFirebaseFunctions(results: DebuggingResults): Promise<void> {
    console.group('🔥 Testing Firebase Functions Setup');
    
    try {
      // Check if functions is properly initialized
      if (!functions) {
        results.firebase = {
          functionsInitialized: false,
          functionsRegion: '',
          error: 'Firebase Functions not initialized'
        };
        console.error('❌ Firebase Functions not initialized');
        return;
      }

      // Get functions region/config
      const functionsConfig = functions._delegate || functions;
      const region = functionsConfig._region || 'unknown';
      
      results.firebase = {
        functionsInitialized: true,
        functionsRegion: region
      };
      
      console.log('✅ Firebase Functions initialized', {
        region,
        app: functions.app.name
      });

    } catch (error) {
      results.firebase = {
        functionsInitialized: false,
        functionsRegion: '',
        error: `Functions setup error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      console.error('❌ Firebase Functions test failed:', error);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test callable function approach
   */
  private static async testCallableFunction(results: DebuggingResults, jobId: string): Promise<void> {
    console.group('📞 Testing Callable Function');
    
    try {
      const getRecommendationsFunction = httpsCallable(functions, 'getRecommendations');
      
      console.log('🧪 Testing with minimal parameters...');
      const testResponse = await getRecommendationsFunction({
        jobId,
        targetRole: 'Software Engineer',
        industryKeywords: ['tech', 'software'],
        forceRegenerate: false
      });
      
      results.callableFunction = {
        available: true,
        testCall: {
          success: true,
          dataStructure: this.analyzeResponseStructure(testResponse.data),
          hasRecommendations: testResponse.data?.success && testResponse.data?.recommendations?.length > 0
        }
      };
      
      console.log('✅ Callable function works', testResponse.data);
      
    } catch (error) {
      results.callableFunction = {
        available: false,
        error: `Callable function error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      console.error('❌ Callable function failed:', error);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test HTTP fallback approach
   */
  private static async testHttpFallback(results: DebuggingResults, jobId: string): Promise<void> {
    console.group('🌐 Testing HTTP Fallback');
    
    try {
      const user = auth.currentUser;
      if (!user) {
        results.httpFallback = {
          available: false,
          error: 'No authenticated user for HTTP test'
        };
        return;
      }

      const token = await user.getIdToken();
      const baseUrl = import.meta.env.DEV 
        ? 'http://localhost:5001/getmycv-ai/us-central1'
        : 'https://us-central1-getmycv-ai.cloudfunctions.net';
        
      console.log('🧪 Testing HTTP endpoint:', `${baseUrl}/getRecommendations`);
      
      const response = await fetch(`${baseUrl}/getRecommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            jobId,
            targetRole: 'Software Engineer',
            industryKeywords: ['tech', 'software'],
            forceRegenerate: false
          }
        })
      });
      
      if (!response.ok) {
        results.httpFallback = {
          available: false,
          error: `HTTP error: ${response.status} - ${response.statusText}`
        };
        console.error('❌ HTTP response not OK:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      results.httpFallback = {
        available: true,
        testCall: {
          success: true,
          status: response.status,
          dataStructure: this.analyzeResponseStructure(data),
          hasRecommendations: data?.success && data?.recommendations?.length > 0
        }
      };
      
      console.log('✅ HTTP fallback works', data);
      
    } catch (error) {
      results.httpFallback = {
        available: false,
        error: `HTTP fallback error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      console.error('❌ HTTP fallback failed:', error);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test backend function availability
   */
  private static async testBackendFunction(results: DebuggingResults): Promise<void> {
    console.group('🔧 Testing Backend Function');
    
    try {
      const baseUrl = import.meta.env.DEV 
        ? 'http://localhost:5001/getmycv-ai/us-central1'
        : 'https://us-central1-getmycv-ai.cloudfunctions.net';
      
      // Test if function endpoint exists (without auth)
      const response = await fetch(`${baseUrl}/getRecommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Empty body to test function existence
      });
      
      results.backend = {
        functionExists: response.status !== 404,
        responseFormat: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
      
      if (response.status === 404) {
        results.backend.error = 'Function endpoint not found (404)';
        console.error('❌ Backend function not found');
      } else {
        console.log('✅ Backend function endpoint exists', {
          status: response.status,
          available: response.status !== 404
        });
      }
      
    } catch (error) {
      results.backend = {
        functionExists: false,
        error: `Backend test error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
      console.error('❌ Backend function test failed:', error);
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Analyze response structure for debugging
   */
  private static analyzeResponseStructure(data: any): any {
    return {
      type: typeof data,
      isObject: typeof data === 'object' && data !== null,
      hasSuccess: 'success' in (data || {}),
      hasRecommendations: 'recommendations' in (data || {}),
      hasError: 'error' in (data || {}),
      hasData: 'data' in (data || {}),
      keys: typeof data === 'object' && data !== null ? Object.keys(data) : [],
      recommendationsCount: data?.recommendations?.length || 0
    };
  }

  /**
   * Generate debugging recommendations based on results
   */
  private static generateRecommendations(results: DebuggingResults): void {
    const issues: string[] = [];
    
    // Authentication issues
    if (!results.authentication.isAuthenticated) {
      issues.push('CRITICAL: User not authenticated');
      results.overall.recommendation = 'Ensure user is signed in before calling getRecommendations';
    }
    
    if (results.authentication.isAuthenticated && !results.authentication.tokenValid) {
      issues.push('CRITICAL: Invalid authentication token');
      results.overall.recommendation = 'Token refresh required - implement token refresh logic';
    }
    
    // Firebase Functions issues
    if (!results.firebase.functionsInitialized) {
      issues.push('CRITICAL: Firebase Functions not properly initialized');
      results.overall.recommendation = 'Check Firebase configuration in lib/firebase.ts';
    }
    
    // Callable function issues
    if (results.authentication.isAuthenticated && !results.callableFunction.available) {
      issues.push('HIGH: Callable function not working');
    }
    
    // HTTP fallback issues  
    if (results.authentication.isAuthenticated && !results.httpFallback.available) {
      issues.push('HIGH: HTTP fallback not working');
    }
    
    // Backend issues
    if (!results.backend.functionExists) {
      issues.push('CRITICAL: Backend function not deployed or not found');
      results.overall.recommendation = 'Deploy Firebase functions or check function name';
    }
    
    // Success case
    if (results.callableFunction.available || results.httpFallback.available) {
      results.overall.success = true;
      results.overall.recommendation = 'API calls working - issue may be with response handling or data formatting';
    }
    
    results.overall.criticalIssues = issues;
    
    console.group('📋 Debugging Summary');
    console.log('Overall Success:', results.overall.success);
    console.log('Critical Issues:', issues);
    console.log('Recommendation:', results.overall.recommendation);
    console.groupEnd();
  }

  /**
   * Quick debug test - streamlined version for immediate use
   */
  static async quickDebugTest(jobId: string): Promise<{ success: boolean; error?: string; details: any }> {
    try {
      console.log('🚀 Quick Debug Test Started');
      
      // 1. Check auth
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          error: 'User not authenticated',
          details: { step: 'authentication', issue: 'no_user' }
        };
      }
      
      // 2. Test callable function immediately
      const getRecommendationsFunction = httpsCallable(functions, 'getRecommendations');
      const result = await getRecommendationsFunction({
        jobId,
        targetRole: 'Test Role',
        industryKeywords: ['test'],
        forceRegenerate: false
      });
      
      return {
        success: true,
        details: {
          step: 'callable_function',
          response: result.data,
          hasRecommendations: result.data?.recommendations?.length > 0
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          step: 'callable_function',
          error: error instanceof Error ? error.stack : error
        }
      };
    }
  }
}

// Export singleton instance for easy use
export const firebaseDebugger = new FirebaseDebugger();

// Utility function to add debugging to RecommendationsContainer
export const debugRecommendationsCall = async (jobId: string) => {
  console.group('🔍 DEBUG: RecommendationsContainer API Call');
  
  const debugResult = await FirebaseDebugger.quickDebugTest(jobId);
  
  if (!debugResult.success) {
    console.error('❌ Debug test failed:', debugResult.error);
    console.error('Details:', debugResult.details);
  } else {
    console.log('✅ Debug test passed:', debugResult.details);
  }
  
  console.groupEnd();
  return debugResult;
};