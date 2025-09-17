/**
 * Provider Selection Panel Component
 * 
 * Advanced provider selection interface with detailed provider comparison,
 * cost optimization, performance analysis, and intelligent recommendations
 * based on user requirements and historical performance data.
 * 
 * Features:
 * - Detailed provider comparison and analysis
 * - Cost optimization and budget management
 * - Performance metrics and success rates
 * - Intelligent provider recommendations
 * - Custom selection criteria and preferences
 * 
 * @author Gil Klainert
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Info,
  LineChart,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

// Enhanced provider interfaces
interface ProviderDetails {
  providerId: string;
  name: string;
  description: string;
  logo?: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  tier: 'basic' | 'professional' | 'enterprise';
  
  // Capabilities
  capabilities: {
    videoGeneration: boolean;
    audioGeneration: boolean;
    imageProcessing: boolean;
    liveStreaming: boolean;
    customVoices: boolean;
    multiLanguage: boolean;
    highResolution: boolean;
    advancedEffects: boolean;
  };
  
  // Specifications
  specifications: {
    maxDuration: number; // in seconds
    resolutions: string[];
    formats: string[];
    languages: string[];
    voiceStyles: string[];
    customizationLevel: 'low' | 'medium' | 'high';
  };
  
  // Performance metrics
  performance: {
    avgProcessingTime: number;
    successRate: number;
    uptime: number;
    reliability: number;
    responseTime: number;
    throughput: number;
    qualityScore: number;
    customerSatisfaction: number;
  };
  
  // Pricing
  pricing: {
    model: 'per-minute' | 'per-job' | 'subscription' | 'credits';
    baseCost: number;
    premiumCost?: number;
    setup_fee?: number;
    monthly_minimum?: number;
    volume_discounts: Array<{
      threshold: number;
      discount: number;
    }>;
  };
  
  // Additional info
  features: string[];
  limitations: string[];
  estimatedCost: number;
  recommendationScore: number;
  lastUpdated: Date;
}

interface SelectionCriteria {
  budget: {
    max: number;
    preferred: number;
  };
  quality: {
    minimum: number;
    preferred: number;
  };
  speed: {
    maxAcceptableTime: number;
    preferredTime: number;
  };
  reliability: {
    minUptime: number;
    minSuccessRate: number;
  };
  features: string[];
  languages: string[];
  priorities: Array<{
    factor: 'cost' | 'quality' | 'speed' | 'reliability';
    weight: number;
  }>;
}

interface ProviderSelectionPanelProps {
  selectedProvider?: string;
  onProviderSelect: (providerId: string, reasoning?: string) => void;
  requirements?: {
    duration: number;
    quality: 'basic' | 'standard' | 'premium';
    urgency: 'low' | 'normal' | 'high';
    language?: string;
    features?: string[];
  };
  showComparison?: boolean;
  showRecommendations?: boolean;
  className?: string;
}

export const ProviderSelectionPanel: React.FC<ProviderSelectionPanelProps> = ({
  selectedProvider,
  onProviderSelect,
  requirements,
  showComparison = true,
  showRecommendations = true,
  className = ""
}) => {
  // State management
  const [providers, setProviders] = useState<ProviderDetails[]>([]);
  const [selectionCriteria, setSelectionCriteria] = useState<SelectionCriteria>({
    budget: { max: 100, preferred: 50 },
    quality: { minimum: 7, preferred: 8.5 },
    speed: { maxAcceptableTime: 600, preferredTime: 300 },
    reliability: { minUptime: 99, minSuccessRate: 95 },
    features: [],
    languages: ['en'],
    priorities: [
      { factor: 'quality', weight: 0.3 },
      { factor: 'cost', weight: 0.25 },
      { factor: 'speed', weight: 0.25 },
      { factor: 'reliability', weight: 0.2 }
    ]
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [comparisonView, setComparisonView] = useState<'grid' | 'table' | 'detailed'>('grid');
  const [sortBy, setSortBy] = useState<'recommendation' | 'cost' | 'quality' | 'speed'>('recommendation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load providers data
  useEffect(() => {
    loadProviders();
  }, [requirements]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/providers/detailed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, criteria: selectionCriteria })
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
        setError(null);
      } else {
        throw new Error('Failed to load providers');
      }
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError('Failed to load provider data');
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter providers
  const sortedProviders = useMemo(() => {
    let filtered = [...providers];

    // Apply filters based on criteria
    filtered = filtered.filter(provider => {
      if (provider.pricing.baseCost > selectionCriteria.budget.max) return false;
      if (provider.performance.qualityScore < selectionCriteria.quality.minimum) return false;
      if (provider.performance.avgProcessingTime > selectionCriteria.speed.maxAcceptableTime) return false;
      if (provider.performance.uptime < selectionCriteria.reliability.minUptime) return false;
      if (provider.performance.successRate < selectionCriteria.reliability.minSuccessRate) return false;
      return true;
    });

    // Sort providers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return a.estimatedCost - b.estimatedCost;
        case 'quality':
          return b.performance.qualityScore - a.performance.qualityScore;
        case 'speed':
          return a.performance.avgProcessingTime - b.performance.avgProcessingTime;
        case 'recommendation':
        default:
          return b.recommendationScore - a.recommendationScore;
      }
    });

    return filtered;
  }, [providers, selectionCriteria, sortBy]);

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getProviderStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'degraded': return 'Degraded Performance';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Under Maintenance';
      default: return 'Unknown';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProviderCard = (provider: ProviderDetails) => (
    <div
      key={provider.providerId}
      className={`p-6 border rounded-xl transition-all duration-200 cursor-pointer ${
        selectedProvider === provider.providerId
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
      }`}
      onClick={() => onProviderSelect(provider.providerId, `Selected for ${provider.recommendationScore.toFixed(1)}/10 match score`)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {provider.logo ? (
            <img src={provider.logo} alt={provider.name} className="h-8 w-8 rounded mr-3" />
          ) : (
            <div className="h-8 w-8 bg-gray-200 rounded mr-3 flex items-center justify-center">
              <Zap className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
            <div className="flex items-center mt-1">
              <div className={`h-2 w-2 rounded-full ${getProviderStatusColor(provider.status)} mr-2`} />
              <span className="text-xs text-gray-500">{getProviderStatusText(provider.status)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded ${getTierColor(provider.tier)}`}>
            {provider.tier.toUpperCase()}
          </span>
          {provider.recommendationScore >= 8 && (
            <Award className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Recommendation Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Match Score</span>
          <span className="font-medium">{provider.recommendationScore.toFixed(1)}/10</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              provider.recommendationScore >= 8 ? 'bg-green-500' :
              provider.recommendationScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${provider.recommendationScore * 10}%` }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-xs text-gray-600">Cost</span>
          </div>
          <div className="font-semibold text-green-600">
            ${provider.estimatedCost.toFixed(2)}
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-xs text-gray-600">Speed</span>
          </div>
          <div className="font-semibold text-blue-600">
            {Math.round(provider.performance.avgProcessingTime / 60)}min
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-4 w-4 text-yellow-600 mr-1" />
            <span className="text-xs text-gray-600">Quality</span>
          </div>
          <div className="font-semibold text-yellow-600">
            {provider.performance.qualityScore.toFixed(1)}/10
          </div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Shield className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-xs text-gray-600">Success</span>
          </div>
          <div className="font-semibold text-purple-600">
            {provider.performance.successRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Features</h4>
        <div className="flex flex-wrap gap-1">
          {provider.features.slice(0, 3).map(feature => (
            <span
              key={feature}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {feature}
            </span>
          ))}
          {provider.features.length > 3 && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              +{provider.features.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{provider.description}</p>

      {/* Action Button */}
      <button
        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
          selectedProvider === provider.providerId
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onProviderSelect(provider.providerId, `Selected for ${provider.recommendationScore.toFixed(1)}/10 match score`);
        }}
      >
        {selectedProvider === provider.providerId ? 'Selected' : 'Select Provider'}
      </button>
    </div>
  );

  const renderComparisonTable = () => (
    <div className="overflow-x-auto bg-white rounded-lg border">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speed</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedProviders.map(provider => (
            <tr key={provider.providerId} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div className="flex items-center">
                  {provider.logo ? (
                    <img src={provider.logo} alt={provider.name} className="h-6 w-6 rounded mr-3" />
                  ) : (
                    <div className="h-6 w-6 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className={`text-xs ${getTierColor(provider.tier)} px-1 rounded`}>
                      {provider.tier}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <div className="text-sm font-medium">{provider.recommendationScore.toFixed(1)}</div>
                  {provider.recommendationScore >= 8 && (
                    <Award className="h-3 w-3 text-yellow-500 ml-1" />
                  )}
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-green-600 font-medium">
                ${provider.estimatedCost.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-sm">
                {Math.round(provider.performance.avgProcessingTime / 60)}min
              </td>
              <td className="px-4 py-4 text-sm">
                {provider.performance.qualityScore.toFixed(1)}/10
              </td>
              <td className="px-4 py-4 text-sm">
                {provider.performance.successRate.toFixed(1)}%
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <div className={`h-2 w-2 rounded-full ${getProviderStatusColor(provider.status)} mr-2`} />
                  <span className="text-sm">{getProviderStatusText(provider.status)}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => onProviderSelect(provider.providerId)}
                  className={`px-3 py-1 text-xs rounded font-medium ${
                    selectedProvider === provider.providerId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedProvider === provider.providerId ? 'Selected' : 'Select'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="bg-white p-6 rounded-lg border mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Advanced Filters</h3>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showAdvancedFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>
      
      {showAdvancedFilters && (
        <div className="space-y-6">
          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Preferred ($)</label>
                <input
                  type="number"
                  value={selectionCriteria.budget.preferred}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    budget: { ...prev.budget, preferred: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Maximum ($)</label>
                <input
                  type="number"
                  value={selectionCriteria.budget.max}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    budget: { ...prev.budget, max: parseFloat(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          {/* Quality Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Requirements</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Minimum Quality (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={selectionCriteria.quality.minimum}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    quality: { ...prev.quality, minimum: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{selectionCriteria.quality.minimum}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-600">Preferred Quality (1-10)</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={selectionCriteria.quality.preferred}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    quality: { ...prev.quality, preferred: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
                <span className="text-xs text-gray-500">{selectionCriteria.quality.preferred}</span>
              </div>
            </div>
          </div>

          {/* Priority Weights */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Weights</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectionCriteria.priorities.map(priority => (
                <div key={priority.factor}>
                  <label className="block text-xs text-gray-600 capitalize">{priority.factor}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={priority.weight}
                    onChange={(e) => {
                      const newWeight = parseFloat(e.target.value);
                      setSelectionCriteria(prev => ({
                        ...prev,
                        priorities: prev.priorities.map(p =>
                          p.factor === priority.factor ? { ...p, weight: newWeight } : p
                        )
                      }));
                    }}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500">{(priority.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading providers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select AI Provider
        </h2>
        <p className="text-gray-600">
          Choose the best provider for your video generation needs based on your requirements
        </p>
      </div>

      {renderAdvancedFilters()}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="recommendation">Best Match</option>
              <option value="cost">Lowest Cost</option>
              <option value="quality">Highest Quality</option>
              <option value="speed">Fastest</option>
            </select>
          </div>
          
          {showComparison && (
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <select
                value={comparisonView}
                onChange={(e) => setComparisonView(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="grid">Grid View</option>
                <option value="table">Table View</option>
              </select>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          {sortedProviders.length} provider{sortedProviders.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Provider Display */}
      {comparisonView === 'table' ? (
        renderComparisonTable()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProviders.map(provider => renderProviderCard(provider))}
        </div>
      )}

      {sortedProviders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No providers match your criteria</div>
          <button
            onClick={() => setShowAdvancedFilters(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Adjust your filters to see more options
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderSelectionPanel;