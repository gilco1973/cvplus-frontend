/**
 * CVAnalysisResults - Integration Layer Component
 * 
 * This component provides seamless integration between legacy and submodule implementations.
 * It handles feature flags, error boundaries, and graceful fallbacks.
 */

import React, { Suspense } from 'react';
import { getCVAnalysisResults, monitorCVProcessingPerformance } from '../utils/cvProcessingIntegration';

// Get the appropriate component implementation
const CVAnalysisResultsImpl = getCVAnalysisResults();

export interface CVAnalysisResultsProps {
  // Props will be typed based on the actual component interface
  [key: string]: any;
}

export const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = (props) => {
  const monitor = monitorCVProcessingPerformance('CVAnalysisResults');
  
  React.useEffect(() => {
    monitor.recordLoadTime();
  }, []);

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded"></div>}>
      <CVAnalysisResultsImpl {...props} />
    </Suspense>
  );
};

// Re-export for backward compatibility
export default CVAnalysisResults;