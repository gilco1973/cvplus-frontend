/**
 * CV Service Core
 * Main orchestrator for all CV-related operations
 * Provides a unified API while maintaining separation of concerns
 */

import { CVParser } from './CVParser';
import { CVValidator } from './CVValidator';
import { CVAnalyzer } from './CVAnalyzer';
import { CVTransformer } from './CVTransformer';
import { MediaService } from '../features/MediaService';
import { VisualizationService } from '../features/VisualizationService';
import { IntegrationService } from '../features/IntegrationService';
import { ProfileService } from '../features/ProfileService';
import { recommendationsDebugger } from '../../utils/debugRecommendations';
import { RequestManager } from '../RequestManager';
import { strictModeAwareRequestManager } from '../../utils/strictModeAwareRequestManager';
import { auth } from '../../lib/firebase';
import type {
  Job,
  JobCreateParams,
  FileUploadParams,
  CVProcessParams,
  CVAnalysisParams,
  AsyncCVGenerationResponse,
  AsyncCVGenerationParams
} from '../../types/cv';

// CVUpload response type matching Firebase Function
export interface CVUploadResponse {
  jobId: string;
  status: string;
  userId: string;
  features: string[];
  creditsUsed: number;
  remainingCredits: number;
  createdAt: string;
  estimatedCompletionTime: string;
}

/**
 * Main CV Service orchestrating all CV-related operations
 */
export class CVServiceCore {
  // Core job operations
  static async createJob(params: JobCreateParams): Promise<string> {
    return CVParser.createJob(params);
  }

  static async uploadCV(params: FileUploadParams): Promise<string> {
    return CVParser.uploadCV(params);
  }

  static async processCV(params: CVProcessParams) {
    return CVParser.processCV(params);
  }

  /**
   * Development mode: Create a job that skips CV upload/parsing and uses cached CV
   * Only works in development environment
   */
  static async createDevelopmentJob(userInstructions?: string): Promise<string> {
    const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
    if (!isDev) {
      throw new Error('Development mode job creation is only available in development environment');
    }
    
    // Create a job with development flag
    const jobId = await CVParser.createJob({
      userInstructions,
      isUrl: false,
      quickCreate: false,
      developmentMode: true // Special flag for backend
    });
    
    // Immediately call processCV with development flag to trigger CV reuse logic
    await CVParser.processCV({
      jobId,
      fileUrl: 'development-skip',
      mimeType: 'development/skip',
      isUrl: false,
      fileName: 'Development Mode Skip',
      fileSize: 0
    });
    
    return jobId;
  }

  static async generateCV(jobId: string, templateId: string, features: string[]) {
    return CVParser.generateCV(jobId, templateId, features);
  }

  /**
   * Initiate async CV generation (returns immediately with job tracking info)
   */
  static async initiateCVGeneration(params: AsyncCVGenerationParams): Promise<AsyncCVGenerationResponse> {
    return CVParser.initiateCVGeneration(params);
  }

  /**
   * Check if async CV generation mode is enabled
   */
  static isAsyncCVGenerationEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_ASYNC_CV_GENERATION === 'true';
  }

  // Job management
  static subscribeToJob(jobId: string, callback: (job: Job | null) => void) {
    return CVValidator.subscribeToJob(jobId, callback);
  }

  static async getJob(jobId: string): Promise<Job | null> {
    return CVValidator.getJob(jobId);
  }

  static async getTemplates(category?: string) {
    return CVValidator.getTemplates(category);
  }

  static async updateJobFeatures(jobId: string, selectedFeatures: string[]): Promise<void> {
    return CVValidator.updateJobFeatures(jobId, selectedFeatures);
  }

  // Analysis operations
  static async analyzeCV(params: CVAnalysisParams) {
    return CVAnalyzer.analyzeCV(params);
  }

  static async enhancedAnalyzeCV(params: CVAnalysisParams) {
    return CVAnalyzer.enhancedAnalyzeCV(params);
  }

  static async getRecommendations(
    jobId: string, 
    targetRole?: string, 
    industryKeywords?: string[], 
    forceRegenerate?: boolean
  ) {
    // Create unique request key including user ID for multi-user safety
    const userId = auth.currentUser?.uid || 'anonymous';
    const requestKey = `getRecommendations-${userId}-${jobId}-${targetRole || 'default'}-${(industryKeywords || []).join(',')}-${forceRegenerate || false}`;
    
    console.warn(`[CVServiceCore] getRecommendations called for jobId: ${jobId}`, {
      requestKey,
      forceRegenerate,
      strictMode: process.env.NODE_ENV === 'development'
    });
    
    // Use StrictMode-aware request manager for enhanced duplicate prevention
    const result = await strictModeAwareRequestManager.executeOnce(
      requestKey,
      async () => {
        console.warn(`[CVServiceCore] Executing actual request for jobId: ${jobId}`);
        recommendationsDebugger.trackCall(jobId, 'CVServiceCore.getRecommendations', false, requestKey);
        return CVAnalyzer._executeGetRecommendationsDirectly(jobId, targetRole, industryKeywords, forceRegenerate);
      },
      {
        forceRegenerate,
        timeout: 320000, // 320 second timeout for Firebase functions (5 min + buffer)
        context: `getRecommendations-${jobId}`
      }
    );
    
    // Enhanced debugging with StrictMode detection
    if (result.wasFromCache) {
      const cacheType = result.wasStrictModeDuplicate ? 'strictmode-duplicate' : 'cached';
      recommendationsDebugger.trackCall(jobId, `CVServiceCore.getRecommendations-${cacheType}`, true, requestKey);
      
      console.warn(`[CVServiceCore] Returned ${cacheType} result for jobId: ${jobId}`, {
        wasStrictModeDuplicate: result.wasStrictModeDuplicate,
        wasFromCache: result.wasFromCache
      });
    } else {
      console.warn(`[CVServiceCore] Returned fresh result for jobId: ${jobId}`);
    }
    
    return result.data;
  }

  static async previewImprovement(jobId: string, recommendationId: string) {
    return CVAnalyzer.previewImprovement(jobId, recommendationId);
  }

  // Transformation operations
  static async applyImprovements(
    jobId: string, 
    selectedRecommendationIds: string[], 
    targetRole?: string, 
    industryKeywords?: string[]
  ) {
    return CVTransformer.applyImprovements(
      jobId, 
      selectedRecommendationIds, 
      targetRole, 
      industryKeywords
    );
  }

  // ATS operations
  static async analyzeATSCompatibility(jobId: string, targetRole?: string, targetKeywords?: string[]) {
    return CVAnalyzer.analyzeATSCompatibility(jobId, targetRole, targetKeywords);
  }

  static async applyATSOptimizations(jobId: string, optimizations: unknown) {
    return CVTransformer.applyATSOptimizations(jobId, optimizations);
  }

  static async generateATSKeywords(jobDescription: string, industry?: string, role?: string) {
    return CVAnalyzer.generateATSKeywords(jobDescription, industry, role);
  }

  // Validation utilities
  static validateJobStatus(job: Job): boolean {
    return CVValidator.validateJobStatus(job);
  }

  static validateJobSettings(settings: unknown): boolean {
    return CVValidator.validateJobSettings(settings);
  }

  static validateFileUpload(file: File) {
    return CVValidator.validateFileUpload(file);
  }

  static validateURL(url: string) {
    return CVValidator.validateURL(url);
  }

  // Feature management
  static async skipFeature(jobId: string, featureId: string) {
    return CVParser.skipFeature(jobId, featureId);
  }

  // CV Upload with progress tracking (for CVUpload component)
  static async uploadCVWithProgress(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<CVUploadResponse> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be authenticated to upload CV');
    }

    // Get auth token
    const token = await user.getIdToken();

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred during upload'));
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout - please try again'));
      });

      // Configure request
      const functionUrl = import.meta.env.VITE_FIREBASE_FUNCTION_URL || 'http://localhost:5001';
      xhr.open('POST', `${functionUrl}/uploadCV`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.timeout = 60000; // 60 second timeout

      // Send request
      xhr.send(formData);
    });
  }
}

/**
 * Legacy compatibility exports
 * These maintain backward compatibility with existing code
 */

// Core operations
export const createJob = (url?: string, quickCreate?: boolean, userInstructions?: string) =>
  CVServiceCore.createJob({ url, quickCreate, userInstructions });

export const createDevelopmentJob = (userInstructions?: string) =>
  CVServiceCore.createDevelopmentJob(userInstructions);

export const uploadCV = (file: File, jobId: string) =>
  CVServiceCore.uploadCV({ file, jobId });

export const processCV = (jobId: string, fileUrl: string, mimeType: string, isUrl?: boolean) =>
  CVServiceCore.processCV({ jobId, fileUrl, mimeType, isUrl });

export const subscribeToJob = CVServiceCore.subscribeToJob;
export const getJob = CVServiceCore.getJob;
export const generateCV = CVServiceCore.generateCV;
export const getTemplates = CVServiceCore.getTemplates;
export const updateJobFeatures = CVServiceCore.updateJobFeatures;

// Analysis operations
export const analyzeCV = (parsedCV: unknown, targetRole?: string) =>
  CVServiceCore.analyzeCV({ parsedCV, targetRole });

export const enhancedAnalyzeCV = (
  parsedCV: unknown, 
  targetRole?: string, 
  jobDescription?: string, 
  industryKeywords?: string[], 
  jobId?: string
) =>
  CVServiceCore.enhancedAnalyzeCV({ 
    parsedCV, 
    targetRole, 
    jobDescription, 
    industryKeywords, 
    jobId 
  });

export const getRecommendations = CVServiceCore.getRecommendations;
export const previewImprovement = CVServiceCore.previewImprovement;
export const applyImprovements = CVServiceCore.applyImprovements;

// ATS operations
export const analyzeATSCompatibility = CVServiceCore.analyzeATSCompatibility;
export const applyATSOptimizations = CVServiceCore.applyATSOptimizations;
export const generateATSKeywords = CVServiceCore.generateATSKeywords;

// Feature services - direct exports for complex operations
export { MediaService, VisualizationService, IntegrationService, ProfileService };

// Legacy compatibility exports for new async functionality
export const initiateCVGeneration = (jobId: string, templateId: string, features: string[]) =>
  CVServiceCore.initiateCVGeneration({ jobId, templateId, features });

// Feature management
export const skipFeature = CVServiceCore.skipFeature;

export const isAsyncCVGenerationEnabled = CVServiceCore.isAsyncCVGenerationEnabled;

// Type exports
export type { 
  Job, 
  JobCreateParams, 
  FileUploadParams, 
  CVProcessParams, 
  CVAnalysisParams,
  AsyncCVGenerationResponse,
  AsyncCVGenerationParams
};