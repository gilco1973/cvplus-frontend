import React, { useEffect } from 'react';
import { MultimediaPlayerCore } from './MultimediaPlayerCore';
import { PlaylistManager } from './PlaylistManager';
import type { MultimediaPlayerProps, QueueItem } from './types';

/**
 * MultimediaPlayer Component
 *
 * Professional multimedia player for audio and video content with playlist support.
 * Supports MP3, MP4, WAV formats with progressive loading and accessibility features.
 */
export const MultimediaPlayer: React.FC<MultimediaPlayerProps> = ({
  playlist,
  showPlaylist = true,
  onTrackChange,
  className = '',
  ...props
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = React.useState(props.initialTrackIndex || 0);
  const [queue, setQueue] = React.useState<QueueItem[]>([]);

  // Handle track change from core player
  const handleTrackChange = React.useCallback((index: number) => {
    setCurrentTrackIndex(index);
    onTrackChange?.(index);
  }, [onTrackChange]);

  // Handle track selection from playlist manager
  const handlePlaylistTrackSelect = React.useCallback((index: number) => {
    setCurrentTrackIndex(index);
    onTrackChange?.(index);
  }, [onTrackChange]);

  // Media Session API integration
  useEffect(() => {
    if ('mediaSession' in navigator && playlist[currentTrackIndex]) {
      const currentTrack = playlist[currentTrackIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || 'CVPlus',
        artwork: currentTrack.thumbnail ? [
          { src: currentTrack.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ] : undefined,
      });
    }
  }, [playlist, currentTrackIndex]);

  return (
    <div className={`multimedia-player-container space-y-4 ${className}`}>
      {/* Core Player */}
      <MultimediaPlayerCore
        playlist={playlist}
        initialTrackIndex={currentTrackIndex}
        onTrackChange={handleTrackChange}
        {...props}
      />

      {/* Playlist Manager */}
      {showPlaylist && playlist.length > 1 && (
        <PlaylistManager
          playlist={playlist}
          currentTrackIndex={currentTrackIndex}
          queue={queue}
          onTrackSelect={handlePlaylistTrackSelect}
          onQueueUpdate={setQueue}
          onPlaylistUpdate={() => {}} // Read-only playlist for now
        />
      )}
    </div>
  );
};

export default MultimediaPlayer;