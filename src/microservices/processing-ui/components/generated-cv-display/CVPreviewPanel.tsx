/**
 * CV Preview Panel Component
 *
 * Live preview panel with responsive design simulation,
 * print preview, and device mockups.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Printer,
  Maximize,
  Minimize,
  RotateCw,
  Eye,
  Zoom,
  Download
} from 'lucide-react';

import type { Job } from '../../types/job';
import type { CVTemplate } from './types';

interface CVPreviewPanelProps {
  job: Job;
  content: any;
  template?: CVTemplate;
  className?: string;
}

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<any>;
  scale?: number;
}

const viewports: ViewportConfig[] = [
  { name: 'Desktop', width: 1200, height: 800, icon: Monitor },
  { name: 'Tablet', width: 768, height: 1024, icon: Tablet, scale: 0.7 },
  { name: 'Mobile', width: 375, height: 667, icon: Smartphone, scale: 0.8 },
  { name: 'Print', width: 794, height: 1123, icon: Printer, scale: 0.6 } // A4 at 96 DPI
];

/**
 * CV Preview Panel Component
 */
export const CVPreviewPanel: React.FC<CVPreviewPanelProps> = ({
  job,
  content,
  template,
  className = ''
}) => {
  const [activeViewport, setActiveViewport] = useState<string>('Desktop');
  const [zoom, setZoom] = useState<number>(1);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [fullscreen, setFullscreen] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Get current viewport config
  const currentViewport = viewports.find(v => v.name === activeViewport) || viewports[0];

  // Get HTML content
  const getHTMLContent = () => {
    if (content?.html) return content.html;
    if (job.generatedCV?.html) return job.generatedCV.html;
    if (job.generatedCV?.content?.html) return job.generatedCV.content.html;
    return null;
  };

  const htmlContent = getHTMLContent();

  // Calculate viewport dimensions
  const getViewportDimensions = useCallback(() => {
    let { width, height } = currentViewport;

    if (orientation === 'landscape' && activeViewport !== 'Print') {
      [width, height] = [height, width];
    }

    const scale = (currentViewport.scale || 1) * zoom;

    return { width, height, scale };
  }, [currentViewport, orientation, activeViewport, zoom]);

  // Handle viewport change
  const handleViewportChange = useCallback((viewportName: string) => {
    setActiveViewport(viewportName);
    // Reset orientation for print mode
    if (viewportName === 'Print') {
      setOrientation('portrait');
    }
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!fullscreen) {
      previewRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setFullscreen(!fullscreen);
  }, [fullscreen]);

  // Export preview
  const handleExportPreview = useCallback(() => {
    if (!previewRef.current) return;

    // Create canvas and capture preview
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // This is a simplified implementation
    // In a real app, you'd use html2canvas or similar
    console.log('Export preview functionality would be implemented here');
  }, []);

  const { width, height, scale } = getViewportDimensions();

  if (!htmlContent) {
    return (
      <div className={`cv-preview-panel ${className}`}>
        <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-center">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No content to preview</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`cv-preview-panel ${className}`}>
      {/* Preview controls */}
      <div className="bg-gray-800 border border-gray-700 rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          {/* Viewport selector */}
          <div className="flex items-center space-x-2">
            {viewports.map((viewport) => {
              const Icon = viewport.icon;
              const isActive = activeViewport === viewport.name;

              return (
                <button
                  key={viewport.name}
                  onClick={() => handleViewportChange(viewport.name)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }
                  `}
                  title={`Preview on ${viewport.name}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{viewport.name}</span>
                </button>
              );
            })}
          </div>

          {/* Preview controls */}
          <div className="flex items-center space-x-2">
            {/* Orientation toggle (not for print) */}
            {activeViewport !== 'Print' && (
              <button
                onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle orientation"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            {/* Zoom controls */}
            <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                disabled={zoom <= 0.25}
                className="p-1 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
              >
                <Minimize className="w-3 h-3" />
              </button>
              <span className="text-xs text-gray-300 px-2 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                disabled={zoom >= 2}
                className="p-1 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
              >
                <Maximize className="w-3 h-3" />
              </button>
            </div>

            {/* Export preview */}
            <button
              onClick={handleExportPreview}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Export preview"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle fullscreen"
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Viewport info */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
          <div>
            Viewport: {width} × {height}px
            {orientation === 'landscape' && ' (Landscape)'}
          </div>
          <div>
            Scale: {Math.round(scale * 100)}%
          </div>
        </div>
      </div>

      {/* Preview container */}
      <div
        ref={previewRef}
        className="cv-preview-container bg-gray-900 border-x border-b border-gray-700 rounded-b-lg overflow-auto"
        style={{
          minHeight: '600px',
          background: fullscreen ? '#000' : undefined
        }}
      >
        <div className="flex items-center justify-center p-8 min-h-full">
          {/* Device mockup */}
          <div
            className="bg-white shadow-2xl overflow-hidden relative"
            style={{
              width: width * scale,
              height: height * scale,
              borderRadius: activeViewport === 'Mobile' ? '25px' : activeViewport === 'Tablet' ? '15px' : '8px',
              border: activeViewport !== 'Desktop' && activeViewport !== 'Print'
                ? '8px solid #1f2937'
                : '1px solid #374151'
            }}
          >
            {/* Device notch (for mobile) */}
            {activeViewport === 'Mobile' && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />
            )}

            {/* Content frame */}
            <div
              className="cv-preview-content w-full h-full overflow-hidden relative"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: width,
                height: height
              }}
            >
              {/* Print page margins indicator */}
              {activeViewport === 'Print' && (
                <div className="absolute inset-0 border-2 border-dashed border-gray-300 pointer-events-none z-10" />
              )}

              {/* CV content */}
              <div
                className="cv-content-frame"
                style={{
                  width: '100%',
                  height: '100%',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: activeViewport === 'Mobile' ? '14px' : '16px',
                  lineHeight: '1.6',
                  color: '#333',
                  padding: activeViewport === 'Print' ? '40px' : '0',
                  overflow: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              {/* Responsive indicator */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-black/75 text-white text-xs px-2 py-1 rounded-full">
                  {activeViewport}
                  {orientation === 'landscape' && ' (Landscape)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview info */}
      <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Current View:</span>
            <div className="text-white font-medium">
              {activeViewport} ({width} × {height})
            </div>
          </div>
          <div>
            <span className="text-gray-400">Orientation:</span>
            <div className="text-white font-medium capitalize">
              {orientation}
            </div>
          </div>
          <div>
            <span className="text-gray-400">Zoom Level:</span>
            <div className="text-white font-medium">
              {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Print-specific info */}
        {activeViewport === 'Print' && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Printer className="w-4 h-4" />
              <span className="text-sm font-medium">Print Preview Mode</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              This preview shows how your CV will appear when printed on A4 paper.
              Page breaks and margins are simulated for accuracy.
            </p>
          </div>
        )}
      </div>

      {/* Responsive design styles */}
      <style jsx>{`
        .cv-preview-content {
          /* Mobile-specific styles */
        }

        .cv-preview-content[data-viewport="Mobile"] {
          font-size: 14px !important;
        }

        .cv-preview-content[data-viewport="Mobile"] h1 {
          font-size: 24px !important;
        }

        .cv-preview-content[data-viewport="Mobile"] h2 {
          font-size: 20px !important;
        }

        .cv-preview-content[data-viewport="Mobile"] .cv-section {
          margin-bottom: 1rem !important;
        }

        /* Print-specific styles */
        .cv-preview-content[data-viewport="Print"] {
          background: white !important;
          color: black !important;
        }

        .cv-preview-content[data-viewport="Print"] .text-cyan-400,
        .cv-preview-content[data-viewport="Print"] .text-blue-400 {
          color: #000 !important;
        }

        .cv-preview-content[data-viewport="Print"] .bg-cyan-500,
        .cv-preview-content[data-viewport="Print"] .bg-blue-500 {
          background: transparent !important;
          border: 1px solid #000 !important;
        }
      `}</style>
    </div>
  );
};