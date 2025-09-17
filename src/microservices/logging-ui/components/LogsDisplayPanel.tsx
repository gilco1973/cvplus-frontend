/**
 * Log display panel component
 * Handles the virtualized display of log entries with selection and expansion
 */

import React from 'react';
import { Database } from 'lucide-react';
import { LogEntryItem } from './LogEntryItem';
import { LogViewerConfig } from './types';
import { LogLevel } from '../../backend/types/index';
import type { LogEntry } from '../../backend/models/LogEntry';

interface LogsDisplayPanelProps {
  logs: LogEntry[];
  selectedLogIds: Set<string>;
  expandedLogIds: Set<string>;
  config: LogViewerConfig;
  onLogSelect?: (log: LogEntry) => void;
  onSelectionChange: (selectedLogIds: Set<string>) => void;
  onExpansionChange: (expandedLogIds: Set<string>) => void;
}

export const LogsDisplayPanel: React.FC<LogsDisplayPanelProps> = ({
  logs,
  selectedLogIds,
  expandedLogIds,
  config,
  onLogSelect,
  onSelectionChange,
  onExpansionChange
}) => {
  const toggleLogSelection = (logId: string) => {
    const newSelection = new Set(selectedLogIds);
    if (newSelection.has(logId)) {
      newSelection.delete(logId);
    } else {
      newSelection.add(logId);
    }
    onSelectionChange(newSelection);
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpansion = new Set(expandedLogIds);
    if (newExpansion.has(logId)) {
      newExpansion.delete(logId);
    } else {
      newExpansion.add(logId);
    }
    onExpansionChange(newExpansion);

    const log = logs.find(l => l.id === logId);
    if (log && onLogSelect) {
      onLogSelect(log);
    }
  };

  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.FATAL: return 'text-red-500 bg-red-50 border-red-200';
      case LogLevel.ERROR: return 'text-red-600 bg-red-50 border-red-200';
      case LogLevel.WARN: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case LogLevel.INFO: return 'text-blue-600 bg-blue-50 border-blue-200';
      case LogLevel.DEBUG: return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (logs.length === 0) {
    return (
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No logs found</p>
            <p className="text-sm">Try adjusting your filters or time range</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="space-y-1 p-4">
          {logs.map((log) => (
            <LogEntryItem
              key={log.id}
              log={log}
              isSelected={selectedLogIds.has(log.id)}
              isExpanded={expandedLogIds.has(log.id)}
              config={config}
              onSelect={() => toggleLogSelection(log.id)}
              onToggleExpansion={() => toggleLogExpansion(log.id)}
              getLogLevelColor={getLogLevelColor}
              formatTimestamp={formatTimestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

