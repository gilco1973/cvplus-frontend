import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface HeroSectionProps {
  onScrollToUpload?: () => void;
  className?: string;
}

interface FeatureHighlight {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  delay: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToUpload,
  className = ''
}) => {
  const { t } = useTranslation();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [_showFeatures, _setShowFeatures] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Define features with translations
  const features: FeatureHighlight[] = [
    {
      id: 'ai-powered',
      title: t('features.items.aiPowered.title'),
      description: t('features.items.aiPowered.description'),
      icon: '🤖',
      gradient: 'from-blue-500 to-blue-600',
      delay: 100
    },
    {
      id: 'interactive-elements',
      title: t('features.items.interactiveElements.title'),
      description: t('features.items.interactiveElements.description'),
      icon: '✨',
      gradient: 'from-purple-500 to-pink-600',
      delay: 200
    },
    {
      id: 'multiple-formats',
      title: t('features.items.multipleFormats.title'),
      description: t('features.items.multipleFormats.description'),
      icon: '📄',
      gradient: 'from-orange-500 to-red-600',
      delay: 300
    },
    {
      id: 'ats-optimization',
      title: t('features.items.atsOptimization.title'),
      description: t('features.items.atsOptimization.description'),
      icon: '🎯',
      gradient: 'from-green-500 to-emerald-600',
      delay: 400
    },
    {
      id: 'real-time-processing',
      title: t('features.items.realTimeProcessing.title'),
      description: t('features.items.realTimeProcessing.description'),
      icon: '⚡',
      gradient: 'from-yellow-500 to-orange-500',
      delay: 500
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          _setShowFeatures(true);
        }
      },
      { threshold: 0.3 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setVideoCurrentTime(video.currentTime);
    const handleDurationChange = () => setVideoDuration(video.duration);
    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);
    const handleEnded = () => setIsVideoPlaying(false);
    const handleLoadedData = () => setIsVideoLoaded(true);
    const handleError = () => setIsVideoLoaded(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isVideoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsVideoMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleVideoSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
  };

  const _formatTime = (_time: number) => {
    const minutes = Math.floor(_time / 60);
    const seconds = Math.floor(_time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleGetStartedClick = () => {
    if (onScrollToUpload) {
      onScrollToUpload();
    } else {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={heroRef}
      className={`relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden ${className}`}
      aria-label={t('hero.accessibility.sectionLabel')}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="animate-fade-in text-4xl md:text-6xl lg:text-7xl font-bold text-gray-100 mb-6 leading-tight">
              {t('hero.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">
                {t('hero.titleHighlight')}
              </span>
            </h1>
            
            <p className="animate-fade-in text-2xl md:text-3xl font-light text-gray-300 mb-6">
              {t('hero.subtitle')}
            </p>
            
            <p className="animate-fade-in text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('hero.description')}
            </p>
            
            <div className="animate-fade-in flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button 
                onClick={handleGetStartedClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 hover-glow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label={t('hero.cta.getStartedAria')}
              >
                <Sparkles className="inline-block w-5 h-5 mr-2" />
                {t('hero.cta.getStarted')}
              </button>
              
              <button 
                onClick={handlePlayPause}
                className="px-6 py-4 border-2 border-blue-500 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label={isVideoPlaying ? t('hero.cta.pauseDemoAria') : t('hero.cta.playDemoAria')}
              >
                {isVideoPlaying ? (
                  <><Pause className="inline-block w-5 h-5 mr-2" />{t('hero.cta.pauseDemo')}</>
                ) : (
                  <><Play className="inline-block w-5 h-5 mr-2" />{t('hero.cta.watchDemo')}</>
                )}
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="animate-fade-in flex flex-wrap justify-center lg:justify-start gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">10,000+</div>
                <div className="text-sm text-gray-400">{t('hero.trustIndicators.cvsTransformed')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">4.9/5</div>
                <div className="text-sm text-gray-400">{t('hero.trustIndicators.userRating')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400">30 sec</div>
                <div className="text-sm text-gray-400">{t('hero.trustIndicators.averageTime')}</div>
              </div>
            </div>
          </div>

          {/* Right Column - Video Player */}
          <div className="animate-fade-in relative">
            <div 
              className="relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 group"
              onMouseEnter={() => setShowVideoControls(true)}
              onMouseLeave={() => setShowVideoControls(false)}
            >
              {/* Video Element - CVPlus Intro Video */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted={isVideoMuted}
                  loop
                  playsInline
                  onLoadedMetadata={() => {
                    // Auto-set duration when video metadata loads
                    if (videoRef.current) {
                      setVideoDuration(videoRef.current.duration);
                      setIsVideoLoaded(true);
                    }
                  }}
                >
                  {/* CVPlus intro video */}
                  <source src="/videos/intro.mp4" type="video/mp4" />
                  {t('hero.accessibility.browserNotSupported')}
                </video>
                
                {/* Video Placeholder Content - Only show when video is not loaded */}
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-300">
                      <div className="w-20 h-20 mx-auto mb-4 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <Play className="w-10 h-10 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{t('hero.video.title')}</h3>
                      <p className="text-gray-400">{t('hero.video.description')}</p>
                    </div>
                  </div>
                )}

                {/* Video Controls Overlay */}
                <div>
                  {showVideoControls && (
                    <div className="animate-fade-in absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePlayPause}
                          className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={isVideoPlaying ? t('hero.accessibility.videoControls.pauseVideo') : t('hero.accessibility.videoControls.playVideo')}
                        >
                          {isVideoPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                          ) : (
                            <Play className="w-6 h-6 text-white" />
                          )}
                        </button>
                        
                        <button
                          onClick={handleMuteToggle}
                          className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={isVideoMuted ? t('hero.accessibility.videoControls.unmuteVideo') : t('hero.accessibility.videoControls.muteVideo')}
                        >
                          {isVideoMuted ? (
                            <VolumeX className="w-5 h-5 text-white" />
                          ) : (
                            <Volume2 className="w-5 h-5 text-white" />
                          )}
                        </button>
                        
                        <button
                          onClick={handleFullscreen}
                          className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                          aria-label={t('hero.accessibility.videoControls.enterFullscreen')}
                        >
                          <Maximize className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {videoDuration > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="w-full h-1 bg-white/30 rounded-full">
                      <div 
                        className="h-1 bg-blue-500 rounded-full transition-all duration-100"
                        style={{ width: `${(videoCurrentTime / videoDuration) * 100}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      value={videoCurrentTime}
                      onChange={(e) => handleVideoSeek(Number(e.target.value))}
                      className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer"
                      aria-label={t('hero.accessibility.videoControls.videoProgress')}
                    />
                  </div>
                )}
              </div>
              
              {/* CVPlus Branding Overlay */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                <span className="text-white text-sm font-medium">{t('hero.video.brand')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlighting Section */}
        <div className="animate-fade-in mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, _index) => (
              <div 
                key={feature.id}
                className="animate-fade-in bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover-lift group"
              >
                <div className={`bg-gradient-to-br ${feature.gradient} rounded-lg p-4 w-14 h-14 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl" role="img" aria-label={feature.title}>
                    {feature.icon}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-gray-100 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};