// @ts-ignore
/**
 * Advanced Analytics Components Index
 * 
 * Exports all advanced analytics and tracking components
 * for comprehensive multimedia content performance monitoring.
 * 
 * @author Gil Klainert
 * @version 1.0.0
  */

// Main Analytics Dashboard
export { MultimediaAnalyticsDashboard } from './MultimediaAnalyticsDashboard';
export type { MultimediaAnalyticsDashboardProps } from './MultimediaAnalyticsDashboard';

// Engagement Tracking
export { EngagementTracker } from './EngagementTracker';
export type { EngagementTrackerProps } from './EngagementTracker';

// VideoAnalyticsDashboard (existing)
export { VideoAnalyticsDashboard } from './VideoAnalyticsDashboard';

// Types from existing components
export * from './types';

// Re-export for convenience
export {
  MultimediaAnalyticsDashboard as AnalyticsDashboard
} from './MultimediaAnalyticsDashboard';
export {
  EngagementTracker as UserEngagement
} from './EngagementTracker';

/**
 * Advanced Analytics Components Collection
 * 
 * Comprehensive suite of analytics and tracking components
 * for multimedia content performance monitoring, user engagement
 * tracking, and business intelligence insights.
  */
export const AdvancedAnalyticsComponents = {
  MultimediaAnalyticsDashboard,
  EngagementTracker,
  VideoAnalyticsDashboard
} as const;

export default AdvancedAnalyticsComponents;