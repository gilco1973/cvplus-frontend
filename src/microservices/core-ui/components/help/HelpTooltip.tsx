import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import type { HelpPosition, HelpTrigger } from '../../types/help';

interface HelpTooltipProps {
  helpId: string;
  children: React.ReactNode;
  trigger?: HelpTrigger;
  position?: HelpPosition;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
  disabled?: boolean;
}

interface TooltipPosition {
  top: number;
  left: number;
  arrow: {
    position: HelpPosition;
    offset: number;
  };
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  helpId,
  children,
  trigger = 'hover',
  position = 'top',
  className = '',
  showIcon = false,
  iconClassName = '',
  disabled = false
}) => {
  const { getContextualHelp, shouldShowHelp, actions } = useHelp();
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const helpContent = getContextualHelp('global').find(content => content.id === helpId);
  const showHelp = shouldShowHelp(helpId) && !disabled && helpContent;

  const calculatePosition = (): TooltipPosition | null => {
    if (!triggerRef.current || !tooltipRef.current) return null;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = 0;
    let left = 0;
    let arrowPosition: HelpPosition = position;
    let arrowOffset = 0;

    const spacing = 8; // Space between trigger and tooltip

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        arrowPosition = 'bottom';
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        arrowPosition = 'top';
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - spacing;
        arrowPosition = 'right';
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + spacing;
        arrowPosition = 'left';
        break;
      default:
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        arrowPosition = 'bottom';
    }

    // Boundary adjustments
    if (left < spacing) {
      const adjustment = spacing - left;
      left = spacing;
      arrowOffset = -adjustment;
    } else if (left + tooltipRect.width > viewportWidth - spacing) {
      const adjustment = (left + tooltipRect.width) - (viewportWidth - spacing);
      left = viewportWidth - tooltipRect.width - spacing;
      arrowOffset = adjustment;
    }

    if (top < spacing) {
      // Flip to bottom if there's no space on top
      if (position === 'top') {
        top = triggerRect.bottom + spacing;
        arrowPosition = 'top';
      } else {
        top = spacing;
      }
    } else if (top + tooltipRect.height > viewportHeight - spacing) {
      // Flip to top if there's no space on bottom
      if (position === 'bottom') {
        top = triggerRect.top - tooltipRect.height - spacing;
        arrowPosition = 'bottom';
      } else {
        top = viewportHeight - tooltipRect.height - spacing;
      }
    }

    return {
      top,
      left,
      arrow: {
        position: arrowPosition,
        offset: arrowOffset
      }
    };
  };

  const showTooltip = () => {
    if (!showHelp) return;
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
    actions.showHelp(helpId);
    
    // Calculate position after render
    setTimeout(() => {
      const pos = calculatePosition();
      setTooltipPosition(pos);
    }, 0);
  };

  const hideTooltip = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        actions.hideHelp();
      }, 300); // Delay to allow moving to tooltip
    } else {
      setIsVisible(false);
      actions.hideHelp();
    }
  };

  const dismissTooltip = () => {
    setIsVisible(false);
    actions.dismissHelp(helpId);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTriggerEvent = (event: React.SyntheticEvent) => {
    switch (trigger) {
      case 'hover':
        if (event.type === 'mouseenter') {
          showTooltip();
        } else if (event.type === 'mouseleave') {
          hideTooltip();
        }
        break;
      case 'click':
        if (event.type === 'click') {
          event.preventDefault();
          if (isVisible) {
            hideTooltip();
          } else {
            showTooltip();
          }
        }
        break;
      case 'focus':
        if (event.type === 'focus') {
          showTooltip();
        } else if (event.type === 'blur') {
          hideTooltip();
        }
        break;
    }
  };

  const getArrowClasses = (arrowPos: HelpPosition) => {
    const base = 'absolute w-3 h-3 bg-gray-800 transform rotate-45 border border-gray-600';
    switch (arrowPos) {
      case 'top':
        return `${base} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0`;
      case 'bottom':
        return `${base} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0`;
      case 'left':
        return `${base} -left-1.5 top-1/2 -translate-y-1/2 border-t-0 border-r-0`;
      case 'right':
        return `${base} -right-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0`;
      default:
        return base;
    }
  };

  if (!showHelp) {
    return <>{children}</>;
  }

  const triggerProps: React.HTMLAttributes<HTMLDivElement> = {};

  if (trigger === 'hover') {
    triggerProps.onMouseEnter = handleTriggerEvent;
    triggerProps.onMouseLeave = handleTriggerEvent;
  } else if (trigger === 'click') {
    triggerProps.onClick = handleTriggerEvent;
  } else if (trigger === 'focus') {
    triggerProps.onFocus = handleTriggerEvent;
    triggerProps.onBlur = handleTriggerEvent;
    triggerProps.tabIndex = 0;
  }

  const tooltip = isVisible && helpContent && tooltipPosition && (
    <div
      ref={tooltipRef}
      className="fixed z-50 max-w-sm bg-gray-800 text-white rounded-lg shadow-xl border border-gray-600 p-4"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        transform: tooltipPosition.arrow.offset !== 0 ? `translateX(${tooltipPosition.arrow.offset}px)` : undefined
      }}
      onMouseEnter={() => timeoutRef.current && clearTimeout(timeoutRef.current)}
      onMouseLeave={() => trigger === 'hover' && hideTooltip()}
      role="tooltip"
      aria-describedby={`help-${helpId}`}
    >
      {/* Arrow */}
      <div
        className={getArrowClasses(tooltipPosition.arrow.position)}
        style={{
          left: tooltipPosition.arrow.position === 'top' || tooltipPosition.arrow.position === 'bottom' 
            ? `calc(50% - ${tooltipPosition.arrow.offset}px)` 
            : undefined
        }}
      />
      
      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-blue-300">{helpContent.title}</h4>
          <button
            onClick={dismissTooltip}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss help"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed" id={`help-${helpId}`}>
          {helpContent.content}
        </p>
        
        {/* Actions */}
        {helpContent.actions && helpContent.actions.length > 0 && (
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-700">
            {helpContent.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  actions.trackAnalytics({
                    helpId,
                    event: 'clicked',
                    context: helpContent.context
                  });
                  // Handle action based on action.action
                  if (action.action === 'dismiss') {
                    dismissTooltip();
                  }
                }}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  action.variant === 'primary' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : action.variant === 'secondary'
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        {...triggerProps}
      >
        {children}
        {showIcon && (
          <HelpCircle className={`w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors ml-1 ${iconClassName}`} />
        )}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltip, document.body)}
    </>
  );
};
