/**
 * Utility for handling CV content placeholders from the backend
 * Provides functions to detect, validate, and manage placeholder content
 * NEVER auto-replaces placeholders with fake data - only user-provided real data
 */

// Import sanitization function at the top
import { sanitizeHTML } from './security/contentSanitizer';

export interface PlaceholderReplacements {
  [key: string]: string;
}

/**
 * Replaces placeholders ONLY with user-provided real data
 * NEVER auto-generates fake content - this violates user data integrity
 */
export const replacePlaceholders = (
  content: string, 
  userProvidedReplacements: PlaceholderReplacements = {}
): string => {
  if (!content) return content;
  if (Object.keys(userProvidedReplacements).length === 0) {
    // NO REPLACEMENTS - return original content with placeholders intact
    return content;
  }

  let processedContent = content;
  
  // ONLY apply user-provided replacements - NEVER auto-generate content
  Object.entries(userProvidedReplacements).forEach(([placeholder, userValue]) => {
    if (userValue && userValue.trim()) {
      const regex = new RegExp(escapeRegExp(placeholder), 'gi');
      processedContent = processedContent.replace(regex, userValue);
    }
  });

  return processedContent;
};

/**
 * Checks if content contains backend placeholders
 */
export const hasPlaceholders = (content: string): boolean => {
  if (!content) return false;
  
  const placeholderPattern = /\[(INSERT|ADD|NUMBER)[^\]]*\]/gi;
  return placeholderPattern.test(content);
};

/**
 * Extracts all placeholders from content
 */
export const extractPlaceholders = (content: string): string[] => {
  if (!content) return [];
  
  const placeholderPattern = /\[(INSERT|ADD|NUMBER)[^\]]*\]/gi;
  const matches = content.match(placeholderPattern) || [];
  
  return Array.from(new Set(matches)); // Remove duplicates
};

/**
 * Creates preview content showing placeholders as interactive elements
 * NEVER replaces placeholders with fake data - shows them as clickable elements for user input
 * NOW WITH XSS PROTECTION: All content is sanitized before return
 */
export const createPreviewContent = (
  content: string,
  showPlaceholderHints = true,
  userReplacements: PlaceholderReplacements = {}
): string => {
  if (!content) return content;
  
  // Apply ONLY user-provided replacements, never fake data
  let processedContent = replacePlaceholders(content, userReplacements);
  
  // Make remaining placeholders clickable
  if (hasPlaceholders(processedContent)) {
    processedContent = makeInteractivePlaceholders(processedContent);
  }
  
  // CRITICAL SECURITY FIX: Sanitize all HTML content before return
  return sanitizeHTML(processedContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'span', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class', 'data-placeholder', 'onclick'],
    FORBID_SCRIPTS: true,
    SANITIZE_DOM: true
  });
};

/**
 * Wraps placeholders with clickable styling and interaction handlers
 */
export const makeInteractivePlaceholders = (content: string): string => {
  if (!content) return content;
  
  // Find all placeholders and wrap them with clickable elements
  return content.replace(/\[(INSERT|ADD|NUMBER)[^\]]*\]/gi, (match) => {
    return `<span class="placeholder-text" data-placeholder="${match}" onclick="openPlaceholderInput('${match}')">${match}</span>`;
  });
};

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get example formats for placeholder fields (for input hints only)
 * These are EXAMPLES for user guidance, NEVER used as actual replacements
 */
export const getPlaceholderExamples = (section: string, role?: string): Record<string, string> => {
  const examples: Record<string, string> = {
    '[INSERT NUMBER]': '5, 10, 15',
    '[INSERT TEAM SIZE]': '8 developers, 12 professionals',
    '[ADD PERCENTAGE]': '25, 30, 40 (without % symbol)',
    '[INSERT BUDGET]': '$500K, $1M, $2M+',
    '[INSERT TIMEFRAME]': '3 months, 6 months, 1 year',
    '[INSERT VALUE]': '$2M, 500K users, 50% improvement'
  };
  
  return examples;
};

/**
 * Extract placeholder information for form creation
 */
export const extractPlaceholderInfo = (content: string): Array<{placeholder: string, type: string, label: string}> => {
  if (!content) return [];
  
  const placeholders = extractPlaceholders(content);
  return placeholders.map(placeholder => {
    const cleanPlaceholder = placeholder.replace(/[[\]]/g, '');
    const type = detectPlaceholderType(placeholder);
    const label = formatPlaceholderLabel(cleanPlaceholder);
    
    return {
      placeholder,
      type,
      label
    };
  });
};

/**
 * Detect the type of placeholder for appropriate input field
 */
const detectPlaceholderType = (placeholder: string): string => {
  const lower = placeholder.toLowerCase();
  
  if (lower.includes('percentage') || lower.includes('percent')) return 'percentage';
  if (lower.includes('budget') || lower.includes('value') || lower.includes('$')) return 'currency';
  if (lower.includes('number') || lower.includes('size') || lower.includes('team')) return 'number';
  if (lower.includes('time') || lower.includes('duration') || lower.includes('months')) return 'timeframe';
  
  return 'text';
};

/**
 * Format placeholder for human-readable label
 */
const formatPlaceholderLabel = (placeholder: string): string => {
  return placeholder
    .replace(/INSERT|ADD/gi, '')
    .trim()
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};