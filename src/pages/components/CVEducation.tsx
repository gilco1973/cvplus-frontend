/**
 * CVEducation Component
 * 
 * Displays education section with institutions, degrees, and achievements.
 * Pure React implementation consuming JSON data from APIs.
 */

import React, { memo, useState } from 'react';
import { GraduationCap, Calendar, MapPin, Award, BookOpen, ExternalLink, Star, ChevronDown, ChevronUp } from 'lucide-react';

// Utility function to highlight placeholders in text
const highlightPlaceholders = (text: string): React.ReactNode[] => {
  if (!text) return [text];
  
  return text.split(/(\[INSERT[^\]]*\]|\[ADD[^\]]*\]|\[NUMBER[^\]]*\])/).map((part, index) => 
    /\[(INSERT|ADD|NUMBER)[^\]]*\]/.test(part) ? (
      <span key={index} className="bg-yellow-200 px-1 py-0.5 rounded text-black font-medium border">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  graduated?: boolean;
  gpa?: number;
  maxGpa?: number;
  location?: string;
  description?: string;
  achievements?: string[];
  courses?: string[];
  thesis?: string;
  honors?: string[];
  activities?: string[];
  institutionUrl?: string;
  logo?: string;
  level?: 'high-school' | 'associate' | 'bachelor' | 'master' | 'doctorate' | 'certificate' | 'bootcamp';
  [key: string]: any;
}

interface CVEducationProps {
  data: EducationItem[];
  jobId?: string;
  className?: string;
  showTimeline?: boolean;
  maxItems?: number;
}

export const CVEducation: React.FC<CVEducationProps> = memo(({
  data = [],
  jobId,
  className = '',
  showTimeline = true,
  maxItems = 10
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Safely handle education data
  const educationItems = Array.isArray(data) ? data.slice(0, maxItems) : [];
  const displayedItems = showAll ? educationItems : educationItems.slice(0, 3);
  const hasMoreItems = educationItems.length > 3;

  // Sort by end date (most recent first)
  const sortedItems = displayedItems.sort((a, b) => {
    const dateA = a.endDate ? new Date(a.endDate) : new Date();
    const dateB = b.endDate ? new Date(b.endDate) : new Date();
    return dateB.getTime() - dateA.getTime();
  });

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

  // Format date range
  const formatDateRange = (startDate?: string, endDate?: string, graduated?: boolean) => {
    if (!startDate && !endDate) return 'Dates not specified';
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const startFormatted = start?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const endFormatted = end?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (graduated === false && end) {
      return `${startFormatted || 'Started'} - ${endFormatted} (Did not complete)`;
    }
    
    if (!endDate) {
      return `${startFormatted || 'Started'} - Present`;
    }
    
    if (startFormatted && endFormatted) {
      return `${startFormatted} - ${endFormatted}`;
    }
    
    return endFormatted || startFormatted || 'Dates not specified';
  };

  // Get education level info
  const getEducationLevelInfo = (level?: string) => {
    const levelMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      'doctorate': { label: 'Doctorate', color: 'purple', icon: <GraduationCap className="w-4 h-4" /> },
      'master': { label: 'Master\'s Degree', color: 'blue', icon: <GraduationCap className="w-4 h-4" /> },
      'bachelor': { label: 'Bachelor\'s Degree', color: 'green', icon: <GraduationCap className="w-4 h-4" /> },
      'associate': { label: 'Associate Degree', color: 'yellow', icon: <BookOpen className="w-4 h-4" /> },
      'certificate': { label: 'Certificate', color: 'orange', icon: <Award className="w-4 h-4" /> },
      'bootcamp': { label: 'Bootcamp', color: 'red', icon: <BookOpen className="w-4 h-4" /> },
      'high-school': { label: 'High School', color: 'gray', icon: <BookOpen className="w-4 h-4" /> }
    };
    
    return levelMap[level || ''] || { label: 'Education', color: 'gray', icon: <GraduationCap className="w-4 h-4" /> };
  };

  // Format GPA display
  const formatGPA = (gpa?: number, maxGpa?: number) => {
    if (!gpa) return null;
    const max = maxGpa || 4.0;
    const percentage = (gpa / max) * 100;
    
    return {
      display: `${gpa.toFixed(2)}${max !== 4.0 ? `/${max.toFixed(1)}` : ''}`,
      percentage,
      color: percentage >= 85 ? 'green' : percentage >= 70 ? 'blue' : 'gray'
    };
  };

  if (educationItems.length === 0) {
    return (
      <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Education
        </h2>
        <div className="text-center py-8">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No education information available</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-600" />
          Education
        </h2>
        <div className="text-sm text-gray-500">
          {educationItems.length} {educationItems.length === 1 ? 'qualification' : 'qualifications'}
        </div>
      </div>

      {/* Education Timeline */}
      <div className="relative">
        {showTimeline && educationItems.length > 1 && (
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-600 via-green-500 to-gray-300"></div>
        )}

        <div className="space-y-6">
          {sortedItems.map((education, index) => {
            const isExpanded = expandedItems.has(index);
            const levelInfo = getEducationLevelInfo(education.level);
            const gpaInfo = formatGPA(education.gpa, education.maxGpa);
            const hasDetails = education.achievements?.length > 0 || education.courses?.length > 0 || 
                              education.activities?.length > 0 || education.thesis || education.description;

            return (
              <div key={index} className="relative">
                {/* Timeline dot */}
                {showTimeline && educationItems.length > 1 && (
                  <div className="absolute left-2 top-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10"></div>
                )}

                {/* Education Card */}
                <div className={`${showTimeline && educationItems.length > 1 ? 'ml-12' : ''} bg-gray-50 rounded-lg p-5 hover:bg-gray-100 transition-colors`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                      {/* Institution and Degree */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Institution Logo */}
                        {education.logo && (
                          <img
                            src={education.logo}
                            alt={`${education.institution} logo`}
                            className="w-10 h-10 rounded object-cover border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {education.degree}
                            {education.field && education.field !== 'undefined' && (
                              <span className="text-gray-600 font-normal"> in {education.field}</span>
                            )}
                          </h3>
                          
                          <div className="flex items-center gap-2 mb-2">
                            {education.institutionUrl ? (
                              <a
                                href={education.institutionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                              >
                                {education.institution}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-blue-600 font-medium">{education.institution}</span>
                            )}
                          </div>
                          
                          {/* Education Details */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateRange(education.startDate, education.endDate, education.graduated)}</span>
                            </div>
                            
                            {education.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{education.location}</span>
                              </div>
                            )}
                            
                            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                              levelInfo.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                              levelInfo.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                              levelInfo.color === 'green' ? 'bg-green-100 text-green-700' :
                              levelInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                              levelInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                              levelInfo.color === 'red' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {levelInfo.icon}
                              {levelInfo.label}
                            </span>
                            
                            {education.graduated === false && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                Did not complete
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {education.description && (
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {highlightPlaceholders(education.description)}
                          </p>
                        </div>
                      )}

                      {/* Thesis */}
                      {education.thesis && isExpanded && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Thesis</h4>
                          <p className="text-sm text-gray-700 italic">"{education.thesis}"</p>
                        </div>
                      )}

                      {/* Honors */}
                      {education.honors && education.honors.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            Honors & Awards
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-6">
                            {education.honors.map((honor, honorIndex) => (
                              <li key={honorIndex}>{honor}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Achievements */}
                      {education.achievements && education.achievements.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                            <Award className="w-4 h-4 text-green-500" />
                            Key Achievements
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-6">
                            {education.achievements.map((achievement, achIndex) => (
                              <li key={achIndex}>{highlightPlaceholders(achievement)}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Relevant Courses */}
                      {education.courses && education.courses.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Relevant Courses</h4>
                          <div className="flex flex-wrap gap-1">
                            {education.courses.map((course, courseIndex) => (
                              <span
                                key={courseIndex}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {education.activities && education.activities.length > 0 && isExpanded && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Activities & Organizations</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-6">
                            {education.activities.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
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

                    {/* GPA Info */}
                    {gpaInfo && (
                      <div className="lg:text-right">
                        <div className="text-sm text-gray-500 mb-1">GPA</div>
                        <div className={`text-lg font-semibold ${
                          gpaInfo.color === 'green' ? 'text-green-600' :
                          gpaInfo.color === 'blue' ? 'text-blue-600' :
                          'text-gray-600'
                        }`}>
                          {gpaInfo.display}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className={`h-1.5 rounded-full ${
                              gpaInfo.color === 'green' ? 'bg-green-500' :
                              gpaInfo.color === 'blue' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${Math.min(gpaInfo.percentage, 100)}%` }}
                          ></div>
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
                Show Less Education
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All {educationItems.length} Qualifications
              </>
            )}
          </button>
        </div>
      )}

      {/* Education Summary */}
      {educationItems.length > 1 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {educationItems.length}
              </div>
              <div className="text-sm text-gray-600">Qualifications</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {educationItems.filter(edu => edu.graduated !== false).length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {educationItems.filter(edu => edu.honors?.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">With Honors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {educationItems.filter(edu => edu.gpa && edu.gpa >= ((edu.maxGpa || 4) * 0.8)).length}
              </div>
              <div className="text-sm text-gray-600">High GPA</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

CVEducation.displayName = 'CVEducation';

export default CVEducation;