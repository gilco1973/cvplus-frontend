import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, ExternalLink, Copy, Check } from 'lucide-react';
import { FAQAccordionProps } from './types';
import { FAQFeedbackButtons } from './FAQFeedbackButtons';

export const FAQAccordion: React.FC<FAQAccordionProps> = ({
  faqs,
  searchQuery,
  selectedCategory,
  onFeedback,
  className = ''
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-cyan-400/30 text-cyan-400 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  const toggleItem = (faqId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const copyLink = async (faqId: string) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#faq-${faqId}`;
      await navigator.clipboard.writeText(url);
      setCopiedId(faqId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Auto-open first result when searching
  useEffect(() => {
    if (searchQuery && filteredFAQs.length > 0) {
      setOpenItems(new Set([filteredFAQs[0].id]));
    }
  }, [searchQuery, filteredFAQs]);

  if (filteredFAQs.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">No results found</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `We couldn't find any FAQs matching "${searchQuery}". Try adjusting your search or browse categories.`
            : "No FAQs available in this category."
          }
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          Browse All FAQs
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Results Header */}
      {(searchQuery || selectedCategory !== 'all') && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} found
            </h3>
            {searchQuery && (
              <p className="text-gray-400 text-sm">
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => {
          const isOpen = openItems.has(faq.id);
          const isCopied = copiedId === faq.id;
          
          return (
            <div
              key={faq.id}
              id={`faq-${faq.id}`}
              className={`
                bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden
                transition-all duration-300 animate-fade-in-up
                hover:border-gray-600 hover:shadow-lg hover:shadow-black/20
                ${isOpen ? 'border-cyan-400/30 shadow-lg shadow-cyan-400/10' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Question Header */}
              <div
                onClick={() => toggleItem(faq.id)}
                className="w-full p-6 text-left flex items-start gap-4 hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer"
                aria-expanded={isOpen}
                aria-controls={`faq-content-${faq.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleItem(faq.id);
                  }
                }}
              >
                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                  ${isOpen 
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white rotate-90' 
                    : 'bg-gray-700 text-gray-400 group-hover:bg-gray-600'
                  }
                `}>
                  <ChevronRight className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-100 mb-2 leading-relaxed">
                    {highlightText(faq.question, searchQuery)}
                  </h3>
                  
                  {/* Tags */}
                  {faq.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {faq.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {faq.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs">
                          +{faq.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Copy Link Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLink(faq.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded-lg transition-all duration-200"
                    title="Copy link to this FAQ"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Expand/Collapse Icon */}
                  <ChevronDown className={`
                    w-5 h-5 text-gray-400 transition-transform duration-300
                    ${isOpen ? 'rotate-180 text-cyan-400' : ''}
                  `} />
                </div>
              </div>

              {/* Answer Content */}
              <div
                id={`faq-content-${faq.id}`}
                ref={(el) => (contentRefs.current[faq.id] = el)}
                className={`
                  overflow-hidden transition-all duration-300 ease-out
                  ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <div className="px-6 pb-6">
                  <div className="ml-12">
                    {/* Answer Text */}
                    <div className="prose prose-invert max-w-none mb-6">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {highlightText(faq.answer, searchQuery)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <FAQFeedbackButtons
                        faqId={faq.id}
                        isHelpful={faq.isHelpful}
                        onFeedback={onFeedback}
                      />
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          Updated {new Date(faq.lastUpdated).toLocaleDateString()}
                        </span>
                        
                        {/* External Link if answer contains links */}
                        {faq.answer.includes('http') && (
                          <div 
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Add link handling logic here if needed
                              }
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Learn more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};