import { FAQItem, FAQCategory, SearchFilters } from '../components/pages/FAQ/types';
import { FAQ_DATA, FAQ_CATEGORIES, SEARCH_KEYWORDS, POPULAR_TAGS } from '../data/faqData';

/**
 * Advanced FAQ Service with fuzzy search, caching, and analytics
 * Implements high-performance search algorithms and intelligent ranking
 */

// Branded types for enhanced type safety
export type SearchQuery = string & { readonly __brand: 'SearchQuery' };
export type SearchScore = number & { readonly __brand: 'SearchScore' };
export type CacheKey = string & { readonly __brand: 'CacheKey' };

// Search configuration interface
export interface SearchConfig {
  fuzzyThreshold: number;
  maxResults: number;
  boostFactors: {
    title: number;
    content: number;
    tags: number;
    category: number;
    popularity: number;
  };
  enableAnalytics: boolean;
}

// Search result with scoring
export interface SearchResult {
  item: FAQItem;
  score: SearchScore;
  matches: {
    question: string[];
    answer: string[];
    tags: string[];
  };
  relevanceReason: string;
}

// Cache interface for performance optimization
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Advanced cache implementation
class FAQCache {
  private cache = new Map<CacheKey, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const cacheKey = key as CacheKey;
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
    this.cleanup();
  }

  get<T>(key: string): T | null {
    const cacheKey = key as CacheKey;
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Fuzzy search implementation
class FuzzySearchEngine {
  private readonly config: SearchConfig;

  constructor(config: Partial<SearchConfig> = {}) {
    this.config = {
      fuzzyThreshold: 0.3,
      maxResults: 20,
      boostFactors: {
        title: 2.0,
        content: 1.0,
        tags: 1.5,
        category: 1.2,
        popularity: 0.8
      },
      enableAnalytics: true,
      ...config
    };
  }

  /**
   * Advanced fuzzy search with multiple ranking factors
   */
  search(query: SearchQuery, items: FAQItem[]): SearchResult[] {
    if (!query.trim()) return this.getPopularItems(items);

    const normalizedQuery = this.normalizeText(query);
    const searchTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
    
    const results = items
      .map(item => this.scoreItem(item, searchTerms, query))
      .filter(result => result.score > this.config.fuzzyThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);

    return results;
  }

  private scoreItem(item: FAQItem, searchTerms: string[], originalQuery: SearchQuery): SearchResult {
    const normalizedQuestion = this.normalizeText(item.question);
    const normalizedAnswer = this.normalizeText(item.answer);
    const normalizedTags = item.tags.map(tag => this.normalizeText(tag));

    let totalScore = 0;
    const matches = {
      question: [] as string[],
      answer: [] as string[],
      tags: [] as string[]
    };

    // Score question matches (highest weight)
    for (const term of searchTerms) {
      const questionScore = this.getTermScore(term, normalizedQuestion);
      if (questionScore > 0) {
        totalScore += questionScore * this.config.boostFactors.title;
        matches.question.push(term);
      }
    }

    // Score answer content matches
    for (const term of searchTerms) {
      const answerScore = this.getTermScore(term, normalizedAnswer);
      if (answerScore > 0) {
        totalScore += answerScore * this.config.boostFactors.content;
        matches.answer.push(term);
      }
    }

    // Score tag matches
    for (const term of searchTerms) {
      for (const tag of normalizedTags) {
        const tagScore = this.getTermScore(term, tag);
        if (tagScore > 0) {
          totalScore += tagScore * this.config.boostFactors.tags;
          matches.tags.push(term);
        }
      }
    }

    // Popularity boost
    const popularityScore = (item.helpfulCount || 0) / 1000;
    totalScore += popularityScore * this.config.boostFactors.popularity;

    // Priority boost
    const priorityBoost = item.priority === 'high' ? 0.2 : item.priority === 'medium' ? 0.1 : 0;
    totalScore += priorityBoost;

    return {
      item,
      score: totalScore as SearchScore,
      matches,
      relevanceReason: this.generateRelevanceReason(matches, totalScore)
    };
  }

  private getTermScore(term: string, text: string): number {
    if (text.includes(term)) {
      // Exact match gets highest score
      return 1.0;
    }

    // Fuzzy matching using Levenshtein distance
    const words = text.split(/\s+/);
    let bestScore = 0;

    for (const word of words) {
      if (word.length < 3) continue;
      
      const distance = this.levenshteinDistance(term, word);
      const similarity = 1 - distance / Math.max(term.length, word.length);
      
      if (similarity > this.config.fuzzyThreshold) {
        bestScore = Math.max(bestScore, similarity);
      }
    }

    return bestScore;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getPopularItems(items: FAQItem[]): SearchResult[] {
    return items
      .filter(item => item.priority === 'high' || (item.helpfulCount || 0) > 100)
      .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
      .slice(0, 10)
      .map(item => ({
        item,
        score: 0.8 as SearchScore,
        matches: { question: [], answer: [], tags: [] },
        relevanceReason: 'Popular question'
      }));
  }

  private generateRelevanceReason(matches: SearchResult['matches'], score: number): string {
    const reasons = [];
    
    if (matches.question.length > 0) {
      reasons.push(`Matches question (${matches.question.length} terms)`);
    }
    if (matches.answer.length > 0) {
      reasons.push(`Matches content (${matches.answer.length} terms)`);
    }
    if (matches.tags.length > 0) {
      reasons.push(`Matches tags (${matches.tags.join(', ')})`);
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Relevance match';
  }
}

// Main FAQ Service class
export class FAQService {
  private cache: FAQCache;
  private searchEngine: FuzzySearchEngine;
  private data: FAQItem[];
  private categories: FAQCategory[];

  constructor(config?: Partial<SearchConfig>) {
    this.cache = new FAQCache();
    this.searchEngine = new FuzzySearchEngine(config);
    this.data = FAQ_DATA;
    this.categories = FAQ_CATEGORIES;
  }

  /**
   * Get all FAQ items with optional caching
   */
  getFAQs(useCache = true): FAQItem[] {
    if (useCache) {
      const cached = this.cache.get<FAQItem[]>('all-faqs');
      if (cached) return cached;
    }

    this.cache.set('all-faqs', this.data, 10 * 60 * 1000); // 10 minutes
    return this.data;
  }

  /**
   * Get all FAQ categories
   */
  getCategories(): FAQCategory[] {
    const cached = this.cache.get<FAQCategory[]>('categories');
    if (cached) return cached;

    this.cache.set('categories', this.categories);
    return this.categories;
  }

  /**
   * Search FAQs with advanced fuzzy matching
   */
  searchFAQs(filters: SearchFilters): SearchResult[] {
    const cacheKey = JSON.stringify(filters);
    const cached = this.cache.get<SearchResult[]>(cacheKey);
    if (cached) return cached;

    let items = this.data;

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      items = items.filter(item => item.category === filters.category);
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      items = items.filter(item => 
        filters.tags.some(tag => 
          item.tags.some(itemTag => 
            itemTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    // Perform search
    const results = filters.query 
      ? this.searchEngine.search(filters.query as SearchQuery, items)
      : this.searchEngine.search('' as SearchQuery, items);

    // Cache results for 2 minutes
    this.cache.set(cacheKey, results, 2 * 60 * 1000);
    return results;
  }

  /**
   * Get FAQ by ID with caching
   */
  getFAQById(id: string): FAQItem | null {
    const cached = this.cache.get<FAQItem>(`faq-${id}`);
    if (cached) return cached;

    const faq = this.data.find(item => item.id === id) || null;
    if (faq) {
      this.cache.set(`faq-${id}`, faq);
    }
    return faq;
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(categoryId: string): FAQItem[] {
    const cacheKey = `category-${categoryId}`;
    const cached = this.cache.get<FAQItem[]>(cacheKey);
    if (cached) return cached;

    const items = this.data.filter(item => item.category === categoryId);
    this.cache.set(cacheKey, items);
    return items;
  }

  /**
   * Get popular FAQs based on helpfulness
   */
  getPopularFAQs(limit = 10): FAQItem[] {
    const cached = this.cache.get<FAQItem[]>('popular-faqs');
    if (cached) return cached;

    const popular = this.data
      .filter(item => (item.helpfulCount || 0) > 0)
      .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
      .slice(0, limit);

    this.cache.set('popular-faqs', popular);
    return popular;
  }

  /**
   * Get search suggestions based on query
   */
  getSearchSuggestions(query: string, limit = 5): string[] {
    const normalizedQuery = query.toLowerCase();
    const suggestions = new Set<string>();

    // Search in popular tags
    POPULAR_TAGS
      .filter(tag => tag.toLowerCase().includes(normalizedQuery))
      .slice(0, limit)
      .forEach(tag => suggestions.add(tag));

    // Search in keywords
    SEARCH_KEYWORDS
      .filter(keyword => keyword.toLowerCase().includes(normalizedQuery))
      .slice(0, limit - suggestions.size)
      .forEach(keyword => suggestions.add(keyword));

    // Search in question titles
    this.data
      .filter(item => item.question.toLowerCase().includes(normalizedQuery))
      .map(item => {
        const words = item.question.split(' ');
        return words.find(word => 
          word.toLowerCase().includes(normalizedQuery) && word.length > 3
        );
      })
      .filter(Boolean)
      .slice(0, limit - suggestions.size)
      .forEach(word => word && suggestions.add(word));

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get FAQ statistics
   */
  getStatistics() {
    const stats = {
      totalFAQs: this.data.length,
      totalCategories: this.categories.length,
      totalHelpfulVotes: this.data.reduce((sum, faq) => sum + (faq.helpfulCount || 0), 0),
      averageHelpfulness: 0,
      categoryCounts: {} as Record<string, number>,
      popularTags: POPULAR_TAGS,
      cacheStats: this.cache.getStats()
    };

    stats.averageHelpfulness = stats.totalHelpfulVotes / stats.totalFAQs;

    // Count FAQs per category
    this.categories.forEach(category => {
      stats.categoryCounts[category.id] = this.data.filter(
        item => item.category === category.id
      ).length;
    });

    return stats;
  }

  /**
   * Clear all caches (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update search configuration
   */
  updateConfig(config: Partial<SearchConfig>): void {
    this.searchEngine = new FuzzySearchEngine(config);
    this.clearCache(); // Clear cache when config changes
  }
}

// Export singleton instance
export const faqService = new FAQService();

// Export types for use in components
export type { SearchResult, SearchConfig };