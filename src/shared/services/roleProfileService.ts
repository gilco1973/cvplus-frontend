import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance, getAuthInstance } from '../config/firebase-optimized';
import type {
  RoleProfile,
  DetectedRole,
  RoleProfileAnalysis,
  RoleBasedRecommendation,
  RoleDetectionResponse,
  RoleProfilesResponse,
  RoleBasedRecommendationsResponse,
  RoleApplicationResult,
  FirebaseFunctionResponse
} from '../types/role-profiles';
import { logError } from '../utils/errorHandling';

/**
 * Role Profile Service
 * Handles all role profile related operations with Firebase Functions
 */
export class RoleProfileService {
  private functions = getFunctionsInstance();
  private detectRoleProfile = httpsCallable(this.functions, 'detectRoleProfile');
  private getRoleProfiles = httpsCallable(this.functions, 'getRoleProfiles');
  private applyRoleProfile = httpsCallable(this.functions, 'applyRoleProfile');
  private getRoleBasedRecommendations = httpsCallable(this.functions, 'getRoleBasedRecommendations');
  
  // Request deduplication to prevent duplicate API calls
  private activeRequests = new Map<string, { promise: Promise<any>; timestamp: number }>();
  private readonly REQUEST_TTL = 5 * 60 * 1000; // 5 minutes TTL

  /**
   * Detect role profile for a CV/job
   */
  async detectRole(
    jobId: string,
    forceRegenerate = false
  ): Promise<RoleDetectionResponse> {
    try {
      // Check authentication first - wait for auth state if needed
      const auth = getAuthInstance();
      let currentUser = auth.currentUser;
      
      console.warn('[RoleProfileService] Detecting role for job:', jobId);
      console.warn('[RoleProfileService] Initial auth check - Current user:', currentUser ? currentUser.uid : 'NOT AUTHENTICATED');
      console.warn('[RoleProfileService] Functions instance:', this.functions);
      console.warn('[RoleProfileService] Using force regenerate:', forceRegenerate);
      
      // If no current user, wait for auth state to settle
      if (!currentUser) {
        console.warn('[RoleProfileService] No current user, waiting for auth state...');
        
        // Wait for auth state with timeout
        currentUser = await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            console.warn('[RoleProfileService] Auth state changed:', user ? user.uid : 'null');
            unsubscribe();
            resolve(user);
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            console.warn('[RoleProfileService] Auth state timeout after 5 seconds');
            unsubscribe();
            resolve(null);
          }, 5000);
        });
      }
      
      console.warn('[RoleProfileService] Final auth check - Current user:', currentUser ? currentUser.uid : 'NOT AUTHENTICATED');
      
      if (!currentUser) {
        throw new Error('User must be authenticated to detect role profiles');
      }
      
      // Clean up expired requests first
      this.cleanupExpiredRequests();
      
      // Request deduplication - prevent duplicate calls for same job
      const requestKey = `detectRole:${jobId}:${forceRegenerate}`;
      const cachedRequest = this.activeRequests.get(requestKey);
      if (cachedRequest) {
        console.warn('[RoleProfileService] Returning existing request for:', requestKey);
        return cachedRequest.promise;
      }
      
      const requestData = {
        jobId,
        forceRegenerate
      };
      
      console.warn('[RoleProfileService] Calling detectRoleProfile with data:', requestData);
      
      // Create and cache the request promise
      const requestPromise = (async (): Promise<RoleDetectionResponse> => {
        try {
          const result = await this.detectRoleProfile(requestData) as FirebaseFunctionResponse<RoleDetectionResponse['data']>;

          console.warn('[RoleProfileService] Raw result from detectRoleProfile:', result);

          if (!result.data?.success) {
            throw new Error(result.data?.error || 'Role detection failed');
          }

          console.warn('[RoleProfileService] Successful detection result:', result.data.data);

          return {
            success: true,
            data: result.data.data!
          };
        } finally {
          // Clean up the request from cache
          this.activeRequests.delete(requestKey);
        }
      })();
      
      // Cache the promise with timestamp
      this.activeRequests.set(requestKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
      
      return requestPromise;
    } catch (error: any) {
      // Make sure to clean up on error
      this.activeRequests.delete(requestKey);
      console.error('[RoleProfileService] Detection error:', error);
      console.error('[RoleProfileService] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      logError('detectRole', error);
      throw new Error(`Role detection failed: ${error.message}`);
    }
  }

  /**
   * Clean up expired requests from cache to prevent memory leaks
   */
  private cleanupExpiredRequests(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, request] of this.activeRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TTL) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired requests
    for (const key of expiredKeys) {
      this.activeRequests.delete(key);
    }
    
    if (expiredKeys.length > 0) {
      console.warn(`[RoleProfileService] Cleaned up ${expiredKeys.length} expired requests`);
    }
  }

  /**
   * Get all available role profiles
   */
  async getAllRoleProfiles(): Promise<RoleProfile[]> {
    try {
      console.warn('[RoleProfileService] Fetching all role profiles');
      
      const result = await this.getRoleProfiles({}) as FirebaseFunctionResponse<RoleProfilesResponse['data']>;

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to fetch role profiles');
      }

      return result.data.data!.profiles;
    } catch (error: any) {
      console.error('[RoleProfileService] Fetch error:', error);
      logError('getAllRoleProfiles', error);
      throw new Error(`Failed to fetch role profiles: ${error.message}`);
    }
  }

  /**
   * Get role profiles by category
   */
  async getRoleProfilesByCategory(category: string): Promise<RoleProfile[]> {
    try {
      console.warn('[RoleProfileService] Fetching role profiles for category:', category);
      
      const result = await this.getRoleProfiles({
        category
      }) as FirebaseFunctionResponse<RoleProfilesResponse['data']>;

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to fetch role profiles');
      }

      return result.data.data!.profiles;
    } catch (error: any) {
      console.error('[RoleProfileService] Fetch by category error:', error);
      logError('getRoleProfilesByCategory', error);
      throw new Error(`Failed to fetch role profiles for category: ${error.message}`);
    }
  }

  /**
   * Search role profiles
   */
  async searchRoleProfiles(
    searchQuery: string,
    limit = 20
  ): Promise<RoleProfile[]> {
    try {
      console.warn('[RoleProfileService] Searching role profiles:', searchQuery);
      
      const result = await this.getRoleProfiles({
        searchQuery,
        limit
      }) as FirebaseFunctionResponse<RoleProfilesResponse['data']>;

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to search role profiles');
      }

      return result.data.data!.profiles;
    } catch (error: any) {
      console.error('[RoleProfileService] Search error:', error);
      logError('searchRoleProfiles', error);
      throw new Error(`Failed to search role profiles: ${error.message}`);
    }
  }

  /**
   * Apply a role profile to a job/CV
   */
  async applyRole(
    jobId: string,
    roleProfileId: string,
    customizationOptions?: any
  ): Promise<RoleApplicationResult> {
    try {
      console.warn('[RoleProfileService] Applying role profile:', { jobId, roleProfileId });
      
      const result = await this.applyRoleProfile({
        jobId,
        roleProfileId,
        customizationOptions
      }) as FirebaseFunctionResponse<RoleApplicationResult>;

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to apply role profile');
      }

      return result.data.data!;
    } catch (error: any) {
      console.error('[RoleProfileService] Apply role error:', error);
      logError('applyRole', error);
      throw new Error(`Failed to apply role profile: ${error.message}`);
    }
  }

  /**
   * Get role-based recommendations
   */
  async getRoleRecommendations(
    jobId: string,
    roleProfileId?: string,
    targetRole?: string,
    industryKeywords?: string[],
    forceRegenerate = false
  ): Promise<RoleBasedRecommendation[]> {
    try {
      console.warn('[RoleProfileService] Getting role-based recommendations:', {
        jobId,
        roleProfileId,
        targetRole
      });
      
      const requestData: any = {
        jobId,
        forceRegenerate
      };

      if (roleProfileId) {
        requestData.roleProfileId = roleProfileId;
      }
      if (targetRole) {
        requestData.targetRole = targetRole;
      }
      if (industryKeywords) {
        requestData.industryKeywords = industryKeywords;
      }

      const result = await this.getRoleBasedRecommendations(
        requestData
      ) as FirebaseFunctionResponse<RoleBasedRecommendationsResponse['data']>;

      if (!result.data?.success) {
        throw new Error(result.data?.error || 'Failed to get role-based recommendations');
      }

      return result.data.data!.recommendations;
    } catch (error: any) {
      console.error('[RoleProfileService] Get recommendations error:', error);
      logError('getRoleRecommendations', error);
      throw new Error(`Failed to get role-based recommendations: ${error.message}`);
    }
  }

  /**
   * Auto-detect and apply role in one operation
   */
  async autoDetectAndApply(
    jobId: string,
    customizationOptions?: any
  ): Promise<{
    detection: RoleDetectionResponse;
    application: RoleApplicationResult;
  }> {
    try {
      console.warn('[RoleProfileService] Auto-detecting and applying role for job:', jobId);
      
      // First, detect the role
      const detection = await this.detectRole(jobId);
      
      if (!detection.data.detectedRole) {
        throw new Error('No suitable role detected');
      }

      // Apply the detected role
      const application = await this.applyRole(
        jobId,
        detection.data.detectedRole.roleId,
        customizationOptions
      );

      return {
        detection,
        application
      };
    } catch (error: any) {
      console.error('[RoleProfileService] Auto-detect and apply error:', error);
      logError('autoDetectAndApply', error);
      throw new Error(`Auto-detect and apply failed: ${error.message}`);
    }
  }

  /**
   * Get enhanced recommendations combining role detection with recommendations
   */
  async getEnhancedRecommendations(
    jobId: string,
    forceRoleDetection = false
  ): Promise<{
    role: DetectedRole | null;
    analysis: RoleProfileAnalysis | null;
    recommendations: RoleBasedRecommendation[];
  }> {
    try {
      console.warn('[RoleProfileService] Getting enhanced recommendations for job:', jobId);
      
      let role: DetectedRole | null = null;
      let analysis: RoleProfileAnalysis | null = null;

      // Detect role if needed
      try {
        const detection = await this.detectRole(jobId, forceRoleDetection);
        role = detection.data.detectedRole;
        analysis = detection.data.analysis;
      } catch (detectionError) {
        console.warn('[RoleProfileService] Role detection failed, proceeding without role context:', detectionError);
      }

      // Get recommendations with or without role context
      const recommendations = await this.getRoleRecommendations(
        jobId,
        role?.roleId,
        role?.roleName
      );

      return {
        role,
        analysis,
        recommendations
      };
    } catch (error: any) {
      console.error('[RoleProfileService] Enhanced recommendations error:', error);
      logError('getEnhancedRecommendations', error);
      throw new Error(`Failed to get enhanced recommendations: ${error.message}`);
    }
  }

  /**
   * Validate role profile compatibility with CV
   */
  async validateRoleCompatibility(
    jobId: string,
    roleProfileId: string
  ): Promise<{
    compatible: boolean;
    confidence: number;
    missingSkills: string[];
    recommendations: string[];
  }> {
    try {
      console.warn('[RoleProfileService] Validating role compatibility:', { jobId, roleProfileId });
      
      // Get role detection to check compatibility
      const detection = await this.detectRole(jobId);
      
      const targetMatch = detection.data.analysis.alternativeRoles.find(
        role => role.roleId === roleProfileId
      ) || (detection.data.detectedRole.roleId === roleProfileId ? detection.data.detectedRole : null);

      if (!targetMatch) {
        return {
          compatible: false,
          confidence: 0,
          missingSkills: [],
          recommendations: ['Consider a different role profile or add relevant experience']
        };
      }

      return {
        compatible: targetMatch.confidence > 0.5,
        confidence: targetMatch.confidence,
        missingSkills: [], // Would be populated from detailed analysis
        recommendations: targetMatch.recommendations || []
      };
    } catch (error: any) {
      console.error('[RoleProfileService] Compatibility validation error:', error);
      logError('validateRoleCompatibility', error);
      throw new Error(`Failed to validate role compatibility: ${error.message}`);
    }
  }
}

// Export singleton instance
export const roleProfileService = new RoleProfileService();
export default roleProfileService;