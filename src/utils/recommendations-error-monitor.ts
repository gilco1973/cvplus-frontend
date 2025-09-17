/**
 * Comprehensive Error Monitoring for RecommendationsContainer
 * 
 * This utility provides detailed error tracking and analysis for the getRecommendations API calls
 */

interface ErrorLog {
  timestamp: string;
  jobId: string;
  userId?: string;
  error: any;
  step: string;
  response?: any;
  stackTrace?: string;
  environment: string;
  apiParameters: {
    targetRole?: string;
    industryKeywords?: string[];
    forceRegenerate?: boolean;
  };
}

class RecommendationsErrorMonitor {
  private static errors: ErrorLog[] = [];
  private static MAX_ERRORS = 100; // Keep last 100 errors

  /**
   * Log an error with comprehensive context
   */
  static logError(error: any, context: {
    jobId: string;
    step: string;
    targetRole?: string;
    industryKeywords?: string[];
    forceRegenerate?: boolean;
    response?: any;
  }) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      jobId: context.jobId,
      error: {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        code: error?.code || 'unknown'
      },
      step: context.step,
      response: context.response,
      stackTrace: error instanceof Error ? error.stack : undefined,
      environment: import.meta.env.DEV ? 'development' : 'production',
      apiParameters: {
        targetRole: context.targetRole,
        industryKeywords: context.industryKeywords,
        forceRegenerate: context.forceRegenerate
      }
    };

    // Add to error log
    this.errors.push(errorLog);
    
    // Keep only the last MAX_ERRORS
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Enhanced console logging
    console.group(`🚨 RECOMMENDATIONS ERROR: ${context.step}`);
    console.error('Error Details:', errorLog);
    console.error('Original Error:', error);
    if (context.response) {
      console.error('API Response:', context.response);
    }
    console.groupEnd();

    // Store in localStorage for persistence across sessions
    try {
      localStorage.setItem('recommendations_errors', JSON.stringify(this.errors));
    } catch (e) {
      console.warn('Could not save error to localStorage:', e);
    }
  }

  /**
   * Get all logged errors
   */
  static getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  /**
   * Get errors for a specific job
   */
  static getErrorsForJob(jobId: string): ErrorLog[] {
    return this.errors.filter(error => error.jobId === jobId);
  }

  /**
   * Clear all errors
   */
  static clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem('recommendations_errors');
    } catch (e) {
      console.warn('Could not clear errors from localStorage:', e);
    }
  }

  /**
   * Load errors from localStorage on initialization
   */
  static loadStoredErrors(): void {
    try {
      const stored = localStorage.getItem('recommendations_errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load stored errors:', e);
    }
  }

  /**
   * Analyze error patterns and provide recommendations
   */
  static analyzeErrorPatterns(): {
    totalErrors: number;
    mostCommonStep: string;
    mostCommonError: string;
    recommendations: string[];
  } {
    const stepCounts: { [key: string]: number } = {};
    const errorCounts: { [key: string]: number } = {};
    
    this.errors.forEach(error => {
      stepCounts[error.step] = (stepCounts[error.step] || 0) + 1;
      errorCounts[error.error.message] = (errorCounts[error.error.message] || 0) + 1;
    });

    const mostCommonStep = Object.entries(stepCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';
      
    const mostCommonError = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown';

    const recommendations: string[] = [];
    
    if (mostCommonStep === 'authentication') {
      recommendations.push('Most errors are authentication-related. Check Firebase Auth configuration.');
    }
    
    if (mostCommonStep === 'callable_function') {
      recommendations.push('Most errors occur in callable functions. Check Firebase Functions deployment.');
    }
    
    if (mostCommonStep === 'http_fallback') {
      recommendations.push('Most errors occur in HTTP fallback. Check CORS configuration.');
    }

    if (mostCommonError.includes('timeout')) {
      recommendations.push('Timeout errors detected. Consider increasing timeout values or optimizing backend performance.');
    }

    if (mostCommonError.includes('User not authenticated')) {
      recommendations.push('Authentication errors detected. Implement proper auth state management.');
    }

    return {
      totalErrors: this.errors.length,
      mostCommonStep,
      mostCommonError,
      recommendations
    };
  }

  /**
   * Generate a detailed error report
   */
  static generateErrorReport(): string {
    const analysis = this.analyzeErrorPatterns();
    
    let report = `# Recommendations API Error Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Errors: ${analysis.totalErrors}\n`;
    report += `Most Common Step: ${analysis.mostCommonStep}\n`;
    report += `Most Common Error: ${analysis.mostCommonError}\n\n`;
    
    report += `## Recommendations:\n`;
    analysis.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    
    report += `\n## Recent Errors:\n`;
    this.errors.slice(-10).forEach(error => {
      report += `\n### ${error.timestamp} - ${error.step}\n`;
      report += `Job ID: ${error.jobId}\n`;
      report += `Error: ${error.error.message}\n`;
      report += `Environment: ${error.environment}\n`;
      if (error.apiParameters.targetRole) {
        report += `Target Role: ${error.apiParameters.targetRole}\n`;
      }
      if (error.apiParameters.industryKeywords?.length) {
        report += `Keywords: ${error.apiParameters.industryKeywords.join(', ')}\n`;
      }
    });
    
    return report;
  }

  /**
   * Monitor API response structure and log anomalies
   */
  static monitorResponse(response: any, jobId: string): void {
    console.group(`📊 RESPONSE MONITOR: ${jobId}`);
    
    // Check response structure
    const hasSuccess = 'success' in response;
    const hasError = 'error' in response;
    const hasData = 'data' in response;
    const hasDirectRecommendations = 'recommendations' in response;
    const hasNestedRecommendations = response.data && 'recommendations' in response.data;

    console.log('Response Structure Analysis:', {
      hasSuccess,
      hasError,
      hasData,
      hasDirectRecommendations,
      hasNestedRecommendations,
      responseKeys: Object.keys(response || {}),
      dataKeys: response.data ? Object.keys(response.data) : null
    });

    // Log warnings for unexpected structures
    if (!hasSuccess) {
      console.warn('⚠️ Response missing "success" field');
    }

    if (!hasDirectRecommendations && !hasNestedRecommendations) {
      console.warn('⚠️ Response missing "recommendations" field in expected locations');
    }

    if (hasSuccess && response.success && !hasDirectRecommendations && !hasNestedRecommendations) {
      console.warn('⚠️ Success=true but no recommendations found');
    }

    console.groupEnd();
  }
}

// Initialize error monitor
RecommendationsErrorMonitor.loadStoredErrors();

export { RecommendationsErrorMonitor };

// Convenience function for use in RecommendationsContainer
export const logRecommendationError = (error: any, context: {
  jobId: string;
  step: string;
  targetRole?: string;
  industryKeywords?: string[];
  forceRegenerate?: boolean;
  response?: any;
}) => {
  RecommendationsErrorMonitor.logError(error, context);
};

export const monitorRecommendationResponse = (response: any, jobId: string) => {
  RecommendationsErrorMonitor.monitorResponse(response, jobId);
};

// Debug utilities for console access
if (typeof window !== 'undefined') {
  (window as any).RecommendationsErrorMonitor = RecommendationsErrorMonitor;
}