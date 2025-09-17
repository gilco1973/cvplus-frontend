/**
 * Content Optimizer Component
 * 
 * AI-powered content optimization interface that provides automatic
 * content enhancement, quality improvements, and intelligent suggestions
 * for multimedia content optimization across all content types.
 * 
 * Features:
 * - AI-powered content analysis and enhancement
 * - Automatic quality improvement recommendations
 * - Smart content optimization suggestions
 * - Real-time optimization preview and comparison
 * - Custom optimization profiles and preferences
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bot,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  Lightbulb,
  RefreshCw,
  Settings,
  Sliders,
  Star,
  Target,
  TrendingUp,
  Wand2,
  Zap
} from 'lucide-react';

// Content optimization interfaces
interface ContentItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'podcast' | 'gallery';
  title: string;
  url: string;
  metadata: {
    duration?: number;
    fileSize: number;
    format: string;
    resolution?: string;
    quality: number;
  };
  performance: {
    views: number;
    engagement: number;
    completion: number;
    shares: number;
  };
  currentScore: number;
  potentialScore: number;
}

interface OptimizationSuggestion {
  id: string;
  category: 'quality' | 'engagement' | 'performance' | 'accessibility' | 'seo';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    quality: number;
    engagement: number;
    performance: number;
    accessibility: number;
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: number; // in minutes
    costEstimate: number;
    automated: boolean;
  };
  preview?: {
    before: string;
    after: string;
    improvement: number;
  };
}

interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  focus: 'quality' | 'speed' | 'engagement' | 'accessibility' | 'balanced';
  settings: {
    aggressiveness: number; // 1-10
    prioritizeAutomation: boolean;
    maxCostPerItem: number;
    targetAudience: string[];
    contentTypes: string[];
  };
}

interface OptimizationResult {
  contentId: string;
  applied: OptimizationSuggestion[];
  results: {
    qualityImprovement: number;
    engagementImprovement: number;
    performanceImprovement: number;
    accessibilityImprovement: number;
    overallImprovement: number;
  };
  before: {
    score: number;
    metrics: Record<string, number>;
  };
  after: {
    score: number;
    metrics: Record<string, number>;
  };
  cost: number;
  timeSpent: number;
}

interface ContentOptimizerProps {
  contentItems?: ContentItem[];
  selectedContentId?: string;
  optimizationProfile?: string;
  autoOptimize?: boolean;
  showPreview?: boolean;
  onOptimizationComplete?: (result: OptimizationResult) => void;
  onSuggestionApply?: (suggestion: OptimizationSuggestion) => void;
  className?: string;
}

export const ContentOptimizer: React.FC<ContentOptimizerProps> = ({
  contentItems = [],
  selectedContentId,
  optimizationProfile = 'balanced',
  autoOptimize = false,
  showPreview = true,
  onOptimizationComplete,
  onSuggestionApply,
  className = ""
}) => {
  // State management
  const [content, setContent] = useState<ContentItem[]>(contentItems);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [profiles, setProfiles] = useState<OptimizationProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState(optimizationProfile);
  const [selectedContent, setSelectedContent] = useState<string | null>(selectedContentId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [results, setResults] = useState<OptimizationResult[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<'suggestions' | 'preview' | 'results'>('suggestions');
  const [error, setError] = useState<string | null>(null);

  // Load optimization profiles and analyze content
  useEffect(() => {
    loadOptimizationProfiles();
    if (content.length > 0) {
      analyzeContent();
    }
  }, [content, selectedProfile]);

  // Auto-optimization effect
  useEffect(() => {
    if (autoOptimize && suggestions.length > 0) {
      const highPrioritySuggestions = suggestions.filter(s => 
        s.priority === 'high' || s.priority === 'critical'
      );
      if (highPrioritySuggestions.length > 0) {
        applyOptimizations(highPrioritySuggestions.map(s => s.id));
      }
    }
  }, [suggestions, autoOptimize]);

  const loadOptimizationProfiles = async () => {
    try {
      const response = await fetch('/api/content-optimization/profiles');
      if (response.ok) {
        const profilesData = await response.json();
        setProfiles(profilesData);
      }
    } catch (err) {
      console.error('Failed to load optimization profiles:', err);
    }
  };

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/content-optimization/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: selectedContent ? content.filter(c => c.id === selectedContent) : content,
          profile: selectedProfile,
          analysisDepth: 'comprehensive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
        
        // Update content with potential scores
        setContent(prev => prev.map(item => {
          const contentSuggestions = data.suggestions.filter((s: any) => s.contentId === item.id);
          const potentialImprovement = contentSuggestions.reduce((sum: number, s: any) => 
            sum + s.impact.quality + s.impact.engagement + s.impact.performance, 0
          );
          return {
            ...item,
            potentialScore: Math.min(10, item.currentScore + potentialImprovement / 3)
          };
        }));
      } else {
        throw new Error('Content analysis failed');
      }
    } catch (err) {
      console.error('Content analysis failed:', err);
      setError('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimizations = async (suggestionIds: string[]) => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setError(null);

    try {
      const selectedSuggestions = suggestions.filter(s => suggestionIds.includes(s.id));
      
      const response = await fetch('/api/content-optimization/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestions: selectedSuggestions,
          profile: selectedProfile,
          contentIds: selectedContent ? [selectedContent] : content.map(c => c.id)
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.jobId) {
          // Monitor optimization progress
          monitorOptimizationProgress(data.jobId);
        } else {
          // Immediate results
          setResults(data.results);
          onOptimizationComplete?.(data.results[0]);
          setIsOptimizing(false);
        }
      } else {
        throw new Error('Optimization failed');
      }
    } catch (err) {
      console.error('Optimization failed:', err);
      setError('Failed to apply optimizations');
      setIsOptimizing(false);
    }
  };

  const monitorOptimizationProgress = async (jobId: string) => {
    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/content-optimization/status/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setOptimizationProgress(data.progress);

          if (data.status === 'completed') {
            setResults(data.results);
            onOptimizationComplete?.(data.results[0]);
            setIsOptimizing(false);
            setPreviewMode('results');
          } else if (data.status === 'failed') {
            setError(data.error || 'Optimization failed');
            setIsOptimizing(false);
          } else {
            // Continue polling
            setTimeout(pollProgress, 2000);
          }
        }
      } catch (err) {
        console.error('Failed to poll optimization progress:', err);
        setError('Lost connection to optimization process');
        setIsOptimizing(false);
      }
    };

    pollProgress();
  };

  // Filtered and sorted suggestions based on selected content and profile
  const filteredSuggestions = useMemo(() => {
    let filtered = suggestions;
    
    if (selectedContent) {
      filtered = filtered.filter(s => (s as any).contentId === selectedContent);
    }

    // Sort by priority and impact
    filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      const aImpact = Object.values(a.impact).reduce((sum, val) => sum + val, 0);
      const bImpact = Object.values(b.impact).reduce((sum, val) => sum + val, 0);
      return bImpact - aImpact;
    });

    return filtered;
  }, [suggestions, selectedContent]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'quality': return <Star className="h-4 w-4" />;
      case 'engagement': return <TrendingUp className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'accessibility': return <Eye className="h-4 w-4" />;
      case 'seo': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const renderContentSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Content Selection
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
            !selectedContent ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedContent(null)}
        >
          <div className="flex items-center mb-2">
            <Brain className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">All Content</span>
          </div>
          <p className="text-sm text-gray-600">
            Optimize all {content.length} items together
          </p>
          {!selectedContent && (
            <p className="text-xs text-blue-600 mt-1">
              Batch optimization active
            </p>
          )}
        </div>
        
        {content.map(item => (
          <div
            key={item.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedContent === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedContent(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 truncate">
                {item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title}
              </h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                {item.type}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Current Score:</span>
              <span className="font-medium">{item.currentScore.toFixed(1)}/10</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Potential:</span>
              <span className="font-medium text-green-600">
                +{(item.potentialScore - item.currentScore).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOptimizationProfiles = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Optimization Profile
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedProfile === profile.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedProfile(profile.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{profile.name}</h4>
              {selectedProfile === profile.id && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{profile.description}</p>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Focus:</span>
                <span className="font-medium capitalize">{profile.focus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Aggressiveness:</span>
                <span className="font-medium">{profile.settings.aggressiveness}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Cost:</span>
                <span className="font-medium">${profile.settings.maxCostPerItem}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSuggestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Optimization Suggestions
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={analyzeContent}
            disabled={isAnalyzing}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Refresh Analysis'}
          </button>
          <button
            onClick={() => applyOptimizations(filteredSuggestions.filter(s => s.implementation.automated).map(s => s.id))}
            disabled={isOptimizing || !filteredSuggestions.some(s => s.implementation.automated)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-Apply
          </button>
        </div>
      </div>

      {isOptimizing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between text-sm text-blue-800 mb-2">
            <span>Applying Optimizations</span>
            <span>{optimizationProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${optimizationProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredSuggestions.map(suggestion => (
          <div key={suggestion.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="mr-2 text-gray-500">
                    {getCategoryIcon(suggestion.category)}
                  </div>
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <span className={`ml-2 px-2 py-1 text-xs border rounded ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                
                {/* Impact Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-blue-600">
                      +{suggestion.impact.quality}
                    </div>
                    <div className="text-xs text-gray-500">Quality</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-green-600">
                      +{suggestion.impact.engagement}
                    </div>
                    <div className="text-xs text-gray-500">Engagement</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-purple-600">
                      +{suggestion.impact.performance}
                    </div>
                    <div className="text-xs text-gray-500">Performance</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-sm font-medium text-orange-600">
                      +{suggestion.impact.accessibility}
                    </div>
                    <div className="text-xs text-gray-500">Accessibility</div>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-green-600">
                  Total Impact: +{Object.values(suggestion.impact).reduce((sum, val) => sum + val, 0)}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.implementation.timeRequired}min • ${suggestion.implementation.costEstimate}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Difficulty: <span className="font-medium capitalize">{suggestion.implementation.difficulty}</span></span>
                {suggestion.implementation.automated && (
                  <span className="flex items-center text-green-600">
                    <Bot className="h-3 w-3 mr-1" />
                    Auto-applicable
                  </span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {showPreview && suggestion.preview && (
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    Preview
                  </button>
                )}
                <button
                  onClick={() => {
                    applyOptimizations([suggestion.id]);
                    onSuggestionApply?.(suggestion);
                  }}
                  disabled={isOptimizing}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && !isAnalyzing && (
        <div className="text-center py-8 text-gray-500">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="mb-2">No optimization suggestions available</p>
          <p className="text-sm">Your content is already well-optimized!</p>
        </div>
      )}
    </div>
  );

  const renderResults = () => {
    if (!results.length) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Optimization Results</h3>
        
        {results.map(result => (
          <div key={result.contentId} className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                Content ID: {result.contentId.substring(0, 8)}...
              </h4>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Cost: ${result.cost.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Time Spent: {result.timeSpent}min</div>
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <h5 className="font-medium text-red-800 mb-2">Before Optimization</h5>
                <div className="text-2xl font-bold text-red-700">
                  {result.before.score.toFixed(1)}/10
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">After Optimization</h5>
                <div className="text-2xl font-bold text-green-700">
                  {result.after.score.toFixed(1)}/10
                </div>
                <div className="text-sm text-green-600">
                  +{result.results.overallImprovement.toFixed(1)} improvement
                </div>
              </div>
            </div>

            {/* Improvement Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-medium text-blue-600">
                  +{result.results.qualityImprovement.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Quality</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">
                  +{result.results.engagementImprovement.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Engagement</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">
                  +{result.results.performanceImprovement.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Performance</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-orange-600">
                  +{result.results.accessibilityImprovement.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Accessibility</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Content Optimizer
        </h2>
        <p className="text-gray-600">
          Intelligent content optimization powered by advanced AI analysis and enhancement
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200 pb-4">
          {['suggestions', 'preview', 'results'].map(mode => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg capitalize ${
                previewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {previewMode === 'suggestions' && (
        <>
          {renderContentSelector()}
          {renderOptimizationProfiles()}
          {renderSuggestions()}
        </>
      )}

      {previewMode === 'preview' && showPreview && (
        <div className="text-center py-12 text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Preview functionality coming soon...</p>
        </div>
      )}

      {previewMode === 'results' && renderResults()}
    </div>
  );
};

export default ContentOptimizer;