/**
 * User Journey Performance Tracker - Phase 6.3.3
 * 
 * Tracks performance across critical user journeys with feature-specific
 * analytics, mobile vs desktop comparison, and business impact correlation.
 * Provides actionable insights for optimizing user experience.
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import { doc, setDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export interface UserJourneyStep {
  stepId: string;
  stepName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'abandoned';
  error?: string;
  metadata?: Record<string, any>;
}

export interface UserJourney {
  journeyId: string;
  journeyType: 'cv_upload_to_completion' | 'feature_generation' | 'video_creation' | 'podcast_generation' | 'portfolio_view';
  userId: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalDuration?: number;
  steps: UserJourneyStep[];
  status: 'in_progress' | 'completed' | 'failed' | 'abandoned';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connectionType: string;
  location?: {
    country: string;
    region: string;
    city?: string;
  };
  performanceMetrics: {
    totalLoadTime: number;
    interactionDelay: number;
    errorCount: number;
    retryCount: number;
  };
  businessMetrics: {
    conversionValue: boolean;
    dropOffStep?: string;
    userSatisfaction?: number;
  };
}

export interface PerformanceBenchmark {
  journeyType: string;
  deviceType: string;
  percentile50: number;
  percentile75: number;
  percentile95: number;
  averageDuration: number;
  successRate: number;
  lastUpdated: number;
}

class UserJourneyTrackerService {
  private static instance: UserJourneyTrackerService;
  private activeJourneys: Map<string, UserJourney> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();

  private constructor() {
    this.initializeBenchmarks();
  }

  public static getInstance(): UserJourneyTrackerService {
    if (!UserJourneyTrackerService.instance) {
      UserJourneyTrackerService.instance = new UserJourneyTrackerService();
    }
    return UserJourneyTrackerService.instance;
  }

  /**
   * Start tracking a new user journey
   */
  public async startJourney(
    journeyType: UserJourney['journeyType'],
    userId: string,
    sessionId: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const journeyId = this.generateJourneyId();
    
    const journey: UserJourney = {
      journeyId,
      journeyType,
      userId,
      sessionId,
      startTime: Date.now(),
      steps: [],
      status: 'in_progress',
      deviceType: this.getDeviceType(),
      connectionType: this.getConnectionType(),
      location: await this.getUserLocation(),
      performanceMetrics: {
        totalLoadTime: 0,
        interactionDelay: 0,
        errorCount: 0,
        retryCount: 0
      },
      businessMetrics: {
        conversionValue: false
      }
    };

    this.activeJourneys.set(journeyId, journey);

    // Store initial journey state
    await this.storeJourney(journey);

    return journeyId;
  }

  /**
   * Track a step within a journey
   */
  public async trackStep(
    journeyId: string,
    stepName: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) {
      throw new Error(`Journey ${journeyId} not found`);
    }

    const stepId = `${journeyId}_step_${journey.steps.length + 1}`;
    const step: UserJourneyStep = {
      stepId,
      stepName,
      startTime: Date.now(),
      status: 'started',
      metadata
    };

    journey.steps.push(step);
    await this.updateJourney(journey);

    return stepId;
  }

  /**
   * Complete a step in the journey
   */
  public async completeStep(
    journeyId: string,
    stepId: string,
    success = true,
    error?: string
  ): Promise<void> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) return;

    const step = journey.steps.find(s => s.stepId === stepId);
    if (!step) return;

    const endTime = Date.now();
    step.endTime = endTime;
    step.duration = endTime - step.startTime;
    step.status = success ? 'completed' : 'failed';
    
    if (error) {
      step.error = error;
      journey.performanceMetrics.errorCount++;
    }

    // Update journey performance metrics
    journey.performanceMetrics.totalLoadTime += step.duration || 0;
    
    // Check for performance issues
    if (step.duration && step.duration > this.getStepThreshold(step.stepName)) {
      await this.recordPerformanceIssue(journey, step);
    }

    await this.updateJourney(journey);
  }

  /**
   * Complete entire user journey
   */
  public async completeJourney(
    journeyId: string,
    success = true,
    businessMetrics?: Partial<UserJourney['businessMetrics']>
  ): Promise<void> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) return;

    const endTime = Date.now();
    journey.endTime = endTime;
    journey.totalDuration = endTime - journey.startTime;
    journey.status = success ? 'completed' : 'failed';

    // Update business metrics
    if (businessMetrics) {
      journey.businessMetrics = { ...journey.businessMetrics, ...businessMetrics };
    }

    // Calculate final performance metrics
    journey.performanceMetrics.interactionDelay = this.calculateInteractionDelay(journey);

    // Compare against benchmarks
    await this.compareAgainstBenchmarks(journey);

    // Store final journey state
    await this.storeJourney(journey);

    // Remove from active journeys
    this.activeJourneys.delete(journeyId);

    // Update benchmarks asynchronously
    this.updateBenchmarks(journey);
  }

  /**
   * Track user abandonment
   */
  public async abandonJourney(journeyId: string, dropOffStep?: string): Promise<void> {
    const journey = this.activeJourneys.get(journeyId);
    if (!journey) return;

    journey.status = 'abandoned';
    journey.endTime = Date.now();
    journey.totalDuration = journey.endTime - journey.startTime;
    
    if (dropOffStep) {
      journey.businessMetrics.dropOffStep = dropOffStep;
    }

    await this.storeJourney(journey);
    this.activeJourneys.delete(journeyId);
  }

  /**
   * Get performance insights for a journey type
   */
  public async getJourneyInsights(
    journeyType: string,
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<any> {
    // This would typically query Firestore for aggregated data
    const insights = {
      averageDuration: 0,
      successRate: 0,
      commonDropOffs: [],
      performanceIssues: [],
      deviceComparison: {
        mobile: { avgDuration: 0, successRate: 0 },
        tablet: { avgDuration: 0, successRate: 0 },
        desktop: { avgDuration: 0, successRate: 0 }
      },
      geographicInsights: {
        regions: [],
        performanceByRegion: {}
      },
      businessImpact: {
        conversionCorrelation: 0,
        revenueImpact: 0,
        userSatisfactionScore: 0
      }
    };

    return insights;
  }

  /**
   * Store journey data in Firestore
   */
  private async storeJourney(journey: UserJourney): Promise<void> {
    const journeyRef = doc(db, 'user_journeys', journey.journeyId);
    await setDoc(journeyRef, {
      ...journey,
      timestamp: serverTimestamp(),
      lastUpdated: serverTimestamp()
    }, { merge: true });
  }

  /**
   * Update journey in Firestore
   */
  private async updateJourney(journey: UserJourney): Promise<void> {
    const journeyRef = doc(db, 'user_journeys', journey.journeyId);
    await updateDoc(journeyRef, {
      steps: journey.steps,
      performanceMetrics: journey.performanceMetrics,
      businessMetrics: journey.businessMetrics,
      lastUpdated: serverTimestamp()
    });
  }

  /**
   * Record performance issue
   */
  private async recordPerformanceIssue(journey: UserJourney, step: UserJourneyStep): Promise<void> {
    const issue = {
      journeyId: journey.journeyId,
      journeyType: journey.journeyType,
      stepId: step.stepId,
      stepName: step.stepName,
      duration: step.duration,
      threshold: this.getStepThreshold(step.stepName),
      deviceType: journey.deviceType,
      connectionType: journey.connectionType,
      location: journey.location,
      timestamp: Date.now(),
      severity: this.calculateIssueSeverity(step.duration || 0, step.stepName)
    };

    const issuesRef = collection(db, 'journey_performance_issues');
    await addDoc(issuesRef, {
      ...issue,
      timestamp: serverTimestamp(),
      resolved: false
    });
  }

  /**
   * Compare journey against benchmarks
   */
  private async compareAgainstBenchmarks(journey: UserJourney): Promise<void> {
    const benchmarkKey = `${journey.journeyType}_${journey.deviceType}`;
    const benchmark = this.benchmarks.get(benchmarkKey);
    
    if (benchmark && journey.totalDuration) {
      const percentile = this.calculatePercentile(journey.totalDuration, benchmark);
      
      if (percentile > 95) {
        // Journey is in the slowest 5%
        await this.recordSlowJourney(journey, benchmark);
      }
    }
  }

  /**
   * Record slow journey for analysis
   */
  private async recordSlowJourney(journey: UserJourney, benchmark: PerformanceBenchmark): Promise<void> {
    const slowJourneyData = {
      journeyId: journey.journeyId,
      journeyType: journey.journeyType,
      duration: journey.totalDuration,
      benchmarkP95: benchmark.percentile95,
      deviceType: journey.deviceType,
      steps: journey.steps,
      location: journey.location,
      timestamp: Date.now()
    };

    const slowJourneysRef = collection(db, 'slow_journeys');
    await addDoc(slowJourneysRef, {
      ...slowJourneyData,
      timestamp: serverTimestamp(),
      analyzed: false
    });
  }

  /**
   * Calculate interaction delay across journey
   */
  private calculateInteractionDelay(journey: UserJourney): number {
    return journey.steps.reduce((total, step) => {
      if (step.stepName.includes('interaction') && step.duration) {
        return total + step.duration;
      }
      return total;
    }, 0);
  }

  /**
   * Get performance threshold for specific step
   */
  private getStepThreshold(stepName: string): number {
    const thresholds: Record<string, number> = {
      'cv_upload': 5000,
      'feature_generation': 15000,
      'video_creation': 60000,
      'podcast_generation': 45000,
      'portfolio_view': 2000,
      'interaction': 300
    };

    const matchedKey = Object.keys(thresholds).find(key => stepName.toLowerCase().includes(key));
    return matchedKey ? thresholds[matchedKey] : 5000;
  }

  /**
   * Calculate issue severity based on duration and step type
   */
  private calculateIssueSeverity(duration: number, stepName: string): 'low' | 'medium' | 'high' | 'critical' {
    const threshold = this.getStepThreshold(stepName);
    const ratio = duration / threshold;

    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate percentile for duration against benchmark
   */
  private calculatePercentile(duration: number, benchmark: PerformanceBenchmark): number {
    if (duration <= benchmark.percentile50) return 50;
    if (duration <= benchmark.percentile75) return 75;
    if (duration <= benchmark.percentile95) return 95;
    return 99;
  }

  /**
   * Update performance benchmarks
   */
  private updateBenchmarks(journey: UserJourney): void {
    // This would typically aggregate data from multiple journeys
    // For now, we'll just update the in-memory benchmarks
    const benchmarkKey = `${journey.journeyType}_${journey.deviceType}`;
    const existing = this.benchmarks.get(benchmarkKey);
    
    if (existing && journey.totalDuration) {
      // Simple running average update (in production, use more sophisticated aggregation)
      existing.averageDuration = (existing.averageDuration + journey.totalDuration) / 2;
      existing.lastUpdated = Date.now();
    }
  }

  /**
   * Initialize default benchmarks
   */
  private initializeBenchmarks(): void {
    const journeyTypes = ['cv_upload_to_completion', 'feature_generation', 'video_creation', 'podcast_generation', 'portfolio_view'];
    const deviceTypes = ['mobile', 'tablet', 'desktop'];

    journeyTypes.forEach(journeyType => {
      deviceTypes.forEach(deviceType => {
        const benchmarkKey = `${journeyType}_${deviceType}`;
        this.benchmarks.set(benchmarkKey, {
          journeyType,
          deviceType,
          percentile50: 10000,
          percentile75: 20000,
          percentile95: 40000,
          averageDuration: 15000,
          successRate: 0.95,
          lastUpdated: Date.now()
        });
      });
    });
  }

  /**
   * Get device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get connection type
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  /**
   * Get user location (placeholder - would use geolocation API)
   */
  private async getUserLocation(): Promise<{ country: string; region: string; city?: string } | undefined> {
    // Placeholder implementation - would use geolocation API or IP-based service
    return {
      country: 'US',
      region: 'CA',
      city: 'San Francisco'
    };
  }

  /**
   * Generate unique journey ID
   */
  private generateJourneyId(): string {
    return `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default UserJourneyTrackerService;