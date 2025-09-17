/**
 * Module Integration Demo Component
 * 
 * Demonstrates the modular architecture integration and allows
 * testing of different module configurations.
 */

import React, { useState } from 'react';
import { useModules, useModuleFeature } from '../../providers/ModuleProvider';

export const ModuleIntegrationDemo: React.FC = () => {
  const { flags } = useModules();
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});
  
  const coreFeature = useModuleFeature('USE_CORE_TYPES');
  const authFeature = useModuleFeature('USE_AUTH_MODULE');
  const recommendationsFeature = useModuleFeature('USE_RECOMMENDATIONS_MODULE');

  const testCoreModule = async () => {
    setTestResults(prev => ({ ...prev, core: 'pending' }));
    
    try {
      // Test core module imports
      const { APP_CONFIG } = await import('@cvplus/core');
      console.log('Core module test:', APP_CONFIG);
      setTestResults(prev => ({ ...prev, core: 'success' }));
    } catch (error) {
      console.error('Core module test failed:', error);
      setTestResults(prev => ({ ...prev, core: 'error' }));
    }
  };

  const testRecommendationsModule = async () => {
    setTestResults(prev => ({ ...prev, recommendations: 'pending' }));
    
    try {
      // Test recommendations module
      const module = await import('@cvplus/recommendations');
      console.log('Recommendations module test:', module);
      setTestResults(prev => ({ ...prev, recommendations: 'success' }));
    } catch (error) {
      console.error('Recommendations module test failed:', error);
      setTestResults(prev => ({ ...prev, recommendations: 'error' }));
    }
  };

  const getStatusColor = (status: 'success' | 'error' | 'pending' | undefined) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending' | undefined) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Module Integration Status</h3>
        <button 
          onClick={() => setTestResults({})}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Core Module */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">@cvplus/core</span>
            <button
              onClick={coreFeature.isEnabled ? coreFeature.disable : coreFeature.enable}
              className={`text-xs px-2 py-1 rounded ${
                coreFeature.isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {coreFeature.isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(testResults.core)}`}>
              {getStatusIcon(testResults.core)} {testResults.core || 'untested'}
            </span>
            <button
              onClick={testCoreModule}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Test
            </button>
          </div>
        </div>

        {/* Auth Module */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">@cvplus/auth</span>
            <button
              onClick={authFeature.isEnabled ? authFeature.disable : authFeature.enable}
              className={`text-xs px-2 py-1 rounded ${
                authFeature.isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {authFeature.isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <span className="text-xs text-gray-500 px-2 py-1">Legacy Mode</span>
        </div>

        {/* Recommendations Module */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">@cvplus/recommendations</span>
            <button
              onClick={recommendationsFeature.isEnabled ? recommendationsFeature.disable : recommendationsFeature.enable}
              className={`text-xs px-2 py-1 rounded ${
                recommendationsFeature.isEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {recommendationsFeature.isEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(testResults.recommendations)}`}>
              {getStatusIcon(testResults.recommendations)} {testResults.recommendations || 'untested'}
            </span>
            <button
              onClick={testRecommendationsModule}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Test
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div>Fallback Mode: {flags.FALLBACK_TO_LEGACY ? '✅' : '❌'}</div>
          <div className="mt-1 text-gray-500">
            Module integration allows gradual migration to the new architecture
          </div>
        </div>
      </div>
    </div>
  );
};
