import React, { useState, useCallback } from 'react';
import { PlaceholderInfo } from '../../types/placeholders';

interface PlaceholderFieldProps {
  placeholder: PlaceholderInfo;
  value: string;
  onChange: (placeholderKey: string, value: string) => void;
  error?: string;
}

export const PlaceholderField: React.FC<PlaceholderFieldProps> = ({
  placeholder,
  value,
  onChange,
  error
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(placeholder.placeholder, e.target.value);
  }, [placeholder.placeholder, onChange]);

  const getInputType = () => {
    switch (placeholder.type) {
      case 'number':
      case 'percentage':
        return 'text'; // Use text to allow formatted input like "10,000" or "25%"
      case 'currency':
        return 'text';
      default:
        return 'text';
    }
  };

  const formatValue = (inputValue: string) => {
    if (!inputValue) return inputValue;
    
    // Format numbers with commas for better readability
    if (placeholder.type === 'number' && /^\d+$/.test(inputValue.replace(/,/g, ''))) {
      return inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return inputValue;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {placeholder.label}
        {placeholder.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder.example}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 bg-white'
            }
            ${isFocused ? 'ring-2 ring-blue-200' : ''}
          `}
          required={placeholder.required}
        />
        
        {placeholder.type === 'percentage' && value && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 text-sm">%</span>
          </div>
        )}
      </div>
      
      {placeholder.helpText && (
        <p className="text-xs text-gray-500">{placeholder.helpText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {!error && value && (
        <p className="text-xs text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Looks good!
        </p>
      )}
    </div>
  );
};