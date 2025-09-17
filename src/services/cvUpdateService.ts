/**
 * CV Update Service
 * 
 * Handles updating CV data including profile pictures and other personal information.
 * Provides methods to update CV data both locally and on the server.
 */

import { functions } from '../lib/firebase';
import { httpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { PlaceholderUpdateRequest, PlaceholderUpdateResponse } from '../types/inline-editing';

export interface CVUpdateData {
  profilePicture?: {
    url: string;
    path: string;
    uploadedAt: string;
  };
  personalInfo?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    summary?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface CVUpdateResponse {
  success: boolean;
  message: string;
  updatedData?: any;
  error?: string;
}

export class CVUpdateService {
  /**
   * Update CV profile picture
   */
  static async updateProfilePicture(
    jobId: string,
    imageUrl: string,
    imagePath: string
  ): Promise<CVUpdateResponse> {
    try {
      const updateCVData = httpsCallable(functions, 'updateCVData');
      
      const updateData: CVUpdateData = {
        profilePicture: {
          url: imageUrl,
          path: imagePath,
          uploadedAt: new Date().toISOString()
        },
        personalInfo: {
          avatar: imageUrl
        }
      };

      const result = await updateCVData({
        jobId,
        updateData,
        updateType: 'profilePicture'
      });

      const response = result.data as CVUpdateResponse;
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Update failed');
      }
      
    } catch (error) {
      console.error('Profile picture update failed:', error);
      return {
        success: false,
        message: 'Failed to update profile picture',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update personal information
   */
  static async updatePersonalInfo(
    jobId: string,
    personalInfo: CVUpdateData['personalInfo']
  ): Promise<CVUpdateResponse> {
    try {
      const updateCVData = httpsCallable(functions, 'updateCVData');
      
      const updateData: CVUpdateData = {
        personalInfo
      };

      const result = await updateCVData({
        jobId,
        updateData,
        updateType: 'personalInfo'
      });

      const response = result.data as CVUpdateResponse;
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Update failed');
      }
      
    } catch (error) {
      console.error('Personal info update failed:', error);
      return {
        success: false,
        message: 'Failed to update personal information',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generic CV data update
   */
  static async updateCVData(
    jobId: string,
    updateData: CVUpdateData,
    updateType = 'general'
  ): Promise<CVUpdateResponse> {
    try {
      const updateCVDataFunction = httpsCallable(functions, 'updateCVData');
      
      const result = await updateCVDataFunction({
        jobId,
        updateData,
        updateType
      });

      const response = result.data as CVUpdateResponse;
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Update failed');
      }
      
    } catch (error) {
      console.error('CV data update failed:', error);
      return {
        success: false,
        message: 'Failed to update CV data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update profile picture with optimistic updates
   */
  static async updateProfilePictureOptimistic(
    jobId: string,
    imageUrl: string,
    imagePath: string,
    onOptimisticUpdate?: (url: string) => void
  ): Promise<CVUpdateResponse> {
    // Optimistic update - update UI immediately
    if (onOptimisticUpdate) {
      onOptimisticUpdate(imageUrl);
    }

    try {
      const response = await this.updateProfilePicture(jobId, imageUrl, imagePath);
      
      if (response.success) {
        toast.success('Profile picture updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update profile picture');
        // Revert optimistic update if needed
        if (onOptimisticUpdate) {
          onOptimisticUpdate(''); // Clear the optimistic update
        }
      }
      
      return response;
      
    } catch (error) {
      toast.error('Failed to update profile picture');
      // Revert optimistic update
      if (onOptimisticUpdate) {
        onOptimisticUpdate(''); // Clear the optimistic update
      }
      
      return {
        success: false,
        message: 'Update failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate update data before sending
   */
  static validateUpdateData(updateData: CVUpdateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate profile picture data
    if (updateData.profilePicture) {
      if (!updateData.profilePicture.url) {
        errors.push('Profile picture URL is required');
      }
      if (!updateData.profilePicture.path) {
        errors.push('Profile picture path is required');
      }
    }

    // Validate personal info
    if (updateData.personalInfo) {
      const personalInfo = updateData.personalInfo;
      
      // Validate email format if provided
      if (personalInfo.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
        errors.push('Invalid email format');
      }
      
      // Validate URL formats if provided
      if (personalInfo.website && !this.isValidUrl(personalInfo.website)) {
        errors.push('Invalid website URL');
      }
      
      if (personalInfo.linkedin && !this.isValidUrl(personalInfo.linkedin)) {
        errors.push('Invalid LinkedIn URL');
      }
      
      if (personalInfo.github && !this.isValidUrl(personalInfo.github)) {
        errors.push('Invalid GitHub URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Update a specific placeholder value
   */
  static async updatePlaceholder(request: PlaceholderUpdateRequest): Promise<PlaceholderUpdateResponse> {
    try {
      const updatePlaceholderFunction = httpsCallable(functions, 'updatePlaceholderValue');
      
      const result = await updatePlaceholderFunction({
        jobId: request.jobId,
        placeholderKey: request.placeholderKey,
        value: request.value,
        section: request.section,
        fieldPath: request.fieldPath,
        type: request.type,
        metadata: request.metadata
      });
      
      const response = result.data as PlaceholderUpdateResponse;
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.error || 'Failed to update placeholder');
      }
      
    } catch (error) {
      console.error('Placeholder update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Update multiple placeholders in batch
   */
  static async updatePlaceholdersBatch(
    requests: PlaceholderUpdateRequest[]
  ): Promise<{ success: boolean; results: PlaceholderUpdateResponse[]; errors: string[] }> {
    const results: PlaceholderUpdateResponse[] = [];
    const errors: string[] = [];

    try {
      // Process updates in parallel for better performance
      const promises = requests.map(request => 
        this.updatePlaceholder(request).catch(error => {
          errors.push(`Failed to update ${request.placeholderKey}: ${error.message}`);
          return {
            success: false,
            error: error.message,
            errorDetails: {
              code: 'BATCH_UPDATE_FAILED',
              message: error.message
            }
          } as PlaceholderUpdateResponse;
        })
      );

      const updateResults = await Promise.all(promises);
      results.push(...updateResults);

      return {
        success: errors.length === 0,
        results,
        errors
      };

    } catch (error) {
      console.error('Batch placeholder update failed:', error);
      return {
        success: false,
        results,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update placeholder with optimistic UI updates
   */
  static async updatePlaceholderOptimistic(
    request: PlaceholderUpdateRequest,
    onOptimisticUpdate?: (placeholderKey: string, value: string) => void,
    onRevert?: (placeholderKey: string) => void
  ): Promise<PlaceholderUpdateResponse> {
    // Optimistic update - update UI immediately
    if (onOptimisticUpdate) {
      onOptimisticUpdate(request.placeholderKey, request.value);
    }

    try {
      const result = await this.updatePlaceholder(request);
      
      if (!result.success && onRevert) {
        // Revert optimistic update on failure
        onRevert(request.placeholderKey);
      }
      
      return result;
      
    } catch (error) {
      // Revert optimistic update on error
      if (onRevert) {
        onRevert(request.placeholderKey);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorDetails: {
          code: 'OPTIMISTIC_UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Validate placeholder update request
   */
  static validatePlaceholderUpdate(request: PlaceholderUpdateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.jobId || request.jobId.trim() === '') {
      errors.push('Job ID is required');
    }

    if (!request.placeholderKey || request.placeholderKey.trim() === '') {
      errors.push('Placeholder key is required');
    }

    if (!request.value || request.value.trim() === '') {
      errors.push('Placeholder value is required');
    }

    if (!request.section || request.section.trim() === '') {
      errors.push('Section is required');
    }

    if (!request.fieldPath || request.fieldPath.trim() === '') {
      errors.push('Field path is required');
    }

    if (!request.type) {
      errors.push('Placeholder type is required');
    }

    // Validate placeholder key format
    if (request.placeholderKey && !/^\[.+\]$/.test(request.placeholderKey)) {
      errors.push('Invalid placeholder key format (should be [PLACEHOLDER_NAME])');
    }

    // Validate type-specific values
    if (request.type && request.value) {
      switch (request.type) {
        case 'number':
          if (!/^[\d,]+$/.test(request.value.replace(/,/g, ''))) {
            errors.push('Invalid number format');
          }
          break;
        case 'percentage': {
          const percentValue = parseInt(request.value, 10);
          if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
            errors.push('Percentage must be between 0 and 100');
          }
          break;
        }
        case 'currency':
          if (!/^[\d$,kmb.]+$/i.test(request.value)) {
            errors.push('Invalid currency format');
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Simple URL validation
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Create instance for use in context
export const cvUpdateService = CVUpdateService;

export default CVUpdateService;