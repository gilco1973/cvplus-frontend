import type { QRCodeSettings } from '../../types/cv-preview';
import type { CVParsedData, CVPersonalInfo, CVSkillsData } from '../../types/cvData';
import { CVTemplateStyles } from './templateStyles';
import { SectionGenerators } from './sectionGenerators';
import { TemplateCompatibility } from './templateCompatibility';

export class CVTemplateGenerator {
  /**
   * Generate HTML for CV preview with enhanced template support
   * Maintains backward compatibility while supporting enhanced templates
   */
  static async generateHTML(
    previewData: CVParsedData,
    selectedTemplate: string,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): Promise<string> {
    console.warn('🎨 [CV TEMPLATE GENERATOR] Generating template:', selectedTemplate);
    
    // Check if we should use the compatibility layer
    try {
      return await TemplateCompatibility.generateHTML(
        previewData,
        selectedTemplate,
        selectedFeatures,
        qrCodeSettings,
        collapsedSections,
        generateFeaturePreview
      );
    } catch (error) {
      console.warn('⚠️ [CV TEMPLATE GENERATOR] Compatibility layer failed, falling back to legacy generator:', error);
      return await this.generateLegacyHTML(
        previewData,
        selectedTemplate,
        selectedFeatures,
        qrCodeSettings,
        collapsedSections,
        generateFeaturePreview
      );
    }
  }
  
  /**
   * Legacy HTML generation method
   * Preserved for backward compatibility and fallback
   */
  static generateLegacyHTML(
    previewData: CVParsedData,
    selectedTemplate: string,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): Promise<string> {
    return new Promise((resolve) => {
    const personalInfo: CVPersonalInfo = previewData?.personalInfo || {
      name: 'Your Name',
      email: 'your.email@example.com',
      phone: '+1 (555) 123-4567',
      location: 'Your Location'
    };
    const experience = previewData?.experience || [];
    const education = previewData?.education || [];
    const skills: CVSkillsData = previewData?.skills || {
      technical: [],
      soft: [],
      languages: []
    };

    console.warn('🔧 [LEGACY GENERATOR] Generating legacy template HTML');
    
    const html = `
      <div class="cv-preview-container ${selectedTemplate} legacy-template" data-template-id="${selectedTemplate}">
        ${CVTemplateStyles.getAllStyles()}
        
        <!-- Legacy Template Indicator -->
        <div class="template-metadata" style="display: none;">
          <span data-template-type="legacy"></span>
          <span data-template-id="${selectedTemplate}"></span>
        </div>
        
        <!-- Header Section -->
        ${SectionGenerators.generateHeaderSection(personalInfo)}
        
        <!-- QR Code Feature Preview -->
        ${SectionGenerators.generateQRCodeSection(qrCodeSettings, collapsedSections)}

        <!-- Summary Section -->
        ${SectionGenerators.generateSummarySection(previewData?.summary || '', collapsedSections, CVTemplateGenerator.convertToStringRecord(previewData?.customSections))}

        <!-- Experience Section -->
        ${SectionGenerators.generateExperienceSection(experience, collapsedSections, CVTemplateGenerator.convertToStringRecord(previewData?.customSections) || {})}

        <!-- Education Section -->
        ${SectionGenerators.generateEducationSection(education, collapsedSections)}

        <!-- Skills Section -->
        ${SectionGenerators.generateSkillsSection(skills, collapsedSections)}

        <!-- Feature Previews -->
        ${SectionGenerators.generateFeaturePreviews(selectedFeatures, collapsedSections, generateFeaturePreview)}
      </div>
    `;
    
      // Apply compatibility fixes
      const finalHtml = this.applyLegacyCompatibilityFixes(html, selectedTemplate);
      resolve(finalHtml);
    });
  }

  /**
   * Apply legacy compatibility fixes to HTML
   */
  private static applyLegacyCompatibilityFixes(html: string, templateId: string): string {
    let fixedHtml = html;
    
    // Add legacy-specific CSS classes for backward compatibility
    fixedHtml = fixedHtml.replace(
      `class="cv-preview-container ${templateId}`,
      `class="cv-preview-container ${templateId} legacy-compatible`
    );
    
    // Add upgrade notification if appropriate
    if (this.shouldShowUpgradeNotification(templateId)) {
      const upgradeNotice = this.generateUpgradeNotification(templateId);
      fixedHtml = fixedHtml.replace(
        '<!-- Legacy Template Indicator -->',
        `<!-- Legacy Template Indicator -->${upgradeNotice}`
      );
    }
    
    return fixedHtml;
  }
  
  /**
   * Check if upgrade notification should be shown
   */
  private static shouldShowUpgradeNotification(templateId: string): boolean {
    const legacyTemplates = ['modern', 'classic', 'creative'];
    return legacyTemplates.includes(templateId);
  }
  
  /**
   * Generate upgrade notification banner
   */
  private static generateUpgradeNotification(templateId: string): string {
    const upgradeMap: Record<string, { name: string; benefits: string[] }> = {
      'modern': {
        name: 'Tech Innovation',
        benefits: ['Better technical skills visualization', 'Project showcase integration', 'GitHub integration']
      },
      'classic': {
        name: 'Executive Authority',
        benefits: ['Enhanced leadership metrics', 'Executive-level styling', 'Board-ready formatting']
      },
      'creative': {
        name: 'Creative Showcase',
        benefits: ['Portfolio integration', 'Creative color schemes', 'Artistic layout options']
      }
    };
    
    const upgrade = upgradeMap[templateId];
    if (!upgrade) return '';
    
    return `
      <div class="template-upgrade-notification" style="
        position: relative;
        margin-bottom: 20px;
        padding: 16px;
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 1px solid #0ea5e9;
        border-radius: 8px;
        font-size: 14px;
        color: #0c4a6e;
      ">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <span style="font-size: 18px;">🚀</span>
          <strong>Upgrade Available: ${upgrade.name} Template</strong>
        </div>
        <div style="font-size: 13px; opacity: 0.8; margin-bottom: 8px;">
          Enhanced features: ${upgrade.benefits.join(', ')}
        </div>
        <button onclick="window.showTemplateUpgrade?.('${templateId}', '${upgrade.name.toLowerCase().replace(' ', '-')}')" style="
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        ">
          ⬆️ Upgrade Template
        </button>
      </div>
    `;
  }

  public static convertToStringRecord(obj: Record<string, unknown> | undefined): Record<string, string> | undefined {
    if (!obj) return undefined;
    
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = typeof value === 'string' ? value : String(value);
    }
    return result;
  }
  
  /**
   * Get template information for analytics and debugging
   */
  static getTemplateInfo(templateId: string): {
    type: 'legacy' | 'enhanced';
    category: string;
    features: string[];
    upgradeAvailable: boolean;
  } {
    const legacyTemplates = ['modern', 'classic', 'creative'];
    const isLegacy = legacyTemplates.includes(templateId);
    
    return {
      type: isLegacy ? 'legacy' : 'enhanced',
      category: isLegacy ? this.mapLegacyToCategory(templateId) : 'unknown',
      features: isLegacy ? this.getLegacyFeatures(templateId) : [],
      upgradeAvailable: isLegacy
    };
  }
  
  private static mapLegacyToCategory(templateId: string): string {
    const mapping: Record<string, string> = {
      'modern': 'technical',
      'classic': 'executive',
      'creative': 'creative'
    };
    return mapping[templateId] || 'general';
  }
  
  private static getLegacyFeatures(templateId: string): string[] {
    const features: Record<string, string[]> = {
      'modern': ['responsive-design', 'clean-layout', 'skills-section'],
      'classic': ['traditional-layout', 'professional-styling', 'experience-focused'],
      'creative': ['colorful-design', 'artistic-layout', 'portfolio-ready']
    };
    return features[templateId] || [];
  }
}