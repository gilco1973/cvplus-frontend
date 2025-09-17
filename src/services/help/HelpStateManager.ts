/**
 * Help State Manager
 * Extracted from HelpContext.tsx for better modularity
 * Handles help state, reducers, and actions
 */

import type { HelpContextState, HelpUserPreferences, HelpAnalytics } from '../../types/help';

export const defaultPreferences: HelpUserPreferences = {
  showTooltips: true,
  showOnboarding: true,
  completedTours: [],
  dismissedHelp: [],
  helpFrequency: 'normal',
  enableAnimations: true,
  compactMode: false
};

export const initialState: HelpContextState = {
  isHelpEnabled: true,
  currentContext: 'home',
  activeHelp: null,
  userPreferences: defaultPreferences,
  tours: {},
  content: {},
  analytics: [],
  searchQuery: '',
  isSearchOpen: false,
  activeTour: null
};

export type HelpAction =
  | { type: 'SET_CONTEXT'; payload: string }
  | { type: 'SHOW_HELP'; payload: string }
  | { type: 'HIDE_HELP' }
  | { type: 'DISMISS_HELP'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<HelpUserPreferences> }
  | { type: 'START_TOUR'; payload: string }
  | { type: 'COMPLETE_TOUR'; payload: string }
  | { type: 'SKIP_TOUR'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'TRACK_ANALYTICS'; payload: HelpAnalytics }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'LOAD_PREFERENCES'; payload: HelpUserPreferences };

export function helpReducer(state: HelpContextState, action: HelpAction): HelpContextState {
  switch (action.type) {
    case 'SET_CONTEXT':
      return {
        ...state,
        currentContext: action.payload,
        activeHelp: null // Clear active help when context changes
      };
    
    case 'SHOW_HELP':
      return {
        ...state,
        activeHelp: action.payload
      };
    
    case 'HIDE_HELP':
      return {
        ...state,
        activeHelp: null
      };
    
    case 'DISMISS_HELP':
      return {
        ...state,
        activeHelp: null,
        userPreferences: {
          ...state.userPreferences,
          dismissedHelp: [...state.userPreferences.dismissedHelp, action.payload]
        }
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };
    
    case 'START_TOUR':
      return {
        ...state,
        activeTour: action.payload
      };
    
    case 'COMPLETE_TOUR':
      return {
        ...state,
        activeTour: null,
        userPreferences: {
          ...state.userPreferences,
          completedTours: [...state.userPreferences.completedTours, action.payload]
        }
      };
    
    case 'SKIP_TOUR':
      return {
        ...state,
        activeTour: null,
        userPreferences: {
          ...state.userPreferences,
          completedTours: [...state.userPreferences.completedTours, action.payload]
        }
      };
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case 'TOGGLE_SEARCH':
      return {
        ...state,
        isSearchOpen: !state.isSearchOpen,
        searchQuery: !state.isSearchOpen ? state.searchQuery : ''
      };
    
    case 'TRACK_ANALYTICS':
      return {
        ...state,
        analytics: [...state.analytics, action.payload]
      };
    
    case 'RESET_ONBOARDING':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          showOnboarding: true,
          completedTours: [],
          dismissedHelp: []
        }
      };
    
    case 'LOAD_PREFERENCES':
      return {
        ...state,
        userPreferences: action.payload
      };
    
    default:
      return state;
  }
}

/**
 * Help State Utilities
 */
export class HelpStateUtils {
  static readonly STORAGE_KEY = 'cvplus-help-preferences';
  static readonly ANALYTICS_STORAGE_KEY = 'cvplus-help-analytics';

  static savePreferences(preferences: HelpUserPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save help preferences:', error);
    }
  }

  static loadPreferences(): HelpUserPreferences | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load help preferences:', error);
      return null;
    }
  }

  static saveAnalytics(analytics: HelpAnalytics[]): void {
    try {
      localStorage.setItem(this.ANALYTICS_STORAGE_KEY, JSON.stringify(analytics));
    } catch (error) {
      console.warn('Failed to save help analytics:', error);
    }
  }

  static loadAnalytics(): HelpAnalytics[] {
    try {
      const saved = localStorage.getItem(this.ANALYTICS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load help analytics:', error);
      return [];
    }
  }

  static generateSessionId(): string {
    return `help_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}