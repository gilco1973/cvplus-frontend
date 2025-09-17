/**
 * LivePreview - Integration Layer Component
 * 
 * This component provides seamless integration between legacy and submodule implementations.
 * It handles feature flags, error boundaries, and graceful fallbacks.
 */

import React, { Suspense } from 'react';
import { getLivePreview, monitorCVProcessingPerformance } from '../utils/cvProcessingIntegration';

// Get the appropriate component implementation
const LivePreviewImpl = getLivePreview();

export interface LivePreviewProps {
  // Props will be typed based on the actual component interface
  [key: string]: any;
}

export const LivePreview: React.FC<LivePreviewProps> = (props) => {
  const monitor = monitorCVProcessingPerformance('LivePreview');
  
  React.useEffect(() => {
    monitor.recordLoadTime();
  }, []);

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded"></div>}>
      <LivePreviewImpl {...props} />
    </Suspense>
  );
};

// Re-export for backward compatibility
export default LivePreview;