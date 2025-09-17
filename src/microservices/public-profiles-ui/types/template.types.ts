// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/creator.types';

export interface TemplateTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
    };
  };
  spacing: {
    section: string;
    element: string;
    compact: string;
  };
}

export interface TemplateLayout {
  type: 'single-column' | 'two-column' | 'sidebar' | 'grid';
  headerStyle: 'minimal' | 'standard' | 'hero' | 'split';
  navigationStyle: 'top' | 'side' | 'bottom' | 'floating';
  footerStyle: 'minimal' | 'standard' | 'detailed' | 'none';
  sectionSpacing: 'tight' | 'normal' | 'spacious';
}

export interface TemplateComponent {
  name: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  conditions?: {
    requiredFields?: string[];
    premiumOnly?: boolean;
    deviceTypes?: ('desktop' | 'tablet' | 'mobile')[];
  };
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'minimal' | 'tech' | 'executive';
  thumbnail: string;
  preview: string;
  theme: TemplateTheme;
  layout: TemplateLayout;
  components: TemplateComponent[];
  defaultSections: SectionConfiguration[];
  customizations: {
    allowColorChange: boolean;
    allowFontChange: boolean;
    allowLayoutChange: boolean;
    allowSectionReorder: boolean;
  };
  responsive: {
    breakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
    adaptiveLayout: boolean;
    mobileOptimized: boolean;
  };
  seo: {
    structured: boolean;
    socialCards: boolean;
    performanceOptimized: boolean;
  };
  isPremium: boolean;
  features: string[];
}

export interface TemplateRenderContext {
  template: TemplateDefinition;
  profileData: any;
  branding: BrandingSettings;
  device: 'desktop' | 'tablet' | 'mobile';
  editMode: boolean;
  previewMode: boolean;
}

export interface TemplateSection {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  data: any;
  style?: React.CSSProperties;
  className?: string;
  order: number;
  visible: boolean;
}

// Template validation and transformation
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFields: string[];
  recommendations: string[];
}

export interface TemplateExportFormat {
  html: string;
  css: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    socialImage?: string;
  };
  structured: {
    jsonLd: string;
    openGraph: Record<string, string>;
    twitterCard: Record<string, string>;
  };
}