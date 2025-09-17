import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import {
  Award,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Download,
  Gauge,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
  Lightbulb,
  Users,
  Clock,
  Search,
  Filter
} from 'lucide-react';

import { CVFeatureProps, ATSData, ATSReport } from '../../../types/cv-features';
import { AdvancedATSScore, EnhancedATSResult, ATSSystemType } from '../../../types/ats';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { ErrorBoundary } from '../Common/ErrorBoundary';
import { useFeatureData } from '../../../hooks/useFeatureData';

// ATS Optimization Props Interface
export interface ATSOptimizationProps extends CVFeatureProps {
  data: {
    score: number;
    keywords: string[];
    suggestions: string[];
    compatibilityReport: ATSReport;
    enhancedResult?: EnhancedATSResult;
  };
  customization?: {
    showScore?: boolean;
    showKeywords?: boolean;
    showSuggestions?: boolean;
    interactive?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    compactMode?: boolean;
    showBenchmark?: boolean;
    enableExport?: boolean;
  };
}

// Component Implementation
export const ATSOptimization: React.FC<ATSOptimizationProps> = ({
  jobId,
  profileId,
  data: initialData,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private'
}) => {
  // State management
  const [selectedSystem, setSelectedSystem] = useState<ATSSystemType>('generic');
  const [expandedSections, setExpandedSections] = useState({
    scoreBreakdown: true,
    keywordAnalysis: false,
    suggestions: true,
    benchmark: false,
    history: false
  });
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Hooks
  const {
    data: atsData,
    loading,
    error,
    refresh
  } = useFeatureData<ATSData>({
    jobId,
    featureName: 'ats-optimization',
    initialData
  });

  // Derived state
  const currentData = atsData || initialData;
  const enhancedResult = currentData?.enhancedResult;
  const score = enhancedResult?.advancedScore?.overall || currentData?.score || 0;
  const keywords = currentData?.keywords || [];
  const suggestions = currentData?.suggestions || [];
  const compatibilityReport = currentData?.compatibilityReport;

  // Customization defaults
  const {
    showScore = true,
    showKeywords = true,
    showSuggestions = true,
    interactive = true,
    theme = 'auto',
    compactMode = false,
    showBenchmark = true,
    enableExport = true
  } = customization;

  // Helper functions
  const getScoreColor = useCallback((score: number): string => {
    if (score >= 80) return '#10b981'; // green-500
    if (score >= 60) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  }, []);

  const getScoreGradient = useCallback((score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  }, []);

  const getPriorityColor = useCallback((priority: number): string => {
    if (priority <= 2) return 'bg-red-100 text-red-700 border-red-300';
    if (priority <= 3) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  }, []);

  const getSystemDisplayName = useCallback((system: ATSSystemType): string => {
    const names = {
      workday: 'Workday',
      greenhouse: 'Greenhouse',
      lever: 'Lever',
      bamboohr: 'BambooHR',
      taleo: 'Oracle Taleo',
      generic: 'Generic ATS'
    };
    return names[system] || system;
  }, []);

  // Filtered and sorted suggestions
  const filteredSuggestions = useMemo(() => {
    let filtered = enhancedResult?.advancedScore?.recommendations || [];
    
    if (filterPriority) {
      filtered = filtered.filter(rec => rec.priority === filterPriority);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(rec => 
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.priority - b.priority);
  }, [enhancedResult, filterPriority, searchTerm]);

  // Chart data preparation
  const radarData = useMemo(() => {
    if (!enhancedResult?.advancedScore?.breakdown) return [];
    
    const breakdown = enhancedResult.advancedScore.breakdown;
    return [
      { subject: 'Parsing', value: breakdown.parsing, fullMark: 100 },
      { subject: 'Keywords', value: breakdown.keywords, fullMark: 100 },
      { subject: 'Formatting', value: breakdown.formatting, fullMark: 100 },
      { subject: 'Content', value: breakdown.content, fullMark: 100 },
      { subject: 'Specificity', value: breakdown.specificity, fullMark: 100 }
    ];
  }, [enhancedResult]);

  const systemScoresData = useMemo(() => {
    if (!enhancedResult?.advancedScore?.atsSystemScores) return [];
    
    return Object.entries(enhancedResult.advancedScore.atsSystemScores).map(([system, score]) => ({
      system: getSystemDisplayName(system as ATSSystemType),
      score,
      color: getScoreColor(score)
    }));
  }, [enhancedResult, getSystemDisplayName, getScoreColor]);

  // Event handlers
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const exportData = {
        score,
        breakdown: enhancedResult?.advancedScore?.breakdown,
        recommendations: filteredSuggestions,
        systemScores: enhancedResult?.advancedScore?.atsSystemScores,
        keywords: currentData?.keywords,
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ats-optimization-report-${jobId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      onError?.(new Error('Failed to export ATS report'));
    }
  }, [score, enhancedResult, filteredSuggestions, currentData, jobId, onError]);

  const handleApplyRecommendation = useCallback(async (recommendationId: string) => {
    try {
      // Implementation would call Firebase function to apply recommendation
      console.log('Applying recommendation:', recommendationId);
      onUpdate?.({ appliedRecommendation: recommendationId });
    } catch (err) {
      onError?.(new Error('Failed to apply recommendation'));
    }
  }, [onUpdate, onError]);

  // Error handling
  if (error) {
    return (
      <FeatureWrapper
        title="ATS Optimization"
        description="AI-powered ATS compatibility analysis and optimization"
        error={error}
        onRetry={refresh}
        mode={mode}
        className={className}
      >
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load ATS optimization data</p>
        </div>
      </FeatureWrapper>
    );
  }

  // Loading state
  if (loading && !currentData) {
    return (
      <FeatureWrapper
        title="ATS Optimization"
        description="AI-powered ATS compatibility analysis and optimization"
        isLoading={true}
        mode={mode}
        className={className}
      >
        <LoadingSpinner size="large" message="Analyzing ATS compatibility..." />
      </FeatureWrapper>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        title="ATS Optimization"
        description="AI-powered ATS compatibility analysis and optimization"
        mode={mode}
        className={className}
      >
        <div className="space-y-6">
          {/* Main Score Display */}
          {showScore && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 text-center border border-gray-200 shadow-sm">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto mb-6">
                  <CircularProgressbar
                    value={score}
                    text={`${score}%`}
                    styles={buildStyles({
                      textColor: getScoreColor(score),
                      pathColor: getScoreColor(score),
                      trailColor: '#e5e7eb',
                      textSize: '16px',
                      pathTransitionDuration: 1.5
                    })}
                  />
                </div>
                {enhancedResult && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>AI</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ATS Compatibility Score
              </h3>
              
              <p className={`text-lg font-medium ${
                score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {score >= 80 ? '✓ Excellent ATS Compatibility' : 
                 score >= 60 ? '⚠ Good with Improvements Needed' : 
                 '✗ Needs Significant Optimization'}
              </p>
              
              {enhancedResult?.advancedScore?.confidence && (
                <p className="text-sm text-gray-500 mt-2">
                  Analysis Confidence: {Math.round(enhancedResult.advancedScore.confidence * 100)}%
                </p>
              )}
              
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showAdvanced ? 'Hide' : 'Show'} Details
                </button>
                
                {enableExport && (
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Advanced Analytics */}
          {showAdvanced && enhancedResult && (
            <div className="space-y-6">
              {/* Score Breakdown Radar Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div 
                  className="flex items-center justify-between cursor-pointer mb-4"
                  onClick={() => toggleSection('scoreBreakdown')}
                >
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-500" />
                    Score Breakdown
                  </h4>
                  {expandedSections.scoreBreakdown ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
                
                {expandedSections.scoreBreakdown && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} />
                          <Radar
                            name="Score"
                            dataKey="value"
                            stroke={getScoreColor(score)}
                            fill={getScoreColor(score)}
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-3">
                      {Object.entries(enhancedResult.advancedScore.breakdown).map(([key, value]) => {
                        const weights = {
                          parsing: '40%',
                          keywords: '25%',
                          formatting: '20%',
                          content: '10%',
                          specificity: '5%'
                        };
                        
                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key} <span className="text-xs text-gray-500">({weights[key as keyof typeof weights]} weight)</span>
                              </span>
                              <span className={`text-sm font-bold ${
                                value >= 80 ? 'text-green-600' : value >= 60 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {value}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-1000 ${
                                  value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ATS System Compatibility */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-500" />
                  ATS System Compatibility
                </h4>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={systemScoresData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="system" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Compatibility']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Bar 
                        dataKey="score" 
                        fill={(entry: any) => entry.color}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Industry Benchmark */}
              {showBenchmark && enhancedResult?.advancedScore?.competitorBenchmark && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div 
                    className="flex items-center justify-between cursor-pointer mb-4"
                    onClick={() => toggleSection('benchmark')}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-500" />
                      Industry Benchmark
                    </h4>
                    {expandedSections.benchmark ? 
                      <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    }
                  </div>
                  
                  {expandedSections.benchmark && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">{score}%</div>
                          <div className="text-sm text-blue-700">Your Score</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-gray-600">
                            {enhancedResult.advancedScore.competitorBenchmark.industryAverage}%
                          </div>
                          <div className="text-sm text-gray-700">Industry Average</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {enhancedResult.advancedScore.competitorBenchmark.topPercentile}%
                          </div>
                          <div className="text-sm text-green-700">Top 10%</div>
                        </div>
                      </div>
                      
                      {enhancedResult.advancedScore.competitorBenchmark.gapAnalysis?.missingKeywords && (
                        <div className="bg-red-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-red-700 mb-3">Missing Competitive Keywords</h5>
                          <div className="flex flex-wrap gap-2">
                            {enhancedResult.advancedScore.competitorBenchmark.gapAnalysis.missingKeywords.slice(0, 8).map((keyword, index) => (
                              <span key={index} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
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
            </div>
          )}

          {/* Keywords Analysis */}
          {showKeywords && keywords.length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection('keywordAnalysis')}
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-500" />
                  Keyword Analysis ({keywords.length})
                </h4>
                {expandedSections.keywordAnalysis ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.keywordAnalysis && (
                <div className="space-y-4">
                  {enhancedResult?.semanticAnalysis ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-green-700 mb-3">Primary Keywords</h5>
                        <div className="space-y-2">
                          {enhancedResult.semanticAnalysis.primaryKeywords.slice(0, 5).map((kw, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-800">{kw.keyword}</span>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                {Math.round(kw.relevanceScore * 100)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-purple-700 mb-3">Industry Terms</h5>
                        <div className="flex flex-wrap gap-2">
                          {enhancedResult.semanticAnalysis.industrySpecificTerms.slice(0, 8).map((term, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <span key={index} className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recommendations */}
          {showSuggestions && (filteredSuggestions.length > 0 || suggestions.length > 0) && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection('suggestions')}
              >
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Optimization Recommendations ({filteredSuggestions.length || suggestions.length})
                </h4>
                {expandedSections.suggestions ? 
                  <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                }
              </div>
              
              {expandedSections.suggestions && (
                <div className="space-y-4">
                  {interactive && filteredSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search recommendations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                          value={filterPriority || ''}
                          onChange={(e) => setFilterPriority(e.target.value ? Number(e.target.value) : null)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">All Priorities</option>
                          <option value="1">High Priority</option>
                          <option value="2">Medium-High Priority</option>
                          <option value="3">Medium Priority</option>
                          <option value="4">Medium-Low Priority</option>
                          <option value="5">Low Priority</option>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.slice(0, 5).map((rec) => (
                        <div key={rec.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded-full border ${
                                rec.priority <= 2 ? 'bg-red-100 text-red-700 border-red-300' :
                                rec.priority <= 3 ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                'bg-blue-100 text-blue-700 border-blue-300'
                              }`}>
                                Priority {rec.priority}
                              </span>
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {rec.category}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-green-600">
                              +{rec.estimatedScoreImprovement} pts
                            </span>
                          </div>
                          
                          <h5 className="font-medium text-gray-900 mb-2">{rec.title}</h5>
                          <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>Section: {rec.section}</span>
                              <span>•</span>
                              <span>Impact: {rec.impact}</span>
                              <span>•</span>
                              <span>Action: {rec.actionRequired}</span>
                            </div>
                            
                            {interactive && (
                              <button
                                onClick={() => handleApplyRecommendation(rec.id)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to legacy suggestions
                      suggestions.slice(0, 5).map((suggestion, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {(filteredSuggestions.length > 5 || suggestions.length > 5) && (
                    <p className="text-gray-500 text-sm text-center">
                      + {(filteredSuggestions.length || suggestions.length) - 5} more recommendations
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-3">
            {enhancedResult && interactive && (
              <div className="space-y-3">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center gap-3 mx-auto">
                  <Award className="w-5 h-5" />
                  Apply All Recommendations
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                    {filteredSuggestions.length}
                  </span>
                </button>
                
                <p className="text-xs text-gray-500">
                  Potential improvement: +{filteredSuggestions.reduce((sum, rec) => sum + rec.estimatedScoreImprovement, 0)} points
                </p>
              </div>
            )}
            
            <button
              onClick={refresh}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <TrendingUp className="w-4 h-4" />
              Refresh Analysis
            </button>
          </div>
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};

export default ATSOptimization;