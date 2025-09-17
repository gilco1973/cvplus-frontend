/**
 * Security Audit and Testing Tools
 * Comprehensive security validation and testing utilities for CVPlus
 */

import { 
  containsXSS, 
  auditCVSecurity, 
  sanitizeCVData,
  sanitizeHTML,
  CVDataSchema
} from './contentSanitizer';
import { 
  DANGEROUS_PATTERNS,
  SECURITY_EVENT_TYPES,
  SECURITY_LEVELS,
  containsDangerousContent,
  getContentLimit
} from '../../config/security';

// ============================================================================
// SECURITY AUDIT INTERFACES
// ============================================================================

interface SecurityViolation {
  type: keyof typeof SECURITY_EVENT_TYPES;
  severity: keyof typeof SECURITY_LEVELS;
  location: string;
  description: string;
  recommendation: string;
  content?: string;
}

interface SecurityAuditResult {
  passed: boolean;
  score: number; // 0-100
  violations: SecurityViolation[];
  recommendations: string[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  timestamp: string;
}

interface XSSTestCase {
  name: string;
  payload: string;
  expected: 'blocked' | 'sanitized' | 'allowed';
  description: string;
}

// ============================================================================
// XSS TEST PAYLOADS
// ============================================================================

/**
 * Comprehensive XSS test payloads for security validation
 */
export const XSS_TEST_PAYLOADS: XSSTestCase[] = [
  // Basic script injection
  {
    name: 'Basic Script Tag',
    payload: '<script>alert("XSS")</script>',
    expected: 'blocked',
    description: 'Standard script tag injection'
  },
  {
    name: 'Script with attributes',
    payload: '<script type="text/javascript">alert("XSS")</script>',
    expected: 'blocked',
    description: 'Script tag with type attribute'
  },
  
  // Event handler injection
  {
    name: 'OnLoad Event Handler',
    payload: '<img src="x" onerror="alert(\'XSS\')" />',
    expected: 'blocked',
    description: 'Image with onerror event handler'
  },
  {
    name: 'OnClick Event Handler',
    payload: '<div onclick="alert(\'XSS\')">Click me</div>',
    expected: 'blocked',
    description: 'Div with onclick event handler'
  },
  {
    name: 'OnMouseOver Event Handler',
    payload: '<span onmouseover="alert(\'XSS\')">Hover me</span>',
    expected: 'blocked',
    description: 'Span with onmouseover event handler'
  },
  
  // JavaScript protocol injection
  {
    name: 'JavaScript Protocol',
    payload: '<a href="javascript:alert(\'XSS\')">Click</a>',
    expected: 'blocked',
    description: 'Link with javascript protocol'
  },
  
  // Data URI injection
  {
    name: 'Data URI Script',
    payload: '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
    expected: 'blocked',
    description: 'Data URI with embedded script'
  },
  
  // Expression injection (old IE)
  {
    name: 'CSS Expression',
    payload: '<div style="background:url(javascript:alert(\'XSS\'))">Test</div>',
    expected: 'blocked',
    description: 'CSS with javascript URL'
  },
  
  // Meta refresh injection
  {
    name: 'Meta Refresh',
    payload: '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
    expected: 'blocked',
    description: 'Meta refresh with javascript'
  },
  
  // Encoded payload attempts
  {
    name: 'URL Encoded Script',
    payload: '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E',
    expected: 'blocked',
    description: 'URL encoded script tag'
  },
  {
    name: 'HTML Entity Encoded',
    payload: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
    expected: 'sanitized',
    description: 'HTML entity encoded script'
  },
  
  // Harmless content that should be allowed
  {
    name: 'Safe HTML',
    payload: '<p>This is <strong>safe</strong> content with <em>emphasis</em></p>',
    expected: 'allowed',
    description: 'Safe HTML formatting'
  },
  {
    name: 'Safe Link',
    payload: '<a href="https://example.com" title="Safe Link">Visit Example</a>',
    expected: 'allowed',
    description: 'Safe external link'
  }
];

// ============================================================================
// SECURITY AUDIT FUNCTIONS
// ============================================================================

/**
 * Comprehensive security audit for CV data
 */
export const performSecurityAudit = (data: any): SecurityAuditResult => {
  const violations: SecurityViolation[] = [];
  const timestamp = new Date().toISOString();
  
  try {
    // Basic structure validation
    const basicAudit = auditCVSecurity(data);
    if (!basicAudit.isSecure) {
      basicAudit.violations.forEach(violation => {
        violations.push({
          type: 'CONTENT_VIOLATION',
          severity: 'HIGH',
          location: 'data structure',
          description: violation,
          recommendation: 'Apply content sanitization and validation'
        });
      });
    }
    
    // Deep content analysis
    scanForDangerousContent(data, '', violations);
    
    // Size validation
    validateContentSizes(data, '', violations);
    
    // Schema validation
    validateDataSchema(data, violations);
    
    // Calculate security score
    const score = calculateSecurityScore(violations);
    
    // Generate summary
    const summary = {
      critical: violations.filter(v => v.severity === 'CRITICAL').length,
      high: violations.filter(v => v.severity === 'HIGH').length,
      medium: violations.filter(v => v.severity === 'MEDIUM').length,
      low: violations.filter(v => v.severity === 'LOW').length
    };
    
    // Generate recommendations
    const recommendations = generateRecommendations(violations);
    
    return {
      passed: violations.length === 0 || summary.critical === 0,
      isSecure: violations.length === 0,
      score,
      violations,
      recommendations,
      summary,
      timestamp
    };
    
  } catch (error) {
    console.error('Security audit failed:', error);
    return {
      passed: false,
      isSecure: false,
      score: 0,
      violations: [{
        type: 'INVALID_INPUT',
        severity: 'CRITICAL',
        location: 'audit process',
        description: 'Security audit process failed',
        recommendation: 'Review data structure and retry audit'
      }],
      recommendations: ['Fix data structure issues before reprocessing'],
      summary: { critical: 1, high: 0, medium: 0, low: 0 },
      timestamp
    };
  }
};

/**
 * Scan content recursively for dangerous patterns
 */
const scanForDangerousContent = (
  obj: any, 
  path: string, 
  violations: SecurityViolation[]
): void => {
  if (typeof obj === 'string') {
    // Check for XSS patterns
    if (containsXSS(obj)) {
      violations.push({
        type: 'XSS_ATTEMPT',
        severity: 'CRITICAL',
        location: path,
        description: 'Potential XSS payload detected',
        recommendation: 'Sanitize content before processing',
        content: obj.substring(0, 100) + (obj.length > 100 ? '...' : '')
      });
    }
    
    // Check for other dangerous patterns
    if (containsDangerousContent(obj)) {
      violations.push({
        type: 'CONTENT_VIOLATION',
        severity: 'HIGH',
        location: path,
        description: 'Dangerous content pattern detected',
        recommendation: 'Remove or sanitize dangerous content',
        content: obj.substring(0, 100) + (obj.length > 100 ? '...' : '')
      });
    }
    
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      scanForDangerousContent(obj[key], newPath, violations);
    });
  }
};

/**
 * Validate content sizes against limits
 */
const validateContentSizes = (
  obj: any, 
  path: string, 
  violations: SecurityViolation[]
): void => {
  if (typeof obj === 'string') {
    let limit = 1000; // Default limit
    
    // Determine appropriate limit based on path
    if (path.includes('description')) {
      limit = getContentLimit('CV_DESCRIPTION');
    } else if (path.includes('achievement')) {
      limit = getContentLimit('ACHIEVEMENT');
    } else if (path.includes('summary')) {
      limit = getContentLimit('SUMMARY');
    } else if (path.includes('skill')) {
      limit = getContentLimit('SKILL_NAME');
    } else if (path.includes('company')) {
      limit = getContentLimit('COMPANY_NAME');
    } else if (path.includes('position') || path.includes('title')) {
      limit = getContentLimit('POSITION_TITLE');
    }
    
    if (obj.length > limit) {
      violations.push({
        type: 'SIZE_LIMIT_EXCEEDED',
        severity: 'MEDIUM',
        location: path,
        description: `Content exceeds size limit (${obj.length}/${limit} characters)`,
        recommendation: `Reduce content size to under ${limit} characters`
      });
    }
    
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      validateContentSizes(obj[key], newPath, violations);
    });
  }
};

/**
 * Validate data against schema
 */
const validateDataSchema = (data: any, violations: SecurityViolation[]): void => {
  try {
    const validation = CVDataSchema.safeParse(data);
    if (!validation.success) {
      validation.error.issues.forEach(issue => {
        violations.push({
          type: 'INVALID_INPUT',
          severity: 'MEDIUM',
          location: issue.path.join('.'),
          description: `Schema validation error: ${issue.message}`,
          recommendation: 'Fix data structure to match expected schema'
        });
      });
    }
  } catch (error) {
    violations.push({
      type: 'INVALID_INPUT',
      severity: 'LOW',
      location: 'schema validation',
      description: 'Unable to validate against schema',
      recommendation: 'Review data format and structure'
    });
  }
};

/**
 * Calculate security score based on violations
 */
const calculateSecurityScore = (violations: SecurityViolation[]): number => {
  if (violations.length === 0) return 100;
  
  const weights = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 8,
    LOW: 3
  };
  
  const totalPenalty = violations.reduce((sum, violation) => {
    return sum + weights[violation.severity];
  }, 0);
  
  return Math.max(0, 100 - totalPenalty);
};

/**
 * Generate security recommendations
 */
const generateRecommendations = (violations: SecurityViolation[]): string[] => {
  const recommendations = new Set<string>();
  
  violations.forEach(violation => {
    recommendations.add(violation.recommendation);
  });
  
  // Add general recommendations
  if (violations.length > 0) {
    recommendations.add('Implement comprehensive input validation');
    recommendations.add('Apply content sanitization before processing');
    recommendations.add('Monitor for security violations in production');
  }
  
  return Array.from(recommendations);
};

// ============================================================================
// XSS TESTING FUNCTIONS
// ============================================================================

/**
 * Test XSS protection with various payloads
 */
export const testXSSProtection = (): {
  passed: number;
  failed: number;
  results: Array<{
    testCase: XSSTestCase;
    result: 'pass' | 'fail';
    sanitizedOutput: string;
  }>;
} => {
  const results: Array<{
    testCase: XSSTestCase;
    result: 'pass' | 'fail';
    sanitizedOutput: string;
  }> = [];
  
  XSS_TEST_PAYLOADS.forEach(testCase => {
    try {
      const sanitizedOutput = sanitizeHTML(testCase.payload);
      
      let result: 'pass' | 'fail' = 'fail';
      
      switch (testCase.expected) {
        case 'blocked':
          // Should be completely removed or empty
          result = sanitizedOutput === '' || !sanitizedOutput.includes('alert') ? 'pass' : 'fail';
          break;
        
        case 'sanitized':
          // Should be modified but not empty
          result = sanitizedOutput !== testCase.payload && sanitizedOutput.length > 0 ? 'pass' : 'fail';
          break;
        
        case 'allowed':
          // Should remain largely unchanged
          result = sanitizedOutput === testCase.payload || 
                  (sanitizedOutput.length > 0 && !containsXSS(sanitizedOutput)) ? 'pass' : 'fail';
          break;
      }
      
      results.push({
        testCase,
        result,
        sanitizedOutput
      });
      
    } catch (error) {
      results.push({
        testCase,
        result: 'fail',
        sanitizedOutput: 'Error during sanitization'
      });
    }
  });
  
  const passed = results.filter(r => r.result === 'pass').length;
  const failed = results.filter(r => r.result === 'fail').length;
  
  return { passed, failed, results };
};

/**
 * Generate security test report
 */
export const generateSecurityTestReport = (data: any): string => {
  const auditResult = performSecurityAudit(data);
  const xssTestResult = testXSSProtection();
  
  const report = `
CVPlus Security Assessment Report
Generated: ${new Date().toISOString()}
============================================

OVERALL SECURITY SCORE: ${auditResult.score}/100
STATUS: ${auditResult.passed ? 'PASSED' : 'FAILED'}

CONTENT AUDIT RESULTS:
- Critical Violations: ${auditResult.summary.critical}
- High Risk Issues: ${auditResult.summary.high}
- Medium Risk Issues: ${auditResult.summary.medium}
- Low Risk Issues: ${auditResult.summary.low}

XSS PROTECTION TESTS:
- Passed: ${xssTestResult.passed}/${XSS_TEST_PAYLOADS.length}
- Failed: ${xssTestResult.failed}/${XSS_TEST_PAYLOADS.length}
- Success Rate: ${Math.round((xssTestResult.passed / XSS_TEST_PAYLOADS.length) * 100)}%

SECURITY VIOLATIONS:
${auditResult.violations.map(v => 
  `- [${v.severity}] ${v.location}: ${v.description}`
).join('\n')}

RECOMMENDATIONS:
${auditResult.recommendations.map(r => `- ${r}`).join('\n')}

FAILED XSS TESTS:
${xssTestResult.results
  .filter(r => r.result === 'fail')
  .map(r => `- ${r.testCase.name}: Expected ${r.testCase.expected}, got: "${r.sanitizedOutput}"`)
  .join('\n')}
`;
  
  return report;
};

// ============================================================================
// PRODUCTION SECURITY MONITORING
// ============================================================================

/**
 * Log security events for monitoring
 */
export const logSecurityEvent = (
  type: keyof typeof SECURITY_EVENT_TYPES,
  details: {
    location?: string;
    content?: string;
    userAgent?: string;
    ip?: string;
    severity?: keyof typeof SECURITY_LEVELS;
  }
): void => {
  const event = {
    timestamp: new Date().toISOString(),
    type,
    severity: details.severity || 'MEDIUM',
    location: details.location || 'unknown',
    userAgent: details.userAgent || navigator.userAgent,
    ip: details.ip || 'unknown',
    content: details.content ? details.content.substring(0, 200) : undefined
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.warn('Security Event:', event);
  }
  
  // In production, send to monitoring service
  if (import.meta.env.PROD) {
    // Send to your security monitoring service
    // Example: analytics.track('security_event', event);
  }
};

/**
 * Real-time security monitor for content
 */
export const monitorContent = (content: string, location: string): boolean => {
  if (containsXSS(content) || containsDangerousContent(content)) {
    logSecurityEvent('XSS_ATTEMPT', {
      location,
      content,
      severity: 'CRITICAL'
    });
    return false;
  }
  
  return true;
};