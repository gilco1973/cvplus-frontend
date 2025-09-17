/**
 * Enhanced CV Template Type Definitions
 * Professional CV template design system with comprehensive type safety
 * Maintains backward compatibility with existing CVParsedData types
 */

import type { 
  CVParsedData, 
  CVPersonalInfo, 
  CVExperienceItem, 
  CVEducationItem, 
  CVSkillsData 
} from './cvData';
import type { Brand } from './utility-types';
import type { SelectedFeatures } from './results';

// ============================================================================
// CORE TEMPLATE TYPES
// ============================================================================

export type TemplateId = Brand<string, 'TemplateId'>;
export type ColorSchemeId = Brand<string, 'ColorSchemeId'>;
export type TypographyId = Brand<string, 'TypographyId'>;
export type LayoutId = Brand<string, 'LayoutId'>;

// Template Categories with Industry Focus
export type TemplateCategory = 
  | 'executive'       // C-suite, senior management, board positions
  | 'technical'       // Engineering, IT, software development
  | 'creative'        // Design, marketing, arts, media
  | 'healthcare'      // Medical, nursing, pharmaceutical
  | 'financial'       // Banking, accounting, investment, insurance
  | 'academic'        // Research, teaching, scientific positions
  | 'sales'          // Sales, business development, account management
  | 'international'; // Global roles, diplomatic, multicultural

// Professional Experience Levels
export type ExperienceLevel = 
  | 'entry'           // 0-2 years
  | 'mid'            // 3-7 years
  | 'senior'         // 8-15 years
  | 'executive'      // 15+ years, leadership roles
  | 'specialized';   // Expert/consultant level

// ============================================================================
// VISUAL IDENTITY SYSTEM
// ============================================================================

export interface ColorPalette {
  // Primary brand colors
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Secondary accent colors
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Neutral colors for text and backgrounds
  neutral: {
    background: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
  };
  
  // Psychology-based color reasoning
  psychology: {
    industry: TemplateCategory;
    traits: string[];        // e.g., ['professional', 'trustworthy', 'innovative']
    reasoning: string;       // Why this palette works for the industry
  };
}

export interface TypographySystem {
  // Font families
  fonts: {
    primary: {
      family: string;
      weights: number[];
      fallback: string[];
    };
    secondary: {
      family: string;
      weights: number[];
      fallback: string[];
    };
    monospace?: {
      family: string;
      weights: number[];
      fallback: string[];
    };
  };
  
  // Typography scales
  scale: {
    h1: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    h2: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    h3: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    h4: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    body: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    caption: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
    overline: { size: string; weight: number; lineHeight: string; letterSpacing?: string; };
  };
  
  // Professional pairing rationale
  pairing: {
    industry: TemplateCategory;
    readability: 'excellent' | 'good' | 'fair';
    personality: string[];   // e.g., ['modern', 'elegant', 'approachable']
    reasoning: string;
  };
}

export interface SpacingSystem {
  // Base spacing unit (typically 4px or 8px)
  base: string;
  
  // Spacing scale
  scale: {
    xs: string;    // 0.25 * base
    sm: string;    // 0.5 * base  
    md: string;    // 1 * base
    lg: string;    // 1.5 * base
    xl: string;    // 2 * base
    '2xl': string; // 3 * base
    '3xl': string; // 4 * base
    '4xl': string; // 6 * base
  };
  
  // Section-specific spacing
  sections: {
    header: { padding: string; margin: string; };
    content: { padding: string; margin: string; };
    footer: { padding: string; margin: string; };
  };
}

// ============================================================================
// LAYOUT CONFIGURATION SYSTEM
// ============================================================================

export interface ResponsiveBreakpoints {
  mobile: string;     // max-width for mobile
  tablet: string;     // max-width for tablet
  desktop: string;    // min-width for desktop
  print: string;      // print media styles
}

export interface LayoutGrid {
  columns: number;
  gap: string;
  maxWidth: string;
  margins: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export interface SectionLayout {
  order: number;
  span: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  visibility: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
    print: boolean;
  };
}

export interface LayoutConfiguration {
  grid: LayoutGrid;
  breakpoints: ResponsiveBreakpoints;
  
  // Section ordering and positioning
  sections: {
    personalInfo: SectionLayout;
    summary: SectionLayout;
    experience: SectionLayout;
    education: SectionLayout;
    skills: SectionLayout;
    certifications: SectionLayout;
    projects: SectionLayout;
    languages: SectionLayout;
    awards: SectionLayout;
    customSections: SectionLayout;
  };
  
  // Header and footer configuration
  header: {
    height: string;
    sticky: boolean;
    background: string;
  };
  
  footer: {
    height: string;
    content: 'minimal' | 'standard' | 'extended';
  };
}

// ============================================================================
// FEATURE SPECIFICATIONS
// ============================================================================

export interface SkillsVisualization {
  type: 'bars' | 'circles' | 'tags' | 'radar' | 'icons';
  showLevels: boolean;
  groupByCategory: boolean;
  maxItems: number;
  animation: 'none' | 'fade' | 'slide' | 'scale';
}

export interface ExperienceFormat {
  layout: 'timeline' | 'cards' | 'list' | 'accordion';
  showDuration: boolean;
  showLocation: boolean;
  showAchievements: boolean;
  showTechnologies: boolean;
  dateFormat: 'full' | 'short' | 'year-only';
  sortOrder: 'chronological' | 'reverse-chronological' | 'relevance';
}

export interface ContactDisplay {
  layout: 'horizontal' | 'vertical' | 'grid';
  showIcons: boolean;
  clickableLinks: boolean;
  showQRCode: boolean;
  socialLinksStyle: 'icons' | 'text' | 'buttons';
}

export interface FeatureSpecification {
  skills: SkillsVisualization;
  experience: ExperienceFormat;
  contact: ContactDisplay;
  
  // Interactive features
  interactivity: {
    expandableSections: boolean;
    hoverEffects: boolean;
    smoothScrolling: boolean;
    printOptimization: boolean;
  };
  
  // Accessibility features
  accessibility: {
    highContrast: boolean;
    focusIndicators: boolean;
    screenReaderOptimized: boolean;
    keyboardNavigation: boolean;
  };
}

// ============================================================================
// STYLING AND ANIMATION SYSTEM
// ============================================================================

export interface AnimationConfig {
  duration: string;
  easing: string;
  delay?: string;
}

export interface ComponentStyles {
  // Card components
  cards: {
    borderRadius: string;
    shadow: string;
    border: string;
    background: string;
    hover?: {
      shadow: string;
      transform: string;
      transition: AnimationConfig;
    };
  };
  
  // Button styles
  buttons: {
    primary: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
      hover: {
        background: string;
        transform: string;
      };
    };
    secondary: {
      background: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
      hover: {
        background: string;
        transform: string;
      };
    };
  };
  
  // Input styles
  inputs: {
    borderRadius: string;
    border: string;
    padding: string;
    fontSize: string;
    background: string;
    focus: {
      border: string;
      shadow: string;
      outline: string;
    };
  };
  
  // Section dividers
  dividers: {
    style: 'line' | 'gradient' | 'decorative' | 'none';
    thickness: string;
    color: string;
    margin: string;
  };
}

export interface StylingSystem {
  components: ComponentStyles;
  animations: {
    pageLoad: AnimationConfig;
    sectionReveal: AnimationConfig;
    hoverEffects: AnimationConfig;
    focusTransition: AnimationConfig;
  };
  
  // CSS custom properties
  customProperties: Record<string, string>;
  
  // Tailwind CSS classes (if used)
  tailwindClasses?: {
    layouts: Record<string, string>;
    components: Record<string, string>;
    utilities: Record<string, string>;
  };
}

// ============================================================================
// ATS COMPATIBILITY SYSTEM
// ============================================================================

export interface ATSCompatibility {
  // Dual format support
  formats: {
    visual: {
      enabled: boolean;
      features: string[];
      limitations: string[];
    };
    ats: {
      enabled: boolean;
      structure: 'simple' | 'structured' | 'semantic';
      features: string[];
      compatibility: {
        applicantTrackingSystems: string[];
        score: number; // 0-100
        recommendations: string[];
      };
    };
  };
  
  // Content optimization
  optimization: {
    keywordPlacement: 'natural' | 'strategic' | 'aggressive';
    sectionHeaders: 'standard' | 'keyword-rich' | 'ats-optimized';
    formatting: {
      bulletPoints: boolean;
      boldKeywords: boolean;
      standardFonts: boolean;
      simpleLayout: boolean;
    };
  };
  
  // Validation rules
  validation: {
    maxFileSize: string;
    supportedFormats: string[];
    requiredSections: string[];
    forbiddenElements: string[];
  };
}

// ============================================================================
// TEMPLATE DEFINITION
// ============================================================================

export interface CVTemplate {
  // Basic identification
  id: TemplateId;
  name: string;
  description: string;
  version: string;
  
  // Categorization
  category: TemplateCategory;
  targetRoles: string[];
  experienceLevel: ExperienceLevel[];
  industries: string[];
  
  // Visual system
  colors: ColorPalette;
  typography: TypographySystem;
  spacing: SpacingSystem;
  
  // Layout system
  layout: LayoutConfiguration;
  
  // Feature configuration
  features: FeatureSpecification;
  
  // Styling system
  styling: StylingSystem;
  
  // ATS compatibility
  ats: ATSCompatibility;
  
  // Preview and metadata
  preview: {
    thumbnail: string;
    mockupUrl?: string;
    demoData: Partial<CVParsedData>;
    previewEmoji: string;
  };
  
  // Template metadata
  metadata: {
    author: string;
    created: string;
    updated: string;
    popularity: number;
    rating: number;
    tags: string[];
    isDefault: boolean;
    isPremium: boolean;
  };
  
  // Customization options
  customization: {
    allowColorChanges: boolean;
    allowFontChanges: boolean;
    allowLayoutChanges: boolean;
    customizableElements: string[];
  };
}

// ============================================================================
// TEMPLATE GENERATION SYSTEM
// ============================================================================

export interface TemplateGenerationOptions {
  // Content preferences
  content: {
    includePhoto: boolean;
    includeQRCode: boolean;
    includeSocialLinks: boolean;
    includePortfolio: boolean;
    customSections: string[];
  };
  
  // Format preferences
  format: {
    pageCount: 1 | 2 | 3 | 'auto';
    paperSize: 'A4' | 'US-Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: 'narrow' | 'standard' | 'wide';
  };
  
  // Output preferences
  output: {
    generateHTML: boolean;
    generatePDF: boolean;
    generateATSVersion: boolean;
    generatePreview: boolean;
    optimization: 'quality' | 'size' | 'speed';
  };
  
  // Personalization
  personalization: {
    targetRole?: string;
    targetCompany?: string;
    targetIndustry?: string;
    emphasizeSkills?: string[];
    toneOfVoice: 'professional' | 'creative' | 'technical' | 'executive';
  };
}

export interface GeneratedTemplate {
  // Generated content
  html: string;
  css: string;
  metadata: {
    templateId: TemplateId;
    generatedAt: string;
    options: TemplateGenerationOptions;
    cvData: CVParsedData;
  };
  
  // Output formats
  outputs: {
    html?: string;
    pdf?: Blob;
    atsVersion?: string;
    preview?: string;
  };
  
  // Generation stats
  stats: {
    generationTime: number;
    fileSize: number;
    atsScore: number;
    sections: string[];
    wordCount: number;
  };
  
  // Validation results
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
  };
}

// ============================================================================
// TEMPLATE REGISTRY SYSTEM
// ============================================================================

export interface TemplateRegistry {
  // Template management
  templates: Map<TemplateId, CVTemplate>;
  
  // Category organization
  categories: {
    [K in TemplateCategory]: {
      templates: TemplateId[];
      description: string;
      icon: string;
      popularityScore: number;
    };
  };
  
  // Search and filtering
  search: {
    byCategory: (category: TemplateCategory) => CVTemplate[];
    byIndustry: (industry: string) => CVTemplate[];
    byExperienceLevel: (level: ExperienceLevel) => CVTemplate[];
    byFeatures: (features: string[]) => CVTemplate[];
    byPopularity: (limit?: number) => CVTemplate[];
    byRating: (minRating: number) => CVTemplate[];
  };
  
  // Template operations
  operations: {
    register: (template: CVTemplate) => void;
    unregister: (templateId: TemplateId) => void;
    update: (templateId: TemplateId, updates: Partial<CVTemplate>) => void;
    clone: (templateId: TemplateId, newId: TemplateId) => CVTemplate;
    validate: (template: CVTemplate) => { isValid: boolean; errors: string[]; };
  };
  
  // Analytics and insights
  analytics: {
    usage: Map<TemplateId, number>;
    ratings: Map<TemplateId, number[]>;
    feedback: Map<TemplateId, string[]>;
    performance: Map<TemplateId, { generationTime: number; errors: number; }>;
  };
}

// ============================================================================
// INDUSTRY-SPECIFIC COLOR PSYCHOLOGY
// ============================================================================

export const INDUSTRY_COLOR_SCHEMES: Record<TemplateCategory, ColorPalette> = {
  executive: {
    primary: { main: '#1a365d', light: '#2c5282', dark: '#0d1b2a', contrast: '#ffffff' },
    secondary: { main: '#744210', light: '#975a16', dark: '#553108', contrast: '#ffffff' },
    semantic: { success: '#22543d', warning: '#c05621', error: '#742a2a', info: '#2b6cb0' },
    neutral: {
      background: '#f7fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
      text: { primary: '#1a202c', secondary: '#4a5568', muted: '#718096' }
    },
    psychology: {
      industry: 'executive',
      traits: ['authoritative', 'trustworthy', 'sophisticated', 'stable'],
      reasoning: 'Deep blues convey trust and stability essential for executive roles, while gold accents suggest success and premium quality.'
    }
  },
  
  technical: {
    primary: { main: '#2d3748', light: '#4a5568', dark: '#1a202c', contrast: '#ffffff' },
    secondary: { main: '#3182ce', light: '#4299e1', dark: '#2c5282', contrast: '#ffffff' },
    semantic: { success: '#38a169', warning: '#d69e2e', error: '#e53e3e', info: '#3182ce' },
    neutral: {
      background: '#f7fafc',
      surface: '#ffffff',
      border: '#e2e8f0',
      text: { primary: '#2d3748', secondary: '#4a5568', muted: '#718096' }
    },
    psychology: {
      industry: 'technical',
      traits: ['logical', 'innovative', 'precise', 'analytical'],
      reasoning: 'Clean greys and blues reflect the logical, systematic nature of technical work while maintaining modern appeal.'
    }
  },
  
  creative: {
    primary: { main: '#805ad5', light: '#9f7aea', dark: '#553c9a', contrast: '#ffffff' },
    secondary: { main: '#ed8936', light: '#f6ad55', dark: '#c05621', contrast: '#ffffff' },
    semantic: { success: '#48bb78', warning: '#ed8936', error: '#f56565', info: '#4299e1' },
    neutral: {
      background: '#faf5ff',
      surface: '#ffffff',
      border: '#e9d8fd',
      text: { primary: '#322659', secondary: '#553c9a', muted: '#805ad5' }
    },
    psychology: {
      industry: 'creative',
      traits: ['imaginative', 'expressive', 'inspiring', 'unique'],
      reasoning: 'Vibrant purples and oranges showcase creativity and originality while maintaining professional credibility.'
    }
  },
  
  healthcare: {
    primary: { main: '#2b6cb0', light: '#4299e1', dark: '#1e4a72', contrast: '#ffffff' },
    secondary: { main: '#38a169', light: '#48bb78', dark: '#276749', contrast: '#ffffff' },
    semantic: { success: '#38a169', warning: '#d69e2e', error: '#e53e3e', info: '#2b6cb0' },
    neutral: {
      background: '#f0fff4',
      surface: '#ffffff',
      border: '#c6f6d5',
      text: { primary: '#1a202c', secondary: '#2d3748', muted: '#4a5568' }
    },
    psychology: {
      industry: 'healthcare',
      traits: ['caring', 'trustworthy', 'calming', 'professional'],
      reasoning: 'Blue-green palette evokes feelings of cleanliness, trust, and healing essential in healthcare environments.'
    }
  },
  
  financial: {
    primary: { main: '#1a365d', light: '#2c5282', dark: '#0d1b2a', contrast: '#ffffff' },
    secondary: { main: '#22543d', light: '#2f855a', dark: '#1a202c', contrast: '#ffffff' },
    semantic: { success: '#22543d', warning: '#c05621', error: '#742a2a', info: '#2b6cb0' },
    neutral: {
      background: '#f7fafc',
      surface: '#ffffff',
      border: '#cbd5e0',
      text: { primary: '#1a202c', secondary: '#2d3748', muted: '#4a5568' }
    },
    psychology: {
      industry: 'financial',
      traits: ['trustworthy', 'stable', 'professional', 'secure'],
      reasoning: 'Conservative blues and greens represent stability and growth, crucial for financial sector credibility.'
    }
  },
  
  academic: {
    primary: { main: '#553c9a', light: '#805ad5', dark: '#322659', contrast: '#ffffff' },
    secondary: { main: '#744210', light: '#975a16', dark: '#553108', contrast: '#ffffff' },
    semantic: { success: '#2f855a', warning: '#c05621', error: '#c53030', info: '#3182ce' },
    neutral: {
      background: '#faf5ff',
      surface: '#ffffff',
      border: '#e9d8fd',
      text: { primary: '#322659', secondary: '#553c9a', muted: '#805ad5' }
    },
    psychology: {
      industry: 'academic',
      traits: ['scholarly', 'intellectual', 'authoritative', 'traditional'],
      reasoning: 'Deep purples and golds reflect academic tradition and intellectual achievement while maintaining dignity.'
    }
  },
  
  sales: {
    primary: { main: '#c53030', light: '#f56565', dark: '#9b2c2c', contrast: '#ffffff' },
    secondary: { main: '#d69e2e', light: '#f6e05e', dark: '#b7791f', contrast: '#1a202c' },
    semantic: { success: '#38a169', warning: '#d69e2e', error: '#c53030', info: '#3182ce' },
    neutral: {
      background: '#fffbf5',
      surface: '#ffffff',
      border: '#fbd38d',
      text: { primary: '#1a202c', secondary: '#2d3748', muted: '#4a5568' }
    },
    psychology: {
      industry: 'sales',
      traits: ['energetic', 'confident', 'persuasive', 'dynamic'],
      reasoning: 'Warm reds and golds convey energy and confidence, essential traits for successful sales professionals.'
    }
  },
  
  international: {
    primary: { main: '#2b6cb0', light: '#4299e1', dark: '#1e4a72', contrast: '#ffffff' },
    secondary: { main: '#38a169', light: '#48bb78', dark: '#276749', contrast: '#ffffff' },
    semantic: { success: '#38a169', warning: '#d69e2e', error: '#c53030', info: '#2b6cb0' },
    neutral: {
      background: '#f0f9ff',
      surface: '#ffffff',
      border: '#bae6fd',
      text: { primary: '#0c4a6e', secondary: '#0369a1', muted: '#0284c7' }
    },
    psychology: {
      industry: 'international',
      traits: ['global', 'diverse', 'diplomatic', 'cultural'],
      reasoning: 'Universal blues and greens transcend cultural boundaries while projecting professionalism globally.'
    }
  }
};

// ============================================================================
// PROFESSIONAL TYPOGRAPHY PAIRINGS
// ============================================================================

export const PROFESSIONAL_TYPOGRAPHY: Record<TemplateCategory, TypographySystem> = {
  executive: {
    fonts: {
      primary: {
        family: 'Playfair Display',
        weights: [400, 600, 700],
        fallback: ['Georgia', 'Times New Roman', 'serif']
      },
      secondary: {
        family: 'Inter',
        weights: [400, 500, 600],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.5rem', weight: 700, lineHeight: '1.2', letterSpacing: '-0.025em' },
      h2: { size: '2rem', weight: 600, lineHeight: '1.3', letterSpacing: '-0.015em' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 500, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 500, lineHeight: '1.4', letterSpacing: '0.1em' }
    },
    pairing: {
      industry: 'executive',
      readability: 'excellent',
      personality: ['elegant', 'authoritative', 'traditional', 'sophisticated'],
      reasoning: 'Playfair Display headlines convey executive gravitas while Inter body text ensures perfect readability.'
    }
  },
  
  technical: {
    fonts: {
      primary: {
        family: 'Inter',
        weights: [400, 500, 600, 700],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      secondary: {
        family: 'Inter',
        weights: [400, 500],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      monospace: {
        family: 'JetBrains Mono',
        weights: [400, 500],
        fallback: ['Courier New', 'monospace']
      }
    },
    scale: {
      h1: { size: '2.25rem', weight: 700, lineHeight: '1.2' },
      h2: { size: '1.875rem', weight: 600, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 500, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 500, lineHeight: '1.4', letterSpacing: '0.05em' }
    },
    pairing: {
      industry: 'technical',
      readability: 'excellent',
      personality: ['clean', 'systematic', 'modern', 'precise'],
      reasoning: 'Inter provides exceptional clarity for technical content with optional monospace for code snippets.'
    }
  },
  
  creative: {
    fonts: {
      primary: {
        family: 'Montserrat',
        weights: [400, 500, 600, 700],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      secondary: {
        family: 'Source Sans Pro',
        weights: [400, 600],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.5rem', weight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' },
      h2: { size: '2rem', weight: 600, lineHeight: '1.3', letterSpacing: '-0.01em' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 500, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 600, lineHeight: '1.4', letterSpacing: '0.1em' }
    },
    pairing: {
      industry: 'creative',
      readability: 'excellent',
      personality: ['expressive', 'modern', 'friendly', 'distinctive'],
      reasoning: 'Montserrat headlines add creative flair while Source Sans Pro maintains professional readability.'
    }
  },
  
  healthcare: {
    fonts: {
      primary: {
        family: 'Source Sans Pro',
        weights: [400, 600, 700],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      secondary: {
        family: 'Source Sans Pro',
        weights: [400, 500],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.25rem', weight: 700, lineHeight: '1.2' },
      h2: { size: '1.875rem', weight: 600, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 500, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 500, lineHeight: '1.4', letterSpacing: '0.05em' }
    },
    pairing: {
      industry: 'healthcare',
      readability: 'excellent',
      personality: ['trustworthy', 'clean', 'professional', 'approachable'],
      reasoning: 'Source Sans Pro provides clarity and trust, essential for healthcare professional communications.'
    }
  },
  
  financial: {
    fonts: {
      primary: {
        family: 'Merriweather',
        weights: [400, 700],
        fallback: ['Georgia', 'Times New Roman', 'serif']
      },
      secondary: {
        family: 'Open Sans',
        weights: [400, 600],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.25rem', weight: 700, lineHeight: '1.2' },
      h2: { size: '1.875rem', weight: 700, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 700, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 600, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 600, lineHeight: '1.4', letterSpacing: '0.1em' }
    },
    pairing: {
      industry: 'financial',
      readability: 'excellent',
      personality: ['traditional', 'trustworthy', 'stable', 'authoritative'],
      reasoning: 'Merriweather headlines convey financial sector gravitas while Open Sans ensures clarity.'
    }
  },
  
  academic: {
    fonts: {
      primary: {
        family: 'Crimson Text',
        weights: [400, 600, 700],
        fallback: ['Georgia', 'Times New Roman', 'serif']
      },
      secondary: {
        family: 'Source Sans Pro',
        weights: [400, 600],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.5rem', weight: 700, lineHeight: '1.2' },
      h2: { size: '2rem', weight: 600, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 600, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 600, lineHeight: '1.4', letterSpacing: '0.05em' }
    },
    pairing: {
      industry: 'academic',
      readability: 'excellent',
      personality: ['scholarly', 'traditional', 'intellectual', 'authoritative'],
      reasoning: 'Crimson Text embodies academic tradition while maintaining exceptional readability for scholarly content.'
    }
  },
  
  sales: {
    fonts: {
      primary: {
        family: 'Poppins',
        weights: [400, 600, 700],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      secondary: {
        family: 'Open Sans',
        weights: [400, 600],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.5rem', weight: 700, lineHeight: '1.2', letterSpacing: '-0.02em' },
      h2: { size: '2rem', weight: 600, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 600, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 600, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 600, lineHeight: '1.4', letterSpacing: '0.1em' }
    },
    pairing: {
      industry: 'sales',
      readability: 'excellent',
      personality: ['dynamic', 'confident', 'modern', 'approachable'],
      reasoning: 'Poppins conveys energy and approachability essential for sales roles while maintaining professionalism.'
    }
  },
  
  international: {
    fonts: {
      primary: {
        family: 'Roboto',
        weights: [400, 500, 700],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      },
      secondary: {
        family: 'Roboto',
        weights: [400, 500],
        fallback: ['Arial', 'Helvetica', 'sans-serif']
      }
    },
    scale: {
      h1: { size: '2.25rem', weight: 700, lineHeight: '1.2' },
      h2: { size: '1.875rem', weight: 500, lineHeight: '1.3' },
      h3: { size: '1.5rem', weight: 500, lineHeight: '1.4' },
      h4: { size: '1.25rem', weight: 500, lineHeight: '1.4' },
      body: { size: '1rem', weight: 400, lineHeight: '1.6' },
      caption: { size: '0.875rem', weight: 400, lineHeight: '1.5' },
      overline: { size: '0.75rem', weight: 500, lineHeight: '1.4', letterSpacing: '0.05em' }
    },
    pairing: {
      industry: 'international',
      readability: 'excellent',
      personality: ['universal', 'clean', 'professional', 'accessible'],
      reasoning: 'Roboto offers excellent multilingual support and universal appeal for international professionals.'
    }
  }
};

// ============================================================================
// BACKWARD COMPATIBILITY & INTEGRATION
// ============================================================================

/**
 * Legacy template interface for backward compatibility
 * Matches the current basic template structure in TemplatesPage.tsx
 */
export interface LegacyTemplate {
  id: string;
  name: string;
  description?: string;
  preview: string;
}

/**
 * Adapter to convert legacy templates to new template system
 */
export function adaptLegacyTemplate(legacy: LegacyTemplate): Partial<CVTemplate> {
  const categoryMapping: Record<string, TemplateCategory> = {
    'modern': 'technical',
    'classic': 'executive', 
    'creative': 'creative'
  };

  return {
    id: legacy.id as TemplateId,
    name: legacy.name,
    description: legacy.description || '',
    category: categoryMapping[legacy.id] || 'executive',
    preview: {
      previewEmoji: legacy.preview,
      thumbnail: '',
      demoData: {}
    }
  };
}

/**
 * Template generation function for backward compatibility
 */
export interface TemplateGenerationResult {
  success: boolean;
  template: GeneratedTemplate | null;
  error?: string;
}

export async function generateCVTemplate(
  templateId: TemplateId,
  cvData: CVParsedData,
  options: Partial<TemplateGenerationOptions> = {}
): Promise<TemplateGenerationResult> {
  try {
    // Implementation would be handled by the template generation service
    // This interface ensures type safety for the generation process
    
    const defaultOptions: TemplateGenerationOptions = {
      content: {
        includePhoto: false,
        includeQRCode: true,
        includeSocialLinks: true,
        includePortfolio: false,
        customSections: []
      },
      format: {
        pageCount: 'auto',
        paperSize: 'A4',
        orientation: 'portrait',
        margins: 'standard'
      },
      output: {
        generateHTML: true,
        generatePDF: true,
        generateATSVersion: true,
        generatePreview: true,
        optimization: 'quality'
      },
      personalization: {
        toneOfVoice: 'professional'
      }
    };

    const finalOptions = { ...defaultOptions, ...options };
    
    // Template generation logic would go here
    // For now, return a placeholder structure
    
    return {
      success: true,
      template: null // Would contain actual generated template
    };
  } catch (error) {
    return {
      success: false,
      template: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ============================================================================
// TYPE EXPORTS FOR EXTERNAL USE
// ============================================================================

export type {
  // Core template types
  CVTemplate,
  TemplateId,
  TemplateCategory,
  ExperienceLevel,
  
  // Visual system types
  ColorPalette,
  TypographySystem,
  SpacingSystem,
  
  // Layout types
  LayoutConfiguration,
  ResponsiveBreakpoints,
  
  // Feature types
  FeatureSpecification,
  SkillsVisualization,
  ExperienceFormat,
  
  // Generation types
  TemplateGenerationOptions,
  GeneratedTemplate,
  TemplateGenerationResult,
  
  // Registry types
  TemplateRegistry,
  
  // ATS types
  ATSCompatibility,
  
  // Backward compatibility
  LegacyTemplate
};

// Default template registry instance
export const DEFAULT_TEMPLATE_REGISTRY: TemplateRegistry = {
  templates: new Map(),
  categories: {
    executive: {
      templates: [],
      description: 'Professional templates for C-suite and senior management roles',
      icon: '👔',
      popularityScore: 0
    },
    technical: {
      templates: [],
      description: 'Clean, systematic designs for engineering and IT professionals',
      icon: '💻',
      popularityScore: 0
    },
    creative: {
      templates: [],
      description: 'Expressive designs for designers, artists, and creative professionals',
      icon: '🎨',
      popularityScore: 0
    },
    healthcare: {
      templates: [],
      description: 'Professional, trustworthy designs for healthcare professionals',
      icon: '🏥',
      popularityScore: 0
    },
    financial: {
      templates: [],
      description: 'Conservative, stable designs for finance sector professionals',
      icon: '💼',
      popularityScore: 0
    },
    academic: {
      templates: [],
      description: 'Scholarly designs for educators and researchers',
      icon: '🎓',
      popularityScore: 0
    },
    sales: {
      templates: [],
      description: 'Dynamic, confident designs for sales professionals',
      icon: '📈',
      popularityScore: 0
    },
    international: {
      templates: [],
      description: 'Universal designs for global and multicultural roles',
      icon: '🌍',
      popularityScore: 0
    }
  },
  search: {
    byCategory: (category: TemplateCategory) => [],
    byIndustry: (industry: string) => [],
    byExperienceLevel: (level: ExperienceLevel) => [],
    byFeatures: (features: string[]) => [],
    byPopularity: (limit?: number) => [],
    byRating: (minRating: number) => []
  },
  operations: {
    register: (template: CVTemplate) => {},
    unregister: (templateId: TemplateId) => {},
    update: (templateId: TemplateId, updates: Partial<CVTemplate>) => {},
    clone: (templateId: TemplateId, newId: TemplateId) => ({} as CVTemplate),
    validate: (template: CVTemplate) => ({ isValid: true, errors: [] })
  },
  analytics: {
    usage: new Map(),
    ratings: new Map(),
    feedback: new Map(),
    performance: new Map()
  }
};