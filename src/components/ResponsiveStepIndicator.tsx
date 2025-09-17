import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ResponsiveStepIndicatorProps {
  steps?: Step[];
  currentStepId: string;
  variant?: 'default' | 'dark';
  size?: 'compact' | 'normal' | 'large';
  onStepClick?: (stepId: string) => void;
  showLabels?: boolean;
  showDescriptions?: boolean;
  className?: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    id: 'upload',
    label: 'Upload CV',
    shortLabel: 'Upload',
    description: 'Upload your current CV'
  },
  {
    id: 'processing',
    label: 'Processing',
    shortLabel: 'Process',
    description: 'AI analyzes your CV'
  },
  {
    id: 'analysis',
    label: 'Analysis Results',
    shortLabel: 'Results',
    description: 'Review analysis findings'
  },
  {
    id: 'preview',
    label: 'Preview & Customize',
    shortLabel: 'Preview',
    description: 'Customize your enhanced CV'
  },
  {
    id: 'results',
    label: 'Final Results',
    shortLabel: 'Done',
    description: 'Download your new CV'
  }
];

export const ResponsiveStepIndicator: React.FC<ResponsiveStepIndicatorProps> = ({
  steps = DEFAULT_STEPS,
  currentStepId,
  variant = 'default',
  size = 'normal',
  onStepClick,
  showLabels = true,
  showDescriptions = false,
  className = ''
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);

  const getStepStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getCircleSize = () => {
    switch (size) {
      case 'compact': return 'w-6 h-6';
      case 'large': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'compact': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getStepClasses = (status: string, clickable: boolean) => {
    const baseClasses = `
      flex items-center justify-center rounded-full font-medium transition-all
      ${getCircleSize()}
      ${clickable ? 'cursor-pointer hover:scale-110' : ''}
    `;

    switch (status) {
      case 'completed':
        return `${baseClasses} ${
          variant === 'dark' 
            ? 'bg-green-600 text-white' 
            : 'bg-green-500 text-white'
        }`;
      case 'current':
        return `${baseClasses} ${
          variant === 'dark' 
            ? 'bg-blue-600 text-white ring-2 ring-blue-400/50' 
            : 'bg-blue-600 text-white ring-2 ring-blue-300'
        }`;
      default:
        return `${baseClasses} ${
          variant === 'dark' 
            ? 'bg-gray-700 text-gray-400 border border-gray-600' 
            : 'bg-gray-200 text-gray-500 border border-gray-300'
        }`;
    }
  };

  const getConnectorClasses = (fromStatus: string) => {
    const baseClasses = 'flex-1 h-0.5 transition-colors duration-300';
    
    return `${baseClasses} ${
      fromStatus === 'completed' 
        ? (variant === 'dark' ? 'bg-green-600' : 'bg-green-500')
        : (variant === 'dark' ? 'bg-gray-700' : 'bg-gray-300')
    }`;
  };

  const getLabelClasses = (status: string) => {
    const baseClasses = `font-medium ${getTextSize()} transition-colors`;
    
    switch (status) {
      case 'completed':
        return `${baseClasses} ${
          variant === 'dark' ? 'text-green-400' : 'text-green-600'
        }`;
      case 'current':
        return `${baseClasses} ${
          variant === 'dark' ? 'text-blue-400' : 'text-blue-600'
        }`;
      default:
        return `${baseClasses} ${
          variant === 'dark' ? 'text-gray-500' : 'text-gray-500'
        }`;
    }
  };

  const getDescriptionClasses = () => {
    return `text-xs mt-1 ${
      variant === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`;
  };

  // Mobile horizontal scrolling version
  const MobileStepIndicator = () => (
    <div className="md:hidden overflow-x-auto scrollbar-hide">
      <div className="flex items-center space-x-4 px-4 py-4 min-w-max">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = Boolean(onStepClick && status !== 'pending');
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className="flex flex-col items-center space-y-2 min-w-[60px]"
                onClick={isClickable ? () => onStepClick!(step.id) : undefined}
              >
                <div className={getStepClasses(status, isClickable)}>
                  {step.icon ? (
                    step.icon
                  ) : status === 'completed' ? (
                    <CheckCircle className={size === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
                  ) : (
                    <span className={size === 'compact' ? 'text-xs' : 'text-sm'}>
                      {index + 1}
                    </span>
                  )}
                </div>
                
                {showLabels && (
                  <div className="text-center">
                    <div className={getLabelClasses(status)}>
                      {size === 'compact' && step.shortLabel ? step.shortLabel : step.label}
                    </div>
                    {showDescriptions && step.description && (
                      <div className={getDescriptionClasses()}>
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className={`
                  w-4 h-4 flex-shrink-0
                  ${variant === 'dark' ? 'text-gray-600' : 'text-gray-400'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Desktop version
  const DesktopStepIndicator = () => (
    <div className="hidden md:flex items-center justify-between space-x-4">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isClickable = Boolean(onStepClick && status !== 'pending');
        
        return (
          <React.Fragment key={step.id}>
            <div 
              className={`flex items-center space-x-4 ${isClickable ? 'cursor-pointer group' : ''}`}
              onClick={isClickable ? () => onStepClick!(step.id) : undefined}
            >
              <div className={getStepClasses(status, isClickable)}>
                {step.icon ? (
                  step.icon
                ) : status === 'completed' ? (
                  <CheckCircle className={size === 'compact' ? 'w-4 h-4' : 'w-5 h-5'} />
                ) : (
                  <span className={size === 'compact' ? 'text-xs' : 'text-sm'}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              {showLabels && (
                <div className={`${isClickable ? 'group-hover:translate-x-1 transition-transform' : ''}`}>
                  <div className={getLabelClasses(status)}>
                    {step.label}
                  </div>
                  {showDescriptions && step.description && (
                    <div className={getDescriptionClasses()}>
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className={getConnectorClasses(status)} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className={className}>
      <MobileStepIndicator />
      <DesktopStepIndicator />
    </div>
  );
};

// Compact version for headers
export const CompactStepIndicator: React.FC<{
  steps?: Step[];
  currentStepId: string;
  variant?: 'default' | 'dark';
}> = ({ steps = DEFAULT_STEPS, currentStepId, variant = 'default' }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  return (
    <div className="flex items-center space-x-3">
      <div className={`text-xs font-medium ${
        variant === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Step {currentIndex + 1} of {steps.length}
      </div>
      
      <div className={`w-20 h-1.5 rounded-full overflow-hidden ${
        variant === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      }`}>
        <div 
          className="h-full bg-blue-600 transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className={`text-xs ${
        variant === 'dark' ? 'text-blue-400' : 'text-blue-600'
      }`}>
        {steps[currentIndex]?.shortLabel || steps[currentIndex]?.label}
      </div>
    </div>
  );
};