/**
 * Inline Placeholder Editing Types
 * 
 * Type definitions for the inline placeholder editing system that allows
 * users to click and edit placeholders directly in the CV preview.
 */

import { PlaceholderInfo, PlaceholderReplacementMap } from './placeholders';

/**
 * Enhanced placeholder match with position and context information
 */
export interface PlaceholderMatch {
  /** Unique identifier for this placeholder instance */
  id: string;
  
  /** The placeholder key without brackets (e.g., "INSERT TEAM SIZE") */
  key: string;
  
  /** The full placeholder text including brackets (e.g., "[INSERT TEAM SIZE]") */
  fullMatch: string;
  
  /** Type of placeholder for appropriate input component */
  type: 'text' | 'number' | 'percentage' | 'currency' | 'timeframe';
  
  /** Display label for the placeholder */
  label: string;
  
  /** Help text to guide user input */
  helpText: string;
  
  /** Example value for the placeholder */
  example: string;
  
  /** Whether this placeholder is required */
  required: boolean;
  
  /** Validation regex if applicable */
  validation?: RegExp;
  
  /** Position of the placeholder in the text */
  startIndex: number;
  endIndex: number;
  
  /** Field path in the CV data structure (e.g., "experience.0.description") */
  fieldPath: string;
  
  /** Section of the CV (e.g., "experience", "skills", "personalInfo") */
  section: string;
  
  /** Current value if the placeholder has been filled */
  currentValue?: string;
}

/**
 * State for managing placeholder editing across the application
 */
export interface PlaceholderEditingState {
  /** Map of placeholder IDs to their editing states */
  editingStates: Record<string, PlaceholderInstanceState>;
  
  /** Map of field paths to their placeholder values */
  placeholderValues: Record<string, PlaceholderReplacementMap>;
  
  /** Loading states for save operations */
  savingStates: Record<string, boolean>;
  
  /** Error states for failed operations */
  errorStates: Record<string, string | null>;
  
  /** Global editing mode flag */
  isEditingMode: boolean;
  
  /** Progress tracking */
  progress: {
    total: number;
    completed: number;
    percentage: number;
  };
}

/**
 * State for individual placeholder instance
 */
export interface PlaceholderInstanceState {
  /** Whether this placeholder is currently being edited */
  isEditing: boolean;
  
  /** Current input value during editing */
  editingValue: string;
  
  /** Whether a save operation is in progress */
  isSaving: boolean;
  
  /** Validation error message if any */
  error: string | null;
  
  /** Whether the placeholder has been modified */
  isDirty: boolean;
  
  /** Timestamp of last successful save */
  lastSaved?: Date;
}

/**
 * Request payload for updating placeholder values
 */
export interface PlaceholderUpdateRequest {
  /** Job ID for the CV */
  jobId: string;
  
  /** Section of the CV being updated */
  section: string;
  
  /** Field path within the section */
  fieldPath: string;
  
  /** Placeholder key being updated */
  placeholderKey: string;
  
  /** New value for the placeholder */
  value: string;
  
  /** Type of the placeholder for validation */
  type: PlaceholderMatch['type'];
  
  /** Metadata for tracking */
  metadata?: {
    previousValue?: string;
    timestamp: string;
    userAgent?: string;
  };
}

/**
 * Response from placeholder update operation
 */
export interface PlaceholderUpdateResponse {
  /** Whether the operation was successful */
  success: boolean;
  
  /** Response data on success */
  data?: {
    /** The field path that was updated */
    updatedFieldPath: string;
    
    /** The new value that was saved */
    newValue: string;
    
    /** Updated progress statistics */
    progress: {
      total: number;
      completed: number;
      percentage: number;
    };
    
    /** Timestamp of the update */
    updatedAt: string;
  };
  
  /** Error message on failure */
  error?: string;
  
  /** Additional error details for debugging */
  errorDetails?: {
    code: string;
    message: string;
    field?: string;
  };
}

/**
 * Props for the EditablePlaceholder component
 */
export interface EditablePlaceholderProps {
  /** The placeholder match information */
  placeholder: PlaceholderMatch;
  
  /** Current value of the placeholder */
  value?: string;
  
  /** Callback when the value is updated */
  onUpdate: (value: string) => void;
  
  /** Whether the placeholder is in read-only mode */
  readOnly?: boolean;
  
  /** Custom CSS classes */
  className?: string;
  
  /** Custom styling options */
  style?: React.CSSProperties;
  
  /** Whether to show validation errors inline */
  showErrors?: boolean;
  
  /** Custom validation function */
  customValidator?: (value: string) => string | null;
  
  /** Callback when editing starts */
  onEditStart?: () => void;
  
  /** Callback when editing ends */
  onEditEnd?: () => void;
}

/**
 * Props for placeholder input components
 */
export interface PlaceholderInputProps {
  /** Current value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Blur handler (when user finishes editing) */
  onBlur: () => void;
  
  /** Key press handler */
  onKeyPress: (event: React.KeyboardEvent) => void;
  
  /** Placeholder text */
  placeholder: string;
  
  /** Whether the input has an error */
  hasError: boolean;
  
  /** Error message to display */
  errorMessage?: string;
  
  /** Whether the input is currently saving */
  isSaving: boolean;
  
  /** Additional props specific to the input type */
  inputProps?: Record<string, any>;
  
  /** Auto-focus the input when it appears */
  autoFocus?: boolean;
  
  /** Maximum length for the input */
  maxLength?: number;
  
  /** Minimum value for number inputs */
  min?: number;
  
  /** Maximum value for number inputs */
  max?: number;
}

/**
 * Context value for placeholder editing
 */
export interface PlaceholderEditingContextValue {
  /** Current state */
  state: PlaceholderEditingState;
  
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
}

/**
 * Configuration options for the placeholder editing system
 */
export interface PlaceholderEditingConfig {
  /** Debounce delay for auto-save in milliseconds */
  debounceDelay: number;
  
  /** Maximum retry attempts for failed saves */
  maxRetries: number;
  
  /** Retry delay in milliseconds */
  retryDelay: number;
  
  /** Whether to use optimistic updates */
  optimisticUpdates: boolean;
  
  /** Whether to auto-focus inputs when editing starts */
  autoFocus: boolean;
  
  /** Whether to show progress indicators */
  showProgress: boolean;
  
  /** Custom validation rules */
  validationRules?: Record<string, RegExp>;
  
  /** Custom formatting functions */
  formatters?: Record<string, (value: string) => string>;
}

/**
 * Utility type for text segments that can contain editable placeholders
 */
export interface TextSegment {
  /** Type of segment */
  type: 'text' | 'placeholder';
  
  /** Content of the segment */
  content: string;
  
  /** Placeholder information if type is 'placeholder' */
  placeholder?: PlaceholderMatch;
  
  /** Position in the original text */
  startIndex: number;
  endIndex: number;
}

/**
 * Result from parsing text with placeholders
 */
export interface ParsedTextResult {
  /** Array of text segments */
  segments: TextSegment[];
  
  /** Map of placeholder IDs to their matches */
  placeholders: Record<string, PlaceholderMatch>;
  
  /** Total number of placeholders found */
  placeholderCount: number;
}

/**
 * Options for parsing text with placeholders
 */
export interface ParseTextOptions {
  /** Base field path for the text */
  fieldPath: string;
  
  /** Section the text belongs to */
  section: string;
  
  /** Custom placeholder patterns */
  customPatterns?: RegExp[];
  
  /** Whether to generate unique IDs for placeholders */
  generateIds?: boolean;
  
  /** Existing placeholder values */
  existingValues?: PlaceholderReplacementMap;
}

/**
 * Hook return type for usePlaceholderEditing
 */
export interface UsePlaceholderEditingReturn {
  /** Current editing state */
  state: PlaceholderEditingState;
  
  /** All context functions */
  actions: Omit<PlaceholderEditingContextValue, 'state'>;
  
  /** Parse text and create editable placeholder components */
  parseText: (text: string, options: ParseTextOptions) => ParsedTextResult;
  
  /** Render text with editable placeholders */
  renderEditableText: (text: string, options: ParseTextOptions) => React.ReactNode[];
  
  /** Get completion status for a section */
  getSectionProgress: (section: string) => { total: number; completed: number; percentage: number };
  
  /** Check if any placeholders are currently being edited */
  hasActiveEdits: boolean;
  
  /** Check if any save operations are in progress */
  hasPendingSaves: boolean;
}

export default PlaceholderEditingContextValue;