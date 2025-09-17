/**
 * CVPlus Portal Backend Integration Types
 * 
 * TypeScript interfaces for backend service integration including
 * HuggingFace API, Vector Database, Validation, and Resilience services.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { PortalError, PortalErrorCode, RAGEmbedding, CVSection, PortalConfig } from './portal-types';
import { ServiceResult } from './service-types';

// ============================================================================
// HUGGINGFACE API SERVICE TYPES
// ============================================================================

/**
 * HuggingFace Space creation request
 */
export interface SpaceCreationRequest {
  /** Space name (unique) */
  name: string;
  /** Space visibility */
  visibility: 'public' | 'private';
  /** Space SDK framework */
  sdk: 'gradio' | 'streamlit' | 'docker' | 'static';
  /** Hardware allocation */
  hardware?: 'cpu-basic' | 'cpu-upgrade' | 'gpu-basic' | 'gpu-upgrade';
  /** Space description */
  description?: string;
  /** License type */
  license?: string;
  /** Tags for discovery */
  tags?: string[];
  /** Environment variables */
  environmentVariables?: Record<string, string>;
}

/**
 * HuggingFace Space file upload
 */
export interface SpaceFile {
  /** File path within space */
  path: string;
  /** File content */
  content: string | Buffer;
  /** Content encoding */
  encoding?: 'utf-8' | 'base64' | 'binary';
  /** File MIME type */
  mimeType?: string;
  /** File size in bytes */
  size?: number;
}

/**
 * HuggingFace API response for space operations
 */
export interface HuggingFaceApiResponse<T = any> {
  /** Operation success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error information */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  /** Response metadata */
  metadata?: {
    requestId?: string;
    timestamp?: string;
    rateLimit?: {
      remaining: number;
      resetTime: string;
    };
  };
}

/**
 * Space deployment status
 */
export interface SpaceDeploymentStatus {
  /** Current deployment state */
  status: 'building' | 'running' | 'stopped' | 'error' | 'sleeping';
  /** Public space URL */
  url?: string;
  /** Space ID */
  spaceId: string;
  /** Last updated timestamp */
  lastUpdated: Date;
  /** Build logs */
  buildLogs?: string[];
  /** Runtime information */
  runtime?: {
    /** Current hardware tier */
    hardware: string;
    /** CPU usage percentage */
    cpuUsage?: number;
    /** Memory usage in MB */
    memoryUsage?: number;
    /** Disk usage in MB */
    diskUsage?: number;
  };
  /** Error details (if status is error) */
  error?: {
    code: string;
    message: string;
    timestamp: Date;
    buildLog?: string;
  };
}

/**
 * Batch upload progress
 */
export interface BatchUploadProgress {
  /** Total files to upload */
  totalFiles: number;
  /** Files uploaded successfully */
  uploadedFiles: number;
  /** Files that failed to upload */
  failedFiles: number;
  /** Current upload progress (0-100) */
  progress: number;
  /** Current file being uploaded */
  currentFile?: string;
  /** Upload speed in KB/s */
  uploadSpeed?: number;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
}

// ============================================================================
// VALIDATION SERVICE TYPES
// ============================================================================

/**
 * Validation service request
 */
export interface ValidationRequest {
  /** Data to validate */
  data: any;
  /** Validation rules to apply */
  rules: ValidationRule[];
  /** Validation options */
  options?: ValidationOptions;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  /** Field path to validate */
  field: string;
  /** Validation type */
  type: ValidationType;
  /** Rule parameters */
  params?: Record<string, any>;
  /** Custom error message */
  message?: string;
  /** Validation severity */
  severity: 'error' | 'warning' | 'info';
  /** Skip validation condition */
  skipIf?: string;
}

/**
 * Validation types
 */
export type ValidationType = 
  | 'required'
  | 'string'
  | 'number'
  | 'email'
  | 'url'
  | 'phone'
  | 'date'
  | 'array'
  | 'object'
  | 'enum'
  | 'pattern'
  | 'length'
  | 'range'
  | 'custom';

/**
 * Validation options
 */
export interface ValidationOptions {
  /** Allow HTML content */
  allowHtml?: boolean;
  /** Enable strict mode */
  strictMode?: boolean;
  /** Maximum field lengths */
  maxLength?: Record<string, number>;
  /** Required fields list */
  requiredFields?: string[];
  /** Custom validation functions */
  customValidators?: Record<string, (value: any, params?: any) => boolean>;
  /** Sanitization options */
  sanitization?: {
    /** Remove HTML tags */
    removeHtml?: boolean;
    /** Trim whitespace */
    trimWhitespace?: boolean;
    /** Convert to lowercase */
    toLowerCase?: boolean;
    /** Remove special characters */
    removeSpecialChars?: boolean;
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Overall validation status */
  isValid: boolean;
  /** Validation errors */
  errors: ValidationError[];
  /** Validation warnings */
  warnings: ValidationWarning[];
  /** Sanitized/cleaned data */
  sanitizedData?: any;
  /** Validation metadata */
  metadata?: {
    /** Validation duration in ms */
    duration: number;
    /** Rules applied count */
    rulesApplied: number;
    /** Fields validated count */
    fieldsValidated: number;
  };
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning';
  /** Validation rule that failed */
  rule: string;
  /** Current field value */
  value?: any;
  /** Expected value/format */
  expected?: any;
}

/**
 * Validation warning
 */
export interface ValidationWarning extends Omit<ValidationError, 'severity'> {
  /** Warning severity */
  severity: 'warning' | 'info';
  /** Suggested correction */
  suggestion?: string;
}

// ============================================================================
// VECTOR DATABASE SERVICE TYPES
// ============================================================================

/**
 * Vector input for database storage
 */
export interface VectorInput {
  /** Unique vector ID */
  id?: string;
  /** Original content text */
  content: string;
  /** Vector embedding array */
  vector: number[];
  /** Vector metadata */
  metadata: VectorMetadata;
  /** Content hash for deduplication */
  contentHash?: string;
}

/**
 * Vector metadata
 */
export interface VectorMetadata {
  /** CV section this vector belongs to */
  section: CVSection;
  /** Content type classification */
  contentType: 'text' | 'title' | 'summary' | 'achievement' | 'skill' | 'description';
  /** Content importance score (0-1) */
  importance: number;
  /** Content language code */
  language?: string;
  /** Source document information */
  source?: {
    /** Document ID */
    documentId: string;
    /** Page/section number */
    page?: number;
    /** Character offset */
    offset?: number;
  };
  /** Creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Custom metadata fields */
  custom?: Record<string, any>;
}

/**
 * Vector search options
 */
export interface VectorSearchOptions {
  /** Similarity algorithm */
  algorithm: SimilarityAlgorithm;
  /** Number of results to return */
  topK: number;
  /** Minimum similarity threshold */
  threshold: number;
  /** Metadata filters */
  filters?: SearchFilters;
  /** Include metadata in results */
  includeMetadata: boolean;
  /** Use result caching */
  useCache: boolean;
  /** Enable search explanation */
  explain?: boolean;
  /** Hybrid search configuration */
  hybridSearch?: {
    /** Enable keyword search */
    enableKeyword: boolean;
    /** Keyword weight (0-1) */
    keywordWeight: number;
    /** Vector weight (0-1) */
    vectorWeight: number;
  };
}

/**
 * Similarity algorithms
 */
export type SimilarityAlgorithm = 'cosine' | 'euclidean' | 'dot_product' | 'manhattan';

/**
 * Search filters
 */
export interface SearchFilters {
  /** Filter by CV sections */
  sections?: CVSection[];
  /** Filter by content types */
  contentTypes?: string[];
  /** Filter by importance range */
  importance?: {
    min: number;
    max: number;
  };
  /** Filter by date range */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** Filter by language */
  language?: string;
  /** Custom metadata filters */
  custom?: Record<string, any>;
}

/**
 * Vector search result
 */
export interface VectorSearchResult {
  /** Matching vector ID */
  id: string;
  /** Original content */
  content: string;
  /** Similarity score */
  score: number;
  /** Vector metadata */
  metadata: VectorMetadata;
  /** Search explanation (if requested) */
  explanation?: SearchExplanation;
}

/**
 * Search explanation
 */
export interface SearchExplanation {
  /** Query vector norm */
  queryNorm: number;
  /** Result vector norm */
  resultNorm: number;
  /** Dot product value */
  dotProduct: number;
  /** Distance calculation */
  distance: number;
  /** Filter matches */
  filterMatches: Record<string, boolean>;
}

/**
 * Vector database operations result
 */
export interface VectorOperationResult {
  /** Operation success status */
  success: boolean;
  /** Number of vectors processed */
  vectorsProcessed: number;
  /** Processing duration in ms */
  duration: number;
  /** Operation metadata */
  metadata?: {
    /** Database size after operation */
    totalVectors?: number;
    /** Index rebuild required */
    indexRebuildRequired?: boolean;
    /** Cache invalidated */
    cacheInvalidated?: boolean;
  };
  /** Operation errors */
  errors?: Array<{
    vectorId: string;
    error: string;
  }>;
}

// ============================================================================
// RESILIENCE SERVICE TYPES
// ============================================================================

/**
 * Resilience configuration
 */
export interface ResilienceConfig {
  /** Retry configuration */
  retry: RetryConfig;
  /** Circuit breaker configuration */
  circuitBreaker: CircuitBreakerConfig;
  /** Rate limiting configuration */
  rateLimit: RateLimitConfig;
  /** Timeout configuration */
  timeout: TimeoutConfig;
  /** Fallback configuration */
  fallback: FallbackConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Base delay between retries (ms) */
  baseDelayMs: number;
  /** Maximum delay between retries (ms) */
  maxDelayMs: number;
  /** Backoff multiplier */
  backoffMultiplier: number;
  /** Jitter enabled */
  jitterEnabled: boolean;
  /** Retryable error codes */
  retryableErrors: string[];
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Failure threshold before opening */
  failureThreshold: number;
  /** Recovery timeout (ms) */
  recoveryTimeoutMs: number;
  /** Request volume threshold */
  requestVolumeThreshold: number;
  /** Error percentage threshold */
  errorPercentageThreshold: number;
  /** Half-open request count */
  halfOpenMaxCalls: number;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Requests per second */
  requestsPerSecond: number;
  /** Burst capacity */
  burstCapacity: number;
  /** Rate limit window (ms) */
  windowMs: number;
  /** Skip rate limiting for certain operations */
  skipList: string[];
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  /** Default operation timeout (ms) */
  defaultTimeoutMs: number;
  /** Operation-specific timeouts */
  operationTimeouts: Record<string, number>;
  /** Enable timeout warnings */
  enableWarnings: boolean;
  /** Warning threshold percentage */
  warningThresholdPercent: number;
}

/**
 * Fallback configuration
 */
export interface FallbackConfig {
  /** Enable fallback mechanisms */
  enabled: boolean;
  /** Fallback strategies */
  strategies: FallbackStrategy[];
  /** Fallback data sources */
  dataSources: FallbackDataSource[];
}

/**
 * Fallback strategy
 */
export interface FallbackStrategy {
  /** Strategy name */
  name: string;
  /** Strategy type */
  type: 'cache' | 'default_data' | 'alternative_service' | 'graceful_degradation';
  /** Strategy configuration */
  config: Record<string, any>;
  /** Strategy priority */
  priority: number;
}

/**
 * Fallback data source
 */
export interface FallbackDataSource {
  /** Data source name */
  name: string;
  /** Data source type */
  type: 'static' | 'cache' | 'database' | 'api';
  /** Data source endpoint/location */
  endpoint: string;
  /** Data source configuration */
  config: Record<string, any>;
}

/**
 * Resilience metrics
 */
export interface ResilienceMetrics {
  /** Total requests processed */
  totalRequests: number;
  /** Successful requests */
  successfulRequests: number;
  /** Failed requests */
  failedRequests: number;
  /** Retry attempts */
  retryAttempts: number;
  /** Circuit breaker trips */
  circuitBreakerTrips: number;
  /** Rate limit hits */
  rateLimitHits: number;
  /** Timeout occurrences */
  timeouts: number;
  /** Fallback activations */
  fallbackActivations: number;
  /** Average response time (ms) */
  avgResponseTime: number;
  /** P95 response time (ms) */
  p95ResponseTime: number;
  /** P99 response time (ms) */
  p99ResponseTime: number;
}

// ============================================================================
// PORTAL INTEGRATION SERVICE TYPES
// ============================================================================

/**
 * Portal generation request
 */
export interface PortalGenerationRequest {
  /** User CV data */
  cvData: any;
  /** Portal configuration */
  portalConfig: PortalConfig;
  /** Generation options */
  options: PortalGenerationOptions;
}

/**
 * Portal generation options
 */
export interface PortalGenerationOptions {
  /** Target environment */
  environment: 'development' | 'staging' | 'production';
  /** Enable optimizations */
  optimize: boolean;
  /** Include analytics */
  includeAnalytics: boolean;
  /** Generate embeddings for RAG */
  generateEmbeddings: boolean;
  /** Custom templates */
  customTemplates?: Record<string, string>;
  /** Asset optimization */
  assetOptimization?: {
    /** Compress images */
    compressImages: boolean;
    /** Minify CSS/JS */
    minifyAssets: boolean;
    /** Generate progressive images */
    progressiveImages: boolean;
  };
}

/**
 * Portal generation result
 */
export interface PortalGenerationResult {
  /** Generation success status */
  success: boolean;
  /** Generated portal files */
  files: PortalFile[];
  /** Portal metadata */
  metadata: PortalGenerationMetadata;
  /** Generation warnings */
  warnings: string[];
  /** Generation errors */
  errors: PortalError[];
}

/**
 * Portal file
 */
export interface PortalFile {
  /** File path */
  path: string;
  /** File content */
  content: string | Buffer;
  /** File type */
  type: 'html' | 'css' | 'js' | 'json' | 'image' | 'asset';
  /** File size in bytes */
  size: number;
  /** Content hash */
  hash: string;
  /** File metadata */
  metadata?: Record<string, any>;
}

/**
 * Portal generation metadata
 */
export interface PortalGenerationMetadata {
  /** Generation timestamp */
  generatedAt: Date;
  /** Generation duration (ms) */
  duration: number;
  /** Total files generated */
  totalFiles: number;
  /** Total size in bytes */
  totalSize: number;
  /** Assets included */
  assetsIncluded: string[];
  /** Features enabled */
  featuresEnabled: string[];
  /** Optimization applied */
  optimizationsApplied: string[];
}

// ============================================================================
// SERVICE UTILITY TYPES
// ============================================================================

/**
 * Backend service response wrapper
 */
export type BackendServiceResult<T> = ServiceResult<T, PortalError>;

/**
 * Async operation with progress tracking
 */
export interface AsyncOperation<T> {
  /** Operation ID */
  id: string;
  /** Operation status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** Current progress (0-100) */
  progress: number;
  /** Operation result (when completed) */
  result?: T;
  /** Operation error (when failed) */
  error?: PortalError;
  /** Operation start time */
  startedAt: Date;
  /** Operation completion time */
  completedAt?: Date;
  /** Progress updates */
  progressUpdates: ProgressUpdate[];
}

/**
 * Progress update
 */
export interface ProgressUpdate {
  /** Update timestamp */
  timestamp: Date;
  /** Progress percentage */
  progress: number;
  /** Current operation stage */
  stage: string;
  /** Progress message */
  message: string;
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Service health check result
 */
export interface ServiceHealthCheck {
  /** Service name */
  service: string;
  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Response time (ms) */
  responseTime: number;
  /** Last check timestamp */
  lastCheck: Date;
  /** Health details */
  details?: {
    /** Service version */
    version?: string;
    /** Database connectivity */
    database?: boolean;
    /** External dependencies */
    dependencies?: Record<string, boolean>;
    /** Resource usage */
    resources?: {
      cpu: number;
      memory: number;
      disk: number;
    };
  };
}

// Portal types imported at the top of the file