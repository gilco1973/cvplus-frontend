/**
 * LivePreview Component - T066 Implementation
 *
 * Real-time CV preview with split-screen editing, viewport simulation,
 * and template comparison. Modular architecture under 200 lines.
 */

import React, { useState, useCallback, useMemo } from 'react';
import type {
  LivePreviewProps, ViewportMode, ZoomLevel, PreviewMode
} from './LivePreview.types';
import { LivePreviewViewportControls } from './LivePreview.ViewportControls';
import { LivePreviewPanel } from './LivePreview.PreviewPanel';
import { LivePreviewEditor } from './LivePreview.EditorPanel';

export const LivePreview: React.FC<LivePreviewProps> = ({
  cvData: initialCvData,
  template: initialTemplate,
  selectedFeatures = {},
  onDataChange,
  onTemplateChange,
  className = ''
}) => {
  // State management
  const [cvData, setCvData] = useState(initialCvData || {});
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(75);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Viewport configuration
  const viewportConfig = useMemo(() => {
    const dimensions = {
      desktop: { width: 1920, height: 1080 },
      tablet: { width: 768, height: 1024 },
      mobile: { width: 375, height: 812 },
      print: { width: 794, height: 1123 }
    };
    const { width, height } = dimensions[viewportMode];
    return {
      mode: viewportMode,
      width: orientation === 'landscape' ? height : width,
      height: orientation === 'landscape' ? width : height,
      orientation
    };
  }, [viewportMode, orientation]);

  // Event handlers
  const handleDataChange = useCallback((newData: any) => {
    setCvData(newData);
    onDataChange?.(newData);
  }, [onDataChange]);

  const handleViewportChange = useCallback((mode: ViewportMode) => {
    setViewportMode(mode);
  }, []);

  const handleZoomChange = useCallback((zoom: ZoomLevel) => {
    setZoomLevel(zoom);
  }, []);

  const handleOrientationToggle = useCallback(() => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  // Render mode controls
  const renderModeControls = () => (
    <div className="flex space-x-2">
      {['split', 'preview-only', 'editor-only'].map(mode => (
        <button
          key={mode}
          onClick={() => setPreviewMode(mode as PreviewMode)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            previewMode === mode
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {mode.replace('-', ' ')}
        </button>
      ))}
    </div>
  );

  // Render editor panel
  const renderEditor = () => (
    <LivePreviewEditor
      cvData={cvData}
      onDataChange={handleDataChange}
    />
  );

  // Render preview with controls
  const renderPreviewWithControls = () => (
    <div className="flex flex-col h-full">
      <LivePreviewViewportControls
        viewportMode={viewportMode}
        onViewportChange={handleViewportChange}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
        orientation={orientation}
        onOrientationToggle={handleOrientationToggle}
      />
      <LivePreviewPanel
        cvData={cvData}
        template={initialTemplate}
        viewportConfig={viewportConfig}
        zoomLevel={zoomLevel}
      />
    </div>
  );

  // Main content based on preview mode
  const renderMainContent = () => {
    switch (previewMode) {
      case 'split':
        return (
          <div className="flex h-full">
            <div className="w-1/2 border-r">{renderEditor()}</div>
            <div className="w-1/2">{renderPreviewWithControls()}</div>
          </div>
        );
      case 'preview-only':
        return renderPreviewWithControls();
      case 'editor-only':
        return renderEditor();
      default:
        return renderPreviewWithControls();
    }
  };

  return (
    <div className={`live-preview h-full flex flex-col bg-white ${className}`}>
      {/* Header with title and mode controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          {initialTemplate && (
            <div className="text-sm text-gray-600">
              Template: {initialTemplate.name || 'Default'}
            </div>
          )}
        </div>
        {renderModeControls()}
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
};

// Re-export types and helper components
export type { LivePreviewProps, ViewportMode, ZoomLevel, PreviewMode } from './LivePreview.types';
export { LivePreviewViewportControls } from './LivePreview.ViewportControls';
export { LivePreviewPanel } from './LivePreview.PreviewPanel';
export { LivePreviewEditor } from './LivePreview.EditorPanel';

export default LivePreview;