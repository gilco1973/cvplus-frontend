import React from 'react';
import { Shield, CheckCircle, Circle } from 'lucide-react';
import { designSystem } from '../../config/designSystem';

interface PrivacyNoticeProps {
  isAccepted: boolean;
  onAcceptanceChange: (accepted: boolean) => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  isAccepted,
  onAcceptanceChange
}) => {
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-6`}>
      <div className="flex items-start gap-4">
        <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-100 mb-2">
            Privacy & Consent
          </h3>
          <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
            We'll only access publicly available information from the sources you specify.
            No private data will be accessed, and all fetched data is used solely to enhance your CV.
            You can review and select which items to include before they're added to your CV.
          </p>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              onClick={() => onAcceptanceChange(!isAccepted)}
              className="flex-shrink-0"
            >
              {isAccepted ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-500" />
              )}
            </button>
            <span className="text-sm text-neutral-300">
              I consent to fetching publicly available data from the selected sources
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
