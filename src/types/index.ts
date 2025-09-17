/**
 * CVPlus Types Index
 * 
 * Central export file for all TypeScript type definitions.
 * Provides a single import point for components and services.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export * from './cv';
export * from './cvData';
export * from './firebase-types';
export * from './error-handling';
export * from './utility-types';

// ============================================================================
// FEATURE TYPES
// ============================================================================

export * from './cv-features';
export * from './service-types';
export * from './component-props';
export * from './cv-preview';

// ============================================================================
// DOMAIN-SPECIFIC TYPES
// ============================================================================

export * from './job';
export * from './ats';
export * from './language';
export * from './session';
export * from './results';
export * from './help';
export * from './placeholders';

// ============================================================================
// PORTAL SYSTEM TYPES
// ============================================================================

export * from './portal-types';
export * from './portal-backend-types';
export * from './portal-component-props';
export * from './portal-api-types';

// ============================================================================
// TYPE UTILITIES AND GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid portal configuration
 */
import { PortalConfig, DeploymentResult } from './portal-types';

export function isPortalConfig(value: unknown): value is PortalConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'visibility' in value &&
    'theme' in value &&
    'features' in value &&
    'metadata' in value &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).name === 'string' &&
    ['public', 'private', 'unlisted'].includes((value as any).visibility)
  );
}

/**
 * Type guard to check if a value is a valid CV feature props
 */
import { CVFeatureProps, PortalEnabledCVFeatureProps } from './cv-features';

export function isCVFeatureProps(value: unknown): value is CVFeatureProps {
  return (
    typeof value === 'object' &&
    value !== null &&
    'jobId' in value &&
    'profileId' in value &&
    typeof (value as any).jobId === 'string' &&
    typeof (value as any).profileId === 'string'
  );
}

/**
 * Type guard to check if a value is a portal-enabled CV feature props
 */

export function isPortalEnabledCVFeatureProps(value: unknown): value is PortalEnabledCVFeatureProps {
  return (
    isCVFeatureProps(value) &&
    'portalIntegration' in value &&
    typeof (value as any).portalIntegration === 'object'
  );
}

/**
 * Type guard to check if a deployment result is successful
 */

export function isSuccessfulDeployment(result: DeploymentResult): boolean {
  return result.success && !!result.spaceUrl;
}

/**
 * Type guard to check if a service result is successful
 */
import { ServiceResult } from './service-types';

export function isSuccessfulServiceResult<T>(result: ServiceResult<T>): result is { success: true; data: T } {
  return result.success === true && 'data' in result;
}

/**
 * Type guard to check if a service result is an error
 */
import { AppError } from './error-handling';

export function isErrorServiceResult<T>(result: ServiceResult<T>): result is { success: false; error: AppError } {
  return result.success === false && 'error' in result;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a default portal configuration
 */
export function createDefaultPortalConfig(overrides: Partial<PortalConfig> = {}): PortalConfig {
  return {
    id: '',
    name: 'My Professional Portal',
    description: 'An interactive professional portfolio',
    visibility: 'public',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter, sans-serif',
      layout: 'modern',
      animations: true,
      darkMode: false,
    },
    features: {
      aiChat: true,
      qrCode: true,
      contactForm: true,
      calendar: false,
      portfolio: true,
      socialLinks: true,
      testimonials: false,
      analytics: true,
    },
    metadata: {
      title: 'Professional Portfolio',
      description: 'An interactive professional portfolio powered by CVPlus',
      keywords: ['portfolio', 'cv', 'resume', 'professional'],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates default CV feature props
 */
export function createDefaultCVFeatureProps(overrides: Partial<CVFeatureProps> = {}): CVFeatureProps {
  return {
    jobId: '',
    profileId: '',
    isEnabled: true,
    mode: 'public',
    ...overrides,
  };
}

/**
 * Validates portal configuration
 */
export function validatePortalConfig(config: Partial<PortalConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.id) {
    errors.push('Portal ID is required');
  }

  if (!config.name) {
    errors.push('Portal name is required');
  }

  if (config.visibility && !['public', 'private', 'unlisted'].includes(config.visibility)) {
    errors.push('Invalid visibility setting');
  }

  if (config.theme?.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(config.theme.primaryColor)) {
    errors.push('Invalid primary color format');
  }

  if (config.theme?.secondaryColor && !/^#[0-9A-Fa-f]{6}$/.test(config.theme.secondaryColor)) {
    errors.push('Invalid secondary color format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merges portal configurations with proper type safety
 */
export function mergePortalConfigs(base: PortalConfig, override: Partial<PortalConfig>): PortalConfig {
  return {
    ...base,
    ...override,
    theme: {
      ...base.theme,
      ...override.theme,
    },
    features: {
      ...base.features,
      ...override.features,
    },
    metadata: {
      ...base.metadata,
      ...override.metadata,
      keywords: [
        ...(base.metadata.keywords || []),
        ...(override.metadata?.keywords || []),
      ],
    },
    updatedAt: new Date(),
  };
}

// ============================================================================
// TYPE CONSTANTS
// ============================================================================

/**
 * Available portal themes
 */
export const PORTAL_THEMES = {
  MODERN: 'modern',
  CLASSIC: 'classic',
  MINIMAL: 'minimal',
  CREATIVE: 'creative',
} as const;

/**
 * Available portal visibility options
 */
export const PORTAL_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
} as const;

/**
 * Available deployment phases
 */
export const DEPLOYMENT_PHASES = {
  INITIALIZING: 'initializing',
  VALIDATING: 'validating',
  PREPARING: 'preparing',
  UPLOADING: 'uploading',
  BUILDING: 'building',
  DEPLOYING: 'deploying',
  TESTING: 'testing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * Available CV sections for embeddings
 */
export const CV_SECTIONS = {
  PERSONAL_INFO: 'personal_info',
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  ACHIEVEMENTS: 'achievements',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  LANGUAGES: 'languages',
  REFERENCES: 'references',
} as const;

/**
 * Available similarity algorithms
 */
export const SIMILARITY_ALGORITHMS = {
  COSINE: 'cosine',
  EUCLIDEAN: 'euclidean',
  DOT_PRODUCT: 'dot_product',
  MANHATTAN: 'manhattan',
} as const;

/**
 * Portal error codes
 */
export const PORTAL_ERROR_CODES = {
  PORTAL_CONFIG_INVALID: 'PORTAL_CONFIG_INVALID',
  DEPLOYMENT_FAILED: 'DEPLOYMENT_FAILED',
  HUGGINGFACE_API_ERROR: 'HUGGINGFACE_API_ERROR',
  VECTOR_SEARCH_ERROR: 'VECTOR_SEARCH_ERROR',
  CHAT_SERVICE_ERROR: 'CHAT_SERVICE_ERROR',
  QR_GENERATION_ERROR: 'QR_GENERATION_ERROR',
  SECTION_RENDER_ERROR: 'SECTION_RENDER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;