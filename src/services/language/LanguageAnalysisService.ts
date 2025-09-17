/**
 * Language Analysis Service
 * Extracted from LanguageProficiency.tsx for better modularity
 * Handles language proficiency calculations and analysis
 */

import type { LanguageProficiency, LanguageVisualization, LanguageLevel } from '../../types/language';

export class LanguageAnalysisService {
  private static readonly LEVEL_SCORES = {
    'Native': 100,
    'Fluent': 90,
    'Professional': 75,
    'Conversational': 60,
    'Basic': 40
  };

  private static readonly LEVEL_COLORS = {
    'Native': '#10B981',
    'Fluent': '#3B82F6',
    'Professional': '#8B5CF6',
    'Conversational': '#F59E0B',
    'Basic': '#6B7280'
  };

  /**
   * Analyze language proficiencies and generate insights
   */
  static analyzeLanguages(proficiencies: LanguageProficiency[]): LanguageVisualization['insights'] {
    const totalLanguages = proficiencies.length;
    const fluentLanguages = proficiencies.filter(p => 
      p.level === 'Native' || p.level === 'Fluent'
    ).length;

    const businessReady = proficiencies
      .filter(p => this.LEVEL_SCORES[p.level] >= 75)
      .map(p => p.language);

    const certifiedLanguages = proficiencies
      .filter(p => p.certifications && p.certifications.length > 0)
      .map(p => p.language);

    const recommendations = this.generateRecommendations(proficiencies);

    return {
      totalLanguages,
      fluentLanguages,
      businessReady,
      certifiedLanguages,
      recommendations
    };
  }

  /**
   * Generate improvement recommendations
   */
  private static generateRecommendations(proficiencies: LanguageProficiency[]): string[] {
    const recommendations: string[] = [];

    // Check for languages that could benefit from certification
    const uncertifiedProfessional = proficiencies.filter(p => 
      (p.level === 'Professional' || p.level === 'Fluent') && 
      (!p.certifications || p.certifications.length === 0)
    );

    if (uncertifiedProfessional.length > 0) {
      recommendations.push(
        `Consider getting certified in ${uncertifiedProfessional[0].language} to strengthen your professional profile`
      );
    }

    // Check for basic level languages that could be improved
    const basicLanguages = proficiencies.filter(p => p.level === 'Basic');
    if (basicLanguages.length > 0) {
      recommendations.push(
        `Improve your ${basicLanguages[0].language} skills to at least conversational level for better opportunities`
      );
    }

    // Check for missing business languages
    const hasBusinessLanguage = proficiencies.some(p => 
      ['English', 'Mandarin', 'Spanish'].includes(p.language) && 
      this.LEVEL_SCORES[p.level] >= 75
    );

    if (!hasBusinessLanguage) {
      recommendations.push(
        'Consider learning a major business language like English, Mandarin, or Spanish'
      );
    }

    // Check for regional language opportunities
    if (proficiencies.length < 3) {
      recommendations.push(
        'Learning additional languages can significantly boost your international career prospects'
      );
    }

    return recommendations.slice(0, 3); // Return top 3 recommendations
  }

  /**
   * Calculate overall language competency score
   */
  static calculateOverallScore(proficiencies: LanguageProficiency[]): number {
    if (proficiencies.length === 0) return 0;

    const totalScore = proficiencies.reduce((sum, p) => sum + this.LEVEL_SCORES[p.level], 0);
    const averageScore = totalScore / proficiencies.length;

    // Bonus for multiple languages
    const languageBonus = Math.min(proficiencies.length * 2, 10);
    
    // Bonus for certifications
    const certificationBonus = proficiencies.filter(p => p.certifications?.length).length * 3;

    return Math.min(averageScore + languageBonus + certificationBonus, 100);
  }

  /**
   * Get color for language level
   */
  static getLevelColor(level: LanguageLevel): string {
    return this.LEVEL_COLORS[level];
  }

  /**
   * Get score for language level
   */
  static getLevelScore(level: LanguageLevel): number {
    return this.LEVEL_SCORES[level];
  }

  /**
   * Validate language proficiency data
   */
  static validateLanguageProficiency(proficiency: Partial<LanguageProficiency>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!proficiency.language?.trim()) {
      errors.push('Language name is required');
    }

    if (!proficiency.level) {
      errors.push('Proficiency level is required');
    } else if (!Object.keys(this.LEVEL_SCORES).includes(proficiency.level)) {
      errors.push('Invalid proficiency level');
    }

    if (proficiency.score !== undefined && (proficiency.score < 0 || proficiency.score > 100)) {
      errors.push('Score must be between 0 and 100');
    }

    if (proficiency.yearsOfExperience !== undefined && proficiency.yearsOfExperience < 0) {
      errors.push('Years of experience cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sort languages by proficiency and importance
   */
  static sortLanguagesByImportance(proficiencies: LanguageProficiency[]): LanguageProficiency[] {
    const businessLanguages = ['English', 'Mandarin', 'Spanish', 'Arabic', 'French'];
    
    return proficiencies.sort((a, b) => {
      // First sort by business language importance
      const aIsBusiness = businessLanguages.includes(a.language);
      const bIsBusiness = businessLanguages.includes(b.language);
      
      if (aIsBusiness && !bIsBusiness) return -1;
      if (!aIsBusiness && bIsBusiness) return 1;

      // Then sort by proficiency level
      const aScore = this.LEVEL_SCORES[a.level];
      const bScore = this.LEVEL_SCORES[b.level];
      
      if (aScore !== bScore) return bScore - aScore;

      // Finally sort by certification status
      const aCertified = (a.certifications?.length || 0) > 0;
      const bCertified = (b.certifications?.length || 0) > 0;
      
      if (aCertified && !bCertified) return -1;
      if (!aCertified && bCertified) return 1;

      return a.language.localeCompare(b.language);
    });
  }
}