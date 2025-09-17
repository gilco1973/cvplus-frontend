import { useState, useEffect, useMemo } from 'react';
import { compareCV, CVComparison, calculateImprovementStats } from '../../utils/cv-comparison/diffUtils';

export type ComparisonViewMode = 'single' | 'comparison';

export interface CVComparisonState {
  viewMode: ComparisonViewMode;
  comparison: CVComparison | null;
  isLoading: boolean;
  stats: ReturnType<typeof calculateImprovementStats> | null;
  selectedSection: string | null;
  showOnlyChanged: boolean;
}

export interface CVComparisonActions {
  setViewMode: (mode: ComparisonViewMode) => void;
  setSelectedSection: (section: string | null) => void;
  toggleShowOnlyChanged: () => void;
  refreshComparison: () => void;
}

/**
 * Hook for managing CV before/after comparison functionality
 */
export function useCVComparison(
  originalData: unknown,
  improvedData: unknown | null,
  comparisonReport?: {
    beforeAfter: Array<{
      section: string;
      before: string;
      after: string;
      improvement: string;
    }>;
  }
): {
  state: CVComparisonState;
  actions: CVComparisonActions;
} {
  const [viewMode, setViewMode] = useState<ComparisonViewMode>('single');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showOnlyChanged, setShowOnlyChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate comparison data - enhanced with comparisonReport if available
  const comparison = useMemo(() => {
    // If we have a comparisonReport, create an enhanced comparison object
    if (comparisonReport?.beforeAfter && comparisonReport.beforeAfter.length > 0) {
      const reportData = comparisonReport.beforeAfter;
      return {
        totalChanges: reportData.length,
        sections: reportData.map(item => ({
          sectionName: item.section,
          hasChanges: true,
          before: item.before,
          after: item.after,
          changes: [
            {
              type: 'modification' as const,
              before: item.before,
              after: item.after,
              description: item.improvement
            }
          ]
        })),
        improvementSummary: {
          enhancedContent: reportData.map(item => item.section),
          newSections: [],
          totalImprovements: reportData.length
        }
      };
    }
    
    // Fallback to computed comparison if no report available
    if (!originalData || !improvedData) return null;
    
    try {
      return compareCV(originalData, improvedData);
    } catch (error) {
      console.error('Error generating CV comparison:', error);
      return null;
    }
  }, [originalData, improvedData, comparisonReport]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!comparison) return null;
    return calculateImprovementStats(comparison);
  }, [comparison]);

  // Auto-switch to comparison mode when improvements are available
  useEffect(() => {
    if (comparison && comparison.totalChanges > 0 && viewMode === 'single') {
      // Don't auto-switch if user has explicitly chosen single view
      // This prevents jarring UI changes
    }
  }, [comparison, viewMode]);

  const actions: CVComparisonActions = {
    setViewMode: (mode: ComparisonViewMode) => {
      setViewMode(mode);
      // Clear selected section when switching modes
      setSelectedSection(null);
    },

    setSelectedSection: (section: string | null) => {
      setSelectedSection(section);
    },

    toggleShowOnlyChanged: () => {
      setShowOnlyChanged(prev => !prev);
    },

    refreshComparison: () => {
      setIsLoading(true);
      // Trigger re-computation by clearing and setting data
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  const state: CVComparisonState = {
    viewMode,
    comparison,
    isLoading,
    stats,
    selectedSection,
    showOnlyChanged
  };

  return { state, actions };
}

/**
 * Helper hook to check if comparison is available
 */
export function useHasComparison(originalData: unknown, improvedData: unknown): boolean {
  return useMemo(() => {
    return !!(originalData && improvedData && originalData !== improvedData);
  }, [originalData, improvedData]);
}

/**
 * Helper hook to get filtered sections based on user preferences
 */
export function useFilteredSections(comparison: CVComparison | null, showOnlyChanged: boolean) {
  return useMemo(() => {
    if (!comparison) return [];
    
    if (showOnlyChanged) {
      return comparison.sections.filter(section => section.hasChanges);
    }
    
    return comparison.sections;
  }, [comparison, showOnlyChanged]);
}