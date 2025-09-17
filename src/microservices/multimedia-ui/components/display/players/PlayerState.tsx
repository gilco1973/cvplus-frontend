import { useState, useCallback } from 'react';
import type { PlaybackSpeed } from './types';

export interface PlayerStateHook {
  // State values
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: PlaybackSpeed;
  isFullscreen: boolean;
  isLoading: boolean;

  // State setters
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setPlaybackRate: (rate: PlaybackSpeed) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setIsLoading: (loading: boolean) => void;

  // Convenience methods
  resetTrack: () => void;
  togglePlayPause: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
}

/**
 * usePlayerState Hook
 *
 * Custom hook for managing multimedia player state.
 * Provides state values and convenience methods for player controls.
 */
export const usePlayerState = (initialTrackIndex = 0): PlayerStateHook => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<PlaybackSpeed>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Convenience methods
  const resetTrack = useCallback(() => {
    setCurrentTime(0);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  return {
    // State values
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isFullscreen,
    isLoading,

    // State setters
    setCurrentTrackIndex,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setPlaybackRate,
    setIsFullscreen,
    setIsLoading,

    // Convenience methods
    resetTrack,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
  };
};

export default usePlayerState;