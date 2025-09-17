import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  ArrowRight,
  Save,
  Share2
} from 'lucide-react';

interface MobileBottomNavProps {
  currentStep?: string;
  jobId?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  showNavigation?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'dark';
  disabled?: boolean;
  isLoading?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentStep,
  onPrevious,
  onNext,
  onSave,
  onShare,
  showNavigation = true,
  showActions = true,
  variant = 'default',
  disabled = false,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getStepIndex = (step: string): number => {
    const stepMap: Record<string, number> = {
      'upload': 0,
      'processing': 1,
      'analysis': 2,
      'preview': 3,
      'templates': 3,
      'keywords': 3,
      'results': 4
    };
    return stepMap[step] || 0;
  };

  const canGoNext = () => {
    if (!currentStep) return false;
    const currentIndex = getStepIndex(currentStep);
    return currentIndex < 4 && !isLoading && !disabled;
  };

  const canGoPrevious = () => {
    if (!currentStep) return false;
    const currentIndex = getStepIndex(currentStep);
    return currentIndex > 0 && !isLoading && !disabled;
  };

  const getBackgroundClasses = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gray-800/95 border-gray-700';
      default:
        return 'bg-white/95 border-gray-200';
    }
  };


  const getActiveClasses = () => {
    switch (variant) {
      case 'dark':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const getButtonClasses = (active = false, danger = false) => {
    if (active) return getActiveClasses();
    if (danger) {
      return variant === 'dark' 
        ? 'text-red-400 hover:bg-red-900/20' 
        : 'text-red-600 hover:bg-red-50';
    }
    return variant === 'dark'
      ? 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'
      : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200';
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40 md:hidden
      ${getBackgroundClasses()} backdrop-blur-md border-t
      safe-area-pb
    `}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Navigation Actions */}
        {showNavigation && (
          <div className="flex items-center space-x-4">
            {/* Previous Button */}
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious()}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                min-h-[44px] min-w-[44px] justify-center
                ${!canGoPrevious() 
                  ? 'opacity-40 cursor-not-allowed' 
                  : getButtonClasses()
                }
              `}
              aria-label="Go to previous step"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden xs:block">Back</span>
            </button>

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className={`
                p-2 rounded-lg transition-colors
                min-h-[44px] min-w-[44px] flex items-center justify-center
                ${location.pathname === '/' ? getButtonClasses(true) : getButtonClasses()}
              `}
              aria-label="Go to home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Center Quick Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            {/* Save Button */}
            {onSave && (
              <button
                onClick={onSave}
                disabled={isLoading || disabled}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg transition-all
                  min-h-[44px] text-sm font-medium
                  ${isLoading || disabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : variant === 'dark'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }
                `}
                aria-label="Save progress"
              >
                <Save className="w-4 h-4" />
                <span className="hidden xs:block">Save</span>
              </button>
            )}

            {/* Share Button */}
            {onShare && (
              <button
                onClick={onShare}
                disabled={isLoading || disabled}
                className={`
                  flex items-center space-x-1 px-3 py-2 rounded-lg transition-all
                  min-h-[44px] text-sm font-medium
                  ${isLoading || disabled 
                    ? 'opacity-40 cursor-not-allowed' 
                    : variant === 'dark'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
                aria-label="Share CV"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden xs:block">Share</span>
              </button>
            )}
          </div>
        )}

        {/* Navigation Actions */}
        {showNavigation && (
          <div className="flex items-center space-x-4">
            {/* Step Indicator */}
            {currentStep && (
              <div className={`
                px-2 py-1 rounded-full text-xs font-medium
                ${variant === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}
              `}>
                {getStepIndex(currentStep) + 1}/5
              </div>
            )}

            {/* Next Button */}
            <button
              onClick={onNext}
              disabled={!canGoNext()}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all
                min-h-[44px] min-w-[44px] justify-center
                ${!canGoNext() 
                  ? 'opacity-40 cursor-not-allowed' 
                  : getActiveClasses()
                }
              `}
              aria-label="Go to next step"
            >
              <span className="text-sm font-medium hidden xs:block">Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {currentStep && showNavigation && (
        <div className={`h-1 ${variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ 
              width: `${((getStepIndex(currentStep) + 1) / 5) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  );
};

// Helper component for pages that use bottom navigation
export const MobileBottomNavSpacer: React.FC = () => (
  <div className="h-20 md:hidden" />
);