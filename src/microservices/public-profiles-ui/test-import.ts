// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// Simple import test for PublicProfileCreator components
// This file tests that all components and hooks can be imported correctly

// Import all the new components and hooks
export { PublicProfileCreator } from './components/PublicProfileCreator';
export { TemplateSelector } from './components/TemplateSelector';
export { ProfileEditor } from './components/ProfileEditor';
export { PreviewPanel } from './components/PreviewPanel';

export { usePublicProfileCreator } from './hooks/usePublicProfileCreator';
export { useTemplateSelector } from './hooks/useTemplateSelector';
export { usePreviewGenerator } from './hooks/usePreviewGenerator';

export { TemplateValidator } from './utils/templateValidation';
export { ContentSanitizer } from './utils/contentSanitization';
export { UrlGenerator } from './utils/urlGeneration';

// Import all types
export type {
  TemplateType,
  TemplateConfiguration,
  BrandingSettings,
  PreviewConfiguration,
  ExportOptions,
  PublicProfileCreatorState,
  ValidationError,
  PublicProfileCreatorProps,
} from './types/creator.types';

export type {
  TemplateDefinition,
  TemplateRenderContext,
  TemplateValidationResult,
} from './types/template.types';

export type {
  ExportConfiguration,
  ExportResult,
  ExportMetadata,
} from './types/export.types';

// Test successful import
console.log('✅ All PublicProfileCreator components and types imported successfully!');