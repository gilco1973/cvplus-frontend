import React, { useState, useEffect } from 'react';
import { X, Sparkles, Award, TrendingUp, Brain, Lightbulb, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScriptOptimizationPanelProps {
  script: string;
  qualityScore?: number;
  industryAlignment?: number;
  onScriptChange: (script: string) => void;
  onOptimize: (optimizedScript: string) => void;
  onClose: () => void;
}

interface OptimizationSuggestion {
  id: string;
  type: 'structure' | 'content' | 'tone' | 'keywords';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  preview: string;
  applied: boolean;
}

interface ScriptMetrics {
  wordCount: number;
  readingTime: number;
  sentimentScore: number;
  keywordDensity: number;
  professionalTone: number;
  engagementFactors: string[];
}

export const ScriptOptimizationPanel: React.FC<ScriptOptimizationPanelProps> = ({
  script,
  qualityScore,
  industryAlignment,
  onScriptChange,
  onOptimize,
  onClose
}) => {
  const [optimizedScript, setOptimizedScript] = useState(script);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [metrics, setMetrics] = useState<ScriptMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);

  // Calculate script metrics
  useEffect(() => {
    const calculateMetrics = (text: string): ScriptMetrics => {
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Basic metrics
      const wordCount = words.length;
      const readingTime = Math.ceil(wordCount / 180); // Average speaking rate
      
      // Sentiment analysis (simplified)
      const positiveWords = ['passionate', 'innovative', 'successful', 'expert', 'leader', 'achieve', 'excel', 'outstanding', 'proven', 'dedicated'];
      const positiveMatches = words.filter(word => 
        positiveWords.some(positive => word.toLowerCase().includes(positive))
      ).length;
      const sentimentScore = Math.min((positiveMatches / wordCount) * 100, 100);
      
      // Professional tone analysis
      const professionalWords = ['experience', 'expertise', 'professional', 'skills', 'qualifications', 'achievements', 'results', 'solutions'];
      const professionalMatches = words.filter(word => 
        professionalWords.some(prof => word.toLowerCase().includes(prof))
      ).length;
      const professionalTone = Math.min((professionalMatches / wordCount) * 100, 100);
      
      // Engagement factors
      const engagementFactors = [];
      if (text.includes('?')) engagementFactors.push('Questions');
      if (text.match(/\b(you|your)\b/gi)) engagementFactors.push('Direct Address');
      if (text.match(/\b(I|my|me)\b/gi)) engagementFactors.push('Personal Connection');
      if (text.match(/\b(achieve|results|success|impact)\b/gi)) engagementFactors.push('Results-Oriented');
      
      return {
        wordCount,
        readingTime,
        sentimentScore,
        keywordDensity: (professionalMatches / wordCount) * 100,
        professionalTone,
        engagementFactors
      };
    };

    if (optimizedScript) {
      setMetrics(calculateMetrics(optimizedScript));
    }
  }, [optimizedScript]);

  // Generate optimization suggestions
  useEffect(() => {
    const generateSuggestions = (): OptimizationSuggestion[] => {
      const suggestions: OptimizationSuggestion[] = [];
      
      // Structure suggestions
      if (!script.includes('Hello') && !script.includes('Hi')) {
        suggestions.push({
          id: 'greeting',
          type: 'structure',
          title: 'Add Professional Greeting',
          description: 'Start with a warm, professional greeting to establish connection',
          impact: 'medium',
          preview: 'Hello, I\'m [Name]...',
          applied: false
        });
      }
      
      if (metrics && metrics.wordCount < 50) {
        suggestions.push({
          id: 'expand-content',
          type: 'content',
          title: 'Expand Content',
          description: 'Add more details about your experience and achievements',
          impact: 'high',
          preview: 'Include specific examples of your accomplishments...',
          applied: false
        });
      }
      
      if (metrics && metrics.sentimentScore < 30) {
        suggestions.push({
          id: 'positive-tone',
          type: 'tone',
          title: 'Enhance Positive Language',
          description: 'Use more positive and confident language to engage viewers',
          impact: 'high',
          preview: 'Replace neutral terms with passionate, innovative, successful...',
          applied: false
        });
      }
      
      if (metrics && metrics.professionalTone < 40) {
        suggestions.push({
          id: 'professional-keywords',
          type: 'keywords',
          title: 'Add Professional Keywords',
          description: 'Include industry-specific terms and professional language',
          impact: 'medium',
          preview: 'Add terms like expertise, experience, qualifications...',
          applied: false
        });
      }
      
      if (!script.includes('connect') && !script.includes('contact')) {
        suggestions.push({
          id: 'call-to-action',
          type: 'structure',
          title: 'Add Call to Action',
          description: 'End with a clear invitation for viewers to connect',
          impact: 'high',
          preview: 'Let\'s connect to explore opportunities together...',
          applied: false
        });
      }
      
      return suggestions;
    };

    setSuggestions(generateSuggestions());
  }, [script, metrics]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-700/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-700/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'structure': return <Award className="w-4 h-4" />;
      case 'content': return <Brain className="w-4 h-4" />;
      case 'tone': return <TrendingUp className="w-4 h-4" />;
      case 'keywords': return <Sparkles className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      // Simulate AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let optimized = optimizedScript;
      
      // Apply selected suggestions
      suggestions.forEach(suggestion => {
        if (selectedSuggestions.includes(suggestion.id)) {
          switch (suggestion.id) {
            case 'greeting':
              if (!optimized.startsWith('Hello') && !optimized.startsWith('Hi')) {
                optimized = `Hello! ${optimized}`;
              }
              break;
            case 'call-to-action':
              if (!optimized.includes('connect')) {
                optimized += " Let's connect to explore opportunities together.";
              }
              break;
            case 'positive-tone':
              optimized = optimized
                .replace(/good/gi, 'excellent')
                .replace(/nice/gi, 'outstanding')
                .replace(/work/gi, 'deliver results');
              break;
          }
        }
      });
      
      setOptimizedScript(optimized);
      onOptimize(optimized);
      toast.success('Script optimized successfully!');
    } catch (error) {
      toast.error('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">AI Script Optimization</h2>
              <p className="text-gray-400 text-sm">
                Enhance your script with AI-powered suggestions and industry best practices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Script Editor */}
          <div className="flex-1 p-6 border-r border-gray-700">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Script Content</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                {qualityScore && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Quality: {qualityScore.toFixed(1)}/10
                  </span>
                )}
                {industryAlignment && (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Industry: {(industryAlignment * 100).toFixed(0)}%
                  </span>
                )}
                {metrics && (
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    {metrics.wordCount} words • {metrics.readingTime}s
                  </span>
                )}
              </div>
            </div>
            
            <textarea
              value={optimizedScript}
              onChange={(e) => {
                setOptimizedScript(e.target.value);
                onScriptChange(e.target.value);
              }}
              className="w-full h-64 bg-gray-700 text-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-600"
              placeholder="Edit your video script here..."
            />
            
            {/* Script Metrics */}
            {metrics && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-cyan-400">{metrics.wordCount}</div>
                  <div className="text-xs text-gray-400">Words</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-yellow-400">{metrics.readingTime}s</div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-400">{metrics.sentimentScore.toFixed(0)}%</div>
                  <div className="text-xs text-gray-400">Positive</div>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">{metrics.professionalTone.toFixed(0)}%</div>
                  <div className="text-xs text-gray-400">Professional</div>
                </div>
              </div>
            )}
          </div>

          {/* Optimization Suggestions */}
          <div className="w-full lg:w-96 p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">AI Suggestions</h3>
              <p className="text-sm text-gray-400">
                Select suggestions to apply to your script
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSuggestions.includes(suggestion.id)
                      ? 'bg-cyan-900/20 border-cyan-500'
                      : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => toggleSuggestion(suggestion.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${getImpactColor(suggestion.impact).split(' ')[1]} ${getImpactColor(suggestion.impact).split(' ')[2]}`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-200">{suggestion.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{suggestion.description}</p>
                      <div className="text-xs text-gray-500 italic">
                        "{suggestion.preview}"
                      </div>
                    </div>
                    {selectedSuggestions.includes(suggestion.id) && (
                      <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-300 font-medium">Script looks great!</p>
                  <p className="text-sm text-gray-400">No optimization suggestions at this time.</p>
                </div>
              )}
            </div>
            
            {/* Engagement Factors */}
            {metrics && metrics.engagementFactors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Engagement Factors</h4>
                <div className="flex flex-wrap gap-2">
                  {metrics.engagementFactors.map((factor, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-green-900/20 text-green-400 border border-green-700/30 rounded-full"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleOptimize}
                disabled={isOptimizing || selectedSuggestions.length === 0}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Apply {selectedSuggestions.length} Suggestion{selectedSuggestions.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptOptimizationPanel;