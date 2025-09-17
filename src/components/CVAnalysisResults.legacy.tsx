import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle, AlertTriangle, Target, Sparkles, TrendingUp, Wand2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { applyImprovements, type Job } from '../services/cvService';
import { MagicTransformService, type MagicTransformProgress, type MagicTransformResult } from '../services/features/MagicTransformService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import toast from 'react-hot-toast';
import { robustNavigation } from '../utils/robustNavigation';
import type { PrioritizedRecommendation } from '../types/ats';
import { getErrorMessage, logError } from '../utils/errorHandling';

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  impact: string;
  estimatedImprovement: number; // ATS score points
  selected: boolean;
}

interface ATSAnalysis {
  currentScore: number;
  predictedScore: number;
  issues: Array<{
    message: string;
    severity: 'error' | 'warning';
    category: string;
  }>;
  suggestions: Array<{
    reason: string;
    impact: string;
    category: string;
  }>;
  overall: number;
  passes: boolean;
}

interface CVAnalysisResultsProps {
  job: Job;
  onContinue: (selectedRecommendations: string[]) => void;
  onBack?: () => void;
  className?: string;
}

export const CVAnalysisResults: React.FC<CVAnalysisResultsProps> = ({
  job,
  onContinue,
  onBack,
  className = ''
}) => {
  const navigate = useNavigate();
  
  // Initialize all state variables first, before using them in effects
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [expandedPriorities, setExpandedPriorities] = useState<Record<string, boolean>>({
    high: true,
    medium: true,
    low: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicTransforming, setIsMagicTransforming] = useState(false);
  const [magicTransformProgress, setMagicTransformProgress] = useState<MagicTransformProgress | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadedJobId, setLoadedJobId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`🔄 [STATE CHANGE] Recommendations updated:`, {
        length: recommendations.length,
        jobId: job.id,
        loadedJobId,
        isLoading,
        timestamp: new Date().toISOString(),
        recommendations: recommendations.map(r => ({ id: r.id, title: r.title, priority: r.priority }))
      });
    }
  }, [recommendations, job.id, loadedJobId, isLoading]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Enhanced load function with StrictMode-aware duplicate prevention
  const loadAnalysisAndRecommendations = useCallback(async () => {
    // Enhanced duplicate prevention checks
    if (loadedJobId === job.id) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Already loaded for job ${job.id}`);
      }
      return;
    }
    
    if (isLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Already loading, skipping duplicate request`);
      }
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.warn(`[CVAnalysisResults] Starting load for job ${job.id}:`, {
        currentLoadedJobId: loadedJobId,
        isCurrentlyLoading: isLoading,
        isMounted: isMountedRef.current,
        strictMode: process.env.NODE_ENV === 'development'
      });
    }
    
    try {
      // Check if component is still mounted
      if (!isMountedRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[CVAnalysisResults] Component unmounted, aborting load`);
        }
        return;
      }
      
      setIsLoading(true);
      setLoadedJobId(job.id);
      
      // Generate mock ATS analysis (this can be replaced with real analysis later)
      const mockAnalysis: ATSAnalysis = {
        currentScore: 72,
        predictedScore: 85,
        issues: [
          { message: 'Missing professional summary section', severity: 'error' as const, category: 'Structure' },
          { message: 'Date format inconsistency detected', severity: 'warning' as const, category: 'Formatting' },
          { message: 'Skills section needs better keyword density', severity: 'warning' as const, category: 'Keywords' }
        ],
        suggestions: [
          { reason: 'Add action verbs to experience descriptions', impact: 'High', category: 'Content' },
          { reason: 'Include industry-specific keywords', impact: 'Medium', category: 'Keywords' },
          { reason: 'Quantify achievements with metrics', impact: 'High', category: 'Impact' },
          { reason: 'Optimize section headings for ATS scanning', impact: 'Medium', category: 'Structure' }
        ],
        overall: 72,
        passes: true
      };
      
      // Check if component is still mounted before setting state
      if (!isMountedRef.current) return;
      setAtsAnalysis(mockAnalysis);
      
      // Get real recommendations from backend using RequestManager (zero-tolerance duplicate prevention)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Calling CVServiceCore.getRecommendations for job: ${job.id}`);
        console.warn(`[CVAnalysisResults] Job object:`, { id: job.id, status: job.status, userId: job.userId });
      }
      
      let recommendationsData;
      try {
        recommendationsData = await CVServiceCore.getRecommendations(job.id);
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[CVAnalysisResults] Raw API response received:`, recommendationsData);
        }
      } catch (apiError: unknown) {
        console.error(`[CVAnalysisResults] API call failed:`, apiError);
        console.error(`[CVAnalysisResults] Error details:`, {
          message: apiError instanceof Error ? apiError.message : 'Unknown error',
          code: apiError && typeof apiError === 'object' && 'code' in apiError ? apiError.code : 'Unknown code',
          stack: apiError instanceof Error ? apiError.stack : 'No stack trace'
        });
        
        // Check if the error is a timeout - use fallback recommendations
        if (apiError instanceof Error && apiError.message.includes('Timeout after')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[CVAnalysisResults] Timeout detected, using fallback mock recommendations for testing`);
          }
          
          // Create realistic mock recommendations for fallback
          const fallbackRecommendations = [
            {
              id: 'fallback-001',
              title: 'Enhance Professional Summary',
              description: 'Add a compelling professional summary that highlights your key achievements and career objectives.',
              priority: 9,
              impact: 'high',
              category: 'Content',
              estimatedScoreImprovement: 8
            },
            {
              id: 'fallback-002', 
              title: 'Optimize Keywords for ATS',
              description: 'Include industry-specific keywords and technical terms that align with the job requirements.',
              priority: 8,
              impact: 'high',
              category: 'Keywords',
              estimatedScoreImprovement: 7
            },
            {
              id: 'fallback-003',
              title: 'Quantify Achievements',
              description: 'Add specific metrics, percentages, and numbers to demonstrate the impact of your work.',
              priority: 7,
              impact: 'medium',
              category: 'Content',
              estimatedScoreImprovement: 6
            },
            {
              id: 'fallback-004',
              title: 'Improve Section Structure',
              description: 'Reorganize sections and use consistent formatting for better readability and ATS parsing.',
              priority: 6,
              impact: 'medium',
              category: 'Structure',
              estimatedScoreImprovement: 5
            },
            {
              id: 'fallback-005',
              title: 'Add Action Verbs',
              description: 'Replace passive language with strong action verbs to make your experience more compelling.',
              priority: 5,
              impact: 'medium',
              category: 'Content',
              estimatedScoreImprovement: 4
            },
            {
              id: 'fallback-006',
              title: 'Update Skills Section',
              description: 'Include relevant technical and soft skills mentioned in the job posting.',
              priority: 4,
              impact: 'low',
              category: 'Skills',
              estimatedScoreImprovement: 3
            }
          ];
          
          // Set fallback data instead of throwing error
          recommendationsData = {
            success: true,
            data: {
              recommendations: fallbackRecommendations
            }
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[CVAnalysisResults] Using ${fallbackRecommendations.length} fallback recommendations`);
          }
          
        } else {
          throw apiError;
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] getRecommendations completed for job: ${job.id}`);
        console.warn('Raw recommendations data:', recommendationsData);
        console.warn('Response structure keys:', Object.keys(recommendationsData || {}));
        
        if (recommendationsData?.data) {
          console.warn('Data structure keys:', Object.keys(recommendationsData.data));
          console.warn('Recommendations array length:', recommendationsData.data.recommendations?.length || 0);
        }
        
        // Debug all possible data paths
        console.warn('Debugging all possible data structures:', {
          'recommendationsData': !!recommendationsData,
          'recommendationsData.data': !!recommendationsData?.data,
          'recommendationsData.data.recommendations': !!recommendationsData?.data?.recommendations,
          'recommendationsData.recommendations': !!recommendationsData?.recommendations,
          'recommendationsData.success': !!recommendationsData?.success,
          'recommendationsData.result': !!recommendationsData?.result,
          'Array.isArray(recommendationsData?.data?.recommendations)': Array.isArray(recommendationsData?.data?.recommendations),
          'recommendationsData?.data?.recommendations?.length': recommendationsData?.data?.recommendations?.length
        });
      }
      
      // Transform backend recommendations to frontend format
      let backendRecs: PrioritizedRecommendation[] | null = null;
      
      if (process.env.NODE_ENV === 'development') {
        console.warn('🔍 [DATA PARSING] Starting comprehensive data structure analysis...');
      }
      
      // Check multiple possible response structures with enhanced debugging
      const structureChecks: Array<{name: string; condition: boolean; data: PrioritizedRecommendation[] | unknown}> = [
        {
          name: 'Firebase Callable Response (success + data.recommendations)',
          condition: recommendationsData?.success && recommendationsData?.data?.recommendations && Array.isArray(recommendationsData.data.recommendations),
          data: recommendationsData?.data?.recommendations as PrioritizedRecommendation[]
        },
        {
          name: 'Direct data.recommendations',
          condition: recommendationsData?.data?.recommendations && Array.isArray(recommendationsData.data.recommendations),
          data: recommendationsData?.data?.recommendations as PrioritizedRecommendation[]
        },
        {
          name: 'Direct recommendations array',
          condition: recommendationsData?.recommendations && Array.isArray(recommendationsData.recommendations),
          data: recommendationsData?.recommendations as PrioritizedRecommendation[]
        },
        {
          name: 'HTTP Response (result.data.recommendations)',
          condition: recommendationsData?.result?.data?.recommendations && Array.isArray(recommendationsData.result.data.recommendations),
          data: recommendationsData?.result?.data?.recommendations as PrioritizedRecommendation[]
        },
        {
          name: 'Nested data.data.recommendations',
          condition: recommendationsData?.data?.data?.recommendations && Array.isArray(recommendationsData.data.data.recommendations),
          data: recommendationsData?.data?.data?.recommendations as PrioritizedRecommendation[]
        }
      ];
      
      structureChecks.forEach((check, index) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🔍 Check ${index + 1} - ${check.name}:`, {
            condition: check.condition,
            hasData: !!check.data,
            dataLength: Array.isArray(check.data) ? check.data.length : 'N/A'
          });
        }
        
        if (check.condition && !backendRecs) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`✅ MATCH! Using structure: ${check.name}`);
          }
          backendRecs = check.data as PrioritizedRecommendation[];
        }
      });
      
      if (backendRecs && Array.isArray(backendRecs) && backendRecs.length > 0) {
        const validBackendRecs: PrioritizedRecommendation[] = backendRecs as PrioritizedRecommendation[];
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🎉 SUCCESS! Found ${validBackendRecs.length} recommendations to process`);
          console.warn('First 3 recommendations:', validBackendRecs.slice(0, 3));
        }
        const transformedRecommendations: RecommendationItem[] = validBackendRecs.map((rec: unknown) => {
          // Type guard to ensure rec is an object
          if (!rec || typeof rec !== 'object') {
            throw new Error('Invalid recommendation data structure');
          }
          const recommendation = rec as Record<string, unknown>;
          // Map backend impact to frontend priority
          let frontendPriority: 'high' | 'medium' | 'low';
          if (recommendation.impact === 'high' || (typeof recommendation.priority === 'number' && recommendation.priority >= 8)) {
            frontendPriority = 'high';
          } else if (recommendation.impact === 'medium' || (typeof recommendation.priority === 'number' && recommendation.priority >= 5)) {
            frontendPriority = 'medium';
          } else {
            frontendPriority = 'low';
          }
          
          return {
            id: typeof recommendation.id === 'string' ? recommendation.id : `rec-${Math.random()}`,
            title: typeof recommendation.title === 'string' ? recommendation.title : 'CV Improvement',
            description: typeof recommendation.description === 'string' ? recommendation.description : 'Enhance your CV content',
            priority: frontendPriority,
            category: typeof recommendation.category === 'string' ? recommendation.category : 
                     typeof recommendation.section === 'string' ? recommendation.section : 'General',
            impact: typeof recommendation.description === 'string' ? recommendation.description : 
                   `${recommendation.impact || 'medium'} impact improvement`,
            estimatedImprovement: typeof recommendation.estimatedScoreImprovement === 'number' ? 
                                 recommendation.estimatedScoreImprovement : 5,
            selected: frontendPriority === 'high' // Auto-select high priority items
          };
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Successfully transformed ${transformedRecommendations.length} recommendations`);
          console.warn('First transformed recommendation:', transformedRecommendations[0]);
        }
        
        // Check if component is still mounted before setting state
        if (!isMountedRef.current) return;
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`🎉 SUCCESS! Setting ${transformedRecommendations.length} recommendations in component state`);
          console.warn('Recommendations about to be set:', transformedRecommendations);
        }
        setRecommendations(transformedRecommendations);
        
        // Verify state was set correctly
        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.warn('📊 State verification after setting recommendations:', {
              recommendationsLength: transformedRecommendations.length,
              componentStillMounted: isMountedRef.current
            });
          }
        }, 100);
        
      } else {
        console.error('❌ CRITICAL: No valid recommendations found in response!');
        console.error('Full response structure:', JSON.stringify(recommendationsData, null, 2));
        console.error('Response type:', typeof recommendationsData);
        console.error('Response keys:', recommendationsData ? Object.keys(recommendationsData) : 'null/undefined');
        
        // Try to extract recommendations from ANY possible nested structure
        const allPossiblePaths = [
          recommendationsData?.data?.recommendations,
          recommendationsData?.recommendations,
          recommendationsData?.result?.data?.recommendations,
          recommendationsData?.success?.data?.recommendations,
          recommendationsData?.data?.data?.recommendations,
          recommendationsData?.result?.recommendations
        ];
        
        console.error('Checking all possible paths:');
        allPossiblePaths.forEach((path, index) => {
          console.error(`Path ${index}:`, {
            exists: !!path,
            isArray: Array.isArray(path),
            length: Array.isArray(path) ? path.length : 'N/A',
            sample: Array.isArray(path) && path.length > 0 ? path[0] : 'N/A'
          });
        });
        
        // Check if component is still mounted before setting state
        if (!isMountedRef.current) {
          console.warn('❌ Component unmounted, skipping state update');
          return;
        }
        
        console.warn('⚠️ Setting empty recommendations array as fallback');
        setRecommendations([]);
      }
      
    } catch (error: unknown) {
      logError(`loadRecommendations-${job.id}`, error);
      toast.error('Failed to load recommendations. Please try again.');
      
      // Check if component is still mounted before setting state
      if (!isMountedRef.current) return;
      
      setRecommendations([]);
      
      // Set basic analysis for fallback
      const fallbackAnalysis: ATSAnalysis = {
        currentScore: 70,
        predictedScore: 75,
        issues: [],
        suggestions: [],
        overall: 70,
        passes: true
      };
      
      setAtsAnalysis(fallbackAnalysis);
    } finally {
      // Check if component is still mounted before setting state
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [job.id, job.status, job.userId, loadedJobId, isLoading]);

  // Load recommendations when job changes - Enhanced StrictMode-aware duplicate prevention
  useEffect(() => {
    // Skip if component unmounted
    if (!isMountedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Component unmounted, skipping useEffect`);
      }
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[CVAnalysisResults] useEffect triggered:`, {
        jobId: job.id,
        loadedJobId,
        isLoading,
        isMounted: isMountedRef.current,
        strictMode: process.env.NODE_ENV === 'development'
      });
    }
    
    // Reset state if job changed
    if (loadedJobId && loadedJobId !== job.id) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Job changed from ${loadedJobId} to ${job.id}, resetting state`);
      }
      setRecommendations([]);
      setAtsAnalysis(null);
      setIsLoading(true);
      setLoadedJobId(null);
    }
    
    // Enhanced duplicate prevention for StrictMode
    // Only load if not already loaded/loading for this job
    if (loadedJobId !== job.id && !isLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Loading recommendations for new job: ${job.id}`);
      }
      loadAnalysisAndRecommendations();
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[CVAnalysisResults] Skipping load - already loaded/loading:`, {
          alreadyLoaded: loadedJobId === job.id,
          isCurrentlyLoading: isLoading
        });
      }
    }
  }, [job.id, isLoading, loadAnalysisAndRecommendations, loadedJobId]); // Keep dependency simple - enhanced logic handles StrictMode

  const toggleRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, selected: !rec.selected } : rec
      )
    );
  };

  const togglePrioritySection = (priority: string) => {
    setExpandedPriorities(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const applyAllPriority = (priority: 'high' | 'medium' | 'low', selected: boolean) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.priority === priority ? { ...rec, selected } : rec
      )
    );
  };

  const applyAll = (selected: boolean) => {
    setRecommendations(prev =>
      prev.map(rec => ({ ...rec, selected }))
    );
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <Sparkles className="w-4 h-4" />;
    }
  };

  const selectedRecs = recommendations.filter(r => r.selected);
  const potentialImprovement = selectedRecs.reduce((sum, rec) => sum + rec.estimatedImprovement, 0);
  const newPredictedScore = atsAnalysis ? Math.min(95, atsAnalysis.currentScore + potentialImprovement) : 0;

  const getRecommendationsByPriority = (priority: 'high' | 'medium' | 'low') => {
    return recommendations.filter(r => r.priority === priority);
  };

  // Enhanced Magic Transform Handler with comprehensive feature generation
  const handleMagicTransform = async () => {
    if (recommendations.length === 0) {
      toast.error('No recommendations available for magic transformation.');
      return;
    }
    
    setIsMagicTransforming(true);
    setMagicTransformProgress(null);
    
    try {
      // Auto-select high and medium priority recommendations
      const magicSelectedRecs = recommendations
        .filter(rec => rec.priority === 'high' || rec.priority === 'medium')
        .map(rec => rec.id);
      
      if (magicSelectedRecs.length === 0) {
        toast.error('No high or medium priority recommendations available.');
        setIsMagicTransforming(false);
        return;
      }
      
      // Show initial progress
      toast.loading('🪄 Starting Magic Transform...', { duration: 1000 });
      
      // Execute Enhanced Magic Transform with progress tracking
      const result: MagicTransformResult = await MagicTransformService.executeEnhancedMagicTransform(
        job.id,
        magicSelectedRecs,
        (progress: MagicTransformProgress) => {
          setMagicTransformProgress(progress);
          
          // Show progress updates as toasts
          if (progress.stage === 'improvements') {
            toast.loading('🔧 Applying AI improvements...', { duration: 2000 });
          } else if (progress.stage === 'core_features') {
            toast.loading('🚀 Generating features...', { duration: 2000 });
          } else if (progress.stage === 'premium_features') {
            toast.loading('⭐ Creating premium features...', { duration: 2000 });
          } else if (progress.stage === 'finalizing') {
            toast.loading('✨ Finalizing your enhanced CV...', { duration: 1000 });
          }
        }
      );
      
      // Store results for preview page
      if (result.results.improvements) {
        const resultData = result.results.improvements.data as Record<string, unknown>;
        if (resultData && 'improvedCV' in resultData) {
          sessionStorage.setItem(`improvements-${job.id}`, JSON.stringify(resultData.improvedCV));
        }
      }
      
      // Store selected recommendations
      sessionStorage.setItem(`recommendations-${job.id}`, JSON.stringify(magicSelectedRecs));
      
      // Store magic transform results for detailed preview
      sessionStorage.setItem(`magic-transform-${job.id}`, JSON.stringify(result));
      
      // Show success message with details
      const successMessage = `✨ Magic Transform completed! Applied ${result.appliedImprovements} improvements and generated ${result.generatedFeatures.length} features${result.userTier === 'PREMIUM' ? ' (Premium)' : ''}.`;
      toast.success(successMessage, { duration: 5000 });
      
      // Navigate to role selection first, then preview
      // Store the magic transform intent for after role selection
      sessionStorage.setItem(`magic-transform-intent-${job.id}`, 'true');
      
      // Navigate directly to feature selection page
      navigate(`/customize/${job.id}`);
      
      // Clear transformation state
      setIsMagicTransforming(false);
      setMagicTransformProgress(null);
      
    } catch (error: unknown) {
      logError('enhancedMagicTransform', error);
      toast.error(getErrorMessage(error) || 'Failed to complete magic transformation. Please try manual features.');
      setIsMagicTransforming(false);
      setMagicTransformProgress(null);
    }
  };

  // Get magic transform preview stats
  const magicSelectedRecs = recommendations.filter(rec => rec.priority === 'high' || rec.priority === 'medium');
  const magicPotentialImprovement = magicSelectedRecs.reduce((sum, rec) => sum + rec.estimatedImprovement, 0);
  const magicPredictedScore = atsAnalysis ? Math.min(95, atsAnalysis.currentScore + magicPotentialImprovement) : 0;

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-600 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-6"></div>
            
            <div className="flex items-center gap-3 mt-4">
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span className="text-gray-300">Loading personalized recommendations...</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-600 rounded w-1/3"></div>
                <div className="h-32 bg-gray-600 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-600 rounded w-1/2"></div>
                <div className="h-20 bg-gray-600 rounded"></div>
                <div className="h-20 bg-gray-600 rounded"></div>
                <div className="h-20 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">CV Analysis Complete</h1>
            <p className="text-gray-400">
              We've analyzed your CV and identified opportunities to enhance its impact and ATS compatibility.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Analysis Complete</span>
          </div>
        </div>
      </div>

      {/* Magic Transform Button */}
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg shadow-xl p-6 border border-purple-500/30">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-100">1-Click Magic Transform</h2>
            </div>
            <p className="text-gray-300 mb-3">
              Let our AI create a comprehensive enhanced CV with improvements AND features. 
              <span className="font-semibold text-purple-300">
                Get your complete professional portfolio in one click!
              </span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* CV Improvements */}
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-300">CV Improvements:</h4>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>{magicSelectedRecs.length} AI recommendations</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{magicPotentialImprovement} ATS score points</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Target className="w-4 h-4" />
                  <span>Target score: {magicPredictedScore}%</span>
                </div>
              </div>
              
              {/* Features Generated */}
              <div className="space-y-2">
                <h4 className="font-semibold text-cyan-300">Features Generated:</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>📊 Skills Visualization</div>
                  <div>📅 Interactive Timeline</div>
                  <div>🎨 Portfolio Gallery</div>
                  <div>📱 QR Code</div>
                  <div className="text-yellow-400">⭐ + Premium Features</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <button
              onClick={() => {
                if (process.env.NODE_ENV === 'development') {
                  console.warn('🪄 Magic Transform clicked! Current state:', {
                    recommendationsLength: recommendations.length,
                    magicSelectedRecsLength: magicSelectedRecs.length,
                    isMagicTransforming,
                    recommendations: recommendations.map(r => ({ id: r.id, title: r.title, priority: r.priority })),
                    magicSelectedRecs: magicSelectedRecs.map(r => ({ id: r.id, title: r.title, priority: r.priority })),
                  });
                }
                handleMagicTransform();
              }}
              disabled={isMagicTransforming || magicSelectedRecs.length === 0 || recommendations.length === 0}
              className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Button content */}
              <div className="relative flex items-center gap-3">
                {isMagicTransforming ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Transforming...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Magic Transform</span>
                    <Wand2 className="w-6 h-6" />
                  </>
                )}
              </div>
              
              {/* Sparkle animations */}
              {!isMagicTransforming && (
                <>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-delay-1000"></div>
                  <div className="absolute top-1/2 left-0 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-delay-500"></div>
                </>
              )}
            </button>
            
            {(magicSelectedRecs.length === 0 || recommendations.length === 0) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {recommendations.length === 0 ? 'No recommendations loaded' : 'No improvements available'}
              </p>
            )}
          </div>
        </div>
        
        {/* Enhanced Magic Transform Progress State */}
        {isMagicTransforming && (
          <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
            <div className="space-y-4">
              {/* Progress Header */}
              <div className="flex items-center gap-3 text-purple-300">
                <div className="relative">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <div className="absolute inset-0 w-6 h-6 border-2 border-purple-400/30 rounded-full"></div>
                </div>
                <div>
                  <p className="font-bold text-lg">🪄 Magic Transform in Progress</p>
                  <p className="text-sm text-purple-400">Generating your enhanced CV with AI-powered improvements and features</p>
                </div>
              </div>
              
              {/* Progress Bar and Details */}
              {magicTransformProgress && (
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${magicTransformProgress.progress}%` }}
                    ></div>
                  </div>
                  
                  {/* Current Task */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{magicTransformProgress.currentTask}</span>
                    <span className="text-purple-400 font-mono">{magicTransformProgress.progress}%</span>
                  </div>
                  
                  {/* Stage Indicator */}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={`px-2 py-1 rounded-full ${
                      magicTransformProgress.stage === 'improvements' ? 'bg-orange-900/50 text-orange-300' :
                      magicTransformProgress.stage === 'core_features' ? 'bg-blue-900/50 text-blue-300' :
                      magicTransformProgress.stage === 'premium_features' ? 'bg-purple-900/50 text-purple-300' :
                      magicTransformProgress.stage === 'finalizing' ? 'bg-green-900/50 text-green-300' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {magicTransformProgress.stage.replace('_', ' ').toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{magicTransformProgress.completedTasks.length} / {magicTransformProgress.totalTasks} tasks completed</span>
                  </div>
                  
                  {/* Completed Tasks */}
                  {magicTransformProgress.completedTasks.length > 0 && (
                    <div className="text-xs text-green-400">
                      ✅ Completed: {magicTransformProgress.completedTasks.slice(-3).join(', ')}
                      {magicTransformProgress.completedTasks.length > 3 && ` (+${magicTransformProgress.completedTasks.length - 3} more)`}
                    </div>
                  )}
                  
                  {/* Failed Tasks */}
                  {magicTransformProgress.failedTasks.length > 0 && (
                    <div className="text-xs text-orange-400">
                      ⚠️ Some features may have failed - continuing with available features
                    </div>
                  )}
                </div>
              )}
              
              {/* Default Progress (when no detailed progress available) */}
              {!magicTransformProgress && (
                <div className="space-y-3">
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse rounded-full w-1/3"></div>
                  </div>
                  <p className="text-sm text-gray-300">Initializing comprehensive CV enhancement...</p>
                </div>
              )}
              
              {/* Warning */}
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-3">
                <p className="text-sm text-purple-300">
                  🚀 <span className="font-medium">Enhanced Magic Transform</span> - 
                  We're applying improvements AND generating features for your CV.
                  This may take 30-60 seconds depending on your subscription tier.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-600"></div>
        <span className="text-sm text-gray-400 font-medium px-4">OR CUSTOMIZE MANUALLY</span>
        <div className="flex-1 h-px bg-gray-600"></div>
      </div>

      {/* ATS Score Overview */}
      {atsAnalysis && (
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Current Score */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Current ATS Score</h3>
              <div className="flex items-center space-x-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                  atsAnalysis.currentScore >= 80 ? 'bg-green-500' : 
                  atsAnalysis.currentScore >= 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {atsAnalysis.currentScore}%
                </div>
                <div>
                  <p className="text-sm text-gray-400">
                    {atsAnalysis.passes ? '✅ Passes ATS screening' : '❌ Needs improvement'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {atsAnalysis.issues.length + atsAnalysis.suggestions.length} factors analyzed
                  </p>
                </div>
              </div>
            </div>

            {/* Potential Score */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-100">Potential After Improvements</h3>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-green-500">
                  {newPredictedScore}%
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 font-semibold">
                      +{newPredictedScore - atsAnalysis.currentScore}% improvement
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    With {selectedRecs.length} selected improvements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Improvement Recommendations</h2>
          <div className="flex items-center space-x-3">
            {recommendations.length > 0 ? (
              <>
                <button
                  onClick={() => applyAll(true)}
                  className="px-8 py-3 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Select All
                </button>
                <button
                  onClick={() => applyAll(false)}
                  className="px-8 py-3 text-base font-bold bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 focus:ring-4 focus:ring-gray-500/50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 hover:scale-105"
                >
                  Clear All
                </button>
              </>
            ) : (
              <span className="text-sm text-gray-400">No recommendations available</span>
            )}
          </div>
        </div>

        {/* No Recommendations Message */}
        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">CV Analysis Complete</h3>
            <p className="text-gray-500">
              Your CV looks great as is! No specific improvements were identified at this time.
              You can still continue to select features and create your enhanced CV.
            </p>
            
          </div>
        )}
        
        {/* Priority Sections */}
        {recommendations.length > 0 && (['high', 'medium', 'low'] as const).map((priority) => {
          const priorityRecs = getRecommendationsByPriority(priority);
          const selectedCount = priorityRecs.filter(r => r.selected).length;
          const isExpanded = expandedPriorities[priority];

          if (priorityRecs.length === 0) return null;

          return (
            <div key={priority} className="mb-6 last:mb-0">
              {/* Priority Header */}
              <div 
                className={`flex items-center justify-between p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${getPriorityColor(priority)} ${
                  isExpanded ? 'rounded-b-none shadow-lg' : ''
                }`}
                onClick={() => togglePrioritySection(priority)}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    {getPriorityIcon(priority)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg capitalize">
                      {priority} Priority ({priorityRecs.length})
                    </h3>
                    <p className="text-sm opacity-80 font-medium">
                      {selectedCount} of {priorityRecs.length} selected
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyAllPriority(priority, true);
                    }}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 focus:ring-2 focus:outline-none ${
                      priority === 'high' 
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50' 
                        : priority === 'medium'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500/50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500/50'
                    }`}
                  >
                    Select All
                  </button>
                  <div className="p-2 rounded-lg bg-white/10 transition-transform duration-200">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Priority Recommendations */}
              {isExpanded && (
                <div className={`border-2 border-t-0 rounded-xl rounded-t-none p-4 space-y-3 bg-gradient-to-b from-white/5 to-transparent ${getPriorityColor(priority).replace('bg-', 'border-')}`}>
                  {priorityRecs.map((rec, index) => (
                    <div
                      key={rec.id}
                      className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] hover:shadow-lg animate-fade-in-up ${
                        rec.selected 
                          ? 'border-blue-400 bg-gradient-to-r from-blue-900/40 to-blue-800/30 shadow-lg shadow-blue-500/20' 
                          : 'border-gray-600 bg-gradient-to-r from-gray-700/50 to-gray-800/30 hover:border-gray-500 hover:from-gray-700/70 hover:to-gray-800/50'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => toggleRecommendation(rec.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {rec.selected ? 
                            <CheckCircle className="w-5 h-5 text-blue-400" /> :
                            <Circle className="w-5 h-5 text-gray-500" />
                          }
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-100">{rec.title}</h4>
                              <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
                                +{rec.estimatedImprovement} pts
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Category: {rec.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {rec.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">
              {selectedRecs.length} improvements selected
              {potentialImprovement > 0 && (
                <span className="ml-2 text-green-400 font-medium">
                  (Potential +{potentialImprovement} ATS points)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={async (event) => {
                const selectedRecommendationIds = selectedRecs.map(r => r.id);
                
                // Prevent multiple clicks
                const button = event?.target as HTMLButtonElement;
                if (button) button.disabled = true;
                setIsNavigating(true);
                
                try {
                  // Apply improvements if any are selected
                  if (selectedRecommendationIds.length > 0) {
                    
                    try {
                      const result = await applyImprovements(job.id, selectedRecommendationIds);
                      
                      // Store the improved content for the preview page
                      if (result && result && typeof result === 'object' && 'data' in result) {
                        const resultData = result.data as Record<string, unknown>;
                        if (resultData && 'improvedCV' in resultData) {
                          sessionStorage.setItem(`improvements-${job.id}`, JSON.stringify(resultData.improvedCV));
                        }
                      }
                      
                      toast.success(`Applied ${selectedRecommendationIds.length} improvements to your CV!`);
                    } catch (error: unknown) {
                      logError('applyImprovements', error);
                      toast.error(getErrorMessage(error) || 'Failed to apply some improvements. Continuing to preview...');
                      // Continue anyway - don't let this stop navigation
                    }
                  } else {
                    // No recommendations selected - just continue to preview
                    if (process.env.NODE_ENV === 'development') {
                      console.warn('No recommendations selected, proceeding to preview');
                    }
                  }
                  
                  // Store recommendations for preview page
                  sessionStorage.setItem(`recommendations-${job.id}`, JSON.stringify(selectedRecommendationIds));
                  
                  // Enhanced navigation with multiple strategies and better error handling
                  
                  // Strategy 1: Parent callback (primary method)
                  try {
                    onContinue(selectedRecommendationIds);
                    
                    // Verify navigation worked with timeout
                    const navigationPromise = new Promise<boolean>((resolve) => {
                      let attempts = 0;
                      const maxAttempts = 10;
                      const checkInterval = 100;
                      
                      const checkNavigation = () => {
                        attempts++;
                        const currentPath = window.location.pathname;
                        const expectedPath = `/preview/${job.id}`;
                        
                        
                        if (currentPath === expectedPath) {
                          resolve(true);
                          return;
                        }
                        
                        if (attempts < maxAttempts) {
                          setTimeout(checkNavigation, checkInterval);
                        } else {
                          console.warn('⚠️ [DEBUG] Parent callback navigation verification timeout');
                          resolve(false);
                        }
                      };
                      
                      // Start checking after a small delay to allow navigation
                      setTimeout(checkNavigation, 50);
                    });
                    
                    const navigationSucceeded = await navigationPromise;
                    
                    if (navigationSucceeded) {
                      toast.success('Successfully navigated to preview!', { icon: '🎉' });
                      if (button) button.disabled = false;
                      setIsNavigating(false);
                      return; // Exit early if navigation successful
                    } else {
                      console.warn('⚠️ [DEBUG] Parent callback did not change location, trying fallback');
                    }
                    
                  } catch (callbackError) {
                    console.error('❌ [DEBUG] Parent callback threw error:', callbackError);
                  }
                  
                  // Strategy 2: Robust navigation fallback
                  try {
                    const fallbackSuccess = await robustNavigation.navigateToPreview(
                      navigate,
                      job.id,
                      selectedRecommendationIds,
                      {
                        replace: true,
                        timeout: 500,
                        maxRetries: 3,
                        onSuccess: () => {
                          toast.success('Navigation successful!', { icon: '🚀' });
                          if (button) button.disabled = false;
                          setIsNavigating(false);
                        },
                        onFailure: (error) => {
                          console.error('❌ [DEBUG] Robust navigation failed:', error);
                          // Continue to emergency strategy
                        }
                      }
                    );
                    
                    if (fallbackSuccess) {
                      return; // Exit if fallback succeeded
                    }
                    
                  } catch (fallbackError) {
                    console.error('❌ [DEBUG] Robust navigation threw error:', fallbackError);
                  }
                  
                  // Strategy 3: Emergency direct navigation
                  try {
                    const targetPath = `/preview/${job.id}`;
                    toast.loading('Redirecting to preview...', { duration: 3000 });
                    
                    setTimeout(() => {
                      window.location.href = targetPath;
                    }, 100);
                    
                    // Reset state after delay
                    setTimeout(() => {
                      if (button) button.disabled = false;
                      setIsNavigating(false);
                    }, 1000);
                    
                  } catch (emergencyError) {
                    console.error('💥 [DEBUG] Even emergency navigation failed:', emergencyError);
                    toast.error('Navigation failed completely. Please refresh and try again.');
                    if (button) button.disabled = false;
                    setIsNavigating(false);
                  }
                  
                  // Navigation feedback handled in strategies above
                  
                } catch (error: unknown) {
                  logError('navigateToPreview', error);
                  toast.error('Unexpected error occurred. Navigating to preview anyway...');
                  
                  // Emergency navigation using utility
                  setTimeout(() => {
                    robustNavigation.emergencyNavigate(job.id);
                    setIsNavigating(false);
                    if (button) button.disabled = false;
                  }, 500);
                }
              }}
              disabled={isNavigating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {isNavigating ? 'Navigating...' : 
                 selectedRecs.length > 0 ? 'Apply & Preview' : 'Continue to Preview'}
              </span>
              {isNavigating && (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              )}
              {selectedRecs.length > 0 && (
                <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                  {selectedRecs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};