// @ts-ignore
/**
 * Advanced AI Components Index
 * 
 * Exports all AI-powered content optimization and enhancement components
 * for intelligent multimedia content processing and improvement.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

// Content Optimization
export { ContentOptimizer } from './ContentOptimizer';
export type { ContentOptimizerProps } from './ContentOptimizer';

// Re-export for convenience
export {
  ContentOptimizer as AIOptimizer
} from './ContentOptimizer';

/**
 * Advanced AI Components Collection
 * 
 * Comprehensive suite of AI-powered components for content
 * optimization, quality enhancement, and intelligent analysis.
  */
export const AdvancedAIComponents = {
  ContentOptimizer
} as const;

export default AdvancedAIComponents;