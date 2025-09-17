import { useState, useEffect, useRef } from 'react';
import { Video, Upload, Play, Pause, RefreshCw, Download, Loader2, Sparkles, Settings, User, Zap, Award, BarChart3, Clock, CheckCircle, AlertCircle, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProviderSelectionPanel } from './video/ProviderSelectionPanel';
import { IndustryTemplateSelector } from './video/IndustryTemplateSelector';
import { RealTimeStatusMonitor } from './video/RealTimeStatusMonitor';
import { ScriptOptimizationPanel } from './video/ScriptOptimizationPanel';
import { VideoAnalyticsDashboard } from './video/VideoAnalyticsDashboard';

interface VideoProvider {
  id: 'heygen' | 'runwayml' | 'did';
  name: string;
  description: string;
  capabilities: string[];
  reliability: number;
  estimatedTime: number;
  qualityRating: number;
  costTier: 'low' | 'medium' | 'high';
}

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  preview: string;
  tags: string[];
  qualityScore: number;
}

interface VideoGenerationStatus {
  provider: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  estimatedTime?: number;
  qualityScore?: number;
  error?: string;
}

interface EnhancedVideoGenerationOptions {
  provider?: 'heygen' | 'runwayml' | 'did';
  industry?: string;
  template?: string;
  duration?: 'short' | 'medium' | 'long';
  style?: 'professional' | 'friendly' | 'energetic';
  avatarStyle?: 'realistic' | 'illustrated' | 'corporate';
  background?: 'office' | 'modern' | 'gradient';
  qualityLevel?: 'basic' | 'standard' | 'premium';
  urgency?: 'low' | 'normal' | 'high';
  useAdvancedPrompts?: boolean;
  targetIndustry?: string;
  includeSubtitles?: boolean;
  includeNameCard?: boolean;
}

interface VideoIntroductionProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  status?: 'not-generated' | 'generating' | 'ready' | 'failed';
  script?: string;
  subtitles?: string;
  jobId?: string;
  enhancedStatus?: VideoGenerationStatus;
  provider?: string;
  qualityScore?: number;
  industryAlignment?: number;
  onGenerateVideo: (options?: EnhancedVideoGenerationOptions) => Promise<{ videoUrl: string; thumbnailUrl: string; duration: number; script: string; subtitles?: string; provider?: string; qualityScore?: number }>;
  onRegenerateVideo: (customScript?: string, options?: EnhancedVideoGenerationOptions) => Promise<{ videoUrl: string; thumbnailUrl: string; duration: number }>;
  onGetStatus?: (jobId: string) => Promise<VideoGenerationStatus>;
}

export const VideoIntroduction = ({
  videoUrl,
  thumbnailUrl,
  duration,
  status = 'not-generated',
  script,
  jobId,
  enhancedStatus,
  provider,
  qualityScore,
  industryAlignment,
  onGenerateVideo,
  onRegenerateVideo,
  onGetStatus
}: VideoIntroductionProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScriptEditor, setShowScriptEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProviderSelection, setShowProviderSelection] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [customScript, setCustomScript] = useState(script || '');
  const [currentStatus, setCurrentStatus] = useState<VideoGenerationStatus | null>(enhancedStatus || null);
  const [selectedProvider, setSelectedProvider] = useState<VideoProvider | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);
  
  const [videoSettings, setVideoSettings] = useState<EnhancedVideoGenerationOptions>({
    duration: 'medium',
    style: 'professional',
    avatarStyle: 'realistic',
    background: 'office',
    qualityLevel: 'standard',
    urgency: 'normal',
    useAdvancedPrompts: true,
    includeSubtitles: true,
    includeNameCard: true,
    provider: 'heygen'
  });

  // Available providers configuration
  const availableProviders: VideoProvider[] = [
    {
      id: 'heygen',
      name: 'HeyGen',
      description: 'AI-driven marketing focus with enterprise reliability',
      capabilities: ['High-quality avatars', 'Voice cloning', 'Real-time updates', '40+ languages'],
      reliability: 95,
      estimatedTime: 60,
      qualityRating: 9.5,
      costTier: 'medium'
    },
    {
      id: 'runwayml',
      name: 'RunwayML',
      description: 'Cutting-edge AI with advanced creative controls',
      capabilities: ['Creative effects', 'Style transfer', 'Motion control', 'Artistic quality'],
      reliability: 90,
      estimatedTime: 45,
      qualityRating: 9.0,
      costTier: 'high'
    },
    {
      id: 'did',
      name: 'D-ID',
      description: 'Reliable fallback with proven stability',
      capabilities: ['Stable generation', 'Quick processing', 'Cost effective', 'Reliable'],
      reliability: 85,
      estimatedTime: 90,
      qualityRating: 8.0,
      costTier: 'low'
    }
  ];

  // Real-time status monitoring
  useEffect(() => {
    if (jobId && onGetStatus && (status === 'generating' || (currentStatus && currentStatus.status === 'processing'))) {
      statusCheckInterval.current = setInterval(async () => {
        try {
          const statusUpdate = await onGetStatus(jobId);
          setCurrentStatus(statusUpdate);
          
          if (statusUpdate.status === 'completed' || statusUpdate.status === 'failed') {
            if (statusCheckInterval.current) {
              clearInterval(statusCheckInterval.current);
            }
          }
        } catch (error) {
          console.error('Status check failed:', error);
        }
      }, 2000);
    }

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [jobId, status, currentStatus, onGetStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProviderById = (providerId: string): VideoProvider | undefined => {
    return availableProviders.find(p => p.id === providerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      case 'queued': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 9) return 'text-green-400';
    if (score >= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Include selected provider and template in options
      const enhancedOptions: EnhancedVideoGenerationOptions = {
        ...videoSettings,
        provider: selectedProvider?.id || videoSettings.provider,
        template: selectedTemplate?.id,
        targetIndustry: selectedTemplate?.industry
      };
      
      const result = await onGenerateVideo(enhancedOptions);
      setCustomScript(result.script);
      
      // Update current status if available
      if (result.provider) {
        setCurrentStatus({
          provider: result.provider,
          status: 'processing',
          progress: 25,
          currentStep: 'Generating enhanced script with AI optimization...',
          qualityScore: result.qualityScore
        });
      }
      
      toast.success(`Video generation started with ${selectedProvider?.name || 'selected provider'}!`);
    } catch (error: any) {
      toast.error(`Failed to generate video: ${error.message || 'Unknown error'}`);
      console.error('Video generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const enhancedOptions: EnhancedVideoGenerationOptions = {
        ...videoSettings,
        provider: selectedProvider?.id || videoSettings.provider,
        template: selectedTemplate?.id,
        targetIndustry: selectedTemplate?.industry
      };
      
      await onRegenerateVideo(showScriptEditor ? customScript : undefined, enhancedOptions);
      toast.success('Video regeneration started!');
      setShowScriptEditor(false);
      
      // Reset status for regeneration
      if (currentStatus) {
        setCurrentStatus({
          ...currentStatus,
          status: 'processing',
          progress: 0,
          currentStep: 'Regenerating with enhanced settings...'
        });
      }
    } catch (error: any) {
      toast.error(`Failed to regenerate video: ${error.message || 'Unknown error'}`);
      console.error('Video regeneration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelection = (provider: VideoProvider) => {
    setSelectedProvider(provider);
    setVideoSettings(prev => ({ ...prev, provider: provider.id }));
    setShowProviderSelection(false);
    toast.success(`Selected ${provider.name} for video generation`);
  };

  const handleTemplateSelection = (template: IndustryTemplate) => {
    setSelectedTemplate(template);
    setVideoSettings(prev => ({ 
      ...prev, 
      template: template.id,
      targetIndustry: template.industry 
    }));
    setShowTemplateSelector(false);
    toast.success(`Applied ${template.name} template`);
  };

  if (status === 'not-generated') {
    return (
      <div className="space-y-6">
        {/* Provider Selection Panel */}
        {showProviderSelection && (
          <ProviderSelectionPanel
            providers={availableProviders}
            selectedProvider={selectedProvider}
            onSelectProvider={handleProviderSelection}
            onClose={() => setShowProviderSelection(false)}
          />
        )}

        {/* Industry Template Selector */}
        {showTemplateSelector && (
          <IndustryTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelection}
            onClose={() => setShowTemplateSelector(false)}
          />
        )}

        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="relative">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Create Your AI-Powered Video Introduction
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Generate a professional video introduction with advanced AI avatars, industry-specific optimization, and multi-provider intelligence.
          </p>

          {/* Enhanced Features Showcase */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="font-medium text-gray-200">Multi-Provider AI</span>
              </div>
              <p className="text-sm text-gray-400 text-left">
                Choose from HeyGen, RunwayML, or D-ID based on your quality and speed preferences
              </p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-gray-200">Industry Templates</span>
              </div>
              <p className="text-sm text-gray-400 text-left">
                Specialized templates for Technology, Marketing, Finance, and more
              </p>
            </div>
          </div>

          {/* Provider & Template Selection */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <button
                onClick={() => setShowProviderSelection(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-lg hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-cyan-400">
                  <Monitor className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedProvider ? selectedProvider.name : 'Select Provider'}
                  </span>
                </div>
                {selectedProvider && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedProvider.description}
                  </p>
                )}
              </button>
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-purple-400">
                  <Award className="w-4 h-4" />
                  <span className="font-medium">
                    {selectedTemplate ? selectedTemplate.name : 'Choose Template'}
                  </span>
                </div>
                {selectedTemplate && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedTemplate.industry} - Quality: {selectedTemplate.qualityScore}/10
                  </p>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4 max-w-sm mx-auto">
            <div className="text-left space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Advanced prompt engineering with industry optimization</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Real-time generation monitoring with progress tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Intelligent fallback system for 99.5% reliability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Quality scoring and performance analytics</span>
              </div>
            </div>
          
            {/* Enhanced Settings */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-200">Advanced Settings</span>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              {showSettings && (
                <div className="space-y-4 mt-3 border-t border-gray-600 pt-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Duration</label>
                      <select
                        value={videoSettings.duration}
                        onChange={(e) => setVideoSettings({...videoSettings, duration: e.target.value as any})}
                        className="w-full mt-1 bg-gray-800 text-gray-200 rounded px-3 py-1 text-sm"
                      >
                        <option value="short">30 seconds</option>
                        <option value="medium">60 seconds</option>
                        <option value="long">90 seconds</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Quality Level</label>
                      <select
                        value={videoSettings.qualityLevel}
                        onChange={(e) => setVideoSettings({...videoSettings, qualityLevel: e.target.value as any})}
                        className="w-full mt-1 bg-gray-800 text-gray-200 rounded px-3 py-1 text-sm"
                      >
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400">Avatar Style</label>
                      <select
                        value={videoSettings.avatarStyle}
                        onChange={(e) => setVideoSettings({...videoSettings, avatarStyle: e.target.value as any})}
                        className="w-full mt-1 bg-gray-800 text-gray-200 rounded px-3 py-1 text-sm"
                      >
                        <option value="realistic">Realistic</option>
                        <option value="illustrated">Illustrated</option>
                        <option value="corporate">Corporate</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Urgency</label>
                      <select
                        value={videoSettings.urgency}
                        onChange={(e) => setVideoSettings({...videoSettings, urgency: e.target.value as any})}
                        className="w-full mt-1 bg-gray-800 text-gray-200 rounded px-3 py-1 text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={videoSettings.useAdvancedPrompts}
                        onChange={(e) => setVideoSettings({...videoSettings, useAdvancedPrompts: e.target.checked})}
                        className="text-cyan-500"
                      />
                      Use advanced AI prompt optimization
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={videoSettings.includeSubtitles}
                        onChange={(e) => setVideoSettings({...videoSettings, includeSubtitles: e.target.checked})}
                        className="text-cyan-500"
                      />
                      Include subtitles
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={videoSettings.includeNameCard}
                        onChange={(e) => setVideoSettings({...videoSettings, includeNameCard: e.target.checked})}
                        className="text-cyan-500"
                      />
                      Include name card overlay
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading || (!selectedProvider && !videoSettings.provider)}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                Generating Enhanced Video...
              </>
            ) : (
              <>
                <Sparkles className="inline w-5 h-5 mr-2" />
                Generate AI Video Introduction
              </>
            )}
          </button>
          
          {(!selectedProvider && !videoSettings.provider) && (
            <p className="text-xs text-yellow-400 mt-2">
              Please select a provider to continue
            </p>
          )}
        </div>
      </div>
    );
  }

  if (status === 'generating' || (currentStatus && currentStatus.status === 'processing')) {
    return (
      <div className="space-y-6">
        {/* Real-time Status Monitor */}
        <RealTimeStatusMonitor
          status={currentStatus || {
            provider: provider || 'unknown',
            status: 'processing',
            progress: 25,
            currentStep: 'Generating enhanced video...',
            qualityScore: qualityScore
          }}
          provider={getProviderById(currentStatus?.provider || provider || '')}
        />
        
        {/* Enhanced Generation Display */}
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-10 h-10 text-cyan-400" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
              {currentStatus?.qualityScore && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-700 px-2 py-1 rounded-full">
                  <span className={`text-xs font-medium ${getQualityColor(currentStatus.qualityScore)}`}>
                    Quality: {currentStatus.qualityScore.toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              {currentStatus?.provider ? `${getProviderById(currentStatus.provider)?.name || 'AI'} Video Generation` : 'Creating Your AI Avatar Video...'}
            </h3>
            
            <p className="text-gray-400 mb-4">
              {currentStatus?.currentStep || 'Your enhanced AI avatar is being created with optimized prompts and industry-specific templates.'}
            </p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${currentStatus?.progress || 25}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">
                {currentStatus?.progress || 25}% complete {currentStatus?.estimatedTime && `• ~${Math.ceil(currentStatus.estimatedTime / 60)} min remaining`}
              </p>
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>CV analysis and data extraction completed</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Enhanced script generation with AI optimization</span>
              </div>
              <div className={`flex items-center gap-2 ${(currentStatus?.progress || 0) > 50 ? 'text-green-400' : 'text-cyan-400'}`}>
                {(currentStatus?.progress || 0) > 50 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4 animate-pulse" />}
                <span>AI avatar creation and voice synthesis</span>
              </div>
              <div className={`flex items-center gap-2 ${(currentStatus?.progress || 0) > 75 ? 'text-green-400' : 'text-gray-500'}`}>
                {(currentStatus?.progress || 0) > 75 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>HD video rendering and post-processing</span>
              </div>
              <div className={`flex items-center gap-2 ${(currentStatus?.progress || 0) > 90 ? 'text-green-400' : 'text-gray-500'}`}>
                {(currentStatus?.progress || 0) > 90 ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                <span>Subtitle generation and final optimization</span>
              </div>
            </div>
            
            {/* Provider Information */}
            {currentStatus?.provider && (
              <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Monitor className="w-4 h-4" />
                  <span>Powered by {getProviderById(currentStatus.provider)?.name}</span>
                  <span className={`ml-auto font-medium ${getStatusColor(currentStatus.status)}`}>
                    {currentStatus.status.charAt(0).toUpperCase() + currentStatus.status.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <VideoAnalyticsDashboard
          videoData={{
            provider: provider || 'unknown',
            qualityScore: qualityScore || 0,
            industryAlignment: industryAlignment || 0,
            generationTime: 0,
            cost: 0
          }}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* Script Optimization Panel */}
      {showScriptEditor && (
        <ScriptOptimizationPanel
          script={customScript}
          qualityScore={qualityScore}
          industryAlignment={industryAlignment}
          onScriptChange={setCustomScript}
          onOptimize={(optimizedScript) => {
            setCustomScript(optimizedScript);
            toast.success('Script optimized with AI recommendations!');
          }}
          onClose={() => setShowScriptEditor(false)}
        />
      )}

      {/* Enhanced Video Player */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="aspect-video bg-gray-900 relative group">
          {videoUrl ? (
            <>
              <video
                src={videoUrl}
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center pointer-events-auto">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-24 h-24 text-gray-700" />
            </div>
          )}
        </div>
        
        {/* Enhanced Video Info */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-100 flex items-center gap-2">
                Professional Introduction
                {qualityScore && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(qualityScore)} bg-gray-700/50`}>
                    Quality: {qualityScore.toFixed(1)}/10
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Duration: {duration ? formatDuration(duration) : '0:00'}</span>
                {provider && (
                  <span className="flex items-center gap-1">
                    <Monitor className="w-3 h-3" />
                    {getProviderById(provider)?.name || provider}
                  </span>
                )}
                {industryAlignment && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Industry: {(industryAlignment * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScriptEditor(!showScriptEditor)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              title="Optimize Script with AI"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300">Optimize Script</span>
            </button>
            
            <button
              onClick={() => setShowProviderSelection(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              title="Change Provider"
            >
              <Monitor className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300">Switch Provider</span>
            </button>
            
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 text-sm"
              title="Regenerate Video"
            >
              <RefreshCw className="w-4 h-4 text-green-400" />
              <span className="text-gray-300">Regenerate</span>
            </button>
            
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
              title="View Analytics"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-gray-300">Analytics</span>
            </button>
            
            {videoUrl && (
              <a
                href={videoUrl}
                download="cv-introduction.mp4"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg transition-colors text-sm text-white"
                title="Download Video"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Script Editor */}
      {showScriptEditor && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-100 mb-4">Video Script</h4>
          <textarea
            value={customScript}
            onChange={(e) => setCustomScript(e.target.value)}
            className="w-full h-32 bg-gray-700 text-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Edit the script for your video introduction..."
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setCustomScript(script || '');
                setShowScriptEditor(false);
              }}
              className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Regenerating...' : 'Regenerate with Script'}
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
          </div>
          <h5 className="font-medium text-gray-200 mb-1">AI Script</h5>
          <p className="text-sm text-gray-400">
            Professionally written introduction
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
            <Video className="w-6 h-6 text-purple-400" />
          </div>
          <h5 className="font-medium text-gray-200 mb-1">HD Quality</h5>
          <p className="text-sm text-gray-400">
            1080p professional video
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
            <Play className="w-6 h-6 text-green-400" />
          </div>
          <h5 className="font-medium text-gray-200 mb-1">60 Seconds</h5>
          <p className="text-sm text-gray-400">
            Perfect length for engagement
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg p-6 border border-cyan-700/30">
        <h4 className="font-semibold text-gray-100 mb-3">Tips for Your Video Introduction</h4>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>Share your video on LinkedIn to increase profile views by up to 5x</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>Include the video link in your email applications for better engagement</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span>Use the custom script editor to personalize your message for specific roles</span>
          </li>
        </ul>
      </div>
    </div>
  );
};