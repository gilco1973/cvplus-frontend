/**
 * Feature Priority Service
 * 
 * Implements intelligent feature ordering based on user preferences,
 * historical performance data, dependencies, and optimization strategies
 * for the CV enhancement process.
 */

import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface FeaturePriority {
  featureId: string;
  featureName: string;
  basePriority: number; // 1-10 scale
  adjustedPriority: number;
  reasoning: string[];
  dependencies: string[];
  estimatedDuration: number;
  successRate: number;
  userPreference: number;
  businessValue: number;
  technicalComplexity: number;
  prerequisites: string[];
}

export interface PriorityFactors {
  userHistory: number;
  performanceData: number;
  dependencies: number;
  businessValue: number;
  technicalRisk: number;
  timeConstraints: number;
}

export interface FeatureMetadata {
  id: string;
  name: string;
  category: 'visual' | 'interactive' | 'data' | 'media' | 'integration';
  baseTime: number; // estimated minutes
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
  prerequisites: string[];
  businessValue: number; // 1-10
  userAppeal: number; // 1-10
  technicalRisk: number; // 1-10
  resourceIntensive: boolean;
}

export interface UserPreferences {
  userId: string;
  preferredCategories: string[];
  completedFeatures: string[];
  failedFeatures: string[];
  timeConstraints: {
    maxDuration: number; // minutes
    preferQuick: boolean;
  };
  priorityWeights: {
    speed: number;
    quality: number;
    innovation: number;
    reliability: number;
  };
  lastUpdated: number;
}

export interface PriorityContext {
  userId: string;
  jobId: string;
  selectedFeatures: string[];
  totalTimeEstimate: number;
  currentSystemLoad: number;
  previousSuccessRates: Record<string, number>;
  userPreferences: UserPreferences;
}

export class FeaturePriorityService {
  private featureMetadata: Map<string, FeatureMetadata> = new Map();
  private userPreferences: Map<string, UserPreferences> = new Map();
  private priorityHistory: Map<string, FeaturePriority[]> = new Map();

  constructor() {
    this.initializeFeatureMetadata();
  }

  /**
   * Initialize feature metadata with baseline characteristics
   */
  private initializeFeatureMetadata(): void {
    const features: FeatureMetadata[] = [
      {
        id: 'skills-visualization',
        name: 'Skills Visualization',
        category: 'visual',
        baseTime: 2,
        complexity: 'low',
        dependencies: [],
        prerequisites: [],
        businessValue: 8,
        userAppeal: 9,
        technicalRisk: 3,
        resourceIntensive: false
      },
      {
        id: 'certification-badges',
        name: 'Certification Badges',
        category: 'visual',
        baseTime: 3,
        complexity: 'low',
        dependencies: [],
        prerequisites: [],
        businessValue: 7,
        userAppeal: 8,
        technicalRisk: 2,
        resourceIntensive: false
      },
      {
        id: 'interactive-timeline',
        name: 'Interactive Timeline',
        category: 'interactive',
        baseTime: 5,
        complexity: 'medium',
        dependencies: [],
        prerequisites: [],
        businessValue: 9,
        userAppeal: 10,
        technicalRisk: 5,
        resourceIntensive: true
      },
      {
        id: 'portfolio-gallery',
        name: 'Portfolio Gallery',
        category: 'media',
        baseTime: 4,
        complexity: 'medium',
        dependencies: [],
        prerequisites: [],
        businessValue: 8,
        userAppeal: 9,
        technicalRisk: 4,
        resourceIntensive: true
      },
      {
        id: 'calendar-integration',
        name: 'Calendar Integration',
        category: 'integration',
        baseTime: 6,
        complexity: 'high',
        dependencies: ['interactive-timeline'],
        prerequisites: [],
        businessValue: 9,
        userAppeal: 8,
        technicalRisk: 7,
        resourceIntensive: false
      },
      {
        id: 'video-introduction',
        name: 'Video Introduction',
        category: 'media',
        baseTime: 8,
        complexity: 'high',
        dependencies: [],
        prerequisites: ['portfolio-gallery'],
        businessValue: 10,
        userAppeal: 10,
        technicalRisk: 8,
        resourceIntensive: true
      },
      {
        id: 'generate-podcast',
        name: 'Career Podcast',
        category: 'media',
        baseTime: 12,
        complexity: 'high',
        dependencies: [],
        prerequisites: ['skills-visualization', 'interactive-timeline'],
        businessValue: 9,
        userAppeal: 9,
        technicalRisk: 9,
        resourceIntensive: true
      },
      {
        id: 'language-proficiency',
        name: 'Language Proficiency',
        category: 'visual',
        baseTime: 3,
        complexity: 'low',
        dependencies: ['skills-visualization'],
        prerequisites: [],
        businessValue: 6,
        userAppeal: 7,
        technicalRisk: 3,
        resourceIntensive: false
      }
    ];

    features.forEach(feature => {
      this.featureMetadata.set(feature.id, feature);
    });
  }

  /**
   * Calculate optimized feature priorities
   */
  async calculatePriorities(context: PriorityContext): Promise<FeaturePriority[]> {
    const priorities: FeaturePriority[] = [];

    // Load or create user preferences
    const userPrefs = await this.getUserPreferences(context.userId);
    
    for (const featureId of context.selectedFeatures) {
      const metadata = this.featureMetadata.get(featureId);
      if (!metadata) continue;

      const priority = await this.calculateFeaturePriority(
        metadata,
        context,
        userPrefs
      );

      priorities.push(priority);
    }

    // Sort by adjusted priority (highest first)
    priorities.sort((a, b) => b.adjustedPriority - a.adjustedPriority);

    // Apply dependency ordering
    const orderedPriorities = this.applyDependencyOrdering(priorities);

    // Store priority calculation for analysis
    this.priorityHistory.set(context.jobId, orderedPriorities);

    return orderedPriorities;
  }

  /**
   * Calculate priority for a single feature
   */
  private async calculateFeaturePriority(
    metadata: FeatureMetadata,
    context: PriorityContext,
    userPrefs: UserPreferences
  ): Promise<FeaturePriority> {
    const factors = this.calculatePriorityFactors(metadata, context, userPrefs);
    
    // Base priority from metadata
    let adjustedPriority = metadata.businessValue * 0.3 + metadata.userAppeal * 0.3;

    // Apply user preference weighting
    adjustedPriority += this.calculateUserPreferenceScore(metadata, userPrefs) * 0.2;

    // Apply performance factors
    adjustedPriority += this.calculatePerformanceScore(metadata, context) * 0.15;

    // Apply risk and complexity adjustments
    adjustedPriority -= (metadata.technicalRisk * 0.05);

    // Apply time constraint considerations
    if (userPrefs.timeConstraints.preferQuick && metadata.baseTime > 5) {
      adjustedPriority -= 1;
    }

    // System load adjustments
    if (context.currentSystemLoad > 0.8 && metadata.resourceIntensive) {
      adjustedPriority -= 1.5;
    }

    // Historical success rate boost
    const successRate = context.previousSuccessRates[metadata.id] || 0.8;
    adjustedPriority += (successRate - 0.5) * 2;

    const reasoning = this.generatePriorityReasoning(metadata, factors, userPrefs);

    return {
      featureId: metadata.id,
      featureName: metadata.name,
      basePriority: metadata.businessValue,
      adjustedPriority: Math.max(0, Math.min(10, adjustedPriority)),
      reasoning,
      dependencies: metadata.dependencies,
      estimatedDuration: this.estimateFeatureDuration(metadata, context),
      successRate,
      userPreference: this.calculateUserPreferenceScore(metadata, userPrefs),
      businessValue: metadata.businessValue,
      technicalComplexity: metadata.technicalRisk,
      prerequisites: metadata.prerequisites
    };
  }

  /**
   * Calculate priority factors
   */
  private calculatePriorityFactors(
    metadata: FeatureMetadata,
    context: PriorityContext,
    userPrefs: UserPreferences
  ): PriorityFactors {
    return {
      userHistory: this.calculateUserHistoryFactor(metadata, userPrefs),
      performanceData: this.calculatePerformanceScore(metadata, context),
      dependencies: this.calculateDependencyFactor(metadata, context),
      businessValue: metadata.businessValue / 10,
      technicalRisk: 1 - (metadata.technicalRisk / 10),
      timeConstraints: this.calculateTimeConstraintFactor(metadata, userPrefs)
    };
  }

  /**
   * Calculate user preference score
   */
  private calculateUserPreferenceScore(metadata: FeatureMetadata, userPrefs: UserPreferences): number {
    let score = 5; // neutral baseline

    // Category preferences
    if (userPrefs.preferredCategories.includes(metadata.category)) {
      score += 2;
    }

    // Completed features boost similar categories
    const completedInCategory = userPrefs.completedFeatures.filter(fId => {
      const fMeta = this.featureMetadata.get(fId);
      return fMeta?.category === metadata.category;
    }).length;
    score += Math.min(1, completedInCategory * 0.3);

    // Failed features reduce confidence in similar categories
    const failedInCategory = userPrefs.failedFeatures.filter(fId => {
      const fMeta = this.featureMetadata.get(fId);
      return fMeta?.category === metadata.category;
    }).length;
    score -= Math.min(2, failedInCategory * 0.5);

    // Priority weights
    const weights = userPrefs.priorityWeights;
    if (weights.speed > 0.7 && metadata.baseTime <= 3) score += 1;
    if (weights.quality > 0.7 && metadata.technicalRisk <= 3) score += 1;
    if (weights.innovation > 0.7 && metadata.userAppeal >= 8) score += 1;
    if (weights.reliability > 0.7 && metadata.technicalRisk <= 4) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  /**
   * Calculate performance score based on historical data
   */
  private calculatePerformanceScore(metadata: FeatureMetadata, context: PriorityContext): number {
    const successRate = context.previousSuccessRates[metadata.id] || 0.8;
    const complexityPenalty = metadata.complexity === 'high' ? 0.2 : 
                             metadata.complexity === 'medium' ? 0.1 : 0;
    
    return Math.max(0, successRate - complexityPenalty);
  }

  /**
   * Calculate user history factor
   */
  private calculateUserHistoryFactor(metadata: FeatureMetadata, userPrefs: UserPreferences): number {
    if (userPrefs.completedFeatures.includes(metadata.id)) return 0.5; // Already completed
    if (userPrefs.failedFeatures.includes(metadata.id)) return 0.3; // Previously failed
    
    // Boost for categories user has success with
    const categorySuccesses = userPrefs.completedFeatures.filter(fId => {
      const fMeta = this.featureMetadata.get(fId);
      return fMeta?.category === metadata.category;
    }).length;
    
    return 0.7 + Math.min(0.3, categorySuccesses * 0.1);
  }

  /**
   * Calculate dependency factor
   */
  private calculateDependencyFactor(metadata: FeatureMetadata, context: PriorityContext): number {
    // Features with no dependencies get priority
    if (metadata.dependencies.length === 0) return 1.0;
    
    // Check if dependencies are in selected features
    const dependenciesMet = metadata.dependencies.every(dep => 
      context.selectedFeatures.includes(dep)
    );
    
    return dependenciesMet ? 0.8 : 0.3; // Heavy penalty if dependencies not selected
  }

  /**
   * Calculate time constraint factor
   */
  private calculateTimeConstraintFactor(metadata: FeatureMetadata, userPrefs: UserPreferences): number {
    if (!userPrefs.timeConstraints.preferQuick) return 1.0;
    
    // Boost quick features when user prefers speed
    if (metadata.baseTime <= 3) return 1.3;
    if (metadata.baseTime <= 5) return 1.0;
    return 0.7;
  }

  /**
   * Apply dependency ordering to priority list
   */
  private applyDependencyOrdering(priorities: FeaturePriority[]): FeaturePriority[] {
    const ordered: FeaturePriority[] = [];
    const remaining = [...priorities];
    const completed = new Set<string>();

    while (remaining.length > 0) {
      let progressMade = false;

      for (let i = remaining.length - 1; i >= 0; i--) {
        const feature = remaining[i];
        
        // Check if all dependencies are completed
        const dependenciesMet = feature.dependencies.every(dep => completed.has(dep));
        const prerequisitesMet = feature.prerequisites.every(prereq => completed.has(prereq));

        if (dependenciesMet && prerequisitesMet) {
          ordered.push(feature);
          completed.add(feature.featureId);
          remaining.splice(i, 1);
          progressMade = true;
        }
      }

      // If no progress, break to avoid infinite loop
      if (!progressMade) {
        // Add remaining features (dependency issues)
        remaining.forEach(feature => {
          feature.reasoning.push('Dependency ordering may be suboptimal');
          ordered.push(feature);
        });
        break;
      }
    }

    return ordered;
  }

  /**
   * Estimate feature duration with context adjustments
   */
  private estimateFeatureDuration(metadata: FeatureMetadata, context: PriorityContext): number {
    let duration = metadata.baseTime;

    // System load adjustments
    if (context.currentSystemLoad > 0.8) {
      duration *= 1.5;
    } else if (context.currentSystemLoad < 0.3) {
      duration *= 0.8;
    }

    // Resource intensive features take longer under high load
    if (metadata.resourceIntensive && context.currentSystemLoad > 0.6) {
      duration *= 1.3;
    }

    return Math.round(duration);
  }

  /**
   * Generate human-readable reasoning for priority
   */
  private generatePriorityReasoning(
    metadata: FeatureMetadata,
    factors: PriorityFactors,
    userPrefs: UserPreferences
  ): string[] {
    const reasoning: string[] = [];

    if (factors.businessValue > 0.8) {
      reasoning.push('High business value feature');
    }

    if (factors.userHistory > 0.8) {
      reasoning.push('User has success with similar features');
    }

    if (factors.technicalRisk > 0.8) {
      reasoning.push('Low technical risk, high reliability');
    }

    if (metadata.baseTime <= 3) {
      reasoning.push('Quick to implement');
    }

    if (userPrefs.preferredCategories.includes(metadata.category)) {
      reasoning.push('Matches user category preference');
    }

    if (metadata.dependencies.length === 0) {
      reasoning.push('No dependencies, can start immediately');
    }

    if (factors.timeConstraints > 1.1) {
      reasoning.push('Optimized for speed preference');
    }

    if (metadata.userAppeal >= 9) {
      reasoning.push('High user appeal and engagement');
    }

    return reasoning;
  }

  /**
   * Get or create user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const cached = this.userPreferences.get(userId);
    if (cached) return cached;

    try {
      const prefsDoc = await getDoc(doc(db, 'user_preferences', userId));
      
      if (prefsDoc.exists()) {
        const prefs = prefsDoc.data() as UserPreferences;
        this.userPreferences.set(userId, prefs);
        return prefs;
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }

    // Return default preferences
    const defaultPrefs: UserPreferences = {
      userId,
      preferredCategories: ['visual', 'interactive'],
      completedFeatures: [],
      failedFeatures: [],
      timeConstraints: {
        maxDuration: 30,
        preferQuick: false
      },
      priorityWeights: {
        speed: 0.5,
        quality: 0.7,
        innovation: 0.6,
        reliability: 0.8
      },
      lastUpdated: Date.now()
    };

    this.userPreferences.set(userId, defaultPrefs);
    return defaultPrefs;
  }

  /**
   * Update user preferences based on completed/failed features
   */
  async updateUserPreferences(
    userId: string,
    completedFeatures: string[],
    failedFeatures: string[]
  ): Promise<void> {
    const prefs = await this.getUserPreferences(userId);
    
    // Add new completed features
    completedFeatures.forEach(featureId => {
      if (!prefs.completedFeatures.includes(featureId)) {
        prefs.completedFeatures.push(featureId);
      }
    });

    // Add new failed features
    failedFeatures.forEach(featureId => {
      if (!prefs.failedFeatures.includes(featureId)) {
        prefs.failedFeatures.push(featureId);
      }
    });

    // Update category preferences based on successes
    const successfulCategories = completedFeatures
      .map(fId => this.featureMetadata.get(fId)?.category)
      .filter(cat => cat) as string[];

    successfulCategories.forEach(category => {
      if (!prefs.preferredCategories.includes(category)) {
        prefs.preferredCategories.push(category);
      }
    });

    prefs.lastUpdated = Date.now();

    // Store in Firestore
    try {
      await setDoc(doc(db, 'user_preferences', userId), prefs);
      this.userPreferences.set(userId, prefs);
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  /**
   * Get priority recommendations for user
   */
  generateRecommendations(priorities: FeaturePriority[]): string[] {
    const recommendations: string[] = [];

    const highPriority = priorities.filter(p => p.adjustedPriority > 7);
    const lowComplexity = priorities.filter(p => p.technicalComplexity <= 4);
    const quickFeatures = priorities.filter(p => p.estimatedDuration <= 3);

    if (highPriority.length > 0) {
      recommendations.push(`Start with high-priority features: ${highPriority.slice(0, 3).map(p => p.featureName).join(', ')}`);
    }

    if (quickFeatures.length > 0) {
      recommendations.push(`Consider quick wins: ${quickFeatures.slice(0, 2).map(p => p.featureName).join(', ')}`);
    }

    if (lowComplexity.length > 0) {
      recommendations.push(`Low-risk options: ${lowComplexity.slice(0, 2).map(p => p.featureName).join(', ')}`);
    }

    const totalTime = priorities.reduce((sum, p) => sum + p.estimatedDuration, 0);
    if (totalTime > 30) {
      recommendations.push('Consider reducing scope - estimated time exceeds 30 minutes');
    }

    return recommendations;
  }

  /**
   * Get priority analysis report
   */
  getPriorityAnalysis(priorities: FeaturePriority[]): {
    summary: {
      totalFeatures: number;
      averagePriority: number;
      estimatedTotalTime: number;
      riskDistribution: Record<string, number>;
    };
    recommendations: string[];
    optimizations: string[];
  } {
    const summary = {
      totalFeatures: priorities.length,
      averagePriority: priorities.reduce((sum, p) => sum + p.adjustedPriority, 0) / priorities.length,
      estimatedTotalTime: priorities.reduce((sum, p) => sum + p.estimatedDuration, 0),
      riskDistribution: {
        low: priorities.filter(p => p.technicalComplexity <= 3).length,
        medium: priorities.filter(p => p.technicalComplexity > 3 && p.technicalComplexity <= 7).length,
        high: priorities.filter(p => p.technicalComplexity > 7).length
      }
    };

    const recommendations = this.generateRecommendations(priorities);
    
    const optimizations: string[] = [];
    if (summary.riskDistribution.high > summary.totalFeatures * 0.5) {
      optimizations.push('Consider deferring some high-risk features to reduce failure probability');
    }
    
    if (summary.estimatedTotalTime > 45) {
      optimizations.push('Total time estimate is high - consider parallel processing or feature reduction');
    }

    return {
      summary,
      recommendations,
      optimizations
    };
  }

  /**
   * Clear priority cache
   */
  clearCache(): void {
    this.userPreferences.clear();
    this.priorityHistory.clear();
    console.warn('🧹 Feature priority cache cleared');
  }
}

export const featurePriorityService = new FeaturePriorityService();