/**
 * CV Analyzer Service
 * Handles CV analysis, insights, recommendations, and ATS optimization
 */

import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../lib/firebase';
import { recommendationsDebugger } from '../../utils/debugRecommendations';
import type { CVAnalysisParams } from '../../types/cv';

// Module-level request tracking for immediate blocking
const activeRequests = new Set<string>();
const cachedPromises = new Map<string, Promise<unknown>>();
const requestCounts = new Map<string, number>();

// Cleanup cache after 5 minutes to prevent memory leaks
const CACHE_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, promise] of cachedPromises.entries()) {
    // Remove old promises that are likely resolved
    promise.finally(() => {
      setTimeout(() => {
        cachedPromises.delete(key);
        activeRequests.delete(key);
        requestCounts.delete(key);
      }, CACHE_CLEANUP_INTERVAL);
    });
  }
}, CACHE_CLEANUP_INTERVAL);

export class CVAnalyzer {
  /**
   * Analyze CV content
   */
  static async analyzeCV(params: CVAnalysisParams) {
    const { parsedCV, targetRole } = params;
    const analyzeCVFunction = httpsCallable(functions, 'analyzeCV');
    const result = await analyzeCVFunction({
      parsedCV,
      targetRole
    });
    return result.data;
  }

  /**
   * Enhanced CV analysis with more parameters
   */
  static async enhancedAnalyzeCV(params: CVAnalysisParams) {
    const { parsedCV, targetRole, jobDescription, industryKeywords, jobId } = params;
    const enhancedAnalyzeCVFunction = httpsCallable(functions, 'enhancedAnalyzeCV');
    const result = await enhancedAnalyzeCVFunction({
      parsedCV,
      targetRole,
      jobDescription,
      industryKeywords,
      jobId
    });
    return result.data;
  }

  /**
   * Analyze ATS compatibility
   */
  static async analyzeATSCompatibility(jobId: string, targetRole?: string, targetKeywords?: string[]) {
    const analyzeATSFunction = httpsCallable(functions, 'analyzeATSCompatibility');
    const result = await analyzeATSFunction({
      jobId,
      targetRole,
      targetKeywords
    });
    return result.data;
  }

  /**
   * Generate ATS keywords from job description
   */
  static async generateATSKeywords(jobDescription: string, industry?: string, role?: string) {
    const generateKeywordsFunction = httpsCallable(functions, 'generateATSKeywords');
    const result = await generateKeywordsFunction({
      jobDescription,
      industry,
      role
    });
    return result.data;
  }

  /**
   * Get CV improvement recommendations (LEGACY - now redirects to CVServiceCore)
   * @deprecated Use CVServiceCore.getRecommendations instead for proper duplicate prevention
   */
  static async getRecommendations(
    jobId: string, 
    targetRole?: string, 
    industryKeywords?: string[], 
    forceRegenerate?: boolean
  ) {
    console.warn('[CVAnalyzer] getRecommendations is deprecated. Use CVServiceCore.getRecommendations for proper duplicate prevention.');
    
    // Generate a unique key for this request
    const requestKey = `${jobId}-${targetRole || 'default'}-${(industryKeywords || []).join(',')}-${forceRegenerate || false}`;
    
    // Track request count for debugging
    const currentCount = (requestCounts.get(requestKey) || 0) + 1;
    requestCounts.set(requestKey, currentCount);
    
    console.warn(`[CVAnalyzer] LEGACY getRecommendations called for jobId: ${jobId} (request #${currentCount})`);
    
    // IMMEDIATE BLOCKING: Check if request is already active
    if (activeRequests.has(requestKey)) {
      console.warn(`[CVAnalyzer] BLOCKING duplicate legacy request for job: ${jobId} (request #${currentCount})`);
      console.warn(`[CVAnalyzer] Active request key: ${requestKey}`);
      
      // Track as blocked request
      recommendationsDebugger.trackCall(jobId, `CVAnalyzer.getRecommendations-legacy-${currentCount}`, true, requestKey);
      
      // Return existing promise if available
      const existingPromise = cachedPromises.get(requestKey);
      if (existingPromise) {
        console.warn(`[CVAnalyzer] Returning cached promise for legacy job: ${jobId}`);
        return existingPromise;
      }
      
      // If no cached promise, return empty result to prevent hanging
      console.warn(`[CVAnalyzer] No cached promise found, returning null for legacy job: ${jobId}`);
      return null;
    }
    
    // Track as actual request
    recommendationsDebugger.trackCall(jobId, `CVAnalyzer.getRecommendations-legacy-${currentCount}`, false, requestKey);
    
    // Mark request as active IMMEDIATELY (synchronously)
    activeRequests.add(requestKey);
    console.warn(`[CVAnalyzer] Starting new legacy request for job: ${jobId} (request #${currentCount})`);
    console.warn(`[CVAnalyzer] Request key: ${requestKey}`);
    console.warn(`[CVAnalyzer] Active requests count: ${activeRequests.size}`);
    console.warn(`[CVAnalyzer] Cached promises count: ${cachedPromises.size}`);
    
    // Create the actual request promise
    const requestPromise = this._executeGetRecommendations(jobId, targetRole, industryKeywords, forceRegenerate)
      .finally(() => {
        // Clean up tracking when request completes
        console.warn(`[CVAnalyzer] Cleaning up legacy request tracking for job: ${jobId}`);
        activeRequests.delete(requestKey);
        // Keep cached promise for a short time in case of immediate subsequent calls
        setTimeout(() => {
          cachedPromises.delete(requestKey);
        }, 30000); // 30 seconds cache
      });
    
    // Cache the promise for immediate duplicate requests
    cachedPromises.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  /**
   * Direct execution method for RequestManager (bypasses internal duplicate prevention)
   */
  static async _executeGetRecommendationsDirectly(
    jobId: string, 
    targetRole?: string, 
    industryKeywords?: string[], 
    forceRegenerate?: boolean
  ) {
    console.warn(`[CVAnalyzer] _executeGetRecommendationsDirectly called for job: ${jobId}`);
    return this._executeGetRecommendations(jobId, targetRole, industryKeywords, forceRegenerate);
  }

  /**
   * Internal method to execute the actual getRecommendations request
   */
  private static async _executeGetRecommendations(
    jobId: string, 
    targetRole?: string, 
    industryKeywords?: string[], 
    forceRegenerate?: boolean
  ) {
    console.warn(`[CVAnalyzer] Executing actual Firebase request for job: ${jobId}`);
    
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    
    try {
      // First try the callable function
      console.warn(`[CVAnalyzer] Attempting callable function for job: ${jobId}`);
      const getRecommendationsFunction = httpsCallable(functions, 'getRecommendations');
      const result = await getRecommendationsFunction({
        jobId,
        targetRole,
        industryKeywords,
        forceRegenerate
      });
      console.warn(`[CVAnalyzer] Callable function succeeded for job: ${jobId}`);
      return result.data;
    } catch (error: unknown) {
      console.warn(`[CVAnalyzer] Callable function failed for job: ${jobId}, trying direct HTTP call:`, error);
      
      // Fallback to direct HTTP call  
      const baseUrl = import.meta.env.DEV 
        ? 'http://localhost:5001/getmycv-ai/us-central1'
        : 'https://us-central1-getmycv-ai.cloudfunctions.net';
      const response = await fetch(`${baseUrl}/getRecommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            jobId,
            targetRole,
            industryKeywords,
            forceRegenerate
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.warn(`[CVAnalyzer] Direct HTTP call succeeded for job: ${jobId}`);
      console.warn(`[CVAnalyzer] HTTP response structure:`, result);
      
      // The HTTP endpoint returns the response in result.data format
      // But we need to match the callable function format
      if (result.result) {
        return result.result;
      } else if (result.data) {
        return result.data;
      } else {
        return result;
      }
    }
  }

  /**
   * Debug method to check current request status
   */
  static getRequestDebugInfo() {
    return {
      activeRequests: Array.from(activeRequests),
      cachedPromises: Array.from(cachedPromises.keys()),
      requestCounts: Object.fromEntries(requestCounts)
    };
  }

  /**
   * Clear all request tracking (useful for testing)
   */
  static clearRequestTracking() {
    activeRequests.clear();
    cachedPromises.clear();
    requestCounts.clear();
    console.warn('[CVAnalyzer] Request tracking cleared');
  }

  /**
   * Preview a specific improvement recommendation
   */
  static async previewImprovement(jobId: string, recommendationId: string) {
    const previewImprovementFunction = httpsCallable(functions, 'previewImprovement');
    const result = await previewImprovementFunction({
      jobId,
      recommendationId
    });
    return result.data;
  }

  /**
   * Analyze achievements
   */
  static async analyzeAchievements(jobId: string) {
    const analyzeFunction = httpsCallable(functions, 'analyzeAchievements');
    const result = await analyzeFunction({ jobId });
    return result.data;
  }

  /**
   * Generate achievement showcase
   */
  static async generateAchievementShowcase(jobId: string, maxAchievements = 6) {
    const showcaseFunction = httpsCallable(functions, 'generateAchievementShowcase');
    const result = await showcaseFunction({ jobId, maxAchievements });
    return result.data;
  }
}