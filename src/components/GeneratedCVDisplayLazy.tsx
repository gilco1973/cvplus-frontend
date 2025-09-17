import React, { useEffect, useRef } from 'react';
import { Download, FileText, Globe } from 'lucide-react';
import type { Job } from '../services/cvService';
import { initializeLazyReactComponents, preloadCriticalComponents } from '../utils/lazyComponentRenderer';

interface GeneratedCVDisplayProps {
  job: Job;
  onDownloadPDF?: () => void;
  onDownloadDOCX?: () => void;
  className?: string;
}

export const GeneratedCVDisplayLazy: React.FC<GeneratedCVDisplayProps> = ({
  job,
  onDownloadPDF,
  onDownloadDOCX,
  className = ''
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  
  // Try multiple sources for CV content
  const generatedHTML = job.generatedCV?.html;
  const hasHtmlUrl = job.generatedCV?.htmlUrl;
  const hasFiles = job.generatedCV?.pdfUrl || job.generatedCV?.docxUrl;
  
  // Debug info logging (development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn('🖥️ [CV-DISPLAY-LAZY] Debug info:', {
      hasGeneratedCV: !!job.generatedCV,
      hasHTML: !!generatedHTML,
      hasHtmlUrl: !!hasHtmlUrl,
      hasFiles: !!hasFiles,
      jobStatus: job.status,
      htmlLength: generatedHTML?.length || 0
    });
  }

  // Initialize React components after HTML is rendered with lazy loading
  useEffect(() => {
    if (generatedHTML && contentRef.current && !hasInitialized.current) {
      // HTML rendered, initializing lazy React components
      hasInitialized.current = true;
      
      // Small delay to ensure DOM is fully updated
      const timer = setTimeout(async () => {
        // Starting lazy component initialization
        
        try {
          // Preload critical components first for better UX
          await preloadCriticalComponents();
          
          // Initialize all components lazily
          initializeLazyReactComponents();
          
          // Successfully initialized lazy React components
        } catch (error) {
          console.error('❌ [CV-DISPLAY-LAZY] Error initializing lazy components:', error);
        }
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [generatedHTML]);

  // No content available
  if (!generatedHTML && !hasHtmlUrl && !hasFiles) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CV Available</h3>
          <p className="text-gray-600">Your CV is still being processed or generated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header with download options */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-gray-900">Generated CV</h3>
          </div>
          <div className="flex items-center space-x-2">
            {job.generatedCV?.pdfUrl && onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-3 h-3 mr-1" />
                PDF
              </button>
            )}
            {job.generatedCV?.docxUrl && onDownloadDOCX && (
              <button
                onClick={onDownloadDOCX}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="w-3 h-3 mr-1" />
                DOCX
              </button>
            )}
            {job.generatedCV?.htmlUrl && (
              <a
                href={job.generatedCV.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Globe className="w-3 h-3 mr-1" />
                View
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="p-4">
        {generatedHTML ? (
          <div 
            ref={contentRef}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: generatedHTML }}
          />
        ) : hasHtmlUrl ? (
          <div className="text-center p-8">
            <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Your CV is available at a separate URL.</p>
            <a
              href={job.generatedCV?.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Globe className="w-4 h-4 mr-2" />
              View CV
            </a>
          </div>
        ) : (
          <div className="text-center p-8">
            <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Your CV files are ready for download.</p>
            <div className="flex justify-center space-x-2">
              {job.generatedCV?.pdfUrl && onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              )}
              {job.generatedCV?.docxUrl && onDownloadDOCX && (
                <button
                  onClick={onDownloadDOCX}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download DOCX
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};