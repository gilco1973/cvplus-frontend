/**
 * CVExperience Component
 * 
 * Displays work experience section with timeline visualization.
 * Pure React implementation consuming JSON data from APIs.
 */

import React, { memo, useState } from 'react';
import { Building2, Calendar, MapPin, ExternalLink, ChevronDown, ChevronUp, Award, TrendingUp } from 'lucide-react';
import { EditablePlaceholderWrapper } from '../../utils/editablePlaceholderUtils';

// Handler for updating experience content
const handleExperienceUpdate = async (newContent: string, experienceIndex: number, fieldPath: string) => {
  try {
    console.log('Experience content updated:', { newContent, experienceIndex, fieldPath });
    // TODO: Implement real-time experience update via Firebase function
  } catch (error) {
    console.error('Failed to update experience content:', error);
  }
};

interface ExperienceItem {
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description: string;
  achievements?: string[];
  skills?: string[];
  companyUrl?: string;
  companyLogo?: string;
  employmentType?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  [key: string]: any;
}

interface CVExperienceProps {
  data: ExperienceItem[];
  jobId?: string;
  className?: string;
  showTimeline?: boolean;
  maxItems?: number;
  onContentUpdate?: (newContent: string, fieldPath: string, section: string) => void;
}

export const CVExperience: React.FC<CVExperienceProps> = memo(({
  data = [],
  jobId,
  className = '',
  showTimeline = true,
  maxItems = 10,
  onContentUpdate
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Safely handle experience data
  const experiences = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const displayedExperiences = showAll ? experiences : experiences.slice(0, 3);
  const hasMoreItems = experiences.length > 3;

  // Toggle item expansion
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (expandedItems.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Format date range with validation
  const formatDateRange = (startDate: string, endDate?: string, current?: boolean) => {
    if (!startDate || startDate === 'undefined' || startDate === 'null') {
      return 'Dates not specified';
    }
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return 'Dates not specified';
    }
    
    const startFormatted = start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (current) {
      return `${startFormatted} - Present`;
    }
    
    if (endDate && endDate !== 'undefined' && endDate !== 'null') {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        const endFormatted = end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return `${startFormatted} - ${endFormatted}`;
      }
    }
    
    return startFormatted;
  };

  // Calculate duration with validation
  const calculateDuration = (startDate: string, endDate?: string, current?: boolean) => {
    if (!startDate || startDate === 'undefined' || startDate === 'null') {
      return '';
    }
    
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return '';
    }
    
    let end = new Date();
    if (!current && endDate && endDate !== 'undefined' && endDate !== 'null') {
      const endParsed = new Date(endDate);
      if (!isNaN(endParsed.getTime())) {
        end = endParsed;
      }
    }
    
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    if (months < 1) return '1 month';
    if (months < 12) return `${months} months`;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    return `${years}y ${remainingMonths}m`;
  };

  // Format employment type
  const formatEmploymentType = (type?: string) => {
    if (!type) return null;
    const formatted = type.replace(/[_-]/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
  };

  if (experiences.length === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Work Experience
        </h2>
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No work experience information available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Work Experience
        </h2>
        <div className="text-sm text-gray-500">
          {experiences.length} {experiences.length === 1 ? 'position' : 'positions'}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="relative">
        {showTimeline && experiences.length > 1 && (
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-600 via-purple-500 to-gray-300"></div>
        )}

        <div className="space-y-6">
          {displayedExperiences.map((experience, index) => {
            const isExpanded = expandedItems.has(index);
            const duration = calculateDuration(experience.startDate, experience.endDate, experience.current);
            const employmentType = formatEmploymentType(experience.employmentType);
            const hasDetails = experience.achievements?.length > 0 || experience.skills?.length > 0 || experience.description?.length > 200;

            return (
              <div key={index} className="relative">
                {/* Timeline dot */}
                {showTimeline && experiences.length > 1 && (
                  <div className="absolute left-2 top-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10"></div>
                )}

                {/* Experience Card */}
                <div className={`${showTimeline && experiences.length > 1 ? 'ml-12' : ''} bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                      {/* Company and Position */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Company Logo */}
                        {experience.companyLogo && (
                          <img
                            src={experience.companyLogo}
                            alt={`${experience.company} logo`}
                            className="w-10 h-10 rounded object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {experience.position}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                            {experience.companyUrl ? (
                              <a
                                href={experience.companyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                              >
                                {experience.company}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span>{experience.company}</span>
                            )}
                          </div>
                          
                          {/* Employment Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateRange(experience.startDate, experience.endDate, experience.current)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-medium">{duration}</span>
                            </div>
                            
                            {experience.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{experience.location}</span>
                              </div>
                            )}
                            
                            {employmentType && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {employmentType}
                              </span>
                            )}
                            
                            {experience.current && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Current Role
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {experience.description && (
                        <div className="mb-4">
                          <div className={`text-gray-700 leading-relaxed ${
                            !isExpanded && experience.description.length > 200 
                              ? 'line-clamp-3' 
                              : ''
                          }`}>
                            <EditablePlaceholderWrapper
                              content={experience.description}
                              onContentUpdate={(newContent) => 
                                onContentUpdate ? 
                                onContentUpdate(newContent, `experience.${index}.description`, 'experience') :
                                handleExperienceUpdate(newContent, index, 'description')
                              }
                              fieldPath={`experience.${index}.description`}
                              section="experience"
                              fallbackToStatic={true}
                            />
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      {experience.achievements && experience.achievements.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                            <Award className="w-4 h-4 text-yellow-500" />
                            Key Achievements
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-6">
                            {experience.achievements.map((achievement, achIndex) => (
                              <li key={achIndex}>
                                <EditablePlaceholderWrapper
                                  content={achievement}
                                  onContentUpdate={(newContent) => 
                                    onContentUpdate ? 
                                    onContentUpdate(newContent, `experience.${index}.achievements.${achIndex}`, 'experience') :
                                    handleExperienceUpdate(newContent, index, `achievements.${achIndex}`)
                                  }
                                  fieldPath={`experience.${index}.achievements.${achIndex}`}
                                  section="experience"
                                  fallbackToStatic={true}
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Skills */}
                      {experience.skills && experience.skills.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills Used</h4>
                          <div className="flex flex-wrap gap-1">
                            {experience.skills.map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded border"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      {hasDetails && (
                        <button
                          onClick={() => toggleExpanded(index)}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show More Details
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Salary Info (if available) */}
                    {experience.salary && (experience.salary.min || experience.salary.max) && isExpanded && (
                      <div className="lg:text-right">
                        <div className="text-sm text-gray-500 mb-1">Compensation</div>
                        <div className="text-lg font-semibold text-green-600">
                          {experience.salary.currency || '$'}
                          {experience.salary.min && experience.salary.max
                            ? `${experience.salary.min.toLocaleString()} - ${experience.salary.max.toLocaleString()}`
                            : (experience.salary.min || experience.salary.max)?.toLocaleString()
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Show More/Less Button */}
      {hasMoreItems && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less Experience
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All {experiences.length} Positions
              </>
            )}
          </button>
        </div>
      )}

      {/* Career Growth Indicator */}
      {experiences.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="font-medium">Career progression across {experiences.length} positions</span>
          </div>
        </div>
      )}
    </section>
  );
});

CVExperience.displayName = 'CVExperience';

export default CVExperience;