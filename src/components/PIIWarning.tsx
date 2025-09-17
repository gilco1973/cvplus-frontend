import React from 'react';
import { Shield } from 'lucide-react';

interface PIIWarningProps {
  hasPII: boolean;
  detectedTypes: string[];
  recommendations: string[];
  onTogglePrivacyMode?: () => void;
  privacyModeEnabled?: boolean;
}

export const PIIWarning: React.FC<PIIWarningProps> = ({
  hasPII,
  detectedTypes
}) => {
  if (!hasPII || detectedTypes.length === 0) return null;

  return (
    <div className="bg-yellow-900/10 border border-yellow-700/30 rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-yellow-300">
              Privacy Notice
            </h4>
            <div className="flex flex-wrap gap-2">
              {detectedTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/20 text-yellow-400"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400">
            We detected sensitive information in your CV. Enable <strong className="text-yellow-400">Privacy Mode</strong> in the features below to automatically mask this information for public sharing.
          </p>
        </div>
      </div>
    </div>
  );
};