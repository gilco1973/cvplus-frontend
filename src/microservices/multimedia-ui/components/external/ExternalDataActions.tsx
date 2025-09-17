import React from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { designSystem } from '../../config/designSystem';

interface ExternalDataActionsProps {
  isLoading: boolean;
  enrichedData: any[];
  stats: {
    enabledSources: number;
    totalItems: number;
  };
  isPrivacyAccepted: boolean;
  onSkip?: () => void;
  onFetchData: () => void;
  onContinue: () => void;
  onClearAndRefetch: () => void;
}

export const ExternalDataActions: React.FC<ExternalDataActionsProps> = ({
  isLoading,
  enrichedData,
  stats,
  isPrivacyAccepted,
  onSkip,
  onFetchData,
  onContinue,
  onClearAndRefetch
}) => {
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-6`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-neutral-400">
          {stats.enabledSources > 0 ? (
            `${stats.enabledSources} sources selected`
          ) : (
            'Select sources to enhance your CV'
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={isLoading}
              className="px-4 py-2 text-neutral-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Skip This Step
            </button>
          )}
          
          {enrichedData.length > 0 ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onClearAndRefetch}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border border-neutral-600 text-neutral-300 hover:border-neutral-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Fetch Again
              </button>
              
              <button
                onClick={onContinue}
                className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} flex items-center gap-2`}
              >
                Continue with Data
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {stats.totalItems}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={onFetchData}
              disabled={isLoading || stats.enabledSources === 0 || !isPrivacyAccepted}
              className={`${designSystem.components.button.base} ${isLoading ? designSystem.components.button.variants.primary.loading : designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} flex items-center gap-2`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Fetch External Data
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
