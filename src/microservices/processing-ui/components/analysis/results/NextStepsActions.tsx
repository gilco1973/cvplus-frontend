/**
 * Next Steps Actions Component
 * Multimedia generation and next steps buttons
 */

import React from 'react';

interface NextStepsActionsProps {
  onGenerateMultimedia?: (type: 'podcast' | 'video' | 'portfolio') => void;
}

export const NextStepsActions: React.FC<NextStepsActionsProps> = ({
  onGenerateMultimedia
}) => {
  const actions = [
    {
      type: 'podcast' as const,
      title: 'Generate AI Podcast',
      description: 'Create personalized career insights'
    },
    {
      type: 'video' as const,
      title: 'Create Video Introduction',
      description: 'AI-powered professional video'
    },
    {
      type: 'portfolio' as const,
      title: 'Build Portfolio Gallery',
      description: 'Interactive showcase portfolio'
    }
  ];

  if (!onGenerateMultimedia) {
    return null;
  }

  return (
    <div className="mt-12 p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map(({ type, title, description }) => (
          <button
            key={type}
            onClick={() => onGenerateMultimedia(type)}
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-gray-900">{title}</div>
            <div className="text-sm text-gray-500 mt-1">{description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};