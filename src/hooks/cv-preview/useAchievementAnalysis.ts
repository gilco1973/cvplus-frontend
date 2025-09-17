import { useState, useCallback, useEffect } from 'react';
import { analyzeAchievements } from '../../services/cvService';
import type { AchievementAnalysis } from '../../types/cv-preview';

export const useAchievementAnalysis = (
  jobId: string,
  achievementHighlightingEnabled: boolean
) => {
  const [achievementAnalysis, setAchievementAnalysis] = useState<AchievementAnalysis | null>(null);
  const [achievementLoading, setAchievementLoading] = useState(false);
  const [achievementError, setAchievementError] = useState<string | null>(null);

  const handleAchievementAnalysis = useCallback(async () => {
    setAchievementLoading(true);
    setAchievementError(null);
    
    try {
      const result = await analyzeAchievements(jobId);
      setAchievementAnalysis({
        keyAchievements: (result as unknown)?.keyAchievements || [],
        loading: false,
        error: null
      });
    } catch (error) {
      setAchievementError(error instanceof Error ? error.message : 'Analysis failed');
      setAchievementAnalysis({
        keyAchievements: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      });
    } finally {
      setAchievementLoading(false);
    }
  }, [jobId]);

  // Auto-trigger achievement analysis when achievement highlighting feature is selected
  useEffect(() => {
    if (achievementHighlightingEnabled && !achievementAnalysis) {
      handleAchievementAnalysis();
    }
  }, [achievementHighlightingEnabled, achievementAnalysis, handleAchievementAnalysis]);

  // Expose analysis function to window for inline HTML calls
  useEffect(() => {
    (window as unknown).handleAchievementAnalysis = handleAchievementAnalysis;
    
    return () => {
      delete (window as unknown).handleAchievementAnalysis;
    };
  }, [handleAchievementAnalysis]);

  return {
    achievementAnalysis: achievementAnalysis ? {
      ...achievementAnalysis,
      loading: achievementLoading,
      error: achievementError
    } : null,
    handleAchievementAnalysis,
    achievementLoading,
    achievementError
  };
};