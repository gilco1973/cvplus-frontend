/**
 * CVPreviewSkeleton Component
 * 
 * Provides skeleton loading states for the CV preview page.
 * Displays while CV data is loading to improve perceived performance.
 */

import React, { memo } from 'react';

interface CVPreviewSkeletonProps {
  className?: string;
  showFeatures?: boolean;
}

export const CVPreviewSkeleton: React.FC<CVPreviewSkeletonProps> = memo(({
  className = '',
  showFeatures = true
}) => {
  // Skeleton shimmer animation
  const shimmer = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200';
  
  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Personal Info Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-gray-300 to-gray-400 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar skeleton */}
              <div className={`w-24 h-24 rounded-full ${shimmer}`}></div>
              
              {/* Name and title skeleton */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className={`h-8 w-64 rounded ${shimmer}`}></div>
                <div className={`h-6 w-48 rounded ${shimmer}`}></div>
                <div className="flex gap-2 justify-center md:justify-start">
                  <div className={`h-6 w-24 rounded-full ${shimmer}`}></div>
                  <div className={`h-6 w-20 rounded-full ${shimmer}`}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact info skeleton */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${shimmer}`}></div>
                  <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary skeleton */}
          <div className="px-6 py-5">
            <div className={`h-6 w-20 rounded mb-3 ${shimmer}`}></div>
            <div className="space-y-2">
              <div className={`h-4 w-full rounded ${shimmer}`}></div>
              <div className={`h-4 w-5/6 rounded ${shimmer}`}></div>
              <div className={`h-4 w-4/5 rounded ${shimmer}`}></div>
            </div>
          </div>
        </div>

        {/* Experience Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${shimmer}`}></div>
              <div className={`h-6 w-32 rounded ${shimmer}`}></div>
            </div>
            <div className={`h-4 w-16 rounded ${shimmer}`}></div>
          </div>
          
          {/* Experience items */}
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="relative ml-12">
                {/* Timeline dot */}
                <div className={`absolute -left-10 top-6 w-4 h-4 rounded-full ${shimmer}`}></div>
                
                {/* Experience card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded ${shimmer}`}></div>
                    <div className="flex-1">
                      <div className={`h-5 w-48 rounded mb-2 ${shimmer}`}></div>
                      <div className={`h-4 w-32 rounded mb-3 ${shimmer}`}></div>
                      <div className="flex gap-4">
                        <div className={`h-3 w-24 rounded ${shimmer}`}></div>
                        <div className={`h-3 w-20 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`h-4 w-full rounded ${shimmer}`}></div>
                    <div className={`h-4 w-5/6 rounded ${shimmer}`}></div>
                    <div className={`h-4 w-3/4 rounded ${shimmer}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${shimmer}`}></div>
              <div className={`h-6 w-32 rounded ${shimmer}`}></div>
            </div>
            <div className={`h-4 w-16 rounded ${shimmer}`}></div>
          </div>
          
          {/* Search and filter skeleton */}
          <div className="flex gap-4 mb-6">
            <div className={`h-10 flex-1 rounded-lg ${shimmer}`}></div>
            <div className={`h-10 w-32 rounded-lg ${shimmer}`}></div>
          </div>
          
          {/* Skills categories */}
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className={`px-4 py-3 border-b ${shimmer}`}></div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="bg-gray-50 rounded-lg p-3">
                        <div className={`h-4 w-24 rounded mb-2 ${shimmer}`}></div>
                        <div className={`h-2 w-16 rounded mb-2 ${shimmer}`}></div>
                        <div className={`h-1.5 w-full rounded ${shimmer}`}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${shimmer}`}></div>
              <div className={`h-6 w-24 rounded ${shimmer}`}></div>
            </div>
            <div className={`h-4 w-20 rounded ${shimmer}`}></div>
          </div>
          
          {/* Education items */}
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="relative ml-12">
                {/* Timeline dot */}
                <div className={`absolute -left-10 top-6 w-4 h-4 rounded-full ${shimmer}`}></div>
                
                {/* Education card */}
                <div className="bg-gray-50 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded ${shimmer}`}></div>
                    <div className="flex-1">
                      <div className={`h-5 w-56 rounded mb-2 ${shimmer}`}></div>
                      <div className={`h-4 w-40 rounded mb-3 ${shimmer}`}></div>
                      <div className="flex gap-4">
                        <div className={`h-3 w-28 rounded ${shimmer}`}></div>
                        <div className={`h-3 w-20 rounded ${shimmer}`}></div>
                        <div className={`h-3 w-16 rounded ${shimmer}`}></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`h-3 w-8 rounded mb-1 ${shimmer}`}></div>
                      <div className={`h-6 w-12 rounded ${shimmer}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Features Skeleton */}
        {showFeatures && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded ${shimmer}`}></div>
                <div className={`h-6 w-36 rounded ${shimmer}`}></div>
                <div className={`h-4 w-20 rounded ${shimmer}`}></div>
              </div>
              <div className="flex gap-2">
                <div className={`w-8 h-8 rounded ${shimmer}`}></div>
                <div className={`w-8 h-8 rounded ${shimmer}`}></div>
              </div>
            </div>
            
            {/* Features grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`h-4 w-32 rounded ${shimmer}`}></div>
                    <div className={`w-4 h-4 rounded ${shimmer}`}></div>
                  </div>
                  <div className={`h-48 w-full rounded-lg ${shimmer}`}></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional skeleton cards for variety */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className={`h-6 w-32 rounded mb-4 ${shimmer}`}></div>
            <div className="space-y-3">
              <div className={`h-4 w-full rounded ${shimmer}`}></div>
              <div className={`h-4 w-5/6 rounded ${shimmer}`}></div>
              <div className={`h-4 w-4/5 rounded ${shimmer}`}></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className={`h-6 w-28 rounded mb-4 ${shimmer}`}></div>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-16 rounded ${shimmer}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CVPreviewSkeleton.displayName = 'CVPreviewSkeleton';

export default CVPreviewSkeleton;