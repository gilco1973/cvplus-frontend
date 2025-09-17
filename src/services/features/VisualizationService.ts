/**
 * Visualization Service
 * Handles timeline, skills, language visualizations, and insights
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

export class VisualizationService {
  /**
   * Generate timeline visualization
   */
  static async generateTimeline(jobId: string) {
    const timelineFunction = httpsCallable(functions, 'generateTimeline');
    const result = await timelineFunction({ jobId });
    return result.data;
  }

  /**
   * Generate skills visualization
   */
  static async generateSkillsVisualization(jobId: string) {
    const skillsVizFunction = httpsCallable(functions, 'generateSkillsVisualization');
    const result = await skillsVizFunction({ jobId });
    return result.data;
  }

  /**
   * Get skills insights
   */
  static async getSkillsInsights(jobId: string, targetRole?: string, industry?: string) {
    const insightsFunction = httpsCallable(functions, 'getSkillsInsights');
    const result = await insightsFunction({
      jobId,
      targetRole,
      industry
    });
    return result.data;
  }

  /**
   * Generate language visualization
   */
  static async generateLanguageVisualization(jobId: string) {
    const generateFunction = httpsCallable(functions, 'generateLanguageVisualization');
    const result = await generateFunction({ jobId });
    return result.data;
  }

  /**
   * Generate language certificate
   */
  static async generateLanguageCertificate(jobId: string, languageId: string) {
    const certFunction = httpsCallable(functions, 'generateLanguageCertificate');
    const result = await certFunction({ jobId, languageId });
    return result.data;
  }

  /**
   * Generate personality insights
   */
  static async generatePersonalityInsights(jobId: string) {
    const personalityFunction = httpsCallable(functions, 'generatePersonalityInsights');
    const result = await personalityFunction({ jobId });
    return result.data;
  }

  /**
   * Compare personalities across multiple jobs
   */
  static async comparePersonalities(jobIds: string[]) {
    const compareFunction = httpsCallable(functions, 'comparePersonalities');
    const result = await compareFunction({ jobIds });
    return result.data;
  }

  /**
   * Get personality insights summary
   */
  static async getPersonalityInsightsSummary(jobId: string) {
    const summaryFunction = httpsCallable(functions, 'getPersonalityInsightsSummary');
    const result = await summaryFunction({ jobId });
    return result.data;
  }

  /**
   * Generate testimonials carousel
   */
  static async generateTestimonialsCarousel(jobId: string) {
    const generateFunction = httpsCallable(functions, 'generateTestimonialsCarousel');
    const result = await generateFunction({ jobId });
    return result.data;
  }

  /**
   * Add testimonial
   */
  static async addTestimonial(jobId: string, testimonial: unknown) {
    const addFunction = httpsCallable(functions, 'addTestimonial');
    const result = await addFunction({ jobId, testimonial });
    return result.data;
  }

  /**
   * Update testimonial
   */
  static async updateTestimonial(jobId: string, testimonialId: string, updates: unknown) {
    const updateFunction = httpsCallable(functions, 'updateTestimonial');
    const result = await updateFunction({ jobId, testimonialId, updates });
    return result.data;
  }

  /**
   * Remove testimonial
   */
  static async removeTestimonial(jobId: string, testimonialId: string) {
    const removeFunction = httpsCallable(functions, 'removeTestimonial');
    const result = await removeFunction({ jobId, testimonialId });
    return result.data;
  }

  /**
   * Update carousel layout
   */
  static async updateCarouselLayout(jobId: string, layoutOptions: unknown) {
    const updateFunction = httpsCallable(functions, 'updateCarouselLayout');
    const result = await updateFunction({ jobId, layoutOptions });
    return result.data;
  }
}