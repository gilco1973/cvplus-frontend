/**
 * CV Preview Panel Component
 * 
 * Provides real-time preview of CV enhancement process with
 * side-by-side comparison, feature highlighting, and interactive controls.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { previewService, PreviewState, FeaturePreview } from '../../services/enhancement/preview.service';
import { useAuth } from '../../contexts/AuthContext';

interface CVPreviewPanelProps {
  jobId: string;
  selectedFeatures: string[];
  isEnhancing: boolean;
  onFeatureToggle?: (featureId: string, enabled: boolean) => void;
  onPreviewError?: (error: string) => void;
}

export const CVPreviewPanel: React.FC<CVPreviewPanelProps> = ({
  jobId,
  selectedFeatures,
  isEnhancing,
  // onFeatureToggle, // Unused in current implementation
  onPreviewError
}) => {
  const { user } = useAuth();
  const [previewState, setPreviewState] = useState<PreviewState>(previewService.getPreviewState());
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'after'>('split');
  const [highlightedFeature, setHighlightedFeature] = useState<string | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showFeatureList, setShowFeatureList] = useState(true);
  
  const beforeIframeRef = useRef<HTMLIFrameElement>(null);
  const afterIframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize preview service
  useEffect(() => {
    if (!user || !jobId || selectedFeatures.length === 0) return;

    const initializePreview = async () => {
      try {
        await previewService.initializePreview(jobId, user.uid, selectedFeatures, {
          enableRealTime: isEnhancing,
          showProgress: true,
          highlightChanges: true,
          enableInteraction: false,
          updateInterval: 1000
        });
      } catch (error: unknown) {
        console.error('❌ Preview initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onPreviewError?.(errorMessage);
      }
    };

    initializePreview();

    // Subscribe to preview state changes
    const unsubscribe = previewService.subscribe(setPreviewState);

    return () => {
      unsubscribe();
      previewService.cleanup();
    };
  }, [user, jobId, selectedFeatures, isEnhancing, onPreviewError]);

  const updateIframes = useCallback(() => {
    if (beforeIframeRef.current && previewState.baseHtml) {
      const safeHtml = previewService.generateSafePreviewHtml(previewState.baseHtml);
      const scaledHtml = safeHtml.replace(
        '<body>',
        `<body style="zoom: ${previewScale}; -webkit-transform: scale(${previewScale}); transform-origin: 0 0;">`
      );
      beforeIframeRef.current.srcdoc = scaledHtml;
    }

    if (afterIframeRef.current && previewState.currentHtml) {
      const safeHtml = previewService.generateSafePreviewHtml(previewState.currentHtml);
      const scaledHtml = safeHtml.replace(
        '<body>',
        `<body style="zoom: ${previewScale}; -webkit-transform: scale(${previewScale}); transform-origin: 0 0;">`
      );
      afterIframeRef.current.srcdoc = scaledHtml;
    }
  }, [previewState.baseHtml, previewState.currentHtml, previewScale]);

  // Update iframes when HTML changes
  useEffect(() => {
    updateIframes();
  }, [previewState.baseHtml, previewState.currentHtml, previewScale, updateIframes]);

  // Handle iframe message events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-loaded') {
        console.log('📺 Preview iframe loaded successfully');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const getFeatureStatusIcon = (status: FeaturePreview['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  const getFeatureStatusColor = (status: FeaturePreview['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const formatProcessingTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const handleFeatureHighlight = (featureId: string) => {
    const newHighlight = highlightedFeature === featureId ? null : featureId;
    setHighlightedFeature(newHighlight);
    
    if (newHighlight) {
      previewService.toggleFeatureHighlight(featureId, true);
    } else {
      previewService.toggleFeatureHighlight(featureId, false);
    }
  };

  const overallProgress = previewService.getOverallProgress();
  const estimatedCompletion = previewService.getEstimatedCompletion();

  if (previewState.isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (previewState.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-red-500 text-xl mr-3">❌</span>
          <div>
            <h3 className="text-red-800 font-semibold">Preview Error</h3>
            <p className="text-red-600">{previewState.error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            🖼️ CV Enhancement Preview
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Progress: {overallProgress}%
            </span>
            {estimatedCompletion > 0 && (
              <span className="text-sm text-gray-500">
                • ETA: {formatProcessingTime(estimatedCompletion)}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">View:</label>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'split' | 'before' | 'after')}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="split">Split View</option>
              <option value="before">Before Only</option>
              <option value="after">After Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Scale:</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={previewScale}
              onChange={(e) => setPreviewScale(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{Math.round(previewScale * 100)}%</span>
          </div>

          <button
            onClick={() => setShowFeatureList(!showFeatureList)}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition-colors"
          >
            {showFeatureList ? 'Hide Features' : 'Show Features'}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Feature List Sidebar */}
        {showFeatureList && (
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Enhancement Features</h4>
              <div className="space-y-2">
                {previewState.features.map((feature) => (
                  <div
                    key={feature.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      highlightedFeature === feature.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => handleFeatureHighlight(feature.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {getFeatureStatusIcon(feature.status)} {feature.name}
                      </span>
                      <span className={`text-xs ${getFeatureStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                    </div>
                    
                    {feature.status === 'processing' && (
                      <div className="w-full bg-gray-200 rounded-full h-1 mb-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${feature.progress}%` }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {feature.processingTime ? 
                          `Completed in ${formatProcessingTime(feature.processingTime)}` : 
                          feature.estimatedTime ? 
                            `~${formatProcessingTime(feature.estimatedTime)}` : 
                            ''
                        }
                      </span>
                      {feature.error && (
                        <span className="text-red-500 truncate ml-2">{feature.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className="flex-1">
          <div className={`grid h-96 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'} gap-1`}>
            {(viewMode === 'split' || viewMode === 'before') && (
              <div className="bg-gray-100">
                <div className="bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
                  Original CV
                </div>
                <iframe
                  ref={beforeIframeRef}
                  className="w-full h-full border-0"
                  title="Original CV Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            )}

            {(viewMode === 'split' || viewMode === 'after') && (
              <div className="bg-gray-100">
                <div className="bg-blue-200 px-3 py-2 text-sm font-medium text-blue-800">
                  Enhanced CV ({previewState.features.filter(f => f.status === 'completed').length} features)
                </div>
                <iframe
                  ref={afterIframeRef}
                  className="w-full h-full border-0"
                  title="Enhanced CV Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Last updated: {new Date(previewState.lastUpdated).toLocaleTimeString()}
          </span>
          <span>
            {previewState.features.filter(f => f.status === 'completed').length} of{' '}
            {previewState.features.length} features completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default CVPreviewPanel;