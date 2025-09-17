import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import { Breadcrumb } from './Breadcrumb';
import { generateBreadcrumbs } from '../utils/breadcrumbs';
import { ChevronLeft } from 'lucide-react';
import { designSystem } from '../config/designSystem';

interface HeaderProps {
  currentPage?: string;
  jobId?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'dark' | 'gradient';
  showBreadcrumbs?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  mobileTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  jobId,
  title,
  subtitle,
  variant = 'default',
  showBreadcrumbs = true,
  onBack,
  showBackButton = false,
  mobileTitle
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-collapse header on mobile scroll down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMobile = window.innerWidth < 768;
      
      if (isMobile && currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setIsCollapsed(true);
        } else if (currentScrollY < lastScrollY - 10) {
          setIsCollapsed(false);
        }
      } else {
        setIsCollapsed(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  const getHeaderClasses = () => {
    switch (variant) {
      case 'dark':
        return designSystem.components.navigation.header.background + ' ' + designSystem.components.navigation.header.border;
      case 'gradient':
        return 'bg-gradient-to-r from-primary-500 to-secondary-500 border-b border-primary-500/20';
      default:
        return 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'dark':
      case 'gradient':
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  const breadcrumbItems = currentPage ? generateBreadcrumbs(currentPage, jobId) : [];

  return (
    <>
      <header className={`sticky top-0 z-50 transition-transform duration-300 ${
        isCollapsed ? '-translate-y-2' : 'translate-y-0'
      } ${getHeaderClasses()}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden">
            <div className={`flex items-center justify-between transition-all duration-300 ${
              isCollapsed ? 'h-12 py-2' : 'h-14 py-3'
            }`}>
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {showBackButton && onBack && (
                  <button
                    onClick={onBack}
                    className={`p-2 -ml-2 rounded-lg transition-colors ${
                      variant === 'default' 
                        ? 'text-gray-700 hover:bg-gray-100 active:bg-gray-200' 
                        : 'text-white hover:bg-white/10 active:bg-white/20'
                    }`}
                    aria-label="Go back"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                
                <div className="min-w-0 flex-1">
                  <Logo 
                    variant={variant === 'default' ? 'default' : 'white'} 
                    size={isCollapsed ? 'small' : 'medium'}
                  />
                </div>
                
                {mobileTitle && !isCollapsed && (
                  <div className="flex-1 text-center">
                    <h1 className={`text-base font-medium truncate ${getTextClasses()}`}>
                      {mobileTitle}
                    </h1>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {currentPage && (
                  <div className="flex items-center space-x-1 text-xs">
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      variant === 'default' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'bg-white/20 text-white'
                    }`}>
                      {getStepNumber(currentPage)}/5
                    </span>
                  </div>
                )}
                <UserMenu variant={variant === 'default' ? 'default' : 'white'} size="small" />
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Logo variant={variant === 'default' ? 'default' : 'white'} />
                
                {title && (
                  <div className="border-l border-gray-300 pl-4">
                    <h1 className={`text-lg font-semibold ${getTextClasses()}`}>
                      {title}
                    </h1>
                    {subtitle && (
                      <p className={`text-sm ${variant === 'default' ? 'text-gray-600' : 'text-gray-200'}`}>
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {currentPage && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={variant === 'default' ? 'text-gray-600' : 'text-gray-200'}>
                      Step {getStepNumber(currentPage)} of 5:
                    </span>
                    <span className={`font-medium ${variant === 'default' ? 'text-primary-600' : 'text-primary-200'}`}>
                      {getStepLabel(currentPage)}
                    </span>
                  </div>
                )}
                <UserMenu variant={variant === 'default' ? 'default' : 'white'} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {showBreadcrumbs && breadcrumbItems.length > 0 && (
        <div className={variant === 'default' ? 'bg-gray-50 border-b border-gray-200' : 'bg-gray-100/10 border-b border-white/10'}>
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            {/* Mobile breadcrumb */}
            <div className="md:hidden">
              <Breadcrumb 
                items={breadcrumbItems} 
                variant={variant === 'default' ? 'default' : 'dark'}
                className={variant === 'default' ? 'text-gray-700' : 'text-white/90'}
                mobile={true}
                showStepIndicator={true}
              />
            </div>
            
            {/* Desktop breadcrumb */}
            <div className="hidden md:block py-3">
              <Breadcrumb 
                items={breadcrumbItems} 
                variant={variant === 'default' ? 'default' : 'dark'}
                className={variant === 'default' ? 'text-gray-700' : 'text-white/90'}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getStepNumber = (currentPage: string): string => {
  switch (currentPage) {
    case 'processing':
      return '1';
    case 'analysis':
      return '2';
    case 'role-selection':
      return '3';
    case 'feature-selection':
      return '4'; // Feature selection is step 4
    case 'preview':
      return '3a'; // Preview & Customize (alternative to role selection)
    case 'templates':
      return '4a'; // Templates are sub-step of customization
    case 'keywords':
      return '4b'; // Keywords are sub-step of customization
    case 'results':
      return '5'; // Final results is step 5
    default:
      return '1';
  }
};

const getStepLabel = (currentPage: string): string => {
  switch (currentPage) {
    case 'processing':
      return 'Processing CV';
    case 'analysis':
      return 'Analysis Results';
    case 'role-selection':
      return 'Role Selection';
    case 'feature-selection':
      return 'Feature Selection';
    case 'preview':
      return 'Preview & Customize';
    case 'templates':
      return 'Template Selection';
    case 'keywords':
      return 'Keyword Optimization';
    case 'results':
      return 'Your Enhanced CV';
    default:
      return 'Getting Started';
  }
};