import React, { useState, useMemo } from 'react';
import { Search, X, Users, Target, TrendingUp, ChevronRight, Filter } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import type { RoleProfile } from '../../types/role-profiles';

export interface RoleProfileDropdownProps {
  availableRoles: RoleProfile[];
  selectedRole?: RoleProfile | null;
  onRoleSelect: (role: RoleProfile) => void;
  onClose: () => void;
  className?: string;
}

export const RoleProfileDropdown: React.FC<RoleProfileDropdownProps> = ({
  availableRoles,
  selectedRole,
  onRoleSelect,
  onClose,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  // Extract unique categories from available roles
  const categories = useMemo(() => {
    const categorySet = new Set(availableRoles.map(role => role.category));
    return ['all', ...Array.from(categorySet)].sort();
  }, [availableRoles]);

  // Filter and search roles
  const filteredRoles = useMemo(() => {
    let filtered = availableRoles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(role => role.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        role.category.toLowerCase().includes(query) ||
        role.industryFocus?.some(industry => industry.toLowerCase().includes(query)) ||
        role.keySkills?.some(skill => skill.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [availableRoles, selectedCategory, searchQuery]);

  const handleRoleSelect = (role: RoleProfile) => {
    onRoleSelect(role);
  };

  const getRoleIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engineering':
      case 'software':
        return '💻';
      case 'management':
      case 'leadership':
        return '📈';
      case 'hr':
      case 'human resources':
        return '👥';
      case 'ai':
      case 'data':
      case 'analytics':
        return '🤖';
      case 'marketing':
        return '📢';
      case 'design':
        return '🎨';
      case 'finance':
        return '💰';
      case 'sales':
        return '💹';
      default:
        return '🎯';
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'junior':
        return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'mid':
      case 'middle':
        return 'text-blue-400 bg-blue-900/30 border-blue-500/30';
      case 'senior':
        return 'text-orange-400 bg-orange-900/30 border-orange-500/30';
      case 'executive':
      case 'director':
        return 'text-purple-400 bg-purple-900/30 border-purple-500/30';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-100">Select Role Profile</h3>
          <button
            onClick={onClose}
            className={`${designSystem.components.button.base} ${designSystem.components.button.variants.ghost.default} ${designSystem.components.button.sizes.sm} p-2`}
            aria-label="Close role selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search roles by name, skills, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`${designSystem.components.form.input.base} ${designSystem.components.form.input.focus} pl-10 pr-4`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white border border-primary-500'
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:border-gray-500'
              }`}
            >
              {category === 'all' ? 'All Roles' : category}
              {category !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({availableRoles.filter(r => r.category === category).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto">
        {filteredRoles.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-300 mb-2">No Matching Roles</h4>
            <p className="text-gray-500">
              Try adjusting your search terms or category filter.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredRoles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              const isHovered = hoveredRole === role.id;
              
              return (
                <div
                  key={role.id}
                  className={`p-6 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-primary-900/30 border-l-4 border-primary-500'
                      : isHovered
                      ? 'bg-gray-700/50'
                      : 'hover:bg-gray-700/30'
                  }`}
                  onClick={() => handleRoleSelect(role)}
                  onMouseEnter={() => setHoveredRole(role.id)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Role Icon */}
                      <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl text-white text-lg font-bold flex items-center justify-center min-w-[3rem] h-12">
                        {getRoleIcon(role.category)}
                      </div>
                      
                      {/* Role Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-100">
                            {role.name}
                          </h4>
                          
                          {/* Experience Level Badge */}
                          {role.experienceLevel && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                              getExperienceLevelColor(role.experienceLevel)
                            }`}>
                              {role.experienceLevel}
                            </span>
                          )}
                        </div>
                        
                        {/* Category and Industry */}
                        <div className="flex items-center gap-4 mb-2 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{role.category}</span>
                          </div>
                          
                          {role.industryFocus && role.industryFocus.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>{role.industryFocus.slice(0, 2).join(', ')}</span>
                              {role.industryFocus.length > 2 && (
                                <span className="text-xs opacity-75">+{role.industryFocus.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Description */}
                        {role.description && (
                          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                            {role.description}
                          </p>
                        )}
                        
                        {/* Key Skills Preview */}
                        {role.keySkills && role.keySkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {role.keySkills.slice(0, 6).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full border border-gray-600"
                              >
                                {skill}
                              </span>
                            ))}
                            {role.keySkills.length > 6 && (
                              <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full border border-gray-600">
                                +{role.keySkills.length - 6}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Enhancement Potential */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <TrendingUp className="w-3 h-3" />
                          <span>Enhancement potential available</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
                      )}
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                        isHovered ? 'translate-x-1' : ''
                      }`} />
                    </div>
                  </div>
                  
                  {/* Hover Preview */}
                  {isHovered && role.keySkills && role.keySkills.length > 6 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400 mb-2">All Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.keySkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-gray-600 text-gray-300 text-xs rounded-full border border-gray-500"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredRoles.length > 0 && (
        <div className="p-4 bg-gray-700/30 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-400">
            {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} available
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleProfileDropdown;