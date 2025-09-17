// CV Template UI Service - Template service for cv-processing-ui microservice
import { EventBus } from '@/core-ui/services/EventBus';
import { NotificationService } from '@/core-ui/services/NotificationService';
import { createLogger } from '@cvplus/logging';
import type {
  CVTemplate,
  TemplateFilters,
  TemplateCategory,
  TemplatePreview,
  TemplateCustomization
} from '../types/templates';

// Initialize logger for cv-processing-ui microservice
const logger = createLogger('cv-processing-ui:template-service');

class CVTemplateUIService {
  private baseUrl: string;
  private templateCache: Map<string, CVTemplate> = new Map();
  private previewCache: Map<string, TemplatePreview> = new Map();

  constructor() {
    // TODO: Get from environment or configuration
    this.baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:3001';
  }

  async getTemplates(filters?: TemplateFilters): Promise<CVTemplate[]> {
    try {
      logger.info('Fetching CV templates', { filters });

      // TODO: Replace with actual API call to @cvplus/processing backend
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock templates data
      const allTemplates = this.getMockTemplates();

      // Apply filters
      let filteredTemplates = allTemplates;

      if (filters) {
        filteredTemplates = this.applyFilters(allTemplates, filters);
      }

      // Cache templates
      filteredTemplates.forEach(template => {
        this.templateCache.set(template.id, template);
      });

      logger.info('Templates fetched successfully', {
        total: allTemplates.length,
        filtered: filteredTemplates.length
      });

      return filteredTemplates;
    } catch (error) {
      logger.error('Failed to fetch templates', error);
      NotificationService.error('Failed to load templates', { microservice: 'processing-ui' });
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<CVTemplate> {
    try {
      // Check cache first
      if (this.templateCache.has(templateId)) {
        return this.templateCache.get(templateId)!;
      }

      logger.info('Fetching template', { templateId });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const template = this.getMockTemplateById(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Cache template
      this.templateCache.set(templateId, template);

      logger.info('Template fetched successfully', { templateId });
      return template;
    } catch (error) {
      logger.error('Failed to fetch template', error);
      throw error;
    }
  }

  async getTemplatePreview(
    templateId: string,
    sampleData?: any
  ): Promise<TemplatePreview> {
    try {
      const cacheKey = `${templateId}_${sampleData ? 'sample' : 'default'}`;

      // Check cache first
      if (this.previewCache.has(cacheKey)) {
        return this.previewCache.get(cacheKey)!;
      }

      logger.info('Generating template preview', { templateId, hasSampleData: !!sampleData });

      // TODO: Replace with actual API call to @cvplus/processing backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      const preview: TemplatePreview = {
        templateId,
        html: this.generatePreviewHTML(templateId, sampleData),
        previewUrl: `https://cvplus.com/templates/${templateId}/preview`,
        thumbnailUrl: `https://cvplus.com/templates/${templateId}/thumb.png`,
        sampleData: sampleData || this.getDefaultSampleData()
      };

      // Cache preview
      this.previewCache.set(cacheKey, preview);

      logger.info('Template preview generated', { templateId });
      return preview;
    } catch (error) {
      logger.error('Failed to generate template preview', error);
      throw error;
    }
  }

  async getTemplatesByCategory(category: TemplateCategory): Promise<CVTemplate[]> {
    try {
      logger.info('Fetching templates by category', { category });

      const allTemplates = await this.getTemplates();
      const categoryTemplates = allTemplates.filter(template => template.category === category);

      logger.info('Category templates fetched', { category, count: categoryTemplates.length });
      return categoryTemplates;
    } catch (error) {
      logger.error('Failed to fetch templates by category', error);
      throw error;
    }
  }

  async getPopularTemplates(limit = 10): Promise<CVTemplate[]> {
    try {
      logger.info('Fetching popular templates', { limit });

      const allTemplates = await this.getTemplates();
      const popularTemplates = allTemplates
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);

      logger.info('Popular templates fetched', { count: popularTemplates.length });
      return popularTemplates;
    } catch (error) {
      logger.error('Failed to fetch popular templates', error);
      throw error;
    }
  }

  async getFeaturedTemplates(): Promise<CVTemplate[]> {
    try {
      logger.info('Fetching featured templates');

      const allTemplates = await this.getTemplates();
      const featuredTemplates = allTemplates
        .filter(template => template.rating >= 4.5)
        .sort((a, b) => b.rating - a.rating);

      logger.info('Featured templates fetched', { count: featuredTemplates.length });
      return featuredTemplates;
    } catch (error) {
      logger.error('Failed to fetch featured templates', error);
      throw error;
    }
  }

  async searchTemplates(query: string): Promise<CVTemplate[]> {
    try {
      logger.info('Searching templates', { query });

      const allTemplates = await this.getTemplates();
      const queryLower = query.toLowerCase();

      const searchResults = allTemplates.filter(template =>
        template.name.toLowerCase().includes(queryLower) ||
        template.description.toLowerCase().includes(queryLower) ||
        template.industryFocus.some(industry =>
          industry.toLowerCase().includes(queryLower)
        ) ||
        template.category.toLowerCase().includes(queryLower)
      );

      logger.info('Template search completed', { query, results: searchResults.length });
      return searchResults;
    } catch (error) {
      logger.error('Template search failed', error);
      throw error;
    }
  }

  async customizeTemplate(
    templateId: string,
    customizations: Partial<TemplateCustomization>
  ): Promise<TemplatePreview> {
    try {
      logger.info('Customizing template', { templateId, customizations: Object.keys(customizations) });

      // TODO: Replace with actual API call to @cvplus/processing backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      const customizedPreview: TemplatePreview = {
        templateId,
        html: this.generateCustomizedHTML(templateId, customizations),
        previewUrl: `https://cvplus.com/templates/${templateId}/custom_preview_${Date.now()}`,
        thumbnailUrl: `https://cvplus.com/templates/${templateId}/custom_thumb_${Date.now()}.png`,
        sampleData: this.getDefaultSampleData()
      };

      // Emit customization event
      EventBus.emit({
        type: 'template-customized',
        source: 'processing-ui',
        target: 'all',
        payload: { templateId, customizations, preview: customizedPreview }
      });

      logger.info('Template customized successfully', { templateId });
      return customizedPreview;
    } catch (error) {
      logger.error('Template customization failed', error);
      throw error;
    }
  }

  async cloneTemplate(templateId: string, newName: string): Promise<CVTemplate> {
    try {
      logger.info('Cloning template', { templateId, newName });

      const originalTemplate = await this.getTemplate(templateId);

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const clonedTemplate: CVTemplate = {
        ...originalTemplate,
        id: `${templateId}_clone_${Date.now()}`,
        name: newName,
        usageCount: 0,
        premium: true, // Cloned templates are premium
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info('Template cloned successfully', {
        originalId: templateId,
        cloneId: clonedTemplate.id
      });

      return clonedTemplate;
    } catch (error) {
      logger.error('Template cloning failed', error);
      throw error;
    }
  }

  // Private helper methods
  private applyFilters(templates: CVTemplate[], filters: TemplateFilters): CVTemplate[] {
    return templates.filter(template => {
      if (filters.category && template.category !== filters.category) {
        return false;
      }

      if (filters.industry && !template.industryFocus.includes(filters.industry)) {
        return false;
      }

      if (filters.experienceLevel && !template.experienceLevel.includes(filters.experienceLevel)) {
        return false;
      }

      if (filters.premium !== undefined && template.premium !== filters.premium) {
        return false;
      }

      if (filters.atsOptimized !== undefined && template.atsOptimized !== filters.atsOptimized) {
        return false;
      }

      if (filters.rating && template.rating < filters.rating) {
        return false;
      }

      return true;
    });
  }

  private generatePreviewHTML(templateId: string, sampleData?: any): string {
    // TODO: Generate actual HTML preview based on template and data
    return `
      <div class="cv-preview" data-template-id="${templateId}">
        <h1>Sample CV Preview</h1>
        <p>This is a preview of the ${templateId} template.</p>
        ${sampleData ? '<p>Using provided sample data</p>' : '<p>Using default sample data</p>'}
      </div>
    `;
  }

  private generateCustomizedHTML(
    templateId: string,
    customizations: Partial<TemplateCustomization>
  ): string {
    // TODO: Generate customized HTML based on template and customizations
    return `
      <div class="cv-preview customized" data-template-id="${templateId}">
        <h1>Customized CV Preview</h1>
        <p>This is a customized preview of the ${templateId} template.</p>
        ${customizations.colors ? '<p>Custom colors applied</p>' : ''}
        ${customizations.fonts ? '<p>Custom fonts applied</p>' : ''}
        ${customizations.layout ? '<p>Custom layout applied</p>' : ''}
      </div>
    `;
  }

  private getDefaultSampleData(): any {
    return {
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA'
      },
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          location: 'San Francisco, CA',
          startDate: '2020-01-01',
          endDate: null,
          current: true,
          description: 'Led development of customer-facing applications.'
        }
      ],
      education: [
        {
          institution: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          location: 'Berkeley, CA',
          startDate: '2014-09-01',
          endDate: '2018-05-01'
        }
      ],
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python']
    };
  }

  private getMockTemplates(): CVTemplate[] {
    // Return mock templates for development
    return [
      {
        id: 'modern-professional',
        name: 'Modern Professional',
        description: 'Clean, modern design perfect for corporate environments',
        category: 'professional',
        previewUrl: 'https://cvplus.com/templates/modern-professional/preview',
        thumbnailUrl: 'https://cvplus.com/templates/modern-professional/thumb.png',
        features: [
          { id: 'ats-optimized', name: 'ATS Optimized', description: 'Optimized for applicant tracking systems', icon: 'robot', available: true }
        ],
        atsOptimized: true,
        industryFocus: ['technology', 'finance', 'consulting'],
        experienceLevel: ['mid', 'senior', 'executive'],
        layout: {
          columns: 2,
          sections: [],
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
      }
    ];
  }

  private getMockTemplateById(templateId: string): CVTemplate | null {
    const templates = this.getMockTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  // Clean up caches
  clearCache(): void {
    this.templateCache.clear();
    this.previewCache.clear();
    logger.info('Template caches cleared');
  }
}

// Export singleton instance
export const CVTemplateUIService = new CVTemplateUIService();