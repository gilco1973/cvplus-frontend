/**
 * Testimonials Carousel Component
 * Main carousel component for testimonials display
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TestimonialsCarouselProps, Testimonial } from './types';
import { sortTestimonials, calculateAverageRating, getVerifiedCount } from './utils';
import { useFeatureData } from '../../hooks/useFeatureData';
import { FeatureWrapper } from '../../core/FeatureWrapper';
import { ErrorBoundary } from '../../core/ErrorBoundary';
import { TestimonialCard } from './TestimonialCard';
import { CarouselControls } from './CarouselControls';

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
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
  const [filterRelationship, setFilterRelationship] = useState<string>('all');
  
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const {
    data: testimonialsData,
    loading,
    error,
    refresh
  } = useFeatureData<{ testimonials: Testimonial[] }>({
    jobId,
    featureName: 'testimonials',
    initialData: data,
    params: { profileId }
  });

  useEffect(() => {
    if (testimonialsData?.testimonials) {
      const sorted = sortTestimonials(testimonialsData.testimonials);
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

  const handleFilterChange = (relationship: string) => {
    setFilterRelationship(relationship);
    setCurrentIndex(0);
  };

  const handleAutoPlayToggle = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!isEnabled) {
    return null;
  }

  if (!testimonials.length && !loading) {
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
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Professional Testimonials"
        description="Recommendations from colleagues, managers, and clients"
        isLoading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="space-y-6">
          {/* Controls */}
          <CarouselControls
            filterRelationship={filterRelationship}
            isAutoPlaying={isAutoPlaying}
            testimonialsCount={filteredTestimonials.length}
            onFilterChange={handleFilterChange}
            onAutoPlayToggle={handleAutoPlayToggle}
          />

          {/* Carousel Container */}
          <div ref={carouselRef} className="relative overflow-hidden">
            {currentTestimonial && (
              <div key={currentTestimonial.id} className="animate-fade-in">
                <TestimonialCard
                  testimonial={currentTestimonial}
                  layout={layout}
                  showRatings={showRatings}
                  mode={mode}
                />
              </div>
            )}

            {/* Navigation Arrows */}
            {showNavigation && filteredTestimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
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
                  {calculateAverageRating(testimonials).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getVerifiedCount(testimonials)}
                </div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
            </div>
          )}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};