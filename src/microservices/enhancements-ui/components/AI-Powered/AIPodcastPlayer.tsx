import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  RotateCcw,
  SkipBack,
  SkipForward,
  Loader2,
  FileAudio,
  Clock,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

import { CVFeatureProps, PodcastData } from '../../../types/cv-features';
import { FeatureWrapper } from '../Common/FeatureWrapper';
import { ErrorBoundary } from '../Common/ErrorBoundary';
// import { LoadingSpinner } from '../Common/LoadingSpinner'; // TODO: Use for loading states
import { useFeatureData } from '../../../hooks/useFeatureData';

interface PodcastPlayerProps extends CVFeatureProps {
  data: PodcastData;
  customization?: {
    autoplay?: boolean;
    showTranscript?: boolean;
    showDownload?: boolean;
    theme?: 'minimal' | 'full' | 'compact';
  };
}

interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  isMuted: boolean;
  isLoading: boolean;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  isActive: boolean;
}

export const AIPodcastPlayer: React.FC<PodcastPlayerProps> = ({
  jobId,
  isEnabled = true,
  data,
  customization = {},
  onError,
  className = '',
  mode = 'private'
}) => {
  const {
    autoplay = false,
    showTranscript = true,
    showDownload = true,
    theme = 'full'
  } = customization;

  // Feature data hook for podcast generation
  const { 
    data: hookData, 
    loading: isGenerating, 
    error: generationError, 
    refresh 
  } = useFeatureData<PodcastData>({
    jobId,
    featureName: 'podcast',
    initialData: data
  });

  // Use provided data or hook data
  const podcastData = data || hookData;

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Audio state
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
    isMuted: false,
    isLoading: false
  });

  // Transcript state
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<number>(-1);

  // Parse transcript into time-segmented chunks
  const parseTranscript = useCallback((transcript: string) => {
    if (!transcript) return [];
    
    // Simple transcript parsing - split by sentences and estimate timing
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim());
    const averageWordsPerMinute = 150;
    
    let currentTime = 0;
    return sentences.map((sentence) => {
      const wordCount = sentence.trim().split(' ').length;
      const duration = (wordCount / averageWordsPerMinute) * 60;
      
      const segment: TranscriptSegment = {
        start: currentTime,
        end: currentTime + duration,
        text: sentence.trim(),
        isActive: false
      };
      
      currentTime += duration;
      return segment;
    });
  }, []);

  // Update transcript segments when data changes
  useEffect(() => {
    if (podcastData?.transcript) {
      const segments = parseTranscript(podcastData.transcript);
      setTranscriptSegments(segments);
    }
  }, [podcastData?.transcript, parseTranscript]);

  // Audio event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        duration: audioRef.current?.duration || 0,
        isLoading: false
      }));
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      setAudioState(prev => ({ ...prev, currentTime }));
      
      // Update active transcript segment
      const activeIndex = transcriptSegments.findIndex(segment => 
        currentTime >= segment.start && currentTime <= segment.end
      );
      
      if (activeIndex !== currentSegment) {
        setCurrentSegment(activeIndex);
        
        // Auto-scroll transcript
        if (transcriptRef.current && activeIndex >= 0) {
          const activeElement = transcriptRef.current.children[activeIndex] as HTMLElement;
          if (activeElement) {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    }
  }, [transcriptSegments, currentSegment]);

  const handleEnded = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    setCurrentSegment(-1);
  }, []);

  const handleError = useCallback((error: Event | Error) => {
    console.error('Audio playback error:', error);
    toast.error('Audio playback failed. Please try again.');
    onError?.(new Error('Audio playback failed'));
  }, [onError]);

  // Audio control functions
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !podcastData?.audioUrl) return;
    
    if (audioState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(handleError);
    }
    
    setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [audioState.isPlaying, podcastData?.audioUrl, handleError]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const skipSeconds = useCallback((seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioState.duration, audioState.currentTime + seconds));
      seekTo(newTime);
    }
  }, [audioState.currentTime, audioState.duration, seekTo]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setAudioState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioState.isMuted;
      audioRef.current.muted = newMuted;
      setAudioState(prev => ({ ...prev, isMuted: newMuted }));
    }
  }, [audioState.isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setAudioState(prev => ({ ...prev, playbackRate: rate }));
    }
  }, []);

  // Download audio file
  const downloadAudio = useCallback(() => {
    if (!podcastData?.audioUrl) return;
    
    const link = document.createElement('a');
    link.href = podcastData.audioUrl;
    link.download = `${podcastData.title || 'podcast'}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Download started!');
  }, [podcastData]);

  // Share functionality
  const shareAudio = useCallback(async () => {
    if (!podcastData?.audioUrl) return;
    
    const shareData = {
      title: podcastData.title || 'AI Career Podcast',
      text: podcastData.description || 'Listen to my AI-generated career podcast',
      url: podcastData.audioUrl
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(podcastData.audioUrl);
        toast.success('Audio URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error('Share failed. Please try again.');
    }
  }, [podcastData]);

  // Transcript segment click handler
  const handleTranscriptClick = useCallback((segment: TranscriptSegment) => {
    seekTo(segment.start);
  }, [seekTo]);

  // Format time display
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (autoplay && podcastData?.audioUrl && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Auto-play was prevented, that's okay
          console.log('Auto-play was prevented by browser');
        });
      }
    }
  }, [autoplay, podcastData?.audioUrl]);

  if (!isEnabled) {
    return null;
  }

  // Generation status handling
  if (podcastData?.generationStatus === 'pending') {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="AI Career Podcast"
          description="Your personalized career podcast will be generated soon"
        >
          <div className="text-center py-8">
            <FileAudio className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Podcast Generation Queued
            </h3>
            <p className="text-sm text-gray-600">
              Your AI-powered career podcast will start generating once processing begins.
            </p>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  if (podcastData?.generationStatus === 'generating' || isGenerating) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="AI Career Podcast"
          description="Generating your personalized career podcast..."
        >
          <div className="text-center py-8">
            <div className="relative mb-6">
              <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Creating Your Podcast
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              AI is analyzing your CV and generating a personalized career narrative...
            </p>
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 rounded-full h-2 mb-2">
                <div className="animate-fade-in bg-blue-600 h-2 rounded-full w-1/3 transition-all duration-300"></div>
              </div>
              <p className="text-xs text-gray-500">Estimated time: 2-3 minutes</p>
            </div>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  if (podcastData?.generationStatus === 'failed' || generationError) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="AI Career Podcast"
          description="Podcast generation failed"
          error={generationError}
          onRetry={refresh}
        >
          <div className="text-center py-8">
            <FileAudio className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Generation Failed
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {generationError?.message || 'Failed to generate your career podcast. Please try again.'}
            </p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  if (!podcastData?.audioUrl) {
    return (
      <ErrorBoundary onError={onError}>
        <FeatureWrapper
          className={className}
          mode={mode}
          title="AI Career Podcast"
          description="No audio available"
        >
          <div className="text-center py-8">
            <FileAudio className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Podcast Available
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate your AI career podcast to listen to your personalized audio narrative.
            </p>
            <button
              onClick={refresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Podcast
            </button>
          </div>
        </FeatureWrapper>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <FeatureWrapper
        className={className}
        mode={mode}
        title={podcastData.title || "AI Career Podcast"}
        description={podcastData.description || "Your personalized career narrative"}
      >
        <div className={`space-y-6 ${theme === 'compact' ? 'space-y-3' : ''}`}>
          {/* Audio Element */}
          <audio
            ref={audioRef}
            src={podcastData.audioUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={handleError}
            preload="metadata"
          />

          {/* Header */}
          {theme !== 'minimal' && (
            <div className="text-center pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center mb-2">
                <FileAudio className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {podcastData.title || "AI Career Podcast"}
                </h3>
              </div>
              {podcastData.description && (
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {podcastData.description}
                </p>
              )}
              {podcastData.duration && (
                <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Duration: {formatTime(podcastData.duration)}</span>
                </div>
              )}
            </div>
          )}

          {/* Audio Controls */}
          <div className="bg-gray-50 rounded-xl p-6">
            {/* Waveform Placeholder */}
            <div className="mb-6">
              <div className="relative h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg overflow-hidden">
                {/* Simple waveform visualization */}
                <div className="flex items-end justify-center h-full space-x-1 p-2">
                  {Array.from({ length: 50 }, (_, i) => (
                    <div
                      key={i}
                      className="bg-blue-400 rounded-t"
                      style={{
                        height: `${Math.random() * 60 + 20}%`,
                        width: '2px',
                        opacity: (audioState.currentTime / audioState.duration) * 50 > i ? 1 : 0.3
                      }}
                    />
                  ))}
                </div>
                
                {/* Progress indicator */}
                <div 
                  className="absolute top-0 bottom-0 bg-blue-600 opacity-20 pointer-events-none"
                  style={{ 
                    width: `${(audioState.currentTime / audioState.duration) * 100}%`,
                    transition: 'width 0.1s ease-out'
                  }}
                />
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max={audioState.duration || 0}
                  value={audioState.currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(audioState.currentTime / audioState.duration) * 100}%, #E5E7EB ${(audioState.currentTime / audioState.duration) * 100}%, #E5E7EB 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{formatTime(audioState.currentTime)}</span>
                  <span>{formatTime(audioState.duration)}</span>
                </div>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                onClick={() => skipSeconds(-10)}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                title="Skip back 10 seconds"
              >
                <SkipBack className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={togglePlayPause}
                disabled={audioState.isLoading}
                className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                title={audioState.isPlaying ? 'Pause' : 'Play'}
              >
                {audioState.isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : audioState.isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <button
                onClick={() => skipSeconds(10)}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                title="Skip forward 10 seconds"
              >
                <SkipForward className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title={audioState.isMuted ? 'Unmute' : 'Mute'}
                >
                  {audioState.isMuted || audioState.volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioState.isMuted ? 0 : audioState.volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Playback Speed */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600">Speed:</span>
                <select
                  value={audioState.playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => seekTo(0)}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4 text-gray-600" />
                </button>
                
                {showDownload && (
                  <button
                    onClick={downloadAudio}
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                
                <button
                  onClick={shareAudio}
                  className="p-1 rounded hover:bg-gray-200 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Transcript */}
          {showTranscript && podcastData.transcript && transcriptSegments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 text-gray-600 mr-2" />
                  <h4 className="font-semibold text-gray-900">Transcript</h4>
                </div>
              </div>
              <div 
                ref={transcriptRef}
                className="p-4 max-h-64 overflow-y-auto space-y-3"
                style={{ scrollBehavior: 'smooth' }}
              >
                {transcriptSegments.map((segment, index) => (
                  <div 
                    key={index}
                    className={`animate-fade-in p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      index === currentSegment
                        ? 'bg-blue-100 border-l-4 border-blue-500 text-blue-900'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                    onClick={() => handleTranscriptClick(segment)}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`text-sm leading-relaxed ${
                        index === currentSegment ? 'font-medium' : ''
                      }`}>
                        {segment.text}
                      </p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(segment.start)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </FeatureWrapper>
    </ErrorBoundary>
  );
};