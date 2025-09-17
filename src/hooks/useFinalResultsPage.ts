import { useState, useEffect } from 'react';
import { getJob } from '../services/cvService';
import { useAuth } from '../contexts/AuthContext';
import { JobSubscriptionManager } from '../services/JobSubscriptionManager';
import type { Job } from '../types/cv';
import { FEATURE_CONFIGS } from '../config/featureConfigs';
import { kebabToCamelCase } from '../utils/featureUtils';
import toast from 'react-hot-toast';

export const useFinalResultsPage = (jobId: string) => {
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationConfig, setGenerationConfig] = useState<any>(null);
  const [baseHTML, setBaseHTML] = useState<string>('');
  const [enhancedHTML, setEnhancedHTML] = useState<string>('');
  const [featureQueue, setFeatureQueue] = useState<any[]>([]);
  const [isProcessingFeatures, setIsProcessingFeatures] = useState(false);

  const loadBaseHTML = async (job: Job) => {
    console.warn('💼 [HTML-LOAD] Starting HTML load process:', {
      hasHTML: !!job.generatedCV?.html,
      hasHTMLUrl: !!job.generatedCV?.htmlUrl,
      htmlUrl: job.generatedCV?.htmlUrl,
      htmlLength: job.generatedCV?.html?.length || 0
    });
    
    try {
      // Try to load from HTML URL first if available
      if (job.generatedCV?.htmlUrl) {
        console.warn('🌍 [HTML-LOAD] Attempting to fetch from URL:', job.generatedCV.htmlUrl);
        
        if (job.generatedCV.htmlUrl.includes('firebasestorage') || job.generatedCV.htmlUrl.includes('localhost:9199')) {
          try {
            const response = await fetch(job.generatedCV.htmlUrl);
            if (response.ok) {
              const htmlContent = await response.text();
              console.warn('✅ [HTML-LOAD] Successfully fetched HTML from URL:', htmlContent.length, 'characters');
              setBaseHTML(htmlContent);
              setEnhancedHTML(htmlContent);
              return;
            } else {
              console.warn('⚠️ [HTML-LOAD] Failed to fetch HTML from URL:', response.status, response.statusText);
            }
          } catch (fetchError) {
            console.error('❌ [HTML-LOAD] Error fetching HTML from URL:', fetchError);
          }
        }
      }
      
      // Fallback to inline HTML if available
      if (job.generatedCV?.html) {
        console.warn('📝 [HTML-LOAD] Using inline HTML content:', job.generatedCV.html.length, 'characters');
        setBaseHTML(job.generatedCV.html);
        setEnhancedHTML(job.generatedCV.html);
        return;
      }
      
      console.warn('⚠️ [HTML-LOAD] No HTML content available in job data');
      
    } catch (error) {
      console.error('❌ [HTML-LOAD] Error in loadBaseHTML:', error);
      
      // Final fallback attempt
      if (job.generatedCV?.html) {
        console.warn('🔄 [HTML-LOAD] Fallback: Using inline HTML after error');
        setBaseHTML(job.generatedCV.html);
        setEnhancedHTML(job.generatedCV.html);
      }
    }
  };

  const setupFeatureQueue = (selectedFeatures: string[]) => {
    console.warn('🔧 [DEBUG] setupFeatureQueue called with features:', selectedFeatures);
    
    // Features that are processed by the backend and should NOT go to progressive enhancement
    const backendProcessedFeatures = [
      'ats-optimization',
      'keyword-enhancement',
      'achievement-highlighting'
    ];
    
    // Filter out backend-processed features - they're already in the base HTML
    const progressiveEnhancementFeatures = selectedFeatures.filter(feature => {
      const isBackendFeature = backendProcessedFeatures.includes(feature);
      if (isBackendFeature) {
        console.warn(`🔧 [DEBUG] Filtering out backend feature: ${feature} (already processed)`);
      }
      return !isBackendFeature;
    });
    
    console.warn('🔧 [DEBUG] Progressive enhancement features after filtering:', progressiveEnhancementFeatures);
    
    const normalizedFeatures = progressiveEnhancementFeatures.map(feature => 
      feature === 'embed-q-r-code' ? 'embed-qr-code' : feature
    );
    console.warn('🔧 [DEBUG] Normalized features:', normalizedFeatures);
    
    const camelCaseFeatures = normalizedFeatures.map(feature => 
      feature === 'embed-qr-code' ? 'embedQRCode' : kebabToCamelCase(feature)
    );
    console.warn('🔧 [DEBUG] CamelCase features:', camelCaseFeatures);
    
    const queue = camelCaseFeatures
      .filter(featureId => {
        const hasConfig = !!FEATURE_CONFIGS[featureId];
        if (!hasConfig) {
          console.warn(`🔧 [DEBUG] No config found for feature: ${featureId}`);
        }
        return hasConfig;
      })
      .map(featureId => FEATURE_CONFIGS[featureId]);
    
    console.warn('🔧 [DEBUG] Final feature queue (progressive enhancement only):', queue);
    
    // Log summary of feature processing approach
    const backendCount = selectedFeatures.filter(f => backendProcessedFeatures.includes(f)).length;
    const progressiveCount = queue.length;
    console.warn(`📊 [FEATURE-SUMMARY] Backend features: ${backendCount}, Progressive enhancement features: ${progressiveCount}`);
    
    if (backendCount > 0) {
      console.warn('✅ [FEATURE-SUMMARY] Backend features are already integrated in the base CV HTML');
    }
    
    if (progressiveCount === 0) {
      console.warn('🎯 [FEATURE-SUMMARY] No progressive enhancement needed - CV is ready to display');
    } else {
      console.warn(`🚀 [FEATURE-SUMMARY] Will progressively enhance CV with ${progressiveCount} features`);
    }
    
    setFeatureQueue(queue);
    setIsProcessingFeatures(queue.length > 0);
  };

  const loadJobData = async () => {
    if (!jobId) return;
    try {
      const storedConfig = sessionStorage.getItem(`generation-config-${jobId}`);
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        setGenerationConfig(config);
      }

      const jobData = await getJob(jobId);
      if (!jobData) {
        setError('Job not found');
        return;
      }
      if (user && jobData.userId !== user.uid) {
        setError('Unauthorized access');
        return;
      }

      setJob(jobData);
      console.warn('🔧 [DEBUG] Job data loaded:', {
        jobStatus: jobData.status,
        hasGeneratedCV: !!jobData.generatedCV,
        hasGeneratedHTML: !!jobData.generatedCV?.html,
        hasGeneratedHTMLUrl: !!jobData.generatedCV?.htmlUrl,
        hasFeatures: !!jobData.generatedCV?.features,
        featuresLength: jobData.generatedCV?.features?.length || 0,
        features: jobData.generatedCV?.features,
        selectedFeatures: jobData.selectedFeatures,
        enhancedFeatures: jobData.enhancedFeatures || 'No enhancedFeatures field',
        enhancedFeaturesKeys: jobData.enhancedFeatures ? Object.keys(jobData.enhancedFeatures) : [],
        enhancedFeaturesStatus: jobData.enhancedFeatures ? 
          Object.entries(jobData.enhancedFeatures).map(([key, value]: [string, any]) => 
            ({ [key]: value.status })
          ) : [],
        allJobKeys: Object.keys(jobData)
      });
      
      // Always try to load HTML content if the job is completed or has generated CV data
      if (jobData.generatedCV?.html || jobData.generatedCV?.htmlUrl || jobData.status === 'completed') {
        console.warn('🚀 [DEBUG] Attempting to load HTML content for completed job');
        await loadBaseHTML(jobData);
      } else {
        console.warn('⏳ [DEBUG] Job not ready for HTML display:', {
          status: jobData.status,
          hasGeneratedCV: !!jobData.generatedCV,
          hasHTML: !!jobData.generatedCV?.html,
          hasHTMLUrl: !!jobData.generatedCV?.htmlUrl
        });
      }
      
      // Try to setup feature queue from generatedCV.features first
      if (jobData.generatedCV?.features && jobData.generatedCV.features.length > 0) {
        console.warn('🔧 [DEBUG] Setting up feature queue with features from generatedCV:', jobData.generatedCV.features);
        setupFeatureQueue(jobData.generatedCV.features);
      } 
      // If no features in generatedCV, check enhancedFeatures
      else if (jobData.enhancedFeatures && Object.keys(jobData.enhancedFeatures).length > 0) {
        console.warn('🔧 [DEBUG] Setting up feature queue with features from enhancedFeatures:', Object.keys(jobData.enhancedFeatures));
        const enhancedFeatureIds = Object.keys(jobData.enhancedFeatures);
        setupFeatureQueue(enhancedFeatureIds);
      } 
      // Check selectedFeatures as fallback
      else if (jobData.selectedFeatures && jobData.selectedFeatures.length > 0) {
        console.warn('🔧 [DEBUG] Setting up feature queue with selectedFeatures:', jobData.selectedFeatures);
        setupFeatureQueue(jobData.selectedFeatures);
      } else {
        console.warn('🔧 [DEBUG] No features found in job data - feature queue will be empty');
      }
      
      // Update processing state based on job status and feature completion
      if (jobData.status === 'completed' && jobData.enhancedFeatures) {
        const featuresComplete = Object.values(jobData.enhancedFeatures).every(
          (feature: any) => feature.status === 'completed' || feature.status === 'failed' || feature.status === 'skipped'
        );
        setIsProcessingFeatures(!featuresComplete);
        console.warn('🏁 [DEBUG] Job completed, features processing status:', !featuresComplete);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [jobId, user]);
  
  // Set up real-time job updates to handle status changes from generating to completed
  useEffect(() => {
    if (!jobId || !user) return;
    
    const jobSubscriptionManager = JobSubscriptionManager.getInstance();
    const unsubscribe = jobSubscriptionManager.subscribeToProgress(
      jobId,
      (updatedJob: Job | null) => {
        if (!updatedJob) return;
        
        console.warn('🔄 [REAL-TIME] Job status update received:', {
          currentStatus: job?.status,
          newStatus: updatedJob.status,
          hasGeneratedCV: !!updatedJob.generatedCV,
          generatedCVKeys: updatedJob.generatedCV ? Object.keys(updatedJob.generatedCV) : []
        });
        
        // If job status changed to completed or if we now have generated CV data
        if ((updatedJob.status === 'completed' && job?.status !== 'completed') || 
            (updatedJob.generatedCV && !job?.generatedCV)) {
          console.warn('🎉 [REAL-TIME] Job completed or CV generated, reloading job data');
          setJob(updatedJob);
          
          // Load HTML content if it's available
          if (updatedJob.generatedCV?.html || updatedJob.generatedCV?.htmlUrl) {
            loadBaseHTML(updatedJob);
          }
          
          // Update feature queue if needed
          if (updatedJob.generatedCV?.features && updatedJob.generatedCV.features.length > 0) {
            setupFeatureQueue(updatedJob.generatedCV.features);
          }
        } else if (updatedJob.status !== job?.status) {
          // Update job for any other status changes
          setJob(updatedJob);
        }
      },
      {
        enableLogging: true,
        debounceMs: 500,
        errorRecovery: true
      }
    );
    
    return unsubscribe;
  }, [jobId, user, job?.status, job?.generatedCV]);

  return {
    job, setJob, loading, error, setError, generationConfig, setGenerationConfig,
    baseHTML, enhancedHTML, featureQueue, isProcessingFeatures, setIsProcessingFeatures,
    loadBaseHTML, setupFeatureQueue, loadJobData
  };
};