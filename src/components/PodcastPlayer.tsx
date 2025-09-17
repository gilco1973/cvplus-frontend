import React, { useState, useEffect, useCallback } from 'react';
import { Play, Download, FileText, RefreshCw, Clock, RotateCcw, Crown } from 'lucide-react';
import { getPodcastStatus, generateEnhancedPodcast, regeneratePodcast } from '../services/cvService';
import { usePremiumStatus } from '../hooks/usePremiumStatus';
import toast from 'react-hot-toast';

interface PodcastPlayerProps {
  jobId: string;
}

interface PodcastStatus {
  status: 'not-started' | 'generating' | 'ready' | 'failed';
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  error?: string;
  message?: string;
}

export const PodcastPlayer: React.FC<PodcastPlayerProps> = ({ jobId }) => {
  const [podcastStatus, setPodcastStatus] = useState<PodcastStatus>({ status: 'not-started' });
  const [showTranscript, setShowTranscript] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const { isPremium, isLoading: premiumLoading } = usePremiumStatus();

  const startPolling = useCallback(() => {
    if (checkInterval) {
      clearInterval(checkInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await getPodcastStatus(jobId);
        setPodcastStatus(response as PodcastStatus);

        if ((response as PodcastStatus).status === 'ready' || (response as PodcastStatus).status === 'failed') {
          clearInterval(interval);
          setCheckInterval(null);
          setGenerating(false);
        }
      } catch (error) {
        console.error('Error polling podcast status:', error);
      }
    }, 5000);

    setCheckInterval(interval);
  }, [checkInterval, jobId]);

  const checkPodcastStatus = useCallback(async () => {
    // Only check status for premium users
    if (!isPremium) {
      setPodcastStatus({ status: 'not-started' });
      setLoading(false);
      return;
    }
    
    try {
      const response = await getPodcastStatus(jobId);
      setPodcastStatus(response as PodcastStatus);
      setLoading(false);

      // If generating, start polling
      if ((response as PodcastStatus).status === 'generating') {
        startPolling();
      }
    } catch (error) {
      console.error('Error checking podcast status:', error);
      setPodcastStatus({ status: 'not-started' });
      setLoading(false);
    }
  }, [jobId, startPolling, isPremium]);

  useEffect(() => {
    // Only check podcast status for premium users
    if (isPremium && !premiumLoading) {
      checkPodcastStatus();
    } else if (!premiumLoading) {
      // For non-premium users, set to not-started and stop loading
      setPodcastStatus({ status: 'not-started' });
      setLoading(false);
    }
    
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [jobId, isPremium, premiumLoading]);

  const handleGeneratePodcast = async () => {
    if (!isPremium) {
      toast.error('Podcast generation is a Premium feature. Please upgrade to access this feature.');
      return;
    }
    
    setGenerating(true);
    try {
      await generateEnhancedPodcast(jobId, 'professional');
      setPodcastStatus({ status: 'generating', message: 'Generating your podcast...' });
      startPolling();
      toast.success('Podcast generation started!');
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast.error('Failed to start podcast generation');
      setGenerating(false);
    }
  };

  const handleRegeneratePodcast = async () => {
    if (!isPremium) {
      toast.error('Podcast regeneration is a Premium feature. Please upgrade to access this feature.');
      return;
    }
    
    setGenerating(true);
    try {
      await regeneratePodcast(jobId, 'professional');
      setPodcastStatus({ status: 'generating', message: 'Regenerating your podcast...' });
      startPolling();
      toast.success('Podcast regeneration started!');
    } catch (error) {
      console.error('Error regenerating podcast:', error);
      toast.error('Failed to regenerate podcast');
      setGenerating(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        <span className="ml-3 text-gray-300">Checking podcast status...</span>
      </div>
    );
  }

  if (podcastStatus.status === 'not-started') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-purple-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-200 mb-2 flex items-center justify-center gap-2">
          AI Career Podcast
          {!isPremium && <Crown className="w-5 h-5 text-yellow-400" />}
        </h4>
        <p className="text-sm text-gray-400 mb-4">
          Generate an AI-powered audio summary of your professional journey
        </p>
        {!isPremium && (
          <p className="text-sm text-yellow-400 mb-4 bg-yellow-400/10 rounded-lg p-3 max-w-md mx-auto">
            <Crown className="w-4 h-4 inline mr-1" />
            Premium Feature - Upgrade to generate podcasts
          </p>
        )}
        <button
          onClick={handleGeneratePodcast}
          disabled={generating || !isPremium || premiumLoading}
          className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto ${
            !isPremium 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
          }`}
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              {!isPremium ? <Crown className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {!isPremium ? 'Premium Feature' : 'Generate Podcast'}
            </>
          )}
        </button>
      </div>
    );
  }

  if (podcastStatus.status === 'generating') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
        <h4 className="text-lg font-medium text-gray-200 mb-2">Generating Podcast...</h4>
        <p className="text-sm text-gray-400 mb-2">
          {podcastStatus.message || 'Creating your personalized career podcast...'}
        </p>
        <p className="text-xs text-gray-500">This usually takes 2-3 minutes</p>
        <div className="mt-4 bg-gray-600 rounded-full h-2 max-w-xs mx-auto">
          <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
        </div>
      </div>
    );
  }

  if (podcastStatus.status === 'failed') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-400" />
        </div>
        <h4 className="text-lg font-medium text-gray-200 mb-2">Generation Failed</h4>
        <p className="text-sm text-red-400 mb-4">
          {podcastStatus.error || 'Failed to generate podcast'}
        </p>
        <button
          onClick={handleGeneratePodcast}
          disabled={generating}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Try Again
            </>
          )}
        </button>
      </div>
    );
  }

  if (podcastStatus.status === 'ready' && podcastStatus.audioUrl) {
    return (
      <div className="space-y-4">
        {/* Audio Player */}
        <div className="bg-gray-600 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-200">AI Career Podcast</h4>
            {podcastStatus.duration && (
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(podcastStatus.duration)}
              </span>
            )}
          </div>
          
          <audio 
            controls 
            className="w-full mb-3"
            onPlay={() => {}}
            onPause={() => {}}
          >
            <source src={podcastStatus.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <FileText className="w-3 h-3" />
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
            
            <a
              href={podcastStatus.audioUrl}
              download="career-podcast.mp3"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download
            </a>

            <button
              onClick={handleRegeneratePodcast}
              disabled={generating || !isPremium}
              className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                !isPremium 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white'
              }`}
            >
              {generating ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                <>
                  {!isPremium ? <Crown className="w-3 h-3" /> : <RotateCcw className="w-3 h-3" />}
                </>
              )}
              {!isPremium ? 'Premium' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Transcript */}
        {showTranscript && podcastStatus.transcript && (
          <div className="bg-gray-600 rounded-lg p-4">
            <h5 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Transcript
            </h5>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {podcastStatus.transcript}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};