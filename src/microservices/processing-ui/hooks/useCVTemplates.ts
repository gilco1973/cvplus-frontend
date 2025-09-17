// CV templates hook for cv-processing-ui microservice
import { useState, useEffect } from 'react';
import { createLogger } from '@cvplus/logging';
import type {
  CVTemplate,
  TemplateState,
  TemplateFilters,
  TemplateCategory,
  ExperienceLevel
} from '../types/templates';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:templates');

const MOCK_TEMPLATES: CVTemplate[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, modern design perfect for corporate environments',
    category: 'professional',
    previewUrl: 'https://cvplus.com/templates/modern-professional/preview',
    thumbnailUrl: 'https://cvplus.com/templates/modern-professional/thumb.png',
    features: [
      { id: 'ats-optimized', name: 'ATS Optimized', description: 'Optimized for applicant tracking systems', icon: 'robot', available: true },
      { id: 'two-column', name: 'Two Column Layout', description: 'Efficient space utilization', icon: 'columns', available: true }
    ],
    atsOptimized: true,
    industryFocus: ['technology', 'finance', 'consulting'],
    experienceLevel: ['mid', 'senior', 'executive'],
    layout: {
      columns: 2,
      sections: [
        { id: 'personal-info', type: 'personal-info', position: 1, required: true, customizable: false },
        { id: 'summary', type: 'summary', position: 2, required: true, customizable: true },
        { id: 'experience', type: 'experience', position: 3, required: true, customizable: true },
        { id: 'education', type: 'education', position: 4, required: true, customizable: true },
        { id: 'skills', type: 'skills', position: 5, required: true, customizable: true }
      ],
      colorScheme: {
        name: 'Professional Blue',
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        text: '#1e293b',
        background: '#ffffff'
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        fontSize: {
          heading1: 24,
          heading2: 18,
          heading3: 16,
          body: 14,
          small: 12
        }
      },
      spacing: {
        section: 20,
        paragraph: 12,
        line: 1.5
      }
    },
    customization: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9',
        text: '#1e293b',
        background: '#ffffff',
        customizable: true
      },
      fonts: {
        heading: { family: 'Inter', size: 18, weight: 600, lineHeight: 1.3 },
        body: { family: 'Inter', size: 14, weight: 400, lineHeight: 1.5 },
        customizable: true
      },
      layout: {
        margins: 20,
        spacing: 16,
        lineSpacing: 1.5,
        customizable: true
      },
      sections: {
        order: ['personal-info', 'summary', 'experience', 'education', 'skills'],
        visibility: {
          'personal-info': true,
          'summary': true,
          'experience': true,
          'education': true,
          'skills': true
        },
        customizable: true
      }
    },
    premium: false,
    rating: 4.8,
    usageCount: 15420,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Vibrant design for creative professionals and portfolios',
    category: 'creative',
    previewUrl: 'https://cvplus.com/templates/creative-portfolio/preview',
    thumbnailUrl: 'https://cvplus.com/templates/creative-portfolio/thumb.png',
    features: [
      { id: 'portfolio-showcase', name: 'Portfolio Showcase', description: 'Dedicated section for creative work', icon: 'image', available: true },
      { id: 'color-themes', name: 'Multiple Color Themes', description: 'Choose from various color schemes', icon: 'palette', available: true }
    ],
    atsOptimized: false,
    industryFocus: ['design', 'marketing', 'media', 'arts'],
    experienceLevel: ['entry', 'mid', 'senior'],
    layout: {
      columns: 1,
      sections: [
        { id: 'personal-info', type: 'personal-info', position: 1, required: true, customizable: false },
        { id: 'summary', type: 'summary', position: 2, required: true, customizable: true },
        { id: 'projects', type: 'projects', position: 3, required: false, customizable: true, maxItems: 6 },
        { id: 'experience', type: 'experience', position: 4, required: true, customizable: true },
        { id: 'skills', type: 'skills', position: 5, required: true, customizable: true },
        { id: 'education', type: 'education', position: 6, required: true, customizable: true }
      ],
      colorScheme: {
        name: 'Creative Purple',
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#ec4899',
        text: '#374151',
        background: '#f9fafb'
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Open Sans',
        fontSize: {
          heading1: 28,
          heading2: 20,
          heading3: 16,
          body: 14,
          small: 12
        }
      },
      spacing: {
        section: 24,
        paragraph: 14,
        line: 1.6
      }
    },
    customization: {
      colors: {
        primary: '#7c3aed',
        secondary: '#a855f7',
        accent: '#ec4899',
        text: '#374151',
        background: '#f9fafb',
        customizable: true
      },
      fonts: {
        heading: { family: 'Poppins', size: 20, weight: 600, lineHeight: 1.3 },
        body: { family: 'Open Sans', size: 14, weight: 400, lineHeight: 1.6 },
        customizable: true
      },
      layout: {
        margins: 24,
        spacing: 18,
        lineSpacing: 1.6,
        customizable: true
      },
      sections: {
        order: ['personal-info', 'summary', 'projects', 'experience', 'skills', 'education'],
        visibility: {
          'personal-info': true,
          'summary': true,
          'projects': true,
          'experience': true,
          'skills': true,
          'education': true
        },
        customizable: true
      }
    },
    premium: true,
    rating: 4.6,
    usageCount: 8920,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15')
  }
];

export function useCVTemplates() {
  const [state, setState] = useState<TemplateState>({
    templates: [],
    selectedTemplate: null,
    categories: ['professional', 'creative', 'modern', 'classic', 'academic', 'technical', 'executive', 'entry-level'],
    isLoading: false,
    error: null,
    filters: {}
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      logger.info('Loading CV templates');

      // TODO: Replace with actual API call to @cvplus/processing backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

      setState(prev => ({
        ...prev,
        templates: MOCK_TEMPLATES,
        isLoading: false
      }));

      logger.info('CV templates loaded successfully', { count: MOCK_TEMPLATES.length });
    } catch (error) {
      logger.error('Failed to load CV templates', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load templates'
      }));
    }
  };

  const selectTemplate = (templateId: string): void => {
    const template = state.templates.find(t => t.id === templateId);
    if (template) {
      setState(prev => ({ ...prev, selectedTemplate: template }));
      logger.info('Template selected', { templateId, templateName: template.name });
    } else {
      logger.warn('Template not found', { templateId });
    }
  };

  const clearSelection = (): void => {
    setState(prev => ({ ...prev, selectedTemplate: null }));
    logger.info('Template selection cleared');
  };

  const updateFilters = (filters: Partial<TemplateFilters>): void => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
    logger.debug('Template filters updated', { filters });
  };

  const clearFilters = (): void => {
    setState(prev => ({ ...prev, filters: {} }));
    logger.debug('Template filters cleared');
  };

  // Filter templates based on current filters
  const filteredTemplates = state.templates.filter(template => {
    const { category, industry, experienceLevel, premium, atsOptimized, rating } = state.filters;

    if (category && template.category !== category) {
      return false;
    }

    if (industry && !template.industryFocus.includes(industry)) {
      return false;
    }

    if (experienceLevel && !template.experienceLevel.includes(experienceLevel)) {
      return false;
    }

    if (premium !== undefined && template.premium !== premium) {
      return false;
    }

    if (atsOptimized !== undefined && template.atsOptimized !== atsOptimized) {
      return false;
    }

    if (rating && template.rating < rating) {
      return false;
    }

    return true;
  });

  // Get templates by category
  const getTemplatesByCategory = (category: TemplateCategory): CVTemplate[] => {
    return state.templates.filter(template => template.category === category);
  };

  // Get popular templates
  const getPopularTemplates = (limit = 5): CVTemplate[] => {
    return [...state.templates]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  };

  // Get highest rated templates
  const getTopRatedTemplates = (limit = 5): CVTemplate[] => {
    return [...state.templates]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };

  // Get free templates
  const getFreeTemplates = (): CVTemplate[] => {
    return state.templates.filter(template => !template.premium);
  };

  // Get premium templates
  const getPremiumTemplates = (): CVTemplate[] => {
    return state.templates.filter(template => template.premium);
  };

  // Get ATS optimized templates
  const getATSOptimizedTemplates = (): CVTemplate[] => {
    return state.templates.filter(template => template.atsOptimized);
  };

  // Get templates for experience level
  const getTemplatesForExperience = (level: ExperienceLevel): CVTemplate[] => {
    return state.templates.filter(template => template.experienceLevel.includes(level));
  };

  // Search templates
  const searchTemplates = (query: string): CVTemplate[] => {
    const lowercaseQuery = query.toLowerCase();
    return state.templates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.industryFocus.some(industry => industry.toLowerCase().includes(lowercaseQuery))
    );
  };

  const clearError = (): void => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshTemplates = async (): Promise<void> => {
    logger.info('Refreshing templates');
    await loadTemplates();
  };

  return {
    // State
    templates: state.templates,
    filteredTemplates,
    selectedTemplate: state.selectedTemplate,
    categories: state.categories,
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,

    // Actions
    selectTemplate,
    clearSelection,
    updateFilters,
    clearFilters,
    clearError,
    refreshTemplates,

    // Getters
    getTemplatesByCategory,
    getPopularTemplates,
    getTopRatedTemplates,
    getFreeTemplates,
    getPremiumTemplates,
    getATSOptimizedTemplates,
    getTemplatesForExperience,
    searchTemplates
  };
}