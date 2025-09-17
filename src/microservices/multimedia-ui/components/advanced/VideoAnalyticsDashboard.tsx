import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Clock, DollarSign, Star, Shield, Zap, Award, Users, Eye, Share2 } from 'lucide-react';

interface VideoData {
  provider: string;
  qualityScore: number;
  industryAlignment: number;
  generationTime: number;
  cost: number;
  views?: number;
  shares?: number;
  engagementRate?: number;
}

interface VideoAnalyticsDashboardProps {
  videoData: VideoData;
  onClose: () => void;
}

const performanceData = {
  providers: [
    {
      name: 'HeyGen',
      successRate: 98.5,
      avgGenerationTime: 65,
      avgQualityScore: 9.2,
      reliability: 96,
      usage: 45
    },
    {
      name: 'RunwayML',
      successRate: 94.2,
      avgGenerationTime: 48,
      avgQualityScore: 8.9,
      reliability: 92,
      usage: 30
    },
    {
      name: 'D-ID',
      successRate: 91.8,
      avgGenerationTime: 78,
      avgQualityScore: 8.3,
      reliability: 88,
      usage: 25
    }
  ],
  trends: {
    qualityImprovement: 12.5,
    costReduction: 18.3,
    speedImprovement: 22.1,
    reliabilityImprovement: 8.7
  },
  industryBenchmarks: {
    technology: { avgQuality: 8.9, avgEngagement: 73 },
    marketing: { avgQuality: 8.7, avgEngagement: 81 },
    finance: { avgQuality: 9.1, avgEngagement: 68 },
    consulting: { avgQuality: 9.3, avgEngagement: 76 },
    healthcare: { avgQuality: 9.0, avgEngagement: 71 }
  }
};

export const VideoAnalyticsDashboard: React.FC<VideoAnalyticsDashboardProps> = ({
  videoData,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'trends' | 'benchmarks'>('overview');

  const getProviderColor = (providerName: string) => {
    switch (providerName.toLowerCase()) {
      case 'heygen': return 'text-cyan-400 bg-cyan-900/20';
      case 'runwayml': return 'text-purple-400 bg-purple-900/20';
      case 'did': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-400';
    if (score >= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  const TabButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        activeTab === id
          ? 'bg-cyan-600 text-white'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">Video Generation Analytics</h2>
              <p className="text-gray-400 text-sm">
                Performance insights and optimization recommendations
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

        {/* Navigation Tabs */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex gap-2">
            <TabButton id="overview" label="Overview" icon={BarChart3} />
            <TabButton id="providers" label="Providers" icon={Zap} />
            <TabButton id="trends" label="Trends" icon={TrendingUp} />
            <TabButton id="benchmarks" label="Benchmarks" icon={Award} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Video Stats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Current Video Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${getProviderColor(videoData.provider).split(' ')[0]}`}>
                      {videoData.provider}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Provider</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(videoData.qualityScore)}`}>
                      {videoData.qualityScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Quality Score</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {(videoData.industryAlignment * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Industry Fit</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {formatTime(videoData.generationTime)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Gen. Time</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Performance Metrics</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      Quality Analysis
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Script Quality</span>
                        <span className={`font-medium ${getScoreColor(videoData.qualityScore)}`}>
                          {videoData.qualityScore.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
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
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-200 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      Reliability Metrics
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Success Rate</span>
                        <span className="font-medium text-green-400">98.5%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Avg. Generation Time</span>
                        <span className="font-medium text-blue-400">{formatTime(videoData.generationTime)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Cost Efficiency</span>
                        <span className="font-medium text-cyan-400">{formatCost(videoData.cost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Simulation */}
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-4">Projected Engagement</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4 text-center">
                    <Eye className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-400">2.3K</div>
                    <div className="text-sm text-gray-400">Est. Views</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 border border-green-700/30 rounded-lg p-4 text-center">
                    <Share2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-400">186</div>
                    <div className="text-sm text-gray-400">Est. Shares</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-700/30 rounded-lg p-4 text-center">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-400">73%</div>
                    <div className="text-sm text-gray-400">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-100">Provider Performance Comparison</h3>
              
              <div className="grid gap-4">
                {performanceData.providers.map((provider, index) => (
                  <div key={index} className="bg-gray-900/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-200">{provider.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${getProviderColor(provider.name)}`}>
                          {provider.usage}% usage
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">{provider.successRate}%</div>
                        <div className="text-xs text-gray-400">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{provider.avgGenerationTime}s</div>
                        <div className="text-xs text-gray-400">Avg. Time</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-xl font-bold ${getScoreColor(provider.avgQualityScore)}`}>
                          {provider.avgQualityScore}
                        </div>
                        <div className="text-xs text-gray-400">Avg. Quality</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{provider.reliability}%</div>
                        <div className="text-xs text-gray-400">Reliability</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-100">Performance Trends (30 Days)</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    Quality Improvements
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(performanceData.trends).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className={`font-medium ${getTrendColor(value)}`}>
                          +{value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-200 mb-4">Key Achievements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-sm text-gray-300">22% faster generation times</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className="text-sm text-gray-300">18% cost reduction achieved</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className="text-sm text-gray-300">12% quality score improvement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span className="text-sm text-gray-300">99.5% uptime maintained</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benchmarks Tab */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-100">Industry Benchmarks</h3>
              
              <div className="grid gap-4">
                {Object.entries(performanceData.industryBenchmarks).map(([industry, data]) => (
                  <div key={industry} className="bg-gray-900/50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-200 capitalize">{industry}</h4>
                      {videoData.provider === 'technology' && industry === 'technology' && (
                        <span className="text-xs px-2 py-1 bg-cyan-600 text-white rounded-full">
                          Your Industry
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Avg. Quality Score</span>
                          <span className={`font-medium ${getScoreColor(data.avgQuality)}`}>
                            {data.avgQuality}/10
                          </span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className={`rounded-full h-2 ${
                              data.avgQuality >= 9 ? 'bg-green-500' : 
                              data.avgQuality >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(data.avgQuality / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Avg. Engagement</span>
                          <span className="font-medium text-purple-400">{data.avgEngagement}%</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 rounded-full h-2"
                            style={{ width: `${data.avgEngagement}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleString()}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyticsDashboard;