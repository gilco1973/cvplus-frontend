import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { subscribeToJob, processCV, type Job } from '../services/cvService';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { designSystem } from '../config/designSystem';

const PROCESSING_STEPS = [
  { id: 'upload', label: 'File Uploaded', status: 'pending' },
  { id: 'analyze', label: 'Analyzing Content', status: 'pending' },
  { id: 'enhance', label: 'Generating Enhanced CV', status: 'pending' },
  { id: 'features', label: 'Applying AI Features', status: 'pending' },
  { id: 'media', label: 'Creating Media Content', status: 'pending' }
];

export const ProcessingPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { } = useAuth(); // Auth context needed but user not used directly
  const [job, setJob] = useState<Job | null>(null);
  const [steps, setSteps] = useState(PROCESSING_STEPS);
  const [error, setError] = useState<string | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (!jobId) return;
    
    setIsManualRefreshing(true);
    try {
      console.log('🔄 Manual refresh triggered for job:', jobId);
      
      // Force a refresh by checking job status manually
      const jobDoc = await import('../services/cvService').then(service => service.getJob(jobId));
      console.log('📊 Current job status:', jobDoc?.status);
      console.log('📝 Job data summary:', {
        status: jobDoc?.status,
        hasImprovedCV: !!jobDoc?.improvedCV,
        hasParsedData: !!jobDoc?.parsedData,
        improvementsApplied: !!jobDoc?.improvementsApplied,
        updatedAt: jobDoc?.updatedAt
      });
      
      if (jobDoc) {
        setJob(jobDoc);
        
        // Enhanced navigation logic - if job has been processed, go to results
        const shouldNavigate = 
          jobDoc.status === 'completed' || 
          jobDoc.status === 'improved' || 
          jobDoc.status === 'analyzed' ||
          (jobDoc.parsedData && jobDoc.improvedCV) || // Has both parsed and improved data
          (jobDoc.parsedData && jobDoc.improvementsApplied); // Has improvements applied
          
        if (shouldNavigate) {
          console.log('✅ Job is complete, navigating to analysis page');
          navigate(`/analysis/${jobId}`);
        } else {
          console.log('⏳ Job still processing, status:', jobDoc.status);
          // If stuck for too long, show option to force navigation
          if (jobDoc.parsedData && !error) {
            setError('Processing seems delayed. Your CV data is ready - you can view preliminary results.');
          }
        }
      }
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setError('Unable to check job status. Please try refreshing the page.');
    } finally {
      setIsManualRefreshing(false);
    }
  };

  useEffect(() => {
    if (!jobId) return;


    // Subscribe to job updates
    const unsubscribe = subscribeToJob(jobId, async (updatedJob) => {
      if (!updatedJob) {
        setError('Job not found');
        return;
      }

      setJob(updatedJob);

      // Update steps based on job status
      const newSteps = [...PROCESSING_STEPS];
      
      if (updatedJob.status !== 'pending') {
        newSteps[0].status = 'completed';
      }
      
      if (['processing', 'analyzed', 'generating', 'completed', 'improved'].includes(updatedJob.status)) {
        newSteps[1].status = updatedJob.status === 'processing' ? 'active' : 'completed';
      }
      
      if (['generating', 'completed', 'improved'].includes(updatedJob.status)) {
        newSteps[2].status = updatedJob.status === 'generating' ? 'active' : 'completed';
      }
      
      if (updatedJob.status === 'completed' || updatedJob.status === 'improved') {
        newSteps[3].status = 'completed';
        newSteps[4].status = 'completed';
      }

      if (updatedJob.status === 'failed') {
        setError(updatedJob.error || 'Processing failed');
      }

      setSteps(newSteps);

      // Start processing if job is pending
      if (updatedJob.status === 'pending' && updatedJob.fileUrl) {
        try {
          await processCV(
            jobId,
            updatedJob.fileUrl,
            updatedJob.mimeType || '',
            updatedJob.isUrl || false
          );
        } catch (err) {
          console.error('Error starting processing:', err);
          setError('Failed to start processing');
        }
      }

      // Navigate to analysis results when analyzed, completed, or improved
      if (updatedJob.status === 'analyzed' || updatedJob.status === 'completed' || updatedJob.status === 'improved') {
        setTimeout(() => {
          navigate(`/analysis/${jobId}`);
        }, 1500);
      }
    });

    return () => unsubscribe();
  }, [jobId, navigate]);

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className={`w-6 h-6 text-${designSystem.colors.semantic.success[500]}`} />;
      case 'active':
        return <Loader2 className={`w-6 h-6 text-${designSystem.colors.primary[400]} animate-spin`} />;
      default:
        return <Circle className={`w-6 h-6 text-${designSystem.colors.neutral[600]}`} />;
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900">
      {/* Header */}
      <Header 
        currentPage="processing" 
        jobId={jobId}
        title="Processing CV"
        subtitle="Your CV is being analyzed and enhanced..."
        variant="dark"
      />

      {/* Processing Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className={`${designSystem.components.card.base} ${designSystem.components.card.variants.elevated} ${designSystem.components.card.padding.lg} animate-scale-in`}>
              <h2 className={`text-2xl font-bold text-center mb-8 ${designSystem.accessibility.contrast.text.primary} animate-fade-in-up`}>Processing Your CV</h2>

            {/* Progress Bar */}
            <div className="mb-8 animate-fade-in animation-delay-200">
              <div className="bg-neutral-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 ease-out animate-pulse-slow"
                  style={{ 
                    width: `${getProgressPercentage()}%`,
                    background: designSystem.colors.gradients.primary
                  }}
                />
              </div>
              <p className={`text-center text-sm ${designSystem.accessibility.contrast.text.secondary} mt-2`}>
                {Math.round(getProgressPercentage())}% Complete
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                    key={step.id}
                    className="flex items-center space-x-4 animate-fade-in-left"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div className={step.status === 'active' ? 'animate-pulse' : ''}>
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium transition-colors duration-300 ${
                        step.status === 'completed' ? designSystem.accessibility.contrast.text.primary : 
                        step.status === 'active' ? designSystem.accessibility.contrast.links.default : 
                        designSystem.accessibility.contrast.text.muted
                      }`}>
                        {step.label}
                      </p>
                    {step.status === 'active' && (
                      <p className={`text-sm ${designSystem.accessibility.contrast.text.secondary} animate-fade-in`}>
                        {step.id === 'analyze' && 'Extracting information with AI...'}
                        {step.id === 'enhance' && 'Applying professional templates...'}
                        {step.id === 'features' && 'Adding ATS optimization, personality insights...'}
                        {step.id === 'media' && 'Generating podcast and video content...'}
                      </p>
                    )}
                  </div>
                  </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mt-6 p-4 ${designSystem.components.status.error} rounded-lg animate-fade-in-up`}>
                <p className={`${designSystem.accessibility.contrast.text.primary} text-sm`}>{error}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => navigate('/')}
                    className={`${designSystem.accessibility.contrast.links.default} hover:${designSystem.accessibility.contrast.links.hover} text-sm font-medium transition-colors`}
                  >
                    Try again →
                  </button>
                  {/* Show force continue option if job has data */}
                  {job && (job.parsedData || job.improvedCV) && (
                    <button
                      onClick={() => navigate(`/analysis/${jobId}`)}
                      className={`text-${designSystem.colors.semantic.warning[400]} hover:text-${designSystem.colors.semantic.warning[300]} text-sm font-medium transition-colors`}
                    >
                      View results anyway →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Manual Refresh Button - Show if processing seems stuck */}
            {job && job.status === 'processing' && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleManualRefresh}
                  disabled={isManualRefreshing}
                  className={`${designSystem.components.button.base} ${designSystem.components.button.variants.primary.default} ${designSystem.components.button.sizes.md} ${isManualRefreshing ? designSystem.components.button.variants.primary.disabled : ''} flex items-center justify-center mx-auto`}
                >
                  {isManualRefreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Refresh Status'
                  )}
                </button>
                <p className={`${designSystem.accessibility.contrast.text.secondary} text-sm mt-2`}>
                  If processing seems stuck, click to check status
                </p>
              </div>
            )}

            {/* Status Message */}
            {(job?.status === 'completed' || job?.status === 'improved') && (
              <div className="mt-6 text-center animate-bounce-in">
                <p className={`text-${designSystem.colors.semantic.success[400]} font-medium`}>
                  {job?.status === 'improved' ? 'Improvements applied! Redirecting to results...' : 'All done! Redirecting to results...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};