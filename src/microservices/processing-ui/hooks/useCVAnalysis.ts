// CV analysis hook for cv-processing-ui microservice
import { useState, useCallback } from 'react';
import { useCVAnalysis as useCVAnalysisContext } from '../contexts/CVAnalysisContext';
import { createLogger } from '@cvplus/logging';
import type {
  AnalysisRequest,
  CVAnalysisResult,
  AnalysisType,
  RecommendationPriority
} from '../types/analysis';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:analysis-hook');

interface AnalysisFilters {
  types?: AnalysisType[];
  priority?: RecommendationPriority;
  category?: string;
  minScore?: number;
  maxScore?: number;
}

interface AnalysisStats {
  totalAnalyses: number;
  averageScore: number;
  highPriorityRecommendations: number;
  completedAnalyses: number;
  lastAnalysisDate: Date | null;
}

export function useCVAnalysis() {
  const context = useCVAnalysisContext();
  const [filters, setFilters] = useState<AnalysisFilters>({});

  // Filter results based on current filters
  const filteredResults = context.results.filter(result => {
    if (filters.types && !filters.types.includes(result.type)) {
      return false;
    }

    if (filters.minScore && result.score < filters.minScore) {
      return false;
    }

    if (filters.maxScore && result.score > filters.maxScore) {
      return false;
    }

    if (filters.priority) {
      const hasMatchingPriority = result.recommendations.some(
        rec => rec.priority === filters.priority
      );
      if (!hasMatchingPriority) {
        return false;
      }
    }

    if (filters.category) {
      const hasMatchingCategory = result.recommendations.some(
        rec => rec.category === filters.category
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    return true;
  });

  // Calculate analysis statistics
  const stats: AnalysisStats = {
    totalAnalyses: context.results.length,
    averageScore: context.results.length > 0
      ? context.results.reduce((sum, result) => sum + result.score, 0) / context.results.length
      : 0,
    highPriorityRecommendations: context.results.reduce(
      (count, result) => count + result.recommendations.filter(
        rec => rec.priority === 'high' || rec.priority === 'critical'
      ).length,
      0
    ),
    completedAnalyses: context.results.length,
    lastAnalysisDate: context.lastAnalyzed
  };

  // Quick analysis for specific types
  const runQuickAnalysis = useCallback(async (
    cvId: string,
    analysisTypes: AnalysisType[] = ['ats_optimization', 'content_quality']
  ): Promise<CVAnalysisResult[]> => {
    const request: AnalysisRequest = {
      cvId,
      analysisTypes,
      includeRecommendations: true,
      includeBenchmarking: false,
      priority: 'normal'
    };

    logger.info('Running quick analysis', { cvId, analysisTypes });
    return context.startAnalysis(request);
  }, [context]);

  // Comprehensive analysis with all available types
  const runComprehensiveAnalysis = useCallback(async (
    cvId: string,
    options: {
      targetRole?: string;
      targetIndustry?: string;
      includeBenchmarking?: boolean;
      priority?: 'low' | 'normal' | 'high';
    } = {}
  ): Promise<CVAnalysisResult[]> => {
    const allAnalysisTypes: AnalysisType[] = [
      'ats_optimization',
      'keyword_analysis',
      'structure_analysis',
      'content_quality',
      'formatting_check',
      'skills_assessment',
      'experience_validation',
      'industry_alignment',
      'role_matching'
    ];

    const request: AnalysisRequest = {
      cvId,
      analysisTypes: allAnalysisTypes,
      targetRole: options.targetRole,
      targetIndustry: options.targetIndustry,
      includeRecommendations: true,
      includeBenchmarking: options.includeBenchmarking ?? true,
      priority: options.priority ?? 'normal'
    };

    logger.info('Running comprehensive analysis', { cvId, options });
    return context.startAnalysis(request);
  }, [context]);

  // Role-specific analysis
  const runRoleAnalysis = useCallback(async (
    cvId: string,
    targetRole: string,
    targetIndustry?: string
  ): Promise<CVAnalysisResult[]> => {
    const roleSpecificTypes: AnalysisType[] = [
      'role_matching',
      'industry_alignment',
      'keyword_analysis',
      'skills_assessment',
      'ats_optimization'
    ];

    const request: AnalysisRequest = {
      cvId,
      analysisTypes: roleSpecificTypes,
      targetRole,
      targetIndustry,
      includeRecommendations: true,
      includeBenchmarking: true,
      priority: 'high'
    };

    logger.info('Running role-specific analysis', { cvId, targetRole, targetIndustry });
    return context.startAnalysis(request);
  }, [context]);

  // Get recommendations by priority
  const getRecommendationsByPriority = useCallback((priority: RecommendationPriority) => {
    return context.results.flatMap(result =>
      result.recommendations.filter(rec => rec.priority === priority)
    );
  }, [context.results]);

  // Get recommendations by category
  const getRecommendationsByCategory = useCallback((category: string) => {
    return context.results.flatMap(result =>
      result.recommendations.filter(rec => rec.category === category)
    );
  }, [context.results]);

  // Get actionable recommendations
  const getActionableRecommendations = useCallback(() => {
    return context.results.flatMap(result =>
      result.recommendations.filter(rec => rec.actionable)
    );
  }, [context.results]);

  // Get latest analysis result by type
  const getLatestAnalysisByType = useCallback((type: AnalysisType) => {
    return context.results
      .filter(result => result.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0] || null;
  }, [context.results]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalysisFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    logger.debug('Analysis filters updated', { filters: { ...filters, ...newFilters } });
  }, [filters]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    logger.debug('Analysis filters cleared');
  }, []);

  // Export analysis results
  const exportResults = useCallback((format: 'json' | 'csv' = 'json') => {
    const results = filteredResults.length > 0 ? filteredResults : context.results;

    if (format === 'json') {
      const dataStr = JSON.stringify(results, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `cv-analysis-results-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else {
      // TODO: Implement CSV export
      logger.warn('CSV export not yet implemented');
    }

    logger.info('Analysis results exported', { format, count: results.length });
  }, [filteredResults, context.results]);

  return {
    // Context state and actions
    ...context,

    // Filtered results
    filteredResults,

    // Statistics
    stats,

    // Quick analysis methods
    runQuickAnalysis,
    runComprehensiveAnalysis,
    runRoleAnalysis,

    // Recommendation helpers
    getRecommendationsByPriority,
    getRecommendationsByCategory,
    getActionableRecommendations,
    getLatestAnalysisByType,

    // Filter management
    filters,
    updateFilters,
    clearFilters,

    // Utilities
    exportResults
  };
}