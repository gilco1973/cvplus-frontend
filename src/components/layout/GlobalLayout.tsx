import React from 'react';
import { Navigation } from '../common/Navigation';
import { Footer } from './Footer';
import { PageContainer } from './PageContainer';

interface GlobalLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'minimal' | 'full-width';
  showFooter?: boolean;
  className?: string;
}

/**
 * GlobalLayout - Unified layout wrapper for consistent structure
 * 
 * Provides consistent navigation, content structure, and footer across all pages.
 * Eliminates the navigation inconsistencies between pages by using the standardized
 * Navigation component with unified cyan-blue theme.
 */
export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  children,
  variant = 'default',
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {/* Dark theme background for the entire app */}
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        
        {/* Unified Navigation Header */}
        <Navigation variant="default" />
        
        {/* Main Content Area */}
        <main className="flex-1">
          {variant === 'full-width' ? (
            children
          ) : (
            <PageContainer variant={variant}>
              {children}
            </PageContainer>
          )}
        </main>
        
        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  );
};

// Export as default
export default GlobalLayout;