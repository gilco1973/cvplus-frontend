import React, { useEffect, useRef } from 'react';
import { Download, FileText, Globe } from 'lucide-react';
import type { Job } from '@cvplus/core/types';
import { initializeReactComponents } from '../utils/componentRenderer';

interface GeneratedCVDisplayProps {
  job: Job;
  onDownloadPDF?: () => void;
  onDownloadDOCX?: () => void;
  className?: string;
}

export const GeneratedCVDisplay: React.FC<GeneratedCVDisplayProps> = ({
  job,
  onDownloadPDF,
  onDownloadDOCX,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Try multiple sources for CV content
  const generatedHTML = job.generatedCV?.html;
  const hasHtmlUrl = job.generatedCV?.htmlUrl;
  const hasFiles = job.generatedCV?.pdfUrl || job.generatedCV?.docxUrl;
  
  // Debug info logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn('🖥️ [CV-DISPLAY] Debug info:', {
      hasGeneratedCV: !!job.generatedCV,
      hasHTML: !!generatedHTML,
      hasHtmlUrl: !!hasHtmlUrl,
      hasFiles: !!hasFiles,
      jobStatus: job.status,
      htmlLength: generatedHTML?.length || 0,
      htmlUrl: hasHtmlUrl,
      generatedCVData: job.generatedCV,
      allJobKeys: Object.keys(job),
      allKeys: job.generatedCV ? Object.keys(job.generatedCV) : []
    });
  }

  // Initialize React components after HTML is rendered
  useEffect(() => {
    if (generatedHTML && contentRef.current) {
      // HTML rendered, initializing React components
      
      // Small delay to ensure DOM is fully updated
      const timer = setTimeout(async () => {
        // Initializing React components with enhanced renderer
        
        try {
          initializeReactComponents();
          // Successfully initialized React components
        } catch (error) {
          console.error('❌ [CV-DISPLAY] Failed to initialize React components:', error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [generatedHTML]);
  
  if (!generatedHTML && !hasHtmlUrl && !hasFiles) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Generated CV Found</h3>
          <div className="text-sm space-y-2">
            <p>Job Status: {job.status}</p>
            {job.status === 'completed' && (
              <p className="text-yellow-400">CV was generated but content is not available for display.</p>
            )}
            {job.status !== 'completed' && (
              <p>The CV generation may still be in progress.</p>
            )}
            {hasHtmlUrl && (
              <a 
                href={hasHtmlUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-cyan-400 hover:text-cyan-300 underline"
              >
                View CV Online
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // If we have an HTML URL but no inline HTML, show it with a fetch option
  if (!generatedHTML && hasHtmlUrl) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400">
          <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">CV Generated Successfully!</h3>
          <p className="text-sm mb-4">
            Your CV has been generated and is ready. Click below to view it.
          </p>
          <div className="space-y-3">
            <a 
              href={hasHtmlUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              View Your CV Online
            </a>
            <div className="text-xs text-gray-500">
              CV URL: {hasHtmlUrl.split('?')[0].split('/').pop()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* CV Actions Bar */}
      <div className="bg-gray-800 rounded-t-lg border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-200">Generated CV</span>
          {job.generatedCV?.template && (
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
              {job.generatedCV.template.charAt(0).toUpperCase() + job.generatedCV.template.slice(1)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Download Actions */}
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all text-sm"
              title="Download PDF"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
          )}
          {onDownloadDOCX && (
            <button
              onClick={onDownloadDOCX}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all text-sm"
              title="Download DOCX"
            >
              <Download className="w-4 h-4" />
              DOCX
            </button>
          )}
          {job.generatedCV?.htmlUrl && (
            <a
              href={job.generatedCV.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-all text-sm"
              title="View Public Profile"
            >
              <Globe className="w-4 h-4" />
              Public
            </a>
          )}
        </div>
      </div>

      {/* Generated CV Content */}
      <div className="bg-white rounded-b-lg shadow-xl overflow-hidden">
        <div 
          ref={contentRef}
          className="generated-cv-content p-8"
          style={{ 
            minHeight: '800px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
          dangerouslySetInnerHTML={{ __html: generatedHTML }}
        />
      </div>

      {/* Features Applied Banner */}
      {job.generatedCV?.features && job.generatedCV.features.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-2">Applied Features:</h4>
          <div className="flex flex-wrap gap-2">
            {job.generatedCV.features.map((feature) => (
              <span
                key={feature}
                className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full"
              >
                {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};