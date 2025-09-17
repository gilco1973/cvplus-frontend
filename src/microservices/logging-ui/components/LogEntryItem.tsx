/**
 * Individual log entry item component
 * Displays a single log entry with expansion and selection capabilities
 */

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { LogViewerConfig } from './types';
import { LogLevel } from '../../backend/types/index';
import type { LogEntry } from '../../backend/models/LogEntry';

interface LogEntryItemProps {
  log: LogEntry;
  isSelected: boolean;
  isExpanded: boolean;
  config: LogViewerConfig;
  onSelect: () => void;
  onToggleExpansion: () => void;
  getLogLevelColor: (level: LogLevel) => string;
  formatTimestamp: (timestamp: Date | string) => string;
}

export const LogEntryItem: React.FC<LogEntryItemProps> = ({
  log,
  isSelected,
  isExpanded,
  config,
  onSelect,
  onToggleExpansion,
  getLogLevelColor,
  formatTimestamp
}) => {
  return (
    <div
      className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Log header */}
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLogLevelColor(log.level)}`}>
              {log.level.toUpperCase()}
            </span>

            <span className="text-xs text-gray-500">
              {formatTimestamp(log.timestamp)}
            </span>

            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              {log.service || 'unknown'}
            </span>

            {log.correlationId && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                {log.correlationId.substring(0, 8)}...
              </span>
            )}
          </div>

          {/* Log message */}
          <p className={`text-sm text-gray-900 ${config.compactMode ? 'truncate' : ''}`}>
            {log.message}
          </p>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {log.context && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Context</h4>
                  <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
                    {JSON.stringify(log.context, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Domain:</span> {log.domain}
                </div>
                <div>
                  <span className="font-medium">User ID:</span> {log.userId || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Log ID:</span> {log.id}
                </div>
                <div>
                  <span className="font-medium">Correlation ID:</span> {log.correlationId || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Expand button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpansion();
          }}
          className="ml-2 p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};