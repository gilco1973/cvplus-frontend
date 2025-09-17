import React, { useState, useEffect, useRef } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface KeywordSuggestion {
  keyword: string;
  relevanceScore: number;
  category: 'technical' | 'soft' | 'industry' | 'role-specific';
  reason: string;
  impact: 'high' | 'medium' | 'low';
  isApplied: boolean;
}

interface KeywordAnalysis {
  currentKeywords: string[];
  suggestions: KeywordSuggestion[];
  missingCritical: string[];
  industryRelevance: number;
  atsScore: number;
  competitorComparison: {
    missing: string[];
    overused: string[];
  };
}

interface KeywordEnhancementProps extends CVFeatureProps {
  targetRole?: string;
  industry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}

export const KeywordEnhancement: React.FC<KeywordEnhancementProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  targetRole = '',
  industry = '',
  experienceLevel = 'mid'
}) => {
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    data: keywordData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getKeywordEnhancement',
    { jobId, profileId, targetRole, industry, experienceLevel },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (keywordData) {
      setAnalysis(keywordData);
    }
    if (data) {
      setSelectedKeywords(data.selectedKeywords || []);
    }
  }, [keywordData, data]);

  const handleKeywordToggle = (keyword: string) => {
    const newSelection = selectedKeywords.includes(keyword)
      ? selectedKeywords.filter(k => k !== keyword)
      : [...selectedKeywords, keyword];
    
    setSelectedKeywords(newSelection);
    onUpdate?.({ selectedKeywords: newSelection, analysis });
  };

  const handleApplyKeywords = async () => {
    if (!selectedKeywords.length) return;
    
    setIsApplying(true);
    try {
      // Call Firebase function to apply keywords to CV
      const response = await fetch('/api/applyKeywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          keywords: selectedKeywords,
          mode: 'enhance'
        })
      });

      if (response.ok) {
        const result = await response.json();
        onUpdate?.({
          selectedKeywords,
          analysis,
          enhancedContent: result.enhancedContent,
          appliedAt: new Date().toISOString()
        });
        
        // Update analysis to reflect applied keywords
        if (analysis) {
          const updatedAnalysis = {
            ...analysis,
            suggestions: analysis.suggestions.map(s => ({
              ...s,
              isApplied: selectedKeywords.includes(s.keyword)
            }))
          };
          setAnalysis(updatedAnalysis);
        }
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setIsApplying(false);
    }
  };

  const getFilteredSuggestions = () => {
    if (!analysis) return [];
    
    return analysis.suggestions.filter(suggestion => {
      const matchesSearch = suggestion.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || suggestion.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '✨';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Keyword Enhancement">
        <LoadingSpinner message="Analyzing keywords and generating suggestions..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Keyword Enhancement">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  if (!analysis) {
    return (
      <FeatureWrapper className={className} title="Keyword Enhancement">
        <div className="text-gray-500 text-center p-8">
          <p>No keyword analysis available</p>
        </div>
      </FeatureWrapper>
    );
  }

  const filteredSuggestions = getFilteredSuggestions();
  const selectedCount = selectedKeywords.length;
  const impactScore = analysis.atsScore + (selectedCount * 2);

  return (
    <FeatureWrapper className={className} title="Smart Keyword Enhancement">
      <div className="space-y-6">
        {/* Analysis Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{analysis.atsScore}%</div>
            <div className="text-sm text-gray-600">Current ATS Score</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysis.industryRelevance}%</div>
            <div className="text-sm text-gray-600">Industry Relevance</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">+{selectedCount * 2}%</div>
            <div className="text-sm text-gray-600">Projected Improvement</div>
          </div>
        </div>

        {/* Missing Critical Keywords Alert */}
        {analysis.missingCritical.length > 0 && (
          <div className="animate-fade-in bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              🚨 Critical Keywords Missing
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.missingCritical.map(keyword => (
                <button
                  key={keyword}
                  onClick={() => handleKeywordToggle(keyword)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
                >
                  + {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical Skills</option>
            <option value="soft">Soft Skills</option>
            <option value="industry">Industry Terms</option>
            <option value="role-specific">Role-Specific</option>
          </select>
        </div>

        {/* Keyword Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Suggested Keywords ({filteredSuggestions.length})
            </h3>
            {selectedCount > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedCount} selected
                </span>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                >
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  onClick={handleApplyKeywords}
                  disabled={isApplying}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isApplying ? 'Applying...' : 'Apply Keywords'}
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-3">
            <div>
              {filteredSuggestions.map((suggestion, index) => {
                const isSelected = selectedKeywords.includes(suggestion.keyword);
                
                return (
                  <div 
                    key={suggestion.keyword}
                    className={`animate-fade-in p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : suggestion.isApplied
                        ? 'border-green-300 bg-green-50 opacity-60'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => !suggestion.isApplied && handleKeywordToggle(suggestion.keyword)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {suggestion.keyword}
                          </span>
                          <span className="text-lg">
                            {getImpactIcon(suggestion.impact)}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            suggestion.category === 'technical' ? 'bg-purple-100 text-purple-700' :
                            suggestion.category === 'soft' ? 'bg-green-100 text-green-700' :
                            suggestion.category === 'industry' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {suggestion.category}
                          </span>
                          {suggestion.isApplied && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Relevance: {suggestion.relevanceScore}%</span>
                          <span className={`font-medium ${
                            suggestion.impact === 'high' ? 'text-red-600' :
                            suggestion.impact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {suggestion.impact.toUpperCase()} Impact
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          {showPreview && selectedCount > 0 && (
            <div 
              ref={previewRef}
              className="animate-fade-in bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 mb-3">Enhancement Preview</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Selected Keywords:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedKeywords.map(keyword => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Projected ATS Score:</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold ${getScoreColor(analysis.atsScore)}`}>
                      {analysis.atsScore}%
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={`text-lg font-bold ${getScoreColor(impactScore)}`}>
                      {Math.min(impactScore, 100)}%
                    </span>
                    <span className="text-green-600 text-sm font-medium">
                      (+{Math.min(selectedCount * 2, 100 - analysis.atsScore)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Competitor Analysis */}
        {analysis.competitorComparison && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Competitive Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.competitorComparison.missing.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Keywords Your Competitors Use:</div>
                  <div className="space-y-1">
                    {analysis.competitorComparison.missing.slice(0, 5).map(keyword => (
                      <button
                        key={keyword}
                        onClick={() => handleKeywordToggle(keyword)}
                        className="block w-full text-left px-3 py-2 bg-yellow-50 text-yellow-800 rounded text-sm hover:bg-yellow-100 transition-colors"
                      >
                        + {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {analysis.competitorComparison.overused.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Consider Reducing:</div>
                  <div className="space-y-1">
                    {analysis.competitorComparison.overused.slice(0, 5).map(keyword => (
                      <div
                        key={keyword}
                        className="px-3 py-2 bg-orange-50 text-orange-800 rounded text-sm"
                      >
                        ⚠️ {keyword} (overused)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FeatureWrapper>
  );
};

export default KeywordEnhancement;