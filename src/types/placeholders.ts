export interface PlaceholderInfo {
  key: string;           // "[INSERT TEAM SIZE]"
  placeholder: string;   // "INSERT TEAM SIZE"
  type: 'number' | 'text' | 'percentage' | 'currency' | 'timeframe';
  label: string;         // "Team Size"
  helpText: string;      // "How many people did you manage?"
  example: string;       // "8 developers"
  required: boolean;
  validation?: RegExp;
}

export interface PlaceholderReplacementMap {
  [placeholder: string]: string;
}

export interface PlaceholderFormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  helpText: string;
  required: boolean;
  validation?: RegExp;
}

export interface CVRecommendationWithPlaceholders {
  id: string;
  type: 'content' | 'structure' | 'formatting' | 'section_addition' | 'keyword_optimization';
  category: 'professional_summary' | 'experience' | 'skills' | 'education' | 'achievements' | 'formatting' | 'ats_optimization';
  title: string;
  description: string;
  currentContent?: string;
  suggestedContent?: string;
  customizedContent?: string; // Content after user has filled placeholders
  placeholders?: PlaceholderInfo[]; // Detected placeholders in suggestedContent
  isCustomized?: boolean; // Whether user has customized placeholders
  impact: 'high' | 'medium' | 'low';
  priority: number;
  section: string;
  actionRequired: 'replace' | 'add' | 'modify' | 'reformat';
  keywords?: string[];
  estimatedScoreImprovement: number;
}

export interface PlaceholderCustomizationResult {
  success: boolean;
  data?: {
    recommendationId: string;
    customizedContent: string;
    originalContent: string;
    placeholdersReplaced: number;
  };
  error?: string;
}