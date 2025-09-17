// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts// @ts-ignore - Export conflicts
  PublicProfileData,
  PublicProfileResult,
  ProfileUpdateResult,
  ProfileURLs,
  SEOReport
} from '../../types/profile.types';
import {
  AnalyticsData,
  ProfileAnalytics,
  ViewData,
  EngagementData
} from '../../types/analytics.types';
import { SEOData, MetaTags, StructuredData } from '../../types/seo.types';
import {
  ProfileTemplate,
  TemplateCustomization,
  ProfileOptions,
  ProfileUpdate,
  DateRange,
  SocialPlatform,
  QROptions,
  QRCodeResult,
  EmbedOptions,
  PrivacySettings,
  AccessControl,
  Permission,
  DomainMapping,
  DomainValidation,
  VersionData,
  ProfileVersion
} from '../types/service.types';
import { getFunctions, httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { getAuth, User } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, Firestore, getFirestore } from 'firebase/firestore';

/**
 * ProfileService - Frontend API service for public profile management
 *
 * Provides a clean interface for all public profile operations including:
 * - Profile CRUD operations
 * - Template management
 * - SEO optimization
 * - Social sharing and embedding
 * - Analytics integration
 * - Privacy and access controls
 * - Custom domain management
 * - Version control
  */
export class ProfileService {
  private functions = getFunctions();
  private firestore: Firestore;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.firestore = getFirestore();
  }

  // ========================================
  // Profile Management
  // ========================================

  /**
   * Create a new public profile
    */
  async createProfile(
    data: PublicProfileData,
    options: ProfileOptions = {}
  ): Promise<PublicProfileResult> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to create profile');
      }

      const createProfileFn = httpsCallable(this.functions, 'createPublicProfile');
      const result: HttpsCallableResult<PublicProfileResult> = await createProfileFn({
        userId: user.uid,
        profileData: data,
        options
      });

      // Clear user profiles cache
      this.clearCache(`user-profiles-${user.uid}`);

      return result.data;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw new Error(`Profile creation failed: ${error.message}`);
    }
  }

  /**
   * Get public profile by ID
    */
  async getProfile(profileId: string): Promise<PublicProfileData> {
    try {
      const cacheKey = `profile-${profileId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const profileDoc = await getDoc(doc(this.firestore, 'publicProfiles', profileId));
      if (!profileDoc.exists()) {
        throw new Error('Profile not found');
      }

      const profile = { id: profileDoc.id, ...profileDoc.data() } as PublicProfileData;
      this.setCache(cacheKey, profile);

      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }
  }

  /**
   * Update existing public profile
    */
  async updateProfile(
    profileId: string,
    updates: ProfileUpdate
  ): Promise<PublicProfileResult> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to update profile');
      }

      const updateProfileFn = httpsCallable(this.functions, 'updatePublicProfile');
      const result: HttpsCallableResult<PublicProfileResult> = await updateProfileFn({
        profileId,
        updates,
        userId: user.uid
      });

      // Clear related caches
      this.clearCache(`profile-${profileId}`);
      this.clearCache(`user-profiles-${user.uid}`);
      this.clearCache(`profile-analytics-${profileId}`);

      return result.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Delete public profile
    */
  async deleteProfile(profileId: string): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to delete profile');
      }

      const deleteProfileFn = httpsCallable(this.functions, 'deletePublicProfile');
      await deleteProfileFn({
        profileId,
        userId: user.uid
      });

      // Clear all related caches
      this.clearCache(`profile-${profileId}`);
      this.clearCache(`user-profiles-${user.uid}`);
      this.clearCache(`profile-analytics-${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw new Error(`Profile deletion failed: ${error.message}`);
    }
  }

  /**
   * Get all profiles for current user
    */
  async getUserProfiles(userId?: string): Promise<PublicProfileData[]> {
    try {
      const user = this.getCurrentUser();
      const targetUserId = userId || user?.uid;

      if (!targetUserId) {
        throw new Error('User ID required');
      }

      const cacheKey = `user-profiles-${targetUserId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const profilesQuery = query(
        collection(this.firestore, 'publicProfiles'),
        where('userId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(profilesQuery);
      const profiles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PublicProfileData[];

      this.setCache(cacheKey, profiles);
      return profiles;
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      throw new Error(`Failed to fetch user profiles: ${error.message}`);
    }
  }

  // ========================================
  // Template Operations
  // ========================================

  /**
   * Get available profile templates
    */
  async getTemplates(): Promise<ProfileTemplate[]> {
    try {
      const cacheKey = 'profile-templates';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const getTemplatesFn = httpsCallable(this.functions, 'getProfileTemplates');
      const result: HttpsCallableResult<{ templates: ProfileTemplate[] }> = await getTemplatesFn();

      this.setCache(cacheKey, result.data.templates, 30 * 60 * 1000); // Cache for 30 minutes
      return result.data.templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
  }

  /**
   * Apply template to profile
    */
  async applyTemplate(
    profileId: string,
    templateId: string
  ): Promise<PublicProfileResult> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const applyTemplateFn = httpsCallable(this.functions, 'applyProfileTemplate');
      const result: HttpsCallableResult<PublicProfileResult> = await applyTemplateFn({
        profileId,
        templateId,
        userId: user.uid
      });

      // Clear profile cache
      this.clearCache(`profile-${profileId}`);

      return result.data;
    } catch (error) {
      console.error('Error applying template:', error);
      throw new Error(`Template application failed: ${error.message}`);
    }
  }

  /**
   * Customize profile template
    */
  async customizeTemplate(
    profileId: string,
    customizations: TemplateCustomization
  ): Promise<PublicProfileResult> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const customizeTemplateFn = httpsCallable(this.functions, 'customizeProfileTemplate');
      const result: HttpsCallableResult<PublicProfileResult> = await customizeTemplateFn({
        profileId,
        customizations,
        userId: user.uid
      });

      // Clear profile cache
      this.clearCache(`profile-${profileId}`);

      return result.data;
    } catch (error) {
      console.error('Error customizing template:', error);
      throw new Error(`Template customization failed: ${error.message}`);
    }
  }

  // ========================================
  // SEO & Optimization
  // ========================================

  /**
   * Generate SEO data for profile
    */
  async generateSEOData(profileId: string): Promise<SEOData> {
    try {
      const cacheKey = `seo-data-${profileId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const generateSEOFn = httpsCallable(this.functions, 'generateProfileSEO');
      const result: HttpsCallableResult<SEOData> = await generateSEOFn({ profileId });

      this.setCache(cacheKey, result.data, 60 * 60 * 1000); // Cache for 1 hour
      return result.data;
    } catch (error) {
      console.error('Error generating SEO data:', error);
      throw new Error(`SEO generation failed: ${error.message}`);
    }
  }

  /**
   * Update profile meta tags
    */
  async updateMetaTags(profileId: string, metaTags: MetaTags): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const updateMetaFn = httpsCallable(this.functions, 'updateProfileMetaTags');
      await updateMetaFn({
        profileId,
        metaTags,
        userId: user.uid
      });

      // Clear SEO cache
      this.clearCache(`seo-data-${profileId}`);
    } catch (error) {
      console.error('Error updating meta tags:', error);
      throw new Error(`Meta tags update failed: ${error.message}`);
    }
  }

  /**
   * Generate structured data for profile
    */
  async generateStructuredData(profileId: string): Promise<StructuredData> {
    try {
      const cacheKey = `structured-data-${profileId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const generateStructuredFn = httpsCallable(this.functions, 'generateStructuredData');
      const result: HttpsCallableResult<StructuredData> = await generateStructuredFn({ profileId });

      this.setCache(cacheKey, result.data, 60 * 60 * 1000); // Cache for 1 hour
      return result.data;
    } catch (error) {
      console.error('Error generating structured data:', error);
      throw new Error(`Structured data generation failed: ${error.message}`);
    }
  }

  // ========================================
  // Sharing & Embedding
  // ========================================

  /**
   * Generate social sharing URL
    */
  async generateShareURL(
    profileId: string,
    platform: SocialPlatform
  ): Promise<string> {
    try {
      const generateShareFn = httpsCallable(this.functions, 'generateShareURL');
      const result: HttpsCallableResult<{ url: string }> = await generateShareFn({
        profileId,
        platform
      });

      return result.data.url;
    } catch (error) {
      console.error('Error generating share URL:', error);
      throw new Error(`Share URL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate QR code for profile
    */
  async generateQRCode(
    profileId: string,
    options: QROptions = {}
  ): Promise<QRCodeResult> {
    try {
      const generateQRFn = httpsCallable(this.functions, 'generateProfileQR');
      const result: HttpsCallableResult<QRCodeResult> = await generateQRFn({
        profileId,
        options
      });

      return result.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error(`QR code generation failed: ${error.message}`);
    }
  }

  /**
   * Generate embed code for profile
    */
  async generateEmbedCode(
    profileId: string,
    options: EmbedOptions = {}
  ): Promise<string> {
    try {
      const generateEmbedFn = httpsCallable(this.functions, 'generateEmbedCode');
      const result: HttpsCallableResult<{ embedCode: string }> = await generateEmbedFn({
        profileId,
        options
      });

      return result.data.embedCode;
    } catch (error) {
      console.error('Error generating embed code:', error);
      throw new Error(`Embed code generation failed: ${error.message}`);
    }
  }

  // ========================================
  // Analytics Integration
  // ========================================

  /**
   * Track profile view
    */
  async trackProfileView(profileId: string, viewData: ViewData): Promise<void> {
    try {
      const trackViewFn = httpsCallable(this.functions, 'trackProfileView');
      await trackViewFn({
        profileId,
        viewData: {
          ...viewData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      });
    } catch (error) {
      console.error('Error tracking profile view:', error);
      // Don't throw error for analytics failures
    }
  }

  /**
   * Get profile analytics
    */
  async getProfileAnalytics(
    profileId: string,
    dateRange: DateRange = { days: 30 }
  ): Promise<ProfileAnalytics> {
    try {
      const cacheKey = `profile-analytics-${profileId}-${JSON.stringify(dateRange)}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const getAnalyticsFn = httpsCallable(this.functions, 'getProfileAnalytics');
      const result: HttpsCallableResult<ProfileAnalytics> = await getAnalyticsFn({
        profileId,
        dateRange
      });

      this.setCache(cacheKey, result.data, 10 * 60 * 1000); // Cache for 10 minutes
      return result.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error(`Analytics fetch failed: ${error.message}`);
    }
  }

  /**
   * Track user engagement
    */
  async trackEngagement(
    profileId: string,
    engagement: EngagementData
  ): Promise<void> {
    try {
      const trackEngagementFn = httpsCallable(this.functions, 'trackProfileEngagement');
      await trackEngagementFn({
        profileId,
        engagement: {
          ...engagement,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error tracking engagement:', error);
      // Don't throw error for analytics failures
    }
  }

  // ========================================
  // Privacy & Access Control
  // ========================================

  /**
   * Update profile privacy settings
    */
  async updatePrivacySettings(
    profileId: string,
    settings: PrivacySettings
  ): Promise<void> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const updatePrivacyFn = httpsCallable(this.functions, 'updateProfilePrivacy');
      await updatePrivacyFn({
        profileId,
        settings,
        userId: user.uid
      });

      // Clear profile cache
      this.clearCache(`profile-${profileId}`);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error(`Privacy update failed: ${error.message}`);
    }
  }

  /**
   * Get profile access controls
    */
  async getAccessControls(profileId: string): Promise<AccessControl[]> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const cacheKey = `access-controls-${profileId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const getAccessFn = httpsCallable(this.functions, 'getProfileAccessControls');
      const result: HttpsCallableResult<{ controls: AccessControl[] }> = await getAccessFn({
        profileId,
        userId: user.uid
      });

      this.setCache(cacheKey, result.data.controls);
      return result.data.controls;
    } catch (error) {
      console.error('Error fetching access controls:', error);
      throw new Error(`Access controls fetch failed: ${error.message}`);
    }
  }

  /**
   * Generate profile access token
    */
  async generateAccessToken(
    profileId: string,
    permissions: Permission[]
  ): Promise<string> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const generateTokenFn = httpsCallable(this.functions, 'generateProfileAccessToken');
      const result: HttpsCallableResult<{ token: string }> = await generateTokenFn({
        profileId,
        permissions,
        userId: user.uid
      });

      return result.data.token;
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error(`Access token generation failed: ${error.message}`);
    }
  }

  // ========================================
  // Custom Domains
  // ========================================

  /**
   * Map custom domain to profile
    */
  async mapCustomDomain(
    profileId: string,
    domain: string
  ): Promise<DomainMapping> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const mapDomainFn = httpsCallable(this.functions, 'mapCustomDomain');
      const result: HttpsCallableResult<DomainMapping> = await mapDomainFn({
        profileId,
        domain,
        userId: user.uid
      });

      return result.data;
    } catch (error) {
      console.error('Error mapping custom domain:', error);
      throw new Error(`Domain mapping failed: ${error.message}`);
    }
  }

  /**
   * Validate custom domain
    */
  async validateDomain(domain: string): Promise<DomainValidation> {
    try {
      const validateDomainFn = httpsCallable(this.functions, 'validateCustomDomain');
      const result: HttpsCallableResult<DomainValidation> = await validateDomainFn({ domain });

      return result.data;
    } catch (error) {
      console.error('Error validating domain:', error);
      throw new Error(`Domain validation failed: ${error.message}`);
    }
  }

  // ========================================
  // Version Control
  // ========================================

  /**
   * Save profile version
    */
  async saveProfileVersion(
    profileId: string,
    version: VersionData
  ): Promise<ProfileVersion> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const saveVersionFn = httpsCallable(this.functions, 'saveProfileVersion');
      const result: HttpsCallableResult<ProfileVersion> = await saveVersionFn({
        profileId,
        version,
        userId: user.uid
      });

      // Clear versions cache
      this.clearCache(`profile-versions-${profileId}`);

      return result.data;
    } catch (error) {
      console.error('Error saving profile version:', error);
      throw new Error(`Version save failed: ${error.message}`);
    }
  }

  /**
   * Get profile versions
    */
  async getProfileVersions(profileId: string): Promise<ProfileVersion[]> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const cacheKey = `profile-versions-${profileId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const getVersionsFn = httpsCallable(this.functions, 'getProfileVersions');
      const result: HttpsCallableResult<{ versions: ProfileVersion[] }> = await getVersionsFn({
        profileId,
        userId: user.uid
      });

      this.setCache(cacheKey, result.data.versions);
      return result.data.versions;
    } catch (error) {
      console.error('Error fetching profile versions:', error);
      throw new Error(`Versions fetch failed: ${error.message}`);
    }
  }

  /**
   * Rollback to previous version
    */
  async rollbackToVersion(
    profileId: string,
    versionId: string
  ): Promise<PublicProfileResult> {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const rollbackFn = httpsCallable(this.functions, 'rollbackProfileVersion');
      const result: HttpsCallableResult<PublicProfileResult> = await rollbackFn({
        profileId,
        versionId,
        userId: user.uid
      });

      // Clear all related caches
      this.clearCache(`profile-${profileId}`);
      this.clearCache(`profile-versions-${profileId}`);
      this.clearCache(`seo-data-${profileId}`);

      return result.data;
    } catch (error) {
      console.error('Error rolling back version:', error);
      throw new Error(`Version rollback failed: ${error.message}`);
    }
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Get current authenticated user
    */
  private getCurrentUser(): User | null {
    const auth = getAuth();
    return auth.currentUser;
  }

  /**
   * Get item from cache if not expired
    */
  private getFromCache<T>(key: string): T | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  /**
   * Set item in cache with expiry
    */
  private setCache<T>(key: string, value: T, duration?: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + (duration || this.CACHE_DURATION));
  }

  /**
   * Clear specific cache entry
    */
  private clearCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  /**
   * Clear all cache entries
    */
  public clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cache stats for debugging
    */
  public getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const profileService = new ProfileService();