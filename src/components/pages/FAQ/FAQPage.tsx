import React, { useState, useEffect, useMemo } from 'react';
import { HelpCircle, Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { FAQPageProps, FAQItem, FAQCategory, SearchFilters } from './types';
import { FAQSearchBar } from './FAQSearchBar';
import { FAQCategoryGrid } from './FAQCategoryGrid';
import { FAQAccordion } from './FAQAccordion';
import { FAQSidebar } from './FAQSidebar';
import { FAQQuickActions } from './FAQQuickActions';
import { FAQ_DATA, FAQ_CATEGORIES } from '../../../data/faqData';


export const FAQPage: React.FC<FAQPageProps> = ({
  className = '',
  initialCategory = 'all',
  initialQuery = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const popularTags = ['upload', 'AI', 'pricing', 'export', 'templates', 'support'];

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearch = (filters: SearchFilters) => {
    setSearchQuery(filters.query);
    if (filters.category) {
      setSelectedCategory(filters.category);
    }
  };

  const handleFeedback = async (faqId: string, isHelpful: boolean) => {
    console.log(`FAQ ${faqId} marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
    // Here you would implement the actual feedback submission
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsMobileSidebarOpen(false);
  };

  const handleTagSelect = (tag: string) => {
    setSearchQuery(tag);
    setIsMobileSidebarOpen(false);
  };

  const handleTryNow = () => {
    window.location.href = '/';
  };

  const handleViewPricing = () => {
    window.location.href = '/pricing';
  };

  const handleContactSupport = () => {
    window.location.href = '/contact';
  };

  return (
    <div className={`min-h-screen bg-gray-900 ${className}`}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex p-4 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-3xl mb-8">
            <HelpCircle className="w-12 h-12 text-cyan-400" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100 mb-6 leading-tight">
            Frequently Asked{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Questions
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Find quick answers to common questions about CVPlus. Can't find what you're looking for? 
            Our support team is here to help transform your CV from{' '}
            <span className="text-cyan-400 font-semibold">Paper to Powerful</span>.
          </p>

          {/* Search Bar */}
          <div className="mb-8">
            <FAQSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              isLoading={isLoading}
              suggestions={[]}
              placeholder="Search for answers... (e.g., 'how to upload CV', 'pricing plans')"
            />
          </div>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span>{FAQ_DATA.length} articles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>{FAQ_CATEGORIES.length} categories</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Updated weekly</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-all duration-200"
            >
              <Menu className="w-4 h-4" />
              Categories & Support
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block sticky top-8">
                <FAQSidebar
                  categories={FAQ_CATEGORIES}
                  selectedCategory={selectedCategory}
                  popularTags={popularTags}
                  onCategorySelect={handleCategorySelect}
                  onTagSelect={handleTagSelect}
                />
              </div>

              {/* Mobile Sidebar Overlay */}
              {isMobileSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
                  <div className="absolute right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-gray-100">Navigation</h2>
                        <button
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <FAQSidebar
                        categories={FAQ_CATEGORIES}
                        selectedCategory={selectedCategory}
                        popularTags={popularTags}
                        onCategorySelect={handleCategorySelect}
                        onTagSelect={handleTagSelect}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Categories Grid */}
              {!searchQuery && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-100 mb-6">Browse by Category</h2>
                  <FAQCategoryGrid
                    categories={FAQ_CATEGORIES}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />
                </div>
              )}

              {/* FAQ Accordion */}
              <div className="mb-12">
                <FAQAccordion
                  faqs={filteredFAQs}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onFeedback={handleFeedback}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-16">
                <FAQQuickActions
                  onTryNow={handleTryNow}
                  onViewPricing={handleViewPricing}
                  onContactSupport={handleContactSupport}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-t border-gray-700 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-100 mb-4">
            Still Need Help?
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Our expert support team is ready to help you transform your CV and advance your career. 
            Get personalized assistance within 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContactSupport}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleTryNow}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 hover:border-cyan-400/50 text-gray-100 hover:text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Try CVPlus Now
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};