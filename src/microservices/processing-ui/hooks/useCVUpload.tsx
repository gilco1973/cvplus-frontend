/**
 * CV Upload Hook
 * 
 * Custom React hook for handling CV file uploads with validation,
 * progress tracking, and error handling.
 * 
 * @author Gil Klainert
 * @version 2.0.0 - Modularized Architecture
 */

import { useState, useCallback } from 'react';

export interface CVUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: File | null;
  uploadResult: any | null;
}

export interface CVUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  validateFile?: (file: File) => string | null;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

export interface UseCVUploadReturn {
  state: CVUploadState;
  uploadFile: (file: File, options?: CVUploadOptions) => Promise<any>;
  resetUpload: () => void;
  isValidFileType: (file: File) => boolean;
  getFileTypeError: (file: File) => string | null;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/csv'
];

export function useCVUpload(): UseCVUploadReturn {
  const [state, setState] = useState<CVUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null,
    uploadResult: null
  });

  const resetUpload = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null,
      uploadResult: null
    });
  }, []);

  const isValidFileType = useCallback((file: File): boolean => {
    return DEFAULT_ALLOWED_TYPES.includes(file.type);
  }, []);

  const getFileTypeError = useCallback((file: File): string | null => {
    if (!isValidFileType(file)) {
      return 'Please upload a PDF, DOCX, DOC, or CSV file';
    }
    return null;
  }, [isValidFileType]);

  const validateFile = useCallback((
    file: File,
    options: CVUploadOptions = {}
  ): string | null => {
    const maxSize = options.maxFileSize || DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || DEFAULT_ALLOWED_TYPES;

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOCX, DOC, or CSV file';
    }

    // Custom validation
    if (options.validateFile) {
      const customError = options.validateFile(file);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, []);

  const simulateUpload = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate processing result
          const result = {
            jobId: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded'
          };
          
          resolve(result);
        }
        
        onProgress?.(progress);
      }, 200);

      // Simulate potential error
      if (Math.random() < 0.1) { // 10% chance of error
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed. Please try again.'));
        }, 1000);
      }
    });
  }, []);

  const uploadFile = useCallback(async (
    file: File,
    options: CVUploadOptions = {}
  ): Promise<any> => {
    // Reset previous state
    setState(prev => ({
      ...prev,
      error: null,
      progress: 0,
      uploadResult: null
    }));

    // Validate file
    const validationError = validateFile(file, options);
    if (validationError) {
      setState(prev => ({
        ...prev,
        error: validationError
      }));
      options.onError?.(validationError);
      throw new Error(validationError);
    }

    // Start upload
    setState(prev => ({
      ...prev,
      isUploading: true,
      uploadedFile: file,
      error: null
    }));

    try {
      const result = await simulateUpload(file, (progress) => {
        setState(prev => ({ ...prev, progress }));
        options.onProgress?.(progress);
      });

      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadResult: result
      }));

      options.onSuccess?.(result);
      return result;

    } catch (error: any) {
      const errorMessage = error.message || 'Upload failed';
      
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }));

      options.onError?.(errorMessage);
      throw error;
    }
  }, [validateFile, simulateUpload]);

  return {
    state,
    uploadFile,
    resetUpload,
    isValidFileType,
    getFileTypeError
  };
}