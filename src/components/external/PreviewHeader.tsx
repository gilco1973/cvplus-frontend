import React from 'react';
import { designSystem } from '../../config/designSystem';

interface PreviewHeaderProps {
  totalSelected: number;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({ totalSelected }) => {
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-100">
            External Data Preview
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            Review and select items to include in your CV
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-primary-400">{totalSelected}</div>
            <div className="text-xs text-neutral-400">Items Selected</div>
          </div>
        </div>
      </div>
    </div>
  );
};
