import React, { useState, useCallback, useMemo } from 'react';
import { HelpCircle, Sparkles, ArrowRight, Menu, X, Zap, Clock } from 'lucide-react';
import { FAQPageProps, FAQItem, FAQCategory } from './types';
import { FAQSearchBar } from './FAQSearchBar';
import { FAQCategoryGrid } from './FAQCategoryGrid';
import { FAQAccordion } from './FAQAccordion';
import { FAQSidebar } from './FAQSidebar';
import { FAQQuickActions } from './FAQQuickActions';
import { useFAQSearch } from '../../../hooks/useFAQSearch';
import { faqAnalytics } from '../../../services/faqAnalytics';

/**
 * Enhanced FAQ Page with advanced search, analytics, and performance optimization
 * Integrates with the new FAQ data management system
 */
export const FAQPageEnhanced: React.FC<FAQPageProps> = ({
  className = '',
  initialCategory = 'all',
  initialQuery = ''
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);

  // Initialize FAQ search with analytics enabled
  const {
    query,
    setQuery,
    selectedCategory,
    setCategory,
    selectedTags,
    addTag,
    removeTag,
    clearFilters,
    results,
    loading,
    error,
    suggestions,
    searchHistory,
    totalResults,
    searchTime,
    hasActiveFilters,
    getCategories,
    analytics,
    performanceMetrics,
    applySuggestion
  } = useFAQSearch({
    enableAnalytics: true,
    enableSuggestions: true,
    maxSuggestions: 5,
    debounceMs: 300
  });

  // Initialize with URL parameters
  React.useEffect(() => {
    if (initialCategory !== 'all') {
      setCategory(initialCategory);
    }
    if (initialQuery) {
      setQuery(initialQuery);
    }
    
    // Track page view
    faqAnalytics.trackEvent('page_view', {
      page: 'faq',
      initialCategory,
      initialQuery
    });
  }, [initialCategory, initialQuery, setCategory, setQuery]);

  const categories = useMemo(() => getCategories(), [getCategories]);

  // FAQ result click handler with analytics
  const handleFAQClick = useCallback((faq: FAQItem, position: number) => {
    const searchResult = results.find(result => result.item.id === faq.id);
    
    faqAnalytics.trackFAQClick(
      faq.id,
      query,
      position,
      searchResult?.score || 0
    );
  }, [results, query]);

  // Feedback handler with analytics
  const handleFeedback = useCallback((faqId: string, isHelpful: boolean) => {
    faqAnalytics.trackFeedback(faqId, isHelpful, query, selectedCategory);
  }, [query, selectedCategory]);

  // Quick action handlers with conversion tracking
  const handleTryNow = useCallback(() => {
    faqAnalytics.trackConversion('try_now', 'quick_actions', undefined, query);
    // Navigate to signup/upload page
    window.location.href = '/upload';
  }, [query]);

  const handleViewPricing = useCallback(() => {
    faqAnalytics.trackConversion('view_pricing', 'quick_actions', undefined, query);
    // Navigate to pricing page
    window.location.href = '/pricing';
  }, [query]);

  const handleContactSupport = useCallback(() => {
    faqAnalytics.trackConversion('contact_support', 'quick_actions', undefined, query);
    // Open support chat or navigate to contact page
    window.open('mailto:support@cvplus.com?subject=FAQ Support Request');
  }, [query]);

  // Category selection with analytics
  const handleCategorySelect = useCallback((categoryId: string) => {
    faqAnalytics.trackFilter('category', categoryId, selectedCategory);
    setCategory(categoryId);
  }, [selectedCategory, setCategory]);

  // Tag selection with analytics
  const handleTagSelect = useCallback((tag: string) => {
    faqAnalytics.trackFilter('tag', tag);
    addTag(tag);
  }, [addTag]);

  // Render FAQ items with click tracking
  const renderFAQItem = useCallback((faq: FAQItem, index: number) => (
    <div
      key={faq.id}
      onClick={() => handleFAQClick(faq, index)}
      className="cursor-pointer"
    >
      {/* FAQ content would be rendered here */}
    </div>
  ), [handleFAQClick]);

  // Popular tags from analytics
  const popularTags = useMemo(() => {
    return Object.entries(analytics.categoryUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [analytics.categoryUsage]);

  // Enhanced search suggestions
  const enhancedSuggestions = useMemo(() => {
    return [...suggestions, ...searchHistory.slice(0, 3)]
      .filter((item, index, arr) => arr.indexOf(item) === index)
      .slice(0, 8);
  }, [suggestions, searchHistory]);

  // No results handler with analytics
  React.useEffect(() => {
    if (query.length > 0 && totalResults === 0 && !loading) {
      faqAnalytics.trackNoResults(query, selectedCategory, selectedTags);
    }
  }, [query, totalResults, loading, selectedCategory, selectedTags]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}>
      {/* Enhanced Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-400/10 rounded-lg">
                  <HelpCircle className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">CVPlus FAQ</h1>
                  <p className="text-gray-400">Get answers about AI-powered CV transformation</p>
                </div>
              </div>
              
              {/* Performance Metrics Toggle */}
              <button
                onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors"
                title="View Performance Metrics"
              >
                <Zap className="w-4 h-4" />
                {showPerformanceMetrics ? 'Hide' : 'Show'} Metrics
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Metrics Panel */}
      {showPerformanceMetrics && (
        <div className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-gray-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Search: {searchTime}ms
                </span>
                <span>Results: {totalResults}</span>
                <span>Searches: {analytics.searchCount}</span>
                <span>Avg Time: {Math.round(performanceMetrics.averageSearchTime)}ms</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <FAQSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              popularTags={popularTags}
              onCategorySelect={handleCategorySelect}
              onTagSelect={handleTagSelect}
              className="sticky top-6"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Enhanced Search Bar */}
            <FAQSearchBar
              query={query}
              onQueryChange={setQuery}
              suggestions={enhancedSuggestions}
              isLoading={loading}
              placeholder="Search CVPlus FAQ - AI features, pricing, security..."
            />

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-gray-400">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <span className="px-2 py-1 bg-cyan-400/20 text-cyan-300 rounded-full">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                )}
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-400/20 text-purple-300 rounded-full cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}

            {/* Search Results Summary */}
            {query && (
              <div className="text-gray-400 text-sm">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                    Searching...
                  </div>
                ) : totalResults > 0 ? (
                  `Found ${totalResults} result${totalResults === 1 ? '' : 's'} for "${query}" in ${searchTime}ms`
                ) : (
                  `No results found for "${query}"`
                )}
              </div>
            )}

            {/* Category Grid (when no search) */}
            {!hasActiveFilters && (
              <>
                <FAQCategoryGrid
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                />
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-gray-400 mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Popular Questions
                  </div>
                </div>
              </>
            )}

            {/* Enhanced FAQ Results */}
            {error ? (
              <div className="text-center py-8">
                <div className="text-red-400 text-lg mb-2">Search Error</div>
                <div className="text-gray-400">{error}</div>
              </div>
            ) : (
              <FAQAccordion
                faqs={results.map(result => result.item)}
                searchQuery={query}
                selectedCategory={selectedCategory}
                onFeedback={handleFeedback}
              />
            )}

            {/* No Results with Suggestions */}
            {query && totalResults === 0 && !loading && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No results found for "{query}"
                </h3>
                <p className="text-gray-400 mb-6">
                  Try rephrasing your question or browse our categories below
                </p>
                
                {/* Quick Actions for No Results */}
                <FAQQuickActions
                  onTryNow={handleTryNow}
                  onViewPricing={handleViewPricing}
                  onContactSupport={handleContactSupport}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions (Always Visible) */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl border border-gray-700 p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-300">Need help?</div>
            <button
              onClick={handleContactSupport}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};