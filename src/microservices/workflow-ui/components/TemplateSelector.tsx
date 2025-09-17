import React, { useState, useEffect } from 'react';
import { CVTemplate, TemplateCategory } from '../../types/Template';
import { useTemplates } from '../hooks/useTemplates';

interface TemplateSelectorProps {
  onTemplateSelect: (template: CVTemplate) => void;
  selectedTemplateId?: string;
  category?: TemplateCategory;
  showPreview?: boolean;
}

/**
 * Template Selector Component
 * 
 * Provides interface for browsing and selecting CV templates
 * with filtering, preview, and category support.
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  selectedTemplateId,
  category,
  showPreview = true
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | undefined>(category);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  const { 
    templates, 
    categories, 
    featuredTemplates,
    isLoading, 
    error,
    searchTemplates
  } = useTemplates();

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTemplateClick = (template: CVTemplate) => {
    onTemplateSelect(template);
  };

  const handlePreview = (template: CVTemplate) => {
    setPreviewTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-600 font-medium">Failed to load templates</div>
        <div className="text-red-700 text-sm mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Select Template
        </h3>
        <p className="text-sm text-gray-500">
          Choose a template for your CV workflow
        </p>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b border-gray-200 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              !selectedCategory 
                ? 'bg-blue-100 text-blue-800 border-blue-200' 
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                selectedCategory === cat
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Templates */}
      {!selectedCategory && !searchQuery && featuredTemplates.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Featured Templates
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTemplates.slice(0, 3).map((template) => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTemplateId === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleTemplateClick(template)}
              >
                <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center">
                  {template.thumbnailUrl ? (
                    <img 
                      src={template.thumbnailUrl} 
                      alt={template.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Preview</span>
                  )}
                </div>
                <h5 className="font-medium text-gray-900 mb-1">{template.name}</h5>
                {template.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-blue-600 font-medium">Featured</span>
                  {showPreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(template);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Preview
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedTemplateId === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleTemplateClick(template)}
            >
              <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center">
                {template.thumbnailUrl ? (
                  <img 
                    src={template.thumbnailUrl} 
                    alt={template.name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Preview</span>
                )}
              </div>
              <h5 className="font-medium text-gray-900 mb-1">{template.name}</h5>
              {template.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{template.description}</p>
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  template.isPremium 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {template.isPremium ? 'Premium' : 'Free'}
                </span>
                {showPreview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(template);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Preview
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">No templates found</div>
            <div className="text-sm text-gray-500">
              Try adjusting your search or category filters
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Template Preview: {previewTemplate.name}
              </h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="aspect-[8.5/11] bg-gray-100 rounded flex items-center justify-center">
                {previewTemplate.previewUrl ? (
                  <img 
                    src={previewTemplate.previewUrl} 
                    alt={`${previewTemplate.name} preview`}
                    className="w-full h-full object-contain rounded"
                  />
                ) : (
                  <span className="text-gray-400">Full preview not available</span>
                )}
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleTemplateClick(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Select Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};