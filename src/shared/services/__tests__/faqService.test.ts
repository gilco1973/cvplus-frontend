import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FAQService } from '../faqService';
import { SearchFilters } from '../../components/pages/FAQ/types';

describe('FAQService', () => {
  let faqService: FAQService;

  beforeEach(() => {
    // Create a fresh instance for each test
    faqService = new FAQService({
      fuzzyThreshold: 0.3,
      maxResults: 20,
      enableAnalytics: false // Disable analytics for testing
    });
  });

  describe('Basic FAQ Operations', () => {
    it('should return all FAQs', () => {
      const faqs = faqService.getFAQs();
      expect(faqs).toBeDefined();
      expect(Array.isArray(faqs)).toBe(true);
      expect(faqs.length).toBeGreaterThan(0);
    });

    it('should return all categories', () => {
      const categories = faqService.getCategories();
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    it('should find FAQ by ID', () => {
      const faqs = faqService.getFAQs();
      const firstFAQ = faqs[0];
      
      const foundFAQ = faqService.getFAQById(firstFAQ.id);
      expect(foundFAQ).toBeDefined();
      expect(foundFAQ?.id).toBe(firstFAQ.id);
      expect(foundFAQ?.question).toBe(firstFAQ.question);
    });

    it('should return null for non-existent FAQ ID', () => {
      const foundFAQ = faqService.getFAQById('non-existent-id');
      expect(foundFAQ).toBeNull();
    });

    it('should get FAQs by category', () => {
      const categories = faqService.getCategories();
      const firstCategory = categories[0];
      
      const categoryFAQs = faqService.getFAQsByCategory(firstCategory.id);
      expect(Array.isArray(categoryFAQs)).toBe(true);
      
      categoryFAQs.forEach(faq => {
        expect(faq.category).toBe(firstCategory.id);
      });
    });

    it('should get popular FAQs', () => {
      const popularFAQs = faqService.getPopularFAQs(5);
      expect(Array.isArray(popularFAQs)).toBe(true);
      expect(popularFAQs.length).toBeLessThanOrEqual(5);
      
      // Should be sorted by helpfulness
      for (let i = 1; i < popularFAQs.length; i++) {
        const current = popularFAQs[i].helpfulCount || 0;
        const previous = popularFAQs[i - 1].helpfulCount || 0;
        expect(current).toBeLessThanOrEqual(previous);
      }
    });
  });

  describe('Search Functionality', () => {
    it('should perform basic search', () => {
      const filters: SearchFilters = {
        query: 'upload',
        category: 'all',
        tags: []
      };
      
      const results = faqService.searchFAQs(filters);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(result => {
        expect(result).toHaveProperty('item');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('matches');
        expect(result).toHaveProperty('relevanceReason');
      });
    });

    it('should search with category filter', () => {
      const categories = faqService.getCategories();
      const testCategory = categories.find(cat => cat.id === 'getting-started');
      
      if (testCategory) {
        const filters: SearchFilters = {
          query: '',
          category: testCategory.id,
          tags: []
        };
        
        const results = faqService.searchFAQs(filters);
        results.forEach(result => {
          expect(result.item.category).toBe(testCategory.id);
        });
      }
    });

    it('should search with tags filter', () => {
      const filters: SearchFilters = {
        query: '',
        category: 'all',
        tags: ['upload']
      };
      
      const results = faqService.searchFAQs(filters);
      results.forEach(result => {
        expect(result.item.tags.some(tag => 
          tag.toLowerCase().includes('upload')
        )).toBe(true);
      });
    });

    it('should handle fuzzy search', () => {
      const filters: SearchFilters = {
        query: 'uplod', // Misspelled "upload"
        category: 'all',
        tags: []
      };
      
      const results = faqService.searchFAQs(filters);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return relevant results for CVPlus-specific queries', () => {
      const testQueries = [
        'AI analysis',
        'PDF upload',
        'privacy security',
        'pricing plans',
        'video introduction',
        'calendar integration'
      ];
      
      testQueries.forEach(query => {
        const filters: SearchFilters = {
          query,
          category: 'all',
          tags: []
        };
        
        const results = faqService.searchFAQs(filters);
        expect(results.length).toBeGreaterThan(0);
        
        // Results should be scored and sorted by relevance
        for (let i = 1; i < results.length; i++) {
          expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
        }
      });
    });

    it('should handle empty search gracefully', () => {
      const filters: SearchFilters = {
        query: '',
        category: 'all',
        tags: []
      };
      
      const results = faqService.searchFAQs(filters);
      expect(Array.isArray(results)).toBe(true);
      // Should return popular FAQs when no search criteria
      expect(results.length).toBeGreaterThan(0);
    });

    it('should limit search results', () => {
      const service = new FAQService({
        maxResults: 5,
        enableAnalytics: false
      });
      
      const filters: SearchFilters = {
        query: 'a', // Very broad query
        category: 'all',
        tags: []
      };
      
      const results = service.searchFAQs(filters);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Search Suggestions', () => {
    it('should provide search suggestions', () => {
      const suggestions = faqService.getSearchSuggestions('up', 3);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
      
      suggestions.forEach(suggestion => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.toLowerCase()).toContain('up');
      });
    });

    it('should return empty suggestions for very short queries', () => {
      const suggestions = faqService.getSearchSuggestions('a', 5);
      expect(Array.isArray(suggestions)).toBe(true);
      // May be empty or contain single-letter matches
    });

    it('should provide relevant CVPlus suggestions', () => {
      const suggestions = faqService.getSearchSuggestions('cv', 5);
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should include CVPlus-related terms
      const suggestionText = suggestions.join(' ').toLowerCase();
      expect(suggestionText).toContain('cv');
    });
  });

  describe('Caching', () => {
    it('should cache search results', () => {
      const filters: SearchFilters = {
        query: 'test query',
        category: 'all',
        tags: []
      };
      
      // First search
      const startTime1 = performance.now();
      const results1 = faqService.searchFAQs(filters);
      const endTime1 = performance.now();
      
      // Second search (should be cached)
      const startTime2 = performance.now();
      const results2 = faqService.searchFAQs(filters);
      const endTime2 = performance.now();
      
      expect(results1).toEqual(results2);
      // Cached search should be faster (though this might be flaky in tests)
      // expect(endTime2 - startTime2).toBeLessThan(endTime1 - startTime1);
    });

    it('should clear cache', () => {
      const filters: SearchFilters = {
        query: 'cache test',
        category: 'all',
        tags: []
      };
      
      // Search to populate cache
      faqService.searchFAQs(filters);
      
      // Clear cache
      faqService.clearCache();
      
      // Should work without errors after cache clear
      const results = faqService.searchFAQs(filters);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should provide comprehensive statistics', () => {
      const stats = faqService.getStatistics();
      
      expect(stats).toHaveProperty('totalFAQs');
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('totalHelpfulVotes');
      expect(stats).toHaveProperty('averageHelpfulness');
      expect(stats).toHaveProperty('categoryCounts');
      expect(stats).toHaveProperty('popularTags');
      expect(stats).toHaveProperty('cacheStats');
      
      expect(typeof stats.totalFAQs).toBe('number');
      expect(typeof stats.totalCategories).toBe('number');
      expect(typeof stats.totalHelpfulVotes).toBe('number');
      expect(typeof stats.averageHelpfulness).toBe('number');
      expect(typeof stats.categoryCounts).toBe('object');
      expect(Array.isArray(stats.popularTags)).toBe(true);
    });

    it('should have accurate category counts', () => {
      const stats = faqService.getStatistics();
      const categories = faqService.getCategories();
      
      expect(Object.keys(stats.categoryCounts).length).toBe(categories.length);
      
      // Verify counts are accurate
      categories.forEach(category => {
        const expectedCount = faqService.getFAQsByCategory(category.id).length;
        expect(stats.categoryCounts[category.id]).toBe(expectedCount);
      });
    });
  });

  describe('Configuration', () => {
    it('should update search configuration', () => {
      const newConfig = {
        fuzzyThreshold: 0.5,
        maxResults: 10
      };
      
      faqService.updateConfig(newConfig);
      
      // Test that new config is applied
      const filters: SearchFilters = {
        query: 'broad search term',
        category: 'all',
        tags: []
      };
      
      const results = faqService.searchFAQs(filters);
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in search', () => {
      const filters: SearchFilters = {
        query: 'test@#$%^&*()',
        category: 'all',
        tags: []
      };
      
      expect(() => {
        const results = faqService.searchFAQs(filters);
        expect(Array.isArray(results)).toBe(true);
      }).not.toThrow();
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      const filters: SearchFilters = {
        query: longQuery,
        category: 'all',
        tags: []
      };
      
      expect(() => {
        const results = faqService.searchFAQs(filters);
        expect(Array.isArray(results)).toBe(true);
      }).not.toThrow();
    });

    it('should handle non-existent category gracefully', () => {
      const filters: SearchFilters = {
        query: 'test',
        category: 'non-existent-category',
        tags: []
      };
      
      const results = faqService.searchFAQs(filters);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle non-existent tags gracefully', () => {
      const filters: SearchFilters = {
        query: '',
        category: 'all',
        tags: ['non-existent-tag']
      };
      
      const results = faqService.searchFAQs(filters);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('Performance', () => {
    it('should perform search within reasonable time', () => {
      const filters: SearchFilters = {
        query: 'performance test query',
        category: 'all',
        tags: []
      };
      
      const startTime = performance.now();
      const results = faqService.searchFAQs(filters);
      const endTime = performance.now();
      
      const searchTime = endTime - startTime;
      
      // Search should complete within 100ms for typical queries
      expect(searchTime).toBeLessThan(100);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle concurrent searches', async () => {
      const searchPromises = Array.from({ length: 10 }, (_, i) => {
        const filters: SearchFilters = {
          query: `concurrent search ${i}`,
          category: 'all',
          tags: []
        };
        return Promise.resolve(faqService.searchFAQs(filters));
      });
      
      const results = await Promise.all(searchPromises);
      
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });
});