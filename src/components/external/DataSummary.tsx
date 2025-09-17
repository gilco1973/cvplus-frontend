import React from 'react';
import { designSystem } from '../../config/designSystem';
import type { ExternalDataResult } from '../../types/externalData';

interface Stats {
  totalSources: number;
  enabledSources: number;
  successfulSources: number;
  failedSources: number;
  totalItems: number;
}

interface DataSummaryProps {
  stats: Stats;
  enrichedData: ExternalDataResult[];
}

export const DataSummary: React.FC<DataSummaryProps> = ({ stats, enrichedData }) => {
  const projectsCount = enrichedData.reduce((sum, r) => sum + (r.data.projects?.length || 0), 0);
  const certificationsCount = enrichedData.reduce((sum, r) => sum + (r.data.certifications?.length || 0), 0);
  
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-4`}>
      <h4 className="font-medium text-neutral-100 mb-2">Data Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-xl font-bold text-primary-400">{stats.successfulSources}</div>
          <div className="text-neutral-400">Sources</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-400">{stats.totalItems}</div>
          <div className="text-neutral-400">Items Found</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-400">{projectsCount}</div>
          <div className="text-neutral-400">Projects</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-purple-400">{certificationsCount}</div>
          <div className="text-neutral-400">Certifications</div>
        </div>
      </div>
    </div>
  );
};
