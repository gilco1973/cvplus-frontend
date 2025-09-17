/**
 * Progress Enhancer Service
 * Business logic service for enhanced CV generation progress tracking
 */

import { EnhancedFeatureProgress } from '../hooks/useEnhancedProgressTracking';

// Progress stage definitions
export enum ProgressStage {
  INITIALIZE = 'initialize',
  GENERATE = 'generate',
  ENHANCE = 'enhance',
  COMPLETE = 'complete'
}

// Stage configuration
export interface StageConfig {
  name: string;
  icon: string;
  progressRange: [number, number]; // [start%, end%]
  description: string;
}

// Feature timing estimates (in seconds)
export interface FeatureTiming {
  [featureId: string]: {
    estimatedDuration: number;
    complexity: 'low' | 'medium' | 'high';
    category: 'core' | 'enhancement' | 'multimedia';
  };
}

// Stage configurations
const STAGE_CONFIGS: Record<ProgressStage, StageConfig> = {
  [ProgressStage.INITIALIZE]: {
    name: 'Initialize',
    icon: '🔧',
    progressRange: [0, 10],
    description: 'Setting up CV generation process'
  },
  [ProgressStage.GENERATE]: {
    name: 'Generate',
    icon: '📄',
    progressRange: [10, 60],
    description: 'Creating base CV content'
  },
  [ProgressStage.ENHANCE]: {
    name: 'Enhance',
    icon: '⚡',
    progressRange: [60, 95],
    description: 'Adding interactive features'
  },
  [ProgressStage.COMPLETE]: {
    name: 'Complete',
    icon: '✅',
    progressRange: [95, 100],
    description: 'Finalizing your enhanced CV'
  }
};

// Feature timing estimates
const FEATURE_TIMINGS: FeatureTiming = {
  'privacy-mode': { estimatedDuration: 15, complexity: 'low', category: 'core' },
  'embed-qr-code': { estimatedDuration: 20, complexity: 'low', category: 'enhancement' },
  'skills-visualization': { estimatedDuration: 45, complexity: 'medium', category: 'enhancement' },
  'ats-optimization': { estimatedDuration: 60, complexity: 'medium', category: 'core' },
  'achievement-highlighting': { estimatedDuration: 50, complexity: 'medium', category: 'core' },
  'interactive-timeline': { estimatedDuration: 90, complexity: 'high', category: 'enhancement' },
  'language-proficiency': { estimatedDuration: 40, complexity: 'medium', category: 'enhancement' },
  'certification-badges': { estimatedDuration: 35, complexity: 'medium', category: 'enhancement' },
  'social-media-links': { estimatedDuration: 25, complexity: 'low', category: 'enhancement' },
  'availability-calendar': { estimatedDuration: 70, complexity: 'high', category: 'enhancement' },
  'testimonials-carousel': { estimatedDuration: 65, complexity: 'high', category: 'enhancement' },
  'generate-podcast': { estimatedDuration: 180, complexity: 'high', category: 'multimedia' },
  'video-introduction': { estimatedDuration: 150, complexity: 'high', category: 'multimedia' },
  'portfolio-gallery': { estimatedDuration: 120, complexity: 'high', category: 'multimedia' }
};

export class ProgressEnhancer {
  /**
   * Check if async CV generation is enabled
   */
  static isAsyncModeEnabled(): boolean {
    return import.meta.env.VITE_ENABLE_ASYNC_CV_GENERATION === 'true';
  }

  /**
   * Calculate estimated total time for selected features
   */
  static calculateEstimatedTime(selectedFeatures: string[]): number {
    const baseCVTime = 60; // Base CV generation time in seconds
    const coordinationOverhead = 0.1; // 10% coordination overhead
    
    const featureTime = selectedFeatures.reduce((total, featureId) => {
      const timing = FEATURE_TIMINGS[featureId];
      return total + (timing?.estimatedDuration || 30); // Default 30 seconds for unknown features
    }, 0);
    
    return Math.round((baseCVTime + featureTime) * (1 + coordinationOverhead));
  }

  /**
   * Get current progress stage based on overall progress
   */
  static getCurrentStage(overallProgress: number): ProgressStage {
    if (overallProgress < 10) return ProgressStage.INITIALIZE;
    if (overallProgress < 60) return ProgressStage.GENERATE;
    if (overallProgress < 95) return ProgressStage.ENHANCE;
    return ProgressStage.COMPLETE;
  }

  /**
   * Get stage configuration
   */
  static getStageConfig(stage: ProgressStage): StageConfig {
    return STAGE_CONFIGS[stage];
  }

  /**
   * Calculate progress within current stage
   */
  static getStageProgress(overallProgress: number, stage: ProgressStage): number {
    const config = STAGE_CONFIGS[stage];
    const [stageStart, stageEnd] = config.progressRange;
    const stageRange = stageEnd - stageStart;
    
    if (overallProgress <= stageStart) return 0;
    if (overallProgress >= stageEnd) return 100;
    
    const progressInStage = overallProgress - stageStart;
    return Math.round((progressInStage / stageRange) * 100);
  }

  /**
   * Get feature complexity and timing info
   */
  static getFeatureInfo(featureId: string) {
    return FEATURE_TIMINGS[featureId] || {
      estimatedDuration: 30,
      complexity: 'medium' as const,
      category: 'enhancement' as const
    };
  }

  /**
   * Calculate remaining time based on current progress
   */
  static calculateRemainingTime(
    selectedFeatures: string[],
    progressState: Record<string, EnhancedFeatureProgress>
  ): number {
    let remainingTime = 0;
    
    selectedFeatures.forEach(featureId => {
      const featureProgress = progressState[featureId];
      const featureInfo = this.getFeatureInfo(featureId);
      
      if (!featureProgress || featureProgress.status === 'pending') {
        // Full time for pending features
        remainingTime += featureInfo.estimatedDuration;
      } else if (featureProgress.status === 'processing') {
        // Remaining time for processing features
        const remaining = (100 - featureProgress.progress) / 100;
        remainingTime += featureInfo.estimatedDuration * remaining;
      }
      // No time added for completed or failed features
    });
    
    return Math.round(remainingTime);
  }

  /**
   * Format time duration for display
   */
  static formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Get progress color based on status
   */
  static getProgressColor(status: EnhancedFeatureProgress['status']): string {
    switch (status) {
      case 'completed':
        return '#10b981'; // green-500
      case 'processing':
      case 'retrying':
        return '#3b82f6'; // blue-500
      case 'failed':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Get status icon based on progress status
   */
  static getStatusIcon(status: EnhancedFeatureProgress['status']): string {
    switch (status) {
      case 'completed':
        return '✅';
      case 'processing':
        return '⚙️';
      case 'retrying':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  }

  /**
   * Validate progress data
   */
  static validateProgressData(progress: EnhancedFeatureProgress): boolean {
    return (
      typeof progress.progress === 'number' &&
      progress.progress >= 0 &&
      progress.progress <= 100 &&
      ['pending', 'processing', 'completed', 'failed', 'retrying'].includes(progress.status)
    );
  }

  /**
   * Get feature category color
   */
  static getCategoryColor(featureId: string): string {
    const info = this.getFeatureInfo(featureId);
    switch (info.category) {
      case 'core':
        return '#3b82f6'; // blue-500
      case 'enhancement':
        return '#8b5cf6'; // violet-500
      case 'multimedia':
        return '#f59e0b'; // amber-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  /**
   * Get complexity indicator
   */
  static getComplexityIndicator(featureId: string): string {
    const info = this.getFeatureInfo(featureId);
    switch (info.complexity) {
      case 'low':
        return '●';
      case 'medium':
        return '●●';
      case 'high':
        return '●●●';
      default:
        return '●●';
    }
  }
}