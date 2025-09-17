import React from 'react';
import { MultimediaPlayer } from './MultimediaPlayer';
import { MultimediaPlayerIntegration } from './MultimediaPlayerIntegration';
import { useMultimediaPlayer } from '../../../hooks/useMultimediaPlayer';
import type { MediaTrack } from './types';

// Sample playlist for demonstration
const samplePlaylist: MediaTrack[] = [
  {
    id: 'podcast-1',
    src: 'https://example.com/podcast-1.mp3',
    title: 'AI Career Transformation Podcast',
    type: 'audio',
    duration: 300, // 5 minutes
    artist: 'CVPlus AI',
    description: 'AI-generated podcast about career transformation tips',
    metadata: {
      tags: {
        type: 'podcast',
        generated: 'true',
        topic: 'career-advice',
      },
    },
  },
  {
    id: 'video-1',
    src: 'https://example.com/intro-video.mp4',
    title: 'Professional Video Introduction',
    type: 'video',
    duration: 120, // 2 minutes
    thumbnail: 'https://example.com/video-thumbnail.jpg',
    artist: 'CVPlus AI',
    description: 'AI-generated professional video introduction',
    metadata: {
      tags: {
        type: 'video',
        generated: 'true',
        category: 'introduction',
      },
    },
  },
  {
    id: 'audio-2',
    src: 'https://example.com/skills-overview.mp3',
    title: 'Skills Overview Audio',
    type: 'audio',
    duration: 180, // 3 minutes
    artist: 'CVPlus AI',
    description: 'AI-generated overview of professional skills',
    metadata: {
      tags: {
        type: 'audio',
        generated: 'true',
        topic: 'skills',
      },
    },
  },
];

/**
 * Basic MultimediaPlayer Example
 *
 * Demonstrates basic usage of the MultimediaPlayer component
 */
export const BasicMultimediaPlayerExample: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Basic Multimedia Player</h2>

      <MultimediaPlayer
        playlist={samplePlaylist}
        autoplay={false}
        showPlaylist={true}
        showDownload={true}
        showShare={true}
        onTrackChange={(index) => console.log('Track changed to:', index)}
        onPlaybackEnd={(index) => console.log('Track ended:', index)}
        className="mb-6"
      />

      <div className="text-sm text-gray-600">
        <p><strong>Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Audio and video playback</li>
          <li>Playlist navigation</li>
          <li>Volume and playback speed controls</li>
          <li>Download and sharing options</li>
          <li>Responsive design</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Integrated MultimediaPlayer Example
 *
 * Demonstrates CVPlus ecosystem integration with generated content
 */
export const IntegratedMultimediaPlayerExample: React.FC = () => {
  const generatedContent = {
    podcasts: [
      {
        id: 'generated-podcast-1',
        title: 'Your Career Story Podcast',
        audioUrl: 'https://example.com/career-story.mp3',
        duration: 420,
        transcript: 'AI-generated career story based on your CV...',
        createdAt: new Date().toISOString(),
      },
    ],
    videos: [
      {
        id: 'generated-video-1',
        title: 'Professional Introduction Video',
        videoUrl: 'https://example.com/intro.mp4',
        thumbnailUrl: 'https://example.com/intro-thumb.jpg',
        duration: 90,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  const user = {
    id: 'user-123',
    subscriptionTier: 'premium' as const,
  };

  const handleAnalytics = (event: string, data: any) => {
    console.log('Analytics Event:', event, data);
  };

  const handleError = (error: Error, context: string) => {
    console.error('Multimedia Error:', error, 'Context:', context);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">CVPlus Integrated Player</h2>

      <MultimediaPlayerIntegration
        generatedContent={generatedContent}
        user={user}
        cvData={{ jobId: 'cv-job-123', status: 'completed' }}
        onAnalytics={handleAnalytics}
        onError={handleError}
        showPlaylist={true}
        showDownload={true}
        showShare={true}
        className="mb-6"
      />

      <div className="text-sm text-gray-600">
        <p><strong>CVPlus Integration Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Automatic playlist generation from AI content</li>
          <li>Analytics tracking for engagement</li>
          <li>Premium feature restrictions</li>
          <li>Error handling with context</li>
          <li>CV processing status awareness</li>
          <li>User subscription tier integration</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Hook-based MultimediaPlayer Example
 *
 * Demonstrates using the useMultimediaPlayer hook for custom implementations
 */
export const HookBasedMultimediaPlayerExample: React.FC = () => {
  const {
    playerState,
    currentTrack,
    playlist,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    formatTime,
    loadPlaylist,
  } = useMultimediaPlayer(samplePlaylist, {
    autoplay: false,
    onTrackChange: (track, index) => console.log('Hook: Track changed', track.title, index),
    onPlaybackStateChange: (isPlaying) => console.log('Hook: Playback state', isPlaying),
  });

  React.useEffect(() => {
    // Load sample playlist on mount
    loadPlaylist(samplePlaylist);
  }, [loadPlaylist]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Hook-based Custom Player</h2>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Current track info */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentTrack?.title || 'No track selected'}
          </h3>
          {currentTrack?.artist && (
            <p className="text-sm text-gray-600">{currentTrack.artist}</p>
          )}
        </div>

        {/* Simple progress display */}
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{
                width: `${playerState.duration ? (playerState.currentTime / playerState.duration) * 100 : 0}%`
              }}
            />
          </div>
        </div>

        {/* Custom controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={previousTrack}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            ⏮
          </button>
          <button
            onClick={togglePlayPause}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            {playerState.isPlaying ? '⏸' : '▶️'}
          </button>
          <button
            onClick={nextTrack}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          >
            ⏭
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={playerState.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-8">
            {Math.round(playerState.volume * 100)}%
          </span>
        </div>

        {/* Playlist info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Track {playerState.currentTrackIndex + 1} of {playlist.length}
          </p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Custom Hook Features:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li>Full control over player state</li>
          <li>Custom UI implementation</li>
          <li>Playlist management functions</li>
          <li>Analytics and event callbacks</li>
          <li>Extensible for custom features</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Complete MultimediaPlayer Examples Component
 *
 * Renders all example implementations
 */
export const MultimediaPlayerExamples: React.FC = () => {
  return (
    <div className="space-y-12 py-8">
      <BasicMultimediaPlayerExample />
      <IntegratedMultimediaPlayerExample />
      <HookBasedMultimediaPlayerExample />
    </div>
  );
};

export default MultimediaPlayerExamples;