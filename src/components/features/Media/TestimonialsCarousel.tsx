import React, { useState, useEffect, useRef } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface Testimonial {
  id: string;
  name: string;
  title: string;
  company: string;
  content: string;
  rating: number;
  relationship: 'colleague' | 'manager' | 'client' | 'team-member' | 'mentor' | 'other';
  date: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  isVerified: boolean;
  tags: string[];
  featured: boolean;
}

interface TestimonialsCarouselProps extends CVFeatureProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  showRatings?: boolean;
  itemsPerView?: number;
  layout?: 'cards' | 'quotes' | 'minimal';
}

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  autoPlay = true,
  autoPlayInterval = 5000,
  showNavigation = true,
  showDots = true,
  showRatings = true,
  itemsPerView = 1,
  layout = 'cards'
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const {
    data: testimonialsData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getTestimonials',
    { jobId, profileId },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (testimonialsData) {
      // Sort testimonials: featured first, then by date
      const sorted = testimonialsData.testimonials.sort((a: Testimonial, b: Testimonial) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      setTestimonials(sorted);
      onUpdate?.(testimonialsData);
    }
  }, [testimonialsData, onUpdate]);

  const filteredTestimonials = testimonials.filter(testimonial => 
    filterRelationship === 'all' || testimonial.relationship === filterRelationship
  );

  useEffect(() => {
    if (isAutoPlaying && filteredTestimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, filteredTestimonials.length, autoPlayInterval]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? filteredTestimonials.length - 1 : prev - 1
    );
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      handlePrevious();
    } else if (info.offset.x < -threshold) {
      handleNext();
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'manager': return '👨‍💼';
      case 'colleague': return '🤝';
      case 'client': return '🎯';
      case 'team-member': return '👥';
      case 'mentor': return '🧭';
      default: return '💼';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-purple-100 text-purple-800';
      case 'team-member': return 'bg-orange-100 text-orange-800';
      case 'mentor': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Testimonials">
        <LoadingSpinner message="Loading testimonials..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Testimonials">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Failed to Load Testimonials</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  if (!testimonials.length) {
    return (
      <FeatureWrapper className={className} title="Testimonials">
        <div className="text-gray-500 text-center p-8">
          <p>No testimonials available</p>
        </div>
      </FeatureWrapper>
    );
  }

  const currentTestimonial = filteredTestimonials[currentIndex];

  return (
    <FeatureWrapper className={className} title="Professional Testimonials">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={filterRelationship}
              onChange={(e) => {
                setFilterRelationship(e.target.value);
                setCurrentIndex(0);
              }}
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
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
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
            {filteredTestimonials.length} testimonial{filteredTestimonials.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          ref={carouselRef}
          className="relative overflow-hidden"
        >
          <div>
            {currentTestimonial && (
              <div className="animate-fade-in"
                key={currentTestimonial.id}
                custom={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="cursor-grab active:cursor-grabbing"
              >
                {layout === 'cards' && (
                  <div className="bg-white p-8 rounded-lg border shadow-sm">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-6">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {currentTestimonial.avatarUrl ? (
                          <img
                            src={currentTestimonial.avatarUrl}
                            alt={currentTestimonial.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xl font-medium text-gray-600">
                              {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Profile Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">
                              {currentTestimonial.name}
                            </h4>
                            <p className="text-gray-600">
                              {currentTestimonial.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {currentTestimonial.company}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {currentTestimonial.isVerified && (
                              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}

                            {currentTestimonial.featured && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Relationship & Rating */}
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRelationshipColor(currentTestimonial.relationship)}`}>
                            {getRelationshipIcon(currentTestimonial.relationship)} {currentTestimonial.relationship}
                          </span>

                          {showRatings && (
                            <div className="flex items-center gap-1">
                              {renderStars(currentTestimonial.rating)}
                            </div>
                          )}

                          <span className="text-xs text-gray-500">
                            {new Date(currentTestimonial.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial Content */}
                    <blockquote className="text-lg text-gray-700 leading-relaxed mb-6">
                      "{currentTestimonial.content}"
                    </blockquote>

                    {/* Tags */}
                    {currentTestimonial.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentTestimonial.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* LinkedIn Link */}
                    {currentTestimonial.linkedinUrl && mode === 'private' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <a
                          href={currentTestimonial.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          View LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {layout === 'quotes' && (
                  <div className="text-center py-8">
                    <div className="max-w-4xl mx-auto">
                      <div className="text-6xl text-blue-200 mb-4">"</div>
                      <blockquote className="text-2xl font-light text-gray-700 leading-relaxed mb-8">
                        {currentTestimonial.content}
                      </blockquote>
                      <div className="flex items-center justify-center gap-4">
                        {currentTestimonial.avatarUrl && (
                          <img
                            src={currentTestimonial.avatarUrl}
                            alt={currentTestimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {currentTestimonial.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {currentTestimonial.title}, {currentTestimonial.company}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {layout === 'minimal' && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-16 bg-blue-500 rounded-full flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 mb-4 italic">
                          "{currentTestimonial.content}"
                        </p>
                        <div className="text-sm text-gray-600">
                          <strong>{currentTestimonial.name}</strong>, {currentTestimonial.title}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {showNavigation && filteredTestimonials.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Dots Navigation */}
        {showDots && filteredTestimonials.length > 1 && (
          <div className="flex justify-center gap-2">
            {filteredTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {testimonials.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testimonials.filter(t => t.isVerified).length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
        )}
      </div>
    </FeatureWrapper>
  );
};

export default TestimonialsCarousel;