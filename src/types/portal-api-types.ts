/**
 * CVPlus Portal API Client Types
 * 
 * TypeScript interfaces for API communication with portal backend services.
 * Includes request/response types for all portal endpoints.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import {
  PortalConfig,
  DeploymentStatus,
  ChatMessage,
  QRCodeData,
  PortalError,
  RAGEmbedding,
  VectorSearchOptions,
  PortalSection,
} from './portal-types';
import { ApiResponse, ServiceResult } from './service-types';

// ============================================================================
// API CLIENT CONFIGURATION
// ============================================================================

/**
 * Portal API client configuration
 */
export interface PortalApiClientConfig {
  /** Base API URL */
  baseUrl: string;
  /** API version */
  version: string;
  /** Authentication token */
  authToken?: string;
  /** Request timeout (ms) */
  timeout: number;
  /** Retry configuration */
  retry: {
    attempts: number;
    delay: number;
    backoff: number;
  };
  /** Request headers */
  headers: Record<string, string>;
  /** Enable request/response logging */
  logging: boolean;
}

/**
 * API request context
 */
export interface ApiRequestContext {
  /** Request ID for tracking */
  requestId: string;
  /** User ID */
  userId?: string;
  /** Session ID */
  sessionId?: string;
  /** Request timestamp */
  timestamp: Date;
  /** Request metadata */
  metadata?: Record<string, any>;
}

// ============================================================================
// PORTAL DEPLOYMENT API
// ============================================================================

/**
 * Deploy portal request
 */
export interface DeployPortalRequest {
  /** Portal configuration */
  portalConfig: PortalConfig;
  /** CV data to include */
  cvData: any;
  /** Deployment options */
  deploymentOptions: {
    /** Target environment */
    environment: 'development' | 'staging' | 'production';
    /** HuggingFace space configuration */
    spaceConfig: {
      name: string;
      visibility: 'public' | 'private';
      hardware: 'cpu-basic' | 'cpu-upgrade' | 'gpu-basic' | 'gpu-upgrade';
      description?: string;
    };
    /** Optimization settings */
    optimization: {
      minifyAssets: boolean;
      compressImages: boolean;
      generateSitemap: boolean;
    };
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Deploy portal response
 */
export interface DeployPortalResponse extends ApiResponse<{
  /** Deployment ID */
  deploymentId: string;
  /** Initial deployment status */
  status: DeploymentStatus;
  /** Estimated deployment time */
  estimatedDuration: number;
  /** Webhook URL for status updates */
  statusWebhookUrl?: string;
>

/**
 * Get deployment status request
 */
export interface GetDeploymentStatusRequest {
  /** Deployment ID */
  deploymentId: string;
  /** Include build logs */
  includeLogs?: boolean;
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Get deployment status response
 */
export type GetDeploymentStatusResponse = ApiResponse<DeploymentStatus>;

/**
 * Cancel deployment request
 */
export interface CancelDeploymentRequest {
  /** Deployment ID */
  deploymentId: string;
  /** Cancellation reason */
  reason?: string;
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Cancel deployment response
 */
export interface CancelDeploymentResponse extends ApiResponse<{
  /** Cancellation success */
  cancelled: boolean;
  /** Cancellation timestamp */
  cancelledAt: Date;
>

// ============================================================================
// CHAT API
// ============================================================================

/**
 * Send chat message request
 */
export interface SendChatMessageRequest {
  /** Portal ID */
  portalId: string;
  /** Chat message */
  message: string;
  /** Conversation ID */
  conversationId?: string;
  /** Message context */
  context?: {
    /** Previous messages */
    history?: ChatMessage[];
    /** User preferences */
    preferences?: Record<string, any>;
    /** Session metadata */
    sessionMetadata?: Record<string, any>;
  };
  /** RAG configuration */
  ragConfig?: {
    /** Enable RAG */
    enabled: boolean;
    /** Maximum context length */
    maxContextLength?: number;
    /** Similarity threshold */
    similarityThreshold?: number;
  };
  /** Request context */
  requestContext: ApiRequestContext;
}

/**
 * Send chat message response
 */
export interface SendChatMessageResponse extends ApiResponse<{
  /** Response message */
  message: ChatMessage;
  /** Conversation ID */
  conversationId: string;
  /** Source documents (for RAG) */
  sourceDocuments?: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  /** Usage statistics */
  usage: {
    tokensUsed: number;
    processingTime: number;
    vectorSearchTime?: number;
  };
>

/**
 * Get chat history request
 */
export interface GetChatHistoryRequest {
  /** Portal ID */
  portalId: string;
  /** Conversation ID */
  conversationId: string;
  /** Pagination */
  pagination?: {
    limit?: number;
    offset?: number;
    cursor?: string;
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Get chat history response
 */
export interface GetChatHistoryResponse extends ApiResponse<{
  /** Chat messages */
  messages: ChatMessage[];
  /** Total message count */
  totalCount: number;
  /** Pagination info */
  pagination: {
    hasMore: boolean;
    nextCursor?: string;
  };
>

// ============================================================================
// VECTOR SEARCH API
// ============================================================================

/**
 * Search vectors request
 */
export interface SearchVectorsRequest {
  /** Portal ID */
  portalId: string;
  /** Search query */
  query: string;
  /** Search options */
  options: VectorSearchOptions;
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Search vectors response
 */
export interface SearchVectorsResponse extends ApiResponse<{
  /** Search results */
  results: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  /** Search metadata */
  searchMetadata: {
    totalSearched: number;
    searchTime: number;
    algorithm: string;
  };
>

/**
 * Create embeddings request
 */
export interface CreateEmbeddingsRequest {
  /** Portal ID */
  portalId: string;
  /** Content to embed */
  content: Array<{
    id: string;
    text: string;
    metadata: Record<string, any>;
  }>;
  /** Embedding options */
  options?: {
    /** Embedding model */
    model?: string;
    /** Chunk size */
    chunkSize?: number;
    /** Overlap size */
    overlap?: number;
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Create embeddings response
 */
export interface CreateEmbeddingsResponse extends ApiResponse<{
  /** Created embeddings */
  embeddings: RAGEmbedding[];
  /** Processing statistics */
  stats: {
    totalProcessed: number;
    processingTime: number;
    tokensUsed: number;
  };
>

// ============================================================================
// QR CODE API
// ============================================================================

/**
 * Generate QR code request
 */
export interface GenerateQRCodeRequest {
  /** Portal ID */
  portalId: string;
  /** Target URL */
  url: string;
  /** QR configuration */
  config: {
    size: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    colors: {
      foreground: string;
      background: string;
    };
    logo?: {
      url: string;
      size: number;
    };
  };
  /** Output format */
  format: 'png' | 'svg' | 'pdf' | 'jpeg';
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Generate QR code response
 */
export type GenerateQRCodeResponse = ApiResponse<QRCodeData>;

// ============================================================================
// PORTAL SECTIONS API
// ============================================================================

/**
 * Update portal sections request
 */
export interface UpdatePortalSectionsRequest {
  /** Portal ID */
  portalId: string;
  /** Updated sections */
  sections: PortalSection[];
  /** Update options */
  options?: {
    /** Validate sections */
    validate?: boolean;
    /** Regenerate embeddings */
    regenerateEmbeddings?: boolean;
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Update portal sections response
 */
export interface UpdatePortalSectionsResponse extends ApiResponse<{
  /** Updated sections */
  sections: PortalSection[];
  /** Update metadata */
  metadata: {
    updatedAt: Date;
    sectionsCount: number;
    validationErrors?: string[];
  };
>

/**
 * Get portal sections request
 */
export interface GetPortalSectionsRequest {
  /** Portal ID */
  portalId: string;
  /** Include content */
  includeContent?: boolean;
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Get portal sections response
 */
export interface GetPortalSectionsResponse extends ApiResponse<{
  /** Portal sections */
  sections: PortalSection[];
  /** Metadata */
  metadata: {
    totalSections: number;
    lastUpdated: Date;
  };
>

// ============================================================================
// VALIDATION API
// ============================================================================

/**
 * Validate portal config request
 */
export interface ValidatePortalConfigRequest {
  /** Portal configuration to validate */
  portalConfig: PortalConfig;
  /** Validation options */
  options?: {
    /** Strict validation */
    strict?: boolean;
    /** Check external resources */
    checkExternalResources?: boolean;
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Validate portal config response
 */
export interface ValidatePortalConfigResponse extends ApiResponse<{
  /** Validation result */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** Validation warnings */
  warnings: Array<{
    field: string;
    code: string;
    message: string;
    suggestion?: string;
  }>;
>

// ============================================================================
// ANALYTICS API
// ============================================================================

/**
 * Get portal analytics request
 */
export interface GetPortalAnalyticsRequest {
  /** Portal ID */
  portalId: string;
  /** Date range */
  dateRange: {
    from: Date;
    to: Date;
  };
  /** Metrics to include */
  metrics: Array<'views' | 'visitors' | 'chatMessages' | 'qrScans' | 'sections'>;
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Get portal analytics response
 */
export interface GetPortalAnalyticsResponse extends ApiResponse<{
  /** Analytics data */
  analytics: {
    /** Total views */
    views: number;
    /** Unique visitors */
    uniqueVisitors: number;
    /** Chat messages */
    chatMessages: number;
    /** QR code scans */
    qrScans: number;
    /** Section interactions */
    sectionInteractions: Record<string, number>;
    /** Traffic sources */
    trafficSources: Array<{
      source: string;
      visits: number;
    }>;
    /** Popular sections */
    popularSections: Array<{
      section: string;
      views: number;
    }>;
  };
  /** Date range */
  dateRange: {
    from: Date;
    to: Date;
  };
>

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * API error response
 */
export interface ApiErrorResponse {
  /** Error occurred */
  success: false;
  /** Error details */
  error: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Error details */
    details?: any;
    /** Request ID */
    requestId?: string;
    /** Timestamp */
    timestamp: Date;
  };
}

/**
 * Rate limit error
 */
export interface RateLimitError extends ApiErrorResponse {
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    details: {
      limit: number;
      remaining: number;
      resetTime: Date;
    };
    requestId?: string;
    timestamp: Date;
  };
}

/**
 * Validation error
 */
export interface ValidationError extends ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      value: any;
      constraint: string;
    }[];
    requestId?: string;
    timestamp: Date;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  data: T & {
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
      nextCursor?: string;
    };
  };
}

/**
 * Async operation response
 */
export interface AsyncOperationResponse extends ApiResponse<{
  /** Operation ID */
  operationId: string;
  /** Operation status */
  status: 'pending' | 'running' | 'completed' | 'failed';
  /** Status polling URL */
  statusUrl: string;
  /** Estimated completion time */
  estimatedCompletion?: Date;
>

/**
 * Batch operation request
 */
export interface BatchOperationRequest<T> {
  /** Batch operations */
  operations: Array<{
    id: string;
    operation: string;
    data: T;
  }>;
  /** Batch options */
  options?: {
    /** Stop on first error */
    stopOnError?: boolean;
    /** Parallel execution */
    parallel?: boolean;
    /** Maximum concurrent operations */
    maxConcurrency?: number;
  };
  /** Request context */
  context: ApiRequestContext;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse<T> extends ApiResponse<{
  /** Operation results */
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: PortalError;
  }>;
  /** Batch metadata */
  metadata: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    processingTime: number;
  };
>

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for API error response
 */
export function isApiErrorResponse(response: any): response is ApiErrorResponse {
  return response && response.success === false && response.error;
}

/**
 * Type guard for rate limit error
 */
export function isRateLimitError(response: any): response is RateLimitError {
  return isApiErrorResponse(response) && response.error.code === 'RATE_LIMIT_EXCEEDED';
}

/**
 * Type guard for validation error
 */
export function isValidationError(response: any): response is ValidationError {
  return isApiErrorResponse(response) && response.error.code === 'VALIDATION_ERROR';
}