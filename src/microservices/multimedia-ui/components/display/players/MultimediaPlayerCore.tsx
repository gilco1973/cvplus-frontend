import React, { useRef, useCallback } from 'react';
import { MediaElement, MediaElementRef } from './MediaElement';
import { MediaControls } from './MediaControls';
import { ProgressBar } from './ProgressBar';
import { TrackInfo } from './TrackInfo';
import { usePlayerState } from './PlayerState';
import type { MultimediaPlayerProps, PlaybackSpeed } from './types';

/**
 * MultimediaPlayerCore Component
 *
 * Core multimedia player component with modular sub-components.
 * Handles media playback, controls, and user interactions.
 */
export const MultimediaPlayerCore: React.FC<MultimediaPlayerProps> = ({
  playlist,
  initialTrackIndex = 0,
  autoplay = false,
  showDownload = true,
  showShare = true,
  onTrackChange,
  onPlaybackEnd,
  onError,
  className = '',
  ...props
}) => {
  const playerState = usePlayerState(initialTrackIndex);
  const mediaElementRef = useRef<MediaElementRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTrack = playlist[playerState.currentTrackIndex];
  const isVideo = currentTrack?.type === 'video';

  // Media event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (mediaElementRef.current) {
      playerState.setDuration(mediaElementRef.current.getDuration());
      playerState.setIsLoading(false);
    }
  }, [playerState]);

  const handleTimeUpdate = useCallback(() => {
    if (mediaElementRef.current) {
      playerState.setCurrentTime(mediaElementRef.current.getCurrentTime());
    }
  }, [playerState]);

  const handleEnded = useCallback(() => {
    playerState.setIsPlaying(false);
    onPlaybackEnd?.(playerState.currentTrackIndex);

    if (playerState.currentTrackIndex < playlist.length - 1) {
      playerState.setCurrentTrackIndex(playerState.currentTrackIndex + 1);
    }
  }, [playerState, playlist.length, onPlaybackEnd]);

  const handleError = useCallback((error: Event) => {
    const errorObj = new Error(`Media playback error: ${error.type}`);
    playerState.setIsLoading(false);
    onError?.(errorObj);
  }, [playerState, onError]);

  // Player controls
  const togglePlayPause = useCallback(async () => {
    if (!mediaElementRef.current) return;

    try {
      if (playerState.isPlaying) {
        mediaElementRef.current.pause();
      } else {
        await mediaElementRef.current.play();
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [playerState.isPlaying, onError]);

  const seekTo = useCallback((time: number) => {
    if (mediaElementRef.current) {
      mediaElementRef.current.seekTo(Math.max(0, Math.min(time, playerState.duration)));
      playerState.setCurrentTime(time);
    }
  }, [playerState]);

  const changeTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      playerState.setCurrentTrackIndex(index);
      playerState.resetTrack();
      onTrackChange?.(index);
    }
  }, [playlist.length, playerState, onTrackChange]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (mediaElementRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      mediaElementRef.current.setVolume(clampedVolume);
      playerState.setVolume(clampedVolume);
      playerState.setIsMuted(clampedVolume === 0);
    }
  }, [playerState]);

  const toggleMute = useCallback(() => {
    if (mediaElementRef.current) {
      const newMuted = !playerState.isMuted;
      mediaElementRef.current.setMuted(newMuted);
      playerState.setIsMuted(newMuted);
    }
  }, [playerState]);

  const handlePlaybackRateChange = useCallback((rate: PlaybackSpeed) => {
    if (mediaElementRef.current) {
      mediaElementRef.current.setPlaybackRate(rate);
      playerState.setPlaybackRate(rate);
    }
  }, [playerState]);

  const toggleFullscreen = useCallback(async () => {
    if (!isVideo || !containerRef.current) return;

    try {
      if (!playerState.isFullscreen) {
        await containerRef.current.requestFullscreen();
        playerState.setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        playerState.setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [isVideo, playerState]);

  if (!currentTrack) {
    return <div className="text-center p-4 text-gray-500">No media to play</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`multimedia-player bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      {...props}
    >
      {/* Media Element */}
      <div className="relative">
        <MediaElement
          ref={mediaElementRef}
          track={currentTrack}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => playerState.setIsPlaying(true)}
          onPause={() => playerState.setIsPlaying(false)}
          onEnded={handleEnded}
          onError={handleError}
          onLoadStart={() => playerState.setIsLoading(true)}
        />

        {playerState.isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 space-y-4">
        <TrackInfo track={currentTrack} showDownload={showDownload} showShare={showShare} />
        <ProgressBar currentTime={playerState.currentTime} duration={playerState.duration} onSeek={seekTo} />
        <MediaControls
          isPlaying={playerState.isPlaying}
          canGoPrevious={playerState.currentTrackIndex > 0}
          canGoNext={playerState.currentTrackIndex < playlist.length - 1}
          volume={playerState.volume}
          isMuted={playerState.isMuted}
          playbackRate={playerState.playbackRate}
          isVideo={isVideo}
          isFullscreen={playerState.isFullscreen}
          onTogglePlayPause={togglePlayPause}
          onPrevious={() => changeTrack(playerState.currentTrackIndex - 1)}
          onNext={() => changeTrack(playerState.currentTrackIndex + 1)}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
          onPlaybackRateChange={handlePlaybackRateChange}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
};

export default MultimediaPlayerCore;