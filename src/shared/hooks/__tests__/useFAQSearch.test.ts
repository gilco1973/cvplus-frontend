import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFAQSearch, useSimpleFAQSearch, useFAQAnalytics } from '../useFAQSearch';

// Mock the FAQ service
vi.mock('../../services/faqService', () => ({
  faqService: {
    getFAQs: vi.fn(() => []),
    getCategories: vi.fn(() => [
      { id: 'getting-started', name: 'Getting Started', count: 5 },
      { id: 'ai-features', name: 'AI Features', count: 3 }
    ]),
    getPopularFAQs: vi.fn(() => [
      {
        id: '1',
        question: 'How do I upload my CV?',
        answer: 'You can upload...',
        category: 'getting-started',
        tags: ['upload'],
        priority: 'high',
        lastUpdated: '2024-01-01',
        helpfulCount: 100
      }
    ]),
    searchFAQs: vi.fn((filters) => [
      {
        item: {
          id: '1',
          question: 'Test FAQ',
          answer: 'Test answer',
          category: filters.category === 'all' ? 'getting-started' : filters.category,
          tags: ['test'],
          priority: 'high',
          lastUpdated: '2024-01-01',
          helpfulCount: 50
        },
        score: 0.9,
        matches: { question: ['test'], answer: [], tags: [] },
        relevanceReason: 'Question match'
      }
    ]),
    getSearchSuggestions: vi.fn((query) => 
      query.length > 2 ? ['upload', 'analysis', 'pricing'] : []
    ),
    getFAQById: vi.fn((id) => 
      id === '1' ? {
        id: '1',
        question: 'Test FAQ',
        answer: 'Test answer',
        category: 'getting-started',
        tags: ['test'],
        priority: 'high',
        lastUpdated: '2024-01-01'
      } : null
    ),
    getStatistics: vi.fn(() => ({
      totalFAQs: 10,
      totalCategories: 3,
      totalHelpfulVotes: 500,
      averageHelpfulness: 50,
      categoryCounts: { 'getting-started': 5, 'ai-features': 3 },
      popularTags: ['upload', 'AI', 'pricing'],
      cacheStats: { size: 0, keys: [] }
    }))
  }
}));

describe('useFAQSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFAQSearch());

      expect(result.current.query).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.selectedTags).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.searchHistory).toEqual([]);
    });

    it('should update query', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      expect(result.current.query).toBe('test query');
    });

    it('should update category', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setCategory('getting-started');
      });

      expect(result.current.selectedCategory).toBe('getting-started');
    });

    it('should update tags', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setTags(['tag1', 'tag2']);
      });

      expect(result.current.selectedTags).toEqual(['tag1', 'tag2']);
    });

    it('should add tag', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.addTag('new-tag');
      });

      expect(result.current.selectedTags).toContain('new-tag');
    });

    it('should remove tag', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setTags(['tag1', 'tag2']);
      });

      act(() => {
        result.current.removeTag('tag1');
      });

      expect(result.current.selectedTags).toEqual(['tag2']);
    });

    it('should clear all filters', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('test');
        result.current.setCategory('ai-features');
        result.current.setTags(['tag1']);
      });

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.query).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.selectedTags).toEqual([]);
    });
  });

  describe('Search History', () => {
    it('should add meaningful queries to search history', async () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('meaningful query');
      });

      expect(result.current.searchHistory).toContain('meaningful query');
    });

    it('should not add short queries to search history', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('ab');
      });

      expect(result.current.searchHistory).not.toContain('ab');
    });

    it('should limit search history length', () => {
      const { result } = renderHook(() => useFAQSearch());

      // Add 15 queries (more than the 10 limit)
      for (let i = 0; i < 15; i++) {
        act(() => {
          result.current.setQuery(`query ${i}`);
        });
      }

      expect(result.current.searchHistory.length).toBeLessThanOrEqual(10);
    });

    it('should clear search history', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('test query');
      });

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.searchHistory).toEqual([]);
    });
  });

  describe('Suggestions', () => {
    it('should provide suggestions for queries longer than 2 characters', async () => {
      const { result } = renderHook(() => useFAQSearch({
        enableSuggestions: true
      }));

      act(() => {
        result.current.setQuery('upl');
      });

      // Wait for suggestions to be populated
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });

    it('should not provide suggestions for short queries', () => {
      const { result } = renderHook(() => useFAQSearch({
        enableSuggestions: true
      }));

      act(() => {
        result.current.setQuery('ab');
      });

      expect(result.current.suggestions).toEqual([]);
    });

    it('should apply suggestion', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.applySuggestion('upload');
      });

      expect(result.current.query).toBe('upload');
      expect(result.current.suggestions).toEqual([]);
    });

    it('should disable suggestions when configured', () => {
      const { result } = renderHook(() => useFAQSearch({
        enableSuggestions: false
      }));

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('Active Filters Detection', () => {
    it('should detect active query filter', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setQuery('test');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should detect active category filter', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setCategory('getting-started');
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should detect active tags filter', () => {
      const { result } = renderHook(() => useFAQSearch());

      act(() => {
        result.current.setTags(['upload']);
      });

      expect(result.current.hasActiveFilters).toBe(true);
    });

    it('should return false when no filters are active', () => {
      const { result } = renderHook(() => useFAQSearch());

      expect(result.current.hasActiveFilters).toBe(false);
    });
  });

  describe('Utility Functions', () => {
    it('should get FAQ by ID', () => {
      const { result } = renderHook(() => useFAQSearch());

      const faq = result.current.getFAQById('1');
      expect(faq).toBeDefined();
      expect(faq?.id).toBe('1');
    });

    it('should return null for non-existent FAQ ID', () => {
      const { result } = renderHook(() => useFAQSearch());

      const faq = result.current.getFAQById('non-existent');
      expect(faq).toBeNull();
    });

    it('should get categories', () => {
      const { result } = renderHook(() => useFAQSearch());

      const categories = result.current.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should get popular FAQs', () => {
      const { result } = renderHook(() => useFAQSearch());

      const popularFAQs = result.current.getPopularFAQs(5);
      expect(Array.isArray(popularFAQs)).toBe(true);
      expect(popularFAQs.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Configuration', () => {
    it('should use custom debounce time', async () => {
      const { result } = renderHook(() => useFAQSearch({
        debounceMs: 100
      }));

      expect(result.current.config.debounceMs).toBe(100);
    });

    it('should respect max suggestions limit', async () => {
      const { result } = renderHook(() => useFAQSearch({
        enableSuggestions: true,
        maxSuggestions: 2
      }));

      act(() => {
        result.current.setQuery('test');
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.suggestions.length).toBeLessThanOrEqual(2);
    });
  });
});

describe('useSimpleFAQSearch', () => {
  it('should provide simplified search interface', () => {
    const { result } = renderHook(() => useSimpleFAQSearch('initial query'));

    expect(result.current.query).toBe('initial query');
    expect(result.current.category).toBe('all');
    expect(Array.isArray(result.current.results)).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update query in simple search', () => {
    const { result } = renderHook(() => useSimpleFAQSearch());

    act(() => {
      result.current.setQuery('new query');
    });

    expect(result.current.query).toBe('new query');
  });

  it('should update category in simple search', () => {
    const { result } = renderHook(() => useSimpleFAQSearch());

    act(() => {
      result.current.setCategory('getting-started');
    });

    expect(result.current.category).toBe('getting-started');
  });

  it('should return popular FAQs when no query', () => {
    const { result } = renderHook(() => useSimpleFAQSearch());

    expect(result.current.results.length).toBeGreaterThan(0);
    expect(result.current.results[0].relevanceReason).toBe('Popular question');
  });
});

describe('useFAQAnalytics', () => {
  it('should provide analytics data', () => {
    const { result } = renderHook(() => useFAQAnalytics());

    expect(result.current.totalFAQs).toBeDefined();
    expect(result.current.totalCategories).toBeDefined();
    expect(result.current.totalHelpfulVotes).toBeDefined();
    expect(result.current.averageHelpfulness).toBeDefined();
    expect(result.current.categoryCounts).toBeDefined();
    expect(result.current.popularTags).toBeDefined();
    expect(result.current.lastUpdated).toBeDefined();
  });

  it('should refresh analytics', () => {
    const { result } = renderHook(() => useFAQAnalytics());
    const initialLastUpdated = result.current.lastUpdated;

    act(() => {
      result.current.refresh();
    });

    expect(result.current.lastUpdated).toBeGreaterThanOrEqual(initialLastUpdated);
  });

  it('should have statistics structure', () => {
    const { result } = renderHook(() => useFAQAnalytics());

    expect(typeof result.current.totalFAQs).toBe('number');
    expect(typeof result.current.totalCategories).toBe('number');
    expect(typeof result.current.totalHelpfulVotes).toBe('number');
    expect(typeof result.current.averageHelpfulness).toBe('number');
    expect(typeof result.current.categoryCounts).toBe('object');
    expect(Array.isArray(result.current.popularTags)).toBe(true);
  });
});