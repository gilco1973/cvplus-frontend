/**
 * CV Content Display Component
 * Handles CV content rendering with incremental feature enhancement
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Eye, Download, Sparkles } from 'lucide-react';
import { EnhancedFeatureProgress } from '../../hooks/useEnhancedProgressTracking';
import toast from 'react-hot-toast';

interface CVContentDisplayProps {
  baseHTML: string;
  enhancedFeatures: { [key: string]: EnhancedFeatureProgress };
  jobId: string;
  asyncMode?: boolean;
  onFeatureAdded?: (featureId: string) => void;
  className?: string;
}

export const CVContentDisplay: React.FC<CVContentDisplayProps> = ({
  baseHTML,
  enhancedFeatures,
  jobId,
  asyncMode = false,
  onFeatureAdded,
  className = ''
}) => {
  const [currentHTML, setCurrentHTML] = useState(baseHTML);
  const [addedFeatures, setAddedFeatures] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const contentRef = useRef<HTMLDivElement>(null);

  // Integration points for features in CV HTML
  const integrationPoints: { [key: string]: string } = {
    'skills-visualization': '#skills-section, .skills-section, [data-section="skills"]',
    'generate-podcast': '#media-section, .media-section, [data-section="media"]',
    'interactive-timeline': '#experience-section, .experience-section, [data-section="experience"]',
    'portfolio-gallery': '#portfolio-section, .portfolio-section, [data-section="portfolio"]',
    'language-proficiency': '#languages-section, .languages-section, [data-section="languages"]',
    'certification-badges': '#certifications-section, .certifications-section, [data-section="certifications"]',
    'social-media-links': '#contact-section, .contact-section, [data-section="contact"]',
    'achievements-showcase': '#achievements-section, .achievements-section, [data-section="achievements"]',
    'testimonials-carousel': '#testimonials-section, .testimonials-section, [data-section="testimonials"]',
    'embed-qr-code': '#qr-section, .qr-section, [data-section="qr"], .cv-footer'
  };

  // Initialize React components after HTML is rendered or updated
  useEffect(() => {
    if (currentHTML && contentRef.current && viewMode === 'preview') {
      console.log('🔄 [CV-CONTENT] HTML updated, initializing React components...');
      
      // Small delay to ensure DOM is fully updated
      const timer = setTimeout(() => {
        // Call the global function to initialize React components
        if (typeof window !== 'undefined' && (window as any).initializeReactComponents) {
          console.log('🚀 [CV-CONTENT] Calling initializeReactComponents...');
          (window as any).initializeReactComponents();
        } else {
          console.warn('⚠️ [CV-CONTENT] initializeReactComponents not available on window');
          
          // Fallback: check for placeholders
          const placeholders = contentRef.current?.querySelectorAll('.react-component-placeholder');
          if (placeholders && placeholders.length > 0) {
            console.log(`🔄 [CV-CONTENT] Found ${placeholders.length} placeholders, may need React renderer`);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentHTML, viewMode]);

  // Monitor for completed features with HTML fragments
  useEffect(() => {
    if (!asyncMode) return;

    const completedFeatures = Object.entries(enhancedFeatures)
      .filter(([featureId, progress]) => 
        progress.status === 'completed' && 
        progress.htmlFragmentAvailable && 
        progress.htmlFragment &&
        !addedFeatures.has(featureId)
      );

    if (completedFeatures.length > 0) {
      addCompletedFeatures(completedFeatures);
    }
  }, [enhancedFeatures, addedFeatures, asyncMode]);

  // Add completed features to CV HTML
  const addCompletedFeatures = useCallback(async (
    completedFeatures: [string, EnhancedFeatureProgress][]
  ) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      let updatedHTML = currentHTML;
      const newlyAdded = new Set(addedFeatures);
      
      for (const [featureId, progress] of completedFeatures) {
        if (progress.htmlFragment && integrationPoints[featureId]) {
          console.log(`🎨 [CV UPDATE] Adding feature ${featureId} to CV`);
          
          updatedHTML = await injectFeatureHTML(
            updatedHTML, 
            featureId, 
            progress.htmlFragment,
            integrationPoints[featureId]
          );
          
          newlyAdded.add(featureId);
          
          // Show notification for added feature
          toast.success(`✨ ${getFeatureName(featureId)} added to your CV!`, {
            duration: 3000,
            icon: '🎨'
          });
          
          // Callback for feature addition
          if (onFeatureAdded) {
            onFeatureAdded(featureId);
          }
          
          // Add subtle animation delay between features
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      setCurrentHTML(updatedHTML);
      setAddedFeatures(newlyAdded);
      
      console.log(`🎨 [CV UPDATE] Added ${completedFeatures.length} features to CV`);
      
    } catch (error) {
      console.error('❌ [CV UPDATE] Error adding features to CV:', error);
      toast.error('Failed to update CV with new features');
    } finally {
      setIsUpdating(false);
    }
  }, [currentHTML, addedFeatures, onFeatureAdded]);

  // Inject feature HTML into the CV
  const injectFeatureHTML = useCallback(async (
    html: string, 
    featureId: string, 
    htmlFragment: string,
    targetSelectors: string
  ): Promise<string> => {
    try {
      // Parse HTML safely
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try multiple selectors until we find a match
      const selectors = targetSelectors.split(', ');
      let targetElement: Element | null = null;
      
      for (const selector of selectors) {
        targetElement = doc.querySelector(selector.trim());
        if (targetElement) break;
      }
      
      if (targetElement) {
        // Create wrapper for the feature
        const featureWrapper = doc.createElement('div');
        featureWrapper.className = `cv-feature cv-feature-${featureId} animate-fadeIn`;
        featureWrapper.setAttribute('data-feature', featureId);
        featureWrapper.innerHTML = htmlFragment;
        
        // Append to target section
        targetElement.appendChild(featureWrapper);
        
        console.log(`✅ [INJECT] Successfully injected ${featureId} into ${selectors[0]}`);
      } else {
        // If no specific section exists, create a new section
        const bodyElement = doc.body || doc.querySelector('main') || doc.documentElement;
        if (bodyElement) {
          const featureSection = doc.createElement('section');
          featureSection.className = `cv-section cv-section-${featureId} animate-fadeIn`;
          featureSection.setAttribute('data-feature', featureId);
          featureSection.innerHTML = `
            <h3 class="cv-section-title text-lg font-semibold mb-4">${getFeatureName(featureId)}</h3>
            <div class="cv-feature-content">${htmlFragment}</div>
          `;
          
          // Append before the last child or at the end
          const lastChild = bodyElement.lastElementChild;
          if (lastChild && (lastChild.tagName === 'FOOTER' || lastChild.classList.contains('cv-footer'))) {
            bodyElement.insertBefore(featureSection, lastChild);
          } else {
            bodyElement.appendChild(featureSection);
          }
          
          console.log(`✅ [INJECT] Created new section for ${featureId}`);
        }
      }
      
      return doc.documentElement.outerHTML;
      
    } catch (error) {
      console.error(`❌ [INJECT] Error injecting ${featureId}:`, error);
      throw error;
    }
  }, []);

  // Get feature display name
  const getFeatureName = useCallback((featureId: string): string => {
    const featureNames: { [key: string]: string } = {
      'skills-visualization': 'Skills Visualization',
      'generate-podcast': 'Career Podcast',
      'interactive-timeline': 'Interactive Timeline',
      'portfolio-gallery': 'Portfolio Gallery',
      'language-proficiency': 'Language Proficiency',
      'certification-badges': 'Certification Badges',
      'social-media-links': 'Social Media Links',
      'achievements-showcase': 'Achievements Showcase',
      'testimonials-carousel': 'Testimonials',
      'embed-qr-code': 'QR Code'
    };
    
    return featureNames[featureId] || featureId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }, []);

  // Handle download CV
  const handleDownloadCV = useCallback(() => {
    const blob = new Blob([currentHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-cv-${jobId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('CV downloaded successfully!');
  }, [currentHTML, jobId]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* CV Display Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
          Your Enhanced CV
          {asyncMode && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                LIVE UPDATES
              </span>
            </div>
          )}
        </h2>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {addedFeatures.size} enhancements added
          </span>
          {isUpdating && (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
          
          {/* View mode toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'code' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Code
            </button>
          </div>
          
          <button
            onClick={handleDownloadCV}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
        </div>
      </div>
      
      {/* CV Content Container */}
      <div className="cv-container bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Loading overlay when updating */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-cyan-500 animate-spin" />
              <span className="text-gray-700">Adding new features...</span>
            </div>
          </div>
        )}
        
        {/* CV Content */}
        {viewMode === 'preview' ? (
          <div 
            ref={contentRef}
            className="cv-content p-6 overflow-auto max-h-[600px] prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: currentHTML }}
          />
        ) : (
          <div className="cv-code-view p-4 bg-gray-900 text-green-400 font-mono text-xs overflow-auto max-h-[600px]">
            <pre>{currentHTML}</pre>
          </div>
        )}
      </div>
      
      {/* Feature addition log */}
      {asyncMode && addedFeatures.size > 0 && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="text-xs text-gray-400 mb-2">Live enhancements added:</div>
          <div className="flex flex-wrap gap-2">
            {Array.from(addedFeatures).map(featureId => (
              <span 
                key={featureId}
                className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs animate-fadeIn flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                {getFeatureName(featureId)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CSS Styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .cv-feature {
          border-left: 3px solid transparent;
          padding-left: 16px;
          margin: 16px 0;
          transition: border-color 0.3s ease;
        }

        .cv-feature:hover {
          border-left-color: #22d3ee;
        }

        .cv-section {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
          background: #f9fafb;
        }

        .cv-section-title {
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .cv-container {
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .cv-container:hover {
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};