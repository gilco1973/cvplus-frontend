/**
 * Simple Module Integration Demo
 * 
 * Demonstrates the module provider system without trying to load
 * packages that aren't built yet.
 */

import React from 'react';
import { useModules, useModuleFeature } from '../../providers/ModuleProvider';

export const SimpleModuleDemo: React.FC = () => {
  const { flags } = useModules();
  
  const coreFeature = useModuleFeature('USE_CORE_TYPES');
  const authFeature = useModuleFeature('USE_AUTH_MODULE');
  const recommendationsFeature = useModuleFeature('USE_RECOMMENDATIONS_MODULE');
  const fallbackFeature = useModuleFeature('FALLBACK_TO_LEGACY');

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">Module Integration</h3>
        <span className="text-xs text-gray-500">Phase 6</span>
      </div>
      
      <div className="space-y-2 text-sm">
        {/* Core Module */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="font-medium">@cvplus/core</span>
          <button
            onClick={coreFeature.isEnabled ? coreFeature.disable : coreFeature.enable}
            className={`text-xs px-2 py-1 rounded ${
              coreFeature.isEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {coreFeature.isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Auth Module */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="font-medium">@cvplus/auth</span>
          <button
            onClick={authFeature.isEnabled ? authFeature.disable : authFeature.enable}
            className={`text-xs px-2 py-1 rounded ${
              authFeature.isEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {authFeature.isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Recommendations Module */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <span className="font-medium">@cvplus/recommendations</span>
          <button
            onClick={recommendationsFeature.isEnabled ? recommendationsFeature.disable : recommendationsFeature.enable}
            className={`text-xs px-2 py-1 rounded ${
              recommendationsFeature.isEnabled 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {recommendationsFeature.isEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Legacy Fallback */}
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
          <span className="font-medium text-blue-800">Legacy Fallback</span>
          <span className={`text-xs px-2 py-1 rounded ${
            fallbackFeature.isEnabled 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {fallbackFeature.isEnabled ? 'ENABLED' : 'DISABLED'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="mb-1">
            <strong>Status:</strong> Integration layer ready
          </div>
          <div className="mb-1">
            <strong>Mode:</strong> {flags.FALLBACK_TO_LEGACY ? 'Legacy with module support' : 'Full modular'}
          </div>
          <div className="text-gray-500">
            Toggle modules to see feature flag system working. 
            Full packages will be enabled in future phases.
          </div>
        </div>
      </div>
    </div>
  );
};
