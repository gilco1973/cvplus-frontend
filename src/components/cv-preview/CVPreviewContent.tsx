import React, { useRef, useEffect, useMemo } from 'react';
import type { CVPreviewContentProps } from '../../types/cv-preview';
import { CVTemplateGenerator } from '../../utils/cv-preview/cvTemplateGenerator';
import { useFeaturePreviews } from '../../hooks/cv-preview/useFeaturePreviews';
import { PlaceholderBanner } from './PlaceholderBanner';
import { getTemplateComponent, CORE_TEMPLATE_IDS } from '../templates';
import { PROFESSIONAL_TEMPLATES } from '../../data/professional-templates';

export const CVPreviewContent: React.FC<CVPreviewContentProps> = ({
  previewData,
  selectedTemplate,
  selectedFeatures,
  showFeaturePreviews,
  collapsedSections,
  qrCodeSettings,
  isEditing,
  editingSection,
  showPlaceholderBanner,
  useBackendPreview = import.meta.env.VITE_USE_BACKEND_PREVIEW === 'true',
  jobId,
  onSectionEdit,
  onToggleSection,
  onEditQRCode,
  onAnalyzeAchievements,
  onStartEditing,
  onDismissPlaceholderBanner
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const { generateFeaturePreview } = useFeaturePreviews(previewData);

  // Check if we should use the new template system
  const useNewTemplateSystem = CORE_TEMPLATE_IDS.includes(selectedTemplate as any);
  const TemplateComponent = useNewTemplateSystem ? getTemplateComponent(selectedTemplate) : null;
  const templateData = useNewTemplateSystem ? PROFESSIONAL_TEMPLATES[selectedTemplate] : null;

  // Create a stable reference for selectedFeatures to track changes properly
  const selectedFeaturesString = useMemo(() => 
    JSON.stringify(selectedFeatures), 
    [selectedFeatures]
  );
  
  // State for generated HTML to handle async generation
  const [generatedHTML, setGeneratedHTML] = React.useState<string>('');
  const [isGeneratingHTML, setIsGeneratingHTML] = React.useState<boolean>(false);
  
  // Generate HTML asynchronously when dependencies change (for legacy templates only)
  React.useEffect(() => {
    // Skip HTML generation for new template system
    if (useNewTemplateSystem) {
      setIsGeneratingHTML(false);
      return;
    }

    let mounted = true;
    
    const generateHTML = async () => {
      console.log('🔄 [HTML REGENERATION] Regenerating preview HTML due to dependency changes');
      console.log('🔄 [HTML REGENERATION] selectedFeatures:', selectedFeatures);
      console.log('🔄 [HTML REGENERATION] selectedFeaturesString:', selectedFeaturesString);
      console.log('🔄 [HTML REGENERATION] showFeaturePreviews:', showFeaturePreviews);
      console.log('🔄 [HTML REGENERATION] selectedTemplate:', selectedTemplate);
      
      setIsGeneratingHTML(true);
      
      try {
        let html: string;
        
        if (!showFeaturePreviews) {
          // Return basic CV without feature previews
          html = await CVTemplateGenerator.generateHTML(
            previewData,
            selectedTemplate,
            {},
            qrCodeSettings,
            collapsedSections,
            () => '' // No feature previews
          );
        } else {
          html = await CVTemplateGenerator.generateHTML(
            previewData,
            selectedTemplate,
            selectedFeatures,
            qrCodeSettings,
            collapsedSections,
            generateFeaturePreview
          );
        }
        
        if (mounted) {
          setGeneratedHTML(html);
        }
      } catch (error) {
        console.error('❌ [HTML GENERATION] Failed to generate HTML:', error);
        // Fallback to basic template
        if (mounted) {
          setGeneratedHTML('<div class="cv-preview-error">Failed to generate preview. Please try again.</div>');
        }
      } finally {
        if (mounted) {
          setIsGeneratingHTML(false);
        }
      }
    };
    
    generateHTML();
    
    return () => {
      mounted = false;
    };
  }, [useNewTemplateSystem, selectedFeaturesString, previewData, selectedTemplate, showFeaturePreviews, qrCodeSettings, collapsedSections, generateFeaturePreview]);

  // Setup event listeners and DOM interactions
  useEffect(() => {
    if (!previewRef.current) return;

    // Add click handlers for editing
    const editButtons = previewRef.current.querySelectorAll('.edit-overlay');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const section = (e.target as HTMLElement).closest('.editable-section')?.getAttribute('data-section');
        if (section) {
          // This will be handled by the parent component via global function
          console.log('Edit section requested:', section);
        }
      });
    });

    // Add click handlers for collapsing sections
    const sectionTitles = previewRef.current.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
      title.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionElement = (e.target as HTMLElement).closest('.section, .feature-preview');
        const sectionId = sectionElement?.getAttribute('data-section') || 
                          sectionElement?.getAttribute('data-feature');
        if (sectionId) {
          onToggleSection(sectionId);
        }
      });
    });

    // Add global functions for inline HTML calls
    const windowWithFunctions = window as Window & {
      toggleSection?: typeof onToggleSection;
      editSection?: (section: string) => void;
      editQRCode?: typeof onEditQRCode;
      handleAchievementAnalysis?: typeof onAnalyzeAchievements;
    };
    
    windowWithFunctions.toggleSection = onToggleSection;
    windowWithFunctions.editSection = (section: string) => {
      // This should trigger the section editing in the parent component
      console.log('Edit section requested:', section);
    };
    windowWithFunctions.editQRCode = onEditQRCode;
    windowWithFunctions.handleAchievementAnalysis = onAnalyzeAchievements;

    // Add smooth animations for feature previews
    const featurePreviews = previewRef.current.querySelectorAll('.feature-preview');
    featurePreviews.forEach((preview, index) => {
      (preview as HTMLElement).style.animationDelay = `${index * 0.1}s`;
      preview.classList.add('animate-fade-in-up');
    });

    return () => {
      // Clean up global functions
      delete windowWithFunctions.toggleSection;
      delete windowWithFunctions.editSection;
      delete windowWithFunctions.editQRCode;
      delete windowWithFunctions.handleAchievementAnalysis;
    };
  }, [onToggleSection, onEditQRCode, onAnalyzeAchievements, previewData]);

  // Feature updates are now handled automatically through HTML regeneration via useMemo
  // No manual DOM manipulation needed - React will re-render the entire preview when dependencies change

  return (
    <div className="cv-preview-content-wrapper">
      {/* Placeholder Banner */}
      {showPlaceholderBanner && (
        <PlaceholderBanner
          cvData={previewData}
          onDismiss={onDismissPlaceholderBanner}
          onStartEditing={onStartEditing}
          className="mb-4"
          autoHideAfter={15000} // Auto-hide after 15 seconds
        />
      )}
      
      {/* Loading State */}
      {isGeneratingHTML && (
        <div className="cv-preview-loading bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Generating enhanced CV preview...</p>
        </div>
      )}
      
      {/* New Template System - React Components */}
      {useNewTemplateSystem && TemplateComponent && templateData && !isGeneratingHTML && (
        <div 
          ref={previewRef}
          className="cv-preview-content bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <TemplateComponent
            cvData={previewData}
            template={templateData}
            isEditing={isEditing}
            selectedFeatures={selectedFeatures}
            onSectionEdit={onSectionEdit}
            showFeaturePreviews={showFeaturePreviews}
            className="w-full h-full"
          />
        </div>
      )}
      
      {/* Legacy Template System - Generated HTML */}
      {!useNewTemplateSystem && !isGeneratingHTML && (
        <div 
          ref={previewRef}
          className="cv-preview-content bg-white rounded-lg shadow-sm border border-gray-200"
          dangerouslySetInnerHTML={{ __html: generatedHTML }}
        />
      )}
    </div>
  );
};

// Export the component with backward compatibility
CVPreviewContent.displayName = 'CVPreviewContent';

// Debug logging for template system
if (process.env.NODE_ENV === 'development') {
  console.log('🎨 [TEMPLATE SYSTEM] Available core templates:', CORE_TEMPLATE_IDS);
  console.log('🎨 [TEMPLATE SYSTEM] Professional templates loaded:', Object.keys(PROFESSIONAL_TEMPLATES));
}