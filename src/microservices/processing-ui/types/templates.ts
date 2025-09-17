// CV template types for cv-processing-ui microservice

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  previewUrl: string;
  thumbnailUrl: string;
  features: TemplateFeature[];
  atsOptimized: boolean;
  industryFocus: string[];
  experienceLevel: ExperienceLevel[];
  layout: TemplateLayout;
  customization: TemplateCustomization;
  premium: boolean;
  rating: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface TemplateLayout {
  columns: number;
  sections: TemplateSectionConfig[];
  colorScheme: ColorScheme;
  typography: TypographyConfig;
  spacing: SpacingConfig;
}

export interface TemplateSectionConfig {
  id: string;
  type: SectionType;
  position: number;
  required: boolean;
  customizable: boolean;
  maxItems?: number;
}

export interface TemplateCustomization {
  colors: ColorCustomization;
  fonts: FontCustomization;
  layout: LayoutCustomization;
  sections: SectionCustomization;
}

export interface ColorCustomization {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  customizable: boolean;
}

export interface FontCustomization {
  heading: FontConfig;
  body: FontConfig;
  customizable: boolean;
}

export interface FontConfig {
  family: string;
  size: number;
  weight: number;
  lineHeight: number;
}

export interface LayoutCustomization {
  margins: number;
  spacing: number;
  lineSpacing: number;
  customizable: boolean;
}

export interface SectionCustomization {
  order: string[];
  visibility: Record<string, boolean>;
  customizable: boolean;
}

export interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

export interface TypographyConfig {
  headingFont: string;
  bodyFont: string;
  fontSize: FontSizeConfig;
}

export interface FontSizeConfig {
  heading1: number;
  heading2: number;
  heading3: number;
  body: number;
  small: number;
}

export interface SpacingConfig {
  section: number;
  paragraph: number;
  line: number;
}

export type TemplateCategory =
  | 'professional'
  | 'creative'
  | 'modern'
  | 'classic'
  | 'academic'
  | 'technical'
  | 'executive'
  | 'entry-level';

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export type SectionType =
  | 'personal-info'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'references'
  | 'custom';

export interface TemplateState {
  templates: CVTemplate[];
  selectedTemplate: CVTemplate | null;
  categories: TemplateCategory[];
  isLoading: boolean;
  error: string | null;
  filters: TemplateFilters;
}

export interface TemplateFilters {
  category?: TemplateCategory;
  industry?: string;
  experienceLevel?: ExperienceLevel;
  premium?: boolean;
  atsOptimized?: boolean;
  rating?: number;
}

export interface TemplatePreview {
  templateId: string;
  html: string;
  previewUrl: string;
  thumbnailUrl: string;
  sampleData: any;
}

export interface TemplateCustomizationState {
  template: CVTemplate;
  customizations: TemplateCustomization;
  preview: TemplatePreview | null;
  isCustomizing: boolean;
  hasChanges: boolean;
}