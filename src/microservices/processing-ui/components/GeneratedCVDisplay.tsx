/**
 * Generated CV Display Component (Legacy Wrapper)
 *
 * Simplified wrapper component that delegates to the new modular
 * GeneratedCVDisplay system while maintaining backward compatibility.
 *
 * This component is kept under 200 lines and serves as a bridge
 * between the old API and the new T065 implementation.
 */

import React from 'react';
import { AlertTriangle, FileText } from 'lucide-react';

import type { Job } from '../types/job';
import { GeneratedCVDisplay as NewGeneratedCVDisplay } from './generated-cv-display';

interface GeneratedCVDisplayProps {
  job: Job;
  onDownloadPDF?: () => void;
  onDownloadDOCX?: () => void;
  className?: string;
}

/**
 * Legacy GeneratedCVDisplay Component
 *
 * This is a backward-compatible wrapper around the new modular
 * GeneratedCVDisplay system (T065). It maintains the same API
 * while providing enhanced functionality.
 */
export const GeneratedCVDisplay: React.FC<GeneratedCVDisplayProps> = ({
  job,
  onDownloadPDF,
  onDownloadDOCX,
  className = ''
}) => {
  // Validate job data
  if (!job) {
    return (
      <div className={`generated-cv-display-error ${className}`}>
        <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Invalid Job Data</h3>
            <p className="text-gray-400">
              No job data provided. Please ensure the job object is valid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check for generated CV content
  const hasGeneratedCV = Boolean(
    job.generatedCV?.html ||
    job.generatedCV?.content ||
    job.generatedCV?.htmlUrl
  );

  if (!hasGeneratedCV) {
    return (
      <div className={`generated-cv-display-empty ${className}`}>
        <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Generated CV</h3>
            <p className="text-gray-400 mb-4">
              CV content is not yet available. Please wait for processing to complete.
            </p>
            <div className="text-sm text-gray-500">
              Job Status: <span className="font-medium text-cyan-400">{job.status}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle legacy export callbacks
  const handleExport = (format: 'pdf' | 'docx' | 'html' | 'png') => {
    switch (format) {
      case 'pdf':
        onDownloadPDF?.();
        break;
      case 'docx':
        onDownloadDOCX?.();
        break;
      default:
        console.log(`Export format ${format} requested`);
    }
  };

  // Convert legacy props to new component props
  const newComponentProps = {
    job,
    editing: false, // Default to view mode for legacy compatibility
    onExport: handleExport,
    className
  };

  // Development mode warnings
  if (process.env.NODE_ENV === 'development') {
    console.log('[LEGACY-CV-DISPLAY] Using compatibility wrapper', {
      jobId: job.id,
      status: job.status,
      hasContent: hasGeneratedCV,
      hasLegacyCallbacks: {
        pdf: !!onDownloadPDF,
        docx: !!onDownloadDOCX
      }
    });

    // Warn about deprecated usage
    if (onDownloadPDF || onDownloadDOCX) {
      console.warn(
        '[LEGACY-CV-DISPLAY] onDownloadPDF and onDownloadDOCX props are deprecated. ' +
        'Use the new GeneratedCVDisplay component from generated-cv-display module ' +
        'for enhanced export functionality.'
      );
    }
  }

  // Render the new modular component
  return (
    <div className={`legacy-generated-cv-display ${className}`}>
      <NewGeneratedCVDisplay {...newComponentProps} />

      {/* Legacy compatibility notice (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-300 font-medium">Legacy Component</p>
              <p className="text-yellow-400 mt-1">
                You're using the legacy GeneratedCVDisplay wrapper.
                Consider migrating to the new modular system for enhanced features:
              </p>
              <ul className="text-yellow-400 mt-2 text-xs space-y-1">
                <li>• Real-time editing capabilities</li>
                <li>• Advanced template switching</li>
                <li>• Enhanced export options</li>
                <li>• Version control and history</li>
                <li>• Responsive preview modes</li>
              </ul>
              <p className="text-yellow-400 mt-2 text-xs">
                Import from: <code className="bg-yellow-500/20 px-1 rounded">
                  '@cvplus/cv-processing/generated-cv-display'
                </code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export type for backward compatibility
export type { GeneratedCVDisplayProps };

// Component metadata
export const LEGACY_COMPONENT_INFO = {
  name: 'GeneratedCVDisplay (Legacy)',
  version: '1.0.0',
  deprecated: false, // Set to true when ready to deprecate
  replacement: '@cvplus/cv-processing/generated-cv-display',
  migration: {
    guide: 'Replace with new GeneratedCVDisplay from generated-cv-display module',
    breaking: false,
    effort: 'minimal'
  }
} as const;