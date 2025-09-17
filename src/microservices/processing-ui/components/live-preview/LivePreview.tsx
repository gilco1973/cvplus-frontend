/**
 * LivePreview Component
 *
 * Main orchestrator for real-time CV preview and editing
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Settings, Maximize2, BarChart3, Eye, EyeOff } from 'lucide-react';
import { ViewportControls } from './ViewportControls';
import { PreviewPanel } from './PreviewPanel';
import { EditorPanel } from './EditorPanel';
import { SplitLayout } from './SplitLayout';
import { TemplateComparison } from './TemplateComparison';
import {
  LivePreviewProps,
  LivePreviewState,
  ViewportMode,
  ZoomLevel,
  PreviewMode,
  ViewportConfig,
  PerformanceMetrics
} from './types';

const INITIAL_STATE: LivePreviewState = {
  viewportMode: 'desktop',
  previewMode: 'split',
  zoomLevel: 75,
  orientation: 'portrait',
  isFullscreen: false,
  showMetrics: false,
  performanceMetrics: {
    renderTime: 0,
    updateLatency: 0,
    memoryUsage: 0,
    lastUpdate: new Date()
  }
};

export const LivePreview: React.FC<LivePreviewProps> = ({
  cvData: initialCvData,
  template: initialTemplate,
  selectedFeatures = {},
  onDataChange,
  onTemplateChange,
  className = ''
}) => {
  const [state, setState] = useState<LivePreviewState>(INITIAL_STATE);
  const [cvData, setCvData] = useState(initialCvData || {});
  const [currentTemplate, setCurrentTemplate] = useState(initialTemplate);
  const [showTemplateComparison, setShowTemplateComparison] = useState(false);

  // Performance monitoring
  const [updateStartTime, setUpdateStartTime] = useState<number>(0);

  const viewportConfig: ViewportConfig = useMemo(() => ({
    mode: state.viewportMode,
    width: getViewportDimensions(state.viewportMode).width,
    height: getViewportDimensions(state.viewportMode).height,
    orientation: state.orientation
  }), [state.viewportMode, state.orientation]);

  // Update performance metrics
  useEffect(() => {
    if (updateStartTime > 0) {
      const renderTime = performance.now() - updateStartTime;
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderTime,
          lastUpdate: new Date()
        }
      }));
      setUpdateStartTime(0);
    }
  }, [cvData, currentTemplate, updateStartTime]);

  const handleViewportModeChange = useCallback((mode: ViewportMode) => {
    setState(prev => ({ ...prev, viewportMode: mode }));
  }, []);

  const handleZoomChange = useCallback((zoomLevel: ZoomLevel) => {
    setState(prev => ({ ...prev, zoomLevel }));
  }, []);

  const handleOrientationToggle = useCallback(() => {
    setState(prev => ({
      ...prev,
      orientation: prev.orientation === 'portrait' ? 'landscape' : 'portrait'
    }));
  }, []);

  const handlePreviewModeChange = useCallback((mode: PreviewMode) => {
    setState(prev => ({ ...prev, previewMode: mode }));
  }, []);

  const handleDataChange = useCallback((newData: any) => {
    setUpdateStartTime(performance.now());
    setCvData(newData);
    onDataChange?.(newData);
  }, [onDataChange]);

  const handleTemplateSelect = useCallback((template: any) => {
    setCurrentTemplate(template);
    onTemplateChange?.(template);
    setShowTemplateComparison(false);
  }, [onTemplateChange]);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  }, []);

  const toggleMetrics = useCallback(() => {
    setState(prev => ({ ...prev, showMetrics: !prev.showMetrics }));
  }, []);

  function getViewportDimensions(mode: ViewportMode) {
    switch (mode) {
      case 'desktop': return { width: 1920, height: 1080 };
      case 'tablet': return { width: 768, height: 1024 };
      case 'mobile': return { width: 375, height: 812 };
      case 'print': return { width: 794, height: 1123 };
      default: return { width: 1920, height: 1080 };
    }
  }

  const renderModeControls = () => (
    <div className="flex items-center space-x-2">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handlePreviewModeChange('split')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            state.previewMode === 'split' ? 'bg-white shadow' : ''
          }`}
        >
          Split
        </button>
        <button
          onClick={() => handlePreviewModeChange('preview-only')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            state.previewMode === 'preview-only' ? 'bg-white shadow' : ''
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => handlePreviewModeChange('editor-only')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            state.previewMode === 'editor-only' ? 'bg-white shadow' : ''
          }`}
        >
          Editor
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      <button
        onClick={() => setShowTemplateComparison(!showTemplateComparison)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        title="Template Settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      <button
        onClick={toggleFullscreen}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        title="Fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <button
        onClick={toggleMetrics}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
        title="Performance Metrics"
      >
        <BarChart3 className="w-4 h-4" />
      </button>
    </div>
  );

  const renderPerformanceMetrics = () => {
    if (!state.showMetrics) return null;

    const { performanceMetrics } = state;
    return (
      <div className="absolute top-16 right-4 bg-black bg-opacity-75 text-white text-xs p-3 rounded-lg z-50">
        <div>Render: {performanceMetrics.renderTime.toFixed(1)}ms</div>
        <div>Updated: {performanceMetrics.lastUpdate.toLocaleTimeString()}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (showTemplateComparison) {
      return (
        <div className="p-6">
          <TemplateComparison
            cvData={cvData}
            currentTemplate={currentTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>
      );
    }

    const editorPanel = (
      <EditorPanel
        cvData={cvData}
        onDataChange={handleDataChange}
      />
    );

    const previewPanel = (
      <div className="flex flex-col h-full">
        <ViewportControls
          currentMode={state.viewportMode}
          onModeChange={handleViewportModeChange}
          zoomLevel={state.zoomLevel}
          onZoomChange={handleZoomChange}
          orientation={state.orientation}
          onOrientationToggle={handleOrientationToggle}
        />
        <div className="flex-1 overflow-auto">
          <PreviewPanel
            cvData={cvData}
            template={currentTemplate}
            viewportConfig={viewportConfig}
            zoomLevel={state.zoomLevel}
          />
        </div>
      </div>
    );

    switch (state.previewMode) {
      case 'editor-only':
        return editorPanel;
      case 'preview-only':
        return previewPanel;
      case 'split':
      default:
        return (
          <SplitLayout
            editorPanel={editorPanel}
            previewPanel={previewPanel}
            isResizable={true}
          />
        );
    }
  };

  return (
    <div
      className={`
        live-preview-container
        ${state.isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative'}
        ${className}
      `}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          {currentTemplate && (
            <div className="text-sm text-gray-600">
              Template: {currentTemplate.name}
            </div>
          )}
        </div>
        {renderModeControls()}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
        {renderPerformanceMetrics()}
      </div>
    </div>
  );
};