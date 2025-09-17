/**
 * Help Action Manager
 * Extracted from HelpContext.tsx for better modularity
 * Handles help actions and business logic
 */

import type { HelpUserPreferences, HelpAnalytics, HelpContent, HelpTour, HelpContextState } from '../../types/help';
import { HelpContentService } from '../helpContentService';
import { HelpStateUtils, type HelpAction } from './HelpStateManager';

export interface HelpContextActions {
  setContext: (context: string) => void;
  showHelp: (helpId: string) => void;
  hideHelp: () => void;
  dismissHelp: (helpId: string) => void;
  updatePreferences: (preferences: Partial<HelpUserPreferences>) => void;
  startTour: (tourId: string) => void;
  completeTour: (tourId: string) => void;
  skipTour: (tourId: string) => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  trackAnalytics: (analytics: Omit<HelpAnalytics, 'timestamp' | 'sessionId'>) => void;
  resetOnboarding: () => void;
}

export class HelpActionManager {
  private dispatch: (action: HelpAction) => void;
  private sessionId: string;
  private helpService: HelpContentService;

  constructor(dispatch: (action: HelpAction) => void, sessionId: string) {
    this.dispatch = dispatch;
    this.sessionId = sessionId;
    this.helpService = HelpContentService.getInstance();
  }

  createActions(state: HelpContextState): HelpContextActions {
    return {
      setContext: (context: string) => {
        this.dispatch({ type: 'SET_CONTEXT', payload: context });
      },

      showHelp: (helpId: string) => {
        this.dispatch({ type: 'SHOW_HELP', payload: helpId });
      },

      hideHelp: () => {
        this.dispatch({ type: 'HIDE_HELP' });
      },

      dismissHelp: (helpId: string) => {
        this.dispatch({ type: 'DISMISS_HELP', payload: helpId });
      },

      updatePreferences: (preferences: Partial<HelpUserPreferences>) => {
        const updatedPrefs = { ...state.userPreferences, ...preferences };
        this.dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
        HelpStateUtils.savePreferences(updatedPrefs);
      },

      startTour: (tourId: string) => {
        this.dispatch({ type: 'START_TOUR', payload: tourId });
        const analytics = {
          helpId: tourId,
          event: 'shown' as const,
          timestamp: new Date(),
          context: state.currentContext,
          sessionId: this.sessionId
        };
        this.dispatch({ type: 'TRACK_ANALYTICS', payload: analytics });
      },

      completeTour: (tourId: string) => {
        this.dispatch({ type: 'COMPLETE_TOUR', payload: tourId });
      },

      skipTour: (tourId: string) => {
        this.dispatch({ type: 'SKIP_TOUR', payload: tourId });
        const analytics = {
          helpId: tourId,
          event: 'skipped' as const,
          timestamp: new Date(),
          context: state.currentContext,
          sessionId: this.sessionId
        };
        this.dispatch({ type: 'TRACK_ANALYTICS', payload: analytics });
      },

      setSearchQuery: (query: string) => {
        this.dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      },

      toggleSearch: () => {
        this.dispatch({ type: 'TOGGLE_SEARCH' });
      },

      trackAnalytics: (analytics: Omit<HelpAnalytics, 'timestamp' | 'sessionId'>) => {
        const fullAnalytics: HelpAnalytics = {
          ...analytics,
          timestamp: new Date(),
          sessionId: this.sessionId
        };

        this.dispatch({ type: 'TRACK_ANALYTICS', payload: fullAnalytics });
        
        // Periodically save analytics to localStorage
        const allAnalytics = [...state.analytics, fullAnalytics];
        if (allAnalytics.length % 10 === 0) {
          HelpStateUtils.saveAnalytics(allAnalytics);
        }
      },

      resetOnboarding: () => {
        this.dispatch({ type: 'RESET_ONBOARDING' });
      }
    };
  }

  /**
   * Get contextual help content
   */
  getContextualHelp(context: string): HelpContent[] {
    try {
      return this.helpService.getContentByContext(context);
    } catch (error) {
      console.error('Error getting contextual help:', error);
      return [];
    }
  }

  /**
   * Get available tours for context
   */
  getAvailableTours(context: string): HelpTour[] {
    try {
      return this.helpService.getTourByContext(context);
    } catch (error) {
      console.error('Error getting tours:', error);
      return [];
    }
  }

  /**
   * Search help content
   */
  searchHelp(query: string): HelpContent[] {
    try {
      return this.helpService.searchContent(query);
    } catch (error) {
      console.error('Error searching help:', error);
      return [];
    }
  }

  /**
   * Check if help should be shown
   */
  shouldShowHelp(helpId: string, userPreferences: HelpUserPreferences): boolean {
    if (!userPreferences.showTooltips) {
      return false;
    }

    if (userPreferences.dismissedHelp.includes(helpId)) {
      return false;
    }

    const content = this.helpService.getContentById(helpId);
    if (!content) {
      return false;
    }

    // Check frequency preferences
    if (userPreferences.helpFrequency === 'minimal' && content.priority < 50) {
      return false;
    }

    return true;
  }
}