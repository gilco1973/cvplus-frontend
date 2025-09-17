/**
 * Core CV and Job Type Definitions
 * Extracted from cvService.ts for better modularity
 */

import type { CVParsedData, CVPersonalInfo } from './cvData';
import type { PrioritizedRecommendation } from './ats';

export interface Job {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'analyzed' | 'generating' | 'completed' | 'failed';
  fileUrl?: string;
  mimeType?: string;
  isUrl?: boolean;
  userInstructions?: string;
  parsedData?: CVParsedData;
  generatedCV?: {
    html: string;
    htmlUrl?: string;
    pdfUrl: string;
    docxUrl: string;
    template?: string;
    features?: string[];
  };
  piiDetection?: {
    hasPII: boolean;
    detectedTypes: string[];
    recommendations: string[];
  };
  privacyVersion?: number;
  quickCreate?: boolean;
  quickCreateReady?: boolean;
  settings?: {
    applyAllEnhancements: boolean;
    generateAllFormats: boolean;
    enablePIIProtection: boolean;
    createPodcast: boolean;
    useRecommendedTemplate: boolean;
  };
  error?: string;
  appliedRecommendations?: PrioritizedRecommendation[];
  transformationSummary?: {
    totalChanges: number;
    sectionsModified: string[];
    newSections: string[];
    keywordsAdded: string[];
    estimatedScoreIncrease: number;
  };
  comparisonReport?: {
    beforeAfter: Array<{
      section: string;
      before: string;
      after: string;
      improvement: string;
    }>;
  };
  improvedCV?: CVParsedData;
  improvementsApplied?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JobCreateParams {
  url?: string;
  quickCreate?: boolean;
  userInstructions?: string;
}

export interface FileUploadParams {
  file: File;
  jobId: string;
}

export interface CVProcessParams {
  jobId: string;
  fileUrl: string;
  mimeType: string;
  isUrl?: boolean;
}

export interface CVAnalysisParams {
  parsedCV: CVParsedData;
  targetRole?: string;
  jobDescription?: string;
  industryKeywords?: string[];
  jobId?: string;
}

export interface TemplateGenerationParams {
  jobId: string;
  templateId: string;
  features: string[];
}

/**
 * Response format for async CV generation initiation
 */
export interface AsyncCVGenerationResponse {
  success: true;
  jobId: string;
  status: 'initiated';
  selectedFeatures: string[];
  estimatedTime: number; // seconds
  message: string;
}

/**
 * Parameters for initiating async CV generation
 */
export interface AsyncCVGenerationParams {
  jobId: string;
  templateId: string;
  features: string[];
}