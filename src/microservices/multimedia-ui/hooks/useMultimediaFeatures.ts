// @ts-ignore
/**
 * CVPlus Multimedia Features Hook
 * 
 * React hook for managing multimedia features and integration state
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
  */

import React from 'react';
import { featureRegistry, FeatureConfig } from '../integration/FeatureRegistry';
import { componentResolver } from '../integration/ComponentResolver';
import { performanceTracker, integrationState } from '../integration/IntegrationUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MultimediaFeatureState {
  isEnabled: (featureName: string) => boolean;
  getConfig: (featureName: string) => FeatureConfig | null;
  updateFeature: (featureName: string, updates: Partial<FeatureConfig>) => void;
  resolveComponent: (componentName: string) => React.ComponentType<any> | null;
  getPerformanceMetrics: (componentName: string) => any;
}

interface UseMultimediaFeaturesOptions {
  namespace?: string;
  autoSubscribe?: boolean;
  enableMetrics?: boolean;
}

// ============================================================================
// MULTIMEDIA FEATURES HOOK
// ============================================================================

export function useMultimediaFeatures(
  options: UseMultimediaFeaturesOptions = {}
): MultimediaFeatureState {
  const {
    namespace = 'multimedia',
    autoSubscribe = true,
    enableMetrics = true
  } = options;

  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  // Subscribe to feature changes
  React.useEffect(() => {
    if (!autoSubscribe) return;

    const unsubscribers: (() => void)[] = [];
    const features = featureRegistry.getNamespaceFeatures(namespace);

    Object.keys(features).forEach(featureName => {
      const fullName = `${namespace}.${featureName}`;
      const unsubscribe = featureRegistry.subscribe(fullName, () => {
        forceUpdate();
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [namespace, autoSubscribe]);

  const isEnabled = React.useCallback((featureName: string) => {
    const fullName = featureName.includes('.') ? featureName : `${namespace}.${featureName}`;
    return featureRegistry.isFeatureEnabled(fullName) && 
           featureRegistry.checkDependencies(fullName);
  }, [namespace]);

  const getConfig = React.useCallback((featureName: string) => {
    const fullName = featureName.includes('.') ? featureName : `${namespace}.${featureName}`;
    return featureRegistry.getFeatureConfig(fullName);
  }, [namespace]);

  const updateFeature = React.useCallback((featureName: string, updates: Partial<FeatureConfig>) => {
    const fullName = featureName.includes('.') ? featureName : `${namespace}.${featureName}`;
    featureRegistry.updateFeature(fullName, updates);
  }, [namespace]);

  const resolveComponent = React.useCallback((componentName: string) => {
    return componentResolver.resolveComponent(componentName);
  }, []);

  const getPerformanceMetrics = React.useCallback((componentName: string) => {
    return enableMetrics ? performanceTracker.getMetrics(componentName) : null;
  }, [enableMetrics]);

  return {
    isEnabled,
    getConfig,
    updateFeature,
    resolveComponent,
    getPerformanceMetrics
  };
}

// ============================================================================
// FEATURE FLAG HOOK
// ============================================================================

export function useFeatureFlag(featureName: string): {
  isEnabled: boolean;
  config: FeatureConfig | null;
  toggle: () => void;
} {
  const { isEnabled, getConfig, updateFeature } = useMultimediaFeatures();
  
  const enabled = isEnabled(featureName);
  const config = getConfig(featureName);

  const toggle = React.useCallback(() => {
    updateFeature(featureName, { enabled: !enabled });
  }, [featureName, enabled, updateFeature]);

  return {
    isEnabled: enabled,
    config,
    toggle
  };
}

// ============================================================================
// COMPONENT LOADING HOOK
// ============================================================================

export function useComponentLoader(componentName: string): {
  Component: React.ComponentType<any> | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [state, setState] = React.useState<{
    Component: React.ComponentType<any> | null;
    isLoading: boolean;
    error: Error | null;
  }>({ Component: null, isLoading: true, error: null });

  React.useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const Component = componentResolver.resolveComponent(componentName);
      setState({ Component, isLoading: false, error: null });
    } catch (error) {
      setState({ 
        Component: null, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Unknown error')
      });
    }
  }, [componentName]);

  return state;
}

// ============================================================================
// INTEGRATION STATE HOOK
// ============================================================================

export function useIntegrationState<T>(key: string, defaultValue?: T): {
  value: T | undefined;
  setValue: (value: T) => void;
  subscribe: (callback: (value: T) => void) => () => void;
} {
  const [value, setValue] = React.useState<T | undefined>(() => 
    integrationState.get<T>(key) || defaultValue
  );

  React.useEffect(() => {
    const unsubscribe = integrationState.subscribe<T>(key, (newValue) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [key]);

  const setIntegrationValue = React.useCallback((newValue: T) => {
    integrationState.set(key, newValue);
  }, [key]);

  const subscribe = React.useCallback((callback: (value: T) => void) => {
    return integrationState.subscribe(key, callback);
  }, [key]);

  return {
    value,
    setValue: setIntegrationValue,
    subscribe
  };
}

// ============================================================================
// PERFORMANCE TRACKING HOOK
// ============================================================================

export function usePerformanceTracking(componentName: string): {
  startTracking: () => void;
  recordLoadTime: (loadTime: number) => void;
  recordError: () => void;
  metrics: any;
} {
  const metrics = performanceTracker.getMetrics(componentName);

  const startTracking = React.useCallback(() => {
    performanceTracker.startTracking(componentName);
  }, [componentName]);

  const recordLoadTime = React.useCallback((loadTime: number) => {
    performanceTracker.recordLoadTime(componentName, loadTime);
  }, [componentName]);

  const recordError = React.useCallback(() => {
    performanceTracker.recordError(componentName);
  }, [componentName]);

  return {
    startTracking,
    recordLoadTime,
    recordError,
    metrics
  };
}

// ============================================================================
// RE-EXPORT MULTIMEDIA PLAYER HOOK
// ============================================================================
export { useMultimediaPlayer } from './useMultimediaPlayer';