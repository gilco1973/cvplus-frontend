import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles, Loader2, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { getJob, generateCV, generateEnhancedPodcast } from '../services/cvService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import { jobSubscriptionManager } from '../services/JobSubscriptionManager';
import { db, storage } from '../lib/firebase';
import type { Job } from '../types/job';
import { GeneratedCVDisplay } from '../components/GeneratedCVDisplay';
import { Header } from '../components/Header';
import { CVMetadata } from '../components/final-results/CVMetadata';
import { DownloadActions } from '../components/final-results/DownloadActions';
import { PodcastPlayer } from '../components/PodcastPlayer';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { kebabToCamelCase } from '../utils/featureUtils';

// Progressive Enhancement Types
interface FeatureProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  error?: string;
  htmlFragment?: string;
  processedAt?: unknown;
}

interface ProgressState {
  [featureId: string]: FeatureProgress;
}

interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Feature Configuration - Maps camelCase feature names to kebab-case configs
const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  // Core Enhancement Features
  'atsOptimization': {
    id: 'ats-optimization',
    name: 'ATS Optimization',
    icon: '🎯',
    description: 'Applicant Tracking System optimization'
  },
  'keywordEnhancement': {
    id: 'keyword-enhancement',
    name: 'Keyword Enhancement',
    icon: '🔑',
    description: 'Strategic keyword optimization'
  },
  'achievementHighlighting': {
    id: 'achievement-highlighting',
    name: 'Achievement Highlighting',
    icon: '⭐',
    description: 'Professional achievement emphasis'
  },
  
  // Interactive Features
  'skillsVisualization': {
    id: 'skills-visualization',
    name: 'Skills Visualization',
    icon: '📊',
    description: 'Interactive charts and skill assessments'
  },
  'skillsChart': {
    id: 'skills-chart',
    name: 'Skills Chart',
    icon: '📈',
    description: 'Visual skills proficiency chart'
  },
  'interactiveTimeline': {
    id: 'interactive-timeline',
    name: 'Interactive Timeline',
    icon: '⏰',
    description: 'Professional journey visualization'
  },
  
  // Multimedia Features
  'generatePodcast': {
    id: 'generate-podcast',
    name: 'Career Podcast',
    icon: '🎙️',
    description: 'AI-generated career story'
  },
  'videoIntroduction': {
    id: 'video-introduction',
    name: 'Video Introduction',
    icon: '🎥',
    description: 'Personal video introduction'
  },
  'portfolioGallery': {
    id: 'portfolio-gallery',
    name: 'Portfolio Gallery',
    icon: '🖼️',
    description: 'Project showcase gallery'
  },
  
  // Professional Features
  'certificationBadges': {
    id: 'certification-badges',
    name: 'Certification Badges',
    icon: '🏆',
    description: 'Professional certification displays'
  },
  'languageProficiency': {
    id: 'language-proficiency',
    name: 'Language Proficiency',
    icon: '🌍',
    description: 'Language skills assessment'
  },
  'achievementsShowcase': {
    id: 'achievements-showcase',
    name: 'Achievements Showcase',
    icon: '🎯',
    description: 'Top achievements highlighting'
  },
  
  // Contact & Integration Features
  'contactForm': {
    id: 'contact-form',
    name: 'Contact Form',
    icon: '📧',
    description: 'Interactive contact functionality'
  },
  'socialMediaLinks': {
    id: 'social-media-links',
    name: 'Social Media Links',
    icon: '🔗',
    description: 'Professional social media integration'
  },
  'availabilityCalendar': {
    id: 'availability-calendar',
    name: 'Availability Calendar',
    icon: '📅',
    description: 'Scheduling and availability integration'
  },
  'testimonialsCarousel': {
    id: 'testimonials-carousel',
    name: 'Testimonials Carousel',
    icon: '💬',
    description: 'Professional testimonials showcase'
  },
  
  // Technical Features
  'embedQRCode': {
    id: 'embed-qr-code',
    name: 'QR Code Integration',
    icon: '📱',
    description: 'Quick access QR code'
  },
  'privacyMode': {
    id: 'privacy-mode',
    name: 'Privacy Protection',
    icon: '🔒',
    description: 'Personal information protection'
  }
};

// Feature Progress Card Component
const FeatureProgressCard: React.FC<{
  feature: FeatureConfig;
  progress: FeatureProgress;
}> = ({ feature, progress }) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'processing':
        return 'border-blue-500 bg-blue-500/10';
      case 'failed':
        return 'border-red-500 bg-red-500/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{feature.icon}</span>
          <h3 className="font-medium text-gray-100">{feature.name}</h3>
        </div>
        {getStatusIcon()}
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
      
      {progress.status === 'processing' && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress || 0}%` }}
            />
          </div>
          {progress.currentStep && (
            <p className="text-xs text-gray-400">{progress.currentStep}</p>
          )}
        </div>
      )}
      
      {progress.status === 'failed' && progress.error && (
        <p className="text-sm text-red-400">{progress.error}</p>
      )}
      
      {progress.status === 'completed' && (
        <p className="text-sm text-green-400">
          {progress.processedAt ? 
            `Enhancement complete! (${new Date(progress.processedAt.seconds * 1000).toLocaleTimeString()})` : 
            'Enhancement complete!'
          }
        </p>
      )}
    </div>
  );
};

export const FinalResultsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Original states
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationConfig, setGenerationConfig] = useState<any>(null);
  const isMountedRef = useRef(true);
  const hasTriggeredGeneration = useRef(false);
  
  // Progressive Enhancement states
  const [baseHTML, setBaseHTML] = useState<string>('');
  const [enhancedHTML, setEnhancedHTML] = useState<string>('');
  const [progressState, setProgressState] = useState<ProgressState>({});
  const [featureQueue, setFeatureQueue] = useState<FeatureConfig[]>([]);
  const [isProcessingFeatures, setIsProcessingFeatures] = useState(false);
  const [progressUnsubscribe, setProgressUnsubscribe] = useState<(() => void) | null>(null);
  const [asyncMode, setAsyncMode] = useState(CVServiceCore.isAsyncCVGenerationEnabled());
  const [isAsyncInitialization, setIsAsyncInitialization] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    console.log('🏗️ [DEBUG] Progressive FinalResultsPage mounted');
    
    return () => {
      console.log('🧹 [DEBUG] Progressive FinalResultsPage unmounting');
      isMountedRef.current = false;
      if (progressUnsubscribe) {
        progressUnsubscribe();
      }
    };
  }, []);

  // Load base HTML from Firebase Storage
  const loadBaseHTML = async (job: Job) => {
    try {
      if (job.generatedCV?.htmlUrl) {
        console.log('📄 [DEBUG] Loading base HTML from Storage URL:', job.generatedCV.htmlUrl);
        
        // For Firebase Storage URLs, we need to fetch the content
        if (job.generatedCV.htmlUrl.includes('firebasestorage') || job.generatedCV.htmlUrl.includes('localhost:9199')) {
          const response = await fetch(job.generatedCV.htmlUrl);
          if (response.ok) {
            const htmlContent = await response.text();
            setBaseHTML(htmlContent);
            setEnhancedHTML(htmlContent);
            console.log('✅ [DEBUG] Base HTML loaded successfully');
            return;
          }
        }
      }
      
      // Fallback to inline HTML if available
      if (job.generatedCV?.html) {
        console.log('📄 [DEBUG] Using inline HTML content');
        setBaseHTML(job.generatedCV.html);
        setEnhancedHTML(job.generatedCV.html);
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error loading base HTML:', error);
      // Use inline HTML as fallback
      if (job.generatedCV?.html) {
        setBaseHTML(job.generatedCV.html);
        setEnhancedHTML(job.generatedCV.html);
      }
    }
  };

  // Set up feature queue based on selected features
  const setupFeatureQueue = (selectedFeatures: string[], jobId: string) => {
    console.log('🔍 [FEATURE QUEUE DEBUG] Input features:', selectedFeatures);
    console.log('🔍 [FEATURE QUEUE DEBUG] Available FEATURE_CONFIGS keys:', Object.keys(FEATURE_CONFIGS));
    
    // Convert kebab-case features to camelCase for FEATURE_CONFIGS lookup
    // First normalize any malformed kebab-case features and handle special cases
    const normalizedFeatures = selectedFeatures.map(feature => {
      if (feature === 'embed-q-r-code') {
        return 'embed-qr-code';
      }
      return feature;
    });
    
    const camelCaseFeatures = normalizedFeatures.map(feature => {
      // Special case: embed-qr-code should become embedQRCode (not embedQrCode)
      if (feature === 'embed-qr-code') {
        return 'embedQRCode';
      }
      return kebabToCamelCase(feature);
    });
    console.log('🔄 [FEATURE QUEUE DEBUG] Normalized features:', normalizedFeatures);
    console.log('🔄 [FEATURE QUEUE DEBUG] Converted to camelCase:', camelCaseFeatures);
    
    const queue = camelCaseFeatures
      .filter(featureId => {
        const hasConfig = !!FEATURE_CONFIGS[featureId];
        console.log(`🔍 [FEATURE QUEUE DEBUG] Feature ${featureId}: ${hasConfig ? 'FOUND' : 'MISSING'} in FEATURE_CONFIGS`);
        return hasConfig;
      })
      .map(featureId => FEATURE_CONFIGS[featureId]);
    
    setFeatureQueue(queue);
    console.log('🎯 [DEBUG] Feature queue set up:', queue.map(f => f.name));
    console.log('🎯 [DEBUG] Feature queue length:', queue.length);
    
    // Initialize progress state
    const initialProgress: ProgressState = {};
    queue.forEach(feature => {
      initialProgress[feature.id] = {
        status: 'pending',
        progress: 0
      };
    });
    setProgressState(initialProgress);
    
    // Set up progress tracking with the created queue
    setupProgressTracking(jobId, queue);
  };

  // Set up real-time progress tracking using JobSubscriptionManager
  const setupProgressTracking = (jobId: string, trackingFeatures: FeatureConfig[]) => {
    console.log('📡 [DEBUG] Setting up progress tracking for job:', jobId);
    console.log('📡 [DEBUG] Tracking features:', trackingFeatures.map(f => ({ id: f.id, name: f.name })));
    
    // Use JobSubscriptionManager for consolidated Firestore listening
    const handleJobUpdate = (job: Job | null) => {
      if (!job || !isMountedRef.current) {
        console.log('📡 [DEBUG] Job is null or component unmounted');
        return;
      }
      
      console.log('📡 [DEBUG] Job update received via JobSubscriptionManager');
      console.log('📡 [DEBUG] Full job data keys:', Object.keys(job || {}));
      
      const enhancedFeatures = job.enhancedFeatures || {};
      console.log('📡 [DEBUG] Enhanced features keys:', Object.keys(enhancedFeatures));
      console.log('📡 [DEBUG] Enhanced features content:', enhancedFeatures);
      
      // Check if we have any enhanced features at all
      if (Object.keys(enhancedFeatures).length === 0) {
        console.log('⚠️ [DEBUG] No enhanced features found in document - backend may not have written yet');
      }
      
      // Update progress state
      const newProgressState: ProgressState = {};
      let updatedFeatures = 0;
      
      trackingFeatures.forEach(feature => {
        const featureData = enhancedFeatures[feature.id];
        console.log(`📡 [DEBUG] Feature ${feature.id}:`, featureData ? 'FOUND' : 'NOT FOUND');
        
        if (featureData) {
          updatedFeatures++;
          // Safe handling of featureData to prevent forEach errors
          const safeFeatureData = {
            status: featureData.status || 'pending',
            progress: featureData.progress || 0,
            currentStep: featureData.currentStep,
            error: featureData.error,
            htmlFragment: featureData.htmlFragment,
            processedAt: featureData.processedAt
          };
          
          // Ensure no arrays are mishandled as objects
          if (Array.isArray(featureData)) {
            console.warn(`⚠️ [DEBUG] Feature ${feature.id} data is unexpectedly an array:`, featureData);
            safeFeatureData.status = 'failed';
            safeFeatureData.error = 'Invalid data structure received';
          }
          
          newProgressState[feature.id] = safeFeatureData;
          console.log(`📡 [DEBUG] Updated ${feature.id}:`, newProgressState[feature.id]);
        } else {
          newProgressState[feature.id] = {
            status: 'pending',
            progress: 0
          };
        }
      });
      
      console.log(`📡 [DEBUG] Progress update summary: ${updatedFeatures}/${trackingFeatures.length} features have data`);
      console.log('📡 [DEBUG] New progress state:', newProgressState);
      
      setProgressState(newProgressState);
      
      // Update HTML if new fragments are available
      // This would be implemented in Phase 2 with HTML merging
    };
    
    // Subscribe to job updates via JobSubscriptionManager
    const unsubscribeFromJob = jobSubscriptionManager.subscribeToJob(jobId, handleJobUpdate);
    
    // Set up cleanup function
    setProgressUnsubscribe(() => unsubscribeFromJob);
  };

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId || !isMountedRef.current) {
        return;
      }

      try {
        // Load generation config from session storage
        const storedConfig = sessionStorage.getItem(`generation-config-${jobId}`);
        if (storedConfig) {
          const config = JSON.parse(storedConfig);
          setGenerationConfig(config);
          
          // Check if this is an async initialization
          if (config.asyncMode && config.initResponse) {
            console.log('🚀 [ASYNC DETECTION] Detected async CV generation initialization');
            setIsAsyncInitialization(true);
          }
        }

        const jobData = await getJob(jobId);
        
        if (!jobData) {
          setError('Job not found');
          setLoading(false);
          return;
        }

        // Check if job belongs to current user
        if (user && jobData.userId !== user.uid) {
          setError('Unauthorized access');
          setLoading(false);
          return;
        }

        console.log('🔍 [DEBUG] Progressive FinalResultsPage - Job data check:', {
          hasGeneratedCV: !!jobData.generatedCV,
          hasHtml: !!(jobData.generatedCV?.html),
          hasHtmlUrl: !!(jobData.generatedCV?.htmlUrl),
          generatedCVKeys: jobData.generatedCV ? Object.keys(jobData.generatedCV) : null
        });

        // Check if CV has been generated, if not trigger generation
        if (!jobData.generatedCV || (!jobData.generatedCV.html && !jobData.generatedCV.htmlUrl)) {
          console.log('🚀 [DEBUG] CV not ready, checking if generation is in progress...');
          
          // Check if generation is already in progress (from immediate navigation)
          const storedConfig = sessionStorage.getItem(`generation-config-${jobId}`);
          if (storedConfig && !hasTriggeredGeneration.current) {
            const config = JSON.parse(storedConfig);
            console.log('🚀 [DEBUG] Found generation config:', { 
              hasConfig: true, 
              asyncMode: config.asyncMode, 
              hasInitResponse: !!config.initResponse,
              featuresCount: config.features?.length || 0
            });
            
            hasTriggeredGeneration.current = true;
            
            if (config.asyncMode && config.initResponse) {
              // Async mode: CV generation was already initiated, just track progress
              console.log('✅ [ASYNC] CV generation already initiated, setting up progress tracking');
              setIsGenerating(true);
              setLoading(false);
              setIsAsyncInitialization(true);
              
              // Show success message for async initialization
              toast.success(`CV generation in progress! Estimated time: ${config.initResponse.estimatedTime || 60} seconds`);
              
            } else {
              // Sync mode: CV generation is in progress from ResultsPage
              console.log('🚀 [SYNC] CV generation in progress from ResultsPage navigation');
              setIsGenerating(true);
              setLoading(false);
            }
            
            // Set up real-time tracking for CV generation progress
            if (config.features && config.features.length > 0) {
              console.log('✅ [DEBUG] Setting up feature tracking for ongoing generation');
              setupFeatureQueue(config.features, jobId);
              setIsProcessingFeatures(true);
            }
            
            // Poll for CV completion with different intervals based on mode
            const pollForCompletion = async () => {
              const maxAttempts = config.asyncMode ? 120 : 60; // 4 minutes async, 2 minutes sync
              const pollInterval = config.asyncMode ? 3000 : 2000; // 3s async, 2s sync
              let attempts = 0;
              
              const poll = async () => {
                attempts++;
                try {
                  const updatedJob = await getJob(jobId!);
                  if (updatedJob?.generatedCV?.html || updatedJob?.generatedCV?.htmlUrl) {
                    console.log('✅ [DEBUG] CV generation completed, updating job data');
                    if (isMountedRef.current) {
                      setJob(updatedJob);
                      await loadBaseHTML(updatedJob);
                      setIsGenerating(false);
                      setIsAsyncInitialization(false);
                      toast.success('CV generated successfully! Adding enhanced features...');
                    }
                  } else if (attempts < maxAttempts) {
                    setTimeout(poll, pollInterval);
                  } else {
                    console.error('❌ [DEBUG] CV generation timeout');
                    if (isMountedRef.current) {
                      setError('CV generation timed out. Please try again.');
                      setIsGenerating(false);
                      setIsAsyncInitialization(false);
                    }
                  }
                } catch (pollError) {
                  console.error('❌ [DEBUG] Error polling for CV completion:', pollError);
                  if (attempts >= maxAttempts && isMountedRef.current) {
                    setError('Failed to check CV generation status. Please refresh the page.');
                    setIsGenerating(false);
                    setIsAsyncInitialization(false);
                  } else {
                    setTimeout(poll, pollInterval);
                  }
                }
              };
              
              poll();
            };
            
            pollForCompletion();
            return;
          }
          
          // No stored config found, trigger generation manually
          if (!hasTriggeredGeneration.current) {
            console.log('🚀 [DEBUG] No generation config found, triggering manual generation');
            hasTriggeredGeneration.current = true;
            setTimeout(async () => {
              await triggerCVGeneration(jobData);
            }, 100);
          }
          return;
        }

        // Check if this is a quickCreate job that needs full workflow
        if (jobData.quickCreateReady && !hasTriggeredGeneration.current) {
          console.log('🚀 [DEBUG] Quick Create detected - triggering full workflow with all features');
          hasTriggeredGeneration.current = true;
          setTimeout(async () => {
            await triggerQuickCreateWorkflow(jobData);
          }, 100);
          return;
        }

        console.log('✅ [DEBUG] CV already generated, setting up progressive enhancement');

        if (isMountedRef.current) {
          setJob(jobData);
          
          // Load base HTML immediately
          await loadBaseHTML(jobData);
          
          // Set up feature queue if features are selected
          console.log('🔍 [DEBUG] Checking for features in generatedCV:', {
            hasGeneratedCV: !!jobData.generatedCV,
            hasFeatures: !!(jobData.generatedCV?.features),
            featuresLength: jobData.generatedCV?.features?.length || 0,
            features: jobData.generatedCV?.features
          });
          
          if (jobData.generatedCV?.features && jobData.generatedCV.features.length > 0) {
            console.log('✅ [DEBUG] Features found, setting up queue');
            setupFeatureQueue(jobData.generatedCV.features, jobId);
            setIsProcessingFeatures(true);
          } else {
            console.log('⚠️ [DEBUG] No features found in generatedCV, checking session storage');
            
            // Fallback: try to load features from session storage
            try {
              const storedConfig = sessionStorage.getItem(`generation-config-${jobId}`);
              if (storedConfig) {
                const config = JSON.parse(storedConfig);
                console.log('🔍 [DEBUG] Found stored generation config:', config);
                
                if (config.features && config.features.length > 0) {
                  console.log('✅ [DEBUG] Using features from session storage');
                  setupFeatureQueue(config.features, jobId);
                  setIsProcessingFeatures(true);
                }
              }
            } catch (error) {
              console.error('❌ [DEBUG] Error loading features from session storage:', error);
            }
          }
        }
      } catch (err: unknown) {
        console.error('Error loading job:', err);
        if (isMountedRef.current) {
          setError(err.message || 'Failed to load job data');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadJob();
  }, [jobId, user]);

  const triggerQuickCreateWorkflow = async (jobData: Job) => {
    console.log('🎯 [DEBUG] triggerQuickCreateWorkflow started - generating with ALL features');
    
    if (!isMountedRef.current) {
      return;
    }
    
    try {
      if (isMountedRef.current) {
        setIsGenerating(true);
        setLoading(false);
      }
      
      // Define all available features for quick create (kebab-case for backend)
      const allFeatures = [
        'generate-podcast',
        'video-introduction',
        'skills-visualization', 
        'interactive-timeline',
        'portfolio-gallery',
        'calendar-integration',
        'certification-badges',
        'language-proficiency'
      ];
      
      // Map kebab-case to camelCase for frontend tracking
      const kebabToCamelMap: Record<string, string> = {
        'generate-podcast': 'generatePodcast',
        'video-introduction': 'videoIntroduction',
        'skills-visualization': 'skillsVisualization',
        'interactive-timeline': 'interactiveTimeline',
        'portfolio-gallery': 'portfolioGallery',
        'calendar-integration': 'availabilityCalendar',
        'certification-badges': 'certificationBadges',
        'language-proficiency': 'languageProficiency'
      };
      
      console.log('🔥 [DEBUG] Quick Create: Calling generateCV with ALL features:', allFeatures);
      const result = await generateCV(jobData.id, 'modern', allFeatures);
      console.log('✅ [DEBUG] Quick Create: generateCV service returned:', result);
      
      // Generate podcast for quick create
      if (isMountedRef.current) {
        try {
          console.log('🎙️ Quick Create: Generating podcast');
          await generateEnhancedPodcast(jobData.id, 'professional');
          toast.success('Full CV with podcast generation completed!');
        } catch (podcastError) {
          console.error('Podcast generation failed:', podcastError);
          toast.success('CV generated successfully! Podcast generation in progress...');
        }
      }
      
      if (!isMountedRef.current) return;

      // Update job with generated CV including all features
      const updatedJob = { 
        ...jobData, 
        generatedCV: {
          html: result.generatedCV.html,
          htmlUrl: result.generatedCV.htmlUrl,
          pdfUrl: result.generatedCV.pdfUrl,
          docxUrl: result.generatedCV.docxUrl,
          template: 'modern',
          features: allFeatures
        },
        quickCreateReady: false // Mark as completed
      };
      
      setJob(updatedJob);
      
      // Load base HTML and set up progressive enhancement
      await loadBaseHTML(updatedJob);
      
      if (allFeatures.length > 0) {
        // Convert kebab-case features to camelCase for frontend
        const camelCaseFeatures = allFeatures.map(f => kebabToCamelMap[f]).filter(f => f);
        setupFeatureQueue(camelCaseFeatures, jobData.id);
        setIsProcessingFeatures(true);
      }
      
      console.log('✅ Quick Create: Full workflow completed successfully');
      toast.success('Complete CV with all enhancements ready!');
    } catch (error: unknown) {
      console.error('❌ [DEBUG] Error in triggerQuickCreateWorkflow:', error);
      if (isMountedRef.current) {
        setError('Failed to generate enhanced CV. Please try again.');
        toast.error(error?.message || 'Failed to generate enhanced CV');
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const triggerCVGeneration = async (jobData: Job) => {
    console.log('🎯 [DEBUG] triggerCVGeneration started');
    
    if (!isMountedRef.current) {
      return;
    }
    
    try {
      if (isMountedRef.current) {
        setIsGenerating(true);
        setLoading(false);
      }
      
      // Use stored config or defaults - ALWAYS load from session storage
      let selectedTemplate = 'modern';
      let selectedFeatures: string[] = [];
      let privacyModeEnabled = false;
      let podcastGeneration = false;
      
      console.log('🔍 [DEBUG] Current generationConfig:', generationConfig);
      
      // Try to load from session storage if generationConfig is not available
      let configToUse = generationConfig;
      if (!configToUse) {
        console.log('⚠️ [DEBUG] No generationConfig, loading from session storage...');
        const storedConfig = sessionStorage.getItem(`generation-config-${jobData.id}`);
        if (storedConfig) {
          try {
            configToUse = JSON.parse(storedConfig);
            console.log('✅ [DEBUG] Loaded config from session storage:', configToUse);
          } catch (error) {
            console.error('❌ [DEBUG] Error parsing stored config:', error);
          }
        } else {
          console.log('⚠️ [DEBUG] No session storage config found');
        }
      }
      
      if (configToUse) {
        selectedTemplate = configToUse.template || 'modern';
        selectedFeatures = Object.keys(configToUse.features || {}).filter(key => configToUse.features[key]);
        privacyModeEnabled = configToUse.features?.privacyMode || false;
        podcastGeneration = configToUse.features?.generatePodcast || false;
        console.log('✅ [DEBUG] Using config - features:', selectedFeatures);
      } else {
        console.log('⚠️ [DEBUG] No configuration available, using defaults');
      }

      // Generate CV with privacy mode handling
      if (privacyModeEnabled) {
        selectedFeatures.push('privacy-mode');
      }

      console.log('🔥 [DEBUG] Calling generateCV service with features:', selectedFeatures);
      const result = await generateCV(jobData.id, selectedTemplate, selectedFeatures);
      console.log('✅ [DEBUG] generateCV service returned:', result);
      
      // Generate podcast separately if selected
      if (podcastGeneration && isMountedRef.current) {
        try {
          console.log('Generating podcast for job:', jobData.id);
          await generateEnhancedPodcast(jobData.id, 'professional');
          toast.success('Podcast generation started!');
        } catch (podcastError) {
          console.error('Podcast generation failed:', podcastError);
          toast.error('Podcast generation failed, but CV was created successfully');
        }
      }
      
      if (!isMountedRef.current) return;

      // Update job with generated CV
      const updatedJob = { 
        ...jobData, 
        generatedCV: {
          html: result.generatedCV.html,
          htmlUrl: result.generatedCV.htmlUrl,
          pdfUrl: result.generatedCV.pdfUrl,
          docxUrl: result.generatedCV.docxUrl,
          template: selectedTemplate,
          features: selectedFeatures
        }
      };
      
      setJob(updatedJob);
      
      // Load base HTML and set up progressive enhancement
      await loadBaseHTML(updatedJob);
      
      if (selectedFeatures.length > 0) {
        setupFeatureQueue(selectedFeatures, jobData.id);
        setIsProcessingFeatures(true);
      }
      
      console.log('✅ CV generation completed successfully');
      toast.success('CV generated successfully! Adding enhanced features...');
    } catch (error: unknown) {
      console.error('❌ [DEBUG] Error in triggerCVGeneration:', error);
      if (isMountedRef.current) {
        setError('Failed to generate CV. Please try again.');
        toast.error(error?.message || 'Failed to generate CV');
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false);
      }
    }
  };

  const handleGenerateAnother = () => {
    navigate('/');
  };

  if (loading || isGenerating) {
    const getLoadingMessage = () => {
      if (loading) return 'Loading your CV...';
      if (isAsyncInitialization) return 'Your CV is being generated in real-time...';
      return 'Generating your enhanced CV...';
    };
    
    const getSubtitle = () => {
      if (loading) return 'Loading your CV...';
      if (isAsyncInitialization) return 'Real-time CV generation in progress';
      return 'Generating your enhanced CV...';
    };
    
    const getEstimatedTime = () => {
      if (loading) return null;
      if (isAsyncInitialization) return 'Estimated completion: 2-4 minutes';
      return 'This usually takes 30-60 seconds';
    };

    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          currentPage="results" 
          jobId={jobId}
          title="Your Enhanced CV"
          subtitle={getSubtitle()}
          variant="dark"
        />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto">
            {isAsyncInitialization ? (
              <div className="relative">
                <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <div className="absolute inset-0 w-12 h-12 mx-auto mb-4">
                  <div className="animate-ping w-12 h-12 rounded-full bg-cyan-400 opacity-20"></div>
                </div>
              </div>
            ) : (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            )}
            
            <p className="text-gray-300 text-lg mb-2">
              {getLoadingMessage()}
            </p>
            
            {isAsyncInitialization && (
              <div className="bg-cyan-900/30 border border-cyan-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-medium">Fast Track Mode Active</span>
                </div>
                <p className="text-cyan-200/80 text-xs">
                  Your CV is being generated with real-time progress tracking
                </p>
              </div>
            )}
            
            {getEstimatedTime() && (
              <p className="text-sm text-gray-400">
                {getEstimatedTime()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header 
          currentPage="results" 
          jobId={jobId}
          title="Your Enhanced CV"
          subtitle="Error loading CV"
          variant="dark"
        />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Error Loading CV</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        currentPage="results" 
        jobId={jobId}
        title="Your Enhanced CV"
        subtitle={isProcessingFeatures ? 
          "Your CV is ready! We're adding enhanced features..." : 
          "Download your professionally enhanced CV in multiple formats"
        }
        variant="dark"
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progressive Enhancement Status */}
        {featureQueue.length > 0 && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-gray-100">
                  {isProcessingFeatures ? 'Adding Enhanced Features' : 'Enhanced Features Complete'}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featureQueue.map(feature => (
                  <FeatureProgressCard
                    key={feature.id}
                    feature={feature}
                    progress={progressState[feature.id] || { status: 'pending', progress: 0 }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="mb-8">
          {/* CV Metadata */}
          <CVMetadata job={job} />

          {/* Download Actions */}
          <DownloadActions job={job} />
        </div>

        {/* Podcast Player */}
        {generationConfig?.features?.generatePodcast && (
          <div className="mb-8">
            <PodcastPlayer jobId={jobId!} />
          </div>
        )}

        {/* CV Display - Show base HTML immediately, then enhanced */}
        <div className="mb-8">
          {baseHTML ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-100">Your CV</h2>
                {isProcessingFeatures && (
                  <div className="flex items-center gap-2 text-sm text-cyan-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding enhancements...
                  </div>
                )}
              </div>
              
              {/* HTML Content Display */}
              <div className="bg-white rounded-lg p-6 overflow-auto max-h-[600px]">
                <div dangerouslySetInnerHTML={{ __html: enhancedHTML }} />
              </div>
            </div>
          ) : (
            <GeneratedCVDisplay 
              job={job}
              className="rounded-lg shadow-lg overflow-hidden"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGenerateAnother}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Another CV
          </button>
          
          <button
            onClick={() => navigate(`/results/${jobId}`)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Feature Selection
          </button>
        </div>
      </div>
    </div>
  );
};