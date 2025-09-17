import React, { useState } from 'react';
import {
  Eye, Code, Award, Github, BookOpen, Trophy, Star,
  ChevronDown, ChevronUp, CheckCircle, Circle
} from 'lucide-react';
import type { SelectedItems } from '../../types/externalData';

interface CategorySectionProps {
  category: keyof SelectedItems;
  data: unknown;
  selectedItems: SelectedItems;
  onUpdateSelection: (category: keyof SelectedItems, itemId: string, selected: boolean) => void;
}

const CATEGORY_ICONS = {
  portfolio: Eye,
  skills: Code,
  certifications: Award,
  projects: Github,
  publications: BookOpen,
  achievements: Trophy,
  hobbies: Star,
  interests: Star,
} as const;

const CATEGORY_COLORS = {
  portfolio: 'text-blue-400 bg-blue-400/10',
  skills: 'text-green-400 bg-green-400/10',
  certifications: 'text-yellow-400 bg-yellow-400/10',
  projects: 'text-purple-400 bg-purple-400/10',
  publications: 'text-cyan-400 bg-cyan-400/10',
  achievements: 'text-orange-400 bg-orange-400/10',
  hobbies: 'text-pink-400 bg-pink-400/10',
  interests: 'text-indigo-400 bg-indigo-400/10',
} as const;

const CATEGORY_NAMES = {
  portfolio: 'Portfolio Items',
  skills: 'Skills',
  certifications: 'Certifications',
  projects: 'Projects',
  publications: 'Publications',
  achievements: 'Achievements',
  hobbies: 'Hobbies & Interests',
  interests: 'Interests',
} as const;

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  data,
  selectedItems,
  onUpdateSelection
}) => {
  const [isExpanded, setIsExpanded] = useState(category === 'portfolio' || category === 'certifications');
  
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  
  const Icon = CATEGORY_ICONS[category];
  const colorClass = CATEGORY_COLORS[category];
  const categoryData = Array.isArray(data) ? data : [];
  const selectedCount = selectedItems[category].length;
  
  const toggleCategorySelection = (selectAll: boolean) => {
    categoryData.forEach((item, index) => {
      const itemId = typeof item === 'string' ? `${category}-${index}` : item.id;
      const isSelected = selectedItems[category].includes(itemId);
      if (selectAll && !isSelected) {
        onUpdateSelection(category, itemId, true);
      } else if (!selectAll && isSelected) {
        onUpdateSelection(category, itemId, false);
      }
    });
  };
  
  const renderItem = (item: unknown, index: number) => {
    const itemId = typeof item === 'string' ? `${category}-${index}` : (item as { id: string }).id;
    const isSelected = selectedItems[category].includes(itemId);
    
    const handleToggle = () => {
      onUpdateSelection(category, itemId, !isSelected);
    };
    
    if (typeof item === 'string') {
      return (
        <div
          key={itemId}
          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200 ${
            isSelected 
              ? `border-primary-400 ${colorClass}` 
              : 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/30'
          }`}
          onClick={handleToggle}
        >
          {isSelected ? (
            <CheckCircle className="w-3 h-3 text-primary-400 flex-shrink-0" />
          ) : (
            <Circle className="w-3 h-3 text-neutral-500 flex-shrink-0" />
          )}
          <span className="text-sm text-neutral-200 truncate">{item}</span>
        </div>
      );
    }
    
    // Handle object items (portfolio, certifications, etc.)
    const objectItem = item as { id: string; title?: string; name?: string; description?: string };
    const title = objectItem.title || objectItem.name || 'Unknown Item';
    
    return (
      <div
        key={itemId}
        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
          isSelected 
            ? `border-primary-400 ${colorClass}` 
            : 'border-neutral-600 hover:border-neutral-500 bg-neutral-700/30'
        }`}
        onClick={handleToggle}
      >
        <div className="flex items-start gap-2">
          {isSelected ? (
            <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
          ) : (
            <Circle className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-neutral-100 text-sm">{title}</h4>
            {objectItem.description && (
              <p className="text-xs text-neutral-400 mt-1">
                {objectItem.description.length > 100 
                  ? `${objectItem.description.substring(0, 100)}...` 
                  : objectItem.description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${colorClass} hover:opacity-80`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <div>
            <h4 className="font-medium text-neutral-100">
              {CATEGORY_NAMES[category]} ({categoryData.length})
            </h4>
            {selectedCount > 0 && (
              <p className="text-xs text-neutral-400">
                {selectedCount} selected
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleCategorySelection(selectedCount !== categoryData.length);
            }}
            className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20 transition-colors"
          >
            {selectedCount === categoryData.length ? 'Deselect All' : 'Select All'}
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-2 pl-4 animate-fade-in-up">
          {category === 'skills' || category === 'hobbies' || category === 'interests' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categoryData.map(renderItem)}
            </div>
          ) : (
            <div className="space-y-2">
              {categoryData.map(renderItem)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
