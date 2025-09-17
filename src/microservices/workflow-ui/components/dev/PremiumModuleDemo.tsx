/**
 * Premium Module Demo Component
 * 
 * Demonstrates the premium module integration functionality
 * for development and testing purposes.
 */

import React, { useState } from 'react';
import { PremiumFeature } from '../../types/premium';
import { usePremium, useFeatureGate, useSubscription } from '../../hooks/usePremium';
import { useModules } from '../../providers/ModuleProvider';

const DEMO_FEATURES: PremiumFeature[] = [
  'externalDataSources',
  'advancedAnalytics',
  'aiInsights',
  'multimediaFeatures',
  'portfolioGallery',
  'videoIntroduction',
  'podcastGeneration'
];

export const PremiumModuleDemo: React.FC = () => {
  const { flags, isModuleEnabled } = useModules();
  const { subscription, isPremium, hasFeature, isLoading } = usePremium();
  const subscriptionData = useSubscription();
  
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature>('externalDataSources');
  const featureGate = useFeatureGate(selectedFeature, {
    analyticsContext: 'demo',
    showPreview: true,
    trackRendering: true
  });
  
  const handleFeatureTest = () => {
    const success = featureGate.handleFeatureUse({
      demo: true,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      alert(`✅ Feature ${selectedFeature} accessed successfully!`);
    } else {
      alert(`❌ Feature ${selectedFeature} access blocked!`);
    }
  };
  
  const handleUpgradePrompt = () => {
    featureGate.showUpgradePrompt('demo-button');
    alert(`📈 Upgrade prompt tracked for ${selectedFeature}`);
  };
  
  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Premium Module Demo
        </h2>
        <p className="text-sm text-gray-600">
          Interactive demo of the premium module integration
        </p>
      </div>
      
      {/* Module Status */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Module Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Premium Module:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isModuleEnabled('USE_PREMIUM_MODULE') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isModuleEnabled('USE_PREMIUM_MODULE') ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Fallback to Legacy:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              flags.FALLBACK_TO_LEGACY ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {flags.FALLBACK_TO_LEGACY ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Subscription Status */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Subscription Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Is Premium:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isPremium ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Tier:</span>
            <span className="ml-2 font-medium capitalize">{subscription.tier}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Plan ID:</span>
            <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
              {subscription.metadata?.planId || 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Feature Access Test */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">Feature Access Test</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Feature to Test:
          </label>
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value as PremiumFeature)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DEMO_FEATURES.map(feature => (
              <option key={feature} value={feature}>
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span className="text-gray-600">Has Access:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              featureGate.hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {featureGate.hasAccess ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Is Premium Feature:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              featureGate.isPremiumFeature ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {featureGate.isPremiumFeature ? 'Yes' : 'No'}
            </span>
          </div>
          {featureGate.denialReason && (
            <div className="col-span-2">
              <span className="text-gray-600">Denial Reason:</span>
              <span className="ml-2 text-red-600 font-medium">
                {featureGate.denialReason.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleFeatureTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Test Feature Access
          </button>
          <button
            onClick={handleUpgradePrompt}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Show Upgrade Prompt
          </button>
        </div>
      </div>
      
      {/* Feature Status Grid */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-3">All Features Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
          {Object.entries(subscription.features).map(([feature, hasAccess]) => (
            <div
              key={feature}
              className={`p-2 rounded text-center ${
                hasAccess ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="font-medium text-xs mb-1">
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className="text-xs">
                {hasAccess ? '✅' : '❌'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug Information */}
      <details className="bg-gray-50 p-4 rounded-lg">
        <summary className="font-semibold text-gray-700 cursor-pointer">
          Debug Information
        </summary>
        <div className="mt-3 text-xs">
          <div className="mb-2">
            <strong>Module Flags:</strong>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(flags, null, 2)}
            </pre>
          </div>
          <div className="mb-2">
            <strong>Subscription Data:</strong>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(subscriptionData, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Feature Gate Config:</strong>
            <pre className="mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
              {JSON.stringify(featureGate.gateConfig, null, 2)}
            </pre>
          </div>
        </div>
      </details>
    </div>
  );
};