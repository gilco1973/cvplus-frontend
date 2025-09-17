// Utility Types for CVPlus TypeScript Enhancement
// Advanced type utilities for better type safety

// Deep readonly utility
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Deep partial utility
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Extract keys by value type
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Non-nullable utility
export type NonNullable<T> = T extends null | undefined ? never : T;

// Optional properties utility
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required properties utility  
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Flatten array type
export type Flatten<T> = T extends Array<infer U> ? U : T;

// Return type extraction
export type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;

// Promise resolution type
export type PromiseType<T> = T extends Promise<infer U> ? U : T;

// Function argument types
export type ArgumentTypes<T> = T extends (...args: infer A) => any ? A : never;

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B };

// Common branded types for CVPlus
export type UserId = Brand<string, 'UserId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type FeatureId = Brand<string, 'FeatureId'>;
export type CVDataId = Brand<string, 'CVDataId'>;

// Type guard for branded types
export function isUserId(value: string): value is UserId {
  return typeof value === 'string' && value.length > 0;
}

export function isSessionId(value: string): value is SessionId {
  return typeof value === 'string' && value.length > 0;
}

export function isFeatureId(value: string): value is FeatureId {
  return typeof value === 'string' && value.length > 0;
}

// Strict object type checking
export type StrictRecord<K extends keyof any, T> = Record<K, T>;

// Union to intersection type
export type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// Object with required keys
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Object without specific keys
export type Without<T, K extends keyof T> = Omit<T, K>;

// Conditional type for arrays
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Safe property access type
export type SafeAccess<T, K extends keyof T> = T[K] extends infer U ? U : never;

// Type for handling unknown values safely
export type SafeUnknown<T> = T extends unknown ? (T extends object ? T : never) : never;

// Conditional type for optional chaining
export type Nullable<T> = T | undefined;

// Type for ensuring non-empty objects
export type NonEmptyObject<T> = keyof T extends never ? never : T;

// Utility for creating type-safe event handlers
export type EventHandler<T = unknown> = (event: T) => void;

// Utility for API endpoint types
export type ApiEndpoint<TRequest = unknown, TResponse = unknown> = {
  request: TRequest;
  response: TResponse;
};

// Utility for validation results
export type ValidationResult<T> = {
  valid: true;
  data: T;
} | {
  valid: false;
  errors: string[];
};

// Type-safe configuration object
export type Config<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: T[K];
};

// Utility for handling async operations
export type AsyncResult<T, E = Error> = Promise<{
  success: true;
  data: T;
} | {
  success: false;
  error: E;
}>;

// Type for React component props with ref
export type ComponentPropsWithRef<T extends React.ElementType> = 
  React.ComponentPropsWithRef<T>;

// Type for extracting props from React components
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// Utility for creating discriminated unions
export type DiscriminatedUnion<T, K extends keyof T> = T extends Record<K, infer D> 
  ? T & Record<K, D>
  : never;

// Type for ensuring string literals
export type StringLiteral<T> = T extends string 
  ? string extends T 
    ? never 
    : T 
  : never;

// Utility for numeric constraints
export type PositiveNumber = number & { __brand: 'positive' };
export type NonNegativeNumber = number & { __brand: 'nonNegative' };

export function isPositiveNumber(value: number): value is PositiveNumber {
  return value > 0;
}

export function isNonNegativeNumber(value: number): value is NonNegativeNumber {
  return value >= 0;
}

// Type for handling Firebase timestamps
export type FirebaseTimestamp = {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
};

export function isFirebaseTimestamp(value: unknown): value is FirebaseTimestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value &&
    'toDate' in value &&
    typeof (value as any).toDate === 'function'
  );
}

// Type for handling form data
export type FormData<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends string | number | boolean 
    ? string 
    : T[K] extends Array<infer U>
    ? U extends string | number | boolean 
      ? string[]
      : never
    : never;
};

// Type for API error responses
export type ApiErrorResponse = {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  success: false;
};

// Type for successful API responses
export type ApiSuccessResponse<T> = {
  data: T;
  success: true;
  message?: string;
};

// Combined API response type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;