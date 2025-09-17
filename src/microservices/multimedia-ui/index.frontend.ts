// @ts-ignore
/**
 * CVPlus Multimedia Module - Frontend Complete Export
 * 
 * This file provides complete frontend exports including upload components,
 * interactive features, and comprehensive multimedia functionality.
 * 
 * @author Gil Klainert
 * @version 2.1.0 (includes Phase 2D upload components)
 * @license PROPRIETARY
  */

// ============================================================================
// UPLOAD & FILE MANAGEMENT COMPONENTS (Phase 2D - NEW)
// ============================================================================

// Primary Upload Components
export {
  FileUpload,
  ProfilePictureUpload,
  MediaUploadManager,
  UploadProgress,
  ImageCropper,
  FileValidator
} from './frontend/components/upload';

// Upload Services
export { ImageUploadService } from './frontend/services/imageUploadService';

// Upload Types
export type {
  UploadProgressItem,
  ValidationRule,
  ValidationResult,
  FileValidationReport
} from './frontend/components/upload';

// Validation Utilities
export {
  validateFile,
  validateFiles,
  validateImageFile,
  validateImageDimensions,
  validateDocumentFile,
  validateVideoFile,
  validateFilename
} from './frontend/components/utilities/validation';

// Upload Component Aliases for Easy Integration
export {
  FileUpload as MultimediaFileUpload,
  ProfilePictureUpload as MultimediaProfilePictureUpload,
  MediaUploadManager as MultimediaUploadManager,
  UploadProgress as MultimediaUploadProgress,
  ImageCropper as MultimediaImageCropper,
  FileValidator as MultimediaFileValidator
} from './frontend/components/upload';

/**
 * CVPlus Multimedia Module - Frontend Components Export
 * 
 * This file provides frontend React component exports from the multimedia submodule
 * for integration with the main CVPlus frontend application.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
  */

// ============================================================================
// FRONTEND INTEGRATION - STANDALONE VERSION (WORKING)
// ============================================================================

// Standalone integration layer (zero dependencies, working version)
export * from './frontend/standalone-index';

// ============================================================================
// ADVANCED INTEGRATION LAYER (Future)
// ============================================================================

// Note: Advanced integration components are under development
// Uncomment when dependencies are resolved:
// export * from './frontend/integration/MultimediaIntegration';
// export * from './frontend/integration/ComponentResolver';
// export * from './frontend/integration/FeatureRegistry';
// export * from './frontend/integration/IntegrationUtils';
// export * from './frontend/providers/MultimediaProvider';
// export * from './frontend/hooks/useMultimediaFeatures';

// ============================================================================
// DIRECT COMPONENT EXPORTS (When Available)
// ============================================================================

// Note: Uncomment when component dependencies are resolved:
// export { ProfilePictureUpload } from './frontend/components/utilities/ProfilePictureUpload';
// export { FileUpload } from './frontend/components/utilities/FileUpload';

// Component Wrappers (with feature flags)
export {
  MultimediaProfilePictureUpload,
  MultimediaFileUpload,
  MultimediaAIPodcastPlayer,
  MultimediaPodcastPlayer,
  MultimediaPortfolioGallery,
  MultimediaPodcastGeneration,
  MultimediaVideoIntroduction,
  MultimediaVideoAnalyticsDashboard,
  MultimediaTestimonialsCarousel,
  MultimediaProvider,
  MultimediaContext,
  useMultimedia
} from './frontend/integration/MultimediaIntegration';

// ============================================================================
// EXISTING COMPONENTS (Re-exports for backward compatibility)
// ============================================================================

// Players
export { AIPodcastPlayer } from './components/players/AIPodcastPlayer';
export { PodcastPlayer } from './components/players/PodcastPlayer';

// Gallery
export { PortfolioGallery } from './components/gallery/PortfolioGallery';

// Generation
export { PodcastGeneration } from './components/generation/PodcastGeneration';
export { VideoIntroduction } from './components/generation/VideoIntroduction';

// Media
export { TestimonialsCarousel } from './components/media/TestimonialsCarousel';

// Video
export { VideoAnalyticsDashboard } from './frontend/components/video/VideoAnalyticsDashboard';

// ============================================================================
// FRONTEND TYPES
// ============================================================================
export type * from './frontend/types';

// ============================================================================
// SERVICES (Frontend-specific)
// ============================================================================
export { MediaService } from './services/frontend/MediaService';

// ============================================================================
// MULTIMEDIA CONSTANTS & CONFIG
// ============================================================================
export { MultimediaConfig } from './config/MultimediaConfig';
export * from './constants';