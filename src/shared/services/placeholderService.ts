import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { 
  PlaceholderReplacementMap, 
  PlaceholderCustomizationResult,
  CVRecommendationWithPlaceholders 
} from '../types/placeholders';

const customizePlaceholders = httpsCallable<{
  jobId: string;
  recommendationId: string;
  placeholderValues: PlaceholderReplacementMap;
}, PlaceholderCustomizationResult>(functions, 'customizePlaceholders');

export class PlaceholderService {
  /**
   * Submits placeholder values for a recommendation
   */
  static async customizeRecommendation(
    jobId: string,
    recommendationId: string,
    placeholderValues: PlaceholderReplacementMap
  ): Promise<PlaceholderCustomizationResult> {
    try {
      console.warn(`Customizing recommendation ${recommendationId} with placeholders:`, placeholderValues);
      
      const result = await customizePlaceholders({
        jobId,
        recommendationId,
        placeholderValues
      });
      
      if (result.data.success) {
        console.warn('Placeholder customization successful:', result.data.data);
        return result.data;
      } else {
        throw new Error(result.data.error || 'Failed to customize placeholders');
      }
    } catch (error: any) {
      console.error('Error customizing placeholders:', error);
      throw new Error(error.message || 'Failed to customize placeholders');
    }
  }

  /**
   * Generates a real-time preview by replacing placeholders locally
   */
  static generatePreview(
    recommendation: CVRecommendationWithPlaceholders,
    placeholderValues: PlaceholderReplacementMap
  ): string {
    const content = recommendation.suggestedContent || '';
    
    if (!content || !recommendation.placeholders) {
      return content;
    }
    
    let previewContent = content;
    
    // Replace each placeholder with its corresponding value
    recommendation.placeholders.forEach(placeholder => {
      const value = placeholderValues[placeholder.placeholder];
      
      if (value && value.trim()) {
        const regex = new RegExp(
          `\\[${placeholder.placeholder.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\]`, 
          'g'
        );
        previewContent = previewContent.replace(regex, value);
      }
    });
    
    return previewContent;
  }

  /**
   * Validates placeholder values against their definitions
   */
  static validatePlaceholders(
    recommendation: CVRecommendationWithPlaceholders,
    values: PlaceholderReplacementMap
  ): Record<string, string> {
    const errors: Record<string, string> = {};
    
    if (!recommendation.placeholders) {
      return errors;
    }
    
    recommendation.placeholders.forEach(placeholder => {
      const value = values[placeholder.placeholder] || '';
      
      // Check required fields
      if (placeholder.required && !value.trim()) {
        errors[placeholder.placeholder] = `${placeholder.label} is required`;
        return;
      }
      
      // Check validation regex
      if (value && placeholder.validation && !placeholder.validation.test(value)) {
        errors[placeholder.placeholder] = `${placeholder.label} format is invalid. Example: ${placeholder.example}`;
        return;
      }
      
      // Type-specific validations
      if (value) {
        switch (placeholder.type) {
          case 'number':
            if (!/^\d+[,\d]*$/.test(value.replace(/,/g, ''))) {
              errors[placeholder.placeholder] = `${placeholder.label} must be a valid number`;
            }
            break;
            
          case 'percentage':
            if (!/^\d+$/.test(value)) {
              errors[placeholder.placeholder] = `${placeholder.label} must be a number (without % symbol)`;
            }
            break;
            
          case 'currency':
            if (!/^[\d,$kmb.]+$/i.test(value)) {
              errors[placeholder.placeholder] = `${placeholder.label} must be a valid amount (e.g., 1000, $1.5M, 500K)`;
            }
            break;
        }
      }
    });
    
    return errors;
  }

  /**
   * Formats placeholder values for better display
   */
  static formatPlaceholderValue(
    placeholder: { type: string; placeholder: string },
    value: string
  ): string {
    if (!value) return value;
    
    switch (placeholder.type) {
      case 'number': {
        // Add commas for large numbers
        const numValue = value.replace(/,/g, '');
        if (/^\d+$/.test(numValue)) {
          return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return value;
      }
        
      case 'percentage':
        // Ensure no % symbol (will be added by display)
        return value.replace('%', '');
        
      case 'currency':
        // Clean up currency formatting
        return value.replace(/^\$/, ''); // Remove leading $ if present
        
      default:
        return value;
    }
  }

  /**
   * Gets completion status for a recommendation
   */
  static getCompletionStatus(recommendation: CVRecommendationWithPlaceholders): {
    total: number;
    completed: number;
    isComplete: boolean;
  } {
    if (!recommendation.placeholders) {
      return { total: 0, completed: 0, isComplete: true };
    }
    
    const total = recommendation.placeholders.length;
    const completed = recommendation.placeholders.filter(
      p => recommendation.customizedContent?.includes(`[${p.placeholder}]`) === false
    ).length;
    
    return {
      total,
      completed,
      isComplete: completed === total
    };
  }
}