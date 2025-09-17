/**
 * Analysis Actions Component
 * Action buttons for continuing or going back
 */

import React from 'react';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface AnalysisActionsProps {
  selectedCount: number;
  totalCount: number;
  onContinue: () => void;
  onBack?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Action buttons for analysis page
 * Shows continue and back navigation with selection summary
 */
export const AnalysisActions: React.FC<AnalysisActionsProps> = ({
  selectedCount,
  totalCount,
  onContinue,
  onBack,
  disabled = false,
  className = ''
}) => {
  const selectionText = selectedCount === 0 
    ? 'No improvements selected'
    : selectedCount === 1
    ? '1 improvement selected'
    : `${selectedCount} improvements selected`;

  return (
    <div className={`analysis-actions ${className}`}>
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between">
          {/* Selection Summary */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <CheckCircle className={`w-5 h-5 mr-2 ${
                selectedCount > 0 ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {selectionText}
              </span>
            </div>
            
            {totalCount > 0 && (
              <div className="text-sm text-gray-500">
                of {totalCount} total recommendation{totalCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                disabled={disabled}
                className={`
                  inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium
                  border transition-colors
                  ${disabled 
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}

            <button
              onClick={onContinue}
              disabled={disabled}
              className={`
                inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${disabled
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : selectedCount > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm'
                }
              `}
            >
              <span>
                {selectedCount > 0 
                  ? `Continue with ${selectedCount} improvement${selectedCount !== 1 ? 's' : ''}`
                  : 'Continue without improvements'
                }
              </span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

        {/* Additional Info */}
        {selectedCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Selected improvements will be applied to generate your enhanced CV
              </span>
              <span className="text-blue-600 font-medium">
                Estimated processing time: ~2 minutes
              </span>
            </div>
          </div>
        )}

        {selectedCount === 0 && totalCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              💡 Tip: Select at least one improvement to enhance your CV's ATS compatibility and professional appearance
            </div>
          </div>
        )}
      </div>
    </div>
  );
};