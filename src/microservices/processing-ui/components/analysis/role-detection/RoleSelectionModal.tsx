/**
 * Role Selection Modal Component
 * Modal interface for manual role selection and customization
 */

import React, { useState } from 'react';
import { X, Search, Plus, Target, Filter } from 'lucide-react';
import type { RoleSelectionModalProps } from '../context/types';
import type { DetectedRole } from '../../../types/role-profiles';

const getEnhancementPercentage = (enhancementPotential: number | undefined | null): number => {
  if (typeof enhancementPotential !== 'number' || isNaN(enhancementPotential)) {
    return 0; // Safe fallback
  }
  return Math.round(enhancementPotential * 100);
};

const mockAdditionalRoles: DetectedRole[] = [
  {
    roleId: 'product-manager',
    roleName: 'Product Manager',
    confidence: 0.65,
    matchingFactors: ['Leadership', 'Strategy', 'Cross-functional'],
    enhancementPotential: 0.78,
    recommendations: ['Highlight outcomes', 'Emphasize stakeholder management']
  },
  {
    roleId: 'technical-lead',
    roleName: 'Technical Lead',
    confidence: 0.71,
    matchingFactors: ['Technical expertise', 'Team leadership'],
    enhancementPotential: 0.82,
    recommendations: ['Showcase technical leadership', 'Include team management']
  }
];

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  availableRoles,
  selectedRole,
  onRoleSelect,
  onClose,
  onCreateCustom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  if (!isOpen) return null;
  
  // Combine detected roles with additional options - with null/undefined safety
  const allRoles = [...(availableRoles || []), ...mockAdditionalRoles];
  
  // Filter roles based on search and category
  const filteredRoles = allRoles.filter(role => {
    const matchesSearch = role.roleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (role.matchingFactors || []).some(factor => 
                           factor.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    return matchesSearch;
  });
  
  const categories = ['all', 'engineering', 'management', 'data', 'product', 'design'];
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-100">Select Your Professional Role</h2>
            <p className="text-gray-400 mt-1">Choose the role that best matches your experience and career goals</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search roles by name or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-8 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Roles List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filteredRoles.map((role) => {
              const isSelected = selectedRole?.roleId === role.roleId;
              const confidencePercentage = Math.round(role.confidence * 100);
              const enhancementPercentage = getEnhancementPercentage(role.enhancementPotential);
              
              return (
                <div
                  key={role.roleId}
                  className={`relative bg-gray-800 border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-600 ${
                    isSelected ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700'
                  }`}
                  onClick={() => onRoleSelect(role)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500/20 border border-cyan-500' : 'bg-gray-700'
                    }`}>
                      <Target className={`w-5 h-5 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isSelected ? 'text-cyan-300' : 'text-gray-100'}`}>
                        {role.roleName}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        confidencePercentage >= 80 ? 'bg-green-500/20 text-green-400' :
                        confidencePercentage >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {confidencePercentage}% match
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(role.matchingFactors || []).slice(0, 2).map((factor, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        {factor}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    Enhancement: <span className="text-cyan-400 font-medium">
                      +{enhancementPercentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Custom Role Option */}
          {onCreateCustom && (
            <div className="border-t border-gray-700 pt-6">
              <button
                onClick={onCreateCustom}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-gray-300 hover:border-gray-500 hover:bg-gray-750 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create Custom Role</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800/50">
          <div className="text-sm text-gray-400">
            {filteredRoles.length} roles available
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={() => selectedRole && onRoleSelect(selectedRole)}
              disabled={!selectedRole}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:text-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Select Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};