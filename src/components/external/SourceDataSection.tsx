import React from 'react';
import { Github, Linkedin, Globe, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import type { ExternalDataResult, SelectedItems } from '../../types/externalData';
import { CategorySection } from './CategorySection';

interface SourceDataSectionProps {
  sourceResult: ExternalDataResult;
  isExpanded: boolean;
  selectedItems: SelectedItems;
  onToggleExpansion: (sourceId: string) => void;
  onUpdateSelection: (category: keyof SelectedItems, itemId: string, selected: boolean) => void;
}

const SOURCE_ICONS = {
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  web: Search,
} as const;

export const SourceDataSection: React.FC<SourceDataSectionProps> = ({
  sourceResult,
  isExpanded,
  selectedItems,
  onToggleExpansion,
  onUpdateSelection
}) => {
  const Icon = SOURCE_ICONS[sourceResult.source as keyof typeof SOURCE_ICONS] || Search;
  
  const sourceItemCount = Object.values(sourceResult.data).reduce(
    (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
    0
  );
  
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-6`}>
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => onToggleExpansion(sourceResult.source)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 rounded-lg">
            <Icon className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h4 className="font-medium text-neutral-100 capitalize">
              {sourceResult.source} Data
            </h4>
            <p className="text-sm text-neutral-400">
              {sourceItemCount} items found
              {sourceResult.metadata?.cacheHit && (
                <span className="ml-2 text-green-400">(cached)</span>
              )}
            </p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-400" />
        )}
      </div>
      
      {isExpanded && (
        <div className="space-y-4">
          {Object.entries(sourceResult.data).map(([category, data]) => {
            if (!data || (Array.isArray(data) && data.length === 0)) return null;
            
            return (
              <CategorySection
                key={category}
                category={category as keyof SelectedItems}
                data={data}
                selectedItems={selectedItems}
                onUpdateSelection={onUpdateSelection}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
