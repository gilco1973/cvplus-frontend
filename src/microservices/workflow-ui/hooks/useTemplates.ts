// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflictsimport { useState, useEffect, useCallback } from 'react';
import { CVTemplate, TemplateCategory } from '../../types/Template';

interface UseTemplatesResult {
  templates: CVTemplate[];
  categories: TemplateCategory[];
  featuredTemplates: CVTemplate[];
  isLoading: boolean;
  error: string | null;
  searchTemplates: (query: string) => Promise<CVTemplate[]>;
  getTemplate: (templateId: string) => Promise<CVTemplate | null>;
  getTemplatesByCategory: (category: TemplateCategory) => Promise<CVTemplate[]>;
}

/**
 * Hook for managing CV templates
 * 
 * Provides access to template data, searching, filtering,
 * and template-related operations within the workflow system.
  */
export const useTemplates = (): UseTemplatesResult => {
  const [templates, setTemplates] = useState<CVTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<CVTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // const response = await templateAPI.getTemplates();
      
      // Mock data for now
      const mockTemplates: CVTemplate[] = [
        {
          id: 'template-1',
          name: 'Modern Professional',
          description: 'Clean and professional template perfect for corporate roles',
          category: 'professional' as TemplateCategory,
          isPremium: false,
          isFeatured: true,
          thumbnailUrl: '/templates/modern-professional-thumb.jpg',
          previewUrl: '/templates/modern-professional-preview.jpg',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01')
        },
        {
          id: 'template-2',
          name: 'Creative Designer',
          description: 'Vibrant and creative template for design professionals',
          category: 'creative' as TemplateCategory,
          isPremium: true,
          isFeatured: true,
          thumbnailUrl: '/templates/creative-designer-thumb.jpg',
          previewUrl: '/templates/creative-designer-preview.jpg',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-01-15')
        },
        {
          id: 'template-3',
          name: 'Tech Innovator',
          description: 'Modern tech-focused template for developers and IT professionals',
          category: 'technical' as TemplateCategory,
          isPremium: false,
          isFeatured: false,
          thumbnailUrl: '/templates/tech-innovator-thumb.jpg',
          previewUrl: '/templates/tech-innovator-preview.jpg',
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2023-02-01')
        }
      ];

      const mockCategories: TemplateCategory[] = ['professional', 'creative', 'technical', 'academic', 'executive'];
      
      const mockFeatured = mockTemplates.filter(t => t.isFeatured);

      setTimeout(() => {
        setTemplates(mockTemplates);
        setCategories(mockCategories);
        setFeaturedTemplates(mockFeatured);
        setIsLoading(false);
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      setIsLoading(false);
    }
  }, []);

  const searchTemplates = useCallback(async (query: string): Promise<CVTemplate[]> => {
    try {
      // const response = await templateAPI.searchTemplates(query);
      
      // Mock search implementation
      const filtered = templates.filter(template =>
        template.name.toLowerCase().includes(query.toLowerCase()) ||
        template.description?.toLowerCase().includes(query.toLowerCase())
      );

      return filtered;

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to search templates');
    }
  }, [templates]);

  const getTemplate = useCallback(async (templateId: string): Promise<CVTemplate | null> => {
    try {
      // const response = await templateAPI.getTemplate(templateId);
      
      // Mock implementation
      const template = templates.find(t => t.id === templateId) || null;
      return template;

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch template');
    }
  }, [templates]);

  const getTemplatesByCategory = useCallback(async (category: TemplateCategory): Promise<CVTemplate[]> => {
    try {
      // const response = await templateAPI.getTemplatesByCategory(category);
      
      // Mock implementation
      const filtered = templates.filter(template => template.category === category);
      return filtered;

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch templates by category');
    }
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    categories,
    featuredTemplates,
    isLoading,
    error,
    searchTemplates,
    getTemplate,
    getTemplatesByCategory
  };
};