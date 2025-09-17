/**
 * Enhanced CV Service with Error Recovery
 * 
 * Wraps all API calls with intelligent retry mechanisms, error classification,
 * and checkpoint management for reliable CV processing operations.
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions, auth } from '../lib/firebase';
import ErrorRecoveryManager from './error-recovery/ErrorRecoveryManager';
import { CheckpointType } from './error-recovery/CheckpointManager';
import { withRetry } from './error-recovery/RetryMechanism';
import { jobSubscriptionManager } from './JobSubscriptionManager';

// Re-export types from original service
export interface Job {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'analyzed' | 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  mimeType?: string;
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
}

export class CVServiceEnhanced {
  private static instance: CVServiceEnhanced;
  private recoveryManager: ErrorRecoveryManager;

  private constructor() {
    this.recoveryManager = ErrorRecoveryManager.getInstance();
  }

  public static getInstance(): CVServiceEnhanced {
    if (!CVServiceEnhanced.instance) {
      CVServiceEnhanced.instance = new CVServiceEnhanced();
    }
    return CVServiceEnhanced.instance;
  }

  /**
   * Creates a new job with error recovery
   */
  // @withRetry({ maxRetries: 2 }, 'create_job') // Disabled for TypeScript compatibility
  public async createJob(url?: string, quickCreate = false, userInstructions?: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const jobId = doc(collection(db, 'jobs')).id;
    const jobData = {
      userId: user.uid,
      status: 'pending',
      isUrl: !!url,
      fileUrl: url || null,
      quickCreate,
      userInstructions: userInstructions || null,
      settings: quickCreate ? {
        applyAllEnhancements: true,
        generateAllFormats: true,
        enablePIIProtection: true,
        createPodcast: true,
        useRecommendedTemplate: true
      } : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'jobs', jobId), jobData);

    // Create initial checkpoint
    if (jobId) {
      await this.recoveryManager.createCheckpoint(
        jobId,
        CheckpointType.FILE_UPLOADED,
        { jobData },
        { description: 'Job created successfully' }
      );
    }

    return jobId;
  }

  /**
   * Uploads CV file with retry and progress tracking
   */
  public async uploadCV(file: File, jobId: string): Promise<string> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        // Create storage reference
        const storageRef = ref(storage, `users/${user.uid}/uploads/${jobId}/${file.name}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update job with file info
        await setDoc(doc(db, 'jobs', jobId), {
          fileUrl: downloadURL,
          mimeType: file.type,
          fileName: file.name,
          updatedAt: serverTimestamp()
        }, { merge: true });

        return downloadURL;
      },
      {
        operationName: 'file_upload',
        jobId,
        checkpointType: CheckpointType.FILE_UPLOADED,
        checkpointData: { fileName: file.name, fileSize: file.size, mimeType: file.type }
      },
      {
        enableCheckpointRestore: false, // File upload doesn't need checkpoint restore
        enableAutoRetry: true,
        maxRetries: 3
      }
    ).then(result => {
      if (result.success) {
        return result.data!;
      } else {
        throw result.error?.originalError || new Error('Upload failed');
      }
    });
  }

  /**
   * Processes CV with comprehensive error recovery
   */
  public async processCV(jobId: string, fileUrl: string, mimeType: string, isUrl = false): Promise<unknown> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const processCVFunction = httpsCallable(functions, 'processCV');
        const result = await processCVFunction({
          jobId,
          fileUrl,
          mimeType,
          isUrl
        });
        return result.data;
      },
      {
        operationName: 'cv_processing',
        jobId,
        checkpointType: CheckpointType.PARSING_STARTED,
        checkpointData: { fileUrl, mimeType, isUrl }
      },
      {
        enableCheckpointRestore: true,
        enableAutoRetry: true,
        maxRetries: 2,
        customRetryConfig: {
          initialDelay: 5000,
          maxDelay: 60000
        }
      }
    ).then(result => {
      if (result.success) {
        return result.data;
      } else {
        throw result.error?.originalError || new Error('CV processing failed');
      }
    });
  }

  /**
   * Generates CV preview using backend service with error recovery
   */
  public async generateCVPreview(
    jobId: string, 
    templateId?: string, 
    features?: string[]
  ): Promise<string> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();
        
        try {
          // First try the callable function
          const generatePreviewFunction = httpsCallable(functions, 'generateCVPreview');
          const result = await generatePreviewFunction({
            jobId,
            templateId,
            features
          });
          
          // Return the HTML content from the backend
          return (result.data as { html: string }).html;
        } catch (error: unknown) {
          console.warn('Preview callable function failed, trying direct HTTP call:', error);
          
          // Fallback to direct HTTP call
          const baseUrl = import.meta.env.DEV 
            ? 'http://localhost:5001/getmycv-ai/us-central1'
            : 'https://us-central1-getmycv-ai.cloudfunctions.net';
          const response = await fetch(`${baseUrl}/generateCVPreview`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: {
                jobId,
                templateId,
                features
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.result.html;
        }
      },
      {
        operationName: 'cv_preview_generation',
        jobId,
        checkpointType: CheckpointType.GENERATION_STARTED,
        checkpointData: { templateId, features }
      },
      {
        enableCheckpointRestore: false, // Preview doesn't need checkpoint restore
        enableAutoRetry: true,
        maxRetries: 2,
        customRetryConfig: {
          initialDelay: 2000, // Short delay for preview
          maxDelay: 10000
        }
      }
    ).then(result => {
      if (result.success) {
        return result.data!;
      } else {
        throw result.error?.originalError || new Error('CV preview generation failed');
      }
    });
  }

  /**
   * Gets recommendations with error recovery
   */
  public async getRecommendations(
    jobId: string, 
    targetRole?: string, 
    industryKeywords?: string[], 
    forceRegenerate?: boolean
  ): Promise<unknown> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();
        
        try {
          // First try the callable function
          const getRecommendationsFunction = httpsCallable(functions, 'getRecommendations');
          const result = await getRecommendationsFunction({
            jobId,
            targetRole,
            industryKeywords,
            forceRegenerate
          });
          return result.data;
        } catch (error: unknown) {
          console.warn('Callable function failed, trying direct HTTP call:', error);
          
          // Fallback to direct HTTP call
          const baseUrl = import.meta.env.DEV 
            ? 'http://localhost:5001/getmycv-ai/us-central1'
            : 'https://us-central1-getmycv-ai.cloudfunctions.net';
          const response = await fetch(`${baseUrl}/getRecommendations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: {
                jobId,
                targetRole,
                industryKeywords,
                forceRegenerate
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.result;
        }
      },
      {
        operationName: 'get_recommendations',
        jobId,
        checkpointType: CheckpointType.ANALYSIS_COMPLETED,
        checkpointData: { targetRole, industryKeywords }
      },
      {
        enableCheckpointRestore: true,
        enableAutoRetry: true,
        maxRetries: 3
      }
    ).then(result => {
      if (result.success) {
        return result.data;
      } else {
        throw result.error?.originalError || new Error('Failed to get recommendations');
      }
    });
  }

  /**
   * Applies improvements with error recovery
   */
  public async applyImprovements(
    jobId: string, 
    selectedRecommendationIds: string[], 
    targetRole?: string, 
    industryKeywords?: string[]
  ): Promise<unknown> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const token = await user.getIdToken();
        
        try {
          // First try the callable function
          const applyImprovementsFunction = httpsCallable(functions, 'applyImprovements');
          const result = await applyImprovementsFunction({
            jobId,
            selectedRecommendationIds,
            targetRole,
            industryKeywords
          });
          return result.data;
        } catch (error: unknown) {
          console.warn('Callable function failed, trying direct HTTP call:', error);
          
          // Fallback to direct HTTP call
          const baseUrl = import.meta.env.DEV 
            ? 'http://localhost:5001/getmycv-ai/us-central1'
            : 'https://us-central1-getmycv-ai.cloudfunctions.net';
          const response = await fetch(`${baseUrl}/applyImprovementsV2`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              data: {
                jobId,
                selectedRecommendationIds,
                targetRole,
                industryKeywords
              }
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          return result.result;
        }
      },
      {
        operationName: 'apply_improvements',
        jobId,
        checkpointType: CheckpointType.IMPROVEMENTS_APPLIED,
        checkpointData: { selectedRecommendationIds, targetRole, industryKeywords }
      },
      {
        enableCheckpointRestore: true,
        enableAutoRetry: true,
        maxRetries: 2
      }
    ).then(result => {
      if (result.success) {
        return result.data;
      } else {
        throw result.error?.originalError || new Error('Failed to apply improvements');
      }
    });
  }

  /**
   * Generates CV with error recovery
   */
  // @withRetry({ maxRetries: 2 }, 'generate_cv') // Disabled for TypeScript compatibility
  public async generateCV(jobId: string, templateId: string, features: string[]): Promise<unknown> {
    // Create checkpoint before generation
    await this.recoveryManager.createCheckpoint(
      jobId,
      CheckpointType.GENERATION_STARTED,
      { templateId, features },
      { description: 'Starting CV generation' }
    );

    const generateCVFunction = httpsCallable(functions, 'generateCV');
    const result = await generateCVFunction({
      jobId,
      templateId,
      features
    });

    // Create completion checkpoint
    await this.recoveryManager.createCheckpoint(
      jobId,
      CheckpointType.GENERATION_COMPLETED,
      { generatedCV: result.data },
      { description: 'CV generation completed' }
    );

    return result.data;
  }

  /**
   * Enhanced media generation with recovery
   */
  public async generateEnhancedPodcast(jobId: string, style?: 'professional' | 'conversational' | 'storytelling'): Promise<unknown> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const podcastFunction = httpsCallable(functions, 'generatePodcast');
        const result = await podcastFunction({
          jobId,
          format: style || 'professional',
          duration: 300
        });
        return result.data;
      },
      {
        operationName: 'podcast_generation',
        jobId,
        checkpointData: { style }
      },
      {
        enableAutoRetry: true,
        maxRetries: 2,
        customRetryConfig: {
          initialDelay: 10000, // Longer delay for media generation
          maxDelay: 120000
        }
      }
    ).then(result => {
      if (result.success) {
        return result.data;
      } else {
        throw result.error?.originalError || new Error('Podcast generation failed');
      }
    });
  }

  /**
   * Enhanced video generation with recovery
   */
  public async generateVideoIntroduction(
    jobId: string, 
    duration?: 'short' | 'medium' | 'long', 
    style?: string
  ): Promise<unknown> {
    return this.recoveryManager.executeWithRecovery(
      async () => {
        const videoIntroFunction = httpsCallable(functions, 'generateVideoIntroduction');
        const result = await videoIntroFunction({
          jobId,
          duration: duration || 'medium',
          style: style || 'professional',
          avatarStyle: 'realistic',
          background: 'office',
          includeSubtitles: true,
          includeNameCard: true
        });
        return result.data;
      },
      {
        operationName: 'video_generation',
        jobId,
        checkpointData: { duration, style }
      },
      {
        enableAutoRetry: true,
        maxRetries: 1, // Video generation is expensive, limit retries
        customRetryConfig: {
          initialDelay: 15000,
          maxDelay: 180000
        }
      }
    ).then(result => {
      if (result.success) {
        return result.data;
      } else {
        throw result.error?.originalError || new Error('Video generation failed');
      }
    });
  }

  /**
   * Simple operations that don't need full recovery (kept from original)
   */
  
  // Subscribe to job updates (uses centralized subscription manager)
  public subscribeToJob(jobId: string, callback: (job: Job | null) => void) {
    return jobSubscriptionManager.subscribeToJob(jobId, callback, {
      enableLogging: process.env.NODE_ENV === 'development',
      debounceMs: 50, // Faster debounce for enhanced service
      maxRetries: 3
    });
  }

  // Get job (simple read operation)
  // @withRetry({ maxRetries: 2 }, 'get_job') // Disabled for TypeScript compatibility
  public async getJob(jobId: string): Promise<Job | null> {
    const docSnap = await getDoc(doc(db, 'jobs', jobId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Job;
    }
    return null;
  }

  // Get templates (cached data, low-risk)
  // @withRetry({ maxRetries: 3 }, 'get_templates') // Disabled for TypeScript compatibility
  public async getTemplates(category?: string): Promise<unknown> {
    const getTemplatesFunction = httpsCallable(functions, 'getTemplates');
    const result = await getTemplatesFunction({ category, includePublic: true });
    return result.data;
  }

  /**
   * Utility methods
   */
  
  public getRecoveryManager(): ErrorRecoveryManager {
    return this.recoveryManager;
  }

  public async cleanupJobCheckpoints(jobId: string): Promise<boolean> {
    return this.recoveryManager.getJobCheckpoints(jobId).then(checkpoints => {
      return this.recoveryManager.cleanupExpiredCheckpoints().then(count => count > 0);
    });
  }

  public trackUserAction(type: string, target: string, details?: Record<string, unknown>): void {
    this.recoveryManager.trackUserAction(type, target, details);
  }
}

// Create singleton instance and export convenience methods
const cvServiceEnhanced = CVServiceEnhanced.getInstance();

// Export individual methods for compatibility
export const createJob = cvServiceEnhanced.createJob.bind(cvServiceEnhanced);
export const uploadCV = cvServiceEnhanced.uploadCV.bind(cvServiceEnhanced);
export const processCV = cvServiceEnhanced.processCV.bind(cvServiceEnhanced);
export const subscribeToJob = cvServiceEnhanced.subscribeToJob.bind(cvServiceEnhanced);
export const getJob = cvServiceEnhanced.getJob.bind(cvServiceEnhanced);
export const generateCV = cvServiceEnhanced.generateCV.bind(cvServiceEnhanced);
export const getTemplates = cvServiceEnhanced.getTemplates.bind(cvServiceEnhanced);
export const getRecommendations = cvServiceEnhanced.getRecommendations.bind(cvServiceEnhanced);
export const applyImprovements = cvServiceEnhanced.applyImprovements.bind(cvServiceEnhanced);
export const generateEnhancedPodcast = cvServiceEnhanced.generateEnhancedPodcast.bind(cvServiceEnhanced);
export const generateVideoIntroduction = cvServiceEnhanced.generateVideoIntroduction.bind(cvServiceEnhanced);
export const generateCVPreview = cvServiceEnhanced.generateCVPreview.bind(cvServiceEnhanced);

// Export the service instance
export default cvServiceEnhanced;