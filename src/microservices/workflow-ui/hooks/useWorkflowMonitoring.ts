// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflictsimport { useState, useEffect, useCallback } from 'react';
import { Job, JobStatus, JobProgress } from '../../types/Job';
import { Feature } from '../../types/Feature';

interface UseWorkflowMonitoringResult {
  progress: JobProgress | null;
  status: JobStatus | null;
  features: Feature[];
  error: string | null;
  isLoading: boolean;
  refresh: () => void;
}

/**
 * Hook for monitoring workflow progress and status in real-time
 * 
 * Provides real-time updates on job progress, status changes,
 * and feature completion within workflows.
  */
export const useWorkflowMonitoring = (jobId: string): UseWorkflowMonitoringResult => {
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMonitoringData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // const response = await workflowAPI.getMonitoringData(jobId);
      
      // Mock data for now
      setTimeout(() => {
        setProgress({
          totalFeatures: 5,
          completedFeatures: 3,
          skippedFeatures: 0,
          remainingFeatures: 2,
          progressPercentage: 60
        });
        
        setStatus('processing');
        
        setFeatures([
          { id: '1', name: 'CV Analysis', status: 'completed', description: 'Basic CV analysis complete' },
          { id: '2', name: 'Template Selection', status: 'completed', description: 'Template selected and applied' },
          { id: '3', name: 'Content Enhancement', status: 'completed', description: 'AI-powered content improvements' },
          { id: '4', name: 'Multimedia Integration', status: 'processing', description: 'Adding multimedia elements' },
          { id: '5', name: 'Final Review', status: 'pending', description: 'Final quality review and export' }
        ]);
        
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
      setIsLoading(false);
    }
  }, [jobId]);

  const refresh = useCallback(() => {
    fetchMonitoringData();
  }, [fetchMonitoringData]);

  useEffect(() => {
    if (!jobId) return;

    fetchMonitoringData();

    // Set up real-time monitoring
    // TODO: Implement WebSocket or polling for real-time updates
    const interval = setInterval(fetchMonitoringData, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [jobId, fetchMonitoringData]);

  // Set up event listeners for real-time updates
  useEffect(() => {
    // TODO: Implement WebSocket listeners for real-time updates
    // const eventSource = new EventSource(`/api/jobs/${jobId}/monitor`);
    // 
    // eventSource.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   setProgress(data.progress);
    //   setStatus(data.status);
    //   setFeatures(data.features);
    // };
    //
    // return () => {
    //   eventSource.close();
    // };
  }, [jobId]);

  return {
    progress,
    status,
    features,
    error,
    isLoading,
    refresh
  };
};