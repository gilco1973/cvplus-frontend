// External Data Service - Business Logic
// Handles validation and API calls for external data enrichment

import type { HttpsCallable } from 'firebase/functions';
import toast from 'react-hot-toast';
import { getErrorMessage, logError } from '../utils/errorHandling';
import type {
  ExternalDataSource,
  ExternalDataResult,
  EnrichCVRequest,
  EnrichCVResponse
} from '../types/externalData';

interface FetchParams {
  sources: ExternalDataSource[];
  isPrivacyAccepted: boolean;
  jobId: string;
  isMountedRef: React.MutableRefObject<boolean>;
  enrichCVWithExternalData: HttpsCallable<EnrichCVRequest, EnrichCVResponse>;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEnrichedData: (data: ExternalDataResult[]) => void;
  setRequestId: (id: string | null) => void;
  updateSource: (sourceId: string, updates: Partial<ExternalDataSource>) => void;
}

export const validateAndFetch = async (params: FetchParams): Promise<void> => {
  const {
    sources,
    isPrivacyAccepted,
    jobId,
    isMountedRef,
    enrichCVWithExternalData,
    setIsLoading,
    setError,
    setEnrichedData,
    setRequestId,
    updateSource
  } = params;
  
  // Validation checks
  if (!isPrivacyAccepted) {
    toast.error('Please accept the privacy notice to continue');
    return;
  }
  
  const enabledSources = sources.filter(s => s.enabled);
  if (enabledSources.length === 0) {
    toast.error('Please select at least one data source');
    return;
  }
  
  // Check for required inputs
  const invalidSources = enabledSources.filter(source => {
    if (source.id === 'github' || source.id === 'linkedin') {
      return !source.username || source.username.trim() === '';
    }
    if (source.id === 'website') {
      return !source.url || source.url.trim() === '';
    }
    return false; // Web search doesn't require input
  });
  
  if (invalidSources.length > 0) {
    const sourceNames = invalidSources.map(s => s.name).join(', ');
    toast.error(`Please provide required information for: ${sourceNames}`);
    return;
  }
  
  // Start loading state
  setIsLoading(true);
  setError(null);
  
  // Mark sources as loading
  enabledSources.forEach(source => {
    updateSource(source.id, { loading: true, error: undefined });
  });
  
  try {
    const request: EnrichCVRequest = {
      cvId: jobId,
      sources: enabledSources.map(s => s.id),
      options: {
        forceRefresh: false,
        timeout: 30000,
        priority: 'normal'
      }
    };
    
    // Add source-specific data
    enabledSources.forEach(source => {
      if (source.id === 'github' && source.username) {
        request.github = source.username;
      } else if (source.id === 'linkedin' && source.username) {
        request.linkedin = source.username;
      } else if (source.id === 'website' && source.url) {
        request.website = source.url;
      }
    });
    
    const result = await enrichCVWithExternalData(request);
    
    if (!isMountedRef.current) return;
    
    if (result.data.success) {
      setEnrichedData(result.data.enrichedData);
      setRequestId(result.data.requestId);
      
      // Cache the results
      sessionStorage.setItem(
        `external-data-${jobId}`,
        JSON.stringify(result.data.enrichedData)
      );
      
      // Update source states based on results
      enabledSources.forEach(source => {
        const sourceResult = result.data.enrichedData.find(r => r.source === source.id);
        const hasError = result.data.errors.some(e => e.includes(source.id));
        
        updateSource(source.id, {
          loading: false,
          error: hasError ? 'Failed to fetch data' : undefined,
          data: sourceResult
        });
      });
      
      toast.success(
        `Successfully enriched CV with data from ${result.data.metrics.sourcesSuccessful} sources`
      );
    } else {
      throw new Error(result.data.errors.join(', ') || 'Failed to enrich CV');
    }
    
  } catch (err) {
    logError('fetchExternalData', err);
    const errorMessage = getErrorMessage(err) || 'Failed to fetch external data';
    
    setError(errorMessage);
    toast.error(errorMessage);
    
    // Mark all enabled sources as failed
    enabledSources.forEach(source => {
      updateSource(source.id, {
        loading: false,
        error: 'Failed to fetch data'
      });
    });
    
  } finally {
    if (isMountedRef.current) {
      setIsLoading(false);
    }
  }
};
