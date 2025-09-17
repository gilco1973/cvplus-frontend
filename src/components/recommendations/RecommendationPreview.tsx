import React from 'react';
import { CVRecommendationWithPlaceholders, PlaceholderReplacementMap } from '../../types/placeholders';

interface RecommendationPreviewProps {
  recommendation: CVRecommendationWithPlaceholders;
  placeholderValues?: PlaceholderReplacementMap;
  showPlaceholderForm?: boolean;
  onCustomizeClick?: () => void;
}

export const RecommendationPreview: React.FC<RecommendationPreviewProps> = ({
  recommendation,
  placeholderValues = {},
  showPlaceholderForm = false,
  onCustomizeClick
}) => {
  // Replace placeholders in the content for preview
  const getPreviewContent = () => {
    const content = recommendation.customizedContent || recommendation.suggestedContent || '';
    
    if (!content) return '';
    
    let previewContent = content;
    
    // Replace each placeholder with user value or show as highlighted placeholder
    if (recommendation.placeholders) {
      recommendation.placeholders.forEach(placeholder => {
        const userValue = placeholderValues[placeholder.placeholder];
        const regex = new RegExp(`\\[${placeholder.placeholder.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\]`, 'g');
        
        if (userValue && userValue.trim()) {
          previewContent = previewContent.replace(regex, userValue);
        } else {
          // Highlight unfilled placeholders
          previewContent = previewContent.replace(
            regex, 
            `<span class="bg-yellow-200 px-2 py-1 rounded text-sm font-medium">[${placeholder.placeholder}]</span>`
          );
        }
      });
    }
    
    return previewContent;
  };

  const hasPlaceholders = recommendation.placeholders && recommendation.placeholders.length > 0;
  const hasUnfilledPlaceholders = hasPlaceholders && recommendation.placeholders!.some(
    p => !placeholderValues[p.placeholder]?.trim()
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{recommendation.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(recommendation.impact)}`}>
            {recommendation.impact.toUpperCase()} IMPACT
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200">
            +{recommendation.estimatedScoreImprovement} ATS SCORE
          </span>
        </div>
      </div>

      {/* Section Info */}
      <div className="flex items-center text-sm text-gray-500">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Section: <span className="font-medium ml-1">{recommendation.section}</span>
      </div>

      {/* Before/After Content */}
      {recommendation.currentContent && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Current Content:</h4>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-gray-700">{recommendation.currentContent}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">
            {recommendation.currentContent ? 'Improved Content:' : 'Suggested Content:'}
          </h4>
          {hasPlaceholders && (
            <div className="flex items-center space-x-2">
              {hasUnfilledPlaceholders && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-amber-800 bg-amber-100">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Needs Customization
                </span>
              )}
              {onCustomizeClick && !showPlaceholderForm && (
                <button
                  onClick={onCustomizeClick}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Customize
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-md p-3">
          <div 
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
          />
        </div>
      </div>

      {/* Placeholder Info */}
      {hasPlaceholders && !showPlaceholderForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-start">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-blue-700">
                <strong>Customization Available:</strong> This recommendation contains {recommendation.placeholders!.length} placeholder{recommendation.placeholders!.length > 1 ? 's' : ''} that can be filled with your specific information for a more personalized result.
              </p>
              {hasUnfilledPlaceholders && (
                <p className="text-xs text-blue-600 mt-1">
                  Click "Customize" to fill in your details and see the final result.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};