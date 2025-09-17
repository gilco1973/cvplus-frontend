import React from 'react';
import { X, CheckCircle, Clock, DollarSign, Star, Shield, Zap } from 'lucide-react';

interface VideoProvider {
  id: 'heygen' | 'runwayml' | 'did';
  name: string;
  description: string;
  capabilities: string[];
  reliability: number;
  estimatedTime: number;
  qualityRating: number;
  costTier: 'low' | 'medium' | 'high';
}

interface ProviderSelectionPanelProps {
  providers: VideoProvider[];
  selectedProvider: VideoProvider | null;
  onSelectProvider: (provider: VideoProvider) => void;
  onClose: () => void;
}

export const ProviderSelectionPanel: React.FC<ProviderSelectionPanelProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  onClose
}) => {
  const getCostColor = (tier: string) => {
    switch (tier) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 95) return 'text-green-400';
    if (reliability >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'heygen': return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'runwayml': return <Star className="w-6 h-6 text-purple-400" />;
      case 'did': return <Shield className="w-6 h-6 text-blue-400" />;
      default: return <CheckCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">Choose Video Generation Provider</h2>
            <p className="text-gray-400 text-sm mt-1">
              Select the AI provider that best matches your quality and speed requirements
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        {/* Provider Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const isSelected = selectedProvider?.id === provider.id;
              const isRecommended = provider.id === 'heygen'; // HeyGen is recommended
              
              return (
                <div
                  key={provider.id}
                  className={`relative bg-gray-900 rounded-lg p-6 border-2 transition-all cursor-pointer hover:scale-105 ${
                    isSelected 
                      ? 'border-cyan-500 bg-cyan-900/20' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => onSelectProvider(provider)}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  )}

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -left-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Provider Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    {getProviderIcon(provider.id)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{provider.name}</h3>
                      <p className="text-sm text-gray-400">{provider.description}</p>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getReliabilityColor(provider.reliability)}`}>
                        {provider.reliability}%
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        Reliability
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {provider.qualityRating}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Star className="w-3 h-3" />
                        Quality
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {provider.estimatedTime}s
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        Est. Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getCostColor(provider.costTier)}`}>
                        {provider.costTier.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Cost
                      </div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-200 mb-2">Key Features:</h4>
                    <div className="space-y-1">
                      {provider.capabilities.slice(0, 3).map((capability, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-400">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      ))}
                      {provider.capabilities.length > 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{provider.capabilities.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className={`text-center text-sm font-medium ${
                      isSelected ? 'text-cyan-400' : 'text-gray-500'
                    }`}>
                      {isSelected ? 'Selected' : 'Click to Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Provider Comparison */}
          <div className="mt-8 bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Provider Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-300">Provider</th>
                    <th className="text-center py-2 text-gray-300">Quality</th>
                    <th className="text-center py-2 text-gray-300">Speed</th>
                    <th className="text-center py-2 text-gray-300">Reliability</th>
                    <th className="text-center py-2 text-gray-300">Cost</th>
                    <th className="text-center py-2 text-gray-300">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider.id} className="border-b border-gray-800">
                      <td className="py-2 text-gray-200 font-medium">{provider.name}</td>
                      <td className="text-center py-2 text-yellow-400">{provider.qualityRating}/10</td>
                      <td className="text-center py-2 text-blue-400">{provider.estimatedTime}s</td>
                      <td className={`text-center py-2 ${getReliabilityColor(provider.reliability)}`}>
                        {provider.reliability}%
                      </td>
                      <td className={`text-center py-2 ${getCostColor(provider.costTier)}`}>
                        {provider.costTier}
                      </td>
                      <td className="text-center py-2 text-gray-400 text-xs">
                        {provider.id === 'heygen' && 'Enterprise & Marketing'}
                        {provider.id === 'runwayml' && 'Creative & Artistic'}
                        {provider.id === 'did' && 'Budget & Reliability'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedProvider && onSelectProvider(selectedProvider)}
              disabled={!selectedProvider}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use {selectedProvider?.name || 'Selected Provider'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderSelectionPanel;