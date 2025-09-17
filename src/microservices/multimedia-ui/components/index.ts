// @ts-ignore
/**
 * CVPlus Multimedia Components - Phase 2B Integration Complete
 * Enhanced podcast and audio components unified with parent project features
  */

// Enhanced Players (Phase 2B Integration)
export { PodcastPlayer } from './players/PodcastPlayer'; // Parent project enhanced version with premium features
export { AIPodcastPlayer } from './players/AIPodcastPlayer'; // Enhanced with chapters, waveform, transcript segments

// Enhanced Generation Components (Phase 2B Integration)
export { PodcastGeneration } from './generation/PodcastGeneration'; // Enhanced with style options and premium gates
export { VideoIntroduction } from './generation/VideoIntroduction';

// Gallery Components  
export { PortfolioGallery } from './gallery/PortfolioGallery';

// Media Components
export * from './media';

// Enhanced Podcast Types (Phase 2B Integration)
export type {
  PodcastData,
  PodcastStatus,
  AudioState,
  TranscriptSegment,
  PodcastChapter,
  PodcastPlayerEvents,
  PodcastPlayerCustomization,
  PodcastGenerationOptions,
  PodcastStatusResponse
} from '../types/podcast.types';

// Backward Compatibility Aliases
export { PodcastPlayer as EnhancedPodcastPlayer } from './players/PodcastPlayer';
export { AIPodcastPlayer as UnifiedAIPodcastPlayer } from './players/AIPodcastPlayer';

// Utility Functions
export { callFirebaseFunction, formatTime, estimateAudioDuration, generateWaveformData } from '../utils/firebase.utils';

// Legacy component types (if needed)
export type * from './types';