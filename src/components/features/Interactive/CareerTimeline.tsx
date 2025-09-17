import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, MapPin, Award, GraduationCap, Briefcase, ChevronDown, ChevronUp, ExternalLink, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { format, parseISO, isValid, differenceInMonths } from 'date-fns';
import { CVFeatureProps, TimelineData, Experience, Education, Milestone } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary, FunctionalErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

interface TimelineProps extends CVFeatureProps {
  data: TimelineData;
  customization?: {
    layout?: 'vertical' | 'horizontal';
    showDates?: boolean;
    showLogos?: boolean;
    animateOnScroll?: boolean;
    showDuration?: boolean;
    groupByYear?: boolean;
  };
}

interface TimelineItem {
  id: string;
  type: 'experience' | 'education' | 'milestone';
  date: Date;
  title: string;
  subtitle: string;
  description: string;
  location?: string;
  logo?: string;
  achievements?: string[];
  duration?: string;
  isCurrentPosition?: boolean;
  icon: React.ReactNode;
  color: string;
}

interface MilestonePopupProps {
  item: TimelineItem;
  isOpen: boolean;
  onClose: () => void;
}

const MilestonePopup: React.FC<MilestonePopupProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div>
      <div className="animate-fade-in fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div 
          className="animate-fade-in bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-96 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-4">
            {item.logo ? (
              <img
                src={item.logo}
                alt={`${item.subtitle} logo`}
                className="w-12 h-12 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center text-white`}>
                {item.icon}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{item.subtitle}</p>
              {item.location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close popup"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">{item.description}</p>
            
            {item.achievements && item.achievements.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Key Achievements
                </h4>
                <ul className="space-y-1">
                  {item.achievements.map((achievement, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(item.date, 'MMM yyyy')}
              </div>
              {item.duration && (
                <div>{item.duration}</div>
              )}
              {item.isCurrentPosition && (
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                  Current
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineItemCardProps {
  item: TimelineItem;
  isLeft?: boolean;
  index: number;
  animateOnScroll: boolean;
  showLogos: boolean;
  showDates: boolean;
  onClick: () => void;
}

const TimelineItemCard: React.FC<TimelineItemCardProps> = ({
  item,
  isLeft = false,
  index,
  animateOnScroll,
  showLogos,
  showDates,
  onClick
}) => {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const variants = {
    hidden: {
      opacity: 0,
      x: isLeft ? -50 : 50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: animateOnScroll ? index * 0.1 : 0,
        ease: "easeOut"
      }
    }

  return (
    <div 
      ref={ref}
      className={`animate-fade-in timeline-item cursor-pointer group ${
        isLeft ? 'timeline-item-left' : 'timeline-item-right'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`View details for ${item.title} at ${item.subtitle}`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
        <div className="flex items-start gap-3">
          {showLogos && item.logo ? (
            <img
              src={item.logo}
              alt={`${item.subtitle} logo`}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-gray-700 flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-white flex-shrink-0`}>
              {item.icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {item.subtitle}
            </p>
            
            {item.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mb-2">
                <MapPin className="w-3 h-3" />
                {item.location}
              </div>
            )}
            
            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
              {item.description}
            </p>
            
            {showDates && (
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(item.date, 'MMM yyyy')}
                </div>
                {item.duration && <div>{item.duration}</div>}
                {item.isCurrentPosition && (
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
            )}
          </div>
          
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export const CareerTimeline: React.FC<TimelineProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  const {
    layout = 'vertical',
    showDates = true,
    showLogos = true,
    animateOnScroll = true,
    showDuration = true,
    groupByYear = false
  } = customization;

  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to calculate duration
  const calculateDuration = useCallback((startDate: string, endDate?: string): string => {
    try {
      const start = parseISO(startDate);
      const end = endDate ? parseISO(endDate) : new Date();
      
      if (!isValid(start) || !isValid(end)) return '';
      
      const months = differenceInMonths(end, start);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years > 0 && remainingMonths > 0) {
        return `${years}y ${remainingMonths}m`;
      } else if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      } else {
        return `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
    } catch {
      return '';
    }
  }, []);

  // Transform data into timeline items
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add experiences
    if (data.experiences) {
      data.experiences.forEach((exp: Experience, index: number) => {
        try {
          const startDate = parseISO(exp.startDate);
          if (!isValid(startDate)) return;
          
          const duration = showDuration ? calculateDuration(exp.startDate, exp.endDate) : undefined;
          const isCurrentPosition = !exp.endDate;
          
          items.push({
            id: `exp-${index}`,
            type: 'experience',
            date: startDate,
            title: exp.position,
            subtitle: exp.company,
            description: exp.description,
            location: exp.location,
            logo: exp.logo,
            achievements: exp.achievements,
            duration,
            isCurrentPosition,
            icon: <Briefcase className="w-5 h-5" />,
            color: 'bg-blue-500'
          });
        } catch (err) {
          console.warn('Error processing experience:', err);
        }
      });
    }

    // Add education
    if (data.education) {
      data.education.forEach((edu: Education, index: number) => {
        try {
          const gradDate = parseISO(edu.graduationDate);
          if (!isValid(gradDate)) return;
          
          items.push({
            id: `edu-${index}`,
            type: 'education',
            date: gradDate,
            title: edu.degree,
            subtitle: edu.institution,
            description: edu.description || `${edu.field}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}`,
            logo: edu.logo,
            icon: <GraduationCap className="w-5 h-5" />,
            color: 'bg-green-500'
          });
        } catch (err) {
          console.warn('Error processing education:', err);
        }
      });
    }

    // Add milestones
    if (data.milestones) {
      data.milestones.forEach((milestone: Milestone, index: number) => {
        try {
          const milestoneDate = parseISO(milestone.date);
          if (!isValid(milestoneDate)) return;
          
          const getIcon = (type: string) => {
            switch (type) {
              case 'achievement': return <Award className="w-5 h-5" />;
              case 'education': return <GraduationCap className="w-5 h-5" />;
              case 'career': return <Briefcase className="w-5 h-5" />;
              case 'certification': return <Award className="w-5 h-5" />;
              default: return <Award className="w-5 h-5" />;
            }
          };
          
          const getColor = (type: string) => {
            switch (type) {
              case 'achievement': return 'bg-yellow-500';
              case 'education': return 'bg-green-500';
              case 'career': return 'bg-blue-500';
              case 'certification': return 'bg-purple-500';
              default: return 'bg-gray-500';
            }
          };
          
          items.push({
            id: `milestone-${index}`,
            type: 'milestone',
            date: milestoneDate,
            title: milestone.title,
            subtitle: milestone.type.charAt(0).toUpperCase() + milestone.type.slice(1),
            description: milestone.description,
            icon: getIcon(milestone.type),
            color: getColor(milestone.type)
          });
        } catch (err) {
          console.warn('Error processing milestone:', err);
        }
      });
    }

    // Sort by date (newest first)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [data, calculateDuration, showDuration]);

  // Group items by year if enabled
  const groupedItems = useMemo(() => {
    if (!groupByYear) return { ungrouped: timelineItems };
    
    const groups: Record<string, TimelineItem[]> = {};
    
    timelineItems.forEach(item => {
      const year = format(item.date, 'yyyy');
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });
    
    return groups;
  }, [timelineItems, groupByYear]);

  const handleItemClick = useCallback((item: TimelineItem) => {
    setSelectedItem(item);
  }, []);

  const handleClosePopup = useCallback(() => {
    setSelectedItem(null);
  }, []);

  if (!isEnabled) {
    return null;
  }

  if (!data || (!data.experiences?.length && !data.education?.length && !data.milestones?.length)) {
    return (
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Career Timeline"
        description="Interactive timeline of your professional journey"
      >
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No timeline data available</p>
        </div>
      </FeatureWrapper>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Career Timeline"
        description="Interactive timeline with clickable milestones and achievements"
        error={error}
        onRetry={() => setError(null)}
      >
        <div className={`timeline-container ${layout === 'horizontal' ? 'timeline-horizontal' : 'timeline-vertical'}`}>
          {groupByYear ? (
            <div className="space-y-8">
              {Object.entries(groupedItems)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, items]) => (
                  <div key={year} className="year-group">
                    <div className="sticky top-4 z-10 mb-6">
                      <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                        <Calendar className="w-4 h-4" />
                        {year}
                      </div>
                    </div>
                    
                    <div className={layout === 'vertical' ? 'timeline-vertical-layout' : 'timeline-horizontal-layout'}>
                      {layout === 'vertical' ? (
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                          
                          <div className="space-y-6">
                            {items.map((item, index) => (
                              <div key={item.id} className="relative flex items-start gap-4">
                                {/* Timeline dot */}
                                <div className={`relative z-10 w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg`}>
                                  {item.icon}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <TimelineItemCard
                                    item={item}
                                    index={index}
                                    animateOnScroll={animateOnScroll}
                                    showLogos={showLogos}
                                    showDates={showDates}
                                    onClick={() => handleItemClick(item)}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-6 overflow-x-auto pb-4">
                          {items.map((item, index) => (
                            <div key={item.id} className="flex-shrink-0 w-80">
                              <TimelineItemCard
                                item={item}
                                index={index}
                                animateOnScroll={animateOnScroll}
                                showLogos={showLogos}
                                showDates={showDates}
                                onClick={() => handleItemClick(item)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className={layout === 'vertical' ? 'timeline-vertical-layout' : 'timeline-horizontal-layout'}>
              {layout === 'vertical' ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
                  
                  <div className="space-y-6">
                    {timelineItems.map((item, index) => (
                      <div key={item.id} className="relative flex items-start gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg`}>
                          {item.icon}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <TimelineItemCard
                            item={item}
                            isLeft={index % 2 === 0}
                            index={index}
                            animateOnScroll={animateOnScroll}
                            showLogos={showLogos}
                            showDates={showDates}
                            onClick={() => handleItemClick(item)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {timelineItems.map((item, index) => (
                    <div key={item.id} className="flex-shrink-0 w-80">
                      <TimelineItemCard
                        item={item}
                        index={index}
                        animateOnScroll={animateOnScroll}
                        showLogos={showLogos}
                        showDates={showDates}
                        onClick={() => handleItemClick(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.experiences?.length || 0}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Positions</div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.education?.length || 0}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Education</div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {data.milestones?.length || 0}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">Milestones</div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {timelineItems.length}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Total Items</div>
          </div>
        </div>

        {/* Error Display */}
        <FunctionalErrorBoundary 
          error={error} 
          onRetry={() => setError(null)}
          title="Timeline Error"
        />
      </FeatureWrapper>

      {/* Milestone Popup */}
      <MilestonePopup
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={handleClosePopup}
      />
    </ErrorBoundary>
  );
};