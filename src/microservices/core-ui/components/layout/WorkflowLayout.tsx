import React from 'react';
import { Header } from '../Header';
import { PageContainer } from './PageContainer';

interface WorkflowLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  jobId?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'dark' | 'gradient';
  showBreadcrumbs?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  mobileTitle?: string;
  containerVariant?: 'default' | 'minimal' | 'narrow' | 'wide';
  className?: string;
}

/**
 * WorkflowLayout - Specialized layout for CV processing workflow pages
 * 
 * Provides the specialized Header component with breadcrumbs and progress tracking
 * for CV processing workflow pages while maintaining consistent structure.
 */
export const WorkflowLayout: React.FC<WorkflowLayoutProps> = ({
  children,
  currentPage,
  jobId,
  title,
  subtitle,
  variant = 'dark',
  showBreadcrumbs = true,
  onBack,
  showBackButton = false,
  mobileTitle,
  containerVariant = 'default',
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 ${className}`}>
      {/* Specialized Workflow Header */}
      <Header 
        currentPage={currentPage}
        jobId={jobId}
        title={title}
        subtitle={subtitle}
        variant={variant}
        showBreadcrumbs={showBreadcrumbs}
        onBack={onBack}
        showBackButton={showBackButton}
        mobileTitle={mobileTitle}
      />
      
      {/* Main Content Area */}
      <main className="flex-1">
        <PageContainer variant={containerVariant}>
          {children}
        </PageContainer>
      </main>
    </div>
  );
};

// Export as default
export default WorkflowLayout;