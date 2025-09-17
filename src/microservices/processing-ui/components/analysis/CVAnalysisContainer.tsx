/**
 * CV Analysis Container - Main orchestrator component
 * Replaces the 1,281-line CVAnalysisResults.tsx with compliant architecture
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { AnalysisHeader } from './AnalysisHeader';
import { ATSScoreCard } from './ATSScoreCard';
import { RecommendationsList } from './RecommendationsList';
import { MagicTransformCard } from './MagicTransformCard';
import { AnalysisActions } from './AnalysisActions';
import { LoadingState } from './LoadingState';

import type { Job } from '../../types/job';
import type { RecommendationItem, ATSAnalysis } from '../../types/analysis';

export interface CVAnalysisContainerProps {
  job: Job;
  onContinue: (selectedRecommendations: string[]) => void;
  onBack?: () => void;
  className?: string;
}

/**
 * Main analysis container - orchestrates child components
 * Compliant with <200 lines requirement
 */
export const CVAnalysisContainer: React.FC<CVAnalysisContainerProps> = ({
  job,
  onContinue,
  onBack,
  className = ''
}) => {
  const navigate = useNavigate();
  
  // Core state management
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [expandedPriorities, setExpandedPriorities] = useState({
    high: true,
    medium: true,
    low: false
  });

  // Magic transform state
  const [isMagicTransforming, setIsMagicTransforming] = useState(false);
  const [magicTransformProgress, setMagicTransformProgress] = useState<any>(null);

  /**
   * Load analysis data for the current job
   */
  const loadAnalysisData = useCallback(async () => {
    if (!job?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // This would be replaced with autonomous API service calls
      const analysisData = await loadJobAnalysis(job.id);
      const recommendationData = await loadJobRecommendations(job.id);

      setAtsAnalysis(analysisData.atsAnalysis);
      setRecommendations(recommendationData.recommendations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analysis';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [job?.id]);

  /**
   * Handle recommendation selection
   */
  const handleRecommendationToggle = useCallback((id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, selected: !rec.selected } : rec
      )
    );
  }, []);

  /**
   * Handle continue with selected recommendations
   */
  const handleContinue = useCallback(() => {
    const selectedIds = recommendations
      .filter(rec => rec.selected)
      .map(rec => rec.id);
    
    onContinue(selectedIds);
  }, [recommendations, onContinue]);

  /**
   * Handle magic transform
   */
  const handleMagicTransform = useCallback(async () => {
    try {
      setIsMagicTransforming(true);
      
      // This would use autonomous magic transform service
      await performMagicTransform(job.id, {
        onProgress: setMagicTransformProgress
      });
      
      toast.success('Magic transform completed!');
      await loadAnalysisData(); // Reload with new data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Magic transform failed';
      toast.error(errorMessage);
    } finally {
      setIsMagicTransforming(false);
      setMagicTransformProgress(null);
    }
  }, [job.id, loadAnalysisData]);

  // Load initial data
  useEffect(() => {
    loadAnalysisData();
  }, [loadAnalysisData]);

  // Show loading state
  if (isLoading) {
    return <LoadingState message="Loading CV analysis..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className={`cv-analysis-container ${className}`}>
        <div className="error-state p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadAnalysisData}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = recommendations.filter(r => r.selected).length;

  return (
    <div className={`cv-analysis-container ${className}`}>
      <AnalysisHeader 
        job={job}
        onBack={onBack}
      />

      <div className="analysis-content space-y-6">
        {atsAnalysis && (
          <ATSScoreCard 
            analysis={atsAnalysis}
            className="mb-6"
          />
        )}

        <MagicTransformCard
          onMagicTransform={handleMagicTransform}
          isTransforming={isMagicTransforming}
          progress={magicTransformProgress}
          className="mb-6"
        />

        <RecommendationsList
          recommendations={recommendations}
          expandedPriorities={expandedPriorities}
          onToggleExpanded={setExpandedPriorities}
          onToggleRecommendation={handleRecommendationToggle}
          className="mb-6"
        />

        <AnalysisActions
          selectedCount={selectedCount}
          totalCount={recommendations.length}
          onContinue={handleContinue}
          onBack={onBack}
          disabled={isLoading || isMagicTransforming}
        />
      </div>
    </div>
  );
};

// Temporary placeholders for autonomous services
// These will be replaced with actual autonomous service implementations
async function loadJobAnalysis(jobId: string) {
  // TODO: Replace with autonomous API service
  return { atsAnalysis: null };
}

async function loadJobRecommendations(jobId: string) {
  // TODO: Replace with autonomous API service  
  return { recommendations: [] };
}

async function performMagicTransform(jobId: string, options: any) {
  // TODO: Replace with autonomous magic transform service
  return Promise.resolve();
}