import React, { useState, useEffect, useRef } from 'react';
import { CVFeatureProps } from '../../../types/cv-features';
import { useFeatureData } from '../../../hooks/useFeatureData';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { LoadingSpinner } from '../Common/LoadingSpinner';

interface VideoIntroduction {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  duration: number;
  transcription?: string;
  captions?: string;
  generatedAt: string;
  style: 'professional' | 'casual' | 'creative' | 'executive';
  quality: '720p' | '1080p' | '4K';
  isGenerated: boolean;
  metadata: {
    fileSize: number;
    format: string;
    aspectRatio: string;
  };
}

interface VideoIntroductionProps extends CVFeatureProps {
  autoPlay?: boolean;
  showControls?: boolean;
  showTranscript?: boolean;
  enableGeneration?: boolean;
  defaultStyle?: 'professional' | 'casual' | 'creative' | 'executive';
}

export const VideoIntroduction: React.FC<VideoIntroductionProps> = ({
  jobId,
  profileId,
  isEnabled = true,
  data,
  customization,
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
  const [video, setVideo] = useState<VideoIntroduction | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(defaultStyle);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: videoData,
    loading,
    error,
    refetch
  } = useFeatureData(
    'getVideoIntroduction',
    { jobId, profileId },
    { enabled: isEnabled }
  );

  useEffect(() => {
    if (videoData) {
      setVideo(videoData.video);
      onUpdate?.(videoData);
    }
  }, [videoData, onUpdate]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStyleDescription = (style: string) => {
    switch (style) {
      case 'professional':
        return 'Clean, business-focused presentation with formal tone';
      case 'casual':
        return 'Relaxed, friendly approach with conversational tone';
      case 'creative':
        return 'Dynamic visuals with engaging storytelling elements';
      case 'executive':
        return 'Authoritative, leadership-focused with executive presence';
      default:
        return 'Standard professional presentation';
    }
  };

  if (loading) {
    return (
      <FeatureWrapper className={className} title="Video Introduction">
        <LoadingSpinner message="Loading video introduction..." />
      </FeatureWrapper>
    );
  }

  if (error) {
    return (
      <FeatureWrapper className={className} title="Video Introduction">
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="font-medium">Failed to Load Video</p>
          <p className="text-sm mt-1">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </FeatureWrapper>
    );
  }

  return (
    <FeatureWrapper className={className} title="Video Introduction">
      <div className="space-y-6">
        {video ? (
          <>
            {/* Video Player */}
            <div 
              ref={containerRef}
              className="relative bg-black rounded-lg overflow-hidden"
            >
              <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                autoPlay={autoPlay}
                muted={isMuted}
                className="w-full h-auto max-h-96 object-contain"
                onError={() => onError?.(new Error('Video failed to load'))}
              />

              {/* Video Overlay Controls */}
              {showControls && (
                <div className="animate-fade-in absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center"
                >
                  {/* Play/Pause Button */}
                  <button
                    onClick={handlePlayPause}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    onClick={toggleFullscreen}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded p-2 hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Progress Bar */}
              {showControls && duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-3 text-white text-sm">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex-1 relative">
                      <div className="w-full h-1 bg-white/30 rounded-full">
                        <div 
                          className="h-1 bg-blue-500 rounded-full transition-all duration-100"
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                      />
                    </div>
                    <span>{formatTime(duration)}</span>
                    
                    {/* Volume Controls */}
                    <div className="flex items-center gap-2">
                      <button onClick={toggleMute}>
                        {isMuted ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(Number(e.target.value))}
                        className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video Information */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {video.description}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{formatTime(video.duration)}</div>
                  <div>{video.quality}</div>
                  <div>{(video.metadata.fileSize / 1024 / 1024).toFixed(1)} MB</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-white ${
                  video.style === 'professional' ? 'bg-blue-500' :
                  video.style === 'casual' ? 'bg-green-500' :
                  video.style === 'creative' ? 'bg-purple-500' :
                  'bg-gray-700'
                }`}>
                  {video.style}
                </span>
                
                {video.isGenerated && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full">
                    AI Generated
                  </span>
                )}
                
                <span className="text-gray-500">
                  Created: {new Date(video.generatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Transcript */}
            {showTranscript && video.transcription && (
              <div className="bg-gray-50 rounded-lg p-4">
                <button
                  onClick={() => setShowTranscription(!showTranscription)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-3"
                >
                  <svg 
                    className={`w-4 h-4 transition-transform ${showTranscription ? 'rotate-90' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                  <span className="font-medium">Video Transcript</span>
                </button>
                
                <div>
                  {showTranscription && (
                    <div className="animate-fade-in prose prose-sm max-w-none"
                    >
                      <p className="text-gray-700 leading-relaxed">
                        {video.transcription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Video - Generation Interface */
          enableGeneration && (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Create Your Video Introduction
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate a personalized video introduction based on your CV content
                </p>
              </div>

              {/* Style Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Choose Your Style
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['professional', 'casual', 'creative', 'executive'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style as any)}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedStyle === style
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 capitalize mb-1">
                        {style}
                      </div>
                      <div className="text-xs text-gray-600">
                        {getStyleDescription(style)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateVideo}
                disabled={isGenerating}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Generating Video...
                  </div>
                ) : (
                  'Generate Video Introduction'
                )}
              </button>

              {isGenerating && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>This may take a few minutes. We're creating your personalized video...</p>
                </div>
              )}
            </div>
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
  );
};

export default VideoIntroduction;