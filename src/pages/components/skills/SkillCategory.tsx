/**
 * SkillCategory - Category display component with expandable sections
 */

import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SkillCategory as SkillCategoryType, SkillItem } from './types';
import SkillCard from './SkillCard';

interface SkillCategoryProps {
  category: SkillCategoryType;
  isExpanded: boolean;
  onToggle: () => void;
  onSkillClick?: (skill: SkillItem) => void;
  filteredSkills: SkillItem[];
}

export const SkillCategory: React.FC<SkillCategoryProps> = ({
  category,
  isExpanded,
  onToggle,
  onSkillClick,
  filteredSkills,
}) => {
  const getIconComponent = (iconName: string) => {
    // Map icon names to components
    const iconMap: Record<string, React.ComponentType<any>> = {
      // Add icon mappings as needed
    };
    
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  if (filteredSkills.length === 0) return null;

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {getIconComponent(category.icon) || (
              <div 
                className="h-5 w-5 rounded"
                style={{ backgroundColor: category.color }}
              />
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              {category.name}
            </h3>
            <p className="text-sm text-gray-600">
              {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
              {category.description && ` • ${category.description}`}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill, index) => (
              <SkillCard
                key={`${skill.name}-${index}`}
                skill={skill}
                categoryColor={category.color}
                onClick={onSkillClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCategory;