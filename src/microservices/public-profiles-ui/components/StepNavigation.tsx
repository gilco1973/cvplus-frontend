import React from 'react';

type CreatorStep = 'template' | 'editor' | 'preview' | 'settings' | 'export';

interface StepNavigationProps {
  currentStep: CreatorStep;
  onStepClick: (step: CreatorStep) => void;
  onCancel: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  onStepClick,
  onCancel,
}) => {
  const steps: { id: CreatorStep; label: string; icon: string }[] = [
    { id: 'template', label: 'Template', icon: '🎨' },
    { id: 'editor', label: 'Content', icon: '✏️' },
    { id: 'preview', label: 'Preview', icon: '👀' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'export', label: 'Export', icon: '🚀' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create Public Profile</h1>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-2 cursor-pointer ${
              index <= currentStepIndex ? 'text-blue-600' : 'text-gray-400'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentStepIndex
                  ? 'bg-blue-600 text-white'
                  : index === currentStepIndex
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {index < currentStepIndex ? '✓' : step.icon}
            </div>
            <span className={`hidden sm:inline text-sm font-medium ${
              index === currentStepIndex ? 'text-blue-600' : ''
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`hidden sm:block w-8 h-0.5 ${
                index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};