/**
 * Video Quality Optimizer Component
 * 
 * AI-powered video quality optimization interface that provides automatic
 * quality assessment, enhancement suggestions, and real-time optimization
 * controls for professional video generation.
 * 
 * Features:
 * - Automatic quality assessment and scoring
 * - Real-time quality enhancement suggestions
 * - Advanced optimization controls and presets
 * - Before/after quality comparisons
 * - Custom quality profiles and preferences
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  Eye,
  Layers,
  Maximize2,
  Play,
  RefreshCw,
  Settings,
  Sliders,
  Star,
  Target,
  TrendingUp,
  Video,
  Volume2,
  Wand2,
  Zap
} from 'lucide-react';

// Quality assessment interfaces
interface QualityMetrics {
  overall: number;
  video: {
    resolution: number;
    clarity: number;
    stability: number;
    colorAccuracy: number;
    compression: number;
  };
  audio: {
    clarity: number;
    volume: number;
    noise: number;
    synchronization: number;
  };
  content: {
    lipSync: number;
    naturalness: number;
    engagement: number;
    professionalism: number;
  };
}

interface OptimizationSuggestion {
  id: string;
  category: 'video' | 'audio' | 'content' | 'technical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: number; // Expected quality improvement (0-10)
  effort: 'easy' | 'medium' | 'complex';
  estimatedTime: number; // in seconds
  cost: number; // additional cost if any
  implementation: {
    automatic: boolean;
    manual: boolean;
    requiresProvider: boolean;
  };
}

interface QualityProfile {
  id: string;
  name: string;
  description: string;
  settings: {
    resolution: '720p' | '1080p' | '4k';
    bitrate: number;
    frameRate: number;
    codecPreset: 'fast' | 'medium' | 'slow' | 'veryslow';
    audioQuality: 'standard' | 'high' | 'premium';
    enhancementLevel: 'basic' | 'advanced' | 'maximum';
  };
  targetMetrics: {
    minVideoQuality: number;
    minAudioQuality: number;
    minOverallScore: number;
  };
}

interface VideoQualityOptimizerProps {
  videoId?: string;
  videoUrl?: string;
  initialMetrics?: QualityMetrics;
  onOptimizationApply?: (settings: any) => void;
  onQualityUpdate?: (metrics: QualityMetrics) => void;
  showPreview?: boolean;
  allowRealTimeOptimization?: boolean;
  className?: string;
}

export const VideoQualityOptimizer: React.FC<VideoQualityOptimizerProps> = ({
  videoId,
  videoUrl,
  initialMetrics,
  onOptimizationApply,
  onQualityUpdate,
  showPreview = true,
  allowRealTimeOptimization = false,
  className = ""
}) => {
  // State management
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(initialMetrics || null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [qualityProfiles, setQualityProfiles] = useState<QualityProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('balanced');
  const [customSettings, setCustomSettings] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState<'original' | 'optimized'>('original');
  const [error, setError] = useState<string | null>(null);

  // Refs for video elements
  const originalVideoRef = useRef<HTMLVideoElement>(null);
  const optimizedVideoRef = useRef<HTMLVideoElement>(null);

  // Load initial data
  useEffect(() => {
    loadQualityProfiles();
    if (videoId || videoUrl) {
      analyzeVideoQuality();
    }
  }, [videoId, videoUrl]);

  const loadQualityProfiles = async () => {
    try {
      const response = await fetch('/api/video-quality/profiles');
      if (response.ok) {
        const profiles = await response.json();
        setQualityProfiles(profiles);
      }
    } catch (err) {
      console.error('Failed to load quality profiles:', err);
    }
  };

  const analyzeVideoQuality = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/video-quality/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          videoUrl,
          analysisLevel: 'comprehensive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQualityMetrics(data.metrics);
        setSuggestions(data.suggestions);
        onQualityUpdate?.(data.metrics);
      } else {
        throw new Error('Quality analysis failed');
      }
    } catch (err) {
      console.error('Quality analysis failed:', err);
      setError('Failed to analyze video quality');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async (suggestionIds: string[] = []) => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    setError(null);

    try {
      const selectedSuggestions = suggestionIds.length > 0 
        ? suggestions.filter(s => suggestionIds.includes(s.id))
        : suggestions.filter(s => s.priority === 'high' || s.priority === 'critical');

      const response = await fetch('/api/video-quality/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          videoUrl,
          profile: selectedProfile,
          customSettings,
          suggestions: selectedSuggestions.map(s => s.id),
          realTime: allowRealTimeOptimization
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.jobId) {
          // Monitor optimization progress
          monitorOptimizationProgress(data.jobId);
        } else {
          // Immediate optimization result
          setQualityMetrics(data.metrics);
          onOptimizationApply?.(data.settings);
          setIsOptimizing(false);
        }
      } else {
        throw new Error('Optimization failed');
      }
    } catch (err) {
      console.error('Optimization failed:', err);
      setError('Failed to optimize video');
      setIsOptimizing(false);
    }
  };

  const monitorOptimizationProgress = async (jobId: string) => {
    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/video-quality/optimization-status/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setOptimizationProgress(data.progress);

          if (data.status === 'completed') {
            setQualityMetrics(data.metrics);
            onOptimizationApply?.(data.settings);
            setIsOptimizing(false);
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

  const getQualityScore = (score: number) => {
    if (score >= 9) return { color: 'text-green-600', label: 'Excellent' };
    if (score >= 7) return { color: 'text-blue-600', label: 'Good' };
    if (score >= 5) return { color: 'text-yellow-600', label: 'Fair' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderQualityMetrics = () => {
    if (!qualityMetrics) return null;

    return (
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Assessment</h3>
        
        {/* Overall Score */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Quality Score</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className={`font-semibold ${getQualityScore(qualityMetrics.overall).color}`}>
                {qualityMetrics.overall.toFixed(1)}/10
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                qualityMetrics.overall >= 7 ? 'bg-green-500' :
                qualityMetrics.overall >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${qualityMetrics.overall * 10}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className={`text-sm font-medium ${getQualityScore(qualityMetrics.overall).color}`}>
              {getQualityScore(qualityMetrics.overall).label}
            </span>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video Quality */}
          <div>
            <div className="flex items-center mb-3">
              <Video className="h-4 w-4 text-blue-500 mr-2" />
              <span className="font-medium text-gray-900">Video Quality</span>
            </div>
            <div className="space-y-2">
              {Object.entries(qualityMetrics.video).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{key}:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          value >= 7 ? 'bg-green-500' :
                          value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Quality */}
          <div>
            <div className="flex items-center mb-3">
              <Volume2 className="h-4 w-4 text-purple-500 mr-2" />
              <span className="font-medium text-gray-900">Audio Quality</span>
            </div>
            <div className="space-y-2">
              {Object.entries(qualityMetrics.audio).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{key}:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          value >= 7 ? 'bg-green-500' :
                          value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Quality */}
          <div>
            <div className="flex items-center mb-3">
              <Target className="h-4 w-4 text-green-500 mr-2" />
              <span className="font-medium text-gray-900">Content Quality</span>
            </div>
            <div className="space-y-2">
              {Object.entries(qualityMetrics.content).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          value >= 7 ? 'bg-green-500' :
                          value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${value * 10}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOptimizationSuggestions = () => {
    if (!suggestions.length) return null;

    return (
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Optimization Suggestions</h3>
          <button
            onClick={() => applyOptimization()}
            disabled={isOptimizing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Apply All High Priority
              </>
            )}
          </button>
        </div>

        {isOptimizing && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm text-blue-800 mb-2">
              <span>Optimization Progress</span>
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

        <div className="space-y-4">
          {suggestions.map(suggestion => (
            <div key={suggestion.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-900 mr-2">{suggestion.title}</span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(suggestion.priority)}`}>
                      {suggestion.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{suggestion.description}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-green-600">
                    +{suggestion.impact.toFixed(1)} quality
                  </div>
                  <div className="text-xs text-gray-500">
                    {suggestion.estimatedTime}s
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500">
                    Effort: <span className="font-medium capitalize">{suggestion.effort}</span>
                  </span>
                  {suggestion.cost > 0 && (
                    <span className="text-xs text-gray-500">
                      Cost: <span className="font-medium">${suggestion.cost.toFixed(2)}</span>
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {suggestion.implementation.automatic && (
                    <button
                      onClick={() => applyOptimization([suggestion.id])}
                      disabled={isOptimizing}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      Auto Apply
                    </button>
                  )}
                  <button
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderQualityProfiles = () => (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Profiles</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qualityProfiles.map(profile => (
          <div
            key={profile.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedProfile === profile.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
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
                <span className="text-gray-600">Resolution:</span>
                <span className="font-medium">{profile.settings.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quality:</span>
                <span className="font-medium">{profile.settings.enhancementLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Score:</span>
                <span className="font-medium">{profile.targetMetrics.minOverallScore}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVideoPreview = () => {
    if (!showPreview || (!videoUrl && !videoId)) return null;

    return (
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode('original')}
              className={`px-3 py-1 text-sm rounded ${
                previewMode === 'original' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setPreviewMode('optimized')}
              className={`px-3 py-1 text-sm rounded ${
                previewMode === 'optimized' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Optimized
            </button>
          </div>
        </div>

        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {previewMode === 'original' ? (
            <video
              ref={originalVideoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          ) : (
            <video
              ref={optimizedVideoRef}
              src={videoUrl} // This would be the optimized URL
              controls
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Video Quality Optimizer
        </h2>
        <p className="text-gray-600">
          AI-powered quality analysis and optimization for professional video generation
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

      {/* Analyze Button */}
      {!qualityMetrics && (videoId || videoUrl) && (
        <div className="mb-6 text-center">
          <button
            onClick={analyzeVideoQuality}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Quality...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Video Quality
              </>
            )}
          </button>
        </div>
      )}

      {renderVideoPreview()}
      {renderQualityMetrics()}
      {renderOptimizationSuggestions()}
      {renderQualityProfiles()}
    </div>
  );
};

export default VideoQualityOptimizer;