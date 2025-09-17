import { useState } from 'react';
import { 
  Brain, MessageSquare, BarChart3, Video, Mic, 
  FileSearch, Users, ChevronRight, Loader2, CheckCircle, 
  AlertCircle, Clock, Sparkles, Calendar, Grid3x3, Languages, Quote
} from 'lucide-react';
import { ATSScore } from './ATSScore';
import { PersonalityInsights } from './PersonalityInsights';
import { SkillsVisualization } from './SkillsVisualization';
import { PublicProfile } from './PublicProfile';
import { ChatInterface } from './ChatInterface';
import { VideoIntroduction } from './VideoIntroduction';
import { PodcastGeneration } from './PodcastGeneration';
import { InteractiveTimeline } from './InteractiveTimeline';
import { CalendarIntegration } from './CalendarIntegration';
import { PortfolioGallery } from './PortfolioGallery';
import { LanguageProficiency } from './LanguageProficiency';
import { TestimonialsCarousel } from './TestimonialsCarousel';
import type { Job } from '../../services/cvService';
import * as cvService from '../../services/cvService';
import type { 
  CalendarGenerationResult,
  PortfolioGenerationResult,
  LanguageVisualizationResult,
  TestimonialsResult,
  PublicProfileResult,
  EnhancedATSResult,
  VideoGenerationResult as ServiceVideoResult,
  PodcastGenerationResult as ServicePodcastResult
} from '../../types/service-types';
import {
  isPortfolioGenerationResult,
  isCalendarGenerationResult,
  isTestimonialsResult,
  isLanguageVisualizationResult,
  isPublicProfileResult,
  isVideoGenerationResult,
  isPodcastGenerationResult,
  safeConsole,
  safeGet,
  safeArray,
  safeString,
  safeNumber
} from '../../utils/typeGuards';
import toast from 'react-hot-toast';

// Type definitions for API responses
interface ATSAnalysisResult {
  advancedScore?: number;
  analysis?: {
    score: number;
    overall?: { score: number };
    passes: boolean;
    issues: string[];
    suggestions: string[];
    keywords: string[];
  };
  result?: any;
  score?: number;
  passes?: boolean;
  issues?: string[];
  suggestions?: string[];
  keywords?: string[];
  overall?: number;
}

interface PersonalityInsightsResult {
  insights?: {
    traits: Record<string, number>;
    workStyle: string;
    teamCompatibility: number;
    leadershipPotential: number;
    communicationStyle: string;
    strengths: string[];
  };
}

interface SkillsVisualizationResult {
  visualization?: {
    technical: Record<string, number>;
    soft: Record<string, number>;
    languages: Record<string, number>;
    certifications: string[];
  };
}

// Using PublicProfileResult from service-types.ts

interface VideoGenerationResult {
  video?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    script?: string;
  };
}

interface ChatSessionResult {
  sessionId: string;
  suggestedQuestions?: string[];
}

interface ChatMessageResult {
  response: {
    content: string;
    confidence: number;
  };
}

interface TimelineResult {
  timeline?: any;
}

interface MediaData {
  video?: {
    videoUrl: string;
    thumbnailUrl: string;
    duration: number;
    script?: string;
  };
  podcast?: {
    audioUrl: string;
    transcript: string;
    duration: number;
    chapters: string[];
  };
}

interface EnhancedJob extends Job {
  enhancedFeatures?: Record<string, {
    enabled: boolean;
    status: 'not-started' | 'processing' | 'completed' | 'failed';
    data?: any;
  }>;
  analytics?: any;
}

// Type guards
function isATSResult(data: any): data is ATSAnalysisResult {
  return typeof data === 'object' && data !== null;
}

function isPersonalityResult(data: any): data is PersonalityInsightsResult {
  return typeof data === 'object' && data !== null && 'insights' in data;
}

function isSkillsResult(data: any): data is SkillsVisualizationResult {
  return typeof data === 'object' && data !== null && 'visualization' in data;
}

// Using imported isPublicProfileResult from typeGuards

function isVideoResult(data: any): data is VideoGenerationResult {
  return typeof data === 'object' && data !== null && 'video' in data;
}

function isChatSessionResult(data: any): data is ChatSessionResult {
  return typeof data === 'object' && data !== null && 'sessionId' in data;
}

function isChatMessageResult(data: any): data is ChatMessageResult {
  return typeof data === 'object' && data !== null && 'response' in data;
}

function isTimelineResult(data: any): data is TimelineResult {
  return typeof data === 'object' && data !== null;
}

interface FeatureDashboardProps {
  job: Job;
  onJobUpdate?: (job: Job) => void;
}

type FeatureTab = 'ats' | 'personality' | 'skills' | 'public' | 'chat' | 'media' | 'timeline' | 'calendar' | 'portfolio' | 'languages' | 'testimonials';

interface FeatureStatus {
  enabled: boolean;
  status: 'not-started' | 'processing' | 'completed' | 'failed';
  data?: any;
}

export const FeatureDashboard = ({ job }: FeatureDashboardProps) => {
  const [activeTab, setActiveTab] = useState<FeatureTab>('ats');
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [featureData, setFeatureData] = useState<Record<string, any>>({});

  const features = [
    {
      id: 'ats' as FeatureTab,
      name: 'ATS Optimization',
      icon: <FileSearch className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      description: 'Optimize your CV for applicant tracking systems'
    },
    {
      id: 'personality' as FeatureTab,
      name: 'Personality Insights',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
      description: 'AI-powered personality analysis'
    },
    {
      id: 'skills' as FeatureTab,
      name: 'Skills Analysis',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      description: 'Visual skills breakdown and insights'
    },
    {
      id: 'public' as FeatureTab,
      name: 'Public Profile',
      icon: <Users className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-500',
      description: 'Share your CV with a public link'
    },
    {
      id: 'chat' as FeatureTab,
      name: 'AI Chat Assistant',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-500',
      description: 'Let AI answer questions about your CV'
    },
    {
      id: 'media' as FeatureTab,
      name: 'Media Generation',
      icon: <Video className="w-5 h-5" />,
      color: 'from-red-500 to-orange-500',
      description: 'Create video intros and podcasts'
    },
    {
      id: 'timeline' as FeatureTab,
      name: 'Career Timeline',
      icon: <Clock className="w-5 h-5" />,
      color: 'from-yellow-500 to-amber-500',
      description: 'Interactive visual career journey'
    },
    {
      id: 'calendar' as FeatureTab,
      name: 'Calendar Sync',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-teal-500 to-green-500',
      description: 'Sync milestones to your calendar'
    },
    {
      id: 'portfolio' as FeatureTab,
      name: 'Portfolio Gallery',
      icon: <Grid3x3 className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-500',
      description: 'Visual showcase of your work'
    },
    {
      id: 'languages' as FeatureTab,
      name: 'Language Skills',
      icon: <Languages className="w-5 h-5" />,
      color: 'from-emerald-500 to-teal-500',
      description: 'Visualize language proficiencies'
    },
    {
      id: 'testimonials' as FeatureTab,
      name: 'Testimonials',
      icon: <Quote className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-500',
      description: 'Professional recommendations'
    }
  ];

  const getFeatureStatus = (featureId: string): FeatureStatus => {
    // Check job data for feature status
    const enhancedJob = job as EnhancedJob;
    const enhancedFeatures = enhancedJob.enhancedFeatures || {};
    const feature = enhancedFeatures[featureId];
    
    if (!feature) {
      return { enabled: false, status: 'not-started' };
    }
    
    return {
      enabled: feature.enabled || false,
      status: feature.status || 'not-started',
      data: feature.data
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Feature-specific handlers
  const handleATSAnalysis = async () => {
    setLoading({ ...loading, ats: true });
    try {
      console.log('FeatureDashboard: Starting ATS analysis for job:', job.id);
      const result = await cvService.analyzeATSCompatibility(job.id);
      console.log('FeatureDashboard: ATS analysis raw result:', result);
      
      if (isATSResult(result)) {
        const atsData = result.result || result;
        console.log('FeatureDashboard: Extracted atsData:', atsData);
        
        setFeatureData({ ...featureData, ats: atsData });
        console.log('FeatureDashboard: ATS data set successfully');
        toast.success('ATS analysis completed!');
      } else {
        throw new Error('Invalid ATS analysis result format');
      }
    } catch (error) {
      console.error('FeatureDashboard: ATS analysis failed:', error);
      toast.error('Failed to analyze ATS compatibility');
    } finally {
      setLoading({ ...loading, ats: false });
    }
  };

  const handlePersonalityAnalysis = async () => {
    setLoading({ ...loading, personality: true });
    try {
      const result = await cvService.generatePersonalityInsights(job.id);
      if (isPersonalityResult(result)) {
        setFeatureData({ ...featureData, personality: result.insights });
        toast.success('Personality analysis completed!');
      } else {
        throw new Error('Invalid personality analysis result format');
      }
    } catch {
      toast.error('Failed to generate personality insights');
    } finally {
      setLoading({ ...loading, personality: false });
    }
  };

  const handleSkillsVisualization = async () => {
    setLoading({ ...loading, skills: true });
    try {
      const result = await cvService.generateSkillsVisualization(job.id);
      if (isSkillsResult(result)) {
        setFeatureData({ ...featureData, skills: result.visualization });
        toast.success('Skills visualization generated!');
      } else {
        throw new Error('Invalid skills visualization result format');
      }
    } catch {
      toast.error('Failed to generate skills visualization');
    } finally {
      setLoading({ ...loading, skills: false });
    }
  };

  const handleCreatePublicProfile = async () => {
    setLoading({ ...loading, public: true });
    try {
      const result = await cvService.createPublicProfile(job.id);
      if (isPublicProfileResult(result)) {
        setFeatureData({ ...featureData, public: { 
          slug: result.slug,
          publicUrl: result.publicUrl,
          qrCodeUrl: result.qrCodeUrl,
          settings: result.settings
        } });
        toast.success('Public profile created!');
      } else {
        throw new Error('Invalid public profile result format');
      }
    } catch {
      toast.error('Failed to create public profile');
    } finally {
      setLoading({ ...loading, public: false });
    }
  };

  const handleInitializeChat = async () => {
    setLoading({ ...loading, chat: true });
    try {
      await cvService.initializeRAG(job.id);
      setFeatureData({ ...featureData, chat: { initialized: true } });
      toast.success('Chat assistant initialized!');
    } catch {
      toast.error('Failed to initialize chat');
    } finally {
      setLoading({ ...loading, chat: false });
    }
  };

  const handleGenerateTimeline = async () => {
    setLoading({ ...loading, timeline: true });
    try {
      const result = await cvService.generateTimeline(job.id);
      if (isTimelineResult(result)) {
        setFeatureData({ ...featureData, timeline: result.timeline });
        toast.success('Timeline generated successfully!');
      } else {
        throw new Error('Invalid timeline result format');
      }
    } catch {
      toast.error('Failed to generate timeline');
    } finally {
      setLoading({ ...loading, timeline: false });
    }
  };

  const handleGenerateCalendarEvents = async () => {
    setLoading({ ...loading, calendar: true });
    try {
      const result = await cvService.generateCalendarEvents(job.id) as CalendarGenerationResult;
      setFeatureData({ ...featureData, calendar: result });
      toast.success('Calendar events generated successfully!');
    } catch {
      toast.error('Failed to generate calendar events');
    } finally {
      setLoading({ ...loading, calendar: false });
    }
  };

  const handleGeneratePortfolio = async () => {
    setLoading({ ...loading, portfolio: true });
    try {
      const result = await cvService.generatePortfolioGallery(job.id);
      if (isPortfolioGenerationResult(result) && result.gallery) {
        setFeatureData({ ...featureData, portfolio: result.gallery });
      } else {
        throw new Error('Invalid portfolio generation result format');
      }
      toast.success('Portfolio gallery generated successfully!');
    } catch {
      toast.error('Failed to generate portfolio gallery');
    } finally {
      setLoading({ ...loading, portfolio: false });
    }
  };

  const handleGenerateLanguages = async () => {
    setLoading({ ...loading, languages: true });
    try {
      const result = await cvService.generateLanguageVisualization(job.id);
      if (isLanguageVisualizationResult(result) && result.visualization) {
        setFeatureData({ ...featureData, languages: result.visualization });
      } else {
        throw new Error('Invalid language visualization result format');
      }
      toast.success('Language visualization generated successfully!');
    } catch {
      toast.error('Failed to generate language visualization');
    } finally {
      setLoading({ ...loading, languages: false });
    }
  };

  const handleGenerateTestimonials = async () => {
    setLoading({ ...loading, testimonials: true });
    try {
      const result = await cvService.generateTestimonialsCarousel(job.id);
      if (isTestimonialsResult(result) && result.carousel) {
        setFeatureData({ ...featureData, testimonials: result.carousel });
      } else {
        throw new Error('Invalid testimonials result format');
      }
      toast.success('Testimonials carousel generated successfully!');
    } catch {
      toast.error('Failed to generate testimonials carousel');
    } finally {
      setLoading({ ...loading, testimonials: false });
    }
  };

  // Video generation is handled inline in the component

  // Podcast generation is handled inline in the component

  const renderFeatureContent = () => {
    const status = getFeatureStatus(activeTab);
    
    // Show initialization button if not started
    if (status.status === 'not-started') {
      const initHandlers: Record<FeatureTab, () => Promise<void>> = {
        ats: handleATSAnalysis,
        personality: handlePersonalityAnalysis,
        skills: handleSkillsVisualization,
        public: handleCreatePublicProfile,
        chat: handleInitializeChat,
        media: async () => {
          // Initialize media features - let user choose which to generate
          setFeatureData({ 
            ...featureData, 
            media: { initialized: true } 
          });
        },
        timeline: handleGenerateTimeline,
        calendar: handleGenerateCalendarEvents,
        portfolio: handleGeneratePortfolio,
        languages: handleGenerateLanguages,
        testimonials: handleGenerateTestimonials
      };

      return (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <Sparkles className="w-16 h-16 text-gray-600 mb-4 animate-pulse-slow" />
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Feature Not Activated
          </h3>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            This feature hasn't been activated yet. Click below to start using it.
          </p>
          <button
            onClick={initHandlers[activeTab]}
            disabled={loading[activeTab]}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 hover-glow"
          >
            {loading[activeTab] ? (
              <>
                <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              `Activate ${features.find(f => f.id === activeTab)?.name}`
            )}
          </button>
        </div>
      );
    }

    // Show loading state
    if (status.status === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Processing...
          </h3>
          <p className="text-gray-400 animate-pulse">
            This may take a few moments. Please wait.
          </p>
        </div>
      );
    }

    // Show feature-specific content
    switch (activeTab) {
      case 'ats': {
        const atsData = featureData.ats || status.data;
        if (!atsData || !isATSResult(atsData)) {
          return null;
        }
        
        return atsData.advancedScore ? (
          // Use enhanced ATS component for advanced data
          <ATSScore
            result={{
              score: safeNumber(atsData.analysis?.overall?.score ?? atsData.analysis?.score ?? atsData.overall ?? atsData.score),
              overall: safeNumber(atsData.analysis?.overall?.score ?? atsData.analysis?.score ?? atsData.overall ?? atsData.score),
              passes: Boolean(atsData.analysis?.passes ?? atsData.passes),
              issues: safeArray(atsData.analysis?.issues ?? atsData.issues).map((issue: string) => ({ 
                type: 'ats', 
                severity: 'warning' as const, 
                message: typeof issue === 'string' ? issue : String(issue)
              })),
              suggestions: safeArray(atsData.analysis?.suggestions ?? atsData.suggestions).map(suggestion => ({ 
                section: 'general', 
                original: '', 
                suggested: typeof suggestion === 'string' ? suggestion : String(suggestion), 
                reason: 'ATS Optimization',
                impact: 'medium' as const 
              })),
              recommendations: safeArray(atsData?.analysis?.suggestions ?? atsData?.suggestions ?? []).map((s, index) => ({
                id: `rec-${index}`,
                priority: 'medium' as const,
                category: 'general',
                estimatedScoreImprovement: 5,
                title: typeof s === 'string' ? s : String(s),
                description: typeof s === 'string' ? s : String(s),
                section: 'general',
                impact: 'medium' as const,
                actionRequired: true,
                atsSystemsAffected: ['generic']
              })),
              breakdown: {
                keywords: 85,
                format: 90,
                experience: 80,
                skills: 88
              },
              passedChecks: safeArray(Array.isArray(atsData?.analysis?.passes) ? atsData.analysis.passes : Array.isArray(atsData?.passes) ? atsData.passes : []).map(p => typeof p === 'string' ? p : String(p)),
              failedChecks: safeArray(atsData?.analysis?.issues ?? atsData?.issues ?? []).map(i => typeof i === 'string' ? i : String(i)),
              semanticAnalysis: (atsData as any)?.semanticAnalysis ?? {},
              systemSimulations: safeArray((atsData as any)?.systemSimulations ?? []),
              // Add advanced score structure for compatibility
              advancedScore: {
                overall: safeNumber(atsData.analysis?.overall?.score ?? atsData.analysis?.score ?? atsData.overall ?? atsData.score),
                breakdown: {
                  keywords: 85,
                  format: 90,
                  experience: 80,
                  skills: 88
                },
                recommendations: safeArray(atsData?.analysis?.suggestions ?? atsData?.suggestions ?? []).map((s, index) => ({
                  id: `rec-${index}`,
                  title: typeof s === 'string' ? s : String(s),
                  description: typeof s === 'string' ? s : String(s),
                  priority: 'medium' as const,
                  category: 'ATS Optimization',
                  estimatedScoreImprovement: 5,
                  section: 'General',
                  impact: 'medium' as const,
                  actionRequired: false,
                  atsSystemsAffected: ['Standard ATS']
                })),
                confidence: 85,
                atsSystemScores: [85, 90, 80, 88],
                competitorBenchmark: {
                  averageIndustry: 75,
                  industryAverage: 75,
                  percentileRank: 85,
                  topPercentile: 85,
                  competingKeywords: ['keyword1', 'keyword2'],
                  gapAnalysis: ['missing-keyword-1', 'missing-keyword-2']
                }
              }
            } as EnhancedATSResult}
            showAdvancedBreakdown={true}
            showSystemScores={true}
            showCompetitorAnalysis={true}
            onApplyRecommendations={(recommendationIds) => {
              console.log('Applying ATS recommendations:', recommendationIds);
              toast.success(`Applied ${recommendationIds.length} ATS recommendations`);
            }}
          />
        ) : (
          // Fallback to legacy component for backwards compatibility  
          <ATSScore
            score={atsData.analysis?.overall?.score ?? atsData.analysis?.score ?? atsData.overall ?? atsData.score ?? 0}
            passes={atsData.analysis?.passes ?? atsData.passes ?? false}
            issues={Array.isArray(atsData.analysis?.issues) ? 
              atsData.analysis.issues.map((issue: string) => ({ type: 'ats', severity: 'warning' as const, message: issue })) :
              Array.isArray(atsData.issues) ? 
                atsData.issues.map((issue: string) => ({ type: 'ats', severity: 'warning' as const, message: issue })) :
                []
            }
            suggestions={Array.isArray(atsData.analysis?.suggestions) ?
              atsData.analysis.suggestions.map(suggestion => ({ 
                section: 'general', 
                original: '', 
                suggested: suggestion, 
                reason: 'ATS Optimization',
                impact: 'medium' as const
              })) :
              Array.isArray(atsData.suggestions) ?
                atsData.suggestions.map(suggestion => ({ 
                  section: 'general', 
                  original: '', 
                  suggested: suggestion, 
                  reason: 'ATS Optimization',
                  impact: 'medium' as const
                })) :
                []
            }
            keywords={{
              found: Array.isArray(atsData.analysis?.keywords) ? atsData.analysis.keywords : 
                     Array.isArray(atsData.keywords) ? atsData.keywords : [],
              missing: [],
              recommended: []
            }}
          />
        );
      }
      case 'personality': {
        const personalityData = featureData.personality || status.data;
        if (!personalityData) {
          return null;
        }
        
        // Provide default values if personalityData doesn't match expected interface
        const safePersonalityData = {
          traits: (personalityData as any)?.traits ?? {},
          workStyle: (personalityData as any)?.workStyle ?? 'Unknown',
          teamCompatibility: (personalityData as any)?.teamCompatibility ?? 0,
          leadershipPotential: (personalityData as any)?.leadershipPotential ?? 0,
          communicationStyle: (personalityData as any)?.communicationStyle ?? 'Unknown',
          strengths: (personalityData as any)?.strengths ?? [],
          cultureFit: (personalityData as any)?.cultureFit ?? 'Unknown',
          summary: (personalityData as any)?.summary ?? 'No personality insights available'
        };
        
        return <PersonalityInsights {...safePersonalityData} />;
      }
      case 'skills': {
        const skillsData = featureData.skills || status.data;
        if (!skillsData) {
          return null;
        }
        
        // Provide default values if skillsData doesn't match expected interface
        const safeSkillsData = {
          technical: (skillsData as any)?.technical ?? {},
          soft: (skillsData as any)?.soft ?? {},
          languages: (skillsData as any)?.languages ?? {},
          certifications: (skillsData as any)?.certifications ?? []
        };
        
        return <SkillsVisualization {...safeSkillsData} />;
      }
      case 'public': {
        const publicData = featureData.public || status.data;
        const enhancedJob = job as EnhancedJob;
        
        return (
          <PublicProfile
            profile={publicData || undefined}
            analytics={enhancedJob.analytics}
            onCreateProfile={handleCreatePublicProfile}
            onUpdateSettings={async (settings) => {
              await cvService.updatePublicProfileSettings(job.id, settings);
              toast.success('Settings updated');
            }}
          />
        );
      }
      case 'chat':
        return (
          <ChatInterface
            onStartSession={async () => {
              const result = await cvService.startChatSession(job.id);
              if (isChatSessionResult(result)) {
                return {
                  sessionId: result.sessionId,
                  suggestedQuestions: result.suggestedQuestions || []
                };
              }
              throw new Error('Invalid chat session result format');
            }}
            onSendMessage={async (sessionId, message) => {
              const result = await cvService.sendChatMessage(sessionId, message);
              if (isChatMessageResult(result)) {
                return {
                  content: result.response.content,
                  confidence: result.response.confidence
                };
              }
              throw new Error('Invalid chat message result format');
            }}
            onEndSession={async (sessionId, rating, feedback) => {
              await cvService.endChatSession(sessionId, rating, feedback);
            }}
          />
        );
      case 'media': {
        const rawMediaData = featureData.media || status.data || {};
        const mediaData: MediaData = {
          video: (rawMediaData as any)?.video
        };
        return (
          <div className="space-y-8">
            {/* Video Introduction Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Video className="w-6 h-6 text-cyan-500" />
                Video Introduction
              </h3>
              <VideoIntroduction
                videoUrl={mediaData.video?.videoUrl}
                thumbnailUrl={mediaData.video?.thumbnailUrl}
                duration={mediaData.video?.duration}
                status={mediaData.video ? 'ready' : 'not-generated'}
                script={mediaData.video?.script}
                onGenerateVideo={async (options) => {
                  const optionsObj = options as { duration?: 'short' | 'medium' | 'long'; style?: string } | undefined;
                  const result = await cvService.generateVideoIntroduction(
                    job.id, 
                    optionsObj?.duration, 
                    optionsObj?.style
                  );
                  if (isVideoResult(result) && result.video) {
                    setFeatureData({ 
                      ...featureData, 
                      media: { 
                        ...mediaData,
                        video: result.video 
                      } 
                    });
                    return {
                      ...result.video,
                      script: result.video.script ?? '',
                      subtitles: ''
                    };
                  }
                  throw new Error('Invalid video generation result format');
                }}
                onRegenerateVideo={async (customScript, options) => {
                  const result = await cvService.regenerateVideoIntroduction(
                    job.id, 
                    customScript,
                    options
                  );
                  if (isVideoResult(result) && result.video) {
                    setFeatureData({ 
                      ...featureData, 
                      media: { 
                        ...mediaData,
                        video: result.video 
                      } 
                    });
                    return {
                      videoUrl: result.video.videoUrl,
                      thumbnailUrl: result.video.thumbnailUrl,
                      duration: result.video.duration
                    };
                  }
                  throw new Error('Invalid video regeneration result format');
                }}
              />
            </div>

            {/* Podcast Generation Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <Mic className="w-6 h-6 text-purple-500" />
                Career Podcast
              </h3>
              <PodcastGeneration
                audioUrl={mediaData.podcast?.audioUrl}
                transcript={mediaData.podcast?.transcript}
                duration={mediaData.podcast?.duration}
                chapters={safeArray(mediaData.podcast?.chapters).map(chapter => {
                  // Handle both object and string chapter formats
                  if (typeof chapter === 'string') {
                    return {
                      title: chapter,
                      startTime: 0,
                      endTime: 0
                    };
                  }
                  // Handle object chapter format
                  const chapterObj = chapter as any;
                  return {
                    title: chapterObj.title || 'Untitled Chapter',
                    startTime: chapterObj.startTime || 0,
                    endTime: chapterObj.endTime || (chapterObj.startTime + (chapterObj.duration || 0)) || 0
                  };
                })}
                status={mediaData.podcast ? 'ready' : 'not-generated'}
                onGeneratePodcast={async () => {
                  const result = await cvService.generateEnhancedPodcast(job.id);
                  if (isPodcastGenerationResult(result)) {
                    const podcastData = {
                      audioUrl: result.podcast.audioUrl,
                      transcript: result.transcript || '',
                      duration: result.podcast.duration,
                      chapters: safeArray(result.chapters).map(chapter => ({
                        title: chapter.title,
                        startTime: chapter.startTime,
                        endTime: chapter.startTime + (chapter.duration || 0)
                      }))
                    };
                    setFeatureData({ 
                      ...featureData, 
                      media: { 
                        ...mediaData,
                        podcast: podcastData
                      } 
                    });
                    return podcastData;
                  }
                  throw new Error('Invalid podcast generation result format');
                }}
                onRegeneratePodcast={async (style) => {
                  const result = await cvService.regeneratePodcast(job.id, style);
                  if (isPodcastGenerationResult(result)) {
                    const podcastData = {
                      audioUrl: result.podcast.audioUrl,
                      transcript: result.transcript || '',
                      duration: result.podcast.duration,
                      chapters: safeArray(result.chapters).map(chapter => ({
                        title: chapter.title,
                        startTime: chapter.startTime,
                        endTime: chapter.startTime + (chapter.duration || 0)
                      }))
                    };
                    setFeatureData({ 
                      ...featureData, 
                      media: { 
                        ...mediaData,
                        podcast: podcastData
                      } 
                    });
                  }
                }}
              />
            </div>
          </div>
        );
      }
      case 'timeline': {
        const timelineData = featureData.timeline || status.data;
        return timelineData ? (
          <InteractiveTimeline
            events={timelineData.events.map((event: unknown) => {
              // Type guard to ensure event is an object before spreading
              const eventData = (event && typeof event === 'object') ? event as Record<string, any> : {};
              return {
                ...eventData,
                startDate: new Date(eventData.startDate),
                endDate: eventData.endDate ? new Date(eventData.endDate) : undefined
              };
            })}
            onEventClick={async (event) => {
              // Optional: Handle event click for editing
              console.log('Event clicked:', event);
            }}
          />
        ) : null;
      }
      case 'calendar': {
        const calendarData = featureData.calendar || status.data;
        return (
          <CalendarIntegration
            events={calendarData?.events}
            onGenerateEvents={async () => {
              const result = await cvService.generateCalendarEvents(job.id) as CalendarGenerationResult;
              setFeatureData({ ...featureData, calendar: result });
              return {
                events: result.events.map(event => ({
                  ...event,
                  startDate: event.startDate || event.date,
                  allDay: event.allDay ?? true,
                  description: event.description || '' // Ensure description is always present
                })),
                summary: result.summary
              };
            }}
            onSyncGoogle={async () => {
              const result = await cvService.syncToGoogleCalendar(job.id);
              if (result && typeof result === 'object' && 'connected' in result) {
                return {
                  syncUrl: 'https://calendar.google.com',
                  instructions: ['Click to sync with Google Calendar', 'Follow the authentication process']
                };
              }
              throw new Error('Failed to sync with Google Calendar');
            }}
            onSyncOutlook={async () => {
              const result = await cvService.syncToOutlook(job.id);
              if (result && typeof result === 'object' && 'connected' in result) {
                return {
                  syncUrl: 'https://outlook.live.com/calendar',
                  instructions: ['Click to sync with Outlook Calendar', 'Sign in with your Microsoft account']
                };
              }
              throw new Error('Failed to sync with Outlook');
            }}
            onDownloadICal={async () => {
              const result = await cvService.downloadICalFile(job.id);
              if (result && typeof result === 'object' && 'connected' in result) {
                return {
                  downloadUrl: '/api/calendar/download.ics',
                  instructions: ['Download will start automatically', 'Import the .ics file into your preferred calendar app']
                };
              }
              throw new Error('Failed to generate iCal file');
            }}
          />
        );
      }
      case 'portfolio': {
        const portfolioData = featureData.portfolio || status.data;
        const portfolioInfo = (job as any).enhancedFeatures?.portfolio;
        return (
          <PortfolioGallery
            gallery={portfolioData}
            shareableUrl={portfolioInfo?.shareableUrl}
            embedCode={portfolioInfo?.embedCode}
            onGenerateGallery={async () => {
              const result = await cvService.generatePortfolioGallery(job.id) as PortfolioGenerationResult;
              const portfolioGallery = {
                items: result.gallery.items || [],
                layout: 'grid' as const,
                theme: 'modern'
              };
              setFeatureData({ ...featureData, portfolio: portfolioGallery });
              return portfolioGallery;
            }}
            onDeleteItem={async (itemId: string) => {
              await cvService.deletePortfolioItem(job.id, itemId);
              // Update local state with proper type checking
              const safePortfolioData = (portfolioData && typeof portfolioData === 'object') ? portfolioData as Record<string, any> : {};
              const updatedGallery = {
                ...safePortfolioData,
                items: (safePortfolioData.items || []).filter((item: unknown) => {
                  const itemData = (item && typeof item === 'object') ? item as Record<string, any> : {};
                  return itemData.id !== itemId;
                })
              };
              setFeatureData({ ...featureData, portfolio: updatedGallery });
            }}
            onGenerateShareableLink={async (customDomain?: string) => {
              const result = await cvService.generateShareablePortfolio(job.id, customDomain) as PortfolioGenerationResult;
              return result;
            }}
          />
        );
      }
      case 'languages': {
        const languagesData = featureData.languages || status.data;
        return (
          <LanguageProficiency
            visualization={languagesData}
            onGenerateVisualization={async () => {
              const result = await cvService.generateLanguageVisualization(job.id) as LanguageVisualizationResult;
              const languageVisualization = {
                proficiencies: [],
                visualizations: {
                  type: 'radar' as const,
                  data: result.visualizations?.[0]?.data || {},
                  config: {
                    primaryColor: '#3B82F6',
                    accentColor: '#10B981',
                    showCertifications: true,
                    showFlags: true,
                    animateOnLoad: true
                  }
                },
                insights: {
                  strengthAreas: [],
                  improvementSuggestions: [],
                  marketValue: 'High',
                  certificationRecommendations: []
                },
                metadata: {
                  generatedAt: new Date(),
                  version: '1.0',
                  source: 'AI_ANALYSIS'
                }
              };
              setFeatureData({ ...featureData, languages: languageVisualization });
              return languageVisualization;
            }}
            onAddLanguage={async (language) => {
              // Ensure required fields are present with defaults
              const fullLanguage = {
                ...language,
                language: language.language || '',
                level: language.level || 'Basic' as const,
                score: language.score || 0
              };
              const result = await cvService.addLanguageProficiency(job.id, fullLanguage) as LanguageVisualizationResult;
              setFeatureData({ ...featureData, languages: result.visualization });
              toast.success('Language added');
            }}
          />
        );
      }
      case 'testimonials': {
        const testimonialsData = featureData.testimonials || status.data;
        return (
          <TestimonialsCarousel
            carousel={testimonialsData}
            onGenerateCarousel={async () => {
              const result = await cvService.generateTestimonialsCarousel(job.id) as TestimonialsResult;
              const testimonialsCarousel = {
                testimonials: result.carousel?.testimonials || [],
                layout: 'horizontal',
                autoPlay: true,
                interval: 5000
              };
              setFeatureData({ ...featureData, testimonials: testimonialsCarousel });
              return testimonialsCarousel;
            }}
            onAddTestimonial={async (testimonial) => {
              await cvService.addTestimonial(job.id, testimonial);
              // Refresh the carousel
              const result = await cvService.generateTestimonialsCarousel(job.id) as TestimonialsResult;
              setFeatureData({ ...featureData, testimonials: result.carousel });
              toast.success('Testimonial added');
            }}
            onUpdateTestimonial={async (testimonialId, updates) => {
              await cvService.updateTestimonial(job.id, testimonialId, updates);
              // Refresh the carousel
              const result = await cvService.generateTestimonialsCarousel(job.id) as TestimonialsResult;
              setFeatureData({ ...featureData, testimonials: result.carousel });
              toast.success('Testimonial updated');
            }}
            onRemoveTestimonial={async (testimonialId) => {
              await cvService.removeTestimonial(job.id, testimonialId);
              // Refresh the carousel
              const result = await cvService.generateTestimonialsCarousel(job.id) as TestimonialsResult;
              setFeatureData({ ...featureData, testimonials: result.carousel });
              toast.success('Testimonial removed');
            }}
            onUpdateLayout={async (layoutOptions) => {
              await cvService.updateCarouselLayout(job.id, layoutOptions);
              // Refresh the carousel
              const result = await cvService.generateTestimonialsCarousel(job.id) as TestimonialsResult;
              setFeatureData({ ...featureData, testimonials: result.carousel });
              toast.success('Layout updated');
            }}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 rounded-xl p-4 animate-fade-in-left">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">CV Features</h3>
        <div className="space-y-2">
          {features.map((feature) => {
            const status = getFeatureStatus(feature.id);
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`w-full text-left p-3 rounded-lg transition-all hover-scale ${
                  activeTab === feature.id
                    ? 'bg-gradient-to-r ' + feature.color + ' text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <div>
                      <div className="font-medium">{feature.name}</div>
                      <div className="text-xs opacity-80">{feature.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-800 rounded-xl p-6 animate-fade-in-right animation-delay-200">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-100 animate-fade-in-up">
            {features.find(f => f.id === activeTab)?.name}
          </h2>
          <p className="text-gray-400 mt-1 animate-fade-in-up animation-delay-100">
            {features.find(f => f.id === activeTab)?.description}
          </p>
        </div>
        
        {renderFeatureContent()}
      </div>
    </div>
  );
};