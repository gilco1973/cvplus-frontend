/**
 * Video Analytics Dashboard Component
 * Analytics dashboard for video generation performance
 */

import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Star, Zap, Award, Clock, DollarSign, Eye } from 'lucide-react';
import { VideoAnalyticsDashboardProps, VideoData } from './types';
import { FeatureWrapper } from '../../core/FeatureWrapper';
import { ErrorBoundary } from '../../core/ErrorBoundary';
import { useFeatureData } from '../../hooks/useFeatureData';

export const VideoAnalyticsDashboard: React.FC<VideoAnalyticsDashboardProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data: initialData,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  videoData: propVideoData,
  onClose,
  showProviderComparison = true,
  showTrends = true,
  showBenchmarks = true
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'trends'>('overview');

  const {
    data: analyticsData,
    loading,
    error,
    refresh
  } = useFeatureData<{ videoData: VideoData; analytics: any }>({
    jobId,
    featureName: 'video-analytics',
    initialData,
    params: { profileId }
  });

  const videoData = propVideoData || analyticsData?.videoData;

  const getProviderColor = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'heygen': return 'text-cyan-600 bg-cyan-100';
      case 'runwayml': return 'text-purple-600 bg-purple-100';
      case 'd-id': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  if (!isEnabled) {
    return null;
  }

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const renderOverview = () => {
    if (!videoData) return null;

    return (
      <div className="space-y-6">
        {/* Current Video Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Performance Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border text-center">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                getProviderColor(videoData.provider)
              }`}>
                {videoData.provider}
              </div>
              <div className="text-sm text-gray-500 mt-1">Provider</div>
            </div>
            <div className="bg-white rounded-lg p-4 border text-center">
              <div className={`text-2xl font-bold ${getScoreColor(videoData.qualityScore)}`}>
                {videoData.qualityScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Quality Score</div>
            </div>
            <div className="bg-white rounded-lg p-4 border text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(videoData.industryAlignment * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Industry Fit</div>
            </div>
            <div className="bg-white rounded-lg p-4 border text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(videoData.generationTime)}
              </div>
              <div className="text-sm text-gray-500 mt-1">Gen. Time</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Quality Analysis
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className={`font-medium ${getScoreColor(videoData.qualityScore)}`}>
                    {videoData.qualityScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`rounded-full h-2 transition-all duration-300 ${
                      videoData.qualityScore >= 9 ? 'bg-green-500' : 
                      videoData.qualityScore >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(videoData.qualityScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Performance Stats
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Generation Time:</span>
                  <span className="text-sm font-medium">{formatTime(videoData.generationTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-sm font-medium">{formatCost(videoData.cost)}</span>
                </div>
                {videoData.views && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Views:</span>
                    <span className="text-sm font-medium">{videoData.views.toLocaleString()}</span>
                  </div>
                )}
                {videoData.engagementRate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engagement:</span>
                    <span className="text-sm font-medium">{(videoData.engagementRate * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'providers':
        return (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Provider comparison coming soon...</p>
          </div>
        );
      case 'trends':
        return (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Trend analysis coming soon...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  // If used as a modal (with onClose)
  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Video Generation Analytics</h2>
                <p className="text-gray-600 text-sm">
                  Performance insights and optimization recommendations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-2">
              <TabButton id="overview" label="Overview" icon={BarChart3} />
              {showProviderComparison && <TabButton id="providers" label="Providers" icon={Zap} />}
              {showTrends && <TabButton id="trends" label="Trends" icon={TrendingUp} />}
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Regular component rendering
  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Video Analytics Dashboard"
        description="Performance insights for video generation"
        isLoading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-gray-200 pb-4">
            <TabButton id="overview" label="Overview" icon={BarChart3} />
            {showProviderComparison && <TabButton id="providers" label="Providers" icon={Zap} />}
            {showTrends && <TabButton id="trends" label="Trends" icon={TrendingUp} />}
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};