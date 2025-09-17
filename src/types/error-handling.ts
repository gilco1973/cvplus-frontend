// Core Error Handling Types for CVPlus
// This file provides comprehensive error interfaces and type guards

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface ApiError extends AppError {
  endpoint?: string;
  method?: string;
  timestamp?: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface FirebaseError extends AppError {
  authDomain?: string;
  errorInfo?: {
    code: string;
    message: string;
  };
}

// Type guard for Error objects
export function isError(value: unknown): value is Error {
  return value instanceof Error || 
         (typeof value === 'object' && 
          value !== null && 
          'message' in value &&
          typeof (value as any).message === 'string');
}

// Type guard for objects with specific properties
export function hasProperty<T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return typeof obj === 'object' && obj !== null && prop in obj;
}

// Type guard for arrays
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

// Type guard for strings
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Type guard for numbers
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Type guard for objects
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Safe error message extraction
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  if (isObject(error) && hasProperty(error, 'message') && isString(error.message)) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// Safe error code extraction
export function getErrorCode(error: unknown): string | undefined {
  if (isError(error) && hasProperty(error, 'code') && isString(error.code)) {
    return error.code;
  }
  if (isObject(error) && hasProperty(error, 'code') && isString(error.code)) {
    return error.code;
  }
  return undefined;
}

// Create standardized error object
export function createAppError(
  message: string,
  code?: string,
  details?: Record<string, unknown>
): AppError {
  return {
    message,
    code,
    details
  };
}

// Handle unknown errors safely
export function handleUnknownError(error: unknown): AppError {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  
  return createAppError(message, code, {
    originalError: error
  });
}