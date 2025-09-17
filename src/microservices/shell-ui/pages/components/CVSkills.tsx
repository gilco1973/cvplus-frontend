/**
 * CVSkills Component
 * 
 * Displays skills section with categorization and proficiency levels.
 * Pure React implementation consuming JSON data from APIs.
 */

import React, { memo, useState } from 'react';
import { Code, Zap, Users, Briefcase, Star, TrendingUp, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { logger } from '../../utils/logger';

interface SkillItem {
  name: string;
  level?: number; // 0-100
  category?: string;
  yearsExperience?: number;
  endorsed?: boolean;
  certifications?: string[];
  description?: string;
}

interface SkillCategory {
  name: string;
  skills: SkillItem[];
  icon?: React.ReactNode;
  color?: string;
}

interface SkillsData {
  technical?: SkillItem[];
  soft?: SkillItem[];
  languages?: SkillItem[];
  categories?: Record<string, SkillItem[]>;
  tools?: SkillItem[];
  frameworks?: SkillItem[];
  [key: string]: any;
}

interface CVSkillsProps {
  data: SkillsData | string[] | SkillItem[];
  jobId?: string;
  className?: string;
  showProficiency?: boolean;
  maxSkillsPerCategory?: number;
}

export const CVSkills: React.FC<CVSkillsProps> = memo(({
  data = [],
  jobId,
  className = '',
  showProficiency = true,
  maxSkillsPerCategory = 20
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Helper function to validate and clean skills data
  const validateSkill = (skill: any): SkillItem | null => {
    if (!skill || typeof skill !== 'object') return null;
    
    // If skill is a string, convert to SkillItem
    if (typeof skill === 'string') {
      return { name: skill };
    }
    
    // Ensure skill has a valid name
    if (!skill.name || typeof skill.name !== 'string') return null;
    
    return {
      name: skill.name,
      level: skill.level || undefined,
      category: skill.category || undefined,
      yearsExperience: skill.yearsExperience || undefined,
      endorsed: skill.endorsed || false,
      certifications: skill.certifications || undefined,
      description: skill.description || undefined
    };
  };

  // Process skills data into categories
  const processSkillsData = (): SkillCategory[] => {
    const log = logger.component('CVSkills');
    
    const categories: SkillCategory[] = [];
    
    // Early return if data is null, undefined, or empty
    if (!data || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)) {
      log.warn('No valid skills data provided');
      return categories;
    }
    
    // Handle case where data is a simple array (legacy format)
    if (Array.isArray(data)) {
      const validSkills = data
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Skills',
          skills: validSkills,
          icon: <Star className="w-4 h-4" />,
          color: 'blue'
        });
      }
      return categories;
    }
    
    // Default category mappings with icons
    const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
      'Technical Skills': { icon: <Code className="w-4 h-4" />, color: 'blue' },
      'Programming': { icon: <Code className="w-4 h-4" />, color: 'blue' },
      'Frontend': { icon: <Code className="w-4 h-4" />, color: 'green' },
      'Backend': { icon: <Code className="w-4 h-4" />, color: 'purple' },
      'Databases': { icon: <Briefcase className="w-4 h-4" />, color: 'indigo' },
      'Cloud': { icon: <TrendingUp className="w-4 h-4" />, color: 'blue' },
      'Frameworks': { icon: <Zap className="w-4 h-4" />, color: 'orange' },
      'Tools': { icon: <Briefcase className="w-4 h-4" />, color: 'gray' },
      'Soft Skills': { icon: <Users className="w-4 h-4" />, color: 'pink' },
      'Competencies': { icon: <Users className="w-4 h-4" />, color: 'pink' },
      'Languages': { icon: <Users className="w-4 h-4" />, color: 'indigo' },
      'Expertise': { icon: <Star className="w-4 h-4" />, color: 'purple' }
    };

    // Handle object format skills data  
    const skillsObj = data as SkillsData;
    
    log.debug('Processing skills object with keys:', Object.keys(skillsObj || {}));
    
    // Process technical skills
    if (skillsObj.technical && Array.isArray(skillsObj.technical)) {
      const validSkills = skillsObj.technical
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Technical Skills',
          skills: validSkills,
          ...categoryConfig['Technical Skills']
        });
      }
    }

    // Process expertise skills
    if (skillsObj.expertise && Array.isArray(skillsObj.expertise)) {
      const validSkills = skillsObj.expertise
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Expertise',
          skills: validSkills,
          icon: <Star className="w-4 h-4" />,
          color: 'purple'
        });
      }
    }

    // Process frameworks
    if (skillsObj.frameworks && Array.isArray(skillsObj.frameworks)) {
      const validSkills = skillsObj.frameworks
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Frameworks',
          skills: validSkills,
          ...categoryConfig['Frameworks']
        });
      }
    }

    // Process tools
    if (skillsObj.tools && Array.isArray(skillsObj.tools)) {
      const validSkills = skillsObj.tools
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Tools',
          skills: validSkills,
          ...categoryConfig['Tools']
        });
      }
    }

    // Process soft skills
    if (skillsObj.soft && Array.isArray(skillsObj.soft)) {
      const validSkills = skillsObj.soft
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Soft Skills',
          skills: validSkills,
          ...categoryConfig['Soft Skills']
        });
      }
    }

    // Process languages
    if (skillsObj.languages && Array.isArray(skillsObj.languages)) {
      const validSkills = skillsObj.languages
        .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
        .filter((skill): skill is SkillItem => skill !== null)
        .slice(0, maxSkillsPerCategory);
      
      if (validSkills.length > 0) {
        categories.push({
          name: 'Languages',
          skills: validSkills,
          ...categoryConfig['Languages']
        });
      }
    }

    // Process new categorized skills from backend improvements
    const newCategories = ['frontend', 'backend', 'databases', 'cloud', 'competencies'];
    newCategories.forEach(categoryKey => {
      if (skillsObj[categoryKey] && Array.isArray(skillsObj[categoryKey])) {
        const validSkills = skillsObj[categoryKey]
          .map(skill => typeof skill === 'string' ? { name: skill } : validateSkill(skill))
          .filter((skill): skill is SkillItem => skill !== null)
          .slice(0, maxSkillsPerCategory);
        
        if (validSkills.length > 0) {
          const displayName = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
          categories.push({
            name: displayName,
            skills: validSkills,
            ...categoryConfig[displayName] || { icon: <Star className="w-4 h-4" />, color: 'gray' }
          });
        }
      }
    });

    // Process additional categories
    if (skillsObj.categories && typeof skillsObj.categories === 'object') {
      Object.entries(skillsObj.categories).forEach(([categoryName, skills]) => {
        if (Array.isArray(skills) && skills.length > 0) {
          const validSkills = skills
            .map(validateSkill)
            .filter((skill): skill is SkillItem => skill !== null)
            .slice(0, maxSkillsPerCategory);
          
          if (validSkills.length > 0) {
            categories.push({
              name: categoryName,
              skills: validSkills,
              ...categoryConfig[categoryName] || { icon: <Star className="w-4 h-4" />, color: 'gray' }
            });
          }
        }
      });
    }

    const filteredCategories = categories.filter(category => category.skills.length > 0);
    
    log.debug(`Processed ${filteredCategories.length} skill categories`);
    
    return filteredCategories;
  };

  const skillCategories = processSkillsData();

  // Filter skills based on search term
  const filteredCategories = skillCategories
    .map(category => ({
      ...category,
      skills: category.skills.filter(skill => 
        skill.name && skill.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.skills.length > 0);

  // Get color classes for category
  const getCategoryColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
      gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
    };
    return colorMap[color] || colorMap.gray;
  };

  // Get proficiency level display
  const getProficiencyLevel = (level?: number) => {
    if (!level) return { text: 'Familiar', color: 'gray', width: 25 };
    if (level >= 90) return { text: 'Expert', color: 'green', width: level };
    if (level >= 70) return { text: 'Advanced', color: 'blue', width: level };
    if (level >= 50) return { text: 'Intermediate', color: 'yellow', width: level };
    return { text: 'Beginner', color: 'red', width: level };
  };

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (expandedCategories.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  if (skillCategories.length === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Skills & Expertise
        </h2>
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No skills information available</p>
        </div>
      </section>
    );
  }

  const displayedCategories = selectedCategory 
    ? filteredCategories.filter(cat => cat.name === selectedCategory)
    : filteredCategories;

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Skills & Expertise
        </h2>
        <div className="text-sm text-gray-500">
          {skillCategories.reduce((total, cat) => total + cat.skills.length, 0)} skills
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {skillCategories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.skills.length})
              </option>
            ))}
          </select>
          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Skills Categories */}
      <div className="space-y-6">
        {displayedCategories.map((category) => {
          const colors = getCategoryColorClasses(category.color || 'gray');
          const isExpanded = expandedCategories.has(category.name) || category.skills.length <= 6;
          const displayedSkills = isExpanded ? category.skills : category.skills.slice(0, 6);
          const hasMoreSkills = category.skills.length > 6;

          return (
            <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className={`${colors.bg} ${colors.border} border-b px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-semibold ${colors.text}`}>
                    {category.icon}
                    <span>{category.name}</span>
                    <span className="text-sm font-normal opacity-75">
                      ({category.skills.length} skills)
                    </span>
                  </div>
                  
                  {hasMoreSkills && (
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className={`${colors.text} hover:opacity-75 transition-opacity`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Skills Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedSkills.map((skill, skillIndex) => {
                    const proficiency = getProficiencyLevel(skill.level);
                    
                    return (
                      <div
                        key={skillIndex}
                        className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-1">
                              {skill.name}
                              {skill.endorsed && (
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              )}
                            </h4>
                            
                            {skill.yearsExperience && (
                              <p className="text-xs text-gray-500 mt-1">
                                {skill.yearsExperience} {skill.yearsExperience === 1 ? 'year' : 'years'} experience
                              </p>
                            )}
                          </div>
                          
                          {showProficiency && skill.level && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              proficiency.color === 'green' ? 'bg-green-100 text-green-700' :
                              proficiency.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              proficiency.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {proficiency.text}
                            </span>
                          )}
                        </div>
                        
                        {/* Proficiency Bar */}
                        {showProficiency && skill.level && (
                          <div className="mb-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  proficiency.color === 'green' ? 'bg-green-500' :
                                  proficiency.color === 'blue' ? 'bg-blue-500' :
                                  proficiency.color === 'yellow' ? 'bg-yellow-500' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${proficiency.width}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Certifications */}
                        {skill.certifications && skill.certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {skill.certifications.slice(0, 2).map((cert, certIndex) => (
                              <span
                                key={certIndex}
                                className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded border"
                              >
                                {cert}
                              </span>
                            ))}
                            {skill.certifications.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{skill.certifications.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Description */}
                        {skill.description && (
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Show More Button */}
                {hasMoreSkills && !isExpanded && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => toggleCategory(category.name)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4" />
                      Show {category.skills.length - 6} more skills
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills Summary */}
      {skillCategories.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {skillCategories.reduce((total, cat) => total + cat.skills.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {skillCategories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {skillCategories.reduce((total, cat) => 
                  total + cat.skills.filter(skill => skill.level && skill.level >= 70).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Advanced+</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {skillCategories.reduce((total, cat) => 
                  total + cat.skills.filter(skill => skill.endorsed).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Endorsed</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

CVSkills.displayName = 'CVSkills';

export default CVSkills;