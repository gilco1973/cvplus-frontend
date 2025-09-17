import React, { useState } from 'react';
import { Search, ChevronDown as _ChevronDown, ChevronUp as _ChevronUp } from 'lucide-react';
import { designSystem as _designSystem } from '../config/designSystem';
import type { ExternalDataResult, SelectedItems } from '../types/externalData';
import { PreviewHeader } from './external/PreviewHeader';
import { SourceDataSection } from './external/SourceDataSection';

interface ExternalDataPreviewProps {
  data: ExternalDataResult[];
  onSelectionChange?: (selectedItems: SelectedItems) => void;
  className?: string;
}

export const ExternalDataPreview: React.FC<ExternalDataPreviewProps> = ({
  data,
  onSelectionChange,
  className = ''
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    portfolio: [],
    certifications: [],
    projects: [],
    publications: [],
    achievements: [],
    skills: [],
    hobbies: [],
    interests: []
  });
  
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  
  const updateSelection = (category: keyof SelectedItems, itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const updated = {
        ...prev,
        [category]: selected
          ? [...prev[category], itemId]
          : prev[category].filter(id => id !== itemId)
      };
      onSelectionChange?.(updated);
      return updated;
    });
  };
  
  const toggleSourceExpansion = (sourceId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [sourceId]: !prev[sourceId]
    }));
  };
  
  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Search className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-300 mb-2">No External Data Available</h3>
        <p className="text-neutral-500">Fetch data from external sources to see a preview here.</p>
      </div>
    );
  }
  
  const totalSelected = Object.values(selectedItems).reduce(
    (sum, items) => sum + items.length,
    0
  );
  
  return (
    <div className={`space-y-6 ${className}`}>
      <PreviewHeader totalSelected={totalSelected} />
      
      <div className="space-y-6">
        {data.map((sourceResult) => {
          const isExpanded = expandedSources[sourceResult.source] !== false;
          
          const sourceItemCount = Object.values(sourceResult.data).reduce(
            (sum, items) => sum + (Array.isArray(items) ? items.length : 0),
            0
          );
          
          if (sourceItemCount === 0) return null;
          
          return (
            <SourceDataSection
              key={sourceResult.source}
              sourceResult={sourceResult}
              isExpanded={isExpanded}
              selectedItems={selectedItems}
              onToggleExpansion={toggleSourceExpansion}
              onUpdateSelection={updateSelection}
            />
          );
        })}
      </div>
    </div>
  );
};
