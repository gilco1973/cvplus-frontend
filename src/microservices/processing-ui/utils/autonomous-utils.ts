// @ts-ignore
/**
 * Autonomous Utility Functions
 * Replaces @cvplus/core/utils dependencies for independent operation
  */

/**
 * Combines CSS class names, filtering out falsy values
 * Replaces the `cn` utility from @cvplus/core/utils
  */
export function cn(...classes: (string | undefined | null | boolean | number)[]): string {
  return classes
    .filter((cls): cls is string => Boolean(cls) && typeof cls === 'string')
    .join(' ')
    .trim();
}

/**
 * Safely get nested object property
  */
export function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Format file size in human readable format
  */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function calls
  */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Generate unique ID
  */
export function generateId(prefix = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Capitalize first letter of a string
  */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string with ellipsis
  */
export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length) + '...';
}

/**
 * Check if value is an object
 * Replaces error-handling utility from @cvplus/core
  */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Safely stringify object for logging
  */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Unable to stringify: ${error}]`;
  }
}

/**
 * Safe error message extraction
  */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}