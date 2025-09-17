// NavigationBreadcrumbs - Intelligent navigation breadcrumbs with session awareness
import React, { useEffect } from 'react';
import {
  EnhancedSessionState,
  NavigationContext,
  CVStep,
  Breadcrumb
} from '../types/session';
import NavigationStateManager from '../services/navigation/navigationStateManager';

export interface NavigationBreadcrumbsProps {
  session: EnhancedSessionState;
  navigationContext: NavigationContext;
  currentStep: CVStep;
  onNavigate?: (step: CVStep, url: string) => void;
  showProgress?: boolean;
  showIcons?: boolean;
  compact?: boolean;
}

export const NavigationBreadcrumbs: React.FC<NavigationBreadcrumbsProps> = ({
  session,
  navigationContext,
  currentStep,
  onNavigate,
  showProgress = true,
  showIcons = true,
  compact = false
}) => {
  const navigationManager = NavigationStateManager.getInstance();
  
  // Cleanup on component unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup is handled by the NavigationStateManager singleton
      // But we can trigger cleanup if this is the last component
      if (typeof window !== 'undefined') {
        navigationManager.cleanup();
      }
    };
  }, [navigationManager]);
  
  const breadcrumbs = navigationManager.generateBreadcrumbs(session);
  
  const getStepIcon = (step: CVStep): string => {
    const icons: Record<CVStep, string> = {
      upload: '📄',
      processing: '⚙️',
      analysis: '🔍',
      features: '✨',
      templates: '🎨',
      preview: '👁️',
      results: '🎯',
      keywords: '🔤',
      completed: '✅'
    };
    return icons[step] || '📋';
  };

  const getStepTitle = (step: CVStep): string => {
    const titles: Record<CVStep, string> = {
      upload: 'Upload CV',
      processing: 'Processing',
      analysis: 'AI Analysis',
      features: 'Features',
      templates: 'Templates',
      preview: 'Preview',
      results: 'Results',
      keywords: 'Keywords',
      completed: 'Completed'
    };
    return titles[step] || step;
  };

  const getStepProgress = (step: CVStep): number => {
    const stepProgress = session.stepProgress[step];
    return stepProgress ? stepProgress.completion : 0;
  };

  const isStepBlocked = (step: CVStep): boolean => {
    return navigationContext.blockedPaths.some(path => path.step === step);
  };

  const isStepCurrent = (step: CVStep): boolean => {
    return step === currentStep;
  };

  const isStepCompleted = (step: CVStep): boolean => {
    return session.completedSteps.includes(step);
  };

  const handleBreadcrumbClick = async (breadcrumb: Breadcrumb) => {
    if (!breadcrumb.accessible || isStepBlocked(breadcrumb.step)) {
      return;
    }

    try {
      if (onNavigate) {
        onNavigate(breadcrumb.step, breadcrumb.url);
      } else {
        // Use debounced navigation to prevent rapid clicking issues
        await navigationManager.navigateWithDebounce(session.sessionId, breadcrumb.step, breadcrumb.url);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct navigation
      window.location.href = breadcrumb.url;
    }
  };

  const renderBreadcrumb = (breadcrumb: Breadcrumb, index: number, isLast: boolean) => {
    const isCurrent = isStepCurrent(breadcrumb.step);
    const isCompleted = isStepCompleted(breadcrumb.step);
    const isBlocked = isStepBlocked(breadcrumb.step);
    const progress = getStepProgress(breadcrumb.step);

    const baseClasses = "flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200";
    const stateClasses = isCurrent 
      ? "bg-blue-100 text-blue-800 border border-blue-200"
      : isCompleted 
        ? "text-green-700 hover:bg-green-50"
        : isBlocked
          ? "text-gray-400 cursor-not-allowed"
          : breadcrumb.accessible
            ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
            : "text-gray-400 cursor-not-allowed";

    return (
      <React.Fragment key={breadcrumb.id}>
        <li 
          className={`${baseClasses} ${stateClasses} ${compact ? 'px-2 py-1' : ''}`}
          onClick={() => handleBreadcrumbClick(breadcrumb)}
          title={breadcrumb.metadata?.description}
        >
          {/* Icon */}
          {showIcons && (
            <span className={compact ? 'text-sm' : 'text-base'}>
              {breadcrumb.metadata?.icon || getStepIcon(breadcrumb.step)}
            </span>
          )}

          {/* Label */}
          <span className={`font-medium ${compact ? 'text-sm' : 'text-base'}`}>
            {breadcrumb.label || getStepTitle(breadcrumb.step)}
          </span>

          {/* Status Indicators */}
          <div className="flex items-center space-x-1">
            {isCompleted && (
              <span className="text-green-500 text-sm">✓</span>
            )}
            {isCurrent && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
            {isBlocked && (
              <span className="text-gray-400 text-sm">🔒</span>
            )}
          </div>

          {/* Progress Bar (if enabled and not compact) */}
          {showProgress && !compact && progress > 0 && progress < 100 && (
            <div className="w-8 bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </li>

        {/* Separator */}
        {!isLast && (
          <li className="flex items-center text-gray-400">
            <span className={compact ? 'text-sm' : 'text-base'}>›</span>
          </li>
        )}
      </React.Fragment>
    );
  };

  if (compact) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-2">
        <ol className="flex items-center space-x-2 overflow-x-auto">
          {breadcrumbs.slice(-3).map((breadcrumb, index, array) => 
            renderBreadcrumb(breadcrumb, index, index === array.length - 1)
          )}
        </ol>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        {/* Main Breadcrumbs */}
        <ol className="flex flex-wrap items-center space-x-2 mb-2">
          {breadcrumbs.map((breadcrumb, index) => 
            renderBreadcrumb(breadcrumb, index, index === breadcrumbs.length - 1)
          )}
        </ol>

        {/* Additional Context Information */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {/* Overall Progress */}
            <div className="flex items-center space-x-2">
              <span>Progress:</span>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${navigationContext.completionPercentage}%` }}
                ></div>
              </div>
              <span className="font-medium">{Math.round(navigationContext.completionPercentage)}%</span>
            </div>

            {/* Critical Issues */}
            {navigationContext.criticalIssues.length > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <span>⚠️</span>
                <span>{navigationContext.criticalIssues.length} issue{navigationContext.criticalIssues.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Next Recommended Steps */}
          {navigationContext.recommendedNextSteps.length > 0 && (
            <div className="flex items-center space-x-2 text-blue-600">
              <span>Next:</span>
              <span className="font-medium capitalize">
                {getStepTitle(navigationContext.recommendedNextSteps[0])}
              </span>
            </div>
          )}
        </div>

        {/* Critical Issues Details */}
        {navigationContext.criticalIssues.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-800">
              <div className="font-medium mb-1">Issues requiring attention:</div>
              <ul className="list-disc list-inside space-y-1">
                {navigationContext.criticalIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBreadcrumbs;