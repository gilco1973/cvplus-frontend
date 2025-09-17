import React, { useState, useEffect, useCallback } from 'react';
import { MultimediaPlayer } from './MultimediaPlayer';
import { PlaylistManager } from './PlaylistManager';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { PremiumFeatures } from './PremiumFeatures';
import { ContentProcessor, GeneratedContent } from './ContentProcessor';
import type { MultimediaPlayerProps, MediaTrack, QueueItem, PlayerControls } from './types';

interface MultimediaPlayerIntegrationProps extends Omit<MultimediaPlayerProps, 'playlist'> {
  /** Content generated from CVPlus pipeline */
  generatedContent?: GeneratedContent;
  /** User authentication context */
  user?: {
    id: string;
    subscriptionTier: 'free' | 'premium' | 'enterprise';
  };
  /** Integration with CV processing */
  cvData?: {
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
  };
  /** Analytics tracking */
  onAnalytics?: (event: string, data: any) => void;
  /** Error handling */
  onError?: (error: Error, context: string) => void;
}

/**
 * MultimediaPlayerIntegration Component
 *
 * Integrated multimedia player that connects with CVPlus ecosystem,
 * supporting generated content, analytics, and premium features.
 */
export const MultimediaPlayerIntegration: React.FC<MultimediaPlayerIntegrationProps> = ({
  generatedContent,
  user,
  cvData,
  onAnalytics,
  onError,
  showPlaylist = true,
  showDownload = true,
  showShare = true,
  className = '',
  ...props
}) => {
  const [playlist, setPlaylist] = useState<MediaTrack[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playerControls, setPlayerControls] = useState<PlayerControls | null>(null);

  // Build playlist from generated content
  useEffect(() => {
    if (generatedContent && ContentProcessor.validateContent(generatedContent)) {
      const tracks = ContentProcessor.processGeneratedContent(generatedContent);
      setPlaylist(tracks);
    } else {
      setPlaylist([]);
    }
  }, [generatedContent]);

  // Analytics tracking
  const trackEvent = useCallback((event: string, data: any) => {
    onAnalytics?.(event, {
      ...data,
      userId: user?.id,
      subscriptionTier: user?.subscriptionTier,
      cvJobId: cvData?.jobId,
      playlistSize: playlist.length,
      timestamp: new Date().toISOString(),
    });
  }, [onAnalytics, user, cvData, playlist.length]);

  // Handle track changes
  const handleTrackChange = useCallback((trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
    const track = playlist[trackIndex];

    trackEvent('multimedia_track_changed', {
      trackId: track?.id,
      trackTitle: track?.title,
      trackType: track?.type,
      trackIndex,
    });
  }, [playlist, trackEvent]);

  // Handle playback end
  const handlePlaybackEnd = useCallback((trackIndex: number) => {
    const track = playlist[trackIndex];

    trackEvent('multimedia_track_completed', {
      trackId: track?.id,
      trackTitle: track?.title,
      trackType: track?.type,
      trackIndex,
    });
  }, [playlist, trackEvent]);

  // Handle errors with context
  const handleError = useCallback((error: Error) => {
    const track = playlist[currentTrackIndex];
    const errorContext = {
      trackId: track?.id,
      trackTitle: track?.title,
      trackType: track?.type,
      trackIndex: currentTrackIndex,
      playlistSize: playlist.length,
      userTier: user?.subscriptionTier,
    };

    onError?.(error, 'multimedia_player');

    trackEvent('multimedia_error', {
      error: error.message,
      context: errorContext,
    });
  }, [playlist, currentTrackIndex, user, onError, trackEvent]);

  // Premium feature restrictions
  const isPremiumUser = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  const canDownload = isPremiumUser && showDownload;
  const canUseKeyboardShortcuts = isPremiumUser;

  // Handle premium upgrade
  const handleUpgradeClick = useCallback(() => {
    trackEvent('premium_upsell_clicked', { location: 'multimedia_player' });
  }, [trackEvent]);

  if (playlist.length === 0) {
    const emptyState = ContentProcessor.createEmptyState(cvData?.status);

    return (
      <div className={`multimedia-player-integration ${className}`}>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM9 10l12-3" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.message}</h3>
          <p className="text-gray-600">{emptyState.description}</p>
          {emptyState.showProcessingIndicator && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">{emptyState.processingMessage}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`multimedia-player-integration space-y-4 ${className}`}>
      {/* Main Player */}
      <MultimediaPlayer
        playlist={playlist}
        initialTrackIndex={0}
        showDownload={canDownload}
        showShare={showShare}
        showPlaylist={showPlaylist}
        onTrackChange={handleTrackChange}
        onPlaybackEnd={handlePlaybackEnd}
        onError={handleError}
        {...props}
      />

      {/* Keyboard shortcuts (premium feature) */}
      {canUseKeyboardShortcuts && playerControls && (
        <KeyboardShortcuts
          controls={playerControls}
          enabled={true}
        />
      )}

      {/* Premium upsell for free users */}
      <PremiumFeatures
        isPremiumUser={isPremiumUser}
        onUpgradeClick={handleUpgradeClick}
      />
    </div>
  );
};

export default MultimediaPlayerIntegration;