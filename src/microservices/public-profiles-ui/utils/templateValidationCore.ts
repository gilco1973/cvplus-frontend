// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts/types/template.types';
import { PublicProfileData } from '../../types/profile.types';
import { BrandingSettings } from '../types/creator.types';

export class TemplateValidationCore {
  /**
   * Validate template compatibility with profile data
    */
  static validateTemplateWithProfile(
    template: TemplateDefinition,
    profileData: Partial<PublicProfileData>
  ): TemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFields: string[] = [];
    const recommendations: string[] = [];

    // Check required fields
    const requiredFields = this.getRequiredFieldsForTemplate(template);
    requiredFields.forEach(field => {
      if (!this.hasProfileField(profileData, field)) {
        missingFields.push(field);
        errors.push(`Required field "${field}" is missing for ${template.name} template`);
      }
    });

    // Check optimal fields
    const optimalFields = this.getOptimalFieldsForTemplate(template);
    optimalFields.forEach(field => {
      if (!this.hasProfileField(profileData, field)) {
        warnings.push(`Field "${field}" would enhance the ${template.name} template`);
        recommendations.push(`Consider adding ${field} to improve template appearance`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingFields,
      recommendations,
    };
  }

  /**
   * Get required fields for a template
    */
  private static getRequiredFieldsForTemplate(template: TemplateDefinition): string[] {
    const baseRequired = ['name', 'title'];

    switch (template.category) {
      case 'creative':
        return [...baseRequired, 'portfolio', 'profileImage'];
      case 'tech':
        return [...baseRequired, 'skills', 'experience'];
      case 'executive':
        return [...baseRequired, 'experience', 'summary'];
      case 'minimal':
        return [...baseRequired, 'summary'];
      default:
        return baseRequired;
    }
  }

  /**
   * Get optimal fields for better template appearance
    */
  private static getOptimalFieldsForTemplate(template: TemplateDefinition): string[] {
    const baseOptimal = ['summary', 'profileImage', 'skills'];

    switch (template.category) {
      case 'creative':
        return [...baseOptimal, 'portfolio', 'socialLinks'];
      case 'tech':
        return [...baseOptimal, 'portfolio', 'certifications'];
      case 'executive':
        return [...baseOptimal, 'testimonials', 'certifications'];
      case 'minimal':
        return [...baseOptimal, 'experience'];
      default:
        return baseOptimal;
    }
  }

  /**
   * Check if profile has a specific field with content
    */
  private static hasProfileField(profileData: Partial<PublicProfileData>, field: string): boolean {
    const value = profileData[field as keyof PublicProfileData];

    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;

    return true;
  }
}