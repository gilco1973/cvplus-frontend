/**
 * ViewportControls Component
 *
 * Controls for viewport simulation and zoom management
 */

import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Eye,
  BarChart3
} from 'lucide-react';
import { ViewportControlsProps, ViewportMode, ZoomLevel } from './types';

const ZOOM_LEVELS: ZoomLevel[] = [25, 50, 75, 100, 125, 150, 200];

const VIEWPORT_CONFIGS = {
  desktop: { icon: Monitor, label: 'Desktop', width: 1920, height: 1080 },
  tablet: { icon: Tablet, label: 'Tablet', width: 768, height: 1024 },
  mobile: { icon: Smartphone, label: 'Mobile', width: 375, height: 812 },
  print: { icon: Printer, label: 'Print', width: 794, height: 1123 }
};

export const ViewportControls: React.FC<ViewportControlsProps> = ({
  currentMode,
  onModeChange,
  zoomLevel,
  onZoomChange,
  orientation,
  onOrientationToggle
}) => {
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      onZoomChange(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoomLevel);
    if (currentIndex > 0) {
      onZoomChange(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const canZoomIn = zoomLevel < 200;
  const canZoomOut = zoomLevel > 25;

  return (
    <div className="flex items-center space-x-4 p-3 bg-white border-b border-gray-200">
      {/* Viewport Mode Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Device:</span>
        <div className="flex space-x-1">
          {(Object.entries(VIEWPORT_CONFIGS) as Array<[ViewportMode, typeof VIEWPORT_CONFIGS[ViewportMode]]>).map(
            ([mode, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={mode}
                  onClick={() => onModeChange(mode)}
                  className={`
                    p-2 rounded-md transition-colors
                    ${currentMode === mode
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  title={config.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Zoom:</span>
        <button
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          className="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <select
          value={zoomLevel}
          onChange={(e) => onZoomChange(Number(e.target.value) as ZoomLevel)}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ZOOM_LEVELS.map(level => (
            <option key={level} value={level}>{level}%</option>
          ))}
        </select>

        <button
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          className="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-300" />

      {/* Orientation Toggle (for tablet/mobile) */}
      {(currentMode === 'tablet' || currentMode === 'mobile') && (
        <>
          <button
            onClick={onOrientationToggle}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            title={`Switch to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="capitalize">{orientation}</span>
          </button>
          <div className="w-px h-6 bg-gray-300" />
        </>
      )}

      {/* Device Info */}
      <div className="text-xs text-gray-500">
        {VIEWPORT_CONFIGS[currentMode].width} × {VIEWPORT_CONFIGS[currentMode].height}
      </div>
    </div>
  );
};