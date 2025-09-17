/**
 * RecommendationsActions Component
 * 
 * Displays navigation and action controls for the recommendations step.
 * Handles validation and provides feedback for user actions.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RecommendationsActionsProps {
  selectedCount: number;
  totalCount: number;
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  isProcessing?: boolean;
  className?: string;
}

export const RecommendationsActions: React.FC<RecommendationsActionsProps> = ({
  selectedCount,
  totalCount,
  onBack,
  onContinue,
  backLabel = 'Back to Role Selection',
  continueLabel = 'Continue to Features',
  isProcessing = false,
  className = ''
}) => {
  const hasSelections = selectedCount > 0;
  const allSelected = selectedCount === totalCount && totalCount > 0;

  const handleContinue = () => {
    if (!hasSelections) {
      // This validation is also handled in the container, but we provide UI feedback
      return;
    }
    onContinue();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Selection Status */}
      <div className="text-center">
        {hasSelections ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium">
              {selectedCount} of {totalCount} recommendations selected
            </span>
          </div>
        ) : totalCount > 0 ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-medium">
              No recommendations selected
            </span>
          </div>
        ) : null}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-6 py-3 transition-colors ${
            isProcessing
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </button>
        
        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!hasSelections || isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            hasSelections && !isProcessing
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {continueLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      {!hasSelections && totalCount > 0 && (
        <div className="text-center text-sm text-gray-500">
          Select at least one recommendation to continue
        </div>
      )}
      
      {allSelected && totalCount > 1 && (
        <div className="text-center text-sm text-gray-400">
          Great! You've selected all available recommendations
        </div>
      )}
    </div>
  );
};