import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePremiumStatus } from './usePremiumStatus';
import { 
  validateFeatureSelection,
  filterAccessibleFeatures,
  isPremiumFeature,
  canAccessFeature,
  getPremiumTypeForFeature
} from '../config/premiumFeatures';

interface UseFeatureValidationProps {
  selectedFeatures: Record<string, boolean>;
  enforceRestrictions?: boolean;
  onFeatureRestricted?: (featureId: string, premiumType: string) => void;
}

interface FeatureValidationResult {
  isValid: boolean;
  restrictedFeatures: string[];
  warnings: string[];
  accessibleFeatures: Record<string, boolean>;
  canSelectFeature: (featureId: string) => boolean;
  getFeatureStatus: (featureId: string) => 'accessible' | 'restricted' | 'premium-required';
  validateAndFilter: () => Record<string, boolean>;
}

/**
 * Hook for validating feature selection against user's premium access
 * Provides comprehensive feature access validation and filtering
 */
export const useFeatureValidation = ({
  selectedFeatures,
  enforceRestrictions = true,
  onFeatureRestricted
}: UseFeatureValidationProps): FeatureValidationResult => {
  const { isPremium, features: userPremiumFeatures, isLoading } = usePremiumStatus();
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    restrictedFeatures: string[];
    warnings: string[];
  }>({
    isValid: true,
    restrictedFeatures: [],
    warnings: []
  });

  // Memoize feature keys to prevent unnecessary recalculations
  const selectedFeaturesKeys = useMemo(() => 
    Object.keys(selectedFeatures).sort(), 
    [selectedFeatures]
  );

  // Memoize selected features values to detect actual changes
  const selectedFeaturesValues = useMemo(() => 
    selectedFeaturesKeys.map(key => selectedFeatures[key]), 
    [selectedFeatures, selectedFeaturesKeys]
  );

  // Validate features whenever selection or premium status changes
  useEffect(() => {
    if (isLoading) return;

    const result = validateFeatureSelection(selectedFeatures, userPremiumFeatures);
    setValidationResult(result);

    // Notify about restricted features
    if (onFeatureRestricted && result.restrictedFeatures.length > 0) {
      result.restrictedFeatures.forEach(featureId => {
        const premiumType = getPremiumTypeForFeature(featureId);
        if (premiumType) {
          onFeatureRestricted(featureId, premiumType);
        }
      });
    }
  }, [selectedFeaturesValues, userPremiumFeatures, isLoading, onFeatureRestricted, selectedFeatures]);

  // Get accessible features (filtered version of selected features) - memoized
  const accessibleFeatures = useMemo(() => 
    filterAccessibleFeatures(selectedFeatures, userPremiumFeatures),
    [selectedFeatures, userPremiumFeatures]
  );

  // Check if a specific feature can be selected
  const canSelectFeature = useCallback((featureId: string): boolean => {
    return canAccessFeature(featureId, userPremiumFeatures);
  }, [userPremiumFeatures]);

  // Get feature access status
  const getFeatureStatus = useCallback((featureId: string): 'accessible' | 'restricted' | 'premium-required' => {
    if (!isPremiumFeature(featureId)) {
      return 'accessible';
    }

    if (canAccessFeature(featureId, userPremiumFeatures)) {
      return 'accessible';
    }

    return isPremium ? 'restricted' : 'premium-required';
  }, [userPremiumFeatures, isPremium]);

  // Validate and filter features, returning only accessible ones
  const validateAndFilter = useCallback((): Record<string, boolean> => {
    if (!enforceRestrictions) {
      return selectedFeatures;
    }

    return filterAccessibleFeatures(selectedFeatures, userPremiumFeatures);
  }, [selectedFeatures, userPremiumFeatures, enforceRestrictions]);

  return {
    isValid: validationResult.isValid,
    restrictedFeatures: validationResult.restrictedFeatures,
    warnings: validationResult.warnings,
    accessibleFeatures,
    canSelectFeature,
    getFeatureStatus,
    validateAndFilter
  };
};

/**
 * Hook for feature access checking (simpler version)
 */
export const useFeatureAccess = (featureId: string) => {
  const { features: userPremiumFeatures, isPremium, isLoading } = usePremiumStatus();
  
  const hasAccess = canAccessFeature(featureId, userPremiumFeatures);
  const isPremiumFeatureItem = isPremiumFeature(featureId);
  const premiumType = getPremiumTypeForFeature(featureId);
  const status = isPremiumFeatureItem ? 
    (hasAccess ? 'accessible' : 'premium-required') : 
    'accessible';

  return {
    hasAccess,
    isPremiumFeature: isPremiumFeatureItem,
    premiumType,
    status,
    isLoading,
    isPremium
  };
};

/**
 * Hook for bulk feature operations with premium validation
 */
export const useBulkFeatureOperations = () => {
  const { features: userPremiumFeatures, isPremium } = usePremiumStatus();

  const selectAllAccessible = useCallback((allFeatures: string[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    
    allFeatures.forEach(featureId => {
      result[featureId] = canAccessFeature(featureId, userPremiumFeatures);
    });

    return result;
  }, [userPremiumFeatures]);

  const selectOnlyFree = useCallback((allFeatures: string[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    
    allFeatures.forEach(featureId => {
      result[featureId] = !isPremiumFeature(featureId);
    });

    return result;
  }, []);

  const selectNone = useCallback((allFeatures: string[]): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    
    allFeatures.forEach(featureId => {
      result[featureId] = false;
    });

    return result;
  }, []);

  const getAccessibleCount = useCallback((allFeatures: string[]): number => {
    return allFeatures.filter(featureId => canAccessFeature(featureId, userPremiumFeatures)).length;
  }, [userPremiumFeatures]);

  const getPremiumCount = useCallback((allFeatures: string[]): number => {
    return allFeatures.filter(featureId => isPremiumFeature(featureId)).length;
  }, []);

  return {
    selectAllAccessible,
    selectOnlyFree,
    selectNone,
    getAccessibleCount,
    getPremiumCount,
    isPremium
  };
};