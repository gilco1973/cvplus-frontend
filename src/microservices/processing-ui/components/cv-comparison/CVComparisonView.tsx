/**
 * CVComparisonView - Integration Layer Component
 * 
 * This component provides seamless integration between legacy and submodule implementations.
 * It handles feature flags, error boundaries, and graceful fallbacks.
 */

import React, { Suspense } from 'react';
import { getCVComparisonView, monitorCVProcessingPerformance } from '../../utils/cvProcessingIntegration';

// Get the appropriate component implementation
const CVComparisonViewImpl = getCVComparisonView();

export interface CVComparisonViewProps {
  // Props will be typed based on the actual component interface
  [key: string]: any;
}

export const CVComparisonView: React.FC<CVComparisonViewProps> = (props) => {
  const monitor = monitorCVProcessingPerformance('CVComparisonView');
  
  React.useEffect(() => {
    monitor.recordLoadTime();
  }, []);

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded"></div>}>
      <CVComparisonViewImpl {...props} />
    </Suspense>
  );
};

// Re-export for backward compatibility
export default CVComparisonView;