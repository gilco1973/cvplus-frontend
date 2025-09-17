import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, HelpCircle, Book, Play, ChevronRight } from 'lucide-react';
import { useHelp } from '../../contexts/HelpContext';
import type { HelpContent, HelpTour } from '../../types/help';

interface HelpSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSearchPanel: React.FC<HelpSearchPanelProps> = ({ isOpen, onClose }) => {
  const { searchHelp, getContextualHelp, getAvailableTours, actions, currentContext, searchQuery, userPreferences } = useHelp();
  const [query, setQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<HelpContent[]>([]);
  const [contextualHelp, setContextualHelp] = useState<HelpContent[]>([]);
  const [availableTours, setAvailableTours] = useState<HelpTour[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'contextual' | 'tours'>('contextual');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Update search results when query changes
  useEffect(() => {
    if (query.trim()) {
      const results = searchHelp(query);
      setSearchResults(results);
      setActiveTab('search');
    } else {
      setSearchResults([]);
      if (activeTab === 'search') {
        setActiveTab('contextual');
      }
    }
  }, [query, searchHelp]);

  // Load contextual help and tours
  useEffect(() => {
    setContextualHelp(getContextualHelp(currentContext));
    setAvailableTours(getAvailableTours(currentContext));
  }, [currentContext, getContextualHelp, getAvailableTours]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab') {
        // Cycle through tabs
        event.preventDefault();
        if (activeTab === 'contextual') setActiveTab('search');
        else if (activeTab === 'search') setActiveTab('tours');
        else setActiveTab('contextual');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, onClose]);

  const handleHelpClick = (helpId: string) => {
    actions.showHelp(helpId);
    onClose();
  };

  const handleTourStart = (tourId: string) => {
    actions.startTour(tourId);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tooltip': return '💡';
      case 'popover': return '📝';
      case 'modal': return '📋';
      case 'overlay': return '🔍';
      case 'guide': return '📖';
      case 'tour': return '🎯';
      default: return '❓';
    }
  };

  if (!isOpen) return null;

  const panel = (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black bg-opacity-50">
      <div
        ref={panelRef}
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-gray-300 max-h-[90vh] overflow-hidden animate-slide-in-right"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
              Help & Guidance
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close help panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                actions.setSearchQuery(e.target.value);
              }}
              placeholder="Search help topics..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  actions.setSearchQuery('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('contextual')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'contextual'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Current Page ({contextualHelp.length})
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Search ({searchResults.length})
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'tours'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Tours ({availableTours.length})
          </button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {/* Contextual Help */}
          {activeTab === 'contextual' && (
            <div className="p-4 space-y-3">
              {contextualHelp.length > 0 ? (
                contextualHelp.map((help) => (
                  <button
                    key={help.id}
                    onClick={() => handleHelpClick(help.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0">{getTypeIcon(help.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-700">
                          {help.title}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{help.content}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {help.category}
                          </span>
                          {help.isNew && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Book className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No contextual help available for this page.</p>
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {activeTab === 'search' && (
            <div className="p-4 space-y-3">
              {query ? (
                searchResults.length > 0 ? (
                  searchResults.map((help) => (
                    <button
                      key={help.id}
                      onClick={() => handleHelpClick(help.id)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-lg flex-shrink-0">{getTypeIcon(help.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-blue-700">
                            {help.title}
                          </h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{help.content}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {help.context}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {help.category}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No results found for "{query}"</p>
                    <p className="text-gray-500 text-xs mt-1">Try different keywords or browse contextual help</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Type to search help topics</p>
                </div>
              )}
            </div>
          )}

          {/* Tours */}
          {activeTab === 'tours' && (
            <div className="p-4 space-y-3">
              {availableTours.length > 0 ? (
                availableTours.map((tour) => (
                  <button
                    key={tour.id}
                    onClick={() => handleTourStart(tour.id)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <Play className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1 group-hover:text-green-700">
                          {tour.name}
                        </h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{tour.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            {tour.category}
                          </span>
                          {tour.estimatedTime && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              ~{tour.estimatedTime} min
                            </span>
                          )}
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tour.steps.length} steps
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-green-600" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Play className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No tours available for this page.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <span>Help preferences:</span>
              <button
                onClick={() => actions.updatePreferences({ showTooltips: !userPreferences.showTooltips })}
                className={`px-2 py-1 rounded ${
                  userPreferences.showTooltips
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Tooltips {userPreferences.showTooltips ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <span>Press</span>
              <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
};