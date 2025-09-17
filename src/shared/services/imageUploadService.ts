/**
 * Image Upload Service
 * 
 * Handles profile picture uploads with validation, resizing, and Firebase Storage integration.
 * Provides secure image upload capabilities with proper error handling.
 */

import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// Replaced image-conversion with native Canvas API for better performance

/**
 * Compress image using native Canvas API
 */
async function compressImageWithCanvas(
  file: File, 
  options: { quality: number; width: number; height: number }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = options.width;
      canvas.height = options.height;
      
      ctx?.drawImage(img, 0, 0, options.width, options.height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        file.type,
        options.quality
      );
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}

export interface ImageUploadOptions {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  allowedTypes?: string[];
}

export interface ImageUploadResult {
  url: string;
  path: string;
  originalName: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export class ImageUploadService {
  private static readonly DEFAULT_OPTIONS: Required<ImageUploadOptions> = {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.8,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  };

  /**
   * Upload profile picture for a user
   */
  static async uploadProfilePicture(
    file: File, 
    userId: string, 
    jobId?: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    // Validate file
    this.validateFile(file, opts);
    
    try {
      // Get image dimensions
      const dimensions = await this.getImageDimensions(file);
      
      // Compress and resize if needed
      const processedFile = await this.processImage(file, opts, dimensions);
      
      // Generate unique filename
      const fileName = this.generateFileName(file.name, userId, jobId);
      
      // Create storage reference
      const storageRef = ref(storage, `profile-pictures/${userId}/${fileName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, processedFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: snapshot.ref.fullPath,
        originalName: file.name,
        size: processedFile.size,
        dimensions: await this.getImageDimensions(processedFile)
      };
      
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete existing profile picture
   */
  static async deleteProfilePicture(imagePath: string): Promise<void> {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Profile picture deletion failed:', error);
      // Don't throw error for deletion failures - just log them
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File, options: Required<ImageUploadOptions>): void {
    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > options.maxSizeBytes) {
      const maxSizeMB = (options.maxSizeBytes / 1024 / 1024).toFixed(1);
      throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
    }
    
    // Check if file exists
    if (!file.name) {
      throw new Error('Invalid file');
    }
  }

  /**
   * Get image dimensions
   */
  private static getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  /**
   * Process image (compress and resize)
   */
  private static async processImage(
    file: File, 
    options: Required<ImageUploadOptions>,
    originalDimensions: { width: number; height: number }
  ): Promise<File> {
    const { maxWidth, maxHeight, quality } = options;
    
    // Skip processing if image is already small enough
    if (originalDimensions.width <= maxWidth && 
        originalDimensions.height <= maxHeight && 
        file.size <= options.maxSizeBytes) {
      return file;
    }
    
    try {
      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(
        maxWidth / originalDimensions.width,
        maxHeight / originalDimensions.height
      );
      
      const newWidth = Math.round(originalDimensions.width * ratio);
      const newHeight = Math.round(originalDimensions.height * ratio);
      
      // Compress image using native Canvas API
      const compressedFile = await compressImageWithCanvas(file, {
        quality: quality / 100, // Canvas uses 0-1 range
        width: newWidth,
        height: newHeight,
      });
      
      // Convert blob back to file
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: Date.now()
      });
      
    } catch (error) {
      console.warn('Image processing failed, using original:', error);
      return file;
    }
  }

  /**
   * Generate unique filename
   */
  private static generateFileName(originalName: string, userId: string, jobId?: string): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop() || 'jpg';
    const prefix = jobId ? `${jobId}_` : '';
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${prefix}profile_${timestamp}_${random}.${extension}`;
  }

  /**
   * Create image preview URL for display before upload
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Validate image file on selection (client-side only)
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    const options = this.DEFAULT_OPTIONS;
    
    try {
      this.validateFile(file, options);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Invalid file' 
      };
    }
  }
}

export default ImageUploadService;