/**
 * CVPlus Multimedia Integration Wrappers
 * 
 * Backward compatibility wrappers for multimedia components migrated to submodule
 * Provides seamless integration with feature flags for gradual rollout
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
 */

import React, { Suspense } from 'react';
import { useFeatureRegistry } from '../../utils/featureRegistry';

// ============================================================================
// FEATURE FLAGS
// ============================================================================

const MULTIMEDIA_FEATURE_FLAGS = {
  USE_SUBMODULE_COMPONENTS: 'multimedia.use_submodule_components',
  ENABLE_ADVANCED_FEATURES: 'multimedia.enable_advanced_features',
  ENABLE_DEBUG_MODE: 'multimedia.enable_debug_mode',
} as const;

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const MultimediaComponentLoader: React.FC<{ componentName: string }> = ({ componentName }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading {componentName}...</span>
  </div>
);

// ============================================================================
// LAZY IMPORTS WITH ERROR BOUNDARIES
// ============================================================================

// Submodule component imports (with error boundary)
const loadMultimediaComponent = async (componentName: string) => {
  try {
    const module = await import('@cvplus/multimedia/frontend');
    return module[componentName];
  } catch (error) {
    console.error(`[Multimedia Integration] Failed to load ${componentName}:`, error);
    throw error;
  }
};

// ============================================================================
// WRAPPER COMPONENT FACTORY
// ============================================================================

const createMultimediaWrapper = <T extends object>(
  componentName: string,
  fallbackImport: () => Promise<{ default: React.ComponentType<T> }>
) => {
  return React.forwardRef<any, T>((props, ref) => {
    const { isFeatureEnabled } = useFeatureRegistry();
    
    const useSubmodule = isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.USE_SUBMODULE_COMPONENTS, true);
    const debugMode = isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.ENABLE_DEBUG_MODE, false);

    if (debugMode) {
      console.log(`[Multimedia] Loading ${componentName}, useSubmodule: ${useSubmodule}`);
    }

    if (useSubmodule) {
      // Use submodule component with lazy loading
      const LazyComponent = React.useMemo(() => {
        return React.lazy(async () => {
          try {
            const Component = await loadMultimediaComponent(componentName);
            return { default: Component };
          } catch (error) {
            // Fallback to local component on error
            console.warn(`[Multimedia] Falling back to local component for ${componentName}`);
            return await fallbackImport();
          }
        });
      }, []);

      return (
        <Suspense fallback={<MultimediaComponentLoader componentName={componentName} />}>
          <LazyComponent ref={ref} {...props} />
        </Suspense>
      );
    } else {
      // Use local fallback component
      const LazyFallback = React.useMemo(() => React.lazy(fallbackImport), []);
      
      return (
        <Suspense fallback={<MultimediaComponentLoader componentName={componentName} />}>
          <LazyFallback ref={ref} {...props} />
        </Suspense>
      );
    }
  });
};

// ============================================================================
// WRAPPED COMPONENTS
// ============================================================================

// ProfilePictureUpload wrapper
export const ProfilePictureUpload = createMultimediaWrapper(
  'MultimediaProfilePictureUpload',
  () => import('../ProfilePictureUpload').then(m => ({ default: m.default }))
);

// FileUpload wrapper  
export const FileUpload = createMultimediaWrapper(
  'MultimediaFileUpload',
  () => import('../FileUpload').then(m => ({ default: m.default }))
);

// PodcastPlayer wrapper
export const PodcastPlayer = createMultimediaWrapper(
  'MultimediaPodcastPlayer', 
  () => import('../PodcastPlayer').then(m => ({ default: m.default }))
);

// AIPodcastPlayer wrapper
export const AIPodcastPlayer = createMultimediaWrapper(
  'MultimediaAIPodcastPlayer',
  () => import('../features/AI-Powered/AIPodcastPlayer').then(m => ({ default: m.AIPodcastPlayer }))
);

// PortfolioGallery wrapper
export const PortfolioGallery = createMultimediaWrapper(
  'MultimediaPortfolioGallery',
  () => import('../features/PortfolioGallery').then(m => ({ default: m.PortfolioGallery }))
);

// PodcastGeneration wrapper
export const PodcastGeneration = createMultimediaWrapper(
  'MultimediaPodcastGeneration',
  () => import('../features/PodcastGeneration').then(m => ({ default: m.PodcastGeneration }))
);

// VideoIntroduction wrapper
export const VideoIntroduction = createMultimediaWrapper(
  'MultimediaVideoIntroduction',
  () => import('../features/VideoIntroduction').then(m => ({ default: m.VideoIntroduction }))
);

// VideoAnalyticsDashboard wrapper
export const VideoAnalyticsDashboard = createMultimediaWrapper(
  'MultimediaVideoAnalyticsDashboard',
  () => import('../features/video/VideoAnalyticsDashboard').then(m => ({ default: m.VideoAnalyticsDashboard }))
);

// TestimonialsCarousel wrapper
export const TestimonialsCarousel = createMultimediaWrapper(
  'MultimediaTestimonialsCarousel',
  () => import('../features/Media/TestimonialsCarousel').then(m => ({ default: m.TestimonialsCarousel }))
);

// ============================================================================
// MULTIMEDIA PROVIDER WRAPPER
// ============================================================================

export const MultimediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isFeatureEnabled } = useFeatureRegistry();
  const useSubmodule = isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.USE_SUBMODULE_COMPONENTS, true);

  if (useSubmodule) {
    // Use submodule provider if available
    const LazyProvider = React.useMemo(() => React.lazy(async () => {
      try {
        const { MultimediaProvider } = await import('@cvplus/multimedia/frontend');
        return { default: MultimediaProvider };
      } catch {
        // Fallback to basic wrapper
        return { default: ({ children }: { children: React.ReactNode }) => <>{children}</> };
      }
    }), []);

    return (
      <Suspense fallback={<div>Loading multimedia provider...</div>}>
        <LazyProvider>{children}</LazyProvider>
      </Suspense>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

export const useMultimediaDebug = () => {
  const { isFeatureEnabled } = useFeatureRegistry();
  
  return {
    useSubmodule: isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.USE_SUBMODULE_COMPONENTS, true),
    debugMode: isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.ENABLE_DEBUG_MODE, false),
    advancedFeatures: isFeatureEnabled(MULTIMEDIA_FEATURE_FLAGS.ENABLE_ADVANCED_FEATURES, true),
    featureFlags: MULTIMEDIA_FEATURE_FLAGS,
  };
};