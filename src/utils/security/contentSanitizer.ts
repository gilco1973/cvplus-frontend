/**
 * Secure Content Sanitizer
 * Comprehensive XSS prevention system for CVPlus template generation
 * Uses DOMPurify for bulletproof HTML sanitization
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

// ============================================================================
// SANITIZATION CONFIGURATION
// ============================================================================

/**
 * DOMPurify configuration for CV content sanitization
 * Allows safe HTML formatting while preventing XSS attacks
 */
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div',
    'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'a'
  ],
  ALLOWED_ATTR: ['href', 'title', 'class', 'data-placeholder'],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/|#)/,
  FORBID_SCRIPTS: true,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'iframe'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
} as const;

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

/**
 * Zod schema for validating CV content
 */
export const CVContentSchema = z.object({
  description: z.string().max(5000).optional(),
  achievement: z.string().max(1000).optional(),
  title: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
  position: z.string().max(200).optional(),
  skill: z.string().max(100).optional(),
  location: z.string().max(200).optional(),
  summary: z.string().max(2000).optional()
});

/**
 * Validation schema for experience data
 */
export const ExperienceSchema = z.object({
  position: z.string().max(200),
  company: z.string().max(200),
  startDate: z.string().max(50),
  endDate: z.string().max(50),
  location: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  achievements: z.array(z.string().max(1000)).optional(),
  technologies: z.array(z.string().max(100)).optional()
});

/**
 * Validation schema for complete CV data
 */
export const CVDataSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().max(100),
    email: z.string().email().max(200),
    phone: z.string().max(50).optional(),
    location: z.string().max(200).optional(),
    linkedin: z.string().url().max(500).optional(),
    portfolio: z.string().url().max(500).optional()
  }).optional(),
  summary: z.string().max(2000).optional(),
  experience: z.array(ExperienceSchema).optional(),
  education: z.array(z.object({
    degree: z.string().max(200),
    institution: z.string().max(200),
    year: z.string().max(50),
    location: z.string().max(200).optional(),
    description: z.string().max(1000).optional()
  })).optional(),
  skills: z.object({
    categories: z.record(z.array(z.string().max(100)))
  }).optional(),
  projects: z.array(z.object({
    title: z.string().max(200),
    description: z.string().max(1000),
    technologies: z.array(z.string().max(100)).optional(),
    url: z.string().url().max(500).optional()
  })).optional(),
  awards: z.array(z.object({
    title: z.string().max(200),
    issuer: z.string().max(200),
    year: z.string().max(50),
    description: z.string().max(500).optional()
  })).optional()
});

// ============================================================================
// CORE SANITIZATION FUNCTIONS
// ============================================================================

/**
 * Sanitizes HTML content using DOMPurify
 * Prevents XSS attacks while preserving safe formatting
 */
export const sanitizeHTML = (
  content: string,
  options: Partial<typeof SANITIZE_CONFIG> = {}
): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const config = { ...SANITIZE_CONFIG, ...options };
  
  try {
    const sanitized = DOMPurify.sanitize(content, config);
    return sanitized;
  } catch (error) {
    console.error('Content sanitization failed:', error);
    // Return empty string on sanitization failure for security
    return '';
  }
};

/**
 * Sanitizes plain text content
 * Removes dangerous characters and limits length
 */
export const sanitizeText = (
  content: string,
  maxLength = 1000
): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove any potential script injections and dangerous patterns
  const dangerous = /<script|javascript:|data:|vbscript:|onload=|onerror=/gi;
  let sanitized = content.replace(dangerous, '');
  
  // Limit length to prevent DoS attacks - account for ellipsis
  if (sanitized.length > maxLength) {
    const trimLength = Math.max(0, maxLength - 3); // Account for '...'
    sanitized = sanitized.substring(0, trimLength).trim();
    if (trimLength > 0) {
      sanitized += '...';
    }
  }
  
  return sanitized.trim();
};

/**
 * Sanitizes and validates CV content with comprehensive protection
 */
export const sanitizeAndValidateCVContent = (
  content: string,
  type: keyof typeof CVContentSchema.shape
): string => {
  if (!content) return '';

  // First validate the content structure
  try {
    const validation = CVContentSchema.shape[type].safeParse(content);
    if (!validation.success) {
      console.warn(`Content validation failed for ${type}:`, validation.error);
      return sanitizeText(content, 500); // Fallback to text sanitization
    }
  } catch (error) {
    console.warn('Validation error:', error);
    return sanitizeText(content, 500);
  }

  // Then sanitize HTML content
  return sanitizeHTML(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: []
  });
};

// ============================================================================
// SPECIALIZED SANITIZERS
// ============================================================================

/**
 * Sanitizes experience descriptions with enhanced protection
 */
export const sanitizeExperienceDescription = (description: string): string => {
  return sanitizeAndValidateCVContent(description, 'description');
};

/**
 * Sanitizes achievement content
 */
export const sanitizeAchievement = (achievement: string): string => {
  return sanitizeAndValidateCVContent(achievement, 'achievement');
};

/**
 * Sanitizes skill names and categories
 */
export const sanitizeSkill = (skill: string): string => {
  return sanitizeText(skill, 100);
};

/**
 * Sanitizes URLs with additional validation
 */
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    // Only allow HTTPS and HTTP protocols
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    
    // Additional domain validation could go here
    return sanitizeText(url, 500);
  } catch {
    return '';
  }
};

/**
 * Deep recursive sanitization helper
 */
const deepSanitize = (obj: any, seen = new WeakSet()): any => {
  // Handle circular references
  if (obj && typeof obj === 'object' && seen.has(obj)) {
    return '[Circular Reference Removed]';
  }
  
  if (obj && typeof obj === 'object') {
    seen.add(obj);
  }

  if (typeof obj === 'string') {
    return sanitizeHTML(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, seen));
  } else if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const sanitized: any = {};
    Object.keys(obj).forEach(key => {
      // Sanitize the key itself if it's a string
      const sanitizedKey = typeof key === 'string' ? sanitizeText(key, 100) : key;
      sanitized[sanitizedKey] = deepSanitize(obj[key], seen);
    });
    return sanitized;
  }
  
  return obj;
};

/**
 * Validates and sanitizes complete CV data structure
 */
export const sanitizeCVData = (data: any): any => {
  try {
    // Validate overall structure
    const validation = CVDataSchema.safeParse(data);
    if (!validation.success) {
      console.warn('CV data validation failed:', validation.error);
      // Proceed with sanitization even if validation fails
    }

    // Deep sanitize all content recursively
    const sanitized = deepSanitize(data);

    // Apply specific sanitization rules for CV structure
    if (sanitized && typeof sanitized === 'object') {
      // Sanitize personal info with specific rules
      if (sanitized.personalInfo && typeof sanitized.personalInfo === 'object') {
        Object.keys(sanitized.personalInfo).forEach(key => {
          if (typeof sanitized.personalInfo[key] === 'string') {
            if (key === 'linkedin' || key === 'portfolio') {
              sanitized.personalInfo[key] = sanitizeURL(sanitized.personalInfo[key]);
            } else {
              sanitized.personalInfo[key] = sanitizeText(sanitized.personalInfo[key], 200);
            }
          }
        });
      }

      // Additional experience field sanitization
      if (sanitized.experience && Array.isArray(sanitized.experience)) {
        sanitized.experience = sanitized.experience.map((exp: any) => {
          if (exp && typeof exp === 'object') {
            return {
              ...exp,
              position: exp.position ? sanitizeText(exp.position, 200) : '',
              company: exp.company ? sanitizeText(exp.company, 200) : '',
              startDate: exp.startDate ? sanitizeText(exp.startDate, 50) : '',
              endDate: exp.endDate ? sanitizeText(exp.endDate, 50) : '',
              location: exp.location ? sanitizeText(exp.location, 200) : undefined,
              description: exp.description ? sanitizeExperienceDescription(exp.description) : undefined,
              achievements: exp.achievements && Array.isArray(exp.achievements) 
                ? exp.achievements.map((ach: string) => sanitizeAchievement(ach)) 
                : undefined,
              technologies: exp.technologies && Array.isArray(exp.technologies)
                ? exp.technologies.map((tech: string) => sanitizeSkill(tech))
                : undefined
            };
          }
          return exp;
        });
      }
    }

    return sanitized || {};
  } catch (error) {
    console.error('CV data sanitization failed:', error);
    return {}; // Return empty object on complete failure
  }
};

// ============================================================================
// SECURITY UTILITIES
// ============================================================================

/**
 * Checks if content contains potential XSS patterns
 */
export const containsXSS = (content: string): boolean => {
  if (!content) return false;

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /onmouseover=/i,
    /onfocus=/i,
    /onblur=/i,
    /eval\(/i,
    /expression\(/i
  ];

  return xssPatterns.some(pattern => pattern.test(content));
};

/**
 * Security audit for CV content
 */
export const auditCVSecurity = (data: any): {
  isSecure: boolean;
  violations: string[];
  recommendations: string[];
} => {
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Check for XSS patterns
  const checkContent = (obj: any, path = ''): void => {
    if (typeof obj === 'string') {
      if (containsXSS(obj)) {
        violations.push(`XSS pattern detected in ${path}`);
      }
      if (obj.length > 5000) {
        violations.push(`Excessive content length in ${path} (${obj.length} chars)`);
      }
    } else if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        checkContent(obj[key], path ? `${path}.${key}` : key);
      });
    }
  };

  checkContent(data);

  // Generate recommendations
  if (violations.length > 0) {
    recommendations.push('Apply content sanitization before processing');
    recommendations.push('Validate all user inputs with schema validation');
  }

  if (data?.personalInfo?.email && !data.personalInfo.email.includes('@')) {
    violations.push('Invalid email format detected');
    recommendations.push('Implement email validation');
  }

  return {
    isSecure: violations.length === 0,
    violations,
    recommendations
  };
};

/**
 * Safe property access with type checking
 */
export const safeGet = <T>(
  obj: any,
  path: string,
  defaultValue: T,
  validator?: (value: any) => value is T
): T => {
  try {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    
    if (validator && !validator(current)) {
      return defaultValue;
    }
    
    return current ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Type guard for string validation
 */
export const isValidString = (value: any): value is string => {
  return typeof value === 'string' && value.length > 0;
};

/**
 * Type guard for array validation
 */
export const isValidArray = (value: any): value is any[] => {
  return Array.isArray(value) && value.length > 0;
};