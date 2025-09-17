import React, { useEffect } from 'react';
import type { CVPreviewProps } from '../../types/cv-preview';
import type { CVParsedData } from '../../types/cvData';
import { useCVPreview } from '../../hooks/cv-preview/useCVPreview';
import { useAutoSave } from '../../hooks/cv-preview/useAutoSave';
import { useAchievementAnalysis } from '../../hooks/cv-preview/useAchievementAnalysis';
import { useKeyboardShortcuts } from '../../utils/cv-preview/keyboardShortcuts';
import { useHasComparison } from '../../hooks/cv-preview/useCVComparison';
import { isObject } from '../../types/error-handling';
import { CVPreviewToolbar } from './CVPreviewToolbar';
import { CVPreviewContent } from './CVPreviewContent';
import { CVComparisonView } from '../cv-comparison/CVComparisonView';
import { SectionEditor } from '../SectionEditor';
import { QRCodeEditor } from '../QRCodeEditor';

export const CVPreview: React.FC<CVPreviewProps> = ({
  job,
  selectedTemplate,
  selectedFeatures,
  appliedImprovements,
  onUpdate,
  disableComparison = false,
  // onFeatureToggle functionality not implemented yet
  className = ''
}) => {
  // Main CV preview state management
  const { state, actions, settings } = useCVPreview(job, appliedImprovements, onUpdate);

  // Auto-save functionality
  const { triggerAutoSave } = useAutoSave(
    state.autoSaveEnabled,
    (data) => {
      if (onUpdate && isObject(data)) {
        onUpdate(data as Partial<CVParsedData>);
        // Note: In a real implementation, we would update lastSaved and hasUnsavedChanges
        // This would require exposing these setters from the useCVPreview hook
      }
    }
  );

  // Achievement analysis
  const {
    achievementAnalysis,
    handleAchievementAnalysis
  } = useAchievementAnalysis(
    job.id,
    selectedFeatures.achievementhighlighting || false
  );

  // Check if comparison is available
  const hasComparison = useHasComparison(job.parsedData, appliedImprovements);

  // Keyboard shortcuts
  const handleKeyDown = useKeyboardShortcuts(
    state.isEditing,
    state.hasUnsavedChanges,
    () => {
      if (onUpdate && state.hasUnsavedChanges) {
        onUpdate(state.previewData);
      }
    },
    actions.toggleEditing,
    () => {
      actions.setEditingSection(null);
      actions.toggleEditing();
    }
  );

  // Setup keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle section editing with auto-save
  const handleSectionEdit = (section: string, newValue: unknown) => {
    actions.handleSectionEdit(section, newValue);
    
    if (state.autoSaveEnabled) {
      const updatedData = { ...state.previewData };
      // Apply the same logic as in the hook
      switch (section) {
        case 'personalInfo':
          if (isObject(newValue)) {
            updatedData.personalInfo = { ...updatedData.personalInfo, ...newValue };
          }
          break;
        case 'summary':
          if (typeof newValue === 'string') {
            updatedData.summary = newValue;
          }
          break;
        case 'experience':
          if (Array.isArray(newValue)) {
            updatedData.experience = newValue;
          }
          break;
        case 'education':
          if (Array.isArray(newValue)) {
            updatedData.education = newValue;
          }
          break;
        case 'skills':
          if (isObject(newValue)) {
            updatedData.skills = { ...updatedData.skills, ...newValue };
          }
          break;
      }
      triggerAutoSave(updatedData);
    }
  };

  // Main preview content component
  const previewContent = (
    <>
      {/* Toolbar */}
      <CVPreviewToolbar
        isEditing={state.isEditing}
        showFeaturePreviews={state.showFeaturePreviews}
        autoSaveEnabled={state.autoSaveEnabled}
        hasUnsavedChanges={state.hasUnsavedChanges}
        lastSaved={state.lastSaved}
        selectedTemplate={selectedTemplate}
        showPreviewBanner={state.showPreviewBanner}
        appliedImprovements={appliedImprovements || state.previewData}
        onToggleEditing={actions.toggleEditing}
        onToggleFeaturePreviews={actions.toggleFeaturePreviews}
        onToggleAutoSave={actions.toggleAutoSave}
        onExpandAllSections={actions.expandAllSections}
        onCollapseAllSections={actions.collapseAllSections}
        onCloseBanner={actions.closeBanner}
      />

      {/* Content */}
      <CVPreviewContent
        previewData={state.previewData}
        selectedTemplate={selectedTemplate}
        selectedFeatures={selectedFeatures}
        showFeaturePreviews={state.showFeaturePreviews}
        collapsedSections={state.collapsedSections}
        qrCodeSettings={settings.qrCodeSettings}
        isEditing={state.isEditing}
        editingSection={state.editingSection}
        achievementAnalysis={achievementAnalysis}
        showPlaceholderBanner={state.showPlaceholderBanner}
        useBackendPreview={import.meta.env.VITE_USE_BACKEND_PREVIEW === 'true'}
        jobId={job.id}
        onSectionEdit={handleSectionEdit}
        onToggleSection={actions.toggleSection}
        onEditQRCode={actions.startEditingQRCode}
        onAnalyzeAchievements={handleAchievementAnalysis}
        onStartEditing={actions.startEditing}
        onDismissPlaceholderBanner={actions.closePlaceholderBanner}
      />
    </>
  );

  return (
    <div className={`cv-preview-wrapper ${className}`}>
      {/* Only show comparison view if not disabled and improvements are available */}
      {hasComparison && !disableComparison ? (
        <CVComparisonView
          originalData={job.parsedData}
          improvedData={appliedImprovements || state.previewData}
          className="h-full"
        >
          {previewContent}
        </CVComparisonView>
      ) : (
        previewContent
      )}

      {/* Section Editor Modal */}
      {state.editingSection && (
        <SectionEditor
          section={state.editingSection}
          data={(state.previewData as CVParsedData)?.[state.editingSection] || state.previewData}
          onSave={(newValue) => handleSectionEdit(state.editingSection!, newValue)}
          onCancel={() => actions.setEditingSection(null)}
        />
      )}

      {/* QR Code Editor Modal */}
      {state.isEditingQRCode && (
        <QRCodeEditor
          settings={settings.qrCodeSettings}
          jobId={job.id}
          onSave={actions.handleQRCodeUpdate}
          onCancel={() => actions.setEditingSection(null)}
        />
      )}
    </div>
  );
};