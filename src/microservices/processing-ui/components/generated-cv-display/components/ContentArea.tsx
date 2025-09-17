/**
 * Content Area Component
 *
 * Renders the appropriate content based on current mode.
 */

import React from 'react';
import { FileText } from 'lucide-react';

import type { EditorMode } from '../types';
import { CVContentRenderer } from '../CVContentRenderer';
import { CVEditor } from '../CVEditor';
import { CVPreviewPanel } from '../CVPreviewPanel';

interface ContentAreaProps {
  mode: EditorMode;
  job: any;
  generatedCV: any;
  analysis?: any;
  template?: any;
  onContentUpdate: (content: any) => void;
}

/**
 * Content Area Component
 */
export const ContentArea: React.FC<ContentAreaProps> = ({
  mode,
  job,
  generatedCV,
  analysis,
  template,
  onContentUpdate
}) => {
  const hasContent = Boolean(generatedCV?.html || generatedCV?.content);

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
          onContentUpdate={onContentUpdate}
          className="min-h-[800px]"
        />
      );
    case 'preview':
      return (
        <CVPreviewPanel
          job={job}
          content={generatedCV}
          template={template}
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