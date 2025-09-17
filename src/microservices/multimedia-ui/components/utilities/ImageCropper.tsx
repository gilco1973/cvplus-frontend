/**
 * ImageCropper Component
 * 
 * Advanced image cropping and editing interface with preview functionality.
 * Features aspect ratio presets, crop area adjustment, and image optimization.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Crop,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Maximize,
  Smartphone,
  Monitor,
  Check,
  X,
  RefreshCw
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageFile: File;
  onCropComplete: (croppedFile: File, cropData: CropArea) => void;
  onCancel: () => void;
  aspectRatios?: { label: string; value: number | null }[];
  defaultAspectRatio?: number | null;
  maxWidth?: number;
  maxHeight?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
  outputQuality?: number;
  showGrid?: boolean;
  allowRotation?: boolean;
  allowZoom?: boolean;
  className?: string;
}

const DEFAULT_ASPECT_RATIOS = [
  { label: 'Free', value: null },
  { label: 'Square (1:1)', value: 1 },
  { label: 'Portrait (3:4)', value: 3/4 },
  { label: 'Landscape (4:3)', value: 4/3 },
  { label: 'Wide (16:9)', value: 16/9 },
  { label: 'Mobile (9:16)', value: 9/16 },
  { label: 'Profile (1:1)', value: 1 }
];

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  onCropComplete,
  onCancel,
  aspectRatios = DEFAULT_ASPECT_RATIOS,
  defaultAspectRatio = null,
  maxWidth = 1920,
  maxHeight = 1080,
  outputFormat = 'jpeg',
  outputQuality = 0.9,
  showGrid = true,
  allowRotation = true,
  allowZoom = true,
  className
}) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number | null>(defaultAspectRatio);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Load image and create preview URL
  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Initialize crop area when image loads
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && cropContainerRef.current) {
      const img = imageRef.current;
      const container = cropContainerRef.current;
      
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      
      // Set initial crop area (centered, 80% of image)
      const containerRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      const cropWidth = imgRect.width * 0.8;
      const cropHeight = selectedAspectRatio 
        ? cropWidth / selectedAspectRatio 
        : imgRect.height * 0.8;
      
      setCropArea({
        x: (imgRect.width - cropWidth) / 2,
        y: (imgRect.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight
      });
    }
  }, [selectedAspectRatio]);

  // Handle crop area dragging
  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'move' | 'resize', handle?: string) => {
    e.preventDefault();
    
    if (type === 'move') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
    } else if (type === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle || '');
    }
  }, [cropArea]);

  // Handle mouse move for dragging and resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!imageRef.current || !cropContainerRef.current) return;
    
    const img = imageRef.current;
    const imgRect = img.getBoundingClientRect();
    
    if (isDragging) {
      const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imgRect.width - cropArea.width));
      const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imgRect.height - cropArea.height));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    } else if (isResizing && resizeHandle) {
      const containerRect = cropContainerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - imgRect.left;
      const relativeY = e.clientY - imgRect.top;
      
      let newWidth = cropArea.width;
      let newHeight = cropArea.height;
      let newX = cropArea.x;
      let newY = cropArea.y;
      
      // Handle different resize handles
      if (resizeHandle.includes('right')) {
        newWidth = Math.min(relativeX - cropArea.x, imgRect.width - cropArea.x);
      }
      if (resizeHandle.includes('left')) {
        newWidth = cropArea.width + (cropArea.x - relativeX);
        newX = Math.max(0, relativeX);
      }
      if (resizeHandle.includes('bottom')) {
        newHeight = Math.min(relativeY - cropArea.y, imgRect.height - cropArea.y);
      }
      if (resizeHandle.includes('top')) {
        newHeight = cropArea.height + (cropArea.y - relativeY);
        newY = Math.max(0, relativeY);
      }
      
      // Apply aspect ratio constraint if selected
      if (selectedAspectRatio && selectedAspectRatio > 0) {
        if (resizeHandle.includes('right') || resizeHandle.includes('left')) {
          newHeight = newWidth / selectedAspectRatio;
        } else {
          newWidth = newHeight * selectedAspectRatio;
        }
      }
      
      // Ensure minimum size
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);
      
      // Ensure crop area stays within image bounds
      newX = Math.max(0, Math.min(newX, imgRect.width - newWidth));
      newY = Math.max(0, Math.min(newY, imgRect.height - newHeight));
      
      setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
    }
  }, [isDragging, isResizing, resizeHandle, dragStart, cropArea, selectedAspectRatio]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle aspect ratio change
  const handleAspectRatioChange = useCallback((ratio: number | null) => {
    setSelectedAspectRatio(ratio);
    
    if (ratio && ratio > 0) {
      setCropArea(prev => ({
        ...prev,
        height: prev.width / ratio
      }));
    }
  }, []);

  // Handle rotation
  const handleRotation = useCallback((degrees: number) => {
    setRotation(prev => (prev + degrees) % 360);
  }, []);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  // Reset all adjustments
  const handleReset = useCallback(() => {
    setRotation(0);
    setZoom(1);
    setSelectedAspectRatio(defaultAspectRatio);
    handleImageLoad(); // Reinitialize crop area
  }, [defaultAspectRatio, handleImageLoad]);

  // Process and crop the image
  const handleCropConfirm = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Calculate scale factors
      const imgRect = img.getBoundingClientRect();
      const scaleX = img.naturalWidth / imgRect.width;
      const scaleY = img.naturalHeight / imgRect.height;
      
      // Calculate actual crop coordinates on the original image
      const actualCrop = {
        x: cropArea.x * scaleX,
        y: cropArea.y * scaleY,
        width: cropArea.width * scaleX,
        height: cropArea.height * scaleY
      };
      
      // Set canvas size
      const outputWidth = Math.min(actualCrop.width, maxWidth);
      const outputHeight = Math.min(actualCrop.height, maxHeight);
      
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      
      // Apply transformations
      ctx.save();
      
      // Handle rotation if needed
      if (rotation !== 0) {
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-outputWidth / 2, -outputHeight / 2);
      }
      
      // Draw the cropped image
      ctx.drawImage(
        img,
        actualCrop.x,
        actualCrop.y,
        actualCrop.width,
        actualCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
      );
      
      ctx.restore();
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], `cropped_${imageFile.name}`, {
              type: `image/${outputFormat}`,
              lastModified: Date.now()
            });
            
            onCropComplete(croppedFile, actualCrop);
          }
        },
        `image/${outputFormat}`,
        outputQuality
      );
      
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, cropArea, rotation, maxWidth, maxHeight, outputFormat, outputQuality, onCropComplete]);

  return (
    <div className={cn("bg-gray-900 rounded-lg border border-gray-700 overflow-hidden", className)}>
      {/* Header with controls */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-200">Crop Image</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              title="Reset all adjustments"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Aspect ratio controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => handleAspectRatioChange(ratio.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded transition-colors",
                selectedAspectRatio === ratio.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              {ratio.label}
            </button>
          ))}
        </div>
        
        {/* Transform controls */}
        <div className="flex items-center gap-4">
          {allowRotation && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRotation(-90)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Rotate left"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRotation(90)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Rotate right"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {allowZoom && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-400 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Crop area */}
      <div className="p-4">
        <div 
          ref={cropContainerRef}
          className="relative bg-gray-800 rounded-lg overflow-hidden"
          style={{ maxWidth: '100%', maxHeight: '500px' }}
        >
          {imageUrl && (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                onLoad={handleImageLoad}
                className="max-w-full max-h-full block mx-auto"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center'
                }}
                alt="Image to crop"
              />
              
              {/* Crop overlay */}
              {cropArea.width > 0 && (
                <div
                  className="absolute border-2 border-blue-500 cursor-move"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                >
                  {/* Grid overlay */}
                  {showGrid && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Vertical lines */}
                      <div className="absolute left-1/3 top-0 bottom-0 w-px bg-blue-300 opacity-50" />
                      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-blue-300 opacity-50" />
                      {/* Horizontal lines */}
                      <div className="absolute top-1/3 left-0 right-0 h-px bg-blue-300 opacity-50" />
                      <div className="absolute top-2/3 left-0 right-0 h-px bg-blue-300 opacity-50" />
                    </div>
                  )}
                  
                  {/* Resize handles */}
                  {[
                    'top-left', 'top-right', 'bottom-left', 'bottom-right',
                    'top', 'right', 'bottom', 'left'
                  ].map((handle) => {
                    const isCorner = handle.includes('-');
                    const baseClasses = "absolute bg-blue-500 border border-white";
                    const sizeClasses = isCorner ? "w-3 h-3" : "w-2 h-2";
                    
                    let positionClasses = "";
                    if (handle.includes('top')) positionClasses += "-top-1.5 ";
                    if (handle.includes('bottom')) positionClasses += "-bottom-1.5 ";
                    if (handle.includes('left')) positionClasses += "-left-1.5 ";
                    if (handle.includes('right')) positionClasses += "-right-1.5 ";
                    if (handle === 'top' || handle === 'bottom') positionClasses += "left-1/2 -ml-1 ";
                    if (handle === 'left' || handle === 'right') positionClasses += "top-1/2 -mt-1 ";
                    
                    let cursor = "cursor-nwse-resize";
                    if (handle === 'top' || handle === 'bottom') cursor = "cursor-ns-resize";
                    if (handle === 'left' || handle === 'right') cursor = "cursor-ew-resize";
                    if (handle === 'top-right' || handle === 'bottom-left') cursor = "cursor-nesw-resize";
                    
                    return (
                      <div
                        key={handle}
                        className={cn(baseClasses, sizeClasses, positionClasses, cursor)}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleMouseDown(e, 'resize', handle);
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Footer with action buttons */}
      <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Crop: {Math.round(cropArea.width)}×{Math.round(cropArea.height)} px
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 inline mr-2" />
            Cancel
          </button>
          
          <button
            onClick={handleCropConfirm}
            disabled={isProcessing}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 inline mr-2" />
            )}
            {isProcessing ? 'Processing...' : 'Crop Image'}
          </button>
        </div>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;