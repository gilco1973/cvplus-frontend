import React, { useRef, useCallback } from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  isSeekable?: boolean;
  onSeek?: (time: number) => void;
  className?: string;
}

/**
 * ProgressBar Component
 *
 * Interactive progress bar for media playback with click-to-seek functionality.
 * Shows current playback position and allows users to seek to specific times.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  isSeekable = true,
  onSeek,
  className = '',
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  // Format time as MM:SS
  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time) || isNaN(time)) return '--:--';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Handle click to seek
  const handleProgressClick = useCallback((event: React.MouseEvent) => {
    if (!isSeekable || !onSeek || !progressRef.current || !duration) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(clickPosition * duration, duration));

    onSeek(newTime);
  }, [isSeekable, onSeek, duration]);

  // Handle keyboard interaction for accessibility
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isSeekable || !onSeek || !duration) return;

    let seekAmount = 0;

    switch (event.code) {
      case 'ArrowLeft':
        seekAmount = -5; // Seek back 5 seconds
        break;
      case 'ArrowRight':
        seekAmount = 5; // Seek forward 5 seconds
        break;
      case 'Home':
        onSeek(0);
        return;
      case 'End':
        onSeek(duration);
        return;
      default:
        return;
    }

    event.preventDefault();
    const newTime = Math.max(0, Math.min(currentTime + seekAmount, duration));
    onSeek(newTime);
  }, [isSeekable, onSeek, duration, currentTime]);

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div className={`progress-bar ${className}`}>
      {/* Progress bar */}
      <div
        ref={progressRef}
        className={`relative h-2 bg-gray-200 rounded-full overflow-hidden ${
          isSeekable ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={handleProgressClick}
        onKeyDown={handleKeyDown}
        tabIndex={isSeekable ? 0 : -1}
        role={isSeekable ? 'slider' : 'progressbar'}
        aria-label="Seek to position"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
      >
        {/* Progress fill */}
        <div
          className="h-full bg-blue-500 transition-all duration-100 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Hover effect overlay */}
        {isSeekable && (
          <div className="absolute inset-0 bg-blue-600 opacity-0 hover:opacity-20 transition-opacity rounded-full" />
        )}

        {/* Progress handle */}
        {isSeekable && progressPercentage > 0 && (
          <div
            className="absolute top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-y-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity shadow-md"
            style={{ left: `${progressPercentage}%` }}
          />
        )}
      </div>

      {/* Time display */}
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span className="font-mono">{formatTime(currentTime)}</span>
        <span className="font-mono">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;