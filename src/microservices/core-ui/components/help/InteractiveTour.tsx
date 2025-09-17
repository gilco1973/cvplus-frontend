import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, SkipForward } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import type { HelpTour, TourStep } from '../../types/help';

interface InteractiveTourProps {
  tourId: string;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

interface StepPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
  maxWidth: number;
}

export const InteractiveTour: React.FC<InteractiveTourProps> = React.memo(({
  tourId,
  onComplete,
  onSkip,
  autoStart = false
}) => {
  const { getAvailableTours, actions, currentContext, userPreferences, activeTour } = useHelp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepPosition, setStepPosition] = useState<StepPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tour = useMemo(() => getAvailableTours(currentContext).find(t => t.id === tourId), [getAvailableTours, currentContext, tourId]);
  const currentStep = tour?.steps[currentStepIndex];
  const isActive = activeTour === tourId;

  const calculatePositions = useCallback((step: TourStep): { step: StepPosition | null; tooltip: TooltipPosition | null } => {
    const target = document.querySelector(step.target);
    if (!target) return { step: null, tooltip: null };

    const targetRect = target.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    const stepPos: StepPosition = {
      top: targetRect.top - padding,
      left: targetRect.left - padding,
      width: targetRect.width + padding * 2,
      height: targetRect.height + padding * 2
    };

    // Calculate tooltip position
    let tooltipTop = targetRect.bottom + 16;
    let tooltipLeft = targetRect.left;
    let maxWidth = 400;

    // Position based on step.position preference
    switch (step.position) {
      case 'top':
        tooltipTop = targetRect.top - 16;
        break;
      case 'bottom':
        tooltipTop = targetRect.bottom + 16;
        break;
      case 'left':
        tooltipTop = targetRect.top;
        tooltipLeft = targetRect.left - maxWidth - 16;
        break;
      case 'right':
        tooltipTop = targetRect.top;
        tooltipLeft = targetRect.right + 16;
        break;
      default:
        // Smart positioning - choose best position based on available space
        if (targetRect.bottom + 200 > viewportHeight && targetRect.top > 200) {
          tooltipTop = targetRect.top - 16; // Position above
        }
    }

    // Adjust for viewport boundaries
    if (tooltipLeft < 16) {
      tooltipLeft = 16;
    } else if (tooltipLeft + maxWidth > viewportWidth - 16) {
      tooltipLeft = viewportWidth - maxWidth - 16;
      if (tooltipLeft < 16) {
        tooltipLeft = 16;
        maxWidth = viewportWidth - 32;
      }
    }

    if (tooltipTop < 16) {
      tooltipTop = 16;
    } else if (tooltipTop > viewportHeight - 100) {
      tooltipTop = viewportHeight - 100;
    }

    const tooltipPos: TooltipPosition = {
      top: tooltipTop,
      left: tooltipLeft,
      maxWidth
    };

    return { step: stepPos, tooltip: tooltipPos };
  }, []);

  const updatePositions = useCallback(() => {
    if (!currentStep) return;

    const positions = calculatePositions(currentStep);
    setStepPosition(positions.step);
    setTooltipPosition(positions.tooltip);
  }, [currentStep, calculatePositions]);

  const startTour = useCallback(() => {
    if (!tour || !userPreferences.showOnboarding) return;
    
    setCurrentStepIndex(0);
    actions.startTour(tourId);
    
    // Scroll to first target
    setTimeout(() => {
      if (tour.steps[0]) {
        const target = document.querySelector(tour.steps[0].target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(updatePositions, 500);
        }
      }
    }, 100);
  }, [tour, userPreferences.showOnboarding, tourId, actions, updatePositions]);

  const nextStep = useCallback(() => {
    if (!tour) return;
    
    if (currentStepIndex < tour.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      
      const nextStepData = tour.steps[nextIndex];
      if (nextStepData) {
        const target = document.querySelector(nextStepData.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(updatePositions, 500);
        }
      }
    } else {
      // Complete the tour
      actions.completeTour(tourId);
      onComplete?.();
    }
  }, [tour, currentStepIndex, updatePositions, actions, tourId, onComplete]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      
      const prevStep = tour?.steps[prevIndex];
      if (prevStep) {
        const target = document.querySelector(prevStep.target);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(updatePositions, 500);
        }
      }
    }
  }, [currentStepIndex, tour, updatePositions]);

  const skipTour = useCallback(() => {
    actions.skipTour(tourId);
    onSkip?.();
  }, [actions, tourId, onSkip]);

  const completeTour = useCallback(() => {
    actions.completeTour(tourId);
    onComplete?.();
  }, [actions, tourId, onComplete]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Only close if clicked on overlay, not on spotlight or tooltip
    if (e.target === e.currentTarget) {
      skipTour();
    }
  }, [skipTour]);

  useEffect(() => {
    if (autoStart && tour && !userPreferences.completedTours.includes(tourId) && !isActive) {
      const timer = setTimeout(startTour, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, tour, tourId, userPreferences.completedTours, isActive, startTour]);

  useEffect(() => {
    const handleResize = () => {
      if (isActive) {
        updatePositions();
      }
    };

    const handleScroll = () => {
      if (isActive) {
        updatePositions();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, updatePositions]);

  useEffect(() => {
    updatePositions();
  }, [currentStepIndex, updatePositions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'Escape':
          skipTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousStep();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, skipTour, nextStep, previousStep]);

  // Debug logging (should be removed after fixing)
  if (!tour || !isActive || !currentStep) {
    return null;
  }

  const overlay = (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-75"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      style={{ 
        zIndex: 999999,
        pointerEvents: 'auto',
        cursor: 'default'
      }}
    >
      {/* Spotlight */}
      {stepPosition && currentStep.spotlight && (
        <div
          className="absolute border-2 border-blue-400 rounded shadow-lg bg-transparent animate-pulse"
          style={{
            top: stepPosition.top,
            left: stepPosition.left,
            width: stepPosition.width,
            height: stepPosition.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            zIndex: 999998,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Tour Tooltip */}
      {tooltipPosition && (
        <div
          ref={tooltipRef}
          className="absolute bg-white rounded-lg shadow-xl border border-gray-300"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: tooltipPosition.maxWidth,
            zIndex: 999997,
            pointerEvents: 'auto',
            cursor: 'default'
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 id="tour-title" className="text-lg font-semibold text-gray-900">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-gray-500">
                  Step {currentStepIndex + 1} of {tour.steps.length}
                </p>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Skip tour"
                style={{ pointerEvents: 'auto' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 mb-6 leading-relaxed">{currentStep.content}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / tour.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={previousStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Previous step"
                  style={{ pointerEvents: 'auto' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{currentStep.prevLabel || 'Previous'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {currentStep.allowSkip !== false && (
                  <button
                    onClick={skipTour}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>Skip Tour</span>
                  </button>
                )}
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <span>
                    {currentStepIndex === tour.steps.length - 1 
                      ? 'Complete' 
                      : currentStep.nextLabel || 'Next'
                    }
                  </span>
                  {currentStepIndex < tour.steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : null;
});