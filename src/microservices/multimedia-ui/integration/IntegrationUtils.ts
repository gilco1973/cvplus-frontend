// @ts-ignore
/**
 * CVPlus Multimedia Integration Utilities
 * 
 * Provides utility functions for component integration, error handling, and performance monitoring
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
  */

import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  renderTime: number;
  errorCount: number;
  successCount: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface WrapperOptions {
  enablePerformanceTracking?: boolean;
  enableErrorBoundary?: boolean;
  fallbackComponent?: React.ComponentType<any>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onLoad?: (metrics: PerformanceMetrics) => void;
}

// ============================================================================
// PERFORMANCE TRACKING
// ============================================================================

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();

  startTracking(componentName: string): void {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, {
        componentName,
        loadTime: 0,
        renderTime: 0,
        errorCount: 0,
        successCount: 0
      });
    }
  }

  recordLoadTime(componentName: string, loadTime: number): void {
    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.loadTime = loadTime;
      metrics.successCount++;
    }
  }

  recordError(componentName: string): void {
    const metrics = this.metrics.get(componentName);
    if (metrics) {
      metrics.errorCount++;
    }
  }

  getMetrics(componentName: string): PerformanceMetrics | null {
    return this.metrics.get(componentName) || null;
  }

  getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceTracker = new PerformanceTracker();

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface MultimediaErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<any>;
  componentName: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class MultimediaErrorBoundary extends React.Component<MultimediaErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: MultimediaErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[MultimediaErrorBoundary] Error in ${this.props.componentName}:`, error, errorInfo);
    
    // Track error in performance metrics
    performanceTracker.recordError(this.props.componentName);
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallbackComponent;
      
      if (FallbackComponent) {
        return React.createElement(FallbackComponent, { error: this.state.error });
      }
      
      return React.createElement('div', { className: 'p-4 border-2 border-red-200 bg-red-50 rounded-lg' },
        React.createElement('h3', { className: 'text-red-800 font-medium mb-2' },
          `Component Error: ${this.props.componentName}`
        ),
        React.createElement('p', { className: 'text-red-600 text-sm' },
          this.state.error?.message || 'An unexpected error occurred'
        ),
        React.createElement('button', {
          className: 'mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700',
          onClick: () => this.setState({ hasError: false, error: undefined, errorInfo: undefined })
        }, 'Retry')
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// COMPONENT WRAPPER UTILITIES
// ============================================================================

/**
 * Wraps a component with error boundary and performance tracking
  */
export function withIntegrationWrapper<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string,
  options: WrapperOptions = {}
): React.ComponentType<P> {
  const WrappedComponent: React.ComponentType<P> = (props) => {
    const startTime = React.useRef<number>();
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
      if (options.enablePerformanceTracking) {
        startTime.current = performance.now();
        performanceTracker.startTracking(componentName);
      }
    }, []);

    React.useEffect(() => {
      if (options.enablePerformanceTracking && startTime.current) {
        const loadTime = performance.now() - startTime.current;
        performanceTracker.recordLoadTime(componentName, loadTime);
        
        const metrics = performanceTracker.getMetrics(componentName);
        if (metrics) {
          options.onLoad?.(metrics);
        }
      }
      setIsLoading(false);
    }, []);

    const WrappedWithBoundary = options.enableErrorBoundary 
      ? React.createElement(MultimediaErrorBoundary, {
          componentName,
          fallbackComponent: options.fallbackComponent,
          onError: options.onError,
          children: React.createElement(Component, props)
        })
      : React.createElement(Component, props);

    if (isLoading && options.enablePerformanceTracking) {
      return React.createElement('div', { className: 'flex items-center justify-center p-4' },
        React.createElement('div', { className: 'animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600' }),
        React.createElement('span', { className: 'ml-2 text-gray-600' }, `Loading ${componentName}...`)
      );
    }

    return WrappedWithBoundary;
  };

  WrappedComponent.displayName = `withIntegrationWrapper(${componentName})`;
  return WrappedComponent;
}

// ============================================================================
// TYPE SAFETY HELPERS
// ============================================================================

/**
 * Type-safe props validator
  */
export function validateProps<T extends Record<string, any>>(
  props: T,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'function' | 'required'>
): boolean {
  try {
    for (const [key, expectedType] of Object.entries(schema)) {
      const value = props[key];
      
      if (expectedType === 'required' && (value === undefined || value === null)) {
        console.warn(`[validateProps] Required prop "${key}" is missing`);
        return false;
      }
      
      if (value !== undefined && value !== null) {
        const actualType = typeof value;
        if (expectedType !== 'required' && actualType !== expectedType) {
          console.warn(`[validateProps] Prop "${key}" expected ${expectedType}, got ${actualType}`);
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('[validateProps] Validation error:', error);
    return false;
  }
}

// ============================================================================
// COMPONENT LOADING UTILITIES
// ============================================================================

/**
 * Creates a lazy-loaded component with error handling
  */
export function createLazyComponent<P extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  componentName: string,
  fallback?: React.ComponentType<any>
): React.LazyExoticComponent<React.ComponentType<P>> {
  const LazyComponent = React.lazy(() => 
    importFn().catch((error) => {
      console.error(`[createLazyComponent] Failed to load ${componentName}:`, error);
      
      // Return fallback component if available
      if (fallback) {
        return { default: fallback as React.ComponentType<P> };
      }
      
      // Return error component
      const ErrorComponent: React.ComponentType<P> = () => React.createElement('div', 
        { className: 'p-4 border-2 border-red-200 bg-red-50 rounded-lg' },
        React.createElement('p', { className: 'text-red-600' }, `Failed to load ${componentName}`)
      );
      
      return { default: ErrorComponent };
    })
  );

  return LazyComponent;
}

// ============================================================================
// INTEGRATION STATE MANAGER
// ============================================================================

export class IntegrationStateManager {
  private state: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  set<T>(key: string, value: T): void {
    this.state.set(key, value);
    this.notifyListeners(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.state.get(key);
  }

  subscribe<T>(key: string, callback: (value: T) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);
    
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  private notifyListeners(key: string, value: any): void {
    this.listeners.get(key)?.forEach(callback => {
      try {
        callback(value);
      } catch (error) {
        console.error(`[IntegrationStateManager] Error in listener for ${key}:`, error);
      }
    });
  }
}

export const integrationState = new IntegrationStateManager();