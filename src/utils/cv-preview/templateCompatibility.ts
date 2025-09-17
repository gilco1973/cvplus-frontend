/**
 * Template Compatibility Layer
 * Ensures seamless integration between legacy and enhanced template systems
 * Provides migration support and backward compatibility
 */

import type {
  CVTemplate,
  TemplateId,
  LegacyTemplate,
  TemplateCategory,
  ExperienceLevel,
  ColorPalette,
  TypographySystem,
  SpacingSystem,
  LayoutConfiguration,
  FeatureSpecification,
  StylingSystem,
  ATSCompatibility,
  INDUSTRY_COLOR_SCHEMES,
  PROFESSIONAL_TYPOGRAPHY
} from '../../types/cv-templates';
import { CVTemplateGenerator } from './cvTemplateGenerator';
import { EnhancedTemplateGenerator } from './enhancedTemplateGenerator';
import type { CVParsedData } from '../../types/cvData';
import type { QRCodeSettings } from '../../types/cv-preview';

// ============================================================================
// TEMPLATE COMPATIBILITY MANAGER
// ============================================================================

export class TemplateCompatibility {
  // Migration tracking
  private static migrationLog = new Map<string, { legacy: boolean; enhanced: boolean; migrated: Date; }>;
  private static compatibilityWarnings = new Map<string, string[]>();

  /**
   * Determine if a template ID refers to a legacy or enhanced template
   */
  static async isLegacyTemplate(templateId: string): Promise<boolean> {
    const legacyTemplates = ['modern', 'classic', 'creative'];
    return legacyTemplates.includes(templateId);
  }

  /**
   * Get the appropriate generator for a template
   */
  static async getTemplateGenerator(templateId: string): Promise<'legacy' | 'enhanced'> {
    const isLegacy = await this.isLegacyTemplate(templateId);
    return isLegacy ? 'legacy' : 'enhanced';
  }

  /**
   * Generate HTML using the appropriate generator
   */
  static async generateHTML(
    previewData: CVParsedData,
    templateId: string,
    selectedFeatures: Record<string, boolean>,
    qrCodeSettings: QRCodeSettings,
    collapsedSections: Record<string, boolean>,
    generateFeaturePreview: (featureId: string, isEnabled: boolean, isCollapsed: boolean) => string
  ): Promise<string> {
    const generatorType = await this.getTemplateGenerator(templateId);
    
    console.warn(`🔄 [TEMPLATE COMPATIBILITY] Using ${generatorType} generator for template: ${templateId}`);
    
    if (generatorType === 'enhanced') {
      return EnhancedTemplateGenerator.generateHTML(
        previewData,
        templateId,
        selectedFeatures,
        qrCodeSettings,
        collapsedSections,
        generateFeaturePreview
      );
    } else {
      return CVTemplateGenerator.generateLegacyHTML(
        previewData,
        templateId,
        selectedFeatures,
        qrCodeSettings,
        collapsedSections,
        generateFeaturePreview
      );
    }
  }

  // ============================================================================
  // LEGACY TO ENHANCED MIGRATION
  // ============================================================================

  /**
   * Migrate a legacy template to the enhanced format
   */
  static migrateLegacyTemplate(legacyTemplate: LegacyTemplate): CVTemplate {
    console.warn(`🔄 [TEMPLATE MIGRATION] Migrating legacy template: ${legacyTemplate.id}`);
    
    const category = this.mapLegacyTemplateToCategory(legacyTemplate.id);
    const enhancedTemplate = this.createEnhancedFromLegacy(legacyTemplate, category);
    
    // Track migration
    this.migrationLog.set(legacyTemplate.id, {
      legacy: true,
      enhanced: true,
      migrated: new Date()
    });
    
    console.warn(`✅ [TEMPLATE MIGRATION] Successfully migrated ${legacyTemplate.id} to ${category} template`);
    
    return enhancedTemplate;
  }

  /**
   * Map legacy template IDs to template categories
   */
  private static mapLegacyTemplateToCategory(legacyId: string): TemplateCategory {
    const mapping: Record<string, TemplateCategory> = {
      'modern': 'technical',
      'classic': 'executive',
      'creative': 'creative'
    };
    
    return mapping[legacyId] || 'executive';
  }

  /**
   * Create an enhanced template from a legacy template
   */
  private static createEnhancedFromLegacy(
    legacyTemplate: LegacyTemplate,
    category: TemplateCategory
  ): CVTemplate {
    return {
      id: legacyTemplate.id as TemplateId,
      name: legacyTemplate.name,
      description: legacyTemplate.description || `Enhanced ${legacyTemplate.name}`,
      version: '1.0.0',
      category,
      targetRoles: this.getDefaultTargetRoles(category),
      experienceLevel: this.getDefaultExperienceLevels(category),
      industries: this.getDefaultIndustries(category),
      colors: INDUSTRY_COLOR_SCHEMES[category],
      typography: PROFESSIONAL_TYPOGRAPHY[category],
      spacing: this.createDefaultSpacing(),
      layout: this.createDefaultLayout(category),
      features: this.createDefaultFeatures(category),
      styling: this.createDefaultStyling(),
      ats: this.createDefaultATS(),
      preview: {
        thumbnail: '',
        demoData: {},
        previewEmoji: legacyTemplate.preview
      },
      metadata: {
        author: 'CVPlus Migration System',
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        popularity: 50, // Default popularity
        rating: 4.0,
        tags: [category, 'migrated', 'legacy-compatible'],
        isDefault: false,
        isPremium: false
      },
      customization: {
        allowColorChanges: true,
        allowFontChanges: true,
        allowLayoutChanges: false,
        customizableElements: ['colors', 'typography']
      }
    };
  }

  /**
   * Create a minimal enhanced template for compatibility
   */
  static createMinimalEnhancedTemplate(
    partialTemplate: Partial<CVTemplate>
  ): CVTemplate {
    const category: TemplateCategory = partialTemplate.category || 'executive';
    
    return {
      id: (partialTemplate.id || 'minimal-template') as TemplateId,
      name: partialTemplate.name || 'Minimal Template',
      description: partialTemplate.description || 'Basic template for compatibility',
      version: '1.0.0',
      category,
      targetRoles: partialTemplate.targetRoles || this.getDefaultTargetRoles(category),
      experienceLevel: partialTemplate.experienceLevel || this.getDefaultExperienceLevels(category),
      industries: partialTemplate.industries || this.getDefaultIndustries(category),
      colors: partialTemplate.colors || INDUSTRY_COLOR_SCHEMES[category],
      typography: partialTemplate.typography || PROFESSIONAL_TYPOGRAPHY[category],
      spacing: partialTemplate.spacing || this.createDefaultSpacing(),
      layout: partialTemplate.layout || this.createDefaultLayout(category),
      features: partialTemplate.features || this.createDefaultFeatures(category),
      styling: partialTemplate.styling || this.createDefaultStyling(),
      ats: partialTemplate.ats || this.createDefaultATS(),
      preview: partialTemplate.preview || {
        thumbnail: '',
        demoData: {},
        previewEmoji: '📄'
      },
      metadata: partialTemplate.metadata || {
        author: 'CVPlus Compatibility System',
        created: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().split('T')[0],
        popularity: 0,
        rating: 4.0,
        tags: ['minimal', 'compatibility'],
        isDefault: false,
        isPremium: false
      },
      customization: partialTemplate.customization || {
        allowColorChanges: true,
        allowFontChanges: true,
        allowLayoutChanges: true,
        customizableElements: ['colors', 'typography', 'layout']
      }
    };
  }

  // ============================================================================
  // DEFAULT CONFIGURATIONS
  // ============================================================================

  private static getDefaultTargetRoles(category: TemplateCategory): string[] {
    const roles: Record<TemplateCategory, string[]> = {
      executive: ['CEO', 'VP', 'Director', 'Senior Manager'],
      technical: ['Software Engineer', 'Developer', 'DevOps Engineer', 'Tech Lead'],
      creative: ['Designer', 'Creative Director', 'Art Director', 'Photographer'],
      healthcare: ['Doctor', 'Nurse', 'Medical Professional', 'Healthcare Administrator'],
      financial: ['Financial Analyst', 'CPA', 'Investment Manager', 'Financial Advisor'],
      academic: ['Professor', 'Researcher', 'PhD Candidate', 'Academic Administrator'],
      sales: ['Sales Representative', 'Account Manager', 'Business Development', 'Sales Director'],
      international: ['International Manager', 'Global Consultant', 'Cultural Liaison', 'Export Manager']
    };
    
    return roles[category];
  }

  private static getDefaultExperienceLevels(category: TemplateCategory): ExperienceLevel[] {
    const levels: Record<TemplateCategory, ExperienceLevel[]> = {
      executive: ['senior', 'executive'],
      technical: ['entry', 'mid', 'senior'],
      creative: ['mid', 'senior', 'specialized'],
      healthcare: ['entry', 'mid', 'senior', 'specialized'],
      financial: ['mid', 'senior', 'executive'],
      academic: ['entry', 'mid', 'senior', 'specialized'],
      sales: ['entry', 'mid', 'senior'],
      international: ['mid', 'senior', 'executive', 'specialized']
    };
    
    return levels[category];
  }

  private static getDefaultIndustries(category: TemplateCategory): string[] {
    const industries: Record<TemplateCategory, string[]> = {
      executive: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'],
      technical: ['Technology', 'Software', 'Startups', 'E-commerce'],
      creative: ['Design', 'Advertising', 'Media', 'Entertainment'],
      healthcare: ['Healthcare', 'Medical', 'Pharmaceutical', 'Biotechnology'],
      financial: ['Banking', 'Investment', 'Insurance', 'Accounting'],
      academic: ['Education', 'Research', 'Universities', 'Think Tanks'],
      sales: ['Sales', 'Business Development', 'Technology Sales'],
      international: ['International Business', 'Consulting', 'Government', 'NGO']
    };
    
    return industries[category];
  }

  private static createDefaultSpacing(): SpacingSystem {
    return {
      base: '4px',
      scale: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px'
      },
      sections: {
        header: { padding: '24px', margin: '0 0 32px 0' },
        content: { padding: '16px', margin: '0 0 24px 0' },
        footer: { padding: '16px', margin: '32px 0 0 0' }
      }
    };
  }

  private static createDefaultLayout(category: TemplateCategory): LayoutConfiguration {
    return {
      grid: {
        columns: 12,
        gap: '24px',
        maxWidth: '1200px',
        margins: {
          mobile: '16px',
          tablet: '24px',
          desktop: '32px'
        }
      },
      breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px',
        print: 'print'
      },
      sections: {
        personalInfo: {
          order: 1,
          span: { mobile: 12, tablet: 12, desktop: 12 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        summary: {
          order: 2,
          span: { mobile: 12, tablet: 12, desktop: 8 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        experience: {
          order: 3,
          span: { mobile: 12, tablet: 12, desktop: 8 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        education: {
          order: 4,
          span: { mobile: 12, tablet: 12, desktop: 4 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        skills: {
          order: 5,
          span: { mobile: 12, tablet: 6, desktop: 4 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        certifications: {
          order: 6,
          span: { mobile: 12, tablet: 6, desktop: 4 },
          visibility: { mobile: true, tablet: true, desktop: true, print: false }
        },
        projects: {
          order: 7,
          span: { mobile: 12, tablet: 12, desktop: 8 },
          visibility: { mobile: false, tablet: true, desktop: true, print: true }
        },
        languages: {
          order: 8,
          span: { mobile: 12, tablet: 6, desktop: 4 },
          visibility: { mobile: true, tablet: true, desktop: true, print: false }
        },
        awards: {
          order: 9,
          span: { mobile: 12, tablet: 12, desktop: 8 },
          visibility: { mobile: true, tablet: true, desktop: true, print: true }
        },
        customSections: {
          order: 10,
          span: { mobile: 12, tablet: 12, desktop: 12 },
          visibility: { mobile: true, tablet: true, desktop: true, print: false }
        }
      },
      header: {
        height: '120px',
        sticky: false,
        background: 'transparent'
      },
      footer: {
        height: '60px',
        content: 'minimal'
      }
    };
  }

  private static createDefaultFeatures(): FeatureSpecification {
    return {
      skills: {
        type: 'tags',
        showLevels: false,
        groupByCategory: true,
        maxItems: 20,
        animation: 'fade'
      },
      experience: {
        layout: 'list',
        showDuration: true,
        showLocation: true,
        showAchievements: true,
        showTechnologies: false,
        dateFormat: 'full',
        sortOrder: 'reverse-chronological'
      },
      contact: {
        layout: 'horizontal',
        showIcons: true,
        clickableLinks: true,
        showQRCode: false,
        socialLinksStyle: 'icons'
      },
      interactivity: {
        expandableSections: true,
        hoverEffects: true,
        smoothScrolling: true,
        printOptimization: true
      },
      accessibility: {
        highContrast: true,
        focusIndicators: true,
        screenReaderOptimized: true,
        keyboardNavigation: true
      }
    };
  }

  private static createDefaultStyling(): StylingSystem {
    return {
      components: {
        cards: {
          borderRadius: '8px',
          shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          hover: {
            shadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
            transition: { duration: '0.3s', easing: 'ease-out' }
          }
        },
        buttons: {
          primary: {
            background: '#3182ce',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 500,
            hover: {
              background: '#2c5282',
              transform: 'scale(1.02)'
            }
          },
          secondary: {
            background: 'transparent',
            color: '#3182ce',
            border: '1px solid #3182ce',
            borderRadius: '6px',
            padding: '9px 19px',
            fontSize: '0.875rem',
            fontWeight: 500,
            hover: {
              background: '#ebf8ff',
              transform: 'scale(1.02)'
            }
          }
        },
        inputs: {
          borderRadius: '6px',
          border: '1px solid #d2d6dc',
          padding: '8px 12px',
          fontSize: '0.875rem',
          background: '#ffffff',
          focus: {
            border: '2px solid #3182ce',
            shadow: '0 0 0 2px rgba(49, 130, 206, 0.1)',
            outline: 'none'
          }
        },
        dividers: {
          style: 'line',
          thickness: '1px',
          color: '#e2e8f0',
          margin: '24px 0'
        }
      },
      animations: {
        pageLoad: { duration: '0.4s', easing: 'ease-out' },
        sectionReveal: { duration: '0.3s', easing: 'ease-out' },
        hoverEffects: { duration: '0.2s', easing: 'ease-out' },
        focusTransition: { duration: '0.15s', easing: 'ease-in-out' }
      },
      customProperties: {
        '--template-primary': '#3182ce',
        '--template-secondary': '#2d3748',
        '--template-surface': '#ffffff',
        '--template-text': '#1a202c'
      }
    };
  }

  private static createDefaultATS(): ATSCompatibility {
    return {
      formats: {
        visual: {
          enabled: true,
          features: ['modern-layout', 'color-scheme'],
          limitations: ['complex-layouts']
        },
        ats: {
          enabled: true,
          structure: 'simple',
          features: ['standard-sections', 'simple-formatting'],
          compatibility: {
            applicantTrackingSystems: ['Generic ATS'],
            score: 75,
            recommendations: [
              'Use standard section headers',
              'Maintain simple formatting',
              'Avoid complex layouts'
            ]
          }
        }
      },
      optimization: {
        keywordPlacement: 'natural',
        sectionHeaders: 'standard',
        formatting: {
          bulletPoints: true,
          boldKeywords: false,
          standardFonts: true,
          simpleLayout: true
        }
      },
      validation: {
        maxFileSize: '2MB',
        supportedFormats: ['pdf', 'docx'],
        requiredSections: ['personalInfo', 'experience'],
        forbiddenElements: ['tables', 'complex-layouts']
      }
    };
  }

  // ============================================================================
  // COMPATIBILITY VALIDATION
  // ============================================================================

  /**
   * Validate template compatibility
   */
  static validateCompatibility(
    templateId: string,
    features: Record<string, boolean>
  ): { compatible: boolean; warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for legacy template with modern features
    if (this.isLegacyTemplate(templateId)) {
      if (Object.values(features).some(enabled => enabled)) {
        warnings.push('Legacy template may have limited feature support');
        recommendations.push('Consider upgrading to an enhanced template for full feature compatibility');
      }
    }
    
    // Store warnings for future reference
    this.compatibilityWarnings.set(templateId, warnings);
    
    return {
      compatible: warnings.length === 0,
      warnings,
      recommendations
    };
  }

  /**
   * Get migration recommendations
   */
  static getMigrationRecommendations(templateId: string): {
    shouldMigrate: boolean;
    targetTemplate: string | null;
    benefits: string[];
    risks: string[];
  } {
    if (!this.isLegacyTemplate(templateId)) {
      return {
        shouldMigrate: false,
        targetTemplate: null,
        benefits: [],
        risks: []
      };
    }
    
    const migrationMap: Record<string, string> = {
      'modern': 'tech-innovation',
      'classic': 'executive-authority',
      'creative': 'creative-showcase'
    };
    
    return {
      shouldMigrate: true,
      targetTemplate: migrationMap[templateId] || null,
      benefits: [
        'Enhanced styling and typography options',
        'Improved responsive design',
        'Better ATS compatibility',
        'Advanced feature support',
        'Industry-specific optimizations'
      ],
      risks: [
        'Minor visual differences',
        'Need to review customizations',
        'Potential learning curve'
      ]
    };
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  /**
   * Get compatibility statistics
   */
  static getCompatibilityStats(): {
    totalTemplates: number;
    legacyTemplates: number;
    enhancedTemplates: number;
    migrationsPending: number;
    compatibilityIssues: number;
  } {
    const legacyCount = Array.from(this.migrationLog.values())
      .filter(log => log.legacy && !log.enhanced).length;
    
    const enhancedCount = Array.from(this.migrationLog.values())
      .filter(log => log.enhanced).length;
    
    const issuesCount = Array.from(this.compatibilityWarnings.values())
      .reduce((total, warnings) => total + warnings.length, 0);
    
    return {
      totalTemplates: this.migrationLog.size,
      legacyTemplates: legacyCount,
      enhancedTemplates: enhancedCount,
      migrationsPending: legacyCount,
      compatibilityIssues: issuesCount
    };
  }

  /**
   * Clear compatibility data
   */
  static clearCompatibilityData(): void {
    this.migrationLog.clear();
    this.compatibilityWarnings.clear();
    console.warn('🧹 Template compatibility data cleared');
  }
}

// ============================================================================
// COMPATIBILITY UTILITIES
// ============================================================================

/**
 * Check if a feature is supported by a template
 */
export function isFeatureSupported(
  templateId: string,
  featureId: string
): boolean {
  // Legacy templates have limited feature support
  if (TemplateCompatibility.isLegacyTemplate(templateId)) {
    const supportedFeatures = [
      'atsOptimization',
      'keywordEnhancement',
      'achievementHighlighting',
      'embedQRCode'
    ];
    
    return supportedFeatures.includes(featureId);
  }
  
  // Enhanced templates support all features
  return true;
}

/**
 * Get template upgrade path
 */
export function getTemplateUpgradePath(
  currentTemplateId: string
): { canUpgrade: boolean; targetTemplate: string | null; benefits: string[] } {
  const recommendations = TemplateCompatibility.getMigrationRecommendations(currentTemplateId);
  
  return {
    canUpgrade: recommendations.shouldMigrate,
    targetTemplate: recommendations.targetTemplate,
    benefits: recommendations.benefits
  };
}

/**
 * Apply compatibility fixes to template generation
 */
export function applyCompatibilityFixes(
  html: string,
  templateId: string
): string {
  let fixedHtml = html;
  
  // Apply legacy template fixes
  if (TemplateCompatibility.isLegacyTemplate(templateId)) {
    // Add compatibility class
    fixedHtml = fixedHtml.replace(
      'class="cv-preview-container',
      'class="cv-preview-container legacy-compatible'
    );
    
    // Add legacy template identifier
    fixedHtml = fixedHtml.replace(
      '<div class="cv-preview-container',
      `<div data-legacy-template="${templateId}" class="cv-preview-container`
    );
  }
  
  return fixedHtml;
}

console.warn('🔄 Template Compatibility Layer loaded');
