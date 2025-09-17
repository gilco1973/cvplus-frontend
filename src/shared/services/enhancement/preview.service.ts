/**
 * Real-time HTML Preview Service
 * 
 * Provides live preview functionality for the CV enhancement process,
 * enabling users to see their CV being enhanced in real-time with
 * safe HTML rendering and WebSocket-based updates.
 */

import { ref, getDownloadURL } from 'firebase/storage';
import { JobSubscriptionManager } from '../JobSubscriptionManager';
import { storage } from '../../lib/firebase';
import type { Job } from '../cvService';

export interface PreviewState {
  baseHtml: string | null;
  currentHtml: string | null;
  features: FeaturePreview[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

export interface FeaturePreview {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  htmlFragment: string | null;
  progress: number;
  estimatedTime?: number;
  processingTime?: number;
  error?: string;
}

export interface PreviewOptions {
  enableRealTime: boolean;
  showProgress: boolean;
  highlightChanges: boolean;
  enableInteraction: boolean;
  updateInterval: number;
}

export class PreviewService {
  private unsubscribe: (() => void) | null = null;
  private previewState: PreviewState = {
    baseHtml: null,
    currentHtml: null,
    features: [],
    isLoading: false,
    error: null,
    lastUpdated: Date.now()
  };
  private listeners: Set<(state: PreviewState) => void> = new Set();
  private options: PreviewOptions = {
    enableRealTime: true,
    showProgress: true,
    highlightChanges: true,
    enableInteraction: false,
    updateInterval: 1000
  };

  /**
   * Initialize preview for a specific job
   */
  async initializePreview(
    jobId: string, 
    userId: string, 
    selectedFeatures: string[],
    options?: Partial<PreviewOptions>
  ): Promise<void> {
    try {
      this.options = { ...this.options, ...options };
      this.updateState({ isLoading: true, error: null });

      // Load base HTML
      await this.loadBaseHtml(jobId, userId);

      // Initialize feature previews
      this.initializeFeatures(selectedFeatures);

      // Start real-time monitoring if enabled
      if (this.options.enableRealTime) {
        this.startRealTimeMonitoring(jobId);
      }

      this.updateState({ isLoading: false });
    } catch (error: unknown) {
      console.error('❌ Error initializing preview:', error);
      this.updateState({ 
        isLoading: false, 
        error: (error as Error)?.message || 'Failed to initialize preview' 
      });
    }
  }

  /**
   * Load base HTML from Firebase Storage
   */
  private async loadBaseHtml(jobId: string, userId: string): Promise<void> {
    try {
      const storageRef = ref(storage, `users/${userId}/generated/${jobId}/cv.html`);
      const downloadUrl = await getDownloadURL(storageRef);
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch base HTML: ${response.status}`);
      }
      
      const baseHtml = await response.text();
      this.updateState({ 
        baseHtml, 
        currentHtml: baseHtml 
      });

      console.warn('✅ Base HTML loaded for preview');
    } catch (error: unknown) {
      console.error('❌ Error loading base HTML:', error);
      throw new Error('Failed to load base CV content');
    }
  }

  /**
   * Initialize feature preview states
   */
  private initializeFeatures(selectedFeatures: string[]): void {
    const featureNames: Record<string, string> = {
      'skills-visualization': 'Skills Visualization',
      'certification-badges': 'Certification Badges',
      'calendar-integration': 'Calendar Integration',
      'interactive-timeline': 'Interactive Timeline',
      'language-proficiency': 'Language Proficiency',
      'portfolio-gallery': 'Portfolio Gallery',
      'video-introduction': 'Video Introduction',
      'generate-podcast': 'Career Podcast'
    };

    const features: FeaturePreview[] = selectedFeatures.map(featureId => ({
      id: featureId,
      name: featureNames[featureId] || featureId,
      status: 'pending',
      htmlFragment: null,
      progress: 0,
      estimatedTime: this.estimateFeatureTime(featureId)
    }));

    this.updateState({ features });
  }

  /**
   * Estimate processing time for features
   */
  private estimateFeatureTime(featureId: string): number {
    const timeEstimates: Record<string, number> = {
      'skills-visualization': 15,
      'certification-badges': 10,
      'calendar-integration': 20,
      'interactive-timeline': 25,
      'language-proficiency': 15,
      'portfolio-gallery': 30,
      'video-introduction': 120,
      'generate-podcast': 180
    };

    return timeEstimates[featureId] || 30;
  }

  /**
   * Start real-time monitoring of job progress
   */
  private startRealTimeMonitoring(jobId: string): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const jobSubscriptionManager = JobSubscriptionManager.getInstance();
    
    this.unsubscribe = jobSubscriptionManager.subscribeToPreview(
      jobId,
      (job: Job | null) => {
        if (job) {
          this.handleJobUpdate(job);
        } else {
          console.warn('📡 No job data received in preview monitoring');
        }
      },
      {
        enableLogging: true,
        debounceMs: 300, // Slightly higher debounce for preview updates
        errorRecovery: true
      }
    );

    console.warn('📡 Started real-time preview monitoring via JobSubscriptionManager');
  }

  /**
   * Handle job document updates from Firestore
   */
  private handleJobUpdate(jobData: Job): void {
    const enhancedFeatures = jobData.enhancedFeatures || {};
    let htmlChanged = false;

    // Update feature statuses and merge completed features
    const updatedFeatures = this.previewState.features.map(feature => {
      const featureKey = this.getFeatureKey(feature.id);
      const featureData = enhancedFeatures[featureKey];

      if (!featureData) return feature;

      const updatedFeature: FeaturePreview = {
        ...feature,
        status: featureData.status || feature.status,
        progress: featureData.progress || feature.progress,
        error: featureData.error
      };

      // Calculate processing time if completed
      if (featureData.status === 'completed' && featureData.startedAt && featureData.processedAt) {
        const startTime = featureData.startedAt.toMillis?.() || featureData.startedAt;
        const endTime = featureData.processedAt.toMillis?.() || featureData.processedAt;
        updatedFeature.processingTime = (endTime - startTime) / 1000;
      }

      // Update HTML fragment if available and not already processed
      if (featureData.htmlFragment && !feature.htmlFragment) {
        updatedFeature.htmlFragment = featureData.htmlFragment;
        htmlChanged = true;
      }

      return updatedFeature;
    });

    // Merge new HTML fragments into current HTML
    if (htmlChanged) {
      const newHtml = this.mergeCompletedFeatures(updatedFeatures);
      this.updateState({ 
        features: updatedFeatures, 
        currentHtml: newHtml,
        lastUpdated: Date.now()
      });
    } else {
      this.updateState({ 
        features: updatedFeatures,
        lastUpdated: Date.now()
      });
    }
  }

  /**
   * Get the correct Firestore key for a feature
   */
  private getFeatureKey(featureId: string): string {
    const keyMap: Record<string, string> = {
      'skills-visualization': 'skillsVisualization',
      'certification-badges': 'certificationBadges',
      'calendar-integration': 'calendarIntegration',
      'interactive-timeline': 'interactiveTimeline',
      'language-proficiency': 'languageProficiency',
      'portfolio-gallery': 'portfolioGallery',
      'video-introduction': 'videoIntroduction',
      'generate-podcast': 'generatePodcast'
    };

    return keyMap[featureId] || featureId;
  }

  /**
   * Merge completed features into current HTML
   */
  private mergeCompletedFeatures(features: FeaturePreview[]): string {
    let currentHtml = this.previewState.baseHtml || '';

    // Process features in dependency order
    const sortedFeatures = this.sortFeaturesByDependency(features);

    for (const feature of sortedFeatures) {
      if (feature.status === 'completed' && feature.htmlFragment) {
        currentHtml = this.mergeFeatureHtml(currentHtml, feature.htmlFragment, feature.id);
      }
    }

    return currentHtml;
  }

  /**
   * Sort features by dependency order for optimal merging
   */
  private sortFeaturesByDependency(features: FeaturePreview[]): FeaturePreview[] {
    const dependencyOrder = [
      'video-introduction',    // Header area
      'skills-visualization',  // After summary
      'certification-badges',  // After education
      'calendar-integration',  // After experience
      'interactive-timeline',  // Replace experience
      'language-proficiency',  // After skills
      'portfolio-gallery',     // Before footer
      'generate-podcast'       // Before footer
    ];

    return features.sort((a, b) => {
      const indexA = dependencyOrder.indexOf(a.id);
      const indexB = dependencyOrder.indexOf(b.id);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }

  /**
   * Merge individual feature HTML (simplified version of advanced merging)
   */
  private mergeFeatureHtml(baseHtml: string, featureHtml: string, featureId: string): string {
    try {
      if (!featureHtml.trim()) return baseHtml;

      // Simple append strategy for preview (full merging happens in production)
      const bodyCloseIndex = baseHtml.lastIndexOf('</body>');
      if (bodyCloseIndex === -1) {
        return baseHtml + '\n' + featureHtml;
      }

      const beforeBody = baseHtml.substring(0, bodyCloseIndex);
      const afterBody = baseHtml.substring(bodyCloseIndex);

      const wrappedFeatureHtml = `
        <div class="preview-feature" data-feature="${featureId}" data-preview="true">
          ${featureHtml}
        </div>
      `;

      return beforeBody + wrappedFeatureHtml + '\n' + afterBody;
    } catch (error) {
      console.error(`❌ Error merging preview HTML for ${featureId}:`, error);
      return baseHtml;
    }
  }

  /**
   * Generate safe HTML for iframe preview
   */
  generateSafePreviewHtml(html: string): string {
    if (!html) return '';

    try {
      // Add preview-specific styles and safety measures
      const safeHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>CV Preview</title>
          <style>
            /* Preview-specific styles */
            .preview-feature {
              position: relative;
              border: 2px dashed #3b82f6;
              border-radius: 8px;
              margin: 1rem 0;
              transition: all 0.3s ease;
            }
            
            .preview-feature::before {
              content: attr(data-feature);
              position: absolute;
              top: -12px;
              left: 10px;
              background: #3b82f6;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
              z-index: 1000;
            }
            
            .preview-feature:hover {
              border-color: #1d4ed8;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }

            /* Disable interactions in preview */
            a { pointer-events: none; }
            button { pointer-events: none; }
            form { pointer-events: none; }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
              .preview-feature {
                margin: 0.5rem 0;
              }
            }
          </style>
        </head>
        <body>
          ${html}
          
          <script>
            // Disable all interactions in preview
            document.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
            }, true);
            
            // Notify parent window of preview events
            window.addEventListener('load', function() {
              if (window.parent) {
                window.parent.postMessage({ type: 'preview-loaded' }, '*');
              }
            });
          </script>
        </body>
        </html>
      `;

      return safeHtml;
    } catch (error) {
      console.error('❌ Error generating safe preview HTML:', error);
      return '<html><body><p>Preview not available</p></body></html>';
    }
  }

  /**
   * Get current preview state
   */
  getPreviewState(): PreviewState {
    return { ...this.previewState };
  }

  /**
   * Subscribe to preview state changes
   */
  subscribe(listener: (state: PreviewState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update preview state and notify listeners
   */
  private updateState(updates: Partial<PreviewState>): void {
    this.previewState = { 
      ...this.previewState, 
      ...updates,
      lastUpdated: Date.now()
    };
    
    this.listeners.forEach(listener => {
      try {
        listener(this.previewState);
      } catch (error) {
        console.error('❌ Error in preview listener:', error);
      }
    });
  }

  /**
   * Calculate overall progress
   */
  getOverallProgress(): number {
    const features = this.previewState.features;
    if (features.length === 0) return 0;

    const totalProgress = features.reduce((sum, feature) => sum + feature.progress, 0);
    return Math.round(totalProgress / features.length);
  }

  /**
   * Get estimated completion time
   */
  getEstimatedCompletion(): number {
    const features = this.previewState.features;
    const pendingFeatures = features.filter(f => f.status === 'pending' || f.status === 'processing');
    
    return pendingFeatures.reduce((total, feature) => {
      const remainingTime = (feature.estimatedTime || 30) * (1 - feature.progress / 100);
      return total + remainingTime;
    }, 0);
  }

  /**
   * Toggle feature highlighting in preview
   */
  toggleFeatureHighlight(featureId: string, highlight: boolean): void {
    // This would be implemented to communicate with the iframe
    // to highlight specific features in the preview
    console.warn(`${highlight ? 'Highlighting' : 'Unhighlighting'} feature: ${featureId}`);
  }

  /**
   * Cleanup preview resources
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    this.listeners.clear();
    this.previewState = {
      baseHtml: null,
      currentHtml: null,
      features: [],
      isLoading: false,
      error: null,
      lastUpdated: Date.now()
    };

    console.warn('🧹 Preview service cleaned up');
  }
}

export const previewService = new PreviewService();