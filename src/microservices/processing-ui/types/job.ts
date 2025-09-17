// @ts-ignore
/**
 * Job Types for Frontend
 * 
 * Frontend-specific job types and interfaces.
  */

import type { CVData } from '../../shared/types';

export interface Job {
  id: string;
  userId: string;
  cvData: CVData;
  parsedData?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  enhancedFeatures?: {
    atsOptimization?: any;
    personalityInsights?: any;
    timeline?: any;
  };
}

export interface JobProgress {
  stage: string;
  progress: number;
  message?: string;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface JobProcessingOptions {
  skipATS?: boolean;
  skipPersonality?: boolean;
  skipTimeline?: boolean;
  templateId?: string;
}