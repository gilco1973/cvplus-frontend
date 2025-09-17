/**
 * Enhanced Templates Hook
 * React hook for integrating the professional template system
 * Provides template selection, filtering, and analytics capabilities
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  CVTemplate,
  TemplateCategory,
  ExperienceLevel
} from '../types/cv-templates';
import {
  templateSelectionService,
  enhancedCVGenerationService,
  trackSelection,
  getTemplateCapabilities
} from '../services/template-integration';
import {
  getAllTemplates,
  getTemplatesByCategory,
  templateRegistry
} from '../services/template-registry';

// ============================================================================
// HOOK TYPES
// ============================================================================

interface TemplateHookOptions {
  userProfile?: {
    industry?: string;
    role?: string;
    experienceLevel?: ExperienceLevel;
    preferences?: string[];
  };
  autoSelectFirst?: boolean;
  enableAnalytics?: boolean;
}

interface TemplateDisplayData {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: TemplateCategory;
  isPremium: boolean;
  rating: number;
  features: string[];
  atsScore: number;
  estimatedTime: string;
  capabilities: {
    supportsCustomColors: boolean;
    supportsCustomFonts: boolean;
    supportsLayoutChanges: boolean;
    atsCompatible: boolean;
  };
}

interface UseEnhancedTemplatesReturn {
  // Template data
  templates: TemplateDisplayData[];
  filteredTemplates: TemplateDisplayData[];
  recommendedTemplates: TemplateDisplayData[];
  selectedTemplate: TemplateDisplayData | null;
  
  // Filter state
  activeCategory: TemplateCategory | 'all';
  searchQuery: string;
  
  // Actions
  selectTemplate: (templateId: string) => void;
  setCategory: (category: TemplateCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  trackTemplateUsage: (templateId: string, metadata?: Record<string, any>) => void;
  
  // Generation
  generateCV: (params: {
    templateId: string;
    cvData: any;
    jobId?: string;
    features?: string[];
    customization?: Record<string, any>;
  }) => Promise<{ success: boolean; error?: string; data?: any }>;
  
  // Analytics
  analytics: {
    totalTemplates: number;
    categoryCounts: Record<TemplateCategory, number>;
    averageRating: number;
    popularTemplates: TemplateDisplayData[];
  };
  
  // State
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useEnhancedTemplates(options: TemplateHookOptions = {}): UseEnhancedTemplatesReturn {
  const {
    userProfile,
    autoSelectFirst = true,
    enableAnalytics = true
  } = options;

  // State
  const [templates, setTemplates] = useState<TemplateDisplayData[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedTemplateIds, setRecommendedTemplateIds] = useState<string[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (userProfile) {
      loadRecommendations();
    }
  }, [userProfile]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const allTemplates = getAllTemplates();
      
      const templateDisplayData: TemplateDisplayData[] = allTemplates.map(template => {
        const capabilities = getTemplateCapabilities(template.id) || {
          supportsCustomColors: false,
          supportsCustomFonts: false,
          supportsLayoutChanges: false,
          atsCompatible: false,
          features: [],
          estimatedGenerationTime: '30 seconds'
        };

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          preview: template.preview.previewEmoji,
          category: template.category,
          isPremium: template.metadata.isPremium,
          rating: template.metadata.rating,
          features: capabilities.features,
          atsScore: template.ats.formats.ats.compatibility.score,
          estimatedTime: capabilities.estimatedGenerationTime,
          capabilities: {
            supportsCustomColors: capabilities.supportsCustomColors,
            supportsCustomFonts: capabilities.supportsCustomFonts,
            supportsLayoutChanges: capabilities.supportsLayoutChanges,
            atsCompatible: capabilities.atsCompatible
          }
        };
      });

      setTemplates(templateDisplayData);

      // Auto-select first template if enabled
      if (autoSelectFirst && templateDisplayData.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templateDisplayData[0].id);
      }

      console.warn('✅ Templates loaded successfully:', templateDisplayData.length);
    } catch (err) {
      console.error('❌ Failed to load templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendations = () => {
    try {
      if (userProfile) {
        templateSelectionService.setUserProfile(userProfile);
      }
      
      const recommended = templateSelectionService.getRecommendations(5);
      setRecommendedTemplateIds(recommended.map(t => t.id));
      
      console.warn('🎯 Template recommendations updated:', recommended.length);
    } catch (err) {
      console.warn('⚠️ Failed to load recommendations:', err);
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template => template.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.features.some(feature => feature.toLowerCase().includes(query)) ||
        template.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [templates, activeCategory, searchQuery]);

  const selectedTemplate = useMemo(() => {
    return templates.find(template => template.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  const recommendedTemplates = useMemo(() => {
    return templates.filter(template => recommendedTemplateIds.includes(template.id));
  }, [templates, recommendedTemplateIds]);

  const analytics = useMemo(() => {
    const categoryCounts = templates.reduce((counts, template) => {
      counts[template.category] = (counts[template.category] || 0) + 1;
      return counts;
    }, {} as Record<TemplateCategory, number>);

    const averageRating = templates.length > 0
      ? templates.reduce((sum, template) => sum + template.rating, 0) / templates.length
      : 0;

    const popularTemplates = templates
      .slice()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    return {
      totalTemplates: templates.length,
      categoryCounts,
      averageRating: Math.round(averageRating * 10) / 10,
      popularTemplates
    };
  }, [templates]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const selectTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      console.warn('🎨 Template selected:', template.name);
    } else {
      console.warn('⚠️ Template not found:', templateId);
    }
  }, [templates]);

  const setCategory = useCallback((category: TemplateCategory | 'all') => {
    setActiveCategory(category);
    console.warn('📂 Category changed:', category);
  }, []);

  const trackTemplateUsage = useCallback((templateId: string, metadata?: Record<string, any>) => {
    if (enableAnalytics) {
      trackSelection(templateId, metadata?.jobId);
      console.warn('📊 Template usage tracked:', templateId, metadata);
    }
  }, [enableAnalytics]);

  const generateCV = useCallback(async (params: {
    templateId: string;
    cvData: any;
    jobId?: string;
    features?: string[];
    customization?: Record<string, any>;
  }) => {
    try {
      console.warn('🚀 Starting enhanced CV generation:', params.templateId);
      
      // Track template usage
      if (enableAnalytics) {
        trackTemplateUsage(params.templateId, { jobId: params.jobId });
      }

      const result = await enhancedCVGenerationService.generateCV({
        templateId: params.templateId,
        cvData: params.cvData,
        jobId: params.jobId,
        features: params.features,
        customization: params.customization
      });

      if (result.success) {
        console.warn('✅ CV generation completed:', result.metadata);
        return {
          success: true,
          data: {
            templateName: result.metadata.templateName,
            generationTime: result.metadata.generationTime,
            atsScore: result.metadata.atsScore,
            outputs: result.outputs
          }
        };
      } else {
        console.error('❌ CV generation failed:', result.error);
        return {
          success: false,
          error: result.error || 'Generation failed'
        };
      }
    } catch (err) {
      console.error('❌ CV generation error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, [enableAnalytics, trackTemplateUsage]);

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Template data
    templates,
    filteredTemplates,
    recommendedTemplates,
    selectedTemplate,
    
    // Filter state
    activeCategory,
    searchQuery,
    
    // Actions
    selectTemplate,
    setCategory,
    setSearchQuery,
    trackTemplateUsage,
    
    // Generation
    generateCV,
    
    // Analytics
    analytics,
    
    // State
    isLoading,
    error
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for template analytics and insights
 */
export function useTemplateAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsage: 0,
    popularTemplates: [] as string[],
    categoryDistribution: {} as Record<TemplateCategory, number>,
    averageGenerationTime: 0,
    successRate: 0
  });

  useEffect(() => {
    const summary = templateRegistry.getAnalyticsSummary();
    
    setAnalytics({
      totalUsage: summary.totalUsage,
      popularTemplates: summary.topTemplates.map(t => t.id),
      categoryDistribution: {} as Record<TemplateCategory, number>, // Would be computed from registry
      averageGenerationTime: summary.performanceMetrics.averageGenerationTime,
      successRate: 1 - summary.performanceMetrics.errorRate
    });
  }, []);

  return analytics;
}

/**
 * Hook for template recommendations based on user context
 */
export function useTemplateRecommendations(userContext: {
  industry?: string;
  role?: string;
  experienceLevel?: ExperienceLevel;
  cvData?: any;
}) {
  const [recommendations, setRecommendations] = useState<TemplateDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Object.keys(userContext).length > 0) {
      loadRecommendations();
    }
  }, [userContext]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    
    try {
      templateSelectionService.setUserProfile({
        industry: userContext.industry,
        role: userContext.role,
        experienceLevel: userContext.experienceLevel
      });
      
      const recommended = templateSelectionService.getRecommendations(5);
      
      const recommendationData: TemplateDisplayData[] = recommended.map(template => {
        const capabilities = getTemplateCapabilities(template.id) || {
          supportsCustomColors: false,
          supportsCustomFonts: false,
          supportsLayoutChanges: false,
          atsCompatible: false,
          features: [],
          estimatedGenerationTime: '30 seconds'
        };

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          preview: template.preview.previewEmoji,
          category: template.category,
          isPremium: template.metadata.isPremium,
          rating: template.metadata.rating,
          features: capabilities.features,
          atsScore: template.ats.formats.ats.compatibility.score,
          estimatedTime: capabilities.estimatedGenerationTime,
          capabilities: {
            supportsCustomColors: capabilities.supportsCustomColors,
            supportsCustomFonts: capabilities.supportsCustomFonts,
            supportsLayoutChanges: capabilities.supportsLayoutChanges,
            atsCompatible: capabilities.atsCompatible
          }
        };
      });
      
      setRecommendations(recommendationData);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { recommendations, isLoading };
}

console.warn('🪝 Enhanced Templates Hooks initialized');
