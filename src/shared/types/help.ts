export type HelpContentType = 'tooltip' | 'popover' | 'modal' | 'tour' | 'overlay' | 'guide';

export type HelpTrigger = 'hover' | 'click' | 'focus' | 'manual' | 'auto' | 'scroll';

export type HelpPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface HelpContent {
  id: string;
  type: HelpContentType;
  title: string;
  content: string;
  category: string;
  context: string; // page or component context
  trigger: HelpTrigger;
  position?: HelpPosition;
  priority: number; // higher priority shown first
  showOnce?: boolean; // show only once per user
  prerequisite?: string[]; // other help content that should be shown first
  media?: {
    type: 'image' | 'video' | 'demo';
    url: string;
    alt?: string;
  };
  actions?: {
    label: string;
    action: string;
    variant: 'primary' | 'secondary' | 'link';
  }[];
  tags?: string[];
  isNew?: boolean; // mark as new feature
}

export interface HelpUserPreferences {
  showTooltips: boolean;
  showOnboarding: boolean;
  completedTours: string[];
  dismissedHelp: string[];
  helpFrequency: 'minimal' | 'normal' | 'comprehensive';
  enableAnimations: boolean;
  compactMode: boolean;
}

export interface HelpAnalytics {
  helpId: string;
  event: 'shown' | 'clicked' | 'dismissed' | 'completed' | 'skipped';
  timestamp: Date;
  context: string;
  userId?: string;
  sessionId: string;
  timeSpent?: number; // in milliseconds
}

export interface TourStep {
  id: string;
  target: string; // CSS selector or element ID
  title: string;
  content: string;
  position?: HelpPosition;
  spotlight?: boolean; // highlight the target element
  allowSkip?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  delay?: number; // delay before showing in ms
}

export interface HelpTour {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  context: string; // when to show this tour
  autoStart?: boolean;
  category: 'onboarding' | 'feature' | 'tips' | 'troubleshooting';
  estimatedTime?: number; // in minutes
  prerequisite?: string[];
}

export interface HelpContextState {
  isHelpEnabled: boolean;
  currentContext: string;
  activeHelp: string | null;
  activeTour: string | null;
  userPreferences: HelpUserPreferences;
  tours: Record<string, HelpTour>;
  content: Record<string, HelpContent>;
  analytics: HelpAnalytics[];
  searchQuery: string;
  isSearchOpen: boolean;
}