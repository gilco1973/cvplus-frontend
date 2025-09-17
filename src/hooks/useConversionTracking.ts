import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumStatus } from './usePremiumStatus';

interface ConversionEvent {
  id: string;
  event: string;
  feature: string;
  timestamp: Date;
  engagementLevel: string;
  metadata?: Record<string, any>;
}

interface ConversionFunnelData {
  discovery: number;
  interest: number;
  consideration: number;
  conversion: number;
}

interface ConversionMetrics {
  totalEvents: number;
  conversionRate: number;
  funnel: ConversionFunnelData;
  topPerformingFeatures: Array<{ feature: string; conversions: number }>;
  averageTimeToConversion: number;
  lastUpdated: Date;
}

const ANALYTICS_STORAGE_KEY = 'cvplus_conversion_analytics';
const EVENTS_STORAGE_KEY = 'cvplus_conversion_events';

/**
 * Hook for tracking conversion events and analytics
 * Provides comprehensive conversion funnel analysis
 */
export const useConversionTracking = () => {
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [events, setEvents] = useState<ConversionEvent[]>(() => {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Save events to localStorage
  const saveEvents = useCallback((newEvents: ConversionEvent[]) => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(newEvents));
    } catch (error) {
      console.warn('Failed to save conversion events:', error);
    }
  }, []);
  
  // Track conversion event
  const trackEvent = useCallback((eventType: string, feature: string, metadata?: Record<string, any>) => {
    const event: ConversionEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event: eventType,
      feature,
      timestamp: new Date(),
      engagementLevel: metadata?.engagementLevel || 'unknown',
      metadata: {
        ...metadata,
        userId: user?.uid || 'anonymous',
        isPremium
      }
    };
    
    setEvents(prevEvents => {
      const newEvents = [...prevEvents, event];
      saveEvents(newEvents);
      return newEvents;
    });
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
      console.warn('Analytics Event:', event);
    } else {
      console.warn('Conversion Event Tracked:', event);
    }
  }, [user, isPremium, saveEvents]);
  
  // Calculate conversion metrics
  const calculateMetrics = useCallback((): ConversionMetrics => {
    if (events.length === 0) {
      return {
        totalEvents: 0,
        conversionRate: 0,
        funnel: { discovery: 0, interest: 0, consideration: 0, conversion: 0 },
        topPerformingFeatures: [],
        averageTimeToConversion: 0,
        lastUpdated: new Date()
      };
    }
    
    // Calculate funnel data
    const funnel = events.reduce((acc, event) => {
      const level = event.engagementLevel as keyof ConversionFunnelData;
      if (level in acc) {
        acc[level]++;
      }
      return acc;
    }, { discovery: 0, interest: 0, consideration: 0, conversion: 0 });
    
    // Calculate conversion rate
    const totalFunnelEvents = funnel.discovery + funnel.interest + funnel.consideration;
    const conversionRate = totalFunnelEvents > 0 ? (funnel.conversion / totalFunnelEvents) * 100 : 0;
    
    // Calculate top performing features
    const featureStats = events.reduce((acc, event) => {
      if (event.event === 'conversion') {
        acc[event.feature] = (acc[event.feature] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topPerformingFeatures = Object.entries(featureStats)
      .map(([feature, conversions]) => ({ feature, conversions }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 5);
    
    // Calculate average time to conversion (simplified)
    const conversionEvents = events.filter(e => e.event === 'conversion');
    const avgTimeToConversion = conversionEvents.length > 0 
      ? conversionEvents.reduce((sum, event) => {
          const timeToConversion = event.timestamp.getTime() - events[0].timestamp.getTime();
          return sum + timeToConversion;
        }, 0) / conversionEvents.length
      : 0;
    
    return {
      totalEvents: events.length,
      conversionRate,
      funnel,
      topPerformingFeatures,
      averageTimeToConversion: avgTimeToConversion / (1000 * 60 * 60), // Convert to hours
      lastUpdated: new Date()
    };
  }, [events]);
  
  // Update metrics when events change
  useEffect(() => {
    const newMetrics = calculateMetrics();
    setMetrics(newMetrics);
    
    // Save metrics to localStorage
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(newMetrics));
    } catch (error) {
      console.warn('Failed to save analytics metrics:', error);
    }
  }, [calculateMetrics]);
  
  // Track premium gate interactions
  const trackPremiumGateEvent = useCallback((eventType: 'view' | 'click' | 'dismiss' | 'convert', feature: string, metadata?: Record<string, any>) => {
    const engagementLevel = metadata?.engagementLevel || 'unknown';
    trackEvent(`premium_gate_${eventType}`, feature, { ...metadata, engagementLevel });
  }, [trackEvent]);
  
  // Track feature usage patterns
  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Record<string, any>) => {
    trackEvent(`feature_${action}`, feature, metadata);
  }, [trackEvent]);
  
  // Track A/B test variants
  const trackABTest = useCallback((testName: string, variant: string, feature: string, outcome: 'view' | 'click' | 'convert') => {
    trackEvent(`ab_test_${outcome}`, feature, {
      testName,
      variant,
      outcome
    });
  }, [trackEvent]);
  
  // Get conversion funnel for specific feature
  const getFeatureFunnel = useCallback((feature: string): ConversionFunnelData => {
    const featureEvents = events.filter(e => e.feature === feature);
    return featureEvents.reduce((acc, event) => {
      const level = event.engagementLevel as keyof ConversionFunnelData;
      if (level in acc) {
        acc[level]++;
      }
      return acc;
    }, { discovery: 0, interest: 0, consideration: 0, conversion: 0 });
  }, [events]);
  
  // Get conversion rate for specific feature
  const getFeatureConversionRate = useCallback((feature: string): number => {
    const funnel = getFeatureFunnel(feature);
    const totalFunnelEvents = funnel.discovery + funnel.interest + funnel.consideration;
    return totalFunnelEvents > 0 ? (funnel.conversion / totalFunnelEvents) * 100 : 0;
  }, [getFeatureFunnel]);
  
  // Clear analytics data (for development/testing)
  const clearAnalyticsData = useCallback(() => {
    setEvents([]);
    setMetrics(null);
    localStorage.removeItem(EVENTS_STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  }, []);
  
  // Export analytics data (for analysis)
  const exportAnalyticsData = useCallback(() => {
    const data = {
      events,
      metrics,
      exportDate: new Date(),
      userId: user?.uid || 'anonymous'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cvplus-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, metrics, user]);
  
  return {
    // Analytics data
    events,
    metrics,
    isLoading,
    
    // Tracking functions
    trackEvent,
    trackPremiumGateEvent,
    trackFeatureUsage,
    trackABTest,
    
    // Analysis functions
    getFeatureFunnel,
    getFeatureConversionRate,
    
    // Utility functions
    clearAnalyticsData,
    exportAnalyticsData,
    
    // Helper functions for specific tracking scenarios
    trackUpgradeClick: (feature: string, metadata?: Record<string, any>) => 
      trackPremiumGateEvent('click', feature, metadata),
    trackUpgradeConversion: (feature: string, metadata?: Record<string, any>) => 
      trackPremiumGateEvent('convert', feature, metadata),
    trackFeatureDismiss: (feature: string, metadata?: Record<string, any>) => 
      trackPremiumGateEvent('dismiss', feature, metadata)
  };
};
