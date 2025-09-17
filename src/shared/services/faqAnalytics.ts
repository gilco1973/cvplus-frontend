/**
 * FAQ Analytics Service - Comprehensive tracking and insights
 * Tracks user behavior, search patterns, and content effectiveness
 */

// Branded types for analytics
export type EventId = string & { readonly __brand: 'EventId' };
export type SessionId = string & { readonly __brand: 'SessionId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type Timestamp = number & { readonly __brand: 'Timestamp' };

// Analytics event types
export interface AnalyticsEvent {
  id: EventId;
  type: EventType;
  timestamp: Timestamp;
  sessionId: SessionId;
  userId?: UserId;
  data: EventData;
}

export type EventType = 
  | 'search_query'
  | 'search_result_click'
  | 'category_filter'
  | 'tag_filter'
  | 'faq_helpful'
  | 'faq_not_helpful'
  | 'contact_support'
  | 'try_now_click'
  | 'view_pricing_click'
  | 'suggestion_click'
  | 'no_results_found'
  | 'page_view'
  | 'session_start'
  | 'session_end';

// Event data interfaces
export interface SearchQueryEvent {
  query: string;
  category?: string;
  tags?: string[];
  resultsCount: number;
  searchTime: number;
}

export interface SearchResultClickEvent {
  faqId: string;
  query: string;
  position: number;
  score: number;
}

export interface FeedbackEvent {
  faqId: string;
  helpful: boolean;
  query?: string;
  category?: string;
}

export interface FilterEvent {
  filterType: 'category' | 'tag';
  filterValue: string;
  previousValue?: string;
}

export interface ConversionEvent {
  action: 'try_now' | 'view_pricing' | 'contact_support';
  source: 'quick_actions' | 'faq_content' | 'no_results';
  faqId?: string;
  query?: string;
}

export type EventData = 
  | SearchQueryEvent 
  | SearchResultClickEvent 
  | FeedbackEvent 
  | FilterEvent 
  | ConversionEvent 
  | Record<string, any>;

// Analytics metrics interfaces
export interface SearchMetrics {
  totalSearches: number;
  uniqueQueries: number;
  averageSearchTime: number;
  averageResultsPerSearch: number;
  noResultsRate: number;
  popularQueries: Array<{ query: string; count: number }>;
  noResultsQueries: Array<{ query: string; count: number }>;
}

export interface ContentMetrics {
  totalFAQViews: number;
  mostViewedFAQs: Array<{ id: string; question: string; views: number }>;
  helpfulnessRatings: Record<string, { helpful: number; notHelpful: number }>;
  categoryPopularity: Record<string, number>;
  tagPopularity: Record<string, number>;
}

export interface ConversionMetrics {
  tryNowClicks: number;
  pricingViews: number;
  supportContacts: number;
  conversionRate: number;
  topConversionSources: Array<{ source: string; conversions: number }>;
}

export interface UserBehaviorMetrics {
  averageSessionDuration: number;
  averageFAQsViewedPerSession: number;
  bounceRate: number;
  returnUserRate: number;
  searchToConversionFunnel: {
    searches: number;
    faqViews: number;
    conversions: number;
  };
}

// A/B testing interfaces
export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: Timestamp;
  endDate?: Timestamp;
  active: boolean;
  trafficSplit: number[]; // Percentage split for each variant
}

export interface ABTestVariant {
  id: string;
  name: string;
  config: Record<string, any>;
  weight: number;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  metric: string;
  value: number;
  confidence: number;
}

// Main analytics service class
export class FAQAnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: SessionId;
  private userId?: UserId;
  private sessionStartTime: Timestamp;
  private abTests: Map<string, ABTest> = new Map();

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId as UserId;
    this.sessionStartTime = Date.now() as Timestamp;
    
    // Initialize session
    this.trackEvent('session_start', {});
    
    // Set up session end tracking
    this.setupSessionEndTracking();
    
    // Load A/B tests
    this.loadABTests();
  }

  /**
   * Track an analytics event
   */
  trackEvent(type: EventType, data: EventData): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now() as Timestamp,
      sessionId: this.sessionId,
      userId: this.userId,
      data
    };

    this.events.push(event);
    this.persistEvent(event);

    // Process real-time analytics
    this.processRealTimeEvent(event);
  }

  /**
   * Track search query with detailed metrics
   */
  trackSearch(query: string, category: string, tags: string[], resultsCount: number, searchTime: number): void {
    this.trackEvent('search_query', {
      query: query.toLowerCase().trim(),
      category: category === 'all' ? undefined : category,
      tags: tags.length > 0 ? tags : undefined,
      resultsCount,
      searchTime: Math.round(searchTime)
    } as SearchQueryEvent);
  }

  /**
   * Track FAQ result click
   */
  trackFAQClick(faqId: string, query: string, position: number, score: number): void {
    this.trackEvent('search_result_click', {
      faqId,
      query: query.toLowerCase().trim(),
      position,
      score
    } as SearchResultClickEvent);
  }

  /**
   * Track feedback (helpful/not helpful)
   */
  trackFeedback(faqId: string, helpful: boolean, query?: string, category?: string): void {
    this.trackEvent(helpful ? 'faq_helpful' : 'faq_not_helpful', {
      faqId,
      helpful,
      query: query?.toLowerCase().trim(),
      category: category === 'all' ? undefined : category
    } as FeedbackEvent);
  }

  /**
   * Track filter usage
   */
  trackFilter(filterType: 'category' | 'tag', filterValue: string, previousValue?: string): void {
    this.trackEvent(filterType === 'category' ? 'category_filter' : 'tag_filter', {
      filterType,
      filterValue,
      previousValue
    } as FilterEvent);
  }

  /**
   * Track conversion actions
   */
  trackConversion(action: ConversionEvent['action'], source: ConversionEvent['source'], faqId?: string, query?: string): void {
    this.trackEvent(`${action}_click` as EventType, {
      action,
      source,
      faqId,
      query: query?.toLowerCase().trim()
    } as ConversionEvent);
  }

  /**
   * Track no results scenario
   */
  trackNoResults(query: string, category: string, tags: string[]): void {
    this.trackEvent('no_results_found', {
      query: query.toLowerCase().trim(),
      category: category === 'all' ? undefined : category,
      tags: tags.length > 0 ? tags : undefined
    });
  }

  /**
   * Get comprehensive search metrics
   */
  getSearchMetrics(): SearchMetrics {
    const searchEvents = this.events.filter(e => e.type === 'search_query') as Array<AnalyticsEvent & { data: SearchQueryEvent }>;
    
    if (searchEvents.length === 0) {
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageSearchTime: 0,
        averageResultsPerSearch: 0,
        noResultsRate: 0,
        popularQueries: [],
        noResultsQueries: []
      };
    }

    const queries = searchEvents.map(e => e.data.query);
    const uniqueQueries = new Set(queries);
    const totalSearchTime = searchEvents.reduce((sum, e) => sum + e.data.searchTime, 0);
    const totalResults = searchEvents.reduce((sum, e) => sum + e.data.resultsCount, 0);
    const noResultsCount = searchEvents.filter(e => e.data.resultsCount === 0).length;

    // Popular queries
    const queryCount = new Map<string, number>();
    queries.forEach(query => {
      queryCount.set(query, (queryCount.get(query) || 0) + 1);
    });
    
    const popularQueries = Array.from(queryCount.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // No results queries
    const noResultsQueries = searchEvents
      .filter(e => e.data.resultsCount === 0)
      .map(e => e.data.query)
      .reduce((acc, query) => {
        const existing = acc.find(item => item.query === query);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ query, count: 1 });
        }
        return acc;
      }, [] as Array<{ query: string; count: number }>)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSearches: searchEvents.length,
      uniqueQueries: uniqueQueries.size,
      averageSearchTime: totalSearchTime / searchEvents.length,
      averageResultsPerSearch: totalResults / searchEvents.length,
      noResultsRate: noResultsCount / searchEvents.length,
      popularQueries,
      noResultsQueries
    };
  }

  /**
   * Get content effectiveness metrics
   */
  getContentMetrics(): ContentMetrics {
    const clickEvents = this.events.filter(e => e.type === 'search_result_click') as Array<AnalyticsEvent & { data: SearchResultClickEvent }>;
    const feedbackEvents = this.events.filter(e => e.type === 'faq_helpful' || e.type === 'faq_not_helpful') as Array<AnalyticsEvent & { data: FeedbackEvent }>;
    const filterEvents = this.events.filter(e => e.type === 'category_filter' || e.type === 'tag_filter') as Array<AnalyticsEvent & { data: FilterEvent }>;

    // Most viewed FAQs
    const faqViews = new Map<string, number>();
    clickEvents.forEach(e => {
      faqViews.set(e.data.faqId, (faqViews.get(e.data.faqId) || 0) + 1);
    });

    const mostViewedFAQs = Array.from(faqViews.entries())
      .map(([id, views]) => ({ id, question: this.getFAQQuestion(id), views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Helpfulness ratings
    const helpfulnessRatings: Record<string, { helpful: number; notHelpful: number }> = {};
    feedbackEvents.forEach(e => {
      if (!helpfulnessRatings[e.data.faqId]) {
        helpfulnessRatings[e.data.faqId] = { helpful: 0, notHelpful: 0 };
      }
      if (e.data.helpful) {
        helpfulnessRatings[e.data.faqId].helpful++;
      } else {
        helpfulnessRatings[e.data.faqId].notHelpful++;
      }
    });

    // Category and tag popularity
    const categoryPopularity: Record<string, number> = {};
    const tagPopularity: Record<string, number> = {};
    
    filterEvents.forEach(e => {
      if (e.data.filterType === 'category') {
        categoryPopularity[e.data.filterValue] = (categoryPopularity[e.data.filterValue] || 0) + 1;
      } else {
        tagPopularity[e.data.filterValue] = (tagPopularity[e.data.filterValue] || 0) + 1;
      }
    });

    return {
      totalFAQViews: clickEvents.length,
      mostViewedFAQs,
      helpfulnessRatings,
      categoryPopularity,
      tagPopularity
    };
  }

  /**
   * Get conversion metrics
   */
  getConversionMetrics(): ConversionMetrics {
    const conversionEvents = this.events.filter(e => 
      e.type === 'try_now_click' || e.type === 'view_pricing_click' || e.type === 'contact_support'
    ) as Array<AnalyticsEvent & { data: ConversionEvent }>;
    
    const tryNowClicks = conversionEvents.filter(e => e.data.action === 'try_now').length;
    const pricingViews = conversionEvents.filter(e => e.data.action === 'view_pricing').length;
    const supportContacts = conversionEvents.filter(e => e.data.action === 'contact_support').length;
    const totalSessions = new Set(this.events.map(e => e.sessionId)).size;
    const conversionRate = totalSessions > 0 ? conversionEvents.length / totalSessions : 0;

    // Top conversion sources
    const sourceCount = new Map<string, number>();
    conversionEvents.forEach(e => {
      sourceCount.set(e.data.source, (sourceCount.get(e.data.source) || 0) + 1);
    });

    const topConversionSources = Array.from(sourceCount.entries())
      .map(([source, conversions]) => ({ source, conversions }))
      .sort((a, b) => b.conversions - a.conversions);

    return {
      tryNowClicks,
      pricingViews,
      supportContacts,
      conversionRate,
      topConversionSources
    };
  }

  /**
   * Get user behavior insights
   */
  getUserBehaviorMetrics(): UserBehaviorMetrics {
    const sessions = this.groupEventsBySession();
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) {
      return {
        averageSessionDuration: 0,
        averageFAQsViewedPerSession: 0,
        bounceRate: 0,
        returnUserRate: 0,
        searchToConversionFunnel: { searches: 0, faqViews: 0, conversions: 0 }
      };
    }

    // Calculate session durations
    const sessionDurations = sessions.map(session => {
      const events = session.events;
      if (events.length < 2) return 0;
      return Math.max(...events.map(e => e.timestamp)) - Math.min(...events.map(e => e.timestamp));
    });

    const averageSessionDuration = sessionDurations.reduce((sum, duration) => sum + duration, 0) / totalSessions;

    // FAQ views per session
    const faqViewsPerSession = sessions.map(session => 
      session.events.filter(e => e.type === 'search_result_click').length
    );
    const averageFAQsViewedPerSession = faqViewsPerSession.reduce((sum, views) => sum + views, 0) / totalSessions;

    // Bounce rate (sessions with only one meaningful interaction)
    const bouncedSessions = sessions.filter(session => {
      const meaningfulEvents = session.events.filter(e => 
        e.type !== 'session_start' && e.type !== 'session_end' && e.type !== 'page_view'
      );
      return meaningfulEvents.length <= 1;
    }).length;
    const bounceRate = bouncedSessions / totalSessions;

    // Return user rate (simplified - would need persistent user tracking)
    const uniqueUsers = new Set(this.events.filter(e => e.userId).map(e => e.userId));
    const returnUserRate = uniqueUsers.size > 0 ? 0.3 : 0; // Placeholder implementation

    // Search to conversion funnel
    const searches = this.events.filter(e => e.type === 'search_query').length;
    const faqViews = this.events.filter(e => e.type === 'search_result_click').length;
    const conversions = this.events.filter(e => 
      e.type === 'try_now_click' || e.type === 'view_pricing_click'
    ).length;

    return {
      averageSessionDuration,
      averageFAQsViewedPerSession,
      bounceRate,
      returnUserRate,
      searchToConversionFunnel: { searches, faqViews, conversions }
    };
  }

  /**
   * A/B testing functionality
   */
  createABTest(test: Omit<ABTest, 'id'>): string {
    const id = this.generateId();
    const abTest: ABTest = { ...test, id };
    this.abTests.set(id, abTest);
    return id;
  }

  getABTestVariant(testId: string): ABTestVariant | null {
    const test = this.abTests.get(testId);
    if (!test || !test.active) return null;

    // Simple random assignment based on session ID
    const sessionHash = this.hashString(this.sessionId);
    const variantIndex = sessionHash % test.variants.length;
    return test.variants[variantIndex];
  }

  trackABTestResult(testId: string, variantId: string, metric: string, value: number): void {
    this.trackEvent('search_query', {
      abTestId: testId,
      variantId,
      metric,
      value
    });
  }

  /**
   * Export analytics data
   */
  exportData(): {
    events: AnalyticsEvent[];
    searchMetrics: SearchMetrics;
    contentMetrics: ContentMetrics;
    conversionMetrics: ConversionMetrics;
    userBehaviorMetrics: UserBehaviorMetrics;
  } {
    return {
      events: this.events,
      searchMetrics: this.getSearchMetrics(),
      contentMetrics: this.getContentMetrics(),
      conversionMetrics: this.getConversionMetrics(),
      userBehaviorMetrics: this.getUserBehaviorMetrics()
    };
  }

  // Private helper methods
  private generateSessionId(): SessionId {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId;
  }

  private generateEventId(): EventId {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as EventId;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private persistEvent(event: AnalyticsEvent): void {
    // In a real application, this would send data to an analytics service
    // For now, store in localStorage as a fallback
    try {
      const stored = localStorage.getItem('faq_analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 1000 events to prevent storage bloat
      const recentEvents = events.slice(-1000);
      localStorage.setItem('faq_analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.warn('Failed to persist analytics event:', error);
    }
  }

  private processRealTimeEvent(event: AnalyticsEvent): void {
    // Process events for real-time insights
    // This could trigger notifications, update dashboards, etc.
    if (event.type === 'no_results_found') {
      console.info('No results found for query:', (event.data as any).query);
    }
  }

  private setupSessionEndTracking(): void {
    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: Date.now() - this.sessionStartTime,
        eventsCount: this.events.length
      });
    });

    // Track session end on visibility change (tab switch)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_end', {
          duration: Date.now() - this.sessionStartTime,
          eventsCount: this.events.length,
          reason: 'visibility_change'
        });
      }
    });
  }

  private groupEventsBySession(): Array<{ sessionId: SessionId; events: AnalyticsEvent[] }> {
    const sessionMap = new Map<SessionId, AnalyticsEvent[]>();
    
    this.events.forEach(event => {
      if (!sessionMap.has(event.sessionId)) {
        sessionMap.set(event.sessionId, []);
      }
      sessionMap.get(event.sessionId)!.push(event);
    });

    return Array.from(sessionMap.entries()).map(([sessionId, events]) => ({
      sessionId,
      events: events.sort((a, b) => a.timestamp - b.timestamp)
    }));
  }

  private getFAQQuestion(faqId: string): string {
    // This would typically come from the FAQ service
    // Placeholder implementation
    return `FAQ Question ${faqId}`;
  }

  private loadABTests(): void {
    // Load A/B tests from configuration or API
    // Placeholder implementation with example test
    const exampleTest: ABTest = {
      id: 'search_ui_v2',
      name: 'Search UI V2 Test',
      description: 'Test new search interface design',
      variants: [
        { id: 'control', name: 'Control', config: { newUI: false }, weight: 0.5 },
        { id: 'variant', name: 'New UI', config: { newUI: true }, weight: 0.5 }
      ],
      startDate: Date.now() as Timestamp,
      active: true,
      trafficSplit: [50, 50]
    };
    
    this.abTests.set(exampleTest.id, exampleTest);
  }
}

// Export singleton instance
export const faqAnalytics = new FAQAnalyticsService();

// Export types
export type {
  AnalyticsEvent,
  EventType,
  EventData,
  SearchMetrics,
  ContentMetrics,
  ConversionMetrics,
  UserBehaviorMetrics,
  ABTest,
  ABTestVariant,
  ABTestResult
};