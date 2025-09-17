import { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  Loader2, 
  Sparkles, 
  Volume2,
  FileText,
  Share2,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PodcastGenerationProps {
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  chapters?: Array<{
    title: string;
    startTime: number;
    endTime: number;
  }>;
  status?: 'not-generated' | 'generating' | 'ready' | 'failed';
  onGeneratePodcast: () => Promise<{
    audioUrl: string;
    transcript: string;
    duration: number;
    chapters: Array<{ title: string; startTime: number; endTime: number }>;
  }>;
  onRegeneratePodcast: (style?: 'professional' | 'conversational' | 'storytelling') => Promise<void>;
}

export const PodcastGeneration = ({
  audioUrl,
  transcript,
  duration = 0,
  chapters = [],
  status = 'not-generated',
  onGeneratePodcast,
  onRegeneratePodcast
}: PodcastGenerationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'professional' | 'conversational' | 'storytelling'>('professional');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);

    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await onGeneratePodcast();
      toast.success('Podcast generated successfully!');
    } catch {
      toast.error('Failed to generate podcast');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await onRegeneratePodcast(selectedStyle);
      toast.success('Podcast regenerated successfully!');
    } catch {
      toast.error('Failed to regenerate podcast');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChapter = () => {
    return chapters.find(
      chapter => currentTime >= chapter.startTime && currentTime <= chapter.endTime
    );
  };

  if (status === 'not-generated') {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <Mic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Generate Your Career Podcast
        </h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Transform your CV into an engaging 3-5 minute podcast episode that tells your professional story.
        </p>
        <div className="space-y-4 max-w-sm mx-auto">
          <div className="text-left space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI-narrated career journey</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Professional audio quality</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Chapter markers for easy navigation</span>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                Generating Podcast...
              </>
            ) : (
              'Generate Career Podcast'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (status === 'generating') {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Mic className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Recording Your Story...
          </h3>
          <p className="text-gray-400 mb-4">
            Creating your personalized career podcast. This takes about 2-3 minutes.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✓ Analyzing career highlights</p>
            <p className="text-purple-400">→ Generating narrative script...</p>
            <p>• Recording audio narration</p>
            <p>• Adding chapter markers</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-purple-700/30">
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
        )}
        
        {/* Current Chapter */}
        {getCurrentChapter() && (
          <div className="mb-4 text-center">
            <p className="text-sm text-purple-400">Now Playing</p>
            <h4 className="text-lg font-semibold text-gray-100">{getCurrentChapter()?.title}</h4>
          </div>
        )}

        {/* Waveform Visualization */}
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-center gap-1 h-16">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all ${
                  i < (currentTime / duration) * 30 ? 'opacity-100' : 'opacity-30'
                }`}
                style={{ height: `${20 + Math.sin(i) * 20}px` }}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            className="bg-gray-700 rounded-full h-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              handleSeek(percentage * duration);
            }}
          >
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleSeek(Math.max(0, currentTime - 10))}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipBack className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:shadow-lg transform hover:scale-105 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </button>
          <button
            onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipForward className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Chapters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-purple-500" />
          Episode Chapters
        </h4>
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              onClick={() => handleSeek(chapter.startTime)}
              className={`w-full text-left p-3 rounded-lg transition-all ${
                getCurrentChapter()?.title === chapter.title
                  ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-200">{chapter.title}</p>
                  <p className="text-sm text-gray-400">
                    {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                  </p>
                </div>
                {getCurrentChapter()?.title === chapter.title && (
                  <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Style Selection */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Narration Style</h4>
          <div className="space-y-2">
            {(['professional', 'conversational', 'storytelling'] as const).map((style) => (
              <label key={style} className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="style"
                  value={style}
                  checked={selectedStyle === style}
                  onChange={(e) => setSelectedStyle(e.target.value as typeof selectedStyle)}
                  className="mr-3 text-purple-500"
                />
                <div>
                  <p className="font-medium text-gray-200 capitalize">{style}</p>
                  <p className="text-sm text-gray-400">
                    {style === 'professional' && 'Formal, executive-style narration'}
                    {style === 'conversational' && 'Friendly, approachable tone'}
                    {style === 'storytelling' && 'Engaging narrative format'}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Regenerating...' : 'Regenerate with Style'}
          </button>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Podcast Actions</h4>
          <div className="space-y-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                View Transcript
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
            </button>
            
            {audioUrl && (
              <a
                href={audioUrl}
                download="career-podcast.mp3"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download MP3
                </span>
                <span className="text-sm text-gray-400">~5MB</span>
              </a>
            )}
            
            <button
              onClick={() => {
                const shareUrl = `${window.location.origin}/podcast/${audioUrl}`;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Podcast link copied!');
              }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Share Podcast
            </button>
          </div>
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && transcript && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Episode Transcript</h4>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{transcript}</p>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-6 border border-purple-700/30">
        <h4 className="font-semibold text-gray-100 mb-3">Ways to Use Your Career Podcast</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Embed in your portfolio website for a unique personal touch</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Share on LinkedIn to stand out from other candidates</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Include a link in your email signature for networking</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>Send to recruiters as a creative introduction</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Add missing imports
