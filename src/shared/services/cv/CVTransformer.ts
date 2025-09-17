/**
 * CV Transformer Service
 * Handles CV transformations, improvements, and optimization applications
 */

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../lib/firebase';
import { LanguageProficiency } from '../../types/language';

// Define interfaces for CV data structures
interface ATSOptimizations {
  keywords?: string[];
  formatting?: Record<string, unknown>;
  sections?: Record<string, unknown>;
  recommendations?: string[];
}

interface SkillsUpdate {
  skills?: string[];
  categories?: Record<string, string[]>;
  proficiencyLevels?: Record<string, number>;
  endorsements?: Record<string, unknown>;
}

interface EndorserInfo {
  name?: string;
  company?: string;
  position?: string;
  relationship?: string;
  linkedinProfile?: string;
}

interface TimelineEventUpdates {
  title?: string;
  date?: string | Date;
  description?: string;
  company?: string;
  achievements?: string[];
  skills?: string[];
  type?: 'education' | 'experience' | 'certification' | 'project';
}

interface LanguageProficiencyUpdates {
  level?: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Basic';
  certifications?: string[];
  score?: number;
  yearsOfExperience?: number;
  contexts?: string[];
}

export class CVTransformer {
  /**
   * Apply ATS optimizations to CV
   */
  static async applyATSOptimizations(jobId: string, optimizations: ATSOptimizations) {
    const applyATSFunction = httpsCallable(functions, 'applyATSOptimizations');
    const result = await applyATSFunction({
      jobId,
      optimizations
    });
    return result.data;
  }

  /**
   * Apply selected improvements to CV
   */
  static async applyImprovements(
    jobId: string, 
    selectedRecommendationIds: string[], 
    targetRole?: string, 
    industryKeywords?: string[]
  ) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Use the callable function - CORS is handled automatically by Firebase v2 callable functions
    const applyImprovementsFunction = httpsCallable(functions, 'applyImprovements');
    const result = await applyImprovementsFunction({
      jobId,
      selectedRecommendationIds,
      targetRole,
      industryKeywords
    });
    return result.data;
  }

  /**
   * Update skills data
   */
  static async updateSkillsData(jobId: string, skillsUpdate: SkillsUpdate) {
    const updateSkillsFunction = httpsCallable(functions, 'updateSkillsData');
    const result = await updateSkillsFunction({
      jobId,
      skillsUpdate
    });
    return result.data;
  }

  /**
   * Endorse a skill
   */
  static async endorseSkill(jobId: string, skillName: string, endorserInfo?: EndorserInfo) {
    const endorseFunction = httpsCallable(functions, 'endorseSkill');
    const result = await endorseFunction({
      jobId,
      skillName,
      endorserInfo
    });
    return result.data;
  }

  /**
   * Update timeline event
   */
  static async updateTimelineEvent(jobId: string, eventId: string, updates: TimelineEventUpdates) {
    const updateFunction = httpsCallable(functions, 'updateTimelineEvent');
    const result = await updateFunction({
      jobId,
      eventId,
      updates
    });
    return result.data;
  }

  /**
   * Export timeline in various formats
   */
  static async exportTimeline(jobId: string, format: 'json' | 'csv' | 'html' = 'json') {
    const exportFunction = httpsCallable(functions, 'exportTimeline');
    const result = await exportFunction({
      jobId,
      format
    });
    return result.data;
  }

  /**
   * Update language proficiency
   */
  static async updateLanguageProficiency(jobId: string, languageId: string, updates: LanguageProficiencyUpdates) {
    const updateFunction = httpsCallable(functions, 'updateLanguageProficiency');
    const result = await updateFunction({ jobId, languageId, updates });
    return result.data;
  }

  /**
   * Add language proficiency
   */
  static async addLanguageProficiency(jobId: string, language: LanguageProficiency) {
    const addFunction = httpsCallable(functions, 'addLanguageProficiency');
    const result = await addFunction({ jobId, language });
    return result.data;
  }

  /**
   * Remove language proficiency
   */
  static async removeLanguageProficiency(jobId: string, languageId: string) {
    const removeFunction = httpsCallable(functions, 'removeLanguageProficiency');
    const result = await removeFunction({ jobId, languageId });
    return result.data;
  }
}