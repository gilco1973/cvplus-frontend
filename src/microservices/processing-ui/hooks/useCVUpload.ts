// CV upload hook for cv-processing-ui microservice
import { useState } from 'react';
import { useCVProcessing } from '../contexts/CVProcessingContext';
import { createLogger } from '@cvplus/logging';
import type { CVUploadData, CV } from '../types/cv';
import { FILE_UPLOAD_CONSTRAINTS } from '../constants/cvConstants';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:upload');

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedCV: CV | null;
}

interface UploadValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useCVUpload() {
  const { uploadCV } = useCVProcessing();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedCV: null
  });

  const validateFile = (file: File): UploadValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > FILE_UPLOAD_CONSTRAINTS.maxSize) {
      errors.push(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${FILE_UPLOAD_CONSTRAINTS.maxSize / 1024 / 1024}MB)`);
    }

    // Check file type
    if (!FILE_UPLOAD_CONSTRAINTS.allowedTypes.includes(file.type)) {
      errors.push(`File type "${file.type}" is not supported. Allowed types: ${FILE_UPLOAD_CONSTRAINTS.allowedExtensions.join(', ')}`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!FILE_UPLOAD_CONSTRAINTS.allowedExtensions.includes(extension)) {
      errors.push(`File extension "${extension}" is not supported. Allowed extensions: ${FILE_UPLOAD_CONSTRAINTS.allowedExtensions.join(', ')}`);
    }

    // Warnings for optimal file types
    if (file.type === 'text/plain') {
      warnings.push('Plain text files may not preserve formatting. Consider using PDF or DOCX for better results.');
    }

    if (file.size < 1024) {
      warnings.push('File appears to be very small. Make sure it contains your complete CV content.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const uploadFile = async (
    file: File,
    options: {
      extractText?: boolean;
      preserveFormatting?: boolean;
    } = {}
  ): Promise<CV> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        uploadedCV: null
      }));

      logger.info('Starting file upload', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        options
      });

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.errors.join('; '));
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        logger.warn('File upload warnings', { warnings: validation.warnings });
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90)
        }));
      }, 200);

      const uploadData: CVUploadData = {
        file,
        extractText: options.extractText ?? true,
        preserveFormatting: options.preserveFormatting ?? true
      };

      const uploadedCV = await uploadCV(uploadData);

      clearInterval(progressInterval);

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
        uploadedCV
      }));

      logger.info('File upload completed successfully', {
        cvId: uploadedCV.id,
        fileName: file.name
      });

      return uploadedCV;
    } catch (error) {
      logger.error('File upload failed', error);

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));

      throw error;
    }
  };

  const uploadFromUrl = async (
    url: string,
    options: {
      extractText?: boolean;
      preserveFormatting?: boolean;
    } = {}
  ): Promise<CV> => {
    try {
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
        uploadedCV: null
      }));

      logger.info('Starting URL upload', { url, options });

      // TODO: Implement URL download and conversion to File
      // For now, throw error as not implemented
      throw new Error('URL upload not yet implemented');

    } catch (error) {
      logger.error('URL upload failed', error);

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'URL upload failed'
      }));

      throw error;
    }
  };

  const clearUploadState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedCV: null
    });
    logger.info('Upload state cleared');
  };

  const retryUpload = async (
    file: File,
    options: {
      extractText?: boolean;
      preserveFormatting?: boolean;
    } = {}
  ): Promise<CV> => {
    logger.info('Retrying file upload', { fileName: file.name });
    return uploadFile(file, options);
  };

  return {
    // State
    isUploading: uploadState.isUploading,
    progress: uploadState.progress,
    error: uploadState.error,
    uploadedCV: uploadState.uploadedCV,

    // Actions
    uploadFile,
    uploadFromUrl,
    validateFile,
    clearUploadState,
    retryUpload,

    // Utilities
    constraints: FILE_UPLOAD_CONSTRAINTS
  };
}