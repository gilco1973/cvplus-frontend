import React from 'react';

type CreatorStep = 'template' | 'editor' | 'preview' | 'settings' | 'export';

interface NavigationFooterProps {
  currentStep: CreatorStep;
  canProceed: boolean;
  isValid: boolean;
  hasWarnings: boolean;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({
  currentStep,
  canProceed,
  isValid,
  hasWarnings,
  isDirty,
  isSaving,
  saveError,
  onPrevious,
  onNext,
  onSave,
}) => {
  const steps = ['template', 'editor', 'preview', 'settings', 'export'];
  const currentStepIndex = steps.indexOf(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div className="border-t bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasWarnings && (
            <span className="text-yellow-600 text-sm">⚠️ Has warnings</span>
          )}
          {!isValid && (
            <span className="text-red-600 text-sm">❌ Validation errors</span>
          )}
          {isDirty && (
            <span className="text-blue-600 text-sm">📝 Unsaved changes</span>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {currentStepIndex > 0 && (
            <button
              onClick={onPrevious}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Previous
            </button>
          )}

          {!isLastStep ? (
            <button
              onClick={onNext}
              disabled={!canProceed}
              className={`px-6 py-2 rounded font-medium ${
                canProceed
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={onSave}
              disabled={!isValid || isSaving}
              className={`px-6 py-2 rounded font-medium ${
                isValid && !isSaving
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <div className="mt-2 text-red-600 text-sm">{saveError}</div>
      )}
    </div>
  );
};