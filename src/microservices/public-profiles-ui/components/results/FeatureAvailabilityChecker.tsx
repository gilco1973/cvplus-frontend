/**
 * Feature Availability Checker Component
 */

import type { Job } from '../../services/cvService';
import type { FeatureAvailability } from '../../types/results';

export const useFeatureAvailability = (job: Job | null): FeatureAvailability => {
  if (!job?.parsedData) return {};
  
  const data = job.parsedData;
  return {
    languageProficiency: {
      available: !!(data.languages && Array.isArray(data.languages) && data.languages.length > 0),
      reason: !data.languages || !Array.isArray(data.languages) || data.languages.length === 0 
        ? "No languages found in your CV" 
        : null
    },
    certificationBadges: {
      available: !!(data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0),
      reason: !data.certifications || !Array.isArray(data.certifications) || data.certifications.length === 0
        ? "No certifications found in your CV"
        : null
    },
    achievementsShowcase: {
      available: !!(data.achievements && Array.isArray(data.achievements) && data.achievements.length > 0) ||
                !!(data.experience && Array.isArray(data.experience) && data.experience.some((exp: unknown) => exp.achievements && exp.achievements.length > 0)),
      reason: (!data.achievements || !Array.isArray(data.achievements) || data.achievements.length === 0) &&
              (!data.experience || !Array.isArray(data.experience) || !data.experience.some((exp: unknown) => exp.achievements && exp.achievements.length > 0))
        ? "No achievements found in your CV"
        : null
    },
    skillsChart: {
      available: !!(data.skills && ((Array.isArray(data.skills) && data.skills.length > 0) || 
                   (typeof data.skills === 'object' && Object.keys(data.skills).length > 0))),
      reason: !data.skills || (Array.isArray(data.skills) && data.skills.length === 0) || 
              (typeof data.skills === 'object' && Object.keys(data.skills).length === 0)
        ? "No skills found in your CV"
        : null
    },
    portfolioGallery: {
      available: !!(data.projects && Array.isArray(data.projects) && data.projects.length > 0) ||
                !!(data.portfolio && Array.isArray(data.portfolio) && data.portfolio.length > 0),
      reason: (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) &&
              (!data.portfolio || !Array.isArray(data.portfolio) || data.portfolio.length === 0)
        ? "No projects or portfolio items found in your CV"
        : null
    },
    interactiveTimeline: {
      available: !!(data.experience && Array.isArray(data.experience) && data.experience.length > 0),
      reason: !data.experience || !Array.isArray(data.experience) || data.experience.length === 0
        ? "No work experience found for timeline"
        : null
    },
    testimonialsCarousel: {
      available: !!(data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) ||
                !!(data.references && Array.isArray(data.references) && data.references.length > 0),
      reason: (!data.testimonials || !Array.isArray(data.testimonials) || data.testimonials.length === 0) &&
              (!data.references || !Array.isArray(data.references) || data.references.length === 0)
        ? "No testimonials or references found in your CV"
        : null
    }
  };
};