/**
 * CVPlus Multimedia Integration Layer - Enhanced
 * 
 * Provides seamless integration between root frontend and multimedia submodule
 * with smart component resolution, feature flags, and performance optimization
 * 
 * @author Gil Klainert  
 * @version 2.0.0
 * @license PROPRIETARY
 */

import React, { lazy, Suspense } from 'react';
import { componentResolver } from './ComponentResolver';
import { featureRegistry } from './FeatureRegistry';
import { withIntegrationWrapper, createLazyComponent } from './IntegrationUtils';
// import { useMultimediaFeatures } from '../hooks/useMultimediaFeatures';

// ============================================================================
// ENHANCED FEATURE FLAGS & CONFIGURATION
// ============================================================================

interface MultimediaFeatureFlags {
  useSubmoduleComponents: boolean;
  enableAdvancedFeatures: boolean;
  enableDebugMode: boolean;
  enablePerformanceTracking: boolean;
  enableSmartFallbacks: boolean;
  enableVersionChecking: boolean;
  enableA11yFeatures: boolean;
}

const DEFAULT_FEATURE_FLAGS: MultimediaFeatureFlags = {
  useSubmoduleComponents: true,
  enableAdvancedFeatures: true,
  enableDebugMode: false,
  enablePerformanceTracking: true,
  enableSmartFallbacks: true,
  enableVersionChecking: true,
  enableA11yFeatures: true,
};

// ============================================================================
// ENHANCED LAZY LOADING WITH SMART COMPONENT RESOLUTION
// ============================================================================

// Generic fallback component
const GenericFallback: React.FC<{ componentName: string; error?: Error }> = ({ componentName, error }) => (
  <div className="p-4 border-2 border-gray-200 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-center text-gray-600">
      <div className="animate-pulse w-4 h-4 bg-gray-300 rounded mr-2"></div>
      <span>Loading {componentName}...</span>
    </div>
    {error && (
      <p className="text-red-600 text-sm mt-2">Failed to load: {error.message}</p>
    )}
  </div>
);

// Enhanced lazy loading with error handling and fallbacks
const createSmartLazyComponent = <P extends Record<string, any>>(
  componentName: string,
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  fallbackImportFn?: () => Promise<{ default: React.ComponentType<P> }>
) => {
  const FallbackComponent = fallbackImportFn ? lazy(fallbackImportFn) : undefined;
  
  return createLazyComponent(
    importFn,
    componentName,
    FallbackComponent || GenericFallback
  );
};

// Smart component loading with resolver integration
const ProfilePictureUpload = createSmartLazyComponent(
  'ProfilePictureUpload',
  () => import('../components/utilities/ProfilePictureUpload').then(m => ({ default: m.ProfilePictureUpload }))
);

const FileUpload = createSmartLazyComponent(
  'FileUpload',
  () => import('../components/utilities/FileUpload').then(m => ({ default: m.FileUpload }))
);

// Register components with resolver
const registerComponents = () => {
  componentResolver.register('ProfilePictureUpload', ProfilePictureUpload, { version: '1.0.0' });
  componentResolver.register('FileUpload', FileUpload, { version: '1.0.0' });
};

// ============================================================================
// ENHANCED LOADING & ERROR COMPONENTS
// ============================================================================

const MultimediaLoadingFallback: React.FC<{ componentName?: string }> = ({ componentName }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">
      Loading {componentName ? componentName : 'multimedia component'}...
    </span>
  </div>
);

const MultimediaErrorFallback: React.FC<{ 
  componentName: string; 
  error?: Error; 
  onRetry?: () => void;
}> = ({ componentName, error, onRetry }) => (
  <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
    <h3 className="text-red-800 font-medium mb-2">
      Failed to load {componentName}
    </h3>
    <p className="text-red-600 text-sm mb-3">
      {error?.message || 'An unexpected error occurred while loading the component.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

// ============================================================================
// ENHANCED INTEGRATION WRAPPER COMPONENT
// ============================================================================

interface MultimediaIntegrationProps {
  component: string;
  fallback?: React.ComponentType<any>;
  featureFlag?: string;
  enableErrorBoundary?: boolean;
  enablePerformanceTracking?: boolean;
  onError?: (error: Error) => void;
  onLoad?: (metrics: any) => void;
  [key: string]: any;
}

export const MultimediaIntegration: React.FC<MultimediaIntegrationProps> = ({
  component: componentName,
  fallback: FallbackComponent,
  featureFlag,
  enableErrorBoundary = true,
  enablePerformanceTracking = true,
  onError,
  onLoad,
  ...props
}) => {
  // const { isEnabled, resolveComponent, getPerformanceMetrics } = useMultimediaFeatures();
  const [retryCount, setRetryCount] = React.useState(0);
  
  // Temporary implementation until hooks are working
  const isEnabled = (flag: string) => true;
  const resolveComponent = (name: string) => {
    // Simple component resolution for now
    if (name === 'ProfilePictureUpload') return ProfilePictureUpload;
    if (name === 'FileUpload') return FileUpload;
    return null;
  };

  // Initialize components registry
  React.useEffect(() => {
    registerComponents();
  }, []);

  // Check feature flag if provided
  const isFeatureEnabled = featureFlag ? isEnabled(featureFlag) : true;
  
  if (!isFeatureEnabled && FallbackComponent) {
    return <FallbackComponent {...props} />;
  }

  // Resolve component through smart resolver
  const ResolvedComponent = resolveComponent(componentName);
  
  if (!ResolvedComponent) {
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return (
      <MultimediaErrorFallback
        componentName={componentName}
        error={new Error(`Component "${componentName}" not found`)}
        onRetry={() => setRetryCount(prev => prev + 1)}
      />
    );
  }

  // Wrap with integration utilities if needed
  const WrappedComponent = React.useMemo(() => {
    if (enableErrorBoundary || enablePerformanceTracking) {
      return withIntegrationWrapper(
        ResolvedComponent,
        componentName,
        {
          enableErrorBoundary,
          enablePerformanceTracking,
          fallbackComponent: FallbackComponent,
          onError,
          onLoad
        }
      );
    }
    return ResolvedComponent;
  }, [ResolvedComponent, componentName, enableErrorBoundary, enablePerformanceTracking, FallbackComponent, onError, onLoad]);

  return (
    <Suspense 
      key={`${componentName}-${retryCount}`}
      fallback={<MultimediaLoadingFallback componentName={componentName} />}
    >
      <WrappedComponent {...props} />
    </Suspense>
  );
};

// Maintain backward compatibility
export const MultimediaWrapper = MultimediaIntegration;

// ============================================================================
// ENHANCED CONVENIENCE COMPONENT WRAPPERS
// ============================================================================

interface ComponentWrapperProps {
  fallback?: React.ComponentType<any>;
  enableErrorBoundary?: boolean;
  enablePerformanceTracking?: boolean;
  onError?: (error: Error) => void;
  onLoad?: (metrics: any) => void;
  [key: string]: any;
}

// Enhanced component wrappers with feature flags and error handling
export const MultimediaProfilePictureUpload: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="ProfilePictureUpload" 
    featureFlag="multimedia.profile-picture-upload"
    {...props} 
  />
);

export const MultimediaFileUpload: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="FileUpload" 
    featureFlag="multimedia.file-upload"
    {...props} 
  />
);

export const MultimediaAIPodcastPlayer: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="AIPodcastPlayer" 
    featureFlag="multimedia.ai-podcast-player"
    {...props} 
  />
);

export const MultimediaPodcastPlayer: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="PodcastPlayer" 
    featureFlag="multimedia.podcast-player"
    {...props} 
  />
);

export const MultimediaPortfolioGallery: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="PortfolioGallery" 
    featureFlag="multimedia.portfolio-gallery"
    {...props} 
  />
);

export const MultimediaPodcastGeneration: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="PodcastGeneration" 
    featureFlag="multimedia.podcast-generation"
    {...props} 
  />
);

export const MultimediaVideoIntroduction: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="VideoIntroduction" 
    featureFlag="multimedia.video-introduction"
    {...props} 
  />
);

export const MultimediaVideoAnalyticsDashboard: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="VideoAnalyticsDashboard" 
    featureFlag="multimedia.video-analytics"
    {...props} 
  />
);

export const MultimediaTestimonialsCarousel: React.FC<ComponentWrapperProps> = (props) => (
  <MultimediaIntegration 
    component="TestimonialsCarousel" 
    featureFlag="multimedia.testimonials-carousel"
    {...props} 
  />
);

// ============================================================================
// COMPONENT REGISTRY EXPORTS
// ============================================================================

export { componentResolver, ComponentResolver } from './ComponentResolver';
export { featureRegistry, FeatureRegistry } from './FeatureRegistry';
export * from './IntegrationUtils';
export * from '../hooks/useMultimediaFeatures';

// ============================================================================
// ENHANCED PROVIDER INTEGRATION
// ============================================================================

// Re-export enhanced provider from providers directory
export { 
  MultimediaProvider,
  MultimediaContext,
  useMultimediaProvider as useMultimedia,
  useMultimediaFeature,
  useMultimediaComponent,
  useMultimediaMetrics
} from '../providers/MultimediaProvider';

// Legacy context for backward compatibility
export const MultimediaLegacyContext = React.createContext<{
  featureFlags: MultimediaFeatureFlags;
  updateFeatureFlags: (flags: Partial<MultimediaFeatureFlags>) => void;
}>({
  featureFlags: DEFAULT_FEATURE_FLAGS,
  updateFeatureFlags: () => {},
});

/**
 * Legacy hook for backward compatibility
 */
export const useMultimediaLegacy = () => {
  const context = React.useContext(MultimediaLegacyContext);
  if (!context) {
    // Try new provider first
    try {
      const { features } = useMultimediaProvider();
      return {
        featureFlags: DEFAULT_FEATURE_FLAGS,
        updateFeatureFlags: () => {}
      };
    } catch {
      throw new Error('useMultimedia must be used within a MultimediaProvider');
    }
  }
  return context;
};