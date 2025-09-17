import React from 'react';
import { Github, Linkedin, Globe, Search, CheckCircle, Circle, AlertTriangle, Loader2 } from 'lucide-react';
import { designSystem } from '../../config/designSystem';
import type { ExternalDataSource } from '../../types/externalData';

interface SourceSelectorProps {
  sources: ExternalDataSource[];
  isLoading: boolean;
  onToggleSource: (sourceId: string) => void;
  onUpdateSource: (sourceId: string, updates: Partial<ExternalDataSource>) => void;
}

const SOURCE_ICONS = {
  github: Github,
  linkedin: Linkedin,
  website: Globe,
  web: Search,
} as const;

const SOURCE_DESCRIPTIONS = {
  github: 'Fetch repositories, contributions, and technical projects',
  linkedin: 'Extract professional experience and certifications',
  website: 'Analyze personal website for portfolio and achievements',
  web: 'Search the web for your professional presence and publications',
} as const;

const SOURCE_PLACEHOLDERS = {
  github: 'your-username',
  linkedin: 'your-profile-name',
  website: 'https://your-website.com',
  web: '',
} as const;

export const SourceSelector: React.FC<SourceSelectorProps> = ({
  sources,
  isLoading,
  onToggleSource,
  onUpdateSource
}) => {
  const handleInputChange = (sourceId: string, field: 'username' | 'url', value: string) => {
    onUpdateSource(sourceId, { [field]: value });
  };
  
  const renderSourceInput = (source: ExternalDataSource) => {
    if (source.id === 'web') return null; // Web search doesn't need input
    
    const fieldName = source.id === 'website' ? 'url' : 'username';
    const value = source.id === 'website' ? source.url || '' : source.username || '';
    const placeholder = SOURCE_PLACEHOLDERS[source.id];
    
    return (
      <div className="mt-3">
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(source.id, fieldName, e.target.value)}
          placeholder={placeholder}
          disabled={!source.enabled || isLoading}
          className={`w-full px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
            source.enabled 
              ? 'bg-neutral-700 border border-neutral-600 text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500' 
              : 'bg-neutral-800 border border-neutral-700 text-neutral-500 cursor-not-allowed'
          }`}
        />
      </div>
    );
  };
  
  const renderSourceStatus = (source: ExternalDataSource) => {
    if (source.loading) {
      return (
        <div className="flex items-center gap-2 text-blue-400 text-xs">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Fetching...</span>
        </div>
      );
    }
    
    if (source.error) {
      return (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>{source.error}</span>
        </div>
      );
    }
    
    if (source.data) {
      const itemCount = Object.values(source.data.data || {}).reduce(
        (sum, items) => sum + (Array.isArray(items) ? items.length : 0), 
        0
      );
      return (
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <CheckCircle className="w-3 h-3" />
          <span>{itemCount} items found</span>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.default} p-6`}>
      <h3 className="text-lg font-semibold text-neutral-100 mb-4">Select Data Sources</h3>
      
      <div className="space-y-4">
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source.id];
          
          return (
            <div
              key={source.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                source.enabled 
                  ? 'border-primary-400 bg-primary-400/10' 
                  : 'border-neutral-600 bg-neutral-700/50 hover:border-neutral-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleSource(source.id)}
                  disabled={isLoading}
                  className="flex-shrink-0 mt-0.5 transition-colors disabled:cursor-not-allowed"
                >
                  {source.enabled ? (
                    <CheckCircle className="w-5 h-5 text-primary-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-500" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${source.enabled ? 'text-primary-400' : 'text-neutral-400'}`} />
                    <h4 className="font-medium text-neutral-100">{source.name}</h4>
                  </div>
                  
                  <p className="text-sm text-neutral-400 mb-3">
                    {SOURCE_DESCRIPTIONS[source.id]}
                  </p>
                  
                  {renderSourceInput(source)}
                  {renderSourceStatus(source)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
