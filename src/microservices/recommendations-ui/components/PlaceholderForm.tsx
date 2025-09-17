import React, { useState, useCallback, useMemo } from 'react';
import { PlaceholderField } from './PlaceholderField';
import { 
  CVRecommendationWithPlaceholders, 
  PlaceholderReplacementMap,
  PlaceholderInfo 
} from '../../types/placeholders';

interface PlaceholderFormProps {
  recommendation: CVRecommendationWithPlaceholders;
  onSubmit: (values: PlaceholderReplacementMap) => Promise<void>;
  onPreview: (values: PlaceholderReplacementMap) => string;
  isLoading?: boolean;
}

export const PlaceholderForm: React.FC<PlaceholderFormProps> = ({
  recommendation,
  onSubmit,
  onPreview,
  isLoading = false
}) => {
  const [values, setValues] = useState<PlaceholderReplacementMap>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const placeholders = useMemo(() => {
    return recommendation.placeholders || [];
  }, [recommendation.placeholders]);

  const handleFieldChange = useCallback((placeholderKey: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [placeholderKey]: value
    }));
    
    // Clear error when user starts typing
    if (errors[placeholderKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[placeholderKey];
        return newErrors;
      });
    }
  }, [errors]);

  const validateField = (placeholder: PlaceholderInfo, value: string): string | null => {
    if (placeholder.required && (!value || !value.trim())) {
      return `${placeholder.label} is required`;
    }
    
    if (value && placeholder.validation && !placeholder.validation.test(value)) {
      return `${placeholder.label} format is invalid. Example: ${placeholder.example}`;
    }
    
    return null;
  };

  const validateAllFields = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    placeholders.forEach(placeholder => {
      const value = values[placeholder.placeholder] || '';
      const error = validateField(placeholder, value);
      if (error) {
        newErrors[placeholder.placeholder] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting placeholder values:', error);
    }
  };

  const previewContent = useMemo(() => {
    if (!isPreviewMode) return '';
    return onPreview(values);
  }, [isPreviewMode, values, onPreview]);

  const hasPlaceholders = placeholders.length > 0;
  const allRequiredFieldsFilled = placeholders
    .filter(p => p.required)
    .every(p => values[p.placeholder]?.trim());

  if (!hasPlaceholders) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Customize Your Information
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Fill in your specific details to personalize this recommendation. The placeholders below will be replaced with your actual data.
        </p>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {placeholders.map((placeholder) => (
            <PlaceholderField
              key={placeholder.key}
              placeholder={placeholder}
              value={values[placeholder.placeholder] || ''}
              onChange={handleFieldChange}
              error={errors[placeholder.placeholder]}
            />
          ))}
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isPreviewMode ? (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M18.536 15.536l-4.242-4.242" />
                </svg>
                Hide Preview
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show Preview
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={!allRequiredFieldsFilled || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Applying...
              </>
            ) : (
              'Apply Customization'
            )}
          </button>
        </div>
      </form>

      {/* Preview Panel */}
      {isPreviewMode && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Live Preview</h4>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {previewContent || 'Fill in the fields above to see a preview...'}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Tips for Better Results
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use specific numbers and metrics when available</li>
                <li>Be honest about your achievements - don't exaggerate</li>
                <li>Round numbers are fine (e.g., \"10+\" instead of \"9.7\")</li>
                <li>Use industry-standard formats (e.g., \"$2.5M\" for millions)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};