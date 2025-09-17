/**
 * Comprehensive Type Guards for CVPlus Service Results
 * Provides safe type checking to replace dangerous 'as unknown' assertions
 */

import type {
  PortfolioGenerationResult,
  CalendarGenerationResult,
  TestimonialsResult,
  LanguageVisualizationResult,
  PublicProfileResult,
  VideoGenerationResult,
  PodcastGenerationResult,
  ATSAnalysisResult,
  EnhancedATSResult,
  CVParseResult,
  CVAnalysisResult,
  CVEnhancementResult,
  FeatureGenerationResult
} from '../types/service-types';

// Base type guard utility
function hasProperty<T, K extends string>(obj: T, prop: K): obj is T & Record<K, unknown> {
  return obj !== null && typeof obj === 'object' && prop in obj;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Portfolio Generation Result Type Guard
export function isPortfolioGenerationResult(obj: unknown): obj is PortfolioGenerationResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'portfolioData') &&
         Array.isArray(obj.portfolioData) &&
         hasProperty(obj, 'url') &&
         typeof obj.url === 'string' &&
         hasProperty(obj, 'embedCode') &&
         typeof obj.embedCode === 'string' &&
         hasProperty(obj, 'analytics') &&
         isObject(obj.analytics);
}

// Calendar Generation Result Type Guard
export function isCalendarGenerationResult(obj: unknown): obj is CalendarGenerationResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'events') &&
         Array.isArray(obj.events) &&
         hasProperty(obj, 'summary') &&
         isObject(obj.summary) &&
         hasProperty(obj.summary, 'totalEvents') &&
         typeof obj.summary.totalEvents === 'number';
}

// Testimonials Result Type Guard  
export function isTestimonialsResult(obj: unknown): obj is TestimonialsResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'testimonials') &&
         Array.isArray(obj.testimonials) &&
         hasProperty(obj, 'summary') &&
         isObject(obj.summary) &&
         hasProperty(obj, 'displayOptions') &&
         isObject(obj.displayOptions);
}

// Language Visualization Result Type Guard
export function isLanguageVisualizationResult(obj: unknown): obj is LanguageVisualizationResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'visualizations') &&
         Array.isArray(obj.visualizations) &&
         hasProperty(obj, 'proficiencyStats') &&
         isObject(obj.proficiencyStats) &&
         hasProperty(obj, 'recommendations') &&
         Array.isArray(obj.recommendations);
}

// Public Profile Result Type Guard
export function isPublicProfileResult(obj: unknown): obj is PublicProfileResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'slug') &&
         typeof obj.slug === 'string' &&
         hasProperty(obj, 'publicUrl') &&
         typeof obj.publicUrl === 'string' &&
         hasProperty(obj, 'settings') &&
         isObject(obj.settings);
}

// Video Generation Result Type Guard
export function isVideoGenerationResult(obj: unknown): obj is VideoGenerationResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'videoData') &&
         isObject(obj.videoData) &&
         hasProperty(obj, 'processingStatus') &&
         typeof obj.processingStatus === 'string';
}

// Podcast Generation Result Type Guard
export function isPodcastGenerationResult(obj: unknown): obj is PodcastGenerationResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'audioUrl') &&
         typeof obj.audioUrl === 'string' &&
         hasProperty(obj, 'transcript') &&
         typeof obj.transcript === 'string' &&
         hasProperty(obj, 'metadata') &&
         isObject(obj.metadata);
}

// ATS Analysis Result Type Guard
export function isATSAnalysisResult(obj: unknown): obj is ATSAnalysisResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'score') &&
         typeof obj.score === 'number' &&
         hasProperty(obj, 'feedback') &&
         Array.isArray(obj.feedback) &&
         hasProperty(obj, 'keywords') &&
         Array.isArray(obj.keywords);
}

// Enhanced ATS Result Type Guard
export function isEnhancedATSResult(obj: unknown): obj is EnhancedATSResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'score') &&
         typeof obj.score === 'number' &&
         hasProperty(obj, 'recommendations') &&
         Array.isArray(obj.recommendations) &&
         hasProperty(obj, 'semanticAnalysis') &&
         isObject(obj.semanticAnalysis) &&
         hasProperty(obj, 'systemSimulations') &&
         Array.isArray(obj.systemSimulations);
}

// CV Parse Result Type Guard
export function isCVParseResult(obj: unknown): obj is CVParseResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'success') &&
         typeof obj.success === 'boolean' &&
         hasProperty(obj, 'parsedData') &&
         isObject(obj.parsedData);
}

// CV Analysis Result Type Guard
export function isCVAnalysisResult(obj: unknown): obj is CVAnalysisResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'analysis') &&
         isObject(obj.analysis) &&
         hasProperty(obj, 'suggestions') &&
         Array.isArray(obj.suggestions);
}

// CV Enhancement Result Type Guard
export function isCVEnhancementResult(obj: unknown): obj is CVEnhancementResult {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'enhancedData') &&
         isObject(obj.enhancedData) &&
         hasProperty(obj, 'improvements') &&
         Array.isArray(obj.improvements);
}

// Generic Feature Generation Result Type Guard
export function isFeatureGenerationResult<T = unknown>(obj: unknown): obj is FeatureGenerationResult<T> {
  if (!isObject(obj)) return false;
  
  return hasProperty(obj, 'success') &&
         typeof obj.success === 'boolean' &&
         hasProperty(obj, 'data');
}

// Safe console utilities to replace unsafe console.log calls
export const safeConsole = {
  log: (message: string, obj?: unknown): void => {
    if (obj !== undefined) {
      try {
        console.warn(message, JSON.stringify(obj, null, 2));
      } catch (error) {
        console.warn(message, '[Object could not be serialized]', obj);
      }
    } else {
      console.warn(message);
    }
  },
  
  error: (message: string, obj?: unknown): void => {
    if (obj !== undefined) {
      try {
        console.error(message, JSON.stringify(obj, null, 2));
      } catch (error) {
        console.error(message, '[Object could not be serialized]', obj);
      }
    } else {
      console.error(message);
    }
  },
  
  warn: (message: string, obj?: unknown): void => {
    if (obj !== undefined) {
      try {
        console.warn(message, JSON.stringify(obj, null, 2));
      } catch (error) {
        console.warn(message, '[Object could not be serialized]', obj);
      }
    } else {
      console.warn(message);
    }
  },
  
  info: (message: string, obj?: unknown): void => {
    if (obj !== undefined) {
      try {
        console.info(message, JSON.stringify(obj, null, 2));
      } catch (error) {
        console.info(message, '[Object could not be serialized]', obj);
      }
    } else {
      console.info(message);
    }
  }
};

// Utility for safe property access with default values
export function safeGet<T, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  defaultValue: T[K]
): T[K] {
  return obj?.[key] ?? defaultValue;
}

// Utility for safe array access
export function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

// Utility for safe string access
export function safeString(value: string | undefined | null): string {
  return typeof value === 'string' ? value : '';
}

// Utility for safe number access
export function safeNumber(value: number | undefined | null): number {
  return typeof value === 'number' && !isNaN(value) ? value : 0;
}

// Utility for safe object access
export function safeObject<T extends Record<string, unknown>>(
  value: T | undefined | null
): T {
  return (isObject(value) ? value : {}) as T;
}