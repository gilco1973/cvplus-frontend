/**
 * CV Services Index
 * Centralized exports for all CV-related services
 */

// Core services
export { CVParser } from './CVParser';
export { CVValidator } from './CVValidator';
export { CVAnalyzer } from './CVAnalyzer';
export { CVTransformer } from './CVTransformer';

// Main service orchestrator
export {
  CVServiceCore,
  CVUploadResponse,
  // Legacy compatibility exports
  createJob,
  createDevelopmentJob,
  uploadCV,
  processCV,
  subscribeToJob,
  getJob,
  generateCV,
  getTemplates,
  analyzeCV,
  enhancedAnalyzeCV,
  getRecommendations,
  previewImprovement,
  applyImprovements,
  analyzeATSCompatibility,
  applyATSOptimizations,
  generateATSKeywords,
  updateJobFeatures
} from './CVServiceCore';

// Feature services
export { MediaService } from '../features/MediaService';
export { VisualizationService } from '../features/VisualizationService';
export { IntegrationService } from '../features/IntegrationService';
export { ProfileService } from '../features/ProfileService';

// Types
export type { 
  Job, 
  JobCreateParams, 
  FileUploadParams, 
  CVProcessParams, 
  CVAnalysisParams 
} from '../../types/cv';