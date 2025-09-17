import { CheckCircle, XCircle, AlertCircle, TrendingUp, BarChart3, Target, Users, Gauge, ChevronDown, ChevronRight, Zap, Award } from 'lucide-react';
import { useState } from 'react';
import type {
  EnhancedATSResult,
  ATSScoreProps,
  ATSSystemType
} from '../../types/ats';

// Helper functions for ATS display
const getSystemDisplayName = (system: ATSSystemType): string => {
  const names = {
    workday: 'Workday',
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    bamboohr: 'BambooHR',
    taleo: 'Oracle Taleo',
    generic: 'Generic ATS'
  };
  return names[system] || system;
};

const getBreakdownColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const getBreakdownBg = (score: number): string => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getPriorityColor = (priority: number): string => {
  if (priority <= 2) return 'bg-red-100 text-red-700 border-red-300';
  if (priority <= 3) return 'bg-orange-100 text-orange-700 border-orange-300';
  return 'bg-blue-100 text-blue-700 border-blue-300';
};

const getPriorityIcon = (priority: number) => {
  if (priority <= 2) return <AlertCircle className="w-4 h-4" />;
  if (priority <= 3) return <Target className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
};

interface LegacyATSScoreProps {
  score: number;
  passes: boolean;
  issues?: {
    type: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    section?: string;
    fix?: string;
  }[];
  suggestions?: {
    section: string;
    original: string;
    suggested: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }[];
  keywords?: {
    found: string[];
    missing: string[];
    recommended: string[];
  };
}

// Support both legacy and enhanced props
type ATSScoreComponentProps = ATSScoreProps | LegacyATSScoreProps;

// Type guard to check if props include enhanced result
const isEnhancedProps = (props: ATSScoreComponentProps): props is ATSScoreProps => {
  return 'result' in props;
};

export const ATSScore = (props: ATSScoreComponentProps) => {
  const [expandedSections, setExpandedSections] = useState({
    breakdown: true,
    systems: false,
    competitor: false,
    recommendations: true
  });

  // Handle both legacy and enhanced props
  const isEnhanced = isEnhancedProps(props);
  
  const legacyData = isEnhanced ? null : {
    score: props.score,
    passes: props.passes,
    issues: props.issues || [],
    suggestions: props.suggestions || [],
    keywords: props.keywords
  };
  
  const enhancedResult: EnhancedATSResult | null = isEnhanced ? props.result : null;
  
  // Use enhanced data if available, fallback to legacy
  const score = enhancedResult?.advancedScore?.overall ?? legacyData?.score ?? 0;
  const passes = enhancedResult?.passes ?? legacyData?.passes ?? false;
  const confidence = enhancedResult?.advancedScore?.confidence ?? 0.8;
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !(prev as Record<string, boolean>)[section]
    }));
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-600/20';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-600/20';
    return 'from-red-500/20 to-red-600/20';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Score Display */}
      <div className="bg-gray-800 rounded-xl p-8 text-center animate-scale-in">
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br ${getScoreBgColor(score)} mb-4 relative`}>
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</span>
          {isEnhanced && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Award className="w-3 h-3" />
              <span>AI</span>
            </div>
          )}
        </div>
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          {isEnhanced ? 'Advanced ATS Analysis' : 'ATS Compatibility Score'}
        </h3>
        <p className="text-gray-400">
          {passes ? (
            <span className="text-green-400">✓ Your CV passes ATS screening</span>
          ) : (
            <span className="text-red-400">✗ Your CV needs optimization for ATS</span>
          )}
        </p>
        {isEnhanced && (
          <p className="text-xs text-gray-500 mt-2">
            Confidence: {Math.round(confidence * 100)}% • Multi-factor Analysis
          </p>
        )}
      </div>
      
      {/* Enhanced Multi-Factor Breakdown */}
      {isEnhanced && enhancedResult && (
        <div className="bg-gray-800 rounded-xl animate-fade-in-up animation-delay-100">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-xl"
            onClick={() => toggleSection('breakdown')}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-cyan-500" />
              <h4 className="text-lg font-semibold text-gray-100">Score Breakdown</h4>
            </div>
            {expandedSections.breakdown ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </div>
          
          {expandedSections.breakdown && (
            <div className="p-6 pt-0 space-y-4">
              {Object.entries(enhancedResult.advancedScore?.breakdown || {}).map(([key, value]) => {
                const weight = key === 'parsing' ? '40%' : key === 'keywords' ? '25%' : key === 'formatting' ? '20%' : key === 'content' ? '10%' : '5%';
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300 capitalize">
                        {key} Analysis <span className="text-xs text-gray-500">({weight} weight)</span>
                      </span>
                      <span className={`text-sm font-bold ${getBreakdownColor(value)}`}>
                        {value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getBreakdownBg(value)}`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* ATS System Scores */}
      {isEnhanced && enhancedResult && (
        <div className="bg-gray-800 rounded-xl animate-fade-in-up animation-delay-200">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-xl"
            onClick={() => toggleSection('systems')}
          >
            <div className="flex items-center gap-3">
              <Gauge className="w-5 h-5 text-green-500" />
              <h4 className="text-lg font-semibold text-gray-100">ATS System Compatibility</h4>
            </div>
            {expandedSections.systems ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </div>
          
          {expandedSections.systems && (
            <div className="p-6 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(enhancedResult.advancedScore?.atsSystemScores || []).map(([system, score]) => (
                  <div key={system} className="bg-gray-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      {getSystemDisplayName(system as ATSSystemType)}
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                      {score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Competitor Analysis */}
      {isEnhanced && enhancedResult && (
        <div className="bg-gray-800 rounded-xl animate-fade-in-up animation-delay-300">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-xl"
            onClick={() => toggleSection('competitor')}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <h4 className="text-lg font-semibold text-gray-100">Industry Benchmark</h4>
            </div>
            {expandedSections.competitor ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </div>
          
          {expandedSections.competitor && (
            <div className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-400">Your Score</div>
                  <div className={`text-xl font-bold ${getScoreColor(score)}`}>{score}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Industry Average</div>
                  <div className="text-xl font-bold text-gray-300">
                    {enhancedResult.advancedScore?.competitorBenchmark?.industryAverage || enhancedResult.advancedScore?.competitorBenchmark?.averageIndustry || 0}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Top 10%</div>
                  <div className="text-xl font-bold text-green-400">
                    {enhancedResult.advancedScore?.competitorBenchmark?.topPercentile || enhancedResult.advancedScore?.competitorBenchmark?.percentileRank || 0}%
                  </div>
                </div>
              </div>
              
              {(enhancedResult.advancedScore?.competitorBenchmark?.gapAnalysis?.length || 0) > 0 && (
                <div className="bg-red-900/20 rounded-lg p-3">
                  <h5 className="text-sm font-medium text-red-400 mb-2">Missing Competitive Keywords</h5>
                  <div className="flex flex-wrap gap-2">
                    {(enhancedResult.advancedScore?.competitorBenchmark?.gapAnalysis || []).slice(0, 8).map((keyword: string, index: number) => (
                      <span key={index} className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Recommendations */}
      {(isEnhanced && enhancedResult?.advancedScore?.recommendations && enhancedResult.advancedScore.recommendations.length > 0) && (
        <div className="bg-gray-800 rounded-xl animate-fade-in-up animation-delay-400">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/50 rounded-t-xl"
            onClick={() => toggleSection('recommendations')}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-500" />
              <h4 className="text-lg font-semibold text-gray-100">
                Priority Recommendations ({enhancedResult?.advancedScore?.recommendations?.length || 0})
              </h4>
            </div>
            {expandedSections.recommendations ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </div>
          
          {expandedSections.recommendations && (
            <div className="p-6 pt-0 space-y-3">
              {enhancedResult?.advancedScore?.recommendations?.slice(0, 5).map((rec) => (
                <div key={rec.id} className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(rec.priority)}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                        Priority {rec.priority}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {rec.category}
                      </span>
                    </div>
                    <span className="text-xs text-green-400 font-medium">+{rec.estimatedScoreImprovement} pts</span>
                  </div>
                  <h5 className="font-medium text-gray-200 mb-1">{rec.title}</h5>
                  <p className="text-sm text-gray-400 mb-2">{rec.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>Section: {rec.section}</span>
                    <span>•</span>
                    <span>Impact: {rec.impact}</span>
                    <span>•</span>
                    <span>Action: {rec.actionRequired}</span>
                  </div>
                  {rec.atsSystemsAffected.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">Affects: </span>
                      {rec.atsSystemsAffected.map((system, i) => (
                        <span key={system} className="text-xs text-blue-400">
                          {getSystemDisplayName(system as ATSSystemType)}{i < rec.atsSystemsAffected.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(enhancedResult?.advancedScore?.recommendations?.length || 0) > 5 && (
                <p className="text-gray-400 text-sm text-center mt-2">
                  + {(enhancedResult?.advancedScore?.recommendations?.length || 0) - 5} more recommendations
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Legacy Issues Display */}
      {!isEnhanced && legacyData?.issues && legacyData.issues.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 animate-fade-in-up animation-delay-200">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Issues Found ({legacyData.issues.length})</h4>
          <div className="space-y-3">
            {legacyData.issues.slice(0, 5).map((issue, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <p className="text-gray-200 text-sm font-medium">{issue.message}</p>
                  {issue.section && (
                    <p className="text-gray-400 text-xs mt-1">Section: {issue.section}</p>
                  )}
                  {issue.fix && (
                    <p className="text-cyan-400 text-xs mt-2">
                      <strong>Fix:</strong> {issue.fix}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {legacyData.issues.length > 5 && (
              <p className="text-gray-400 text-sm text-center mt-2">
                + {legacyData.issues.length - 5} more issues
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legacy Top Suggestions */}
      {!isEnhanced && legacyData?.suggestions && legacyData.suggestions.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 animate-fade-in-up animation-delay-300">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            Top Suggestions
          </h4>
          <div className="space-y-3">
            {legacyData.suggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">{suggestion.section}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2">{suggestion.reason}</p>
                <div className="grid gap-2">
                  <div className="p-2 bg-red-900/20 rounded text-xs text-red-300">
                    <strong>Current:</strong> {suggestion.original.substring(0, 100)}...
                  </div>
                  <div className="p-2 bg-green-900/20 rounded text-xs text-green-300">
                    <strong>Suggested:</strong> {suggestion.suggested.substring(0, 100)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Keyword Analysis */}
      {isEnhanced && enhancedResult?.semanticAnalysis && (
        <div className="bg-gray-800 rounded-xl p-6 animate-fade-in-up animation-delay-500">
          <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-500" />
            Semantic Keyword Analysis
          </h4>
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Contextual Relevance</span>
                <span className={`text-sm font-bold ${getBreakdownColor(enhancedResult.semanticAnalysis.contextualRelevance * 100)}`}>
                  {Math.round(enhancedResult.semanticAnalysis.contextualRelevance * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getBreakdownBg(enhancedResult.semanticAnalysis.contextualRelevance * 100)}`}
                  style={{ width: `${enhancedResult.semanticAnalysis.contextualRelevance * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {enhancedResult.semanticAnalysis.primaryKeywords.length > 0 && (
                <div className="bg-green-900/20 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-green-400 mb-2">Primary Keywords</h5>
                  <div className="space-y-2">
                    {enhancedResult.semanticAnalysis.primaryKeywords.slice(0, 5).map((kw, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                          {kw.keyword}
                        </span>
                        <span className="text-xs text-gray-400">
                          {Math.round(kw.relevanceScore * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {enhancedResult.semanticAnalysis.industrySpecificTerms.length > 0 && (
                <div className="bg-purple-900/20 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-purple-400 mb-2">Industry Terms</h5>
                  <div className="flex flex-wrap gap-2">
                    {enhancedResult.semanticAnalysis.industrySpecificTerms.slice(0, 8).map((term, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Legacy Keywords Analysis */}
      {!isEnhanced && legacyData?.keywords && (
        <div className="bg-gray-800 rounded-xl p-6 animate-fade-in-up animation-delay-400">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Keyword Analysis</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {legacyData.keywords.found.length > 0 && (
              <div className="bg-green-900/20 rounded-lg p-4">
                <h5 className="text-sm font-medium text-green-400 mb-2">Found Keywords ✓</h5>
                <div className="flex flex-wrap gap-2">
                  {legacyData.keywords.found.slice(0, 5).map((keyword, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                      {keyword}
                    </span>
                  ))}
                  {legacyData.keywords.found.length > 5 && (
                    <span className="text-xs text-green-400">+{legacyData.keywords.found.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
            
            {legacyData.keywords.missing.length > 0 && (
              <div className="bg-red-900/20 rounded-lg p-4">
                <h5 className="text-sm font-medium text-red-400 mb-2">Missing Keywords ✗</h5>
                <div className="flex flex-wrap gap-2">
                  {legacyData.keywords.missing.slice(0, 5).map((keyword, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded">
                      {keyword}
                    </span>
                  ))}
                  {legacyData.keywords.missing.length > 5 && (
                    <span className="text-xs text-red-400">+{legacyData.keywords.missing.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
            
            {legacyData.keywords.recommended.length > 0 && (
              <div className="bg-blue-900/20 rounded-lg p-4">
                <h5 className="text-sm font-medium text-blue-400 mb-2">Recommended</h5>
                <div className="flex flex-wrap gap-2">
                  {legacyData.keywords.recommended.slice(0, 5).map((keyword, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      {keyword}
                    </span>
                  ))}
                  {legacyData.keywords.recommended.length > 5 && (
                    <span className="text-xs text-blue-400">+{legacyData.keywords.recommended.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="text-center animate-fade-in animation-delay-600">
        {isEnhanced && enhancedResult && props.onApplyRecommendations ? (
          <div className="space-y-3">
            <button 
              onClick={() => props.onApplyRecommendations!(enhancedResult.advancedScore.recommendations.map(r => r.id))}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all hover-glow flex items-center gap-3 mx-auto"
            >
              <Award className="w-5 h-5" />
              Apply AI Recommendations
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {enhancedResult.advancedScore.recommendations?.length || 0}
              </span>
            </button>
            <p className="text-xs text-gray-400">
              Potential improvement: +{enhancedResult.advancedScore.recommendations.reduce((sum: number, rec: string | { estimatedScoreImprovement?: number }) => sum + (typeof rec === 'object' ? rec.estimatedScoreImprovement || 5 : 5), 0)} points
            </p>
          </div>
        ) : (
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all hover-glow">
            Apply All Optimizations
          </button>
        )}
      </div>
    </div>
  );
};