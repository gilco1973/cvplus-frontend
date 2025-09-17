/**
 * CV Display Header Component
 *
 * Header section with mode controls, template picker, export options,
 * and version history access.
 */

import React from 'react';
import {
  Eye,
  Edit3,
  Monitor,
  Palette,
  Download,
  History,
  Settings,
  Save,
  Loader2
} from 'lucide-react';

import type { Job } from '../../types/job';
import type { EditorMode } from './types';

interface CVDisplayHeaderProps {
  job: Job;
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onTemplatePickerOpen: () => void;
  onExportMenuOpen: () => void;
  onVersionHistoryOpen: () => void;
  onSettingsOpen: () => void;
  loading?: boolean;
  saving?: boolean;
  exporting?: boolean;
  lastSaved?: Date;
}

/**
 * CV Display Header Component
 */
export const CVDisplayHeader: React.FC<CVDisplayHeaderProps> = ({
  job,
  mode,
  onModeChange,
  onTemplatePickerOpen,
  onExportMenuOpen,
  onVersionHistoryOpen,
  onSettingsOpen,
  loading = false,
  saving = false,
  exporting = false,
  lastSaved
}) => {
  const modeButtons = [
    { mode: 'view' as EditorMode, icon: Eye, label: 'View', description: 'View generated CV' },
    { mode: 'edit' as EditorMode, icon: Edit3, label: 'Edit', description: 'Edit CV content' },
    { mode: 'preview' as EditorMode, icon: Monitor, label: 'Preview', description: 'Preview changes' }
  ];

  const formatJobTitle = (jobTitle?: string) => {
    if (!jobTitle) return 'Generated CV';
    return jobTitle.length > 30 ? `${jobTitle.slice(0, 30)}...` : jobTitle;
  };

  const formatLastSaved = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just saved';
    if (minutes < 60) return `Saved ${minutes}m ago`;
    if (minutes < 1440) return `Saved ${Math.floor(minutes / 60)}h ago`;
    return `Saved ${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="cv-display-header bg-gray-800/50 border border-gray-700/50 rounded-t-lg p-4">
      <div className="flex items-center justify-between">
        {/* Left side - CV info and status */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {formatJobTitle(job.parsedData?.personalInfo?.fullName)}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Status: {job.status}</span>
              {saving && (
                <div className="flex items-center space-x-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
              {lastSaved && !saving && (
                <span className="text-green-400">{formatLastSaved(lastSaved)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode selector */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {modeButtons.map(({ mode: buttonMode, icon: Icon, label, description }) => (
              <button
                key={buttonMode}
                onClick={() => onModeChange(buttonMode)}
                disabled={loading}
                className={`
                  flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${mode === buttonMode
                    ? 'bg-cyan-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600/50'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-600" />

          {/* Action buttons */}
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
        </div>
      </div>

      {/* Progress indicator for operations */}
      {(loading || saving || exporting) && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-cyan-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {loading && 'Loading CV content...'}
            {saving && 'Saving changes...'}
            {exporting && 'Preparing export...'}
          </p>
        </div>
      )}
    </div>
  );
};