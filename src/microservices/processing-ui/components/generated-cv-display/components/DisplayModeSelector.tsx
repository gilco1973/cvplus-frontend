/**
 * Display Mode Selector Component
 *
 * Handles mode switching between view, edit, and preview modes.
 */

import React from 'react';
import { Eye, Edit3, Monitor } from 'lucide-react';
import type { EditorMode } from '../types';

interface DisplayModeSelectorProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  loading?: boolean;
}

const modeButtons = [
  { mode: 'view' as EditorMode, icon: Eye, label: 'View', description: 'View generated CV' },
  { mode: 'edit' as EditorMode, icon: Edit3, label: 'Edit', description: 'Edit CV content' },
  { mode: 'preview' as EditorMode, icon: Monitor, label: 'Preview', description: 'Preview changes' }
];

/**
 * Display Mode Selector Component
 */
export const DisplayModeSelector: React.FC<DisplayModeSelectorProps> = ({
  mode,
  onModeChange,
  loading = false
}) => {
  return (
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
  );
};