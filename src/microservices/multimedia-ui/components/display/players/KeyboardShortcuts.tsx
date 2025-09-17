import { useEffect, useCallback } from 'react';
import type { PlayerControls } from './types';

interface KeyboardShortcutsProps {
  enabled?: boolean;
  controls: PlayerControls;
  onSeek?: (direction: 'forward' | 'backward', seconds?: number) => void;
}

/**
 * KeyboardShortcuts Component
 *
 * Provides keyboard accessibility for multimedia player controls.
 * Supports standard media player shortcuts and custom key bindings.
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  enabled = true,
  controls,
  onSeek,
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Prevent shortcuts when typing in inputs
    const target = event.target as Element;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Prevent default for handled keys
    const handledKeys = [
      'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'KeyK', 'KeyJ', 'KeyL', 'KeyF', 'KeyM', 'Comma', 'Period',
      'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
      'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'
    ];

    if (handledKeys.includes(event.code)) {
      event.preventDefault();
    }

    switch (event.code) {
      // Play/Pause
      case 'Space':
      case 'KeyK':
        controls.togglePlayPause();
        break;

      // Seek backward/forward (5 seconds)
      case 'ArrowLeft':
        onSeek?.('backward', 5);
        break;
      case 'ArrowRight':
        onSeek?.('forward', 5);
        break;

      // Seek backward/forward (10 seconds)
      case 'KeyJ':
        onSeek?.('backward', 10);
        break;
      case 'KeyL':
        onSeek?.('forward', 10);
        break;

      // Volume up/down
      case 'ArrowUp':
        // Increase volume by 10%
        // This would need to be implemented in the parent component
        break;
      case 'ArrowDown':
        // Decrease volume by 10%
        // This would need to be implemented in the parent component
        break;

      // Mute/unmute
      case 'KeyM':
        controls.toggleMute();
        break;

      // Fullscreen (video only)
      case 'KeyF':
        controls.toggleFullscreen();
        break;

      // Previous/next track
      case 'Comma':
        if (event.shiftKey) {
          controls.previousTrack();
        }
        break;
      case 'Period':
        if (event.shiftKey) {
          controls.nextTrack();
        }
        break;

      // Jump to percentage positions (0-9 keys)
      case 'Digit0':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
        const percentage = parseInt(event.code.replace('Digit', '')) / 10;
        // This would need duration to calculate the exact time
        // onSeek?.('absolute', percentage);
        break;

      // Playback speed controls
      case 'Minus':
        // Decrease playback speed
        break;
      case 'Equal':
        // Increase playback speed
        break;

      default:
        return; // Don't prevent default for unhandled keys
    }
  }, [enabled, controls, onSeek]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);

  // This component doesn't render anything
  return null;
};

/**
 * Hook for keyboard shortcuts
 */
export const useKeyboardShortcuts = (controls: PlayerControls, enabled = true) => {
  const handleSeek = useCallback((direction: 'forward' | 'backward', seconds = 5) => {
    // This would need current time and duration from parent
    // Implementation depends on the player state structure
    console.log(`Seeking ${direction} by ${seconds} seconds`);
  }, []);

  return { handleSeek };
};

/**
 * Keyboard shortcuts help text
 */
export const KEYBOARD_SHORTCUTS = {
  playback: [
    { key: 'Space / K', description: 'Play/Pause' },
    { key: '← / J', description: 'Seek backward (5s / 10s)' },
    { key: '→ / L', description: 'Seek forward (5s / 10s)' },
    { key: 'Shift + <', description: 'Previous track' },
    { key: 'Shift + >', description: 'Next track' },
  ],
  audio: [
    { key: '↑', description: 'Volume up' },
    { key: '↓', description: 'Volume down' },
    { key: 'M', description: 'Mute/Unmute' },
  ],
  video: [
    { key: 'F', description: 'Fullscreen' },
  ],
  navigation: [
    { key: '0-9', description: 'Jump to 0%-90% of video' },
  ],
};

export default KeyboardShortcuts;