/**
 * Language Proficiency Hook
 * React hook for managing language proficiency state and operations
 */

import { useState, useEffect } from 'react';
import { LanguageProficiency, LanguageVisualization } from '../types/language';
import LanguageProficiencyService from '../services/languageProficiency.service';

export interface UseLanguageProficiencyOptions {
  jobId?: string;
  autoGenerate?: boolean;
  onError?: (error: Error) => void;
}

export interface UseLanguageProficiencyReturn {
  visualization: LanguageVisualization | null;
  languages: LanguageProficiency[];
  isLoading: boolean;
  isGenerating: boolean;
  error: Error | null;
  generateVisualization: () => Promise<void>;
  addLanguage: (language: Partial<LanguageProficiency>) => Promise<void>;
  updateLanguage: (id: string, updates: Partial<LanguageProficiency>) => Promise<void>;
  deleteLanguage: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useLanguageProficiency = ({
  jobId,
  autoGenerate = false,
  onError
}: UseLanguageProficiencyOptions = {}): UseLanguageProficiencyReturn => {
  const [visualization, setVisualization] = useState<LanguageVisualization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = LanguageProficiencyService;

  // Derived state
  const languages = visualization?.proficiencies || [];

  const handleError = (err: Error) => {
    setError(err);
    onError?.(err);
    console.error('Language Proficiency Error:', err);
  };

  const clearError = () => {
    setError(null);
  };

  /**
   * Load existing visualization
   */
  const loadVisualization = async (jobIdToLoad: string) => {
    setIsLoading(true);
    clearError();

    try {
      const data = await service.getVisualization(jobIdToLoad);
      setVisualization(data);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate new visualization
   */
  const generateVisualization = async () => {
    if (!jobId) {
      handleError(new Error('Job ID is required to generate visualization'));
      return;
    }

    setIsGenerating(true);
    clearError();

    try {
      const data = await service.generateVisualization(jobId);
      setVisualization(data);
    } catch (err) {
      handleError(err as Error);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Add a new language
   */
  const addLanguage = async (language: Partial<LanguageProficiency>) => {
    if (!jobId) {
      handleError(new Error('Job ID is required to add language'));
      return;
    }

    // Validate language data
    const validationErrors = service.validateLanguage(language);
    if (validationErrors.length > 0) {
      handleError(new Error(`Validation failed: ${validationErrors.join(', ')}`));
      return;
    }

    clearError();

    try {
      // Add flag if not provided
      const languageWithFlag = {
        ...language,
        flag: language.flag || service.getLanguageFlag(language.name || ''),
        score: language.score || service.getProficiencyScore(language.proficiency || 'elementary')
      };

      const newLanguage = await service.addLanguage(jobId, languageWithFlag);
      
      // Update local state
      setVisualization(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          proficiencies: [...prev.proficiencies, newLanguage],
          insights: {
            ...prev.insights,
            totalLanguages: prev.insights.totalLanguages + 1
          },
          metadata: {
            ...prev.metadata,
            lastUpdated: new Date()
          }
        };
      });
    } catch (err) {
      handleError(err as Error);
    }
  };

  /**
   * Update an existing language
   */
  const updateLanguage = async (id: string, updates: Partial<LanguageProficiency>) => {
    if (!jobId) {
      handleError(new Error('Job ID is required to update language'));
      return;
    }

    clearError();

    try {
      const updatedLanguage = await service.updateLanguage(jobId, id, updates);
      
      // Update local state
      setVisualization(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          proficiencies: prev.proficiencies.map(lang => 
            lang.name === id ? updatedLanguage : lang
          ),
          metadata: {
            ...prev.metadata,
            lastUpdated: new Date()
          }
        };
      });
    } catch (err) {
      handleError(err as Error);
    }
  };

  /**
   * Delete a language
   */
  const deleteLanguage = async (id: string) => {
    if (!jobId) {
      handleError(new Error('Job ID is required to delete language'));
      return;
    }

    clearError();

    try {
      await service.deleteLanguage(jobId, id);
      
      // Update local state
      setVisualization(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          proficiencies: prev.proficiencies.filter(lang => lang.name !== id),
          insights: {
            ...prev.insights,
            totalLanguages: prev.insights.totalLanguages - 1
          },
          metadata: {
            ...prev.metadata,
            lastUpdated: new Date()
          }
        };
      });
    } catch (err) {
      handleError(err as Error);
    }
  };

  /**
   * Refresh data
   */
  const refresh = async () => {
    if (jobId) {
      await loadVisualization(jobId);
    }
  };

  // Load data on mount and when jobId changes
  useEffect(() => {
    if (jobId) {
      loadVisualization(jobId);
    }
  }, [jobId]);

  // Auto-generate if requested and no data exists
  useEffect(() => {
    if (jobId && autoGenerate && !visualization && !isLoading && !isGenerating) {
      generateVisualization();
    }
  }, [jobId, autoGenerate, visualization, isLoading, isGenerating]);

  return {
    visualization,
    languages,
    isLoading,
    isGenerating,
    error,
    generateVisualization,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    refresh
  };
};