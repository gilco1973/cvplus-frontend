// @ts-ignore
/**
 * Core Components for Multimedia Module
 * 
 * This module exports core multimedia components that provide fundamental
 * media handling capabilities and basic user interactions.
  */

// Core wrapper and error components
export { FeatureWrapper } from './FeatureWrapper';
export { ErrorBoundary } from './ErrorBoundary';

// Core Media Processing Components
export * from './processing';

// Basic Media Display Components  
export * from './display';

// Media Player Components
export * from './players';

// Type exports for core components
export type {
  MediaProcessingProps,
  MediaDisplayProps,
  PlayerProps,
  MediaConfig
} from './types';