/**
 * PlaceholderEditingContext
 * 
 * Provides state management for the inline placeholder editing system.
 * Handles editing sessions, optimistic updates, and server synchronization.
 */

import React, { createContext, useContext, useReducer, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  PlaceholderEditingState,
  PlaceholderEditingContextValue,
  PlaceholderEditingConfig,
  PlaceholderUpdateRequest,
  PlaceholderUpdateResponse
} from '../types/inline-editing';
import { cvUpdateService } from '../services/cvUpdateService';
import toast from 'react-hot-toast';

// Action types for the reducer
type PlaceholderEditingAction =
  | { type: 'START_EDITING'; placeholderId: string; initialValue: string }
  | { type: 'CANCEL_EDITING'; placeholderId: string }
  | { type: 'UPDATE_VALUE'; placeholderId: string; value: string }
  | { type: 'SET_SAVING'; placeholderId: string; isSaving: boolean }
  | { type: 'SET_ERROR'; placeholderId: string; error: string | null }
  | { type: 'SAVE_SUCCESS'; placeholderId: string; value: string }
  | { type: 'UPDATE_PROGRESS'; total: number; completed: number }
  | { type: 'RESET_STATE' };

// Initial state
const INITIAL_STATE: PlaceholderEditingState = {
  editingStates: {},
  placeholderValues: {},
  savingStates: {},
  errorStates: {},
  isEditingMode: false,
  progress: {
    total: 0,
    completed: 0,
    percentage: 0
  }
};

// Reducer function
const placeholderEditingReducer = (
  state: PlaceholderEditingState,
  action: PlaceholderEditingAction
): PlaceholderEditingState => {
  switch (action.type) {
    case 'START_EDITING':
      return {
        ...state,
        editingStates: {
          ...state.editingStates,
          [action.placeholderId]: {
            isEditing: true,
            editingValue: action.initialValue,
            isSaving: false,
            error: null,
            isDirty: false
          }
        },
        isEditingMode: true
      };

    case 'CANCEL_EDITING': {
      const { [action.placeholderId]: cancelled, ...restEditingStates } = state.editingStates;
      return {
        ...state,
        editingStates: restEditingStates,
        errorStates: {
          ...state.errorStates,
          [action.placeholderId]: null
        },
        isEditingMode: Object.keys(restEditingStates).length > 0
      };
    }

    case 'UPDATE_VALUE':
      return {
        ...state,
        editingStates: {
          ...state.editingStates,
          [action.placeholderId]: {
            ...state.editingStates[action.placeholderId],
            editingValue: action.value,
            isDirty: true
          }
        }
      };

    case 'SET_SAVING':
      return {
        ...state,
        savingStates: {
          ...state.savingStates,
          [action.placeholderId]: action.isSaving
        },
        editingStates: {
          ...state.editingStates,
          [action.placeholderId]: {
            ...state.editingStates[action.placeholderId],
            isSaving: action.isSaving
          }
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        errorStates: {
          ...state.errorStates,
          [action.placeholderId]: action.error
        },
        editingStates: {
          ...state.editingStates,
          [action.placeholderId]: {
            ...state.editingStates[action.placeholderId],
            error: action.error
          }
        }
      };

    case 'SAVE_SUCCESS': {
      const { [action.placeholderId]: savedState, ...restStates } = state.editingStates;
      return {
        ...state,
        placeholderValues: {
          ...state.placeholderValues,
          [action.placeholderId]: action.value
        },
        editingStates: restStates,
        savingStates: {
          ...state.savingStates,
          [action.placeholderId]: false
        },
        errorStates: {
          ...state.errorStates,
          [action.placeholderId]: null
        },
        isEditingMode: Object.keys(restStates).length > 0
      };
    }

    case 'UPDATE_PROGRESS': {
      const percentage = action.total > 0 ? Math.round((action.completed / action.total) * 100) : 100;
      return {
        ...state,
        progress: {
          total: action.total,
          completed: action.completed,
          percentage
        }
      };
    }

    case 'RESET_STATE':
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Context creation
const PlaceholderEditingContext = createContext<PlaceholderEditingContextValue | null>(null);

// Provider props
interface PlaceholderEditingProviderProps {
  children: React.ReactNode;
  jobId: string;
  config?: Partial<PlaceholderEditingConfig>;
}

// Default configuration
const DEFAULT_CONFIG: PlaceholderEditingConfig = {
  debounceDelay: 500,
  maxRetries: 3,
  retryDelay: 1000,
  optimisticUpdates: true,
  autoFocus: true,
  showProgress: true
};

export const PlaceholderEditingProvider: React.FC<PlaceholderEditingProviderProps> = ({
  children,
  jobId,
  config = {}
}) => {
  const [state, dispatch] = useReducer(placeholderEditingReducer, INITIAL_STATE);
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const saveTimeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Start editing a placeholder
  const startEditing = useCallback((placeholderId: string, initialValue: string) => {
    dispatch({ type: 'START_EDITING', placeholderId, initialValue });
  }, []);

  // Cancel editing a placeholder
  const cancelEditing = useCallback((placeholderId: string) => {
    // Clear any pending save timeout
    if (saveTimeoutRefs.current[placeholderId]) {
      clearTimeout(saveTimeoutRefs.current[placeholderId]);
      delete saveTimeoutRefs.current[placeholderId];
    }
    dispatch({ type: 'CANCEL_EDITING', placeholderId });
  }, []);

  // Save placeholder immediately
  const savePlaceholder = useCallback(async (placeholderId: string, value: string): Promise<void> => {
    dispatch({ type: 'SET_SAVING', placeholderId, isSaving: true });
    dispatch({ type: 'SET_ERROR', placeholderId, error: null });

    try {
      // Parse placeholder information from ID
      const [section, fieldPath, placeholderKey] = placeholderId.split('::');
      
      // Create update request
      const updateRequest: PlaceholderUpdateRequest = {
        jobId,
        section: section || 'general',
        fieldPath: fieldPath || placeholderId,
        placeholderKey: placeholderKey || placeholderId,
        value,
        type: 'text', // Will be enhanced to detect type from placeholder
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      };

      // Call the extended CV update service
      const response: PlaceholderUpdateResponse = await cvUpdateService.updatePlaceholder(updateRequest);

      if (response.success) {
        dispatch({ type: 'SAVE_SUCCESS', placeholderId, value });
        
        // Update progress if provided
        if (response.data?.progress) {
          dispatch({ 
            type: 'UPDATE_PROGRESS', 
            total: response.data.progress.total,
            completed: response.data.progress.completed
          });
        }
        
        toast.success('Changes saved');
      } else {
        throw new Error(response.error || 'Failed to save placeholder');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SET_ERROR', placeholderId, error: errorMessage });
      dispatch({ type: 'SET_SAVING', placeholderId, isSaving: false });
      
      console.error('Failed to save placeholder:', error);
      toast.error('Failed to save changes. Please try again.');
      
      throw error;
    }
  }, [jobId]);

  // Update placeholder value with debounced save
  const updatePlaceholder = useCallback(async (placeholderId: string, value: string): Promise<void> => {
    // Clear existing timeout
    if (saveTimeoutRefs.current[placeholderId]) {
      clearTimeout(saveTimeoutRefs.current[placeholderId]);
    }

    // Set new timeout for debounced save
    saveTimeoutRefs.current[placeholderId] = setTimeout(() => {
      savePlaceholder(placeholderId, value);
      delete saveTimeoutRefs.current[placeholderId];
    }, mergedConfig.debounceDelay);
  }, [savePlaceholder, mergedConfig.debounceDelay]);

  // Get placeholder value
  const getPlaceholderValue = useCallback((placeholderId: string): string | undefined => {
    // Check if currently editing
    const editingState = state.editingStates[placeholderId];
    if (editingState?.isEditing) {
      return editingState.editingValue;
    }
    
    // Return saved value
    return state.placeholderValues[placeholderId];
  }, [state.editingStates, state.placeholderValues]);

  // Check if placeholder is being edited
  const isEditing = useCallback((placeholderId: string): boolean => {
    return state.editingStates[placeholderId]?.isEditing || false;
  }, [state.editingStates]);

  // Check if placeholder is saving
  const isSaving = useCallback((placeholderId: string): boolean => {
    return state.savingStates[placeholderId] || false;
  }, [state.savingStates]);

  // Get error for placeholder
  const getError = useCallback((placeholderId: string): string | null => {
    return state.errorStates[placeholderId] || null;
  }, [state.errorStates]);

  // Clear error for placeholder
  const clearError = useCallback((placeholderId: string) => {
    dispatch({ type: 'SET_ERROR', placeholderId, error: null });
  }, []);

  // Get progress information
  const getProgress = useCallback(() => {
    return state.progress;
  }, [state.progress]);

  // Reset all states
  const reset = useCallback(() => {
    // Clear all timeouts
    Object.values(saveTimeoutRefs.current).forEach(timeout => {
      clearTimeout(timeout);
    });
    saveTimeoutRefs.current = {};
    
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Context value
  const contextValue = useMemo((): PlaceholderEditingContextValue => ({
    state,
    startEditing,
    cancelEditing,
    updatePlaceholder,
    savePlaceholder,
    getPlaceholderValue,
    isEditing,
    isSaving,
    getError,
    clearError,
    getProgress,
    reset
  }), [
    state,
    startEditing,
    cancelEditing,
    updatePlaceholder,
    savePlaceholder,
    getPlaceholderValue,
    isEditing,
    isSaving,
    getError,
    clearError,
    getProgress,
    reset
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return (
    <PlaceholderEditingContext.Provider value={contextValue}>
      {children}
    </PlaceholderEditingContext.Provider>
  );
};

// Custom hook to use the context
export const usePlaceholderEditingContext = (): PlaceholderEditingContextValue => {
  const context = useContext(PlaceholderEditingContext);
  if (!context) {
    throw new Error('usePlaceholderEditingContext must be used within a PlaceholderEditingProvider');
  }
  return context;
};

export default PlaceholderEditingContext;