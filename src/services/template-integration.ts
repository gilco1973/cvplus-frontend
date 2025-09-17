/**
 * Template Integration Service
 * Bridges the new professional template system with existing CVPlus components
 * Provides backward compatibility and migration utilities
 */

import type {
  CVTemplate,
  TemplateId,
  TemplateCategory,
  ExperienceLevel,
  LegacyTemplate
} from '../types/cv-templates';
import type { CVParsedData } from '../types/cvData';
import {
  templateRegistry,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  trackTemplateUsage,
  getRecommendedTemplates
} from './template-registry';

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * Legacy template structure from TemplatesPage.tsx
 */
interface LegacyTemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;
}

/**
 * Maps legacy template IDs to new professional template IDs
 */
const LEGACY_TEMPLATE_MAPPING: Record<string, string> = {
  'modern': 'tech-innovation',
  'classic': 'executive-authority',
  'creative': 'creative-showcase'
};

/**
 * Convert legacy template format to new enhanced format
 */
export function adaptLegacyTemplate(legacyTemplate: LegacyTemplateDefinition): LegacyTemplate {
  return {
    id: legacyTemplate.id,
    name: legacyTemplate.name,
    description: legacyTemplate.description,
    preview: legacyTemplate.preview
  };
}

/**
 * Get modern template equivalent for legacy template ID
 */
export function getMappedTemplate(legacyId: string): CVTemplate | null {
  const modernId = LEGACY_TEMPLATE_MAPPING[legacyId];
  if (!modernId) {
    console.warn(`No mapping found for legacy template ID: ${legacyId}`);
    return null;
  }
  
  const template = getTemplate(modernId);
  if (!template) {
    console.error(`Mapped template not found: ${modernId} (from legacy ${legacyId})`);
    return null;
  }
  
  return template;
}

// ============================================================================
// TEMPLATE SELECTION SERVICE
// ============================================================================

/**
 * Enhanced template selection with intelligent recommendations
 */
export class TemplateSelectionService {
  private userProfile: {
    industry?: string;
    role?: string;
    experienceLevel?: ExperienceLevel;
    preferences?: string[];
  } = {};

  /**
   * Set user profile for personalized recommendations
   */
  setUserProfile(profile: {
    industry?: string;
    role?: string;
    experienceLevel?: ExperienceLevel;
    preferences?: string[];
  }): void {
    this.userProfile = { ...profile };
    console.warn('📋 User profile updated for template recommendations:', profile);
  }

  /**
   * Get recommended templates based on user profile
   */
  getRecommendations(limit = 3): CVTemplate[] {
    return getRecommendedTemplates(this.userProfile).slice(0, limit);
  }

  /**
   * Get templates formatted for the legacy TemplatesPage component
   */
  getLegacyFormattedTemplates(): LegacyTemplateDefinition[] {
    const recommendations = this.getRecommendations(3);
    
    return recommendations.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      preview: template.preview.previewEmoji
    }));
  }

  /**
   * Get all templates formatted for display
   */
  getAllFormattedTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    preview: string;
    category: TemplateCategory;
    isPremium: boolean;
    rating: number;
  }> {
    return getAllTemplates().map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      preview: template.preview.previewEmoji,
      category: template.category,
      isPremium: template.metadata.isPremium,
      rating: template.metadata.rating
    }));
  }

  /**
   * Get templates by category for organized display
   */
  getTemplatesByCategory(): Record<TemplateCategory, Array<{
    id: string;
    name: string;
    description: string;
    preview: string;
    isPremium: boolean;
    rating: number;
  }>> {
    const categories: TemplateCategory[] = [
      'executive', 'technical', 'creative', 'healthcare', 
      'financial', 'academic', 'sales', 'international'
    ];
    
    const result = {} as Record<TemplateCategory, Array<{
      id: string;
      name: string;
      description: string;
      preview: string;
      isPremium: boolean;
      rating: number;
    }>>;
    
    categories.forEach(category => {
      const templates = getTemplatesByCategory(category);
      result[category] = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        preview: template.preview.previewEmoji,
        isPremium: template.metadata.isPremium,
        rating: template.metadata.rating
      }));
    });
    
    return result;
  }

  /**
   * Track template selection for analytics
   */
  trackTemplateSelection(templateId: string, userData?: {
    jobId?: string;
    industry?: string;
    role?: string;
  }): void {
    trackTemplateUsage(templateId);
    
    // Additional tracking logic can be added here
    console.warn('📊 Template selection tracked:', {
      templateId,
      timestamp: new Date().toISOString(),
      userProfile: this.userProfile,
      ...userData
    });
  }

  /**
   * Get template preview data for display
   */
  getTemplatePreview(templateId: string): {
    template: CVTemplate;
    demoData: Partial<CVParsedData>;
    previewUrl?: string;
  } | null {
    const template = getTemplate(templateId);
    if (!template) {
      return null;
    }
    
    return {
      template,
      demoData: template.preview.demoData,
      previewUrl: template.preview.mockupUrl
    };
  }
}

// ============================================================================
// CV GENERATION INTEGRATION
// ============================================================================

/**
 * Enhanced CV generation service that works with the new template system
 */
export class EnhancedCVGenerationService {
  /**
   * Generate CV using new template system
   */
  async generateCV(params: {
    templateId: string;
    cvData: CVParsedData;
    jobId?: string;
    features?: string[];
    customization?: {
      colors?: Record<string, string>;
      fonts?: Record<string, string>;
      layout?: Record<string, any>;
    };
  }): Promise<{
    success: boolean;
    templateId: string;
    generatedAt: string;
    outputs: {
      html?: string;
      pdf?: Blob;
      atsVersion?: string;
    };
    metadata: {
      templateName: string;
      generationTime: number;
      atsScore: number;
      wordCount: number;
    };
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const template = getTemplate(params.templateId);
      if (!template) {
        throw new Error(`Template not found: ${params.templateId}`);
      }
      
      // Track template usage
      trackTemplateUsage(params.templateId);
      
      // Here would be the actual CV generation logic
      // For now, we'll simulate the process
      
      console.warn('🎨 Generating CV with template:', template.name);
      console.warn('📊 Template features:', template.features);
      console.warn('🎯 ATS compatibility:', template.ats.formats.ats.compatibility.score);
      
      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generationTime = Date.now() - startTime;
      
      // Record performance metrics
      templateRegistry.recordPerformance(
        params.templateId as TemplateId,
        generationTime,
        false // no errors in this simulation
      );
      
      return {
        success: true,
        templateId: params.templateId,
        generatedAt: new Date().toISOString(),
        outputs: {
          html: '<html>Generated CV HTML</html>',
          pdf: new Blob(['PDF content'], { type: 'application/pdf' }),
          atsVersion: 'ATS-optimized text version'
        },
        metadata: {
          templateName: template.name,
          generationTime,
          atsScore: template.ats.formats.ats.compatibility.score,
          wordCount: 350 // Simulated
        }
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      
      // Record error performance
      templateRegistry.recordPerformance(
        params.templateId as TemplateId,
        generationTime,
        true // error occurred
      );
      
      console.error('❌ CV generation failed:', error);
      
      return {
        success: false,
        templateId: params.templateId,
        generatedAt: new Date().toISOString(),
        outputs: {},
        metadata: {
          templateName: params.templateId,
          generationTime,
          atsScore: 0,
          wordCount: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get template generation capabilities
   */
  getTemplateCapabilities(templateId: string): {
    supportsCustomColors: boolean;
    supportsCustomFonts: boolean;
    supportsLayoutChanges: boolean;
    atsCompatible: boolean;
    features: string[];
    estimatedGenerationTime: string;
  } | null {
    const template = getTemplate(templateId);
    if (!template) {
      return null;
    }
    
    const features: string[] = [];
    
    // Extract features from template specification
    if (template.features.interactivity.expandableSections) features.push('Expandable Sections');
    if (template.features.accessibility.screenReaderOptimized) features.push('Screen Reader Optimized');
    if (template.ats.formats.ats.enabled) features.push('ATS Compatible');
    if (template.features.skills.animation !== 'none') features.push('Animated Elements');
    
    return {
      supportsCustomColors: template.customization.allowColorChanges,
      supportsCustomFonts: template.customization.allowFontChanges,
      supportsLayoutChanges: template.customization.allowLayoutChanges,
      atsCompatible: template.ats.formats.ats.enabled,
      features,
      estimatedGenerationTime: template.metadata.isPremium ? '30-45 seconds' : '15-30 seconds'
    };
  }
}

// ============================================================================
// MIGRATION UTILITIES
// ============================================================================

/**
 * Utilities for migrating from legacy template system
 */
export class TemplateMigrationService {
  /**
   * Migrate legacy template selections to new system
   */
  migrateLegacySelection(legacyTemplateId: string): {
    success: boolean;
    newTemplateId?: string;
    templateName?: string;
    changes: string[];
  } {
    const changes: string[] = [];
    
    const newTemplateId = LEGACY_TEMPLATE_MAPPING[legacyTemplateId];
    if (!newTemplateId) {
      return {
        success: false,
        changes: [`No migration path found for template: ${legacyTemplateId}`]
      };
    }
    
    const template = getTemplate(newTemplateId);
    if (!template) {
      return {
        success: false,
        changes: [`Target template not available: ${newTemplateId}`]
      };
    }
    
    // Document changes
    changes.push(`Migrated from '${legacyTemplateId}' to '${newTemplateId}'`);
    changes.push(`Enhanced features: ${template.metadata.tags.join(', ')}`);
    changes.push(`ATS compatibility: ${template.ats.formats.ats.compatibility.score}%`);
    
    if (template.metadata.isPremium) {
      changes.push('⭐ Upgraded to premium template with advanced features');
    }
    
    return {
      success: true,
      newTemplateId,
      templateName: template.name,
      changes
    };
  }

  /**
   * Get migration recommendations for legacy users
   */
  getMigrationRecommendations(): Array<{
    legacyId: string;
    legacyName: string;
    recommendedId: string;
    recommendedName: string;
    benefits: string[];
  }> {
    return [
      {
        legacyId: 'modern',
        legacyName: 'Modern Professional',
        recommendedId: 'tech-innovation',
        recommendedName: 'Tech Innovation',
        benefits: [
          'Skills-first layout with technical project showcases',
          'Enhanced typography with code snippet support',
          'Improved ATS compatibility (85% score)',
          'Customizable layout and color schemes'
        ]
      },
      {
        legacyId: 'classic',
        legacyName: 'Classic Executive',
        recommendedId: 'executive-authority',
        recommendedName: 'Executive Authority',
        benefits: [
          'Enhanced executive presence with gold accent colors',
          'Leadership achievement prominence',
          'Premium typography pairing (Playfair Display + Inter)',
          'High ATS compatibility (95% score)',
          'Board position and strategic metrics emphasis'
        ]
      },
      {
        legacyId: 'creative',
        legacyName: 'Creative Designer',
        recommendedId: 'creative-showcase',
        recommendedName: 'Creative Showcase',
        benefits: [
          'Portfolio-integrated layout with project highlights',
          'Vibrant color schemes and unique visual elements',
          'Advanced animation and hover effects',
          'Creative work sample integration',
          'Brand campaign showcase capabilities'
        ]
      }
    ];
  }
}

// ============================================================================
// SINGLETON SERVICES
// ============================================================================

export const templateSelectionService = new TemplateSelectionService();
export const enhancedCVGenerationService = new EnhancedCVGenerationService();
export const templateMigrationService = new TemplateMigrationService();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

/**
 * Get templates for TemplatesPage (backward compatibility)
 */
export function getTemplatesForPage(userProfile?: {
  industry?: string;
  role?: string;
  experienceLevel?: ExperienceLevel;
}): LegacyTemplateDefinition[] {
  if (userProfile) {
    templateSelectionService.setUserProfile(userProfile);
  }
  
  return templateSelectionService.getLegacyFormattedTemplates();
}

/**
 * Track template selection (for TemplatesPage integration)
 */
export function trackSelection(templateId: string, jobId?: string): void {
  templateSelectionService.trackTemplateSelection(templateId, { jobId });
}

/**
 * Generate CV with enhanced template system (for service integration)
 */
export async function generateEnhancedCV(params: {
  templateId: string;
  cvData: CVParsedData;
  jobId?: string;
  features?: string[];
}) {
  return enhancedCVGenerationService.generateCV(params);
}

/**
 * Check if template ID is valid in new system
 */
export function isValidTemplateId(templateId: string): boolean {
  return getTemplate(templateId) !== null;
}

/**
 * Get template capabilities for UI display
 */
export function getTemplateCapabilities(templateId: string) {
  return enhancedCVGenerationService.getTemplateCapabilities(templateId);
}

console.warn('🔗 Template Integration Service initialized');
console.warn('📋 Available templates:', getAllTemplates().length);
console.warn('🎨 Template categories:', Object.keys(templateRegistry.categories));
