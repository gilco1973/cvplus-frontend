/**
 * SkillsFilter - Extracted filter functionality from CVSkills
 */

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { SkillCategory } from './types';

interface SkillsFilterProps {
  categories: SkillCategory[];
  selectedCategory: string | null;
  searchTerm: string;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (term: string) => void;
}

export const SkillsFilter: React.FC<SkillsFilterProps> = ({
  categories,
  selectedCategory,
  searchTerm,
  onCategoryChange,
  onSearchChange,
}) => {
  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-4 py-2 rounded-full transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-4 w-4 inline mr-2" />
          All Skills
        </button>
        
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onCategoryChange(category.name)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category.name
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedCategory === category.name ? category.color : undefined,
            }}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkillsFilter;