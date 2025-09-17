import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, MoreHorizontal, FileText, BarChart3, Eye, Palette, CheckCircle } from 'lucide-react';
import { BreadcrumbItem } from '../utils/breadcrumbs';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: 'default' | 'dark';
  mobile?: boolean;
  showStepIndicator?: boolean;
}

// Helper function to convert icon string names to React components
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  
  const iconProps = { className: "w-4 h-4" };
  
  switch (iconName) {
    case 'FileText': return <FileText {...iconProps} />;
    case 'BarChart3': return <BarChart3 {...iconProps} />;
    case 'Eye': return <Eye {...iconProps} />;
    case 'Palette': return <Palette {...iconProps} />;
    case 'CheckCircle': return <CheckCircle {...iconProps} />;
    default: return null;
  }
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  className = '', 
  variant = 'default',
  mobile = false,
  showStepIndicator = false
}) => {
  const navigate = useNavigate();
  const [showFullBreadcrumb, setShowFullBreadcrumb] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  // Mobile condensed view - show only current and previous
  const getMobileBreadcrumb = () => {
    if (items.length <= 1) return items;
    
    const currentIndex = items.findIndex(item => item.current);
    if (currentIndex <= 0) return items.slice(0, 2);
    
    // Show previous and current
    return items.slice(Math.max(0, currentIndex - 1), currentIndex + 1);
  };

  const mobileBreadcrumb = mobile ? getMobileBreadcrumb() : items;
  const hasHiddenItems = mobile && items.length > 2;

  if (mobile) {
    return (
      <>
        {/* Mobile Step Indicator */}
        {showStepIndicator && items.length > 0 && (
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-2">
              {items.map((item, index) => {
                const isActive = item.current;
                const isCompleted = !isActive && index < items.findIndex(i => i.current);
                
                return (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => handleItemClick(item.path)}
                      disabled={!item.path}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        isActive
                          ? variant === 'dark' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-600 text-white'
                          : isCompleted
                          ? variant === 'dark'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-600 text-white'
                          : variant === 'dark'
                          ? 'bg-gray-700 text-gray-300 border border-gray-600'
                          : 'bg-gray-200 text-gray-600 border border-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                    {index < items.length - 1 && (
                      <div className={`w-6 h-0.5 ${
                        isCompleted
                          ? variant === 'dark' ? 'bg-green-500' : 'bg-green-600'
                          : variant === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Mobile Breadcrumb Navigation */}
        <nav className={`flex items-center justify-between py-3 ${className}`} aria-label="Breadcrumb" ref={containerRef}>
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg transition-colors ${
                variant === 'dark' 
                  ? 'text-gray-300 hover:text-blue-400 hover:bg-white/5' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </button>
            
            {/* Expand/Collapse Button for hidden items */}
            {hasHiddenItems && (
              <button
                onClick={() => setShowFullBreadcrumb(!showFullBreadcrumb)}
                className={`p-2 rounded-lg transition-colors ${
                  variant === 'dark' 
                    ? 'text-gray-300 hover:text-blue-400 hover:bg-white/5' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                aria-label={showFullBreadcrumb ? 'Show less' : 'Show more'}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            )}
            
            {/* Breadcrumb Items */}
            <div className="flex items-center space-x-1 min-w-0 flex-1">
              {(showFullBreadcrumb ? items : mobileBreadcrumb).map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <ChevronRight className={`w-3 h-3 flex-shrink-0 ${
                      variant === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  )}
                  
                  {item.current ? (
                    <div className="flex items-center space-x-1 min-w-0">
                      {item.icon && (
                        <span className={`flex-shrink-0 ${
                          variant === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {getIconComponent(item.icon)}
                        </span>
                      )}
                      <span className={`font-medium text-sm truncate ${
                        variant === 'dark' ? 'text-gray-100' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item.path)}
                      className={`flex items-center space-x-1 text-sm transition-colors min-w-0 p-1 rounded ${
                        variant === 'dark'
                          ? 'text-gray-300 hover:text-blue-400 hover:bg-white/5'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon && (
                        <span className={`flex-shrink-0 ${
                          variant === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {getIconComponent(item.icon)}
                        </span>
                      )}
                      <span className="truncate">{item.label}</span>
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </nav>
      </>
    );
  }

  // Desktop breadcrumb (original)
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <button
        onClick={() => navigate('/')}
        className={`flex items-center transition-colors ${
          variant === 'dark' 
            ? 'text-gray-300 hover:text-blue-400' 
            : 'text-gray-700 hover:text-blue-600'
        }`}
        title="Home"
      >
        <Home className="w-4 h-4" />
      </button>
      
      {items.length > 0 && <ChevronRight className={`w-4 h-4 ${
        variant === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`} />}
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className={`w-4 h-4 ${
            variant === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />}
          
          {item.current ? (
            <span className={`flex items-center space-x-1 font-medium ${
              variant === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {item.icon && <span className={variant === 'dark' ? 'text-blue-400' : 'text-blue-600'}>{getIconComponent(item.icon)}</span>}
              <span>{item.label}</span>
            </span>
          ) : (
            <button
              onClick={() => handleItemClick(item.path)}
              className={`flex items-center space-x-1 transition-colors ${
                variant === 'dark'
                  ? 'text-gray-300 hover:text-blue-400'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {item.icon && <span className={variant === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{getIconComponent(item.icon)}</span>}
              <span>{item.label}</span>
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

