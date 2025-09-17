/**
 * Template Picker Component
 *
 * Modal component for selecting CV templates with preview,
 * filtering, and category browsing.
 */

import React, { useState, useCallback } from 'react';
import {
  X,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Crown,
  Eye,
  Download,
  Loader2
} from 'lucide-react';

import type { CVTemplate } from './types';

interface TemplatePickerProps {
  templates: CVTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
  loading?: boolean;
  showPreview?: boolean;
}

/**
 * Template Picker Component
 */
export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  templates,
  selectedTemplate,
  onSelect,
  onClose,
  loading = false,
  showPreview = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  // Get unique categories from templates
  const categories = [
    'all',
    ...Array.from(new Set(templates.map(t => t.category)))
  ];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    onSelect(templateId);
  }, [onSelect]);

  // Handle template preview
  const handleTemplatePreview = useCallback((template: CVTemplate) => {
    setPreviewTemplate(template);
  }, []);

  // Close preview
  const closePreview = useCallback(() => {
    setPreviewTemplate(null);
  }, []);

  // Format category name
  const formatCategoryName = (category: string) => {
    if (category === 'all') return 'All Templates';
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get template display info
  const getTemplateDisplayInfo = (template: CVTemplate) => {
    const isPremium = template.features.some(f => f.premium);
    const isPopular = (template.metadata.downloads || 0) > 1000;
    const rating = template.metadata.rating || 0;

    return { isPremium, isPopular, rating };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="w-full max-w-6xl h-[90vh] bg-gray-800 rounded-lg shadow-2xl border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-semibold text-white">Choose Template</h2>
            <p className="text-gray-400 mt-1">
              Select a professional template for your CV
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and search */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {formatCategoryName(category)}
                </option>
              ))}
            </select>

            {/* View mode toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Templates grid/list */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <span className="ml-2 text-gray-400">Loading templates...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-12 h-12 mx-auto mb-4" />
                <p>No templates found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or filters.</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredTemplates.map(template => {
                const { isPremium, isPopular, rating } = getTemplateDisplayInfo(template);
                const isSelected = template.id === selectedTemplate;

                return (
                  <div
                    key={template.id}
                    className={`
                      relative group bg-gray-700 rounded-lg overflow-hidden transition-all cursor-pointer
                      ${isSelected ? 'ring-2 ring-cyan-500 bg-gray-600' : 'hover:bg-gray-600'}
                      ${viewMode === 'list' ? 'flex' : ''}
                    `}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {/* Template preview image */}
                    <div className={`${viewMode === 'list' ? 'w-32 h-24' : 'h-48'} bg-gray-600 relative overflow-hidden`}>
                      {template.previewUrl ? (
                        <img
                          src={template.previewUrl}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="w-12 h-16 bg-gray-500 rounded mx-auto mb-2" />
                            <p className="text-xs">Preview</p>
                          </div>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex space-x-1">
                        {isPremium && (
                          <div className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-medium flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            Pro
                          </div>
                        )}
                        {isPopular && (
                          <div className="bg-green-500 text-green-900 px-2 py-1 rounded text-xs font-medium">
                            Popular
                          </div>
                        )}
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex space-x-2">
                          {showPreview && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTemplatePreview(template);
                              }}
                              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Template info */}
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        {rating > 0 && (
                          <div className="flex items-center text-yellow-400 ml-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm ml-1">{rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {template.features.slice(0, 3).map(feature => (
                          <span
                            key={feature.id}
                            className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded"
                          >
                            {feature.name}
                          </span>
                        ))}
                        {template.features.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-600 text-gray-300 rounded">
                            +{template.features.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="mt-3 flex items-center text-cyan-400 text-sm">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2" />
                          Selected
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>

      {/* Template preview modal */}
      {previewTemplate && showPreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">{previewTemplate.name}</h3>
              <button
                onClick={closePreview}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {previewTemplate.previewUrl ? (
                <img
                  src={previewTemplate.previewUrl}
                  alt={previewTemplate.name}
                  className="w-full h-auto"
                />
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Preview not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};