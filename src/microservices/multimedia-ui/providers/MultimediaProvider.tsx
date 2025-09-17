/**
 * CVPlus Multimedia Provider
 * 
 * Context provider for multimedia features and integration state management
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
 */

import React from 'react';
import { 
  featureRegistry, 
  FeatureConfig, 
  DEFAULT_MULTIMEDIA_FEATURES,
  MultimediaFeatures 
} from '../integration/FeatureRegistry';
import { componentResolver, ComponentResolver } from '../integration/ComponentResolver';
import { performanceTracker, integrationState } from '../integration/IntegrationUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MultimediaContextValue {
  // Feature management
  isFeatureEnabled: (featureName: string) => boolean;
  getFeatureConfig: (featureName: string) => FeatureConfig | null;
  updateFeature: (featureName: string, updates: Partial<FeatureConfig>) => void;
  
  // Component resolution
  resolveComponent: (componentName: string) => React.ComponentType<any> | null;
  registerComponent: (name: string, component: React.ComponentType<any>) => void;
  
  // Performance tracking
  getMetrics: (componentName: string) => any;
  clearMetrics: () => void;
  
  // Integration state
  getIntegrationState: (key: string) => any;
  setIntegrationState: (key: string, value: any) => void;
  
  // Configuration
  features: MultimediaFeatures;
  updateFeatures: (updates: Partial<MultimediaFeatures>) => void;
}

interface MultimediaProviderProps {
  children: React.ReactNode;
  initialFeatures?: Partial<MultimediaFeatures>;
  enablePerformanceTracking?: boolean;
  enableDebugMode?: boolean;
  componentResolver?: ComponentResolver;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const MultimediaContext = React.createContext<MultimediaContextValue | null>(null);

// ============================================================================
// MULTIMEDIA PROVIDER COMPONENT
// ============================================================================

export const MultimediaProvider: React.FC<MultimediaProviderProps> = ({
  children,
  initialFeatures = {},
  enablePerformanceTracking = true,
  enableDebugMode = false,
  componentResolver: customResolver
}) => {
  // Initialize features state
  const [features, setFeatures] = React.useState<MultimediaFeatures>(() => ({
    ...DEFAULT_MULTIMEDIA_FEATURES,
    ...initialFeatures,
    features: {
      ...DEFAULT_MULTIMEDIA_FEATURES.features,
      ...initialFeatures.features
    }
  }));

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Initialize feature registry on mount
  React.useEffect(() => {
    featureRegistry.registerNamespace(features);
    
    if (enableDebugMode) {
      console.log('[MultimediaProvider] Features initialized:', features);
    }
  }, [features, enableDebugMode]);

  // Subscribe to feature changes for re-renders
  React.useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    
    Object.keys(features.features).forEach(featureName => {
      const fullName = `multimedia.${featureName}`;
      const unsubscribe = featureRegistry.subscribe(fullName, () => {
        if (enableDebugMode) {
          console.log('[MultimediaProvider] Feature changed:', fullName);
        }
        forceUpdate();
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [features.features, enableDebugMode]);

  // Feature management functions
  const isFeatureEnabled = React.useCallback((featureName: string) => {
    const fullName = featureName.includes('.') ? featureName : `multimedia.${featureName}`;
    return featureRegistry.isFeatureEnabled(fullName);
  }, []);

  const getFeatureConfig = React.useCallback((featureName: string) => {
    const fullName = featureName.includes('.') ? featureName : `multimedia.${featureName}`;
    return featureRegistry.getFeatureConfig(fullName);
  }, []);

  const updateFeature = React.useCallback((featureName: string, updates: Partial<FeatureConfig>) => {
    const fullName = featureName.includes('.') ? featureName : `multimedia.${featureName}`;
    featureRegistry.updateFeature(fullName, updates);
    
    // Update local state
    setFeatures(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [featureName.replace('multimedia.', '')]: {
          ...prev.features[featureName.replace('multimedia.', '')],
          ...updates
        }
      }
    }));
    
    if (enableDebugMode) {
      console.log('[MultimediaProvider] Feature updated:', fullName, updates);
    }
  }, [enableDebugMode]);

  // Component resolution functions
  const resolver = customResolver || componentResolver;
  
  const resolveComponent = React.useCallback((componentName: string) => {
    return resolver.resolveComponent(componentName);
  }, [resolver]);

  const registerComponent = React.useCallback((name: string, component: React.ComponentType<any>) => {
    resolver.register(name, component);
    
    if (enableDebugMode) {
      console.log('[MultimediaProvider] Component registered:', name);
    }
  }, [resolver, enableDebugMode]);

  // Performance tracking functions
  const getMetrics = React.useCallback((componentName: string) => {
    return enablePerformanceTracking ? performanceTracker.getMetrics(componentName) : null;
  }, [enablePerformanceTracking]);

  const clearMetrics = React.useCallback(() => {
    if (enablePerformanceTracking) {
      performanceTracker.clear();
    }
  }, [enablePerformanceTracking]);

  // Integration state functions
  const getIntegrationState = React.useCallback((key: string) => {
    return integrationState.get(key);
  }, []);

  const setIntegrationState = React.useCallback((key: string, value: any) => {
    integrationState.set(key, value);
  }, []);

  // Features update function
  const updateFeatures = React.useCallback((updates: Partial<MultimediaFeatures>) => {
    setFeatures(prev => ({
      ...prev,
      ...updates,
      features: {
        ...prev.features,
        ...(updates.features || {})
      }
    }));
  }, []);

  // Context value
  const contextValue: MultimediaContextValue = React.useMemo(() => ({
    isFeatureEnabled,
    getFeatureConfig,
    updateFeature,
    resolveComponent,
    registerComponent,
    getMetrics,
    clearMetrics,
    getIntegrationState,
    setIntegrationState,
    features,
    updateFeatures
  }), [
    isFeatureEnabled,
    getFeatureConfig,
    updateFeature,
    resolveComponent,
    registerComponent,
    getMetrics,
    clearMetrics,
    getIntegrationState,
    setIntegrationState,
    features,
    updateFeatures
  ]);

  return (
    <MultimediaContext.Provider value={contextValue}>
      {children}
    </MultimediaContext.Provider>
  );
};

// ============================================================================
// HOOK FOR USING MULTIMEDIA CONTEXT
// ============================================================================

export const useMultimediaProvider = (): MultimediaContextValue => {
  const context = React.useContext(MultimediaContext);
  
  if (!context) {
    throw new Error(
      'useMultimediaProvider must be used within a MultimediaProvider. ' +
      'Make sure your component is wrapped in <MultimediaProvider>.'
    );
  }
  
  return context;
};

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook for checking feature flags
 */
export const useMultimediaFeature = (featureName: string) => {
  const { isFeatureEnabled, getFeatureConfig, updateFeature } = useMultimediaProvider();
  
  return React.useMemo(() => ({
    isEnabled: isFeatureEnabled(featureName),
    config: getFeatureConfig(featureName),
    toggle: () => {
      const currentConfig = getFeatureConfig(featureName);
      updateFeature(featureName, { enabled: !currentConfig?.enabled });
    }
  }), [featureName, isFeatureEnabled, getFeatureConfig, updateFeature]);
};

/**
 * Hook for component resolution
 */
export const useMultimediaComponent = (componentName: string) => {
  const { resolveComponent, registerComponent } = useMultimediaProvider();
  
  return React.useMemo(() => ({
    Component: resolveComponent(componentName),
    register: (component: React.ComponentType<any>) => registerComponent(componentName, component)
  }), [componentName, resolveComponent, registerComponent]);
};

/**
 * Hook for performance metrics
 */
export const useMultimediaMetrics = (componentName?: string) => {
  const { getMetrics, clearMetrics } = useMultimediaProvider();
  
  return React.useMemo(() => ({
    getMetrics: componentName ? () => getMetrics(componentName) : getMetrics,
    clearMetrics
  }), [componentName, getMetrics, clearMetrics]);
};

// ============================================================================
// EXPORT CONTEXT FOR DIRECT USE
// ============================================================================

export { MultimediaContext };