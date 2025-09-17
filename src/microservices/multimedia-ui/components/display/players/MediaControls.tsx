import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import type { PlaybackSpeed } from './types';

interface MediaControlsProps {
  isPlaying: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  volume: number;
  isMuted: boolean;
  playbackRate: PlaybackSpeed;
  isVideo?: boolean;
  isFullscreen?: boolean;
  onTogglePlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onPlaybackRateChange: (rate: PlaybackSpeed) => void;
  onToggleFullscreen?: () => void;
}

/**
 * MediaControls Component
 *
 * Renders the main playback controls for the multimedia player.
 * Handles play/pause, navigation, volume, and playback speed.
 */
export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  canGoPrevious,
  canGoNext,
  volume,
  isMuted,
  playbackRate,
  isVideo = false,
  isFullscreen = false,
  onTogglePlayPause,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
  onPlaybackRateChange,
  onToggleFullscreen,
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* Main transport controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous track"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={onTogglePlayPause}
          className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next track"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center space-x-3">
        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleMute}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={16} className="text-gray-600" />
            ) : (
              <Volume2 size={16} className="text-gray-600" />
            )}
          </button>

          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>

        {/* Playback speed */}
        <select
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value) as PlaybackSpeed)}
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          title="Playback speed"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
          <option value={1.5}>1.5×</option>
          <option value={2}>2×</option>
        </select>

        {/* Fullscreen toggle (video only) */}
        {isVideo && onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize size={16} className="text-gray-600" />
            ) : (
              <Maximize size={16} className="text-gray-600" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaControls;