/**
 * Progressive Revelation System Types
 * 
 * Type definitions for the behavioral tracking and smart incentivization system
 * that adapts to user engagement patterns for premium feature conversion.
 */

import { PremiumFeature } from './premium';

/**
 * User engagement stages based on behavior analysis
 */
export type EngagementStage = 'discovery' | 'interest' | 'consideration' | 'conversion';

/**
 * Engagement intensity levels for adaptive messaging
 */
export type EngagementIntensity = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Messaging strategy types based on behavioral psychology
 */
export type MessagingStrategy = 'curiosity' | 'value' | 'social-proof' | 'urgency' | 'scarcity';

/**
 * User engagement data structure
 */
export interface UserEngagementData {
  /** Number of times user visited each feature */
  visitCount: Record<string, number>;
  
  /** Total time spent examining each feature (milliseconds) */
  timeSpent: Record<string, number>;
  
  /** Number of interactions (clicks, hovers, attempts) per feature */
  interactionCount: Record<string, number>;
  
  /** Timestamps when user dismissed upgrade prompts */
  dismissalHistory: Array<{
    featureName: string;
    promptId: string;
    timestamp: Date;
    reason?: 'not_interested' | 'too_expensive' | 'need_more_info' | 'later';
  }>;
  
  /** How deeply user explored each feature */
  sessionDepth: Record<string, {
    averageTimePerVisit: number;
    maxTimeInSingleVisit: number;
    featuresExplored: string[];
    advancedActionsAttempted: number;
  }>;
  
  /** Conversion attempt tracking */
  conversionAttempts: Array<{
    featureName: string;
    timestamp: Date;
    stage: EngagementStage;
    outcome: 'completed' | 'abandoned' | 'deferred';
    abandonmentPoint?: string;
  }>;
  
  /** Overall user profile characteristics */
  profile: {
    industry?: string;
    experienceLevel?: 'junior' | 'mid' | 'senior' | 'executive';
    cvQuality?: 'basic' | 'good' | 'excellent';
    behaviorPattern?: 'cautious' | 'explorer' | 'decisive' | 'analytical';
  };
}

/**
 * Progressive revelation configuration for a specific feature
 */
export interface ProgressiveRevelationConfig {
  /** Current engagement stage */
  stage: EngagementStage;
  
  /** Messaging intensity level */
  intensity: EngagementIntensity;
  
  /** Primary messaging strategy */
  strategy: MessagingStrategy;
  
  /** Whether to show special offers/incentives */
  showIncentives: boolean;
  
  /** Visual prominence level (1-5) */
  prominenceLevel: number;
  
  /** Recommended messaging content */
  messaging: {
    headline: string;
    description: string;
    ctaText: string;
    benefits?: string[];
    socialProof?: string;
    urgencyMessage?: string;
  };
  
  /** Optimal incentive type for current stage */
  optimalIncentive?: IncentiveType;
}

/**
 * Smart incentive configuration
 */
export interface IncentiveType {
  /** Unique incentive identifier */
  id: string;
  
  /** Type of incentive offered */
  type: 'discount' | 'trial' | 'bundle' | 'scarcity' | 'social_proof' | 'free_trial' | 'bonus';
  
  /** Numeric value (percentage for discounts, days for trials) */
  value: number;
  
  /** Display title */
  title: string;
  
  /** Detailed description */
  description: string;
  
  /** Urgency level */
  urgencyLevel: EngagementIntensity;
  
  /** Expiration date for time-limited offers */
  validUntil?: Date;
  
  /** Targeting conditions */
  conditions: IncentiveConditions;
  
  /** Personalization settings */
  personalization?: {
    industrySpecific: boolean;
    roleBasedMessaging: boolean;
    experienceLevelTargeting: boolean;
  };
  
  /** A/B testing variants */
  variants?: {
    [key: string]: {
      title: string;
      description: string;
      ctaText: string;
    };
  };
}

/**
 * Conditions that determine when an incentive is shown
 */
export interface IncentiveConditions {
  /** Minimum engagement score required */
  minEngagementScore: number;
  
  /** Maximum number of previous dismissals allowed */
  maxDismissalCount: number;
  
  /** Required engagement stages */
  requiredStage: EngagementStage[];
  
  /** Target industries */
  industry?: string[];
  
  /** Optimal time periods */
  timeOfDay?: ('morning' | 'afternoon' | 'evening')[];
  
  /** User tenure requirements */
  userTenure?: {
    min?: number; // days
    max?: number; // days
  };
  
  /** Feature-specific conditions */
  featureConditions?: {
    [featureName: string]: {
      minVisits: number;
      minTimeSpent: number;
      minInteractions: number;
    };
  };
  
  /** Behavioral pattern targeting */
  behaviorPattern?: ('cautious' | 'explorer' | 'decisive' | 'analytical')[];
  
  /** Previous conversion attempt requirements */
  conversionHistory?: {
    maxAttempts?: number;
    excludeRecentFailures?: boolean;
    daysSinceLastAttempt?: number;
  };
}

/**
 * User context for personalized incentive targeting
 */
export interface UserContext {
  /** Detected or declared industry */
  industry: string;
  
  /** Assessed CV quality level */
  cvQuality: 'basic' | 'good' | 'excellent';
  
  /** User engagement pattern classification */
  engagementPattern: 'casual' | 'explorer' | 'power_user';
  
  /** Conversion readiness score (0-100) */
  conversionReadiness: number;
  
  /** Current time context */
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  
  /** Days since user registration */
  userTenure: number;
  
  /** Whether user has previous premium experience */
  previousPremiumExperience: boolean;
  
  /** User's declared experience level */
  experienceLevel?: 'junior' | 'mid' | 'senior' | 'executive';
  
  /** Behavioral characteristics */
  behaviorProfile: {
    decisionMakingSpeed: 'fast' | 'moderate' | 'slow';
    pricesSensitivity: 'low' | 'medium' | 'high';
    featureExplorationDepth: 'shallow' | 'moderate' | 'deep';
    socialProofInfluence: 'low' | 'medium' | 'high';
  };
}

/**
 * Analytics tracking for progressive revelation system
 */
export interface ProgressiveRevelationAnalytics {
  /** Event tracking */
  events: Array<{
    eventType: 'stage_transition' | 'incentive_shown' | 'incentive_clicked' | 'incentive_dismissed' | 'conversion_attempt';
    timestamp: Date;
    featureName: string;
    userId?: string;
    sessionId: string;
    metadata: Record<string, any>;
  }>;
  
  /** Conversion funnel metrics */
  funnelMetrics: {
    discovery: number;
    interest: number;
    consideration: number;
    conversion: number;
  };
  
  /** Incentive performance */
  incentivePerformance: Record<string, {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
  }>;
  
  /** A/B test results */
  abTestResults: Record<string, {
    variants: Record<string, {
      impressions: number;
      clicks: number;
      conversions: number;
    }>;
    winner?: string;
    confidence: number;
  }>;
}

/**
 * Hook return type for progressive revelation
 */
export interface UseProgressiveRevelationReturn {
  /** Current engagement data */
  engagementData: UserEngagementData;
  
  /** Current revelation configuration */
  revelationConfig: ProgressiveRevelationConfig;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Whether upgrade prompt should be shown */
  shouldShowUpgradePrompt: boolean;
  
  /** Tracking functions */
  trackVisit: () => void;
  trackInteraction: (type: string) => void;
  trackTimeSpent: (milliseconds: number) => void;
  trackDismissal: (reason?: string) => void;
  trackConversionAttempt: (outcome: 'completed' | 'abandoned' | 'deferred', abandonmentPoint?: string) => void;
  
  /** Personalized messaging */
  personalizedMessage: {
    headline: string;
    description: string;
    ctaText: string;
  };
  
  /** Optimal incentive for current context */
  optimalIncentive: IncentiveType | null;
  
  /** Utility functions */
  resetEngagementData: () => void;
  exportAnalyticsData: () => void;
}

/**
 * Smart Incentive Manager component props
 */
export interface SmartIncentiveManagerProps {
  /** Feature name being tracked */
  featureName: string;
  
  /** Callback when incentive is shown */
  onIncentiveShown?: (incentive: IncentiveType) => void;
  
  /** Callback when incentive is clicked */
  onIncentiveClicked?: (incentive: IncentiveType) => void;
  
  /** Callback when incentive is dismissed */
  onIncentiveDismissed?: (incentive: IncentiveType) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Enable A/B testing */
  enableABTesting?: boolean;
  
  /** Display variant */
  variant?: 'default' | 'compact' | 'modal' | 'floating';
  
  /** Custom incentive configurations */
  customIncentives?: IncentiveType[];
  
  /** Override user context */
  userContextOverride?: Partial<UserContext>;
}

/**
 * Engagement tracking utility functions
 */
export interface EngagementTrackingUtils {
  /** Calculate engagement score from data */
  calculateEngagementScore: (data: UserEngagementData) => number;
  
  /** Determine optimal engagement stage */
  determineEngagementStage: (data: UserEngagementData) => EngagementStage;
  
  /** Generate personalized messaging */
  generatePersonalizedMessaging: (stage: EngagementStage, context: UserContext) => ProgressiveRevelationConfig['messaging'];
  
  /** Select optimal incentive */
  selectOptimalIncentive: (context: UserContext, availableIncentives: IncentiveType[]) => IncentiveType | null;
  
  /** Analyze user behavior patterns */
  analyzeUserBehavior: (data: UserEngagementData) => UserContext['behaviorProfile'];
  
  /** Predict conversion probability */
  predictConversionProbability: (data: UserEngagementData, context: UserContext) => number;
}

/**
 * Industry-specific configurations
 */
export interface IndustryConfiguration {
  /** Industry identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Industry-specific messaging templates */
  messaging: {
    discovery: string;
    interest: string;
    consideration: string;
    conversion: string;
  };
  
  /** Social proof statistics */
  socialProof: {
    userCount: string;
    successMetric: string;
    testimonial: string;
  };
  
  /** Industry-specific incentive preferences */
  incentivePreferences: {
    preferredTypes: IncentiveType['type'][];
    urgencyTolerance: EngagementIntensity;
    pricesSensitivity: 'low' | 'medium' | 'high';
  };
}

/**
 * Configuration presets for common use cases
 */
export interface ProgressiveRevelationPresets {
  /** External Data Sources feature */
  externalDataSources: {
    stages: Record<EngagementStage, ProgressiveRevelationConfig>;
    incentives: IncentiveType[];
    industryCustomizations: Record<string, Partial<ProgressiveRevelationConfig>>;
  };
  
  /** Advanced Analytics feature */
  advancedAnalytics: {
    stages: Record<EngagementStage, ProgressiveRevelationConfig>;
    incentives: IncentiveType[];
    industryCustomizations: Record<string, Partial<ProgressiveRevelationConfig>>;
  };
  
  /** AI Insights feature */
  aiInsights: {
    stages: Record<EngagementStage, ProgressiveRevelationConfig>;
    incentives: IncentiveType[];
    industryCustomizations: Record<string, Partial<ProgressiveRevelationConfig>>;
  };
  
  /** Multimedia Features */
  multimediaFeatures: {
    stages: Record<EngagementStage, ProgressiveRevelationConfig>;
    incentives: IncentiveType[];
    industryCustomizations: Record<string, Partial<ProgressiveRevelationConfig>>;
  };
}

export default {
  // Type exports for easy importing
  EngagementStage,
  EngagementIntensity,
  MessagingStrategy,
  UserEngagementData,
  ProgressiveRevelationConfig,
  IncentiveType,
  UserContext,
  ProgressiveRevelationAnalytics
};