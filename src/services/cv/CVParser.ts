/**
 * CV Parser Service
 * Handles CV parsing, processing, and file operations
 */

import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions, auth } from '../../lib/firebase';
import { isFirebaseError, getErrorMessage, logError } from '../../utils/errorHandling';
import type { 
  Job, 
  JobCreateParams, 
  FileUploadParams, 
  CVProcessParams,
  AsyncCVGenerationResponse,
  AsyncCVGenerationParams
} from '../../types/cv';

export class CVParser {
  /**
   * Retry logic for database operations
   */
  private static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error: unknown) {
        console.warn(`Operation attempt ${i + 1} failed:`, error);
        
        if (i === maxRetries) {
          throw error;
        }
        
        // Check if error is retryable
        const errorObj = error as any;
        const isRetryable = errorObj?.code === 'unavailable' ||
                           errorObj?.code === 'deadline-exceeded' ||
                           errorObj?.message?.includes('EMPTY_RESPONSE') ||
                           errorObj?.message?.includes('CONNECTION_RESET') ||
                           errorObj?.message?.includes('network');
        
        if (!isRetryable) {
          throw error;
        }
        
        // Exponential backoff
        const delay = delayMs * Math.pow(2, i);
        console.warn(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * Create a new job with retry logic
   */
  static async createJob(params: JobCreateParams): Promise<string> {
    const { url, quickCreate = false, userInstructions } = params;
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    return this.retryOperation(async () => {
      const jobId = doc(collection(db, 'jobs')).id;
      const jobData = {
        userId: user.uid,
        status: 'pending' as const,
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

      console.warn('🔄 Creating job with ID:', jobId);
      await setDoc(doc(db, 'jobs', jobId), jobData);
      console.warn('✅ Job created successfully:', jobId);
      return jobId;
    });
  }

  /**
   * Upload CV file to storage with retry logic
   */
  static async uploadCV(params: FileUploadParams): Promise<string> {
    const { file, jobId } = params;
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    return this.retryOperation(async () => {
      console.warn('🔄 Uploading file:', file.name, 'for job:', jobId);
      
      // Create storage reference
      const storageRef = ref(storage, `users/${user.uid}/uploads/${jobId}/${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.warn('✅ File uploaded successfully, updating job...');

      // Update job with file info
      await setDoc(doc(db, 'jobs', jobId), {
        fileUrl: downloadURL,
        mimeType: file.type,
        fileName: file.name,
        updatedAt: serverTimestamp()
      }, { merge: true });

      console.warn('✅ Job updated with file info');
      return downloadURL;
    });
  }

  /**
   * Process CV through the backend
   */
  static async processCV(params: CVProcessParams) {
    const { jobId, fileUrl, mimeType, isUrl = false } = params;
    
    // Ensure user is authenticated before making the call
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to process CV. Please sign in and try again.');
    }

    console.warn('ProcessCV called with:', { 
      jobId, 
      fileUrl: fileUrl.substring(0, 100) + '...', 
      mimeType, 
      isUrl 
    });
    console.warn('User authenticated:', currentUser.uid);
    
    const processCVFunction = httpsCallable(functions, 'processCV');
    
    try {
      const result = await processCVFunction({
        jobId,
        fileUrl,
        mimeType,
        isUrl
      });
      return result.data;
    } catch (error: unknown) {
      logError('processCV', error);
      
      // Provide more helpful error messages
      if (isFirebaseError(error)) {
        if (error.code === 'functions/invalid-argument') {
          throw new Error('Invalid parameters sent to processCV function. Please check your file and try again.');
        } else if (error.code === 'functions/unauthenticated') {
          throw new Error('Authentication failed. Please sign in and try again.');
        } else if (error.code === 'functions/permission-denied') {
          throw new Error('Permission denied. Please check your access rights.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Check if async CV generation is enabled via environment variable
   */
  private static isAsyncCVGenerationEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_ASYNC_CV_GENERATION === 'true';
  }

  /**
   * Initiate async CV generation (returns immediately with job tracking info)
   */
  static async initiateCVGeneration(params: AsyncCVGenerationParams): Promise<AsyncCVGenerationResponse> {
    const { jobId, templateId, features } = params;
    
    // Ensure user is authenticated before making the call
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to generate CV. Please sign in and try again.');
    }

    // Import the feature conversion utility
    const { convertFeaturesToKebabCase } = await import('../../utils/featureUtils');
    
    // Convert camelCase features to kebab-case for backend
    const kebabCaseFeatures = convertFeaturesToKebabCase(features);

    const initiateCVGenerationFunction = httpsCallable(functions, 'initiateCVGeneration');
    
    try {
      console.warn('🚀 Calling Firebase initiateCVGeneration function with:', {
        jobId,
        templateId,
        originalFeatures: features,
        convertedFeatures: kebabCaseFeatures,
        timestamp: new Date().toISOString()
      });
      
      const result = await initiateCVGenerationFunction({
        jobId,
        templateId,
        features: kebabCaseFeatures
      }) as unknown;
      
      console.warn('✅ Firebase initiateCVGeneration function completed:', {
        hasResult: !!result,
        hasData: !!(result as any)?.data,
        timestamp: new Date().toISOString()
      });
      
      const resultObj = result as any;
      if (!result || typeof resultObj?.data === 'undefined') {
        throw new Error('Invalid response from CV generation service');
      }
      
      return resultObj.data;
    } catch (error: unknown) {
      const errorData = {
        timestamp: new Date().toISOString(),
        ...(isFirebaseError(error) && {
          error: error.message,
          code: error.code
        })
      };
      
      logError('initiateCVGeneration', error, errorData);
      
      // Enhanced Firebase error handling
      if (isFirebaseError(error)) {
        switch (error.code) {
          case 'functions/unauthenticated':
            throw new Error('Authentication required. Please sign in and try again.');
          case 'functions/permission-denied':
            throw new Error('You do not have permission to generate CVs. Please check your account.');
          case 'functions/resource-exhausted':
            throw new Error('Service is temporarily overloaded. Please try again in a few minutes.');
          case 'functions/invalid-argument':
            throw new Error('Invalid parameters for CV generation. Please check your selections and try again.');
          case 'functions/unavailable':
            throw new Error('CV generation service is temporarily unavailable. Please try again in a few moments.');
          default:
            if (error.message?.includes('network')) {
              throw new Error('Network error occurred. Please check your connection and try again.');
            }
        }
      }
      
      // Re-throw with a user-friendly message for unknown errors
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to initiate CV generation: ${errorMessage}`);
    }
  }

  /**
   * Generate CV with template (smart wrapper that chooses sync or async mode)
   */
  static async generateCV(jobId: string, templateId: string, features: string[]) {
    // Check if async mode is enabled
    const isAsyncEnabled = this.isAsyncCVGenerationEnabled();
    
    console.warn(`🎯 CV Generation Mode: ${isAsyncEnabled ? 'ASYNC' : 'SYNC'}`, {
      envVar: import.meta.env.VITE_ENABLE_ASYNC_CV_GENERATION,
      isAsyncEnabled,
      jobId,
      templateId,
      features
    });

    if (isAsyncEnabled) {
      // Use new async approach
      return this.initiateCVGeneration({ jobId, templateId, features });
    } else {
      // Use original synchronous approach
      return this._generateCVSync(jobId, templateId, features);
    }
  }

  /**
   * Original synchronous CV generation (kept for backward compatibility)
   */
  private static async _generateCVSync(jobId: string, templateId: string, features: string[]) {
    // Ensure user is authenticated before making the call
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to generate CV. Please sign in and try again.');
    }

    // Import the feature conversion utility
    const { convertFeaturesToKebabCase } = await import('../../utils/featureUtils');
    
    // Convert camelCase features to kebab-case for backend
    const kebabCaseFeatures = convertFeaturesToKebabCase(features);

    const generateCVFunction = httpsCallable(functions, 'generateCV');
    
    // Create timeout promise for hanging Firebase calls
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('CV generation request timed out after 5 minutes'));
      }, 300000); // 5 minutes timeout
    });

    try {
      console.warn('🚀 Calling Firebase generateCV function (SYNC) with:', {
        jobId,
        templateId,
        originalFeatures: features,
        convertedFeatures: kebabCaseFeatures,
        timestamp: new Date().toISOString()
      });
      
      // Race between the function call and timeout
      const result = await Promise.race([
        generateCVFunction({
          jobId,
          templateId,
          features: kebabCaseFeatures
        }),
        timeoutPromise
      ]) as unknown;
      
      console.warn('✅ Firebase generateCV function (SYNC) completed:', {
        hasResult: !!result,
        hasData: !!(result as any)?.data,
        timestamp: new Date().toISOString()
      });
      
      const resultObj = result as any;
      if (!result || typeof resultObj?.data === 'undefined') {
        throw new Error('Invalid response from CV generation service');
      }
      
      return resultObj.data;
    } catch (error: unknown) {
      const errorData = {
        timestamp: new Date().toISOString(),
        ...(isFirebaseError(error) && {
          error: error.message,
          code: error.code
        })
      };
      
      logError('generateCV', error, errorData);
      
      // Enhanced Firebase error handling
      if (isFirebaseError(error)) {
        switch (error.code) {
          case 'functions/timeout':
            throw new Error('CV generation is taking longer than expected. Please try again.');
          case 'functions/unavailable':
            throw new Error('CV generation service is temporarily unavailable. Please try again in a few moments.');
          case 'functions/unauthenticated':
            throw new Error('Authentication required. Please sign in and try again.');
          case 'functions/permission-denied':
            throw new Error('You do not have permission to generate CVs. Please check your account.');
          case 'functions/resource-exhausted':
            throw new Error('Service is temporarily overloaded. Please try again in a few minutes.');
          case 'functions/invalid-argument':
            throw new Error('Invalid parameters for CV generation. Please check your selections and try again.');
          default:
            if (error.message?.includes('timeout')) {
              throw new Error('CV generation timed out. Please try again with a smaller feature set.');
            } else if (error.message?.includes('network')) {
              throw new Error('Network error occurred. Please check your connection and try again.');
            }
        }
      }
      
      // Re-throw with a user-friendly message for unknown errors
      const errorMessage = getErrorMessage(error);
      throw new Error(`Failed to generate CV: ${errorMessage}`);
    }
  }

  /**
   * Generate podcast (legacy)
   */
  static async generatePodcast(jobId: string, config: unknown) {
    const generatePodcastFunction = httpsCallable(functions, 'generatePodcastLegacy');
    const result = await generatePodcastFunction({
      jobId,
      config
    });
    return result.data;
  }

  /**
   * Skip a feature for a job
   */
  static async skipFeature(jobId: string, featureId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    console.warn('🚫 Calling skipFeature function:', { jobId, featureId });

    const skipFeatureFunction = httpsCallable(functions, 'skipFeature');
    const result = await skipFeatureFunction({ jobId, featureId });

    console.warn('✅ Feature skipped successfully:', result.data);
    return result.data;
  }
}