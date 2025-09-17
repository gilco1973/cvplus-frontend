import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Info, Play, Pause } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';

interface HelpOverlayProps {
  helpId: string;
  children: React.ReactNode;
  trigger?: 'auto' | 'manual' | 'hover';
  showOnMount?: boolean;
  className?: string;
}

interface OverlayPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const HelpOverlay: React.FC<HelpOverlayProps> = ({
  helpId,
  children,
  trigger = 'manual',
  showOnMount = false,
  className = ''
}) => {
  const { getContextualHelp, shouldShowHelp, actions, currentContext } = useHelp();
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const helpContent = getContextualHelp(currentContext || 'global').find(content => content.id === helpId);
  const showHelp = shouldShowHelp(helpId) && helpContent;

  const calculateOverlayPosition = (): OverlayPosition | null => {
    if (!containerRef.current) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    return {
      top: containerRect.top,
      left: containerRect.left,
      width: containerRect.width,
      height: containerRect.height
    };
  };

  const showOverlay = () => {
    if (!showHelp) return;
    
    setIsVisible(true);
    actions.showHelp(helpId);
    
    setTimeout(() => {
      const position = calculateOverlayPosition();
      setOverlayPosition(position);
    }, 0);
  };

  const hideOverlay = () => {
    setIsVisible(false);
    setIsPlaying(false);
    actions.hideHelp();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const dismissOverlay = () => {
    setIsVisible(false);
    setIsPlaying(false);
    actions.dismissHelp(helpId);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const playDemo = () => {
    if (!helpContent?.media) return;
    
    setIsPlaying(true);
    actions.trackAnalytics({
      helpId,
      event: 'clicked',
      context: currentContext
    });
    
    // Simulate a demo animation (you can extend this with actual video/demo logic)
    const demoElements = containerRef.current?.querySelectorAll('[data-demo-step]');
    if (demoElements) {
      let currentStep = 0;
      const totalSteps = demoElements.length;
      
      const animateStep = () => {
        // Remove previous highlights
        demoElements.forEach(el => el.classList.remove('demo-highlight'));
        
        if (currentStep < totalSteps) {
          // Highlight current step
          const currentElement = demoElements[currentStep];
          currentElement.classList.add('demo-highlight');
          currentStep++;
          animationRef.current = requestAnimationFrame(() => {
            setTimeout(animateStep, 1500); // 1.5s per step
          });
        } else {
          setIsPlaying(false);
          // Remove all highlights
          demoElements.forEach(el => el.classList.remove('demo-highlight'));
        }
      };
      
      animateStep();
    } else {
      setTimeout(() => setIsPlaying(false), 3000); // Fallback demo duration
    }
  };

  const pauseDemo = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    // Remove all demo highlights
    const demoElements = containerRef.current?.querySelectorAll('[data-demo-step]');
    if (demoElements) {
      demoElements.forEach(el => el.classList.remove('demo-highlight'));
    }
  };

  useEffect(() => {
    if (trigger === 'auto' && showHelp) {
      const timer = setTimeout(showOverlay, 500);
      return () => clearTimeout(timer);
    }
  }, [trigger, showHelp]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        const position = calculateOverlayPosition();
        setOverlayPosition(position);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVisible && e.key === 'Escape') {
        hideOverlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (!showHelp) {
    return <div className={className}>{children}</div>;
  }

  const handleContainerEvent = (event: React.SyntheticEvent) => {
    if (trigger === 'hover') {
      if (event.type === 'mouseenter') {
        showOverlay();
      } else if (event.type === 'mouseleave') {
        hideOverlay();
      }
    }
  };

  const containerProps = trigger === 'hover' ? {
    onMouseEnter: handleContainerEvent,
    onMouseLeave: handleContainerEvent
  } : {};

  const overlay = isVisible && overlayPosition && (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={hideOverlay}>
      {/* Overlay Content */}
      <div
        ref={overlayRef}
        className="absolute bg-white rounded-lg shadow-xl border-2 border-blue-400 z-50"
        style={{
          top: overlayPosition.top,
          left: overlayPosition.left,
          width: overlayPosition.width,
          height: overlayPosition.height,
          minHeight: '300px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Overlay Header */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
          {helpContent.media && (
            <button
              onClick={isPlaying ? pauseDemo : playDemo}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={dismissOverlay}
            className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors shadow-lg"
            aria-label="Close overlay"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Overlay Info Panel */}
        <div className="absolute bottom-4 left-4 right-16 bg-white bg-opacity-95 rounded-lg p-4 shadow-lg border border-gray-300">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">{helpContent.title}</h4>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{helpContent.content}</p>
              
              {/* Actions */}
              {helpContent.actions && helpContent.actions.length > 0 && (
                <div className="flex items-center space-x-2">
                  {helpContent.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        actions.trackAnalytics({
                          helpId,
                          event: 'clicked',
                          context: currentContext
                        });
                        if (action.action === 'dismiss') {
                          dismissOverlay();
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded transition-colors ${
                        action.variant === 'primary' 
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : action.variant === 'secondary'
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Demo Status */}
              {isPlaying && (
                <div className="mt-2 text-xs text-blue-600 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span>Demo playing...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Demo Highlight Styles */}
        <style>{`
          .demo-highlight {
            position: relative;
            z-index: 10;
          }
          .demo-highlight::before {
            content: '';
            position: absolute;
            inset: -4px;
            border: 2px solid #3b82f6;
            border-radius: 6px;
            background: rgba(59, 130, 246, 0.1);
            animation: demo-pulse 1.5s ease-in-out infinite;
            z-index: -1;
          }
          @keyframes demo-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.02); }
          }
        `}</style>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={containerRef}
        className={`relative ${className}`}
        {...containerProps}
      >
        {children}
        
        {/* Manual trigger button */}
        {trigger === 'manual' && (
          <button
            onClick={showOverlay}
            className="absolute top-2 right-2 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm opacity-75 hover:opacity-100"
            aria-label="Show help overlay"
          >
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>
      {typeof document !== 'undefined' && createPortal(overlay, document.body)}
    </>
  );
};