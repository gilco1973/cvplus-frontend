import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { PortalLayoutProps } from '../../../types/portal-component-props';
import { PortalError } from '../../../types/portal-types';
import { PortalHeader } from './components/PortalHeader';
import { PortalDeploymentDisplay } from './components/PortalDeploymentDisplay';
import { PortalSettingsPanel } from './components/PortalSettingsPanel';
import { PortalFooter } from './components/PortalFooter';
import { usePortalTheme } from './hooks/usePortalTheme';
import { usePortalDeployment } from './hooks/usePortalDeployment';
import { usePortalNavigation } from './hooks/usePortalNavigation';

/**
 * PortalLayout Component
 * Main portal structure with deployment status, theme switching, and layout options
 */
export const PortalLayout: React.FC<PortalLayoutProps> = ({
  children,
  portalConfig,
  deploymentStatus,
  portalUrl,
  layoutConfig = {},
  seoConfig = {},
  isLoading = false,
  error,
  onPortalError,
  onPortalSuccess,
  onLayoutReady,
  onNavigationChange,
  onError,
  className = '',
  mode = 'private'
}) => {
  // State management
  const [currentLayout, setCurrentLayout] = useState<'modern' | 'classic' | 'minimal'>(portalConfig.theme.layout);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  // Custom hooks
  const {
    currentTheme,
    themeClasses,
    handleThemeChange,
    handleLayoutChange: updateLayout
  } = usePortalTheme(portalConfig, onPortalSuccess, onPortalError);
  
  const {
    deploymentPolling,
    handleCopyUrl,
    handleShare,
    handleManualDeploy
  } = usePortalDeployment(portalConfig, portalUrl, deploymentStatus, onPortalSuccess, onPortalError);
  
  const {
    activeSection,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleNavigationClick
  } = usePortalNavigation(onNavigationChange);
  
  // Layout management
  const handleLayoutChange = useCallback(async (layout: 'modern' | 'classic' | 'minimal') => {
    setCurrentLayout(layout);
    await updateLayout(layout);
  }, [updateLayout]);
  
  // Refs
  const layoutRef = useRef<HTMLDivElement>(null);
  
  // Layout ready callback
  useEffect(() => {
    if (layoutRef.current && !isLoading && !error) {
      onLayoutReady?.();
    }
  }, [isLoading, error, onLayoutReady]);
  
  // Handle errors
  const handleError = useCallback((err: Error) => {
    onError?.(err);
    onPortalError?.(err as PortalError);
  }, [onError, onPortalError]);
  
  // Get layout-specific classes
  const getLayoutClasses = () => {
    const baseClasses = 'min-h-screen transition-all duration-300';
    const layoutSpecific = {
      modern: 'font-sans',
      classic: 'font-serif',
      minimal: 'font-mono'
    };
    
    return `${baseClasses} ${layoutSpecific[currentLayout]} ${themeClasses.background} ${themeClasses.text}`;
  };
  
  // Get preview classes for responsive design
  const getPreviewClasses = () => {
    if (mode !== 'preview') return '';
    
    const previewSizes = {
      desktop: 'max-w-7xl',
      tablet: 'max-w-3xl',
      mobile: 'max-w-sm'
    };
    
    return `mx-auto ${previewSizes[previewMode]} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden`;
  };
  
  return (
    <ErrorBoundary onError={handleError}>
      <div 
        ref={layoutRef}
        className={`${getLayoutClasses()} ${className}`}
        data-theme={currentTheme}
        data-layout={currentLayout}
      >
        {/* Header */}
        <PortalHeader
          portalConfig={portalConfig}
          layoutConfig={layoutConfig}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          activeSection={activeSection}
          currentTheme={currentTheme}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          mode={mode}
          themeClasses={themeClasses}
          onNavigationClick={handleNavigationClick}
          onThemeChange={handleThemeChange}
        />
        
        {/* Settings Panel */}
        <PortalSettingsPanel
          isOpen={isSettingsOpen}
          currentLayout={currentLayout}
          customization={{}}
          portalUrl={portalUrl}
          deploymentPolling={deploymentPolling}
          themeClasses={themeClasses}
          onLayoutChange={handleLayoutChange}
          onCopyUrl={handleCopyUrl}
          onShare={handleShare}
          onManualDeploy={handleManualDeploy}
        />
        
        {/* Main Content */}
        <main className={`${getPreviewClasses()}`}>
          {/* Deployment Status */}
          {deploymentStatus && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <PortalDeploymentDisplay
                deploymentStatus={deploymentStatus}
                portalUrl={portalUrl}
                onCopyUrl={handleCopyUrl}
              />
            </div>
          )}
          
          {/* Content Wrapper */}
          <FeatureWrapper
            className={layoutConfig.main?.containerClass || 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}
            mode={mode}
            isLoading={isLoading}
            error={error}
            onRetry={() => window.location.reload()}
          >
            {children}
          </FeatureWrapper>
        </main>
        
        {/* Footer */}
        <PortalFooter
          portalConfig={portalConfig}
          layoutConfig={layoutConfig}
          themeClasses={themeClasses}
        />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
              <LoadingSpinner size="large" message="Loading portal..." />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};