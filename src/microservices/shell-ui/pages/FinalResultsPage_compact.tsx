import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Sparkles, Loader2, Zap } from 'lucide-react';
import { GeneratedCVDisplay } from '../components/GeneratedCVDisplay';
import { Header } from '../components/Header';
import { CVMetadata } from '../components/final-results/CVMetadata';
import { DownloadActions } from '../components/final-results/DownloadActions';
import { PodcastPlayer } from '../components/PodcastPlayer';
import { FeatureProgressCard } from '../components/final-results/FeatureProgressCard';
import { FinalResultsErrorBoundary } from '../components/error-boundaries/FinalResultsErrorBoundary';
import { AsyncGenerationErrorBoundary } from '../components/error-boundaries/AsyncGenerationErrorBoundary';
import { useAsyncMode } from '../hooks/useAsyncMode';
import { useProgressTracking } from '../hooks/useProgressTracking';
import { useCVGeneration } from '../hooks/useCVGeneration';
import { useFinalResultsPage } from '../hooks/useFinalResultsPage';
import '../styles/final-results-animations.css';

export const FinalResultsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { asyncMode, isAsyncInitialization } = useAsyncMode(jobId);
  const { 
    job, loading, error, generationConfig, baseHTML, enhancedHTML, 
    featureQueue, isProcessingFeatures 
  } = useFinalResultsPage(jobId!);
  const { progressState } = useProgressTracking(jobId!, featureQueue);
  const { isGenerating } = useCVGeneration(jobId!);

  // Loading state
  if (loading || isGenerating) {
    const message = loading ? 'Loading your CV...' : 
                   isAsyncInitialization ? 'Your CV is being generated in real-time...' : 
                   'Generating your enhanced CV...';
    
    return (
      <div className="min-h-screen bg-gray-900">
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
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header currentPage="results" jobId={jobId} title="Your Enhanced CV" variant="dark" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700 error-shake">
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

  if (!job) return null;

  return (
    <FinalResultsErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <Header 
          currentPage="results" 
          jobId={jobId} 
          title="Your Enhanced CV" 
          subtitle={isProcessingFeatures ? "Your CV is ready! We're adding enhanced features..." : "Download your professionally enhanced CV"}
          variant="dark" 
        />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <AsyncGenerationErrorBoundary>
            {/* Feature Progress Section */}
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
              <CVMetadata job={job} />
              <DownloadActions job={job} />
            </div>

            {/* Podcast Player */}
            {generationConfig?.features?.generatePodcast && (
              <div className="mb-8">
                <PodcastPlayer jobId={jobId!} />
              </div>
            )}

            {/* CV Display */}
            <div className="mb-8 cv-display-fade-in">
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
                  <div className="bg-white rounded-lg p-6 overflow-auto max-h-[600px]">
                    <div dangerouslySetInnerHTML={{ __html: enhancedHTML }} />
                  </div>
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
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Back to Feature Selection
            </button>
          </div>
        </div>
      </div>
    </FinalResultsErrorBoundary>
  );
};