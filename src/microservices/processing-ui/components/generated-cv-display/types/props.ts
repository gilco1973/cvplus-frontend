// @ts-ignore
/**
 * Component Props Types for Generated CV Display System
  */

import type { CVTemplate, CVContent } from './core';
import type { EditorMode } from './editor';
import type { ExportFormat, ExportOptions } from './export';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface TemplatePickerProps {
  templates: CVTemplate[];
  selectedTemplate?: string;
  onSelect: (templateId: string) => void;
  onClose: () => void;
  loading?: boolean;
  showPreview?: boolean;
}

export interface CVPreviewPanelProps {
  job: any;
  content: any;
  template?: CVTemplate;
  className?: string;
}