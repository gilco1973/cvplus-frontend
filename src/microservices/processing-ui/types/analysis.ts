// @ts-ignore
/**
 * Analysis Types for Frontend
 * 
 * Frontend-specific analysis types and interfaces.
  */

export interface AnalysisResult {
  score: number;
  grade: string;
  insights: AnalysisInsight[];
  recommendations: Recommendation[];
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisInsight {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
}

export interface ATSAnalysis {
  score: number;
  grade: string;
  issues: ATSIssue[];
  suggestions: ATSSuggestion[];
  compatibility: number;
}

export interface ATSIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: number;
}

export interface ATSSuggestion {
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
}

export interface AnalysisMetadata {
  processingTime: number;
  version: string;
  timestamp: Date;
  model: string;
}

export interface AnalysisFilters {
  priority: {
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  category: Record<string, boolean>;
}