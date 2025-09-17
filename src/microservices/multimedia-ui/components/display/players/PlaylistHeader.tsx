import React from 'react';
import { Shuffle, Repeat, Music, Video } from 'lucide-react';
import type { MediaTrack } from './types';

interface PlaylistHeaderProps {
  playlist: MediaTrack[];
  repeatMode: 'none' | 'one' | 'all';
  onShuffle: () => void;
  onToggleRepeat: () => void;
}

/**
 * PlaylistHeader Component
 *
 * Header section for playlist with controls and statistics.
 */
export const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({
  playlist,
  repeatMode,
  onShuffle,
  onToggleRepeat,
}) => {
  // Calculate playlist statistics
  const totalDuration = playlist.reduce((total, track) => total + (track.duration || 0), 0);
  const totalTracks = playlist.length;
  const audioTracks = playlist.filter(track => track.type === 'audio').length;
  const videoTracks = playlist.filter(track => track.type === 'video').length;

  // Format duration helper
  const formatDuration = (duration: number): string => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-900">Playlist</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onShuffle}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Shuffle playlist"
          >
            <Shuffle size={16} className="text-gray-600" />
          </button>
          <button
            onClick={onToggleRepeat}
            className={`relative p-2 rounded-full hover:bg-gray-100 transition-colors ${
              repeatMode !== 'none' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat size={16} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Playlist statistics */}
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span className="font-medium">{totalTracks} tracks</span>
        <div className="flex items-center space-x-1">
          <Music size={12} />
          <span>{audioTracks}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Video size={12} />
          <span>{videoTracks}</span>
        </div>
        <span>{formatDuration(totalDuration)} total</span>
      </div>
    </div>
  );
};

export default PlaylistHeader;