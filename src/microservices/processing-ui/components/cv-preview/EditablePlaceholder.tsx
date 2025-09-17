/**
 * EditablePlaceholder Component
 * 
 * Core component that transforms static placeholders into clickable, editable fields.
 * Provides inline editing functionality with validation, auto-save, and error handling.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Edit3, Save, X, AlertCircle, Loader2 } from 'lucide-react';
import { usePlaceholderEditing } from '../../hooks/usePlaceholderEditing';
import type { 
  EditablePlaceholderProps, 
  PlaceholderMatch,
  PlaceholderInputProps 
} from '../../types/inline-editing';

/**
 * Specialized input component for text placeholders
 */
const TextPlaceholderInput: React.FC<PlaceholderInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyPress,
  placeholder,
  hasError,
  errorMessage,
  isSaving,
  autoFocus = true,
  maxLength = 100,
  inputProps = {}
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={isSaving}
        className={`
          inline-block min-w-[120px] px-2 py-1 text-sm border rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${hasError 
            ? 'border-red-300 bg-red-50 text-red-900' 
            : 'border-gray-300 bg-white text-gray-900'
          }
          ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        {...inputProps}
      />
      {isSaving && (
        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-blue-500" />
      )}
      {hasError && errorMessage && (
        <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized input component for number placeholders
 */
const NumberPlaceholderInput: React.FC<PlaceholderInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyPress,
  placeholder,
  hasError,
  errorMessage,
  isSaving,
  autoFocus = true,
  min,
  max,
  inputProps = {}
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow empty value or valid numbers (including commas)
    if (newValue === '' || /^[\d,]+$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={isSaving}
        className={`
          inline-block min-w-[80px] px-2 py-1 text-sm border rounded-md text-right
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${hasError 
            ? 'border-red-300 bg-red-50 text-red-900' 
            : 'border-gray-300 bg-white text-gray-900'
          }
          ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        {...inputProps}
      />
      {isSaving && (
        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-blue-500" />
      )}
      {hasError && errorMessage && (
        <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized input component for currency placeholders
 */
const CurrencyPlaceholderInput: React.FC<PlaceholderInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyPress,
  placeholder,
  hasError,
  errorMessage,
  isSaving,
  autoFocus = true,
  inputProps = {}
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow currency formats: numbers, commas, K, M, B suffixes, $ prefix
    if (newValue === '' || /^[\d$,kmb.]+$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        disabled={isSaving}
        className={`
          inline-block min-w-[100px] px-2 py-1 text-sm border rounded-md text-right
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${hasError 
            ? 'border-red-300 bg-red-50 text-red-900' 
            : 'border-gray-300 bg-white text-gray-900'
          }
          ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        {...inputProps}
      />
      {isSaving && (
        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-blue-500" />
      )}
      {hasError && errorMessage && (
        <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized input component for percentage placeholders
 */
const PercentagePlaceholderInput: React.FC<PlaceholderInputProps> = ({
  value,
  onChange,
  onBlur,
  onKeyPress,
  placeholder,
  hasError,
  errorMessage,
  isSaving,
  autoFocus = true,
  min = 0,
  max = 100,
  inputProps = {}
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace('%', ''); // Remove % if user types it
    if (newValue === '' || (/^\d+$/.test(newValue) && parseInt(newValue) <= max)) {
      onChange(newValue);
    }
  };

  return (
    <div className="relative inline-block">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          min={min}
          max={max}
          disabled={isSaving}
          className={`
            inline-block w-16 px-2 py-1 text-sm border rounded-l-md text-right
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${hasError 
              ? 'border-red-300 bg-red-50 text-red-900' 
              : 'border-gray-300 bg-white text-gray-900'
            }
            ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}
          `}
          {...inputProps}
        />
        <span className="px-2 py-1 text-sm bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
          %
        </span>
      </div>
      {isSaving && (
        <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-blue-500" />
      )}
      {hasError && errorMessage && (
        <div className="absolute z-10 mt-1 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg whitespace-nowrap">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

/**
 * Main EditablePlaceholder component
 */
export const EditablePlaceholder: React.FC<EditablePlaceholderProps> = ({
  placeholder,
  value: externalValue,
  onUpdate,
  readOnly = false,
  className = '',
  style,
  showErrors = true,
  customValidator,
  onEditStart,
  onEditEnd
}) => {
  const {
    state,
    actions: {
      startEditing,
      cancelEditing,
      updatePlaceholder,
      isEditing,
      isSaving,
      getError,
      clearError
    }
  } = usePlaceholderEditing();

  const [localValue, setLocalValue] = useState(externalValue || placeholder?.currentValue || '');
  const isCurrentlyEditing = isEditing(placeholder.id);
  const isCurrentlySaving = isSaving(placeholder.id);
  const error = getError(placeholder.id);

  // Update local value when external value changes
  useEffect(() => {
    if (externalValue !== undefined) {
      setLocalValue(externalValue);
    }
  }, [externalValue]);

  // Validate the current value
  const validateValue = useCallback((val: string): string | null => {
    if (customValidator) {
      return customValidator(val);
    }

    // Basic validation based on placeholder type
    switch (placeholder.type) {
      case 'number':
        if (val && !/^\d+[,\d]*$/.test(val.replace(/,/g, ''))) {
          return 'Please enter a valid number';
        }
        break;
      case 'percentage':
        if (val && (!/^\d+$/.test(val) || parseInt(val) > 100)) {
          return 'Please enter a percentage between 0-100';
        }
        break;
      case 'currency':
        if (val && !/^[\d$,kmb.]+$/i.test(val)) {
          return 'Please enter a valid amount (e.g., 1000, $1.5M, 500K)';
        }
        break;
      case 'text':
        if (placeholder.required && !val.trim()) {
          return `${placeholder.label} is required`;
        }
        break;
    }

    // Check regex validation if provided
    if (val && placeholder.validation && !placeholder.validation.test(val)) {
      return `Invalid format. Example: ${placeholder.example}`;
    }

    return null;
  }, [placeholder, customValidator]);

  // Handle starting edit mode
  const handleStartEdit = useCallback(() => {
    if (readOnly) return;
    
    startEditing(placeholder.id, localValue);
    onEditStart?.();
  }, [placeholder.id, localValue, readOnly, startEditing, onEditStart]);

  // Handle canceling edit mode
  const handleCancelEdit = useCallback(() => {
    cancelEditing(placeholder.id);
    setLocalValue(externalValue || placeholder?.currentValue || '');
    clearError(placeholder.id);
    onEditEnd?.();
  }, [placeholder.id, externalValue, placeholder?.currentValue, cancelEditing, clearError, onEditEnd]);

  // Handle saving the value
  const handleSave = useCallback(async () => {
    const validationError = validateValue(localValue);
    if (validationError) {
      // Error will be set by the validation process
      return;
    }

    try {
      await updatePlaceholder(placeholder.id, localValue);
      onUpdate(localValue);
      onEditEnd?.();
    } catch (error) {
      console.error('Failed to save placeholder:', error);
      // Error state is managed by the context
    }
  }, [placeholder.id, localValue, validateValue, updatePlaceholder, onUpdate, onEditEnd]);

  // Handle input change
  const handleInputChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    clearError(placeholder.id);
  }, [placeholder.id, clearError]);

  // Handle key press events
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEdit();
    }
  }, [handleSave, handleCancelEdit]);

  // Handle blur (when user clicks away)
  const handleBlur = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // Get the appropriate input component based on placeholder type
  const renderInput = () => {
    const baseProps: PlaceholderInputProps = {
      value: localValue,
      onChange: handleInputChange,
      onBlur: handleBlur,
      onKeyPress: handleKeyPress,
      placeholder: placeholder.example,
      hasError: !!error,
      errorMessage: error || undefined,
      isSaving: isCurrentlySaving,
      autoFocus: true
    };

    switch (placeholder.type) {
      case 'number':
        return <NumberPlaceholderInput {...baseProps} />;
      case 'currency':
        return <CurrencyPlaceholderInput {...baseProps} />;
      case 'percentage':
        return <PercentagePlaceholderInput {...baseProps} />;
      case 'text':
      case 'timeframe':
      default:
        return <TextPlaceholderInput {...baseProps} />;
    }
  };

  // Render the placeholder in view mode
  const renderViewMode = () => {
    const displayValue = localValue || placeholder.fullMatch;
    const isEmpty = !localValue;

    return (
      <span
        onClick={handleStartEdit}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-all duration-200
          ${isEmpty 
            ? 'bg-yellow-100 border border-yellow-300 text-yellow-800 hover:bg-yellow-200' 
            : 'bg-green-100 border border-green-300 text-green-800 hover:bg-green-200'
          }
          ${readOnly ? 'cursor-default opacity-75' : 'hover:shadow-sm'}
          ${className}
        `}
        style={style}
        title={`Click to edit: ${placeholder.helpText}`}
      >
        {isEmpty && <Edit3 className="w-3 h-3" />}
        <span className="font-medium">
          {isEmpty ? placeholder.fullMatch : displayValue}
        </span>
        {!isEmpty && !readOnly && <Edit3 className="w-3 h-3 opacity-50" />}
      </span>
    );
  };

  // Render the placeholder in edit mode
  const renderEditMode = () => {
    return (
      <div className="inline-flex items-center gap-2">
        {renderInput()}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            disabled={isCurrentlySaving}
            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
            title="Save (Enter)"
          >
            <Save className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            disabled={isCurrentlySaving}
            className="p-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
            title="Cancel (Escape)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return isCurrentlyEditing ? renderEditMode() : renderViewMode();
};

export default EditablePlaceholder;