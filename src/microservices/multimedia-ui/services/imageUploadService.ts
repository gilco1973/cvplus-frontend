// @ts-ignore
/**
 * Image Upload Service
 * Handles image uploads, validation, processing, and Firebase Storage integration
  */

import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { initializeApp, getApps } from 'firebase/app';

// Initialize Firebase if not already initialized
if (!getApps().length) {
  const firebaseConfig = {
    // Firebase config will be loaded from environment
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
  };
  initializeApp(firebaseConfig);
}

export interface ImageUploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
  metadata?: {
    size: number;
    type: string;
    name: string;
    lastModified: number;
  };
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export class ImageUploadService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ];
  private static readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  /**
   * Validates an image file
    */
  static validateImageFile(file: File): ValidationResult {
    const warnings: string[] = [];

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`
      };
    }

    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      warnings.push(`Unusual file extension: ${extension}`);
    }

    // Warn about large files
    if (file.size > 5 * 1024 * 1024) {
      warnings.push('Large file size may affect upload performance');
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Creates a preview URL for an image file
    */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revokes a preview URL to free memory
    */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Uploads a profile picture to Firebase Storage
    */
  static async uploadProfilePicture(
    file: File,
    userId: string,
    jobId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ImageUploadResult> {
    try {
      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase();
      const basePath = jobId ? `profiles/${userId}/${jobId}` : `profiles/${userId}`;
      const fileName = `profile_${timestamp}.${extension}`;
      const filePath = `${basePath}/${fileName}`;

      // Get Firebase Storage reference
      const storage = getStorage();
      const storageRef = ref(storage, filePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          jobId: jobId || '',
          originalName: file.name,
          uploadTimestamp: timestamp.toString()
        }
      });

      // Handle progress updates
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as UploadProgress['state']
          };
          onProgress(progress);
        });
      }

      // Wait for upload completion
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        path: filePath,
        success: true,
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        }
      };

    } catch (error) {
      console.error('Profile picture upload failed:', error);
      return {
        url: '',
        path: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Uploads a general media file
    */
  static async uploadMediaFile(
    file: File,
    userId: string,
    category: 'portfolio' | 'documents' | 'media' | 'profiles' = 'media',
    jobId?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ImageUploadResult> {
    try {
      // For non-profile images, we might have different validation rules
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate file path
      const timestamp = Date.now();
      const extension = file.name.split('.').pop()?.toLowerCase();
      const basePath = jobId ? `${category}/${userId}/${jobId}` : `${category}/${userId}`;
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${timestamp}.${extension}`;
      const filePath = `${basePath}/${fileName}`;

      // Get Firebase Storage reference
      const storage = getStorage();
      const storageRef = ref(storage, filePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: userId,
          jobId: jobId || '',
          category,
          originalName: file.name,
          uploadTimestamp: timestamp.toString()
        }
      });

      // Handle progress updates
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as UploadProgress['state']
          };
          onProgress(progress);
        });
      }

      // Wait for upload completion
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      return {
        url: downloadURL,
        path: filePath,
        success: true,
        metadata: {
          size: file.size,
          type: file.type,
          name: file.name,
          lastModified: file.lastModified
        }
      };

    } catch (error) {
      console.error('Media file upload failed:', error);
      return {
        url: '',
        path: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Deletes a file from Firebase Storage
    */
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      return false;
    }
  }

  /**
   * Compresses an image before upload (client-side)
    */
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Legacy exports for backwards compatibility
export const uploadImage = ImageUploadService.uploadProfilePicture;
export { ImageUploadService as default };