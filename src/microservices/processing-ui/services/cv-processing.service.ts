// @ts-ignore
/**
 * CV Processing Service (T067)
 *
 * Frontend service for coordinating CV processing operations with backend
 * Firebase Functions. Handles file upload, processing initiation, status
 * monitoring, and result retrieval.
 *
 * Features:
 * - File upload with progress tracking
 * - Processing job management
 * - Status monitoring and updates
 * - Error handling and retry logic
 * - Result retrieval and caching
 * - Queue management integration
 *
 * @author Gil Klainert
 * @version 1.0.0 - Initial T067 Implementation
  */

import { httpsCallable, getFunctions } from 'firebase/functions';
import { ref, uploadBytesResumable, getDownloadURL, getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import type {
  ProcessingJob,
  ProcessingJobOptions,
  ProcessingResult
} from '../components/CVProcessor.types';

// Initialize Firebase services
const functions = getFunctions();
const storage = getStorage();
const auth = getAuth();

// Firebase function references
const processCV = httpsCallable(functions, 'processCV');
const getCVStatus = httpsCallable(functions, 'getCVStatus');
const updateCVData = httpsCallable(functions, 'updateCVData');
const cancelCVProcessing = httpsCallable(functions, 'cancelCVProcessing');

interface ProcessCVRequest {
  file: File;
  features: string[];
  jobDescription?: string;
  templateId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface ProcessCVResponse {
  success: boolean;
  jobId: string;
  estimatedTime?: number;
  error?: string;
}

interface CVStatusResponse {
  success: boolean;
  data?: {
    jobId: string;
    status: string;
    progress: number;
    currentStage?: string;
    stages?: any[];
    result?: any;
    error?: string;
    estimatedCompletion?: string;
  };
  error?: string;
}

interface UploadProgressCallback {
  (progress: number, stage: 'uploading' | 'processing'): void;
}

/**
 * CV Processing Service Class
  */
export class CVProcessingService {
  private static instance: CVProcessingService;
  private activeJobs = new Map<string, ProcessingJob>();
  private uploadCache = new Map<string, string>();

  private constructor() {}

  public static getInstance(): CVProcessingService {
    if (!CVProcessingService.instance) {
      CVProcessingService.instance = new CVProcessingService();
    }
    return CVProcessingService.instance;
  }

  /**
   * Upload file to Firebase Storage with progress tracking
    */
  async uploadFile(
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<{ url: string; path: string }> {
    try {
      // Check authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileName = `${timestamp}_${randomId}_${file.name}`;
      const filePath = `cv-uploads/${user.uid}/${fileName}`;

      // Check cache first
      const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;
      const cachedUrl = this.uploadCache.get(cacheKey);
      if (cachedUrl) {
        return { url: cachedUrl, path: filePath };
      }

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress, 'uploading');
          },
          (error) => {
            console.error('[CVProcessing] Upload error:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              // Cache the URL
              this.uploadCache.set(cacheKey, downloadURL);

              resolve({
                url: downloadURL,
                path: filePath
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });

    } catch (error) {
      throw new Error(
        `File upload failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Start CV processing
    */
  async startProcessing(request: ProcessCVRequest): Promise<ProcessCVResponse> {
    try {
      // Check authentication
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload file first
      const uploadResult = await this.uploadFile(request.file);

      // Prepare processing request
      const processingRequest = {
        jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileUrl: uploadResult.url,
        fileName: request.file.name,
        fileSize: request.file.size,
        mimeType: request.file.type,
        features: request.features,
        jobDescription: request.jobDescription,
        templateId: request.templateId || 'modern',
        priority: request.priority || 'normal',
        isUrl: false
      };

      // Call backend processing function
      const result = await processCV(processingRequest);
      const data = result.data as any;

      if (!data.success) {
        throw new Error(data.error || 'Processing initiation failed');
      }

      // Store job information
      const job: ProcessingJob = {
        id: processingRequest.jobId,
        backendJobId: data.jobId || processingRequest.jobId,
        status: 'processing',
        progress: 0,
        stages: [],
        file: request.file,
        options: {
          features: request.features,
          jobDescription: request.jobDescription,
          templateId: request.templateId || 'modern',
          priority: request.priority || 'normal'
        },
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.uid
      };

      this.activeJobs.set(job.id, job);

      return {
        success: true,
        jobId: job.backendJobId,
        estimatedTime: data.estimatedTime
      };

    } catch (error) {
      console.error('[CVProcessing] Start processing error:', error);
      return {
        success: false,
        jobId: '',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get processing status
    */
  async getProcessingStatus(jobId: string): Promise<CVStatusResponse> {
    try {
      const result = await getCVStatus({ jobId });
      const data = result.data as any;

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Status retrieval failed'
        };
      }

      // Update local job cache if exists
      const localJob = Array.from(this.activeJobs.values())
        .find(job => job.backendJobId === jobId || job.id === jobId);

      if (localJob && data.data) {
        const updatedJob: ProcessingJob = {
          ...localJob,
          status: data.data.status,
          progress: data.data.progress || 0,
          currentStage: data.data.currentStage,
          stages: data.data.stages || localJob.stages,
          result: data.data.result,
          error: data.data.error,
          updatedAt: new Date()
        };

        this.activeJobs.set(localJob.id, updatedJob);
      }

      return {
        success: true,
        data: data.data
      };

    } catch (error) {
      console.error('[CVProcessing] Get status error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Cancel processing job
    */
  async cancelProcessing(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await cancelCVProcessing({ jobId });
      const data = result.data as any;

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Cancellation failed'
        };
      }

      // Update local job status
      const localJob = Array.from(this.activeJobs.values())
        .find(job => job.backendJobId === jobId || job.id === jobId);

      if (localJob) {
        const cancelledJob: ProcessingJob = {
          ...localJob,
          status: 'cancelled',
          updatedAt: new Date()
        };

        this.activeJobs.set(localJob.id, cancelledJob);
      }

      return { success: true };

    } catch (error) {
      console.error('[CVProcessing] Cancel processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Update CV data during processing
    */
  async updateProcessingData(
    jobId: string,
    updates: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await updateCVData({ jobId, updates });
      const data = result.data as any;

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Update failed'
        };
      }

      return { success: true };

    } catch (error) {
      console.error('[CVProcessing] Update data error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get active jobs
    */
  getActiveJobs(): ProcessingJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get job by ID
    */
  getJob(jobId: string): ProcessingJob | undefined {
    return this.activeJobs.get(jobId) ||
           Array.from(this.activeJobs.values())
             .find(job => job.backendJobId === jobId);
  }

  /**
   * Remove completed job from cache
    */
  removeJob(jobId: string): void {
    this.activeJobs.delete(jobId);
  }

  /**
   * Clear upload cache
    */
  clearUploadCache(): void {
    this.uploadCache.clear();
  }

  /**
   * Get processing queue status
    */
  async getQueueStatus(): Promise<{
    queueLength: number;
    averageWaitTime: number;
    estimatedWaitTime: number;
  }> {
    try {
      // This would typically call a backend function to get queue metrics
      // For now, return mock data based on active jobs
      const activeJobsCount = this.activeJobs.size;

      return {
        queueLength: activeJobsCount,
        averageWaitTime: activeJobsCount * 30, // 30 seconds per job average
        estimatedWaitTime: activeJobsCount * 45 // 45 seconds estimated wait
      };

    } catch (error) {
      console.error('[CVProcessing] Queue status error:', error);
      return {
        queueLength: 0,
        averageWaitTime: 0,
        estimatedWaitTime: 0
      };
    }
  }

  /**
   * Validate file before processing
    */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please upload PDF, DOCX, DOC, or TXT files.');
    }

    // Check file name
    if (!file.name || file.name.length < 1) {
      errors.push('File must have a valid name');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get processing statistics
    */
  getProcessingStats(): {
    totalJobs: number;
    completedJobs: number;
    failedJobs: number;
    activeJobs: number;
    successRate: number;
  } {
    const jobs = Array.from(this.activeJobs.values());
    const completed = jobs.filter(job => job.status === 'completed').length;
    const failed = jobs.filter(job => job.status === 'failed').length;
    const active = jobs.filter(job => ['processing', 'queued'].includes(job.status)).length;
    const total = jobs.length;

    return {
      totalJobs: total,
      completedJobs: completed,
      failedJobs: failed,
      activeJobs: active,
      successRate: total > 0 ? (completed / total) * 100 : 0
    };
  }
}

// Export singleton instance
export const cvProcessingService = CVProcessingService.getInstance();

// Export convenience functions
export const {
  startProcessing: processCV,
  getProcessingStatus: getCVStatus,
  cancelProcessing: cancelCVProcessing,
  updateProcessingData: updateCVData,
  validateFile: validateCVFile,
  getActiveJobs,
  getJob: getCVJob,
  removeJob: removeCVJob,
  clearUploadCache,
  getQueueStatus: getCVQueueStatus,
  getProcessingStats: getCVProcessingStats
} = cvProcessingService;