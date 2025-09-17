// @ts-ignore
/**
 * Upload Components
 * 
 * Comprehensive file upload and management components for the multimedia module.
 * Provides drag-and-drop upload, progress tracking, image cropping, and file validation.
  */

// Main Upload Components
export { default as FileUpload } from '../utilities/FileUpload';
export { default as ProfilePictureUpload } from '../utilities/ProfilePictureUpload';
export { default as MediaUploadManager } from '../utilities/MediaUploadManager';

// Upload Processing Components
export { default as UploadProgress } from '../utilities/UploadProgress';
export { default as ImageCropper } from '../utilities/ImageCropper';
export { default as FileValidator } from '../utilities/FileValidator';

// Upload Services
export { ImageUploadService, default as ImageUploadServiceDefault } from '../../services/imageUploadService';

// Upload Types
export type { UploadProgressItem } from '../utilities/UploadProgress';
export type { ValidationRule, ValidationResult, FileValidationReport } from '../utilities/FileValidator';

// Upload Utilities
export * from '../utilities/validation';
export * from '../utilities/types';