/**
 * Generated CV Display Component (Minimal)
 *
 * Main component for displaying generated CV content with editing
 * capabilities, template switching, and export options.
 *
 * This is a minimal implementation that delegates complex logic
 * to smaller, focused components while staying under 200 lines.
 */

import React, { useState, useCallback } from 'react';

import type {
  GeneratedCVDisplayProps,
  EditorMode,
  ExportFormat,
  ExportOptions
} from './types';

import { CVDisplayHeader } from './CVDisplayHeader';
import { ContentArea } from './components/ContentArea';
import { ModalManager } from './components/ModalManager';

import { useCVGeneration } from '../../hooks/useCVGeneration';
import { useTemplates } from '../../hooks/useTemplates';

/**
 * Generated CV Display Component
 */
export const GeneratedCVDisplay: React.FC<GeneratedCVDisplayProps> = ({
  job,
  analysis,
  template: initialTemplate,
  editing = false,
  onTemplateChange,
  onContentUpdate,
  onExport,
  onVersionSave,
  className = ''
}) => {
  // State management
  const [mode, setMode] = useState<EditorMode>(editing ? 'edit' : 'view');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks
  const cvGeneration = useCVGeneration();
  const templates = useTemplates();

  // Event handlers
  const handleModeChange = useCallback((newMode: EditorMode) => {
    setMode(newMode);
  }, []);

  const handleTemplateChange = useCallback(async (templateId: string) => {
    try {
      await cvGeneration.actions.changeTemplate(templateId);
      onTemplateChange?.(templateId);
      setShowTemplatePicker(false);
    } catch (error) {
      console.error('Failed to change template:', error);
    }
  }, [cvGeneration.actions, onTemplateChange]);

  const handleContentUpdate = useCallback((content: any) => {
    cvGeneration.actions.updateContent(content);
    onContentUpdate?.(content);
  }, [cvGeneration.actions, onContentUpdate]);

  const handleExport = useCallback(async (format: ExportFormat, options?: ExportOptions) => {
    try {
      const url = await cvGeneration.actions.exportCV(format, options);
      onExport?.(format, options);
      setShowExportMenu(false);

      // Trigger download
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `cv-${job.id}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [cvGeneration.actions, onExport, job.id]);

  const handleVersionSave = useCallback(async (description: string) => {
    try {
      await cvGeneration.actions.saveVersion(description);
      onVersionSave?.(description);
      setShowVersionHistory(false);
    } catch (error) {
      console.error('Failed to save version:', error);
    }
  }, [cvGeneration.actions, onVersionSave]);

  return (
    <div className={`generated-cv-display ${className}`}>
      {/* Header with controls */}
      <CVDisplayHeader
        job={job}
        mode={mode}
        onModeChange={handleModeChange}
        onTemplatePickerOpen={() => setShowTemplatePicker(true)}
        onExportMenuOpen={() => setShowExportMenu(true)}
        onVersionHistoryOpen={() => setShowVersionHistory(true)}
        onSettingsOpen={() => setShowSettings(true)}
        loading={cvGeneration.state.loading}
        saving={cvGeneration.state.saving}
        exporting={cvGeneration.state.exporting}
        lastSaved={cvGeneration.state.lastSaved}
      />

      {/* Main content area */}
      <ContentArea
        mode={mode}
        job={job}
        generatedCV={job.generatedCV}
        analysis={analysis}
        template={initialTemplate}
        onContentUpdate={handleContentUpdate}
      />

      {/* Modal management */}
      <ModalManager
        showTemplatePicker={showTemplatePicker}
        showExportMenu={showExportMenu}
        showVersionHistory={showVersionHistory}
        templates={templates.state.templates}
        selectedTemplate={initialTemplate?.id}
        versions={cvGeneration.state.cv?.versions || []}
        templatesLoading={templates.state.loading}
        exportLoading={cvGeneration.state.exporting}
        onTemplateSelect={handleTemplateChange}
        onExport={handleExport}
        onVersionSave={handleVersionSave}
        onCloseTemplatePicker={() => setShowTemplatePicker(false)}
        onCloseExportMenu={() => setShowExportMenu(false)}
        onCloseVersionHistory={() => setShowVersionHistory(false)}
      />

      {/* Features banner */}
      {job.generatedCV?.features && job.generatedCV.features.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-2">Applied Features:</h4>
          <div className="flex flex-wrap gap-2">
            {job.generatedCV.features.map((feature: string) => (
              <span
                key={feature}
                className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full"
              >
                {feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};