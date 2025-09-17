// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// Components
export { PublicProfileCreator } from './components/PublicProfileCreator';
export { TemplateSelector } from './components/TemplateSelector';
export { ProfileEditor } from './components/ProfileEditor';
export { PreviewPanel } from './components/PreviewPanel';

// Hooks
export { usePublicProfileCreator } from './hooks/usePublicProfileCreator';
export { useTemplateSelector } from './hooks/useTemplateSelector';
export { usePreviewGenerator } from './hooks/usePreviewGenerator';
export { useProfileService, useProfile, useProfileAnalytics } from './hooks/useProfileService';

// Types
export type {
  TemplateType,
  TemplateConfiguration,
  BrandingSettings,
  PreviewConfiguration,
  ExportOptions,
  PublicProfileCreatorState,
  ValidationError,
  PublicProfileCreatorProps,
  SectionType,
  SectionConfiguration,
  ContentValidationRule,
  TemplateCustomization,
} from './types/creator.types';

export type {
  TemplateTheme,
  TemplateLayout,
  TemplateComponent,
  TemplateDefinition,
  TemplateRenderContext,
  TemplateSection,
  TemplateValidationResult,
  TemplateExportFormat,
} from './types/template.types';

export type {
  ExportConfiguration,
  ExportFormat,
  ExportQuality,
  ExportFormatOptions,
  PublicUrlOptions,
  PdfExportOptions,
  EmbedWidgetOptions,
  QrCodeOptions,
  SocialImageOptions,
  JsonExportOptions,
  ExportPrivacySettings,
  ExportResult,
  ExportMetadata,
  ExportAnalytics,
  ExportTemplate,
} from './types/export.types';
export type {
  ProfileTemplate,
  TemplateCustomization,
  ProfileOptions,
  ProfileUpdate,
  DateRange,
  SocialPlatform,
  QROptions,
  QRCodeResult,
  EmbedOptions,
  PrivacySettings,
  AccessControl,
  Permission,
  DomainMapping,
  DomainValidation,
  VersionData,
  ProfileVersion,
  ViewData,
  EngagementData,
  ProfileAnalytics
} from './types/service.types';

// Services
export { ProfileService, profileService } from './services/ProfileService';

// Utils
export { TemplateValidator } from './utils/templateValidation';
export { ContentSanitizer } from './utils/contentSanitization';
export { UrlGenerator } from './utils/urlGeneration';