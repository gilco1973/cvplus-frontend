import React, { useState, useCallback } from 'react';
import { PlaylistHeader } from './PlaylistHeader';
import { QueueSection } from './QueueSection';
import { PlaylistTracks } from './PlaylistTracks';
import type { MediaTrack, QueueItem } from './types';

interface PlaylistManagerCoreProps {
  playlist: MediaTrack[];
  currentTrackIndex: number;
  queue: QueueItem[];
  onTrackSelect: (index: number) => void;
  onQueueUpdate: (queue: QueueItem[]) => void;
  onPlaylistUpdate: (playlist: MediaTrack[]) => void;
  className?: string;
}

/**
 * PlaylistManagerCore Component
 *
 * Core playlist management with modular sub-components.
 * Handles playlist display, queue functionality, and track organization.
 */
export const PlaylistManagerCore: React.FC<PlaylistManagerCoreProps> = ({
  playlist,
  currentTrackIndex,
  queue,
  onTrackSelect,
  onQueueUpdate,
  onPlaylistUpdate,
  className = '',
}) => {
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  // Playlist management functions
  const addToQueue = useCallback((track: MediaTrack) => {
    const queueItem: QueueItem = {
      ...track,
      queueIndex: queue.length,
      addedAt: new Date(),
    };
    onQueueUpdate([...queue, queueItem]);
  }, [queue, onQueueUpdate]);

  const removeFromQueue = useCallback((queueIndex: number) => {
    const updatedQueue = queue
      .filter(item => item.queueIndex !== queueIndex)
      .map((item, index) => ({ ...item, queueIndex: index }));
    onQueueUpdate(updatedQueue);
  }, [queue, onQueueUpdate]);

  const clearQueue = useCallback(() => {
    onQueueUpdate([]);
  }, [onQueueUpdate]);

  const shufflePlaylist = useCallback(() => {
    const shuffled = [...playlist];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onPlaylistUpdate(shuffled);
  }, [playlist, onPlaylistUpdate]);

  const toggleRepeatMode = useCallback(() => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  }, [repeatMode]);

  if (playlist.length === 0) {
    return (
      <div className={`playlist-manager bg-white rounded-lg shadow ${className}`}>
        <div className="p-8 text-center text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM9 10l12-3" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">No tracks in playlist</p>
          <p className="text-sm text-gray-500 mt-1">Add some media to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`playlist-manager bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header with controls and stats */}
      <PlaylistHeader
        playlist={playlist}
        repeatMode={repeatMode}
        onShuffle={shufflePlaylist}
        onToggleRepeat={toggleRepeatMode}
      />

      {/* Queue section */}
      <QueueSection
        queue={queue}
        onRemoveFromQueue={removeFromQueue}
        onClearQueue={clearQueue}
      />

      {/* Playlist tracks */}
      <PlaylistTracks
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={onTrackSelect}
        onAddToQueue={addToQueue}
      />
    </div>
  );
};

export default PlaylistManagerCore;