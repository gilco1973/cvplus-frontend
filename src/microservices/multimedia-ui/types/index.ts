// @ts-ignore
/**
 * CVPlus Multimedia Frontend Types
 * 
 * Frontend-specific TypeScript type definitions for multimedia components
 * 
 * @author Gil Klainert
 * @version 1.0.0
 * @license PROPRIETARY
  */

import { ReactNode } from 'react';

// ============================================================================
// UPLOAD COMPONENT TYPES
// ============================================================================

export interface UploadProgress {
  progress: number;
  stage: 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export interface UploadConfig {
  maxSize: number;
  allowedTypes: string[];
  quality?: number;
  resize?: {
    width: number;
    height: number;
  };
}

export interface ProfilePictureUploadProps {
  onUpload?: (file: File) => void;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (url: string) => void;
  onError?: (error: string) => void;
  currentImageUrl?: string;
  config?: UploadConfig;
  className?: string;
}

export interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (urls: string[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  accept?: string;
  config?: UploadConfig;
  className?: string;
  children?: ReactNode;
}

// ============================================================================
// MULTIMEDIA COMPONENT PROPS
// ============================================================================

export interface MultimediaComponentProps {
  userId?: string;
  sessionId?: string;
  onError?: (error: string) => void;
  onComplete?: (result: any) => void;
  className?: string;
}

// ============================================================================
// MEDIA PLAYER TYPES
// ============================================================================

export interface MediaPlayerConfig {
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  volume?: number;
}

export interface AudioPlayerProps extends MultimediaComponentProps {
  src: string;
  title?: string;
  config?: MediaPlayerConfig;
}

export interface VideoPlayerProps extends MultimediaComponentProps {
  src: string;
  title?: string;
  poster?: string;
  config?: MediaPlayerConfig;
}

// ============================================================================
// GALLERY TYPES
// ============================================================================

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
}

export interface GalleryProps extends MultimediaComponentProps {
  items: GalleryItem[];
  layout?: 'grid' | 'masonry' | 'carousel';
  itemsPerRow?: number;
  onItemClick?: (item: GalleryItem) => void;
}

// ============================================================================
// GENERATION TYPES
// ============================================================================

export interface GenerationProgress {
  stage: string;
  progress: number;
  estimatedTimeRemaining?: number;
  message?: string;
}

export interface GenerationConfig {
  quality?: 'low' | 'medium' | 'high';
  duration?: number;
  style?: string;
}

export interface PodcastGenerationProps extends MultimediaComponentProps {
  text?: string;
  config?: GenerationConfig;
  onProgress?: (progress: GenerationProgress) => void;
}

export interface VideoGenerationProps extends MultimediaComponentProps {
  script?: string;
  config?: GenerationConfig;
  onProgress?: (progress: GenerationProgress) => void;
}