/**
 * Editable Placeholder Utilities
 * 
 * Utilities for converting static placeholders into editable components.
 * Provides enhanced versions of the existing highlightPlaceholders functionality.
 */

import React from 'react';
import { PlaceholderInfo } from '../types/placeholders';
import { PlaceholderMatch } from '../types/inline-editing';
import { EditablePlaceholder } from '../components/cv-preview/EditablePlaceholder';

// Placeholder definitions registry (this could be expanded based on your placeholder database)
const PLACEHOLDER_REGISTRY: Record<string, PlaceholderInfo> = {
  '[INSERT TEAM SIZE]': {
    key: '[INSERT TEAM SIZE]',
    placeholder: 'INSERT TEAM SIZE',
    type: 'number',
    label: 'Team Size',
    helpText: 'How many people did you manage or work with?',
    example: '8 developers',
    required: true
  },
  '[INSERT BUDGET]': {
    key: '[INSERT BUDGET]',
    placeholder: 'INSERT BUDGET',
    type: 'currency',
    label: 'Budget',
    helpText: 'What was the budget you managed?',
    example: '$2.5M',
    required: false
  },
  '[INSERT PERCENTAGE]': {
    key: '[INSERT PERCENTAGE]',
    placeholder: 'INSERT PERCENTAGE',
    type: 'percentage',
    label: 'Percentage',
    helpText: 'What percentage improvement did you achieve?',
    example: '25',
    required: false
  },
  '[INSERT TIMEFRAME]': {
    key: '[INSERT TIMEFRAME]',
    placeholder: 'INSERT TIMEFRAME',
    type: 'timeframe',
    label: 'Timeframe',
    helpText: 'How long did this take?',
    example: '6 months',
    required: false
  },
  '[INSERT TECHNOLOGY]': {
    key: '[INSERT TECHNOLOGY]',
    placeholder: 'INSERT TECHNOLOGY',
    type: 'text',
    label: 'Technology',
    helpText: 'What technology or tool did you use?',
    example: 'React.js',
    required: false
  },
  '[INSERT METRIC]': {
    key: '[INSERT METRIC]',
    placeholder: 'INSERT METRIC',
    type: 'text',
    label: 'Metric',
    helpText: 'What specific metric did you improve?',
    example: 'user engagement',
    required: false
  },
  '[ADD SPECIFIC EXAMPLE]': {
    key: '[ADD SPECIFIC EXAMPLE]',
    placeholder: 'ADD SPECIFIC EXAMPLE',
    type: 'text',
    label: 'Specific Example',
    helpText: 'Provide a specific example or detail',
    example: 'reduced processing time by 40%',
    required: false
  },
  '[NUMBER OF YEARS]': {
    key: '[NUMBER OF YEARS]',
    placeholder: 'NUMBER OF YEARS',
    type: 'number',
    label: 'Years of Experience',
    helpText: 'How many years of experience?',
    example: '5',
    required: true
  }
};

/**
 * Get placeholder info from the registry or create a default one
 */
export const getPlaceholderInfo = (placeholderKey: string): PlaceholderInfo => {
  const existing = PLACEHOLDER_REGISTRY[placeholderKey];
  if (existing) {
    return existing;
  }

  // Create default placeholder info for unknown placeholders
  const placeholder = placeholderKey.replace(/[\[\]]/g, '');
  const type = inferPlaceholderType(placeholder);
  
  return {
    key: placeholderKey,
    placeholder,
    type,
    label: formatPlaceholderLabel(placeholder),
    helpText: `Enter value for ${formatPlaceholderLabel(placeholder)}`,
    example: getExampleForType(type),
    required: false
  };
};

/**
 * Infer placeholder type from its name
 */
export const inferPlaceholderType = (placeholder: string): PlaceholderInfo['type'] => {
  const lowerPlaceholder = placeholder.toLowerCase();
  
  if (lowerPlaceholder.includes('percentage') || lowerPlaceholder.includes('percent')) {
    return 'percentage';
  }
  
  if (lowerPlaceholder.includes('budget') || lowerPlaceholder.includes('cost') || 
      lowerPlaceholder.includes('salary') || lowerPlaceholder.includes('revenue')) {
    return 'currency';
  }
  
  if (lowerPlaceholder.includes('number') || lowerPlaceholder.includes('count') || 
      lowerPlaceholder.includes('size') || lowerPlaceholder.includes('team') ||
      lowerPlaceholder.includes('years') || lowerPlaceholder.includes('months')) {
    return 'number';
  }
  
  if (lowerPlaceholder.includes('time') || lowerPlaceholder.includes('duration') ||
      lowerPlaceholder.includes('period')) {
    return 'timeframe';
  }
  
  return 'text';
};

/**
 * Format placeholder label for display
 */
export const formatPlaceholderLabel = (placeholder: string): string => {
  return placeholder
    .replace(/[_]/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get example value for a given type
 */
export const getExampleForType = (type: PlaceholderInfo['type']): string => {
  switch (type) {
    case 'number':
      return '5';
    case 'currency':
      return '$100K';
    case 'percentage':
      return '25';
    case 'timeframe':
      return '6 months';
    case 'text':
      return 'example text';
    default:
      return 'example';
  }
};

/**
 * Convert PlaceholderInfo to PlaceholderMatch for the new system
 */
const createPlaceholderMatch = (
  placeholderKey: string,
  placeholderInfo: PlaceholderInfo,
  fieldPath = 'unknown',
  section = 'general',
  startIndex = 0,
  endIndex = 0
): PlaceholderMatch => {
  return {
    id: `${section}::${fieldPath}::${placeholderKey}`,
    key: placeholderKey,
    fullMatch: placeholderKey,
    type: placeholderInfo.type,
    label: placeholderInfo.label,
    helpText: placeholderInfo.helpText,
    example: placeholderInfo.example,
    required: placeholderInfo.required || false,
    validation: placeholderInfo.validation,
    startIndex,
    endIndex,
    fieldPath,
    section
  };
};

/**
 * Enhanced version of highlightPlaceholders that creates editable components
 */
export const highlightEditablePlaceholders = (
  text: string, 
  onContentUpdate?: (newContent: string) => void,
  fieldPath = 'unknown',
  section = 'general',
  className?: string
): React.ReactNode[] => {
  if (!text) return [text];
  
  // Regex to match placeholder patterns
  const placeholderPattern = /(\[INSERT[^\]]*\]|\[ADD[^\]]*\]|\[NUMBER[^\]]*\])/g;
  
  return text.split(placeholderPattern).map((part, index) => {
    if (placeholderPattern.test(part)) {
      const placeholderInfo = getPlaceholderInfo(part);
      const placeholderMatch = createPlaceholderMatch(
        part,
        placeholderInfo,
        fieldPath,
        section,
        0, // startIndex - could be calculated if needed
        part.length // endIndex
      );
      
      const handleUpdate = (newValue: string) => {
        if (onContentUpdate) {
          const updatedText = text.replace(part, newValue);
          onContentUpdate(updatedText);
        }
      };
      
      return (
        <EditablePlaceholder
          key={`${part}-${index}`}
          placeholder={placeholderMatch}
          onUpdate={handleUpdate}
          className={className}
        />
      );
    } else {
      return <span key={`text-${index}`}>{part}</span>;
    }
  });
};

/**
 * Wrapper component that automatically converts static highlighting to editable
 */
interface EditablePlaceholderWrapperProps {
  content: string;
  onContentUpdate?: (newContent: string) => void;
  fieldPath?: string;
  section?: string;
  fallbackToStatic?: boolean;
  className?: string;
  readOnly?: boolean;
}

export const EditablePlaceholderWrapper: React.FC<EditablePlaceholderWrapperProps> = ({
  content,
  onContentUpdate,
  fieldPath = 'unknown',
  section = 'general',
  fallbackToStatic = false,
  className = '',
  readOnly = false
}) => {
  // Check if we're in an editing context (i.e., PlaceholderEditingProvider is available)
  // If not, fallback to static highlighting
  try {
    return (
      <span className={className}>
        {highlightEditablePlaceholders(content, onContentUpdate, fieldPath, section)}
      </span>
    );
  } catch (error) {
    if (fallbackToStatic) {
      // Fallback to original static highlighting
      return (
        <span className={className}>
          {content.split(/(\[INSERT[^\]]*\]|\[ADD[^\]]*\]|\[NUMBER[^\]]*\])/).map((part, index) => 
            /\[(INSERT|ADD|NUMBER)[^\]]*\]/.test(part) ? (
              <span key={index} className="bg-yellow-200 px-1 py-0.5 rounded text-black font-medium border">
                {part}
              </span>
            ) : (
              <span key={index}>{part}</span>
            )
          )}
        </span>
      );
    }
    
    // Re-throw error if no fallback requested
    throw error;
  }
};

/**
 * Register additional placeholder definitions
 */
export const registerPlaceholder = (key: string, info: PlaceholderInfo): void => {
  PLACEHOLDER_REGISTRY[key] = info;
};

/**
 * Get all registered placeholders
 */
export const getAllPlaceholders = (): Record<string, PlaceholderInfo> => {
  return { ...PLACEHOLDER_REGISTRY };
};

/**
 * Extract all placeholders from a text string
 */
export const extractPlaceholders = (text: string): string[] => {
  if (!text) return [];
  
  const matches = text.match(/\[INSERT[^\]]*\]|\[ADD[^\]]*\]|\[NUMBER[^\]]*\]/g);
  return matches || [];
};

/**
 * Check if text contains any placeholders
 */
export const hasPlaceholders = (text: string): boolean => {
  return extractPlaceholders(text).length > 0;
};

export default {
  highlightEditablePlaceholders,
  EditablePlaceholderWrapper,
  getPlaceholderInfo,
  registerPlaceholder,
  getAllPlaceholders,
  extractPlaceholders,
  hasPlaceholders
};