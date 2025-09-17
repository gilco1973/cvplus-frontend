/**
 * CV Service (Legacy Compatibility)
 * Main entry point for CV operations - now delegates to modular services
 * Maintained for backward compatibility with existing imports
 */

// Core CV operations
export {
  CVServiceCore,
  CVUploadResponse,
  createJob,
  createDevelopmentJob,
  uploadCV,
  processCV,
  subscribeToJob,
  getJob,
  generateCV,
  getTemplates,
  analyzeCV,
  enhancedAnalyzeCV,
  getRecommendations,
  previewImprovement,
  applyImprovements,
  analyzeATSCompatibility,
  applyATSOptimizations,
  generateATSKeywords,
  updateJobFeatures
} from './cv';

// Feature services - comprehensive exports
export { MediaService } from './features/MediaService';
export { VisualizationService } from './features/VisualizationService';
export { IntegrationService } from './features/IntegrationService';
export { ProfileService } from './features/ProfileService';
export { MagicTransformService } from './features/MagicTransformService';

// Legacy individual function exports for backward compatibility
import { MediaService } from './features/MediaService';
import { VisualizationService } from './features/VisualizationService';
import { IntegrationService } from './features/IntegrationService';
import { ProfileService } from './features/ProfileService';

// Legacy podcast function
export const generatePodcast = (jobId: string, config: unknown) => 
  MediaService.generateEnhancedPodcast(jobId, config.style || 'professional');

// Media functions
export const generateVideoIntroduction = MediaService.generateVideoIntroduction;
export const regenerateVideoIntroduction = MediaService.regenerateVideoIntroduction;
export const generateEnhancedPodcast = MediaService.generateEnhancedPodcast;
export const regeneratePodcast = MediaService.regeneratePodcast;
export const getPodcastStatus = MediaService.getPodcastStatus;
export const generateAudioFromText = MediaService.generateAudioFromText;
export const getMediaStatus = MediaService.getMediaStatus;
export const downloadMediaContent = MediaService.downloadMediaContent;

// Visualization functions
export const generateTimeline = VisualizationService.generateTimeline;
export const generateSkillsVisualization = VisualizationService.generateSkillsVisualization;
export const getSkillsInsights = VisualizationService.getSkillsInsights;
export const generateLanguageVisualization = VisualizationService.generateLanguageVisualization;
export const generateLanguageCertificate = VisualizationService.generateLanguageCertificate;
export const generatePersonalityInsights = VisualizationService.generatePersonalityInsights;
export const comparePersonalities = VisualizationService.comparePersonalities;
export const getPersonalityInsightsSummary = VisualizationService.getPersonalityInsightsSummary;
export const generateTestimonialsCarousel = VisualizationService.generateTestimonialsCarousel;
export const addTestimonial = VisualizationService.addTestimonial;
export const updateTestimonial = VisualizationService.updateTestimonial;
export const removeTestimonial = VisualizationService.removeTestimonial;
export const updateCarouselLayout = VisualizationService.updateCarouselLayout;

// Integration functions
export const generateCalendarEvents = IntegrationService.generateCalendarEvents;
export const syncToGoogleCalendar = IntegrationService.syncToGoogleCalendar;
export const syncToOutlook = IntegrationService.syncToOutlook;
export const downloadICalFile = IntegrationService.downloadICalFile;
export const handleCalendarCallback = IntegrationService.handleCalendarCallback;
export const generatePortfolioGallery = IntegrationService.generatePortfolioGallery;
export const updatePortfolioItem = IntegrationService.updatePortfolioItem;
export const addPortfolioItem = IntegrationService.addPortfolioItem;
export const deletePortfolioItem = IntegrationService.deletePortfolioItem;
export const uploadPortfolioMedia = IntegrationService.uploadPortfolioMedia;
export const generateShareablePortfolio = IntegrationService.generateShareablePortfolio;
export const generateQRCode = IntegrationService.generateQRCode;
export const trackQRCodeScan = IntegrationService.trackQRCodeScan;
export const getQRCodes = IntegrationService.getQRCodes;
export const updateQRCode = IntegrationService.updateQRCode;
export const deleteQRCode = IntegrationService.deleteQRCode;
export const getQRAnalytics = IntegrationService.getQRAnalytics;
export const getQRTemplates = IntegrationService.getQRTemplates;
export const generateSocialMediaIntegration = IntegrationService.generateSocialMediaIntegration;
export const addSocialProfile = IntegrationService.addSocialProfile;
export const updateSocialProfile = IntegrationService.updateSocialProfile;
export const removeSocialProfile = IntegrationService.removeSocialProfile;
export const trackSocialClick = IntegrationService.trackSocialClick;
export const getSocialAnalytics = IntegrationService.getSocialAnalytics;
export const updateSocialDisplaySettings = IntegrationService.updateSocialDisplaySettings;

// Profile functions
export const createPublicProfile = ProfileService.createPublicProfile;
export const getPublicProfile = ProfileService.getPublicProfile;
export const updatePublicProfileSettings = ProfileService.updatePublicProfileSettings;
export const submitContactForm = ProfileService.submitContactForm;
export const trackQRScan = ProfileService.trackQRScan;
export const initializeRAG = ProfileService.initializeRAG;
export const startChatSession = ProfileService.startChatSession;
export const sendChatMessage = ProfileService.sendChatMessage;
export const endChatSession = ProfileService.endChatSession;
export const getChatAnalytics = ProfileService.getChatAnalytics;

// CV Transformer functions
import { CVTransformer } from './cv/CVTransformer';
export const updateSkillsData = CVTransformer.updateSkillsData;
export const endorseSkill = CVTransformer.endorseSkill;
export const updateTimelineEvent = CVTransformer.updateTimelineEvent;
export const exportTimeline = CVTransformer.exportTimeline;
export const updateLanguageProficiency = CVTransformer.updateLanguageProficiency;
export const addLanguageProficiency = CVTransformer.addLanguageProficiency;
export const removeLanguageProficiency = CVTransformer.removeLanguageProficiency;

// CV Analyzer functions - lazy loaded for better bundle splitting
export { analyzeAchievements, generateAchievementShowcase } from './lazyAnalyzer';

// Types
export type { Job } from '../types/cv';

// Upload function compatible with CVUpload component - override the legacy one
export const uploadCV = async (
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<CVUploadResponse> => {
  return CVServiceCore.uploadCVWithProgress(formData, onProgress);
};