/**
 * Generated CV Display Component (Simplified)
 *
 * Main component for displaying generated CV content with editing
 * capabilities, template switching, and export options.
 */

import React, { useState, useCallback } from 'react';
import { FileText } from 'lucide-react';

import type {
  GeneratedCVDisplayProps,
  EditorMode,
  ExportFormat,
  ExportOptions
} from './types';

import { CVDisplayHeader } from './CVDisplayHeader';
import { CVContentRenderer } from './CVContentRenderer';
import { TemplatePicker } from './TemplatePicker';
import { CVEditor } from './CVEditor';
import { ExportMenu } from './ExportMenu';
import { VersionHistory } from './VersionHistory';
import { CVPreviewPanel } from './CVPreviewPanel';

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

  // Get generated CV content
  const generatedCV = job.generatedCV;
  const hasContent = Boolean(generatedCV?.html || generatedCV?.content);

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

  // Render content based on mode and availability
  const renderContent = () => {
    if (!hasContent) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No generated CV content available</p>
            <p className="text-sm text-gray-500 mt-2">
              Please complete CV processing to view generated content.
            </p>
          </div>
        </div>
      );
    }

    switch (mode) {
      case 'edit':
        return (
          <CVEditor
            job={job}
            content={generatedCV}
            onContentUpdate={handleContentUpdate}
            className="min-h-[800px]"
          />
        );
      case 'preview':
        return (
          <CVPreviewPanel
            job={job}
            content={generatedCV}
            template={initialTemplate}
            className="min-h-[800px]"
          />
        );
      default:
        return (
          <CVContentRenderer
            job={job}
            content={generatedCV}
            analysis={analysis}
            className="min-h-[800px]"
          />
        );
    }
  };

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
      <div className="cv-display-content">
        {renderContent()}
      </div>

      {/* Modals */}
      {showTemplatePicker && (
        <TemplatePicker
          templates={templates.state.templates}
          selectedTemplate={initialTemplate?.id}
          onSelect={handleTemplateChange}
          onClose={() => setShowTemplatePicker(false)}
          loading={templates.state.loading}
        />
      )}

      {showExportMenu && (
        <ExportMenu
          onExport={handleExport}
          onClose={() => setShowExportMenu(false)}
          availableFormats={['pdf', 'docx', 'html', 'png']}
          loading={cvGeneration.state.exporting}
        />
      )}

      {showVersionHistory && (
        <VersionHistory
          versions={cvGeneration.state.cv?.versions || []}
          onVersionSave={handleVersionSave}
          onClose={() => setShowVersionHistory(false)}
          loading={cvGeneration.state.loading}
        />
      )}

      {/* Features banner */}
      {generatedCV?.features && generatedCV.features.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <h4 className="text-sm font-semibold text-gray-200 mb-2">Applied Features:</h4>
          <div className="flex flex-wrap gap-2">
            {generatedCV.features.map((feature) => (
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