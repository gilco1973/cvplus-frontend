import React, { useState, useCallback } from 'react';
import { useTemplateSelector } from '../hooks/useTemplateSelector';
import { TemplateConfiguration } from '../types/creator.types';

interface TemplateSelectorProps {
  onTemplateSelect: (template: TemplateConfiguration) => void;
  selectedTemplate?: TemplateConfiguration | null;
  showPremiumTemplates?: boolean;
  className?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplate,
  showPremiumTemplates = true,
  className = '',
}) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const {
    filteredTemplates,
    filterCategory,
    searchQuery,
    previewTemplate,
    previewTemplateHandler,
    updateSearch,
    updateFilter,
    categories,
    hasResults,
  } = useTemplateSelector({
    initialTemplate: selectedTemplate || undefined,
    showPremiumTemplates,
  });

  const handleTemplateClick = useCallback((template: TemplateConfiguration) => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handlePreviewClick = useCallback((template: TemplateConfiguration, e: React.MouseEvent) => {
    e.stopPropagation();
    previewTemplateHandler(template);
    setShowPreviewModal(true);
  }, [previewTemplateHandler]);

  const closePreview = useCallback(() => {
    setShowPreviewModal(false);
    previewTemplateHandler(null);
  }, [previewTemplateHandler]);

  return (
    <div className={`template-selector ${className}`}>
      {/* Search and Filter Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => updateSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => updateFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 sm:min-w-[150px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600">
          {hasResults ? `${filteredTemplates.length} template${filteredTemplates.length === 1 ? '' : 's'} found` : 'No templates found'}
        </p>
      </div>

      {/* Template Grid */}
      {hasResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`template-card relative bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateClick(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* Template Thumbnail */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={template.thumbnail}
                  alt={`${template.name} template preview`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-template.png';
                  }}
                />

                {/* Premium Badge */}
                {template.isPremium && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                    PREMIUM
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedTemplate?.id === template.id && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                {hoveredTemplate === template.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => handlePreviewClick(template, e)}
                      className="bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleTemplateClick(template)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600"
                    >
                      Select
                    </button>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {template.type}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 2).map((feature, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                  {template.features.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{template.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold">{previewTemplate.name}</h2>
                <p className="text-gray-600">{previewTemplate.description}</p>
              </div>
              <button
                onClick={closePreview}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-auto">
              <img
                src={previewTemplate.preview}
                alt={`${previewTemplate.name} full preview`}
                className="w-full h-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-template-large.png';
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex flex-wrap gap-2">
                {previewTemplate.features.map((feature, index) => (
                  <span
                    key={index}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <button
                onClick={() => {
                  handleTemplateClick(previewTemplate);
                  closePreview();
                }}
                className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600"
              >
                Select Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};