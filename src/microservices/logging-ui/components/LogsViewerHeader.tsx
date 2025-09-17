/**
 * Header component for the logs viewer dashboard
 * Handles primary actions like refresh, streaming toggle, and export
 */

import React from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  Download,
  AlertCircle
} from 'lucide-react';
import { LogViewerConfig, LogsViewerState } from './types';

interface LogsViewerHeaderProps {
  state: LogsViewerState;
  config: LogViewerConfig;
  onRefresh: () => void;
  onStreamToggle: (streaming: boolean) => void;
  onExport: (format: 'json' | 'csv' | 'txt') => void;
  onError: (error: string | null) => void;
}

export const LogsViewerHeader: React.FC<LogsViewerHeaderProps> = ({
  state,
  config,
  onRefresh,
  onStreamToggle,
  onExport,
  onError
}) => {
  return (
    <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Log Viewer</h1>

          {/* Status indicators */}
          <div className="flex items-center gap-2">
            {state.streaming && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Live</span>
              </div>
            )}

            {state.loading && (
              <div className="flex items-center gap-1 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading</span>
              </div>
            )}

            <div className="text-sm text-gray-500">
              {state.totalCount.toLocaleString()} total logs
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStreamToggle(!state.streaming)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${
              state.streaming
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {state.streaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {state.streaming ? 'Stop Stream' : 'Start Stream'}
          </button>

          <button
            onClick={onRefresh}
            disabled={state.loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {config.enableExport && (
            <div className="relative">
              <button
                onClick={() => onExport('json')}
                disabled={state.exportInProgress}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-700">{state.error}</p>
          <button
            onClick={() => onError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};