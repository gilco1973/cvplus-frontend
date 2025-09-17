/**
 * SplitLayout Component
 *
 * Resizable split-screen layout for editor and preview panels
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SplitLayoutProps } from './types';

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  editorPanel,
  previewPanel,
  isResizable = true
}) => {
  const [splitPosition, setSplitPosition] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef(0);
  const startSplitRef = useRef(50);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isResizable) return;

    e.preventDefault();
    setIsResizing(true);
    startPositionRef.current = e.clientX;
    startSplitRef.current = splitPosition;
  }, [isResizable, splitPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    e.preventDefault();
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const deltaX = e.clientX - startPositionRef.current;
    const deltaPercent = (deltaX / containerWidth) * 100;

    const newSplit = Math.max(20, Math.min(80, startSplitRef.current + deltaPercent));
    setSplitPosition(newSplit);
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-hidden bg-gray-100"
    >
      {/* Editor Panel */}
      <div
        className="bg-white border-r border-gray-300 flex flex-col"
        style={{ width: `${splitPosition}%` }}
      >
        {editorPanel}
      </div>

      {/* Resize Handle */}
      {isResizable && (
        <div
          className={`
            relative w-1 bg-gray-300 cursor-col-resize flex-shrink-0
            hover:bg-blue-400 transition-colors
            ${isResizing ? 'bg-blue-500' : ''}
          `}
          onMouseDown={handleMouseDown}
        >
          {/* Resize indicator */}
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-8 bg-gray-400 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Preview Panel */}
      <div
        className="bg-gray-50 flex flex-col overflow-hidden"
        style={{ width: `${100 - splitPosition - (isResizable ? 0.1 : 0)}%` }}
      >
        {previewPanel}
      </div>
    </div>
  );
};