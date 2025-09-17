import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Search, Filter, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface Keyword {
  id: string;
  text: string;
  category: 'technical' | 'soft' | 'industry' | 'custom';
  priority: 'high' | 'medium' | 'low';
  inCV: boolean;
  frequency: number;
  suggested?: boolean;
}

interface KeywordManagerProps {
  extractedKeywords?: {
    all: string[];
    missing: string[];
    industry: string[];
    technical: string[];
  };
  onKeywordsChange: (keywords: Keyword[]) => void;
  className?: string;
}

export const KeywordManager: React.FC<KeywordManagerProps> = ({
  extractedKeywords,
  onKeywordsChange,
  className = ''
}) => {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Convert extracted keywords to keyword objects
  useEffect(() => {
    if (extractedKeywords) {
      const newKeywords: Keyword[] = [];

      // Add technical keywords
      extractedKeywords.technical?.forEach((keyword, index) => {
        newKeywords.push({
          id: `tech-${index}`,
          text: keyword,
          category: 'technical',
          priority: 'high',
          inCV: !extractedKeywords.missing?.includes(keyword),
          frequency: 0,
          suggested: true
        });
      });

      // Add industry keywords
      extractedKeywords.industry?.forEach((keyword, index) => {
        if (!newKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase())) {
          newKeywords.push({
            id: `industry-${index}`,
            text: keyword,
            category: 'industry',
            priority: 'medium',
            inCV: !extractedKeywords.missing?.includes(keyword),
            frequency: 0,
            suggested: true
          });
        }
      });

      // Add missing keywords with high priority
      extractedKeywords.missing?.forEach((keyword, index) => {
        if (!newKeywords.find(k => k.text.toLowerCase() === keyword.toLowerCase())) {
          newKeywords.push({
            id: `missing-${index}`,
            text: keyword,
            category: 'custom',
            priority: 'high',
            inCV: false,
            frequency: 0,
            suggested: true
          });
        }
      });

      setKeywords(newKeywords);
      onKeywordsChange(newKeywords);
    }
  }, [extractedKeywords, onKeywordsChange]);

  const addKeyword = () => {
    if (!newKeyword.trim()) return;

    const newKeywordObj: Keyword = {
      id: `custom-${Date.now()}`,
      text: newKeyword.trim(),
      category: 'custom',
      priority: 'medium',
      inCV: false,
      frequency: 0,
      suggested: false
    };

    const updatedKeywords = [...keywords, newKeywordObj];
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
    setNewKeyword('');
  };

  const removeKeyword = (id: string) => {
    const updatedKeywords = keywords.filter(k => k.id !== id);
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
  };

  const updateKeyword = (id: string, updates: Partial<Keyword>) => {
    const updatedKeywords = keywords.map(k => 
      k.id === id ? { ...k, ...updates } : k
    );
    setKeywords(updatedKeywords);
    onKeywordsChange(updatedKeywords);
  };

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || keyword.category === selectedCategory;
    const matchesSuggestions = showSuggestions || !keyword.suggested;
    
    return matchesSearch && matchesCategory && matchesSuggestions;
  });

  const getKeywordStats = () => {
    const total = keywords.length;
    const inCV = keywords.filter(k => k.inCV).length;
    const missing = keywords.filter(k => !k.inCV).length;
    const highPriority = keywords.filter(k => k.priority === 'high').length;

    return { total, inCV, missing, highPriority };
  };

  const stats = getKeywordStats();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600/20 text-red-300 border-red-500';
      case 'medium': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500';
      case 'low': return 'bg-green-600/20 text-green-300 border-green-500';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-600/20 text-blue-300';
      case 'soft': return 'bg-purple-600/20 text-purple-300';
      case 'industry': return 'bg-orange-600/20 text-orange-300';
      case 'custom': return 'bg-gray-600/20 text-gray-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-100">Keyword Manager</h3>
            <p className="text-gray-400">Manage and optimize your CV keywords</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Keywords</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{stats.inCV}</div>
          <div className="text-sm text-gray-400">In Your CV</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{stats.missing}</div>
          <div className="text-sm text-gray-400">Missing</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{stats.highPriority}</div>
          <div className="text-sm text-gray-400">High Priority</div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        {/* Add New Keyword */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            placeholder="Add a custom keyword..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addKeyword}
            disabled={!newKeyword.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search keywords..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="technical">Technical</option>
            <option value="soft">Soft Skills</option>
            <option value="industry">Industry</option>
            <option value="custom">Custom</option>
          </select>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showSuggestions 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Keywords List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredKeywords.length > 0 ? (
          filteredKeywords.map((keyword) => (
            <div
              key={keyword.id}
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                keyword.inCV 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : 'bg-gray-900 border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {!keyword.inCV && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <span className="font-medium text-gray-100">{keyword.text}</span>
                  {keyword.suggested && (
                    <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
                      Suggested
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(keyword.category)}`}>
                    {keyword.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(keyword.priority)}`}>
                    {keyword.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Priority Selector */}
                <select
                  value={keyword.priority}
                  onChange={(e) => updateKeyword(keyword.id, { priority: e.target.value as Keyword['priority'] })}
                  className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-gray-300"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* In CV Toggle */}
                <button
                  onClick={() => updateKeyword(keyword.id, { inCV: !keyword.inCV })}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    keyword.inCV
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {keyword.inCV ? 'In CV' : 'Add to CV'}
                </button>

                {/* Remove Button */}
                <button
                  onClick={() => removeKeyword(keyword.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No keywords found</p>
            <p className="text-sm">Add keywords manually or analyze a job description</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {keywords.length > 0 && (
        <div className="flex gap-3 pt-6 border-t border-gray-700">
          <button
            onClick={() => {
              const highPriorityKeywords = keywords.filter(k => k.priority === 'high' && !k.inCV);
              console.log('High priority missing keywords:', highPriorityKeywords);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
          >
            <Target className="w-4 h-4" />
            Focus on High Priority ({keywords.filter(k => k.priority === 'high' && !k.inCV).length})
          </button>
          <button
            onClick={() => {
              const optimizationTips = keywords
                .filter(k => !k.inCV)
                .slice(0, 5)
                .map(k => `Add "${k.text}" to your ${k.category} skills section`);
              console.log('Optimization tips:', optimizationTips);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Get Optimization Tips
          </button>
        </div>
      )}
    </div>
  );
};

export default KeywordManager;