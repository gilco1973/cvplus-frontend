import { useState, useCallback, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

// Re-export types
export type {
  ExternalDataSource,
  ExternalDataResult,
  PortfolioItem,
  Certification,
  ProjectItem,
  Publication,
  Achievement,
  EnrichCVRequest,
  EnrichCVResponse,
  SelectedItems,
  DataCategory,
  ItemType
} from '../types/externalData';

// Import types for local use
import type {
  ExternalDataSource,
  ExternalDataResult,
  EnrichCVRequest,
  EnrichCVResponse
} from '../types/externalData';

export const useExternalData = (jobId: string) => {
  const initialSources: ExternalDataSource[] = [
    { id: 'github', name: 'GitHub', enabled: false },
    { id: 'linkedin', name: 'LinkedIn', enabled: false },
    { id: 'website', name: 'Personal Website', enabled: false },
    { id: 'web', name: 'Web Search', enabled: false },
  ];
  
  // State
  const [sources, setSources] = useState<ExternalDataSource[]>(initialSources);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  const [enrichedData, setEnrichedData] = useState<ExternalDataResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  const enrichCVWithExternalData = httpsCallable<EnrichCVRequest, EnrichCVResponse>(
    functions,
    'enrichCVWithExternalData'
  );
  
  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  
  // Load cache
  useEffect(() => {
    const cachedData = sessionStorage.getItem(`external-data-${jobId}`);
    const cachedSources = sessionStorage.getItem(`external-sources-${jobId}`);
    
    if (cachedData) {
      try { setEnrichedData(JSON.parse(cachedData)); } catch (e) { /* ignore */ }
    }
    if (cachedSources) {
      try { setSources(JSON.parse(cachedSources)); } catch (e) { /* ignore */ }
    }
  }, [jobId]);
  
  // Actions
  const updateSource = useCallback((sourceId: string, updates: Partial<ExternalDataSource>) => {
    setSources(prev => {
      const updated = prev.map(source => 
        source.id === sourceId ? { ...source, ...updates } : source
      );
      sessionStorage.setItem(`external-sources-${jobId}`, JSON.stringify(updated));
      return updated;
    });
  }, [jobId]);
  
  const toggleSource = useCallback((sourceId: string, enabled?: boolean) => {
    setSources(prev => {
      const updated = prev.map(source => 
        source.id === sourceId 
          ? { ...source, enabled: enabled !== undefined ? enabled : !source.enabled }
          : source
      );
      sessionStorage.setItem(`external-sources-${jobId}`, JSON.stringify(updated));
      return updated;
    });
  }, [jobId]);
  
  const fetchExternalData = useCallback(async () => {
    const { validateAndFetch } = await import('../services/externalDataService');
    return validateAndFetch({
      sources, isPrivacyAccepted, jobId, isMountedRef,
      enrichCVWithExternalData, setIsLoading, setError,
      setEnrichedData, setRequestId, updateSource
    });
  }, [sources, isPrivacyAccepted, jobId, enrichCVWithExternalData, updateSource]);
  
  const clearData = useCallback(() => {
    setEnrichedData([]);
    setError(null);
    setRequestId(null);
    sessionStorage.removeItem(`external-data-${jobId}`);
    setSources(prev => prev.map(source => ({
      ...source, loading: false, error: undefined, data: undefined
    })));
  }, [jobId]);
  
  // Stats
  const stats = {
    totalSources: sources.length,
    enabledSources: sources.filter(s => s.enabled).length,
    successfulSources: sources.filter(s => s.data && !s.error).length,
    failedSources: sources.filter(s => s.error).length,
    totalItems: enrichedData.reduce((sum, result) => {
      const data = result.data;
      return sum + (data.portfolio?.length || 0) + (data.certifications?.length || 0) +
        (data.projects?.length || 0) + (data.publications?.length || 0) + (data.achievements?.length || 0);
    }, 0)
  };
  
  return {
    sources, isLoading, isPrivacyAccepted, enrichedData, error, requestId, stats,
    updateSource, toggleSource, fetchExternalData, clearData, setIsPrivacyAccepted
  };
};
