/**
 * Draggable Monitor Icon
 * 
 * A simple draggable monitor icon for development mode.
 * The debug window has been removed as requested.
 */

import React, { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';

export const SubscriptionMonitor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Dragging functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 60; // button width
    const maxY = window.innerHeight - 60; // button height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  // Initialize position to bottom-right corner
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      setPosition({
        x: window.innerWidth - 140, // offset from right edge
        y: window.innerHeight - 140  // offset from bottom edge
      });
    }
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Draggable Monitor Icon */}
      <div 
        className="fixed z-30"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <button
          onMouseDown={handleMouseDown}
          className={`bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors ${
            isDragging ? 'scale-110' : ''
          }`}
          title="Draggable Monitor Icon (Debug Window Removed)"
        >
          <Monitor className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default SubscriptionMonitor;