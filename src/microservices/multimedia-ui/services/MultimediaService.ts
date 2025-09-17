// @ts-ignore
/**
 * MultimediaService - Frontend API service for multimedia operations
 * Provides comprehensive interface for multimedia generation, management, and playback
 *
 * @author CVPlus Development Team
 * @version 1.0.0
  */

import { httpsCallable, HttpsCallableResult, Functions } from 'firebase/functions';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  UploadTask,
  StorageReference,
  FirebaseStorage
} from 'firebase/storage';
import {
  MediaFile,
  MediaMetadata,
  ProcessingStatus,
  MediaType,
  QualityLevel
} from '../../types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CVData {
  id: string;
  userId: string;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    summary?: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  skills: string[];
  achievements?: string[];
}

export interface PodcastOptions {
  style: 'professional' | 'conversational' | 'storytelling';
  duration: 'short' | 'medium' | 'long';
  voice?: 'male' | 'female';
  speed?: number;
  includeIntro?: boolean;
  includeOutro?: boolean;
  backgroundMusic?: boolean;
  language?: string;
}

export interface VideoOptions {
  style: 'professional' | 'creative' | 'modern' | 'casual';
  duration: 'short' | 'medium' | 'long';
  avatarStyle?: 'realistic' | 'cartoon' | 'professional' | 'friendly';
  background?: 'office' | 'studio' | 'virtual' | 'custom';
  includeSubtitles?: boolean;
  includeNameCard?: boolean;
  quality?: QualityLevel;
  orientation?: 'landscape' | 'portrait' | 'square';
}

export interface GenerationJob {
  id: string;
  type: 'podcast' | 'video' | 'audio' | 'image';
  status: ProcessingStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  cvId: string;
  options: PodcastOptions | VideoOptions;
  result?: {
    url: string;
    duration?: number;
    size: number;
    format: string;
  };
  error?: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
}

export interface GenerationStatus {
  jobId: string;
  status: ProcessingStatus;
  progress: number;
  stage: string;
  estimatedTimeRemaining?: number;
  result?: {
    url: string;
    duration?: number;
    size: number;
    format: string;
    metadata?: MediaMetadata;
  };
  error?: {
    message: string;
    code: string;
    recoverable: boolean;
  };
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: PlaylistItem[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
  tags: string[];
  duration: number;
  coverImage?: string;
}

export interface PlaylistItem {
  id: string;
  mediaId: string;
  position: number;
  addedAt: Date;
  metadata: MediaMetadata;
}

export interface PlaylistUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  items?: {
    add?: Array<{ mediaId: string; position?: number }>;
    remove?: string[];
    reorder?: Array<{ mediaId: string; newPosition: number }>;
  };
}

export interface PlaybackSession {
  id: string;
  mediaId: string;
  userId: string;
  startedAt: Date;
  currentPosition: number;
  volume: number;
  playbackRate: number;
  quality: QualityLevel;
  isPlaying: boolean;
  playlist?: {
    playlistId: string;
    currentIndex: number;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number;
  estimatedTimeRemaining: number;
}

export interface SharingOptions {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'direct';
  privacy: 'public' | 'unlisted' | 'private';
  embedOptions?: {
    width: number;
    height: number;
    autoplay: boolean;
    controls: boolean;
  };
}

export interface MediaItem {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  size: number;
  format: string;
  metadata: MediaMetadata;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  userId?: string;
  isPublic?: boolean;
  views?: number;
  thumbnailUrl?: string;
  duration?: number; // for audio/video
  dimensions?: {
    width: number;
    height: number;
  }; // for images/video
}

// ============================================================================
// MULTIMEDIA SERVICE CLASS
// ============================================================================

export class MultimediaService {
  private static instance: MultimediaService | null = null;
  private activeGenerations = new Map<string, GenerationJob>();
  private activeUploads = new Map<string, UploadTask>();
  private eventSources = new Map<string, EventSource>();
  private functions: Functions | null = null;
  private storage: FirebaseStorage | null = null;

  // Private constructor for singleton
  private constructor() {}

  // Singleton pattern
  public static getInstance(): MultimediaService {
    if (!MultimediaService.instance) {
      MultimediaService.instance = new MultimediaService();
    }
    return MultimediaService.instance;
  }

  /**
   * Initialize Firebase services
   * This should be called during app initialization
    */
  public initialize(functions: Functions, storage: FirebaseStorage): void {
    this.functions = functions;
    this.storage = storage;
  }

  /**
   * Ensure Firebase services are initialized
    */
  private ensureInitialized(): void {
    if (!this.functions || !this.storage) {
      throw new Error('MultimediaService not initialized. Call initialize() first.');
    }
  }

  // ============================================================================
  // CONTENT GENERATION METHODS
  // ============================================================================

  /**
   * Generate podcast from CV data
    */
  async generatePodcast(cvData: CVData, options: PodcastOptions): Promise<GenerationJob> {
    this.ensureInitialized();

    try {
      const generatePodcastFunction = httpsCallable(this.functions!, 'generatePodcast');

      const result: HttpsCallableResult<any> = await generatePodcastFunction({
        cvData,
        options: {
          style: options.style,
          duration: options.duration,
          voice: options.voice || 'professional',
          speed: options.speed || 1.0,
          includeIntro: options.includeIntro !== false,
          includeOutro: options.includeOutro !== false,
          backgroundMusic: options.backgroundMusic || false,
          language: options.language || 'en'
        }
      });

      const job: GenerationJob = {
        id: result.data.jobId,
        type: 'podcast',
        status: 'queued',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: cvData.userId,
        cvId: cvData.id,
        options
      };

      this.activeGenerations.set(job.id, job);
      return job;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to start podcast generation');
    }
  }

  /**
   * Generate video introduction from CV data
    */
  async generateVideo(cvData: CVData, options: VideoOptions): Promise<GenerationJob> {
    this.ensureInitialized();

    try {
      const generateVideoFunction = httpsCallable(this.functions!, 'generateVideoIntroduction');

      const result: HttpsCallableResult<any> = await generateVideoFunction({
        cvData,
        options: {
          style: options.style,
          duration: options.duration,
          avatarStyle: options.avatarStyle || 'professional',
          background: options.background || 'office',
          includeSubtitles: options.includeSubtitles !== false,
          includeNameCard: options.includeNameCard !== false,
          quality: options.quality || 'high',
          orientation: options.orientation || 'landscape'
        }
      });

      const job: GenerationJob = {
        id: result.data.jobId,
        type: 'video',
        status: 'queued',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: cvData.userId,
        cvId: cvData.id,
        options
      };

      this.activeGenerations.set(job.id, job);
      return job;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to start video generation');
    }
  }

  /**
   * Get generation job status
    */
  async getGenerationStatus(jobId: string): Promise<GenerationStatus> {
    this.ensureInitialized();

    try {
      const getStatusFunction = httpsCallable(this.functions!, 'getGenerationStatus');
      const result: HttpsCallableResult<any> = await getStatusFunction({ jobId });

      const status: GenerationStatus = {
        jobId,
        status: result.data.status,
        progress: result.data.progress || 0,
        stage: result.data.stage || 'initializing',
        estimatedTimeRemaining: result.data.estimatedTimeRemaining,
        result: result.data.result ? {
          url: result.data.result.url,
          duration: result.data.result.duration,
          size: result.data.result.size || 0,
          format: result.data.result.format || 'unknown'
        } : undefined,
        error: result.data.error
      };

      // Update local cache
      const job = this.activeGenerations.get(jobId);
      if (job) {
        job.status = status.status;
        job.progress = status.progress;
        job.updatedAt = new Date();
        if (status.result) job.result = status.result;
        if (status.error) job.error = status.error;
      }

      return status;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to get generation status');
    }
  }

  /**
   * Cancel ongoing generation
    */
  async cancelGeneration(jobId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const cancelFunction = httpsCallable(this.functions!, 'cancelGeneration');
      await cancelFunction({ jobId });

      // Clean up local state
      this.activeGenerations.delete(jobId);
      const eventSource = this.eventSources.get(jobId);
      if (eventSource) {
        eventSource.close();
        this.eventSources.delete(jobId);
      }
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to cancel generation');
    }
  }

  // ============================================================================
  // MEDIA MANAGEMENT METHODS
  // ============================================================================

  /**
   * Upload media file with progress tracking
    */
  async uploadMedia(
    file: File,
    metadata: MediaMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaItem> {
    this.ensureInitialized();

    try {
      // Generate unique file path
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `${metadata.id || Date.now()}.${fileExtension}`;
      const filePath = `media/${metadata.userId}/${fileName}`;

      const storageRef = ref(this.storage!, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedBy: metadata.userId || '',
          mediaType: metadata.type,
          ...((metadata as any).customMetadata || {})
        }
      });

      // Track upload task
      this.activeUploads.set(fileName, uploadTask);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const progress: UploadProgress = {
                loaded: snapshot.bytesTransferred,
                total: snapshot.totalBytes,
                percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
                speed: 0, // Calculate if needed
                estimatedTimeRemaining: 0 // Calculate if needed
              };
              onProgress(progress);
            }
          },
          (error) => {
            this.activeUploads.delete(fileName);
            reject(this.handleFirebaseError(error, 'Upload failed'));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const fileMetadata = await getMetadata(uploadTask.snapshot.ref);

              const mediaItem: MediaItem = {
                id: fileName.split('.')[0],
                name: file.name,
                type: this.determineMediaType(file.type),
                url: downloadURL,
                size: file.size,
                format: fileExtension,
                metadata: {
                  ...metadata,
                  uploadedAt: new Date(fileMetadata.timeCreated),
                  contentType: file.type,
                  size: file.size
                },
                createdAt: new Date(),
                updatedAt: new Date()
              };

              this.activeUploads.delete(fileName);
              resolve(mediaItem);
            } catch (error) {
              this.activeUploads.delete(fileName);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to start upload');
    }
  }

  /**
   * Get media item by ID
    */
  async getMediaItem(mediaId: string): Promise<MediaItem> {
    this.ensureInitialized();

    try {
      const getMediaFunction = httpsCallable(this.functions!, 'getMediaItem');
      const result: HttpsCallableResult<any> = await getMediaFunction({ mediaId });
      return result.data as MediaItem;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to get media item');
    }
  }

  /**
   * Delete media item
    */
  async deleteMedia(mediaId: string): Promise<void> {
    this.ensureInitialized();

    try {
      // Delete from storage
      const mediaRef = ref(this.storage!, `media/${mediaId}`);
      await deleteObject(mediaRef);

      // Delete metadata from database
      const deleteMediaFunction = httpsCallable(this.functions!, 'deleteMedia');
      await deleteMediaFunction({ mediaId });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to delete media');
    }
  }

  /**
   * Get user's media items
    */
  async getUserMedia(userId: string, filters?: {
    type?: MediaType;
    limit?: number;
    offset?: number;
  }): Promise<MediaItem[]> {
    this.ensureInitialized();

    try {
      const getUserMediaFunction = httpsCallable(this.functions!, 'getUserMedia');
      const result: HttpsCallableResult<any> = await getUserMediaFunction({
        userId,
        filters: filters || {}
      });
      return result.data.items as MediaItem[];
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to get user media');
    }
  }

  // ============================================================================
  // PLAYLIST OPERATIONS
  // ============================================================================

  /**
   * Create new playlist
    */
  async createPlaylist(name: string, items: string[] = []): Promise<Playlist> {
    this.ensureInitialized();

    try {
      const createPlaylistFunction = httpsCallable(this.functions!, 'createPlaylist');
      const result: HttpsCallableResult<any> = await createPlaylistFunction({
        name,
        items
      });
      return result.data as Playlist;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to create playlist');
    }
  }

  /**
   * Get playlist by ID
    */
  async getPlaylist(playlistId: string): Promise<Playlist> {
    this.ensureInitialized();

    try {
      const getPlaylistFunction = httpsCallable(this.functions!, 'getPlaylist');
      const result: HttpsCallableResult<any> = await getPlaylistFunction({ playlistId });
      return result.data as Playlist;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to get playlist');
    }
  }

  /**
   * Update playlist
    */
  async updatePlaylist(playlistId: string, updates: PlaylistUpdate): Promise<Playlist> {
    this.ensureInitialized();

    try {
      const updatePlaylistFunction = httpsCallable(this.functions!, 'updatePlaylist');
      const result: HttpsCallableResult<any> = await updatePlaylistFunction({
        playlistId,
        updates
      });
      return result.data as Playlist;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to update playlist');
    }
  }

  /**
   * Delete playlist
    */
  async deletePlaylist(playlistId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const deletePlaylistFunction = httpsCallable(this.functions!, 'deletePlaylist');
      await deletePlaylistFunction({ playlistId });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to delete playlist');
    }
  }

  // ============================================================================
  // PLAYBACK CONTROL METHODS
  // ============================================================================

  /**
   * Start media playback session
    */
  async play(mediaId: string, options?: {
    quality?: QualityLevel;
    startPosition?: number;
    playlistId?: string;
  }): Promise<PlaybackSession> {
    this.ensureInitialized();

    try {
      const playFunction = httpsCallable(this.functions!, 'startPlayback');
      const result: HttpsCallableResult<any> = await playFunction({
        mediaId,
        options: options || {}
      });
      return result.data as PlaybackSession;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to start playback');
    }
  }

  /**
   * Pause playback
    */
  async pause(sessionId: string): Promise<void> {
    this.ensureInitialized();

    try {
      const pauseFunction = httpsCallable(this.functions!, 'pausePlayback');
      await pauseFunction({ sessionId });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to pause playback');
    }
  }

  /**
   * Seek to position
    */
  async seek(sessionId: string, position: number): Promise<void> {
    this.ensureInitialized();

    try {
      const seekFunction = httpsCallable(this.functions!, 'seekPlayback');
      await seekFunction({ sessionId, position });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to seek playback');
    }
  }

  /**
   * Set playback volume
    */
  async setVolume(sessionId: string, volume: number): Promise<void> {
    this.ensureInitialized();

    try {
      if (volume < 0 || volume > 1) {
        throw new Error('Volume must be between 0 and 1');
      }

      const setVolumeFunction = httpsCallable(this.functions!, 'setPlaybackVolume');
      await setVolumeFunction({ sessionId, volume });
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to set volume');
    }
  }

  // ============================================================================
  // REAL-TIME UPDATES
  // ============================================================================

  /**
   * Subscribe to generation progress updates
    */
  subscribeToGeneration(jobId: string, onUpdate?: (status: GenerationStatus) => void): EventSource {
    const eventSource = new EventSource(`/api/generation/${jobId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const status: GenerationStatus = JSON.parse(event.data);

        // Update local cache
        const job = this.activeGenerations.get(jobId);
        if (job) {
          job.status = status.status;
          job.progress = status.progress;
          job.updatedAt = new Date();
        }

        if (onUpdate) {
          onUpdate(status);
        }
      } catch (error) {
        console.error('Failed to parse generation update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Generation EventSource error:', error);
      eventSource.close();
      this.eventSources.delete(jobId);
    };

    this.eventSources.set(jobId, eventSource);
    return eventSource;
  }

  /**
   * Subscribe to playback events
    */
  subscribeToPlayback(sessionId: string, onUpdate?: (session: PlaybackSession) => void): EventSource {
    const eventSource = new EventSource(`/api/playback/${sessionId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const session: PlaybackSession = JSON.parse(event.data);

        if (onUpdate) {
          onUpdate(session);
        }
      } catch (error) {
        console.error('Failed to parse playback update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Playback EventSource error:', error);
      eventSource.close();
      this.eventSources.delete(sessionId);
    };

    this.eventSources.set(sessionId, eventSource);
    return eventSource;
  }

  // ============================================================================
  // SHARING AND EMBEDDING
  // ============================================================================

  /**
   * Generate sharing URL for media
    */
  async generateSharingUrl(mediaId: string, options: SharingOptions): Promise<string> {
    this.ensureInitialized();

    try {
      const generateSharingFunction = httpsCallable(this.functions!, 'generateSharingUrl');
      const result: HttpsCallableResult<any> = await generateSharingFunction({
        mediaId,
        options
      });
      return result.data.url;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to generate sharing URL');
    }
  }

  /**
   * Generate embed code for media
    */
  async generateEmbedCode(mediaId: string, options?: {
    width?: number;
    height?: number;
    autoplay?: boolean;
    controls?: boolean;
  }): Promise<string> {
    this.ensureInitialized();

    try {
      const generateEmbedFunction = httpsCallable(this.functions!, 'generateEmbedCode');
      const result: HttpsCallableResult<any> = await generateEmbedFunction({
        mediaId,
        options: options || {}
      });
      return result.data.embedCode;
    } catch (error) {
      throw this.handleFirebaseError(error, 'Failed to generate embed code');
    }
  }

  // ============================================================================
  // ANALYTICS AND TRACKING
  // ============================================================================

  /**
   * Track media engagement
    */
  async trackEngagement(mediaId: string, event: {
    type: 'view' | 'play' | 'pause' | 'seek' | 'complete';
    position?: number;
    duration?: number;
  }): Promise<void> {
    this.ensureInitialized();

    try {
      const trackFunction = httpsCallable(this.functions!, 'trackMediaEngagement');
      await trackFunction({
        mediaId,
        event: {
          ...event,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      // Don't throw for analytics errors, just log
      console.warn('Failed to track engagement:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Determine media type from MIME type
    */
  private determineMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image'; // fallback
  }

  /**
   * Handle Firebase errors with context
    */
  private handleFirebaseError(error: any, context: string): Error {
    console.error(`${context}:`, error);

    if (error.code) {
      switch (error.code) {
        case 'functions/unauthenticated':
          return new Error('Authentication required');
        case 'functions/permission-denied':
          return new Error('Permission denied');
        case 'functions/not-found':
          return new Error('Resource not found');
        case 'functions/already-exists':
          return new Error('Resource already exists');
        case 'functions/resource-exhausted':
          return new Error('Service temporarily unavailable');
        case 'functions/failed-precondition':
          return new Error('Invalid request state');
        case 'functions/aborted':
          return new Error('Operation aborted');
        case 'functions/out-of-range':
          return new Error('Invalid parameter value');
        case 'functions/unimplemented':
          return new Error('Feature not implemented');
        case 'functions/internal':
          return new Error('Internal server error');
        case 'functions/unavailable':
          return new Error('Service unavailable');
        case 'functions/data-loss':
          return new Error('Data corruption detected');
        default:
          return new Error(error.message || 'Unknown error occurred');
      }
    }

    return new Error(error.message || context);
  }

  /**
   * Clean up resources
    */
  public dispose(): void {
    // Close all EventSource connections
    this.eventSources.forEach((eventSource) => {
      eventSource.close();
    });
    this.eventSources.clear();

    // Cancel active uploads
    this.activeUploads.forEach((uploadTask) => {
      uploadTask.cancel();
    });
    this.activeUploads.clear();

    // Clear active generations
    this.activeGenerations.clear();
  }
}

// Export singleton instance
export const multimediaService = MultimediaService.getInstance();

// Types are exported as interfaces above and available for import
// No additional exports needed to avoid conflicts