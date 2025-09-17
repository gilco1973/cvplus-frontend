import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from '../../../config/firebase-optimized';
import toast from 'react-hot-toast';
import type { RoleProfile, RoleProfileAnalysis, DetectedRole } from '../../../types/role-profiles';
import { logError } from '../../../utils/errorHandling';

export interface UseRoleProfileSelectorOptions {
  jobId: string;
  initialRole?: DetectedRole | null;
  onRoleSelected?: (roleProfile: RoleProfile | null, isDetected: boolean) => void;
  onAnalysisUpdate?: (analysis: RoleProfileAnalysis | null) => void;
}

export interface UseRoleProfileSelectorReturn {
  detectedRole: DetectedRole | null;
  analysis: RoleProfileAnalysis | null;
  availableRoles: RoleProfile[];
  selectedRoleProfile: RoleProfile | null;
  isDetecting: boolean;
  isApplying: boolean;
  error: string | null;
  showManualSelection: boolean;
  setShowManualSelection: (show: boolean) => void;
  detectRoleAutomatically: (forceRegenerate?: boolean) => Promise<void>;
  handleApplyDetectedRole: () => Promise<void>;
  handleManualRoleSelection: (roleProfile: RoleProfile) => void;
  handleRetryDetection: () => void;
  hasDetectedRole: boolean;
  isHighConfidence: boolean;
  shouldShowManualSelection: boolean;
  showError: boolean;
}

export const useRoleProfileSelector = ({
  jobId,
  initialRole,
  onRoleSelected,
  onAnalysisUpdate
}: UseRoleProfileSelectorOptions): UseRoleProfileSelectorReturn => {
  const [detectedRole, setDetectedRole] = useState<DetectedRole | null>(initialRole || null);
  const [analysis, setAnalysis] = useState<RoleProfileAnalysis | null>(null);
  const [availableRoles, setAvailableRoles] = useState<RoleProfile[]>([]);
  const [selectedRoleProfile, setSelectedRoleProfile] = useState<RoleProfile | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState<number | null>(null);

  const functions = getFunctionsInstance();
  const detectRoleProfile = httpsCallable(functions, 'detectRoleProfile');
  const getRoleProfiles = httpsCallable(functions, 'getRoleProfiles');
  const applyRoleProfile = httpsCallable(functions, 'applyRoleProfile');

  // Load available role profiles on component mount
  useEffect(() => {
    const loadRoleProfiles = async () => {
      try {
        console.log('[useRoleProfileSelector] Loading available role profiles');
        const result = await getRoleProfiles({});
        
        if (result.data?.success && result.data?.data?.profiles) {
          setAvailableRoles(result.data.data.profiles as RoleProfile[]);
          console.log(`[useRoleProfileSelector] Loaded ${result.data.data.profiles.length} role profiles`);
        } else {
          throw new Error('Failed to load role profiles');
        }
      } catch (err: any) {
        console.error('[useRoleProfileSelector] Error loading role profiles:', err);
        logError('loadRoleProfiles', err);
        setError('Failed to load available role profiles');
      }
    };

    loadRoleProfiles();
  }, []);

  // Detect role profile automatically on jobId change
  useEffect(() => {
    if (jobId && !initialRole && !detectedRole) {
      detectRoleAutomatically();
    }
  }, [jobId, initialRole]);

  const detectRoleAutomatically = useCallback(async (forceRegenerate = false) => {
    if (!jobId || isDetecting) return;

    // Prevent too frequent detections (minimum 30 seconds between calls)
    const now = Date.now();
    if (lastDetectionTime && (now - lastDetectionTime) < 30000 && !forceRegenerate) {
      console.log('[useRoleProfileSelector] Skipping detection - too frequent');
      return;
    }

    setIsDetecting(true);
    setError(null);
    setLastDetectionTime(now);

    try {
      console.log(`[useRoleProfileSelector] Detecting role profile for job ${jobId}`);
      
      const result = await detectRoleProfile({
        jobId,
        forceRegenerate
      });

      console.log('[useRoleProfileSelector] Detection result:', result.data);

      if (result.data?.success && result.data?.data) {
        const analysisData = result.data.data.analysis as RoleProfileAnalysis;
        const detectedRoleData = result.data.data.detectedRole as DetectedRole;

        setAnalysis(analysisData);
        setDetectedRole(detectedRoleData);

        // Notify parent components
        onAnalysisUpdate?.(analysisData);

        // Find the corresponding role profile
        const matchingProfile = availableRoles.find(profile => 
          profile.id === detectedRoleData?.roleId
        );
        
        if (matchingProfile) {
          setSelectedRoleProfile(matchingProfile);
          onRoleSelected?.(matchingProfile, true);
        }

        toast.success(
          `Detected: ${detectedRoleData?.roleName} (${Math.round((detectedRoleData?.confidence || 0) * 100)}% confidence)`,
          { icon: '🎯', duration: 4000 }
        );
        
      } else {
        throw new Error(result.data?.error || 'Role detection failed');
      }
    } catch (err: any) {
      console.error('[useRoleProfileSelector] Detection error:', err);
      logError('detectRole', err);
      setError(`Role detection is currently experiencing issues. You can manually select a role profile below.`);
      toast.error('Role detection unavailable - please select manually', { duration: 6000 });
      setShowManualSelection(true); // Always show manual selection when detection fails
    } finally {
      setIsDetecting(false);
    }
  }, [jobId, isDetecting, lastDetectionTime, availableRoles, onAnalysisUpdate, onRoleSelected]);

  const handleApplyDetectedRole = useCallback(async () => {
    if (!detectedRole || !selectedRoleProfile || isApplying) return;

    setIsApplying(true);
    setError(null);

    try {
      console.log(`[useRoleProfileSelector] Applying detected role ${detectedRole.roleName}`);
      
      const result = await applyRoleProfile({
        jobId,
        roleProfileId: detectedRole.roleId,
        customizationOptions: {
          useRecommendations: true,
          enhanceSummary: true,
          optimizeSkills: true
        }
      });

      if (result.data?.success) {
        toast.success(
          `✨ Successfully applied ${detectedRole.roleName} profile!`,
          { duration: 5000 }
        );
        
        // Notify parent that role was applied
        onRoleSelected?.(selectedRoleProfile, true);
      } else {
        throw new Error(result.data?.error || 'Failed to apply role profile');
      }
    } catch (err: any) {
      console.error('[useRoleProfileSelector] Apply error:', err);
      logError('applyRole', err);
      setError(`Failed to apply role: ${err.message}`);
      toast.error('Failed to apply role profile');
    } finally {
      setIsApplying(false);
    }
  }, [detectedRole, selectedRoleProfile, isApplying, jobId, onRoleSelected]);

  const handleManualRoleSelection = useCallback((roleProfile: RoleProfile) => {
    setSelectedRoleProfile(roleProfile);
    setShowManualSelection(false);
    onRoleSelected?.(roleProfile, false);
    
    // Create a detected role object for manual selection
    const manualDetectedRole: DetectedRole = {
      roleId: roleProfile.id,
      roleName: roleProfile.name,
      confidence: 0.8, // Manual selection gets high confidence
      matchingFactors: ['Manual Selection'],
      enhancementPotential: 70,
      recommendations: []
    };
    
    setDetectedRole(manualDetectedRole);
    toast.success(`Selected: ${roleProfile.name}`, { icon: '👤' });
  }, [onRoleSelected]);

  const handleRetryDetection = useCallback(() => {
    detectRoleAutomatically(true);
  }, [detectRoleAutomatically]);

  // Computed values
  const hasDetectedRole = detectedRole && detectedRole.confidence > 0.4; // Lower threshold to show more results
  const isHighConfidence = detectedRole && detectedRole.confidence > 0.7;
  const shouldShowManualSelection = !hasDetectedRole || !isHighConfidence;
  const showError = error && !isDetecting && !isApplying;

  return {
    detectedRole,
    analysis,
    availableRoles,
    selectedRoleProfile,
    isDetecting,
    isApplying,
    error,
    showManualSelection,
    setShowManualSelection,
    detectRoleAutomatically,
    handleApplyDetectedRole,
    handleManualRoleSelection,
    handleRetryDetection,
    hasDetectedRole,
    isHighConfidence,
    shouldShowManualSelection,
    showError
  };
};