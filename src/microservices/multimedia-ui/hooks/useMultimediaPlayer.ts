// @ts-ignore - Export conflictsimport { useState, useEffect, useCallback, useRef } from 'react';
import type { MediaTrack, PlayerState, PlayerControls, QueueItem } from '../components/display/players/types';

interface UseMultimediaPlayerOptions {
  autoplay?: boolean;
  loop?: boolean;
  enableAnalytics?: boolean;
  enableKeyboardShortcuts?: boolean;
  onTrackChange?: (track: MediaTrack, index: number) => void;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  onError?: (error: Error) => void;
}

interface MultimediaPlayerHookReturn {
  // State
  playerState: PlayerState;
  currentTrack: MediaTrack | null;
  playlist: MediaTrack[];
  queue: QueueItem[];

  // Controls
  play: () => Promise<void>;
  pause: () => void;
  togglePlayPause: () => Promise<void>;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;

  // Playlist management
  loadPlaylist: (tracks: MediaTrack[]) => void;
  addTrack: (track: MediaTrack) => void;
  removeTrack: (trackId: string) => void;
  changeTrack: (index: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;

  // Queue management
  addToQueue: (track: MediaTrack) => void;
  removeFromQueue: (queueIndex: number) => void;
  clearQueue: () => void;

  // Utility
  formatTime: (time: number) => string;
  getTrackDuration: (trackId: string) => number | undefined;
  isTrackLoaded: (trackId: string) => boolean;
}

/**
 * useMultimediaPlayer Hook
 *
 * Comprehensive hook for managing multimedia player state and controls.
 * Provides playlist management, queue functionality, and analytics integration.
  */
export const useMultimediaPlayer = (
  initialPlaylist: MediaTrack[] = [],
  options: UseMultimediaPlayerOptions = {}
): MultimediaPlayerHookReturn => {
  const {
    autoplay = false,
    loop = false,
    enableAnalytics = true,
    enableKeyboardShortcuts = true,
    onTrackChange,
    onPlaybackStateChange,
    onError,
  } = options;

  // State
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrackIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    playbackRate: 1,
    isFullscreen: false,
    isLoading: false,
  });

  const [playlist, setPlaylist] = useState<MediaTrack[]>(initialPlaylist);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  // Refs for media element access
  const mediaElementRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const analyticsRef = useRef<{ startTime: Date; trackId: string } | null>(null);

  // Current track
  const currentTrack = playlist[playerState.currentTrackIndex] || null;

  // Media element event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (mediaElementRef.current) {
      setPlayerState(prev => ({
        ...prev,
        duration: mediaElementRef.current?.duration || 0,
        isLoading: false,
      }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (mediaElementRef.current) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: mediaElementRef.current?.currentTime || 0,
      }));
    }
  }, []);

  const handlePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: true }));
    onPlaybackStateChange?.(true);

    // Analytics tracking
    if (enableAnalytics && currentTrack) {
      analyticsRef.current = {
        startTime: new Date(),
        trackId: currentTrack.id,
      };
    }
  }, [currentTrack, enableAnalytics, onPlaybackStateChange]);

  const handlePause = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));
    onPlaybackStateChange?.(false);

    // Analytics tracking
    if (enableAnalytics && analyticsRef.current) {
      const duration = new Date().getTime() - analyticsRef.current.startTime.getTime();
      console.log(`Track ${analyticsRef.current.trackId} played for ${duration}ms`);
      analyticsRef.current = null;
    }
  }, [enableAnalytics, onPlaybackStateChange]);

  const handleEnded = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: false }));

    // Auto-advance to next track or handle queue
    if (queue.length > 0) {
      // Play next item in queue
      const nextQueueItem = queue[0];
      const trackIndex = playlist.findIndex(track => track.id === nextQueueItem.id);
      if (trackIndex !== -1) {
        setPlayerState(prev => ({ ...prev, currentTrackIndex: trackIndex }));
        setQueue(prev => prev.slice(1));
      }
    } else if (playerState.currentTrackIndex < playlist.length - 1) {
      // Play next track in playlist
      setPlayerState(prev => ({ ...prev, currentTrackIndex: prev.currentTrackIndex + 1 }));
    } else if (loop) {
      // Loop to beginning
      setPlayerState(prev => ({ ...prev, currentTrackIndex: 0 }));
    }
  }, [queue, playerState.currentTrackIndex, playlist, loop]);

  const handleError = useCallback((error: Event) => {
    const mediaError = (error.target as HTMLMediaElement)?.error;
    const errorMessage = mediaError?.message || 'Unknown media error';
    const trackError = new Error(`Media playback error: ${errorMessage}`);

    setPlayerState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
    onError?.(trackError);
  }, [onError]);

  // Player controls
  const play = useCallback(async () => {
    if (mediaElementRef.current) {
      try {
        await mediaElementRef.current.play();
      } catch (error) {
        onError?.(error as Error);
      }
    }
  }, [onError]);

  const pause = useCallback(() => {
    if (mediaElementRef.current) {
      mediaElementRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (playerState.isPlaying) {
      pause();
    } else {
      await play();
    }
  }, [playerState.isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (mediaElementRef.current) {
      mediaElementRef.current.currentTime = Math.max(0, Math.min(time, playerState.duration));
    }
  }, [playerState.duration]);

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (mediaElementRef.current) {
      mediaElementRef.current.volume = clampedVolume;
    }
    setPlayerState(prev => ({
      ...prev,
      volume: clampedVolume,
      isMuted: clampedVolume === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (mediaElementRef.current) {
      const newMuted = !playerState.isMuted;
      mediaElementRef.current.muted = newMuted;
      setPlayerState(prev => ({ ...prev, isMuted: newMuted }));
    }
  }, [playerState.isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (mediaElementRef.current) {
      mediaElementRef.current.playbackRate = rate;
    }
    setPlayerState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  // Playlist management
  const loadPlaylist = useCallback((tracks: MediaTrack[]) => {
    setPlaylist(tracks);
    setPlayerState(prev => ({ ...prev, currentTrackIndex: 0, currentTime: 0 }));
    setQueue([]); // Clear queue when loading new playlist
  }, []);

  const addTrack = useCallback((track: MediaTrack) => {
    setPlaylist(prev => [...prev, track]);
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter(track => track.id !== trackId);
      const currentTrack = prev[playerState.currentTrackIndex];

      if (currentTrack?.id === trackId) {
        // If we're removing the current track, adjust the index
        setPlayerState(prevState => ({
          ...prevState,
          currentTrackIndex: Math.min(prevState.currentTrackIndex, newPlaylist.length - 1),
        }));
      }

      return newPlaylist;
    });
  }, [playerState.currentTrackIndex]);

  const changeTrack = useCallback((index: number) => {
    if (index >= 0 && index < playlist.length) {
      setPlayerState(prev => ({ ...prev, currentTrackIndex: index, currentTime: 0 }));
      onTrackChange?.(playlist[index], index);
    }
  }, [playlist, onTrackChange]);

  const nextTrack = useCallback(() => {
    if (playerState.currentTrackIndex < playlist.length - 1) {
      changeTrack(playerState.currentTrackIndex + 1);
    }
  }, [playerState.currentTrackIndex, playlist.length, changeTrack]);

  const previousTrack = useCallback(() => {
    if (playerState.currentTrackIndex > 0) {
      changeTrack(playerState.currentTrackIndex - 1);
    }
  }, [playerState.currentTrackIndex, changeTrack]);

  // Queue management
  const addToQueue = useCallback((track: MediaTrack) => {
    const queueItem: QueueItem = {
      ...track,
      queueIndex: queue.length,
      addedAt: new Date(),
    };
    setQueue(prev => [...prev, queueItem]);
  }, [queue.length]);

  const removeFromQueue = useCallback((queueIndex: number) => {
    setQueue(prev => prev.filter(item => item.queueIndex !== queueIndex));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Utility functions
  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const getTrackDuration = useCallback((trackId: string): number | undefined => {
    const track = playlist.find(t => t.id === trackId);
    return track?.duration;
  }, [playlist]);

  const isTrackLoaded = useCallback((trackId: string): boolean => {
    return currentTrack?.id === trackId && !playerState.isLoading;
  }, [currentTrack, playerState.isLoading]);

  // Update current track when playlist or index changes
  useEffect(() => {
    if (currentTrack && mediaElementRef.current) {
      const mediaElement = mediaElementRef.current;

      mediaElement.src = currentTrack.src;
      mediaElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      mediaElement.addEventListener('timeupdate', handleTimeUpdate);
      mediaElement.addEventListener('play', handlePlay);
      mediaElement.addEventListener('pause', handlePause);
      mediaElement.addEventListener('ended', handleEnded);
      mediaElement.addEventListener('error', handleError);

      if (autoplay && !playerState.isPlaying) {
        play();
      }

      return () => {
        mediaElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        mediaElement.removeEventListener('timeupdate', handleTimeUpdate);
        mediaElement.removeEventListener('play', handlePlay);
        mediaElement.removeEventListener('pause', handlePause);
        mediaElement.removeEventListener('ended', handleEnded);
        mediaElement.removeEventListener('error', handleError);
      };
    }
  }, [currentTrack, autoplay, playerState.isPlaying, handleLoadedMetadata, handleTimeUpdate, handlePlay, handlePause, handleEnded, handleError, play]);

  return {
    // State
    playerState,
    currentTrack,
    playlist,
    queue,

    // Controls
    play,
    pause,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleMute,
    setPlaybackRate,

    // Playlist management
    loadPlaylist,
    addTrack,
    removeTrack,
    changeTrack,
    nextTrack,
    previousTrack,

    // Queue management
    addToQueue,
    removeFromQueue,
    clearQueue,

    // Utility
    formatTime,
    getTrackDuration,
    isTrackLoaded,
  };
};

export default useMultimediaPlayer;