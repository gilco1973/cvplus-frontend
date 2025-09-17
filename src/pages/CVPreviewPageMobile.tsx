import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CVPreview } from '../components/CVPreview';
import { MobileFeatureSelection } from '../components/MobileFeatureSelection';
import { CVPreviewPageLayout } from '../components/MobilePageLayout';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToJob, applyImprovements, type Job } from '../services/cvService';
import { ArrowLeft, Loader2, CheckCircle, Eye, Settings, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CVPreviewPageMobile = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [activeTab, setActiveTab] = useState<'preview' | 'features'>('preview');
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({
    atsOptimized: true,
    keywordOptimization: true,
    achievementsShowcase: true,
    embedQRCode: true,
    languageProficiency: false,
    certificationBadges: false,
    socialMediaLinks: false,
    skillsVisualization: false,
    personalityInsights: false,
    careerTimeline: false,
    portfolioGallery: false
  });
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [appliedImprovements, setAppliedImprovements] = useState<any>(null);

  useEffect(() => {
    if (!jobId) {
      setError('Job ID is required');
      setIsLoading(false);
      return;
    }

    // Load selected recommendations from session storage
    const storedRecommendations = sessionStorage.getItem(`recommendations-${jobId}`);
    if (storedRecommendations) {
      try {
        setSelectedRecommendations(JSON.parse(storedRecommendations));
      } catch (e) {
        console.warn('Failed to parse stored recommendations');
      }
    }

    // Load applied improvements if they exist
    const storedImprovements = sessionStorage.getItem(`improvements-${jobId}`);
    if (storedImprovements) {
      try {
        setAppliedImprovements(JSON.parse(storedImprovements));
      } catch (e) {
        console.warn('Failed to parse stored improvements');
      }
    }

    // Subscribe to job updates
    const unsubscribe = subscribeToJob(jobId, (updatedJob) => {
      if (!updatedJob) {
        setError('Job not found');
        setIsLoading(false);
        return;
      }

      // Check if job belongs to current user
      if (user && updatedJob.userId !== user.uid) {
        setError('Unauthorized access');
        setIsLoading(false);
        return;
      }

      // Only show preview if CV has been analyzed
      if (updatedJob.status !== 'analyzed' && updatedJob.status !== 'completed') {
        // If job is still processing, redirect to processing page
        if (updatedJob.status === 'processing' || updatedJob.status === 'pending') {
          navigate(`/process/${jobId}`);
          return;
        }

        // If analysis not done, redirect to analysis page
        if (updatedJob.parsedData) {
          navigate(`/analysis/${jobId}`);
          return;
        }
        
        if (updatedJob.status === 'failed') {
          setError(updatedJob.error || 'CV processing failed');
          setIsLoading(false);
          return;
        }
      }

      setJob(updatedJob);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [jobId, user, navigate]);

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: enabled
    }));
  };

  const handleSelectAllFeatures = () => {
    const allEnabled = Object.keys(selectedFeatures).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedFeatures(allEnabled);
  };

  const handleClearAllFeatures = () => {
    const allDisabled = Object.keys(selectedFeatures).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedFeatures(allDisabled);
  };

  const handleSave = async () => {
    if (!job || !jobId) return;
    
    try {
      setIsSaving(true);
      
      // Apply improvements with selected features
      const recommendations = Object.entries(selectedRecommendations)
        .filter(([_, selected]) => selected)
        .map(([id]) => id);
      const result = await applyImprovements(jobId, recommendations);
      
      const improvedCV = (result as unknown)?.data?.improvedCV;
      if (improvedCV) {
        setAppliedImprovements(improvedCV);
        sessionStorage.setItem(`improvements-${jobId}`, JSON.stringify(improvedCV));
      }
      
      toast.success('CV saved successfully!');
    } catch (error: unknown) {
      console.error('Error saving CV:', error);
      toast.error('Failed to save CV');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    navigate(`/results/${jobId}`);
  };

  const handlePrevious = () => {
    navigate(`/analysis/${jobId}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Enhanced CV',
          text: 'Check out my AI-enhanced CV created with CVPlus',
          url: window.location.href
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRefresh = async () => {
    if (!jobId) return;
    
    // Reload job data
    setIsLoading(true);
    
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // The subscription will handle updating the job data
    setIsLoading(false);
    toast.success('CV refreshed!');
  };

  if (error) {
    return (
      <CVPreviewPageLayout
        jobId={jobId}
        isLoading={false}
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mobile-button-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>
      </CVPreviewPageLayout>
    );
  }

  if (isLoading || !job) {
    return (
      <CVPreviewPageLayout
        jobId={jobId}
        isLoading={true}
        variant="default"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading CV Preview</h2>
          <p className="text-gray-600 text-center">Please wait while we prepare your enhanced CV...</p>
        </div>
      </CVPreviewPageLayout>
    );
  }

  return (
    <CVPreviewPageLayout
      jobId={jobId}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSave={handleSave}
      isLoading={isSaving}
      variant="default"
    >
      {/* Mobile Tab Navigation */}
      <div className="md:hidden mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === 'features'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium">Features</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mobile Tabbed Content */}
        <div className="md:hidden">
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <CVPreview
                job={job}
                appliedImprovements={appliedImprovements}
                selectedFeatures={selectedFeatures}
                selectedTemplate={selectedTemplate}
              />
            </div>
          )}
          
          {activeTab === 'features' && (
            <MobileFeatureSelection
              selectedFeatures={selectedFeatures}
              onFeatureToggle={handleFeatureToggle}
              onSelectAll={handleSelectAllFeatures}
              onSelectNone={handleClearAllFeatures}
              variant="default"
            />
          )}
        </div>

        {/* Desktop Side-by-Side Layout */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          <div className="md:col-span-2">
            <CVPreview
              job={job}
              appliedImprovements={appliedImprovements}
              selectedFeatures={selectedFeatures}
              selectedTemplate={selectedTemplate}
            />
          </div>
          
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <MobileFeatureSelection
                selectedFeatures={selectedFeatures}
                onFeatureToggle={handleFeatureToggle}
                onSelectAll={handleSelectAllFeatures}
                onSelectNone={handleClearAllFeatures}
                variant="default"
              />
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">CV Status</h3>
          </div>
          <p className="text-blue-800 text-sm mt-1">
            Your CV has been analyzed and is ready for customization. 
            Select your preferred features and template, then proceed to download.
          </p>
        </div>
      </div>
    </CVPreviewPageLayout>
  );
};