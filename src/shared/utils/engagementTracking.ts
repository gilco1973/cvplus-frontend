/**
 * Engagement Tracking Utilities
 * 
 * Core utilities for analyzing user engagement patterns, calculating scores,
 * and determining optimal progression through the premium conversion funnel.
 */

import { 
  UserEngagementData, 
  EngagementStage, 
  UserContext, 
  IncentiveType,
  ProgressiveRevelationConfig,
  EngagementIntensity
} from '../types/progressive-revelation';

/**
 * Calculate comprehensive engagement score from user behavior data
 * Score ranges from 0-100, with higher scores indicating higher conversion likelihood
 */
export function calculateEngagementScore(data: UserEngagementData): number {
  let score = 0;
  
  // Visit frequency scoring (max 25 points)
  const totalVisits = Object.values(data.visitCount).reduce((sum, count) => sum + count, 0);
  score += Math.min(totalVisits * 2, 25);
  
  // Time engagement scoring (max 25 points)
  const totalTimeSpent = Object.values(data.timeSpent).reduce((sum, time) => sum + time, 0);
  const timeInMinutes = totalTimeSpent / (1000 * 60);
  score += Math.min(timeInMinutes * 0.5, 25);
  
  // Interaction depth scoring (max 20 points)
  const totalInteractions = Object.values(data.interactionCount).reduce((sum, count) => sum + count, 0);
  score += Math.min(totalInteractions * 1.5, 20);
  
  // Session depth scoring (max 15 points)
  const avgSessionDepth = Object.values(data.sessionDepth).reduce((sum, session) => {
    return sum + session.featuresExplored.length + session.advancedActionsAttempted;
  }, 0) / Math.max(Object.keys(data.sessionDepth).length, 1);
  score += Math.min(avgSessionDepth * 2, 15);
  
  // Conversion attempt bonus (max 10 points)
  const conversionBonus = data.conversionAttempts.length * 5;
  score += Math.min(conversionBonus, 10);
  
  // Dismissal penalty (subtract up to 15 points)
  const dismissalPenalty = data.dismissalHistory.length * 3;
  score -= Math.min(dismissalPenalty, 15);
  
  // Profile completeness bonus (max 5 points)
  const profileCompleteness = Object.keys(data.profile).filter(key => data.profile[key as keyof typeof data.profile]).length;
  score += Math.min(profileCompleteness, 5);
  
  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Determine engagement stage based on behavior patterns
 */
export function determineEngagementStage(data: UserEngagementData): EngagementStage {
  const engagementScore = calculateEngagementScore(data);
  const totalVisits = Object.values(data.visitCount).reduce((sum, count) => sum + count, 0);
  const conversionAttempts = data.conversionAttempts.length;
  const timeSpent = Object.values(data.timeSpent).reduce((sum, time) => sum + time, 0);
  
  // Conversion stage: High engagement, multiple attempts or deep exploration
  if (engagementScore >= 70 || conversionAttempts >= 2 || (totalVisits >= 8 && timeSpent > 600000)) {
    return 'conversion';
  }
  
  // Consideration stage: Moderate engagement, some attempts or sustained interest
  if (engagementScore >= 45 || conversionAttempts >= 1 || (totalVisits >= 5 && timeSpent > 300000)) {
    return 'consideration';
  }
  
  // Interest stage: Some engagement, multiple visits or meaningful time spent
  if (engagementScore >= 25 || totalVisits >= 3 || timeSpent > 120000) {
    return 'interest';
  }
  
  // Discovery stage: Initial engagement
  return 'discovery';
}

/**
 * Generate personalized messaging based on stage and user context
 */
export function generatePersonalizedMessaging(
  stage: EngagementStage, 
  context: UserContext
): ProgressiveRevelationConfig['messaging'] {
  const industryAdjective = getIndustryAdjective(context.industry);
  const experienceLevel = context.experienceLevel || 'professional';
  
  switch (stage) {
    case 'discovery':
      return {
        headline: `Discover ${industryAdjective} Premium Features`,
        description: `See how ${context.industry} ${experienceLevel}s enhance their profiles with advanced tools.`,
        ctaText: 'Learn More',
        benefits: [
          `Industry-specific ${context.industry} features`,
          'Advanced analytics and insights',
          'Professional profile enhancements'
        ]
      };
      
    case 'interest':
      return {
        headline: `Unlock Your ${context.industry} Career Potential`,
        description: `${context.industry} professionals with premium features get ${getIndustryStats(context.industry)} more opportunities.`,
        ctaText: 'See Premium Features',
        benefits: [
          `${getIndustrySpecificBenefit(context.industry, 1)}`,
          `${getIndustrySpecificBenefit(context.industry, 2)}`,
          `${getIndustrySpecificBenefit(context.industry, 3)}`
        ],
        socialProof: `Trusted by ${getIndustryUserCount(context.industry)} ${context.industry} professionals`
      };
      
    case 'consideration':
      return {
        headline: `Join Elite ${context.industry} Professionals`,
        description: `${context.industry} leaders advance their careers ${getIndustryAdvancementStat(context.industry)} faster with premium profiles.`,
        ctaText: 'Start Premium Trial',
        benefits: [
          `${getIndustrySpecificBenefit(context.industry, 1)}`,
          `${getIndustrySpecificBenefit(context.industry, 2)}`,
          `${getIndustrySpecificBenefit(context.industry, 3)}`,
          'Priority support and guidance'
        ],
        socialProof: `${getIndustryTestimonial(context.industry)}`
      };
      
    case 'conversion':
      return {
        headline: `Final Step: Unlock ${context.industry} Success`,
        description: `You've explored the features - now unlock your ${context.industry} career potential with premium access.`,
        ctaText: 'Upgrade Now',
        benefits: [
          `Complete ${context.industry} profile optimization`,
          'All premium features included',
          'Immediate access to advanced tools',
          '30-day money-back guarantee'
        ],
        urgencyMessage: context.conversionReadiness > 80 ? 'Limited time offer expires soon' : undefined
      };
      
    default:
      return {
        headline: 'Unlock Premium Features',
        description: 'Enhance your professional profile with advanced tools.',
        ctaText: 'Learn More'
      };
  }
}

/**
 * Select optimal incentive based on user context and available options
 */
export function selectOptimalIncentive(
  context: UserContext, 
  availableIncentives: IncentiveType[]
): IncentiveType | null {
  // Filter incentives based on user context
  const eligibleIncentives = availableIncentives.filter(incentive => {
    const conditions = incentive.conditions;
    
    // Check engagement score requirement
    if (context.conversionReadiness < conditions.minEngagementScore) return false;
    
    // Check industry targeting
    if (conditions.industry && !conditions.industry.includes(context.industry)) return false;
    
    // Check behavior pattern targeting
    if (conditions.behaviorPattern) {
      const userPattern = analyzeBehaviorPattern(context);
      if (!conditions.behaviorPattern.includes(userPattern)) return false;
    }
    
    // Check user tenure requirements
    if (conditions.userTenure) {
      if (conditions.userTenure.min && context.userTenure < conditions.userTenure.min) return false;
      if (conditions.userTenure.max && context.userTenure > conditions.userTenure.max) return false;
    }
    
    return true;
  });
  
  if (eligibleIncentives.length === 0) return null;
  
  // Score and rank incentives
  const scoredIncentives = eligibleIncentives.map(incentive => ({
    incentive,
    score: calculateIncentiveScore(incentive, context)
  }));
  
  // Sort by score (highest first)
  scoredIncentives.sort((a, b) => b.score - a.score);
  
  return scoredIncentives[0].incentive;
}

/**
 * Calculate incentive effectiveness score for user context
 */
function calculateIncentiveScore(incentive: IncentiveType, context: UserContext): number {
  let score = 0;
  
  // Base score from incentive value
  score += incentive.value * 0.5;
  
  // Urgency level matching user's decision-making speed
  const urgencyMatch = getUrgencyMatch(incentive.urgencyLevel, context.behaviorProfile.decisionMakingSpeed);
  score += urgencyMatch * 20;
  
  // Industry relevance
  if (incentive.conditions.industry?.includes(context.industry)) {
    score += 30;
  }
  
  // Price sensitivity matching
  const priceMatch = getPriceSensitivityMatch(incentive.type, context.behaviorProfile.pricesSensitivity);
  score += priceMatch * 15;
  
  // Social proof effectiveness
  if (incentive.type === 'social_proof' && context.behaviorProfile.socialProofInfluence === 'high') {
    score += 25;
  }
  
  // Scarcity effectiveness for decisive users
  if (incentive.type === 'scarcity' && context.behaviorProfile.decisionMakingSpeed === 'fast') {
    score += 20;
  }
  
  // Trial offers for cautious users
  if (incentive.type === 'free_trial' && context.behaviorProfile.decisionMakingSpeed === 'slow') {
    score += 25;
  }
  
  return score;
}

/**
 * Analyze user behavior patterns to determine decision-making style
 */
export function analyzeUserBehavior(data: UserEngagementData): UserContext['behaviorProfile'] {
  const totalVisits = Object.values(data.visitCount).reduce((sum, count) => sum + count, 0);
  const totalTime = Object.values(data.timeSpent).reduce((sum, time) => sum + time, 0);
  const avgTimePerVisit = totalVisits > 0 ? totalTime / totalVisits : 0;
  const conversionSpeed = data.conversionAttempts.length > 0 ? 
    (Date.now() - new Date(data.conversionAttempts[0].timestamp).getTime()) / (1000 * 60 * 60 * 24) : null;
  
  // Determine decision-making speed
  let decisionMakingSpeed: 'fast' | 'moderate' | 'slow';
  if (conversionSpeed !== null) {
    if (conversionSpeed < 1) decisionMakingSpeed = 'fast';
    else if (conversionSpeed < 7) decisionMakingSpeed = 'moderate';
    else decisionMakingSpeed = 'slow';
  } else {
    // Fallback based on engagement patterns
    if (avgTimePerVisit < 60000 && totalVisits > 5) decisionMakingSpeed = 'fast';
    else if (avgTimePerVisit > 300000) decisionMakingSpeed = 'slow';
    else decisionMakingSpeed = 'moderate';
  }
  
  // Determine price sensitivity
  let pricesSensitivity: 'low' | 'medium' | 'high';
  const dismissalReasons = data.dismissalHistory.filter(d => d.reason === 'too_expensive').length;
  if (dismissalReasons > 2) pricesSensitivity = 'high';
  else if (dismissalReasons > 0) pricesSensitivity = 'medium';
  else pricesSensitivity = 'low';
  
  // Determine exploration depth
  const avgFeaturesExplored = Object.values(data.sessionDepth).reduce(
    (sum, session) => sum + session.featuresExplored.length, 0
  ) / Math.max(Object.keys(data.sessionDepth).length, 1);
  
  let featureExplorationDepth: 'shallow' | 'moderate' | 'deep';
  if (avgFeaturesExplored > 5) featureExplorationDepth = 'deep';
  else if (avgFeaturesExplored > 2) featureExplorationDepth = 'moderate';
  else featureExplorationDepth = 'shallow';
  
  // Determine social proof influence (simplified)
  let socialProofInfluence: 'low' | 'medium' | 'high';
  if (data.profile.experienceLevel === 'junior') socialProofInfluence = 'high';
  else if (data.profile.experienceLevel === 'executive') socialProofInfluence = 'low';
  else socialProofInfluence = 'medium';
  
  return {
    decisionMakingSpeed,
    pricesSensitivity,
    featureExplorationDepth,
    socialProofInfluence
  };
}

/**
 * Predict conversion probability based on engagement data and context
 */
export function predictConversionProbability(
  data: UserEngagementData, 
  context: UserContext
): number {
  let probability = 0;
  
  // Base probability from engagement score
  probability += context.conversionReadiness * 0.4;
  
  // Stage-based probability adjustments
  const stage = determineEngagementStage(data);
  const stageMultipliers = {
    discovery: 0.1,
    interest: 0.3,
    consideration: 0.6,
    conversion: 0.9
  };
  probability *= stageMultipliers[stage];
  
  // Behavior pattern adjustments
  const behaviorMultipliers = {
    fast: 1.3,
    moderate: 1.0,
    slow: 0.8
  };
  probability *= behaviorMultipliers[context.behaviorProfile.decisionMakingSpeed];
  
  // Previous premium experience bonus
  if (context.previousPremiumExperience) {
    probability *= 1.2;
  }
  
  // Industry-specific adjustments
  const industryMultipliers = {
    technology: 1.1,
    business: 1.0,
    creative: 0.9,
    finance: 1.05,
    marketing: 1.0
  };
  probability *= industryMultipliers[context.industry] || 1.0;
  
  // Recent dismissal penalty
  const recentDismissals = data.dismissalHistory.filter(
    d => Date.now() - new Date(d.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;
  probability *= Math.max(0.3, 1 - (recentDismissals * 0.2));
  
  return Math.max(0, Math.min(100, Math.round(probability)));
}

// Helper functions for industry-specific content
function getIndustryAdjective(industry: string): string {
  const adjectives = {
    technology: 'Tech-Focused',
    business: 'Business-Oriented',
    creative: 'Creative',
    finance: 'Finance-Specific',
    marketing: 'Marketing-Focused'
  };
  return adjectives[industry] || 'Professional';
}

function getIndustryStats(industry: string): string {
  const stats = {
    technology: '3x',
    business: '2.5x',
    creative: '4x',
    finance: '2.8x',
    marketing: '3.2x'
  };
  return stats[industry] || '3x';
}

function getIndustrySpecificBenefit(industry: string, index: number): string {
  const benefits = {
    technology: [
      'GitHub repository integration',
      'Technical skill analytics',
      'Code contribution tracking'
    ],
    business: [
      'LinkedIn profile sync',
      'Performance metrics display',
      'Executive summary generation'
    ],
    creative: [
      'Portfolio gallery creation',
      'Multimedia project showcases',
      'Creative process documentation'
    ],
    finance: [
      'Financial impact quantification',
      'ROI achievement tracking',
      'Regulatory compliance display'
    ],
    marketing: [
      'Campaign results showcase',
      'Marketing ROI analytics',
      'Social media integration'
    ]
  };
  
  return benefits[industry]?.[index - 1] || 'Advanced professional features';
}

function getIndustryUserCount(industry: string): string {
  const counts = {
    technology: '25,000+',
    business: '50,000+',
    creative: '15,000+',
    finance: '30,000+',
    marketing: '20,000+'
  };
  return counts[industry] || '40,000+';
}

function getIndustryAdvancementStat(industry: string): string {
  const stats = {
    technology: '60%',
    business: '45%',
    creative: '70%',
    finance: '55%',
    marketing: '65%'
  };
  return stats[industry] || '55%';
}

function getIndustryTestimonial(industry: string): string {
  const testimonials = {
    technology: 'Software engineers report 40% more technical interview opportunities',
    business: 'Business executives see 50% higher response rates from recruiters',
    creative: 'Creative professionals showcase portfolios that convert 3x better',
    finance: 'Finance professionals quantify impact that resonates with hiring managers',
    marketing: 'Marketing leaders demonstrate ROI that stands out to decision makers'
  };
  return testimonials[industry] || 'Professionals see significant career advancement with premium features';
}

function analyzeBehaviorPattern(context: UserContext): 'cautious' | 'explorer' | 'decisive' | 'analytical' {
  const { behaviorProfile } = context;
  
  if (behaviorProfile.decisionMakingSpeed === 'fast' && behaviorProfile.featureExplorationDepth === 'shallow') {
    return 'decisive';
  }
  
  if (behaviorProfile.featureExplorationDepth === 'deep') {
    return behaviorProfile.decisionMakingSpeed === 'slow' ? 'analytical' : 'explorer';
  }
  
  return 'cautious';
}

function getUrgencyMatch(urgencyLevel: EngagementIntensity, decisionSpeed: 'fast' | 'moderate' | 'slow'): number {
  const matches = {
    low: { fast: 0.3, moderate: 0.8, slow: 1.0 },
    medium: { fast: 0.7, moderate: 1.0, slow: 0.8 },
    high: { fast: 1.0, moderate: 0.8, slow: 0.4 },
    urgent: { fast: 1.0, moderate: 0.6, slow: 0.2 }
  };
  
  return matches[urgencyLevel][decisionSpeed];
}

function getPriceSensitivityMatch(incentiveType: IncentiveType['type'], priceSensitivity: 'low' | 'medium' | 'high'): number {
  const matches = {
    discount: { low: 0.5, medium: 0.8, high: 1.0 },
    free_trial: { low: 0.6, medium: 1.0, high: 1.0 },
    bundle: { low: 0.8, medium: 0.9, high: 0.7 },
    scarcity: { low: 1.0, medium: 0.7, high: 0.4 },
    social_proof: { low: 0.7, medium: 0.8, high: 0.6 },
    bonus: { low: 1.0, medium: 0.8, high: 0.5 }
  };
  
  return matches[incentiveType]?.[priceSensitivity] || 0.5;
}

export default {
  calculateEngagementScore,
  determineEngagementStage,
  generatePersonalizedMessaging,
  selectOptimalIncentive,
  analyzeUserBehavior,
  predictConversionProbability
};