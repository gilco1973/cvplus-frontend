/**
 * Advanced ATS Analysis Types - Frontend
 * 
 * Enhanced types matching the backend Phase 1 ATS implementation
 * with multi-factor scoring, system simulation, and competitor analysis.
 */

// Enhanced ATS Score with multi-factor breakdown
export interface AdvancedATSScore {
  overall: number; // 0-100 overall score
  confidence: number; // 0-1 confidence level
  breakdown: {
    parsing: number;        // How well ATS can read the CV (40% weight)
    keywords: number;       // Keyword match percentage (25% weight)
    formatting: number;     // ATS-friendly formatting (20% weight)
    content: number;        // Content quality and structure (10% weight)
    specificity: number;    // Job-specific optimization (5% weight)
  };
  atsSystemScores: {
    workday: number;
    greenhouse: number;
    lever: number;
    bamboohr: number;
    taleo: number;
    generic: number;
  };
  recommendations: PrioritizedRecommendation[];
  competitorBenchmark: CompetitorAnalysis;
}

// Prioritized recommendations with enhanced metadata
export interface PrioritizedRecommendation {
  id: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest priority
  category: 'parsing' | 'keywords' | 'formatting' | 'content' | 'specificity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedScoreImprovement: number; // Points improvement expected
  actionRequired: 'add' | 'modify' | 'remove' | 'restructure';
  section: string;
  currentContent?: string;
  suggestedContent?: string;
  keywords?: string[];
  atsSystemsAffected: string[]; // Which ATS systems this affects
}

// Competitor analysis for benchmarking
export interface CompetitorAnalysis {
  benchmarkScore: number;
  industryAverage: number;
  topPercentile: number;
  gapAnalysis: {
    missingKeywords: string[];
    weakAreas: string[];
    strengthAreas: string[];
  };
}

// Enhanced keyword analysis with semantic matching
export interface SemanticKeywordAnalysis {
  primaryKeywords: KeywordMatch[];
  semanticMatches: KeywordMatch[];
  contextualRelevance: number; // 0-1 score
  densityOptimization: {
    current: number;
    recommended: number;
    sections: { [section: string]: number };
  };
  synonymMapping: { [original: string]: string[] };
  industrySpecificTerms: string[];
}

export interface KeywordMatch {
  keyword: string;
  variations: string[];
  frequency: number;
  context: string[];
  relevanceScore: number; // 0-1
  atsImportance: number; // 0-1
  competitorUsage: number; // 0-1
}

// ATS system-specific simulation results
export interface ATSSystemSimulation {
  system: 'workday' | 'greenhouse' | 'lever' | 'bamboohr' | 'taleo' | 'generic';
  parsingAccuracy: number; // 0-1
  keywordMatching: number; // 0-1
  formatCompatibility: number; // 0-1
  overallScore: number; // 0-100
  specificIssues: string[];
  optimizationTips: string[];
}

// Enhanced ATS result - consolidated in service-types.ts
// Import from service-types to maintain compatibility
import type { EnhancedATSResult as ServiceEnhancedATSResult } from './service-types';

// Type alias for backward compatibility
export type EnhancedATSResult = ServiceEnhancedATSResult;

// Legacy issue format
export interface ATSIssue {
  type: 'format' | 'content' | 'keyword' | 'structure';
  severity: 'error' | 'warning' | 'info';
  message: string;
  section?: string;
  fix?: string;
}

// Legacy suggestion format
export interface ATSSuggestion {
  section: string;
  original: string;
  suggested: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

// Component props interfaces
export interface ATSScoreProps {
  result: EnhancedATSResult;
  showAdvancedBreakdown?: boolean;
  showSystemScores?: boolean;
  showCompetitorAnalysis?: boolean;
  onApplyRecommendations?: (recommendationIds: string[]) => void;
}

export interface ATSSystemScoresProps {
  systemScores: AdvancedATSScore['atsSystemScores'];
  simulations: ATSSystemSimulation[];
}

export interface ATSBreakdownProps {
  breakdown: AdvancedATSScore['breakdown'];
  showDetails?: boolean;
}

export interface CompetitorAnalysisProps {
  analysis: CompetitorAnalysis;
  currentScore: number;
}

// Utility types
export type ATSSystemType = 'workday' | 'greenhouse' | 'lever' | 'bamboohr' | 'taleo' | 'generic';
export type RecommendationCategory = 'parsing' | 'keywords' | 'formatting' | 'content' | 'specificity';
export type PriorityLevel = 1 | 2 | 3 | 4 | 5;

// Helper functions types
export interface ATSHelpers {
  getScoreColor: (score: number) => string;
  getScoreBgColor: (score: number) => string;
  getPriorityColor: (priority: PriorityLevel) => string;
  getSystemDisplayName: (system: ATSSystemType) => string;
  formatRecommendations: (recommendations: PrioritizedRecommendation[]) => PrioritizedRecommendation[];
  calculatePotentialImprovement: (recommendations: PrioritizedRecommendation[]) => number;
}