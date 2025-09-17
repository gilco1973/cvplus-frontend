import React, { ReactNode } from 'react';
import { useStepNavigation, usePullToRefresh } from '../hooks/useSwipeGestures';
import { MobileBottomNav } from './MobileBottomNav';
import { RefreshCw } from 'lucide-react';

interface MobilePageWrapperProps {
  children: ReactNode;
  currentStep?: string;
  jobId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onRefresh?: () => Promise<void> | void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  showBottomNav?: boolean;
  showNavigation?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'dark';
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  enableGestures?: boolean;
  enablePullToRefresh?: boolean;
}

export const MobilePageWrapper: React.FC<MobilePageWrapperProps> = ({
  children,
  currentStep,
  jobId,
  onNext,
  onPrevious,
  onSave,
  onShare,
  onRefresh,
  canGoNext = true,
  canGoPrevious = true,
  showBottomNav = true,
  showNavigation = true,
  showActions = true,
  variant = 'default',
  disabled = false,
  isLoading = false,
  className = '',
  enableGestures = true,
  enablePullToRefresh = false
}) => {
  // Step navigation gestures
  const { handlers: stepHandlers, isGesturing } = useStepNavigation({
    currentStep: currentStep || '',
    jobId,
    onNext,
    onPrevious,
    canGoNext,
    canGoPrevious,
    disabled: !enableGestures || disabled || isLoading
  });

  // Pull to refresh
  const {
    handlers: refreshHandlers,
    isRefreshing,
    pullDistance,
    shouldShowRefreshIndicator,
    refreshProgress,
    containerRef
  } = usePullToRefresh({
    onRefresh: onRefresh || (() => {}),
    disabled: !enablePullToRefresh || !onRefresh || disabled || isLoading
  });

  // Combine gesture handlers
  const combinedHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      if (enableGestures) stepHandlers.onTouchStart(e.nativeEvent);
      if (enablePullToRefresh) refreshHandlers.onTouchStart(e.nativeEvent);
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (enableGestures) stepHandlers.onTouchMove(e.nativeEvent);
      if (enablePullToRefresh) refreshHandlers.onTouchMove(e.nativeEvent);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (enableGestures) stepHandlers.onTouchEnd(e.nativeEvent);
      if (enablePullToRefresh) refreshHandlers.onTouchEnd();
    }
  };

  const getRefreshIndicatorClasses = () => {
    return variant === 'dark' 
      ? 'bg-gray-800/95 text-white border-gray-700' 
      : 'bg-white/95 text-gray-900 border-gray-200';
  };

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen relative ${className}`}
      {...combinedHandlers}
    >
      {/* Pull to Refresh Indicator */}
      {shouldShowRefreshIndicator && enablePullToRefresh && (
        <div 
          className={`
            fixed top-0 left-0 right-0 z-30 transition-transform duration-200
            ${getRefreshIndicatorClasses()} border-b backdrop-blur-md
          `}
          style={{
            transform: `translateY(${Math.max(-60, -60 + pullDistance)}px)`
          }}
        >
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center space-x-2">
              <RefreshCw 
                className={`w-5 h-5 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                style={{
                  transform: `rotate(${refreshProgress * 360}deg)`
                }}
              />
              <span className="text-sm font-medium">
                {isRefreshing 
                  ? 'Refreshing...' 
                  : pullDistance >= 80 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Gesture feedback overlay */}
      {isGesturing && enableGestures && (
        <div className="fixed inset-0 z-20 pointer-events-none">
          <div className="absolute inset-0 bg-black/5" />
        </div>
      )}

      {/* Page content */}
      <div 
        className={`
          transition-transform duration-200
          ${shouldShowRefreshIndicator ? 'pt-16' : ''}
          ${showBottomNav ? 'pb-20 md:pb-0' : ''}
        `}
        style={{
          transform: shouldShowRefreshIndicator 
            ? `translateY(${Math.min(pullDistance, 60)}px)` 
            : 'none'
        }}
      >
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && (
        <MobileBottomNav
          currentStep={currentStep}
          jobId={jobId}
          onNext={onNext}
          onPrevious={onPrevious}
          onSave={onSave}
          onShare={onShare}
          showNavigation={showNavigation}
          showActions={showActions}
          variant={variant}
          disabled={disabled || isRefreshing}
          isLoading={isLoading || isRefreshing}
        />
      )}
    </div>
  );
};

// Simplified wrapper for pages that don't need bottom nav
export const MobileGestureWrapper: React.FC<{
  children: ReactNode;
  currentStep?: string;
  jobId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onRefresh?: () => Promise<void> | void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  enableGestures?: boolean;
  enablePullToRefresh?: boolean;
}> = (props) => (
  <MobilePageWrapper
    {...props}
    showBottomNav={false}
  />
);