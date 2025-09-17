/**
 * Language Proficiency Types
 * Extracted from LanguageProficiency.tsx for better modularity
 */

export interface LanguageProficiency {
  name: string;
  proficiency: 'native' | 'fluent' | 'professional' | 'limited' | 'elementary';
  certifications?: string[];
  yearsOfExperience?: number;
  flag?: string;
  score?: number;
  verified?: boolean;
  contexts?: string[];
  frameworks?: {
    cefr?: string;
    actfl?: string;
    custom?: string;
  };
}

export interface LanguageVisualization {
  proficiencies: LanguageProficiency[];
  visualizations: {
    type: 'circular' | 'bar' | 'radar' | 'flags' | 'matrix';
    data: unknown;
    config: {
      primaryColor: string;
      accentColor: string;
      showCertifications: boolean;
      showFlags: boolean;
      animateOnLoad: boolean;
    };
  }[];
  insights: {
    totalLanguages: number;
    fluentLanguages: number;
    businessReady: string[];
    certifiedLanguages: string[];
    recommendations: string[];
  };
  metadata: {
    extractedFrom: string[];
    confidence: number;
    lastUpdated: Date;
  };
}

export interface LanguageProficiencyProps {
  visualization?: LanguageVisualization;
  onGenerateVisualization: () => Promise<LanguageVisualization>;
  onAddLanguage: (language: Partial<LanguageProficiency>) => Promise<void>;
}

export type LanguageLevel = LanguageProficiency['proficiency'];

export interface LanguageVisualizationConfig {
  primaryColor: string;
  accentColor: string;
  showCertifications: boolean;
  showFlags: boolean;
  animateOnLoad: boolean;
  showFrameworks: boolean;
}

export interface CircularProgressData {
  languages: {
    name: string;
    value: number;
    level: string;
    flag?: string;
    certified: boolean;
    color?: string;
  }[];
}

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface RadarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    pointBackgroundColor?: string;
    pointBorderColor?: string;
    pointHoverBackgroundColor?: string;
    pointHoverBorderColor?: string;
  }[];
}

export interface FlagGridData {
  languages: {
    flag?: string;
    name: string;
    level: string;
    levelText?: string;
    certified: boolean;
    certifications?: string[];
    frameworks?: {
      cefr?: string;
      actfl?: string;
    };
  }[];
}

export interface ProficiencyMatrixData {
  languages: string[];
  skills: string[];
  values: {
    language: string;
    skills: Record<string, number>;
  }[];
}
export type VisualizationType = LanguageVisualization['visualizations'][0]['type'];

export interface VisualizationOption {
  type: VisualizationType;
  name: string;
  icon: string;
  description: string;
}