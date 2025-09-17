/**
 * LivePreview ViewportControls Component
 *
 * Controls for viewport simulation and zoom management
 */

import React from 'react';
import {
  Monitor, Tablet, Smartphone, Printer, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';
import { ViewportMode, ZoomLevel } from './LivePreview.types';

interface ViewportControlsProps {
  viewportMode: ViewportMode;
  onViewportChange: (mode: ViewportMode) => void;
  zoomLevel: ZoomLevel;
  onZoomChange: (zoom: ZoomLevel) => void;
  orientation: 'portrait' | 'landscape';
  onOrientationToggle: () => void;
}

export const LivePreviewViewportControls: React.FC<ViewportControlsProps> = ({
  viewportMode,
  onViewportChange,
  zoomLevel,
  onZoomChange,
  orientation,
  onOrientationToggle
}) => {
  return (
    <div className="flex items-center space-x-4 p-3 bg-white border-b border-gray-200">
      <div className="flex space-x-1">
        {[
          { mode: 'desktop', icon: Monitor, label: 'Desktop' },
          { mode: 'tablet', icon: Tablet, label: 'Tablet' },
          { mode: 'mobile', icon: Smartphone, label: 'Mobile' },
          { mode: 'print', icon: Printer, label: 'Print' }
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => onViewportChange(mode as ViewportMode)}
            className={`p-2 rounded-md transition-colors ${
              viewportMode === mode
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-300" />

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onZoomChange(Math.max(25, zoomLevel - 25) as ZoomLevel)}
          disabled={zoomLevel <= 25}
          className="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <select
          value={zoomLevel}
          onChange={(e) => onZoomChange(Number(e.target.value) as ZoomLevel)}
          className="px-2 py-1 text-sm border rounded"
        >
          {[25, 50, 75, 100, 125, 150, 200].map(level => (
            <option key={level} value={level}>{level}%</option>
          ))}
        </select>
        <button
          onClick={() => onZoomChange(Math.min(200, zoomLevel + 25) as ZoomLevel)}
          disabled={zoomLevel >= 200}
          className="p-1 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {(viewportMode === 'tablet' || viewportMode === 'mobile') && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <button
            onClick={onOrientationToggle}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="capitalize">{orientation}</span>
          </button>
        </>
      )}
    </div>
  );
};