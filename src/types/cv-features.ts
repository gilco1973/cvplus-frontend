// CVPlus Feature Component Types
// Standardized interface for all CV enhancement features
// Based on the React Component Conversion Plan
// Extended with Portal System Integration Support

import { ReactNode } from 'react';
import { PortalConfig, PortalComponentProps } from './portal-types';

// Standardized CV Feature Props Interface
export interface CVFeatureProps {
  jobId: string;
  profileId: string;
  isEnabled?: boolean;
  data?: any;
  customization?: FeatureCustomization;
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  className?: string;
  mode?: 'public' | 'private' | 'preview';
  /** Portal integration configuration (optional) */
  portalIntegration?: PortalIntegrationConfig;
}

// Portal Integration Configuration for CV Features
export interface PortalIntegrationConfig {
  /** Enable portal functionality for this feature */
  enabled: boolean;
  /** Portal configuration (if enabled) */
  portalConfig?: Partial<PortalConfig>;
  /** Portal-specific feature settings */
  portalSettings?: {
    /** Show in portal navigation */
    showInNavigation?: boolean;
    /** Section order in portal */
    portalOrder?: number;
    /** Portal section title override */
    portalTitle?: string;
    /** Portal section description */
    portalDescription?: string;
    /** Portal-specific customization */
    portalCustomization?: FeatureCustomization;
  };
  /** Portal deployment settings */
  deploymentSettings?: {
    /** Include in portal deployment */
    includeInDeployment?: boolean;
    /** Priority in deployment process */
    deploymentPriority?: number;
    /** Required for portal functionality */
    required?: boolean;
  };
}

// Extended CV Feature Props for Portal-Enabled Components
export interface PortalEnabledCVFeatureProps extends CVFeatureProps {
  /** Portal component properties (when used in portal context) */
  portalProps?: Omit<PortalComponentProps, keyof CVFeatureProps>;
  /** Portal deployment status */
  portalDeploymentStatus?: 'not_deployed' | 'deploying' | 'deployed' | 'error';
  /** Portal URL (when deployed) */
  portalUrl?: string;
}

export interface FeatureCustomization {
  theme?: 'light' | 'dark' | 'auto';
  colors?: ThemeColors;
  layout?: LayoutOptions;
  animations?: boolean;
  [key: string]: any;
}

export interface ThemeColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  text?: string;
}

export interface LayoutOptions {
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'compact' | 'normal' | 'relaxed';
}

// Component Registry Types
export interface ComponentRegistry {
  [componentName: string]: React.ComponentType<CVFeatureProps>;
}

// Feature Result Types
export interface FeatureResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    processingTime?: number;
    version?: string;
    [key: string]: any;
  };
}

// Specific Feature Data Interfaces
export interface QRCodeData {
  url: string;
  profileUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  /** Portal-specific QR data */
  portalUrl?: string;
  portalQRConfig?: {
    /** Include portal features in QR */
    includePortalFeatures?: boolean;
    /** QR code tracking for portal analytics */
    enableTracking?: boolean;
    /** Custom QR design for portal */
    portalDesign?: {
      colors?: {
        foreground: string;
        background: string;
      };
      logo?: string;
      style?: 'standard' | 'artistic' | 'minimal';
    };
  };
}

export interface TimelineData {
  experiences: Experience[];
  education: Education[];
  milestones: Milestone[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements: string[];
  location?: string;
  logo?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  description?: string;
  logo?: string;
}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  type: 'achievement' | 'education' | 'career' | 'certification';
  icon?: string;
}

export interface SocialLinksData {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  medium?: string;
  youtube?: string;
}

export interface PodcastData {
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  title?: string;
  description?: string;
  generationStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  /** Portal-specific podcast data */
  portalIntegration?: {
    /** Include in portal player */
    includeInPortal?: boolean;
    /** Portal player configuration */
    portalPlayerConfig?: {
      autoplay?: boolean;
      showTranscript?: boolean;
      showDownload?: boolean;
      customStyling?: Record<string, any>;
    };
    /** Portal embedding settings */
    embeddingSettings?: {
      /** Generate embeddings for podcast content */
      generateEmbeddings?: boolean;
      /** Include transcript in chat RAG */
      includeInRAG?: boolean;
      /** Chunk size for embeddings */
      chunkSize?: number;
    };
  };
}

export interface PodcastPlayerProps extends CVFeatureProps {
  data: PodcastData;
  customization?: {
    autoplay?: boolean;
    showTranscript?: boolean;
    showDownload?: boolean;
    theme?: 'minimal' | 'full' | 'compact';
  };
}

export interface ATSData {
  score: number;
  keywords: string[];
  suggestions: string[];
  compatibilityReport: ATSReport;
}

export interface ATSReport {
  overallScore: number;
  keywordDensity: number;
  formatScore: number;
  sectionScore: number;
  recommendations: string[];
}

export interface SkillsData {
  skills: Skill[];
  categories: SkillCategory[];
  proficiencyLevels: ProficiencyLevel[];
  industryComparison?: ComparisonData;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
  yearsOfExperience?: number;
  endorsements?: number;
}

export interface SkillCategory {
  name: string;
  skills: string[];
  color?: string;
}

export interface ProficiencyLevel {
  skill: string;
  level: number;
  confidence: number;
  justification?: string;
}

export interface ComparisonData {
  industry: string;
  averageLevel: number;
  percentile: number;
}

// Hook Options
export interface FeatureOptions {
  jobId: string;
  featureName: string;
  initialData?: any;
  params?: Record<string, any>;
  /** Portal-specific options */
  portalOptions?: {
    /** Generate portal-compatible output */
    portalCompatible?: boolean;
    /** Include portal metadata */
    includePortalMetadata?: boolean;
    /** Portal optimization settings */
    optimizeForPortal?: boolean;
  };
}

// Portal-Enabled Feature Hook Options
export interface PortalFeatureOptions extends FeatureOptions {
  /** Portal configuration */
  portalConfig: PortalConfig;
  /** Enable portal-specific features */
  enablePortalFeatures: boolean;
  /** Portal deployment context */
  deploymentContext?: {
    isDeploying?: boolean;
    deploymentId?: string;
    targetEnvironment?: 'development' | 'staging' | 'production';
  };
}

// Component Loading States
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FeatureState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated?: Date;
}