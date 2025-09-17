import React, { ReactNode } from 'react';
import { Header } from './Header';
import { MobilePageWrapper } from './MobilePageWrapper';
import { ResponsiveStepIndicator } from './ResponsiveStepIndicator';

interface MobilePageLayoutProps {
  children: ReactNode;
  
  // Header props
  title?: string;
  subtitle?: string;
  mobileTitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  headerVariant?: 'default' | 'dark' | 'gradient';
  showBreadcrumbs?: boolean;
  currentPage?: string;
  jobId?: string;
  
  // Navigation props
  currentStep?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onRefresh?: () => Promise<void> | void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  
  // Layout props
  showBottomNav?: boolean;
  showNavigation?: boolean;
  showActions?: boolean;
  showStepIndicator?: boolean;
  enableGestures?: boolean;
  enablePullToRefresh?: boolean;
  
  // State props
  variant?: 'default' | 'dark';
  disabled?: boolean;
  isLoading?: boolean;
  
  // Styling props
  className?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobilePageLayout: React.FC<MobilePageLayoutProps> = ({
  children,
  
  // Header props
  title,
  subtitle,
  mobileTitle,
  showBackButton = false,
  onBack,
  headerVariant = 'default',
  showBreadcrumbs = true,
  currentPage,
  jobId,
  
  // Navigation props
  currentStep,
  onNext,
  onPrevious,
  onSave,
  onShare,
  onRefresh,
  canGoNext = true,
  canGoPrevious = true,
  
  // Layout props
  showBottomNav = true,
  showNavigation = true,
  showActions = true,
  showStepIndicator = false,
  enableGestures = true,
  enablePullToRefresh = false,
  
  // State props
  variant = 'default',
  disabled = false,
  isLoading = false,
  
  // Styling props
  className = '',
  contentClassName = '',
  maxWidth = 'lg',
  padding = 'md'
}) => {
  const getMaxWidthClass = () => {
    const widthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      '2xl': 'max-w-7xl',
      full: 'max-w-full'
    };
    return widthMap[maxWidth];
  };

  const getPaddingClass = () => {
    const paddingMap = {
      none: '',
      sm: 'px-3 py-4',
      md: 'px-4 py-6',
      lg: 'px-6 py-8'
    };
    return paddingMap[padding];
  };

  const getBackgroundClass = () => {
    switch (variant) {
      case 'dark':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-50 text-gray-900';
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClass()} ${className}`}>
      {/* Header */}
      <Header
        title={title}
        subtitle={subtitle}
        mobileTitle={mobileTitle}
        showBackButton={showBackButton}
        onBack={onBack}
        variant={headerVariant}
        showBreadcrumbs={showBreadcrumbs}
        currentPage={currentPage}
        jobId={jobId}
      />

      {/* Step Indicator (Desktop) */}
      {showStepIndicator && currentStep && (
        <div className={`hidden md:block border-b ${
          variant === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className={`mx-auto ${getMaxWidthClass()} ${getPaddingClass()}`}>
            <ResponsiveStepIndicator
              currentStepId={currentStep}
              variant={variant}
              showLabels={true}
              showDescriptions={false}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <MobilePageWrapper
        currentStep={currentStep}
        jobId={jobId}
        onNext={onNext}
        onPrevious={onPrevious}
        onSave={onSave}
        onShare={onShare}
        onRefresh={onRefresh}
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        showBottomNav={showBottomNav}
        showNavigation={showNavigation}
        showActions={showActions}
        variant={variant}
        disabled={disabled}
        isLoading={isLoading}
        enableGestures={enableGestures}
        enablePullToRefresh={enablePullToRefresh}
      >
        <main className={`mx-auto ${getMaxWidthClass()} ${getPaddingClass()} ${contentClassName}`}>
          {children}
        </main>
      </MobilePageWrapper>
    </div>
  );
};

// Specialized layouts for different page types

export const CVAnalysisPageLayout: React.FC<{
  children: ReactNode;
  jobId?: string;
  title?: string;
  onNext?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'dark';
}> = ({
  children,
  jobId,
  title = 'CV Analysis',
  onNext,
  isLoading = false,
  variant = 'default'
}) => (
  <MobilePageLayout
    title={title}
    mobileTitle="Analysis"
    currentPage="analysis"
    currentStep="analysis"
    jobId={jobId}
    onNext={onNext}
    canGoNext={Boolean(onNext)}
    showStepIndicator={true}
    variant={variant}
    isLoading={isLoading}
    enablePullToRefresh={true}
    maxWidth="xl"
  >
    {children}
  </MobilePageLayout>
);

export const CVPreviewPageLayout: React.FC<{
  children: ReactNode;
  jobId?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
  variant?: 'default' | 'dark';
}> = ({
  children,
  jobId,
  onNext,
  onPrevious,
  onSave,
  isLoading = false,
  variant = 'default'
}) => (
  <MobilePageLayout
    title="Preview & Customize"
    mobileTitle="Preview"
    currentPage="preview"
    currentStep="preview"
    jobId={jobId}
    onNext={onNext}
    onPrevious={onPrevious}
    onSave={onSave}
    canGoNext={Boolean(onNext)}
    canGoPrevious={Boolean(onPrevious)}
    showStepIndicator={true}
    showActions={true}
    variant={variant}
    isLoading={isLoading}
    enableGestures={true}
    maxWidth="2xl"
    padding="sm"
  >
    {children}
  </MobilePageLayout>
);

export const ProcessingPageLayout: React.FC<{
  children: ReactNode;
  jobId?: string;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  variant?: 'default' | 'dark';
}> = ({
  children,
  jobId,
  onRefresh,
  isLoading = true,
  variant = 'default'
}) => (
  <MobilePageLayout
    title="Processing CV"
    mobileTitle="Processing"
    currentPage="processing"
    currentStep="processing"
    jobId={jobId}
    onRefresh={onRefresh}
    showBottomNav={false}
    showStepIndicator={true}
    variant={variant}
    isLoading={isLoading}
    enablePullToRefresh={Boolean(onRefresh)}
    enableGestures={false}
    maxWidth="md"
  >
    {children}
  </MobilePageLayout>
);

export const HomePageLayout: React.FC<{
  children: ReactNode;
  variant?: 'default' | 'dark';
}> = ({
  children,
  variant = 'default'
}) => (
  <MobilePageLayout
    showBottomNav={false}
    showBreadcrumbs={false}
    variant={variant}
    maxWidth="lg"
    padding="md"
    className="bg-gradient-to-br from-blue-50 via-white to-purple-50"
    headerVariant="gradient"
  >
    {children}
  </MobilePageLayout>
);