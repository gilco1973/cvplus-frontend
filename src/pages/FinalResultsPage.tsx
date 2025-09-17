import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles, Loader2, Zap, CheckCircle, GitCompare, Eye, EyeOff } from 'lucide-react';
import { GeneratedCVDisplay } from '../components/GeneratedCVDisplay';
import { Header } from '../components/Header';
import { CVMetadata } from '../components/final-results/CVMetadata';
import { DownloadActions } from '../components/final-results/DownloadActions';
import { PodcastPlayer } from '../components/PodcastPlayer';
import { FeatureProgressCard } from '../components/final-results/FeatureProgressCard';
import { FinalResultsErrorBoundary } from '../components/error-boundaries/FinalResultsErrorBoundary';
import { AsyncGenerationErrorBoundary } from '../components/error-boundaries/AsyncGenerationErrorBoundary';
import { FirestoreErrorBoundary } from '../components/error-boundaries/FirestoreErrorBoundary';
import { ProgressiveEnhancementRenderer } from '../components/ProgressiveEnhancementRenderer';
import { CVComparisonView } from '../components/cv-comparison/CVComparisonView';
import { useAsyncMode } from '../hooks/useAsyncMode';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useCVGeneration } from '../hooks/useCVGeneration';
import { useFinalResultsPage } from '../hooks/useFinalResultsPage';
import { useProgressiveEnhancement } from '../hooks/useProgressiveEnhancement';
import { skipFeature } from '../services/cv/CVServiceCore';
import { designSystem } from '../config/designSystem';
import '../styles/final-results-animations.css';
import toast from 'react-hot-toast';
import { debugJobState, shouldDisplayCV } from '../utils/jobDebugger';

export const FinalResultsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [showComparison, setShowComparison] = useState(false);
  const { asyncMode, isAsyncInitialization } = useAsyncMode(jobId);
  const { 
    job, loading, error, generationConfig, baseHTML, enhancedHTML, 
    featureQueue, isProcessingFeatures 
  } = useFinalResultsPage(jobId!);
  const { progressState } = useProgressTracking(jobId!, featureQueue);
  const { isGenerating } = useCVGeneration(jobId!);
  
  // Progressive enhancement for real-time feature integration
  // Extract kebab-case feature IDs from the feature configs (they're already in kebab-case)
  const selectedFeatureIds = featureQueue.map(feature => feature.id);
  
  console.log('🔧 Progressive Enhancement Feature IDs (from configs):', selectedFeatureIds);
  
  const progressiveEnhancement = useProgressiveEnhancement({
    jobId: jobId!,
    selectedFeatures: selectedFeatureIds,
    autoStart: featureQueue.length > 0 && baseHTML !== '',
    retryAttempts: 3,
    retryDelay: 2000
  });

  // Calculate if we're still processing features by combining both backend and progressive enhancement status
  const isActuallyProcessingFeatures = React.useMemo(() => {
    // If there are no progressive enhancement features, we're not processing
    if (featureQueue.length === 0) {
      return false;
    }
    
    // If progressive enhancement is still processing, we're processing
    if (progressiveEnhancement.isProcessing) {
      return true;
    }
    
    // Check if all progressive enhancement features are complete
    const progressiveComplete = progressiveEnhancement.completedFeatures.length === progressiveEnhancement.features.length;
    
    console.log('🔍 [PROCESSING-CHECK]', {
      featureQueueLength: featureQueue.length,
      progressiveIsProcessing: progressiveEnhancement.isProcessing,
      progressiveCompleted: progressiveEnhancement.completedFeatures.length,
      progressiveTotal: progressiveEnhancement.features.length,
      progressiveComplete,
      isProcessingFeatures,
      finalResult: !progressiveComplete
    });
    
    return !progressiveComplete;
  }, [featureQueue.length, progressiveEnhancement.isProcessing, progressiveEnhancement.completedFeatures.length, progressiveEnhancement.features.length, isProcessingFeatures]);

  // Handle skip feature action
  const handleSkipFeature = async (featureId: string) => {
    try {
      console.log('🚫 Skipping feature:', featureId);
      toast.loading('Skipping feature...', { id: `skip-${featureId}` });
      
      await skipFeature(jobId!, featureId);
      
      toast.success('Feature skipped successfully', { id: `skip-${featureId}` });
    } catch (error: any) {
      console.error('Error skipping feature:', error);
      toast.error(error.message || 'Failed to skip feature', { id: `skip-${featureId}` });
    }
  };

  // Loading state - but only show loading if we're actually still generating
  const shouldShowLoading = (loading || isGenerating) && 
    (!job || (job.status === 'generating' || job.status === 'processing'));
  
  if (shouldShowLoading) {
    const message = loading ? 'Loading your CV...' : 
                   isAsyncInitialization ? 'Your CV is being generated in real-time...' : 
                   'Generating your enhanced CV...';
    
    return (
      <div className="min-h-screen bg-neutral-900">
        <Header currentPage="results" jobId={jobId} title="Your Enhanced CV" variant="dark" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto">
            {isAsyncInitialization ? (
              <div className="relative">
                <Zap className="w-12 h-12 text-cyan-400 mx-auto mb-4 lightning-effect" />
                <div className="fast-track-badge text-cyan-300 text-sm font-medium mb-2 p-2 rounded-lg">
                  Fast Track Mode Active
                </div>
              </div>
            ) : (
              <div className="enhanced-spinner h-12 w-12 mx-auto mb-4"></div>
            )}
            <p className="text-gray-300 text-lg mb-2">{message}</p>
            {isAsyncInitialization && (
              <p className="text-cyan-200/80 text-xs">Real-time CV generation in progress</p>
            )}
            {job && (
              <div className="mt-4 text-sm text-gray-400">
                <p>Job Status: {job.status}</p>
                {job.status === 'completed' && (
                  <p className="text-green-400">✅ Generation completed, loading CV...</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900">
        <Header currentPage="results" jobId={jobId} title="Your Enhanced CV" variant="dark" />
        <div className="max-w-none mx-auto px-6 py-8">
          <div className="bg-neutral-800 rounded-lg shadow-lg p-8 text-center border border-neutral-700 error-shake">
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
    console.log('🚫 [FINAL-RESULTS] No job data available');
    return null;
  }
  
  // Debug job state
  debugJobState(job, 'FINAL-RESULTS-RENDER');
  
  // Check if we should display the CV
  const canDisplayCV = shouldDisplayCV(job);

  return (
    <FirestoreErrorBoundary 
      identifier="FinalResultsPage"
      onError={(error, errorInfo) => {
        console.error('Firestore error in FinalResultsPage:', error, errorInfo);
        toast.error('Connection issue detected. Retrying automatically...');
      }}
    >
      <FinalResultsErrorBoundary>
        <div className="min-h-screen bg-neutral-900">
        <Header 
          currentPage="results" 
          jobId={jobId} 
          title="Your Enhanced CV" 
          subtitle={
            isActuallyProcessingFeatures 
              ? "Your CV is ready! We're adding interactive features..." 
              : featureQueue.length === 0 
                ? "Your enhanced CV is ready for download" 
                : "Download your professionally enhanced CV"
          }
          variant="dark" 
        />
        
        <div className="max-w-none mx-auto px-6 py-8">
          <AsyncGenerationErrorBoundary>
            {/* Backend-processed Features Section - Already Included */}
            {job && job.selectedFeatures && (() => {
              const backendProcessedFeatures = ['ats-optimization', 'keyword-enhancement', 'achievement-highlighting'];
              const includedBackendFeatures = job.selectedFeatures.filter(f => backendProcessedFeatures.includes(f));
              
              if (includedBackendFeatures.length > 0) {
                return (
                  <div className="mb-8">
                    <div className="bg-green-900/20 rounded-lg border border-green-700/50 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <h2 className="text-lg font-semibold text-green-100">
                          Core Features Already Applied
                        </h2>
                        <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-medium">
                          Included in CV
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {includedBackendFeatures.map(featureId => {
                          const featureNames = {
                            'ats-optimization': 'ATS Optimization',
                            'keyword-enhancement': 'Keyword Enhancement', 
                            'achievement-highlighting': 'Achievement Highlighting'
                          };
                          const featureIcons = {
                            'ats-optimization': '🎯',
                            'keyword-enhancement': '🔑',
                            'achievement-highlighting': '⭐'
                          };
                          return (
                            <div key={featureId} className="bg-green-800/20 rounded-lg p-4 border border-green-600/30">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">{featureIcons[featureId]}</span>
                                <div className="flex-1">
                                  <h3 className="font-medium text-green-100">{featureNames[featureId]}</h3>
                                  <p className="text-xs text-green-300">Processed during CV generation</p>
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-sm text-green-200/80 mt-3">
                        These features are already integrated into your CV content and don't require additional processing.
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Feature Progress Section - Only show if there are progressive enhancement features */}
            {featureQueue.length > 0 && (
              <div className="mb-8">
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-gray-100">
                      {isActuallyProcessingFeatures ? 'Adding Interactive Features' : 'Interactive Features Complete'}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featureQueue.map(feature => (
                      <FeatureProgressCard
                        key={feature.id}
                        feature={feature}
                        progress={progressState[feature.id] || { status: 'pending', progress: 0 }}
                        onSkip={() => handleSkipFeature(feature.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="mb-8">
              <CVMetadata job={job} />
              <DownloadActions job={job} />
            </div>


            {/* Podcast Player */}
            {generationConfig?.features?.generatePodcast && (
              <div className="mb-8">
                <PodcastPlayer jobId={jobId!} />
              </div>
            )}

            {/* CV Display with Comparison */}
            <div className="mb-8 cv-display-fade-in">
              {canDisplayCV ? (
                <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-100">Your Enhanced CV</h2>
                      {job.status === 'completed' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Ready
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Show comparison toggle if we have improvements */}
                      {job.improvementsApplied && job.comparisonReport && (
                        <button
                          onClick={() => setShowComparison(!showComparison)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors text-sm"
                        >
                          <GitCompare className="w-4 h-4" />
                          {showComparison ? 'Hide Comparison' : 'Show Before/After'}
                        </button>
                      )}
                      {isActuallyProcessingFeatures && (
                        <div className="flex items-center gap-2 text-sm text-cyan-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Adding enhancements... ({progressiveEnhancement.completedFeatures.length}/{progressiveEnhancement.features.length})
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Show comparison report if available and toggled */}
                  {showComparison && job.comparisonReport?.beforeAfter && (
                    <div className="mb-4 space-y-4">
                      <div className="bg-gray-900 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-cyan-400 mb-3">Improvements Applied</h3>
                        <div className="space-y-3">
                          {job.comparisonReport.beforeAfter.map((comparison, index) => (
                            <div key={index} className="border border-gray-700 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-gray-300 mb-2 uppercase">{comparison.section}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="bg-red-900/20 rounded p-2">
                                  <div className="text-xs text-red-400 mb-1 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3" />
                                    Before
                                  </div>
                                  <div className="text-xs text-gray-300 line-through opacity-75">
                                    {comparison.before}
                                  </div>
                                </div>
                                <div className="bg-green-900/20 rounded p-2">
                                  <div className="text-xs text-green-400 mb-1 flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    After
                                  </div>
                                  <div className="text-xs text-gray-100">
                                    {comparison.after}
                                  </div>
                                </div>
                              </div>
                              {comparison.improvement && (
                                <div className="mt-2 text-xs text-cyan-400 italic">
                                  ✨ {comparison.improvement}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Transformation Summary */}
                      {job.transformationSummary && (
                        <div className="bg-gray-900 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-cyan-400 mb-3">Transformation Summary</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">{job.transformationSummary.totalChanges || 0}</div>
                              <div className="text-xs text-gray-400">Total Changes</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-cyan-400">{job.transformationSummary.sectionsModified?.length || 0}</div>
                              <div className="text-xs text-gray-400">Sections Modified</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">{job.transformationSummary.keywordsAdded?.length || 0}</div>
                              <div className="text-xs text-gray-400">Keywords Added</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400">+{job.transformationSummary.estimatedScoreIncrease || 0}%</div>
                              <div className="text-xs text-gray-400">Score Increase</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-6 overflow-auto max-h-[80vh]">
                    {/* Use CVComparisonView if we have both original and improved data */}
                    {job.parsedData && job.improvedCV && !showComparison ? (
                      <CVComparisonView
                        originalData={job.parsedData}
                        improvedData={job.improvedCV}
                        comparisonReport={job.comparisonReport}
                      >
                        <ProgressiveEnhancementRenderer
                          htmlContent={progressiveEnhancement.currentHtml || enhancedHTML || baseHTML || job.generatedCV?.html || '<p>CV content loading...</p>'}
                          jobId={jobId}
                        />
                      </CVComparisonView>
                    ) : (
                      <ProgressiveEnhancementRenderer
                        htmlContent={progressiveEnhancement.currentHtml || enhancedHTML || baseHTML || job.generatedCV?.html || '<p>CV content loading...</p>'}
                        jobId={jobId}
                      />
                    )}
                  </div>
                  
                  {/* Show completed features summary */}
                  {featureQueue.length > 0 && (
                    <div className="mt-4 p-3 bg-neutral-700/50 rounded-lg">
                      <h4 className="text-sm font-medium text-neutral-200 mb-2">Applied Enhancements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {featureQueue.map(feature => {
                          const progress = progressState[feature.id];
                          const isCompleted = progress?.status === 'completed';
                          return (
                            <div 
                              key={feature.id}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                isCompleted 
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-gray-600/50 text-gray-400'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <span className="w-3 h-3 rounded-full border border-current" />
                              )}
                              {feature.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <GeneratedCVDisplay job={job} className="rounded-lg shadow-lg overflow-hidden" />
              )}
            </div>
          </AsyncGenerationErrorBoundary>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Another CV
            </button>
            <button
              onClick={() => navigate(`/results/${jobId}`)}
              className="bg-neutral-700 hover:bg-gray-600 text-neutral-200 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back to Feature Selection
            </button>
          </div>
        </div>
      </div>
    </FinalResultsErrorBoundary>
    </FirestoreErrorBoundary>
  );
};