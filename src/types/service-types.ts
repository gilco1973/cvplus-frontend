// Service Response Types for CVPlus
// Defines all service layer types and responses
// Extended with Portal System Integration

import { AppError } from './error-handling';
import { PortalConfig, DeploymentResult, HuggingFaceSpaceConfig } from './portal-types';

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
  timestamp?: string;
}

// Generic service result pattern
export type ServiceResult<T, E = AppError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// CV Service Types
export interface CVParseResult {
  parsedData: any;
  originalFormat: string;
  confidence: number;
  processingTime: number;
  sections: CVSection[];
}

export interface CVSection {
  type: string;
  content: any;
  confidence: number;
  suggestions?: string[];
}

export interface CVAnalysisResult {
  overall: {
    score: number;
  };
  sections: {
    [key: string]: any;
  };
  recommendations: string[];
  improvements: string[];
}

export interface CVEnhancementResult {
  enhancedData: any;
  improvementsMade: string[];
  confidence: number;
  processingSteps: string[];
}

// Feature Generation Results
export interface FeatureGenerationResult<T = unknown> {
  featureId: string;
  featureName: string;
  result: T;
  processingTime: number;
  quality: {
    score: number;
    factors: string[];
  };
  metadata?: Record<string, unknown>;
}

export interface ATSAnalysisResult {
  advancedScore: EnhancedATSResult;
  analysis: {
    overall: {
      score: number;
    };
    passes: string[];
    issues: string[];
    suggestions: string[];
    keywords: string[];
  };
  // Additional properties for compatibility
  recommendations?: string[];
  semanticAnalysis?: any;
  systemSimulations?: unknown[];
}

export interface EnhancedATSResult {
  // Core fields
  score: number;
  overall?: number; // Alias for score
  passes?: boolean;
  
  // Breakdown information
  breakdown?: {
    keywords: number;
    format: number;
    experience: number;
    skills: number;
  };
  
  // Issues and suggestions
  issues?: Array<{
    type: string;
    severity: 'warning' | 'error' | 'info';
    message: string;
    id?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    estimatedScoreImprovement?: number;
    title?: string;
    description?: string;
    section?: string;
    impact?: 'low' | 'medium' | 'high';
    actionRequired?: boolean;
    atsSystemsAffected?: string[];
  }>;
  suggestions?: Array<{
    section: string;
    original: string;
    suggested: string;
    reason: string;
    impact: 'low' | 'medium' | 'high';
    id?: string;
    priority?: 'low' | 'medium' | 'high';
    category?: string;
    estimatedScoreImprovement?: number;
    title?: string;
    description?: string;
    actionRequired?: boolean;
    atsSystemsAffected?: string[];
  }>;
  
  // Recommendations and checks
  recommendations?: string[] | Array<{
    id: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    estimatedScoreImprovement: number;
    title: string;
    description: string;
    section: string;
    impact: 'low' | 'medium' | 'high';
    actionRequired: boolean;
    atsSystemsAffected: string[];
  }>;
  passedChecks?: string[];
  failedChecks?: string[];
  
  // Keywords analysis
  keywords?: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
  
  // Advanced analysis
  semanticAnalysis?: any;
  systemSimulations?: unknown[];
  confidence?: number;
  optimizedContent?: unknown;
  
  // Advanced score for compatibility
  advancedScore?: {
    overall: number;
    breakdown: {
      keywords: number;
      format: number;
      experience: number;
      skills: number;
    };
    recommendations: string[] | Array<{
      id: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      category: string;
      estimatedScoreImprovement: number;
      section: string;
      impact: 'low' | 'medium' | 'high';
      actionRequired: boolean;
      atsSystemsAffected: string[];
    }>;
    confidence?: number;
    atsSystemScores?: number[];
    competitorBenchmark?: {
      averageIndustry?: number;
      industryAverage?: number; // Alias for backward compatibility
      percentileRank?: number;
      topPercentile?: number; // Alias for backward compatibility
      competingKeywords?: string[];
      gapAnalysis?: string[]; // Gap analysis keywords
    };
  };
}

export interface CalendarGenerationResult {
  events: CalendarEvent[];
  summary: {
    totalEvents: number;
    workAnniversaries: number;
    educationMilestones: number;
    certifications: number;
    reminders: number;
    eventsByType: Record<string, number>;
  };
  integration?: {
    connected: boolean;
    provider: string;
    status: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startDate: string; // Required field
  type: 'work' | 'education' | 'certification' | 'reminder';
  description?: string; // Optional
  location?: string;
  duration?: number;
  allDay?: boolean; // Required field
}

export interface VideoGenerationResult {
  video: {
    url: string;
    thumbnailUrl: string;
    duration: number;
    quality: string;
    format: string;
  };
  duration: string;
  style: string;
  transcript?: string;
  metadata: {
    processingTime: number;
    fileSize: number;
  };
}

export interface PodcastGenerationResult {
  podcast: {
    audioUrl: string;
    duration: number;
    format: string;
    quality: string;
    fileSize: number;
  };
  transcript?: string;
  chapters?: {
    title: string;
    startTime: number;
    duration: number;
  }[];
}

export interface PortfolioGenerationResult {
  portfolioData: PortfolioItem[];
  url: string;
  embedCode: string;
  analytics: {
    views: number;
    interactions: number;
  };
  gallery?: {
    items: PortfolioItem[];
    summary: {
      totalItems: number;
      categories: string[];
    };
  };
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  url?: string;
  featured: boolean;
}

export interface PublicProfileResult {
  slug: string;
  publicUrl: string;
  qrCodeUrl?: string;
  settings: {
    showContactForm: boolean;
    showCalendar: boolean;
    showChat: boolean;
    customBranding: boolean;
    analytics: boolean;
  };
  createdAt: Date;
  analytics: {
    views: number;
    uniqueVisitors: number;
  };
  /** Portal integration data */
  portalIntegration?: {
    /** Portal deployment status */
    deploymentStatus: 'not_deployed' | 'deploying' | 'deployed' | 'error';
    /** Portal URL (if deployed) */
    portalUrl?: string;
    /** Portal configuration */
    portalConfig?: PortalConfig;
    /** Last deployment date */
    lastDeployment?: Date;
  };
}

export interface LanguageVisualizationResult {
  visualizations: Array<{
    type: 'radar' | 'bar' | 'progress' | 'map';
    data: any;
    config: Record<string, any>;
  }>;
  proficiencyStats: {
    averageLevel: number;
    totalLanguages: number;
    nativeLanguages: number;
    professionalLanguages: number;
  };
  recommendations: string[];
  visualization?: {
    data: any;
    config: Record<string, any>;
  };
}

export interface TestimonialsResult {
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    date: Date;
    verified: boolean;
  }>;
  summary: {
    totalTestimonials: number;
    averageRating: number;
    verifiedCount: number;
  };
  displayOptions: {
    layout: 'carousel' | 'grid' | 'list';
    autoplay: boolean;
    showRatings: boolean;
  };
  carousel?: {
    testimonials: Array<{
      id: string;
      name: string;
      role: string;
      company: string;
      content: string;
      rating: number;
    }>;
    config: Record<string, any>;
  };
}

// Session Service Types
export interface SessionData {
  id: string;
  userId?: string;
  cvData?: any;
  progress?: SessionProgress;
  features?: FeatureStatus[];
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'completed' | 'error' | 'paused';
}

export interface SessionProgress {
  currentStep: number;
  totalSteps: number;
  completedFeatures: string[];
  failedFeatures: string[];
  processingTime: number;
  lastActivity: Date;
}

export interface FeatureStatus {
  featureId: string;
  featureName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
  processingTime?: number;
  attempts: number;
}

// Progress Monitoring Types
export interface ProgressUpdate {
  sessionId: string;
  featureId?: string;
  progress: number;
  status: string;
  message?: string;
  timestamp: Date;
}

export interface PerformanceMetrics {
  totalLines: number;
  complexity: number;
}

export interface ErrorMetrics {
  errorCount: number;
  warningCount: number;
}

// Enhancement Service Types
export interface EnhancementResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  improvements: string[];
  processingTime: number;
}

export interface ErrorRecoveryResult {
  recovered: boolean;
  strategy: string;
  attempts: number;
  finalResult?: any;
  errors: string[];
}

// Utility type for handling unknown service responses
export function isServiceResult<T>(value: unknown): value is ServiceResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as any).success === 'boolean'
  );
}

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as any).success === 'boolean'
  );
}

// Create success result
export function createSuccessResult<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

// Create error result  
export function createErrorResult<T>(error: AppError): ServiceResult<T> {
  return { success: false, error };
}

// ============================================================================
// PORTAL SERVICE RESULT TYPES
// ============================================================================

/**
 * Portal deployment service result
 */
export interface PortalDeploymentResult {
  /** Deployment success status */
  success: boolean;
  /** Deployed portal URL */
  portalUrl?: string;
  /** HuggingFace Space ID */
  spaceId?: string;
  /** Deployment configuration used */
  deploymentConfig: {
    portalConfig: PortalConfig;
    spaceConfig: HuggingFaceSpaceConfig;
    deploymentOptions: Record<string, any>;
  };
  /** Deployment metadata */
  metadata: {
    deploymentId: string;
    deployedAt: Date;
    duration: number;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  /** Deployment analytics */
  analytics?: {
    /** Total files deployed */
    filesDeployed: number;
    /** Total deployment size */
    deploymentSize: number;
    /** Build logs */
    buildLogs: string[];
  };
}

/**
 * Portal chat service result
 */
export interface PortalChatResult {
  /** Response message */
  message: string;
  /** Response metadata */
  metadata: {
    /** Response generation time */
    processingTime: number;
    /** Tokens used */
    tokensUsed: number;
    /** Confidence score */
    confidence: number;
    /** Model used */
    model: string;
  };
  /** Source documents (for RAG) */
  sourceDocuments?: Array<{
    id: string;
    content: string;
    section: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  /** Chat context */
  context?: {
    /** Conversation ID */
    conversationId: string;
    /** Message history length */
    historyLength: number;
    /** Context window used */
    contextWindowUsed: number;
  };
}

/**
 * Portal vector search result
 */
export interface PortalVectorSearchResult {
  /** Search results */
  results: Array<{
    id: string;
    content: string;
    score: number;
    metadata: Record<string, any>;
  }>;
  /** Search metadata */
  searchMetadata: {
    /** Query processing time */
    processingTime: number;
    /** Total vectors searched */
    totalVectors: number;
    /** Search algorithm used */
    algorithm: string;
    /** Results returned */
    resultsReturned: number;
  };
  /** Search configuration */
  searchConfig: {
    /** Similarity threshold used */
    threshold: number;
    /** Top K value */
    topK: number;
    /** Filters applied */
    filtersApplied: Record<string, any>;
  };
}

/**
 * Portal validation result
 */
export interface PortalValidationResult {
  /** Validation success status */
  isValid: boolean;
  /** Validation errors */
  errors: Array<{
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  /** Sanitized data */
  sanitizedData?: any;
  /** Validation metadata */
  metadata: {
    /** Validation duration */
    duration: number;
    /** Rules applied */
    rulesApplied: number;
    /** Fields validated */
    fieldsValidated: number;
  };
}

/**
 * Portal QR generation result
 */
export interface PortalQRGenerationResult {
  /** Generated QR code data URL */
  qrCodeDataUrl: string;
  /** QR code configuration used */
  config: {
    size: number;
    errorCorrectionLevel: string;
    colors: {
      foreground: string;
      background: string;
    };
  };
  /** QR code metadata */
  metadata: {
    /** Target URL */
    targetUrl: string;
    /** Generation timestamp */
    generatedAt: Date;
    /** QR code format */
    format: string;
    /** File size */
    fileSize: number;
  };
  /** Download options */
  downloadOptions?: {
    formats: string[];
    urls: Record<string, string>;
  };
}