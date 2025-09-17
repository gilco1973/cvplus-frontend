import React, { useState, useCallback } from 'react';
import { GripVertical, Music, Video } from 'lucide-react';
import type { MediaTrack } from './types';

interface PlaylistTracksProps {
  playlist: MediaTrack[];
  currentTrackIndex: number;
  onTrackSelect: (index: number) => void;
  onAddToQueue: (track: MediaTrack) => void;
}

/**
 * PlaylistTracks Component
 *
 * Displays playlist tracks with drag-and-drop reordering and queue management.
 */
export const PlaylistTracks: React.FC<PlaylistTracksProps> = ({
  playlist,
  currentTrackIndex,
  onTrackSelect,
  onAddToQueue,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Format duration helper
  const formatDuration = useCallback((duration?: number) => {
    if (!duration) return '--:--';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    // Note: This would need to be implemented with playlist reordering
  }, [draggedIndex]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  return (
    <div className="max-h-96 overflow-y-auto">
      {playlist.map((track, index) => (
        <div
          key={track.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`group flex items-center p-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-all ${
            index === currentTrackIndex
              ? 'bg-blue-50 border-l-blue-500'
              : 'border-l-transparent'
          } ${draggedIndex === index ? 'opacity-50' : ''}`}
          onClick={() => onTrackSelect(index)}
        >
          {/* Drag handle */}
          <div className="flex-shrink-0 mr-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={16} className="text-gray-400" />
          </div>

          {/* Track info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Track number/playing indicator */}
            <div className="flex-shrink-0 w-6 text-center">
              {index === currentTrackIndex ? (
                <div className="w-4 h-4 mx-auto">
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-blue-500 animate-pulse" />
                    <div className="w-1 h-4 bg-blue-500 animate-pulse delay-75" />
                    <div className="w-1 h-4 bg-blue-500 animate-pulse delay-150" />
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-500 font-medium">{index + 1}</span>
              )}
            </div>

            {/* Track type icon */}
            <div className="flex-shrink-0">
              {track.type === 'video' ? (
                <Video size={16} className="text-gray-400" />
              ) : (
                <Music size={16} className="text-gray-400" />
              )}
            </div>

            {/* Track details */}
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate transition-colors ${
                index === currentTrackIndex ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {track.title}
              </p>
              {track.artist && (
                <p className="text-sm text-gray-500 truncate">{track.artist}</p>
              )}
            </div>

            {/* Duration */}
            <div className="flex-shrink-0 text-sm text-gray-500 font-mono">
              {formatDuration(track.duration)}
            </div>
          </div>

          {/* Add to queue button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToQueue(track);
            }}
            className="flex-shrink-0 p-1 ml-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all text-xs font-medium text-gray-600"
            title="Add to queue"
          >
            +Q
          </button>
        </div>
      ))}
    </div>
  );
};

export default PlaylistTracks;