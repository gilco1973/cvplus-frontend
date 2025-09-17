/**
 * CVPlus Multimedia Standalone Integration Layer
 * 
 * Completely standalone integration for Phase 1.5 with zero external dependencies
 * Provides a bridge for parent project to load multimedia components safely
 * 
 * @author Gil Klainert  
 * @version 1.0.0
 * @license PROPRIETARY
 */

import React, { Suspense } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface StandaloneIntegrationProps {
  component: string;
  fallback?: React.ComponentType<{ error?: string }>;
  [key: string]: any;
}

interface ComponentInfo {
  name: string;
  loader: () => Promise<React.ComponentType<any>>;
  fallback?: React.ComponentType<any>;
}

// ============================================================================
// LOADING STATES
// ============================================================================

const DefaultLoadingComponent: React.FC<{ componentName?: string }> = ({ componentName }) => (
  React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      color: '#6B7280',
      fontSize: '14px'
    }
  },
    React.createElement('div', {
      style: {
        width: '20px',
        height: '20px',
        border: '2px solid #E5E7EB',
        borderTop: '2px solid #3B82F6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '8px'
      }
    }),
    `Loading ${componentName || 'component'}...`
  )
);

const DefaultErrorComponent: React.FC<{ componentName: string; error?: string }> = ({ componentName, error }) => (
  React.createElement('div', {
    style: {
      padding: '16px',
      border: '2px solid #FCA5A5',
      borderRadius: '8px',
      backgroundColor: '#FEF2F2',
      color: '#DC2626'
    }
  },
    React.createElement('h3', {
      style: { margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }
    }, `Failed to load ${componentName}`),
    React.createElement('p', {
      style: { margin: '0', fontSize: '14px' }
    }, error || 'Component could not be loaded. Please try again later.')
  )
);

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

class ComponentRegistry {
  private components: Map<string, ComponentInfo> = new Map();
  private cache: Map<string, React.ComponentType<any>> = new Map();
  
  getComponentNames(): string[] {
    return Array.from(this.components.keys());
  }

  register(info: ComponentInfo): void {
    this.components.set(info.name, info);
  }

  async load(name: string): Promise<React.ComponentType<any> | null> {
    // Check cache first
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    const info = this.components.get(name);
    if (!info) {
      return null;
    }

    try {
      const component = await info.loader();
      this.cache.set(name, component);
      return component;
    } catch (error) {
      console.error(`Failed to load component ${name}:`, error);
      return null;
    }
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  getFallback(name: string): React.ComponentType<any> | null {
    const info = this.components.get(name);
    return info?.fallback || null;
  }
}

const registry = new ComponentRegistry();

// ============================================================================
// COMPONENT LOADER
// ============================================================================

const ComponentLoader: React.FC<{ name: string; props: any; fallback?: React.ComponentType<any> }> = ({
  name,
  props,
  fallback
}) => {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const component = await registry.load(name);
        
        if (mounted) {
          if (component) {
            setComponent(() => component);
          } else {
            setError('Component not found or failed to load');
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [name]);

  if (loading) {
    return React.createElement(DefaultLoadingComponent, { componentName: name });
  }

  if (error || !Component) {
    const FallbackComponent = fallback || registry.getFallback(name);
    if (FallbackComponent) {
      return React.createElement(FallbackComponent, { error, ...props });
    }
    return React.createElement(DefaultErrorComponent, { componentName: name, error: error || undefined });
  }

  return React.createElement(Component, props);
};

// ============================================================================
// MAIN INTEGRATION COMPONENT
// ============================================================================

export const StandaloneMultimediaIntegration: React.FC<StandaloneIntegrationProps> = ({
  component,
  fallback,
  ...props
}) => {
  if (!registry.has(component)) {
    if (fallback) {
      return React.createElement(fallback, { error: 'Component not registered', ...props });
    }
    return React.createElement(DefaultErrorComponent, {
      componentName: component,
      error: 'Component not registered. Please register the component first.'
    });
  }

  return React.createElement(Suspense, {
    fallback: React.createElement(DefaultLoadingComponent, { componentName: component })
  }, React.createElement(ComponentLoader, {
    name: component,
    props,
    fallback
  }));
};

// ============================================================================
// REGISTRATION UTILITIES
// ============================================================================

/**
 * Register a multimedia component for lazy loading
 */
export const registerMultimediaComponent = (name: string, loader: () => Promise<React.ComponentType<any>>, fallback?: React.ComponentType<any>) => {
  registry.register({ name, loader, fallback });
};

/**
 * Initialize multimedia components with standard loaders
 * Uses string-based dynamic imports to avoid compile-time resolution
 */
export const initializeMultimediaComponents = () => {
  // Register ProfilePictureUpload if available
  registerMultimediaComponent(
    'ProfilePictureUpload',
    async () => {
      try {
        // String-based dynamic import to avoid TypeScript analysis
        const componentPath = '../components/utilities/' + 'ProfilePictureUpload';
        const module = await import(componentPath);
        return module.ProfilePictureUpload || module.default;
      } catch (error) {
        console.warn('ProfilePictureUpload component not available:', error);
        throw new Error('ProfilePictureUpload component not available');
      }
    }
  );

  // Register FileUpload if available
  registerMultimediaComponent(
    'FileUpload',
    async () => {
      try {
        // String-based dynamic import to avoid TypeScript analysis
        const componentPath = '../components/utilities/' + 'FileUpload';
        const module = await import(componentPath);
        return module.FileUpload || module.default;
      } catch (error) {
        console.warn('FileUpload component not available:', error);
        throw new Error('FileUpload component not available');
      }
    }
  );
};

/**
 * Register a component with a custom path
 */
export const registerComponentFromPath = (
  name: string,
  path: string,
  exportName: string = 'default'
) => {
  registerMultimediaComponent(
    name,
    async () => {
      try {
        const module = await import(path);
        const component = exportName === 'default' ? module.default : module[exportName];
        if (!component) {
          throw new Error(`Export ${exportName} not found in ${path}`);
        }
        return component;
      } catch (error) {
        console.warn(`Component ${name} not available from ${path}:`, error);
        throw new Error(`Component ${name} not available`);
      }
    }
  );
};

// ============================================================================
// CONVENIENCE COMPONENTS
// ============================================================================

export const StandaloneProfilePictureUpload: React.FC<any> = (props) => {
  React.useEffect(() => {
    if (!registry.has('ProfilePictureUpload')) {
      initializeMultimediaComponents();
    }
  }, []);

  return React.createElement(StandaloneMultimediaIntegration, {
    component: 'ProfilePictureUpload',
    ...props
  });
};

export const StandaloneFileUpload: React.FC<any> = (props) => {
  React.useEffect(() => {
    if (!registry.has('FileUpload')) {
      initializeMultimediaComponents();
    }
  }, []);

  return React.createElement(StandaloneMultimediaIntegration, {
    component: 'FileUpload',
    ...props
  });
};

// ============================================================================
// UTILITIES & VERSION INFO
// ============================================================================

/**
 * Check if a component is registered and available
 */
export const isComponentAvailable = (name: string): boolean => {
  return registry.has(name);
};

/**
 * Get list of registered components
 */
export const getRegisteredComponents = (): string[] => {
  return registry.getComponentNames();
};

export const STANDALONE_INTEGRATION_VERSION = '1.0.0';

// ============================================================================
// CSS INJECTION FOR LOADING ANIMATION
// ============================================================================

// Inject keyframes for loading animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// ============================================================================
// USAGE DOCUMENTATION
// ============================================================================

/*
Usage in parent CVPlus project:

1. Import the integration:
   import { 
     StandaloneMultimediaIntegration,
     StandaloneProfilePictureUpload,
     registerMultimediaComponent,
     initializeMultimediaComponents
   } from '@cvplus/multimedia/frontend';

2. Initialize components (optional - done automatically):
   initializeMultimediaComponents();

3. Use convenience components:
   <StandaloneProfilePictureUpload
     currentImageUrl={user.profileImage}
     onImageUpdate={(url, path) => updateProfile({ image: url })}
     userId={user.id}
     size="large"
   />

4. Use generic integration:
   <StandaloneMultimediaIntegration
     component="FileUpload"
     onFileSelect={handleFileUpload}
     isLoading={uploading}
   />

5. Register custom components:
   registerMultimediaComponent(
     'CustomComponent',
     () => import('./MyCustomComponent').then(m => m.CustomComponent)
   );

6. Error handling is built-in with graceful fallbacks.
*/