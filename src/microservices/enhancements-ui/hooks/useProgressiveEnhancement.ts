/**
 * Progressive Enhancement Manager Hook
 *
 * Manages the progressive enhancement of CV features by:
 * - Fetching base HTML content from Firebase Storage
 * - Calling legacy Firebase Functions progressively
 * - Tracking progress of each feature generation
 * - Merging completed feature HTML into base HTML
 * - Providing real-time status updates
 *
 * @author Gil Klainert
 * @version 3.0.0 - Migrated to Enhancements Module
  */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { ref, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { functions, storage, db } from '@cvplus/core/firebase';
import { useAuth } from '@cvplus/auth/hooks';
import { jobSubscriptionManager } from '@cvplus/core/services';
import type { Job } from '@cvplus/core/types';
import toast from 'react-hot-toast';

// Re-export enhanced service imports from enhancements module
import {
  CSSOptimizerService,
  PerformanceMonitorService,
  HTMLValidatorService,
  ErrorRecoveryService,
  FeaturePriorityService
} from '../services';

export interface FeatureProgress {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  html?: string;
  timestamp?: number;
}

export interface ProgressiveEnhancementState {
  baseHtml: string | null;
  currentHtml: string | null;
  features: FeatureProgress[];
  overallProgress: number;
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
}

export interface UseProgressiveEnhancementOptions {
  jobId: string;
  selectedFeatures: string[];
  autoStart?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

// Legacy Firebase Functions mapping
// NOTE: contact-form and social-media-links are generated server-side during CV generation
// and should NOT be processed through progressive enhancement
const LEGACY_FUNCTIONS: Record<string, string> = {
  'skills-visualization': 'generateSkillsVisualization',
  'certification-badges': 'generateCertificationBadges',
  'calendar-integration': 'generateCalendarEvents',
  'availability-calendar': 'generateAvailabilityCalendar',
  'interactive-timeline': 'generateTimeline',
  'language-proficiency': 'generateLanguageVisualization',
  'portfolio-gallery': 'generatePortfolioGallery',
  'video-introduction': 'generateVideoIntroduction',
  'generate-podcast': 'generatePodcast',
  'embed-qr-code': 'generateQRCode'
};

// Feature display names
// NOTE: contact-form and social-media-links are server-side generated and not included here
const FEATURE_NAMES: Record<string, string> = {
  'skills-visualization': 'Skills Visualization',
  'certification-badges': 'Certification Badges',
  'calendar-integration': 'Calendar Integration',
  'availability-calendar': 'Availability Calendar',
  'interactive-timeline': 'Interactive Timeline',
  'language-proficiency': 'Language Proficiency',
  'portfolio-gallery': 'Portfolio Gallery',
  'video-introduction': 'Video Introduction',
  'generate-podcast': 'Career Podcast',
  'embed-qr-code': 'QR Code Integration'
};

// Create service instances
const cssOptimizerService = new CSSOptimizerService();
const performanceMonitorService = new PerformanceMonitorService();
const htmlValidatorService = new HTMLValidatorService();
const errorRecoveryService = new ErrorRecoveryService();
const featurePriorityService = new FeaturePriorityService();

export function useProgressiveEnhancement({
  jobId,
  selectedFeatures,
  autoStart = true,
  retryAttempts = 3,
  retryDelay = 2000
}: UseProgressiveEnhancementOptions) {
  const { user } = useAuth();

  // Memoize selectedFeatures to prevent unnecessary recreations
  const memoizedSelectedFeatures = useMemo(() => selectedFeatures, [selectedFeatures.join(',')]);

  const [state, setState] = useState<ProgressiveEnhancementState>({
    baseHtml: null,
    currentHtml: null,
    features: [],
    overallProgress: 0,
    isLoading: false,
    isComplete: false,
    error: null
  });

  const retryCountRef = useRef<Record<string, number>>({});
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize feature progress tracking - stable memoization
  const initializeFeatures = useCallback(() => {
    // Filter out server-side generated features that don't need progressive enhancement
    const SERVER_SIDE_FEATURES = ['contact-form', 'social-media-links'];
    const clientSideFeatures = memoizedSelectedFeatures.filter(
      featureId => !SERVER_SIDE_FEATURES.includes(featureId)
    );

    const features: FeatureProgress[] = clientSideFeatures.map(featureId => ({
      id: featureId,
      name: FEATURE_NAMES[featureId] || featureId,
      status: 'pending',
      progress: 0
    }));

    // Log filtered features for debugging
    if (SERVER_SIDE_FEATURES.some(f => memoizedSelectedFeatures.includes(f))) {
      const serverSideSelected = memoizedSelectedFeatures.filter(f => SERVER_SIDE_FEATURES.includes(f));
      console.warn(`🏗️ Server-side features detected and excluded from progressive enhancement: ${serverSideSelected.join(', ')}`);
      console.warn(`🔄 Client-side features for progressive enhancement: ${clientSideFeatures.map(id => FEATURE_NAMES[id] || id).join(', ')}`);
    }

    setState(prev => ({
      ...prev,
      features,
      overallProgress: 0,
      isComplete: false
    }));

    return features;
  }, [memoizedSelectedFeatures]);

  // Fetch base HTML content from Firebase Storage - stable memoization
  const fetchBaseHtml = useCallback(async (): Promise<string> => {
    try {
      const storageRef = ref(storage, `users/${user?.uid}/generated/${jobId}/cv.html`);
      const downloadUrl = await getDownloadURL(storageRef);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch HTML: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      console.warn('✅ Base HTML fetched successfully');

      return html;
    } catch (error) {
      console.error('❌ Error fetching base HTML:', error);
      throw new Error('Failed to load base CV content');
    }
  }, [jobId, user?.uid]);

  // Call legacy Firebase Function for specific feature
  const callLegacyFunction = useCallback(async (featureId: string): Promise<string> => {
    const functionName = LEGACY_FUNCTIONS[featureId];
    if (!functionName) {
      throw new Error(`Unknown feature: ${featureId}`);
    }

    try {
      console.warn(`🚀 Calling ${functionName} for feature: ${featureId}`);

      const callable = httpsCallable(functions, functionName);

      // Special handling for QR code generation
      let result: any;
      if (featureId === 'embed-qr-code') {
        result = await callable({
          jobId,
          config: {
            type: 'profile',
            metadata: {
              title: 'Professional Profile QR Code',
              description: 'Scan to view my professional profile',
              tags: ['cv', 'profile', 'professional']
            }
          }
        });
      } else {
        result = await callable({ jobId, featureId });
      }

      const data = result.data as any;
      if (!data.success) {
        throw new Error(data.error || `${functionName} failed`);
      }

      console.warn(`✅ ${functionName} completed successfully`);

      // For QR code generation, we need to create HTML from the response
      if (featureId === 'embed-qr-code' && data.qrCode) {
        const qrCode = data.qrCode;
        const qrHtml = `
          <section class="qr-code-section" data-feature="embed-qr-code">
            <div class="qr-code-container">
              <h3>Quick Access</h3>
              <div class="qr-code-display">
                <img src="${qrCode.qrImageUrl}" alt="${qrCode.metadata.title}" class="qr-code-image" />
                <p class="qr-code-description">${qrCode.metadata.description}</p>
                <p class="qr-code-instructions">Scan with your phone to view this profile</p>
              </div>
            </div>
            <style>
              .qr-code-section {
                margin: 2rem 0;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                text-align: center;
              }
              .qr-code-container h3 {
                margin-bottom: 1rem;
                color: #333;
                font-size: 1.25rem;
              }
              .qr-code-image {
                max-width: 200px;
                height: auto;
                margin: 0 auto 1rem;
                display: block;
                border: 1px solid #ddd;
                border-radius: 4px;
              }
              .qr-code-description {
                font-weight: 600;
                color: #555;
                margin-bottom: 0.5rem;
              }
              .qr-code-instructions {
                font-size: 0.875rem;
                color: #666;
                font-style: italic;
              }
            </style>
          </section>
        `;
        return qrHtml;
      }

      // For availability calendar generation, extract featureData (React component data)
      if (featureId === 'availability-calendar' && data.featureData) {
        console.warn(`🔧 [availability-calendar] Extracted feature data:`, data.featureData);
        // Return a placeholder that will be replaced by React component
        return `<div id="availability-calendar-placeholder" data-feature="availability-calendar" data-professional-name="${data.featureData.professionalName}" data-professional-email="${data.featureData.professionalEmail}"></div>`;
      }

      return data.html || data.htmlFragment || '';
    } catch (error: any) {
      console.error(`❌ Error calling ${functionName}:`, error);
      throw new Error(error.message || `Failed to generate ${featureId}`);
    }
  }, [jobId]);

  // Advanced HTML merging with feature-specific strategies
  const mergeFeatureHtml = useCallback((baseHtml: string, featureHtml: string, featureId: string): string => {
    try {
      if (!featureHtml.trim()) {
        return baseHtml;
      }

      // Feature-specific merge strategies
      const mergeStrategy = getMergeStrategy(featureId);

      switch (mergeStrategy.type) {
        case 'replace-section':
          return replaceSectionMerge(baseHtml, featureHtml, featureId, mergeStrategy);
        case 'insert-after':
          return insertAfterMerge(baseHtml, featureHtml, featureId, mergeStrategy);
        case 'insert-before':
          return insertBeforeMerge(baseHtml, featureHtml, featureId, mergeStrategy);
        case 'append-body':
        default:
          return appendToBodyMerge(baseHtml, featureHtml, featureId);
      }
    } catch (error) {
      console.error(`❌ Error merging feature HTML for ${featureId}:`, error);
      return baseHtml; // Return base HTML if merge fails
    }
  }, []);

  // Get merge strategy for specific feature
  const getMergeStrategy = (featureId: string) => {
    const strategies: Record<string, any> = {
      'skills-visualization': {
        type: 'insert-after',
        target: '<section class="summary"',
        fallback: 'append-body'
      },
      'certification-badges': {
        type: 'insert-after',
        target: '<section class="education"',
        fallback: 'append-body'
      },
      'calendar-integration': {
        type: 'insert-after',
        target: '<section class="experience"',
        fallback: 'append-body'
      },
      'interactive-timeline': {
        type: 'replace-section',
        target: '<section class="experience"',
        endTarget: '</section>',
        fallback: 'append-body'
      },
      'language-proficiency': {
        type: 'insert-after',
        target: '<section class="skills"',
        fallback: 'append-body'
      },
      'portfolio-gallery': {
        type: 'insert-before',
        target: '<footer',
        fallback: 'append-body'
      },
      'video-introduction': {
        type: 'insert-after',
        target: '<header',
        fallback: 'append-body'
      },
      'generate-podcast': {
        type: 'insert-before',
        target: '<footer',
        fallback: 'append-body'
      },
      'embed-qr-code': {
        type: 'insert-after',
        target: '<section class="contact"',
        fallback: 'append-body'
      },
      'availability-calendar': {
        type: 'insert-before',
        target: '<footer',
        fallback: 'append-body'
      }
    };

    return strategies[featureId] || { type: 'append-body' };
  };

  // Replace section merge strategy
  const replaceSectionMerge = (baseHtml: string, featureHtml: string, featureId: string, strategy: any): string => {
    const startIndex = baseHtml.indexOf(strategy.target);
    if (startIndex === -1) {
      return appendToBodyMerge(baseHtml, featureHtml, featureId);
    }

    const endIndex = baseHtml.indexOf(strategy.endTarget, startIndex);
    if (endIndex === -1) {
      return appendToBodyMerge(baseHtml, featureHtml, featureId);
    }

    const beforeSection = baseHtml.substring(0, startIndex);
    const afterSection = baseHtml.substring(endIndex + strategy.endTarget.length);

    const wrappedFeatureHtml = `
      <div class="progressive-feature progressive-replacement" data-feature="${featureId}" data-replaced-section="true">
        ${featureHtml}
      </div>
    `;

    return beforeSection + wrappedFeatureHtml + afterSection;
  };

  // Insert after target merge strategy
  const insertAfterMerge = (baseHtml: string, featureHtml: string, featureId: string, strategy: any): string => {
    const targetIndex = baseHtml.indexOf(strategy.target);
    if (targetIndex === -1) {
      return appendToBodyMerge(baseHtml, featureHtml, featureId);
    }

    // Find the end of the target section
    const sectionStart = targetIndex;
    let sectionEnd = baseHtml.indexOf('</section>', sectionStart);
    if (sectionEnd === -1) {
      sectionEnd = baseHtml.indexOf('<section', sectionStart + 1);
      if (sectionEnd === -1) {
        sectionEnd = baseHtml.indexOf('</main>', sectionStart);
        if (sectionEnd === -1) {
          return appendToBodyMerge(baseHtml, featureHtml, featureId);
        }
      }
    } else {
      sectionEnd += '</section>'.length;
    }

    const beforeTarget = baseHtml.substring(0, sectionEnd);
    const afterTarget = baseHtml.substring(sectionEnd);

    const wrappedFeatureHtml = `
      <div class="progressive-feature progressive-insert-after" data-feature="${featureId}">
        ${featureHtml}
      </div>
    `;

    return beforeTarget + '\n' + wrappedFeatureHtml + afterTarget;
  };

  // Insert before target merge strategy
  const insertBeforeMerge = (baseHtml: string, featureHtml: string, featureId: string, strategy: any): string => {
    const targetIndex = baseHtml.indexOf(strategy.target);
    if (targetIndex === -1) {
      return appendToBodyMerge(baseHtml, featureHtml, featureId);
    }

    const beforeTarget = baseHtml.substring(0, targetIndex);
    const afterTarget = baseHtml.substring(targetIndex);

    const wrappedFeatureHtml = `
      <div class="progressive-feature progressive-insert-before" data-feature="${featureId}">
        ${featureHtml}
      </div>
    `;

    return beforeTarget + wrappedFeatureHtml + '\n' + afterTarget;
  };

  // Default append to body merge strategy
  const appendToBodyMerge = (baseHtml: string, featureHtml: string, featureId: string): string => {
    const bodyCloseIndex = baseHtml.lastIndexOf('</body>');
    if (bodyCloseIndex === -1) {
      // Fallback: append to end
      return baseHtml + '\n' + `<div class="progressive-feature progressive-append" data-feature="${featureId}">${featureHtml}</div>`;
    }

    const beforeBody = baseHtml.substring(0, bodyCloseIndex);
    const afterBody = baseHtml.substring(bodyCloseIndex);

    // Wrap feature HTML in a container
    const wrappedFeatureHtml = `
      <div class="progressive-feature progressive-append" data-feature="${featureId}">
        ${featureHtml}
      </div>
    `;

    return beforeBody + wrappedFeatureHtml + '\n' + afterBody;
  };

  // Update feature progress
  const updateFeatureProgress = useCallback((featureId: string, updates: Partial<FeatureProgress>) => {
    setState(prev => {
      const features = prev.features.map(feature =>
        feature.id === featureId ? { ...feature, ...updates, timestamp: Date.now() } : feature
      );

      // Calculate overall progress
      const totalFeatures = features.length;
      const completedFeatures = features.filter(f => f.status === 'completed').length;
      const overallProgress = totalFeatures > 0 ? (completedFeatures / totalFeatures) * 100 : 0;
      const isComplete = completedFeatures === totalFeatures;

      return {
        ...prev,
        features,
        overallProgress,
        isComplete
      };
    });
  }, []);

  // Process single feature with enhanced error recovery and performance monitoring
  const processFeature = useCallback(async (featureId: string) => {
    const retryKey = featureId;
    retryCountRef.current[retryKey] = retryCountRef.current[retryKey] || 0;
    const featureName = FEATURE_NAMES[featureId] || featureId;
    const currentAttempt = retryCountRef.current[retryKey] + 1;

    try {
      // Start performance monitoring
      if (user) {
        performanceMonitorService.startFeatureMonitoring(featureId, featureName, user.uid, jobId);
      }

      updateFeatureProgress(featureId, { status: 'processing', progress: 25 });

      const featureHtml = await callLegacyFunction(featureId);
      updateFeatureProgress(featureId, { progress: 75 });

      // Optimize CSS in the feature HTML
      const optimizedFeatureHtml = cssOptimizerService.optimizeHTMLFragment(
        featureHtml,
        featureId,
        {
          minify: true,
          removeDuplicates: true,
          optimizeColors: true,
          optimizeUnits: true,
          mergeMediaQueries: true
        }
      );

      updateFeatureProgress(featureId, { progress: 80 });

      // Validate the optimized HTML fragment
      const validationResult = htmlValidatorService.validateHTML(
        optimizedFeatureHtml,
        featureId,
        {
          checkAccessibility: true,
          checkPerformance: true,
          checkSemantics: true,
          wcagLevel: 'AA',
          strictMode: false
        }
      );

      // Log validation results
      console.warn(`🔍 HTML validation for ${featureName}: ${validationResult.score}/100`);

      // Store validation results in performance monitoring
      if (user) {
        const validationMetrics = {
          validationScore: validationResult.score,
          isValid: validationResult.isValid,
          errorCount: validationResult.errors.length,
          warningCount: validationResult.warnings.length,
          accessibility: {
            wcagLevel: validationResult.accessibility.wcagLevel,
            score: validationResult.accessibility.score
          },
          performance: {
            score: validationResult.performance.score,
            domComplexity: validationResult.performance.metrics.domComplexity
          },
          semantics: {
            score: validationResult.semantics.score,
            semanticElements: validationResult.semantics.structure.semanticElements
          }
        };

        // Add validation metrics to the active monitoring
        const activeMetrics = performanceMonitorService.getActiveMonitoring();
        const currentMetric = activeMetrics.find(m => m.featureId === featureId);
        if (currentMetric) {
          (currentMetric as any).validation = validationMetrics;
        }
      }

      // If validation fails critically, reject the feature
      if (!validationResult.isValid && validationResult.errors.some(e => e.severity === 'critical')) {
        throw new Error(`HTML validation failed: ${validationResult.errors
          .filter(e => e.severity === 'critical')
          .map(e => e.message)
          .join(', ')}`);
      }

      // Show warnings for non-critical issues
      if (validationResult.warnings.length > 0) {
        console.warn(`⚠️ HTML validation warnings for ${featureName}:`, validationResult.warnings);
      }

      updateFeatureProgress(featureId, { progress: 90 });

      // Merge with current HTML
      setState(prev => {
        const newHtml = mergeFeatureHtml(prev.currentHtml || prev.baseHtml || '', optimizedFeatureHtml, featureId);
        return {
          ...prev,
          currentHtml: newHtml
        };
      });

      updateFeatureProgress(featureId, {
        status: 'completed',
        progress: 100,
        html: optimizedFeatureHtml
      });

      // Complete performance monitoring
      if (user) {
        performanceMonitorService.completeFeatureMonitoring(featureId, optimizedFeatureHtml);
      }

      // Reset retry count on success
      delete retryCountRef.current[retryKey];

      toast.success(`${featureName} added successfully!`);
    } catch (error: any) {
      console.error(`❌ Error processing feature ${featureId}:`, error);

      // Analyze error with enhanced error recovery service
      const errorContext = errorRecoveryService.analyzeError(
        error,
        featureId,
        featureName,
        jobId,
        user?.uid || 'anonymous',
        currentAttempt
      );

      // Calculate recovery strategy
      const recoveryResult = errorRecoveryService.calculateRecovery(errorContext);

      // Record retry attempt in performance monitoring
      if (user) {
        performanceMonitorService.recordRetryAttempt(featureId);
      }

      // Record retry attempt in error recovery service
      errorRecoveryService.recordRetryAttempt(
        featureId,
        currentAttempt,
        error.message,
        performance.now(),
        recoveryResult.strategy
      );

      // Check if we should retry based on enhanced analysis
      if (recoveryResult.shouldRetry && retryCountRef.current[retryKey] < retryAttempts) {
        retryCountRef.current[retryKey] = currentAttempt;

        console.warn(`🔄 Enhanced retry for ${featureName} (attempt ${currentAttempt}/${retryAttempts})`);
        console.warn(`📊 Recovery strategy: ${recoveryResult.strategy}`);
        console.warn(`🎯 Success probability: ${(recoveryResult.estimatedSuccessProbability * 100).toFixed(1)}%`);
        console.warn(`⚡ Recovery actions: ${recoveryResult.recoveryActions.join(', ')}`);

        if (recoveryResult.alternativeApproach) {
          console.warn(`🔀 Alternative approach available: ${recoveryResult.alternativeApproach}`);
        }

        // Show user-friendly retry message with strategy info
        toast.loading(`Retrying ${featureName} with ${recoveryResult.strategy} strategy...`, {
          duration: Math.min(recoveryResult.delayMs, 5000)
        });

        // Use enhanced delay calculation instead of simple exponential backoff
        setTimeout(() => {
          processFeature(featureId);
        }, recoveryResult.delayMs);
      } else {
        // Complete performance monitoring with error
        if (user) {
          performanceMonitorService.completeFeatureMonitoring(featureId, undefined, error.message);
        }

        updateFeatureProgress(featureId, {
          status: 'failed',
          error: error.message
        });

        // Clear retry history for this feature
        errorRecoveryService.clearRetryHistory(featureId);

        // Show enhanced error message with recovery suggestions
        const errorStats = errorRecoveryService.getErrorStatistics();
        let errorMessage = `Failed to generate ${featureName}`;

        if (recoveryResult.alternativeApproach) {
          errorMessage += `. Try: ${recoveryResult.alternativeApproach}`;
        }

        toast.error(errorMessage, { duration: 6000 });
        delete retryCountRef.current[retryKey];
      }
    }
  }, [callLegacyFunction, mergeFeatureHtml, updateFeatureProgress, retryAttempts, retryDelay]);

  // Start progressive enhancement process - memoized to prevent excessive recreation
  const startEnhancement = useCallback(async () => {
    if (!user || !jobId || memoizedSelectedFeatures.length === 0) {
      return;
    }

    // Check if all selected features are server-side generated
    const SERVER_SIDE_FEATURES = ['contact-form', 'social-media-links'];
    const clientSideFeatures = memoizedSelectedFeatures.filter(
      featureId => !SERVER_SIDE_FEATURES.includes(featureId)
    );

    if (clientSideFeatures.length === 0) {
      console.warn('🏗️ [useProgressiveEnhancement] All selected features are server-side generated, skipping progressive enhancement');

      // Still fetch and display the base HTML which already contains the server-side features
      try {
        const baseHtml = await fetchBaseHtml();
        setState(prev => ({
          ...prev,
          baseHtml,
          currentHtml: baseHtml,
          isLoading: false,
          isComplete: true,
          overallProgress: 100
        }));
        console.warn('✅ [useProgressiveEnhancement] Server-side generated CV loaded successfully');
      } catch (error: any) {
        console.error('❌ Error loading base HTML:', error);
        setState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false
        }));
      }
      return;
    }

    console.warn('🔥 [useProgressiveEnhancement] startEnhancement called for job:', jobId);

    try {
      setState(prev => {
        // Check if already processing to prevent duplicate calls
        if (prev.isLoading) {
          console.warn('⚠️ [useProgressiveEnhancement] Already processing, ignoring duplicate call');
          return prev;
        }
        return { ...prev, isLoading: true, error: null };
      });

      // Start system performance monitoring
      performanceMonitorService.startSystemMonitoring();

      // Initialize features first - this ensures they're displayed even if priority calculation fails
      const features = initializeFeatures();

      // Fetch and display base HTML immediately
      console.warn('📄 Fetching base HTML...');
      const baseHtml = await fetchBaseHtml();
      setState(prev => ({
        ...prev,
        baseHtml,
        currentHtml: baseHtml,
        isLoading: false // Set to false so base CV is visible during processing
      }));

      // Attempt to calculate optimal feature priorities using intelligent ordering
      let orderedFeatureIds: string[] = [];
      let prioritizedFeatures: any[] = [];

      try {
        console.warn('🧠 Calculating optimal feature priorities...');
        const priorityContext = {
          userId: user.uid,
          jobId,
          selectedFeatures: clientSideFeatures, // Use filtered client-side features
          totalTimeEstimate: clientSideFeatures.length * 5, // rough estimate
          currentSystemLoad: 0.5, // would get from performance monitoring
          previousSuccessRates: {}, // would load from historical data
          userPreferences: await featurePriorityService.getUserPreferences(user.uid)
        };

        prioritizedFeatures = await featurePriorityService.calculatePriorities(priorityContext);

        // Check if priority calculation returned valid results
        if (prioritizedFeatures && prioritizedFeatures.length > 0) {
          orderedFeatureIds = prioritizedFeatures.map(p => p.featureId);

          // Log priority analysis
          const analysis = featurePriorityService.getPriorityAnalysis(prioritizedFeatures);
          console.warn('📊 Priority Analysis:', analysis);
          console.warn('🎯 Recommendations:', analysis.recommendations);

          // Show priority recommendations to user
          if (analysis.recommendations.length > 0) {
            toast.success(`Smart ordering applied: ${analysis.recommendations[0]}`, { duration: 4000 });
          }

          console.warn('🚀 Processing features in optimized order:', orderedFeatureIds.map(id => FEATURE_NAMES[id] || id));
        } else {
          throw new Error('Priority service returned empty results');
        }

      } catch (priorityError: any) {
        console.warn('⚠️ Priority calculation failed, falling back to original order:', priorityError.message);
        // Fallback to original order when priority service fails
        orderedFeatureIds = [...clientSideFeatures]; // Use filtered client-side features
        console.warn('🚀 Processing features in original order:', orderedFeatureIds.map(id => FEATURE_NAMES[id] || id));
        toast('Processing features in default order', { duration: 3000 });
      }

      // Ensure we have features to process
      if (orderedFeatureIds.length === 0) {
        console.error('❌ No features to process after priority calculation and fallback');
        toast.error('No features available for processing');
        return;
      }

      // Process features in determined order (either prioritized or fallback)
      for (let i = 0; i < orderedFeatureIds.length; i++) {
        const featureId = orderedFeatureIds[i];
        const featureName = FEATURE_NAMES[featureId] || featureId;
        const progress = ((i + 1) / orderedFeatureIds.length) * 100;

        console.warn(`🔄 Processing feature ${i + 1}/${orderedFeatureIds.length}: ${featureName} (${progress.toFixed(1)}% complete)`);

        // Show progress toast for each feature
        toast.loading(`Processing ${featureName}... (${i + 1}/${orderedFeatureIds.length})`, {
          id: `feature-${featureId}`, // Use consistent ID to replace previous toasts
          duration: 0 // Keep toast until manually dismissed
        });

        try {
          await processFeature(featureId);

          // Dismiss the loading toast and show success
          toast.dismiss(`feature-${featureId}`);
          toast.success(`✅ ${featureName} completed`, { duration: 2000 });

        } catch (error) {
          // Dismiss the loading toast and show error
          toast.dismiss(`feature-${featureId}`);
          console.error(`❌ Feature ${featureName} failed:`, error);
          // Note: processFeature handles its own error toasts, so we don't duplicate
        }

        // Update overall progress
        setState(prev => ({
          ...prev,
          overallProgress: Math.round(progress)
        }));

        // Intelligent delay based on system load and next feature complexity
        if (i < orderedFeatureIds.length - 1) {
          let delay = 500; // default delay

          if (prioritizedFeatures.length > 0) {
            // Use intelligent delay if we have priority information
            const nextFeature = prioritizedFeatures.find(p => p.featureId === orderedFeatureIds[i + 1]);
            delay = nextFeature?.technicalComplexity ? Math.min(1000, nextFeature.technicalComplexity * 100) : 500;
          }

          console.warn(`⏱️ Waiting ${delay}ms before next feature...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      console.warn('🎉 All features processed successfully!');

      // Generate performance report when all features are complete
      if (user) {
        try {
          await performanceMonitorService.generatePerformanceReport(jobId, user.uid);
          console.warn('📊 Performance report generated successfully');
        } catch (reportError) {
          console.error('❌ Error generating performance report:', reportError);
        }

        // Update user preferences based on completed and failed features - get current state
        try {
          setState(currentState => {
            const completedFeatures = currentState.features.filter(f => f.status === 'completed').map(f => f.id);
            const failedFeatures = currentState.features.filter(f => f.status === 'failed').map(f => f.id);

            // Update preferences asynchronously without blocking
            featurePriorityService.updateUserPreferences(user.uid, completedFeatures, failedFeatures)
              .then(() => console.warn('👤 User preferences updated based on session results'))
              .catch((prefsError: any) => console.error('❌ Error updating user preferences:', prefsError));

            return currentState;
          });
        } catch (prefsError) {
          console.error('❌ Error updating user preferences:', prefsError);
        }
      }

      // Stop system monitoring
      performanceMonitorService.stopSystemMonitoring();

    } catch (error: any) {
      console.error('❌ Error starting progressive enhancement:', error);

      // Stop monitoring on error
      performanceMonitorService.stopSystemMonitoring();

      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
      toast.error('Failed to start CV enhancement');
    }
  }, [user?.uid, jobId, memoizedSelectedFeatures, initializeFeatures, fetchBaseHtml, processFeature]);

  // Set up real-time job subscription for progress tracking via JobSubscriptionManager
  useEffect(() => {
    if (!user || !jobId) {
      return;
    }

    // Check if there's already an active subscription to prevent duplicates
    if (unsubscribeRef.current) {
      console.warn('⚠️ [useProgressiveEnhancement] Cleaning up existing subscription before creating new one');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    const handleJobUpdate = (job: Job | null) => {
      if (!job) {
        return;
      }

      console.warn('📊 Job update received via JobSubscriptionManager for job:', jobId);

      // Update progress based on job enhancedFeatures data
      if (job.enhancedFeatures) {
        setState(prev => ({
          ...prev,
          features: prev.features.map(feature => {
            const firestoreFeature = job.enhancedFeatures?.[feature.id];
            return firestoreFeature ? { ...feature, ...firestoreFeature } : feature;
          })
        }));
      }
    };

    console.warn('🔔 [useProgressiveEnhancement] Setting up job subscription for:', jobId);

    // Subscribe to job updates via JobSubscriptionManager
    const unsubscribeFromJob = jobSubscriptionManager.subscribeToJob(jobId, handleJobUpdate, {
      enableLogging: true,
      debounceMs: 200, // Add some debouncing to prevent excessive updates
      callbackType: 'features' as any // Type cast for compatibility
    });

    // Store unsubscribe function
    unsubscribeRef.current = unsubscribeFromJob;

    return () => {
      console.warn('🧹 [useProgressiveEnhancement] Cleaning up job subscription for:', jobId);
      unsubscribeFromJob();
      unsubscribeRef.current = null;
    };
  }, [user, jobId]);

  // Auto-start enhancement if enabled - use ref to prevent infinite loop
  const hasStartedRef = useRef(false);
  const lastJobIdRef = useRef<string>('');
  const lastFeaturesHashRef = useRef<string>('');

  // Reset hasStarted flag when jobId or selectedFeatures change
  useEffect(() => {
    const featuresHash = memoizedSelectedFeatures.join(',');
    if (jobId !== lastJobIdRef.current || featuresHash !== lastFeaturesHashRef.current) {
      hasStartedRef.current = false;
      lastJobIdRef.current = jobId;
      lastFeaturesHashRef.current = featuresHash;
    }
  }, [jobId, memoizedSelectedFeatures]);

  useEffect(() => {
    console.warn('🚀 [useProgressiveEnhancement] Auto-start check:', {
      autoStart,
      featuresCount: memoizedSelectedFeatures.length,
      hasStarted: hasStartedRef.current,
      jobId
    });

    if (autoStart && memoizedSelectedFeatures.length > 0 && !hasStartedRef.current) {
      console.warn('✅ [useProgressiveEnhancement] Starting enhancement for job:', jobId);
      hasStartedRef.current = true;
      startEnhancement();
    }
  }, [autoStart, memoizedSelectedFeatures.length, jobId]); // Track actual length and jobId, not boolean comparison

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Public API
  return {
    ...state,
    startEnhancement,
    retryFeature: processFeature,
    isProcessing: state.features.some(f => f.status === 'processing'),
    completedFeatures: state.features.filter(f => f.status === 'completed'),
    failedFeatures: state.features.filter(f => f.status === 'failed'),
    pendingFeatures: state.features.filter(f => f.status === 'pending')
  };
}