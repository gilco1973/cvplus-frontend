import React from 'react';
import { Download, Share2, Music, Video } from 'lucide-react';
import type { MediaTrack } from './types';

interface TrackInfoProps {
  track: MediaTrack;
  showDownload?: boolean;
  showShare?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

/**
 * TrackInfo Component
 *
 * Displays current track information including title, artist, description,
 * and action buttons for download and sharing.
 */
export const TrackInfo: React.FC<TrackInfoProps> = ({
  track,
  showDownload = true,
  showShare = true,
  onDownload,
  onShare,
  className = '',
}) => {
  // Handle share functionality
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    // Use Web Share API if available
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: track.title,
          text: track.description || `Listen to ${track.title}`,
          url: track.src,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(track.src);
        // You might want to show a toast notification here
        console.log('Link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  // Handle download
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }

    // Default download behavior
    const link = document.createElement('a');
    link.href = track.src;
    link.download = `${track.title}.${track.type === 'video' ? 'mp4' : 'mp3'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`track-info ${className}`}>
      <div className="flex items-start justify-between">
        {/* Track details */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center space-x-2 mb-1">
            {/* Track type icon */}
            <div className="flex-shrink-0">
              {track.type === 'video' ? (
                <Video size={16} className="text-gray-500" />
              ) : (
                <Music size={16} className="text-gray-500" />
              )}
            </div>

            {/* Track title */}
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {track.title}
            </h3>
          </div>

          {/* Artist/creator */}
          {track.artist && (
            <p className="text-sm text-gray-600 mb-1 truncate">
              by {track.artist}
            </p>
          )}

          {/* Description */}
          {track.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {track.description}
            </p>
          )}

          {/* Metadata tags */}
          {track.metadata?.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(track.metadata.tags).map(([key, value]) => (
                <span
                  key={`${key}-${value}`}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {showDownload && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="Download"
              aria-label={`Download ${track.title}`}
            >
              <Download size={18} />
            </button>
          )}

          {showShare && (
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
              title="Share"
              aria-label={`Share ${track.title}`}
            >
              <Share2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Duration and file info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {track.duration && (
            <span>
              Duration: {Math.floor(track.duration / 60)}:{String(Math.floor(track.duration % 60)).padStart(2, '0')}
            </span>
          )}

          {track.metadata?.size && (
            <span>
              Size: {(track.metadata.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          )}

          {track.metadata?.bitrate && (
            <span>
              {track.metadata.bitrate} kbps
            </span>
          )}
        </div>

        {track.metadata?.createdAt && (
          <span>
            Generated: {new Date(track.metadata.createdAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrackInfo;