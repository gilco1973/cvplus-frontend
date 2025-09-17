// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/../types/profile.types';

// Template-related types
export type TemplateType =
  | 'professional'
  | 'creative'
  | 'minimal'
  | 'tech'
  | 'executive';

export interface TemplateConfiguration {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  thumbnail: string;
  preview: string;
  features: string[];
  isPremium: boolean;
}

export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-center' | 'top-right';
  customCss?: string;
}

export interface PreviewConfiguration {
  device: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  showGrid: boolean;
  showRulers: boolean;
}

export interface ExportOptions {
  format: 'url' | 'pdf' | 'embed' | 'qr';
  includeAnalytics: boolean;
  customDomain?: string;
  passwordProtected: boolean;
  password?: string;
  expirationDate?: Date;
  allowedDomains?: string[];
}

export interface PublicProfileCreatorState {
  profileData: Partial<PublicProfileData>;
  selectedTemplate: TemplateConfiguration | null;
  brandingSettings: BrandingSettings;
  previewConfig: PreviewConfiguration;
  isEditing: boolean;
  isDirty: boolean;
  validationErrors: ValidationError[];
  exportOptions: ExportOptions;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PublicProfileCreatorProps {
  userId: string;
  existingProfile?: PublicProfileData;
  onSave: (profile: PublicProfileData) => Promise<void>;
  onCancel: () => void;
  onExport: (options: ExportOptions) => Promise<string>;
  className?: string;
}

// Section editing types
export type SectionType =
  | 'about'
  | 'experience'
  | 'skills'
  | 'portfolio'
  | 'education'
  | 'contact'
  | 'certifications'
  | 'testimonials';

export interface SectionConfiguration {
  type: SectionType;
  title: string;
  enabled: boolean;
  order: number;
  required: boolean;
  customizable: boolean;
}

export interface ContentValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => string | null;
}

export interface TemplateCustomization {
  sections: SectionConfiguration[];
  branding: BrandingSettings;
  layout: {
    sidebar: boolean;
    headerType: 'minimal' | 'standard' | 'hero';
    footerType: 'minimal' | 'standard' | 'detailed';
  };
}