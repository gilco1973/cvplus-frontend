import React from 'react';
import { designSystem } from '../../config/designSystem';

interface PageContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'narrow' | 'wide';
  className?: string;
}

/**
 * PageContainer - Consistent content wrapper with proper spacing
 * 
 * Provides standardized container widths and spacing for page content.
 * Ensures consistent margins, padding, and responsive behavior.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  variant = 'default',
  className = ''
}) => {
  // Get container width based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'max-w-2xl mx-auto px-4 sm:px-6';
      case 'narrow':
        return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8';
      case 'wide':
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
      default:
        return designSystem.layout.patterns.container + ' px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className={`${getContainerClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Export as default
export default PageContainer;