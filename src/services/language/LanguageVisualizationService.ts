/**
 * Language Visualization Service
 * Extracted from LanguageProficiency.tsx for better modularity
 * Handles data preparation for different visualization types
 */

import type { LanguageProficiency, VisualizationType } from '../../types/language';
import { LanguageAnalysisService } from './LanguageAnalysisService';

export interface VisualizationData {
  type: VisualizationType;
  data: unknown;
  config: {
    primaryColor: string;
    accentColor: string;
    showCertifications: boolean;
    showFlags: boolean;
    animateOnLoad: boolean;
  };
}

export class LanguageVisualizationService {
  private static readonly DEFAULT_CONFIG = {
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    showCertifications: true,
    showFlags: true,
    animateOnLoad: true
  };

  /**
   * Generate visualization data for circular view
   */
  static generateCircularData(proficiencies: LanguageProficiency[]): VisualizationData {
    const languages = proficiencies.map(p => ({
      name: p.language,
      level: p.level,
      score: p.score,
      color: LanguageAnalysisService.getLevelColor(p.level),
      flag: p.flag,
      certifications: p.certifications || [],
      verified: p.verified || false
    }));

    return {
      type: 'circular',
      data: { languages },
      config: this.DEFAULT_CONFIG
    };
  }

  /**
   * Generate visualization data for bar chart view
   */
  static generateBarData(proficiencies: LanguageProficiency[]): VisualizationData {
    const sortedLanguages = LanguageAnalysisService.sortLanguagesByImportance(proficiencies);
    
    const labels = sortedLanguages.map(p => p.language);
    const data = sortedLanguages.map(p => LanguageAnalysisService.getLevelScore(p.level));
    const backgroundColor = sortedLanguages.map(p => LanguageAnalysisService.getLevelColor(p.level));

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Language Proficiency',
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color + '80'), // Add transparency
          borderWidth: 2
        }]
      },
      config: this.DEFAULT_CONFIG
    };
  }

  /**
   * Generate visualization data for flags view
   */
  static generateFlagsData(proficiencies: LanguageProficiency[]): VisualizationData {
    const languages = proficiencies.map(p => ({
      name: p.language,
      level: p.level,
      flag: p.flag || this.getDefaultFlag(p.language),
      score: p.score,
      certifications: p.certifications || [],
      verified: p.verified || false,
      color: LanguageAnalysisService.getLevelColor(p.level)
    }));

    return {
      type: 'flags',
      data: { languages },
      config: this.DEFAULT_CONFIG
    };
  }

  /**
   * Generate visualization data for matrix view
   */
  static generateMatrixData(proficiencies: LanguageProficiency[]): VisualizationData {
    const skills = ['Speaking', 'Listening', 'Reading', 'Writing'];
    
    const languages = proficiencies.map(p => {
      const baseScore = LanguageAnalysisService.getLevelScore(p.level);
      
      // Generate skill breakdown based on level and context
      const skillScores = skills.reduce((acc, skill) => {
        let score = baseScore;
        
        // Adjust based on language contexts
        if (p.contexts) {
          if (skill === 'Speaking' && p.contexts.includes('business')) score += 5;
          if (skill === 'Writing' && p.contexts.includes('academic')) score += 5;
          if (skill === 'Listening' && p.contexts.includes('media')) score += 5;
        }
        
        // Add some variation to make it realistic
        score += Math.random() * 10 - 5;
        score = Math.max(0, Math.min(100, score));
        
        acc[skill] = score;
        return acc;
      }, {} as Record<string, number>);

      return {
        name: p.language,
        level: p.level,
        skills: skillScores,
        overall: baseScore,
        certifications: p.certifications || [],
        verified: p.verified || false
      };
    });

    return {
      type: 'matrix',
      data: { 
        languages,
        skills
      },
      config: this.DEFAULT_CONFIG
    };
  }

  /**
   * Generate visualization data for radar view
   */
  static generateRadarData(proficiencies: LanguageProficiency[]): VisualizationData {
    const categories = ['Speaking', 'Listening', 'Reading', 'Writing', 'Grammar', 'Vocabulary'];
    
    const datasets = proficiencies.slice(0, 5).map((p, index) => { // Limit to 5 languages for readability
      const baseScore = LanguageAnalysisService.getLevelScore(p.level);
      const color = LanguageAnalysisService.getLevelColor(p.level);
      
      const data = categories.map(() => {
        // Add variation to base score for each category
        return Math.max(0, Math.min(100, baseScore + (Math.random() * 20 - 10)));
      });

      return {
        label: p.language,
        data,
        borderColor: color,
        backgroundColor: color + '20', // Add transparency
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color
      };
    });

    return {
      type: 'radar',
      data: {
        labels: categories,
        datasets
      },
      config: this.DEFAULT_CONFIG
    };
  }

  /**
   * Generate all visualization types
   */
  static generateAllVisualizations(proficiencies: LanguageProficiency[]): VisualizationData[] {
    return [
      this.generateCircularData(proficiencies),
      this.generateBarData(proficiencies),
      this.generateFlagsData(proficiencies),
      this.generateMatrixData(proficiencies),
      this.generateRadarData(proficiencies)
    ];
  }

  /**
   * Get default flag for language
   */
  private static getDefaultFlag(language: string): string {
    const flagMap: Record<string, string> = {
      'English': '🇺🇸',
      'Spanish': '🇪🇸',
      'French': '🇫🇷',
      'German': '🇩🇪',
      'Italian': '🇮🇹',
      'Portuguese': '🇵🇹',
      'Russian': '🇷🇺',
      'Chinese': '🇨🇳',
      'Japanese': '🇯🇵',
      'Korean': '🇰🇷',
      'Arabic': '🇸🇦',
      'Hindi': '🇮🇳',
      'Dutch': '🇳🇱',
      'Swedish': '🇸🇪',
      'Norwegian': '🇳🇴',
      'Danish': '🇩🇰',
      'Finnish': '🇫🇮'
    };

    return flagMap[language] || '🌍';
  }

  /**
   * Get visualization configuration options
   */
  static getVisualizationOptions(): Array<{
    type: VisualizationType;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        type: 'circular',
        name: 'Circular Progress',
        description: 'Visual progress circles showing proficiency levels',
        icon: '○'
      },
      {
        type: 'bar',
        name: 'Bar Chart',
        description: 'Traditional bar chart comparison',
        icon: '▬'
      },
      {
        type: 'flags',
        name: 'Country Flags',
        description: 'Flag-based visual representation',
        icon: '🏳️'
      },
      {
        type: 'matrix',
        name: 'Skills Matrix',
        description: 'Detailed skill breakdown matrix',
        icon: '⊞'
      },
      {
        type: 'radar',
        name: 'Radar Chart',
        description: 'Multi-dimensional skill comparison',
        icon: '◈'
      }
    ];
  }
}