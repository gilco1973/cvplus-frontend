/**
 * CVPlus Multimedia Simple Integration Layer
 * 
 * Simplified integration for Phase 1.5 with minimal dependencies
 * 
 * @author Gil Klainert  
 * @version 1.0.0
 * @license PROPRIETARY
 */

import React, { lazy, Suspense } from 'react';

// ============================================================================
// SIMPLE COMPONENT LOADER
// ============================================================================

interface SimpleIntegrationProps {
  component: string;
  fallback?: React.ComponentType<any>;
  [key: string]: any;
}

// ============================================================================
// LOADING FALLBACK
// ============================================================================

const SimpleLoadingFallback: React.FC<{ componentName?: string }> = ({ componentName }) => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">
      Loading {componentName || 'component'}...
    </span>
  </div>
);

// ============================================================================
// ERROR FALLBACK
// ============================================================================

const SimpleErrorFallback: React.FC<{ 
  componentName: string; 
  error?: string;
}> = ({ componentName, error }) => (
  <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
    <h3 className="text-red-800 font-medium mb-2">
      Failed to load {componentName}
    </h3>
    <p className="text-red-600 text-sm">
      {error || 'Component could not be loaded. Please try again later.'}
    </p>
  </div>
);

// ============================================================================
// SIMPLE INTEGRATION COMPONENT
// ============================================================================

export const SimpleMultimediaIntegration: React.FC<SimpleIntegrationProps> = ({
  component: componentName,
  fallback: FallbackComponent,
  ...props
}) => {
  // Simple component registry - can be expanded as needed
  const getComponent = (name: string) => {
    switch (name) {
      case 'ProfilePictureUpload':
        return lazy(() => 
          import('../components/utilities/ProfilePictureUpload')
            .then(m => ({ default: m.ProfilePictureUpload }))
            .catch(() => ({ 
              default: () => <SimpleErrorFallback componentName={name} error="Component not found" />
            }))
        );
      case 'FileUpload':
        return lazy(() => 
          import('../components/utilities/FileUpload')
            .then(m => ({ default: m.FileUpload }))
            .catch(() => ({ 
              default: () => <SimpleErrorFallback componentName={name} error="Component not found" />
            }))
        );
      default:
        return null;
    }
  };

  const Component = getComponent(componentName);
  
  if (!Component) {
    if (FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    return <SimpleErrorFallback componentName={componentName} error="Component not registered" />;
  }

  return (
    <Suspense fallback={<SimpleLoadingFallback componentName={componentName} />}>
      <Component {...props} />
    </Suspense>
  );
};

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const SimpleProfilePictureUpload: React.FC<any> = (props) => (
  <SimpleMultimediaIntegration component="ProfilePictureUpload" {...props} />
);

export const SimpleFileUpload: React.FC<any> = (props) => (
  <SimpleMultimediaIntegration component="FileUpload" {...props} />
);

// ============================================================================
// VERSION INFO
// ============================================================================

export const SIMPLE_INTEGRATION_VERSION = '1.0.0';

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// In parent project:
import { SimpleMultimediaIntegration, SimpleProfilePictureUpload } from '@cvplus/multimedia/frontend';

// Method 1: Direct usage
<SimpleMultimediaIntegration 
  component="ProfilePictureUpload" 
  currentImageUrl={imageUrl}
  onImageUpdate={handleUpdate}
  userId={userId}
/>

// Method 2: Convenience wrapper
<SimpleProfilePictureUpload
  currentImageUrl={imageUrl}
  onImageUpdate={handleUpdate}
  userId={userId}
/>
*/