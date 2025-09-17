/**
 * Lightbox Modal Component
 * Image lightbox for portfolio gallery
 */

import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { LightboxModalProps } from './types';

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  project,
  imageIndex,
  onClose,
  onNavigate
}) => {
  if (!isOpen || !project) return null;

  const currentImage = project.images[imageIndex];
  const hasMultipleImages = project.images.length > 1;

  return (
    <div>
      <div 
        className="animate-fade-in fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('prev');
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('next');
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-colors z-60"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Image Container */}
        <div 
          className="animate-fade-in max-w-7xl max-h-full mx-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
              <h3 className="text-white text-xl font-semibold mb-2">
                {project.title}
              </h3>
              {currentImage.caption && (
                <p className="text-white text-sm opacity-90">
                  {currentImage.caption}
                </p>
              )}
              {hasMultipleImages && (
                <div className="mt-2 text-white text-sm opacity-75">
                  {imageIndex + 1} of {project.images.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-50 rounded-lg p-2">
            {project.images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  // Set image index directly
                  const event = new CustomEvent('lightbox-navigate', { detail: idx });
                  window.dispatchEvent(event);
                }}
                className={`w-12 h-8 rounded overflow-hidden border-2 transition-all ${
                  idx === imageIndex ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};