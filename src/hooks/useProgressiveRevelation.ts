import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from './usePremiumStatus';

interface UserBehaviorData {
  featureInteractions: Record<string, number>;
  timeSpent: Record<string, number>;
  sessionsCount: number;
  firstVisit: Date;
  lastVisit: Date;
  conversionEvents: string[];
  dismissalCount: number;
}

interface EngagementLevel {
  level: 'discovery' | 'interest' | 'consideration' | 'decision';
  score: number;
  triggers: string[];
  messaging: {
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface ProgressiveRevelationState {
  behaviorData: UserBehaviorData;
  engagementLevel: EngagementLevel;
  isLoading: boolean;
  lastUpdated: Date;
}

const STORAGE_KEY = 'cvplus_progressive_revelation';
const SESSION_STORAGE_KEY = 'cvplus_session_behavior';

// Default user behavior data
const getDefaultBehaviorData = (): UserBehaviorData => ({
  featureInteractions: {},
  timeSpent: {},
  sessionsCount: 0,
  firstVisit: new Date(),
  lastVisit: new Date(),
  conversionEvents: [],
  dismissalCount: 0
});

// Calculate engagement level based on behavior data
const calculateEngagementLevel = (behaviorData: UserBehaviorData): EngagementLevel => {
  const totalInteractions = Object.values(behaviorData.featureInteractions).reduce((sum, count) => sum + count, 0);
  const totalTimeSpent = Object.values(behaviorData.timeSpent).reduce((sum, time) => sum + time, 0);
  const daysSinceFirstVisit = Math.floor((Date.now() - behaviorData.firstVisit.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate engagement score (0-100)
  let score = 0;
  score += Math.min(totalInteractions * 2, 30); // Max 30 points from interactions
  score += Math.min(totalTimeSpent / 60, 25); // Max 25 points from time (minutes)
  score += Math.min(behaviorData.sessionsCount * 3, 20); // Max 20 points from sessions
  score += Math.min(daysSinceFirstVisit, 15); // Max 15 points from tenure
  score += behaviorData.conversionEvents.length * 5; // 5 points per conversion event
  score -= Math.min(behaviorData.dismissalCount * 3, 15); // Penalty for dismissals
  
  score = Math.max(0, Math.min(100, score));
  
  // Determine engagement level
  if (score < 20) {
    return {
      level: 'discovery',
      score,
      triggers: ['curiosity', 'awareness'],
      messaging: {
        title: 'Discover Premium Features',
        description: 'See what makes your CV stand out with advanced tools.',
        urgency: 'low'
      }
    };
  } else if (score < 45) {
    return {
      level: 'interest',
      score,
      triggers: ['value_proposition', 'benefits'],
      messaging: {
        title: 'Unlock Your Career Potential',
        description: 'Premium features help you get 3x more interview calls.',
        urgency: 'medium'
      }
    };
  } else if (score < 70) {
    return {
      level: 'consideration',
      score,
      triggers: ['social_proof', 'testimonials', 'comparison'],
      messaging: {
        title: 'Join 10,000+ Successful Professionals',
        description: 'Premium users land their dream jobs 60% faster.',
        urgency: 'high'
      }
    };
  } else {
    return {
      level: 'decision',
      score,
      triggers: ['urgency', 'scarcity', 'incentives'],
      messaging: {
        title: 'Limited Time: 50% Off Premium',
        description: 'Last chance to upgrade before prices increase.',
        urgency: 'critical'
      }
    };
  }
};

/**
 * Hook for progressive revelation and behavioral adaptation
 * Tracks user behavior and provides personalized messaging/incentives
 */
export const useProgressiveRevelation = (featureName: string) => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [state, setState] = useState<ProgressiveRevelationState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const behaviorData = stored ? JSON.parse(stored) : getDefaultBehaviorData();
    
    return {
      behaviorData,
      engagementLevel: calculateEngagementLevel(behaviorData),
      isLoading: false,
      lastUpdated: new Date()
    };
  });
  
  // Session-based behavior tracking
  const [sessionStartTime] = useState(Date.now());
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  
  // Update session time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newSessionTime = Date.now() - sessionStartTime;
      setCurrentSessionTime(newSessionTime);
      
      // Save to session storage
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        startTime: sessionStartTime,
        currentTime: newSessionTime,
        featureName
      }));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [sessionStartTime, featureName]);
  
  // Save behavior data to localStorage whenever it changes
  const saveBehaviorData = useCallback((newBehaviorData: UserBehaviorData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...newBehaviorData,
        userId: user?.uid || 'anonymous',
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('Failed to save behavior data:', error);
    }
  }, [user]);
  
  // Track feature interaction
  const trackInteraction = useCallback((interactionType = 'view') => {
    if (isPremium) return; // Don't track premium users
    
    setState(prevState => {
      const newBehaviorData = {
        ...prevState.behaviorData,
        featureInteractions: {
          ...prevState.behaviorData.featureInteractions,
          [featureName]: (prevState.behaviorData.featureInteractions[featureName] || 0) + 1
        },
        lastVisit: new Date(),
        conversionEvents: interactionType === 'conversion' 
          ? [...prevState.behaviorData.conversionEvents, `${featureName}:${interactionType}`]
          : prevState.behaviorData.conversionEvents
      };
      
      const newEngagementLevel = calculateEngagementLevel(newBehaviorData);
      saveBehaviorData(newBehaviorData);
      
      return {
        ...prevState,
        behaviorData: newBehaviorData,
        engagementLevel: newEngagementLevel,
        lastUpdated: new Date()
      };
    });
  }, [featureName, isPremium, saveBehaviorData]);
  
  // Track time spent on feature
  const trackTimeSpent = useCallback((timeMs: number) => {
    if (isPremium) return; // Don't track premium users
    
    setState(prevState => {
      const newBehaviorData = {
        ...prevState.behaviorData,
        timeSpent: {
          ...prevState.behaviorData.timeSpent,
          [featureName]: (prevState.behaviorData.timeSpent[featureName] || 0) + timeMs
        },
        lastVisit: new Date()
      };
      
      const newEngagementLevel = calculateEngagementLevel(newBehaviorData);
      saveBehaviorData(newBehaviorData);
      
      return {
        ...prevState,
        behaviorData: newBehaviorData,
        engagementLevel: newEngagementLevel,
        lastUpdated: new Date()
      };
    });
  }, [featureName, isPremium, saveBehaviorData]);
  
  // Track dismissal
  const trackDismissal = useCallback(() => {
    if (isPremium) return;
    
    setState(prevState => {
      const newBehaviorData = {
        ...prevState.behaviorData,
        dismissalCount: prevState.behaviorData.dismissalCount + 1,
        lastVisit: new Date()
      };
      
      const newEngagementLevel = calculateEngagementLevel(newBehaviorData);
      saveBehaviorData(newBehaviorData);
      
      return {
        ...prevState,
        behaviorData: newBehaviorData,
        engagementLevel: newEngagementLevel,
        lastUpdated: new Date()
      };
    });
  }, [isPremium, saveBehaviorData]);
  
  // Increment session count on mount
  useEffect(() => {
    if (!isPremium) {
      setState(prevState => {
        const newBehaviorData = {
          ...prevState.behaviorData,
          sessionsCount: prevState.behaviorData.sessionsCount + 1,
          lastVisit: new Date()
        };
        
        const newEngagementLevel = calculateEngagementLevel(newBehaviorData);
        saveBehaviorData(newBehaviorData);
        
        return {
          ...prevState,
          behaviorData: newBehaviorData,
          engagementLevel: newEngagementLevel,
          lastUpdated: new Date()
        };
      });
    }
  }, [featureName, isPremium, saveBehaviorData]);
  
  // Auto-track time spent when component unmounts
  useEffect(() => {
    return () => {
      if (currentSessionTime > 10000) { // Only track if spent more than 10 seconds
        trackTimeSpent(currentSessionTime);
      }
    };
  }, [currentSessionTime, trackTimeSpent]);
  
  // Get personalized messaging for current engagement level
  const getPersonalizedMessage = useCallback(() => {
    const { engagementLevel } = state;
    const interactionCount = state.behaviorData.featureInteractions[featureName] || 0;
    
    // Customize message based on specific feature and interaction count
    if (featureName === 'externalDataSources') {
      switch (engagementLevel.level) {
        case 'discovery':
          return {
            ...engagementLevel.messaging,
            description: 'Import data from GitHub, LinkedIn, and more to create a richer CV.'
          };
        case 'interest':
          return {
            ...engagementLevel.messaging,
            description: `Your CV could include ${Math.floor(Math.random() * 20) + 15} additional achievements from external sources.`
          };
        case 'consideration':
          return {
            ...engagementLevel.messaging,
            description: 'Premium users get 40% more interview callbacks with enriched CVs.'
          };
        case 'decision':
          return {
            ...engagementLevel.messaging,
            description: `You've visited ${interactionCount} times - unlock now with 50% off!`
          };
      }
    }
    
    return engagementLevel.messaging;
  }, [state, featureName]);
  
  // Check if user should see upgrade prompt
  const shouldShowUpgradePrompt = useMemo(() => {
    if (isPremium) return false;
    
    const interactionCount = state.behaviorData.featureInteractions[featureName] || 0;
    const dismissalCount = state.behaviorData.dismissalCount;
    
    // Don't show if dismissed too many times recently
    if (dismissalCount >= 3) return false;
    
    // Show based on engagement level
    return interactionCount >= 1; // Show after first interaction
  }, [isPremium, state.behaviorData, featureName]);
  
  return {
    // State
    engagementLevel: state.engagementLevel,
    behaviorData: state.behaviorData,
    isLoading: state.isLoading,
    shouldShowUpgradePrompt,
    
    // Tracking functions
    trackInteraction,
    trackTimeSpent,
    trackDismissal,
    
    // Messaging
    personalizedMessage: getPersonalizedMessage(),
    
    // Utilities
    resetBehaviorData: () => {
      const defaultData = getDefaultBehaviorData();
      setState({
        behaviorData: defaultData,
        engagementLevel: calculateEngagementLevel(defaultData),
        isLoading: false,
        lastUpdated: new Date()
      });
      localStorage.removeItem(STORAGE_KEY);
    }
  };
};
