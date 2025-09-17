import type { MediaTrack } from './types';

interface GeneratedContent {
  podcasts?: Array<{
    id: string;
    title: string;
    audioUrl: string;
    duration?: number;
    transcript?: string;
    createdAt: string;
  }>;
  videos?: Array<{
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    createdAt: string;
  }>;
  portfolio?: Array<{
    id: string;
    title: string;
    mediaUrl: string;
    type: 'image' | 'video' | 'audio';
    description?: string;
  }>;
}

/**
 * ContentProcessor Utility
 *
 * Processes CVPlus generated content into MediaTrack format
 * for use with multimedia player components.
 */
export class ContentProcessor {
  static processGeneratedContent(generatedContent: GeneratedContent): MediaTrack[] {
    const tracks: MediaTrack[] = [];

    // Process podcasts
    if (generatedContent.podcasts) {
      const podcastTracks = generatedContent.podcasts.map((podcast): MediaTrack => ({
        id: `podcast-${podcast.id}`,
        src: podcast.audioUrl,
        title: podcast.title,
        type: 'audio',
        duration: podcast.duration,
        artist: 'CVPlus AI Podcast',
        description: podcast.transcript
          ? 'AI-generated podcast with transcript'
          : 'AI-generated podcast',
        metadata: {
          createdAt: podcast.createdAt,
          tags: {
            type: 'podcast',
            generated: 'true',
            source: 'cvplus-ai',
          },
        },
      }));
      tracks.push(...podcastTracks);
    }

    // Process videos
    if (generatedContent.videos) {
      const videoTracks = generatedContent.videos.map((video): MediaTrack => ({
        id: `video-${video.id}`,
        src: video.videoUrl,
        title: video.title,
        type: 'video',
        duration: video.duration,
        thumbnail: video.thumbnailUrl,
        artist: 'CVPlus AI Video',
        description: 'AI-generated video introduction',
        metadata: {
          createdAt: video.createdAt,
          tags: {
            type: 'video',
            generated: 'true',
            source: 'cvplus-ai',
          },
        },
      }));
      tracks.push(...videoTracks);
    }

    // Process portfolio media
    if (generatedContent.portfolio) {
      const portfolioTracks = generatedContent.portfolio
        .filter(item => item.type === 'audio' || item.type === 'video')
        .map((item): MediaTrack => ({
          id: `portfolio-${item.id}`,
          src: item.mediaUrl,
          title: item.title,
          type: item.type === 'audio' ? 'audio' : 'video',
          description: item.description,
          artist: 'Portfolio Media',
          metadata: {
            tags: {
              type: 'portfolio',
              category: item.type,
            },
          },
        }));
      tracks.push(...portfolioTracks);
    }

    return tracks;
  }

  static createEmptyState(cvStatus?: 'processing' | 'completed' | 'failed') {
    return {
      message: 'No multimedia content available',
      description: 'Generate podcasts, videos, or upload portfolio media to get started.',
      showProcessingIndicator: cvStatus === 'processing',
      processingMessage: 'Your multimedia content is being generated...',
    };
  }

  static validateContent(generatedContent: GeneratedContent): boolean {
    const hasPodcasts = generatedContent.podcasts && generatedContent.podcasts.length > 0;
    const hasVideos = generatedContent.videos && generatedContent.videos.length > 0;
    const hasPortfolio = generatedContent.portfolio &&
      generatedContent.portfolio.some(item => item.type === 'audio' || item.type === 'video');

    return hasPodcasts || hasVideos || hasPortfolio;
  }
}

export type { GeneratedContent };