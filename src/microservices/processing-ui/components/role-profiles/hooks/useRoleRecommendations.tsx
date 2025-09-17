import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { RoleProfile, DetectedRole, RoleBasedRecommendation } from '../../../types/role-profiles';
import { logError } from '../../../utils/errorHandling';
import { roleProfileService } from '../../../services/roleProfileService';

export interface RecommendationItem extends RoleBasedRecommendation {
  selected: boolean;
}

export interface UseRoleRecommendationsProps {
  jobId: string;
  roleProfile?: RoleProfile | null;
  detectedRole?: DetectedRole | null;
  onRecommendationsUpdate?: (recommendations: RoleBasedRecommendation[]) => void;
}

export const useRoleRecommendations = ({
  jobId,
  roleProfile,
  detectedRole,
  onRecommendationsUpdate
}: UseRoleRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number | null>(null);

  // Load role-based recommendations
  useEffect(() => {
    if (jobId && (roleProfile || detectedRole)) {
      loadRecommendations();
    }
  }, [jobId, roleProfile, detectedRole]);

  const loadRecommendations = useCallback(async (forceRegenerate = false) => {
    if (!jobId || isLoading) return;

    // Prevent too frequent requests (minimum 10 seconds between calls)
    const now = Date.now();
    if (lastLoadTime && (now - lastLoadTime) < 10000 && !forceRegenerate) {
      console.log('Skipping recommendation load - too frequent requests');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastLoadTime(now);

    try {
      console.log('[RoleBasedRecommendations] Loading recommendations for job:', jobId);
      console.log('[RoleBasedRecommendations] Role profile:', roleProfile?.roleName);
      console.log('[RoleBasedRecommendations] Detected role:', detectedRole?.roleName);

      const roleId = roleProfile?.roleId || detectedRole?.roleId;
      const roleName = roleProfile?.roleName || detectedRole?.roleName;

      if (!roleId && !roleName) {
        throw new Error('No role profile or detected role available for recommendations');
      }

      const loadedRecommendations = await roleProfileService.getRoleRecommendations(
        jobId,
        roleId,
        roleName,
        undefined, // industryKeywords
        forceRegenerate
      );

      console.log('[RoleBasedRecommendations] Loaded recommendations:', loadedRecommendations.length);

      // Convert to RecommendationItems with selection state
      const recommendationItems: RecommendationItem[] = loadedRecommendations.map(rec => ({
        ...rec,
        selected: rec.priority === 'high' // Auto-select high priority recommendations
      }));

      setRecommendations(recommendationItems);
      
      // Notify parent component
      if (onRecommendationsUpdate) {
        onRecommendationsUpdate(loadedRecommendations);
      }

      // Show success message for user-initiated loads
      if (forceRegenerate) {
        toast.success('Recommendations updated!');
      }

    } catch (error: any) {
      console.error('[RoleBasedRecommendations] Error loading recommendations:', error);
      logError('loadRoleRecommendations', error);
      
      const errorMessage = error?.message || 'Failed to load role recommendations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, roleProfile, detectedRole, isLoading, lastLoadTime, onRecommendationsUpdate]);

  // Toggle recommendation selection
  const toggleRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.map(rec => 
      rec.id === recommendationId 
        ? { ...rec, selected: !rec.selected }
        : rec
    ));
  }, []);

  // Select all recommendations of a priority
  const selectAllByPriority = useCallback((priority: 'high' | 'medium' | 'low') => {
    setRecommendations(prev => prev.map(rec => 
      rec.priority === priority 
        ? { ...rec, selected: true }
        : rec
    ));
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setRecommendations(prev => prev.map(rec => ({ ...rec, selected: false })));
  }, []);

  // Get selected recommendations
  const getSelectedRecommendations = useCallback(() => {
    return recommendations.filter(rec => rec.selected);
  }, [recommendations]);

  // Get selected recommendation IDs
  const getSelectedIds = useCallback(() => {
    return recommendations.filter(rec => rec.selected).map(rec => rec.id);
  }, [recommendations]);

  // Apply selected recommendations
  const applySelectedRecommendations = useCallback(async () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) {
      toast.error('Please select at least one recommendation');
      return false;
    }

    setIsApplying(true);
    try {
      console.log('[RoleBasedRecommendations] Applying recommendations:', selectedIds);
      
      // This would typically call an API to apply the recommendations
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Applied ${selectedIds.length} recommendations!`);
      return true;
    } catch (error: any) {
      console.error('[RoleBasedRecommendations] Error applying recommendations:', error);
      logError('applyRoleRecommendations', error);
      
      const errorMessage = error?.message || 'Failed to apply recommendations';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsApplying(false);
    }
  }, [getSelectedIds]);

  // Retry loading recommendations
  const retryLoad = useCallback(() => {
    setError(null);
    loadRecommendations(true);
  }, [loadRecommendations]);

  // Get statistics
  const getStatistics = useCallback(() => {
    const total = recommendations.length;
    const selected = recommendations.filter(rec => rec.selected).length;
    const byPriority = {
      high: recommendations.filter(rec => rec.priority === 'high').length,
      medium: recommendations.filter(rec => rec.priority === 'medium').length,
      low: recommendations.filter(rec => rec.priority === 'low').length
    };
    const selectedByPriority = {
      high: recommendations.filter(rec => rec.priority === 'high' && rec.selected).length,
      medium: recommendations.filter(rec => rec.priority === 'medium' && rec.selected).length,
      low: recommendations.filter(rec => rec.priority === 'low' && rec.selected).length
    };

    return {
      total,
      selected,
      byPriority,
      selectedByPriority,
      selectionPercentage: total > 0 ? Math.round((selected / total) * 100) : 0
    };
  }, [recommendations]);

  return {
    recommendations,
    isLoading,
    error,
    isApplying,
    // Actions
    loadRecommendations,
    toggleRecommendation,
    selectAllByPriority,
    clearAllSelections,
    applySelectedRecommendations,
    retryLoad,
    // Getters
    getSelectedRecommendations,
    getSelectedIds,
    getStatistics
  };
};