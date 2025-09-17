import React from 'react';
import { PlaylistManagerCore } from './PlaylistManagerCore';
import type { MediaTrack, QueueItem } from './types';

interface PlaylistManagerProps {
  playlist: MediaTrack[];
  currentTrackIndex: number;
  queue: QueueItem[];
  onTrackSelect: (index: number) => void;
  onQueueUpdate: (queue: QueueItem[]) => void;
  onPlaylistUpdate: (playlist: MediaTrack[]) => void;
  className?: string;
}

/**
 * PlaylistManager Component
 *
 * Main component for playlist management functionality.
 * Wraps the core playlist manager with additional features.
 */
export const PlaylistManager: React.FC<PlaylistManagerProps> = (props) => {
  return <PlaylistManagerCore {...props} />;
};

export default PlaylistManager;