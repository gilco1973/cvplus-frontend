/**
 * Video Introduction Component
 * Main component for video introduction generation and playback
 */

import React, { useState, useRef } from 'react';
import { VideoIntroductionProps, VideoIntroduction as VideoIntroductionType } from './types';
import { FeatureWrapper } from '../FeatureWrapper';
import { ErrorBoundary } from '../ErrorBoundary';
import { useFeatureData } from '../../hooks/useFeatureData';
import { VideoPlayer } from './VideoPlayer';
import { VideoGenerationPanel } from './VideoGenerationPanel';

export const VideoIntroduction: React.FC<VideoIntroductionProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization = {},
  onUpdate,
  onError,
  className = '',
  mode = 'private',
  autoPlay = false,
  showControls = true,
  showTranscript = true,
  enableGeneration = true,
  defaultStyle = 'professional'
}) => {
  const [video, setVideo] = useState<VideoIntroductionType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: videoData,
    loading,
    error,
    refresh
  } = useFeatureData<{ video: VideoIntroductionType }>({
    jobId,
    featureName: 'video-introduction',
    initialData: data,
    params: { profileId }
  });

  // Update video when data changes
  React.useEffect(() => {
    if (videoData?.video) {
      setVideo(videoData.video);
      onUpdate?.(videoData);
    }
  }, [videoData, onUpdate]);

  const generateVideo = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generateVideoIntroduction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          profileId,
          style: selectedStyle,
          includeTranscript: showTranscript,
          quality: '1080p'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setVideo(result.video);
        onUpdate?.({ video: result.video, generatedAt: new Date().toISOString() });
      } else {
        throw new Error('Failed to generate video');
      }
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleChange = (style: VideoIntroductionType['style']) => {
    setSelectedStyle(style);
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title="Video Introduction"
        description="AI-generated professional video introduction"
        isLoading={loading}
        error={error}
        onRetry={refresh}
      >
        <div className="space-y-6" ref={containerRef}>
          {video ? (
            <VideoPlayer
              video={video}
              autoPlay={autoPlay}
              showControls={showControls}
              showTranscript={showTranscript}
              onError={onError}
            />
          ) : (
            enableGeneration && (
              <VideoGenerationPanel
                selectedStyle={selectedStyle}
                isGenerating={isGenerating}
                onStyleChange={handleStyleChange}
                onGenerate={generateVideo}
              />
            )
          )}

          {/* Privacy Notice for Public Mode */}
          {mode === 'public' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Privacy Note:</span> This video introduction 
                is publicly accessible. It contains only professional information from your CV.
              </p>
            </div>
          )}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};