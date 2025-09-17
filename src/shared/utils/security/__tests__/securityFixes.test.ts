/**
 * Security Fixes Validation Tests
 * Comprehensive tests to validate XSS vulnerability fixes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  sanitizeHTML, 
  sanitizeCVData, 
  auditCVSecurity,
  containsXSS,
  sanitizeText,
  safeGet,
  isValidString
} from '../contentSanitizer';
import { createPreviewContent } from '../../placeholderReplacer';
import { testXSSProtection, performSecurityAudit } from '../securityAudit';

// ============================================================================
// XSS PREVENTION TESTS
// ============================================================================

describe('XSS Prevention', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("XSS")</script>';
      const result = sanitizeHTML(malicious);
      expect(result).toBe('');
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const malicious = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
      expect(result).toContain('Click me'); // Safe content preserved
    });

    it('should remove javascript protocols', () => {
      const malicious = '<a href="javascript:alert(\'XSS\')">Link</a>';
      const result = sanitizeHTML(malicious);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('alert');
    });

    it('should preserve safe HTML', () => {
      const safe = '<p>This is <strong>safe</strong> content with <em>emphasis</em></p>';
      const result = sanitizeHTML(safe);
      expect(result).toContain('strong');
      expect(result).toContain('emphasis');
      expect(result).toContain('<p>');
    });

    it('should handle empty and null inputs safely', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
    });
  });

  describe('createPreviewContent security', () => {
    it('should sanitize XSS in preview content', () => {
      const malicious = 'Normal text <script>alert("XSS")</script> more text';
      const result = createPreviewContent(malicious);
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
      expect(result).toContain('Normal text');
      expect(result).toContain('more text');
    });

    it('should preserve placeholders safely', () => {
      const contentWithPlaceholder = 'Experience with [INSERT NUMBER] years of development';
      const result = createPreviewContent(contentWithPlaceholder);
      expect(result).toContain('[INSERT NUMBER]');
      expect(result).not.toContain('script');
    });
  });

  describe('safeGet utility', () => {
    it('should safely access object properties', () => {
      const obj = {
        safe: 'Safe Value',
        nested: {
          value: 'Nested Value'
        }
      };

      expect(safeGet(obj, 'safe', 'default', isValidString)).toBe('Safe Value');
      expect(safeGet(obj, 'nested.value', 'default', isValidString)).toBe('Nested Value');
      expect(safeGet(obj, 'nonexistent', 'default', isValidString)).toBe('default');
      expect(safeGet(null, 'any.path', 'default', isValidString)).toBe('default');
    });

    it('should validate values with type guards', () => {
      const obj = {
        validString: 'Valid',
        emptyString: '',
        nullValue: null,
        numberValue: 123
      };

      expect(safeGet(obj, 'validString', 'default', isValidString)).toBe('Valid');
      expect(safeGet(obj, 'emptyString', 'default', isValidString)).toBe('default');
      expect(safeGet(obj, 'nullValue', 'default', isValidString)).toBe('default');
      expect(safeGet(obj, 'numberValue', 'default', isValidString)).toBe('default');
    });
  });
});

// ============================================================================
// CV DATA SANITIZATION TESTS
// ============================================================================

describe('CV Data Sanitization', () => {
  let mockCVData: any;

  beforeEach(() => {
    mockCVData = {
      personalInfo: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      summary: 'Professional developer with <script>alert("XSS")</script> experience',
      experience: [
        {
          position: 'Developer<script>alert("XSS")</script>',
          company: 'Tech Corp',
          startDate: '2020',
          endDate: '2023',
          description: 'Worked on projects <img src="x" onerror="alert(\'XSS\')" />',
          achievements: [
            'Achievement 1',
            'Achievement with <script>alert("XSS")</script>'
          ],
          technologies: ['React', 'Vue<script>alert("XSS")</script>']
        }
      ],
      skills: {
        categories: {
          'Frontend<script>alert("XSS")</script>': [
            'React',
            'Vue<script>alert("XSS")</script>'
          ]
        }
      }
    };
  });

  describe('sanitizeCVData', () => {
    it('should sanitize XSS in all CV data fields', () => {
      const sanitized = sanitizeCVData(mockCVData);

      // Check summary sanitization
      expect(sanitized.summary).not.toContain('script');
      expect(sanitized.summary).not.toContain('alert');
      expect(sanitized.summary).toContain('Professional developer');

      // Check experience sanitization
      expect(sanitized.experience[0].position).not.toContain('script');
      expect(sanitized.experience[0].position).toContain('Developer');
      
      expect(sanitized.experience[0].description).not.toContain('onerror');
      expect(sanitized.experience[0].description).not.toContain('alert');
      
      // Check achievements sanitization
      expect(sanitized.experience[0].achievements[1]).not.toContain('script');
      expect(sanitized.experience[0].achievements[1]).toContain('Achievement with');

      // Check technologies sanitization
      expect(sanitized.experience[0].technologies[1]).not.toContain('script');
      expect(sanitized.experience[0].technologies[1]).toContain('Vue');
    });

    it('should preserve safe data', () => {
      const sanitized = sanitizeCVData(mockCVData);

      expect(sanitized.personalInfo.fullName).toBe('John Doe');
      expect(sanitized.personalInfo.email).toBe('john@example.com');
      expect(sanitized.experience[0].company).toBe('Tech Corp');
      expect(sanitized.experience[0].achievements[0]).toBe('Achievement 1');
    });

    it('should handle malformed data gracefully', () => {
      const malformedData = {
        malformed: true,
        circular: {}
      };
      malformedData.circular = malformedData; // Create circular reference

      // Should not throw error
      expect(() => sanitizeCVData(malformedData)).not.toThrow();
    });
  });

  describe('auditCVSecurity', () => {
    it('should detect XSS attempts', () => {
      const audit = auditCVSecurity(mockCVData);
      
      expect(audit.isSecure).toBe(false);
      expect(audit.violations.length).toBeGreaterThan(0);
      expect(audit.recommendations.length).toBeGreaterThan(0);
    });

    it('should pass for clean data', () => {
      const cleanData = {
        personalInfo: {
          fullName: 'Jane Doe',
          email: 'jane@example.com'
        },
        summary: 'Clean professional summary',
        experience: [
          {
            position: 'Software Engineer',
            company: 'Clean Tech Inc',
            description: 'Developed applications using modern technologies'
          }
        ]
      };

      const audit = auditCVSecurity(cleanData);
      expect(audit.violations).toHaveLength(0);
    });
  });
});

// ============================================================================
// SECURITY AUDIT TESTS
// ============================================================================

describe('Security Audit System', () => {
  describe('performSecurityAudit', () => {
    it('should detect multiple security violations', () => {
      const maliciousData = {
        summary: '<script>alert("XSS1")</script>Very long content that exceeds reasonable limits for summaries and contains multiple security issues including script injection and excessive length that could cause denial of service attacks through memory exhaustion and should be flagged by our security system as a critical violation requiring immediate attention and remediation through content sanitization and length validation mechanisms',
        experience: [
          {
            position: '<img src="x" onerror="alert(\'XSS2\')" />',
            description: 'javascript:alert("XSS3")'
          }
        ]
      };

      const audit = performSecurityAudit(maliciousData);
      
      expect(audit.passed).toBe(false);
      expect(audit.score).toBeLessThan(100);
      expect(audit.summary.critical).toBeGreaterThan(0);
      expect(audit.violations.length).toBeGreaterThan(0);
      expect(audit.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate comprehensive security report', () => {
      const testData = { summary: 'Test content' };
      const audit = performSecurityAudit(testData);
      
      expect(audit).toHaveProperty('passed');
      expect(audit).toHaveProperty('score');
      expect(audit).toHaveProperty('violations');
      expect(audit).toHaveProperty('recommendations');
      expect(audit).toHaveProperty('summary');
      expect(audit).toHaveProperty('timestamp');
    });
  });

  describe('testXSSProtection', () => {
    it('should run comprehensive XSS tests', () => {
      const testResults = testXSSProtection();
      
      expect(testResults).toHaveProperty('passed');
      expect(testResults).toHaveProperty('failed');
      expect(testResults).toHaveProperty('results');
      expect(testResults.results).toBeInstanceOf(Array);
      expect(testResults.passed + testResults.failed).toBeGreaterThan(0);
    });

    it('should block dangerous XSS payloads', () => {
      const testResults = testXSSProtection();
      const dangerousTests = testResults.results.filter(
        r => r.testCase.expected === 'blocked'
      );
      
      const blockedSuccessfully = dangerousTests.filter(
        r => r.result === 'pass'
      ).length;
      
      // Should block most or all dangerous payloads
      expect(blockedSuccessfully / dangerousTests.length).toBeGreaterThan(0.8);
    });
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('Security Integration', () => {
  it('should handle complete CV processing pipeline securely', () => {
    const maliciousCVData = {
      personalInfo: {
        fullName: 'Test User<script>alert("XSS")</script>',
        email: 'test@example.com',
        phone: '+1234567890'
      },
      summary: 'Professional summary with <img src="x" onerror="alert(\'XSS\')" /> attack',
      experience: [
        {
          position: 'Senior Developer',
          company: 'Evil Corp<script>alert("XSS")</script>',
          startDate: '2020',
          endDate: '2023',
          description: 'Led development of <script>alert("XSS")</script> secure applications',
          achievements: [
            'Improved performance by <script>alert("XSS")</script> 50%',
            'Mentored junior developers'
          ],
          technologies: ['React', 'Node.js<script>alert("XSS")</script>']
        }
      ],
      skills: {
        categories: {
          Frontend: ['React<script>alert("XSS")</script>', 'Vue.js'],
          Backend: ['Node.js', 'Express<script>alert("XSS")</script>']
        }
      }
    };

    // Step 1: Security audit should detect issues
    const audit = performSecurityAudit(maliciousCVData);
    expect(audit.isSecure).toBe(false);
    expect(audit.violations.length).toBeGreaterThan(0);

    // Step 2: Data sanitization should clean the data
    const sanitizedData = sanitizeCVData(maliciousCVData);
    
    // Verify all script tags are removed
    const dataString = JSON.stringify(sanitizedData);
    expect(dataString).not.toContain('<script>');
    expect(dataString).not.toContain('alert(');
    expect(dataString).not.toContain('onerror');

    // Step 3: Sanitized data should pass security audit
    const postSanitizationAudit = auditCVSecurity(sanitizedData);
    expect(postSanitizationAudit.violations.length).toBe(0);

    // Step 4: Verify content integrity
    expect(sanitizedData.personalInfo.fullName).toContain('Test User');
    expect(sanitizedData.summary).toContain('Professional summary');
    expect(sanitizedData.experience[0].company).toContain('Evil Corp');
    expect(sanitizedData.experience[0].description).toContain('secure applications');
  });

  it('should maintain performance under security processing', () => {
    const largeDataSet = {
      experience: Array(100).fill(null).map((_, i) => ({
        position: `Position ${i}`,
        company: `Company ${i}`,
        description: `This is a description for position ${i} with some HTML <b>formatting</b> that should be preserved`,
        achievements: [
          `Achievement 1 for position ${i}`,
          `Achievement 2 for position ${i}`,
          `Achievement 3 for position ${i}`
        ]
      })),
      skills: {
        categories: Object.fromEntries(
          Array(50).fill(null).map((_, i) => [
            `Category ${i}`,
            [`Skill ${i}A`, `Skill ${i}B`, `Skill ${i}C`]
          ])
        )
      }
    };

    const startTime = performance.now();
    
    // Process through security pipeline
    const audit = performSecurityAudit(largeDataSet);
    const sanitized = sanitizeCVData(largeDataSet);
    
    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // Should process in reasonable time (less than 1 second)
    expect(processingTime).toBeLessThan(1000);
    
    // Should maintain data integrity
    expect(sanitized.experience).toHaveLength(100);
    expect(Object.keys(sanitized.skills.categories)).toHaveLength(50);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Security Edge Cases', () => {
  it('should handle deeply nested malicious content', () => {
    const deeplyNested = {
      level1: {
        level2: {
          level3: {
            level4: {
              content: '<script>alert("Deep XSS")</script>'
            }
          }
        }
      }
    };

    const sanitized = sanitizeCVData(deeplyNested);
    const dataString = JSON.stringify(sanitized);
    expect(dataString).not.toContain('script');
    expect(dataString).not.toContain('alert');
  });

  it('should handle mixed content types safely', () => {
    const mixedContent = {
      string: '<script>alert("XSS")</script>',
      number: 42,
      boolean: true,
      array: ['safe', '<script>alert("XSS")</script>', 'also safe'],
      object: {
        safe: 'content',
        dangerous: '<img src="x" onerror="alert(\'XSS\')" />'
      },
      nullValue: null,
      undefinedValue: undefined
    };

    expect(() => sanitizeCVData(mixedContent)).not.toThrow();
    const sanitized = sanitizeCVData(mixedContent);
    
    const dataString = JSON.stringify(sanitized);
    expect(dataString).not.toContain('script');
    expect(dataString).not.toContain('onerror');
    expect(dataString).not.toContain('alert');
  });

  it('should handle extremely long content gracefully', () => {
    const extremelyLongContent = 'A'.repeat(100000) + '<script>alert("XSS")</script>';
    const result = sanitizeText(extremelyLongContent, 1000);
    
    expect(result.length).toBeLessThanOrEqual(1000);
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('should handle Unicode and special characters safely', () => {
    const unicodeContent = '测试 <script>alert("XSS")</script> ñáéíóú 🚀💻';
    const result = sanitizeHTML(unicodeContent);
    
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
    expect(result).toContain('测试');
    expect(result).toContain('ñáéíóú');
    expect(result).toContain('🚀💻');
  });
});