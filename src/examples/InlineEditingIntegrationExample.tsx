/**
 * Inline Editing Integration Example
 * 
 * Shows how to integrate the new inline placeholder editing system
 * with existing CV components like CVPreviewPageNew.
 */

import React, { useState } from 'react';
import { PlaceholderEditingProvider } from '../contexts/PlaceholderEditingContext';
import { EditablePlaceholderWrapper } from '../utils/editablePlaceholderUtils';
import { usePlaceholderEditing } from '../hooks/usePlaceholderEditing';

// Example CV content with placeholders
const exampleCVContent = {
  summary: `Experienced software engineer with [INSERT YEARS] years of expertise in full-stack development. Led a team of [INSERT TEAM SIZE] developers to deliver projects worth [INSERT BUDGET] and achieved [INSERT PERCENTAGE]% improvement in system performance.`,
  
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Corp',
      description: `Managed a development team of [INSERT TEAM SIZE] engineers working on [INSERT TECHNOLOGY] stack. Successfully delivered [NUMBER OF PROJECTS] major projects within [INSERT TIMEFRAME], resulting in [INSERT METRIC] improvement of [INSERT PERCENTAGE]%.`
    }
  ]
};

// Component that demonstrates the editing functionality
const EditableContentSection: React.FC<{
  title: string;
  content: string;
  onContentUpdate: (newContent: string) => void;
}> = ({ title, content, onContentUpdate }) => {
  const { hasActiveEditing, getCompletionStatus, getAllValues } = usePlaceholderEditing();
  
  // Mock placeholder definitions for demo
  const mockPlaceholders = [
    { key: '[INSERT YEARS]', type: 'number' as const },
    { key: '[INSERT TEAM SIZE]', type: 'number' as const },
    { key: '[INSERT BUDGET]', type: 'currency' as const },
    { key: '[INSERT PERCENTAGE]', type: 'percentage' as const },
    { key: '[INSERT TECHNOLOGY]', type: 'text' as const },
    { key: '[NUMBER OF PROJECTS]', type: 'number' as const },
    { key: '[INSERT TIMEFRAME]', type: 'timeframe' as const },
    { key: '[INSERT METRIC]', type: 'text' as const }
  ];
  
  const completionStatus = getCompletionStatus(mockPlaceholders as any);
  const allValues = getAllValues();
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-4">
          {hasActiveEditing && (
            <span className="text-sm text-blue-600 font-medium">
              ✏️ Editing...
            </span>
          )}
          <div className="text-sm text-gray-600">
            Completed: {completionStatus.completed}/{completionStatus.total} ({completionStatus.completionPercentage}%)
          </div>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <EditablePlaceholderWrapper
          content={content}
          onContentUpdate={onContentUpdate}
          className="leading-relaxed"
        />
      </div>
      
      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Placeholder completion</span>
          <span className="text-xs text-gray-500">{completionStatus.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionStatus.completionPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Show filled values */}
      {Object.keys(allValues).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Values:</h4>
          <div className="space-y-1">
            {Object.entries(allValues).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main example component
const InlineEditingIntegrationExample: React.FC = () => {
  const [cvContent, setCvContent] = useState(exampleCVContent);
  
  const handleSummaryUpdate = (newContent: string) => {
    setCvContent(prev => ({ ...prev, summary: newContent }));
  };
  
  const handleExperienceUpdate = (index: number, newContent: string) => {
    setCvContent(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, description: newContent } : exp
      )
    }));
  };
  
  return (
    <PlaceholderEditingProvider 
      jobId="demo-job-123"
      options={{
        saveDelay: 1000, // 1 second delay for demo
        optimisticUpdates: true,
        immediateValidation: true
      }}
    >
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inline Placeholder Editing Demo
          </h1>
          <p className="text-gray-600">
            Click on highlighted placeholders to edit them inline. Changes are automatically saved.
          </p>
        </div>
        
        <EditableContentSection
          title="Professional Summary"
          content={cvContent.summary}
          onContentUpdate={handleSummaryUpdate}
        />
        
        {cvContent.experience.map((exp, index) => (
          <EditableContentSection
            key={index}
            title={`${exp.title} at ${exp.company}`}
            content={exp.description}
            onContentUpdate={(newContent) => handleExperienceUpdate(index, newContent)}
          />
        ))}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click on any highlighted placeholder (yellow background) to edit it</li>
            <li>• Type your value and press Enter to save, or Esc to cancel</li>
            <li>• Different input types have specific validation (numbers, currency, percentages)</li>
            <li>• Changes are saved automatically with a debounced delay</li>
            <li>• Progress is tracked and shown in real-time</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Features Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
            <div>
              <h4 className="font-medium">✅ Core Features</h4>
              <ul className="mt-1 space-y-1">
                <li>• Inline editing of placeholders</li>
                <li>• Type-specific validation</li>
                <li>• Real-time progress tracking</li>
                <li>• Optimistic updates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">✅ User Experience</h4>
              <ul className="mt-1 space-y-1">
                <li>• Keyboard navigation (Enter/Esc)</li>
                <li>• Visual feedback and tooltips</li>
                <li>• Error handling and validation</li>
                <li>• Accessible design</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PlaceholderEditingProvider>
  );
};

export default InlineEditingIntegrationExample;