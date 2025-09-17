/**
 * Modal Manager Component
 *
 * Manages all modal states and rendering for the CV display.
 */

import React from 'react';

import { TemplatePicker } from '../TemplatePicker';
import { ExportMenu } from '../ExportMenu';
import { VersionHistory } from '../VersionHistory';

interface ModalManagerProps {
  showTemplatePicker: boolean;
  showExportMenu: boolean;
  showVersionHistory: boolean;
  templates: any[];
  selectedTemplate?: string;
  versions: any[];
  templatesLoading: boolean;
  exportLoading: boolean;
  onTemplateSelect: (templateId: string) => void;
  onExport: (format: any, options?: any) => void;
  onVersionSave: (description: string) => void;
  onCloseTemplatePicker: () => void;
  onCloseExportMenu: () => void;
  onCloseVersionHistory: () => void;
}

/**
 * Modal Manager Component
 */
export const ModalManager: React.FC<ModalManagerProps> = ({
  showTemplatePicker,
  showExportMenu,
  showVersionHistory,
  templates,
  selectedTemplate,
  versions,
  templatesLoading,
  exportLoading,
  onTemplateSelect,
  onExport,
  onVersionSave,
  onCloseTemplatePicker,
  onCloseExportMenu,
  onCloseVersionHistory
}) => {
  return (
    <>
      {showTemplatePicker && (
        <TemplatePicker
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelect={onTemplateSelect}
          onClose={onCloseTemplatePicker}
          loading={templatesLoading}
        />
      )}

      {showExportMenu && (
        <ExportMenu
          onExport={onExport}
          onClose={onCloseExportMenu}
          availableFormats={['pdf', 'docx', 'html', 'png']}
          loading={exportLoading}
        />
      )}

      {showVersionHistory && (
        <VersionHistory
          versions={versions}
          onVersionSave={onVersionSave}
          onClose={onCloseVersionHistory}
          loading={false}
        />
      )}
    </>
  );
};