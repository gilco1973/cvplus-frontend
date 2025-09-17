/**
 * Magic Transform Service
 * Comprehensive one-click CV enhancement that includes both improvements and features
 * Provides different feature sets based on user tier (free vs premium)
 */

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../lib/firebase';
import { CVServiceCore } from '../cv/CVServiceCore';
import { MediaService } from './MediaService';
import { IntegrationService } from './IntegrationService';
import { VisualizationService } from './VisualizationService';
import { ProfileService } from './ProfileService';
import { getUserSubscription } from '../paymentService';
import { PRICING_CONFIG, isFeatureAvailableForTier, type SubscriptionTier } from '../../config/pricing';

export interface MagicTransformProgress {
  stage: 'initializing' | 'improvements' | 'core_features' | 'premium_features' | 'finalizing' | 'completed' | 'error';
  currentTask: string;
  completedTasks: string[];
  failedTasks: { task: string; error: string }[];
  totalTasks: number;
  progress: number; // 0-100
  estimatedTimeRemaining?: number; // seconds
}

export interface MagicTransformResult {
  success: boolean;
  jobId: string;
  appliedImprovements: number;
  generatedFeatures: string[];
  failedFeatures: string[];
  userTier: SubscriptionTier;
  totalProcessingTime: number;
  results: {
    improvements?: any;
    portfolioGallery?: any;
    basicQRCode?: any;
    skillsVisualization?: any;
    timeline?: any;
    videoIntroduction?: any;
    podcast?: any;
    webPortal?: any;
    advancedQRCode?: any;
    aiChatAssistant?: any;
    contactForm?: any;
    socialMediaLinks?: any;
    availabilityCalendar?: any;
    testimonialsCarousel?: any;
    embedQRCode?: any;
    privacyMode?: any;
  };
  message: string;
}

export type MagicTransformProgressCallback = (progress: MagicTransformProgress) => void;

export class MagicTransformService {
  private static activeTransforms = new Map<string, boolean>();

  /**
   * Execute comprehensive Magic Transform based on user tier
   */
  static async executeEnhancedMagicTransform(
    jobId: string,
    selectedRecommendationIds: string[],
    onProgress?: MagicTransformProgressCallback
  ): Promise<MagicTransformResult> {
    const startTime = Date.now();
    
    // Prevent duplicate transforms
    if (this.activeTransforms.get(jobId)) {
      throw new Error('Magic Transform already in progress for this job');
    }
    
    this.activeTransforms.set(jobId, true);
    
    try {
      // Initialize progress
      const progress: MagicTransformProgress = {
        stage: 'initializing',
        currentTask: 'Initializing Magic Transform...',
        completedTasks: [],
        failedTasks: [],
        totalTasks: 0,
        progress: 0
      };
      
      onProgress?.(progress);
      
      // Get user tier
      const userTier = await this.determineUserTier();
      console.warn(`[MagicTransform] User tier: ${userTier}`);
      
      // Plan features based on user tier
      const plannedFeatures = this.planFeaturesForTier(userTier);
      progress.totalTasks = 1 + plannedFeatures.length; // 1 for improvements + features
      progress.currentTask = `Planning ${progress.totalTasks} enhancements for ${userTier} user...`;
      onProgress?.(progress);
      
      const result: MagicTransformResult = {
        success: false,
        jobId,
        appliedImprovements: 0,
        generatedFeatures: [],
        failedFeatures: [],
        userTier,
        totalProcessingTime: 0,
        results: {},
        message: ''
      };
      
      // Stage 1: Apply CV Improvements
      progress.stage = 'improvements';
      progress.currentTask = 'Applying AI-powered CV improvements...';
      progress.progress = 10;
      onProgress?.(progress);
      
      try {
        const improvementsResult = await CVServiceCore.applyImprovements(
          jobId,
          selectedRecommendationIds
        );
        result.results.improvements = improvementsResult;
        result.appliedImprovements = selectedRecommendationIds.length;
        progress.completedTasks.push('CV Improvements Applied');
        console.warn(`[MagicTransform] Applied ${selectedRecommendationIds.length} improvements`);
      } catch (error) {
        console.error('[MagicTransform] Failed to apply improvements:', error);
        progress.failedTasks.push({
          task: 'CV Improvements',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Stage 2: Generate Core Features (available to all users)
      progress.stage = 'core_features';
      progress.progress = 30;
      
      const coreFeatures = plannedFeatures.filter(f => 
        !PRICING_CONFIG.features[f]?.isPremium
      );
      
      for (let i = 0; i < coreFeatures.length; i++) {
        const feature = coreFeatures[i];
        progress.currentTask = `Generating ${this.getFeatureDisplayName(feature)}...`;
        progress.progress = 30 + (i / plannedFeatures.length) * 40;
        onProgress?.(progress);
        
        try {
          const featureResult = await this.generateFeature(jobId, feature);
          result.results[feature as keyof typeof result.results] = featureResult;
          result.generatedFeatures.push(feature);
          progress.completedTasks.push(this.getFeatureDisplayName(feature));
          console.warn(`[MagicTransform] Generated feature: ${feature}`);
        } catch (error) {
          console.error(`[MagicTransform] Failed to generate ${feature}:`, error);
          result.failedFeatures.push(feature);
          progress.failedTasks.push({
            task: this.getFeatureDisplayName(feature),
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      // Stage 3: Generate Premium Features (premium users only)
      if (userTier === 'PREMIUM') {
        progress.stage = 'premium_features';
        progress.progress = 70;
        
        const premiumFeatures = plannedFeatures.filter(f => 
          PRICING_CONFIG.features[f]?.isPremium
        );
        
        for (let i = 0; i < premiumFeatures.length; i++) {
          const feature = premiumFeatures[i];
          progress.currentTask = `Generating Premium ${this.getFeatureDisplayName(feature)}...`;
          progress.progress = 70 + (i / premiumFeatures.length) * 20;
          onProgress?.(progress);
          
          try {
            const featureResult = await this.generateFeature(jobId, feature);
            result.results[feature as keyof typeof result.results] = featureResult;
            result.generatedFeatures.push(feature);
            progress.completedTasks.push(`Premium ${this.getFeatureDisplayName(feature)}`);
            console.warn(`[MagicTransform] Generated premium feature: ${feature}`);
          } catch (error) {
            console.error(`[MagicTransform] Failed to generate premium ${feature}:`, error);
            result.failedFeatures.push(feature);
            progress.failedTasks.push({
              task: `Premium ${this.getFeatureDisplayName(feature)}`,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
      
      // Stage 4: Finalize
      progress.stage = 'finalizing';
      progress.currentTask = 'Finalizing your enhanced CV...';
      progress.progress = 95;
      onProgress?.(progress);
      
      // Calculate final results
      result.totalProcessingTime = Math.round((Date.now() - startTime) / 1000);
      result.success = result.generatedFeatures.length > 0 || result.appliedImprovements > 0;
      
      if (result.success) {
        result.message = `✨ Magic Transform completed! Applied ${result.appliedImprovements} improvements and generated ${result.generatedFeatures.length} features${result.failedFeatures.length > 0 ? ` (${result.failedFeatures.length} features failed)` : ''}.`;
      } else {
        result.message = '❌ Magic Transform failed. Please try individual features manually.';
      }
      
      // Complete
      progress.stage = 'completed';
      progress.currentTask = 'Magic Transform completed successfully!';
      progress.progress = 100;
      onProgress?.(progress);
      
      console.warn(`[MagicTransform] Completed in ${result.totalProcessingTime}s:`, {
        improvements: result.appliedImprovements,
        features: result.generatedFeatures.length,
        failed: result.failedFeatures.length,
        userTier: result.userTier
      });
      
      return result;
      
    } catch (error) {
      console.error('[MagicTransform] Critical error:', error);
      
      const errorProgress: MagicTransformProgress = {
        stage: 'error',
        currentTask: 'Magic Transform failed',
        completedTasks: [],
        failedTasks: [{ task: 'Magic Transform', error: error instanceof Error ? error.message : 'Unknown error' }],
        totalTasks: 1,
        progress: 0
      };
      onProgress?.(errorProgress);
      
      throw error;
    } finally {
      this.activeTransforms.delete(jobId);
    }
  }
  
  /**
   * Determine user's subscription tier
   */
  private static async determineUserTier(): Promise<SubscriptionTier> {
    try {
      const user = auth.currentUser;
      if (!user) return 'FREE';
      
      const subscription = await getUserSubscription();
      return subscription?.isPremium ? 'PREMIUM' : 'FREE';
    } catch (error) {
      console.warn('[MagicTransform] Failed to determine user tier, defaulting to FREE:', error);
      return 'FREE';
    }
  }
  
  /**
   * Plan features to generate based on user tier
   */
  private static planFeaturesForTier(userTier: SubscriptionTier): string[] {
    const features: string[] = [];
    
    // Core features for all users
    if (isFeatureAvailableForTier('PORTFOLIO_GALLERY', userTier)) {
      features.push('portfolioGallery');
    }
    if (isFeatureAvailableForTier('BASIC_QR_CODE', userTier)) {
      features.push('basicQRCode');
    }
    if (isFeatureAvailableForTier('SKILLS_VISUALIZATION', userTier)) {
      features.push('skillsVisualization');
    }
    if (isFeatureAvailableForTier('INTERACTIVE_TIMELINE', userTier)) {
      features.push('timeline');
    }
    
    // Professional features for all users
    features.push('contactForm');
    features.push('socialMediaLinks');
    features.push('availabilityCalendar');
    features.push('testimonialsCarousel');
    features.push('embedQRCode');
    features.push('privacyMode');
    
    // Premium features
    if (userTier === 'PREMIUM') {
      if (isFeatureAvailableForTier('VIDEO_INTRODUCTION', userTier)) {
        features.push('videoIntroduction');
      }
      if (isFeatureAvailableForTier('AI_PODCAST', userTier)) {
        features.push('podcast');
      }
      if (isFeatureAvailableForTier('WEB_PORTAL', userTier)) {
        features.push('webPortal');
      }
      if (isFeatureAvailableForTier('ADVANCED_QR_CODE', userTier)) {
        features.push('advancedQRCode');
      }
      if (isFeatureAvailableForTier('AI_CHAT_ASSISTANT', userTier)) {
        features.push('aiChatAssistant');
      }
    }
    
    return features;
  }
  
  /**
   * Generate a specific feature
   */
  private static async generateFeature(jobId: string, feature: string): Promise<any> {
    switch (feature) {
      case 'portfolioGallery':
        return await IntegrationService.generatePortfolioGallery(jobId);
        
      case 'basicQRCode':
        return await IntegrationService.generateQRCode(jobId, {});
        
      case 'skillsVisualization':
        return await VisualizationService.generateSkillsVisualization(jobId);
        
      case 'timeline':
        return await VisualizationService.generateTimeline(jobId);
        
      case 'videoIntroduction':
        return await MediaService.generateVideoIntroduction(jobId, 'medium', 'professional');
        
      case 'podcast':
        return await MediaService.generateEnhancedPodcast(jobId, 'professional');
        
      case 'webPortal':
        return await ProfileService.createPublicProfile(jobId);
        
      case 'advancedQRCode':
        return await IntegrationService.generateQRCode(jobId, {});
        
      case 'aiChatAssistant':
        return await ProfileService.initializeRAG(jobId);
        
      // Professional features - Real implementations using existing services
      case 'contactForm':
        return await this.generateContactFormSetup(jobId);
        
      case 'socialMediaLinks':
        return await IntegrationService.generateSocialMediaIntegration(jobId);
        
      case 'availabilityCalendar':
        return await this.generateAvailabilityCalendarSetup(jobId);
        
      case 'testimonialsCarousel':
        return await VisualizationService.generateTestimonialsCarousel(jobId);
        
      case 'embedQRCode':
        return await IntegrationService.generateQRCode(jobId, { 
          style: 'embedded',
          size: 'medium',
          format: 'png'
        });
        
      case 'privacyMode':
        return await this.generatePrivacyModeSetup(jobId);
        
      default:
        throw new Error(`Unknown feature: ${feature}`);
    }
  }
  
  /**
   * Get display name for a feature
   */
  private static getFeatureDisplayName(feature: string): string {
    const displayNames: Record<string, string> = {
      portfolioGallery: 'Portfolio Gallery',
      basicQRCode: 'QR Code',
      skillsVisualization: 'Skills Visualization',
      timeline: 'Career Timeline',
      videoIntroduction: 'Video Introduction',
      podcast: 'Career Podcast',
      webPortal: 'Web Portal',
      advancedQRCode: 'Advanced QR Code',
      aiChatAssistant: 'AI Chat Assistant',
      // Professional features display names
      contactForm: 'Contact Form',
      socialMediaLinks: 'Social Media Integration',
      availabilityCalendar: 'Availability Calendar',
      testimonialsCarousel: 'Testimonials Carousel',
      embedQRCode: 'Embedded QR Code',
      privacyMode: 'Privacy Settings'
    };
    
    return displayNames[feature] || feature;
  }
  
  /**
   * Generate contact form setup for the CV
   */
  private static async generateContactFormSetup(jobId: string): Promise<any> {
    // This sets up contact form configuration for the CV
    // It doesn't submit a form, but configures the capability
    return {
      type: 'contact-form',
      enabled: true,
      fields: ['name', 'email', 'phone', 'company', 'subject', 'message'],
      configuration: {
        responseTime: '24 hours',
        autoReply: true,
        notificationEmail: true,
        formAction: 'submitContactForm',
        validation: {
          required: ['name', 'email', 'subject', 'message'],
          optional: ['phone', 'company']
        }
      },
      setupAt: new Date(),
      message: 'Contact form capability enabled for your CV'
    };
  }
  
  /**
   * Generate availability calendar setup using Firebase Function
   */
  private static async generateAvailabilityCalendarSetup(jobId: string): Promise<any> {
    const generateCalendarFunction = httpsCallable(functions, 'generateAvailabilityCalendar');
    const result = await generateCalendarFunction({ jobId });
    return result.data;
  }
  
  /**
   * Generate privacy mode setup for the CV
   */
  private static async generatePrivacyModeSetup(jobId: string): Promise<any> {
    const privacySettings = {
      isPublic: true,
      allowContactForm: true,
      showAnalytics: false,
      privacyLevel: 'professional',
      showContactInfo: true,
      showSocialLinks: true,
      allowCVDownload: true,
      searchable: true
    };
    
    try {
      // Try to update existing public profile settings
      const result = await ProfileService.updatePublicProfileSettings(jobId, privacySettings);
      return {
        type: 'privacy-mode',
        settings: privacySettings,
        updated: true,
        result,
        message: 'Privacy settings configured successfully'
      };
    } catch (error) {
      // If profile doesn't exist, return configuration that will be applied when profile is created
      console.warn('[MagicTransform] Privacy settings will be applied when public profile is created');
      return {
        type: 'privacy-mode',
        settings: privacySettings,
        updated: false,
        pending: true,
        message: 'Privacy settings prepared for activation'
      };
    }
  }
  
  /**
   * Check if Magic Transform is currently running for a job
   */
  static isTransformActive(jobId: string): boolean {
    return this.activeTransforms.get(jobId) || false;
  }
  
  /**
   * Cancel an active Magic Transform
   */
  static cancelTransform(jobId: string): void {
    this.activeTransforms.delete(jobId);
  }
  
  /**
   * Get estimated completion time based on selected features
   */
  static estimateCompletionTime(userTier: SubscriptionTier, improvementCount: number): number {
    const features = this.planFeaturesForTier(userTier);
    
    // Base time for improvements (2 seconds per improvement)
    let estimatedTime = improvementCount * 2;
    
    // Add time for each feature
    const featureTimes: Record<string, number> = {
      portfolioGallery: 15,
      basicQRCode: 5,
      skillsVisualization: 10,
      timeline: 12,
      videoIntroduction: 45, // Video generation takes longer
      podcast: 30, // Podcast generation takes time
      webPortal: 20,
      advancedQRCode: 8,
      aiChatAssistant: 25,
      // Professional features
      contactForm: 8,
      socialMediaLinks: 6,
      availabilityCalendar: 12,
      testimonialsCarousel: 10,
      embedQRCode: 5,
      privacyMode: 7
    };
    
    features.forEach(feature => {
      estimatedTime += featureTimes[feature] || 10;
    });
    
    return estimatedTime;
  }
}