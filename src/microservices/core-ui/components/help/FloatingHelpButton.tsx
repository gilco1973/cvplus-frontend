import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageCircle, BookOpen, X } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import { HelpSearchPanel } from './HelpSearchPanel';
import { InteractiveTour } from './InteractiveTour';

interface FloatingHelpButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showQuickActions?: boolean;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({
  className = '',
  size = 'medium',
  position = 'bottom-right',
  showQuickActions = true
}) => {
  const { actions, currentContext, userPreferences, getContextualHelp, getAvailableTours } = useHelp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showNewUserTour, setShowNewUserTour] = useState(false);
  const [hasNewHelp, setHasNewHelp] = useState(false);

  const contextualHelp = getContextualHelp(currentContext);
  const availableTours = getAvailableTours(currentContext);

  // Check for new help content
  useEffect(() => {
    const newHelpExists = contextualHelp.some(help => 
      help.isNew && !userPreferences.dismissedHelp.includes(help.id)
    );
    setHasNewHelp(newHelpExists);
  }, [contextualHelp, userPreferences.dismissedHelp]);

  // Auto-show help for new users
  useEffect(() => {
    if (userPreferences.showOnboarding && availableTours.length > 0 && currentContext === 'home') {
      const timer = setTimeout(() => {
        setShowNewUserTour(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userPreferences.showOnboarding, availableTours, currentContext]);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-10 h-10';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'w-5 h-5';
      case 'large':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const handleMainButtonClick = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
      actions.trackAnalytics({
        helpId: 'floating-help-button',
        event: 'clicked',
        context: currentContext
      });
    }
  };

  const handleSearchClick = () => {
    setShowSearchPanel(true);
    setIsOpen(false);
  };

  const handleTourClick = () => {
    if (availableTours.length > 0) {
      actions.startTour(availableTours[0].id);
      setIsOpen(false);
    }
  };

  const handleContextualHelpClick = () => {
    if (contextualHelp.length > 0) {
      actions.showHelp(contextualHelp[0].id);
      setIsOpen(false);
    }
  };

  if (!userPreferences.showTooltips) {
    return null;
  }

  return (
    <>
      <div className={`fixed z-40 ${getPositionClasses()} ${className}`}>
        {/* Quick Actions Menu */}
        {isOpen && showQuickActions && (
          <div className={`absolute ${position.includes('bottom') ? 'bottom-16' : 'top-16'} ${position.includes('right') ? 'right-0' : 'left-0'} mb-2`}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1 animate-scale-in">
              {/* Search Help */}
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
              >
                <BookOpen className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Search Help</div>
                  <div className="text-xs text-gray-500">Find answers quickly</div>
                </div>
              </button>

              {/* Contextual Help */}
              {contextualHelp.length > 0 && (
                <button
                  onClick={handleContextualHelpClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 text-gray-500 group-hover:text-green-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Page Help</div>
                    <div className="text-xs text-gray-500">
                      {contextualHelp.length} tip{contextualHelp.length !== 1 ? 's' : ''} available
                    </div>
                  </div>
                  {hasNewHelp && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              )}

              {/* Tours */}
              {availableTours.length > 0 && (
                <button
                  onClick={handleTourClick}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-purple-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Take Tour</div>
                    <div className="text-xs text-gray-500">
                      {availableTours[0].name}
                    </div>
                  </div>
                </button>
              )}

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* Settings */}
              <button
                onClick={() => {
                  actions.updatePreferences({ showTooltips: false });
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors group"
              >
                <X className="w-4 h-4 text-gray-500 group-hover:text-red-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Hide Help</div>
                  <div className="text-xs text-gray-500">Turn off help system</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Help Button */}
        <button
          onClick={handleMainButtonClick}
          className={`${getSizeClasses()} bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center relative group`}
          aria-label="Help and support"
          title="Get help"
        >
          <HelpCircle className={getIconSize()} />
          
          {/* New Help Indicator */}
          {hasNewHelp && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          )}

          {/* Pulse animation for new users */}
          {userPreferences.showOnboarding && availableTours.length > 0 && (
            <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-75"></div>
          )}
        </button>

        {/* Tooltip for first-time users */}
        {userPreferences.showOnboarding && !isOpen && (
          <div className={`absolute ${position.includes('bottom') ? 'bottom-16' : 'top-16'} ${position.includes('right') ? 'right-0' : 'left-0'} mb-2 w-48`}>
            <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-bounce-gentle">
              <div className="text-center">
                <div className="font-medium mb-1">Need help?</div>
                <div className="text-xs text-gray-300">
                  Click for tutorials and tips
                </div>
              </div>
              {/* Arrow */}
              <div className={`absolute ${position.includes('bottom') ? '-bottom-1' : '-top-1'} ${position.includes('right') ? 'right-6' : 'left-6'} w-2 h-2 bg-gray-900 transform rotate-45`}></div>
            </div>
          </div>
        )}

        {/* Click outside overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Help Search Panel */}
      <HelpSearchPanel
        isOpen={showSearchPanel}
        onClose={() => setShowSearchPanel(false)}
      />

      {/* New User Tour */}
      {showNewUserTour && availableTours.length > 0 && (
        <InteractiveTour
          tourId={availableTours[0].id}
          autoStart={true}
          onComplete={() => setShowNewUserTour(false)}
          onSkip={() => setShowNewUserTour(false)}
        />
      )}

      {/* Custom styles */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -8px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -1px, 0);
          }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};