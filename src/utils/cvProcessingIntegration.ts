/**
 * CV Processing Module Integration Layer
 * 
 * This integration layer provides a seamless transition from root frontend
 * CV processing components to the @cvplus/processing submodule.
 * 
 * It handles:
 * - Feature flag-controlled rollout
 * - Graceful fallback to legacy components
 * - Error boundary integration
 * - Performance monitoring
 */

import { lazy } from 'react';
import type { ComponentType } from 'react';

// Feature flags for gradual rollout
const CV_PROCESSING_FEATURE_FLAGS = {
  // Core components
  useCVAnalysisResults: process.env.REACT_APP_USE_CV_ANALYSIS_RESULTS_MODULE === 'true',
  useGeneratedCVDisplay: process.env.REACT_APP_USE_GENERATED_CV_DISPLAY_MODULE === 'true',
  useLivePreview: process.env.REACT_APP_USE_LIVE_PREVIEW_MODULE === 'true',
  
  // Preview components
  useCVPreviewModule: process.env.REACT_APP_USE_CV_PREVIEW_MODULE === 'true',
  
  // Comparison components  
  useCVComparisonModule: process.env.REACT_APP_USE_CV_COMPARISON_MODULE === 'true',
  
  // Enhancement components
  useEnhancementModule: process.env.REACT_APP_USE_ENHANCEMENT_MODULE === 'true',
  
  // Editors
  useEditorsModule: process.env.REACT_APP_USE_EDITORS_MODULE === 'true',
} as const;

// Error boundary wrapper for submodule components
const withCVProcessingErrorBoundary = <T extends {}>(
  Component: ComponentType<T>,
  fallbackComponent?: ComponentType<T>
) => {
  return (props: T) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('CV Processing module error:', error);
      if (fallbackComponent) {
        return <fallbackComponent {...props} />;
      }
      return <div>Error loading CV processing component</div>;
    }
  };
};

// Lazy load submodule components
const CVAnalysisResultsModule = lazy(() =>
  import('@cvplus/processing/frontend')
    .then(module => ({ default: module.CVAnalysisResults }))
    .catch(error => {
      console.error('Failed to load CVAnalysisResults from submodule:', error);
      // Fallback to legacy component
      return import('../components/CVAnalysisResults').then(module => ({
        default: module.CVAnalysisResults || (() => <div>CVAnalysisResults not available</div>)
      }));
    })
);

const GeneratedCVDisplayModule = lazy(() =>
  import('@cvplus/processing/frontend')
    .then(module => ({ default: module.GeneratedCVDisplay }))
    .catch(error => {
      console.error('Failed to load GeneratedCVDisplay from submodule:', error);
      return import('../components/GeneratedCVDisplay').then(module => ({
        default: module.GeneratedCVDisplay || (() => <div>GeneratedCVDisplay not available</div>)
      }));
    })
);

const LivePreviewModule = lazy(() =>
  import('@cvplus/processing/frontend')
    .then(module => ({ default: module.LivePreview }))
    .catch(error => {
      console.error('Failed to load LivePreview from submodule:', error);
      return import('../components/LivePreview').then(module => ({
        default: module.LivePreview || (() => <div>LivePreview not available</div>)
      }));
    })
);

const CVComparisonViewModule = lazy(() =>
  import('@cvplus/processing/frontend')
    .then(module => ({ default: module.CVComparisonView }))
    .catch(error => {
      console.error('Failed to load CVComparisonView from submodule:', error);
      return import('../components/cv-comparison/CVComparisonView').then(module => ({
        default: module.CVComparisonView || (() => <div>CVComparisonView not available</div>)
      }));
    })
);

// Integration functions
export const getCVAnalysisResults = () => {
  if (CV_PROCESSING_FEATURE_FLAGS.useCVAnalysisResults) {
    return withCVProcessingErrorBoundary(CVAnalysisResultsModule);
  }
  // Return legacy component
  return lazy(() => import('../components/CVAnalysisResults'));
};

export const getGeneratedCVDisplay = () => {
  if (CV_PROCESSING_FEATURE_FLAGS.useGeneratedCVDisplay) {
    return withCVProcessingErrorBoundary(GeneratedCVDisplayModule);
  }
  return lazy(() => import('../components/GeneratedCVDisplay'));
};

export const getLivePreview = () => {
  if (CV_PROCESSING_FEATURE_FLAGS.useLivePreview) {
    return withCVProcessingErrorBoundary(LivePreviewModule);
  }
  return lazy(() => import('../components/LivePreview'));
};

export const getCVComparisonView = () => {
  if (CV_PROCESSING_FEATURE_FLAGS.useCVComparisonModule) {
    return withCVProcessingErrorBoundary(CVComparisonViewModule);
  }
  return lazy(() => import('../components/cv-comparison/CVComparisonView'));
};

// Integration status checker
export const getCVProcessingIntegrationStatus = () => {
  return {
    flags: CV_PROCESSING_FEATURE_FLAGS,
    moduleAvailable: typeof window !== 'undefined',
    version: '2.0.0',
  };
};

// Performance monitoring for submodule loading
export const monitorCVProcessingPerformance = (componentName: string) => {
  const startTime = performance.now();
  
  return {
    recordLoadTime: () => {
      const loadTime = performance.now() - startTime;
      console.log(`CV Processing ${componentName} loaded in ${loadTime}ms`);
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'cv_processing_component_load', {
          component_name: componentName,
          load_time_ms: Math.round(loadTime),
        });
      }
    }
  };
};