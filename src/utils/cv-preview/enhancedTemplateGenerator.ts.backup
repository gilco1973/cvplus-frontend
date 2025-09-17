/**
 * Enhanced CV Template Generator
 * Extends existing CVTemplateGenerator functionality to support professional templates
 * while maintaining backward compatibility with legacy template system
 */

import type { QRCodeSettings } from '../../types/cv-preview';
import type { CVParsedData, CVPersonalInfo, CVSkillsData } from '../../types/cvData';
import type {
  CVTemplate,
  TemplateId,
  TemplateGenerationOptions,
  GeneratedTemplate,
  TemplateGenerationResult,
  LegacyTemplate,
  adaptLegacyTemplate
} from '../../types/cv-templates';
import { CVTemplateGenerator } from './cvTemplateGenerator';
import { EnhancedTemplateStyles } from './enhancedTemplateStyles';
import { TemplateSpecificGenerators } from './templateSpecificGenerators';
import { TemplateCompatibility } from './templateCompatibility';
import { templateRegistry, getTemplate } from '../../services/template-registry';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';
import { 
  sanitizeCVData, 
  sanitizeHTML, 
  auditCVSecurity,
  safeGet,
  isValidString 
} from '../security/contentSanitizer';

// ============================================================================
// ENHANCED TEMPLATE GENERATOR CLASS
// ============================================================================

export class EnhancedTemplateGenerator {
  // Performance metrics
  private static performanceCache = new Map<string, { html: string; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Main generation method that supports both legacy and enhanced templates
   * Maintains backward compatibility while providing enhanced functionality
   */
  static async generateHTML(
    previewData: CVParsedData,
    templateIdOrConfig: string | CVTemplate,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string,
    options: Partial<TemplateGenerationOptions> = {}
  ): Promise<string> {
    const startTime = performance.now();
    
    // CRITICAL SECURITY: Sanitize and validate all input data
    const securityAudit = auditCVSecurity(previewData);
    if (!securityAudit.isSecure) {
      console.warn('Security violations detected:', securityAudit.violations);
    }
    
    // Sanitize CV data before processing
    const sanitizedData = sanitizeCVData(previewData);
    
    try {
      // Determine if we're dealing with legacy template ID or enhanced template
      const templateConfig = await this.resolveTemplate(templateIdOrConfig);
      const isEnhanced = templateConfig !== null;
      
      console.log('🎨 [ENHANCED GENERATOR] Processing template:', {
        type: isEnhanced ? 'enhanced' : 'legacy',
        templateId: typeof templateIdOrConfig === 'string' ? templateIdOrConfig : templateIdOrConfig.id,
        isEnhanced
      });

      let html: string;
      
      if (isEnhanced && templateConfig) {
        // Use enhanced template generation
        html = await this.generateEnhancedTemplate(
          previewData,
          templateConfig,
          selectedFeatures,
          qrCodeSettings,
          collapsedSections,
          generateFeaturePreview,
          options
        );
        
        // Track usage for analytics
        templateRegistry.trackUsage(templateConfig.id);
      } else {
        // Fall back to legacy template generation
        const legacyTemplateId = typeof templateIdOrConfig === 'string' 
          ? templateIdOrConfig 
          : templateIdOrConfig.id;
          
        html = CVTemplateGenerator.generateHTML(
          sanitizedData,
          legacyTemplateId,
          selectedFeatures,
          qrCodeSettings,
          collapsedSections,
          generateFeaturePreview
        );
      }
      
      const generationTime = performance.now() - startTime;
      
      console.log(`✅ [ENHANCED GENERATOR] Template generated successfully in ${generationTime.toFixed(2)}ms`);
      
      // Record performance metrics
      if (templateConfig) {
        templateRegistry.recordPerformance(templateConfig.id, generationTime, false);
      }
      
      return html;
      
    } catch (error) {
      const generationTime = performance.now() - startTime;
      const templateId = typeof templateIdOrConfig === 'string' 
        ? templateIdOrConfig 
        : templateIdOrConfig.id;
        
      console.error(`❌ [ENHANCED GENERATOR] Template generation failed for ${templateId}:`, error);
      
      // Record error for analytics
      const template = await this.resolveTemplate(templateIdOrConfig);
      if (template) {
        templateRegistry.recordPerformance(template.id, generationTime, true);
      }
      
      // Fall back to legacy generator on error
      return CVTemplateGenerator.generateHTML(
        sanitizedData,
        typeof templateIdOrConfig === 'string' ? templateIdOrConfig : 'modern',
        selectedFeatures,
        qrCodeSettings,
        collapsedSections,
        generateFeaturePreview
      );
    }
  }

  // ============================================================================
  // TEMPLATE RESOLUTION
  // ============================================================================

  private static async resolveTemplate(templateIdOrConfig: string | CVTemplate): Promise<CVTemplate | null> {
    if (typeof templateIdOrConfig === 'object') {
      return templateIdOrConfig;
    }
    
    // Try to get from professional templates
    const professionalTemplate = getTemplate(templateIdOrConfig);
    if (professionalTemplate) {
      return professionalTemplate;
    }
    
    // Check if it's a legacy template that needs adaptation
    const legacyTemplate = this.getLegacyTemplate(templateIdOrConfig);
    if (legacyTemplate) {
      return this.adaptLegacyToEnhanced(legacyTemplate);
    }
    
    return null;
  }

  private static getLegacyTemplate(templateId: string): LegacyTemplate | null {
    // Map of legacy template IDs to template definitions
    const legacyTemplates: Record<string, LegacyTemplate> = {
      'modern': {
        id: 'modern',
        name: 'Modern Template',
        description: 'Clean, modern design suitable for most professions',
        preview: '💻'
      },
      'classic': {
        id: 'classic',
        name: 'Classic Template',
        description: 'Traditional, conservative design for executive roles',
        preview: '👔'
      },
      'creative': {
        id: 'creative',
        name: 'Creative Template',
        description: 'Bold, expressive design for creative professionals',
        preview: '🎨'
      }
    };
    
    return legacyTemplates[templateId] || null;
  }

  private static adaptLegacyToEnhanced(legacyTemplate: LegacyTemplate): CVTemplate {
    const adapted = adaptLegacyTemplate(legacyTemplate);
    
    // Get the corresponding professional template if available
    const mappedTemplate = this.mapLegacyToProfessional(legacyTemplate.id);
    if (mappedTemplate) {
      return mappedTemplate;
    }
    
    // Create a minimal enhanced template from legacy template
    return TemplateCompatibility.createMinimalEnhancedTemplate(adapted);
  }

  private static mapLegacyToProfessional(legacyId: string): CVTemplate | null {
    const mapping: Record<string, string> = {
      'modern': 'tech-innovation',
      'classic': 'executive-authority', 
      'creative': 'creative-showcase'
    };
    
    const professionalId = mapping[legacyId];
    return professionalId ? getTemplate(professionalId) : null;
  }

  // ============================================================================
  // ENHANCED TEMPLATE GENERATION
  // ============================================================================

  private static async generateEnhancedTemplate(
    previewData: CVParsedData,
    template: CVTemplate,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string,
    options: Partial<TemplateGenerationOptions>
  ): Promise<string> {
    console.log(`🎨 [ENHANCED TEMPLATE] Generating ${template.name} (${template.category})`);

    // Generate template-specific styles
    const templateStyles = EnhancedTemplateStyles.generateTemplateStyles(template);
    
    // Generate sections using template-specific generators
    const sections = await TemplateSpecificGenerators.generateAllSections(
      template,
      previewData,
      selectedFeatures,
      qrCodeSettings,
      collapsedSections,
      generateFeaturePreview
    );

    // Prepare personal info with defaults
    const personalInfo: CVPersonalInfo = previewData?.personalInfo || {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Your Location'
    };

    // Generate responsive layout
    const layoutClasses = this.generateLayoutClasses(template);
    
    // Generate ATS-compatible version if needed
    const atsVersion = template.ats.formats.ats.enabled ? 
      await this.generateATSVersion(template, previewData) : '';

    return `
      <div class="cv-preview-container ${template.category}-template ${layoutClasses}" data-template-id="${template.id}">
        ${templateStyles}
        
        <!-- Template Metadata -->
        <div class="template-metadata" style="display: none;">
          <span data-template-name="${template.name}"></span>
          <span data-template-category="${template.category}"></span>
          <span data-template-version="${template.version}"></span>
        </div>
        
        <!-- Enhanced Header Section -->
        ${sections.header}
        
        <!-- Main Content Grid -->
        <div class="template-content-grid">
          ${sections.summary}
          ${sections.experience}
          ${sections.education}
          ${sections.skills}
          ${sections.projects || ''}
          ${sections.certifications || ''}
          ${sections.languages || ''}
          ${sections.awards || ''}
          ${sections.customSections || ''}
        </div>
        
        <!-- Feature Previews -->
        ${sections.featurePreviews}
        
        <!-- QR Code Section -->
        ${sections.qrCode}
        
        <!-- ATS Version (Hidden) -->
        ${atsVersion ? `<div class="ats-version" style="display: none;">${atsVersion}</div>` : ''}
        
        <!-- Template Footer -->
        ${this.generateTemplateFooter(template)}
      </div>
    `;
  }

  private static generateLayoutClasses(template: CVTemplate): string {
    const layout = template.layout;
    return [
      `grid-cols-${layout.grid.columns}`,
      `max-w-${layout.grid.maxWidth.replace('px', '')}`,
      `gap-${layout.grid.gap.replace('px', '')}`,
      template.category,
      template.experienceLevel.join(' '),
      'responsive-layout'
    ].join(' ');
  }

  private static async generateATSVersion(template: CVTemplate, previewData: CVParsedData): Promise<string> {
    // Generate simplified, ATS-compatible version
    const atsGenerator = new ATSTemplateGenerator();
    return atsGenerator.generateATSOptimizedHTML(template, previewData);
  }

  private static generateTemplateFooter(template: CVTemplate): string {
    if (template.layout.footer.content === 'minimal') {
      return '<div class="template-footer minimal"></div>';
    }
    
    if (template.layout.footer.content === 'extended') {
      return `
        <div class="template-footer extended">
          <div class="footer-branding">
            Generated with CVPlus • ${template.name}
          </div>
        </div>
      `;
    }
    
    return `
      <div class="template-footer standard">
        <div class="footer-content">
          <span class="template-info">Template: ${template.name}</span>
        </div>
      </div>
    `;
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Generate a complete CV template with validation and error handling
   */
  static async generateCVTemplate(
    templateId: TemplateId | string,
    cvData: CVParsedData,
    options: Partial<TemplateGenerationOptions> = {}
  ): Promise<TemplateGenerationResult> {
    const startTime = performance.now();
    
    try {
      const template = await this.resolveTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Validate template
      const validation = templateRegistry.operations.validate(template);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Generate HTML content
      const html = await this.generateEnhancedTemplate(
        cvData,
        template,
        options.content?.customSections ? this.mapCustomSections(options.content.customSections) : {},
        options.content?.includeQRCode ? this.createDefaultQRSettings() : this.createEmptyQRSettings(),
        {},
        () => '', // No feature previews in direct generation
        options
      );
      
      // Generate CSS
      const css = EnhancedTemplateStyles.generateTemplateCSS(template);
      
      const generationTime = performance.now() - startTime;
      
      const result: GeneratedTemplate = {
        html,
        css,
        metadata: {
          templateId: template.id,
          generatedAt: new Date().toISOString(),
          options,
          cvData
        },
        outputs: {
          html: html + `<style>${css}</style>`,
          atsVersion: template.ats.formats.ats.enabled ? 
            await this.generateATSVersion(template, cvData) : undefined
        },
        stats: {
          generationTime,
          fileSize: new Blob([html]).size,
          atsScore: template.ats.optimization ? 85 : 60,
          sections: this.extractSectionList(html),
          wordCount: this.calculateWordCount(html)
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          recommendations: template.ats.formats.ats.compatibility.recommendations || []
        }
      };
      
      return {
        success: true,
        template: result
      };
      
    } catch (error) {
      console.error('Template generation failed:', error);
      
      return {
        success: false,
        template: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private static mapCustomSections(customSections: string[]): Record<string, boolean> {
    return customSections.reduce((acc, section) => {
      acc[section] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  private static createDefaultQRSettings(): QRCodeSettings {
    return {
      type: 'linkedin',
      url: 'https://linkedin.com/in/yourprofile',
      customText: 'Connect with me on LinkedIn'
    };
  }

  private static createEmptyQRSettings(): QRCodeSettings {
    return {
      type: 'custom',
      url: '',
      customText: ''
    };
  }

  private static extractSectionList(html: string): string[] {
    const sectionMatches = html.match(/data-section="([^"]+)"/g) || [];
    return sectionMatches.map(match => match.replace(/data-section="([^"]+)"/, '$1'));
  }

  private static calculateWordCount(html: string): number {
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.split(' ').filter(word => word.length > 0).length;
  }

  /**
   * Check if a template supports specific features
   */
  static async supportsFeature(templateId: string, featureId: string): Promise<boolean> {
    const template = await this.resolveTemplate(templateId);
    if (!template) return false;
    
    // Check template feature specifications
    return this.checkFeatureSupport(template, featureId);
  }

  private static checkFeatureSupport(template: CVTemplate, featureId: string): boolean {
    const features = template.features;
    
    switch (featureId) {
      case 'skillsVisualization':
        return features.skills.type !== 'tags';
      case 'interactiveTimeline':
        return features.experience.layout === 'timeline';
      case 'portfolioGallery':
        return template.category === 'creative';
      case 'atsOptimization':
        return template.ats.formats.ats.enabled;
      default:
        return true; // Default to supporting all features
    }
  }

  /**
   * Get template performance metrics
   */
  static getPerformanceMetrics(templateId: string): {
    averageGenerationTime: number;
    errorRate: number;
    usageCount: number;
  } {
    const usage = templateRegistry.analytics.usage.get(templateId as TemplateId) || 0;
    const performance = templateRegistry.analytics.performance.get(templateId as TemplateId);
    
    return {
      averageGenerationTime: performance?.generationTime || 0,
      errorRate: performance ? performance.errors / Math.max(usage, 1) : 0,
      usageCount: usage
    };
  }
}

// ============================================================================
// ATS TEMPLATE GENERATOR
// ============================================================================

class ATSTemplateGenerator {
  generateATSOptimizedHTML(template: CVTemplate, cvData: CVParsedData): string {
    // Generate simplified HTML for ATS compatibility
    const personalInfo = cvData.personalInfo || {};
    
    return `
      <div class="ats-cv-container">
        <div class="ats-header">
          <h1>${personalInfo.name || 'Candidate Name'}</h1>
          <div class="ats-contact">
            <p>${personalInfo.email || 'email@example.com'}</p>
            <p>${personalInfo.phone || 'Phone Number'}</p>
            <p>${personalInfo.location || 'Location'}</p>
          </div>
        </div>
        
        <div class="ats-section">
          <h2>PROFESSIONAL SUMMARY</h2>
          <p>${cvData.summary || 'Professional summary will be displayed here.'}</p>
        </div>
        
        <div class="ats-section">
          <h2>WORK EXPERIENCE</h2>
          ${this.generateATSExperience(cvData.experience || [])}
        </div>
        
        <div class="ats-section">
          <h2>EDUCATION</h2>
          ${this.generateATSEducation(cvData.education || [])}
        </div>
        
        <div class="ats-section">
          <h2>SKILLS</h2>
          ${this.generateATSSkills(cvData.skills)}
        </div>
      </div>
    `;
  }

  private generateATSExperience(experience: any[]): string {
    return experience.map(exp => `
      <div class="ats-experience-item">
        <h3>${sanitizeHTML(safeGet(exp, 'position', 'Position', isValidString))}</h3>
        <p><strong>${sanitizeHTML(safeGet(exp, 'company', 'Company', isValidString))}</strong> | ${sanitizeHTML(safeGet(exp, 'startDate', 'Start', isValidString))} - ${sanitizeHTML(safeGet(exp, 'endDate', 'End', isValidString))}</p>
        ${exp.description ? `<p>${sanitizeHTML(exp.description)}</p>` : ''}
        ${exp.achievements ? `
          <ul>
            ${exp.achievements.map((achievement: string) => `<li>${sanitizeHTML(achievement)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');
  }

  private generateATSEducation(education: any[]): string {
    return education.map(edu => `
      <div class="ats-education-item">
        <p><strong>${edu.degree || 'Degree'}</strong> ${edu.field ? `in ${edu.field}` : ''}</p>
        <p>${edu.institution || 'Institution'} | ${edu.startDate || 'Start'} - ${edu.endDate || 'End'}</p>
      </div>
    `).join('');
  }

  private generateATSSkills(skills: any): string {
    if (!skills) return '';
    
    return Object.entries(skills).map(([category, skillList]) => {
      if (!Array.isArray(skillList)) return '';
      return `<p><strong>${category}:</strong> ${skillList.join(', ')}</p>`;
    }).join('');
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY EXPORTS
// ============================================================================

/**
 * Enhanced version of the original generateHTML function
 * Maintains the exact same signature for backward compatibility
 */
export const generateHTML = async (
  previewData: CVParsedData,
  selectedTemplate: string,
  selectedFeatures: Record<string, boolean>,
  qrCodeSettings: QRCodeSettings,
  collapsedSections: Record<string, boolean>,
  generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
): Promise<string> => {
  return EnhancedTemplateGenerator.generateHTML(
    previewData,
    selectedTemplate,
    selectedFeatures,
    qrCodeSettings,
    collapsedSections,
    generateFeaturePreview
  );
};

// Re-export for compatibility
export { EnhancedTemplateGenerator as CVTemplateGeneratorEnhanced };

// Utility exports
export * from '../cv-preview/templateCompatibility';
export type { TemplateGenerationResult, GeneratedTemplate } from '../../types/cv-templates';

console.log('🚀 Enhanced Template Generator loaded and ready');