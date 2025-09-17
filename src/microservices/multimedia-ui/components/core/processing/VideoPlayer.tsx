/**
 * Video Player Component
 * Custom video player with controls and transcript
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { VideoPlayerProps } from './types';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  autoPlay = false,
  showControls = true,
  showTranscript = true,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleDurationChange = () => setDuration(videoElement.duration);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Video Player */}
      <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
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
          <div className="animate-fade-in absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 flex items-center justify-center">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded p-2 hover:bg-white/30 transition-colors"
            >
              <Maximize2 className="w-5 h-5 text-white" />
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
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
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
          
          {showTranscription && (
            <div className="animate-fade-in prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {video.transcription}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};