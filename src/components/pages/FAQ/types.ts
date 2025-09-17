export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isHelpful?: boolean;
  helpfulCount?: number;
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
  // Enhanced fields for analytics and search
  viewCount?: number;
  searchScore?: number;
  relevanceReason?: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export interface SearchFilters {
  category: string;
  tags: string[];
  query: string;
  // Enhanced search options
  sortBy?: 'relevance' | 'popularity' | 'recent' | 'alphabetical';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FAQPageProps {
  className?: string;
  initialCategory?: string;
  initialQuery?: string;
}

export interface FAQComponentProps {
  faqs: FAQItem[];
  categories: FAQCategory[];
  isLoading?: boolean;
  error?: string | null;
  onSearch?: (filters: SearchFilters) => void;
  onFeedback?: (faqId: string, isHelpful: boolean) => void;
  onContactSupport?: () => void;
}

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  suggestions?: string[];
  isLoading?: boolean;
}

export interface CategoryGridProps {
  categories: FAQCategory[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

export interface FAQAccordionProps {
  faqs: FAQItem[];
  searchQuery: string;
  selectedCategory: string;
  onFeedback: (faqId: string, isHelpful: boolean) => void;
  className?: string;
}

export interface FeedbackButtonsProps {
  faqId: string;
  isHelpful?: boolean;
  onFeedback: (faqId: string, isHelpful: boolean) => void;
  className?: string;
}

export interface QuickActionsProps {
  onTryNow: () => void;
  onViewPricing: () => void;
  onContactSupport: () => void;
  className?: string;
}

export interface FAQSidebarProps {
  categories: FAQCategory[];
  selectedCategory: string;
  popularTags: string[];
  onCategorySelect: (categoryId: string) => void;
  onTagSelect: (tag: string) => void;
  className?: string;
}

// Enhanced interfaces for new functionality
export interface FAQSearchResult {
  item: FAQItem;
  score: number;
  matches: {
    question: string[];
    answer: string[];
    tags: string[];
  };
  relevanceReason: string;
}

export interface FAQPerformanceMetrics {
  searchTime: number;
  totalResults: number;
  cacheHitRate: number;
  averageScore: number;
}

export interface FAQAnalyticsData {
  popularQueries: Array<{ query: string; count: number }>;
  noResultsQueries: Array<{ query: string; count: number }>;
  categoryUsage: Record<string, number>;
  helpfulnessRatings: Record<string, { helpful: number; notHelpful: number }>;
  conversionMetrics: {
    tryNowClicks: number;
    pricingViews: number;
    supportContacts: number;
  };
}

export interface FAQServiceConfig {
  fuzzyThreshold: number;
  maxResults: number;
  enableAnalytics: boolean;
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface VirtualScrollProps {
  items: FAQItem[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: FAQItem, index: number) => React.ReactNode;
  overscan?: number;
}