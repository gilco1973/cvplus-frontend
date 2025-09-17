import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { MediaTrack } from './types';

interface MediaElementProps {
  track: MediaTrack;
  onLoadedMetadata?: () => void;
  onTimeUpdate?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Event) => void;
  onLoadStart?: () => void;
}

export interface MediaElementRef {
  play: () => Promise<void>;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  requestFullscreen?: () => Promise<void>;
}

/**
 * MediaElement Component
 *
 * Wrapper for HTML5 audio/video elements with unified interface.
 * Provides imperative API through refs for player controls.
 */
export const MediaElement = forwardRef<MediaElementRef, MediaElementProps>(
  ({ track, onLoadedMetadata, onTimeUpdate, onPlay, onPause, onEnded, onError, onLoadStart }, ref) => {
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const isVideo = track.type === 'video';

    // Expose media control methods through ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (mediaRef.current) {
          await mediaRef.current.play();
        }
      },
      pause: () => {
        if (mediaRef.current) {
          mediaRef.current.pause();
        }
      },
      seekTo: (time: number) => {
        if (mediaRef.current) {
          mediaRef.current.currentTime = time;
        }
      },
      setVolume: (volume: number) => {
        if (mediaRef.current) {
          mediaRef.current.volume = Math.max(0, Math.min(1, volume));
        }
      },
      setMuted: (muted: boolean) => {
        if (mediaRef.current) {
          mediaRef.current.muted = muted;
        }
      },
      setPlaybackRate: (rate: number) => {
        if (mediaRef.current) {
          mediaRef.current.playbackRate = rate;
        }
      },
      getCurrentTime: () => {
        return mediaRef.current?.currentTime || 0;
      },
      getDuration: () => {
        return mediaRef.current?.duration || 0;
      },
      requestFullscreen: async () => {
        if (isVideo && mediaRef.current && 'requestFullscreen' in mediaRef.current) {
          await (mediaRef.current as HTMLVideoElement).requestFullscreen();
        }
      },
    }), [isVideo]);

    const handleError = useCallback((event: React.SyntheticEvent<HTMLMediaElement>) => {
      onError?.(event.nativeEvent);
    }, [onError]);

    const MediaTag = isVideo ? 'video' : 'audio';

    return (
      <div className="relative w-full">
        <MediaTag
          ref={mediaRef as any}
          src={track.src}
          poster={isVideo ? track.thumbnail : undefined}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={handleError}
          onLoadStart={onLoadStart}
          className={`w-full ${isVideo ? 'aspect-video' : 'h-0'}`}
          preload="metadata"
          playsInline
        />
      </div>
    );
  }
);

MediaElement.displayName = 'MediaElement';

export default MediaElement;