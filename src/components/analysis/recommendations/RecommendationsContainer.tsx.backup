import React, { useEffect, useState } from 'react';
import { useUnifiedAnalysis } from '../context/UnifiedAnalysisContext';
import { CVServiceCore } from '../../../services/cv/CVServiceCore';
import type { Job } from '../../../services/cvService';
import { Loader2, CheckCircle, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { debugRecommendationsCall } from '../../../utils/api-debugging-suite';
import { logRecommendationError, monitorRecommendationResponse } from '../../../utils/recommendations-error-monitor';

interface RecommendationsContainerProps {
  jobData: Job;
  onContinue: (selectedRecommendations: string[]) => void;
  onBack: () => void;
  className?: string;
}

export const RecommendationsContainer: React.FC<RecommendationsContainerProps> = ({
  jobData,
  onContinue,
  onBack,
  className = ''
}) => {
  const { 
    state, 
    dispatch,
    hasSelectedRecommendations 
  } = useUnifiedAnalysis();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Load recommendations when component mounts
  useEffect(() => {
    const loadRecommendations = async () => {
      if (state.recommendationsLoaded && state.recommendations.length > 0) {
        // Already loaded
        setRecommendations(state.recommendations);
        return;
      }

      console.log('[RecommendationsContainer] Loading recommendations for job:', jobData.id);
      setIsLoading(true);
      setError(null);

      try {
        // Extract parameters for correct API signature
        const targetRole = state.selectedRole?.roleName;
        const industryKeywords = state.selectedRole?.matchingFactors || [];
        
        // Validate parameters
        if (!targetRole) {
          console.warn('[RecommendationsContainer] No target role selected, using generic recommendations');
        }
        
        if (industryKeywords.length === 0) {
          console.warn('[RecommendationsContainer] No industry keywords found, recommendations may be generic');
        }
        
        console.log('[RecommendationsContainer] API Parameters Validated:', {
          jobId: jobData.id,
          hasTargetRole: !!targetRole,
          industryKeywordsCount: industryKeywords.length,
          environment: process.env.NODE_ENV
        });
        
        // Add debugging before API call to diagnose failures
        console.log('[RecommendationsContainer] Running pre-flight diagnostics...');
        const debugResult = await debugRecommendationsCall(jobData.id);
        if (!debugResult.success) {
          console.error('[RecommendationsContainer] Pre-flight diagnostic failed:', debugResult);
          throw new Error(`API diagnostic failed: ${debugResult.error}`);
        }
        
        const response = await CVServiceCore.getRecommendations(
          jobData.id,
          targetRole,
          industryKeywords,
          false // forceRegenerate
        );

        console.log('[RecommendationsContainer] Recommendations loaded:', response);
        
        // Monitor the response structure for debugging
        monitorRecommendationResponse(response, jobData.id);
        
        // Handle the nested response structure from backend
        // Backend returns: { success: true, data: { recommendations: [...] } }
        const recommendations = response.success && response.data ? response.data.recommendations : response.recommendations;
        
        if (response.success && recommendations) {
          const formattedRecs = recommendations.map((rec: any) => ({
            ...rec,
            isSelected: false,
            category: rec.category || 'general'
          }));
          
          setRecommendations(formattedRecs);
          
          // Update context state
          dispatch({ type: 'SET_RECOMMENDATIONS', payload: formattedRecs });
          dispatch({ type: 'SET_RECOMMENDATIONS_LOADED', payload: true });
          
          toast.success('Recommendations loaded successfully!');
        } else {
          // Enhanced error handling with more specific error messages
          const errorMessage = response.error || response.data?.error || 'Failed to load recommendations';
          
          // Log the error with full context
          logRecommendationError(new Error(errorMessage), {
            jobId: jobData.id,
            step: 'response_validation',
            targetRole,
            industryKeywords,
            forceRegenerate: false,
            response
          });
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('[RecommendationsContainer] Error loading recommendations:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load recommendations';
        
        // Log the error with full context
        logRecommendationError(error, {
          jobId: jobData.id,
          step: 'api_call',
          targetRole: state.selectedRole?.roleName,
          industryKeywords: state.selectedRole?.matchingFactors || [],
          forceRegenerate: false
        });
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [jobData.id, state.selectedRole, state.recommendationsLoaded, state.recommendations, dispatch]);

  const toggleRecommendation = (id: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === id ? { ...rec, isSelected: !rec.isSelected } : rec
    ));
    
    // Update context state
    dispatch({ type: 'TOGGLE_RECOMMENDATION', payload: id });
  };

  const handleContinue = () => {
    const selectedIds = recommendations
      .filter(rec => rec.isSelected)
      .map(rec => rec.id);
    
    if (selectedIds.length === 0) {
      toast.error('Please select at least one recommendation to continue');
      return;
    }

    console.log('[RecommendationsContainer] Continuing with selected recommendations:', selectedIds);
    onContinue(selectedIds);
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-full border border-blue-500/30">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-blue-300 font-medium">Loading Recommendations...</span>
          </div>
          <div className="text-2xl font-bold text-gray-100">
            {state.selectedRole ? 
              `Analyzing ${state.selectedRole.roleName} Requirements` : 
              'Analyzing Your CV'
            }
          </div>
          <p className="text-gray-400">
            {state.selectedRole ? 
              'Generating role-specific recommendations tailored to your career goals' :
              'Creating personalized recommendations to enhance your CV'
            }
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-full border border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 font-medium">Error Loading Recommendations</span>
          </div>
          <div className="text-2xl font-bold text-gray-100">Something Went Wrong</div>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const selectedCount = recommendations.filter(rec => rec.isSelected).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300 font-medium">
            {state.selectedRole ? 'Role-Based Recommendations' : 'Personalized Recommendations'}
          </span>
        </div>
        <div className="text-2xl font-bold text-gray-100">
          {state.selectedRole ? 
            `Recommendations for ${state.selectedRole.roleName}` :
            'CV Improvement Recommendations'
          }
        </div>
        <p className="text-gray-400">
          {state.selectedRole ? 
            `Tailored suggestions to optimize your CV for ${state.selectedRole.roleName} positions` :
            'Select the improvements that best match your career goals'
          }
        </p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className={`p-6 rounded-lg border transition-all duration-200 cursor-pointer ${
              recommendation.isSelected
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            }`}
            onClick={() => toggleRecommendation(recommendation.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                recommendation.isSelected
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-600'
              }`}>
                {recommendation.isSelected && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-100">
                    {recommendation.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {recommendation.impact && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        recommendation.impact === 'high' 
                          ? 'bg-green-500/20 text-green-300'
                          : recommendation.impact === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {recommendation.impact} impact
                      </span>
                    )}
                    {recommendation.priority && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300">
                        Priority {recommendation.priority}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed">
                  {recommendation.description}
                </p>
                
                {recommendation.category && (
                  <div className="text-sm text-gray-400">
                    Category: {recommendation.category}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="text-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-purple-300">
            {selectedCount} recommendation{selectedCount !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Role Selection
        </button>
        
        <button
          onClick={handleContinue}
          disabled={selectedCount === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedCount > 0
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue to Features
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};