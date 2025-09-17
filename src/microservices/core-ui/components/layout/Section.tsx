import React from 'react';
import { designSystem } from '../../config/designSystem';

interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'hero' | 'features' | 'content';
  background?: 'neutral-900' | 'neutral-800' | 'transparent' | 'gradient';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Section - Standardized section component with consistent spacing
 * 
 * Provides uniform section spacing and background patterns across pages.
 * Eliminates inconsistent padding and margin implementations.
 */
export const Section: React.FC<SectionProps> = ({
  children,
  variant = 'default',
  background = 'transparent',
  spacing = 'lg',
  className = ''
}) => {
  // Get spacing classes based on variant and spacing prop
  const getSpacingClasses = () => {
    if (variant === 'hero') return designSystem.layout.patterns.heroSection;
    if (variant === 'features') return designSystem.layout.patterns.section;
    
    // Use spacing prop for custom spacing
    switch (spacing) {
      case 'sm': return 'py-8 px-4 sm:px-6 lg:px-8';
      case 'md': return 'py-12 px-4 sm:px-6 lg:px-8';
      case 'xl': return 'py-24 px-4 sm:px-6 lg:px-8';
      default: return designSystem.layout.patterns.section;
    }
  };

  // Get background classes
  const getBackgroundClasses = () => {
    switch (background) {
      case 'neutral-900':
        return 'bg-neutral-900';
      case 'neutral-800':
        return 'bg-neutral-800';
      case 'gradient':
        return 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900';
      default:
        return 'bg-transparent';
    }
  };

  return (
    <section className={`${getSpacingClasses()} ${getBackgroundClasses()} ${className}`}>
      {children}
    </section>
  );
};

// Export as default
export default Section;