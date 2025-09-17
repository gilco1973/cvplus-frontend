/**
 * PlaceholderInput Component
 * 
 * Specialized input component that adapts its behavior based on placeholder type.
 * Provides type-specific validation, formatting, and user experience.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlaceholderInputProps, ValidationResult } from '../../types/inline-editing';

export const PlaceholderInput: React.FC<PlaceholderInputProps> = ({
  value,
  onChange,
  onComplete,
  onCancel,
  placeholder,
  error,
  disabled = false,
  autoFocus = false
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format value based on placeholder type
  const formatValue = useCallback((inputValue: string): string => {
    if (!inputValue) return inputValue;

    switch (placeholder.type) {
      case 'number': {
        // Remove non-digits and add commas
        const numValue = inputValue.replace(/[^\d]/g, '');
        return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      
      case 'currency': {
        // Handle various currency formats
        const cleanValue = inputValue.replace(/[^\d.,kmb]/gi, '');
        return cleanValue;
      }
      
      case 'percentage':
        // Remove % symbol, keep only digits
        return inputValue.replace(/[^\d]/g, '');
      
      case 'text':
      case 'timeframe':
      default:
        return inputValue;
    }
  }, [placeholder.type]);

  // Validate input value
  const validateValue = useCallback((inputValue: string): ValidationResult => {
    if (!inputValue.trim()) {
      if (placeholder.required) {
        return { isValid: false, error: `${placeholder.label} is required` };
      }
      return { isValid: true };
    }

    // Custom validation regex
    if (placeholder.validation && !placeholder.validation.test(inputValue)) {
      return { 
        isValid: false, 
        error: `${placeholder.label} format is invalid. Example: ${placeholder.example}` 
      };
    }

    // Type-specific validation
    switch (placeholder.type) {
      case 'number': {
        const numValue = inputValue.replace(/,/g, '');
        if (!/^\d+$/.test(numValue)) {
          return { isValid: false, error: `${placeholder.label} must be a valid number` };
        }
        return { isValid: true, formattedValue: formatValue(inputValue) };
      }

      case 'percentage': {
        if (!/^\d+$/.test(inputValue)) {
          return { isValid: false, error: `${placeholder.label} must be a number (without % symbol)` };
        }
        const percentValue = parseInt(inputValue, 10);
        if (percentValue < 0 || percentValue > 100) {
          return { isValid: false, error: `${placeholder.label} must be between 0 and 100` };
        }
        return { isValid: true, formattedValue: inputValue };
      }

      case 'currency': {
        if (!/^[\d,$kmb.]+$/i.test(inputValue)) {
          return { isValid: false, error: `${placeholder.label} must be a valid amount (e.g., 1000, $1.5M, 500K)` };
        }
        return { isValid: true, formattedValue: inputValue };
      }

      case 'text':
      case 'timeframe':
        if (inputValue.length > 100) {
          return { isValid: false, error: `${placeholder.label} must be less than 100 characters` };
        }
        return { isValid: true, formattedValue: inputValue };

      default:
        return { isValid: true, formattedValue: inputValue };
    }
  }, [placeholder, formatValue]);

  // Handle input change
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const formatted = formatValue(newValue);
    setLocalValue(formatted);
    onChange(formatted);
  }, [formatValue, onChange]);

  // Handle key navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onComplete();
        break;
      case 'Escape':
        event.preventDefault();
        onCancel();
        break;
      case 'Tab':
        // Allow tab to complete editing
        if (!event.shiftKey) {
          event.preventDefault();
          onComplete();
        }
        break;
    }
  }, [onComplete, onCancel]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Auto-complete on blur unless there's a validation error
    const validation = validateValue(localValue);
    if (validation.isValid) {
      onComplete();
    }
  }, [localValue, validateValue, onComplete]);

  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Get input attributes based on type
  const getInputAttributes = () => {
    const baseAttributes = {
      type: 'text' as const,
      autoComplete: 'off',
      spellCheck: false
    };

    switch (placeholder.type) {
      case 'number':
        return {
          ...baseAttributes,
          inputMode: 'numeric' as const,
          pattern: '[0-9,]*'
        };
      
      case 'currency':
        return {
          ...baseAttributes,
          inputMode: 'text' as const,
          pattern: '[0-9$.,kmb]*'
        };
      
      case 'percentage':
        return {
          ...baseAttributes,
          inputMode: 'numeric' as const,
          pattern: '[0-9]*',
          min: '0',
          max: '100'
        };
      
      default:
        return baseAttributes;
    }
  };

  const validation = validateValue(localValue);
  const displayError = error || (!validation.isValid ? validation.error : undefined);

  return (
    <span className="inline-block relative">
      <input
        ref={inputRef}
        {...getInputAttributes()}
        value={localValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder.example}
        className={`
          inline-block min-w-[100px] max-w-[300px] px-2 py-1 
          border-2 rounded-sm bg-white transition-all duration-200
          ${displayError 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-blue-400 focus:border-blue-600'
          }
          ${isFocused ? 'shadow-sm ring-2 ring-blue-200' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          focus:outline-none text-sm
        `}
        style={{
          width: `${Math.max(localValue.length * 8 + 32, 100)}px`
        }}
        aria-label={placeholder.label}
        aria-describedby={displayError ? `${placeholder.key}-error` : undefined}
        aria-invalid={!!displayError}
      />
      
      {/* Suffix for percentage inputs */}
      {placeholder.type === 'percentage' && localValue && (
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
          %
        </span>
      )}
      
      {/* Error tooltip */}
      {displayError && (
        <div 
          id={`${placeholder.key}-error`}
          className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-10 shadow-sm"
        >
          {displayError}
        </div>
      )}
      
      {/* Help tooltip when focused */}
      {isFocused && !displayError && placeholder.helpText && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs text-blue-700 whitespace-nowrap z-10 shadow-sm">
          {placeholder.helpText}
        </div>
      )}
      
      {/* Keyboard shortcuts hint */}
      {isFocused && (
        <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs text-gray-600 whitespace-nowrap z-10 shadow-sm">
          Enter to save • Esc to cancel
        </div>
      )}
    </span>
  );
};

export default PlaceholderInput;