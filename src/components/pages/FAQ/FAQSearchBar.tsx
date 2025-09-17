import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { SearchBarProps } from './types';
import { faqAnalytics } from '../../../services/faqAnalytics';

export const FAQSearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  placeholder = "Search for answers about CVPlus AI...",
  suggestions = [],
  isLoading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // CVPlus-specific popular queries
  const popularQueries = [
    "How do I upload my CV to CVPlus?",
    "What AI features are available?",
    "How is my CV data protected?",
    "What are the pricing plans?",
    "How does the video introduction work?",
    "Calendar integration setup"
  ];

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('faq_search_history');
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onQueryChange(value);
    setShowSuggestions(value.length > 0 || isFocused);
    
    // Track search input after meaningful length
    if (value.length >= 3) {
      // Debounced tracking to avoid excessive events
      setTimeout(() => {
        if (inputRef.current?.value === value) {
          updateSearchHistory(value);
        }
      }, 1000);
    }
  };

  const handleClearQuery = () => {
    onQueryChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
    
    // Track suggestion click
    faqAnalytics.trackEvent('suggestion_click', {
      suggestion,
      source: 'search_bar'
    });
    
    // Add to search history
    updateSearchHistory(suggestion);
  };

  const updateSearchHistory = (query: string) => {
    if (query.length > 2) {
      const updatedHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(updatedHistory);
      localStorage.setItem('faq_search_history', JSON.stringify(updatedHistory));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className={`
        relative flex items-center bg-gray-800/50 backdrop-blur-sm border-2 rounded-2xl
        transition-all duration-300 overflow-hidden
        ${isFocused 
          ? 'border-cyan-400/50 shadow-lg shadow-cyan-400/20' 
          : 'border-gray-700 hover:border-gray-600'
        }
      `}>
        <Search 
          className={`
            w-5 h-5 ml-6 transition-colors duration-300
            ${isFocused ? 'text-cyan-400' : 'text-gray-400'}
          `}
          aria-hidden="true"
        />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none text-lg"
          aria-label="Search FAQ"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="mr-4">
            <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Clear Button */}
        {query && !isLoading && (
          <button
            onClick={handleClearQuery}
            className="p-2 mr-4 text-gray-400 hover:text-gray-200 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl shadow-black/50 z-50 animate-fade-in-down"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Direct Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4 border-b border-gray-700/50">
              <div className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-700/50 rounded-lg transition-colors duration-150 text-sm"
                  role="option"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Popular Queries */}
          {query.length === 0 && (
            <>
              <div className="p-4 border-b border-gray-700/50">
                <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Popular Questions
                </div>
                <div className="space-y-1">
                  {popularQueries.map((popularQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(popularQuery)}
                      className="w-full text-left px-3 py-2 text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-150 text-sm hover:text-cyan-400"
                      role="option"
                    >
                      {popularQuery}
                    </button>
                  ))}
                </div>
              </div>

              {searchHistory.length > 0 && (
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    Recent Searches
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((recentQuery, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(recentQuery)}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-150 text-sm hover:text-gray-100"
                        role="option"
                      >
                        {recentQuery}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {query.length > 0 && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-400">
              <div className="text-sm">No suggestions found for "{query}"</div>
              <div className="text-xs mt-1">Try a different search term or browse categories below</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};