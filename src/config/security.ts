/**
 * Security Configuration Constants
 * Centralized security settings for CVPlus application
 */

// ============================================================================
// CONTENT SECURITY POLICY CONFIGURATION
// ============================================================================

/**
 * Content Security Policy directives for production
 * Strict policy for maximum security
 */
export const CSP_DIRECTIVES_PRODUCTION = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'strict-dynamic'",
    'https://js.stripe.com',
    'https://maps.googleapis.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and CSS-in-JS
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://firebasestorage.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https://*.firebaseapp.com',
    'https://*.googleapis.com',
    'https://*.stripe.com',
    'wss://*.firebaseio.com'
  ],
  'media-src': [
    "'self'",
    'blob:',
    'https://firebasestorage.googleapis.com'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
} as const;

/**
 * Content Security Policy directives for development
 * More permissive for development tools
 */
export const CSP_DIRECTIVES_DEVELOPMENT = {
  ...CSP_DIRECTIVES_PRODUCTION,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Required for Vite dev server
    'https://js.stripe.com',
    'https://maps.googleapis.com'
  ],
  'connect-src': [
    "'self'",
    'https://*.firebaseapp.com',
    'https://*.googleapis.com',
    'https://*.stripe.com',
    'wss://*.firebaseio.com',
    'ws:', // For Vite HMR
    'wss:'
  ]
} as const;

/**
 * Generate CSP header string from directives
 */
export const generateCSPHeader = (directives: typeof CSP_DIRECTIVES_PRODUCTION): string => {
  return Object.entries(directives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive.replace(/-/g, '-');
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
};

// ============================================================================
// SECURITY VALIDATION CONSTANTS
// ============================================================================

/**
 * Maximum content lengths for different types
 */
export const CONTENT_LIMITS = {
  CV_DESCRIPTION: 5000,
  ACHIEVEMENT: 1000,
  SKILL_NAME: 100,
  COMPANY_NAME: 200,
  POSITION_TITLE: 200,
  LOCATION: 200,
  SUMMARY: 2000,
  PROJECT_DESCRIPTION: 1000,
  AWARD_DESCRIPTION: 500,
  PERSONAL_NAME: 100,
  EMAIL: 200,
  PHONE: 50,
  URL: 500
} as const;

/**
 * Dangerous patterns that should be blocked
 */
export const DANGEROUS_PATTERNS = [
  // Script injection patterns
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  
  // Event handler patterns
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /onclick\s*=/gi,
  /onmouseover\s*=/gi,
  /onfocus\s*=/gi,
  /onblur\s*=/gi,
  /onchange\s*=/gi,
  /onsubmit\s*=/gi,
  
  // Expression patterns
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  
  // Meta refresh and redirect patterns
  /<meta[^>]+http-equiv\s*=\s*["\']refresh["\'][^>]*>/gi,
  /window\.location/gi,
  /document\.location/gi,
  
  // External protocol patterns
  /^(file|ftp|gopher|ldap|news|nntp|telnet|mailto):/gi
] as const;

/**
 * Allowed HTML tags for CV content
 */
export const ALLOWED_HTML_TAGS = [
  'b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'div',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'a'
] as const;

/**
 * Allowed HTML attributes
 */
export const ALLOWED_HTML_ATTRIBUTES = [
  'href', 'title', 'class', 'id', 'data-placeholder',
  'target', 'rel', 'alt'
] as const;

/**
 * Forbidden HTML tags that should never be allowed
 */
export const FORBIDDEN_HTML_TAGS = [
  'script', 'object', 'embed', 'form', 'input', 'textarea',
  'select', 'button', 'iframe', 'frame', 'frameset', 'meta',
  'link', 'style', 'base', 'applet', 'audio', 'video',
  'source', 'track', 'canvas'
] as const;

/**
 * Forbidden HTML attributes that should never be allowed
 */
export const FORBIDDEN_HTML_ATTRIBUTES = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
  'onblur', 'onchange', 'onsubmit', 'onkeydown', 'onkeyup',
  'onmousedown', 'onmouseup', 'src', 'action', 'method',
  'formaction', 'formmethod', 'formtarget'
] as const;

// ============================================================================
// SECURITY MONITORING CONFIGURATION
// ============================================================================

/**
 * Security event types for monitoring
 */
export const SECURITY_EVENT_TYPES = {
  XSS_ATTEMPT: 'xss_attempt',
  CONTENT_VIOLATION: 'content_violation',
  SIZE_LIMIT_EXCEEDED: 'size_limit_exceeded',
  INVALID_INPUT: 'invalid_input',
  SANITIZATION_APPLIED: 'sanitization_applied',
  CSP_VIOLATION: 'csp_violation'
} as const;

/**
 * Security levels for risk assessment
 */
export const SECURITY_LEVELS = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  CV_PROCESSING: {
    MAX_REQUESTS: 10,
    WINDOW_MS: 60000, // 1 minute
    MESSAGE: 'Too many CV processing requests'
  },
  TEMPLATE_GENERATION: {
    MAX_REQUESTS: 50,
    WINDOW_MS: 60000,
    MESSAGE: 'Too many template generation requests'
  },
  FILE_UPLOAD: {
    MAX_REQUESTS: 20,
    WINDOW_MS: 300000, // 5 minutes
    MESSAGE: 'Too many file upload requests'
  }
} as const;

// ============================================================================
// ENVIRONMENT-SPECIFIC SECURITY SETTINGS
// ============================================================================

/**
 * Get security configuration based on environment
 */
export const getSecurityConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  return {
    CSP_DIRECTIVES: isDevelopment ? CSP_DIRECTIVES_DEVELOPMENT : CSP_DIRECTIVES_PRODUCTION,
    STRICT_MODE: isProduction,
    DEBUG_SECURITY: isDevelopment,
    SANITIZE_ALL_CONTENT: true,
    VALIDATE_ALL_INPUTS: true,
    LOG_SECURITY_EVENTS: true,
    BLOCK_DANGEROUS_CONTENT: true,
    ENABLE_CSP: true,
    ENABLE_HSTS: isProduction,
    REMOVE_DEBUG_INFO: isProduction
  };
};

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  PRODUCTION: {
    'Content-Security-Policy': generateCSPHeader(CSP_DIRECTIVES_PRODUCTION),
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin'
  },
  DEVELOPMENT: {
    'Content-Security-Policy': generateCSPHeader(CSP_DIRECTIVES_DEVELOPMENT),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if content contains dangerous patterns
 */
export const containsDangerousContent = (content: string): boolean => {
  return DANGEROUS_PATTERNS.some(pattern => pattern.test(content));
};

/**
 * Get appropriate content limit for content type
 */
export const getContentLimit = (contentType: keyof typeof CONTENT_LIMITS): number => {
  return CONTENT_LIMITS[contentType];
};

/**
 * Check if HTML tag is allowed
 */
export const isAllowedTag = (tag: string): boolean => {
  return ALLOWED_HTML_TAGS.includes(tag.toLowerCase() as typeof ALLOWED_HTML_TAGS[number]);
};

/**
 * Check if HTML attribute is allowed
 */
export const isAllowedAttribute = (attribute: string): boolean => {
  return ALLOWED_HTML_ATTRIBUTES.includes(attribute.toLowerCase() as typeof ALLOWED_HTML_ATTRIBUTES[number]);
};

/**
 * Security configuration export
 */
export const SECURITY_CONFIG = getSecurityConfig();