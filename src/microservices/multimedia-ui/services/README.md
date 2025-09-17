# MultimediaService

The MultimediaService is a comprehensive frontend API service that provides a clean interface for all multimedia generation and management operations in the CVPlus platform.

## Features

- **Content Generation**: Podcast and video creation from CV data
- **Media Management**: Upload, organize, and manage multimedia files
- **Playlist Operations**: Create, modify, and manage playlists
- **Playback Control**: Remote playback control and synchronization
- **Progress Tracking**: Real-time generation progress updates
- **Quality Management**: Multiple quality options and optimization
- **Sharing Operations**: Social sharing and embedding functionality
- **Analytics Integration**: Track multimedia engagement and usage

## Quick Start

### 1. Initialize the Service

```typescript
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { forDevelopment } from '@cvplus/multimedia/frontend';

// Initialize Firebase
const functions = getFunctions(app);
const storage = getStorage(app);

// Initialize MultimediaService for development
const multimediaService = forDevelopment(functions, storage);
```

### 2. Generate a Podcast

```typescript
const cvData = {
  id: 'cv-123',
  userId: 'user-456',
  personalInfo: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    summary: 'Experienced software engineer'
  },
  experience: [...],
  education: [...],
  skills: [...]
};

const podcastOptions = {
  style: 'professional',
  duration: 'medium',
  voice: 'male'
};

// Start podcast generation
const job = await multimediaService.generatePodcast(cvData, podcastOptions);

// Subscribe to progress updates
const eventSource = multimediaService.subscribeToGeneration(job.id, (status) => {
  console.log(`Progress: ${status.progress}% - ${status.stage}`);

  if (status.status === 'completed' && status.result) {
    console.log('Podcast URL:', status.result.url);
  }
});
```

### 3. Upload Media Files

```typescript
const file = fileInput.files[0]; // From file input
const metadata = {
  id: `media-${Date.now()}`,
  userId: 'user-456',
  type: 'image',
  tags: ['portfolio', 'project']
};

const mediaItem = await multimediaService.uploadMedia(
  file,
  metadata,
  (progress) => {
    console.log(`Upload: ${progress.percentage}%`);
  }
);
```

## API Reference

### Content Generation

- `generatePodcast(cvData, options)` - Generate podcast from CV data
- `generateVideo(cvData, options)` - Generate video introduction
- `getGenerationStatus(jobId)` - Get generation progress
- `cancelGeneration(jobId)` - Cancel ongoing generation

### Media Management

- `uploadMedia(file, metadata, onProgress)` - Upload media with progress
- `getMediaItem(mediaId)` - Get media item by ID
- `deleteMedia(mediaId)` - Delete media item
- `getUserMedia(userId, filters)` - Get user's media collection

### Playlist Operations

- `createPlaylist(name, items)` - Create new playlist
- `getPlaylist(playlistId)` - Get playlist by ID
- `updatePlaylist(playlistId, updates)` - Update playlist
- `deletePlaylist(playlistId)` - Delete playlist

### Playback Control

- `play(mediaId, options)` - Start media playback
- `pause(sessionId)` - Pause playback
- `seek(sessionId, position)` - Seek to position
- `setVolume(sessionId, volume)` - Set playback volume

### Real-time Updates

- `subscribeToGeneration(jobId, callback)` - Subscribe to generation progress
- `subscribeToPlayback(sessionId, callback)` - Subscribe to playback events

### Sharing & Analytics

- `generateSharingUrl(mediaId, options)` - Generate sharing URL
- `generateEmbedCode(mediaId, options)` - Generate embed code
- `trackEngagement(mediaId, event)` - Track media engagement

## Initialization Options

### Development Environment

```typescript
import { forDevelopment } from '@cvplus/multimedia/frontend';

const multimediaService = forDevelopment(functions, storage);
// Automatically connects to Firebase emulators
```

### Production Environment

```typescript
import { forProduction } from '@cvplus/multimedia/frontend';

const multimediaService = forProduction(functions, storage);
// Optimized for production use
```

### Custom Configuration

```typescript
import { initializeMultimediaService } from '@cvplus/multimedia/frontend';

const multimediaService = initializeMultimediaService({
  functions,
  storage,
  useEmulator: true,
  emulatorConfig: {
    functionsPort: 5001,
    storagePort: 9199,
    host: 'localhost'
  },
  enableLogging: true
});
```

## Error Handling

The service provides comprehensive error handling with specific error types:

- `Authentication required` - User needs to log in
- `Permission denied` - Insufficient permissions
- `Service unavailable` - Temporary service issues
- `Resource not found` - Requested resource doesn't exist

```typescript
try {
  const job = await multimediaService.generatePodcast(cvData, options);
} catch (error) {
  if (error.message.includes('Authentication required')) {
    // Handle authentication
  } else if (error.message.includes('Permission denied')) {
    // Handle permissions
  } else {
    // Handle other errors
  }
}
```

## Resource Cleanup

Always clean up resources when the component unmounts:

```typescript
// Clean up all EventSource connections and upload tasks
multimediaService.dispose();
```

## TypeScript Support

The service includes comprehensive TypeScript definitions for all operations:

```typescript
import type {
  CVData,
  PodcastOptions,
  VideoOptions,
  GenerationJob,
  MediaItem,
  Playlist
} from '@cvplus/multimedia/frontend';
```

## Examples

See `MultimediaServiceExamples` for complete usage examples covering all service features.