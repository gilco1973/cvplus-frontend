/**
 * Carousel Controls Component
 * Controls for testimonials carousel
 */

import React from 'react';
import { CarouselControlsProps } from './types';

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  filterRelationship,
  isAutoPlaying,
  testimonialsCount,
  onFilterChange,
  onAutoPlayToggle
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <select
          value={filterRelationship}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Relationships</option>
          <option value="manager">Managers</option>
          <option value="colleague">Colleagues</option>
          <option value="client">Clients</option>
          <option value="team-member">Team Members</option>
          <option value="mentor">Mentors</option>
        </select>

        <button
          onClick={onAutoPlayToggle}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isAutoPlaying 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isAutoPlaying ? 'Pause' : 'Auto Play'}
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {testimonialsCount} testimonial{testimonialsCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
};