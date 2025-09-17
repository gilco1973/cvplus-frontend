import React from 'react';
import { LinkValidationResult } from './types';
import { SOCIAL_PLATFORMS } from './constants';

interface ValidationResultsProps {
  validationResults: Record<string, LinkValidationResult>;
  getLinkStatus: (platformKey: string, url: string) => any;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({
  validationResults,
  getLinkStatus
}) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Link Validation Results</h4>
      
      <div className="space-y-2">
        {Object.entries(validationResults).map(([platform, result]) => {
          const platformInfo = SOCIAL_PLATFORMS.find(p => p.key === platform);
          if (!platformInfo) return null;
          
          const status = getLinkStatus(platform, result.url);
          
          return (
            <div key={platform} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <platformInfo.icon className="w-4 h-4" style={{ color: platformInfo.color }} />
                <span className="font-medium text-gray-900 dark:text-gray-100">{platformInfo.name}</span>
                {status && (
                  <div className={`w-4 h-4 ${status.color}`} title={status.tooltip}>
                    {/* Status icon would be rendered here based on status.icon */}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {result.isValid && result.isReachable 
                  ? `✓ ${result.responseTime}ms` 
                  : result.error || 'Invalid'
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
