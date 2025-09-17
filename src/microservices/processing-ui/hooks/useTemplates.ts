// @ts-ignore
/**
 * Templates Hook
 *
 * Custom hook for managing CV templates, filtering,
 * and template-related operations.
  */

import { useState, useCallback, useEffect } from 'react';
import type {
  TemplateState,
  TemplateFilters,
  CVTemplate,
  UseTemplatesReturn
} from '../components/generated-cv-display/types';

// Mock templates data - in real implementation, this would come from API
const mockTemplates: CVTemplate[] = [
  {
    id: 'modern-template-1',
    name: 'Modern Professional',
    description: 'Clean and contemporary design perfect for tech and creative roles',
    category: 'modern',
    previewUrl: '/templates/modern-1-preview.jpg',
    features: [
      { id: 'ats-optimized', name: 'ATS Optimized', description: 'Passes ATS systems easily', enabled: true },
      { id: 'interactive-timeline', name: 'Interactive Timeline', description: 'Clickable career timeline', enabled: true },
      { id: 'skill-bars', name: 'Skill Bars', description: 'Visual skill representations', enabled: true }
    ],
    styling: {
      primaryColor: '#0ea5e9',
      secondaryColor: '#64748b',
      accentColor: '#06b6d4',
      fontFamily: 'Inter',
      fontSize: 16,
      lineHeight: 1.6,
      spacing: 'normal',
      layout: 'single-column'
    },
    metadata: {
      author: 'CVPlus Design Team',
      version: '1.2.0',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-08-20'),
      downloads: 1250,
      rating: 4.8,
      tags: ['modern', 'tech', 'clean', 'ats-friendly']
    }
  },
  {
    id: 'classic-template-1',
    name: 'Classic Executive',
    description: 'Traditional format ideal for senior positions and conservative industries',
    category: 'classic',
    previewUrl: '/templates/classic-1-preview.jpg',
    features: [
      { id: 'ats-optimized', name: 'ATS Optimized', description: 'Passes ATS systems easily', enabled: true },
      { id: 'elegant-typography', name: 'Elegant Typography', description: 'Professional font choices', enabled: true },
      { id: 'formal-layout', name: 'Formal Layout', description: 'Conservative design structure', enabled: true }
    ],
    styling: {
      primaryColor: '#1e293b',
      secondaryColor: '#475569',
      accentColor: '#64748b',
      fontFamily: 'Georgia',
      fontSize: 14,
      lineHeight: 1.5,
      spacing: 'compact',
      layout: 'single-column'
    },
    metadata: {
      author: 'CVPlus Design Team',
      version: '1.0.0',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-07-15'),
      downloads: 890,
      rating: 4.6,
      tags: ['classic', 'executive', 'conservative', 'traditional']
    }
  },
  {
    id: 'creative-template-1',
    name: 'Creative Portfolio',
    description: 'Vibrant and artistic design for creative professionals and designers',
    category: 'creative',
    previewUrl: '/templates/creative-1-preview.jpg',
    features: [
      { id: 'portfolio-gallery', name: 'Portfolio Gallery', description: 'Showcase your work', enabled: true, premium: true },
      { id: 'color-customization', name: 'Color Customization', description: 'Personalize your colors', enabled: true },
      { id: 'creative-sections', name: 'Creative Sections', description: 'Unique content sections', enabled: true, premium: true }
    ],
    styling: {
      primaryColor: '#7c3aed',
      secondaryColor: '#a855f7',
      accentColor: '#c084fc',
      fontFamily: 'Poppins',
      fontSize: 15,
      lineHeight: 1.7,
      spacing: 'spacious',
      layout: 'two-column'
    },
    metadata: {
      author: 'Creative Studio',
      version: '2.1.0',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-09-01'),
      downloads: 650,
      rating: 4.9,
      tags: ['creative', 'artistic', 'portfolio', 'colorful']
    }
  },
  {
    id: 'ats-optimized-template-1',
    name: 'ATS Master',
    description: 'Specifically designed to pass through all ATS systems with 99% success rate',
    category: 'ats-optimized',
    previewUrl: '/templates/ats-1-preview.jpg',
    features: [
      { id: 'ats-optimized', name: 'ATS Optimized', description: '99% ATS pass rate', enabled: true },
      { id: 'keyword-optimization', name: 'Keyword Optimization', description: 'Smart keyword placement', enabled: true },
      { id: 'simple-formatting', name: 'Simple Formatting', description: 'Machine-readable format', enabled: true }
    ],
    styling: {
      primaryColor: '#059669',
      secondaryColor: '#047857',
      accentColor: '#10b981',
      fontFamily: 'Arial',
      fontSize: 11,
      lineHeight: 1.4,
      spacing: 'compact',
      layout: 'single-column'
    },
    metadata: {
      author: 'ATS Experts',
      version: '1.5.0',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-08-30'),
      downloads: 2100,
      rating: 4.7,
      tags: ['ats', 'optimized', 'simple', 'machine-readable']
    }
  },
  {
    id: 'academic-template-1',
    name: 'Academic Scholar',
    description: 'Comprehensive format for academic positions with publications and research focus',
    category: 'academic',
    previewUrl: '/templates/academic-1-preview.jpg',
    features: [
      { id: 'publications-section', name: 'Publications Section', description: 'Detailed publication listings', enabled: true },
      { id: 'research-highlights', name: 'Research Highlights', description: 'Showcase research work', enabled: true },
      { id: 'academic-formatting', name: 'Academic Formatting', description: 'Standard academic layout', enabled: true }
    ],
    styling: {
      primaryColor: '#dc2626',
      secondaryColor: '#b91c1c',
      accentColor: '#ef4444',
      fontFamily: 'Times New Roman',
      fontSize: 12,
      lineHeight: 1.5,
      spacing: 'normal',
      layout: 'single-column'
    },
    metadata: {
      author: 'Academic Committee',
      version: '1.3.0',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-08-10'),
      downloads: 420,
      rating: 4.5,
      tags: ['academic', 'research', 'publications', 'scholarly']
    }
  }
];

/**
 * Custom hook for template management
  */
export const useTemplates = (): UseTemplatesReturn => {
  const [state, setState] = useState<TemplateState>({
    templates: [],
    loading: false,
    error: undefined,
    filters: {
      category: undefined,
      features: [],
      premium: false,
      search: ''
    }
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Load templates
  const loadTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      console.log('[TEMPLATES] Loading templates...');

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setState(prev => ({
        ...prev,
        templates: mockTemplates,
        loading: false
      }));

    } catch (error) {
      console.error('[TEMPLATES] Failed to load templates:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load templates'
      }));
    }
  }, []);

  // Filter templates
  const filterTemplates = useCallback((filters: Partial<TemplateFilters>) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...filters
      }
    }));
  }, []);

  // Select template by ID
  const selectTemplate = useCallback((templateId: string): CVTemplate | undefined => {
    return state.templates.find(template => template.id === templateId);
  }, [state.templates]);

  // Get filtered templates
  const getFilteredTemplates = useCallback((): CVTemplate[] => {
    return state.templates.filter(template => {
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase();
        const matchesSearch =
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.metadata.tags.some(tag => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Category filter
      if (state.filters.category && state.filters.category !== 'all') {
        if (template.category !== state.filters.category) return false;
      }

      // Features filter
      if (state.filters.features.length > 0) {
        const hasRequiredFeatures = state.filters.features.every(requiredFeature =>
          template.features.some(feature =>
            feature.id === requiredFeature && feature.enabled
          )
        );
        if (!hasRequiredFeatures) return false;
      }

      // Premium filter
      if (state.filters.premium) {
        const hasPremiumFeatures = template.features.some(feature => feature.premium);
        if (!hasPremiumFeatures) return false;
      }

      return true;
    });
  }, [state.templates, state.filters]);

  // Get template categories
  const getCategories = useCallback((): string[] => {
    const categories = Array.from(new Set(state.templates.map(t => t.category)));
    return ['all', ...categories];
  }, [state.templates]);

  // Get all available features
  const getAvailableFeatures = useCallback((): string[] => {
    const features = new Set<string>();
    state.templates.forEach(template => {
      template.features.forEach(feature => {
        features.add(feature.id);
      });
    });
    return Array.from(features);
  }, [state.templates]);

  // Get template statistics
  const getTemplateStats = useCallback(() => {
    const stats = {
      total: state.templates.length,
      byCategory: {} as Record<string, number>,
      averageRating: 0,
      totalDownloads: 0,
      premiumCount: 0
    };

    state.templates.forEach(template => {
      // Category stats
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1;

      // Rating and downloads
      stats.averageRating += template.metadata.rating || 0;
      stats.totalDownloads += template.metadata.downloads || 0;

      // Premium count
      if (template.features.some(f => f.premium)) {
        stats.premiumCount++;
      }
    });

    stats.averageRating = stats.averageRating / state.templates.length;

    return stats;
  }, [state.templates]);

  return {
    state: {
      ...state,
      templates: getFilteredTemplates()
    },
    actions: {
      loadTemplates,
      filterTemplates,
      selectTemplate
    },
    utils: {
      getCategories,
      getAvailableFeatures,
      getTemplateStats
    }
  };
};