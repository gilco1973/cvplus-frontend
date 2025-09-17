/**
 * TemplateComparison Component
 *
 * Side-by-side template comparison with live preview
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Crown } from 'lucide-react';
import { TemplateComparisonProps } from './types';

const MOCK_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern Professional',
    emoji: '💼',
    category: 'Professional',
    isPremium: false,
    description: 'Clean, modern design for corporate roles'
  },
  {
    id: 'creative',
    name: 'Creative Portfolio',
    emoji: '🎨',
    category: 'Creative',
    isPremium: true,
    description: 'Bold design for creative professionals'
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    emoji: '📋',
    category: 'Traditional',
    isPremium: false,
    description: 'Traditional format for conservative industries'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    emoji: '✨',
    category: 'Modern',
    isPremium: true,
    description: 'Minimal design focusing on content'
  }
];

export const TemplateComparison: React.FC<TemplateComparisonProps> = ({
  cvData,
  templates = MOCK_TEMPLATES,
  currentTemplate,
  onTemplateSelect
}) => {
  const [comparisonTemplate, setComparisonTemplate] = useState(templates[0]);
  const [showComparison, setShowComparison] = useState(false);

  const renderTemplatePreview = (template: any, isMain = false) => {
    const templateClass = getTemplateClass(template.id);

    return (
      <div className={`template-preview ${templateClass} bg-white border rounded-lg p-4 h-64 overflow-hidden text-xs`}>
        {/* Mini CV Preview */}
        <div className="space-y-2">
          {/* Header */}
          <div className="border-b pb-2">
            <h3 className="font-bold text-sm">{cvData?.personalInfo?.name || 'Your Name'}</h3>
            <div className="text-gray-600 text-xs">
              {cvData?.personalInfo?.email || 'email@example.com'}
            </div>
          </div>

          {/* Summary */}
          {cvData?.summary && (
            <div>
              <h4 className="font-semibold text-xs mb-1">Summary</h4>
              <p className="text-xs text-gray-700 line-clamp-2">
                {cvData.summary.slice(0, 100)}...
              </p>
            </div>
          )}

          {/* Experience */}
          {cvData?.experience && cvData.experience.length > 0 && (
            <div>
              <h4 className="font-semibold text-xs mb-1">Experience</h4>
              <div className="space-y-1">
                {cvData.experience.slice(0, 2).map((exp: any, index: number) => (
                  <div key={index} className="text-xs">
                    <div className="font-medium">{exp.position}</div>
                    <div className="text-gray-600">{exp.company}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTemplateClass = (templateId: string) => {
    switch (templateId) {
      case 'classic':
        return 'font-serif text-gray-800';
      case 'creative':
        return 'font-sans bg-gradient-to-br from-purple-50 to-pink-50';
      case 'minimal':
        return 'font-light text-gray-700 border-l-4 border-blue-500';
      default:
        return 'font-sans text-gray-900';
    }
  };

  return (
    <div className="template-comparison">
      {/* Template Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Choose Template</h3>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {showComparison ? 'Single View' : 'Compare Templates'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                if (showComparison) {
                  setComparisonTemplate(template);
                } else {
                  onTemplateSelect(template);
                }
              }}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all
                ${(showComparison ? comparisonTemplate : currentTemplate)?.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{template.emoji}</span>
                {template.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              <h4 className="font-medium text-sm text-gray-900 mb-1">{template.name}</h4>
              <p className="text-xs text-gray-600">{template.description}</p>

              {currentTemplate?.id === template.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="space-y-4">
        {showComparison ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Template */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                Current: {currentTemplate?.name || 'No template selected'}
                {currentTemplate?.isPremium && <Crown className="w-4 h-4 text-yellow-500 ml-1" />}
              </h4>
              {renderTemplatePreview(currentTemplate || templates[0], true)}
              <button
                onClick={() => onTemplateSelect(currentTemplate)}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Keep Current
              </button>
            </div>

            {/* Comparison Template */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                Compare: {comparisonTemplate.name}
                {comparisonTemplate.isPremium && <Crown className="w-4 h-4 text-yellow-500 ml-1" />}
              </h4>
              {renderTemplatePreview(comparisonTemplate)}
              <button
                onClick={() => onTemplateSelect(comparisonTemplate)}
                className="w-full mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Switch to This
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <h4 className="text-sm font-medium text-gray-900 mb-2 text-center">
              Preview: {currentTemplate?.name || 'Select a template'}
            </h4>
            {renderTemplatePreview(currentTemplate || templates[0])}
          </div>
        )}
      </div>
    </div>
  );
};