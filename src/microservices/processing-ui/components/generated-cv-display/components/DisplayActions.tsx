/**
 * Display Actions Component
 *
 * Action buttons for template, history, export, and settings.
 */

import React from 'react';
import {
  Palette,
  Download,
  History,
  Settings,
  Loader2
} from 'lucide-react';

interface DisplayActionsProps {
  onTemplatePickerOpen: () => void;
  onVersionHistoryOpen: () => void;
  onExportMenuOpen: () => void;
  onSettingsOpen: () => void;
  loading?: boolean;
  exporting?: boolean;
}

/**
 * Display Actions Component
 */
export const DisplayActions: React.FC<DisplayActionsProps> = ({
  onTemplatePickerOpen,
  onVersionHistoryOpen,
  onExportMenuOpen,
  onSettingsOpen,
  loading = false,
  exporting = false
}) => {
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={onTemplatePickerOpen}
        disabled={loading}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Change template"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline">Template</span>
      </button>

      <button
        onClick={onVersionHistoryOpen}
        disabled={loading}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Version history"
      >
        <History className="w-4 h-4" />
        <span className="hidden sm:inline">History</span>
      </button>

      <button
        onClick={onExportMenuOpen}
        disabled={loading || exporting}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export CV"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {exporting ? 'Exporting...' : 'Export'}
        </span>
      </button>

      <button
        onClick={onSettingsOpen}
        disabled={loading}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        title="Display settings"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};