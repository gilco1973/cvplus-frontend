/**
 * Final Results Page (Refactored for 200-line compliance)
 * Main orchestrator for CV generation results with enhanced progress tracking
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getJob } from '../services/cvService';
import { CVServiceCore } from '../services/cv/CVServiceCore';
import { ProgressEnhancer } from '../services/ProgressEnhancer';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/Header';
import { CVMetadata } from '../components/final-results/CVMetadata';
import { DownloadActions } from '../components/final-results/DownloadActions';
import { EnhancedFeatureProgressCard } from '../components/progress/EnhancedFeatureProgressCard';
import { ProgressStageIndicator } from '../components/progress/ProgressStageIndicator';
import { CVContentDisplay } from '../components/display/CVContentDisplay';
import { useEnhancedProgressTracking } from '../hooks/useEnhancedProgressTracking';
import { useRetryManager } from '../hooks/useRetryManager';
import type { Job } from '../types/cv';
import toast from 'react-hot-toast';

// Feature configuration interface
interface FeatureConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Feature configurations (core features only)
const CORE_FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  'skillsVisualization': { id: 'skills-visualization', name: 'Skills Visualization', icon: '📊', description: 'Interactive skill charts' },
  'generatePodcast': { id: 'generate-podcast', name: 'Career Podcast', icon: '🎙️', description: 'AI-generated career story' },
  'interactiveTimeline': { id: 'interactive-timeline', name: 'Interactive Timeline', icon: '⏰', description: 'Professional journey' },
  'portfolioGallery': { id: 'portfolio-gallery', name: 'Portfolio Gallery', icon: '🖼️', description: 'Project showcase' },
  'certificationBadges': { id: 'certification-badges', name: 'Certification Badges', icon: '🏆', description: 'Professional certifications' },
  'languageProficiency': { id: 'language-proficiency', name: 'Language Proficiency', icon: '🌍', description: 'Language skills' },
  'socialMediaLinks': { id: 'social-media-links', name: 'Social Media Links', icon: '🔗', description: 'Professional links' },
  'availabilityCalendar': { id: 'availability-calendar', name: 'Availability Calendar', icon: '📅', description: 'Scheduling integration' },
  'testimonialsCarousel': { id: 'testimonials-carousel', name: 'Testimonials', icon: '💬', description: 'Professional testimonials' },
  'embedQRCode': { id: 'embed-qr-code', name: 'QR Code', icon: '📱', description: 'Quick access code' }
};

export const FinalResultsPage: React.FC = () => {
  // Route and auth
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [jobData, setJobData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingFeatures, setTrackingFeatures] = useState<FeatureConfig[]>([]);

  // Async mode detection
  const asyncMode = ProgressEnhancer.isAsyncModeEnabled();

  // Enhanced progress tracking
  const {
    progressState,
    jobProgress,
    isProcessingFeatures,
    progressStats
  } = useEnhancedProgressTracking({
    jobId,
    trackingFeatures,
    autoRetryEnabled: true,
    onFeatureComplete: (featureId) => {
      console.log(`🎉 Feature completed: ${featureId}`);
    },
    onAllFeaturesComplete: () => {
      toast.success('🎉 All features completed successfully!');
    }
  });

  // Retry management
  const { retryFeature, getRetryStatus } = useRetryManager({
    jobId,
    onRetryStart: (featureId) => {
      toast.loading(`Retrying ${featureId}...`, { id: `retry-${featureId}` });
    },
    onRetrySuccess: (featureId) => {
      toast.success(`✅ ${featureId} retry successful!`, { id: `retry-${featureId}` });
    },
    onRetryFailure: (featureId, error) => {
      toast.error(`❌ ${featureId} retry failed: ${error}`, { id: `retry-${featureId}` });
    }
  });

  // Initialize job data and tracking
  useEffect(() => {
    const initializeJobData = async () => {
      if (!jobId || !user) return;

      try {
        setLoading(true);
        const job = await getJob(jobId);
        
        if (!job) {
          setError('Job not found');
          return;
        }

        if (job.userId !== user.uid) {
          setError('Unauthorized access');
          return;
        }

        setJobData(job);

        // Setup feature tracking based on selected features
        const selectedFeatures = job.selectedFeatures || [];
        const features = selectedFeatures.map(featureId => {
          const config = CORE_FEATURE_CONFIGS[featureId] || {
            id: featureId,
            name: featureId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            icon: '⚙️',
            description: 'Feature enhancement'
          };
          return config;
        });

        setTrackingFeatures(features);
        console.log('📊 Initialized tracking for features:', features.map(f => f.name));

      } catch (error) {
        console.error('❌ Error loading job:', error);
        setError('Failed to load job data');
      } finally {
        setLoading(false);
      }
    };

    initializeJobData();
  }, [jobId, user]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/templates');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your CV results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
            <p className="text-gray-400 mb-6">{error || 'Job data not found'}</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition-colors"
            >
              Return to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Templates
          </button>
          
          {asyncMode && (
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Fast Track Mode Active</span>
            </div>
          )}
        </div>

        {/* Progress Stage Indicator */}
        <ProgressStageIndicator
          currentProgress={jobProgress.currentProgress}
          currentStep={jobProgress.currentStep}
          currentStage={jobProgress.currentStage}
          estimatedTimeRemaining={ProgressEnhancer.calculateRemainingTime(
            trackingFeatures.map(f => f.id),
            progressState
          )}
          asyncMode={asyncMode}
        />

        {/* Progress Summary */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress Summary:</span>
            <div className="flex gap-4">
              <span className="text-green-400">{progressStats.completed} completed</span>
              <span className="text-blue-400">{progressStats.processing} processing</span>
              <span className="text-red-400">{progressStats.failed} failed</span>
              <span className="text-gray-400">{progressStats.total} total</span>
            </div>
          </div>
        </div>

        {/* Feature Progress Cards */}
        {trackingFeatures.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
              <span>Feature Progress</span>
              {asyncMode && <Sparkles className="w-4 h-4 text-purple-400" />}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trackingFeatures.map(feature => (
                <EnhancedFeatureProgressCard
                  key={feature.id}
                  feature={feature}
                  progress={progressState[feature.id] || { 
                    status: 'pending', 
                    progress: 0, 
                    htmlFragmentAvailable: false 
                  }}
                  onRetryFeature={retryFeature}
                  asyncMode={asyncMode}
                  showRetryButton={true}
                  animationEnabled={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* CV Content Display */}
        {jobData.generatedCV?.html && (
          <CVContentDisplay
            baseHTML={jobData.generatedCV.html}
            enhancedFeatures={progressState}
            jobId={jobId || ''}
            asyncMode={asyncMode}
            onFeatureAdded={(featureId) => {
              console.log(`🎨 Feature added to CV: ${featureId}`);
            }}
          />
        )}

        {/* Metadata and Downloads */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <CVMetadata job={jobData} />
          <DownloadActions job={jobData} />
        </div>
      </div>
    </div>
  );
};