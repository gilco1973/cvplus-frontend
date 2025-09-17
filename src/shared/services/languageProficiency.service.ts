/**
 * Language Proficiency Frontend Service
 * Handles frontend operations for language proficiency management
 */

import { LanguageProficiency, LanguageVisualization } from '../types/language';

export class LanguageProficiencyService {
  private static instance: LanguageProficiencyService;
  private baseUrl = '/api/language-proficiency';

  static getInstance(): LanguageProficiencyService {
    if (!LanguageProficiencyService.instance) {
      LanguageProficiencyService.instance = new LanguageProficiencyService();
    }
    return LanguageProficiencyService.instance;
  }

  /**
   * Generate language visualization from CV data
   */
  async generateVisualization(jobId: string): Promise<LanguageVisualization> {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate visualization: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating language visualization:', error);
      throw error;
    }
  }

  /**
   * Add a new language to the profile
   */
  async addLanguage(
    jobId: string, 
    language: Partial<LanguageProficiency>
  ): Promise<LanguageProficiency> {
    try {
      const response = await fetch(`${this.baseUrl}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, language })
      });

      if (!response.ok) {
        throw new Error(`Failed to add language: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding language:', error);
      throw error;
    }
  }

  /**
   * Update an existing language
   */
  async updateLanguage(
    jobId: string,
    languageId: string,
    updates: Partial<LanguageProficiency>
  ): Promise<LanguageProficiency> {
    try {
      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, languageId, updates })
      });

      if (!response.ok) {
        throw new Error(`Failed to update language: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  }

  /**
   * Delete a language from the profile
   */
  async deleteLanguage(
    jobId: string,
    languageId: string
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId, languageId })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete language: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    }
  }

  /**
   * Get language visualization data
   */
  async getVisualization(jobId: string): Promise<LanguageVisualization | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${jobId}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No visualization found
        }
        throw new Error(`Failed to get visualization: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting language visualization:', error);
      throw error;
    }
  }

  /**
   * Validate language proficiency data
   */
  validateLanguage(language: Partial<LanguageProficiency>): string[] {
    const errors: string[] = [];

    if (!language.name || language.name.trim().length === 0) {
      errors.push('Language name is required');
    }

    if (!language.proficiency) {
      errors.push('Proficiency level is required');
    } else {
      const validProficiencies = ['elementary', 'limited', 'professional', 'fluent', 'native'];
      if (!validProficiencies.includes(language.proficiency)) {
        errors.push('Invalid proficiency level');
      }
    }

    if (language.yearsOfExperience !== undefined && language.yearsOfExperience < 0) {
      errors.push('Years of experience cannot be negative');
    }

    return errors;
  }

  /**
   * Get proficiency level color
   */
  getProficiencyColor(proficiency: LanguageProficiency['proficiency']): string {
    const colors = {
      native: '#10B981',
      fluent: '#3B82F6',
      professional: '#8B5CF6',
      limited: '#F59E0B',
      elementary: '#6B7280'
    };
    return colors[proficiency] || '#6B7280';
  }

  /**
   * Get proficiency level score
   */
  getProficiencyScore(proficiency: LanguageProficiency['proficiency']): number {
    const scores = {
      native: 100,
      fluent: 90,
      professional: 70,
      limited: 50,
      elementary: 30
    };
    return scores[proficiency] || 50;
  }

  /**
   * Format proficiency level for display
   */
  formatProficiencyLevel(proficiency: LanguageProficiency['proficiency']): string {
    const labels = {
      native: 'Native',
      fluent: 'Fluent',
      professional: 'Professional Working',
      limited: 'Limited Working',
      elementary: 'Elementary'
    };
    return labels[proficiency] || 'Unknown';
  }

  /**
   * Get country flag emoji from language name
   */
  getLanguageFlag(languageName: string): string {
    const languageFlags: Record<string, string> = {
      'English': '🇬🇧',
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
      'Polish': '🇵🇱',
      'Turkish': '🇹🇷',
      'Hebrew': '🇮🇱',
      'Greek': '🇬🇷',
      'Danish': '🇩🇰',
      'Norwegian': '🇳🇴',
      'Finnish': '🇫🇮',
      'Czech': '🇨🇿',
      'Hungarian': '🇭🇺',
      'Romanian': '🇷🇴',
      'Vietnamese': '🇻🇳',
      'Thai': '🇹🇭',
      'Indonesian': '🇮🇩',
      'Malay': '🇲🇾',
      'Filipino': '🇵🇭',
      'Ukrainian': '🇺🇦'
    };
    return languageFlags[languageName] || '🌍';
  }
}

export default LanguageProficiencyService.getInstance();