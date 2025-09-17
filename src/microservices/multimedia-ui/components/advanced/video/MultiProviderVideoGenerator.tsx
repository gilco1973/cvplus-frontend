/**
 * Multi-Provider Video Generator Component
 * 
 * Advanced video generation interface that leverages multiple providers
 * (HeyGen, RunwayML, etc.) with intelligent provider selection, real-time
 * status monitoring, and comprehensive error recovery.
 * 
 * Features:
 * - Multi-provider video generation with automatic fallback
 * - Real-time processing status updates via WebSocket
 * - Provider performance monitoring and optimization
 * - Quality assessment and enhancement suggestions
 * - Cost optimization and provider balancing
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap,
  TrendingUp,
  DollarSign,
  Monitor
} from 'lucide-react';
import { 
  VideoGenerationOptions, 
  VideoGenerationResult, 
  VideoGenerationStatus,
  ProviderSelectionCriteria,
  ProviderSelectionResult 
} from '../../../types/video.types';

// Enhanced interfaces for multi-provider support
interface ProviderMetrics {
  providerId: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  successRate: number;
  cost: number;
  qualityScore: number;
  currentLoad: number;
  capabilities: string[];
}

interface VideoGenerationRequest {
  script: string;
  voiceSettings: {
    voice: string;
    speed: number;
    pitch: number;
  };
  visualSettings: {
    style: string;
    background: string;
    resolution: '720p' | '1080p' | '4k';
  };
  preferences: {
    preferredProvider?: string;
    maxCost?: number;
    urgency: 'low' | 'normal' | 'high';
    qualityLevel: 'basic' | 'standard' | 'premium';
  };
}

interface ProcessingStatus {
  id: string;
  status: VideoGenerationStatus;
  provider: string;
  progress: number;
  estimatedTimeRemaining: number;
  currentStage: string;
  qualityMetrics?: {
    videoQuality: number;
    audioQuality: number;
    lipSyncAccuracy: number;
  };
  cost: {
    estimated: number;
    actual?: number;
  };
}

interface MultiProviderVideoGeneratorProps {
  onVideoGenerated?: (result: VideoGenerationResult) => void;
  onStatusUpdate?: (status: ProcessingStatus) => void;
  initialOptions?: Partial<VideoGenerationRequest>;
  className?: string;
}

export const MultiProviderVideoGenerator: React.FC<MultiProviderVideoGeneratorProps> = ({
  onVideoGenerated,
  onStatusUpdate,
  initialOptions,
  className = ""
}) => {
  // State management
  const [providers, setProviders] = useState<ProviderMetrics[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('auto');
  const [generationRequest, setGenerationRequest] = useState<VideoGenerationRequest>({
    script: '',
    voiceSettings: {
      voice: 'default',
      speed: 1.0,
      pitch: 1.0
    },
    visualSettings: {
      style: 'professional',
      background: 'office',
      resolution: '1080p'
    },
    preferences: {
      urgency: 'normal',
      qualityLevel: 'standard'
    },
    ...initialOptions
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [providerRecommendation, setProviderRecommendation] = useState<ProviderSelectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // WebSocket for real-time updates
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection for real-time status updates
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = process.env.NODE_ENV === 'development' 
          ? 'ws://localhost:3000/ws/video-generation'
          : `wss://${window.location.host}/ws/video-generation`;
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('Video generation WebSocket connected');
          setError(null);
        };
        
        wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            setProcessingStatus(data.status);
            onStatusUpdate?.(data.status);
          } else if (data.type === 'generation_complete') {
            setIsGenerating(false);
            setProcessingStatus(null);
            onVideoGenerated?.(data.result);
          } else if (data.type === 'error') {
            setError(data.error);
            setIsGenerating(false);
          }
        };
        
        wsRef.current.onclose = () => {
          console.log('Video generation WebSocket disconnected');
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('Connection error. Retrying...');
        };
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
        setError('Failed to establish real-time connection');
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [onStatusUpdate, onVideoGenerated]);

  // Load provider metrics on component mount
  useEffect(() => {
    loadProviderMetrics();
    const interval = setInterval(loadProviderMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get provider recommendation when request changes
  useEffect(() => {
    if (generationRequest.script) {
      getProviderRecommendation();
    }
  }, [generationRequest]);

  const loadProviderMetrics = async () => {
    try {
      const response = await fetch('/api/video-generation/providers/metrics');
      if (response.ok) {
        const metrics = await response.json();
        setProviders(metrics);
      }
    } catch (err) {
      console.error('Failed to load provider metrics:', err);
    }
  };

  const getProviderRecommendation = async () => {
    try {
      const criteria: ProviderSelectionCriteria = {
        requirements: {
          duration: estimateVideoDuration(generationRequest.script),
          quality: generationRequest.preferences.qualityLevel,
          urgency: generationRequest.preferences.urgency
        },
        constraints: {
          maxCost: generationRequest.preferences.maxCost,
          preferredProvider: generationRequest.preferences.preferredProvider
        }
      };

      const response = await fetch('/api/video-generation/recommend-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(criteria)
      });

      if (response.ok) {
        const recommendation = await response.json();
        setProviderRecommendation(recommendation);
        if (selectedProvider === 'auto') {
          setSelectedProvider(recommendation.selectedProvider);
        }
      }
    } catch (err) {
      console.error('Failed to get provider recommendation:', err);
    }
  };

  const estimateVideoDuration = (script: string): number => {
    // Rough estimate: 150 words per minute speaking rate
    const wordCount = script.split(/\s+/).length;
    return Math.ceil((wordCount / 150) * 60);
  };

  const handleGenerateVideo = async () => {
    if (!generationRequest.script.trim()) {
      setError('Please enter a script for video generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProcessingStatus(null);

    try {
      const response = await fetch('/api/video-generation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...generationRequest,
          provider: selectedProvider === 'auto' ? undefined : selectedProvider,
          options: {
            useEnhancedProvider: true,
            enableRealTimeUpdates: true,
            enableFallback: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.jobId) {
        setProcessingStatus({
          id: result.jobId,
          status: 'processing' as VideoGenerationStatus,
          provider: result.provider,
          progress: 0,
          estimatedTimeRemaining: result.estimatedDuration || 120,
          currentStage: 'Initializing',
          cost: {
            estimated: result.estimatedCost || 0
          }
        });
      }
    } catch (err) {
      console.error('Video generation failed:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = async () => {
    if (processingStatus?.id) {
      try {
        await fetch(`/api/video-generation/cancel/${processingStatus.id}`, {
          method: 'POST'
        });
        setIsGenerating(false);
        setProcessingStatus(null);
      } catch (err) {
        console.error('Failed to cancel generation:', err);
      }
    }
  };

  const renderProviderSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Video Provider
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className={`p-4 border rounded-lg cursor-pointer ${
            selectedProvider === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}
          onClick={() => setSelectedProvider('auto')}
        >
          <div className="flex items-center mb-2">
            <Zap className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">Auto Select</span>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered provider selection for optimal results
          </p>
          {providerRecommendation && (
            <p className="text-xs text-green-600 mt-1">
              Recommended: {providerRecommendation.selectedProvider}
            </p>
          )}
        </div>
        
        {providers.map(provider => (
          <div
            key={provider.providerId}
            className={`p-4 border rounded-lg cursor-pointer ${
              selectedProvider === provider.providerId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedProvider(provider.providerId)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{provider.name}</span>
              <div className={`h-2 w-2 rounded-full ${
                provider.status === 'online' ? 'bg-green-500' : 
                provider.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span>{provider.responseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span>{provider.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <span>{provider.qualityScore}/10</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProcessingStatus = () => {
    if (!processingStatus) return null;

    return (
      <div className="mb-6 p-4 border rounded-lg bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Monitor className="h-5 w-5 text-blue-500 mr-2" />
            <span className="font-medium">Processing Video</span>
          </div>
          <button
            onClick={handleCancelGeneration}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Cancel
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress: {processingStatus.currentStage}</span>
              <span>{processingStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingStatus.progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Provider:</span>
              <p className="font-medium">{processingStatus.provider}</p>
            </div>
            <div>
              <span className="text-gray-600">Time Remaining:</span>
              <p className="font-medium">{Math.round(processingStatus.estimatedTimeRemaining / 60)}min</p>
            </div>
            <div>
              <span className="text-gray-600">Estimated Cost:</span>
              <p className="font-medium">${processingStatus.cost.estimated.toFixed(2)}</p>
            </div>
            {processingStatus.qualityMetrics && (
              <div>
                <span className="text-gray-600">Quality:</span>
                <p className="font-medium">{processingStatus.qualityMetrics.videoQuality}/10</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Video Generation Studio
        </h2>
        <p className="text-gray-600">
          Create professional videos using multiple AI providers with intelligent optimization
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {renderProviderSelector()}
      {renderProcessingStatus()}

      <div className="space-y-6">
        {/* Script Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Script
          </label>
          <textarea
            value={generationRequest.script}
            onChange={(e) => setGenerationRequest(prev => ({
              ...prev,
              script: e.target.value
            }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your video script here..."
            disabled={isGenerating}
          />
          <p className="text-sm text-gray-500 mt-1">
            Estimated duration: {estimateVideoDuration(generationRequest.script)} seconds
          </p>
        </div>

        {/* Voice Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={generationRequest.voiceSettings.voice}
              onChange={(e) => setGenerationRequest(prev => ({
                ...prev,
                voiceSettings: { ...prev.voiceSettings, voice: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="default">Default</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="authoritative">Authoritative</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speed
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={generationRequest.voiceSettings.speed}
              onChange={(e) => setGenerationRequest(prev => ({
                ...prev,
                voiceSettings: { ...prev.voiceSettings, speed: parseFloat(e.target.value) }
              }))}
              className="w-full"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              {generationRequest.voiceSettings.speed}x
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Level
            </label>
            <select
              value={generationRequest.preferences.qualityLevel}
              onChange={(e) => setGenerationRequest(prev => ({
                ...prev,
                preferences: { ...prev.preferences, qualityLevel: e.target.value as any }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isGenerating}
            >
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerateVideo}
            disabled={isGenerating || !generationRequest.script.trim()}
            className={`px-8 py-3 rounded-lg font-medium flex items-center ${
              isGenerating || !generationRequest.script.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiProviderVideoGenerator;