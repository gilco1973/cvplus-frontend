/**
 * usePlaceholderEditing Hook
 * 
 * Custom hook that provides access to placeholder editing functionality.
 * Simplifies integration with existing components and provides additional utilities.
 */

import { useCallback, useMemo } from 'react';
import { usePlaceholderEditingContext } from '../contexts/PlaceholderEditingContext';
import { PlaceholderInfo } from '../types/placeholders';
import { ValidationResult, PlaceholderEditingState } from '../types/inline-editing';

export interface UsePlaceholderEditingResult {
  /** Current state */
  state: PlaceholderEditingState;
  /** All context actions */
  actions: {
    /** Start editing a placeholder */
    startEditing: (placeholderId: string, initialValue: string) => void;
    /** Cancel editing a placeholder */
    cancelEditing: (placeholderId: string) => void;
    /** Update placeholder value (with debounced save) */
    updatePlaceholder: (placeholderId: string, value: string) => Promise<void>;
    /** Save placeholder immediately */
    savePlaceholder: (placeholderId: string, value: string) => Promise<void>;
    /** Get the current value for a placeholder */
    getPlaceholderValue: (placeholderId: string) => string | undefined;
    /** Check if a placeholder is currently being edited */
    isEditing: (placeholderId: string) => boolean;
    /** Check if a placeholder is currently saving */
    isSaving: (placeholderId: string) => boolean;
    /** Get error for a placeholder */
    getError: (placeholderId: string) => string | null;
    /** Clear error for a placeholder */
    clearError: (placeholderId: string) => void;
    /** Get overall completion progress */
    getProgress: () => { total: number; completed: number; percentage: number };
    /** Reset all editing states */
    reset: () => void;
  };
  /** Get completion status for all placeholders */
  getCompletionStatus: (placeholders: PlaceholderInfo[]) => {
    total: number;
    completed: number;
    isComplete: boolean;
    completionPercentage: number;
  };
  /** Validate a placeholder value */
  validatePlaceholder: (placeholder: PlaceholderInfo, value: string) => ValidationResult;
  /** Format a placeholder value according to its type */
  formatPlaceholderValue: (placeholder: PlaceholderInfo, value: string) => string;
  /** Get all current values */
  getAllValues: () => Record<string, string>;
  /** Get all current errors */
  getAllErrors: () => Record<string, string>;
  /** Check if there are unsaved changes */
  hasUnsavedChanges: () => boolean;
  /** Whether any placeholder is currently being edited */
  hasActiveEditing: boolean;
}

export const usePlaceholderEditing = (): UsePlaceholderEditingResult => {
  const context = usePlaceholderEditingContext();

  // Derived state
  const hasActiveEditing = useMemo(() => {
    return context.state.isEditingMode;
  }, [context.state.isEditingMode]);

  const hasUnsavedChanges = useCallback(() => {
    return Object.keys(context.state.editingStates).length > 0;
  }, [context.state.editingStates]);

  const getAllValues = useCallback(() => {
    return { ...context.state.placeholderValues };
  }, [context.state.placeholderValues]);

  const getAllErrors = useCallback(() => {
    return { ...context.state.errorStates };
  }, [context.state.errorStates]);

  // Get completion status for a set of placeholders
  const getCompletionStatus = useCallback((placeholders: PlaceholderInfo[]) => {
    const total = placeholders.length;
    let completed = 0;

    placeholders.forEach(placeholder => {
      const value = context.getPlaceholderValue(placeholder.key);
      if (value && value.trim()) {
        completed++;
      }
    });

    return {
      total,
      completed,
      isComplete: completed === total,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 100
    };
  }, [context.getPlaceholderValue]);

  // Validate a placeholder value
  const validatePlaceholder = useCallback((placeholder: PlaceholderInfo, value: string): ValidationResult => {
    if (!value.trim()) {
      if (placeholder.required) {
        return { isValid: false, error: `${placeholder.label} is required` };
      }
      return { isValid: true };
    }

    // Custom validation regex takes precedence over type-specific validation
    if (placeholder.validation) {
      if (!placeholder.validation.test(value)) {
        return { 
          isValid: false, 
          error: `${placeholder.label} format is invalid. Example: ${placeholder.example}` 
        };
      }
      // If custom validation passes, return success without type-specific validation
      return { isValid: true, formattedValue: formatPlaceholderValue(placeholder, value) };
    }

    // Type-specific validation (only if no custom regex is provided)
    switch (placeholder.type) {
      case 'number': {
        const numValue = value.replace(/,/g, '');
        if (!/^\d+$/.test(numValue)) {
          return { isValid: false, error: `${placeholder.label} must be a valid number` };
        }
        return { isValid: true, formattedValue: formatPlaceholderValue(placeholder, value) };
      }

      case 'percentage': {
        if (!/^\d+$/.test(value)) {
          return { isValid: false, error: `${placeholder.label} must be a number (without % symbol)` };
        }
        const percentValue = parseInt(value, 10);
        if (percentValue < 0 || percentValue > 100) {
          return { isValid: false, error: `${placeholder.label} must be between 0 and 100` };
        }
        return { isValid: true, formattedValue: value };
      }

      case 'currency':
        if (!/^[\d,$kmb\.]+$/i.test(value)) {
          return { isValid: false, error: `${placeholder.label} must be a valid amount (e.g., 1000, $1.5M, 500K)` };
        }
        return { isValid: true, formattedValue: value };

      case 'text':
      case 'timeframe':
        if (value.length > 100) {
          return { isValid: false, error: `${placeholder.label} must be less than 100 characters` };
        }
        return { isValid: true, formattedValue: value };

      default:
        return { isValid: true, formattedValue: value };
    }
  }, []);

  // Format placeholder value according to its type
  const formatPlaceholderValue = useCallback((placeholder: PlaceholderInfo, value: string): string => {
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

      case 'text':
      case 'timeframe': {
        // Trim whitespace and capitalize first letter
        const trimmed = value.trim();
        return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
      }

      default:
        return value;
    }
  }, []);

  // Create actions object
  const actions = useMemo(() => ({
    startEditing: context.startEditing,
    cancelEditing: context.cancelEditing,
    updatePlaceholder: context.updatePlaceholder,
    savePlaceholder: context.savePlaceholder,
    getPlaceholderValue: context.getPlaceholderValue,
    isEditing: context.isEditing,
    isSaving: context.isSaving,
    getError: context.getError,
    clearError: context.clearError,
    getProgress: context.getProgress,
    reset: context.reset
  }), [
    context.startEditing,
    context.cancelEditing,
    context.updatePlaceholder,
    context.savePlaceholder,
    context.getPlaceholderValue,
    context.isEditing,
    context.isSaving,
    context.getError,
    context.clearError,
    context.getProgress,
    context.reset
  ]);

  return {
    state: context.state,
    actions,
    getCompletionStatus,
    validatePlaceholder,
    formatPlaceholderValue,
    getAllValues,
    getAllErrors,
    hasUnsavedChanges,
    hasActiveEditing
  };
};

export default usePlaceholderEditing;