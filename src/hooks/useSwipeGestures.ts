import { useEffect, useRef, useState, useCallback } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
  disabled?: boolean;
}

interface TouchPosition {
  x: number;
  y: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmove = false,
    disabled = false
  } = options;

  const touchStartPos = useRef<TouchPosition | null>(null);
  const [isGesturing, setIsGesturing] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    
    const touch = e.touches[0];
    if (touch) {
      touchStartPos.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      setIsGesturing(true);
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !touchStartPos.current) return;
    
    if (preventDefaultTouchmove) {
      e.preventDefault();
    }
  }, [disabled, preventDefaultTouchmove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled || !touchStartPos.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartPos.current.x;
    const deltaY = touch.clientY - touchStartPos.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if this is a valid swipe gesture
    const isHorizontalSwipe = absDeltaX > threshold && absDeltaX > absDeltaY;
    const isVerticalSwipe = absDeltaY > threshold && absDeltaY > absDeltaX;

    if (isHorizontalSwipe) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (isVerticalSwipe) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    touchStartPos.current = null;
    setIsGesturing(false);
  }, [disabled, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  return { handlers, isGesturing };
};

// Hook for step-based navigation with swipe gestures
interface UseStepNavigationOptions {
  currentStep: string;
  jobId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  disabled?: boolean;
}

export const useStepNavigation = (options: UseStepNavigationOptions) => {
  const {
    currentStep,
    jobId,
    onNext,
    onPrevious,
    canGoNext = true,
    canGoPrevious = true,
    disabled = false
  } = options;

  const handleSwipeLeft = useCallback(() => {
    if (canGoNext && onNext) {
      onNext();
    }
  }, [canGoNext, onNext]);

  const handleSwipeRight = useCallback(() => {
    if (canGoPrevious && onPrevious) {
      onPrevious();
    }
  }, [canGoPrevious, onPrevious]);

  const { handlers, isGesturing } = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 80, // Slightly higher threshold for step navigation
    disabled,
  });

  return { handlers, isGesturing };
};

// Hook for pull-to-refresh functionality
interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  refreshDistance?: number;
}

export const usePullToRefresh = (options: UsePullToRefreshOptions) => {
  const {
    onRefresh,
    threshold = 80,
    disabled = false,
    refreshDistance = 120
  } = options;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    // Only trigger if we're at the top of the page
    if (window.scrollY > 0) return;
    
    const touch = e.touches[0];
    if (touch) {
      touchStartY.current = touch.clientY;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || touchStartY.current === 0) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    const deltaY = touch.clientY - touchStartY.current;
    
    if (deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(deltaY * 0.5, refreshDistance));
    }
  }, [disabled, isRefreshing, refreshDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    touchStartY.current = 0;
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const pullToRefreshHandlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };

  const shouldShowRefreshIndicator = pullDistance > 0 || isRefreshing;
  const refreshProgress = Math.min(pullDistance / threshold, 1);

  return {
    handlers: pullToRefreshHandlers,
    isRefreshing,
    pullDistance,
    shouldShowRefreshIndicator,
    refreshProgress,
    containerRef
  };
};