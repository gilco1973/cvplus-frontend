// @ts-ignore
/**
 * CVProcessingService Types (T071)
 *
 * Comprehensive type definitions for the enhanced CV Processing Service.
 * Provides type safety for all service operations and data structures.
 *
 * @version 1.0.0 - T071 Implementation
 * @author Gil Klainert
  */

// Core processing types
export interface CVProcessingServiceConfig {
  maxUploadSize?: number;
  maxConcurrentUploads?: number;
  cacheTTL?: number;
  maxRetries?: number;
  initialRetryDelay?: number;
  maxRetryDelay?: number;
  rateLimitWindow?: number;
  rateLimitMaxRequests?: number;
  enableRealTimeUpdates?: boolean;
  enableCaching?: boolean;
  enableQueueing?: boolean;
  backendBaseUrl?: string;
}

export interface ServiceHealthStatus {
  healthy: boolean;
  uptime: number;
  lastError?: string;
  lastErrorTime?: Date;
  activeConnections: number;
  queueLength: number;
  cacheSize: number;
  errorRate: number;
}

export interface ProcessingCapabilities {
  analysis: AnalysisCapabilities;
  enhancement: EnhancementCapabilities;
  templates: TemplateCapabilities;
  exports: ExportCapabilities;
  multimedia: MultimediaCapabilities;
}

export interface AnalysisCapabilities {
  atsOptimization: boolean;
  skillsExtraction: boolean;
  personalityInsights: boolean;
  competitiveAnalysis: boolean;
  industryAlignment: boolean;
  gapAnalysis: boolean;
}

export interface EnhancementCapabilities {
  contentOptimization: boolean;
  languageImprovement: boolean;
  structureEnhancement: boolean;
  keywordOptimization: boolean;
  quantificationSuggestions: boolean;
}

export interface TemplateCapabilities {
  categories: TemplateCategory[];
  customization: boolean;
  branding: boolean;
  responsiveDesign: boolean;
  printOptimization: boolean;
}

export interface ExportCapabilities {
  formats: ExportFormat[];
  batchExport: boolean;
  customSizing: boolean;
  watermarking: boolean;
  passwordProtection: boolean;
}

export interface MultimediaCapabilities {
  podcast: boolean;
  video: boolean;
  portfolio: boolean;
  interactiveElements: boolean;
  socialMediaFormats: boolean;
}

// Event system types
export interface ProcessingEvent {
  type: ProcessingEventType;
  jobId: string;
  timestamp: Date;
  data: any;
  source: 'frontend' | 'backend' | 'system';
}

export enum ProcessingEventType {
  JOB_CREATED = 'job_created',
  UPLOAD_STARTED = 'upload_started',
  UPLOAD_PROGRESS = 'upload_progress',
  UPLOAD_COMPLETED = 'upload_completed',
  PROCESSING_STARTED = 'processing_started',
  PROCESSING_PROGRESS = 'processing_progress',
  STAGE_COMPLETED = 'stage_completed',
  PROCESSING_COMPLETED = 'processing_completed',
  JOB_FAILED = 'job_failed',
  JOB_CANCELLED = 'job_cancelled',
  RESULTS_AVAILABLE = 'results_available',
  EXPORT_STARTED = 'export_started',
  EXPORT_COMPLETED = 'export_completed',
  TEMPLATE_APPLIED = 'template_applied',
  REAL_TIME_CONNECTED = 'real_time_connected',
  REAL_TIME_DISCONNECTED = 'real_time_disconnected',
  CACHE_HIT = 'cache_hit',
  CACHE_MISS = 'cache_miss',
  RETRY_ATTEMPTED = 'retry_attempted',
  RATE_LIMITED = 'rate_limited'
}

export type ProcessingEventHandler = (event: ProcessingEvent) => void;

// Error handling types
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  jobId?: string;
  recoverable: boolean;
  retryCount?: number;
}

export enum ServiceErrorCode {
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  INVALID_STATE = 'INVALID_STATE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

// Performance monitoring types
export interface PerformanceMetrics {
  uploadSpeed: number; // bytes per second
  processingTime: number; // milliseconds
  cacheHitRate: number; // percentage
  errorRate: number; // percentage
  averageQueueTime: number; // milliseconds
  throughput: number; // jobs per minute
  memoryUsage: number; // bytes
  activeConnections: number;
}

export interface ServiceBenchmark {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  metadata?: any;
}

// Queue management types
export interface QueueConfiguration {
  maxSize: number;
  priorityLevels: number;
  batchSize: number;
  processingInterval: number;
  retryStrategy: RetryStrategy;
  deadLetterQueue: boolean;
}

export interface RetryStrategy {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitterEnabled: boolean;
}

export interface QueueStatus {
  length: number;
  processing: number;
  failed: number;
  completed: number;
  averageWaitTime: number;
  estimatedWaitTime: number;
  throughput: number;
}

// Cache management types
export interface CacheConfiguration {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: CacheStrategy;
  compression: boolean;
  encryption: boolean;
}

export enum CacheStrategy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl'
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
  evictions: number;
  memoryUsage: number;
}

// Real-time updates types
export interface RealtimeConnection {
  jobId: string;
  eventSource: EventSource;
  connected: boolean;
  lastHeartbeat: Date;
  reconnectCount: number;
  subscriptions: RealtimeSubscription[];
}

export interface RealtimeSubscription {
  eventType: ProcessingEventType;
  handler: ProcessingEventHandler;
  active: boolean;
  created: Date;
}

export interface RealtimeConfiguration {
  enabled: boolean;
  heartbeatInterval: number;
  reconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
  bufferSize: number;
}

// Analytics and reporting types
export interface ProcessingAnalytics {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
  averageUploadTime: number;
  popularFeatures: FeatureUsage[];
  errorBreakdown: ErrorBreakdown[];
  peakUsageTimes: UsagePeak[];
  userMetrics: UserMetrics;
}

export interface FeatureUsage {
  feature: ProcessingFeature;
  count: number;
  percentage: number;
  averageProcessingTime: number;
}

export interface ErrorBreakdown {
  errorCode: ServiceErrorCode;
  count: number;
  percentage: number;
  lastOccurrence: Date;
}

export interface UsagePeak {
  timestamp: Date;
  jobsPerHour: number;
  activeUsers: number;
}

export interface UserMetrics {
  totalActiveUsers: number;
  newUsers: number;
  returningUsers: number;
  averageJobsPerUser: number;
  userRetentionRate: number;
}

// Integration types
export interface IntegrationEndpoint {
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Record<string, string>;
  timeout: number;
  retries: number;
  authentication: IntegrationAuth;
}

export interface IntegrationAuth {
  type: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth';
  credentials: any;
}

export interface WebhookConfiguration {
  enabled: boolean;
  url: string;
  events: ProcessingEventType[];
  authentication: IntegrationAuth;
  retries: number;
  timeout: number;
}

// Service lifecycle types
export interface ServiceLifecycle {
  initialized: boolean;
  starting: boolean;
  running: boolean;
  stopping: boolean;
  stopped: boolean;
  error: boolean;
  lastStateChange: Date;
}

export interface ServiceDependency {
  name: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unavailable';
  lastCheck: Date;
  endpoint?: string;
}

// Export all types
export * from './upload';
export * from './analysis';
export * from './job';