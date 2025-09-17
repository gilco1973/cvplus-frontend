/**
 * GeneratedCVDisplay - Integration Layer Component
 * 
 * This component provides seamless integration between legacy and submodule implementations.
 * It handles feature flags, error boundaries, and graceful fallbacks.
 */

import React, { Suspense } from 'react';
import { getGeneratedCVDisplay, monitorCVProcessingPerformance } from '../utils/cvProcessingIntegration';

// Get the appropriate component implementation
const GeneratedCVDisplayImpl = getGeneratedCVDisplay();

export interface GeneratedCVDisplayProps {
  // Props will be typed based on the actual component interface
  [key: string]: any;
}

export const GeneratedCVDisplay: React.FC<GeneratedCVDisplayProps> = (props) => {
  const monitor = monitorCVProcessingPerformance('GeneratedCVDisplay');
  
  React.useEffect(() => {
    monitor.recordLoadTime();
  }, []);

  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded"></div>}>
      <GeneratedCVDisplayImpl {...props} />
    </Suspense>
  );
};

// Re-export for backward compatibility
export default GeneratedCVDisplay;