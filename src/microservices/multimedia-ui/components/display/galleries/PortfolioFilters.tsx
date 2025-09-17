/**
 * Portfolio Filters Component
 * Search and filter controls for portfolio gallery
 */

import React from 'react';
import { Search, Filter, Grid3X3, LayoutGrid, Download } from 'lucide-react';
import { PortfolioFiltersProps } from './types';

export const PortfolioFilters: React.FC<PortfolioFiltersProps> = ({
  searchTerm,
  selectedCategory,
  categories,
  viewMode,
  filterByCategory,
  onSearchChange,
  onCategoryChange,
  onViewModeChange,
  onExport
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        {filterByCategory && categories.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600'
            }`}
            title="Grid View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('masonry')}
            className={`p-2 rounded ${
              viewMode === 'masonry' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-gray-600'
            }`}
            title="Masonry View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Export Portfolio Summary"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
};