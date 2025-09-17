/**
 * SkillCard - Individual skill display component
 */

import React from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { SkillItem } from './types';

interface SkillCardProps {
  skill: SkillItem;
  categoryColor: string;
  onClick?: (skill: SkillItem) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  categoryColor,
  onClick,
}) => {
  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'expert': return 'text-green-600';
      case 'advanced': return 'text-blue-600';
      case 'intermediate': return 'text-yellow-600';
      case 'beginner': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const getSkillLevelStars = (level?: string) => {
    const levelMap = {
      'expert': 5,
      'advanced': 4,
      'intermediate': 3,
      'beginner': 2,
    };
    return levelMap[level?.toLowerCase() as keyof typeof levelMap] || 3;
  };

  return (
    <div
      className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-gray-300' : ''
      }`}
      onClick={() => onClick?.(skill)}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
        {skill.level && (
          <span className={`text-sm ${getLevelColor(skill.level)}`}>
            {skill.level}
          </span>
        )}
      </div>
      
      {skill.description && (
        <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {skill.level && (
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < getSkillLevelStars(skill.level)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
          
          {skill.yearsExperience && (
            <div className="flex items-center text-gray-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              {skill.yearsExperience}y
            </div>
          )}
        </div>
        
        {skill.certifications && skill.certifications.length > 0 && (
          <span className="text-gray-500">
            {skill.certifications.length} cert{skill.certifications.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      {skill.keywords && skill.keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {skill.keywords.slice(0, 3).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
            >
              {keyword}
            </span>
          ))}
          {skill.keywords.length > 3 && (
            <span className="text-xs text-gray-400">+{skill.keywords.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillCard;