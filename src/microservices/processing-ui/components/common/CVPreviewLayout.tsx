/**
 * CVPreviewLayout Component
 * 
 * Provides consistent layout wrapper for CV preview content.
 * Handles responsive design and print-friendly styling.
 */

import React, { memo } from 'react';

interface CVPreviewLayoutProps {
  children: React.ReactNode;
  className?: string;
  printMode?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const CVPreviewLayout: React.FC<CVPreviewLayoutProps> = memo(({
  children,
  className = '',
  printMode = false,
  maxWidth = '4xl'
}) => {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full',
    '4xl': 'max-w-4xl'
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
        {/* Print-friendly wrapper */}
        <div className={`${
          printMode 
            ? 'print:shadow-none print:border-none print:bg-white' 
            : ''
        }`}>
          {children}
        </div>
      </div>
    </div>
  );
});

CVPreviewLayout.displayName = 'CVPreviewLayout';

export default CVPreviewLayout;