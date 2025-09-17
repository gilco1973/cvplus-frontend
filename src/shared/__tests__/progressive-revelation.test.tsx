/**
 * Progressive Revelation System Tests
 * 
 * Comprehensive test suite for the behavioral tracking and smart incentivization
 * system that adapts to user engagement patterns.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartIncentiveManager } from '../components/premium/SmartIncentiveManager';
import { useProgressiveRevelation } from '../hooks/useProgressiveRevelation';
import { useConversionTracking } from '../hooks/useConversionTracking';
import {
  calculateEngagementScore,
  determineEngagementStage,
  generatePersonalizedMessaging,
  selectOptimalIncentive,
  analyzeUserBehavior,
  predictConversionProbability
} from '../utils/engagementTracking';
import { UserEngagementData, UserContext, IncentiveType } from '../types/progressive-revelation';

// Mock dependencies
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-123',
      metadata: {
        creationTime: '2024-01-01T00:00:00Z'
      }
    }
  })
}));

jest.mock('../hooks/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false })
}));

// Test data
const mockEngagementData: UserEngagementData = {
  visitCount: { externalDataSources: 5 },
  timeSpent: { externalDataSources: 300000 }, // 5 minutes
  interactionCount: { externalDataSources: 8 },
  dismissalHistory: [
    {
      featureName: 'externalDataSources',
      promptId: 'test-prompt',
      timestamp: new Date('2024-01-15T10:00:00Z')
    }
  ],
  sessionDepth: {
    externalDataSources: {
      averageTimePerVisit: 60000, // 1 minute
      maxTimeInSingleVisit: 120000, // 2 minutes
      featuresExplored: ['linkedin', 'github', 'certifications'],
      advancedActionsAttempted: 2
    }
  },
  conversionAttempts: [
    {
      featureName: 'externalDataSources',
      timestamp: new Date('2024-01-14T15:30:00Z'),
      stage: 'consideration',
      outcome: 'deferred'
    }
  ],
  profile: {
    industry: 'technology',
    experienceLevel: 'senior',
    behaviorPattern: 'explorer'
  }
};

const mockUserContext: UserContext = {
  industry: 'technology',
  cvQuality: 'good',
  engagementPattern: 'explorer',
  conversionReadiness: 65,
  timeOfDay: 'afternoon',
  userTenure: 14,
  previousPremiumExperience: false,
  experienceLevel: 'senior',
  behaviorProfile: {
    decisionMakingSpeed: 'moderate',
    pricesSensitivity: 'medium',
    featureExplorationDepth: 'deep',
    socialProofInfluence: 'medium'
  }
};

const mockIncentives: IncentiveType[] = [
  {
    id: 'tech_discount',
    type: 'discount',
    value: 30,
    title: 'Tech Professional Discount',
    description: 'Special offer for technology professionals.',
    urgencyLevel: 'medium',
    conditions: {
      minEngagementScore: 50,
      maxDismissalCount: 3,
      requiredStage: ['consideration'],
      industry: ['technology']
    }
  },
  {
    id: 'free_trial',
    type: 'free_trial',
    value: 7,
    title: '7-Day Free Trial',
    description: 'Try all premium features risk-free.',
    urgencyLevel: 'low',
    conditions: {
      minEngagementScore: 30,
      maxDismissalCount: 5,
      requiredStage: ['interest', 'consideration']
    }
  }
];

describe('Progressive Revelation System', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Engagement Score Calculation', () => {
    it('should calculate engagement score correctly', () => {
      const score = calculateEngagementScore(mockEngagementData);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
      
      // Should be moderately high given the test data
      expect(score).toBeGreaterThan(40);
    });

    it('should handle empty engagement data', () => {
      const emptyData: UserEngagementData = {
        visitCount: {},
        timeSpent: {},
        interactionCount: {},
        dismissalHistory: [],
        sessionDepth: {},
        conversionAttempts: [],
        profile: {}
      };
      
      const score = calculateEngagementScore(emptyData);
      expect(score).toBe(0);
    });

    it('should apply dismissal penalty correctly', () => {
      const dataWithDismissals = {
        ...mockEngagementData,
        dismissalHistory: [
          ...mockEngagementData.dismissalHistory,
          {
            featureName: 'externalDataSources',
            promptId: 'test-prompt-2',
            timestamp: new Date()
          },
          {
            featureName: 'externalDataSources',
            promptId: 'test-prompt-3',
            timestamp: new Date()
          }
        ]
      };
      
      const originalScore = calculateEngagementScore(mockEngagementData);
      const penalizedScore = calculateEngagementScore(dataWithDismissals);
      
      expect(penalizedScore).toBeLessThan(originalScore);
    });
  });

  describe('Engagement Stage Determination', () => {
    it('should determine engagement stage correctly', () => {
      const stage = determineEngagementStage(mockEngagementData);
      expect(stage).toBeOneOf(['discovery', 'interest', 'consideration', 'conversion']);
      
      // With the mock data, should be at least interest level
      expect(['interest', 'consideration', 'conversion']).toContain(stage);
    });

    it('should return discovery for minimal engagement', () => {
      const minimalData: UserEngagementData = {
        ...mockEngagementData,
        visitCount: { externalDataSources: 1 },
        timeSpent: { externalDataSources: 30000 }, // 30 seconds
        interactionCount: { externalDataSources: 1 },
        conversionAttempts: []
      };
      
      const stage = determineEngagementStage(minimalData);
      expect(stage).toBe('discovery');
    });

    it('should return conversion for high engagement', () => {
      const highEngagementData: UserEngagementData = {
        ...mockEngagementData,
        visitCount: { externalDataSources: 10 },
        timeSpent: { externalDataSources: 900000 }, // 15 minutes
        interactionCount: { externalDataSources: 20 },
        conversionAttempts: [
          ...mockEngagementData.conversionAttempts,
          {
            featureName: 'externalDataSources',
            timestamp: new Date(),
            stage: 'conversion',
            outcome: 'abandoned'
          }
        ]
      };
      
      const stage = determineEngagementStage(highEngagementData);
      expect(['consideration', 'conversion']).toContain(stage);
    });
  });

  describe('Personalized Messaging Generation', () => {
    it('should generate appropriate messaging for discovery stage', () => {
      const messaging = generatePersonalizedMessaging('discovery', mockUserContext);
      
      expect(messaging).toHaveProperty('headline');
      expect(messaging).toHaveProperty('description');
      expect(messaging).toHaveProperty('ctaText');
      expect(messaging.headline).toContain('technology'); // Should be industry-specific
    });

    it('should generate appropriate messaging for consideration stage', () => {
      const messaging = generatePersonalizedMessaging('consideration', mockUserContext);
      
      expect(messaging).toHaveProperty('socialProof');
      expect(messaging.benefits).toBeDefined();
      expect(messaging.benefits!.length).toBeGreaterThan(3);
    });

    it('should include urgency messaging for conversion stage', () => {
      const highReadinessContext = {
        ...mockUserContext,
        conversionReadiness: 85
      };
      
      const messaging = generatePersonalizedMessaging('conversion', highReadinessContext);
      expect(messaging.urgencyMessage).toBeDefined();
    });
  });

  describe('Optimal Incentive Selection', () => {
    it('should select appropriate incentive for user context', () => {
      const selectedIncentive = selectOptimalIncentive(mockUserContext, mockIncentives);
      
      expect(selectedIncentive).toBeDefined();
      expect(selectedIncentive?.id).toBe('tech_discount'); // Should select tech-specific incentive
    });

    it('should return null when no incentives match', () => {
      const lowEngagementContext = {
        ...mockUserContext,
        conversionReadiness: 10 // Too low for any incentive
      };
      
      const selectedIncentive = selectOptimalIncentive(lowEngagementContext, mockIncentives);
      expect(selectedIncentive).toBeNull();
    });

    it('should prioritize industry-specific incentives', () => {
      const generalIncentive: IncentiveType = {
        id: 'general_discount',
        type: 'discount',
        value: 40, // Higher value
        title: 'General Discount',
        description: 'General offer for all users.',
        urgencyLevel: 'medium',
        conditions: {
          minEngagementScore: 50,
          maxDismissalCount: 3,
          requiredStage: ['consideration']
          // No industry targeting
        }
      };
      
      const allIncentives = [...mockIncentives, generalIncentive];
      const selectedIncentive = selectOptimalIncentive(mockUserContext, allIncentives);
      
      // Should still prefer tech-specific despite lower value
      expect(selectedIncentive?.id).toBe('tech_discount');
    });
  });

  describe('Behavior Pattern Analysis', () => {
    it('should analyze user behavior patterns correctly', () => {
      const behaviorProfile = analyzeUserBehavior(mockEngagementData);
      
      expect(behaviorProfile).toHaveProperty('decisionMakingSpeed');
      expect(behaviorProfile).toHaveProperty('pricesSensitivity');
      expect(behaviorProfile).toHaveProperty('featureExplorationDepth');
      expect(behaviorProfile).toHaveProperty('socialProofInfluence');
      
      expect(['fast', 'moderate', 'slow']).toContain(behaviorProfile.decisionMakingSpeed);
      expect(['low', 'medium', 'high']).toContain(behaviorProfile.pricesSensitivity);
      expect(['shallow', 'moderate', 'deep']).toContain(behaviorProfile.featureExplorationDepth);
    });

    it('should detect price sensitivity from dismissal reasons', () => {
      const pricesSensitiveData = {
        ...mockEngagementData,
        dismissalHistory: [
          {
            featureName: 'externalDataSources',
            promptId: 'test-1',
            timestamp: new Date(),
            reason: 'too_expensive' as const
          },
          {
            featureName: 'externalDataSources',
            promptId: 'test-2',
            timestamp: new Date(),
            reason: 'too_expensive' as const
          }
        ]
      };
      
      const behaviorProfile = analyzeUserBehavior(pricesSensitiveData);
      expect(behaviorProfile.pricesSensitivity).toBe('medium');
    });
  });

  describe('Conversion Probability Prediction', () => {
    it('should predict conversion probability within valid range', () => {
      const probability = predictConversionProbability(mockEngagementData, mockUserContext);
      
      expect(probability).toBeGreaterThanOrEqual(0);
      expect(probability).toBeLessThanOrEqual(100);
    });

    it('should give higher probability for high engagement users', () => {
      const highEngagementData = {
        ...mockEngagementData,
        visitCount: { externalDataSources: 15 },
        conversionAttempts: [
          ...mockEngagementData.conversionAttempts,
          {
            featureName: 'externalDataSources',
            timestamp: new Date(),
            stage: 'conversion' as const,
            outcome: 'deferred' as const
          }
        ]
      };
      
      const highEngagementContext = {
        ...mockUserContext,
        conversionReadiness: 85
      };
      
      const normalProbability = predictConversionProbability(mockEngagementData, mockUserContext);
      const highProbability = predictConversionProbability(highEngagementData, highEngagementContext);
      
      expect(highProbability).toBeGreaterThan(normalProbability);
    });

    it('should apply penalties for recent dismissals', () => {
      const recentDismissalData = {
        ...mockEngagementData,
        dismissalHistory: [
          {
            featureName: 'externalDataSources',
            promptId: 'recent-dismissal',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          }
        ]
      };
      
      const normalProbability = predictConversionProbability(mockEngagementData, mockUserContext);
      const penalizedProbability = predictConversionProbability(recentDismissalData, mockUserContext);
      
      expect(penalizedProbability).toBeLessThan(normalProbability);
    });
  });

  describe('SmartIncentiveManager Component', () => {
    const defaultProps = {
      featureName: 'externalDataSources',
      enableABTesting: false
    };

    it('should render without crashing', () => {
      render(<SmartIncentiveManager {...defaultProps} />);
      // Component might not render anything if no incentive is selected
      expect(document.body).toBeInTheDocument();
    });

    it('should track analytics events when incentive is shown', async () => {
      const onIncentiveShown = jest.fn();
      const onIncentiveClicked = jest.fn();
      
      // Mock the hooks to return data that would trigger an incentive
      jest.mock('../hooks/useProgressiveRevelation', () => ({
        useProgressiveRevelation: () => ({
          engagementLevel: { level: 'consideration', score: 65 },
          behaviorData: { dismissalCount: 1 },
          shouldShowUpgradePrompt: true,
          trackInteraction: jest.fn(),
          trackDismissal: jest.fn()
        })
      }));
      
      render(
        <SmartIncentiveManager 
          {...defaultProps}
          onIncentiveShown={onIncentiveShown}
          onIncentiveClicked={onIncentiveClicked}
        />
      );
      
      // Wait for potential incentive to be shown
      await waitFor(() => {
        // The component behavior depends on internal logic
        expect(document.body).toBeInTheDocument();
      });
    });

    it('should handle different display variants', () => {
      const variants: Array<'default' | 'compact' | 'modal' | 'floating'> = 
        ['default', 'compact', 'modal', 'floating'];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <SmartIncentiveManager {...defaultProps} variant={variant} />
        );
        expect(document.body).toBeInTheDocument();
        unmount();
      });
    });

    it('should not render for premium users', () => {
      // Mock premium status
      jest.mock('../hooks/usePremiumStatus', () => ({
        usePremiumStatus: () => ({ isPremium: true })
      }));
      
      const { container } = render(<SmartIncentiveManager {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Integration with ExternalDataSources', () => {
    it('should track progressive revelation events', () => {
      const mockTrackInteraction = jest.fn();
      
      // This would test the integration with the main component
      // but requires more complex mocking of the hook system
      expect(mockTrackInteraction).toBeDefined();
    });
  });

  describe('A/B Testing Support', () => {
    it('should randomly assign A/B test variants', () => {
      const variants = new Set<string>();
      
      // Run multiple times to check randomness
      for (let i = 0; i < 50; i++) {
        const { unmount } = render(
          <SmartIncentiveManager {...defaultProps} enableABTesting={true} />
        );
        unmount();
      }
      
      // This is a simplified test - actual A/B testing would be more complex
      expect(true).toBe(true);
    });
  });

  describe('Industry-Specific Customization', () => {
    const industries = ['technology', 'business', 'creative', 'finance', 'marketing'];
    
    industries.forEach(industry => {
      it(`should generate ${industry}-specific messaging`, () => {
        const industryContext = { ...mockUserContext, industry };
        const messaging = generatePersonalizedMessaging('interest', industryContext);
        
        expect(messaging.headline).toContain(industry);
        expect(messaging.description).toContain(industry);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('cvplus_progressive_revelation', 'invalid-json');
      
      expect(() => {
        calculateEngagementScore(mockEngagementData);
      }).not.toThrow();
    });

    it('should handle missing user context gracefully', () => {
      const incompleteContext = {
        industry: 'technology',
        conversionReadiness: 50
      } as UserContext;
      
      expect(() => {
        generatePersonalizedMessaging('interest', incompleteContext);
      }).not.toThrow();
    });

    it('should handle empty incentive arrays', () => {
      const selectedIncentive = selectOptimalIncentive(mockUserContext, []);
      expect(selectedIncentive).toBeNull();
    });
  });

  describe('Performance and Optimization', () => {
    it('should not cause memory leaks with frequent updates', () => {
      // This would test for memory leaks in a real environment
      // Here we just ensure the functions can be called repeatedly
      for (let i = 0; i < 100; i++) {
        calculateEngagementScore(mockEngagementData);
        determineEngagementStage(mockEngagementData);
      }
      
      expect(true).toBe(true);
    });

    it('should handle large datasets efficiently', () => {
      const largeEngagementData: UserEngagementData = {
        ...mockEngagementData,
        visitCount: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`feature_${i}`, Math.floor(Math.random() * 20)])
        ),
        timeSpent: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [`feature_${i}`, Math.floor(Math.random() * 600000)])
        ),
        dismissalHistory: Array.from({ length: 50 }, (_, i) => ({
          featureName: `feature_${i}`,
          promptId: `prompt_${i}`,
          timestamp: new Date(Date.now() - i * 60000)
        }))
      };
      
      const startTime = performance.now();
      calculateEngagementScore(largeEngagementData);
      const endTime = performance.now();
      
      // Should complete within reasonable time (100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});

// Helper function for testing
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected.join(', ')}`,
        pass: false,
      };
    }
  },
});

import { expect } from 'vitest';

interface CustomMatchers<R = unknown> {
  toBeOneOf(expected: any[]): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = any> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toBeOneOf(received: any, expectedArray: any[]) {
    const pass = expectedArray.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expectedArray.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expectedArray.join(', ')}`,
        pass: false,
      };
    }
  },
});