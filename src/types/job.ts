// Enhanced Job interface with session management support
import type { CVStep } from './session';
// SessionState import removed as it was unused

export interface Job {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'parsed' | 'analyzed' | 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  mimeType?: string;
  fileName?: string;
  isUrl?: boolean;
  userInstructions?: string;
  parsedData?: unknown;
  generatedCV?: {
    html: string;
    htmlUrl?: string;
    pdfUrl: string;
    docxUrl: string;
    template?: string;
    features?: string[];
  };
  piiDetection?: {
    hasPII: boolean;
    detectedTypes: string[];
    recommendations: string[];
  };
  privacyVersion?: unknown;
  quickCreate?: boolean;
  settings?: {
    applyAllEnhancements: boolean;
    generateAllFormats: boolean;
    enablePIIProtection: boolean;
    createPodcast: boolean;
    useRecommendedTemplate: boolean;
  };
  error?: string;
  createdAt: unknown;
  updatedAt: unknown;
  
  // Enhanced features tracking (for progress monitoring)
  enhancedFeatures?: Record<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    currentStep?: string;
    error?: string;
    htmlFragment?: string;
    processedAt?: unknown;
  }>;
  
  // Session management fields
  session?: {
    sessionId: string;
    currentStep: CVStep;
    completedSteps: CVStep[];
    progressPercentage: number;
    canResume: boolean;
    lastActiveAt: Date;
    sessionCreatedAt?: Date;
    formData?: {
      targetRole?: string;
      industryKeywords?: string[];
      jobDescription?: string;
      selectedTemplateId?: string;
      selectedFeatures?: string[];
      personalInfo?: Record<string, unknown>;
      workExperience?: Record<string, unknown>;
      education?: Record<string, unknown>;
      skills?: Record<string, unknown>;
      customizations?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    };
    
    // Resume metadata
    resumeUrl?: string;
    pausedAt?: Date;
    pauseReason?: string;
    
    // Sync status
    isSynced?: boolean;
    lastSyncAt?: Date;
    isLocalOnly?: boolean;
    
    // Analytics
    timeSpentOnSteps?: Record<CVStep, number>; // milliseconds
    navigations?: Array<{
      from: CVStep;
      to: CVStep;
      timestamp: Date;
    }>;
    
    // User behavior
    saveCount?: number;
    manualSaves?: Date[];
    errors?: Array<{
      step: CVStep;
      error: string;
      timestamp: Date;
    }>;
  };
}

// Extended job status types for better session tracking
export type JobStatus = 
  | 'draft'           // Session created, no processing started
  | 'pending'         // File uploaded, waiting for processing
  | 'processing'      // AI processing in progress
  | 'parsed'          // CV parsed, ready for analysis or role detection  
  | 'analyzed'        // Analysis complete, ready for user input
  | 'customizing'     // User making selections/customizations
  | 'generating'      // Final CV generation in progress
  | 'completed'       // Job fully completed
  | 'failed'          // Job failed with error
  | 'paused'          // Session paused by user
  | 'abandoned';      // Session abandoned (inactive for extended period)

// Helper types for job operations
export interface CreateJobRequest {
  url?: string;
  quickCreate?: boolean;
  userInstructions?: string;
  sessionId?: string;
  formData?: Record<string, unknown>;
}

export interface UpdateJobRequest {
  status?: JobStatus;
  sessionData?: Partial<Job['session']>;
  formData?: Record<string, unknown>;
  error?: string;
}

export interface JobSearchCriteria {
  userId?: string;
  status?: JobStatus[];
  hasSession?: boolean;
  canResume?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  limit?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'lastActiveAt';
  orderDirection?: 'asc' | 'desc';
}

// Job analytics and metrics
export interface JobMetrics {
  totalJobs: number;
  completedJobs: number;
  abandonedJobs: number;
  averageCompletionTime: number; // milliseconds
  averageStepsCompleted: number;
  mostCommonExitStep: CVStep;
  conversionRate: number; // percentage
  
  // Step-specific metrics
  stepMetrics: Record<CVStep, {
    totalVisits: number;
    totalTimeSpent: number; // milliseconds
    averageTimeSpent: number;
    abandonmentRate: number; // percentage
    completionRate: number; // percentage
  }>;
  
  // User behavior patterns
  commonPaths: Array<{
    path: CVStep[];
    frequency: number;
  }>;
  
  errorRates: Record<CVStep, number>; // percentage
  resumeRates: Record<CVStep, number>; // percentage
}

// Job event tracking
export type JobEvent = 
  | { type: 'JOB_CREATED'; payload: { jobId: string; sessionId?: string } }
  | { type: 'JOB_STATUS_CHANGED'; payload: { jobId: string; oldStatus: JobStatus; newStatus: JobStatus } }
  | { type: 'JOB_STEP_CHANGED'; payload: { jobId: string; oldStep: CVStep; newStep: CVStep } }
  | { type: 'JOB_PAUSED'; payload: { jobId: string; step: CVStep; reason?: string } }
  | { type: 'JOB_RESUMED'; payload: { jobId: string; fromStep: CVStep } }
  | { type: 'JOB_COMPLETED'; payload: { jobId: string; completionTime: number } }
  | { type: 'JOB_FAILED'; payload: { jobId: string; step: CVStep; error: string } }
  | { type: 'JOB_SESSION_SYNCED'; payload: { jobId: string; syncedAt: Date } };

// Error types for job operations
export class JobError extends Error {
  public code: JobErrorCode;
  public jobId?: string;
  public step?: CVStep;
  public retryable: boolean;

  constructor(
    message: string,
    code: JobErrorCode,
    jobId?: string,
    step?: CVStep,
    retryable = false
  ) {
    super(message);
    this.name = 'JobError';
    this.code = code;
    this.jobId = jobId;
    this.step = step;
    this.retryable = retryable;
  }
}

export type JobErrorCode = 
  | 'JOB_NOT_FOUND'
  | 'JOB_PROCESSING_FAILED'
  | 'JOB_SESSION_EXPIRED'
  | 'JOB_PERMISSION_DENIED'
  | 'JOB_INVALID_STATE'
  | 'JOB_SYNC_FAILED'
  | 'JOB_VALIDATION_ERROR'
  | 'JOB_STORAGE_ERROR'
  | 'JOB_NETWORK_ERROR';

// Utility functions for job management
export const jobUtils = {
  isResumable: (job: Job): boolean => {
    return !!(
      job.session?.canResume &&
      job.status !== 'completed' &&
      job.status !== 'failed' &&
      job.session.currentStep !== 'completed'
    );
  },

  calculateProgress: (job: Job): number => {
    return job.session?.progressPercentage || 0;
  },

  getResumeUrl: (job: Job): string | null => {
    if (!job.session?.canResume || !job.id) return null;
    
    const baseUrl = window.location.origin;
    const step = job.session.currentStep;
    
    switch (step) {
      case 'upload':
        return `${baseUrl}/`;
      case 'processing':
        return `${baseUrl}/process/${job.id}`;
      case 'analysis':
        return `${baseUrl}/analysis/${job.id}`;
      case 'features':
        return `${baseUrl}/features/${job.id}`;
      case 'templates':
        return `${baseUrl}/templates/${job.id}`;
      case 'preview':
        return `${baseUrl}/preview/${job.id}`;
      case 'results':
        return `${baseUrl}/results/${job.id}`;
      case 'keywords':
        return `${baseUrl}/keywords/${job.id}`;
      default:
        return `${baseUrl}/`;
    }
  },

  getStepDisplayName: (step: CVStep): string => {
    const stepNames: Record<CVStep, string> = {
      upload: 'File Upload',
      processing: 'Processing',
      analysis: 'Analysis',
      features: 'Feature Selection',
      templates: 'Template Selection',
      preview: 'Preview',
      results: 'Results',
      keywords: 'Keyword Optimization',
      completed: 'Completed'
    };
    return stepNames[step] || step;
  },

  formatTimeSpent: (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m`;
    }
    return '< 1m';
  },

  isStale: (job: Job, thresholdHours = 24): boolean => {
    if (!job.session?.lastActiveAt) return false;
    
    const now = new Date();
    const lastActive = new Date(job.session.lastActiveAt);
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    return diffHours > thresholdHours;
  }
};

// Note: Default export removed due to TypeScript verbatimModuleSyntax constraint
// Use named import instead: import type { Job } from './job';