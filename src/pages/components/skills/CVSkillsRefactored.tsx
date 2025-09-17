/**
 * CVSkills Refactored - Main component under 200 lines
 * Extracted functionality into separate modules for better maintainability
 */

import React, { memo, useState, useMemo } from 'react';
import { logger } from '../../../utils/logger';
import { CVSkillsProps, SkillsData, SkillCategory as SkillCategoryType } from './types';
import SkillsFilter from './SkillsFilter';
import SkillCategory from './SkillCategory';

export const CVSkillsRefactored: React.FC<CVSkillsProps> = memo(({
  skillsData,
  className = '',
  variant = 'default',
  showFilters = true,
  showSearch = true,
  onSkillClick,
}) => {
  logger.debug('🎨 [CVSkills] Rendering skills component');

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Transform and sanitize skills data
  const sanitizedData = useMemo((): SkillsData => {
    if (!skillsData?.categories) {
      return { categories: [] };
    }

    return {
      categories: skillsData.categories.map(category => ({
        name: category.name || 'Uncategorized',
        skills: (category.skills || []).map(skill => ({
          name: skill.name || 'Unknown Skill',
          level: skill.level || undefined,
          category: skill.category || undefined,
          yearsExperience: skill.yearsExperience || undefined,
          keywords: skill.keywords || undefined,
          certifications: skill.certifications || undefined,
          description: skill.description || undefined
        })),
        color: category.color || '#6B7280',
        icon: category.icon || 'default',
        description: category.description
      })),
      summary: skillsData.summary
    };
  }, [skillsData]);

  // Early return if data is null, undefined, or empty
  if (!sanitizedData?.categories || sanitizedData.categories.length === 0) {
    return (
      <div className={`p-6 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">No skills data available</p>
      </div>
    );
  }

  // Filter categories and skills
  const filteredData = useMemo(() => {
    return sanitizedData.categories.map(category => {
      let skills = category.skills;
      
      // Apply search filter
      if (searchTerm) {
        skills = skills.filter(skill =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.keywords?.some(keyword => 
            keyword.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      
      return {
        ...category,
        skills
      };
    }).filter(category => 
      // Filter by selected category or show all
      selectedCategory === null || category.name === selectedCategory
    );
  }, [sanitizedData, selectedCategory, searchTerm]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const totalSkills = useMemo(() => {
    return filteredData.reduce((sum, category) => sum + category.skills.length, 0);
  }, [filteredData]);

  // Expand first category by default if none are expanded
  React.useEffect(() => {
    if (expandedCategories.size === 0 && filteredData.length > 0) {
      setExpandedCategories(new Set([filteredData[0].name]));
    }
  }, [filteredData, expandedCategories.size]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Expertise</h2>
        {sanitizedData.summary && (
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <span>{sanitizedData.summary.totalSkills} Total Skills</span>
            <span>{sanitizedData.summary.expertLevel} Expert Level</span>
            <span>{sanitizedData.summary.years}+ Years Experience</span>
          </div>
        )}
        <p className="text-gray-600 mt-2">
          {totalSkills} skill{totalSkills !== 1 ? 's' : ''} displayed
        </p>
      </div>

      {/* Filters */}
      {(showFilters || showSearch) && (
        <SkillsFilter
          categories={sanitizedData.categories}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchTerm}
        />
      )}

      {/* Skills Categories */}
      <div className="space-y-4">
        {filteredData.map(category => (
          <SkillCategory
            key={category.name}
            category={category}
            isExpanded={expandedCategories.has(category.name)}
            onToggle={() => toggleCategory(category.name)}
            onSkillClick={onSkillClick}
            filteredSkills={category.skills}
          />
        ))}
      </div>

      {totalSkills === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No skills match your current filters. Try adjusting your search or category selection.
          </p>
        </div>
      )}
    </div>
  );
});

CVSkillsRefactored.displayName = 'CVSkillsRefactored';

export default CVSkillsRefactored;